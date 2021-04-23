const { DRAW_PAD_USE_NEW_DATA_STRUCTURE } = require('../config/server');
const { getMySQLConnection } = require('../services/mysqlHandler');
const Ethercalc = require('../services/ethercalc/ethercalcHandler');
const getEtherpadEntries = require('../services/etherpadHandler');
const Group = require('../services/Group');

let DrawApp;
let drawApp;

if (DRAW_PAD_USE_NEW_DATA_STRUCTURE) {
        DrawApp = require('../services/draw-app/DrawApp');
} else {
        drawApp = require('../services/drawApp/drawApp');
}

function appRoutes(app) {
        app.get("/appDrawLoad.ejs", function (req, res) {
                if (DRAW_PAD_USE_NEW_DATA_STRUCTURE) {
                        DrawApp.getAllFileNames(Group.group).then((fileNames) => {
                                res.render("newappDrawLoad", {
                                        username: req.session.username,
                                        group: Group.group,
                                        color: req.session.usercolor,
                                        data: fileNames
                                });
                        });


                } else {
                        if (req.session.username) {
                                let mysqlconnection = getMySQLConnection();
                                mysqlconnection.query("SELECT * FROM dataAppDraw", function (err, result) {
                                        let fileNames = [];
                                        if (err) {
                                                console.log(err);
                                        }
                                        for (var i = 0; i < result.length; i++) {
                                                fileNames.push(result[i].fileName);
                                        }
                                        //let data = JSON.stringify(fileNames);
                                        //data = fileNames.toString();
                                        res.render("appDrawLoad", { username: req.session.username, group: Group.group, color: req.session.usercolor, data: fileNames });
                                });

                        }
                        else {

                                return res.redirect("/login01.ejs");

                        }
                }


        });

        /**
        * function to render HTML and redirect to appDraw.ejs
        */
        app.get("/appDraw.ejs", function (req, res) {
                if (req.session.username) {
                        if (DRAW_PAD_USE_NEW_DATA_STRUCTURE) {
                                res.render("newappDraw", {
                                        username: req.session.username,
                                        group: Group.group,
                                        color: req.session.usercolor,
                                        data: DrawApp.document
                                });

                        } else {
                                let mysqlconnection = getMySQLConnection();
                                mysqlconnection.query("SELECT * FROM dataAppDraw", function (err, result) {
                                        let fileNames = [];
                                        let contents = [];
                                        if (err) {
                                                console.log(err);
                                        } else {
                                                for (var i = 0; i < result.length; i++) {
                                                        fileNames.push(result[i].fileName);
                                                        contents.push(result[i].content);
                                                        //content did not get updated on the first reload a secound one is requiered
                                                        //console.log(contents[i]);
                                                        //console.log("\n\n" + fileNames[i]+ "\n");
                                                }
                                                //data = fileNames.toString();
                                                drawApp.initAllObj(fileNames, contents);
                                                res.render("appDraw", { username: req.session.username, group: Group.group, color: req.session.usercolor, drawObjData: contents, data: fileNames });
                                        }

                                });
                        }
                } else {
                        return res.redirect("/login01.ejs");
                }

        });


        app.get("/appMindmapLoad.ejs", function (req, res) {
                if (req.session.username) {
                        //let data = getMindmapData();
                        let mysqlconnection = getMySQLConnection();
                        mysqlconnection.query("SELECT * FROM dataAppMindmap", function (err, result,) {
                                let data = [];
                                if (err) {
                                        console.log(err);
                                }
                                for (var i = 0; i < result.length; i++) {
                                        data.push(result[i].fileName);
                                }
                                res.render("appMindmapLoad", { username: req.session.username, group: Group.group, color: req.session.usercolor, data: data });
                        });


                }
                else {
                        return res.redirect("/login01.ejs");
                }
        });

        app.get("/appMindmap.ejs", function (req, res) {
                if (req.session.username) {

                        res.render("appMindmap", { username: req.session.username, group: Group.group, color: req.session.usercolor });
                }
                else {
                        return res.redirect("/login01.ejs");
                }
        });


        app.get("/appEtherpadLoad.ejs", function (req, res) {
                if (req.session.username) {

                        let data = getEtherpadEntries();

                        res.render("appEtherpadLoad", { username: req.session.username, group: Group.group, color: req.session.usercolor, data: data });
                }
                else {
                        return res.redirect("/login01.ejs");
                }
        });


        app.get("/appEthercalcLoad.ejs", function (req, res) {
                if (req.session.username) {
                        let data = Ethercalc.getEntries();
                        //console.log("EthercalcData: " + data);

                        res.render("appEthercalcLoad", { username: req.session.username, group: Group.group, color: req.session.usercolor, data: data });
                }
                else {
                        return res.redirect("/login01.ejs");
                }
        });

        app.get("/wekanLoad.ejs", function (req, res) {
                if (req.session.username) {

                        res.render("wekanLoad", { username: req.session.username, group: Group.group, color: req.session.usercolor });
                }
                else {
                        return res.redirect("/login01.ejs");
                }
        });

        app.get("/filebrowserLoad.ejs", function (req, res) {
                if (req.session.username) {
                        res.render("filebrowserLoad", { username: req.session.username, group: Group.group, color: req.session.usercolor });
                }
                else {
                        return res.redirect("/login01.ejs");
                }
        });
}

module.exports = appRoutes;

