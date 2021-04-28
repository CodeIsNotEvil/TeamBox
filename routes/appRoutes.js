const { getMySQLConnection } = require('../services/mysqlHandler');
const Ethercalc = require('../services/ethercalc/ethercalcHandler');
const getEtherpadEntries = require('../services/etherpadHandler');
const Group = require('../services/Group');
const { requireAuth, requireGroup, checkUser, checkGroup } = require('../middleware/authMiddleware');
const DrawApp = require('../services/draw-app/DrawApp');

function appRoutes(app) {
        app.get('*', requireAuth, requireGroup, checkUser, checkGroup);

        app.get("/appDrawLoad.ejs", async function (req, res) {
                const user = res.locals.user
                const group = res.locals.group
                const fileNames = await DrawApp.getAllFileNames(group.name)

                res.render("newappDrawLoad", {
                        username: user.name,
                        color: user.color,
                        data: fileNames
                });
        });

        /**
        * function to render HTML and redirect to appDraw.ejs
        */
        app.get("/appDraw.ejs", function (req, res) {
                const user = res.locals.user;
                const group = res.locals.group;
                res.render("newappDraw", {
                        username: user.name,
                        group: group.name,
                        color: user.color,
                        data: DrawApp.document
                });
        });


        app.get("/appMindmapLoad.ejs", function (req, res) {
                //let data = getMindmapData();
                const user = res.locals.user
                let mysqlconnection = getMySQLConnection();
                mysqlconnection.query("SELECT * FROM dataAppMindmap", function (err, result,) {
                        let data = [];
                        if (err) {
                                console.log(err);
                        }
                        for (var i = 0; i < result.length; i++) {
                                data.push(result[i].fileName);
                        }
                        res.render("appMindmapLoad", { username: user.name, color: user.color, data: data });
                });
        });

        app.get("/appMindmap.ejs", function (req, res) {
                const user = res.locals.user;
                const group = res.locals.group;
                res.render("appMindmap", { username: user.name, group: group.name, color: user.color });
        });


        app.get("/appEtherpadLoad.ejs", function (req, res) {
                let data = getEtherpadEntries();
                const user = res.locals.user
                res.render("appEtherpadLoad", { username: user.name, color: user.color, data: data });
        });


        app.get("/appEthercalcLoad.ejs", function (req, res) {
                let data = Ethercalc.getEntries();
                const user = res.locals.user
                res.render("appEthercalcLoad", { username: user.name, data: data });
        });

        app.get("/wekanLoad.ejs", function (req, res) {
                //const user = res.locals.user
                //const group = res.locals.group
                res.render("wekanLoad");
        });

        app.get("/filebrowserLoad.ejs", function (req, res) {
                const user = res.locals.user
                res.render("filebrowserLoad", { username: user.name });
        });
}

module.exports = appRoutes;

