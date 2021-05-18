const { USB_PRE_PATH } = require("../../config/server");
const { mysqlConnectionData } = require("../mysqlHandler");
const { requireFolder, appendDateToFileName, extractDateFromFileName } = require("../../utils/fsUtils");
const runScript = require("../runScripts");
const SYNC_EXEC = require('sync-exec');
const Group = require("../../models/Group");
const fs = require('fs');

let dbName = "";


const getExportPath = async (dbName) => {
    if (dbName) {
        let group = await Group.findOne({ isActive: true });
        return `${group.usbPath}/.meta/sql/${dbName}Backup`;
    } else {
        throw new Error(`could not create path illegalArgument`);
    }
}

const executeMySQLDump = (dbName, path) => {
    let filename = appendDateToFileName(dbName);
    let runToExportDB = `mysqldump --user=${mysqlConnectionData.user} --password=${mysqlConnectionData.password} ${dbName} > ${path}/${filename}.sql`;
    let error = SYNC_EXEC(`sudo ${runToExportDB}`).stderr;
    return error;
}

const exportMySQLDB = async (dbName) => {
    let path = await getExportPath(dbName);
    if (requireFolder(path)) {
        let error = executeMySQLDump(dbName, path);
        return error;
    }
}

const exportForTheDBExsists = (dbName, path) => {
    console.log(path)
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

const getlatestBackup = (path) => {
    let maxBackups = 3;
    let files = fs.readdirSync(path);
    files.sort((fileA, fileB) => {
        let differenz = extractDateFromFileName(fileB.split('.')[0]).getTime() - extractDateFromFileName(fileA.split('.')[0]).getTime();
        return differenz;
    });
    while (files.length > maxBackups) {
        fs.unlinkSync(`${path}/${files.pop()}`);
    }
    return files[0];
}

const executeMySQLImport = (dbName, latestBackupWithPath) => {
    let execMySQLImportString = `mysql --user=${mysqlConnectionData.user} --password=${mysqlConnectionData.password} ${dbName} < "${latestBackupWithPath}"`;
    let error = SYNC_EXEC(`sudo ${execMySQLImportString}`).stderr;
    return error;
}
const importMySQLDB = async (dbName) => {
    let path = await getExportPath(dbName);
    if (requireFolder(path)) {
        let latestBackup = getlatestBackup(path);
        let error = executeMySQLImport(dbName, `${path}/${latestBackup}`);

        if (error) {
            console.log("importMySQLDB >>> ", error);
        } else {
            console.log("importMySQLDB >>> noError");
        }
        error = "importMySQLDB >>> NOT IMPLEMENTET YET";
        return error;
    }
}

module.exports = {
    getExportPath,
    exportMySQLDB,
    importMySQLDB
}