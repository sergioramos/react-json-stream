var ReactEventListener = {
  _enabled: true,
  setHandleTopLevel: function() {},
  setEnabled: function(enabled) {
    ReactEventListener._enabled = enabled;
  },
  isEnabled: function() {
    return ReactEventListener._enabled;
  },
  trapBubbledEvent: function() {},
  trapCapturedEvent: function() {},
  monitorScrollValue: function(fn) {
    fn();
  },
  dispatchEvent: function() {}
};

module.exports = ReactEventListener;
