const runScript = require("./runScripts");

function getEthercalcEntries() {
    return runScript("server_get_ethercalc.sh", true, false).split("\n");
}

module.exports = getEthercalcEntries;