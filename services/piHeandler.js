const { PATH_TO_BASH_SCRIPTS, PATH_TO_GLOBAL_MODULES } = require("../config/server");
const syncExec = require(PATH_TO_GLOBAL_MODULES + 'sync-exec');

/**
 * Shut the RaspberryPi Down.
 */
function shutdownPi() {
        let isError = syncExec(PATH_TO_BASH_SCRIPTS + "group_delete.sh && sudo shutdown now").stderr;

        if (isError == "" && isError != null) {
                console.log("EXEC :: SHUTDOWNPI:\t\tSUCCESS");
        }
        else {
                console.log("EXEC :: SHUTDOWNPI:\t\tERROR: \n" + isError);
        }
}

module.exports = {
        shutdownPi
}