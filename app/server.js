function user(cUserName, cUserColor, cUserlanguage)
{
        this.userName         = cUserName;
        this.userColor        = cUserColor;
        this.mindMapValue001  = "";
        this.mindMapValue002  = "";
        this.settingsLanguage = cUserlanguage;
}


//initialization
/*
var express		= require('express');
var bodyParser		= require('body-parser');
var cookieParser	= require('cookie-parser');
var expressSession	= require('express-session');
var mysql               = require('mysql');
var syncExec            = require('sync-exec');
var asyncExec           = require('child-process-promise').exec;
var app 		= express();
var http                = require('http').Server(app);
var io                  = require('socket.io')(http);
var cheerio             = require('cheerio'),
    $ = cheerio.load("<container id='-1'></container>");
*/

// initialization PI

var express             = require('express');
var bodyParser          = require('body-parser');
var cookieParser        = require('cookie-parser');
var expressSession      = require('/usr/local/lib/node_modules/express-session');
var mysql               = require('/usr/local/lib/node_modules/mysql');
var syncExec            = require('/usr/local/lib/node_modules/sync-exec');
var asyncExec           = require('child_process').exec;
var app                 = express();
var http                = require('http').Server(app);
var io                  = require('/usr/local/lib/node_modules/socket.io')(http);
var cheerio             = require('/usr/local/lib/node_modules/cheerio'),
    $ 			= cheerio.load("<container id='-1'></container>");
// LARA 21.07.2016
//var crypto		= require('/usr/local/lib/node_modules/crypto');
var crypto		= require('crypto');
// LARA end

var connection      = mysql.createConnection({
    host     : 'localhost',
    user     : 'TeamBox',
    database : 'TeamBox',
    password : 'PasswdForTeamBox'
});

// LARA 21.07.2016
// connection for collabtive
var collabtiveConnection      = mysql.createConnection({
    host     : 'localhost',
    user     : 'TeamBox',
    database : 'collabtive',
    password : 'PasswdForTeamBox'
});
// LARA end


    //DELETE THIS LATER
    //	cd C:\Users\Martin\OneDrive\xampp\11.07.2016
    //  cd C:\Users\Martin Hanusch\OneDrive\xampp\11.07.2016
    //DELETE THIS LATER

var group               = "";
var groupIsFromUsb      = false;
var groupIsSelected     = false;
var groupIsSelectedPi   = false;
var mySqlIsImported     = false;
var groups              = [];
var clients             = [];
var illegalClients      = [];
    illegalClients.push("admin");
    illegalClients.push("administrator");
    illegalClients.push("pi");
    illegalClients.push("root");
    illegalClients.push("teambox");

    app.set("view engine", "ejs");
    app.use("/styles", express.static(__dirname + "/styles"));
    app.use("/_jquery", express.static(__dirname + '/_jquery'));
    app.use("/p5", express.static(__dirname + '/p5'));
    app.use("/screenshots", express.static(__dirname + '/screenshots'));
    app.use("/drawings", express.static(__dirname + '/drawings'));
    app.use("/scripts", express.static(__dirname + '/scripts'));
    app.use("/_socket.io", express.static(__dirname + '/_socket.io'));
    app.use(bodyParser.urlencoded(
    {
    	extended: true
    }));
    app.use(cookieParser());
    app.use(expressSession({
            cookie: {maxAge: 36000000, httpOnly: false},
            //cookie: {httpOnly: false},
            secret:'x71dTgv_fd1GgZ_+',
            resave: true,
            saveUninitialized: true
    }));

// LARA 02.08.2016
var usbString="";
// LARA end



setInterval(function()
{
    if(groupIsSelected == true && groupIsSelectedPi == true)
    {
            exportMysqlAsync();
    }
}, 120000);


// LARA 22.07.20016 // 02.08.2016

// check the usb's size as well as free, used & TeamBox-used space
function usbCheckFree()
{
        var usbValues = syncExec("bash /home/pi/scripts/usb_check_free.sh").stdout.split("\n");
	var usbSize = usbValues[0].split(":")[1].trim();
	var usbFree	= usbValues[1].split(":")[1].split("=")[0].trim();
	var usbFreePerc = usbValues[1].split(":")[1].split("=")[1].trim();
	var usbUsed	= usbValues[2].split(":")[1].split("=")[0].trim();
	var usbUsedPerc = usbValues[2].split(":")[1].split("=")[1].trim();
	var usbTB = usbValues[3].split(":")[1].split("=")[0].trim();
	var usbTBPerc = usbValues[3].split(":")[1].split("=")[1].trim();
	var usbString = usbSize+" "+usbFree+" "+usbFreePerc+" "+usbUsed+" "+usbUsedPerc+" "+usbTB+" "+usbTBPerc;
//	console.log("usb: "+usbString);
	return usbString;
}

