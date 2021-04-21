const mongoose = require('mongoose');
const AppDrawData = require('../../models/AppDrawData.js');
const Group = require('../Group.js');

class DrawApp {

    static document;

    /**
     * Loads the group specific Document.
     * @returns a error if it was not successfull
     */
    static async init() {
        try {
            await DrawApp.connectToDB();
            try {
                DrawApp.document = await DrawApp.getAppDrawDataDocumentFromDB(Group.group);
                //When document is still null there were no db entry for this group.
                if (DrawApp.document === null) {
                    console.log("there were no group document createing one...");
                    try {
                        DrawApp.document = await DrawApp.createNewAppDrawDataDocument(Group.group);
                    } catch (error) {
                        return error;
                    }
                }
            } catch (error) {
                return error;
            }
        } catch (error) {
            return error;
        }


    }

    /**
     * Returns the document of the specified group.
     * @param {String} group the name of the logged in group
     * @returns the full database document
     */
    static async getAppDrawDataDocumentFromDB(group) {
        try {
            let appDrawDataDocument = await AppDrawData.findOne({ group: group });
            return appDrawDataDocument;
        } catch (error) {
            return error;
        }
    }

    static async createNewAppDrawDataDocument(group) {
        let document = new AppDrawData({
            group: group,
            files: []
        });
        try {
            await document.save();
            let savedDocument = await AppDrawData.findOne({ group: document.group });
            return savedDocument;
        } catch (error) {
            return error;
        }
    }
    /**
     * connects to the DrawPad database, this will not work in the current testsetup wich prevents tests on running on the productionDB.
     * The Code to use this is located at the bottom of this file.
     * @returns 
     */
    static async connectToDB() {
        mongoose.connect('mongodb://localhost/DrawPad', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useFindAndModify: false
        });
        //Connect to mongodb if it does not exsist it will be created

        //console.log("Starting DB connection...");
        return mongoose.connection.once('open', () => {
            console.log("Connected to the Server");
        }).on('error', function (error) {
            console.error("MongoDB error\n" + error);
        });
    }

    static async diconnectFromDB() {
        return mongoose.disconnect().then(() => {
            console.log("Disconected from DB");
        });
    }

    /**
     * Returns the File Names of the current group as an array.
     * This function will be called if a client loads requests the /appDraw.ejs Page
     * @returns {Array} Filenames of the current group
     */
    static async getAllFileNames() {
        try {
            //return DrawApp.extractAllFileNames(DrawApp.document);
            return DrawApp.getAllFileNamesWithContent();
        } catch (error) {
            return error;
        }

    }

    static getAllFileNamesWithContent() {
        let fileNames = [];
        let emptyFilesNames = [];
        for (let file = 0; file < DrawApp.document.files.length; file++) {
            if (DrawApp.document.files[file].drawObjects.length > 1) {
                fileNames.push(DrawApp.document.files[file].filename);
            } else {
                emptyFilesNames.push(DrawApp.document.files[file].filename);
            }
        }
        return fileNames;
    }
    /**
     * Takes very filename and put it in a array
     * @param {JSON} document the AppDrawData document of any group 
     * @returns returns the filename
     */
    static extractAllFileNames(document) {
        let fileNames = [];
        document.files.forEach(element => {
            fileNames.push(element.filename);
        });
        return fileNames;
    }

    /**
     * Adds a object to a file.
     * @param {DrawObject} obj the drawObject wich will be appended to the drawObjects array. 
     * @param {String} filename name of the file to add the object 
     */
    static addObjectToFile(obj, filename) {
        try {
            DrawApp.document.files.forEach(element => {
                if (element.filename === filename) {
                    element.drawObjects.push(obj);
                }
            });
        } catch (error) {
            //Only throws an error if someone tries to draw something after the server has restarted but no group is seleced yet.
            //To solve this it would be enought to redirect all clients to the hub or lock the canvas.
            console.error(error);
        }
    }

    static addFileToDocument(file) {
        DrawApp.document.files.push(file);
    }


    /**
     * Saves the Docuemnt to the Database
     */
    static async saveDocumentToTheDatabase() {
        await DrawApp.document.save();
    }

    /**
     * Removes a File from the Document, usually called on deletion of a file.
     * @param {Strning} filename the name of the file wich should be removed.
     */
    static removeFileFormDocument(filename) {
        //console.log("removal... ", filename);
        let indexToSplice;
        for (let index = 0; index < DrawApp.document.files.length; index++) {
            if (DrawApp.document.files[index].filename === filename) {
                indexToSplice = index;
                break;
            }
        }
        //console.log(indexToSplice);
        if (indexToSplice > -1) {
            DrawApp.document.files.splice(indexToSplice, 1);
            DrawApp.document.save().catch(error => {
                console.error(error);
            });
            //console.log("save was called");
        }

    }

    /**
     * Checks if a file with the filename exsists
     * @param {String} filename the name of the file.
     * @returns {Boolean} wether the file exsists or not.
     */
    static checkIfFileExsists(filename) {
        try {
            for (let file = 0; file < DrawApp.document.files.length; file++) {
                if (DrawApp.document.files[file].filename === filename) {
                    return true;
                }
            }
        } catch (error) {
            console.log(error);
            return false;
        }

        return false;
    }

    /**
     * Creates a new File.
     * @param {Strin} filename the name of the file wich should be created.
     */
    static createNewFile(filename) {
        let file = {
            filename: filename,
        }
        DrawApp.document.files.push(file);
    }

    static hasContent(filename) {
        for (let file = 0; file < DrawApp.document.files.length; file++) {
            if (DrawApp.document.files[file].filename === filename) {
                if (DrawApp.document.files[file].drawObjects.length > 0) {
                    return true;
                }
            }
        }
        return false;
    }
}
/*
let init =  async () => {
    try{
        await DrawApp.connectToDB();
        await DrawApp.diconnectFromDB();
    } catch (error) {
        console.log(error);
    }
    
}
init();
*/

module.exports = DrawApp;