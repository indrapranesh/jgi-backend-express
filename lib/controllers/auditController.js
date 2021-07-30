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