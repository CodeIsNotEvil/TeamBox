/**
 * Function to create PencilArray-Objects 
 * @param {PencilObj} obj 
 * @param {String} fileName 
 */
 function PencilArray(obj, fileName) {
    this.objArray = obj;
    this.name = 'pencilarray';
    this.fileName = fileName;
}

/**
 * Function to create PencilObj-Objects 
 * @param {int} x x-axis endpoint 
 * @param {int} y y-axis endpoint 
 * @param {int} v stroke thickness
 * @param {int} xp x-axis startpoint
 * @param {int} yp y-axis startpoint
 * @param {String} col color of the Object
 * @param {int} l layer on wich it will be drawen 0 is the background and 1 the foreground
 * @param {String} fileName 
 */
function PencilObj(x, y, v, xp, yp, col, l, fileName) {
    this.x = x;
    this.y = y;
    this.v = v;
    this.xp = xp;
    this.yp = yp;
    this.col = col;
    this.l = l; //layer, layer 0 background
    this.name = 'pencil';
    this.fileName = fileName;
}

/**
 * Function to create LineObj-Objects 
 * @param {int} x x-axis endpoint 
 * @param {int} y y-axis endpoint 
 * @param {int} v stroke thickness
 * @param {int} xp x-axis startpoint
 * @param {int} yp y-axis startpoint
 * @param {String} col color of the Object
 * @param {int} l layer on wich it will be drawen 0 is the background and 1 the foreground
 * @param {String} fileName 
 */
function LineObj(x, y, v, xp, yp, col, l, fileName) {
    this.x = x;
    this.y = y;
    this.v = v;
    this.xp = xp;
    this.yp = yp;
    this.col = col;
    this.l = l; //layer, layer 0 background
    this.name = 'line';
    this.fileName = fileName;
}

/**
 * Function to create RectObj-Objects 
 * @param {int} x x-axis endpoint 
 * @param {int} y y-axis endpoint 
 * @param {int} v stroke thickness
 * @param {int} width width of the Rectangle
 * @param {int} height hight of the Rectangle
 * @param {String} col color of the Rectangle
 * @param {Boolean} filled wether the Rectangle is filled or not
 * @param {int} l layer on wich it will be drawen 0 is the background and 1 the foreground
 * @param {String} fileName 
 */
function RectObj(x, y, v, width, height, col, filled, l, fileName) {
    this.x = x;
    this.y = y;
    this.v = v;
    this.width = width;
    this.height = height;
    this.col = col;
    this.filled = filled;
    this.l = l; //layer, layer 1  foreground
    this.name = 'rect';
    this.fileName = fileName;
}

/**
 * Function to create CircleObj-Objects
 * @param {int} x x-axis endpoint 
 * @param {int} y y-axis endpoint 
 * @param {int} v stroke thickness
 * @param {int} width width of the Circle
 * @param {int} height hight of the Circle
 * @param {String} col color of the Circle
 * @param {Boolean} filled wether the Circle is filled or not
 * @param {int} l layer on wich it will be drawen 0 is the background and 1 the foreground
 * @param {String} fileName 
 */
function CircleObj(x, y, v, width, height, col, filled, l, fileName) {
    this.x = x;
    this.y = y;
    this.v = v;
    this.width = width;
    this.height = height;
    this.filled = filled;
    this.col = col;
    this.l = l; //layer, layer 1 foreground
    this.name = 'circle';
    this.fileName = fileName;
}

/**
 * Function to create TextObj-Objects 
 * @param {int} x x-axis endpoint
 * @param {int} y y-axis endpoint
 * @param {String} str content of the Text
 * @param {int} size Size of the Text
 * @param {String} family font-famaly of the Text
 * @param {String} col color of the Text
 * @param {int} l layer on wich it will be drawen 0 is the background and 1 the foreground
 * @param {String} fileName 
 */
function TextObj(x, y, str, size, family, col, l, fileName) {
    this.x = x;
    this.y = y;
    this.str = str;
    this.size = size;
    this.family = family;
    this.col = col;
    this.l = l;
    this.name = 'text';
    this.fileName = fileName;
}

/**
 * Function to create ImgObj-Objects 
 * @param {URL} src path to the Image
 * @param {int} x x-axis image starting position
 * @param {int} y y-axis image starting position
 * @param {int} l layer on wich it will be drawen 0 is the background and 1 the foreground
 * @param {String} fileName 
 */
function ImgObj(src, x, y, l, fileName) {
    this.src = src;
    this.x = x;
    this.y = y;
    this.l = l;
    this.name = 'img';
    this.fileName = fileName;
}