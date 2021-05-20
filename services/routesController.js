const User = require("../models/User");
const { handleErrors } = require("../services/auth/userAuthController");
const { shutdownPi, rebootPi, clearAllData } = require("./piHeandler");
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
        let message = await exportDataAndShutdownPi();
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
        let message = await exportDataAndRebootPi();
        res.status(200).json({ message });
    }
}

module.exports.settings_clearalldata_post = async (req, res) => {
    const { password } = req.body;
    let error = await checkAdminPassword(password);
    if (error) {
        const errors = handleErrors(error);
        res.status(400).json({ errors });
    } else {
        clearAllData();
        let message = "Cleared all data";
        res.status(200).json({ message });
    }
}
//after clearalldata everyone connected gets thier cookies removed
module.exports.clearallcookies_post = async (req, res) => {
    if (req.cookies.user_jwt) {
        res.clearCookie('user_jwt');
    }
    if (req.cookies.group_jwt) {
        res.clearCookie('group_jwt');
    }
    if (req.cookies.temp_jwt) {
        res.clearCookie('temp_jwt');
    }
    res.status(200).json({ message: "Cleared all cookies" });
}

const exportDataAndShutdownPi = async () => {
    if (await exportData()) {
        shutdownPi();
        return "Pi will be fully shutdown in about 2 minutes";
    } else {
        return "Error while Exporting Pi will not be shutdown";
    }
}

const exportDataAndRebootPi = async () => {
    if (await exportData()) {
        rebootPi();
        return "Pi will be rebooted in about 2-3 minutes";
    } else {
        return "Error while Exporting, the Pi will not reboot";
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