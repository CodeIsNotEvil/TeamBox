const { Router } = require('express');
const router = Router();

router.get('/set-cookies', (req, res) => {
    //res.setHeader('Set-Cookie', 'newUser=true');
    res.cookie('newUser', false);
    res.cookie('isEmployee', true, { httpOnly: true });
    res.send('you got cookies!');
});

router.get('/read-cookies', (req, res) => {
    const cookies = req.cookies
    console.log(cookies);
    res.json(cookies);
});
module.exports = router;