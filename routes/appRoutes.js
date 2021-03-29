const { PATH_TO_VIEWS, MAX_USER_COUNT } = require('../config/server');
const { getDrawData, getDrawObjectData, getMindmapData } = require('../services/mysqlHandler');
const {loadGroups, chooseGroup, createGroup} = require('../services/groupHandler');
const groupHandler = require('../services/groupHandler');
const getEthercalcEntries = require('../services/ethercalcHandler');
const getEtherpadEntries = require('../services/etherpadHandler');

function appRoutes(app) {
        app.get("/appDrawLoad.ejs", function (req, res) {

                if (req.session.username) {
                        let data = getDrawData();
                        res.render(PATH_TO_VIEWS + "/appDrawLoad.ejs", { username: req.session.username, group: groupHandler.group, color: req.session.usercolor, data: data });
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

                        let drawObjData = getDrawObjectData();
                        let data = getDrawData();

                        res.render(PATH_TO_VIEWS + "/appDraw.ejs", { username: req.session.username, group: groupHandler.group, color: req.session.usercolor, drawObjData: drawObjData, data: data });
                }
                else {
                        return res.redirect("/login01.ejs");
                }
        });


        app.get("/appMindmapLoad.ejs", function (req, res) {
                if (req.session.username) {

                        let data = getMindmapData();

                        res.render(PATH_TO_VIEWS + "/appMindmapLoad.ejs", { username: req.session.username, group: groupHandler.group, color: req.session.usercolor, data: data });
                }
                else {
                        return res.redirect("/login01.ejs");
                }
        });

        app.get("/appMindmap.ejs", function (req, res) {
                if (req.session.username) {

                        res.render(PATH_TO_VIEWS + "/appMindmap.ejs", { username: req.session.username, group: groupHandler.group, color: req.session.usercolor });
                }
                else {
                        return res.redirect("/login01.ejs");
                }
        });


        app.get("/appEtherpadLoad.ejs", function (req, res) {
                if (req.session.username) {

                        let data = getEtherpadEntries();

                        res.render(PATH_TO_VIEWS + "/appEtherpadLoad.ejs", { username: req.session.username, group: groupHandler.group, color: req.session.usercolor, data: data });
                }
                else {
                        return res.redirect("/login01.ejs");
                }
        });


        app.get("/appEthercalcLoad.ejs", function (req, res) {
                if (req.session.username) {

                        let data = getEthercalcEntries();
                        console.log("EthercalcData: " + data);

                        res.render(PATH_TO_VIEWS + "/appEthercalcLoad.ejs", { username: req.session.username, group: groupHandler.group, color: req.session.usercolor, data: data });
                }
                else {
                        return res.redirect("/login01.ejs");
                }
        });

        app.get("/wekanLoad.ejs", function (req, res) {
                if (req.session.username) {
                        
                        res.render(PATH_TO_VIEWS + "/wekanLoad.ejs", { username: req.session.username, group: groupHandler.group, color: req.session.usercolor });
                }
                else {
                        return res.redirect("/login01.ejs");
                }
        });
}

module.exports = appRoutes;

