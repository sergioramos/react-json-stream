const JSONIDOperations = require('./json-id-operations');
const JSONMount = require('./json-mount');

module.exports = {
  processChildrenUpdates: JSONIDOperations.dangerouslyProcessChildrenUpdates,
  replaceNodeWithMarkupByID: JSONIDOperations.dangerouslyReplaceNodeWithMarkupByID,
  unmountIDFromEnvironment: function(id) {
    JSONMount.purgeId(id);
  }
};
