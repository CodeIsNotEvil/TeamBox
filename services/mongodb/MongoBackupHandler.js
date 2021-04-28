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

    static handleImportError(dbName, error) {
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
    }

    static importEmptyWekanDB(dbName) {
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
    }

    static cleanUpDatabase(dbName) {
        if (dbName === MongoDBs.Wekan) { //Special case for wekan 
            if (!MongoBackupHandler.importEmptyWekanDB(dbName)) {
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
        return true
    }

    static import(dbName) {
        if (MongoBackupHandler.hasSelectedGroupDB(dbName)) {
            let error = SYNC_EXEC(`sudo mongorestore --drop /media/USB-TeamBox/TeamBox/${Group.group}/.meta/${dbName}Backup/`).stderr;
            return MongoBackupHandler.handleImportError(dbName, error);
        } else {
            console.log(`The ${dbName} Database either not exists or is not associated with this group.`);
            if (!MongoBackupHandler.cleanUpDatabase(dbName)) {
                return false;
            }
        }
        return true;
    }

    static cleanUpCollections(db) {
        let error = "";
        for (let index = 0; index < db.exclusivelyExport.length; index++) {
            const element = db.exclusivelyExport[index];
            error += SYNC_EXEC(`sudo mongo ${db.name} --eval "db.${element}drop()"`).stderr;
        }
        if (error == "") {
            if (!MongoBackupHandler.isImported(db.name)) {
                console.log(`A Empty version of the ${db.name} database was imported successfully`);
                MongoBackupHandler.imported.push(db.name);
            } else {
                console.log(`${db.name} was already Imported`);
            }
        } else {
            console.error(error);
            return false;
        }
        return true
    }

    static importCollectionArray(db) {
        if (MongoBackupHandler.hasSelectedGroupDB(db.name)) {
            let error = SYNC_EXEC(`sudo mongorestore --drop /media/USB-TeamBox/TeamBox/${Group.group}/.meta/${db.name}Backup/`).stderr;
            return MongoBackupHandler.handleImportError(db.name, error);
        } else {
            console.log(`The ${db.name} Database either not exists or is not associated with this group.`);
            if (!MongoBackupHandler.cleanUpCollections(db)) {
                return false;
            }
        }
        return true;
    }

    static handleExportError(dbName, error) {
        if (error == null || error == "") {
            console.log(`${dbName} Database was exported Successfully.`)
            return true;
        }
        console.error(error);
        return false;
    }

    static exportSync(dbName) {
        let error = SYNC_EXEC(`sudo mongodump --db=${dbName} --out=/media/USB-TeamBox/TeamBox/${Group.group}/.meta/${dbName}Backup/`).stderr;
        return MongoBackupHandler.handleExportError(dbName, error);
    }

    static exportCollectionArraySync(db) {
        let error = "";
        for (let index = 0; index < db.exclusivelyExport.length; index++) {
            const element = db.exclusivelyExport[index];
            error += SYNC_EXEC(`sudo mongodump --collection=${element}s --db=${db.name} --out=/media/USB-TeamBox/TeamBox/${Group.group}/.meta/${db.name}Backup/`).stderr;
        }
        return MongoBackupHandler.handleExportError(db.name, error);
    }

    static exportAsync(dbName) {
        if (MongoBackupHandler.isImported(dbName)) {
            asyncExec(`sudo mongodump --db=${dbName} --out=/media/USB-TeamBox/TeamBox/${Group.group}/.meta/${dbName}Backup/`, (err, stdout, stderr) => {
                return MongoBackupHandler.handleExportError(dbName, err);
            });
        } else {
            console.log(`${dbName} Database was not Imported, export canceled.`)
        }
    }

    static exportCollectionArrayAsync(db) {
        if (MongoBackupHandler.isImported(db.name)) {
            db.exclusivelyExport.forEach(element => {
                asyncExec(`sudo mongodump --collection=${element}s --db=${db.name} --out=/media/USB-TeamBox/TeamBox/${Group.group}/.meta/${db.name}Backup/`, (err, stdout, stderr) => {
                    if (!MongoBackupHandler.handleExportError(db.name, err)) {
                        return false;
                    }
                });
            });
        } else {
            console.log(`${db.name} Database was not Imported, export canceled.`)
        }
    }

    static importAllDBs() {
        for (let dbName in MongoDBs) {
            if (MongoDBs[dbName].name && MongoDBs[dbName].exclusivelyExport) {
                MongoBackupHandler.importCollectionArray(MongoDBs[dbName]);
            } else {
                MongoBackupHandler.import(MongoDBs[dbName]);
            }

        }
    }

    static exportAllDBsAsync() {
        for (let dbName in MongoDBs) {

            if (MongoDBs[dbName].name && MongoDBs[dbName].exclusivelyExport) {
                MongoBackupHandler.exportCollectionArrayAsync(MongoDBs[dbName]);
            }

            if (!MongoDBs[dbName].name) {
                MongoBackupHandler.exportAsync(MongoDBs[dbName]);
            }
        }
    }

    static exportAllDBsSync() {
        for (let dbName in MongoDBs) {
            if (MongoDBs[dbName].name && MongoDBs[dbName].exclusivelyExport) {
                if (!MongoBackupHandler.exportCollectionArraySync(MongoDBs[dbName])) {
                    return false;
                }
            } else {
                if (!MongoBackupHandler.exportSync(MongoDBs[dbName])) {
                    return false;
                }
            }
        }
        return true;
    }

}

module.exports = MongoBackupHandler;