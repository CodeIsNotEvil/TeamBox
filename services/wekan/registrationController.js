const { JWT_SECRET } = require("../../config/untracked");
const jwt = require('jsonwebtoken');
const { registerNewUser, initApiKey } = require("./apiCalls");




module.exports.registerWekanUsers = async (user, token) => {
    await initApiKey();
    if (token) {
        let password = getUsersCreds(token);
        await registerNewUser(user.name, user.email, password);
    }
}

getUsersCreds = (token) => {
    let decoded = decodeJWT(token);
    let password = decoded.id;
    //console.debug("getUsersCreds password >>> ", password);
    return password
}

decodeJWT = (token) => {
    return jwt.verify(token, JWT_SECRET, (error, decodedToken) => {
        if (error) {
            console.error(error.message);
            return null;
        } else {
            //console.debug("decodeJWT >>> ", decodedToken);
            return decodedToken;
        }
    });
}