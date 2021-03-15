  function user(cUserName, cUserColor)
  {
        this.userName         = cUserName;
        this.userColor        = cUserColor;
        this.mindMapValue001  = "";
        this.mindMapValue002  = "";
        this.settingsLanguage = "ENG";
  }

  //Initializiation of some variables.

  var socket              = io();
  var usersConnected      = new Array();
  var cv                  = document.getElementById('canvas');
  var ctx                 = document.getElementById('canvas').getContext("2d");
  var iconAddNode         = new Image();
      iconAddNode.src     = 'styles/media/addNode.png';
  var iconDeleteNode      = new Image();
      iconDeleteNode.src  = 'styles/media/deleteNode.png';
  var imagePattern        = new Image();
      imagePattern.src    = 'styles/media/pattern.png';


  //when the website is opened or when there
  //are any changes in size of the window these
  //functions are called. They (at the moment)
  //mainly handle changes in size of certaind divs
  //like the header bar or the canvas element.


  $(document).ready( function()
  {
    cv.width                  = window.innerWidth;
    cv.height                 = window.innerHeight;
    $("#container02").width   = window.innerWidth;
    $("#container02").height  = window.innerHeight;

    //The document fills the filename variable with
    //the parameter data of it's url. if the fileName
    //var is either empty or the filename var contains
    //html special chars, in both cases the filename
    //var's value is set to the default value "-name-"
    //Once this is processed, the filename var is sent to
    //the server. If a database record to that var exists,
    //it is selected and sent to the client. Ift this is
    // not the case, a database entry will be generated.

    fileName = getUrlVariable("file");

    if(fileName == "" || fileName == null)
    {
      fileName = "-name-";
    }
    else if(/^[a-zA-Z0-9- ]*$/.test(fileName) == false)
    {
      fileName = "-name-";
    }

    createFileStructure();
    updateUserFocus();
    initializePage();

  });
  $(window).resize( function()
  {
    cv.width                  = window.innerWidth;
    cv.height                 = window.innerHeight;
    $("#container02").width   = window.innerWidth;
    $("#container02").height  = window.innerHeight;
  });



  //The mainloop updates the draw and seveal
  //other functions every 30 milliseconds. Maybe
  //later i will decide to replace it with
  //functions that only trigger the render
  //(draw) function if changes really happened
  //instead of looping through all objects
  //all the time. Since this is a client-server
  //app, it should be called everytime, any
  //user makes changes, like: new node, create
  //node, alter node, node position Change, etc.


  window.requestAnimFrame =(function()
  {
    return  window.requestAnimationFrame      ||
            window.webkitRequestAnimationFrame||
            window.mozRequestAnimationFrame   ||
            window.oRequestAnimationFrame     ||
            window.msRequestAnimationFrame    ||
            function(callback)
            {
              window.setTimeout(callback, 1000/60);
            };
  })();


//standard drawing routine to draw everything
//on canvas. Most of the objects are stored
//within an array, that is looped through with
//each render call, all 33ms. This is a simple
//solution for smaller amounts of objects. In
//case for better performance the objects should
//be stored within a quad-tree data structure.
//Same goes for collission detection.

