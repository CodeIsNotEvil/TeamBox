var socket = io();


//Die vom USB STICK geladenen Gruppen:
//Sofern Gruppen existieren werden die
//Einträge angehängt an das EingabeFeld

if (groups.length > 0) {
        for (var i = 0; i < groups.length; i++) {
                $("#dataListGroup").append("<option value='" + groups[i] + "'/>");
        }
}

//The group has been created by a client. After that
//all other clients are being redirected after server
//response.

socket.on('appLogin01GroupCreated', function () {
        window.open("/login02.ejs", "_parent");
});

socket.on('shutdownPi', function () {
        $(".containerWarningShutdown").show();
});

socket.on('appSynchronizeTime', function () {
        $("#containerWarningServertime").show().delay(1000).fadeOut().animate({ opacity: 1, }, 1500);
});

socket.on('appLogin01CreatingGroupStart', function () {
        disableInput();
});
socket.on('appLogin01CreatingGroupError', function () {
        enableInput();
});

//Der Benutzer drückt den Submit Button
//Es wird auf dem Server überprüft ob
//der Gruppenname leer ist. Falls nein
//wird die Gruppe auf dem Server erstellt
//und eine Funktion aufgerufen.

$("#loginForm").submit(function (e) {
        disableInput();
        socket.emit("appLogin01CreatingGroupStart");
        e.preventDefault();
        $.ajax(
                {
                        type: "POST",
                        url: $("#loginForm").attr('action'),
                        data: $("#loginForm").serialize(),
                        success: function (result) {
                                loginResult(result);
                        }
                });
});

function disableInput() {
        $("#inputSubmitUsername").prop('disabled', true);
        $("#inputSubmitUsername").addClass("inputLoading");
        $("#inputSubmitUsername").css("background-color", "rgb(120,120,120)");
        $("#inputSubmitUsername").val("loading...");

        $("#loadingIconNoLoad").hide();
        $("#loadingIcon").show();
}
function enableInput() {
        $("#inputSubmitUsername").prop('disabled', false);
        $("#inputSubmitUsername").removeClass("inputLoading");
        $("#inputSubmitUsername").css("background-color", "rgb(0,0,0)");
        $("#inputSubmitUsername").val("continue");

        $("#loadingIconNoLoad").show();
        $("#loadingIcon").hide();
}


//Diese Funktion leitet den Benuter weiter
//wenn die Gruppe erfolgreich angegeben wurde.
//Alternativ hängt sie an ein Div eine
//Fehlermeldung an

function loginResult(result) {
        if (result == "loginSuccess") {
                //weiterleiten
                $("#containerLogin").hide();

                // LARA 13.07.2016
                // synchronize Pi's time
                var date = new Date();
                var month = (date.getUTCMonth() < 9 ? "0" + (date.getUTCMonth() + 1) : (date.getUTCMonth() + 1));
                var day = (date.getUTCDate() < 10 ? "0" + date.getUTCDate() : date.getUTCDate());
                var dateDate = date.getUTCFullYear() + "" + month + "" + day;
                var dateTime = date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
                // LARA end

                socket.emit("appSynchronizeTime", dateDate, dateTime);
                socket.emit("appLogin01GroupCreated");
                window.open("/login02.ejs", "_parent");
        }
        else {
                //fehlermeldung
                $("#loginNotice").html("");
                $("#loginNotice").append(result);
                $("#loginNotice").show().delay(2000).fadeOut().animate({ opacity: 1, }, 2500);

                enableInput();
                socket.emit("appLogin01CreatingGroupError");
        }
}
