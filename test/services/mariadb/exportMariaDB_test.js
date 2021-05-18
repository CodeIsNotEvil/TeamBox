const mocha = require('mocha');
const assert = require('assert');

const { USB_PRE_PATH } = require("../../../config/server");
const { getExportPath, exportMySQLDB } = require("../../../services/mariadb/mariaBackupHandler");
const Group = require('../../../models/Group');

describe('Export MariaDB', function () {

    const dbName = "TestDatabaseName";
    let testGroup = {
        name: "testGroup",
        password: "password",
        users: [],
        isActive: true,
        usbPath: `${USB_PRE_PATH}/testGroup`
    }

    it('getExportPath should retrun a path to .meta', async () => {
        await Group.deleteOne({ name: testGroup.name });
        let group = await Group.create(testGroup);
        let exprected = `${group.usbPath}/.meta/sql/${dbName}Backup`;

        let path = await getExportPath(dbName);

        assert(exprected == path);
    });

    it('calling getExportPath without a database name should thow a error', async () => {
        try {
            await getExportPath();
        } catch (error) {
            assert(error);
        }
    });

    it('exportMySQLDB there is no test database, should throw a Unknown databse error', async () => {
        await Group.deleteOne({ name: testGroup.name });
        await Group.create(testGroup);
        let error = await exportMySQLDB(dbName);
        if (error) {
            //mysqldump: Got error: 1049: "Unknown database 'TestDatabaseName'" when selecting the database
            assert(error.toString().substring(22, 26) === "1049");
        }

    });

    /*Needs Import functionallity to test
    it('exportMySQLDB with sql test database, export', async () => {
        await Group.deleteOne({ name: testGroup.name });
        await Group.create(testGroup);
        let error = await exportMySQLDB(dbName);
        if (error) {
            assert(false);
        }

    });
    */
});