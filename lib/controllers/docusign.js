const accountId = '10933277'
    , docusign = require('docusign-esign')
    , fs = require('fs')
    , path = require('path');

const docusignController = exports;
let dsApiClient = new docusign.ApiClient();
const basePath = 'https://demo.docusign.net/restapi'

docusignController.sendEnvelope = async(req, res) => {
    const token = req.headers.authorization.replace('Bearer ', '');
    let body = req.body; 
    body.accessToken = token;
    console.log(body);
    dsApiClient.setBasePath(basePath);
    dsApiClient.addDefaultHeader('Authorization', 'Bearer ' + body.accessToken);
    let envelopeArgs = {
        signerEmail: body.email,
        signerName: body.name,
        status: "sent",
        version: body.version
    };
    try {
        let envelope = await createEnvelope({envelopeArgs});
        res.send(JSON.stringify({
            envelope
        }))
    } catch(err) {
        res.send(err)
    }
}

function createEnvelope({envelopeArgs}) {
    return new Promise(async (resolve, reject) => {
        try {
            const envelopeApi = new docusign.EnvelopesApi(dsApiClient);
            let envelope = await makeEnvelope(envelopeArgs);
            console.log(envelope);
            let results = await envelopeApi.createEnvelope(accountId, {
                envelopeDefinition: envelope
            });
            console.log(results);
            let envelopeId = results.envelopeId;
            resolve({envelopeId});
        } catch(err) {
            reject(err)
        }
    }) 
}

function makeEnvelope(args) {
    return new Promise(async (resolve, reject) => {
        try {
            const docPath = path.resolve(__dirname, '../../documents')
                , docFile = 'JGI-Audit 1.0.0.pdf';
            let docPdfBytes = fs.readFileSync(path.resolve(docPath, docFile));
            let definition = new docusign.EnvelopeDefinition();
            definition.emailSubject = 'Eastern Chimpanzee Range Review Audit';

            let document = new docusign.Document()
                , documentb64 = Buffer.from(docPdfBytes).toString('base64');

            document.documentBase64 = documentb64;
            document.name = 'Eastern Chimpanzee Range Review';
            document.fileExtension = 'pdf';
            document.documentId = '1';

            definition.documents = [document];

            let signer = docusign.Signer.constructFromObject({
                email: args.signerEmail,
                name: args.signerName,
                recipientId: '1',
                routingOrder: '1'});
            
            const signHere = docusign.SignHere.constructFromObject({documentId: '1',
            pageNumber: '1', recipientId: '1', tabLabel: 'SignHereTab',
            xPosition: '195', yPosition: '405'});
            
            let version = docusign.Text.constructFromObject({
                documentId: "3", pageNumber: "1",
                xPosition: "111", yPosition: "199",
                font: "helvetica", fontSize: "size14", tabLabel: "Version",
                height: "23", width: "84", required: "true",
                bold: 'true', value: args.version,
                locked: 'false', tabId: 'name'});

            let radioGroup = docusign.RadioGroup.constructFromObject({
                documentId: "1", groupName: "radio1", 
                radios: [
                    docusign.Radio.constructFromObject({
                        font: "helvetica", fontSize: "size14", pageNumber: "2",
                        value: "white", xPosition: "79", yPosition: "41", required: "false"}),
                    docusign.Radio.constructFromObject({
                        font: "helvetica", fontSize: "size14", pageNumber: "2",
                        value: "red", xPosition: "79", yPosition: "120", required: "false"}),
                ]
            });
            
            signer.tabs = docusign.Tabs.constructFromObject({
                signHereTabs: [signHere],
                prefillTabs: {
                    textTabs: [version],
                },
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