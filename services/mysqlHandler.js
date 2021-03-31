const { PATH_TO_GLOBAL_MODULES, PATH_TO_BASH_SCRIPTS } = require('../config/server');
const mysql = require(PATH_TO_GLOBAL_MODULES + 'mysql');
const asyncExec = require('child_process').exec;
const Group = require('./Group');
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
 * @returns {boolean} true if the import was successfull
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

function getDrawData(res, req, group, route) {//FOUND THE ERROR!! THE callback function gets called afer this functions retruned his data variable
    //https://stackoverflow.com/questions/18361930/node-js-returning-result-from-mysql-query
    
    mysqlConnection.query("SELECT * FROM dataAppDraw", function (err, result) {
        let fileNames = [];
        if (err) {
            console.log(err);
        }
        //console.log("result: " + result);
        for (var i = 0; i < result.length; i++) {
            fileNames.push(result[i].fileName);
            //console.log("filename: " + result[i].fileName);
        }
        //console.log("Filenames: " + fileNames);
        route(res, group, fileNames);

    });
}
function getDrawObjectData(res, req, group, route) {
    mysqlConnection.query("SELECT * FROM dataAppDraw", function (err, result) {
        let fileNames = [];
        let contents = [];
        if (err) {
            console.log(err);
        }
        for (var i = 0; i < result.length; i++) {
            fileNames.push(result[i].fileName);
            object.push(result[i].content);
        }
        route(res, req, group, fileNames, contents);

    });
}

function getMindmapData() {
    let data = [];
    mysqlConnection.query("SELECT * FROM dataAppMindmap", function (err, result,) {
        if (err) {
            console.log(err);
        }
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
/**
 * Clears the drawing in the dataAppDraw MySQL database.
 * @param {String} fileName 
 */
function clearDrawingQuery(fileName) {
    mysqlConnection.query("UPDATE dataAppDraw SET content = '' WHERE fileName =  '" + fileName + "'    ");
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
    saveDataDrawStringToDB,
    updateUserLanguage,
    createAndSaveUserSession,
    writeUserdata,
    clearDrawingQuery,
    getMySQLConnection
};