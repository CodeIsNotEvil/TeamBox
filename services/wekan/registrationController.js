const { registerNewUser, initApiKey } = require("./apiCalls");



// looks like [{username: user ,password: password},{username,password}]
let UsersCreds = [{ username: "user", password: "password" }]; //Populate with UserCreds of SingedUp and loggedIn users
module.exports.UsersCreds = UsersCreds;
module.exports.registerWekanUsers = async (user) => {
    await initApiKey();
    UsersCreds.forEach(async element => {
        if (element.username == user.name) {
            await registerNewUser(element.username, user.email, element.password);
        }
    });

}