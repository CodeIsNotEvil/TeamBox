const Group = require("../../models/Group");
const OldGroup = require("../Group");
const { exportData } = require("../syncHandler");

let notRequestedInTheLast10Minutes = true;
let timer;

module.exports.requestGroupLogout = async (socket) => {
    if (notRequestedInTheLast10Minutes) {
        socket.broadcast.emit("RequestGroupLogout");
        console.debug("RequestGroupLogout >>> ....");
        let timeout = 30 * 1000; //30 secounds
        timer = setTimeout(async () => {
            await callGroupLogout();
            let reason = `Nobody has rejected the request after ${timeout / 1000} secounds.`
            io.emit("GroupLogout", reason);
        }, timeout);
    } else {
        let reason = `A Group member has rejected your request in the last 10 minutes please wait to request again.`
        socket.emit("RejectedGroupLogoutFIN", reason);
    }
}

module.exports.groupLogoutAccepted = async (socket) => {
    console.log("Recieved >>> GroupLogoutAccepted");
    clearTimeout(timer);
    await callGroupLogout();
    let reason = `A group member has accepted the request`
    io.emit("GroupLogout", reason);
}

module.exports.rejectGroupLogout = (socket) => {
    console.log("Recieved >>> RejectedGroupLogout");
    clearTimeout(timer);
    let reason = `A group member has rejected the request`
    socket.broadcast.emit("RejectedGroupLogoutFIN", reason);
    let amountOfTime = 1000 //* 60 * 10; //10 minutes
    autoRejectLogoutRequest(amountOfTime);
}
const callGroupLogout = async () => {
    //Export Data
    exportData(); //SyncHandler
    //Reset Group Name
    OldGroup.group = "";

    await Group.findOneAndUpdate({ name: group.name }, { isActive: false, users: [] });
}

function autoRejectLogoutRequest(amountOfTime) {
    notRequestedInTheLast10Minutes = false;
    setTimeout(() => {
        notRequestedInTheLast10Minutes = true;
    }, amountOfTime);
}
