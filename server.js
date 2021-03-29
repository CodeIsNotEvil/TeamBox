const { PATH_TO_GLOBAL_MODULES, PORT } = require('./config/server');
let userModel = require('./models/MySQLUser.js');


const fetch = require(PATH_TO_GLOBAL_MODULES + 'node-fetch');
const express = require(PATH_TO_GLOBAL_MODULES + 'express');
const bodyParser = require(PATH_TO_GLOBAL_MODULES + 'body-parser');
const cookieParser = require(PATH_TO_GLOBAL_MODULES + 'cookie-parser');
const expressSession = require(PATH_TO_GLOBAL_MODULES + 'express-session');
const syncExec = require(PATH_TO_GLOBAL_MODULES + 'sync-exec');

const app = express();
const http = require('http').Server(app);
const io = require(PATH_TO_GLOBAL_MODULES + 'socket.io')(http, {
        allowEIO3: true // false by default
      });
const cheerio = require(PATH_TO_GLOBAL_MODULES + 'cheerio'),
        $ = cheerio.load("<container id='-1'></container>");
const crypto = require('crypto');

const { MongoClient } = require(PATH_TO_GLOBAL_MODULES + "mongodb");


app.set("view engine", "ejs");
app.use("/styles", express.static(__dirname + "/public/styles"));
app.use("/_jquery", express.static(__dirname + '/public/_jquery'));
app.use("/p5", express.static(__dirname + '/p5'));
app.use("/screenshots", express.static(__dirname + '/public/screenshots'));
app.use("/drawings", express.static(__dirname + '/public/drawings'));
app.use("/scripts", express.static(__dirname + '/public/scripts'));
app.use("/_jquery", express.static(__dirname + '/public/_jquery'));
app.use("/_socket.io", express.static(__dirname + 'public/_socket.io'));
app.use(bodyParser.urlencoded(
        {
                extended: true
        }));
app.use(cookieParser());
app.use(expressSession({
        cookie: { maxAge: 36000000, httpOnly: false },
        secret: 'x71dTgv_fd1GgZ_+',
        resave: true,
        saveUninitialized: true
}));

http.listen(PORT, function () {
        console.log(
                "\n===================" + 
                "\nServer started ...." +
                "\nPort: " + PORT +
                "\n==================="
        );
});

require('./routes/routes')(app);
require('./routes/appRoutes')(app);
require('./services/socketHandler')(app, io);
