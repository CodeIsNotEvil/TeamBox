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

module.exports = router;