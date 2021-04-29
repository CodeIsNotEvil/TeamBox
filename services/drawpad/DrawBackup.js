const { PATH_TO_GLOBAL_MODULES } = require("../../config/server");
const Group = require("../Group");
const SYNC_EXEC = require(PATH_TO_GLOBAL_MODULES + 'sync-exec');
const MongoBackupHandler = require("../mongodb/MongoBackupHandler");

class DrawBackup {

    static export() {
        let error = SYNC_EXEC(`sudo mongodump --db=${databaseName} --out=/media/USB-TeamBox/TeamBox/${Group.group}/.meta/`).stderr;
        if (error == "") {
            Group.DrawPadDBIsImported = false;
            console.log(`${databaseName} Database was exported Successfully.`);
            return true;
        } else {
            console.error(error);
            return false;
        }
    }

    static import() {
        let databaseName = "DrawPad";
        if (MongoBackupHandler.hasSelectedGroupDB(databaseName)) {
            console.log(`The ${databaseName} Database exists and is associated with this group.\nImporting the ${databaseName} Database of this group...`);
            if (importGroupDB()) {
                console.log(`The ${databaseName} Database was imported.`);
            }
        } else {
            console.log(`The ${databaseName} Database either not exists or is not associated with this group.\nImporting empty ${databaseName} Database...`);
            //just drop the currentDB. 
            let error = SYNC_EXEC(`sudo mongo ${databaseName} --eval "db.dropDatabase()"`).stderr;
            if (error == "") {

            }

            return true;
        }
    }

    /**
    * Imports the Group specific Database.
    * @returns {boolean} Wether the import was successfully or not.
    */
    static importGroupDB() {
        let databaseName = "DrawPad";
        let error = SYNC_EXEC(`sudo mongorestore --drop /media/USB-TeamBox/TeamBox/${Group.group}/.meta/${databaseName}Backup/`).stderr;
        if (error == "") {
            Group.DrawPadDBIsImported = true;
        } else {
            console.error(error);
            return false;
        }
        return true;
    }
}

module.exports = DrawBackup;