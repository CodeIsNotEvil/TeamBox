const fs = require("fs");

folderExsists = (path) => {
    try {
        fs.accessSync(path, fs.constants.W_OK);
        return true;
    } catch (error) {
        return false;
    }
}
module.exports = { folderExsists };

module.exports.requireFolder = (path) => {
    if (folderExsists(path) == false) {
        fs.mkdir(path, error => {
            if (error) {
                console.error(error);
                return false;
            }
        });
    }
    return true;
}