const envelopeService = require('../services/envelopeService.js');

const envelopeController = exports;

envelopeController.sendEnvelope = async(req, res) => {
    const token = req.headers.authorization.replace('Bearer ', '');
    let body = req.body; 
    body.accessToken = token;
    console.log(body);
    try {
        let results = await envelopeService.sendEnvelope(body);
        console.log(results);
        res.send(results)
    } catch(err) {
        res.send(err)
    }
}