const { PATH_TO_GLOBAL_MODULES, PATH_TO_MODELS } = require("../config/server");
const SYNC_EXEC = require(PATH_TO_GLOBAL_MODULES + 'sync-exec');
//const mongoose = require(PATH_TO_GLOBAL_MODULES + 'mongoose');
//const fs = require('fs');
const groupHandler = require("./groupHandler");


//Setup connnection

//static connection = mongoose.connect('mongodb://localhost:27017/wekan');
/*
  static loadModels() {
    //load all files in models dir
    fs.readdirSync(PATH_TO_MODELS + '/wekan/').forEach(function (filename) {
      if (~filename.indexOf('.js')) require(PATH_TO_MODELS + '/wekan/' + filename)
    });
  }
*/
function importEmptyWekanDB() {
  let error = SYNC_EXEC("sudo bash mongorestore /home/ubuntu/files").stderr;
  console.error(error);
}
function importGroupWekanDB() {
  let error = SYNC_EXEC("sudo bash mongorestore /media/USB-TeamBox/TeamBox/" + groupHandler.group + "/.meta/").stderr;
  console.error(error);
}
function exportWekanDB() {
  let error = SYNC_EXEC("sudo bash mongodump --db=wekan --out=/media/USB-TeamBox/TeamBox/" + groupHandler.group + "/.meta/").stderr;
  console.error(error);
}

module.exports = {
  importEmptyWekanDB,
  importGroupWekanDB,
  exportWekanDB
}