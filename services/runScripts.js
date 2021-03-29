const { PATH_TO_BASH_SCRIPTS, PATH_TO_GLOBAL_MODULES } = require("../config/server");
const SYNC_EXEC = require(PATH_TO_GLOBAL_MODULES + 'sync-exec');

/**
 * This will synchonously run the defined script
 * @param {The name of the script} name 
 * @param {True if the script needs root prvillages} rootPrvillages 
 * @param {If it is true return stderr if it is false returns stdout} err 
 * @returns {Standart error}
 */
function runScript(name, rootPrvillages , err) {
    if (err == true) {
        if (rootPrvillages == true) {
            return SYNC_EXEC("sudo bash " + PATH_TO_BASH_SCRIPTS + name).stderr;
        } else {
            return SYNC_EXEC("bash " + PATH_TO_BASH_SCRIPTS + name).stderr;
        }
    } else {
        if (rootPrvillages == true) {
            return SYNC_EXEC("sudo bash " + PATH_TO_BASH_SCRIPTS + name).stdout;
        } else {
            return SYNC_EXEC("bash " + PATH_TO_BASH_SCRIPTS + name).stdout;
        }
    }
    
}

module.exports = runScript;