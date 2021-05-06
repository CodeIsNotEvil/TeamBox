const USB_PRE_PATH = "/media/USB-TeamBox/TeamBox/";

class Group {
    static group = "";
    static groupIsFromUsb = false;
    static mysqlIsImported = false;
    static ethercalcIsImported = false;
    static wekanDBIsImported = false;
    static DrawPadDBIsImported = false;
    static groups = [];
    static clients = [];
    static illegalClients = ["admin", "administrator", "ubuntu", "root",];
    static usbPath = null;

    static initUsbPath() {
        if (Group.group) {
            Group.usbPath = `${USB_PRE_PATH}${Group.group}`;
        } else {
            throw new Error("GroupName is not present");
        }

    }
    static getUsbPath() {
        if (Group.usbPath) {
            return Group.usbPath;
        } else {
            Group.initUsbPath();
            return Group.usbPath;
        }
    }
}
module.exports = Group;