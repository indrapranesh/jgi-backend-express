const { resolve } = require('path');

const accountId = '10933277'
    , docusign = require('docusign-esign')
    , fs = require('fs')
    , path = require('path');

const envelopeController = exports;
let dsApiClient = new docusign.ApiClient();
const basePath = 'https://demo.docusign.net/restapi';
let version = '';

envelopeController.sendEnvelope = async(req, res) => {
    const token = req.headers.authorization.replace('Bearer ', '');
    let body = req.body; 
    body.accessToken = token;
    dsApiClient.setBasePath(basePath);
    dsApiClient.addDefaultHeader('Authorization', 'Bearer ' + body.accessToken);
    let envelopeArgs = {
        status: "sent",
        version: "1.0.0"
    }
    version = envelopeArgs.version;
    try {
        let users = (await getGroupUsers()).users;
        console.log(users);
        let envelopeIds = [];
        for(let i=0; i < users.length; i++) {
            let envelopeId = await createEnvelope(envelopeArgs, users[i]);
            envelopeIds.push(envelopeId)
        }
        res.send(JSON.stringify({
            envelopeIds
        }))
    } catch(err) {
        res.send(err)
    }
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

function createEnvelope(envelopeArgs, user) {
    return new Promise(async (resolve, reject) => {
        try {
            console.log(user);
            const envelopeApi = new docusign.EnvelopesApi(dsApiClient);
            let envelope = await makeEnvelope(envelopeArgs, user);
            console.log(envelope);
            let results = await envelopeApi.createEnvelope(accountId, {
                envelopeDefinition: envelope
            });
            let envelopeId = results.envelopeId;
            resolve({envelopeId});
        } catch(err) {
            reject(err)
        }
    }) 
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

function makeEnvelope(args, user) {
    return new Promise(async (resolve, reject) => {
        try {
            let definition = new docusign.EnvelopeDefinition();
            definition.emailSubject = `Eastern Chimpanzee Range Review Audit`;
                // ,documentb64 = args.documentBuffer.toString('base64');
            definition.documents = [getDocuments('JGI-Audit Page-1.pdf', 'Page 1', '1'), getDocuments('JGI-Map.pdf', 'Map', '2'), getDocuments('JGI-Audit Page-2.pdf', 'Page 2', '3')];

            let signer = docusign.Signer.constructFromObject({
                email: user.email,
                name: user.userName,
                recipientId: '1',
                routingOrder: '1'});
            
            const signHere = docusign.SignHere.constructFromObject({documentId: '3',
            pageNumber: '1', recipientId: '1', tabLabel: 'SignHereTab',
            xPosition: '470', yPosition: '705'});
            
            let version = docusign.Text.constructFromObject({
                documentId: "1", pageNumber: "1",
                xPosition: "111", yPosition: "199",
                font: "helvetica", fontSize: "size14", tabLabel: "Version",
                height: "23", width: "84", required: "true",
                bold: 'true', value: args.version,
                locked: 'false', tabId: 'name'});

            let radioGroup = docusign.RadioGroup.constructFromObject({
                documentId: "3", groupName: "changeRequired", 
                radios: [
                    docusign.Radio.constructFromObject({
                        font: "helvetica", fontSize: "size14", pageNumber: "1",
                        value: "true", xPosition: "38", yPosition: "22", required: "false"}),
                    docusign.Radio.constructFromObject({
                        font: "helvetica", fontSize: "size14", pageNumber: "1",
                        value: "false", xPosition: "84", yPosition: "603", required: "false"}),
                ]
            });

            let drawingTab = docusign.Draw.constructFromObject({
                documentId: "2", pageNumber: "1",
                xPosition: "0", yPosition: "0",
                width: "699", height: "499", tooltip: "Mark your changes"
            });
            
            signer.tabs = docusign.Tabs.constructFromObject({
                signHereTabs: [signHere],
                // prefillTabs: {
                //     textTabs: [version],
                // },
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