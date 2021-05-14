const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/untracked');
const Group = require('../models/Group');
const User = require('../models/User');

const requireAuth = (req, res, next) => {

    const token = req.cookies.user_jwt;

    // check if the json web token exists and is verified
    if (token) {
        jwt.verify(token, JWT_SECRET, (error, decodedToken) => {
            if (error) {
                console.log(error.message);
                res.redirect('/login');
            } else {
                //console.debug(decodedToken);
                next();
            }
        });
    } else {
        res.redirect('/login');
    }
}

const requireGroup = async (req, res, next) => {

    const token = req.cookies.group_jwt;

    // check if the json web token exists and is verified
    if (token) {
        jwt.verify(token, JWT_SECRET, async (error, decodedToken) => {
            if (error) {
                console.log(error.message);
                res.redirect('/groupJoin');
            } else {
                // check if the token matches the one of the current group
                const group = await Group.findById(decodedToken.gid);
                if (!group) {
                    res.clearCookie("group_jwt");
                    res.redirect('/');
                } else if (group.isActive) {
                    next();
                } else {
                    res.redirect('/groupJoin');
                }
            }
        });
    } else {
        if (await Group.exists({ isActive: true })) {
            res.redirect('/groupJoin');
        } else {
            res.redirect('/groupSelect');
        }

    }
}

const checkUser = (req, res, next) => {
    const token = req.cookies.user_jwt;
    if (token) {
        jwt.verify(token, JWT_SECRET, async (error, decodedToken) => {
            if (error) {
                console.log(error.message);
                res.locals.user = null;
                next();
            } else {
                let user = await User.findById(decodedToken.id);
                res.locals.user = user;
                next();
            }
        });
    } else {
        res.locals.user = null;
        next();
    }
}

const checkGroup = (req, res, next) => {
    const token = req.cookies.group_jwt;
    if (token) {
        jwt.verify(token, JWT_SECRET, async (error, decodedToken) => {
            if (error) {
                console.log(error.message);
                res.locals.group = null;
                next();
            } else {
                let group = await Group.findById(decodedToken.gid);
                res.locals.group = group;
                next();
            }
        });
    } else {
        res.locals.group = null;
        next();
    }
}

const isThereAActiveGroup = async () => {
    if (await Group.exists({ isActive: true })) {
        return true;
    } else {
        return false;
    }
}

module.exports = { requireAuth, requireGroup, checkUser, checkGroup };