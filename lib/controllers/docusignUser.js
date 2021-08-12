const accountId = '10933277'
    , docusign = require('docusign-esign')
    , fs = require('fs')
    , path = require('path');

const userController = exports;
let dsApiClient = new docusign.ApiClient();
const basePath = 'https://demo.docusign.net/restapi';

userController.getGroupUsers = async(req, res) => {
    try {
        let token = req.headers.authorization.replace('Bearer ', '');
        dsApiClient.setBasePath(basePath);
        dsApiClient.addDefaultHeader('Authorization', 'Bearer ' + token);
        const groupApi = new docusign.GroupsApi(dsApiClient);
        let groupId =  await getGroupId();
        let groupUsers = await groupApi.listGroupUsers(accountId, groupId);
        res.send(groupUsers);
    } catch(err) {
        res.send(err);
    }
}

async function getGroupId() {
    return new Promise(async (resolve, reject) => {
        try {
            const groupApi = new docusign.GroupsApi(dsApiClient);
            let groups = await groupApi.listGroups(accountId);
            let groupId;
            groups.groups.map((group) => {
                if(group.groupName.includes('JGI')) {
                    groupId = group.groupId;
                }
            });
            resolve(groupId);
        } catch(err) {
            reject(err);
        }
    })
}

async function getPermissionProfileId() {
    return new Promise(async (resolve, reject) => {
        try {
            const accountsApi = new docusign.AccountsApi(dsApiClient);
            let permissions = await accountsApi.listPermissions(accountId);
            let permissionId;
            permissions.permissionProfiles.map((permission) => {
                if(permission.permissionProfileName === 'DocuSign Viewer') {
                    permissionId = permission.permissionProfileId
                }
            })
            resolve(permissionId);
        } catch(err) {
            reject(err);
        }
    })
}

userController.createGroupUser = async(req, res) => {
    let token = req.headers.authorization.replace('Bearer ', '');
    dsApiClient.setBasePath(basePath);
    dsApiClient.addDefaultHeader('Authorization', 'Bearer ' + token);
    let usersApi = new docusign.UsersApi(dsApiClient);
    let params = {
        "newUsersDefinition": {
            "newUsers": [
                {
                    email: req.body.email,
                    userName: req.body.userName,
                    groupList: [
                        {
                            groupId: await getGroupId()
                        }
                    ],
                    permissionProfileId: await getPermissionProfileId()
                }
            ]
        }
    }
    let user;
    try {
        user = await usersApi.create(accountId, params);
        res.send(user);
    } catch(err) {
        res.send(err);
    }
}



