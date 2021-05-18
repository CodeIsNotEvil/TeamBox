const mocha = require('mocha');
const assert = require('assert');

const { USB_PRE_PATH } = require("../../../config/server");
const { importMySQLDB } = require("../../../services/mariadb/mariaBackupHandler");
const Group = require('../../../models/Group');

describe('Import MariaDB', function () {

    const dbName = "TestDatabaseName";
    let testGroup = {
        name: "testGroup",
        password: "password",
        users: [],
        isActive: true,
        usbPath: `${USB_PRE_PATH}/testGroup`
    }

    it('importMySQLDB should return the file of the imported database', async () => {
        let filenameWithDate = await importMySQLDB(dbName);
        console.log(filenameWithDate);
        let matcher = new RegExp('\w*_[0-9\-]*_[0-9\-]*.sql$', 'gm'); // matches alike: TestDatabaseName_2021-05-18_14-07-38.sql
        assert(filenameWithDate.match(matcher));
    });


});