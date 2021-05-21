const { requireFolder } = require("../../utils/fsUtils");
const Group = require("../../models/Group");
const asyncExec = require('child_process').exec;
const PORT = "8080";
// All interfaces port 8080 is only accessable over wlan0 anyways
// to look that up run sudo ufw status
const ADDRESS = "0.0.0.0";
//It would be better to use something linke http header auth
const AUTH_METHODE = "noauth";

module.exports.startFileBrowser = async () => {
    let path = await getGroupFilesPath();
    requireFolder(path);
    startFileBrowserAtPath(`${path}/`);
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

getGroupFilesPath = async () => {
    let group = await Group.findOne({ isActive: true });
    return `${group.usbPath}/files`;
}

configureAuthMethode = () => {
    asyncExec(`sudo /usr/local/bin/filebrowser config set --auth.method=${AUTH_METHODE}`, (error, stdout, stderr) => {
        if (error || stderr) {
            console.error(stderr);
        }
    });
}