function draw(showUI)
{
        clearCanvas();

        ctx.fillStyle = ctx.createPattern(imagePattern, "repeat");
        ctx.translate(posX, posY);
        ctx.scale(scale, scale);
        ctx.fillRect(0 - posX/scale, 0 - posY/scale, window.innerWidth/scale, window.innerHeight/scale);
        ctx.scale(1/scale, 1/scale);
        ctx.translate(-posX, -posY);


        $("node").each(function()
        {
                var x       = parseInt($(this).attr("posX"));
                var width   = parseInt($(this).attr("width"));
                var y       = parseInt($(this).attr("posY"));
                var height  = parseInt($(this).attr("height"));
                var text    = $(this).attr("text");
                var color   = $(this).attr("color");
                var id      = $(this).attr("id");

                $(this).children().each( function()
                {
                        var cx       = parseInt($(this).attr("posX"));
                        var cwidth   = parseInt($(this).attr("width"));
                        var cy       = parseInt($(this).attr("posY"));
                        var cheight  = parseInt($(this).attr("height"));

                        ctx.beginPath();
                        ctx.lineWidth = 1 * scale;
                        ctx.strokeStyle = 'rgb(155,155,155)';
                        ctx.moveTo(x  * scale + posX +  (width / 2 * scale),   y  * scale + posY + ( height / 2 * scale));
                        ctx.lineTo(cx * scale + posX + (cwidth / 2 * scale),   cy * scale + posY + (cheight / 2 * scale));
                        ctx.stroke();
                        ctx.closePath();
                });

                for(var i = 0; i < usersConnected.length; i++)
                {
                        if(usersConnected[i].mindMapValue001 == $(this).attr("id") && usersConnected[i].mindMapValue002 == fileName && showUI)
                        {
                                ctx.lineWidth = 7*scale;
                                ctx.strokeStyle = usersConnected[i].userColor;
                                ctx.strokeRect((x * scale + posX) ,   (y * scale + posY) ,   (width * scale) ,    (height * scale));
                        }
                }

                ctx.beginPath();
                ctx.fillStyle = color;
                ctx.rect(x * scale + posX, y * scale + posY, width * scale, height * scale);
                ctx.fill();
                ctx.closePath();

                if(scale > 0.4)
                {
                        ctx.font = 12 * scale + "px Arial";
                }
                else
                {
                        ctx.font = "0px Arial";
                }
                ctx.fillStyle = "rgba(255,255,255,1)";
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                ctx.fillText(text, (x * scale + posX )+ (width / 2)*scale, (y * scale + posY) + (height / 2)*scale,  (width * scale) - (width * scale * 0.1)  );
        });

        //Draw the Add Node Sign only one time!
        if(focusedElement != null  && showUI)
        {
                var x       = parseInt($("node[id="+focusedElement+"]").attr("posX"));
                var width   = parseInt($("node[id="+focusedElement+"]").attr("width"));
                var y       = parseInt($("node[id="+focusedElement+"]").attr("posY"));
                var height  = parseInt($("node[id="+focusedElement+"]").attr("height"));

                ctx.beginPath();
                ctx.lineWidth = 7 * scale;
                ctx.strokeStyle = "rgb(155,155,155)";
                ctx.strokeRect((x * scale + posX) + (width + 20) * scale,   (y * scale + posY), height * scale, height * scale);

                ctx.rect((x * scale + posX) + (width + 20) * scale,   (y * scale + posY), height * scale, height * scale);
                ctx.fillStyle = "#ffffff";
                ctx.fill();

                ctx.drawImage(iconAddNode,(x * scale + posX) + (width + 20) * scale,   (y * scale + posY), height * scale, height * scale);
                ctx.closePath();

                ctx.beginPath();
                ctx.lineWidth = 7 * scale;
                ctx.strokeStyle = "rgb(155,155,155)";
                ctx.strokeRect((x * scale + posX) + (width + height + 35) * scale,   (y * scale + posY), height * scale, height * scale);

                ctx.rect((x * scale + posX) + (width + height + 35) * scale,   (y * scale + posY), height * scale, height * scale);
                ctx.fillStyle = "#ffffff";
                ctx.fill();

                ctx.drawImage(iconDeleteNode,(x * scale + posX) + (width + height + 35) * scale,   (y * scale + posY), height * scale, height * scale);
                ctx.closePath();
        }
}

function clearCanvas()
{
        cv.width = cv.width;
}

//The group has been created by a client. After that
//all other clients are being redirected after server
//response.

socket.on('appLogin01GroupCreated', function()
{
        window.open("/login02.ejs", "_parent");
});

//Open Popup when the Pi shuts down.

socket.on('shutdownPi', function()
{
        $(".containerWarningShutdown").show();
});

socket.on('appExportMysqlStart', function()
{
        $("#containerWarningExporting").show();
});
socket.on('appExportMysqlEnd', function()
{
        $("#containerWarningExporting").hide();
});

socket.on('appSynchronizeTime', function()
{
        $("#containerWarningServertime").show().delay(1000).fadeOut().animate({opacity: 1,}, 1500 );
});

//get Url variable
var fileName = null;

function getUrlVariable(variable)
{
        var query  = window.location.search.substring(1);
        var vars   = query.split("&");

        for ( var i=0; i < vars.length; i++)
        {
                var pair = vars[i].split("=");

                if(pair[0] == variable)
                {
                        return pair[1];
                }
        }
        return(false);
}


function createFileStructure()
{
        socket.emit("appMindmapInsertFileStructure", fileName);
}


//Save Mindmap data. The current data are being
//sent to the server and inserted into a new line
//inside the sql TABLE. If the dataset exists, the
//content will be overwritten.

function saveData()
{
        draw(false);
        var image     =  canvas.toDataURL("image/png");
        socket.emit("appMindmapSave", image,  fileName);
}

  socket.on('appMindmapSave', function(file, errorMessage)
  {
    if(file == fileName)
    {
      if(errorMessage == "")
      {
        $("#sidebarItemSaveNotice").html("File saved successfully");
      }
      else
      {
        $("#sidebarItemSaveNotice").html(errorMessage);
      }

      $("#sidebarItemSaveNotice").show().delay(2000).fadeOut().animate({opacity: 1,}, 2500 );
    }
  });


