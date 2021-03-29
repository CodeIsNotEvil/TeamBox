const { PATH_TO_VIEWS, MAX_USER_COUNT } = require('../config/server');
const { exportAsync } = require('../services/syncHandler');

const { startUp, writeUserdata, createAndSaveUserSession: createAndSaveUserSession } = require('../services/mysqlHandler');
const usbCheckFree = require('../services/USBHandler');

const { loadGroups } = require('../services/groupHandler');
const groupHandler = require('../services/groupHandler');
const user = require('../models/MySQLUser');
const Group = require('../services/Group');



function routes(app) {

        //clearMongoDBOnStartUp(); this is not be required cause i drop before importing the group related or empty db
        //mongorestore needs about 5-10sec so i only use it if it's necessary

        startUp();
        exportAsync();
        /**
        * Default route.
        */
        app.get("/", function (req, res) {
                if (!req.session.username && !Group.mysqlIsImported) {
                        loadGroups();
                        res.render(PATH_TO_VIEWS + "/login01.ejs", { groups: Group.groups });
                }
                else if (!req.session.username && Group.group != "") {
                        return res.redirect("/login02.ejs");
                }
                else {
                        return res.redirect("/hub.ejs");
                }
        });


        /**
         * Group login post.
         */
        app.post('/login01.ejs', function (req, res) {
                let errorMessage = "";

                if (req.body.user.group == "" || req.body.user.group == null) {
                        errorMessage += "Please enter a group name first";
                        res.end(errorMessage);
                }
                else {
                        if (groupHandler.importCheck() == false) {
                                if(groupHandler.isGroupSelected(req.body.user.group)){
                                        groupHandler.import();
                                } else {
                                        errorMessage += "\ngroup could not be selected";
                                        res.end(errorMessage); 
                                }
                        }
                        res.end("loginSuccess");
                }
        });


        /**
        * User login post.
        */
        app.post('/login02.ejs', function (req, res) {
                var nameIsInUse = false;
                var nameIsIllegal = false;
                var nameIsEmpty = false;
                var maxClientsReached = false;
                var errorMessage = "";


                var replUserName = req.body.user.name.replace(/[^a-z0-9-_\s]/gi, '').replace(/\s+/g, "_").toLowerCase();
                // Check if the choosen username is currently in use.
                for (let i = 0; i < Group.clients.length; i++) {
                        if (Group.clients[i].username == replUserName) {
                                nameIsInUse = true;
                        }
                }

                // Check if the choosen username is one of the illegal ones (admin, Teambox...).
                for (let i = 0; i < Group.illegalClients.length; i++) {
                        if (Group.illegalClients[i].toLowerCase() == replUserName) {
                                nameIsIllegal = true;
                        }
                }

                // Check if there are already the maximum number of users (currently 7).
                if (Group.clients.length > MAX_USER_COUNT) {
                        maxClientsReached = true;
                }

                // Check if the username is empty or null, also assamles the error massage
                if (req.body.user.name == "" || req.body.user.name == null) {
                        errorMessage += "Please select a username.";
                        nameIsEmpty = true;
                }
                else if (nameIsInUse) {
                        errorMessage += "Another user already entered this username";
                }
                else if (nameIsIllegal) {
                        errorMessage += "This name is not available";
                }
                if (maxClientsReached) {
                        errorMessage = "Only " + MAX_USER_COUNT + " users can join a group.";
                }

                // Send the error massage if there was a error during the username selection.
                if (nameIsEmpty || nameIsInUse || nameIsIllegal || maxClientsReached) {
                        res.end(errorMessage);
                }
                else if (!nameIsEmpty && !nameIsInUse && !nameIsIllegal && !maxClientsReached) {

                        let username = replUserName;
                        // Gets the users IPv4 adress and replaces the IPv6 part with an empty string
                        let ip = req.socket.remoteAddress.replace(/[f:]/g, '');
                        // Selects a random color for the user
                        let color = 'rgb(' + (50 + Math.floor(Math.random() * 156)) + ',' + (50 + Math.floor(Math.random() * 156)) + ',' + (50 + Math.floor(Math.random() * 156)) + ')';

                        // Writes the userdata to the TeamBox database
                        writeUserdata(username, color, ip);

                        // Create and save the session for this user 
                        createAndSaveUserSession(username, function (err, result, fields) {
                                req.session.username = result[0].user.toLowerCase();
                                req.session.usercolor = result[0].color;
                                req.session.userLanguage = result[0].language;
                                req.session.save();
                                Group.clients.push(new user(result[0].user.toLowerCase(), result[0].color, result[0].language));
                            });
                        res.end("loginSuccess");
                }
        });

        app.get("/login01.ejs", function (req, res) {
                if (!req.session.username && !Group.mysqlIsImported) {
                        loadGroups();
                        res.render(PATH_TO_VIEWS + "/login01.ejs", { groups: Group.groups });
                }
                else if (!req.session.username && Group.group != "") {
                        return res.redirect("/login02.ejs");
                }
                else {
                        return res.redirect("/hub.ejs");
                }
        });

        app.get("/login02.ejs", function (req, res) {
                if (!req.session.username && !Group.mysqlIsImported && Group.group == "") {
                        return res.redirect("/login01.ejs");
                }
                else if (!req.session.username && Group.mysqlIsImported && Group.group != "") {
                        res.render(PATH_TO_VIEWS + "/login02.ejs", { group: Group.group });
                }
                else {
                        return res.redirect("/hub.ejs");
                }
        });

        app.get("/hub.ejs", function (req, res) {
                if (req.session.username) {
                        // LARA 02.08.2016
                        usbString = usbCheckFree();
                        res.render(PATH_TO_VIEWS + "/hub.ejs", { username: req.session.username, group: Group.group, color: req.session.usercolor, usbString: usbString });
                        // LARA end
                }
                else {
                        return res.redirect("/login01.ejs");
                }
        });

        app.get("/logout.ejs", function (req, res) {
                if (req.session.username) {
                        for (var i = 0; i < Group.clients.length; i++) {
                                if (Group.clients[i].username == req.session.username) {
                                        Group.clients.splice(i, 1);
                                }
                        }
                        req.session.destroy();
                        res.render(PATH_TO_VIEWS + "/logout.ejs");
                }
                else {
                        return res.redirect("/login01.ejs");
                }
        });
}

module.exports = routes;