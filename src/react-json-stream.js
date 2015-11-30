require('webpack-clear-require')();

const ReactVersion = require('react/lib/ReactVersion');
const ReactIsomorphic = require('react/lib/ReactIsomorphic');
const assign = require('lodash.assign');

const JSONMount = require('./json-mount');
require('./json-inject')();


const React = {
  render: JSONMount.render,
  unmountComponentAtNode: JSONMount.unmountComponentAtNode,
  version: ReactVersion
};

assign(React, ReactIsomorphic);

module.exports = React;