const mocha = require('mocha');
const assert = require('assert');
const { extractDateFromFileName, appendDateToFileName } = require('../../utils/fsUtils');

describe('fsUtils', function () {

    it('extractDateFromFileName should return a date with the date matching the files one', () => {
        let filename = `TestDatabaseName_2021-05-18_12-09-16`;
        let expectedDate = new Date('2021-05-18T12:09:16');

        let date = extractDateFromFileName(filename);

        assert(expectedDate.toTimeString() === date.toTimeString());
    });

    it('appendDateToFileName should return a filename with a date appended', () => {
        let filename = `TestDatabaseName`;
        let expectedDate = new Date();

        let filenameWithDate = appendDateToFileName(filename);

        let matcher = new RegExp('\w*_[0-9\-]*_[0-9\-]*$', 'gm'); // matches alike: TestDatabaseName_2021-05-18_14-07-38
        assert(filenameWithDate.match(matcher));
    });

    it('appendDateToFileName should return a filename with the current date appended', () => {
        let filename = `TestDatabaseName`;
        let expectedDate = new Date();

        let filenameWithDate = appendDateToFileName(filename);
        let date = extractDateFromFileName(filenameWithDate);

        assert(expectedDate.toTimeString() === date.toTimeString());
    });

});