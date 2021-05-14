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

    try {
        User.findOne({}, (error, admin) => { //get the first registered user who is by design the admin
            if (error) {
                const errors = handleErrors(error);
                res.status(400).json({ errors });
            } else {
                User.login(admin.name, password).then(() => {
                    let message = exportDataAndShutdownPi();
                    res.status(200).json({ message });

                }).catch((error) => {
                    if (error) {
                        const errors = handleErrors(error);
                        res.status(400).json({ errors });
                    }
                });
            }
        });
    } catch (error) {
        const errors = handleErrors(error);
        res.status(400).json({ errors });
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


module.exports.settings_clearalldata_post = () => {
    console.log("settings_clearalldata_post");
}

