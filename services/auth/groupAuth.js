const { JWT_SECRET } = require("../../config/untracked");
const jwt = require('jsonwebtoken');
const Group = require("../../models/Group");
const OldGroup = require("../../services/Group");
const { loadGroups } = require("../groupHandler");

const handleErrors = error => {
    let err = { name: '' };
    console.log(error);
    // incorrect name
    if (error.message === 'incorrect name') {
        err.name = 'that group is not registerd';
    }

    // duplicate error code
    if (error.code === 11000) {
        err.name = 'That Group is already registered'
        return err
    }

    //validation errors
    if (error.message.includes('user validation failed')) {
        Object.values(error.errors).forEach(({ properties }) => {
            err[properties.path] = properties.message;
        });
    }
    console.log(error);
    return err
}



const maxAge = 8 * 60 * 60; //secounds wich equals 8h
const createToken = (uid, gid) => {
    return jwt.sign({ uid, gid }, JWT_SECRET, {
        expiresIn: maxAge
    });

}


module.exports.group_select_get = (req, res) => {
    loadGroups();
    res.render('auth/groupSelect', { groupNameList: OldGroup.groups });
}

module.exports.group_create_get = (req, res) => {
    res.render('auth/groupCreate');
}

module.exports.group_select_post = (req, res) => {
    console.log(req.body.groupName);
}

module.exports.group_create_post = async (req, res) => {

    if (res.locals.user && req.body.groupName) {
        const { groupName } = req.body;
        const user = res.locals.user;
        try {
            const users = new Array()
            users.push(user.name);
            const group = await Group.create({ 'name': groupName, users });
            console.log(group);
            const token = createToken(user._id, group._id);
            console.log(token);
            res.cookie('group_jwt', token, { httpOnly: true, maxAge: maxAge * 1000 });
            res.status(201).json({ user: user._id, group: group._id });
        } catch (error) {
            const errors = handleErrors(error);
            res.status(400).json({ errors });
        }
        //res.send({ 'username': res.locals.user.name, 'groupName': req.body.groupName });
    }



    //res.render('auth/loadingPage',);
}