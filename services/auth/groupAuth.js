const { JWT_SECRET } = require("../../config/untracked");
const jwt = require('jsonwebtoken');
const Group = require("../../models/Group");
const User = require("../../models/User");
const OldGroup = require("../../services/Group");
const { loadGroups } = require("../groupHandler");
const groupHandler = require("../groupHandler");
const fileBrowser = require('../fileBrowser/fileBrowser');
const DrawApp = require('../draw-app/DrawApp');
const { exportData } = require("../syncHandler");

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
    if (OldGroup.groups.length !== 0) {
        res.render('auth/groupSelect', { groupNameList: OldGroup.groups });
    } else {
        res.redirect('/groupCreate');
    }

}

module.exports.group_create_get = (req, res) => {
    res.render('auth/groupCreate');
}

module.exports.group_select_post = async (req, res) => {
    //if (groupHandler.importCheck() == false) { //this import check only works with one group because it iterates over a array and overwrites a boolean  to check 
    try {
        OldGroup.group = req.body.groupName; //set old groupName
        groupHandler.chooseGroup();
        groupHandler.import();
        fileBrowser.startfilebrowser();
        DrawApp.init();

        const group = await Group.findOne({ name: req.body.groupName }); //look for the group in the DB
        const user = res.locals.user;

        let color = 'rgb(' + (50 + Math.floor(Math.random() * 156)) + ',' + (50 + Math.floor(Math.random() * 156)) + ',' + (50 + Math.floor(Math.random() * 156)) + ')';
        User.findByIdAndUpdate(user._id, { color: color }, (error, doc) => {
            if (error) {
                const errors = handleErrors(error);
                res.status(400).json({ errors });
            }
            console.log(doc.color);
            const token = createToken(user._id, group._id);
            res.cookie('group_jwt', token, { httpOnly: true, maxAge: maxAge * 1000 });
            res.status(201).json({ user: user._id, group: group._id });
        });

    } catch (error) {
        const errors = handleErrors(error);
        res.status(400).json({ errors });
    }

}

module.exports.group_create_post = async (req, res) => {

    const { groupName } = req.body;
    if (await Group.exists({ name: groupName })) {
        res.redirect(307, '/groupSelect');
    } else {
        const user = res.locals.user;
        try {
            OldGroup.group = groupName;
            groupHandler.createGroup();
            groupHandler.import();
            fileBrowser.startfilebrowser();
            DrawApp.init();

            const users = [user.name];
            const group = await Group.create({ 'name': groupName, users });
            const token = createToken(user._id, group._id);
            res.cookie('group_jwt', token, { httpOnly: true, maxAge: maxAge * 1000 });
            res.status(201).json({ user: user._id, group: group._id });
        } catch (error) {
            const errors = handleErrors(error);
            res.status(400).json({ errors });
        }
    }

}

module.exports.group_logout_get = async (req, res) => {
    //Render logout Dialoge
    res.render('auth/groupLogout');
}

module.exports.group_logout_post = (req, res) => {
    try {
        const groupName = res.locals.group.name;
        //Only logout group if the current group is that in the cookie
        if (groupName === OldGroup.group) {
            // Export current group
            exportData(); //SyncHandler

            //TODO stop fileBrowser 
            //fileBrowser.stopfilebrowser();

            //Reset Group Name
            OldGroup.group = "";

            //TODO redirect all Clients....
        }

        // Remove the token
        res.clearCookie('group_jwt');

        // redirecting to the group Selection
        res.status(200).json({ groupName });;
    } catch (error) {
        const errors = handleErrors(error);
        res.status(400).json({ errors });
    }
}