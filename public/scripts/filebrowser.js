//let socket = io();

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