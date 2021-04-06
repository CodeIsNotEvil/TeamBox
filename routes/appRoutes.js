const { PATH_TO_VIEWS, MAX_USER_COUNT } = require('../config/server');
const { getMySQLConnection } = require('../services/mysqlHandler');
const Ethercalc = require('../services/ethercalc/ethercalcHandler');
const getEtherpadEntries = require('../services/etherpadHandler');
const Group = require('../services/Group');

function appRoutes(app) {
        app.get("/appDrawLoad.ejs", function (req, res) {
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
                                res.render(PATH_TO_VIEWS + "/appDrawLoad.ejs", { username: req.session.username, group: Group.group, color: req.session.usercolor, data: fileNames });
                        });
                        
                }
                else {

                        return res.redirect("/login01.ejs");

                }

        });

        /**
        * function to render HTML and redirect to appDraw.ejs
        */
        app.get("/appDraw.ejs", function (req, res) {
                if (req.session.username) {
                        let mysqlconnection = getMySQLConnection();
                        mysqlconnection.query("SELECT * FROM dataAppDraw", function (err, result) {
                                let fileNames = [];
                                let contents = [];
                                if (err) {
                                    console.log(err);
                                }
                                for (var i = 0; i < result.length; i++) {
                                    fileNames.push(result[i].fileName);
                                    contents.push(result[i].content);
                                }
                                //data = fileNames.toString();
                                res.render(PATH_TO_VIEWS + "/appDraw.ejs", { username: req.session.username, group: Group.group, color: req.session.usercolor, drawObjData: contents, data: fileNames });
                        });
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
                                res.render(PATH_TO_VIEWS + "/appMindmapLoad.ejs", { username: req.session.username, group: Group.group, color: req.session.usercolor, data: data });
                        });

                        
                }
                else {
                        return res.redirect("/login01.ejs");
                }
        });

        app.get("/appMindmap.ejs", function (req, res) {
                if (req.session.username) {

                        res.render(PATH_TO_VIEWS + "/appMindmap.ejs", { username: req.session.username, group: Group.group, color: req.session.usercolor });
                }
                else {
                        return res.redirect("/login01.ejs");
                }
        });


        app.get("/appEtherpadLoad.ejs", function (req, res) {
                if (req.session.username) {

                        let data = getEtherpadEntries();

                        res.render(PATH_TO_VIEWS + "/appEtherpadLoad.ejs", { username: req.session.username, group: Group.group, color: req.session.usercolor, data: data });
                }
                else {
                        return res.redirect("/login01.ejs");
                }
        });


        app.get("/appEthercalcLoad.ejs", function (req, res) {
                if (req.session.username) {
                        let data = Ethercalc.getEntries();
                        //console.log("EthercalcData: " + data);

                        res.render(PATH_TO_VIEWS + "/appEthercalcLoad.ejs", { username: req.session.username, group: Group.group, color: req.session.usercolor, data: data });
                }
                else {
                        return res.redirect("/login01.ejs");
                }
        });

        app.get("/wekanLoad.ejs", function (req, res) {
                if (req.session.username) {

                        res.render(PATH_TO_VIEWS + "/wekanLoad.ejs", { username: req.session.username, group: Group.group, color: req.session.usercolor });
                }
                else {
                        return res.redirect("/login01.ejs");
                }
        });
}

module.exports = appRoutes;

