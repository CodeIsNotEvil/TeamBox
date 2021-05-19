const fs = require("fs");

folderExsists = (path) => {
    try {
        fs.accessSync(path, fs.constants.W_OK);
        return true;
    } catch (error) {
        return false;
    }
}

const requireFolder = (path) => {
    if (folderExsists(path)) {
        return true;
    } else {
        try {
            fs.mkdirSync(path, { recursive: true });
            return true;
        } catch (error) {
            console.error(error);
            return false;
        }

    }
}

const removeLastDirectoryPartOf = (path) => {
    var parent = path.split('/');
    parent.pop();
    return (parent.join('/'));
}

const extractDateFromFileName = (filenameWithDate) => {
    let datePartOfFile = filenameWithDate.match(new RegExp('[0-9\-]*_[0-9\-]*$', 'gm'));
    if (datePartOfFile) {
        let yearMonthDay = datePartOfFile[0].split('_')[0];                                                     // 2021-05-18
        let yMDArray = yearMonthDay.split('-');                                                                 // [2021, 05, 18]
        let hourMinutesSecounds = datePartOfFile[0].split('_')[1];                                              // 12-55-22
        let hMSArray = hourMinutesSecounds.split('-');                                                          // [12, 55, 22]
        let date = new Date(yMDArray[0], yMDArray[1] - 1, yMDArray[2], hMSArray[0], hMSArray[1], hMSArray[2]);  // 2021-05-17T12:55:22.000Z
        return date;
    } else {
        throw new Error('No date found');
    }
}

const appendDateToFileName = (filename) => {
    let date = new Date();
    let dateArray = [date.getMonth() + 1, date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds()];
    let twoDigitDates = dateArray.map(number => minDigitNumber(number));
    let dateString = `${date.getFullYear()}-${twoDigitDates[0]}-${twoDigitDates[1]}_${twoDigitDates[2]}-${twoDigitDates[3]}-${twoDigitDates[4]}`
    filename = `${filename}_${dateString}`
    return filename;
}

const minDigitNumber = (number) => {
    if (number.toString().length == 1) {
        return `0${number}`;
    } else {
        return `${number}`;
    }
}

module.exports = { folderExsists, requireFolder, extractDateFromFileName, appendDateToFileName };