const { PATH_TO_GLOBAL_MODULES } = require("../config/server");
const runScript = require("./runScripts");
const fs = require('fs');
const fse = require(PATH_TO_GLOBAL_MODULES + 'fs-extra');
const Group = require("./Group");

const LOCAL_DUMP_PATH = "/home/ubuntu/dump/";
const USB_PRE_PATH = "/media/USB-TeamBox/TeamBox/";
const USB_POST_PATH = "/.meta/ethercalcDump/";

class Ethercalc {

    static entrieList;

    /**
     * Calculates and returns the Path to the USB dump folder if it is needed.
     * This functions ensures that the Path matches the one of the current group.
     * @returns {String} The path to the USB dump folder 
     */
    static getGroupDumpPath() {
        return USB_PRE_PATH + Group.group + USB_POST_PATH;
    }

    /**
     * Checks if the folder at path exists. If it does not it will call createFolder and clear the LOCAL_DUMP 
     * @param {String} path Path to the folder
     * @returns {boolean}
     */
    static checkFolderExist(path) {
        if (fs.existsSync(path)) {
            return true;
        } else {
            this.clearDump();
            return this.createFolder(path);
        }
    }

    /**
     * Creates a Folder at Path
     * @param {String} path Path to the folder
     * @returns {boolean}
     */
    static createFolder(path) {
        try {
            fs.mkdirSync(path);
            console.log("Created directory: " + path);
            return true;
        } catch (error) {
            console.log(error);
            return false;
        }

    }

    /**
     * reads the directory at LOCAL_DUMP_PATH and returns the Etherpad filenames.
     * @returns {Array} List of the etherpad filenames
     */
    static getEntries() {
        try {
            let dir = fs.readdirSync(LOCAL_DUMP_PATH).toString();
            let list = dir.match(new RegExp("[a-zA-Z0-9_]*(_formdata)", "gm"));
            if (list != null) {
                for (let index = 0; index < list.length; index++) {
                    list[index] = list[index].slice(0, list[index].length - 9);
                }
            } else {
                list = [];
            }
            return list;
        } catch (error) {
            console.log(error);
            return runScript("server_get_ethercalc.sh", true, false).split("\n");
        }
    }
    /**
     * removes the local dump folder wich is located at LOCAL_DUMP_PATH
     */
    static clearDump() {
        if (this.checkFolderExist(LOCAL_DUMP_PATH)) {
            try {
                fs.rmdirSync(LOCAL_DUMP_PATH, { recursive: true, force: true });
                //fs.rm(LOCAL_DUMP_PATH);
            } catch (error) {
                console.error(error);
            }
        } else {
            console.log("noting to Clear");
        }


    }
    /**
     * Copys the Dump from the groupDumpPath (USB) to LOCAL_DUMP_PATH
     * @returns {boolean} wether it was a successfull or not
     */
    static importDump() {
        let groupDumpPath = this.getGroupDumpPath();
        if (this.checkFolderExist(groupDumpPath)) {
            try {
                fse.copySync(groupDumpPath, LOCAL_DUMP_PATH, { overwrite: true });
                return true;
            } catch (error) {
                console.error(error);
                return false;
            }
        } else {
            console.log("Folder to Import does not exist");
        }
    }
    /**
     * Copys the Dump from LOCAL_DUMP_PATH to the groupDumpPath (USB)
     * @returns {boolean} wether it was a successfull or not
     */
    static exportDump() {
        let groupDumpPath = this.getGroupDumpPath();
        if (this.checkFolderExist(groupDumpPath)) {
            try {
                fse.copySync(LOCAL_DUMP_PATH, groupDumpPath, { overwrite: true });
                return true;
            } catch (error) {
                console.error(error);
                return false;
            }
        }
    }
}
module.exports = Ethercalc;
