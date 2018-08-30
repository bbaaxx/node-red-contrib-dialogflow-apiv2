// Instantiate a DialogFlow client.
const { SessionsClient } = require("dialogflow");

// Helper to build a request
const makeRequest = (textQuery, sessionPath, languageCode) => ({
  session: sessionPath,
  queryInput: {
    text: {
      text: textQuery,
      languageCode: languageCode
    }
  }
});

// Helper to normalizeOutput output for node-red
// adds a nlpMetadata object with the already treated message
const normalizeOutput = msg => nlpResult => ({
  ...msg,
  payload: nlpResult.fulfillmentText,
  nlpResult
});

// This helper makes the call to the service
const callService = client => (query, session, language) =>
  client
    .detectIntent(makeRequest(query, session, language))
    .then(r => r[0].queryResult)
    .catch(err => {
      console.error("Dialogflow Service Error: ", err);
    });

module.exports = function(RED) {
  RED.nodes.registerType("dialogflow-detect-intent", function(config) {
    RED.nodes.createNode(this, config);
    const node = this;

    const { keyFilename, projectId, sessionId } = RED.nodes.getNode(config.gcpcreds);
    
    const sessionClient = new SessionsClient({ keyFilename });
    const sessionPath = sessionClient.sessionPath(projectId, sessionId);

    node.on("input", msg =>
      callService(sessionClient)(msg.payload, sessionPath, config.language)
        .then(normalizeOutput(msg))
        .then(output => node.send(output))
        .catch(e => node.error(`Detect Intent Error: ${e.message}`, msg))
    );
  });
};