// synchronize pi's server time by getting is from the first client who creates the group
function synchronizeTime(dateDate, dateTime)
{
        var success = syncExec("sudo date +%Y%m%d -s '" + dateDate  +"'");

	if(success)
        {
		console.log("EXEC ::\tSyncronized date:\t" + dateDate);
	}
	else
        {
		console.log("EXEC ::\tCould not synchronize date:\t" + dateDate);
	}

	success = syncExec("sudo date +%T -s '"+dateTime+"'");

	if(success)
        {
		console.log("EXEC ::\tSyncronized time:\t" + dateTime);
	}
	else
        {
		console.log("EXEC ::\tCould not synchronize time:\t" + dateTime);
	}
}

// LARA end


function shutdownPi()
{
          //UNQUOTE Later
          var isError = syncExec("sudo bash service hostapd stop && /home/pi/scripts/group_delete.sh && /home/pi/scripts/display_exit.sh && shutdown -h now").stderr;
          //UNQUOTE Later
          //DELETE THIS Later
          //var isError = syncExec("ping -n 2 127.0.0.1 > NUL && echo 'SHUTDOWN PI'").stderr;
          //DELETE THIS Later

          if(isError == "" && isError != null)
          {
                  console.log("EXEC :: SHUTDOWNPI:\t\tSUCCESS");
          }
          else
          {
                  console.log("EXEC :: SHUTDOWNPI:\t\tERROR: \n" + isError);
          }
}

function importMysql()
{
        //UNQUOTE Later
        var isError = syncExec("sudo bash /home/pi/scripts/mysql_import.sh").stderr;
        //UNQUOTE Later
        //DELETE THIS Later
        //var isError = syncExec("ping -n 2 127.0.0.1 > NUL && echo 'IMPORT MYSQL").stderr;
        //DELETE THIS Later

        if(isError == "" && isError != null)
        {
                console.log("EXEC :: IMPORTMYSQL:\t\tSUCCESS");

                connection.query("CREATE TABLE IF NOT EXISTS dataAppDraw (id int NOT NULL AUTO_INCREMENT, fileName VARCHAR(50), content LONGTEXT, PRIMARY KEY(id,fileName) )");
                connection.query("ALTER TABLE dataAppDraw ADD UNIQUE (fileName)");
                connection.query("CREATE TABLE IF NOT EXISTS dataAppMindmap (id int NOT NULL AUTO_INCREMENT, fileName VARCHAR(50), content VARCHAR(40000), PRIMARY KEY(id,fileName) )");
                connection.query("ALTER TABLE dataAppMindmap ADD UNIQUE (fileName)");
                connection.query("CREATE TABLE IF NOT EXISTS userData (id int NOT NULL AUTO_INCREMENT, user VARCHAR(20), color VARCHAR(25), language VARCHAR(10), ip VARCHAR(20), PRIMARY KEY(id,user) )");
                connection.query("ALTER TABLE userData ADD UNIQUE (user)");
                groupIsSelected   = true;
                groupIsSelectedPi = true;
        }
        else
        {
                console.log("EXEC :: IMPORTMYSQL:\t\tERROR: \n" + isError);
        }

}

function exportMysql()
{
        io.sockets.emit('appExportMysqlStart');

        //UNQUOTE Later
        var isError = syncExec("sudo bash /home/pi/scripts/mysql_export.sh").stderr;
        //UNQUOTE Later
        //DELETE THIS Later
        //var isError = syncExec( "ping -n 2 127.0.0.1 > NUL && echo 'EXPORT MYSQL'").stderr;
        //DELETE THIS Later

        if(isError == "" && isError != null)
        {
                console.log("EXEC :: EXPORTMYSQL:\t\tSUCCESS");
        }
        else
        {
                console.log("EXEC :: EXPORTMYSQL:\t\tERROR: \n" + isError);
                groupIsSelectedPi = false;
        }
        io.sockets.emit('appExportMysqlEnd');
}

function exportMysqlAsync()
{
        console.log("ASYNC EXEC");
        asyncExec("sudo bash /home/pi/scripts/mysql_export.sh");
}


function loadGroups()
{
        groups  = [];
        //UNQUOTE Later
        groups = syncExec("bash /home/pi/scripts/group_show.sh").stdout.split("\n");
        //UNQUOTE Later
        //DELETE THIS Later
        //groups = syncExec("echo '.20SPACE GRP INCOMING.xGrp.TerraGrp'").stdout.split(".");
        //DELETE THIS Later
}


function chooseGroup()
{
        //UNQUOTE Later
        var isError = syncExec("sudo bash /home/pi/scripts/group_choose.sh '" + group + "'").stderr;
        //UNQUOTE Later
        //DELETE THIS Later
        //var isError = syncExec("ping -n 2 127.0.0.1 > NUL && echo 'CHOOSE GROUP'").stderr;
        //DELETE THIS Later

        if(isError == "" && isError != null)
        {
                console.log("EXEC :: CHOOESEGROUP:\t\tSUCCESS");
        }
        else
        {
                console.log("EXEC :: CHOOESEGROUP:\t\tERROR: \n" + isError);
        }
}


