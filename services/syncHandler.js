const { PATH_TO_GLOBAL_MODULES } = require("../config/server");
const { exportMysqlAsync, exportMysql } = require("./mysqlHandler");
const syncExec = require(PATH_TO_GLOBAL_MODULES + 'sync-exec');
const Group = require('./Group');
const { exportWekanDB } = require("./mongoDBHandler");
const Ethercalc = require("./ethercalc/ethercalcHandler");
const MongoBackupHandler = require("./mongodb/MongoBackupHandler");

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
        if (!MongoBackupHandler.exportAllDBsSync()) {
                return false;
        }
        if (!Ethercalc.exportDump()) {
                console.error("Ethercalc Dump could not be exported.");
                return false;
        }
        return true;
}

/**
 * Exports the MySQL Databases asyncron.
 */
function exportAsync() {
        setInterval(function () {
                console.log("Asynchron Database exports:");
                if (Group.mysqlIsImported == true) {
                        exportMysqlAsync();
                } else {
                        console.log("MysqlDB was not exported, there were never imported one for this group");
                }

                MongoBackupHandler.exportAllDBsAsync();

                if (Group.ethercalcIsImported == true) {
                        let success = Ethercalc.exportDump(); //NOTE: this call is not Async
                        if (success) {
                                console.log("Ethercalc Dump was exported Successfully.");
                        }
                } else {
                        console.log("The Ethercalc dump was not exported, there were never imported one for this group");
                }

        }, 120000);//120000ms = 2minutes
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
