const { PATH_TO_EMPTY_DBS } = require('../../config/server');
const { requireFolder, appendDateToFileName, extractDateFromFileName } = require("../../utils/fsUtils");
const SYNC_EXEC = require('sync-exec');
const Group = require("../../models/Group");
const fs = require('fs');
const MariaDBs = require("./MariaDBs");
const connectionData = require('./connectionData');

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
    let runToExportDB = `mysqldump --user=${connectionData.user} --password=${connectionData.password} ${dbName} > ${path}/${filename}.sql`;
    let error = SYNC_EXEC(`sudo ${runToExportDB}`).stderr;
    return error;
}

const exportMySQLDB = (dbName, usbPath) => {
    let path = `${usbPath}/.meta/sql/${dbName}Backup`;
    console.log(path)
    if (requireFolder(path)) {
        let error = executeMySQLDump(dbName, path);
        return error;
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
    let execMySQLImportString = `mysql --user=${connectionData.user} --password=${connectionData.password} ${dbName} < "${latestBackupWithPath}"`;
    let error = SYNC_EXEC(`sudo ${execMySQLImportString}`).stderr;
    return error;
}

const importMySQLDB = async (dbName) => {
    let path = await getExportPath(dbName);
    if (requireFolder(path)) {
        let latestBackup = getlatestBackup(path);
        let error = executeMySQLImport(dbName, `${path}/${latestBackup}`);
        if (error) {
            let exp = new RegExp(": 1: cannot open [\\/\\w\\-\\.]*: No such file", 'gm');
            let errorMessage = error.toString().match(exp)[0];
            if (errorMessage) {
                executeMySQLImport(dbName, `${PATH_TO_EMPTY_DBS}/${dbName}_emptyDB.sql`);
                return `${dbName}_emptyDB`;
            } else {
                throw new Error(error);
            }
        } else {
            return latestBackup;
        }
    }
}

const importAllMySQLDBs = async () => {
    try {
        for (let dbName in MariaDBs) {
            let latestBackup = await importMySQLDB(MariaDBs[dbName]);
            console.log(`imported ${latestBackup} successfully`);
        }
    } catch (error) {
        return error;
    }
}

const exportAllMySQLDBs = (usbPath) => {
    for (let dbName in MariaDBs) {
        let error = exportMySQLDB(MariaDBs[dbName], usbPath);
        if (error) {
            return error;
        }
    }
}

module.exports = {
    getExportPath,
    exportMySQLDB,
    importMySQLDB,
    importAllMySQLDBs,
    exportAllMySQLDBs

}