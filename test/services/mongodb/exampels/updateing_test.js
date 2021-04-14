const mocha = require('mocha');
const assert = require('assert');

const AppDrawData = require("../../../../models/AppDrawData");

describe('Updateing records', function () {

    let data;

    beforeEach(function (done) {

        data = new AppDrawData({
            group: 'test',
            files: []
        });

        data.save().then(function () {
            done();
        });

    });

    //This could be used to change the groups name 
    it('Updates one record in the database', function (done) {
        AppDrawData.findOneAndUpdate({ group: 'test' }, { group: 'updated' }).then(function () {
            AppDrawData.findOne({ _id: data._id }).then(function (result) {
                assert(result.group === 'updated');
                done();
            }).catch(done);
        });
    });

    //This will be used if a group import its data
    it('Updates one record in the database', function (done) {
        let groupSpecificFiles = [];
        let groupName = "groupName"
        let newData = {
            group: groupName,
            files: groupSpecificFiles
        }
        AppDrawData.findOneAndUpdate({ group: data.group }, newData).then(function () {
            AppDrawData.findOne({ _id: data._id }).then(function (result) {
                assert(result.group === newData.group && result.files.toString() === newData.files.toString());
                done();
            }).catch(done);
        });
    });


});