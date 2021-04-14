const mongoose = require('mongoose');

//Connect to db before tests run
//The before methode will run once before all tests
before(function (done) {

    //Connect to mongodb if it does not exsist it will be created
    mongoose.connect('mongodb://localhost/TestDrawPad', {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false
    });
    mongoose.connection.once('open', function () {
        console.log("Connected to MongoDB");
        done();
    }).on('error', function (error) {
        console.error("MongoDB error\n" + error);
    });

});

//The beforeEach methode will run before every test
beforeEach(function (done) {
    mongoose.connection.collections.appdrawdatas.drop(function () {
        done();
    });
});

after(function (done) {
    mongoose.disconnect();
    console.log("Closed connection to MongoDB");
    done();
})

