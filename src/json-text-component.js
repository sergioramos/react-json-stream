const escapeTextContentForBrowser = require('react/lib/escapeTextContentForBrowser');
const assign = require('lodash.assign');
const JSONComponentEnvironment = require('./json-component-environment');


const JSONTextComponent = function() {};

const Mixin = {
  construct: function(text) {
    this._currentElement = text;
    this._stringText = String(text);

    this._rootNodeID = null;
    this._mountIndex = 0;
  },
  mountComponent: function() {
    return escapeTextContentForBrowser(this._stringText);
  },
  receiveComponent: function(nextText) {
    this._currentElement = nextText;
  },
  unmountComponent: function() {
    JSONComponentEnvironment.unmountIDFromEnvironment(this._rootNodeID);
  }
};

assign(
  JSONTextComponent.prototype,
  Mixin
);

module.exports = JSONTextComponent;