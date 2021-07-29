const { resolve } = require('path');

const accountId = '10933277'
    , docusign = require('docusign-esign')
    , fs = require('fs')
    , path = require('path')
    , userController = require('./docusignUser.js');

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
        status: "created",
        version: "1.0.0"
    }
    version = envelopeArgs.version;
    try {
        let bulkListId = await createBulkList();
        envelopeArgs.bulkListId = bulkListId;
        let envelopeId = await createEnvelope({envelopeArgs});
        let bulkResult = await bulkSend(bulkListId, envelopeId);
        res.send(JSON.stringify({
            bulkResult
        }))
    } catch(err) {
        res.send(err)
    }
}


function bulkSend(bulkListId, envelopeId) {
    return new Promise(async (resolve, reject) => {
        try {
            const bulkEnvelopesApi = new docusign.BulkEnvelopesApi(dsApiClient);
            let bulkResult = await bulkEnvelopesApi.createBulkSendRequest(accountId, bulkListId,
                {
                    bulkSendRequest: {
                        envelopeOrTemplateId: envelopeId.envelopeId
                    }
            });
            resolve(bulkResult);
        } catch(err) {
            reject(err);
        }
    })
}

function createBulkList() {
    return new Promise(async (resolve, reject) => {
        try {
            const bulkEnvelopesApi = new docusign.BulkEnvelopesApi(dsApiClient);
            const userRes = await getGroupUsers();
            const users = userRes?.users;
            let recipientList = [];  
            users.map((user, index) => {
                recipientList.push({
                    recipients: [{
                        roleName: "signer",
                        tabs: [],
                        name: user.userName,
                        email: user.email
                    }]
                })
            })
            let bulkList = await bulkEnvelopesApi.createBulkSendList(accountId, {
                bulkSendingList: {
                    name: "sample.csv",
                    bulkCopies: recipientList
                }
            });
            resolve(bulkList.listId);
        } catch(err) {
            console.log(err);
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

function createEnvelope({envelopeArgs}) {
    return new Promise(async (resolve, reject) => {
        try {
            const envelopeApi = new docusign.EnvelopesApi(dsApiClient);
            let envelope = await makeEnvelope(envelopeArgs);
            console.log(envelope);
            let results = await envelopeApi.createEnvelope(accountId, {
                envelopeDefinition: envelope
            });
            await envelopeApi.createCustomFields(accountId, results.envelopeId, {
                customFields: {
                    textCustomFields: [
                        {
                            name: "mailingListId",
                            required: "false",
                            show: "false",
                            value: envelopeArgs.bulkListId
                        }
                    ]
                }
            });
            console.log(results);
            await envelopeApi.createRecipient(accountId, results.envelopeId, {
                recipients: {
                    signers: [
                        {
                            name: "Multi Bulk Recipient::signer",
                            email: "multiBulkRecipients-signer@docusign.com",
                            roleName: "signer",
                            routingOrder: "1",
                            status: "created",
                            deliveryMethod: "email",
                            recipientId: "1",
                            recipientType: "signer"
                        },
                    ]
                }
            })
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
                isBulkRecipient: true,
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
                // signHereTabs: [signHere],
                // prefillTabs: {
                //     textTabs: [version],
                // },
                radioGroupTabs: [radioGroup],
            });

            // let recipients = docusign.Recipients.constructFromObject({
            //     signers: [signer]
            // });
            // definition.recipients = recipients;
            definition.status = args.status;
            resolve(definition);
        } catch(err) {
            reject(err);
        }
    })
}