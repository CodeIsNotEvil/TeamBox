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
}
module.exports = Group;