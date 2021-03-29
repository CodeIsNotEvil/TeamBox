const { PATH_TO_GLOBAL_MODULES } = require("../config/server");
const { exportMysqlAsync, exportMysql } = require("./mysqlHandler");
const syncExec = require(PATH_TO_GLOBAL_MODULES + 'sync-exec');
const Group = require('./Group');
const { exportWekanDB } = require("./mongoDBHandler");

/**
 * Exports the Groups Databases Syncron
 * This will be used before system shutdown to export the latest Data.
 * @returns {boolean} wether the export were successfull or not.
 */
function exportData() {
        if (!exportMysql()) {
                console.error("MySQL DBs could not be exported.");
                return false;
        }
        if (!exportWekanDB()) {
                console.error("Wekan DB could not be exported.");
                return false;
        }
        return true;
}

/**
 * Exports the MySQL Databases asyncron.
 */
function exportAsync() {
        setInterval(function () {
                if (Group.mysqlIsImported == true) {
                        exportMysqlAsync();
                }
        }, 120000);
}

/**
 * Synchronize pi's server time by getting is from the first client who creates the group
 * @param {Date} dateDate The actual Date.
 * @param {Date} dateTime The actual Time.
 */
function synchronizeTime(dateDate, dateTime) {
        var success = syncExec("sudo date +%Y%m%d -s '" + dateDate + "'");

        if (success) {
                console.log("EXEC ::\tSyncronized date:\t" + dateDate);
        }
        else {
                console.log("EXEC ::\tCould not synchronize date:\t" + dateDate);
        }

        success = syncExec("sudo date +%T -s '" + dateTime + "'");

        if (success) {
                console.log("EXEC ::\tSyncronized time:\t" + dateTime);
        }
        else {
                console.log("EXEC ::\tCould not synchronize time:\t" + dateTime);
        }
}

module.exports = {
        exportData,
        exportAsync,
        synchronizeTime
};
