const User = require("../models/User");
const { handleErrors } = require("../services/auth/userAuthController");
const { shutdownPi, rebootPi } = require("./piHeandler");
const { exportData } = require("./syncHandler");
module.exports.hub_get = (req, res) => {
    res.render("newHub");
}

module.exports.help_get = (req, res) => {
    res.render("help");
}

module.exports.settings_get = (req, res) => {
    res.render("settings");
}

module.exports.settings_shutdownpi_post = async (req, res) => {
    const { password } = req.body;
    let error = await checkAdminPassword(password);
    if (error) {
        const errors = handleErrors(error);
        res.status(400).json({ errors });
    } else {
        let message = exportDataAndShutdownPi();
        res.status(200).json({ message });
    }
}

module.exports.settings_rebootpi_post = async (req, res) => {
    const { password } = req.body;
    let error = await checkAdminPassword(password);
    if (error) {
        const errors = handleErrors(error);
        res.status(400).json({ errors });
    } else {
        let message = exportDataAndRebootPi();
        res.status(200).json({ message });
    }
}

const exportDataAndShutdownPi = () => {
    if (exportData()) {
        shutdownPi();
        return "Pi will shutdown in a minute";
    } else {
        return "Error while Exporting Pi will not be shutdown";
    }
}

const exportDataAndRebootPi = () => {
    if (exportData()) {
        rebootPi();
        return "Pi will reboot in a minute";
    } else {
        return "Error while Exporting Pi will not be shutdown";
    }
}

const checkAdminPassword = async (password) => {
    try {
        let admin = await getAdminUser();
        if (admin.name) {
            await User.login(admin.name, password);
        } else {
            let error = admin;
            return error;
        }
    } catch (error) {
        return error
    }
}
const getAdminUser = async () => {
    try {
        let admin = await User.findOne({}).exec();
        return admin;
    } catch (error) {
        return error;
    }
}



module.exports.settings_clearalldata_post = () => {
    console.log("settings_clearalldata_post");
}

