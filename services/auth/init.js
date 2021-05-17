const Group = require("../../models/Group");

module.exports.init = () => {
    resetIsActivePropertyOfAllGroups();
}

const resetIsActivePropertyOfAllGroups = async () => {
    try {
        const groups = await Group.find({});
        groups.forEach(async group => {
            await Group.findByIdAndUpdate(group._id, { isActive: false, users: [] });
        });
    } catch (error) {
        console.error(error);
    }
}
