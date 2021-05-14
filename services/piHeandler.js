const { PATH_TO_BASH_SCRIPTS, PATH_TO_GLOBAL_MODULES } = require("../config/server");
const syncExec = require(PATH_TO_GLOBAL_MODULES + 'sync-exec');

/**
 * Shut the RaspberryPi Down.
 */
const shutdownPi = () => {
        let isError = syncExec(PATH_TO_BASH_SCRIPTS + "group_delete.sh && sudo shutdown").stderr;

        if (isError == "" && isError != null) {
                console.log("EXEC :: SHUTDOWNPI:\t\tSUCCESS");
        }
        else {
                console.log("EXEC :: SHUTDOWNPI:\t\tERROR: \n" + isError);
        }
}

const rebootPi = () => {
        let isError = syncExec("sudo reboot").stderr;

        if (isError == "" && isError != null) {
                console.log("EXEC :: REBOOTPI:\t\tSUCCESS");
        }
        else {
                console.log("EXEC :: REBOOTPI:\t\tERROR: \n" + isError);
        }
}

module.exports = {
        shutdownPi,
        rebootPi
}