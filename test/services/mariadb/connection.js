let mysql = require('mysql');
let mysqlConnection;

let mysqlConnectionData = {
    host: 'localhost',
    user: 'TeamBox',
    database: 'TeamBox',
    password: 'yourPassword'
}

before(function (done) {
    mysqlConnection = mysql.createConnection(mysqlConnectionData);
    done();
});

//The beforeEach methode will run before every test
beforeEach(function (done) {
    done();
});

after(function (done) {
    mysqlConnection.end(function (err) {
        if (err) {
            return console.log('error:' + err.message);
        }
        console.log('Close the database connection.');
        done();
    });
})