//This function will create a Screenshot of the
//canvas. It may be replaced later in order for
//the creation of vector graphics etc.

function saveScreenshot()
{
        draw(false);


        var cvScreenshot        = document.createElement('canvas');
        var ctxScreenshot       = cvScreenshot.getContext('2d');

        cvScreenshot.width      = cv.width;
        cvScreenshot.height     = cv.height;

        ctxScreenshot.drawImage(cv, 0, 0);

        var image               =  cvScreenshot.toDataURL("image/png").replace("image/png", "image/octet-stream");



        var date                = new Date();
        // LARA 22.07.2016
	//var imageName          = "screenshot_" + date.getDay() + "_" + (date.getMonth()+1) + "_" + date.getYear() + "_" + date.getHours() + "_" + date.getMinutes() + "_" + date.getSeconds() + ".png";
	var imageName            = "mindmap_"+fileName+"_"+date.getTime()+".png";
	// LARA end

        var link                = document.createElement('a');
        link.download           = imageName;
        link.href               = image;
	// LARA 22.07.2016
	link.style.display = 'none';
	document.body.appendChild(link);
	//window.location.assign(link.href);
	// LARA end
        link.click();

        $("#sidebarItemSaveNotice").html("Image has been saved sucessfully");
        $("#sidebarItemSaveNotice").show().delay(2000).fadeOut().animate({opacity: 1,}, 2500 );
}

//Update User List
//On each page load the server creates
//a new socket. At the same time the users
//array is sent to each client. The array is
//not updatet by socket actions only by login
//and logout actions.

language = "";

function initializePage()
{
        socket.emit("appUpdateUsers", username, fileName);
        socket.emit("appGetLanguage", username);
}

socket.on('appUpdateUsers', function(users, user, file)
{
        usersConnected = users;

        $("#containerOnlineUser").html("Online sind: ");

        for(var i = 0; i < usersConnected.length; i++)
        {
                if(usersConnected[i].mindMapValue002 == fileName)
                {
                        if(usersConnected[i].userName == username)
                        {
                                $("#containerOnlineUser").append("<font style='padding: 6px 3px 7px 3px; border-radius: 3px; color: #ffffff; background-color:"+usersConnected[i].userColor+";'>"+usersConnected[i].userName+"</font> ");
                        }
                        else
                        {
                                $("#containerOnlineUser").append("<font style='padding: 3px 3px 4px 3px; border-radius: 3px; color: #ffffff; background-color:"+usersConnected[i].userColor+";'>"+usersConnected[i].userName+"</font> ");
                        }
                }
        }
});

socket.on('appGetLanguage', function(value)
{
        language = value;
});


//USER CONNECTS: Download Data for User, Update Userlist
//for all Users when a new user connects all server Nodes
//are sent to only the newly connecty client. The server
//array that holds all connected users is sent to all
//clients as well in order to rewrite the current user array.
//The array is updatet as well, if a user disconnects. In that
//case the server side array is sent to all clients as well.

socket.on('appMindmapInitialUser', function(content, newFile)
{
        $("#content").html(content);

        if($("#content").children().length > 0)
        {
                $("#sidebarItemPlaceholder").show();
        }
        if(newFile == true)
        {
                saveData();
        }
});
socket.on('appMindmapNewUser', function(userName, userColor)
{
        usersConnected.push(new user(userName, userColor));
});
socket.on('appUpdateUsers', function(users)
{
        usersConnected = users;
});


//Function to Create a Node.
//Nodetype, posX, posY and parent Node is sent to
//the server. The server pushes the node to the xml
//string that defines all nodes and send back the
//updated content to all clients

function createNode(type)
{
        if(type == "normal" && focusedElement != null)
        {
                var x = parseInt($("node[id="+focusedElement+"]").attr("posX"))*1 +  parseInt($("node[id="+focusedElement+"]").attr("width")*1 + 50);
                var y = parseInt($("node[id="+focusedElement+"]").attr("posY"));

                var data = new Array();
                  data[0] = type;
                  data[1] = x;
                  data[2] = y;
                  data[3] = focusedElement;

                closeWarning();
                socket.emit("appMindmapAddNode", data, fileName);
        }
        else if(type == "root")
        {
                var data = new Array();
                data[0] = type;
                data[1] = ( (window.innerWidth / 2) - posX - 50) / scale;
                data[2] = ((window.innerHeight / 2) - posY - 10) / scale;
                data[3] = null;

                closeWarning();
                socket.emit("appMindmapAddNode", data, fileName);
        }
}


