'use strict';

const ReactMultiChild = require('react/lib/ReactMultiChild');
const JSONMount = require('./json-mount');
const includes = require('lodash.includes');
const filter = require('lodash.filter');
const zip = require('lodash.zipobject');
const pairs = require('lodash.pairs');
const isArray = require('lodash.isarray');
const assign = require('lodash.assign');
const rest = require('lodash.rest');
const isUndefined = require('lodash.isundefined');
const defaults = require('lodash.defaults');
const isNull = require('lodash.isnull');
const format = require('util').format;


const CONTENT_TYPES = [
  'string',
  'number'
];

const exists = function(v) {
  return !isNull(v) && !isUndefined(v);
};

class Component {
  constructor(tag) {
    this._tag = tag.toLowerCase();
    this._rootNodeID = null;
    this._renderedChildren = null;
  }

  construct(element) {
    this._currentElement = element;
  }

  mountComponent(rootID, transaction, context) {
    this._rootNodeID = rootID;

    if (isArray(this._currentElement.props.children)) {
      this._mountChildren(transaction, context);
    }

    return this._mountNode();
  }

  _mountChildren(transaction, context) {
    this.mountChildren(
      this._currentElement.props.children,
      transaction,
      context
    );
  }

  _content() {
    var children = this._currentElement.props.children;

    if (isArray(children)) {
      return null;
    }

    if (!CONTENT_TYPES[typeof children]) {
      return null;
    }

    return children;
  }

  _props() {
    return defaults({
      key: this._currentElement.key
    }, zip(filter(pairs(this._currentElement.props), function(kv) {
      return kv[0] !== 'children';
    })));
  }

  _mountNode() {
    var path = this._rootNodeID.split(/\./).filter(Boolean);
    var parent = rest(path.reverse()).reverse();

    const node = {
      parent: parent.length ? format('.%s', parent.join('.')) : '',
      name: this._currentElement.type,
      id: this._rootNodeID,
      props: this._props(),
      content: this._content()
    };

    return JSONMount.setNode(this._rootNodeID, node);
  }

  _updateComponent(transaction, prev, next, context) {
    const getContent = function(children) {
      return includes(CONTENT_TYPES, children) ? children : null;
    };

    const getHTML = function(dangerouslySetInnerHTML) {
      return dangerouslySetInnerHTML && dangerouslySetInnerHTML.__html;
    };

    const getChildren = function(content, children) {
      return exists(content) ? null : children;
    };

    const hasContentOrHtml = function(content, html) {
      return exists(content) || exists(html);
    };

    const shouldRemove = function(what) {
      return exists(what.prev) && !exists(what.next);
    };

    const shouldUpdate = function(what) {
      return exists(what.next) && (what.prev !== what.next);
    };

    const content = {
      prev: getContent(prev.props.children),
      next: getContent(next.props.children)
    };

    const html = {
      prev: getHTML(prev.props.dangerouslySetInnerHTML),
      next: getHTML(next.props.dangerouslySetInnerHTML)
    };

    const children = {
      prev: getChildren(content.prev, prev.props.children),
      next: getChildren(content.next, next.props.children)
    };

    const contentOrHtml = {
      prev: hasContentOrHtml(content.prev, html.prev),
      next: hasContentOrHtml(content.next, html.next)
    };

    const remove = {
      children: shouldRemove(children),
      content: shouldRemove(contentOrHtml)
    };

    const update = {
      content: shouldUpdate(content),
      html: shouldUpdate(html),
      children: exists(children.next)
    };

    if (remove.children) {
      this.updateChildren(null, transaction, context);
    } else if (remove.content) {
      this.updateTextContent('');
    }

    if (update.content) {
      this.updateTextContent(String(content.next));
    } else if (update.html) {
      this.updateMarkup(String(html.next));
    } else if (update.children) {
      this.updateChildren(children.next, transaction, context);
    }

    return this._mountNode();
  }

  receiveComponent(element, transaction, context) {
    const prev = this._currentElement;
    this._currentElement = element;
    return this._updateComponent(transaction, prev, element, context);
  }

  unmountComponent() {
    JSONMount.purgeId(this._rootNodeID);
    this.unmountChildren();
    this._rootNodeID = null;
  }

  getPublicInstance() {}
}

assign(
  Component.prototype,
  ReactMultiChild.Mixin
);

module.exports = Component;
