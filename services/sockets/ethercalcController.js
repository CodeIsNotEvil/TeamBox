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
    const response = await fetch(`http://teambox.local:8000/_/${fileName}/xlsx`, { method: 'GET', redirect: 'follow' });
    const buffer = await response.buffer();
    return buffer;
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
    let wstream = fs.createWriteStream(pathWithFileName);
    let error = await wstream.write(xlsxData);
    console.log(error);
    console.debug(`writeXlsXData >>> successfully wrote xlsxData to ${pathWithFileName}`);
    return await wstream.end();
}