//CREATED SERVER OBJECT BACK TO CLIENT. If it is
//the root element, the content is append to the
//outer xml container. If the created node is not
//root, it is appened to the parent index

socket.on('appMindmapAddNode', function(isLeaf, parent, content, file)
{
        if(fileName == file)
        {
                if(isLeaf)
                {
                        $("node[id='"+parent+"']").append(content);
                }
                else
                {
                        $("#content").append(content);
                }
        }
});

//this is only sent to the client which added the node to
//the server. it changes the focused element to the newly
//created element. After that updateUserFocus is sent to
//the server again to synchronize the new user selection to
//other clients

socket.on('appMindmapAddNodeChangeFocus', function(index, file)
{
        if(file == fileName)
        {
                lockNodeCreation = false;
                focusedElement  = index;
                $("#inputChangeElementText").blur();
                updateUserFocus();
                openCloseMenu();
        }
});


//This function is called whenever a Node element
//was altered and needs to be sent to the server and
//to all of the other clients. Exception for this is
//the addition of children to a parent node when a
//new node is created.

function alterNode(node, changeIt)
{
        if(changeIt == "position")
        {
                var parentContent = $("node[id='"+node+"']").parent().html();

                socket.emit("appMindmapAlterNode", node, parentContent, fileName);
        }
}

//If there are any changes to an element.
//position etc. the server sends back the
//parent nodes content (subtree) and appends
//it to the nodes parent node to overried
//previous values

socket.on('appMindmapAlterNode', function(node, parentContent, file)
{
        if(file == fileName)
        {
                $("node[id='"+node+"']").parent().html(parentContent);
        }
});


//When a user changes an elements value the
//data are sent to the server. The server nodes
//are updated on server side

$("#inputChangeElementText").on("input", function()
{
        socket.emit("appMindmapUpdateAlterText", focusedElement, $("#inputChangeElementText").val(), fileName );
});


//as soon as the server gives back the node's
//updated attributes to all clients, the
//attributes of the changed element are updated.
//moreover the input text is updated if the user
//has the node selected which has been changed.

socket.on('appMindmapUpdateAlterText', function(node, text, client, file)
{
        //the input value does not have to changed here.
        //If it would be changed, the user would ged problems
        //while typing.
        if(file == fileName)
        {
                $("node[id='"+node+"']").attr("text", text);

                //for all other users, the opened input is going
                //to be changed. Moreover warmings are being closed
                //since the element changed

                if(focusedElement == node && client == "all")
                {
                        $("#inputChangeElementText").val(text);
                        closeWarning();
                }
        }
});


//when a user changes the color of an element
//the new color and the node id is sent to the server.
//the server changes the nodes and the node's children's
//color in a loop and sends back only the color and id of
//the node so the client does this procedure on it's own
//again. This minimizes the amount of transfered data, if
//the amount of changed nodes is very large.

function changeColor(color)
{
        socket.emit("appMindmapUpdateAlterColor", focusedElement, color, fileName);
}

socket.on('appMindmapUpdateAlterColor', function(index, color, file)
{
        if(file == fileName)
        {
                nodesChangeColor(index, color);

                if(index == focusedElement || ($("node[id='"+focusedElement+"']").parents("node[id='"+index+"']").length == 1))
                {
                        closeWarning();
                }
        }
});

function nodesChangeColor(index, color)
{
        var node      = "node[id='"+index+"']";
        var children  = $(node+"> node");

        if(focusedElement == index)
        {
                $("#inputChangeElementColor").val(color);
        }

        $(node).attr("color", color);

        for(var i = 0; i < children.length; i++)
        {
                nodesChangeColor( children[i].id, color );
        }
}

//the focuesed node's id and the username of
//the editor is sent to the server.

function updateUserFocus()
{
        socket.emit("appMindmaUpdateUserFocus", focusedElement, username, fileName);
}

//The server sents a response with the changed
//user object's value to all clients. The clients
//synchronize these changes with their user objects.

socket.on('appMindmaUpdateUserFocus', function(focusedElement, user, file)
{
        if(usersConnected[user] != undefined)
        {
                if(file == fileName)
                {
                        usersConnected[user].mindMapValue001 = focusedElement;
                        usersConnected[user].mindMapValue002 = file;
                }
                else
                {
                        usersConnected[user].mindMapValue001 = null;
                }
        }
});

//if this function is called, the id of the object which
//should be deleted is sent to the server, if it
//is not null.

function deleteNode()
{
        var index = focusedElement;

        if(index != null)
        {
                socket.emit("appMindmapDeleteNode", index, fileName);
        }
}

//the server sends back the new parent's contents
//and appends it to the object's to deletes parent.
//afterwards the object to delete is removed.

