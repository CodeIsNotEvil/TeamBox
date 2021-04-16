const mocha = require('mocha');
const assert = require('assert');
const DrawApp = require('../../../services/draw-app/DrawApp');
const Group = require('../../../services/Group');

describe('DrawApp Test', function () {

    it('createAppDrawDataDocument: create document for the group', async () => {
        let groupName = "testGroup";
        try {
            let doc = await DrawApp.createNewAppDrawDataDocument(groupName);
            assert(doc.group === groupName);
        } catch (error) {
            console.log(error);
            assert(false);
        }

    });

    it('getAppDrawDataDocument: find and return the group document', async () => {

        let groupName = "testGroup";

        try {
            await DrawApp.createNewAppDrawDataDocument(groupName);
            await DrawApp.getAppDrawDataDocument(groupName);
        } catch (error) {
            console.log(error);
            assert(false);
        }

    });

    it('init: createsDB connection, and create the group', async () => {

        let groupName = "testGroup";

        try {
            Group.group = groupName;
            await DrawApp.init();
            assert(DrawApp.allFiles.group === groupName);
        } catch (error) {
            console.log(error);
            assert(false);
        }

    });

    it('init: createsDB connection, and load the group', async () => {

        let groupName = "testGroup";

        try {
            Group.group = groupName;
            await DrawApp.createNewAppDrawDataDocument(groupName);
            await DrawApp.init();
            assert(DrawApp.allFiles.group === groupName);
        } catch (error) {
            console.log(error);
            assert(false);
        }

    });

    it('extractAllFileNames: extract two filenames from a predefined document', () => {
        let document = {
            "_id": "6075987c77acceb2c8d8789a",
            "group": "testGroup",
            "files": [
                {
                    "_id": "6075987c77acceb2c8d8789b",
                    "filename": "extractAllFileNamesTest1",
                    "drawObjects": []
                },
                {
                    "_id": "6075987c77acceb2c8d8789b",
                    "filename": "extractAllFileNamesTest2",
                    "drawObjects": []
                }
            ],
            "__v": 0
        }
        let expected = ["extractAllFileNamesTest1", "extractAllFileNamesTest2"];

        let actual = DrawApp.extractAllFileNames(document);

        assert(actual.toString() === expected.toString());


    });

});