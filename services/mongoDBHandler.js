const { PATH_TO_GLOBAL_MODULES, PATH_TO_MODELS } = require("../config/server");
const SYNC_EXEC = require(PATH_TO_GLOBAL_MODULES + 'sync-exec');
const Group = require('./Group');
//const mongoose = require(PATH_TO_GLOBAL_MODULES + 'mongoose');
//const fs = require('fs');


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
function clearMongoDBOnStartUp() {
  let error = SYNC_EXEC("sudo mongorestore --drop /home/ubuntu/files").stderr;
  console.error(error);
}
function importEmptyWekanDB() {
  let error = SYNC_EXEC("sudo mongorestore /home/ubuntu/files").stderr;
  console.error(error);
}
function importGroupWekanDB() {
  let error = SYNC_EXEC("sudo mongorestore /media/USB-TeamBox/TeamBox/" + Group.group + "/.meta/").stderr;
  console.error(error);
}
function exportWekanDB() {
  let error = SYNC_EXEC("sudo mongodump --db=wekan --out=/media/USB-TeamBox/TeamBox/" + Group.group + "/.meta/").stderr;
  console.error(error);
}

module.exports = {
  clearMongoDBOnStartUp,
  importEmptyWekanDB,
  importGroupWekanDB,
  exportWekanDB
}