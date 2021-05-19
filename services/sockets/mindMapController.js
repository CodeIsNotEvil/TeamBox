const fs = require("fs");
const { writeMindmap } = require("../mysqlHandler");
const { PATH_TO_SCREENSHOTS } = require("../../config/server");
const Group = require("../../models/Group");
const { requireFolder } = require("../../utils/fsUtils");

module.exports.saveMindMap = async (content, image, fileName) => {
    writeMindmap(content, fileName); //To DataBase
    let imageData = image.replace(/^data:image\/\w+;base64,/, '');
    await writeImageToUSBFolder(fileName, imageData);
    return await writeImageToScreenshotsFolder(fileName, imageData);
}
writeImageToUSBFolder = async (fileName, imageData) => {
    const group = await Group.findOne({ isActive: true });
    let pathToUSBFiles = `${group.usbPath}/files/mindmaps`
    requireFolder(pathToUSBFiles);
    let pathWithFileName = `${pathToUSBFiles}/${fileName}.png`;
    console.debug("writeImageToUSBFolder >>> ", pathWithFileName);
    if (pathExsists(pathToUSBFiles)) {
        return await writeImageData(pathWithFileName, imageData);
    }
}
writeImageToScreenshotsFolder = async (fileName, imageData) => {
    let pathWithFileName = PATH_TO_SCREENSHOTS + "/mindmap_" + fileName + ".png";
    if (pathExsists(PATH_TO_SCREENSHOTS)) {
        return await writeImageData(pathWithFileName, imageData);
    }
}

pathExsists = (path) => {
    try {
        fs.accessSync(path, fs.constants.W_OK);
        return true;
    } catch (error) {
        fs.mkdir(path, error => {
            if (error) {
                console.error(error);
                return false;
            }
        });
    }
}

writeImageData = async (pathWithFileName, imageData) => {
    return await fs.writeFile(pathWithFileName, imageData, { encoding: 'base64' }, function (err) {
        if (err == "" || err == null) {
            console.log("EXEC :: IMAGESAVE:\t\tSUCCESS");
        } else {
            console.error("EXEC :: IMAGESAVE:\t\tERROR: \n" + err);
            return err
        }
    });
}