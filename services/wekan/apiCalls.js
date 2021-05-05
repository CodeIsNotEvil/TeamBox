const fetch = require('node-fetch');
const Headers = require('node-fetch').Headers;
const URLSearchParams = require('url').URLSearchParams;
const { Admin } = require('./apiAdmin');

const requestAPIKeyHeader = new Headers();
requestAPIKeyHeader.append("Content-Type", "application/x-www-form-urlencoded");

const defaultRequestHeader = new Headers();
defaultRequestHeader.append("Content-Type", "multipart/form-data");
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

registerApiUser = async (requestOptions) => {
    return await fetch("http://localhost:2000/users/register", requestOptions)
        .then(response => response.json())
        .then(result => { return result })
        .catch(error => console.log('error', error));
}

loginApiUser = async (requestOptions) => {
    return await fetch("http://localhost:2000/users/login", requestOptions)
        .then(response => response.json())
        .then(result => { return result })
        .catch(error => console.log('error', error));
}

registerNewWekanUser = (requestOptions) => {
    return "registerNewWekanUser is not implemented Yet";
}

tokenIsExpired = () => {
    const expireingDate = new Date(Admin.tokenExpires).getTime();
    const currentDate = Date.now();
    console.log(expireingDate, currentDate);
    if (expireingDate <= currentDate) {
        return true;
    } else {
        return false;
    }
}

module.exports.initApiKey = async () => {
    if (!Admin.token || tokenIsExpired()) {
        Admin.token = await requestApiToken();
        defaultRequestHeader.append("Authorization", Admin.token);
    }
}

module.exports.registerNewUser = async (username, email, password) => {
    console.log("registerNewUser user >>> ", username);
    console.log("registerNewUser defaultRequestHeader >>> ", defaultRequestHeader);

    //prepare request
    const urlencoded = new URLSearchParams();
    urlencoded.append("username", username);
    urlencoded.append("email", email);
    urlencoded.append("password", password);

    const requestOptions = {
        method: 'POST',
        headers: defaultRequestHeader,
        body: urlencoded,
        redirect: 'follow'
    };

    let response = await registerNewWekanUser(requestOptions);
    console.log(response);
}