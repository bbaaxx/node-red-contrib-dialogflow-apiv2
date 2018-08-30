const path = require("path");
const fs = require("fs");

const baseDir = path.resolve(
  process.env.GOOGLE_APPLICATION_CREDENTIALS_DIR || "./"
);

module.exports = function(RED) {
  function GoogleCloudCredentials(config) {
    RED.nodes.createNode(this, config);
    const node = this;

    const keyFilename = path.resolve(baseDir, `cgp-creds-${node.id}.json`);

    fs.writeFile(keyFilename, config.creds, err => {
      if (err) return node.error("Couldn't create credentials file");
      node.on("close", function(done) {
        fs.unlink(keyFilename, done);
      });
    });

    node.name = config.name;
    node.projectId = config.project;
    node.sessionId = config.session;
    node.keyFilename = keyFilename;
  }

  RED.nodes.registerType("google-cloud-credentials", GoogleCloudCredentials);
};
