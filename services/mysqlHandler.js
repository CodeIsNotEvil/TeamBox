const { PATH_TO_GLOBAL_MODULES, PATH_TO_BASH_SCRIPTS } = require('../config/server');
const mysql = require(PATH_TO_GLOBAL_MODULES + 'mysql');
const asyncExec = require('child_process').exec;
const Group = require('./Group');
const user = require('../models/MySQLUser');
const { importAllMySQLDBs } = require("./mariadb/mariaBackupHandler");
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
        mysqlConnection.query("CREATE TABLE IF NOT EXISTS dataAppMindmap (id int NOT NULL AUTO_INCREMENT, fileName VARCHAR(50), content TEXT, PRIMARY KEY(id,fileName) )");
        mysqlConnection.query("ALTER TABLE dataAppMindmap ADD UNIQUE (fileName)");
        mysqlConnection.query("CREATE TABLE IF NOT EXISTS userData (id int NOT NULL AUTO_INCREMENT, user VARCHAR(20), color VARCHAR(25), language VARCHAR(10), ip VARCHAR(20), PRIMARY KEY(id,user) )");
        mysqlConnection.query("ALTER TABLE userData ADD UNIQUE (user)");

        console.log("# imported all mysql DBs                      #");
        console.log("-----------------------------------------------");
        return true;
    }

}
/**
 * Exports the MySQL Databases with the help of the mysql_export.sh script.
 * @returns {boolean} wether the export was succsessfull or not.
 */
function exportMysql() {
    //io.sockets.emit('appExportMysqlStart');

    var isError = runScript("mysql_export.sh", true, true);

    if (isError == "" && isError != null) {
        console.log("EXEC :: EXPORTMYSQL:\t\tSUCCESS");
        //io.sockets.emit('appExportMysqlEnd');
        Group.mysqlIsImported = false;
        return true;
    } else {
        console.log("EXEC :: EXPORTMYSQL:\t\tERROR: \n" + isError);
        //io.sockets.emit('appExportMysqlEnd');
        return false;
    }
}
/**
 * Exports the MySQL Databases with the help of the mysql_export.sh script.
 * @returns {boolean} wether then export was successfull.
 */
function exportMysqlAsync() {
    asyncExec("sudo bash " + PATH_TO_BASH_SCRIPTS + "mysql_export.sh", (err, stdout, stderr) => {
        if (err == null) {
            console.log("MySQL Databases were exported Successfully.")
            return true;
        } else {
            console.error(error);
            return false;
        }
    });
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