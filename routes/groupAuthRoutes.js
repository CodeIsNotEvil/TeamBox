const { Router } = require('express');
const groupAuth = require('../services/auth/groupAuth');
const { requireAuth, requireGroup, checkUser, checkGroup } = require('../middleware/authMiddleware');


const router = Router();


router.all("*", checkUser, requireAuth);

router.get('/groupCreate', groupAuth.group_create_get);
router.post('/groupCreate', groupAuth.group_create_post);
router.get('/groupSelect', groupAuth.group_select_get);
router.post('/groupSelect', groupAuth.group_select_post);

router.get('/groupLogout', checkGroup, requireGroup, groupAuth.group_logout_get);
router.post('/groupLogout', checkGroup, requireGroup, groupAuth.group_logout_post)

module.exports = router;