const DOMChildrenOperations = require('react/lib/DOMChildrenOperations');
const escapeTextContentForBrowser = require('react/lib/escapeTextContentForBrowser');
const assign = require('lodash.assign');
const JSONComponentEnvironment = require('./json-component-environment');
const JSONMount = require('./json-mount');


const JSONTextComponent = function(props) {
  // This constructor and its argument is currently used by mocks.
};

const Mixin = {
  construct: function(text) {
    // TODO: This is really a ReactText (ReactNode), not a ReactElement
    this._currentElement = text;
    this._stringText = String(text);

    // Properties
    this._rootNodeID = null;
    this._mountIndex = 0;
  },
  mountComponent: function(rootID, transaction, context) {
    return escapeTextContentForBrowser(this._stringText);
  },
  receiveComponent: function(nextText, transaction) {
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