const { PATH_TO_GLOBAL_MODULES, PATH_TO_BASH_SCRIPTS } = require('../config/server');
const mysql = require(PATH_TO_GLOBAL_MODULES + 'mysql');
const asyncExec = require('child_process').exec;
const Group = require('./Group');
const user = require('../models/MySQLUser');
const { importAllMySQLDBs, exportAllMySQLDBs } = require("./mariadb/mariaBackupHandler");
const runScript = require('./runScripts');
const connectionData = require('./mariadb/connectionData');

let mysqlConnection = mysql.createConnection(connectionData);

/**
 * Imports dataAppDraw, dataAppMindmap and userData MySQL databases.
 * @returns {boolean} true if the import was successfull
 */
const importMysql = async () => {
    console.log("-----------------------------------------------");
    console.log("# started to import all mysql DBs             #");
    let error = await importAllMySQLDBs();
    if (error) {
        console.log("# error occured while importing all mysql DBs #");
        console.log("-----------------------------------------------");
        console.error(error);
        return false;
    } else {
        createOrFixTables();
        console.log("# imported all mysql DBs                      #");
        console.log("-----------------------------------------------\n\n");
        return true;
    }

}

const createOrFixTables = () => {
    mysqlConnection.query("CREATE TABLE IF NOT EXISTS dataAppMindmap (id int NOT NULL AUTO_INCREMENT, fileName VARCHAR(50), content TEXT, PRIMARY KEY(id,fileName) )");
    mysqlConnection.query("ALTER TABLE dataAppMindmap ADD UNIQUE (fileName)");
    mysqlConnection.query("CREATE TABLE IF NOT EXISTS userData (id int NOT NULL AUTO_INCREMENT, user VARCHAR(20), color VARCHAR(25), language VARCHAR(10), ip VARCHAR(20), PRIMARY KEY(id,user) )");
    mysqlConnection.query("ALTER TABLE userData ADD UNIQUE (user)");
}
/**
 * Exports the MySQL Databases with the help of the mysql_export.sh script.
 * @returns {boolean} wether the export was succsessfull or not.
 */
function exportMysql(usbPath) {
    let error = exportAllMySQLDBs(usbPath);
    if (error) {
        console.error("exportMysql >>> error while exporting");
        console.error(error + "\n");
        return false;
    } else {
        Group.mysqlIsImported = false;
        console.log("exportMysql >>> successfully Exported MySQLDBs\n");
        return true;
    }
}
/**
 * Exports the MySQL Databases with the help of the mysql_export.sh script.
 * @returns {boolean} wether then export was successfull.
 */
async function exportMysqlAsync(usbPath) {
    let error = exportAllMySQLDBs(usbPath);
    if (error) {
        console.error("exportMysql >>> error while exporting");
        console.error(error + "\n");
        return false;
    } else {
        console.log("exportMysql >>> successfully Exported MySQLDBs\n");
        return true;
    }
}
/**
 * Drops the dataAppMindmap and userData Tables from the MySQL Databases. 
 */
function startUp() {
    mysqlConnection.query("DROP TABLE IF EXISTS `dataAppMindmap`");
    mysqlConnection.query("DROP TABLE IF EXISTS `userData`");
    mysqlConnection.query("DROP TABLE IF EXISTS `dataAppDraw`");
}

function getMindMapContentFromDB(fileName, emitContent) {
    mysqlConnection.query("SELECT * FROM dataAppMindmap WHERE fileName = '" + fileName + "' ", function (err, result, fields) {
        if (err) {
            console.error(err);
        } else {
            let content, newFile;
            if (result.length > 0) {
                content = "<data name='" + fileName + "'>" + result[0].content + "</data>";
            } else {
                content = "<data name='" + fileName + "'><node id='0' posx='0' posy='0' type='root' width='120' height='30' text='' color='#2b2b2b'></node></data>";
                newFile = true;
            }
            emitContent(content, newFile);
        }

    });
}

function writeMindmap(content, fileName) {

    mysqlConnection.query("INSERT IGNORE INTO dataAppMindmap (fileName) VALUES ('" + fileName + "')", function (err, rows, fields) {
        if (err) {
            console.error(err);
        }
    });
    mysqlConnection.query("UPDATE dataAppMindmap SET content = '" + content + "'    WHERE fileName =  '" + fileName + "'    ", function (err, rows, fields) {
        if (err) {
            console.error(err);
        }
    });
}

function getMySQLConnection() {
    return mysqlConnection;
}

module.exports = {
    startUp,
    importMysql,
    exportMysql,
    exportMysqlAsync,
    writeMindmap,
    getMindMapContentFromDB,
    getMySQLConnection
};