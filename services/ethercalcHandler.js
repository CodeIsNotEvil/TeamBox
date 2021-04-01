const runScript = require("./runScripts");

class Ethercalc {
    static getEntries() {
        return runScript("server_get_ethercalc.sh", true, false).split("\n");
    }
}
module.exports = Ethercalc;
