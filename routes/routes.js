const { Router } = require('express');
const router = Router();
const { requireAuth, requireGroup, checkUser, checkGroup } = require('../middleware/authMiddleware');
const routesController = require('../services/routesController');


//User check on every route
router.all("*", checkUser, checkGroup);

/**
* Default route.
*/
router.get("/", requireAuth, requireGroup, routesController.hub_get);

router.get("/help", routesController.help_get);

router.get("/settings", requireAuth, requireGroup, routesController.settings_get);
router.post("/settings/shutdownpi", requireAuth, requireGroup, routesController.settings_shutdownpi_post);
router.post("/settings/clearalldata", requireAuth, requireGroup, routesController.settings_clearalldata_post);

module.exports = router;