function createGroup()
{
        //UNQUOTE Later
        var isError = syncExec("sudo bash /home/pi/scripts/group_create.sh '" + group + "'").stderr;
        //UNQUOTE Later
        //DELETE THIS Later
        //var isError = syncExec("ping -n 2 127.0.0.1 > NUL && echo 'CREATE GROUP'").stderr;
        //DELETE THIS Later

        if(isError == "" && isError != null)
        {
                console.log("EXEC :: CREATEGROUP:\t\tSUCCESS");
        }
        else
        {
                console.log("EXEC :: CREATEGROUP:\t\tERROR: \n" + isError);
        }
}

function getEtherpadEntries()
{
        var data = [];

        //UNQUOTE Later
        data = syncExec("sudo bash /home/pi/scripts/server_get_etherpad.sh").stdout.split("\n");
        //UNQUOTE Later
        //DELETE THIS Later
        //data = syncExec("echo 'Datei1 DateiXX Datei3'").stdout.split(" ");
        //DELETE THIS Later

        if(data[0].indexOf("server_get_etherpad.sh") >= 0)
        {
          data.splice(0, 1);
        }
        return data;
}

function getEthercalcEntries()
{
        var data = [];

        //UNQUOTE Later
        data = syncExec("sudo bash /home/pi/scripts/server_get_ethercalc.sh").stdout.split("\n");
        //UNQUOTE Later
        //DELETE THIS Later
        //data = syncExec("echo 'Calc1 Calc2 Calcn'").stdout.split(" ");
        //DELETE THIS Later

        return data;
}



function startUp()
{
        //UNQUOTE LATER
        connection.query("DROP TABLE IF EXISTS `dataAppMindmap`");
        connection.query("DROP TABLE IF EXISTS `userData`");
        //UNQUOTE LATER
}
startUp();









http.listen(3000, function()
{
	console.log("===================");
	console.log("Server started ....");
	console.log("Port: 3000 ========");
});



app.post('/login01.ejs', function(req, res)
{
	var errorMessage 		= "";

	if( req.body.user.group == "" || req.body.user.group == null)
	{
		errorMessage += "Please enter a group name first";
		res.end(errorMessage);
	}
	else
	{
                if(groupIsSelected == false)
                {
                        group = req.body.user.group.replace(/[^a-z0-9-_\s]/gi, '').replace(/\s+/g, "_").toLowerCase();

                        var groupExists = false;

                        for(var i = 0; i < groups.length; i++)
                        {
                                if(groups[i].toString() == group.toString())
                                {
                                        groupExists = true;
                                }
                        }

                        if(groupExists)
                        {
                                chooseGroup();
                	}
                	else
                	{
                                createGroup();
			}
                        importMysql();
                        if(groupIsSelected)
                        {
	                       	res.end("loginSuccess");
                        }
                        else
                        {
                                errorMessage += "Error importing SQL data.";
                             	res.end(errorMessage);
	              	}
                }
        }
});



