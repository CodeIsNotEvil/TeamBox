


module.exports = function shutdownPi() {
    var isError = syncExec(PATH_TO_BASH_SCRIPTS + "group_delete.sh && sudo shutdown now").stderr;

    if (isError == "" && isError != null) {
            console.log("EXEC :: SHUTDOWNPI:\t\tSUCCESS");
    }
    else {
            console.log("EXEC :: SHUTDOWNPI:\t\tERROR: \n" + isError);
    }
}