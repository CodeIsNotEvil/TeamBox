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

    it('getAppDrawDataDocumentFromDB: find and return the group document', async () => {

        let groupName = "testGroup";

        try {
            await DrawApp.createNewAppDrawDataDocument(groupName);
            let doc = await DrawApp.getAppDrawDataDocumentFromDB(groupName);
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
        DrawApp.document = await DrawApp.createNewAppDrawDataDocument(groupName);
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
        DrawApp.document = await DrawApp.createNewAppDrawDataDocument(groupName);
        DrawApp.addFileToDocument(file);
        let initialDocLength = DrawApp.document.files[0].drawObjects.length;
        
        DrawApp.addObjectToFile(drawObject, file.filename);

        assert(initialDocLength < DrawApp.document.files[0].drawObjects.length);

    });

    it('addObjectToFile: add a pencilArray as seperate pencilObjects to a exsisting file', async () => {
        
        groupName = "testGroup";
        let file = {
            _id: "6075987c77acceb2c8d8789b",
            filename: "addObjectToFileTest1",
            drawObjects: []
        };
        let pencilObj1 = {
            type: 'pencil',
            x: 50,
            y: 50,
            v: 15,
            xp: 50,
            yp: 50,
            col: 'black',
            l: 0
        };
        let pencilObj2 = {
            type: 'pencil',
            x: 50,
            y: 50,
            v: 15,
            xp: 50,
            yp: 50,
            col: 'black',
            l: 0
        };
        let drawObject = {
            type: "pencilarray",
            objArray: [pencilObj1,pencilObj2]
        }
        DrawApp.document = await DrawApp.createNewAppDrawDataDocument(groupName);
        DrawApp.addFileToDocument(file);
        let initialDocLength = DrawApp.document.files[0].drawObjects.length;
        
        DrawApp.addObjectToFile(drawObject, file.filename);
        
        assert(DrawApp.document.files[0].drawObjects[0] != null && 
            DrawApp.document.files[0].drawObjects[0].objArray[0] != null && 
            DrawApp.document.files[0].drawObjects[0].objArray[1] != null
            );

    });

    it('saveDocumentToTheDatabase: saves the current document to the database', async () => {
        groupName = "testGroup";
        let file = {
            _id: "6075987c77acceb2c8d8789b",
            filename: "addObjectToFileTest1",
            drawObjects: []
        };
        DrawApp.document = await DrawApp.createNewAppDrawDataDocument(groupName);     
        DrawApp.addFileToDocument(file);


        await DrawApp.saveDocumentToTheDatabase();

        
        let databaseDocuemnt = await DrawApp.getAppDrawDataDocumentFromDB(groupName);
        assert(DrawApp.document.toString() === databaseDocuemnt.toString());
    });

    it('removeFileFormDocument: Add three files and removes the middle one', async () => {
        groupName = "testGroup";
        let file1 = {
            _id: "6075987c77abbbb2c8d8789b",
            filename: "removeFileFormDocumentTestFile1",
            drawObjects: []
        };
        let file2 = {
            _id: "6075987c77acceb548d8789b",
            filename: "removeFileFormDocumentTestFile2",
            drawObjects: []
        };
        let file3 = {
            _id: "6075987c77acceb2c8d8789b",
            filename: "removeFileFormDocumentTestFile3",
            drawObjects: []
        };
        DrawApp.document = await DrawApp.createNewAppDrawDataDocument(groupName);

        DrawApp.addFileToDocument(file1);
        DrawApp.addFileToDocument(file2);
        DrawApp.addFileToDocument(file3);
        document = DrawApp.document;


        DrawApp.removeFileFormDocument(file2.filename);
        
        
        assert(DrawApp.document.files[0].filename === file1.filename && DrawApp.document.files[1].filename === file3.filename);
    });

    it('checkIfFileExsists: checks if a created file exsists', async() => {
        groupName = "testGroup";
        let file1 = {
            _id: "6075987c77abbbb2c8d8789b",
            filename: "checkIfFileExsistsFile",
            drawObjects: []
        };
        DrawApp.document = await DrawApp.createNewAppDrawDataDocument(groupName);
        DrawApp.addFileToDocument(file1);

        assert(DrawApp.checkIfFileExsists(file1.filename));
    });

    it('checkIfFileExsists: checks if a file did not exsists', async () => {
        groupName = "testGroup";
        let file1 = {
            _id: "6075987c77abbbb2c8d8789b",
            filename: "checkIfFileExsistsFile",
            drawObjects: []
        };
        DrawApp.document = await DrawApp.createNewAppDrawDataDocument(groupName);

        assert(!DrawApp.checkIfFileExsists(file1.filename));
    });

    it('createNewFile: create a new file', async () => {
        groupName = "testGroup";
        filename = "createNewFile";
        DrawApp.document = await DrawApp.createNewAppDrawDataDocument(groupName);
        DrawApp.createNewFile(filename);
        assert(DrawApp.checkIfFileExsists(filename));
    });

    it('hasContent: checks if a file with drawObjcts has some drawObjects' , async () => {
        groupName = "testGroup";
        let pencilObj1 = {
            type: 'pencil',
            x: 50,
            y: 50,
            v: 15,
            xp: 50,
            yp: 50,
            col: 'black',
            l: 0
        };
        let file1 = {
            _id: "6075987c77abbbb2c8d8789b",
            filename: "checkIfFileExsistsFile",
            drawObjects: [pencilObj1]
        };
        
        DrawApp.document = await DrawApp.createNewAppDrawDataDocument(groupName);
        DrawApp.addFileToDocument(file1);


        assert(DrawApp.hasContent(file1.filename));
    })
});