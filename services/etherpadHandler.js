const runScript = require("./runScripts");

function getEtherpadEntries() {
    let data = runScript("server_get_etherpad.sh", true, false).split("\n");
    if (data[0].indexOf("server_get_etherpad.sh") >= 0) {
            data.splice(0, 1);
    }

    return data;
}

module.exports = getEtherpadEntries;