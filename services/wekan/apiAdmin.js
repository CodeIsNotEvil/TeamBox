const { WEKAN_SECRET } = require('../../config/untracked');

module.exports.Admin = {
    "username": "admin",
    "password": WEKAN_SECRET,
    "email": "admin@TeamBox.local",
    "token": null,
    "tokenExpires": null
};