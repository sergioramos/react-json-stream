# react-json-stream

[![](https://img.shields.io/travis/ramitos/react-json-stream.svg)](https://travis-ci.org/ramitos/react-json-stream) [![](https://img.shields.io/codeclimate/coverage/github/ramitos/react-json-stream.svg)](https://codeclimate.com/github/ramitos/react-json-stream/coverage) [![](https://img.shields.io/npm/v/react-json-stream.svg)](https://www.npmjs.com/package/@ramitos/react-json-stream) [![](https://img.shields.io/david/ramitos/react-json-stream.svg)](https://david-dm.org/ramitos/react-json-stream) [![](https://img.shields.io/codeclimate/github/ramitos/react-json-stream.svg)](https://codeclimate.com/github/ramitos/react-json-stream) [![](https://img.shields.io/npm/l/react-json-stream.svg)](https://www.npmjs.com/package/@ramitos/react-json-stream)

## install

```bash
npm install --save react-json-stream
```

## example

```jsx
var JSON = require('jsonstream2');
var React = require('react-json-stream');


var App = React.createClass({
  getInitialState: function() {
    return {
      i: 0
    };
  },
  componentDidMount: function() {
    this.interval = setInterval(this.tick, 500);
  },
  componentWillUnmount: function() {
    clearInterval(this.interval);
  },
  tick: function() {
    this.setState({
      i: this.state.i + 1
    });
  },
  render: function() {
    return (<ul>
      <li key='my-li'>{this.state.i}</li>
    </ul>);
  }
});

var str = React.render(React.createElement(App));
str.pipe(JSON.stringify()).pipe(process.stdout);

setTimeout(function() {
  React.unmountComponentAtNode(str);
}, 2000);
```

```json
[{
  "children": [],
  "parent": "",
  "name": "ul",
  "id": ".0",
  "props": {},
  "content": null
}, {
  "children": [{
    "children": [],
    "parent": ".0",
    "name": "li",
    "id": ".0.$my-li",
    "props": {
      "key": "my-li"
    },
    "content": 1
  }],
  "parent": "",
  "name": "ul",
  "id": ".0",
  "props": {},
  "content": null
}, {
  "children": [{
    "children": [],
    "parent": ".0",
    "name": "li",
    "id": ".0.$my-li",
    "props": {
      "key": "my-li"
    },
    "content": 2
  }],
  "parent": "",
  "name": "ul",
  "id": ".0",
  "props": {},
  "content": null
}, {
  "children": [{
    "children": [],
    "parent": ".0",
    "name": "li",
    "id": ".0.$my-li",
    "props": {
      "key": "my-li"
    },
    "content": 3
  }],
  "parent": "",
  "name": "ul",
  "id": ".0",
  "props": {},
  "content": null
}]
```

## license

BSD-3-Clause