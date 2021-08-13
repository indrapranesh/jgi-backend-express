const accountId = '10933277'
    , docusign = require('docusign-esign')
    , fs = require('fs')
    , path = require('path')
    , db = require('../db/db.config')
    , { Envelope } = require('../db/db.config');

const envelopeService = exports;
let dsApiClient = new docusign.ApiClient();
const basePath = 'https://demo.docusign.net/restapi';
let version = '';


envelopeService.sendEnvelope = (body) => {
    console.log('envelopeservice')
    return new Promise(async (resolve, reject) => {
        console.log('envelope service')
        dsApiClient.setBasePath(basePath);
        dsApiClient.addDefaultHeader('Authorization', 'Bearer ' + body.accessToken);
        let envelopeArgs = {
            status: "sent",
            version: "1.0.0",
            reviewId: body.reviewId,
            map: body.mapFile,
            final: body.final
        }
        version = envelopeArgs.version;
        let trans = await db.sequelize.transaction();
        try {
            let users = (await getGroupUsers()).users;
            console.log(users);
            let envelopeIds = [];
            for(let i=0; i < users.length; i++) {
                let envelopeId = await createEnvelope(envelopeArgs, users[i], trans);
                envelopeIds.push(envelopeId)
            }
            await trans.commit();
            resolve(JSON.stringify({
                envelopeIds
            }))
        } catch(err) {
            await trans.rollback();
            reject(err)
        }
    })
}

function createEnvelope(envelopeArgs, user, trans) {
    return new Promise(async (resolve, reject) => {
        try {
            console.log(user);
            const envelopeApi = new docusign.EnvelopesApi(dsApiClient);
            let envelope;
            if(envelopeArgs.final) {
                envelope = await makeFinalEnvelope(envelopeArgs, user);
            } else {
                envelope = await makeEnvelope(envelopeArgs, user)
            }
            let results = await envelopeApi.createEnvelope(accountId, {
                envelopeDefinition: envelope
            });
            console.log('envelope sent');
            let envelopeId = results.envelopeId;
            let envelopeBody = {
                reviewId: envelopeArgs.reviewId,
                stakeHolderName: user.userName,
                envelopeId: envelopeId
            }
            console.log('creating record in db', envelopeBody);
            await Envelope.create(envelopeBody, {
                transaction: trans
            });
            resolve({envelopeId});
        } catch(err) {
            reject(err)
        }
    }) 
}

async function getGroupUsers() {
    const groupApi = new docusign.GroupsApi(dsApiClient);
    let groupId =  await getGroupId();
    let groupUsers = await groupApi.listGroupUsers(accountId, groupId);
    return groupUsers;
}

async function getGroupId() {
    const groupApi = new docusign.GroupsApi(dsApiClient);
    let groups = await groupApi.listGroups(accountId);
    let groupId;
    groups.groups.map((group) => {
        if(group.groupName.includes('JGI')) {
            groupId = group.groupId;
        }
    });
    return groupId;
}

function getDocuments(fileName, title, id) {
    const docPath = path.resolve(__dirname, '../../documents')
                , docFile = fileName;
    let docPdfBytes = fs.readFileSync(path.resolve(docPath, docFile));
    
    let document = new docusign.Document()
        ,documentb64 = Buffer.from(docPdfBytes).toString('base64');

    document.documentBase64 = documentb64;
    document.name = `Eastern Chimpanzee Range Review ${title}`;
    document.fileExtension = 'pdf';
    document.documentId = id;
    return document;
}

function getMapPdf(base64) {
    base64 = base64.replace('data:application/pdf;base64,','');
    let document = new docusign.Document();
    document.documentBase64 = base64;
    document.name = 'Eastern Chimpanzee Range Map',
    document.fileExtension = 'pdf';
    document.documentId = '2';
    return document;
}

function makeFinalEnvelope(args, user) {
    return new Promise(async (resolve, reject) => {
        try {
            let definition = new docusign.EnvelopeDefinition();
            definition.emailSubject = `Eastern Chimpanzee Range Final Review`;
            definition.documents = [getDocuments('JGI Final.pdf', 'Page 1', '1'), getMapPdf(args.map)];
            let signer = docusign.Signer.constructFromObject({
                email: user.email,
                name: user.userName,
                recipientId: '1',
                routingOrder: '1'});
            const signHere = docusign.SignHere.constructFromObject({documentId: '1',
                pageNumber: '1', recipientId: '1', tabLabel: 'SignHereTab',
                xPosition: '445', yPosition: '585'});
            let date = docusign.Text.constructFromObject({
                documentId: "1", pageNumber: "1",
                xPosition: "121", yPosition: "630",
                font: "helvetica", fontSize: "size14", tabLabel: "Date",
                height: "23", width: "84", required: "true",
                bold: 'true', locked: 'false', tabId: 'name'});
            signer.tabs = docusign.Tabs.constructFromObject({
                signHereTabs: [signHere],
                textTabs: [date],
            });
            let recipients = docusign.Recipients.constructFromObject({
                signers: [signer]
            });
            definition.recipients = recipients;
            definition.status = args.status;
            resolve(definition);
        } catch {
            reject(err);
        }
    })
}

