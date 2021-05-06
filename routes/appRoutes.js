const { Router } = require('express');
const router = Router();

const { getMySQLConnection } = require('../services/mysqlHandler');
const Ethercalc = require('../services/ethercalc/ethercalcHandler');
const getEtherpadEntries = require('../services/etherpadHandler');
const { requireAuth, requireGroup, checkUser, checkGroup } = require('../middleware/authMiddleware');

const DrawController = require('../services/drawpad/DrawController');

router.get('*', requireAuth, requireGroup, checkUser, checkGroup);


router.get("/drawPadLoad", DrawController.drawpad_load_get);
router.get("/drawPad", DrawController.drawpad_get);


router.get("/appMindmapLoad.ejs", function (req, res) {
        //let data = getMindmapData();
        const user = res.locals.user
        let mysqlconnection = getMySQLConnection();
        mysqlconnection.query("SELECT * FROM dataAppMindmap", function (err, result,) {
                let data = [];
                if (err) {
                        console.error(err);
                }
                for (var i = 0; i < result.length; i++) {
                        data.push(result[i].fileName);
                }
                res.render("appMindmapLoad", { username: user.name, color: user.color, data: data });
        });
});

router.get("/appMindmap.ejs", function (req, res) {
        const user = res.locals.user;
        const group = res.locals.group;
        res.render("appMindmap", { username: user.name, group: group.name, color: user.color });
});


router.get("/appEtherpadLoad.ejs", function (req, res) {
        let data = getEtherpadEntries();
        const user = res.locals.user
        let color = removeAlphaValueFromColor(user.color);
        res.render("appEtherpadLoad", { username: user.name, color: color, data: data });
});

removeAlphaValueFromColor = (rgbaColor) => {
        //rgbaColor: rgba(79,119,57,0.5)

        //[0-9]{1,3},[0-9]{1,3},[0-9]{1,3}/g match Example: 79,119,57
        let rgbValues = rgbaColor.match(/[0-9]{1,3},[0-9]{1,3},[0-9]{1,3}/g);
        //rgbValues: ['79,119,57']

        let rgbColor = `rgb(${rgbValues[0]})`;
        //rgbColor: rgb(79,119,57)

        return rgbColor;

}


router.get("/appEthercalcLoad.ejs", function (req, res) {
        let data = Ethercalc.getEntries();
        const user = res.locals.user
        res.render("appEthercalcLoad", { username: user.name, data: data });
});

router.get("/wekanLoad.ejs", function (req, res) {
        //const user = res.locals.user
        //const group = res.locals.group
        res.render("wekanLoad");
});

router.get("/filebrowserLoad.ejs", function (req, res) {
        const user = res.locals.user
        res.render("filebrowserLoad", { username: user.name });
});

module.exports = router;

