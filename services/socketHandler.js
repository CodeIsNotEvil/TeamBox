const { exportData, synchronizeTime } = require('../services/syncHandler');
const { saveDataDrawStringToDB, updateUserLanguage, getMindMapContentFromDB, writeMindmap, clearDrawing } = require("./mysqlHandler");
const { PATH_TO_GLOBAL_MODULES } = require("../config/server");
/*const { JSDOM } = require(PATH_TO_GLOBAL_MODULES + 'jsdom');
const { window } = new JSDOM("");
const $ = require("../_jquery/jquery-1.12.3")(window);*/
const Group = require('./Group');
const { shutdownPi } = require('./piHeandler');
const drawApp = require('./drawApp/drawApp');
const cheerio = require(PATH_TO_GLOBAL_MODULES + 'cheerio')
const $ = cheerio.load("<container id='-1'></container>");

//SOCKET IO
function socketHandler(app, io) {
        io.on('connection', function (socket) {
                //Shuts down the Pi.
                //Sends a message to all client that the Pi will shutdown
                //after the content was exportet to the USB Stick a last time
                //Here should be an error message as well if the export fails

                socket.on("shutdownPi", function () {
                        io.sockets.emit('appExportMysqlStart');
                        exportData();
                        io.sockets.emit('appExportMysqlEnd');
                        io.sockets.emit('shutdownPi');
                        shutdownPi();
                });

                // LARA 13.07.2016 // 02.08.2016
                // Synchronize Pi's time by receiving client's timestap

                socket.on("appSynchronizeTime", function (dateDate, dateTime) {
                        synchronizeTime(dateDate, dateTime);
                        io.emit("appSynchronizeTime");
                });
                /*
                // check usb's size, free & used space
                socket.on("usbCheckFree", function()
                {
                        usbCheckFree();
                        io.emit("usbCheckFree");
                });
                */
                // LARA end

                //When a user enters a group name and clicks onto Create group
                //a message will be sent to all other clients even before the
                //validatition is processed. This messsage disables the CREATE
                //GROUP button for all other clients as long as a error may occur

                socket.on("appLogin01CreatingGroupStart", function () {
                        socket.broadcast.emit('appLogin01CreatingGroupStart');
                });

                //If a person entered a groupname and an error occurs during validatition
                //a message to all other clients is sent, that enables the control
                //over their formfields again

                socket.on("appLogin01CreatingGroupError", function () {
                        socket.broadcast.emit('appLogin01CreatingGroupError');
                });


                //If the validation of the groupname was successfull all other clients
                //should be redirected to login02 as well. This emit triggers a
                //pageload on the client side of all connected clients

                socket.on("appLogin01GroupCreated", function () {
                        socket.broadcast.emit('appLogin01GroupCreated');
                });

                //on client side this function is called with each page change.
                //each page has a different filename string. On each pageload
                //each client sends its username and filename to the server.
                //the server updates the username and filename in the clients
                //array and sends back the list of all connected clients with
                //updated user info to all clients. The clients now see, that
                //user "a" is not on page "c" anymore. So the user visualization
                //changes

                socket.on('appUpdateUsers', function (user, fileName) {
                        for (let i = 0; i < Group.clients.length; i++) {
                                if (Group.clients[i].username == user) {
                                        Group.clients[i].mindMapValue002 = fileName;
                                }
                        }
                        io.emit("appUpdateUsers", Group.clients, Group.user, fileName);
                });

                //everytime a user loads a page (without login01.ejs or login02.ejs
                //where no username variables exist) a request is sent to the server.
                //The server checks the parameter username with its clients VALUES
                //and sends back the desired language paramter to the requesting user

                socket.on('appGetLanguage', function (user) {
                        let language = "";

                        for (let i = 0; i < Group.clients.length; i++) {
                                if (Group.clients[i].username == user) {
                                        language = Group.clients[i].userlanguage;
                                }
                        }
                        io.to(socket.id).emit("appGetLanguage", language);
                });

                //If the user changes his language on hub.ejs this function
                //is triggered. The server checks the user array for the
                //requesting user and sends, changes the language variable
                //in the object and sends back the response.

                socket.on('appChangeLanguage', function (user, value) {
                        updateUserLanguage(user, value);
                        for (var i = 0; i < Group.clients.length; i++) {
                                if (Group.clients[i].username == user) {
                                        Group.clients[i].userlanguage = value;
                                }
                        }
                        io.to(socket.id).emit("appChangeLanguage", value);
                });

                //Everytime the focus on Mindmap App changes (usercolored border
                //around nodes) all other clients must be informed about these
                //changes. The userobject is altered and the server sends back
                //only the index to the client in order to prohibit double
                //array traverse on synchronizing client user array

                socket.on('appMindmaUpdateUserFocus', function (focusedElement, user, fileName) {
                        var index = -1;

                        for (var i = 0; i < Group.clients.length; i++) {
                                if (Group.clients[i].username == user) {
                                        Group.clients[i].mindMapValue001 = focusedElement;
                                        index = i;
                                }
                        }
                        io.emit('appMindmaUpdateUserFocus', focusedElement, index, fileName);
                });

                //this is only sent to the user that changes his focus.

                io.to(socket.id).emit('appMindmapAddNodeChangeFocus', null);


                //If any user opens the mindmap anytime, this function is being
                //triggered. It checks wether the entered filenime already EXISTS
                //in th mysql database. In each case of existance either the sql
                //query or a new string is appended to the html container that
                //is our semi-datastructure.
                //Only <tag data fileName="ololol"> is sent back to the client
                //since there may be multiple files opened parallel. Also the server
                //sends back a boolean value (newfile) which triggers the save function
                //on client-side.

                socket.on('appMindmapInsertFileStructure', function (fileName) {
                        //let { content, newFile } = getMindMapContentFromDB(fileName);
                        getMindMapContentFromDB(fileName, (content, newFile) => {
                                //console.log("socketHander.js socketOn 'appMindmapInsertFileStructure' content: " + content);
                                if ($("data[name=" + fileName + "]").length == 0) {
                                        $("container").append(content);
                                }
                                io.to(socket.id).emit('appMindmapInitialUser', $("data[name=" + fileName + "]").html(), newFile);
                                //io.to(socket.id).emit('appMindmapInitialUser', fileName, newFile);
                                //io.to(socket.id).emit('appMindmapInitialUser', content, newFile);
                        });



                });


                //If a user user disconnects, clients should be updated
                //This function needs some further work
                socket.on("disconnect", function () {
                        io.emit("appUpdateUsers", Group.clients);
                });


                //If a Node is added this function is triggered
                //It creates a node and sends back a response to
                //all clients inorder to synchronzize them to
                //all changes.
                //It also sends back the canged focus to the client
                //that created this node.

                socket.on('appMindmapAddNode', function (data, fileName) {
                        var isLeaf = false;
                        var width, height;
                        var id = uniqueId();

                        if (data[0] == "root") {
                                width = 120;
                                height = 30;
                        }
                        else {
                                width = 100;
                                height = 20;
                        }

                        $("data[name=" + fileName + "]").find("node").each(function () {
                                if (parseInt($(this).attr("id")) == data[3]) {
                                        isLeaf = true;
                                        var append = "<node id='" + id + "' posX='" + data[1] + "' posY='" + data[2] + "' type='" + data[0] + "' width='" + width + "' height='" + height + "' text='' color='" + $(this).attr("color") + "'></node>";
                                        $(this).append(append);

                                        io.emit('appMindmapAddNode', isLeaf, data[3], append, fileName);
                                        io.to(socket.id).emit('appMindmapAddNodeChangeFocus', id, fileName);
                                }
                        });

                        if (!isLeaf) {
                                var append = "<node id='" + id + "' posX='" + data[1] + "' posY='" + data[2] + "' type='" + data[0] + "' width='" + width + "' height='" + height + "' text='' color='#2b2b2b'></node>";
                                $("data[name=" + fileName + "]").append(append);
                                io.emit('appMindmapAddNode', isLeaf, data[3], append, fileName);
                                io.to(socket.id).emit('appMindmapAddNodeChangeFocus', id, fileName);
                        }
                });

                function uniqueId() {
                        return Math.round(new Date().getTime() + (Math.random() * 100));
                }

                //This function is called whenever a Node element
                //was altered and needs to be sent to the server and
                //to all of the other clients. Exception for this is
                //the addition of children to a parent node when a
                //new node is created.

                socket.on('appMindmapAlterNode', function (node, parentContent, fileName) {
                        $("data[name=" + fileName + "]").find("node[id='" + node + "']").parent().html(parentContent);
                        io.emit('appMindmapAlterNode', node, parentContent, fileName);
                });

                //When a user changes an elements value the
                //data are sent to the server. The server nodes
                //are updated on server side

                socket.on('appMindmapUpdateAlterText', function (node, text, fileName) {
                        $("data[name=" + fileName + "]").find("node[id='" + node + "']").attr("text", text);

                        socket.emit('appMindmapUpdateAlterText', node, text, "sender", fileName);
                        socket.broadcast.emit('appMindmapUpdateAlterText', node, text, "all", fileName);
                });

                //when a user changes the color of an element
                //the new color and the node id is sent to the server.
                //the server changes the nodes and the node's children's
                //color in a loop and sends back only the color and id of
                //the node so the client does this procedure on it's own
                //again. This minimizes the amount of transfered data, if
                //the amount of changed nodes is very large.

                socket.on('appMindmapUpdateAlterColor', function (node, color, fileName) {
                        nodesChangeColor(node, color, fileName)

                        io.emit('appMindmapUpdateAlterColor', node, color, fileName);
                });


                function nodesChangeColor(node, color, fileName) {
                        node = $("data[name=" + fileName + "]").find("node[id='" + node + "']");
                        let childstring = node + ' > node';
                        //let children = $(childstring);
                        $(node).attr("color", color);
                        /*
                        for (let i = 0; i < children.length; i++) {
                                nodesChangeColor(children[i].id, color);
                        }*/
                }

                //if this function is called, the id of the object which
                //should be deleted is sent to the server, if it
                //is not null.

                socket.on('appMindmapDeleteNode', function (index, fileName) {
                        if ($("data[name=" + fileName + "]").find("node[id='" + index + "']").parent().is("data[name=" + fileName + "]")) {
                                $("data[name=" + fileName + "]").find("node[id='" + index + "']").children().each(function () {
                                        $(this).attr("type", "root");
                                        $(this).attr("width", 120);
                                        $(this).attr("height", 30);
                                        $(this).attr("posX", parseInt($(this).attr("posX")) - 10);
                                        $(this).attr("posY", parseInt($(this).attr("posY")) - 5);
                                });
                        }
                        var contents = $("data[name=" + fileName + "]").find("node[id='" + index + "']").html();

                        $("data[name=" + fileName + "]").find("node[id='" + index + "']").parent().append(contents);
                        $("data[name=" + fileName + "]").find("node[id='" + index + "']").remove();

                        io.emit('appMindmapDeleteNode', index, contents, fileName);
                });

                //NOT IMPLEMENTED ATM

                socket.on('appMindmapChangeParent', function (index, newParent) {
                        var clone = $("node[id='" + index + "']").clone();
                        clone.html("");

                        var contents = $("node[id='" + index + "']").contents();
                        $("node[id='" + index + "']").replaceWith(contents);
                        $("node[id='" + newParent + "']").append(clone);

                        io.emit('appMindmapChangeParent', index, newParent);
                });

                //Deletes the Node + its whole SubElements
                //the id of the object which should be deleted
                //is sent to the server.

                socket.on('appMindmapDeleteSubtree', function (index, fileName) {
                        $("data[name=" + fileName + "]").find("node[id='" + index + "']").remove();

                        io.emit('appMindmapDeleteSubtree', index, fileName);
                });

                //Saves the whole mindmap. Only the open file is being saved.
                //Parallel files are not saved.

                socket.on('appMindmapSave', function (content, image, fileName) {
                        content = $("data[name=" + fileName + "]").html();
                        //console.log("content:\n" + content + "\nfileName: " + fileName);
                        writeMindmap(content, fileName);


                        var data = image.replace(/^data:image\/\w+;base64,/, '');
                        var fs = require("fs");

                        var path = "/var/www/html/app/screenshots/mindmap_" + fileName + ".png";

                        fs.writeFile(path, data, { encoding: 'base64' }, function (err) {
                                let errorMessage;
                                if (err == "" || err == null) {
                                        console.log("EXEC :: IMAGESAVE:\t\tSUCCESS");
                                }
                                else {
                                        console.log("EXEC :: IMAGESAVE:\t\tERROR: \n" + err);
                                        errorMessage += "Image: Fehler beim Speichern!";
                                }
                                io.emit('appMindmapSave', fileName, errorMessage);
                        });
                });

                //NENA BEGIN
                /*
                * function to handle obj Data and send to Clients
                */
                socket.on('sendObj', function (obj, username, fileName) {
                        //console.log("object: " + obj);
                        drawApp.addObject(obj);
                        //console.log("allObj sendObjsfun:  " + obj);
                        socket.broadcast.emit('receiveObj', obj, username, fileName);
                }
                );
                /*
                * function to handle clear-command and send to Clients
                */
                socket.on('clear', function (fileName) {
                        socket.broadcast.emit('clear', fileName);
                        drawApp.clearDrawing(fileName);
                }
                );
                /*
                * function to handle save Obj 
                */
                socket.on('appDrawingSave', function (image, fileName) {
                        let string = drawApp.createString(fileName); //get the image string
                        saveDataDrawStringToDB(string, image, fileName, (image, fileName) => {
                                let data = image.replace(/^data:image\/\w+;base64,/, '');
                                var fs = require("fs");
                                let path = "/var/www/html/app/drawings/draw_" + fileName + ".png";
                                fs.writeFile(path, data, { encoding: 'base64' }, function (err) {
                                        io.emit('appDrawingSave', fileName);
                                });

                        }); //save allObj as String in database

                });
                //NENA END
        });

        //NENA BEGIN

}

module.exports = socketHandler;

