const runScript = require("./runScripts");

function getEtherpadEntries() {
    let data = runScript("server_get_etherpad.sh", true, false).split("\n");
    if (data.length > 0) {
        if (data[0].indexOf("server_get_etherpad.sh") >= 0) {
            data.splice(0, 1);
        }
    }
    data = data.filter(EmptyStringFilter);
    data = uniqifyArray(data);
    return data;
}

function EmptyStringFilter(element) {
    return element != '';
}

function uniqifyArray(array) {
    var seen = {};
    return array.filter(function (item) {
        return seen.hasOwnProperty(item) ? false : (seen[item] = true);
    });
}

module.exports = getEtherpadEntries;