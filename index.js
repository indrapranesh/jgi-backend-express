const express = require('express')
  , bodyParser = require('body-parser')
  , cors = require('cors')
  , docusignController = require('./lib/controllers/docusign.js');

// Setup server port
const port = process.env.PORT || 5000;

const app = express()
  .use(bodyParser.urlencoded({ extended: true }))
  .use(cors())
  .use(bodyParser.json())

  // Routes
  .post('/envelope/send', docusignController.sendEnvelope )



// start server
app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});