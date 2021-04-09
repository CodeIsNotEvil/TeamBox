const { PATH_TO_GLOBAL_MODULES } = require("../../config/server");
const Group = require("../Group");
const SYNC_EXEC = require(PATH_TO_GLOBAL_MODULES + 'sync-exec');
const asyncExec = require('child_process').exec;
const PORT = "8080";
const ADDRESS = "0.0.0.0"; //All interfaces
const AUTH_METHODE = "noauth";

class fileBrowser {
    static startfilebrowser() {
        let path = `/media/USB-TeamBox/TeamBox/${Group.group}/files/`;
        //start filebrowser at the groups folder
        asyncExec(`sudo /usr/local/bin/filebrowser -r ${path} -a ${ADDRESS} -p ${PORT}`, (error, stdout, stderr) => {
            if (error) {
                console.log(stderr);
            } else {
                console.log(stdout);
                
                //Configure Authentification
                asyncExec(`sudo /usr/local/bin/filebrowser config set --auth.method=${AUTH_METHODE}`, (error, stdout, stderr) => {
                    if (error || stderr) {
                        console.log(stderr);
                    } else {
                        console.log(stdout);
                    }
                });
            }
        });
        //SYNC_EXEC(`sudo /usr/local/bin/filebrowser -r ${path} -a ${ADDRESS} -p ${PORT}`).stdout;
    }
}

module.exports = fileBrowser;