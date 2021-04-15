const mongoose = require('mongoose');
const AppDrawData = require('../../models/AppDrawData.js');
const Group = require('../Group.js');

class DrawApp {

    static currentGroup;
    static allFiles;
    static currentFile;


    /**
     * 
     * @returns weather it was success full or the error
     */
    static async init() {
        try {
            await DrawApp.connectToDB();
            DrawApp.currentGroup = Group.group;
            try {
                DrawApp.allFiles = await DrawApp.getAppDrawDataDocument(DrawApp.currentGroup);
                //When allFiles is still null there were no db entry for this group.
                if (DrawApp.allFiles === null) {
                    console.log("there were no group document createing one...");
                    try {
                        DrawApp.allFiles = await DrawApp.createNewAppDrawDataDocument(DrawApp.currentGroup);
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