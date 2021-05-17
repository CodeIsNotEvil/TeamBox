const fs = require("fs");

folderExsists = (path) => {
    try {
        fs.accessSync(path, fs.constants.W_OK);
        return true;
    } catch (error) {
        return false;
    }
}


requireFolder = (path) => {
    if (folderExsists(path) == false) {
        fs.mkdir(path, error => {
            if (error) {
                if (error.errno === -2) { //errno of -2 means that there was no Folder 
                    let parentFolder = removeLastDirectoryPartOf(path.toString());
                    requireFolder(parentFolder);
                } else {
                    console.error(error);
                    return false;
                }
            }
        });
    }
    return true;
}

const removeLastDirectoryPartOf = (path) => {
    var parent = path.split('/');
    parent.pop();
    return (parent.join('/'));
}

module.exports = { folderExsists, requireFolder };