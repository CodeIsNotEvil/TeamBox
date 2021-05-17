const mongoose = require('mongoose');
const AppDrawData = require('../../models/AppDrawData.js');
const Group = require('../Group.js');

/**
 * Static class to hold all the requiered information and functions for the Drawing Pad application.
 */
class DrawPad {

    static document;

    /**
     * Loads the group specific Document.
     * @returns a error if it was not successfull
     */
    static async init() {
        try {
            DrawPad.document = await DrawPad.getAppDrawDataDocumentFromDB(Group.group);
            //When document is still null there were no db entry for this group.
            if (DrawPad.document === null) {
                console.log("there were no group document createing one...");
                try {
                    DrawPad.document = await DrawPad.createNewAppDrawDataDocument(Group.group);
                } catch (error) {
                    return error;
                }
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

    /**
     * Creates a new DataDocument for the group to use.
     * @param {String} group name of the group.
     * @returns {*} The document of the group in AppDrawData format or the error if there was one.
     */
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
     * Returns the File Names of the current group as an array.
     * This function will be called if a client loads requests the /appDraw.ejs Page
     * @returns {Array} Filenames of the current group
     */
    static async getAllFileNames() {
        try {
            //return DrawPad.extractAllFileNames(DrawPad.document);
            return DrawPad.getAllFileNamesWithContent();
        } catch (error) {
            return error;
        }

    }

    /**
     * Returns File Names of not empty files of the current group as an array.
     * This function will be called if a client loads requests the /appDraw.ejs Page
     * @returns {Array} Filenames of the current group
     */
    static getAllFileNamesWithContent() {
        let fileNames = [];
        let emptyFilesNames = [];
        for (let file = 0; file < DrawPad.document.files.length; file++) {
            if (DrawPad.document.files[file].drawObjects.length > 1) {
                fileNames.push(DrawPad.document.files[file].filename);
            } else {
                emptyFilesNames.push(DrawPad.document.files[file].filename);
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
            DrawPad.document.files.forEach(element => {
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

    /**
     * Adds a file to the current document without saveing it to the database.
     * This should be called if a client sends drawObject data for a file wich does not exsist.
     * @param {AppDrawFile} file the file wich will get added to the document 
     */
    static addFileToDocument(file) {
        DrawPad.document.files.push(file);
    }


    /**
     * Saves the Docuemnt to the Database
     */
    static async saveDocumentToTheDatabase() {
        await DrawPad.document.save();
    }

    /**
     * Removes a File from the Document, usually called on deletion of a file.
     * @param {Strning} filename the name of the file wich should be removed.
     */
    static removeFileFormDocument(filename) {
        //console.log("removal... ", filename);
        let indexToSplice;
        for (let index = 0; index < DrawPad.document.files.length; index++) {
            if (DrawPad.document.files[index].filename === filename) {
                indexToSplice = index;
                break;
            }
        }
        //console.log(indexToSplice);
        if (indexToSplice > -1) {
            DrawPad.document.files.splice(indexToSplice, 1);
            DrawPad.document.save().catch(error => {
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
            for (let file = 0; file < DrawPad.document.files.length; file++) {
                if (DrawPad.document.files[file].filename === filename) {
                    return true;
                }
            }
        } catch (error) {
            console.error(error);
            return false;
        }

        return false;
    }

    /**
     * Creates a new File.
     * @param {String} filename the name of the file wich should be created.
     */
    static createNewFile(filename) {
        let file = {
            filename: filename,
        }
        DrawPad.document.files.push(file);
    }

    /**
     * Checks if the file with the filename as name has drawObjects(content). 
     * @param {String} filename the name of the file to check.
     * @returns {Boolean}
     */
    static hasContent(filename) {
        for (let file = 0; file < DrawPad.document.files.length; file++) {
            if (DrawPad.document.files[file].filename === filename) {
                if (DrawPad.document.files[file].drawObjects.length > 0) {
                    return true;
                }
            }
        }
        return false;
    }
}

module.exports = DrawPad;