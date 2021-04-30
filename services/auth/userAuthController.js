
const User = require('../../models/User');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../../config/untracked');
//handle errors
const handleErrors = error => {
    let err = { email: '', name: '', password: '' };
    //console.log(error);
    // incorrect name
    if (error.message === 'incorrect name') {
        err.name = 'that user is not registered';
    }

    // incorrect password
    if (error.message === 'incorrect password') {
        err.password = 'that password is incorrect';
    }

    // duplicate error code
    if (error.code === 11000) {
        err.name = 'that name is already registered'
        return err
    }

    //validation errors
    if (error.message.includes('user validation failed')) {
        Object.values(error.errors).forEach(({ properties }) => {
            err[properties.path] = properties.message;
        });
    }
    //console.log(error);
    return err
}

const maxAge = 8 * 60 * 60; //secounds wich equals 8h
const createToken = id => {
    return jwt.sign({ id }, JWT_SECRET, {
        expiresIn: maxAge
    });

}

module.exports.signup_get = (req, res) => {
    res.render('auth/signup');
}

module.exports.login_get = (req, res) => {
    res.render('auth/login');
}

module.exports.signup_post = async (req, res) => {
    const { name, password } = req.body;
    const email = `${name}@TeamBox.local`;
    try {
        const user = await User.create({ name, password, email });
        const token = createToken(user._id);
        res.cookie('user_jwt', token, { httpOnly: true, maxAge: maxAge * 1000 });
        res.status(201).json({ user: user._id });
    } catch (error) {
        const errors = handleErrors(error);
        res.status(400).json({ errors });
    }
}

module.exports.login_post = async (req, res) => {
    const { name, password } = req.body;

    try {
        const user = await User.login(name, password);
        const token = createToken(user._id);
        res.cookie('user_jwt', token, { httpOnly: true, maxAge: maxAge * 1000 });
        res.status(200).json({ user: user._id });
    } catch (error) {
        const errors = handleErrors(error);
        res.status(400).json({ errors });
    }
}

module.exports.logout_get = async (req, res) => {

    if (hasGroupToken(req)) {
        //redirect to the group
        res.redirect('/groupLogout');
    } else {
        res.cookie('user_jwt', '', { maxAge: 1 });
        // redirecting to the login page
        res.redirect('/login');
    }
}

const hasGroupToken = (req) => {
    const token = req.cookies.group_jwt;
    // check if the json web token exists and is verified
    if (token) {
        const decodedToken = jwt.verify(token, JWT_SECRET);
        return true;
    }
    return false;
}