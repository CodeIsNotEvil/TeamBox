const { Router } = require('express');
const teamboxAuth = require('../services/auth/teamboxAuth');

const router = Router();

router.get('/signup', teamboxAuth.signup_get);
router.post('/signup', teamboxAuth.signup_post);
router.get('/login', teamboxAuth.login_get);
router.post('/login', teamboxAuth.login_post);
router.get('/logout', teamboxAuth.logout_get);

module.exports = router;