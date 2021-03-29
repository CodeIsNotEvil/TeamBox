//falls ein neuer Benutzer die Seite lädt
//sprich, ein neuer socket connectet, wird
//das serverseitige Array Clients neu an
//alle Clients gesendet.
//Das Client Array wird serverseitig mit
//der Session Variable (username & usercolor)
//gefüllt, wenn ein neuer Benutzer login02.ejs
//erfolgreich durchläuft

//Die variable fileName kennzeichnt die Datei,
//die gerade geöffnet ist. Betritt der user eine neue
//Seite ändert sich diese variable durch
//socket.emit("appUpdateUsers", username, fileName)
//serverseitig. Gleichzeitig wird an alle Clients der
//neue Aufenthalsort gesnedet und die Ansicht geupdatet:
// WICHTIG: Jede Seite braucht als fileName einen einzig
//artigen Wert.


var fileName = "/menuHub/";
var language = "";


function initializePage() {
        socket.emit("appUpdateUsers", username, fileName);
        socket.emit("appGetLanguage", username);
}
initializePage();


socket.on('appUpdateUsers', function (users, user, file) {
        let usersConnected = users;
        console.log("file: " + file + " user: " + user);
        console.log(usersConnected);
        $("#containerInfoRight").html("Online are: ");
        $("#hubInfoMemberOnline").html("");

        for (var i = 0; i < usersConnected.length; i++) {
                if (usersConnected[i].mindMapValue002 == file) {
                        if (usersConnected[i].username == username) {
                                $("#containerInfoRight").append("<font style='padding: 6px 3px 7px 3px; border-radius: 3px; color: #ffffff; background-color:" + usersConnected[i].usercolor + ";'>" + usersConnected[i].username + "</font> ");
                        }
                        else {
                                $("#containerInfoRight").append("<font style='padding: 3px 3px 4px 3px; border-radius: 3px; color: #ffffff; background-color:" + usersConnected[i].usercolor + ";'>" + usersConnected[i].username + "</font> ");
                        }
                }
                $("#hubInfoMemberOnline").append("<font style='color:" + usersConnected[i].usercolor + ";'>" + usersConnected[i].username + "</font> ");
        }
});

socket.on('appGetLanguage', function (value) {
        language = value;
        $("#selectLanguage").html(language);
});

socket.on('appExportMysqlStart', function () {
        $("#containerWarningExporting").show();
});
socket.on('appExportMysqlEnd', function () {
        $("#containerWarningExporting").hide();
});


function showHideContentHub(value) {
        // LARA 11.08.2016
        //if(value == "Info")
        if (value == "Help")
        // LARA end
        {
                $("#hubSettings").slideUp("fast");
                $("#hubAppList").slideUp("fast");
                $("#hubInfo").slideDown("fast");

                $("#containerInfoInfo").css("background-color", "rgba(0,0,0,1)");
                $("#containerInfoSettings").css("background-color", "rgba(100,100,100,1)");
                $("#containerInfoApps").css("background-color", "rgba(100,100,100,1)");
        }
        else if (value == "Settings") {
                $("#hubInfo").slideUp("fast");
                $("#hubAppList").slideUp("fast");
                $("#hubSettings").slideDown("fast");

                $("#containerInfoInfo").css("background-color", "rgba(100,100,100,1)");
                $("#containerInfoSettings").css("background-color", "rgba(0,0,0,1)");
                $("#containerInfoApps").css("background-color", "rgba(100,100,100,1)");
                // LARA 02.08.2016
                //		usbCheck();
                // LARA end
        }
        else if (value == "Apps") {
                $("#hubInfo").slideUp("fast");
                $("#hubSettings").slideUp("fast");
                $("#hubAppList").slideDown("fast");

                $("#containerInfoInfo").css("background-color", "rgba(100,100,100,1)");
                $("#containerInfoSettings").css("background-color", "rgba(100,100,100,1)");
                $("#containerInfoApps").css("background-color", "rgba(0,0,0,1)");
        }
        openCloseMenuLanguage("close");
}



$(document).keyup(function (e) {
        if (e.keyCode == 27) {
                openCloseMenuLanguage("close");
        }
});

//SET SERVER TIME. The server time is adjusted to
//the clients time.

function changeServertime() {
        var date = new Date();
        var month = (date.getUTCMonth() < 9 ? "0" + (date.getUTCMonth() + 1) : (date.getUTCMonth() + 1));
        var day = (date.getUTCDate() < 10 ? "0" + date.getUTCDate() : date.getUTCDate());
        var dateDate = date.getUTCFullYear() + "" + month + "" + day;
        var dateTime = date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();

        socket.emit("appSynchronizeTime", dateDate, dateTime);
}


socket.on('appSynchronizeTime', function () {
        $("#containerWarningServertime").show().delay(1000).fadeOut().animate({ opacity: 1, }, 1500);
});


// LARA 02.08.2016
function usbCheck() {
        socket.emit("usbCheckFree");
}
// LARA end


//OPENS THE LANGUAGE SELECT FIELD
function openCloseMenuLanguage(value) {
        if (value == "open") {
                $("#containerLanguageSelect").show();
        }
        else {
                $("#containerLanguageSelect").hide();
        }
}

function changeLanguage(value) {
        socket.emit("appChangeLanguage", username, value);
}

socket.on('appChangeLanguage', function (value) {
        language = value;
        $("#selectLanguage").html(language);
        openCloseMenuLanguage("close");
});


//SAVES A LAST TIME AND SHUTS DOWN THE PI:
//IF THERE ARE ANY ERRORS SAVING THE SYSTEM
//SHOULD GIVE AN ERROR MESSAGE

function openCloseMenuShutdown(value) {
        if (value == "open") {
                $("#containerWarningShutdownSelect").show();
        }
        else {
                $("#containerWarningShutdownSelect").hide();
        }

}


function shutdownPi() {
        socket.emit("shutdownPi");
}

socket.on('shutdownPi', function () {
        $(".containerWarningShutdown").show();
});

//The group has been created by a client. After that
//all other clients are being redirected after server
//response.

socket.on('appLogin01GroupCreated', function () {
        window.open("/login02.ejs", "_parent");
});
