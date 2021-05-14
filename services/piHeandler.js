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
        let isError = syncExec(PATH_TO_BASH_SCRIPTS + "group_delete.sh && sudo shutdown -r").stderr;

        if (isError == "" && isError != null) {
                console.log("EXEC :: REBOOTPI:\t\tSUCCESS");
        }
        else {
                console.log("EXEC :: REBOOTPI:\t\tERROR: \n" + isError);
        }
}

const clearAllData = () => {
        let isError = syncExec('mongo TeamBox --eval "db.dropDatabase()" && sudo rm -rf /media/USB-TeamBox/TeamBox/').stderr;

        if (isError == "" && isError != null) {
                console.log("EXEC :: CLEAR_ALL_DATA:\t\tSUCCESS");
        }
        else {
                console.log("EXEC :: CLEAR_ALL_DATA:\t\tERROR: \n" + isError);
        }
}

module.exports = {
        shutdownPi,
        rebootPi,
        clearAllData
}