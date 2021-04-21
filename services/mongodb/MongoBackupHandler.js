const { PATH_TO_GLOBAL_MODULES } = require("../../config/server");
const fs = require('fs');
const Group = require('../Group');
const MongoDBs = require('./MongoDBs');
const asyncExec = require('child_process').exec;
const SYNC_EXEC = require(PATH_TO_GLOBAL_MODULES + 'sync-exec');

class MongoBackupHandler {

    static imported = [];

    /**
     * Checks if the Selected Group has already a Database,
     * wich should be stored on the USB Stick at the folder of that Group
     * @returns {boolean} true if the group has a wekan database and false if not.
     */
    static hasSelectedGroupDB(dbName) {
        try {
            fs.readdirSync(`/media/USB-TeamBox/TeamBox/${Group.group}/.meta/${dbName}Backup/${dbName}`);
            return true;
        } catch (error) {
            //console.debug(error);
            return false;
        } finally {
            fs.close;
        }
    }

    static isImported(dbName) {
        if (MongoBackupHandler.imported.indexOf(dbName) > -1) {
            return true;
        }
        return false;
    }

    static import(dbName) {
        if (MongoBackupHandler.hasSelectedGroupDB(dbName)) {
            let error = SYNC_EXEC(`sudo mongorestore --drop /media/USB-TeamBox/TeamBox/${Group.group}/.meta/${dbName}Backup/`).stderr;
            if (error == "") {
                if (!MongoBackupHandler.isImported(dbName)) {
                    console.log(`${dbName} was impoted successfully`);
                    MongoBackupHandler.imported.push(dbName);
                } else {
                    console.log(`${dbName} was already Imported`);
                }
                //Group.wekanDBIsImported = true;
            } else {
                console.error(error);
                return false;
            }
        } else {
            console.log(`The ${dbName} Database either not exists or is not associated with this group.`);
            if (dbName === MongoDBs.Wekan) { //Special case for wekan 
                console.log(`Importing empty ${dbName} Database...`);
                let error = SYNC_EXEC("sudo mongorestore --drop /home/ubuntu/files").stderr;
                if (error == "") {
                    //Group.wekanDBIsImported = true;
                    if (!MongoBackupHandler.isImported(dbName)) {
                        console.log(`A Empty version of the ${dbName} database was imported successfully`);
                        MongoBackupHandler.imported.push(dbName);
                    } else {
                        console.log(`${dbName} was already Imported`);
                    }
                } else {
                    console.error(error);
                    return false;
                }
            } else {
                let error = SYNC_EXEC(`sudo mongo ${dbName} --eval "db.dropDatabase()"`).stderr;
                if (error == "") {
                    if (!MongoBackupHandler.isImported(dbName)) {
                        console.log(`A Empty version of the ${dbName} database was imported successfully`);
                        MongoBackupHandler.imported.push(dbName);
                    } else {
                        console.log(`${dbName} was already Imported`);
                    }
                } else {
                    console.error(error);
                    return false;
                }
            }

        }
        return true;
    }

    static exportSync(dbName) {
        let error = SYNC_EXEC(`sudo mongodump --db=${dbName} --out=/media/USB-TeamBox/TeamBox/${Group.group}/.meta/${dbName}Backup/`).stderr;
        if (error == "") {
            /* let index = MongoBackupHandler.imported.indexOf(dbName);
             MongoBackupHandler.imported.splice(index, 1); */
            //Group.DrawPadDBIsImported = false;
            console.log(`${dbName} Database was exported Successfully.`);
            return true;
        } else {
            console.error(error);
            return false;
        }
    }

    static exportAsync(dbName) {
        if (MongoBackupHandler.isImported(dbName)) {
            asyncExec(`sudo mongodump --db=${dbName} --out=/media/USB-TeamBox/TeamBox/${Group.group}/.meta/${dbName}Backup/`, (err, stdout, stderr) => {
                if (err == null) {
                    console.log(`${dbName} Database was exported Successfully.`)
                    return true;
                } else {
                    console.error(error);
                    return false;
                }
            });
        } else {
            console.log(`${dbName} Database was not Imported, export canceled.`)
        }
    }

    static importAllDBs() {
        for (let dbName in MongoDBs) {
            MongoBackupHandler.import(MongoDBs[dbName]);
        }
    }

    static exportAllDBsAsync() {
        for (let dbName in MongoDBs) {
            MongoBackupHandler.exportAsync(MongoDBs[dbName]);
        }
    }

    static exportAllDBsSync() {
        for (let dbName in MongoDBs) {
            if (!MongoBackupHandler.exportSync(MongoDBs[dbName])) {
                return false;
            }
        }
        return true;
    }
}

module.exports = MongoBackupHandler;