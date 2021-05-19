const mocha = require('mocha');
const assert = require('assert');
let mysql = require('mysql');

const { USB_PRE_PATH } = require("../../../config/server");
const { importMySQLDB } = require("../../../services/mariadb/mariaBackupHandler");
const syncExec = require('sync-exec');

describe('Import MariaDB', function () {

    const dbName = "TeamBox";
    let testGroup = {
        name: "testGroup",
        password: "password",
        users: [],
        isActive: true,
        usbPath: `${USB_PRE_PATH}/testGroup`
    }

    it('importMySQLDB should return the file of the imported database', async () => {
        let filenameWithDate = await importMySQLDB(dbName);
        let matcher = new RegExp('\w*_[0-9\-]*_[0-9\-]*.sql$', 'gm'); // matches alike: TestDatabaseName_2021-05-18_14-07-38.sql
        assert(filenameWithDate.match(matcher));
    });

    it('importMySQLDB should import emptyDBs if there is nothing to import', async () => {
        let doesNotExsist = "nonExsistingDB";
        let emptyfileName = await importMySQLDB(doesNotExsist);
        let exp = new RegExp(`${doesNotExsist}_emptyDB`, 'gm');
        console.log(emptyfileName.match(exp)[0]);
        assert(emptyfileName.match(exp)[0]);
    });


});