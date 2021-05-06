const fetch = require('node-fetch');
const Headers = require('node-fetch').Headers;
const URLSearchParams = require('url').URLSearchParams;
const { Admin } = require('./apiAdmin');

const requestAPIKeyHeader = new Headers();
requestAPIKeyHeader.append("Content-Type", "application/x-www-form-urlencoded");

const defaultRequestHeader = new Headers();
defaultRequestHeader.append("Content-Type", "application/json");
defaultRequestHeader.append("Accept", "application/json");

requestApiToken = async () => {
    if (Admin.token) {
        return Admin.token;
    }
    const urlencoded = new URLSearchParams();
    urlencoded.append("username", Admin.username);
    urlencoded.append("password", Admin.password);

    const requestOptions = {
        method: 'POST',
        headers: requestAPIKeyHeader,
        body: urlencoded,
        redirect: 'follow'
    };

    let response = await loginApiUser(requestOptions);
    if (!response.token) {
        response = await registerApiUser(requestOptions);
    }
    Admin.tokenExpires = response.tokenExpires;
    return response.token;

}

//The API documentation: https://wekan.github.io/api/v2.55/#wekan-rest-api 
registerApiUser = async (requestOptions) => {
    return await fetch("http://localhost:2000/users/register", requestOptions)
        .then(response => response.json())
        .then(result => { return result })
        .catch(error => console.error('error', error));
}

loginApiUser = async (requestOptions) => {
    return await fetch("http://localhost:2000/users/login", requestOptions)
        .then(response => response.json())
        .then(result => { return result })
        .catch(error => console.error('error', error));
}

registerNewWekanUser = (requestOptions) => {
    //return "registerNewWekanUser is not implemented Yet";
    return fetch("http://teambox.local:2000/api/users", requestOptions)
        .then(response => response.text())
        .then(result => { return result })
        .catch(error => console.error('error', error));
}

tokenIsExpired = () => {
    const expireingDate = new Date(Admin.tokenExpires).getTime();
    const currentDate = Date.now();
    if (expireingDate <= currentDate) {
        return true;
    } else {
        return false;
    }
}

module.exports.initApiKey = async () => {
    if (!Admin.token || tokenIsExpired()) {
        Admin.token = await requestApiToken();
        defaultRequestHeader.append("Authorization", `Bearer ${Admin.token}`);
    }
}

module.exports.registerNewUser = async (username, email, password) => {
    //prepare request
    var rawJSONData = JSON.stringify({
        "username": username,
        "email": email,
        "password": password
    });

    const requestOptions = {
        method: 'POST',
        headers: defaultRequestHeader,
        body: rawJSONData,
        redirect: 'follow'
    };

    let response = await registerNewWekanUser(requestOptions);
    //console.debug(response);
    if (response._id) {
        console.log(`registerNewUser >>> user ${username} was registered to Wekan created.`);
    } else if (response.error === 403) {
        console.log(`registerNewUser >>> user ${username} already Exsisted.`);
    }
}