const auditService = require('../services/auditService.js');

const auditController = exports;

auditController.getAllAudits = async(req, res) => {
    try {
        let audits = await auditService.getAllAudits();
        res.send(audits);
    } catch(err) {
        res.send(err);
    }
}

auditController.createAudit = async(req, res) => {
    try {
        let token = req.headers.authorization.replace('Bearer ', '');
        let result = await auditService.createAudit(token);
        res.send(result);
    } catch(err) {
        res.send(err);
    }
}

auditController.createReview = async(req, res) => {
    try {
        let token = req.headers.authorization.replace('Bearer ', '');
        let final = req.body?.final ? true : false;
        let result = await auditService.createReview(req.body, token, final);
        res.send(result);
    } catch(err) {
        res.send(err);
    }
}

auditController.getEnvelopesByReview = async(req, res) => {
    try {
        let reviewId = req.params.id;
        let token = req.headers.authorization.replace('Bearer ', '');
        let envelopes = await auditService.getEnvelopesByReview(reviewId, token);
        res.send(envelopes)
    } catch(err) {
        res.send(err);
    }
}