socket.on('appMindmapDeleteNode', function(index, contents, file)
{
        if(file == fileName)
        {
                $("node[id='"+index+"']").parent().append(contents);
                $("node[id='"+index+"']").remove();

                if(index == focusedElement)
                {
                        focusedElement = null;
                        openCloseMenu();
                        closeWarning();
                }
        }
});

//Deletes the Node + its whole SubElements
//the id of the object which should be deleted
//is sent to the server.

function deleteSubTree()
{
        var index = focusedElement;

        if(index != null)
        {
                socket.emit("appMindmapDeleteSubtree", index, fileName);
        }
}

//after the server updatet the xml on server side
//it just sends back the id of the element which
//should be deleted including its subelements.

socket.on('appMindmapDeleteSubtree', function(index, file)
{
        if(file == fileName)
        {
                if(index == focusedElement || ($("node[id='"+focusedElement+"']").parents("node[id='"+index+"']").length == 1))
                {
                        focusedElement = null;
                        openCloseMenu();
                        closeWarning();
                }
                $("node[id='"+index+"']").remove();
        }
});



//for testing. Press key "n" to create new Node

$(document).keyup(function(e)
{
        if(e.keyCode == 27)
        {
                focusedElement = null;
                closeWarning();
                openCloseMenu();
                updateUserFocus();
        }

        if($("#containerWarningDeleteSubtree").is(":hidden") && $("#containerWarningDeleteNode").is(":hidden"))
        {
                if(e.keyCode == 13)
                {
                        $("#inputChangeElementText").blur();
                }
                if(e.keyCode == 46)
                {
                openWarning("node");
                }
                if(e.keyCode == 35)
                {
                openWarning("subtree");
                }
                if(e.keyCode == 9 )
                {
                        if(focusedElement == null)
                        {
                                createNode("root");
                        }
                        else
                        {
                                createNode("normal");
                        }
                }
        }
});

//we must prevent default for tab key or
//Backspace Key. In some cases we must check
//if an input is selected. In this case Keys
//like Backspace (8) should still be working.
//Otherwise browser navigation should be disabled

$(document).keydown(function(e)
{
        if(e.keyCode == 8 && !$(e.target).is("input"))
        {
                e.preventDefault();
        }
        if(e.keyCode == 9)
        {
                e.preventDefault();
        }
});

//if the user clicks onto the input element, we
//need to hide several hotkey items in order to
//inform about the changed usability behavior

$("#inputChangeElementText").focusin(function()
{
        enableDisableShortkeys("inputFocus");
});
$("#inputChangeElementText").focusout(function()
{
        enableDisableShortkeys("inputHide");
});

//returns the id of the element the mouse collides
//with.

function isCollissionBox(mouseX, mouseY)
{
        var index = null;

        $("node").each(function()
        {
                var x       = parseInt($(this).attr("posX"));
                var width   = parseInt($(this).attr("width"));
                var y       = parseInt($(this).attr("posY"));
                var height  = parseInt($(this).attr("height"));

                if( (mouseX - posX) / scale > x &&
                  (mouseX - posX) / scale < x + width &&
                  (mouseY - posY) / scale > y &&
                  (mouseY - posY) / scale < y + height )
                {
                        index = $(this).attr("id");
                }
        });
        return index;
}

//when the mouse collides with the Addnode Button this function
//is triggered. It returns true or falls if the user clciks onto
//the "Add Node CanvasButton".

function isCollissionIconAddNode(mouseX, mouseY)
{
        if(focusedElement != null)
        {
                var x       = parseInt($("node[id="+focusedElement+"]").attr("posX"));
                var width   = parseInt($("node[id="+focusedElement+"]").attr("width"));
                var y       = parseInt($("node[id="+focusedElement+"]").attr("posY"));
                var height  = parseInt($("node[id="+focusedElement+"]").attr("height"));

                if( (mouseX - posX) / scale > x + (width + 20) - 7 &&
                  (mouseX - posX) / scale < x + (width + 20) + 7 + height &&
                  (mouseY - posY) / scale > y - 7 &&
                  (mouseY - posY) / scale < y + 7 + height )
                {
                        return true;
                }
                else
                {
                        return false;
                }
        }
}

//when the user hits the delete node button this function returns
//true. Otherwise it will return false. The reutn value opens the
//Delete-Node-Window inside another function. The Node Deletion itself
//is triggered by a onClick event inside this Delete-Node-Window by
//the user.

