var socket = io();


//The group has been created by a client. After that
//all other clients are being redirected after server
//response.

socket.on('appLogin01GroupCreated', function () {
        window.open("/login02.ejs", "_parent");
});

socket.on('shutdownPi', function () {
        $(".containerWarningShutdown").show();
});

socket.on('appExportMysqlStart', function () {
        $("#containerWarningExporting").show();
});
socket.on('appExportMysqlEnd', function () {
        $("#containerWarningExporting").hide();
});

socket.on('appSynchronizeTime', function () {
        $("#containerWarningServertime").show().delay(1000).fadeOut().animate({ opacity: 1, }, 1500);
});



//Der Benutzer drückt den Submit Button
//Es wird auf dem Server überprüft ob
//der Benutzername leer ist oder ob ein
//Benutzer mit diesem Namen bereits existiert.
//Das Server Response wird an loginResult()
//weiter gegeben

$("#loginForm").submit(function (e) {
        disableInput();

        e.preventDefault();
        $.ajax(
                {
                        type: "POST",
                        url: $("#loginForm").attr('action'),
                        data: $("#loginForm").serialize(),
                        success: function (result) {
                                console.log(result);
                                loginResult(result)
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

//Der Benutzer wird weiter geleitet, Falls
//Benutzername nicht leer oder vergeben ist.
//Andernfalls wird eine Fehlermeldung an ein
//entsprechendes div angehängt

function loginResult(result) {
        if (result == "loginSuccess") {
                //weiterleiten
                $("#containerLogin").hide();
                $("#loadingIcon").show();
                $("#loadingIconNoLoad").hide();

                window.open("/hub.ejs", "_parent");
        }
        else {
                //fehlermeldung
                $("#loginNotice").html("");
                $("#loginNotice").append(result);
                $("#loginNotice").show().delay(2000).fadeOut().animate({ opacity: 1, }, 2500);
        }
        enableInput();
}
