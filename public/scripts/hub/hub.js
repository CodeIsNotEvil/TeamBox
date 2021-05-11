//let socket = io();

user = JSON.parse(user);

currentFile = "/menuHub/";

function initializePage() {
    socket.emit("appUpdateUsers", user.name, currentFile);
    socket.emit("appGetLanguage", user.name);
}
initializePage();

socket.on('appUpdateUsers', updateUserList);

socket.on('appGetLanguage', function (value) {
    language = value;
    //$("#selectLanguage").html(language);
});

socket.on('appExportMysqlStart', function () {
    //$("#containerWarningExporting").show();
});
socket.on('appExportMysqlEnd', function () {
    //$("#containerWarningExporting").hide();
});


function updateUserList(users, user, file) {
    let usersConnected = users;
    console.log("file: " + file + " user: " + user);
    console.log(usersConnected);

    for (var i = 0; i < usersConnected.length; i++) {
        if (usersConnected[i].mindMapValue002 == file) {
            if (usersConnected[i].username == username) {
                $("#entryContainer").append(`<div class="containerItem"> 
                                                <div style = "background-color: ${usersConnected[i].usercolor};"> ${usersConnected[i].username} </div> 
                                            </div >`);
            }
            else {
                $("#entryContainer").append(`<div class="containerItem"> 
                                                <div style = "background-color: ${usersConnected[i].usercolor};"> ${usersConnected[i].username} </div> 
                                            </div >`);
            }
        }
        //$("#hubInfoMemberOnline").append("<font style='color:" + usersConnected[i].usercolor + ";'>" + usersConnected[i].username + "</font> ");
    }
}