function isCollissionIconDeleteNode(mouseX, mouseY)
{
        if(focusedElement != null)
        {
                var x       = parseInt($("node[id="+focusedElement+"]").attr("posX"));
                var width   = parseInt($("node[id="+focusedElement+"]").attr("width"));
                var y       = parseInt($("node[id="+focusedElement+"]").attr("posY"));
                var height  = parseInt($("node[id="+focusedElement+"]").attr("height"));

                if((mouseX - posX) / scale > x + (width + height + 35) - 7 &&
                  (mouseX - posX) / scale < x + (width + height + 35) + 7 + height &&
                  (mouseY - posY) / scale > y - 7 &&
                  (mouseY - posY) / scale < y + 7 + height )
                {
                        return true;
                }
                else
                {
                        return false;
                }
        }
}

//with each navigation the user hotkey list
//needs to be updated. This functions enables
//or disables the specific divs.

function enableDisableShortkeys(state)
{
        if(state == "noSelect")
        {
                $(".hkInfoEsc").hide();
                $(".hkInfoEntf").hide();
                $(".hkInfoEnde").hide();
                $(".hkInfoText").hide();
                $(".hkInfoTabA").hide();
                $(".hkInfoTabB").show();
        }
        else if(state == "nodeSelect")
        {
                $(".hkInfoEsc").show();
                $(".hkInfoEntf").show();
                $(".hkInfoEnde").show();
                $(".hkInfoTabA").show();
                $(".hkInfoTabB").hide();
        }
        else if(state == "warningOpened")
        {
                $(".hkInfoEsc").show();
                $(".hkInfoEntf").hide();
                $(".hkInfoEnde").hide();
                $(".hkInfoText").hide();
                $(".hkInfoTabA").hide();
                $(".hkInfoTabB").hide();
        }
        else if(state == "inputFocus")
        {
                $(".hkInfoText").show();
        }
        else if(state == "inputHide")
        {
                $(".hkInfoText").hide();
        }
}


//the sidebar can be toggled. unfortunaltey
//there is no real css selector for onClick.
//So I needed to built this function to enable/
//disable the OnClick popup elements

function showHideItem(item)
{
        $("div[id^=sidebarItemFocus]").slideUp("fast"); //eventuell entfernen


        if($("#sidebarItemFocus"+item).is(':visible'))
        {
                $("#sidebarItemFocus"+item).slideUp("fast");
                $("#sidebarItem"+item).removeClass("sidebarItemTransform");
        }
        else
        {
                $("#sidebarItemFocus"+item).slideDown("fast");
                $("#sidebarItem"+item).css("-webkit-transform:", "rotate(90deg)");
                $("#sidebarItem"+item).addClass("sidebarItemTransform");
        }
}

//Opens the menu for a user who focuses an
//element. The user can edit node values
//Updated element values are being synced
//into the menus inputs as well


function openCloseMenu()
{
        if(focusedElement !== undefined && focusedElement !== null)
        {
                $("#sidebarElementEdit").slideDown("fast");

                if($("#content").children().length > 0)
                {
                        $("#sidebarItemPlaceholder").show();
                }
                $("#sidebarItemPlaceholder").hide();

                $("#sidebarItem0Header").html("");
                $("#sidebarItem0Header").append("Edit Node");
                $("#inputChangeElementText").val( $("node[id='"+focusedElement+"']").attr("text") );
                $("#inputChangeElementColor").val( $("node[id='"+focusedElement+"']").attr("color") );

                enableDisableShortkeys("nodeSelect");
        }
        else
        {
                $("#sidebarElementEdit").slideUp("fast");

                if($("#content").children().length == 0)
                {
                        $("#sidebarItemPlaceholder").hide();
                }
                else
                {
                        $("#sidebarItemPlaceholder").slideDown("fast");
                }
                enableDisableShortkeys("noSelect");
        }
}


//if the user presses <del> or <end> this function
//will be triggered. If the focusedElement a selected
//a warning will be displayed. The user can decide
//whether to delete a node or the node and its subtree.
//If another user changes the color, text or deletes
//this node meanwhile the message will be closed
//immediately to prevent usability fails and some errors

function openWarning(type)
{
        if(focusedElement != null)
        {
                enableDisableShortkeys("warningOpened");
                $("#inputChangeElementText").blur();

                var width   = $("node[id="+focusedElement+"]").attr("width");
                var height  = $("node[id="+focusedElement+"]").attr("height");
                var color   = $("node[id="+focusedElement+"]").attr("color");
                var text    = $("node[id="+focusedElement+"]").attr("text");

                if(type == "node")
                {
                        $("#containerWarningDeleteNode").show();
                        $(".containerWarningPreview").html("<div style='box-shadow: 0px 3px 8px rgba(0,0,0,0.2); margin: 30px auto 30px auto; width:"+width+"; height:"+height+"; line-height:"+height+"px;  background-color:"+color+"; text-align: center; color: #ffffff;'>"+text+"</div> ");
                }
                else if(type == "subtree")
                {
                        $("#containerWarningDeleteSubtree").show();
                        $(".containerWarningPreview").html("<div style='box-shadow: 0px 3px 8px rgba(0,0,0,0.2); margin: 30px auto 30px auto; width:"+width+"; height:"+height+"; line-height:"+height+"px;  background-color:"+color+"; text-align: center; color: #ffffff;'>"+text+"</div> ");
                }
        }
}