app.post('/login02.ejs', function(req, res)
{
        var nameIsInUse         = false;
        var nameIsIllegal       = false;
        var nameIsEmpty         = false;
        var maxClientsReached   = false;
        var errorMessage        = "";

	var replUserName = req.body.user.name.replace(/[^a-z0-9-_\s]/gi, '').replace(/\s+/g, "_").toLowerCase();
        for(var i = 0; i < clients.length; i++)
        {
        	if(clients[i].userName == replUserName)
        	{
        		nameIsInUse = true;
        	}
        }

        for(var i = 0; i < illegalClients.length; i++)
        {
                if(illegalClients[i].toLowerCase() == replUserName)
                {
                        nameIsIllegal = true;
                }
        }

        if(clients.length > 7)
        {
                maxClientsReached = true;
        }

        if( req.body.user.name == "" || req.body.user.name == null)
        {
                errorMessage += "Please select a username.";
                nameIsEmpty = true;
        }
        else if(nameIsInUse)
        {
        	errorMessage += "Another user already entered this username";
        }
        else if(nameIsIllegal)
        {
        	errorMessage += "This name is not available";
        }
        if(maxClientsReached)
        {
                errorMessage = "Only 6 users can join a group.";
        }

	if(nameIsEmpty || nameIsInUse || nameIsIllegal || maxClientsReached)
	{
		res.end(errorMessage);
	}
	else if(!nameIsEmpty && !nameIsInUse && !nameIsIllegal && !maxClientsReached)
	{
                var username    = replUserName;
                var ip          = req.connection.remoteAddress.replace(/[f:]/g,'');
                var color       = 'rgb('+(50+Math.floor(Math.random()*156))+','+(50+Math.floor(Math.random()*156))+','+(50+Math.floor(Math.random()*156))+')';

                connection.query("INSERT IGNORE INTO userData (user,color,language) VALUES ('" + username + "','" + color + "','ENG')");
                connection.query("UPDATE userData SET ip = '" + ip + "'    WHERE user =  '" + username + "'    ");

                connection.query("SELECT * FROM userData WHERE user = '" + username + "' ", function(err, result, fields)
                {
                        req.session.userName            = result[0].user.toLowerCase();
                        req.session.userColor           = result[0].color;
                        req.session.userLanguage        = result[0].language;
                        req.session.save();
                        clients.push(  new user(result[0].user.toLowerCase(), result[0].color, result[0].language) );
                        res.end("loginSuccess");
                });

		// LARA 21.07.2016
		// add user to collabtives database
/*		collabtiveConnection.connect(function(err)
		{
			if(err)
			{
				console.log("Could not connect to collabtive's database!");
			}
		});
*/	        collabtiveConnection.query("SELECT name FROM user WHERE name='"+username+"'", function(err, result)
		{
			if(err){
				console.log(err);
			}
			else
			{
				if(result.length > 0){
//					console.log("User "+username+" already exists in collabtive's database");
				}
				else{
					// add to user database
					var collabtivePass=crypto.createHash('sha1').update(color).digest('hex');
					collabtiveConnection.query("INSERT INTO user (name,email,company,pass,locale,tags,rate) VALUES ('"+username+"', '', '0', '"+collabtivePass+"', '', '', '0')", function(err, result)
					{
						if(err)
						{
							console.log("Could not create user "+username+" in collabtive's database!\n"+err);
						}
						else
						{
							var insertId=result.insertId;
							// add users role
							collabtiveConnection.query("INSERT INTO roles_assigned (user,role) VALUES ('"+insertId+"', '2')", function(err, result)
							{
								if(err)
								{
									console.log("Could not add "+username+"'s role (collabtive)!\n"+err);
								}	
							});
							// add user to existing projects
							collabtiveConnection.query("SELECT ID FROM projekte", function(err, result)
							{	
								if(err)
								{
									console.log(err);
								}
								else
								{
									var i;
									for(i=0; i<result.length; i++)
									{
										collabtiveConnection.query("INSERT INTO projekte_assigned (user,projekt) VALUES ('"+insertId+"', '"+result[i].ID+"')", function(err, result)
										{
											if(err)
											{
												console.log("Could not add user "+username+" to project nr."+result[i].ID+" (collabtive)!\n"+err);
											}	
										});
									}
								}
							});
							
						}
					});
				}
			}
		});
//		collabtiveConnection.end(function(err){});
		// LARA end
	}
});



app.get("/", function(req, res)
{
	if(!req.session.userName && !groupIsSelected)
	{
    		loadGroups();
		res.render(__dirname + "/login01.ejs", {groups: groups});
	}
	else if(!req.session.userName && group != "")
	{
		return res.redirect("/login02.ejs");
	}
	else
	{
		return res.redirect("/hub.ejs");
	}
});



app.get("/login01.ejs", function(req, res)
{
	if(!req.session.userName && !groupIsSelected)
	{
                loadGroups();
		res.render(__dirname + "/login01.ejs", {groups: groups});
	}
	else if(!req.session.userName && group != "")
	{
		return res.redirect("/login02.ejs");
	}
	else
	{
		return res.redirect("/hub.ejs");
	}
});



app.get("/login02.ejs", function(req, res)
{
	if(!req.session.userName && !groupIsSelected && group == "")
	{
		return res.redirect("/login01.ejs");
	}
	else if(!req.session.userName && groupIsSelected && group != "" )
	{
		res.render(__dirname + "/login02.ejs", {group: group});
	}
	else
	{
		return res.redirect("/hub.ejs");
	}
});



app.get("/hub.ejs", function(req, res)
{
	if(req.session.userName)
	{
// LARA 02.08.2016
//		res.render(__dirname + "/hub.ejs", {userName: req.session.userName, group: group, color: req.session.userColor});
		usbString = usbCheckFree();
		res.render(__dirname + "/hub.ejs", {userName: req.session.userName, group: group, color: req.session.userColor, usbString: usbString});
// LARA end
	}
	else
	{
		return res.redirect("/login01.ejs");
	}
});



app.get("/logout.ejs", function(req, res)
{
	if(req.session.userName)
	{
		for(var i = 0; i < clients.length; i++)
		{
			if(clients[i].userName == req.session.userName)
			{
				clients.splice(i, 1);
			}
		}
		req.session.destroy();
		res.render(__dirname + "/logout.ejs");
	}
	else
	{
		return res.redirect("/login01.ejs");
	}
});


