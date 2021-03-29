const { PATH_TO_GLOBAL_MODULES } = require("../config/server");
const SYNC_EXEC = require(PATH_TO_GLOBAL_MODULES + 'sync-exec');
const Group = require('./Group');
const fs = require('fs');
const asyncExec = require('child_process').exec;

/**
 * Checks if the Selected Group has already a wekan database,
 * wich should be stored on the USB Stick at the folder of that Group
 * @returns {boolean} true if the group has a wekan database and false if not.
 */
function hasSelectedGroupWekanDB() {
  try {
    fs.readdirSync("/media/USB-TeamBox/TeamBox/" + Group.group + "/.meta/wekan");
    return true;
  } catch (error) {
    //console.debug(error);
    return false;
  } finally {
    fs.close;
  }
}

/**
 * Imports the Wekan Database accordingly to wether a group has already a Wekan Database or not.
 * @returns {boolean} Wether the import was successful.
 */
function importWekanDB() {
  if (hasSelectedGroupWekanDB()) {
    console.log("The Wekan Database exists and is associated with this group.\nImporting the Wekan Database of this group...");
    if (importGroupWekanDB()) {
      console.log("The Wekan Database was imported.");
    }
  } else {
    console.log("The Wekan Database either not exists or is not associated with this group.\nImporting empty Wekan Database...");
    if (importEmptyWekanDB()) {
      console.log("The Wekan Database was imported.");
    } else {
      return false;
    }
  }
  return true;
}

/**
 * Imports the empty Wekan Database located at /home/ubuntu/files
 * @returns {boolean} Wether the import was successfully or not.
 */
function importEmptyWekanDB() {
  let error = SYNC_EXEC("sudo mongorestore --drop /home/ubuntu/files").stderr;
  if (error == "") {
    Group.wekanDBIsImported = true;
  } else {
    console.error(error);
    return false;
  }
  return true;
}

/**
 * Imports the Group specific Database.
 * @returns {boolean} Wether the import was successfully or not.
 */
function importGroupWekanDB() {
  let error = SYNC_EXEC("sudo mongorestore --drop /media/USB-TeamBox/TeamBox/" + Group.group + "/.meta/").stderr;
  if (error == "") {
    Group.wekanDBIsImported = true;
  } else {
    console.error(error);
    return false;
  }
  return true;
}

/**
 * Exports the Group specific Database to the USB folder.
 * @param {boolean} synchron Wether it should export sychron or asynchron.
 * @returns {boolean} Wether it exported successfully or not.
 */
function exportWekanDB(synchron) {
  if (synchron) {
    let error = SYNC_EXEC("sudo mongodump --db=wekan --out=/media/USB-TeamBox/TeamBox/" + Group.group + "/.meta/").stderr;
    if (error == "") {
      Group.wekanDBIsImported = false;
      console.log("Wekan Database was exported Successfully.")
      return true;
    } else {
      console.error(error);
      return false;
    }
  } else {
    asyncExec("sudo mongodump --db=wekan --out=/media/USB-TeamBox/TeamBox/" + Group.group + "/.meta/", (err, stdout, stderr) => {
      if (err == null) {
        console.log("Wekan Database was exported Successfully.")
        return true;
      } else {
        console.error(error);
        return false;
      }
    });
  }

}


module.exports = {
  importWekanDB,
  exportWekanDB
}