const {clearDrawingQuery } = require("../mysqlHandler");

class drawApp {
    static allObjWasInitilized = false;
    static allObj = [];

    static initAllObj(fileNames, contents){
        if (!this.allObjWasInitilized) {
            //this.allObj = this.dbStringToObj(fileNames, contents);
            this.allObjWasInitilized = true;
        }
    }

/*    static dbStringToObj(fileNames, contents){
        let allObjects = [];
        for (let fileIndex = 0; fileIndex < fileNames.length; fileIndex++) {

            let drawElem = contents.toString().split("***");
            let nameOfFile;
            let objName;

            for (let i = 0; i < drawElem.length; i++) {
                let elem = drawElem[i]; //something like 1775###187###15###1775###187###black###0###pencil###Nena###Ship
                elem = elem.replace("+++", "");
                let elem2 = elem.split("###"); //something like 1775,187,15,1775,187,black,0,pencil,Nena, Ship
                let lastNum = elem2.length - 1;
                objName = elem2.length - 2;
                let nameOfObj = elem2[objName];		//something like pencil
                nameOfFile = elem2[lastNum];	//something like Ship
                if (fileNames[fileIndex] == nameOfFile) {
                    switch (nameOfObj) {
                        case 'pencil':
                            let newObject = new PencilObj(elem2[0], elem2[1], elem2[2], elem2[3], elem2[4], elem2[5], elem2[6], elem2[7]);
                            break;
                        default:
                            break;
                    }
                }
            }
            allObjects.push(object)
        }
    }*/

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
        //The filename is in correct state after system startup
        //allObj is emty after system startup
        //console.log("allObj:" + this.allObj);
        for (let i = 0; i < this.allObj.length; i++) {
            //console.log("\n\nObjectName\n" +  this.allObj[i].fileName);
            //console.log("Objects_content\n" + this.allObj[i].content);
            if (this.allObj[i].fileName == filename) {
                //console.log("\n\nObjectName\n" +  this.allObj[i].fileName);
                //console.log("Objects_content\n" + this.allObj[i].content);
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
        if (string == "") {
            return null;
        } else {
            return string
        }
        //console.log("The OBJ String\n" + string);
    }

}
module.exports = drawApp;