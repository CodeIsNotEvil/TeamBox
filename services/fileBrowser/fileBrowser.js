const Group = require("../Group");
const asyncExec = require('child_process').exec;
const PORT = "8080";
const ADDRESS = "0.0.0.0"; //All interfaces
const AUTH_METHODE = "noauth";

module.exports.startFileBrowser = () => {
    let path = getGroupFilesPath();
    startFileBrowserAtPath(path);
    console.debug(`FileBrowser started at ${ADDRESS}:${PORT} at the path: ${path}`);
}

startFileBrowserAtPath = (path) => {
    asyncExec(`sudo /usr/local/bin/filebrowser -r ${path} -a ${ADDRESS} -p ${PORT}`, (error, stdout, stderr) => {
        if (error) {
            console.error(stderr);
        } else {
            configureAuthMethode();
        }
    });
}

getGroupFilesPath = () => {
    return `/media/USB-TeamBox/TeamBox/${Group.group}/files/`;
}

configureAuthMethode = () => {
    asyncExec(`sudo /usr/local/bin/filebrowser config set --auth.method=${AUTH_METHODE}`, (error, stdout, stderr) => {
        if (error || stderr) {
            console.error(stderr);
        }
    });
}