/* THIS DOES DEFINATELY NOT WORK!!!

app.get("/192.168.42.1:9001", function(req, res)
{
	if(req.session.userName)
	{
		return res.redirect(__dirname + "/192.168.42.1:9001");
	}
	else
	{
		return res.redirect("/login01.ejs");
	}
});

app.get("/192.168.42.1:8000", function(req, res)
{
	if(req.session.userName)
	{
		return res.redirect(__dirname + "/192.168.42.1:8000");
	}
	else
	{
		return res.redirect("/login01.ejs");
	}
});
*/


//NENA BEGIN

/*

* function to render HTML and redirect to appDrawLoad.ejs

*/

app.get("/appDrawLoad.ejs", function(req, res)

{

	if(req.session.userName)

	{

    var data = [];

	

	connection.query("SELECT * FROM dataAppDraw", function(err, result)

	{

      for (var i = 0; i < result.length; i++)

      {

         data.push(result[i].fileName);

      }

		res.render(__dirname + "/appDrawLoad.ejs", {userName: req.session.userName, group: group, color: req.session.userColor, data: data});

	});

	}

	else

	{

		return res.redirect("/login01.ejs");

	}

});



/*

* function to render HTML and redirect to appDraw.ejs

*/

app.get("/appDraw.ejs", function(req, res)
{
	if(req.session.userName)
	{
		var drawObjData = [];
		var data = [];
		connection.query("SELECT * FROM dataAppDraw", function(err, result)
		{
		  for (var i = 0; i < result.length; i++)
		  {
			drawObjData.push(result[i].content);
			data.push(result[i].fileName);
		  }
			res.render(__dirname + "/appDraw.ejs", {userName: req.session.userName, group: group, color: req.session.userColor, drawObjData: drawObjData, data: data});
		});
	}
	else
	{
		return res.redirect("/login01.ejs");
	}
});

//NENA END


app.get("/appEtherpadLoad.ejs", function(req, res)
{
	if(req.session.userName)
	{
                var data = [];
                data =  getEtherpadEntries();

                res.render(__dirname + "/appEtherpadLoad.ejs", {userName: req.session.userName, group: group, color: req.session.userColor, data: data});
	}
	else
	{
		return res.redirect("/login01.ejs");
	}
});



app.get("/appMindmapLoad.ejs", function(req, res)
{
        if(req.session.userName)
	{
                var data = [];

                connection.query("SELECT * FROM dataAppMindmap", function(err, result, fields)
		{
                        for (var i = 0; i < result.length; i++)
                        {
                                data.push(result[i].fileName);
                        }
                        res.render(__dirname + "/appMindmapLoad.ejs", {userName: req.session.userName, group: group, color: req.session.userColor, data: data});
		});
	}
	else
	{
		return res.redirect("/login01.ejs");
	}
});



app.get("/appEthercalcLoad.ejs", function(req, res)
{
	if(req.session.userName)
	{
                var data = [];
                data =  getEthercalcEntries();

                res.render(__dirname + "/appEthercalcLoad.ejs", {userName: req.session.userName, group: group, color: req.session.userColor, data: data});
	}
	else
	{
		return res.redirect("/login01.ejs");
	}
});



app.get("/appMindmap.ejs", function(req, res)
{
	if(req.session.userName)
	{
		res.render(__dirname + "/appMindmap.ejs", {userName: req.session.userName, group: group, color: req.session.userColor});
	}
	else
	{
		return res.redirect("/login01.ejs");
	}
});











//SOCKET IO

