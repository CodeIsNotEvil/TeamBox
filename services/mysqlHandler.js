const { PATH_TO_GLOBAL_MODULES, PATH_TO_BASH_SCRIPTS } = require('../config/server');
const mysql = require(PATH_TO_GLOBAL_MODULES + 'mysql');
const asyncExec = require('child_process').exec;

const user = require('../models/MySQLUser');

const runScript = require('./runScripts');


let mysqlConnection = mysql.createConnection({
    host: 'localhost',
    user: 'TeamBox',
    database: 'TeamBox',
    password: 'yourPassword'
});

/**
 * Imports dataAppDraw, dataAppMindmap and userData MySQL databases.
 * @returns true if the import was successfull
 */
function importMysql() {

    let isError = runScript("mysql_import.sh", true, true);
    if (isError == "" && isError != null) {
        mysqlConnection.query("CREATE TABLE IF NOT EXISTS dataAppDraw (id int NOT NULL AUTO_INCREMENT, fileName VARCHAR(50), content LONGTEXT, PRIMARY KEY(id,fileName) )");
        mysqlConnection.query("ALTER TABLE dataAppDraw ADD UNIQUE (fileName)");
        mysqlConnection.query("CREATE TABLE IF NOT EXISTS dataAppMindmap (id int NOT NULL AUTO_INCREMENT, fileName VARCHAR(50), content TEXT, PRIMARY KEY(id,fileName) )");
        mysqlConnection.query("ALTER TABLE dataAppMindmap ADD UNIQUE (fileName)");
        mysqlConnection.query("CREATE TABLE IF NOT EXISTS userData (id int NOT NULL AUTO_INCREMENT, user VARCHAR(20), color VARCHAR(25), language VARCHAR(10), ip VARCHAR(20), PRIMARY KEY(id,user) )");
        mysqlConnection.query("ALTER TABLE userData ADD UNIQUE (user)");

        console.log("EXEC :: IMPORTMYSQL:\t\tSUCCESS");
        return true;
    }
    else {
        console.error("EXEC :: IMPORTMYSQL:\t\tERROR: \n" + isError);
        return false;
    }

}

function exportMysql() {
    io.sockets.emit('appExportMysqlStart');

    var isError = runScript("mysql_export.sh", true, true);

    if (isError == "" && isError != null) {
        console.log("EXEC :: EXPORTMYSQL:\t\tSUCCESS");
        io.sockets.emit('appExportMysqlEnd');
        return true;
    } else {
        console.log("EXEC :: EXPORTMYSQL:\t\tERROR: \n" + isError);
        io.sockets.emit('appExportMysqlEnd');
        return false;
    }
}
/**
 * Exports the MySQL Databases with the help of the mysql_export.sh script.
 */
function exportMysqlAsync() {
    console.log("ASYNC EXEC");
    asyncExec("sudo bash " + PATH_TO_BASH_SCRIPTS + "mysql_export.sh");
}
/**
 * Drops the dataAppMindmap and userData Tables from the MySQL Databases. 
 */
function startUp() {
    mysqlConnection.query("DROP TABLE IF EXISTS `dataAppMindmap`");
    mysqlConnection.query("DROP TABLE IF EXISTS `userData`");
}

/**
 * Creates the user with his name color and ip in the MySQL Database.
 * @param {String} username The name of the current user
 * @param {String} color The color of the current user
 * @param {String} ip The IP-Adrress of the current user
 */
function writeUserdata(username, color, ip) {
    mysqlConnection.query("INSERT IGNORE INTO userData (user,color,language) VALUES ('" + username + "','" + color + "','ENG')");
    mysqlConnection.query("UPDATE userData SET ip = '" + ip + "'    WHERE user =  '" + username + "'    ");
}
/**
 * Gets the username from userData and passes it to the saveUser function
 * @param {String} username The name of the user
 * @param {function} saveUser callback function with the way to save the user
 */
function createAndSaveUserSession(username, saveUser) {
    mysqlConnection.query("SELECT * FROM userData WHERE user = '" + username + "' ", saveUser);
}
/**
 * 
 * @param {String} user The name of the user
 * @param {String} value The Language Selector ENG or GER
 */
function updateUserLanguage(user, value) {
    mysqlConnection.query("UPDATE userData SET language = '" + value + "'    WHERE user =  '" + user + "'    ");
}

function getDrawData() {
    let data = [];
    mysqlConnection.query("SELECT * FROM dataAppDraw", function (err, result) {
        for (var i = 0; i < result.length; i++) {
            data.push(result[i].fileName);
        }

    });
    return data;
}
function getDrawObjectData() {
    let object = [];
    mysqlConnection.query("SELECT * FROM dataAppDraw", function (err, result) {
        for (var i = 0; i < result.length; i++) {
            object.push(result[i].content);
        }

    });
    return object;
}

function getMindmapData() {
    let data = [];
    mysqlConnection.query("SELECT * FROM dataAppMindmap", function (err, result, fields) {
        for (var i = 0; i < result.length; i++) {
            data.push(result[i].fileName);
        }

    });
    return data;
}

function saveDataDrawStringToDB(string, fileName) {
    mysqlConnection.query("INSERT IGNORE INTO dataAppDraw (fileName,content) VALUES ('" + fileName + "','" + string + "')");
    mysqlConnection.query("UPDATE dataAppDraw SET content = '" + string + "'    WHERE fileName =  '" + fileName + "'    ");
}

function getMindMapContentFromDB(fileName) {
    var content;
    var newFile = false;

    mysqlConnection.query("SELECT * FROM dataAppMindmap WHERE fileName = '" + fileName + "' ", function (err, result, fields) {
        if (result.length > 0) {
            content = "<data name='" + fileName + "'>" + result[0].content + "</data>";
        }
        else {
            content = "<data name='" + fileName + "'><node id='0' posx='0' posy='0' type='root' width='120' height='30' text='' color='#2b2b2b'></node></data>";
            newFile = true;
        }
    });
    return { content, newFile };
}

function writeMindmap(content, fileName) {
    var errorMessage = "";

    mysqlConnection.query("INSERT IGNORE INTO dataAppMindmap (fileName) VALUES ('" + fileName + "')", function (err, rows, fields) {
        if (err)
            errorMessage += "Fehler beim Schreiben: SQL1<br>";
    });
    mysqlConnection.query("UPDATE dataAppMindmap SET content = '" + content + "'    WHERE fileName =  '" + fileName + "'    ", function (err, rows, fields) {
        if (err)
            errorMessage += "Fehler beim Schreiben: SQL2<br>";
    });
    return errorMessage;
}

module.exports = {
    startUp,
    importMysql,
    exportMysql,
    exportMysqlAsync,
    writeMindmap,
    getMindMapContentFromDB,
    saveDataDrawStringToDB,
    updateUserLanguage,
    getMindmapData,
    getDrawObjectData,
    getDrawData,
    createAndSaveUserSession,
    writeUserdata
};