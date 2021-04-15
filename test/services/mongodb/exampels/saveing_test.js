const mocha = require('mocha');
const assert = require('assert');

const AppDrawData = require("../../../../models/AppDrawData");
const { PencilArray, PencilObj, LineObj, RectObj, CircleObj, TextObj, ImgObj } = require('../test-models/NewDrawObjects');

describe('Saveing records', function () {

    it('Testing-enviorment setup test', function () {
        assert(true);
    });
    
    //This will be used for group creation
    it('Saves a record with no files to the database', function (done) {
        //Arrange
        let data = new AppDrawData({
            group: 'testGroup',
            files: []
        });

        //act
        data.save().then(function () {
            //assert
            assert(data.isNew === false);
            done();
        });
    });

    it('Saves a record with one Pencil object to the database', function (done) {
        //Arrange

        let drawObjectsArray = new Array(new PencilObj(50, 50, 15, 50, 50, "black", 0));

        let data = new AppDrawData({
            group: 'testGroup',
            files: {
                filename: "testFileName",
                drawObjects: drawObjectsArray
            }
        });

        //act
        data.save().then(function () {
            //assert
            AppDrawData.findOne({ group: data.group}).then(function (result) {
                assert(result.files.length === 1);
                done();
            }).catch(done);
        })
    });

    //This will be used to add a new file to a groups document
    it('Add a new file to a group', function (done) {
        //Arrange

        let drawObjectsArray = new Array(new PencilObj(50, 50, 15, 50, 50, "black", 0));
        let data = new AppDrawData({
            group: 'testGroup',
            files: {
                filename: "testFileName",
                drawObjects: drawObjectsArray
            }
        });

        data.save().then(function () {
            AppDrawData.findOne({ group: data.group}).then(function (result) {
                //Arrange
                let newFile = {
                    filename: "newFile",
                    drawObjects: new Array(new RectObj(50, 50, 15, 20, 20, "red", false, 0))
                }

                //Act
                let length = result.files.length;
                result.files.push(newFile);

                //assert
                result.save().then(function () {
                    AppDrawData.findOne({ group: data.group}).then(function (result) {
                        assert(length < result.files.length);
                        done();
                    }).catch(done);
                });     
            });
        });
    });
});