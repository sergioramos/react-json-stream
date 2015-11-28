const ReactInjection = require('react/lib/ReactInjection');
const JSONEventListener = require('./json-event-listener');
const DefaultEventPluginOrder = require('./default-event-plugin-order');
const ReactInstanceHandles = require('react/lib/ReactInstanceHandles');
const JSONMount = require('./json-mount');
const JSONComponent = require('./json-component');
const JSONTextComponent = require('./json-text-component');
const JSONComponentMixin = require('./json-component-mixin');
const HTMLDOMPropertyConfig = require('react/lib/HTMLDOMPropertyConfig');
const SVGDOMPropertyConfig = require('react/lib/SVGDOMPropertyConfig');
const JSONReconcileTransaction = require('./json-reconcile-transaction');
const ReactDefaultBatchingStrategy = require('react/lib//ReactDefaultBatchingStrategy');
const ClientReactRootIndex = require('react/lib/ClientReactRootIndex');
const JSONComponentEnvironment = require('./json-component-environment');


module.exports = function() {
  ReactInjection.EventEmitter.injectReactEventListener(JSONEventListener);

  ReactInjection.EventPluginHub.injectEventPluginOrder(DefaultEventPluginOrder);
  ReactInjection.EventPluginHub.injectInstanceHandle(ReactInstanceHandles);
  ReactInjection.EventPluginHub.injectMount(JSONMount);

  ReactInjection.NativeComponent.injectGenericComponentClass(JSONComponent);
  ReactInjection.NativeComponent.injectTextComponentClass(JSONTextComponent);

  ReactInjection.Class.injectMixin(JSONComponentMixin);

  ReactInjection.DOMProperty.injectDOMPropertyConfig(HTMLDOMPropertyConfig);
  ReactInjection.DOMProperty.injectDOMPropertyConfig(SVGDOMPropertyConfig);

  ReactInjection.EmptyComponent.injectEmptyComponent('noscript');

  ReactInjection.Updates.injectReconcileTransaction(JSONReconcileTransaction);
  ReactInjection.Updates.injectBatchingStrategy(ReactDefaultBatchingStrategy);

  ReactInjection.RootIndex.injectCreateReactRootIndex(ClientReactRootIndex.createReactRootIndex);

  ReactInjection.Component.injectEnvironment(JSONComponentEnvironment);
};
