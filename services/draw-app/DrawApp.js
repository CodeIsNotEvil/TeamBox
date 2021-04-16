const mongoose = require('mongoose');
const AppDrawData = require('../../models/AppDrawData.js');
const Group = require('../Group.js');

class DrawApp {

    static allFiles;
    static currentFile;


    /**
     * Loads the group specific Document.
     * @returns a error if it was not successfull
     */
    static async init() {
        try {
            await DrawApp.connectToDB();
            try {
                DrawApp.allFiles = await DrawApp.getAppDrawDataDocument(Group.group);
                //When allFiles is still null there were no db entry for this group.
                if (DrawApp.allFiles === null) {
                    console.log("there were no group document createing one...");
                    try {
                        DrawApp.allFiles = await DrawApp.createNewAppDrawDataDocument(Group.group);
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
    static async getAppDrawDataDocument(group) {
        try {
            let appDrawDataDocument = await AppDrawData.findOne({ group: group });
            return appDrawDataDocument;
        } catch (error) {
            return error;
        }
    }

    static async createNewAppDrawDataDocument(group) {
        let allFiles = new AppDrawData({
            group: group,
            files: []
        });
        try {
            await allFiles.save();
            let savedDocument = await AppDrawData.findOne({ group: allFiles.group });
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
            let document = await DrawApp.getAppDrawDataDocument(Group.group); 
            return DrawApp.extractAllFileNames(document);
        } catch (error){
            return error;
        }

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