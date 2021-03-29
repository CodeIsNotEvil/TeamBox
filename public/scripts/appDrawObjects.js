/*
* Function to create PencilArray-Objects 
*/
function PencilArray(obj, fileName) {
	this.objArray = obj;
	this.name = 'pencilarray';
	this.fileName = fileName;
}

/*
* Function to create PencilObj-Objects 
*/
function PencilObj(x, y, v, xp, yp, col, l, fileName) {
	this.x = x; //mouseposx
	this.y = y; //mousepos y
	this.v = v; //thickness
	this.xp = xp; //prevmouseposx
	this.yp = yp; //prevmouseposy
	this.col = col; //color
	this.l = l; //layer, layer 0 background
	this.name = 'pencil';
	this.fileName = fileName;
}

/*
* Function to create LineObj-Objects 
*/
function LineObj(x, y, v, xp, yp, col, l, fileName) {
	this.x = x;
	this.y = y;
	this.v = v;
	this.xp = xp;
	this.yp = yp;
	this.col = col;
	this.l = l;
	this.name = 'line';
	this.fileName = fileName;
}

/*
* Function to create RectObj-Objects 
*/
function RectObj(x, y, v, width, height, col, filled, l, fileName) {
	this.x = x; //startposx
	this.y = y; //startposy
	this.v = v; //thickness
	this.width = width; //Breite
	this.height = height; //höhe
	this.col = col; //color
	this.filled = filled;
	this.l = l; //layer, layer 1  foreground
	this.name = 'rect';
	this.fileName = fileName;
}

/*
* Function to create CircleObj-Objects 
*/
function CircleObj(x, y, v, width, height, col, filled, l, fileName) {
	this.x = x; //startposx
	this.y = y; //startposy
	this.v = v; //thickness
	this.width = width; //Breite
	this.height = height; //höhe
	this.filled = filled;
	this.col = col; //color
	this.l = l; //layer, layer 1 foreground
	this.name = 'circle';
	this.fileName = fileName;
}

/*
* Function to create TextObj-Objects 
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

/*
* Function to create ImgObj-Objects 
*/
function ImgObj(src, x, y, l, fileName) {
	this.src = src;
	this.x = x;
	this.y = y;
	this.l = l;
	this.name = 'img';
	this.fileName = fileName;
}




























