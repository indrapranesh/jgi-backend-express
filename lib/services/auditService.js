const {Audit} = require('../db/db.config');
const auditService = exports;

auditService.getAllAudits = () => {
    return new Promise(async(resolve, reject) => {
        try {
            let audits = await Audit.findAll();
            resolve(audits);
        } catch(err) {
            reject(err);
        }
    })
}