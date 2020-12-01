// Libs
const request = require('request'); // Make HTTP Requests
const azuriom = require('azuriom-auth'); // Implements Azuriom authentication module

// Server's path
const authPath = "http://mcsite.evershell.net";

const authenticator = new azuriom.Authenticator(authPath);

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