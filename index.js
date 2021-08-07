const express = require('express')
  , bodyParser = require('body-parser')
  , cors = require('cors')
  , envelopeController = require('./lib/controllers/envelopeController.js')
  , userController = require('./lib/controllers/docusignUser.js')
  , auditController = require('./lib/controllers/auditController.js')

// Setup server port
const port = process.env.PORT || 5000;

const app = express()
  .use(bodyParser.urlencoded({ extended: true }))
  .use(cors())
  .use(bodyParser.json())

  // Routes

  //Envelopes
  .post('/envelope/send', envelopeController.sendEnvelope )
  .get('/group/users', userController.getGroupUsers)
  .post('/group/user/create', userController.createGroupUser)
  .get('/envelope/data/:id', envelopeController.getEnvelopeData)
  .get('/envelope/map/:id', envelopeController.getMapImage)

  //Audit
  .get('/audits', auditController.getAllAudits)
  .post('/audit', auditController.createAudit)
  .get('/review/envelopes/:id', auditController.getEnvelopesByReview)


// start server
app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});