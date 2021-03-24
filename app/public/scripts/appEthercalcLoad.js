var socket = io();

var language = "";

function initializePage() {
  socket.emit("appGetLanguage", username);
}
initializePage();

//Sets the language on startup

socket.on('appGetLanguage', function (value) {
  language = value;
});

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

//Die vom USB STICK geladenen Dateien:
//Sofern Dateien existieren werden die
//Einträge angehängt an das EingabeFeld

if (data.length > 0) {
  for (var i = 0; i < data.length; i++) {
    $("#dataListData").append(
      "<option value='" + data[i] + "'/>"
    );
  }
}


//Der Benutzer drückt den Submit Button
//Es wird auf dem Server überprüft ob
//der Benutzername leer ist oder ob ein
//Benutzer mit diesem Namen bereits existiert.
//Das Server Response wird an loginResult()
//weiter gegeben

$("#appLoadForm").submit(function (e) {
  e.preventDefault();

  $("#inputAppLoadSubmit").prop('disabled', true);
  $("#inputAppLoadSubmit").addClass("inputLoading");
  $("#inputAppLoadSubmit").css("background-color", "rgb(120,120,120)");
  $("#inputAppLoadSubmit").val("lädt...");

  if ($("#inputAppLoadFilename").val().length === 0) {
    loginResult("noText");
  }
  else if (/^[a-zA-Z0-9- ]*$/.test($("#inputAppLoadFilename").val()) == false) {
    loginResult("specialChars");
  }
  else {
    loginResult("loginSuccess");
  }
});

//Der Benutzer wird weiter geleitet, Falls
//der Dateiname nicht leer oder falls keine
//Sonderzeichen enthalten sind.
//In diesem Fall wird eine Fehlermeldung an ein
//entsprechendes div angehängt

function loginResult(result) {
  if (result == "loginSuccess") {
    //weiterleiten
    $("#containerCalculatorStart").hide();
    $("#loadingIcon").show();
    $("#loadingIconNoLoad").hide();

    var url = $("#inputAppLoadFilename").val().replace(/[_\W]+/g, "");

    window.open("http://teambox.local:8000/" + url, "_parent");
  }
  else if (result == "noText") {
    //fehlermeldung: no text
    $("#loginNotice").html("");
    $("#loginNotice").append("Bitte wähle einen Dateinamen.");
    $("#loginNotice").show().delay(2000).fadeOut().animate({ opacity: 1, }, 2500);
  }
  else if (result == "specialChars") {
    //fehlermeldung: special chars
    $("#loginNotice").html("");
    $("#loginNotice").append("Im Dateinamen sind keine Sonderzeichen erlaubt.");
    $("#loginNotice").show().delay(2000).fadeOut().animate({ opacity: 1, }, 2500);
  }

  $("#inputAppLoadSubmit").prop('disabled', false);
  $("#inputAppLoadSubmit").removeClass("inputLoading");
  $("#inputAppLoadSubmit").css("background-color", "rgb(45,45,45)");
  $("#inputAppLoadSubmit").val("weiter");
}
