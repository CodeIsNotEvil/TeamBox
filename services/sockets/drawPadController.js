const fs = require("fs");
const { PATH_TO_DRAWINGS } = require("../../config/server");
const { requireFolder } = require("../../utils/fsUtils");
const DrawPad = require("../drawpad/DrawPad");
const Group = require("../../models/Group");

module.exports.saveDrawing = (image, fileName, callback) => {
    saveDrawingToDB(fileName);

    let imageData = image.replace(/^data:image\/\w+;base64,/, '');
    writeImageToLocalFolder(fileName, imageData, callback);
    writeImageToUSB(fileName, imageData, callback);
}

saveDrawingToDB = (fileName) => {
    if (DrawPad.checkIfFileExsists(fileName)) {
        if (DrawPad.hasContent(fileName)) {
            try {
                DrawPad.saveDocumentToTheDatabase();
            } catch (error) {
                console.error(error);
            }
        }
    } else {
        DrawPad.createNewFile(fileName);
        console.log("create " + fileName);
        try {
            DrawPad.saveDocumentToTheDatabase();
        } catch (error) {
            console.error(error);
        }
    }
}
writeImageDataCallback = (pathWithFileName, imageData, fileName, callback) => {
    fs.writeFile(pathWithFileName, imageData, { encoding: 'base64' }, err => {
        console.debug(pathWithFileName, fileName);
        if (err) {
            console.error(err);
            callback({ error: "content could not be saved as Image" });
        } else {

            callback({ fileName: fileName });
        }
    });
}
//Needs to be local in oder to serve as a Thumbnail
writeImageToLocalFolder = (fileName, imageData, callback) => {
    requireFolder(PATH_TO_DRAWINGS);
    let pathWithFileName = PATH_TO_DRAWINGS + "/draw_" + fileName + ".png";
    writeImageDataCallback(pathWithFileName, imageData, fileName, callback);
}

writeImageToUSB = (fileName, imageData, callback) => {
    Group.findOne({ isActive: true }, (err, group) => {
        let pathToUSBFiles = `${group.usbPath}/files/drawings`
        let pathWithFileName = `${pathToUSBFiles}/${fileName}.png`;
        if (requireFolder(pathToUSBFiles)) {
            console.debug("writeImageToUSBFolder >>> ", pathWithFileName);
            writeImageDataCallback(pathWithFileName, imageData, fileName, callback);
        }
    });

}

