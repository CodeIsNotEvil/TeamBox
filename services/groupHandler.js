const runScript = require('./runScripts');
const { importMysql } = require('./mysqlHandler');
const Group = require('./Group');
const Ethercalc = require('./ethercalc/ethercalcHandler');
const MongoBackupHandler = require('./mongodb/MongoBackupHandler');
const MongoDBs = require('./mongodb/MongoDBs');

class groupHandler {
    static importCheck() {
        if (Group.mysqlIsImported && MongoBackupHandler.isImported(MongoDBs.Wekan) && MongoBackupHandler.isImported(MongoDBs.TeamBox)) {
            return true;
        } else {
            return false;
        }
    }

    static async import() {
        Group.mysqlIsImported = await importMysql();
        Group.ethercalcIsImported = Ethercalc.importDump();
        MongoBackupHandler.importAllDBs();
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

    /**
     * Loads the group names form the folderNames on the USB-Stick.
     */
    static loadGroups() {
        let shellPrints = runScript("group_show.sh", false, false).split("\n");
        Group.groups.length = 0;
        shellPrints.forEach(print => {
            if (print === "Device mounted") {
                console.log("DEBUG: Device was mounted");

            } else {
                if (print !== '' && print !== null && print !== '.meta') {
                    Group.groups.push(print);
                }
            }
        });
        //Group.groups = runScript("group_show.sh", false, false).split("\n");
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