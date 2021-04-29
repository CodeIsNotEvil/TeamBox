const { Router } = require('express');
const userAuthController = require('../services/auth/userAuthController');

const router = Router();

router.get('/signup', userAuthController.signup_get);
router.post('/signup', userAuthController.signup_post);
router.get('/login', userAuthController.login_get);
router.post('/login', userAuthController.login_post);
router.get('/logout', userAuthController.logout_get);

module.exports = router;