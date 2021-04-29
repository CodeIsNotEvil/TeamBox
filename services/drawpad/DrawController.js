const DrawPad = require('./DrawPad');

module.exports.drawpad_load_get = async (req, res) => {
    const user = res.locals.user
    const group = res.locals.group
    const fileNames = await DrawPad.getAllFileNames(group.name)

    res.render("drawpad/drawPadLoad", {
        username: user.name,
        color: user.color,
        data: fileNames
    });
}

module.exports.drawpad_get = (req, res) => {
    const user = res.locals.user;
    const group = res.locals.group;

    res.render("drawpad/drawPad", {
        username: user.name,
        group: group.name,
        color: user.color,
        data: DrawPad.document
    });
}