const { Router } = require('express');
const groupAuthController = require('../services/auth/groupAuthController');
const { requireAuth, requireGroup, checkUser, checkGroup } = require('../middleware/authMiddleware');


const router = Router();


router.all("*", checkUser, requireAuth);

router.get('/groupCreate', groupAuthController.group_create_get);
router.post('/groupCreate', groupAuthController.group_create_post);
router.get('/groupSelect', groupAuthController.group_select_get);
router.post('/groupSelect', groupAuthController.group_select_post);

router.get('/groupJoin', groupAuthController.group_join_get);
router.post('/groupJoin', groupAuthController.group_join_post);

router.get('/groupLogout', checkGroup, requireGroup, groupAuthController.group_logout_get);
router.post('/groupLogout', checkGroup, requireGroup, groupAuthController.group_logout_post)

module.exports = router;