const { Router } = require('express');
const router = Router();

const { requireAuth, requireGroup, checkUser, checkGroup } = require('../middleware/authMiddleware');


//User check on every route
router.all("*", checkUser, checkGroup);

/**
* Default route.
*/
router.get("/", requireAuth, requireGroup, function (req, res) {
        res.render("newHub");
});

router.get("/help", function (req, res) {
        res.render("help");
});

router.get("/settings", function (req, res) {
        res.render("settings");
})

module.exports = router;