//this function is called everytime when the warning window
//needs to be closed. This is the case when the user clicked
//onto the "yes"- or "no"-button inside the warning window.
//Other reasons are: Another user made a text or color change
//of the object, the warning window is opened for. The window
//will be closed as well, if another user deletes the node or
//the subtree in which the object was stored. The warning is
//closed as well if the user creates a new node

function closeWarning()
{
        $('.containerWarning').hide();
}



//Mousewheel zoom. Tested in Chrome,
//Internet Explorer and firefox. Not only
//the scale is changed but also the x-y
//position of the canvas, in order to
//pin the point to the same spot where
//the user currently points his mouse at
//posX and posY and scale are alle added
//to draw and collission detection functions

scale = 1;

$('#canvas').unbind('mousewheel DOMMouseScroll').on('mousewheel DOMMouseScroll', function(e)
{
        var xOld, yOld, xNew, yNew;
        //Chrome
        if(e.originalEvent.wheelDelta /120 > 0 && scale < 2.9)
        {
                xOld = currentMousePos.x - posX;
                xNew = xOld * 1.15;
                posX -= ( xNew - xOld);

                yOld = currentMousePos.y - posY;
                yNew = yOld * 1.15;
                posY -= ( yNew - yOld);

                scale *= 1.15;
        }
        else if (e.originalEvent.wheelDelta /120 < 0 && scale > 0.1)
        {
                xOld = currentMousePos.x - posX;
                xNew = xOld / 1.15;
                posX -= ( xNew - xOld);

                yOld = currentMousePos.y - posY;
                yNew = yOld / 1.15;
                posY -= ( yNew - yOld);

                scale /= 1.15;
        }
        //Firefox
        if(e.detail < 0 && scale < 2.9)
        {
                xOld = currentMousePos.x - posX;
                xNew = xOld * 1.15;
                posX -= ( xNew - xOld);

                yOld = currentMousePos.y - posY;
                yNew = yOld * 1.15;
                posY -= ( yNew - yOld);

                scale *= 1.15;
        }
        else if (e.detail > 0 && scale > 0.1)
        {
                xOld = currentMousePos.x - posX;
                xNew = xOld / 1.15;
                posX -= ( xNew - xOld);

                yOld = currentMousePos.y - posY;
                yNew = yOld / 1.15;
                posY -= ( yNew - yOld);

                scale /= 1.15;
        }
});

//mouseDrag the canvas elements
//posX and posY must be added to each render or
//collission detection routine.dragX and dragY
//only are important for thie mousemov function:
//These two variables store the information of
//the dragged value since the last programm tick
//the first node is in the middle of the screen.

mouseDown               = false;
hoveredElement          = null;
focusedElement          = null;
dragX                   = null;
dragY                   = null;
posX                    = window.innerWidth  / 2 - 60;
posY                    = window.innerHeight / 2 - 15;

//when the user double clicks on the element
//the text can be edited.
$("#canvas").dblclick(function()
{
        if(focusedElement != null)
        {
                if($("#sidebarItemFocus1").is(':hidden'))
                {
                        showHideItem(1);
                }
                $("#inputChangeElementText").focus();
                enableDisableShortkeys("inputFocus");
        }
});

$("#canvas").mousedown(function()
{
        if(!mouseDown)
        {
                hoveredElement  = isCollissionBox(currentMousePos.x, currentMousePos.y);
        }
        mouseDown         = true;
});

$("#canvas").mouseup(function()
{
        alterNode(hoveredElement, "position");
        hoveredElement  = null;
        mouseDown       = false;

        checkCollissions(currentMousePos.x, currentMousePos.y);
});

$("#canvas").mousemove(function()
{
        if(mouseDown)
        {
                if(dragX == null) dragX =  currentMousePos.x;
                if(dragY == null) dragY =  currentMousePos.y;

                draggedX =  dragX - currentMousePos.x;
                draggedY =  dragY - currentMousePos.y;
                dragX    =  currentMousePos.x;
                dragY    =  currentMousePos.y;

                if(hoveredElement == null)
                {
                        posX -= draggedX;
                        posY -= draggedY;
                }
                else if(hoveredElement != null)
                {
                        //this function is called whenever the mouse is
                        //moved and the mouse is over a Node.
                        //the new positions are updated to the server
                        //after (mouseDown != true) again. To avoid
                        //performance issues. But maybe socket.io is strong
                        //enough to constantly update the positions.

                        moveElementsMindmap(hoveredElement);
                }
        }
        else
        {
                dragX = null;
                dragY = null;
        }
});


