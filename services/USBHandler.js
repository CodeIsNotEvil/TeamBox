const runScript = require("./runScripts");


/**
 * Check the usb's size as well as free, used & TeamBox-used space.
 * @returns usb
 */
function usbCheckFree() {
    let usbValues = runScript("usb_check_free.sh", true, false).split("\n");
    let usbSize = usbValues[0].split(":")[1].trim();
    let usbFree = usbValues[1].split(":")[1].split("=")[0].trim();
    let usbFreePerc = usbValues[1].split(":")[1].split("=")[1].trim();
    let usbUsed = usbValues[2].split(":")[1].split("=")[0].trim();
    let usbUsedPerc = usbValues[2].split(":")[1].split("=")[1].trim();
    let usbTB = usbValues[3].split(":")[1].split("=")[0].trim();
    let usbTBPerc = usbValues[3].split(":")[1].split("=")[1].trim();
    let usbString = usbSize + " " + usbFree + " " + usbFreePerc + " " + usbUsed + " " + usbUsedPerc + " " + usbTB + " " + usbTBPerc;
    return usbString;
}

module.exports = usbCheckFree;