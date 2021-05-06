const { PATH_TO_GLOBAL_MODULES, PORT } = require('./config/server');
const mysqlHandler = require('./services/mysqlHandler');
const syncHandler = require('./services/syncHandler');

const express = require('express');
const bodyParser = require(PATH_TO_GLOBAL_MODULES + 'body-parser');
const cookieParser = require('cookie-parser');
const expressSession = require(PATH_TO_GLOBAL_MODULES + 'express-session');
const mongoose = require('mongoose');

//Own modules
const userAuthRoutes = require('./routes/userAuthRoutes');
const groupAuthRoutes = require('./routes/groupAuthRoutes');
const routes = require('./routes/routes');
const appRoutes = require('./routes/appRoutes');
const authInit = require('./services/auth/init');

const app = express();
const http = require('http').Server(app);

const socketHandler = require('./services/socketHandler'); //old socket Handler


app.set("view engine", "ejs");
app.set('views', __dirname + '/public/views');
app.use("/styles", express.static(__dirname + "/public/styles"));
app.use("/_jquery", express.static(__dirname + '/public/_jquery'));
app.use("/p5", express.static(__dirname + '/p5'));
app.use("/screenshots", express.static(__dirname + '/public/screenshots'));
app.use("/drawings", express.static(__dirname + '/public/drawings'));
app.use("/scripts", express.static(__dirname + '/public/scripts'));
app.use("/_jquery", express.static(__dirname + '/public/_jquery'));
app.use("/_socket.io", express.static(__dirname + 'public/_socket.io'));
/*
app.use(bodyParser.urlencoded(
        {
                extended: true
        }));
*/
app.use(cookieParser());
/*
app.use(expressSession({
        cookie: { maxAge: 36000000, httpOnly: false },
        secret: 'x71dTgv_fd1GgZ_+',
        resave: true,
        saveUninitialized: true
}));
*/
app.use(express.json());

//Routes
app.use(routes);
app.use(userAuthRoutes);
app.use(groupAuthRoutes);
app.use(appRoutes);


//TeamBox Database connection
const dbURI = 'mongodb://localhost/TeamBox';
mongoose.connect(dbURI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false
}).then(result => {
        authInit.init();
        http.listen(PORT, function () {
                console.log(
                        "\n===================" +
                        "\nServer started ...." +
                        "\nPort: " + PORT +
                        "\n==================="
                );
                socketHandler.socketRoutes(http);
                mysqlHandler.startUp();
                syncHandler.exportAsync();
        });
}).catch(error => {
        console.log(error);
});

//require('./services/socketHandler')(io);
//require('./services/authentification/ldapLoginHandler')(app);