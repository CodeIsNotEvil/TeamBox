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
            let doc = await DrawApp.getAppDrawDataDocument(groupName);
            assert(doc.group.toString() === groupName);
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
            assert(DrawApp.document.group === groupName);
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
            assert(DrawApp.document.group === groupName);
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

    it('addFileToDocument: a new file to a document', async () => {
        
        groupName = "testGroup";
        let file = {
            _id: "6075987c77acceb2c8d8789b",
            filename: "addfileTest",
            drawObjects: []
        };
        DrawApp.document = await DrawApp.createNewAppDrawDataDocument(Group.group);
        let initialFileCount = DrawApp.document.files.length;
        
        
        DrawApp.addFileToDocument(file);
        

        assert(initialFileCount < DrawApp.document.files.length);
    });

    it('addObjectToFile: add a drawObject to a exsisting file', async () => {
        
        groupName = "testGroup";
        let file = {
            _id: "6075987c77acceb2c8d8789b",
            filename: "addObjectToFileTest1",
            drawObjects: []
        };
        let drawObject = {
            _id: '6075987c77acceb2c8d8789c',
            type: 'pencil',
            x: 50,
            y: 50,
            v: 15,
            xp: 50,
            yp: 50,
            col: 'black',
            l: 0
        };
        DrawApp.document = await DrawApp.createNewAppDrawDataDocument(Group.group);
        DrawApp.addFileToDocument(file);
        let initialDocLength = DrawApp.document.files[0].drawObjects.length;

        
        DrawApp.addObjectToFile(drawObject, file.filename);

        
        assert(initialDocLength < DrawApp.document.files[0].drawObjects.length);

    });

});