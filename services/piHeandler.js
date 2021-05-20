const { PATH_TO_BASH_SCRIPTS } = require("../config/server");
const syncExec = require('sync-exec');

/**
 * Shut the RaspberryPi Down.
 */
const shutdownPi = () => {
        let isError = syncExec(PATH_TO_BASH_SCRIPTS + "group_delete.sh && sudo shutdown").stderr;

        if (isError == "" && isError != null) {
                console.log("\nEXEC :: SHUTDOWNPI:\t\tSUCCESS\n\n");
        }
        else {
                console.log("\nEXEC :: SHUTDOWNPI:\t\tERROR: \n" + isError);
        }
}

const rebootPi = () => {
        let isError = syncExec(PATH_TO_BASH_SCRIPTS + "group_delete.sh && sudo shutdown -r").stderr;

        if (isError == "" && isError != null) {
                console.log("\nEXEC :: REBOOTPI:\t\tSUCCESS\n\n");
        }
        else {
                console.log("\nEXEC :: REBOOTPI:\t\tERROR: \n" + isError);
        }
}

const clearAllData = () => {
        let clearActions = {
                dropTeamBoxMongoBD: 'mongo TeamBox --eval "db.dropDatabase()"',
                deleteUSBFiles: 'sudo rm -rf /media/USB-TeamBox/TeamBox/',
                removeAllLocalThumbnails: 'sudo rm -rf /home/ubuntu/app/public/screenshots/*.png && sudo rm -rf /home/ubuntu/app/public/drawings/*.png'
        }
        let assabledClearCommand = `${clearActions.dropTeamBoxMongoBD} && ${clearActions.deleteUSBFiles} && ${clearActions.removeAllLocalThumbnails}`;
        let isError = syncExec(assabledClearCommand).stderr;

        if (isError == "" && isError != null) {
                console.log("\nEXEC :: CLEAR_ALL_DATA:\t\tSUCCESS\n\n");
        }
        else {
                console.log("\nEXEC :: CLEAR_ALL_DATA:\t\tERROR: \n" + isError);
        }
}

module.exports = {
        shutdownPi,
        rebootPi,
        clearAllData
}