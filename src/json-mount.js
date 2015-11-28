// TODO: replace containersByReactRootID with streams and instancesByReactRootID with components
// TODO: remove TOpLevelWrapper

const ReactInstanceHandles = require('react/lib/ReactInstanceHandles');
const has = require('lodash.has');
const isEqual = require('lodash.isequal');
const keys = require('lodash.keys');
const map = require('lodash.map');
const defaults = require('lodash.defaults');
const filter = require('lodash.filter');
const pullAt = require('lodash.pullat');
const pluck = require('lodash.pluck');
const isArray = require('lodash.isarray');
const isFunction = require('lodash.isfunction');
const pairs = require('lodash.pairs');
const buildArray = require('build-array');
const TreeStream = require('./tree-stream');


const INTERVAL = 8;
const nodeCache = {};
const dirty = {};
const intervals = {};
const streams = {};

const isValid = function(node, id) {
  if (!node) {
    return false;
  }

  if (ReactMount.findReactContainerForID(id)) {
    return true;
  }

  return false;
};

const getChildrenIds = function(id) {
  return pluck(filter(map(keys(nodeCache), function(id) {
    return getNode(id);
  }), function(node) {
    return node.parent === id;
  }), 'id');
};

const getNode = function(id) {
  if (!has(nodeCache, id) || !isValid(nodeCache[id], id)) {
    nodeCache[id] = ReactMount.findReactNodeByID(id);
  }

  return nodeCache[id];
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

const purgeID = function(id) {
  delete nodeCache[id];
};

const buildTree = function(id) {
  var node = getNode(id);
  var children = getChildrenIds(id);

  return defaults({
    children: map(children, buildTree)
  }, node);
};

const tick = function(id) {
  intervals[id] = undefined;

  const isDirty = function() {
    dirty[id] = false;
    streams[id].writeTree(buildTree(id));
  };

  if (dirty[id]) {
    isDirty();
  }

  startLoop(id);
};

const startLoop = function(id) {
  if (intervals[id]) {
    return;
  }

  intervals[id] = setTimeout(function() {
    tick(id);
  }, INTERVAL);
};

const getNodeInContainer = function(stream) {
  return map(filter(pairs(streams), function(kv) {
    return kv[1] === stream;
  }), function(kv) {
    return getNode(kv[0]);
  });
};

const getReactRootID = function(stream) {
  return map(getNodeInContainer(container), function(node) {
    return ReactMount.getID(node);
  });
};





var DOMProperty = require('react/lib/DOMProperty');
var ReactBrowserEventEmitter = require('react/lib/ReactBrowserEventEmitter');
var ReactCurrentOwner = require('react/lib/ReactCurrentOwner');
var ReactDOMFeatureFlags = require('react/lib/ReactDOMFeatureFlags');
var ReactElement = require('react/lib/ReactElement');
var ReactEmptyComponentRegistry = require('react/lib/ReactEmptyComponentRegistry');
var ReactInstanceMap = require('react/lib/ReactInstanceMap');
var ReactMarkupChecksum = require('react/lib/ReactMarkupChecksum');
var ReactPerf = require('react/lib/ReactPerf');
var ReactReconciler = require('react/lib/ReactReconciler');
var ReactUpdateQueue = require('react/lib/ReactUpdateQueue');
var ReactUpdates = require('react/lib/ReactUpdates');

var assign = require('react/lib/Object.assign');
var emptyObject = require('fbjs/lib/emptyObject');
var containsNode = require('fbjs/lib/containsNode');
var instantiateReactComponent = require('react/lib/instantiateReactComponent');
var invariant = require('fbjs/lib/invariant');
var setInnerHTML = require('react/lib/setInnerHTML');
var shouldUpdateReactComponent = require('react/lib/shouldUpdateReactComponent');
var validateDOMNesting = require('react/lib/validateDOMNesting');
var warning = require('fbjs/lib/warning');

var ATTR_NAME = DOMProperty.ID_ATTRIBUTE_NAME;


var ELEMENT_NODE_TYPE = 1;
var DOC_NODE_TYPE = 9;
var DOCUMENT_FRAGMENT_NODE_TYPE = 11;

var ownerDocumentContextKey = '__ReactMount_ownerDocument$' + Math.random().toString(36).slice(2);

/** Mapping from reactRootID to React component instance. */
var instancesByReactRootID = {};

/** Mapping from reactRootID to `container` nodes. */
var containersByReactRootID = {};

if (process.env.NODE_ENV !== 'production') {
  /** __DEV__-only mapping from reactRootID to root elements. */
  var rootElementsByReactRootID = {};
}

// Used to store breadth-first search state in findComponentRoot.
var findComponentRootReusableArray = [];

/**
 * Finds the index of the first character
 * that's not common between the two given strings.
 *
 * @return {number} the index of the character where the strings diverge
 */
function firstDifferenceIndex(string1, string2) {
  var minLen = Math.min(string1.length, string2.length);
  for (var i = 0; i < minLen; i++) {
    if (string1.charAt(i) !== string2.charAt(i)) {
      return i;
    }
  }
  return string1.length === string2.length ? -1 : minLen;
}

/**
 * @param {DOMElement|DOMDocument} container DOM element that may contain
 * a React component
 * @return {?*} DOM element that may have the reactRoot ID, or null.
 */

/**
 * @param {DOMElement} container DOM element that may contain a React component.
 * @return {?string} A "reactRoot" ID, if a React component is rendered.
 */


/**
 * Accessing node[ATTR_NAME] or calling getAttribute(ATTR_NAME) on a form
 * element can return its control whose name or ID equals ATTR_NAME. All
 * DOM nodes support `getAttributeNode` but this can also get called on
 * other objects so just return '' if we're given something other than a
 * DOM node (such as window).
 *
 * @param {?DOMElement|DOMWindow|DOMDocument|DOMTextNode} node DOM node.
 * @return {string} ID of the supplied `domNode`.
 */
function getID(node) {
  var id = internalGetID(node);
  if (id) {
    if (nodeCache.hasOwnProperty(id)) {
      var cached = nodeCache[id];
      if (cached !== node) {
        !!isValid(cached, id) ? process.env.NODE_ENV !== 'production' ? invariant(false, 'ReactMount: Two valid but unequal nodes with the same `%s`: %s', ATTR_NAME, id) : invariant(false) : undefined;

        nodeCache[id] = node;
      }
    } else {
      nodeCache[id] = node;
    }
  }

  return id;
}

function internalGetID(node) {
  // If node is something like a window, document, or text node, none of
  // which support attributes or a .getAttribute method, gracefully return
  // the empty string, as if the attribute were missing.
  return node && node.getAttribute && node.getAttribute(ATTR_NAME) || '';
}

var deepestNodeSoFar = null;
function findDeepestCachedAncestorImpl(ancestorID) {
  var ancestor = nodeCache[ancestorID];
  if (ancestor && isValid(ancestor, ancestorID)) {
    deepestNodeSoFar = ancestor;
  } else {
    // This node isn't populated in the cache, so presumably none of its
    // descendants are. Break out of the loop.
    return false;
  }
}

/**
 * Return the deepest cached node whose ID is a prefix of `targetID`.
 */
function findDeepestCachedAncestor(targetID) {
  deepestNodeSoFar = null;
  ReactInstanceHandles.traverseAncestors(targetID, findDeepestCachedAncestorImpl);

  var foundNode = deepestNodeSoFar;
  deepestNodeSoFar = null;
  return foundNode;
}

// changed
function mountComponentIntoNode(component, rootID, emitter, transaction, context) {
  var markup = ReactReconciler.mountComponent(component, rootID, transaction, context);
  component._renderedComponent._topLevelWrapper = component;
  ReactMount._mountImageIntoNode(markup, emitter, transaction);
}

// changed
function batchedMountComponentIntoNode(component, rootID, emitter, context) {
  var transaction = ReactUpdates.ReactReconcileTransaction.getPooled();
  transaction.perform(mountComponentIntoNode, null, component, rootID, emitter, transaction, context);
  ReactUpdates.ReactReconcileTransaction.release(transaction);
}

/**
 * Unmounts a component and removes it from the DOM.
 *
 * @param {ReactComponent} instance React component instance.
 * @param {DOMElement} container DOM element to unmount from.
 * @final
 * @internal
 * @see {ReactMount.unmountComponentAtNode}
 */
function unmountComponentFromNode(instance, container) {
  ReactReconciler.unmountComponent(instance);

  if (container.nodeType === DOC_NODE_TYPE) {
    container = container.documentElement;
  }

  // http://jsperf.com/emptying-a-node
  while (container.lastChild) {
    container.removeChild(container.lastChild);
  }
}

/**
 * True if the supplied DOM node has a direct React-rendered child that is
 * not a React root element. Useful for warning in `render`,
 * `unmountComponentAtNode`, etc.
 *
 * @param {?DOMElement} node The candidate DOM node.
 * @return {boolean} True if the DOM element contains a direct child that was
 * rendered by React but is not a root element.
 * @internal
 */
function hasNonRootReactChild(node) {
  var reactRootID = getReactRootID(node);
  return reactRootID ? reactRootID !== ReactInstanceHandles.getReactRootIDFromNodeID(reactRootID) : false;
}

/**
 * Returns the first (deepest) ancestor of a node which is rendered by this copy
 * of React.
 */
function findFirstReactDOMImpl(node) {
  // This node might be from another React instance, so we make sure not to
  // examine the node cache here
  for (; node && node.parentNode !== node; node = node.parentNode) {
    if (node.nodeType !== 1) {
      // Not a DOMElement, therefore not a React component
      continue;
    }
    var nodeID = internalGetID(node);
    if (!nodeID) {
      continue;
    }
    var reactRootID = ReactInstanceHandles.getReactRootIDFromNodeID(nodeID);

    // If containersByReactRootID contains the container we find by crawling up
    // the tree, we know that this instance of React rendered the node.
    // nb. isValid's strategy (with containsNode) does not work because render
    // trees may be nested and we don't want a false positive in that case.
    var current = node;
    var lastID;
    do {
      lastID = internalGetID(current);
      current = current.parentNode;
      if (current == null) {
        // The passed-in node has been detached from the container it was
        // originally rendered into.
        return null;
      }
    } while (lastID !== reactRootID);

    if (current === containersByReactRootID[reactRootID]) {
      return node;
    }
  }
  return null;
}

/**
 * Temporary (?) hack so that we can store all top-level pending updates on
 * composites instead of having to worry about different types of components
 * here.
 */
var TopLevelWrapper = function() {};
TopLevelWrapper.prototype.isReactComponent = {};
if (process.env.NODE_ENV !== 'production') {
  TopLevelWrapper.displayName = 'TopLevelWrapper';
}
TopLevelWrapper.prototype.render = function() {
  // this.props is actually a ReactElement
  return this.props;
};

/**
 * Mounting is the process of initializing a React component by creating its
 * representative DOM elements and inserting them into a supplied `container`.
 * Any prior content inside `container` is destroyed in the process.
 *
 *   ReactMount.render(
 *     component,
 *     document.getElementById('container')
 *   );
 *
 *   <div id="container">                   <-- Supplied `container`.
 *     <div data-reactid=".3">              <-- Rendered reactRoot of React
 *       // ...                                 component.
 *     </div>
 *   </div>
 *
 * Inside of `container`, the first element rendered is the "reactRoot".
 */
var ReactMount = {

  TopLevelWrapper: TopLevelWrapper,

  /** Exposed for debugging purposes **/
  _instancesByReactRootID: instancesByReactRootID,

  /**
   * This is a hook provided to support rendering React components while
   * ensuring that the apparent scroll position of its `container` does not
   * change.
   *
   * @param {DOMElement} container The `container` being rendered into.
   * @param {function} renderCallback This must be called once to do the render.
   */
  scrollMonitor: function(container, renderCallback) {
    renderCallback();
  },

  /**
   * Take a component that's already mounted into the DOM and replace its props
   * @param {ReactComponent} prevComponent component instance already in the DOM
   * @param {ReactElement} nextElement component instance to render
   * @param {DOMElement} container container to render into
   * @param {?function} callback function triggered on completion
   */
  _updateRootComponent: function(prevComponent, nextElement, container, callback) {
    ReactMount.scrollMonitor(container, function() {
      ReactUpdateQueue.enqueueElementInternal(prevComponent, nextElement);
      if (callback) {
        ReactUpdateQueue.enqueueCallbackInternal(prevComponent, callback);
      }
    });

    return prevComponent;
  },

  // changed
  _registerComponent: function(component, emitter) {
    var rootID = ReactMount.registerContainer(emitter);
    instancesByReactRootID[rootID] = component;
    return rootID;
  },

  // changed
  _renderNewRootComponent: function(element, emitter, context) {
    var component = instantiateReactComponent(element, null);
    var rootID = ReactMount._registerComponent(component, emitter);
    ReactUpdates.batchedUpdates(batchedMountComponentIntoNode, component, rootID, emitter, context);
    return component;
  },

  // changed
  renderSubtreeIntoContainer: function(parent, element, emitter, callback) {
    return ReactMount._renderSubtreeIntoContainer(parent, element, emitter, callback);
  },

  // changed
  _renderSubtreeIntoContainer: function(parent, element, emitter, callback) {
    var wrappedElement = new ReactElement(TopLevelWrapper, null, null, null, null, null, element);
    var root = ReactMount._renderNewRootComponent(wrappedElement, emitter, false, parent);
    var component = root._renderedComponent.getPublicInstance();

    if (isFunction(callback)) {
      callback(component);
    }

    return component;
  },

  // changed
  render: function(element, callback) {
    var stream = new TreeStream();
    var component = ReactMount.renderSubtreeIntoContainer(null, element, stream, callback);
    return stream;
  },

  // changed
  registerContainer: function(emitter) {
    var rootId = getReactRootID(emitter);

    if (rootId) {
      // If one exists, make sure it is a valid "reactRoot" ID.
      rootId = ReactInstanceHandles.getReactRootIDFromNodeID(rootId);
    }

    if (!rootId) {
      // No valid "reactRoot" ID found, create one.
      rootId = ReactInstanceHandles.createReactRootID();
    }

    containersByReactRootID[rootId] = emitter;
    streams[rootId] = emitter;

    return rootId;
  },

  /**
   * Unmounts and destroys the React component rendered in the `container`.
   *
   * @param {DOMElement} container DOM element containing a React component.
   * @return {boolean} True if a component was found in and unmounted from
   *                   `container`
   */
  unmountComponentAtNode: function(container) {
    var reactRootID = getReactRootID(container);
    var component = instancesByReactRootID[reactRootID];

    if (!component) {
      // Check if the node being unmounted was rendered by React, but isn't a
      // root node.
      var containerHasNonRootReactChild = hasNonRootReactChild(container);

      // Check if the container itself is a React root node.
      var containerID = internalGetID(container);
      var isContainerReactRoot = containerID && containerID === ReactInstanceHandles.getReactRootIDFromNodeID(containerID);

      if (process.env.NODE_ENV !== 'production') {
        process.env.NODE_ENV !== 'production' ? warning(!containerHasNonRootReactChild, 'unmountComponentAtNode(): The node you\'re attempting to unmount ' + 'was rendered by React and is not a top-level container. %s', isContainerReactRoot ? 'You may have accidentally passed in a React root node instead ' + 'of its container.' : 'Instead, have the parent component update its state and ' + 'rerender in order to remove this component.') : undefined;
      }

      return false;
    }
    ReactUpdates.batchedUpdates(unmountComponentFromNode, component, container);
    delete instancesByReactRootID[reactRootID];
    delete containersByReactRootID[reactRootID];
    if (process.env.NODE_ENV !== 'production') {
      delete rootElementsByReactRootID[reactRootID];
    }
    return true;
  },

  // changed used
  findReactContainerForID: function(id) {
    var reactRootID = ReactInstanceHandles.getReactRootIDFromNodeID(id);
    var container = containersByReactRootID[reactRootID];
    return container;
  },

  /**
   * Finds an element rendered by React with the supplied ID.
   *
   * @param {string} id ID of a DOM node in the React component.
   * @return {DOMElement} Root DOM node of the React component.
   */
  findReactNodeByID: function(id) {
    var reactRoot = ReactMount.findReactContainerForID(id);
    return ReactMount.findComponentRoot(reactRoot, id);
  },

  /**
   * Traverses up the ancestors of the supplied node to find a node that is a
   * DOM representation of a React component rendered by this copy of React.
   *
   * @param {*} node
   * @return {?DOMEventTarget}
   * @internal
   */
  getFirstReactDOM: function(node) {
    return findFirstReactDOMImpl(node);
  },

  /**
   * Finds a node with the supplied `targetID` inside of the supplied
   * `ancestorNode`.  Exploits the ID naming scheme to perform the search
   * quickly.
   *
   * @param {DOMEventTarget} ancestorNode Search from this root.
   * @pararm {string} targetID ID of the DOM representation of the component.
   * @return {DOMEventTarget} DOM node with the supplied `targetID`.
   * @internal
   */
  findComponentRoot: function(ancestorNode, targetID) {
    var firstChildren = findComponentRootReusableArray;
    var childIndex = 0;

    var deepestAncestor = findDeepestCachedAncestor(targetID) || ancestorNode;

    firstChildren[0] = deepestAncestor.firstChild;
    firstChildren.length = 1;

    while (childIndex < firstChildren.length) {
      var child = firstChildren[childIndex++];
      var targetChild;

      while (child) {
        var childID = ReactMount.getID(child);
        if (childID) {
          // Even if we find the node we're looking for, we finish looping
          // through its siblings to ensure they're cached so that we don't have
          // to revisit this node again. Otherwise, we make n^2 calls to getID
          // when visiting the many children of a single node in order.

          if (targetID === childID) {
            targetChild = child;
          } else if (ReactInstanceHandles.isAncestorIDOf(childID, targetID)) {
            // If we find a child whose ID is an ancestor of the given ID,
            // then we can be sure that we only want to search the subtree
            // rooted at this child, so we can throw out the rest of the
            // search state.
            firstChildren.length = childIndex = 0;
            firstChildren.push(child.firstChild);
          }
        } else {
          // If this child had no ID, then there's a chance that it was
          // injected automatically by the browser, as when a `<table>`
          // element sprouts an extra `<tbody>` child as a side effect of
          // `.innerHTML` parsing. Optimistically continue down this
          // branch, but not before examining the other siblings.
          firstChildren.push(child.firstChild);
        }

        child = child.nextSibling;
      }

      if (targetChild) {
        // Emptying firstChildren/findComponentRootReusableArray is
        // not necessary for correctness, but it helps the GC reclaim
        // any nodes that were left at the end of the search.
        firstChildren.length = 0;

        return targetChild;
      }
    }

    firstChildren.length = 0;

    !false ? process.env.NODE_ENV !== 'production' ? invariant(false, 'findComponentRoot(..., %s): Unable to find element. This probably ' + 'means the DOM was unexpectedly mutated (e.g., by the browser), ' + 'usually due to forgetting a <tbody> when using tables, nesting tags ' + 'like <form>, <p>, or <a>, or using non-SVG elements in an <svg> ' + 'parent. ' + 'Try inspecting the child nodes of the element with React ID `%s`.', targetID, ReactMount.getID(ancestorNode)) : invariant(false) : undefined;
  },

  // changed
  _mountImageIntoNode: function(node, emitter, transaction) {
    dirty[node.id] = true;
    startLoop(node.id);
  },

  ownerDocumentContextKey: ownerDocumentContextKey,
  getReactRootID: getReactRootID,
  getID: getID,
  getNode: getNode, // used
  setNode: setNode, // used
  isValid: isValid, // used
  purgeID: purgeID // used
};

module.exports = ReactMount;