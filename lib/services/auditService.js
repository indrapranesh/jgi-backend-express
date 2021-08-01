const auditService = exports
    , db = require('../db/db.config')
    , {Audit, Map, Review, Envelope} = require('../db/db.config')
    , envelopeService = require('./envelopeService');

auditService.getAllAudits = () => {
    return new Promise(async(resolve, reject) => {
        try {
            let audits = await Audit.findAll({
                include: ['reviews']
            });
            resolve(audits);
        } catch(err) {
            reject(err);
        }
    })
}

auditService.createAudit = (token) => {
    return new Promise(async (resolve, reject) => {
        console.log('create audit service');
        try {
            let versions = await Map.findAll();
            let auditBody = {
                initialVersion: versions[0].latestVersion,
                isCompleted: false
            }
            let audit = await Audit.create(auditBody);
            console.log(audit)
            let reviewBody = {
                auditId: audit.id
            }
            let review = await Review.create(reviewBody);
            console.log(review);
            await envelopeService.sendEnvelope({
                accessToken: token,
                reviewId: review.id
            });
            resolve({
                message: 'Audit Created and Envelopes sent for Review',
                body: {
                    audit: audit,
                    review: review
                }
            });
        } catch(err) {
            console.log(err);
            reject(err);
        }
    })
}

auditService.getEnvelopesByReview = (reviewId, token) => {
    return new Promise(async (resolve, reject) => {
        try {
            let envelopes = await Envelope.findAll({
                where: {
                    reviewId: reviewId
                }
            });
            let envelopeIds = []
            envelopes.forEach(envelope => {
                envelopeIds.push(envelope.envelopeId)
            });
            let envelopesStatus = await envelopeService.getEnvelopeStatus(token, envelopeIds);
            resolve({
                envelopes: envelopes,
                envelopesStatus: envelopesStatus
            });
        } catch(err) {
            console.log(err);
            reject(err);
        }
    })
}