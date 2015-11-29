const ReactUpdates = require('react/lib/ReactUpdates');
const ReactReconciler = require('react/lib/ReactReconciler');
const instantiateReactComponent = require('react/lib/instantiateReactComponent');
const ReactInstanceHandles = require('react/lib/ReactInstanceHandles');
const isEqual = require('lodash.isequal');
const keys = require('lodash.keys');
const map = require('lodash.map');
const defaults = require('lodash.defaults');
const filter = require('lodash.filter');
const pluck = require('lodash.pluck');
const pairs = require('lodash.pairs');
const first = require('lodash.first');
const TreeStream = require('./tree-stream');


const INTERVAL = 8;
const nodeCache = {};
const dirty = {};
const intervals = {};
const streams = {};
const components = {};

const getId = function(node) {
  return node.id;
};

const getNode = function(id) {
  return nodeCache[id];
};

const getChildrenIds = function(id) {
  return pluck(filter(map(keys(nodeCache), function(id) {
    return getNode(id);
  }), function(node) {
    return node.parent === id;
  }), 'id');
};

const setNode = function(id, node) {
  if (isEqual(nodeCache[id], node)) {
    return node;
  }

  ReactInstanceHandles.traverseAncestors(id, function(id) {
    dirty[id] = true;
    return false;
  });

  nodeCache[id] = node;
  return node;
};

const purgeId = function(id) {
  map(getChildrenIds(id), purgeId);
  delete nodeCache[id];
  delete components[id];
  delete streams[id];
};

const buildTree = function(id) {
  var node = getNode(id);
  var children = getChildrenIds(id);

  return defaults({
    children: map(children, buildTree)
  }, node);
};

const startLoop = function(id) {
  if (intervals[id]) {
    return;
  }

  if (!keys(streams).length) {
    delete dirty[id];
    return;
  }

  intervals[id] = setTimeout(function() {
    tick(id);
  }, INTERVAL);
};

const tick = function(id) {
  delete intervals[id];

  const isDirty = function() {
    dirty[id] = false;
    streams[id].writeTree(buildTree(id));
  };

  if (dirty[id]) {
    isDirty();
  }

  startLoop(id);
};

const getNodeInContainer = function(stream) {
  return map(filter(pairs(streams), function(kv) {
    return kv[1] === stream;
  }), function(kv) {
    return getNode(kv[0]);
  });
};

const getRootIds = function(stream) {
  return map(getNodeInContainer(stream), function(node) {
    return getId(node);
  });
};

const register = function(stream, component) {
  var rootId = first(getRootIds(stream));

  if (rootId) {
    rootId = ReactInstanceHandles.getReactRootIDFromNodeID(rootId);
  }

  if (!rootId) {
    rootId = ReactInstanceHandles.createReactRootID();
  }

  streams[rootId] = stream;
  components[rootId] = component;

  return rootId;
};

const mountComponent = function(component, rootId, stream, context) {
  var transaction = ReactUpdates.ReactReconcileTransaction.getPooled();

  transaction.perform(function() {
    var node = ReactReconciler.mountComponent(component, rootId, transaction, context);

    dirty[node.id] = true;
    startLoop(node.id);
  });

  ReactUpdates.ReactReconcileTransaction.release(transaction);
};

const unmountComponent = function(rootId, component) {
  ReactReconciler.unmountComponent(component);
  purgeId(rootId);
};

var ReactMount = {
  render: function(element) {
    var stream = new TreeStream();

    var component = instantiateReactComponent(element);
    var rootId = register(stream, component);

    ReactUpdates.batchedUpdates(mountComponent, component, rootId, stream, false);

    return stream;
  },
  unmountComponentAtNode: function(stream) {
    var rootId = first(getRootIds(stream));
    var component = components[rootId];

    if (!component) {
      return false;
    }

    ReactUpdates.batchedUpdates(unmountComponent, rootId, component, stream);

    stream.writeTree(null);

    return true;
  },
  getID: getId,
  getNode: getNode,
  setNode: setNode,
  purgeId: purgeId
};

module.exports = ReactMount;