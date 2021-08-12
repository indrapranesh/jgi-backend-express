const express = require('express')
  , bodyParser = require('body-parser')
  , cors = require('cors')
  , envelopeController = require('./lib/controllers/envelopeController.js')
  , userController = require('./lib/controllers/docusignUser.js')
  , auditController = require('./lib/controllers/auditController.js')
  , mapController = require('./lib/controllers/mapController')

// Setup server port
const port = process.env.PORT || 5000;

const app = express()
  .use(bodyParser.urlencoded({ extended: true, limit: '50mb' }))
  .use(cors())
  .use(bodyParser.json({limit: '50mb'}))

  // Routes

  //Envelopes
  .post('/envelope/send', envelopeController.sendEnvelope )
  .get('/group/users', userController.getGroupUsers)
  .post('/group/user/create', userController.createGroupUser)
  .get('/envelope/data/:id', envelopeController.getEnvelopeData)
  .get('/envelope/map/:id', envelopeController.getMapImage)
  .get('/envelope/comments/:id', envelopeController.getComments)

  //Audit
  .get('/audits', auditController.getAllAudits)
  .post('/audit', auditController.createAudit)
  .post('/review', auditController.createReview)
  .get('/review/envelopes/:id', auditController.getEnvelopesByReview)

  //map
  .get('/map', mapController.getMap)
  .patch('/map', mapController.updateVersion)


// start server
app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});