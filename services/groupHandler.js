const runScript = require('./runScripts');
const { importMysql } = require('./mysqlHandler');
const { importGroupWekanDB } = require('./mongoDBHandler');
const Group = require('./Group');

class groupHandler {
    static importCheck() {
        if (Group.mysqlIsImported && Group.wekanDBIsImported) {
            return true;
        } else if (Group.mysqlIsImported) {
            return false;
        } else if (Group.wekanDBIsImported) {
            return false;
        } else {
            return false;
        }
    }

    static import() {
        Group.mysqlIsImported = importMysql();
        Group.ekanDBIsImported = importGroupWekanDB();
    }

    static isGroupSelected(bodyGroup) {
        Group.group = bodyGroup.replace(/[^a-z0-9-_\s]/gi, '').replace(/\s+/g, "_").toLowerCase();

        let groupExists = false;

        for (let i = 0; i < Group.groups.length; i++) {
            if (Group.groups[i].toString() == Group.group.toString()) {
                groupExists = true;
            }
        }
        if (groupExists) {
            groupHandler.chooseGroup();
        }
        else {
            groupHandler.createGroup();
        }
        return true;
    }

    static loadGroups() {
        Group.groups = runScript("group_show.sh", false, false).split("\n");
    }

    static chooseGroup() {

        let isError = runScript("group_choose.sh '" + Group.group + "'", true, true);
        if (isError == "" && isError != null) {
            console.log("EXEC :: CHOOESEGROUP:\t\tSUCCESS");
        }
        else {
            console.error(); ("EXEC :: CHOOESEGROUP:\t\tERROR: \n" + isError);
        }
    }
    static createGroup() {

        let isError = runScript("group_create.sh '" + Group.group + "'", true, true);
        if (isError == "" && isError != null) {
            console.log("EXEC :: CREATEGROUP:\t\tSUCCESS");
        }
        else {
            console.error("EXEC :: CREATEGROUP:\t\tERROR: \n" + isError);
        }
    }
}

module.exports = groupHandler;

/*
let group = "";
let groupIsFromUsb = false;
let groupIsSelected = false;
let groupIsSelectedPi = false;
let mySqlIsImported = false;
let groups = [];
let clients = [];
let illegalClients = [];
illegalClients.push("admin");
illegalClients.push("administrator");
illegalClients.push("ubuntu");
illegalClients.push("root");
illegalClients.push("teambox");

module.exports = function loadGroups() {
    groups = [];

    groups = syncExec("bash " + PATH_TO_BASH_SCRIPTS + "group_show.sh").stdout.split("\n");
}


function chooseGroup() {
    var isError = syncExec("sudo bash " + PATH_TO_BASH_SCRIPTS + "group_choose.sh '" + group + "'").stderr;

    if (isError == "" && isError != null) {
            console.log("EXEC :: CHOOESEGROUP:\t\tSUCCESS");
    }
    else {
            console.log("EXEC :: CHOOESEGROUP:\t\tERROR: \n" + isError);
    }
}


function createGroup() {
    var isError = syncExec("sudo bash " + PATH_TO_BASH_SCRIPTS + "group_create.sh '" + group + "'").stderr;

    if (isError == "" && isError != null) {
            console.log("EXEC :: CREATEGROUP:\t\tSUCCESS");
    }
    else {
            console.log("EXEC :: CREATEGROUP:\t\tERROR: \n" + isError);
    }
}
*/