//Touch Drag the canvas elements
//posX and posY must be added to each render or
//collission detection routine.dragX and dragY
//only are important for thie mousemov function:
//These two variables store the information of
//the dragged value since the last programm tick

window.addEventListener('load', function()
{
        var startX  = 0;
        var startY  = 0;
        var dist    = 0;

        document.getElementById('canvas').addEventListener('touchstart', function(e)
        {
                var touchobj  = e.changedTouches[0];
                startX        = parseInt(touchobj.clientX);
                startY        = parseInt(touchobj.clientY);

                checkCollissions(startX, startY);

                hoveredElement  = isCollissionBox(startX, startY);

                e.preventDefault();
        }, false)

document.getElementById('canvas').addEventListener('touchmove', function(e)
{
        var touchobj  = e.changedTouches[0];
        draggedX      = startX - parseInt(touchobj.clientX);
        draggedY      = startY - parseInt(touchobj.clientY);
        startX        = parseInt(touchobj.clientX);
        startY        = parseInt(touchobj.clientY);


        if(hoveredElement == null)
        {
                posX -= draggedX;
                posY -= draggedY;
        }
        else if(hoveredElement != null)
        {
                //this function is called whenever the mouse is
                //moved and the mouse is over a Node.
                //the new positions are updated to the server
                //after (mouseDown != true) again. To avoid
                //performance issues. But maybe socket.io is strong
                //enough to constantly update the positions.

                moveElementsMindmap(hoveredElement);
        }
        e.preventDefault();
}, false)

document.getElementById('canvas').addEventListener('touchend', function(e)
{
                var touchobj    = e.changedTouches[0];
                draggedX        = null;
                draggedY        = null;

                alterNode(hoveredElement, "position");
                hoveredElement  = null;
                e.preventDefault();
        }, false)
}, false);





//this function is triggerd whenever somebody
//cliked or touched the pad. It checks whether
//there has been a collission and updates
//the view.
//For Tablets we need the lockNodeCreation variable!
//If a user presses The createNode-Button on the canvas
//it maybe pressed twice or several times before the view
//is rendered. The variable is set to true once
//the user creates a node. It is set to false again
//once the node was created on the server and all clients
//get feedback from the server.

var lockNodeCreation = false;

function checkCollissions(mouseX, mouseY)
{
        if(isCollissionIconAddNode(mouseX, mouseY))
        {
                if(!lockNodeCreation)
                {
                        createNode("normal");
                        lockNodeCreation = true;
                        return;
                }
        }

        if(isCollissionIconDeleteNode(mouseX, mouseY))
        {
                openWarning("node");
                return;
        }

        if(isCollissionBox(mouseX, mouseY) != null)
        {
                var previousFocusedElement = focusedElement;
                focusedElement  = isCollissionBox(mouseX, mouseY);

                if(previousFocusedElement != focusedElement)
                {
                        closeWarning();
                }
                openCloseMenu();
                updateUserFocus();
        }
}

//This function is called whenever the mouse is
//moved and the mouse is over a Node Object and
//the CTRL key is pressed. It is a recursive function
//that also moves all child elements of the dragged Node
//all dragged Nodes are put into the movedNodes array.
//After the user releases the mouse again, the movedNodes
//array is processed and all of its elements are updated
//to the server.

function moveElementsMindmap(index)
{
        var node      = "node[id='"+index+"']";
        var children  = $(node+"> node");

        $(node).attr("posX", $(node).attr("posX") - draggedX / scale);
        $(node).attr("posY", $(node).attr("posY") - draggedY / scale);

        for(var i = 0; i < children.length; i++)
        {
                moveElementsMindmap( children[i].id );
        }
}


//Function to get the mouse position
//The mouse position is stored within currentMousePos.X
//and currentMousePos.y. currentMousePos.x-.y is
//initialized with -1 and -1 to avoid an bug at startup

currentMousePos = { x: -1, y: -1 };

jQuery(function($)
{
        $(document).mousemove(function(event)
        {
                if (event.pageX || event.pageY)
                {
                        currentMousePos.x = event.pageX;    currentMousePos.y = event.pageY;
                }
                else if (event.clientX || event.clientY)
                {
                        currentMousePos.x = event.clientX;  currentMousePos.y = event.clientY;
                }
        });
});

(function animloop()
{
        requestAnimFrame(animloop);
        draw(true);
})();
