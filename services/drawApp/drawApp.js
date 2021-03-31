const { saveDataDrawStringToDB, clearDrawingQuery } = require("../mysqlHandler");

class drawApp {

    static allObj = [];

    static addObject(object) {
        this.allObj.push(object);
    }

    static clearDrawing(fileName) {
        this.allObj.length = 0;
        clearDrawingQuery(fileName);
    }
    /** 
        * Function to create a string with objdata and save it to the DB.
        * @param {String} filename name of the file.
        */
    static createString(filename) {
        let string = "";
        //console.log("filename: " + filename);
        //console.log("allObj:");
        for (let i = 0; i < this.allObj.length; i++) {
            //console.log(this.allObj[i].fileName);
            if (this.allObj[i].fileName == filename) {
                switch (this.allObj[i].name) {
                    case 'pencil':
                        string = string + this.allObj[i].x + "###" + this.allObj[i].y + "###" + this.allObj[i].v + "###" + this.allObj[i].xp + "###" + this.allObj[i].yp + "###" + this.allObj[i].col + "###" + this.allObj[i].l + "###" + this.allObj[i].name + "###" + this.allObj[i].fileName + "***";
                        break;
                    case 'pencilarray':
                        let allObjects = this.allObj[i].objArray[0].x + "###" + this.allObj[i].objArray[0].y + "###" + this.allObj[i].objArray[0].v + "###" + this.allObj[i].objArray[0].xp + "###" + this.allObj[i].objArray[0].yp + "###" + this.allObj[i].objArray[0].col + "###" + this.allObj[i].objArray[0].l + "###" + this.allObj[i].objArray[0].name + "###" + this.allObj[i].objArray[0].fileName + "***";
                        for (let j = 1; j < this.allObj[i].objArray.length; j++) {
                            allObjects += "+++" + this.allObj[i].objArray[j].x + "###" + this.allObj[i].objArray[j].y + "###" + this.allObj[i].objArray[j].v + "###" + this.allObj[i].objArray[j].xp + "###" + this.allObj[i].objArray[j].yp + "###" + this.allObj[i].objArray[j].col + "###" + this.allObj[i].objArray[j].l + "###" + this.allObj[i].objArray[j].name + "###" + this.allObj[i].objArray[j].fileName + "***";
                        }
                        string = string + allObjects + "+++" + this.allObj[i].name + "###" + this.allObj[i].fileName + "***";
                        break;
                    case 'line':
                        string = string + this.allObj[i].x + "###" + this.allObj[i].y + "###" + this.allObj[i].v + "###" + this.allObj[i].xp + "###" + this.allObj[i].yp + "###" + this.allObj[i].col + "###" + this.allObj[i].l + "###" + this.allObj[i].name + "###" + this.allObj[i].fileName + "***";
                        break;
                    case 'rect':
                        string = string + this.allObj[i].x + "###" + this.allObj[i].y + "###" + this.allObj[i].v + "###" + this.allObj[i].width + "###" + this.allObj[i].height + "###" + this.allObj[i].col + "###" + this.allObj[i].filled + "###" + this.allObj[i].l + "###" + this.allObj[i].name + "###" + this.allObj[i].fileName + "***";
                        break;
                    case 'circle':
                        string = string + this.allObj[i].x + "###" + this.allObj[i].y + "###" + this.allObj[i].v + "###" + this.allObj[i].width + "###" + this.allObj[i].height + "###" + this.allObj[i].col + "###" + this.allObj[i].filled + "###" + this.allObj[i].l + "###" + this.allObj[i].name + "###" + this.allObj[i].fileName + "***";
                        break;
                    case 'text':
                        string = string + this.allObj[i].x + "###" + this.allObj[i].y + "###" + this.allObj[i].str + "###" + this.allObj[i].size + "###" + this.allObj[i].family + "###" + this.allObj[i].col + "###" + this.allObj[i].l + "###" + this.allObj[i].name + "###" + this.allObj[i].fileName + "***";
                        break;
                    case 'img':
                        string = string + this.allObj[i].src + "###" + this.allObj[i].x + "###" + this.allObj[i].y + "###" + this.allObj[i].l + "###" + this.allObj[i].name + "###" + this.allObj[i].fileName + "***";
                        break;
                }
            }
        }
        saveDataDrawStringToDB(string, filename);
        //console.log("The OBJ String\n" + string);
    }

}
module.exports = drawApp;