require('colors')

var Emitter = require('component-emitter');
var React = require('./src/react-json');

var Child = React.createClass({
  getInitialState: function getInitialState() {
    return {
      i: 0
    };
  },
  componentDidMount: function componentDidMount() {
    this.interval = setInterval(this.tick, 500);
  },
  componentWillUnmount: function componentWillUnmount() {
    clearInterval(this.interval);
  },
  tick: function tick() {
    this.setState({
      i: this.state.i + 1
    });
  },
  render: function render() {
    return React.createElement(
      'li',
      null,
      format('%s %s', this.props.i, this.state.i)
    );
  }
});

var App = React.createClass({
  getInitialState: function getInitialState() {
    return {
      i: 0
    };
  },
  componentDidMount: function componentDidMount() {
    this.interval = setInterval(this.tick, 1000);
  },
  componentWillUnmount: function componentWillUnmount() {
    clearInterval(this.interval);
  },
  tick: function tick() {
    this.setState({
      i: this.state.i + 1
    });
  },
  render: function render() {
    var another = null;

    if (this.state.i % 2) {
      another = React.createElement(Child, { i: this.state.i });
    }

    return React.createElement(
      'ul',
      null,
      React.createElement(
        'li',
        null,
        this.state.i
      ),
      another
    );
  }
});

var str = React.render(React.createElement(App));

str.on('readable', function () {
  console.log('readable');
  str.read()
});

str.on('end', function() {

});

setTimeout(function() {
  React.unmountComponentAtNode(str);
}, 8000);