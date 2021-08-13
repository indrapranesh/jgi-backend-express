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
                isCompleted: false,
                finalReview: false
            }
            let audit = await Audit.create(auditBody);
            console.log(audit)
            resolve(audit);
        } catch(err) {
            console.log(err);
            reject(err);
        }
    })
}

auditService.createReview = (body, token, final = false) => {
    return new Promise(async (resolve, reject) => {
        try {
            let reviewBody = {
                AuditId: body.auditId
            }
            let review = await Review.create(reviewBody);
            await envelopeService.sendEnvelope({
                accessToken: token,
                reviewId: review.id,
                mapFile: body.mapFile,
                final: final
            });
            console.log(final);
            if(final) {
                await Audit.update({
                    finalReview: true
                }, {
                    where: {
                        id: body.auditId
                    }
                });
            }
            resolve({
                message: 'Envelopes sent for Review',
                body: {
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