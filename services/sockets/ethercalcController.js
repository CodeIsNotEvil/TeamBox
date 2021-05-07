const Group = require("../../models/Group");
const { requireFolder } = require("../../utils/fsUtils");
const fs = require("fs");
const fetch = require('node-fetch');

module.exports.exportXlsxFileToUSB = async (fileName) => {
    let xlsxData = await fetchXlsxFormEthercalc(fileName);
    console.log(xlsxData);
    await writeXlsxDataToUSB(fileName, xlsxData);
}


fetchXlsxFormEthercalc = async (fileName) => {
    return await fetch(`http://teambox.local:8000/_/${fileName}/xlsx`)
        .then(response => response.text()) //TODO does not fetch in the right format, try a dataStream or an encodeing 
        .then(result => { return result })
        .catch(error => console.log('error', error));
}

writeXlsxDataToUSB = async (fileName, xlsxData) => {
    const group = await Group.findOne({ isActive: true });
    let pathToUSBFiles = `${group.usbPath}/files/tables`
    let pathWithFileName = `${pathToUSBFiles}/${fileName}.xlsx`;
    console.debug("writeImageToUSBFolder >>> ", pathWithFileName);
    if (requireFolder(pathToUSBFiles)) {
        return await writeXlsXData(pathWithFileName, xlsxData);
    }
}

writeXlsXData = async (pathWithFileName, xlsxData) => {
    return await fs.writeFile(pathWithFileName, xlsxData, function (err) {
        if (err == "" || err == null) {
            console.log(`writeXlsXData >>> successfully wrote xlsxData to ${pathWithFileName}`);
        } else {
            console.error("writeXlsXData >>>", err);
            return err
        }
    });
}