const { PATH_TO_GLOBAL_MODULES } = require("../config/server");
const groupHandler = require("./groupHandler");
const { exportMysqlAsync } = require("./mysqlHandler");
const syncExec = require(PATH_TO_GLOBAL_MODULES + 'sync-exec');

function exportAsync() {
        setInterval(function () {
                if (groupHandler.mysqlIsImported == true) {
                        exportMysqlAsync();
                }
        }, 120000);
}


// synchronize pi's server time by getting is from the first client who creates the group
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

module.exports = synchronizeTime;
module.exports = exportAsync;