io.on('connection', function(socket)
{
        //Shuts down the Pi.
        //Sends a message to all client that the Pi will shutdown
        //after the content was exportet to the USB Stick a last time
        //Here should be an error message as well if the export fails

        socket.on("shutdownPi", function()
        {
                exportMysql();
                io.sockets.emit('shutdownPi');
                shutdownPi();
        });

        // LARA 13.07.2016 // 02.08.2016
        // Synchronize Pi's time by receiving client's timestap

        socket.on("appSynchronizeTime", function(dateDate, dateTime)
        {
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

        socket.on("appLogin01CreatingGroupStart", function()
        {
                socket.broadcast.emit('appLogin01CreatingGroupStart');
        });

        //If a person entered a groupname and an error occurs during validatition
        //a message to all other clients is sent, that enables the control
        //over their formfields again

        socket.on("appLogin01CreatingGroupError", function()
        {
                socket.broadcast.emit('appLogin01CreatingGroupError');
        });


        //If the validation of the groupname was successfull all other clients
        //should be redirected to login02 as well. This emit triggers a
        //pageload on the client side of all connected clients

        socket.on("appLogin01GroupCreated", function()
        {
                socket.broadcast.emit('appLogin01GroupCreated');
        });

        //on client side this function is called with each page change.
        //each page has a different filename string. On each pageload
        //each client sends its username nad filename to the server.
        //the server updates the username and filename in the clients
        //array and sends back the list of all connected clients with
        //updated user info to all clients. The clients now see, that
        //user "a" is not on page "c" anymore. So the user visualization
        //changes

        socket.on('appUpdateUsers', function(user, fileName)
        {
                for(var i = 0; i < clients.length; i++)
                {
                        if(clients[i].userName == user)
                        {
                                clients[i].mindMapValue002 = fileName;
                        }
                }
                io.emit("appUpdateUsers", clients, user, fileName);
        });

        //everytime a user loads a page (without login01.ejs or login02.ejs
        //where no username variables exist) a request is sent to the server.
        //The server checks the parameter username with its clients VALUES
        //and sends back the desired language paramter to the requesting user

        socket.on('appGetLanguage', function(user)
        {
                var language = "";

                for(var i = 0; i < clients.length; i++)
                {
                        if(clients[i].userName == user)
                        {
                                language = clients[i].settingsLanguage;
                        }
                }
                io.to(socket.id).emit("appGetLanguage", language);
        });

        //If the user changes his language on hub.ejs this function
        //is triggered. The server checks the user array for the
        //requesting user and sends, changes the language variable
        //in the object and sends back the response.

        socket.on('appChangeLanguage', function(user, value)
        {
                connection.query("UPDATE userData SET language = '" + value + "'    WHERE user =  '" + user + "'    ");

                for(var i = 0; i < clients.length; i++)
                {
                        if(clients[i].userName == user)
                        {
                                 clients[i].settingsLanguage = value;
                        }
                }
                io.to(socket.id).emit("appChangeLanguage", value);
        });

        //Everytime the focus on Mindmap App changes (usercolored border
        //around nodes) all other clients must be informed about these
        //changes. The userobject is altered and the server sends back
        //only the index to the client in order to prohibit double
        //array traverse on synchronizing client user array

        socket.on('appMindmaUpdateUserFocus', function(focusedElement, user, fileName)
        {
                var index = -1;

                for(var i = 0; i < clients.length; i++)
                {
                        if(clients[i].userName == user)
                        {
                                clients[i].mindMapValue001 = focusedElement;
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
        //Only <tag data filename="ololol"> is sent back to the client
        //since there may be multiple files opened parallel. Also the server
        //sends back a boolean value (newfile) which triggers the save function
        //on client-side.

        socket.on('appMindmapInsertFileStructure', function(fileName)
        {
                var content;
                var newFile = false;

                connection.query("SELECT * FROM dataAppMindmap WHERE fileName = '" + fileName + "' ", function(err, result, fields)
                {
                        if(result.length > 0)
                        {
                                content = "<data name='" + fileName + "'>" + result[0].content + "</data>";
                        }
                        else
                        {
                                content = "<data name='" + fileName + "'><node id='0' posx='0' posy='0' type='root' width='120' height='30' text='' color='#2b2b2b'></node></data>";
                                newFile = true;
                        }

                        if( $( "data[name=" + fileName + "]" ).length == 0 )
                        {
                                $("container").append(content);
                        }
                        io.to(socket.id).emit('appMindmapInitialUser', $("data[name=" + fileName + "]").html(), newFile);
                });
        });


        //If a user user disconnects, clients should be updated
        //This function needs some further work
        socket.on("disconnect", function()
        {
                io.emit("appUpdateUsers", clients);
        });


        //If a Node is added this function is triggered
        //It creates a node and sends back a response to
        //all clients inorder to synchronzize them to
        //all changes.
        //It also sends back the canged focus to the client
        //that created this node.

        socket.on('appMindmapAddNode', function(data, fileName)
        {
                var isLeaf = false;
                var width, height;
                var id = uniqueId();

                if(data[0] == "root")
                {
                        width = 120;
                        height= 30;
                }
                else
                {
                        width = 100;
                        height= 20;
                }

                $("data[name=" + fileName + "]").find( "node" ).each(function()
                {
                        if(parseInt($(this).attr("id")) == data[3])
                        {
                                isLeaf = true;
                                var append = "<node id='"+id+"' posX='"+data[1]+"' posY='"+data[2]+"' type='"+data[0]+"' width='"+width+"' height='"+height+"' text='' color='"+$(this).attr("color")+"'></node>";
                                $(this).append(append);

                                io.emit('appMindmapAddNode', isLeaf, data[3], append, fileName);
                                io.to(socket.id).emit('appMindmapAddNodeChangeFocus', id, fileName);
                        }
                });

                if(!isLeaf)
                {
                        var append = "<node id='"+id+"' posX='"+data[1]+"' posY='"+data[2]+"' type='"+data[0]+"' width='"+width+"' height='"+height+"' text='' color='#2b2b2b'></node>";
                        $("data[name=" + fileName + "]").append(append);
                        io.emit('appMindmapAddNode', isLeaf, data[3], append, fileName);
                        io.to(socket.id).emit('appMindmapAddNodeChangeFocus', id, fileName);
                }
        });

        function uniqueId()
        {
                return Math.round(new Date().getTime() + (Math.random() * 100));
        }

        //This function is called whenever a Node element
        //was altered and needs to be sent to the server and
        //to all of the other clients. Exception for this is
        //the addition of children to a parent node when a
        //new node is created.

        socket.on('appMindmapAlterNode', function(node, parentContent, fileName)
        {
                $("data[name=" + fileName + "]").find( "node[id='"+node+"']" ).parent().html(parentContent);
                io.emit('appMindmapAlterNode', node, parentContent, fileName);
        });

        //When a user changes an elements value the
        //data are sent to the server. The server nodes
        //are updated on server side

        socket.on('appMindmapUpdateAlterText', function(node, text, fileName)
        {
                $("data[name=" + fileName + "]").find( "node[id='"+node+"']" ).attr("text", text);

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

        socket.on('appMindmapUpdateAlterColor', function(node, color, fileName)
        {
                nodesChangeColor(node, color, fileName)

                io.emit('appMindmapUpdateAlterColor', node, color, fileName);
        });


        function nodesChangeColor(node, color, fileName)
        {
                var node      = $("data[name=" + fileName + "]").find( "node[id='"+node+"']" );
                var children  = $(node + "> node");

                $(node).attr("color", color);

                for(var i = 0; i < children.length; i++)
                {
                        nodesChangeColor( children[i].id, color );
                }
        }

        //if this function is called, the id of the object which
        //should be deleted is sent to the server, if it
        //is not null.

        socket.on('appMindmapDeleteNode', function(index, fileName)
        {
                if($("data[name=" + fileName + "]").find( "node[id='"+index+"']" ).parent().is("data[name=" + fileName + "]") )
                {
                        $("data[name=" + fileName + "]").find( "node[id='"+index+"']" ).children().each(function ()
                        {
                                $(this).attr("type",    "root");
                                $(this).attr("width",   120);
                                $(this).attr("height",  30);
                                $(this).attr("posX",    parseInt($(this).attr("posX")) - 10);
                                $(this).attr("posY",    parseInt($(this).attr("posY")) - 5);
                        });
                }
                var contents = $("data[name=" + fileName + "]").find( "node[id='"+index+"']" ).html();

                $("data[name=" + fileName + "]").find( "node[id='"+index+"']" ).parent().append(contents);
                $("data[name=" + fileName + "]").find( "node[id='"+index+"']" ).remove();

                io.emit('appMindmapDeleteNode', index, contents, fileName);
        });

        //NOT IMPLEMENTED ATM

        socket.on('appMindmapChangeParent', function(index, newParent)
        {
                var clone = $("node[id='"+index+"']").clone();
                clone.html("");

                var contents = $("node[id='"+index+"']").contents();
                $("node[id='"+index+"']").replaceWith(contents);
                $("node[id='"+newParent+"']").append(clone);

                io.emit('appMindmapChangeParent', index, newParent);
        });

        //Deletes the Node + its whole SubElements
        //the id of the object which should be deleted
        //is sent to the server.

        socket.on('appMindmapDeleteSubtree', function(index, fileName)
        {
                $("data[name=" + fileName + "]").find( "node[id='"+index+"']" ).remove();

                io.emit('appMindmapDeleteSubtree', index, fileName);
        });

        //Saves the whole mindmap. Only the open file is being saved.
        //Parallel files are not saved.

        socket.on('appMindmapSave', function(image, fileName)
        {
                var errorMessage = "";

                connection.query("INSERT IGNORE INTO dataAppMindmap (fileName) VALUES ('" + fileName + "')", function(err, rows, fields)
                {
                        if(err) errorMessage += "Fehler beim Schreiben: SQL1<br>";
                });
                connection.query("UPDATE dataAppMindmap SET content = '" + $("data[name=" + fileName + "]").html() + "'    WHERE fileName =  '" + fileName + "'    ", function(err, rows, fields)
                {
                        if(err) errorMessage += "Fehler beim Schreiben: SQL2<br>";
                });


                var data  = image.replace(/^data:image\/\w+;base64,/, '');
                var fs    = require("fs");

                //UNQUOTE THIS LATER
                var path  = "/var/www/html/app/screenshots/mindmap_" + fileName + ".png";
                //UNQUOTE THIS LATER
                //DELETE THIS LATER
                //var path  = "screenshots/mindmap_" + fileName + ".png";
                //DELETE THIS LATER

                fs.writeFile(path, data, {encoding: 'base64'}, function(err)
                {
                        if(err == "" || err == null)
                        {
                                console.log("EXEC :: IMAGESAVE:\t\tSUCCESS");
                        }
                        else
                        {
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
        socket.on('sendObj',
		function(obj, username, fileName)
		{
		  allObj.push(obj);
		  socket.broadcast.emit('receiveObj', obj, username, fileName);
		}
	 );
	/*
	* function to handle clear-command and send to Clients
	*/
        socket.on('clear',
		function(fileName)
		{ 
		  socket.broadcast.emit('clear', fileName);
		  allObj.length = 0;
		  connection.query("UPDATE dataAppDraw SET content = '' WHERE fileName =  '" + fileName + "'    "); 
		}
	);
	/*
	* function to handle save Obj 
	*/
        socket.on('appDrawingSave', function(image, fileName)
	{
		createString(fileName); //save allObj as String in database
		var data = image.replace(/^data:image\/\w+;base64,/, '');
		var fs = require("fs");
		var date=new Date();
		//DELETE THIS LATER
		imgFileName="draw_"+date.getTime()+".png";
		var path = "/var/www/html/app/drawings/"+imgFileName;
		//DELETE THIS LATER
		//UNQUOTE THIS LATER
		//var path = "drawings/draw_"+fileName+".png";
		//UNQUOTE THIS LATER
		//DELETE THIS LATER
		var path = "/var/www/html/app/drawings/draw_"+fileName+".png";
		//DELETE THIS LATER
		fs.writeFile(path, data, {encoding: 'base64'}, function(err)
		{
		 console.log("error: "+err);
			io.emit('appDrawingSave', fileName);
		});
	});
	//NENA END
});

//NENA BEGIN
/*
* function to create String with objdata and save to DB
*/

var allObj = [];

function createString(fileName)
{
	var string ="";
	for(var i = 0; i < allObj.length; i++)
	{
		if(allObj[i].fileName == fileName)
		{
			switch(allObj[i].name)
			{
				case 'pencil':
					string = string+allObj[i].x+"###"+allObj[i].y+"###"+allObj[i].v+"###"+allObj[i].xp+"###"+allObj[i].yp+"###"+allObj[i].col+"###"+allObj[i].l+"###"+allObj[i].name+"###"+allObj[i].fileName+"***";
					break;
				case 'pencilarray':
					var allObjects=allObj[i].objArray[0].x+"###"+allObj[i].objArray[0].y+"###"+allObj[i].objArray[0].v+"###"+allObj[i].objArray[0].xp+"###"+allObj[i].objArray[0].yp+"###"+allObj[i].objArray[0].col+"###"+allObj[i].objArray[0].l+"###"+allObj[i].objArray[0].name+"###"+allObj[i].objArray[0].fileName+"***";
					for (j=1; j<allObj[i].objArray.length; j++){
						allObjects+="+++"+allObj[i].objArray[j].x+"###"+allObj[i].objArray[j].y+"###"+allObj[i].objArray[j].v+"###"+allObj[i].objArray[j].xp+"###"+allObj[i].objArray[j].yp+"###"+allObj[i].objArray[j].col+"###"+allObj[i].objArray[j].l+"###"+allObj[i].objArray[j].name+"###"+allObj[i].objArray[j].fileName+"***";
					}
					string = string+allObjects+"+++"+allObj[i].name+"###"+allObj[i].fileName+"***";
					break;
				case 'line':
					string = string+allObj[i].x+"###"+allObj[i].y+"###"+allObj[i].v+"###"+allObj[i].xp+"###"+allObj[i].yp+"###"+allObj[i].col+"###"+allObj[i].l+"###"+allObj[i].name+"###"+allObj[i].fileName+"***";
					break;
				case 'rect':
					string = string+allObj[i].x+"###"+allObj[i].y+"###"+allObj[i].v+"###"+allObj[i].width+"###"+allObj[i].height+"###"+allObj[i].col+"###"+allObj[i].filled+"###"+allObj[i].l+"###"+allObj[i].name+"###"+allObj[i].fileName+"***";
					break;
				case 'circle':
					string = string+allObj[i].x+"###"+allObj[i].y+"###"+allObj[i].v+"###"+allObj[i].width+"###"+allObj[i].height+"###"+allObj[i].col+"###"+allObj[i].filled+"###"+allObj[i].l+"###"+allObj[i].name+"###"+allObj[i].fileName+"***";
					break;
				case 'text':
					string = string+allObj[i].x+"###"+allObj[i].y+"###"+allObj[i].str+"###"+allObj[i].size+"###"+allObj[i].family+"###"+allObj[i].col+"###"+allObj[i].l+"###"+allObj[i].name+"###"+allObj[i].fileName+"***";
					break;
				case 'img':
					string = string+allObj[i].src+"###"+allObj[i].x+"###"+allObj[i].y+"###"+allObj[i].l+"###"+allObj[i].name+"###"+allObj[i].fileName+"***";
					break;
			}
		}		
	}
	connection.query("INSERT IGNORE INTO dataAppDraw (filename,content) VALUES ('" + fileName + "','" + string + "')");
	connection.query("UPDATE dataAppDraw SET content = '" + string + "'    WHERE fileName =  '" + fileName + "'    ");
}
//NENA END