function makeEnvelope(args, user) {
    return new Promise(async (resolve, reject) => {
        try {
            let definition = new docusign.EnvelopeDefinition();
            definition.emailSubject = `Eastern Chimpanzee Range Review Audit`;
                // ,documentb64 = args.documentBuffer.toString('base64');
            definition.documents = [getDocuments('JGI_review_page_1.pdf', 'Page 1', '1'), getMapPdf(args.map)];

            let signer = docusign.Signer.constructFromObject({
                email: user.email,
                name: user.userName,
                recipientId: '1',
                routingOrder: '1'});
            
            const signHere = docusign.SignHere.constructFromObject({documentId: '1',
            pageNumber: '1', recipientId: '1', tabLabel: 'SignHereTab',
            xPosition: '450', yPosition: '726'});
            
            let date = docusign.Text.constructFromObject({
                documentId: "1", pageNumber: "1",
                xPosition: "120", yPosition: "765",
                font: "helvetica", fontSize: "size14", tabLabel: "Date",
                height: "23", width: "84", required: "true",
                bold: 'true', locked: 'false', tabId: 'name'});

            let radioGroup = docusign.RadioGroup.constructFromObject({
                documentId: "1", groupName: "changeRequired", requireAll: "true", shared: "true",
                radios: [
                    docusign.Radio.constructFromObject({
                        font: "helvetica", fontSize: "size14", pageNumber: "1",
                        value: "true", xPosition: "49", yPosition: "243", required: "false"}),
                    docusign.Radio.constructFromObject({
                        font: "helvetica", fontSize: "size14", pageNumber: "1",
                        value: "false", xPosition: "49", yPosition: "659", required: "false"}),
                ]
            });

            let textTab = docusign.Text.constructFromObject({
                documentId: "1", pageNumber: "1",  name: 'userInput',
                xPosition: '53', yPosition: '294', required: "false",
                width: '500', height: '300'
            })

            let drawingTab = docusign.Draw.constructFromObject({
                documentId: "2", pageNumber: "1", required: false,
                xPosition: "0", yPosition: "0",
                width: "750", height: "500", tooltip: "Mark your changes"
            });
            
            signer.tabs = docusign.Tabs.constructFromObject({
                signHereTabs: [signHere],
                textTabs: [date, textTab],
                drawTabs: [drawingTab],
                radioGroupTabs: [radioGroup],
            });

            let recipients = docusign.Recipients.constructFromObject({
                signers: [signer]
            });
            definition.recipients = recipients;
            definition.status = args.status;
            resolve(definition);
        } catch(err) {
            reject(err);
        }
    })
}

envelopeService.getEnvelopeStatus = (token, envelopeIds) => {
    return new Promise(async (resolve, reject) => {
        try {
            dsApiClient.setBasePath(basePath);
            dsApiClient.addDefaultHeader('Authorization', 'Bearer ' + token);
            const envelopeApi = new docusign.EnvelopesApi(dsApiClient);
            let envelopesStatus = await envelopeApi.listStatus(accountId, {
                envelopeIds: envelopeIds
            });
            resolve(envelopesStatus);
        } catch(err) {
            reject(err);
        }
    })
}

envelopeService.getEnvelopeData = (token, envelopeId) => {
    return new Promise(async (resolve, reject) => {
        try {
            dsApiClient.setBasePath(basePath);
            dsApiClient.addDefaultHeader('Authorization', 'Bearer ' + token);
            const envelopeApi = new docusign.EnvelopesApi(dsApiClient);
            let envelopeFormData = (await envelopeApi.getFormData(accountId, envelopeId)).formData;
            resolve({envelopeFormData});
        } catch(err) {
            console.log(err);
            reject(err);
        }
    })
}

envelopeService.getMapImage = (token, envelopeId) => {
    return new Promise(async (resolve, reject) => {
        try {
            dsApiClient.setBasePath(basePath);
            dsApiClient.addDefaultHeader('Authorization', 'Bearer ' + token);
            const envelopeApi = new docusign.EnvelopesApi(dsApiClient);
            let mapImage = await envelopeApi.getDocumentPageImage(accountId, envelopeId, 2,1 );
            resolve(mapImage);
        } catch(err) {
            reject(err);
        }
    })
}

envelopeService.getComments = (token, envelopeId) => {
    return new Promise(async (resolve, reject) => {
        try {
            dsApiClient.setBasePath(basePath);
            dsApiClient.addDefaultHeader('Authorization', 'Bearer ' + token);
            const envelopeApi = new docusign.EnvelopesApi(dsApiClient);
            let comments = await envelopeApi.getCommentsTranscript(accountId, envelopeId, {
                encoding: 'base64'
            });
            resolve(comments);
        } catch(err) {
            reject(err);
        }
    })
}