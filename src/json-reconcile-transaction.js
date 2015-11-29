const CallbackQueue = require('react/lib/CallbackQueue');
const PooledClass = require('react/lib/PooledClass');
const Transaction = require('react/lib/Transaction');
const assign = require('lodash.assign');


var JSONReconcileTransaction = function() {
  this.reinitializeTransaction();
  this.renderToStaticMarkup = false;
  this.reactMountReady = CallbackQueue.getPooled(null);
  this.useCreateElement = false;
};

const Mixin = {
  getTransactionWrappers: function() {
    return [{
      initialize: function() {
        this.reactMountReady.reset();
      },
      close: function() {
        this.reactMountReady.notifyAll();
      }
    }];
  },
  getReactMountReady: function() {
    return this.reactMountReady;
  },
  destructor: function() {
    CallbackQueue.release(this.reactMountReady);
    this.reactMountReady = null;
  }
};

assign(
  JSONReconcileTransaction.prototype,
  Transaction.Mixin,
  Mixin
);

PooledClass.addPoolingTo(JSONReconcileTransaction);

module.exports = JSONReconcileTransaction;