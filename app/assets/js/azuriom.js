// Libs
const request = require('request'); // Make HTTP Requests
const azuriom = require('azuriom-auth'); // Implements Azuriom authentication module
const { reject } = require('async');

// Server's path
const authPath = "https://site.evershell.net";

const authenticator = new azuriom.Authenticator(authPath);

const statuses = [
    {
        service: 'mc.evershell.net',
        status: 'green',
        name: 'Evershell server status',
        essential: true
    }
]

// Authenticate user
exports.authenticate = function(email, password) {
    return new Promise((resolve, reject) => {
        let body = {
            user: {
                username: "",
                id: ""
            },
            accessToken: "",
            clientToken: "",
            availableProfiles: [],
            selectedProfile: {
                name: "",
                id: ""
            }
        };
        authenticator.auth(email, password)
            .then(user => {
                body.user.username = user.email;
                body.user.id = user.id.toString();
                body.accessToken = user.accessToken;
                body.clientToken = "";
                body.availableProfiles.push({name: user.username, id: user.uuid});
                body.selectedProfile.name = user.username;
                body.selectedProfile.id = user.uuid;
                resolve(body)
            })
            .catch(e => reject(e))
    })
}

// Check if current user is authenticated
exports.validate = function(accessToken) {
    return new Promise((resolve, reject) => {
        authenticator.verify(accessToken)
            .then(user => {
                resolve(true)
            })
            .catch(e => {
                if(e.response.status == 422 || e.response.status == 403) resolve(false)
                else reject(e)
            })
    })
}

// Logout user
exports.invalidate = function(accessToken) {
    return new Promise((resolve, reject) => {
        authenticator.logout(accessToken)
            .then(() => {
                resolve(true)
            })
            .catch(e => {
                reject(e)
            })
    })
}

exports.getUUID = function(username) {
    return new Promise((resolve, reject) => {
        request.get(`http://api.serveurs-minecraft.com/api_uuid?Pseudo_Vers_UUID&ID=${username}`,
            (error, response, body) => {
                resolve(body);
            })
    })
}

exports.status = function() {
    const ip = "mc.evershell.net";
    const port = "25565";
    return new Promise((resolve, reject) => {
        request.get(`https://mcapi.us/server/status?ip=${ip}&port=${port}`, {json: true},
            (err, res, body) => {
                if(err || res.statusCode !== 200) {
                    for(let i=0; i<statuses.length; i++){
                        statuses[i].status = 'grey'
                    }
                    resolve(statuses)
                } else {
                    const key = ip;
                    for(let i=0; i<statuses.length; i++) {
                        if(statuses[i].service === key) {
                            statuses[i].status = body.online ? 'green' : 'red'
                        }
                    }
                    resolve(statuses)
                }
            })
    })
}