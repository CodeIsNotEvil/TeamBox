const mocha = require('mocha');
const assert = require('assert');

const AppDrawData = require("../../../../models/AppDrawData");

describe('Finding records', function () {

    let data;
    let file;

    beforeEach(function (done) {

        file = {
            filename: "testFileName",
            drawObjects: []
        }
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
        })


    });

    it('Finds one record from the database', function (done) {
        AppDrawData.findOne({ group: data.group }).then(function (result) {
            assert(result.group === data.group);
            done();
        }).catch(done);
    });

    it('Finds one record by ID from the database', function (done) {
        AppDrawData.findOne({ _id: data._id }).then(function (result) {
            assert(result._id.toString() === data._id.toString());
            done();
        }).catch(done);
    });

    //This will be used when a Client requests a file, because it will return the requested file in the format seen below
    it('Find one record by filename from the database', function (done) {
        AppDrawData.findOne({ "files.filename": file.filename }, { "files.$": 1 }).then(function (result) {
            //console.log(result) //result only contains the filedata
            /*
            {
                _id: 6076bdb5a9d2a8a3bc24bf81,
                files: [
                    {
                        _id: 6076bdb5a9d2a8a3bc24bf82,
                        filename: 'testFileName',
                        drawObjects: []
                    }
                ]
            }
            */
            //its not relavant that the file id matches because the filename is already a unique value
            assert(result.files[0].filename === file.filename);
            done();
        }).catch(done);
    });
});