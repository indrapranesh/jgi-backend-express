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

// Get Map Page and Form Data to View Users drawings
envelopeController.getEnvelopeData = async(req, res) => {
    try {
        const token = req.headers.authorization.replace('Bearer ', '');
        let envelopeId = req.params.id;
        let data = await envelopeService.getEnvelopeData(token, envelopeId);
        res.send(data);
    } catch(err) {
        console.log(err)
        res.send(err);
    }
}

envelopeController.getMapImage = async(req,res) => {
    try {
        const token = req.headers.authorization.replace('Bearer ', '');
        let envelopeId = req.params.id;
        let map = await envelopeService.getMapImage(token, envelopeId);
        console.log(map)
        map = Buffer.from(map).toString('base64');
        res.send(map);
    } catch(err) {
        res.send(err);
    }
}

envelopeController.getComments = async (req, res) => {
    try {
        const token = req.headers.authorization.replace('Bearer ', '');
        let envelopeId = req.params.id;
        let comments = await envelopeService.getComments(token, envelopeId);
        console.log(comments);
        res.send(comments);
    } catch(err) {
        res.send(err);
    } 
}