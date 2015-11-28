'use strict';

const ReactMultiChild = require('react/lib/ReactMultiChild');
const JSONMount = require('./json-mount');
const map = require('lodash.map');
const includes = require('lodash.includes');
const filter = require('lodash.filter');
const zip = require('lodash.zipobject');
const pairs = require('lodash.pairs');
const isArray = require('lodash.isarray');
const assign = require('lodash.assign');
const rest = require('lodash.rest');
const format = require('util').format;


const CONTENT_TYPES = [
  'string',
  'number'
];

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
      this.mountChildren(
        this._currentElement.props.children,
        transaction,
        context
      );
    }

    const node = this._mountNode(
      this._currentElement,
      rootID
    );

    return node;
  }

  _content(element) {
    if (isArray(element.props.children)) {
      return;
    }

    return element.props.children;
  }

  _props(element) {
    return zip(filter(pairs(element.props), function(kv) {
      return kv[0] !== 'children';
    }));
  }

  _mountNode(element, rootId) {
    var path = rootId.split(/\./).filter(Boolean);
    var parent = rest(path.reverse()).reverse();

    const node = {
      parent: parent.length ? format('.%s', parent.join('.')) : undefined,
      name: element.type,
      id: rootId,
      props: this._props(element),
      content: this._content(element)
    };

    return JSONMount.setNode(rootId, node);
  }

  _updateComponent(transaction, prev, next, context) {
    const getContent = function(children) {
      return includes(CONTENT_TYPES, children) ? children : null;
    };

    const getHTML = function(dangerouslySetInnerHTML) {
      return dangerouslySetInnerHTML && dangerouslySetInnerHTML.__html;
    };

    const getChildren = function(content, children) {
      return content != null ? null : children;
    };

    const hasContentOrHtml = function(content, html) {
      return content != null || html != null;
    };

    const shouldRemove = function(what) {
      return what.prev != null && what.next == null;
    };

    const shouldUpdate = function(what) {
      return what.next != null && (what.prev !== what.next);
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
      children: children.next != null
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

    this._mountNode(
      this._currentElement,
      this._rootNodeID
    );
  }

  receiveComponent(element, transaction, context) {
    const prev = this._currentElement;
    this._currentElement = element;
    this._updateComponent(transaction, prev, element, context);
  }

  unmountComponent() {
    JSONMount.purgeID(this._rootNodeID);
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
