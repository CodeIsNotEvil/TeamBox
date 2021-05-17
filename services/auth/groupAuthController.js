const { JWT_SECRET } = require("../../config/untracked");
const jwt = require('jsonwebtoken');
const Group = require("../../models/Group");
const User = require("../../models/User");
const OldGroup = require("../Group");
const { loadGroups } = require("../groupHandler");
const groupHandler = require("../groupHandler");
const fileBrowser = require('../fileBrowser/fileBrowser');
const DrawPad = require('../drawpad/DrawPad');
const { exportData } = require("../syncHandler");
const { registerWekanUsers } = require("../wekan/registrationController");
const { USB_PRE_PATH } = require("../../config/server");

const handleErrors = error => {
    let err = { name: '', password: '' };
    //console.error(error);
    // incorrect name
    if (error.message === 'incorrect name') {
        err.name = 'that group is not registerd';
    }

    // incorrect password
    if (error.message === 'incorrect password') {
        err.password = 'that password is incorrect';
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
    //console.log(error);
    return err
}



const maxAge = 8 * 60 * 60; //secounds wich equals 8h
const createToken = (uid, gid) => {
    return jwt.sign({ uid, gid }, JWT_SECRET, {
        expiresIn: maxAge
    });

}


module.exports.group_select_get = async (req, res) => {
    if (await Group.exists({ isActive: true })) {
        res.redirect('/groupJoin');
    } else {
        loadGroups();
        const groupNameList = await getGroupNameList();

        if (await Group.exists({})) {
            res.render('auth/groupSelect', { groupNameList });
        } else {
            res.redirect('/groupCreate');
        }
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
        fileBrowser.startFileBrowser();
        DrawPad.init();

        let user = res.locals.user;
        //Mark Group as Active, reset the users array
        const group = await Group.findOneAndUpdate({ name: req.body.groupName }, { isActive: true, users: [] });
        res.status(201).json({ user: user._id, group: group._id });
        //TODO redirect all userAuthenticated Clients to groupJoin to ensure no one trys to join another group
    } catch (error) {
        console.error(error);
        const errors = handleErrors(error);
        res.status(400).json({ errors });
    }

}

module.exports.group_join_get = async (req, res) => {
    const groupArray = await Group.find({ isActive: true });

    if (groupArray.length == 0) {
        res.redirect('/groupSelect');
    } else if (groupArray.length == 1) {
        group = groupArray[0];
        res.render('auth/groupJoin', { group });
    } else {
        console.error('There are multiple Groups active allowed is onely one');
    }

}

module.exports.group_join_post = async (req, res) => {
    const { name, password } = req.body;

    try {
        let color = 'rgba('
            + (50 + Math.floor(Math.random() * 156))
            + ',' + (50 + Math.floor(Math.random() * 156))
            + ',' + (50 + Math.floor(Math.random() * 156))
            + ',' + 0.5
            + ')';
        let user = res.locals.user;
        user.color = color;
        let group = await Group.findOneAndUpdate({ name, isActive: true }, { $addToSet: { users: user } });
        if (group) {
            try {
                //TODO check grouppassword before adding the user and his color to the group
                group = await Group.login(name, password);
                updateUserColor(user, color);
                const token = createToken(user._id, group._id);
                const tempToken = req.cookies.temp_jwt;
                await registerWekanUsers(user, tempToken); //this is async but will definetly finished by the time a user entered his creds to wekan!
                res.clearCookie('temp_jwt');
                res.cookie('group_jwt', token, { httpOnly: true, maxAge: maxAge * 1000 });
                res.status(201).json({ user: user._id, group: group._id });
            } catch (error) {
                const errors = handleErrors(error);
                if (errors) {
                    await Group.findOneAndUpdate({ name, isActive: true }, { $pull: { users: user } });
                }
                res.status(400).json({ errors });
            }

        } else {
            const errors = {
                group: 'Active Group is not ' + name
            };
            res.status(400).json({ errors });
        }


    } catch (error) {
        const errors = handleErrors(error);
        res.status(400).json({ errors });
    }

}

const updateUserColor = (user, color) => {
    User.findByIdAndUpdate(user._id, { color: color }, async (error, doc) => {
        if (error) {
            const errors = handleErrors(error);
            res.status(400).json({ errors });
        }
        console.log(`groupAuth.js >>> Assinged ${doc.color} to user ${user.name}`);
    });
}

module.exports.group_create_post = async (req, res) => {
    const { groupName, password } = req.body;
    if (await Group.exists({ isActive: true })) {
        res.redirect(307, '/groupJoin');
    } else if (await Group.exists({ name: groupName })) {
        res.redirect(307, '/groupSelect');
    } else {
        const user = res.locals.user;
        try {
            OldGroup.group = groupName;
            groupHandler.createGroup();
            groupHandler.import();
            fileBrowser.startFileBrowser();
            DrawPad.init();

            const users = [];
            const path = `${USB_PRE_PATH}/${groupName}`;
            const group = await Group.create(
                {
                    'name': groupName,
                    password,
                    users,
                    isActive: true,
                    usbPath: path
                }
            );
            //const token = createToken(user._id, group._id);
            //res.cookie('group_jwt', token, { httpOnly: true, maxAge: maxAge * 1000 });
            res.status(201).json(
                {
                    user: user._id,
                    group: group._id
                }
            );
        } catch (error) {
            const errors = handleErrors(error);
            try {
                res.status(400).json({ errors });
            } catch (error) {
                console.error(error);
            }

        }
    }

}

module.exports.group_logout_get = async (req, res) => {
    res.render('auth/groupLogout');
}

module.exports.group_logout_post = async (req, res) => {
    const group = res.locals.group;
    const user = res.locals.user
    let error = await removeUserFromGroup(group, user);
    if (error) {
        console.error(error)
        res.status(400).json({ error });
    }
    res.clearCookie('group_jwt');
    if (await hasActiveGroupLoggedInUsers()) {
        res.status(200).json({ group })
    } else {
        if (group.name === OldGroup.group) {
            // Export current group
            exportData(); //SyncHandler

            //Reset Group Name
            OldGroup.group = "";

        }
        await Group.findOneAndUpdate({ name: group.name }, { isActive: false })
        //console.debug("groupAuthController >>> group_logout_post set isActive to false");
        res.status(200).json({ group: null });

    }
}

const removeUserFromGroup = async (group, user) => {
    try {
        await Group.findOneAndUpdate({ name: group.name }, { $pull: { users: user } });
    } catch (error) {
        const errors = handleErrors(error);
        return error;
    }

}

const hasActiveGroupLoggedInUsers = async () => {
    try {
        let group = await Group.findOne({ isActive: true });
        return hasUsersArrayElements(group);
    } catch (error) {
        console.error(error);
    }
    return false;
}

const hasUsersArrayElements = group => {
    if (group.users.length > 0) {
        return true;
    } else {
        return false;
    }

}

const getGroupNameList = async () => {
    const groupList = await Group.find({});
    const groupNameList = [];
    for (const Group in groupList) {
        if (Object.hasOwnProperty.call(groupList, Group)) {
            groupNameList.push(groupList[Group].name);
        }
    }
    return groupNameList;
}