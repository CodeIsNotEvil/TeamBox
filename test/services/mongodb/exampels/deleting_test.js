const mocha = require('mocha');
const assert = require('assert');

const AppDrawData = require("../../../../models/AppDrawData");

describe('Deleting records', function () {

    let data;
    let file = {
        filename: "testFileName",
        drawObjects: []
    }
    beforeEach(function (done) {
        data = new AppDrawData({
            group: 'test',
            files: [
                file,
                {
                    filename: "secoundFile",
                    drawObjects: []
                }
            ]
        });

        data.save().then(function () {
            done();
        });

    });

    //This could be used to remove all group related drawPad content from the database
    it('Deletes one record from the database', function (done) {
        AppDrawData.findOneAndRemove({ group: 'test' }).then(function () {
            AppDrawData.findOne({ group: 'test' }).then(function (result) {
                assert(result === null);
                done();
            }).catch(done);
        });
    });

    //This will be used the remove a file from the drawPad database
    it('Deletes a file from the database', function (done) {
        AppDrawData.findOne({ "files.filename": file.filename }, { "files.$": 1 }).then(function (result) {
            data.files.pull(result.files[0]._id);
            data.save().then(function () {
                AppDrawData.findOne({ "files.filename": file.filename }, { "files.$": 1 }).then(function (result) {
                    assert(result === null);
                    done();
                }).catch(done);
            });
        });
    });

});