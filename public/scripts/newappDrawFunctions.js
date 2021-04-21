//create socket
var socket = io();
var usersConnected = new Array();
//create slider
var slider;
//create canvas elements
var canvas;
var canvasBackground;
// globVariables	
var state = 'pencil';
var activeObj;
var startPosX;
var startPosY;
var myText;
var myCol = 'black'; //standardcolor
var fontSize;
var fontFamily;
var elem;			//document.getElement ... fontSize
var elem2;			//document.getElement ... fontFamily
var stroke = false; //pencil or pencilarray
var filled = false;
//color array, create colorbar
var colors = ['black', 'grey', 'lightgray', 'brown', 'orange', 'yellow', 'lightyellow', 'red', 'crimson', 'darkred', 'firebrick', 'purple', 'pink', 'hotpink', 'darkblue', 'blue', 'lightblue', 'cyan', 'darkcyan', 'green', 'lightgreen', 'white'];

var pencilObj = [];
var fileName = "/draw/";

let currentFile = null;
//console.log(data); //Transmitted group document

/**
 * Returns the file content with the same name of urlFileName(fileName) from the document.
 * @param {JSON} document the document with the filedata
 * @returns The currnt file
 */
function getCurrentFile(document) {
	if (currentFile == null) {
		for (let file = 0; file < document.files.length; file++) {
			if (document.files[file].filename === fileName) {
				currentFile = document.files[file]
				return currentFile;
			}

		}
	}
}
/**
 * Draws the element to the canvas
 * @param {JSON} element a single drawObject like a penicl or a circle
 */
function drawObject(element) {
	switch (element.type) {
		case "pencil":
			canvasBackground.strokeWeight(element.v);
			canvasBackground.stroke(element.col);
			canvasBackground.line(element.x, element.y, element.xp, element.yp);
			break;
		case 'pencilarray':
			try {
				for (var i = 0; i < element.objArray.length; i++) {
					drawObject(element.objArray[i]);
				}
			} catch (error) {
				console.log(error);
			}
			break;
		case 'circle':
			if (element.l == 0) { //main canvas
				canvasBackground.strokeWeight(element.v);
				canvasBackground.stroke(element.col);
				if (element.filled === true) {
					canvasBackground.fill(element.col);
				}
				else {
					canvasBackground.noFill();
				}
				canvasBackground.ellipse(element.x, element.y, element.width, element.height);
				canvas.clear();
			} else { //preview canvas
				canvas.clear();
				canvas.strokeWeight(element.v);
				canvas.stroke(element.col);
				ellipse(element.x, element.y, element.width, element.height);
				
			}

			break;
		case 'rect':
			if (element.l == 0) { //main canvas
				canvasBackground.strokeWeight(element.v);
				canvasBackground.stroke(element.col);
				if (element.filled === true) {
					canvasBackground.fill(element.col);
				}
				else {
					canvasBackground.noFill();
				}
				canvasBackground.rect(element.x, element.y, element.width, element.height);
				canvas.clear();
			} else { //preview canvas
				canvas.clear();
				canvas.strokeWeight(element.v);
				canvas.stroke(element.col);
				rect(element.x, element.y, element.width, element.height);	
			}
			break;

		case 'line':
			if (element.l == 0) { //main canvas
				canvasBackground.strokeWeight(element.v);
				canvasBackground.stroke(element.col);
				canvasBackground.noFill();
				canvasBackground.line(element.x, element.y, element.xp, element.yp);
				canvas.clear();
			} else { // preview canvas
				canvas.clear();
				canvas.strokeWeight(element.v);
				canvas.stroke(element.col);
				line(element.x, element.y, element.xp, element.yp);
			}
			break;
		case 'text':
			canvasBackground.textSize(element.size);
			canvasBackground.textFont(element.family);
			canvasBackground.noStroke();
			canvasBackground.fill(element.col);
			canvasBackground.text(element.str, element.x, element.y);
			break;
		case 'img':
			let image = new Image();
			image.src = element.src;
			image.onload = function () {
				drawingContext.drawImage(image, 0, 0);
			}
			break;
		default:
			try {
				throw new Error("Shape " + element.type + " not Found the shape will be skipped");
			} catch (error) {
				console.log(error);
			}
			break;
	}
}

/**
 * Load the Objects from the document to the currentFile and calls to Draw them.
 * @param {JSON} document 
 */
function drawObjects(document) {
	//Select the currentFile
	currentFile = getCurrentFile(document);
	if(typeof currentFile === "undefined") {
		let emptyFile = {
			filename: fileName,
			drawObjects: []
		}
		currentFile = emptyFile;
	}
	currentFile.drawObjects.forEach(element => {
		drawObject(element);
	});
}

function createCanvases() {
	/*
	* create forground-canvas with id "foregroundCanvas" 
	*/
	canvas = createCanvas(window.innerWidth, window.innerHeight - 50);
	canvas.position(0, 50);
	canvas.id("foregroundCanvas");
	canvas.background('rgba(0,255,0, 0)');

	/*
	* create background-canvas with id "visible" 
	*/
	canvasBackground = createGraphics(window.innerWidth, window.innerHeight - 50);
	canvasBackground.background('#FFFFFF');
	canvasBackground.id('visible');
	$('#visible').attr('style', 'display: inline;');
	var backgroundContext = document.getElementById("visible").getContext("2d");
}

/*
* updateUserList, updates the user list and convert loaded string data from db to create obj
*/
function updateUserList() {
	socket.emit("appUpdateUsers", username, fileName);
}

/**
 * It run once, when the program starts.
 * It will create the canvas.
 *  
 * Socket listeners are declared inside.
 */
function setup() {
	createCanvases();

	//handle messages
	/*
	*	receive Objects from Server
	*/
	socket.on('receiveObj', function (obj, username, filename) {
		drawObject(obj);
		currentFile.drawObjects.push(obj);
		//displays username on mousex and mousey from obj and fadeOut after 3000
		if (filename == fileName) {
			$("#foreground").html(username);
			$("#foreground").css({ 'top': obj.y, 'left': obj.x, 'background-color': 'moccasin', 'padding': '5px' }).fadeIn('fast');
			$("#foreground").delay(3000).fadeOut();
		}
	}
	);

	/*
	*	receive clear command from server
	*/
	socket.on('clear',
		function (fileName) {
			clearCanvas();
			$("#foreground").html("");
			$("#foreground").css({ 'display': 'none' });
		}
	);

	updateUserList();
	drawObjects(data); // replaces parseAndDrawString();

	/*
	* appendUser to #containerInfoRight
	*/
	socket.on('appUpdateUsers', function (users, username, fileName) {
		usersConnected = users;
		$("#containerInfoRight").html("Online sind: ");

		for (var i = 0; i < usersConnected.length; i++) {
			if (usersConnected[i].mindMapValue002 == fileName) {
				$("#containerInfoRight").append("<font style='color:" + usersConnected[i].usercolor + ";'>" + usersConnected[i].username + "</font> ");
			}
		}
		if (usersConnected.length <= 1) {
			saveFile(fileName);
		}
	});
}

/*
* trigger when mouse pressed
*/
function mousePressed() {
	startPosX = mouseX;
	startPosY = mouseY;
}

/*
* trigger when mouse released
*/
function mouseReleased() {
	switch (state) {
		case 'pencil':
			if (stroke == true) {
				activeObj = new PencilArray(pencilObj, fileName);
				currentFile.drawObjects.push(activeObj);
				socket.emit('sendObj', activeObj, username, fileName);
			}
			else {
				var newObject = new PencilObj(mouseX, mouseY, document.getElementById("slid").value, mouseX, mouseY, myCol, 0, fileName);
				drawObject(newObject);
				currentFile.drawObjects.push(newObject);
				socket.emit('sendObj', newObject, username, fileName);
			}
			stroke = false;
			break;
		case 'rect':
			activeObj.l = 0;
			drawObject(activeObj);
			currentFile.drawObjects.push(activeObj);
			socket.emit('sendObj', activeObj, username, fileName);
			break;
		case 'circle':
			activeObj.l = 0;
			drawObject(activeObj);
			currentFile.drawObjects.push(activeObj);
			socket.emit('sendObj', activeObj, username, fileName);
			break;
		case 'line':
			activeObj.l = 0;
			drawObject(activeObj);
			currentFile.drawObjects.push(activeObj);
			socket.emit('sendObj', activeObj, username, fileName);
			break;
	}
}

/*
* trigger when mouse dragged
*/
function mouseDragged() {
	switch (state) {
		case 'pencil':
			var newObject = new PencilObj(mouseX, mouseY, document.getElementById("slid").value, pmouseX, pmouseY, myCol, 0, fileName); //0 ist hinten
			drawObject(newObject);
			pencilObj.push(newObject);
			stroke = true;
			break;
		case 'rect':
			activeObj = new RectObj(startPosX, startPosY, document.getElementById("slid").value, mouseX - startPosX, mouseY - startPosY, myCol, filled, 1, fileName);
			drawObject(activeObj);
			break;
		case 'circle':
			activeObj = new CircleObj(startPosX, startPosY, document.getElementById("slid").value, mouseX - startPosX, mouseY - startPosY, myCol, filled, 1, fileName);
			drawObject(activeObj);
			break;
		case 'line':
			activeObj = new LineObj(startPosX, startPosY, document.getElementById("slid").value, mouseX, mouseY, myCol, 1, fileName);
			drawObject(activeObj);
			break;
	}
}
/*
* trigger when mouse clicked
*/
function mouseClicked() {
	switch (state) {
		case 'text':
			elem = document.getElementById("fontSize");
			elem2 = document.getElementById("fontFamily");
			fontSize = elem.options[elem.selectedIndex].value;
			fontFamily = elem2.options[elem2.selectedIndex].value;
			activeObj = new TextObj(mouseX, mouseY, myText, fontSize, fontFamily, myCol, 0, fileName);
			drawObject(activeObj);
			currentFile.drawObjects.push(activeObj);
			socket.emit('sendObj', activeObj, username, fileName);
			break;
	}
}

/*
* function to delete the drawing start
*/
function clearCanvas() {
	canvasBackground.clear();
	currentFile.drawObjects.length = 0;
	pencilObj.length = 0;
	$("#foreground").html("");
	$("#foreground").css({ 'display': 'none' });
}

/*
*Function to save canvas as png with name 'drawing_name_timestamp' start
*/
function saveWindow(fileName) {
	var date = new Date();
	var img = saveCanvas(canvasBackground, 'drawing_' + fileName + '_' + date.getTime(), 'png');
}

/*
* Function to save canvas as png (usb stick) Start
*/
function saveFile(fileName) {
	var draw_canvas = document.getElementById('visible');
	var image = draw_canvas.toDataURL("image/png");
	socket.emit("appDrawingSave", image, fileName, function (message) {
		if (message.error) {
			console.log(message.error);
			$("#sidebarItemSaveNotice").css({ 'left': '40%', 'top': '40%', 'padding': '20px' });
			$("#sidebarItemSaveNotice").html(message.error);
			$("#sidebarItemSaveNotice").show().delay(2000).fadeOut();
		} else if (message.fileName) {
			console.log("saved " + message.fileName + " successfully");
			$("#sidebarItemSaveNotice").css({ 'left': '40%', 'top': '40%', 'padding': '20px' });
			$("#sidebarItemSaveNotice").html("saved " + message.fileName + " successfully");
			$("#sidebarItemSaveNotice").show().delay(2000).fadeOut();
		} else {
			console.log(message);
			$("#sidebarItemSaveNotice").css({ 'left': '40%', 'top': '40%', 'padding': '20px' });
			$("#sidebarItemSaveNotice").html("Someting went wrong appDrawFunction.js");
			$("#sidebarItemSaveNotice").show().delay(2000).fadeOut();
		}
	});
}

/* 
* Function to load Image Start
*/
function handleFile(files) {
	if (!files.length) {
		//console.log("No image");
	}
	else {
		var src = window.URL.createObjectURL(files[0]);
		loadImage(src, function (img) {
			canvasBackground.image(img, 0, 0);
			let draw1_canvas = document.getElementById('visible');
			let dataurl = draw1_canvas.toDataURL("image/png");
			activeObj = new ImgObj(dataurl, mouseX, mouseY, 0, fileName);
			socket.emit('sendObj', activeObj, username, fileName);
		});
	}
}

/* 
* fileName start 
*/
var fileName = null;

function getUrlVariable(variable) {
	var query = window.location.search.substring(1);
	var vars = query.split("&");

	for (var i = 0; i < vars.length; i++) {
		var pair = vars[i].split("=");

		if (pair[0] == variable) {
			return pair[1];
		}
	}
	return (false);
}

/**
 * Calls all nesesarry initialisation methodes,
 * and will be called after the client has loaded the whole HTML document.
 */
 function init() {
	//Sets the FileName to the one passed by the query parameter
	initFileNameFromURL();

	//Createing the color set in the Toolbar, so the user can select a color
	createColorset();

	//Selects the Pencil after startup, so the user can start drawing after the page has loaded.
	$('#pencil').attr('class', 'active');

	//every wich is clickable will be defined in this function 
	declareJqueryOnClickEvents();

	loadImageIntoHTML();
}


/**
 * will be triggert after a client has loaded the HTML document
 */
$(document).ready(init());

/**
 * Sets the fileName variable to the URL query parameter value of file.
 */
function initFileNameFromURL() {
	/*
	* fileName Start
	* The document fills the filename variable with
	* the parameter data of it's url. if the fileName
	* var is either empty or the filename var contains
	* html special chars, in both cases the filename
	* var's value is set to the default value "-name-"
	* Once this is processed, the filename var is sent to
	* the server. If a database record to that var exists,
	* it is selected and sent to the client. Ift this is
	* not the case, a database entry will be generated.
	*/
	fileName = getUrlVariable("file");
	if (fileName == "" || fileName == null) {
		fileName = "-name-";
	}
	else if (/^[a-zA-Z0-9- ]*$/.test(fileName) == false) {
		fileName = "-name-";
	}
}

/**
 * In this function are all jquery onClick Events listed.
 */
function declareJqueryOnClickEvents() {
	$('#clear').on("click", function () {
		clearCanvas();
		socket.emit('clear', fileName);
	});
	$('#back').on("click", function () {
		saveFile(fileName);
		setTimeout(function () {
			document.location.href = "/";
		}, 500);

	});
	$('#save').on("click", function () {
		saveWindow(fileName);
	});
	$('#saveFile').on("click", function () {
		saveFile(fileName);
	});

	//Toolbar onClick Events are in a seperate function, in order to make this function more readable
	jqueryToolBarOnClickEvents();
}

/**
 * Contains Toolbar related onClick Events.
 */
function jqueryToolBarOnClickEvents() {
	$('#pencil').on("click", function () {
		$("#" + state).attr('class', '');
		state = 'pencil';
		$('#pencil').attr('class', 'active');
		$('#pencil').css('background', 'url(../styles/media/drawHover.png) no-repeat center');
		$('#rect').css('background', 'url(../styles/media/rect.png) no-repeat center');
		$('#tria').css('background', 'url(../styles/media/tria.png) no-repeat center');
		$('#circle').css('background', 'url(../styles/media/circle.png) no-repeat center');
		$('#line').css('background', 'url(../styles/media/line.png) no-repeat center');
		$('#text').css('background', 'url(../styles/media/text.png) no-repeat center');
		$('#fill').css('background', 'url(../styles/media/fill.png) no-repeat center');
		$('#fill').attr('class', '');
		filled = false;
		document.body.style.cursor = 'auto';
	});
	$('#rect').on("click", function () {
		$("#" + state).attr('class', '');
		state = 'rect';
		$('#rect').attr('class', 'active');
		$('#rect').css('background', 'url(../styles/media/rectHover.png) no-repeat center');
		$('#pencil').css('background', 'url(../styles/media/draw.png) no-repeat center');
		$('#tria').css('background', 'url(../styles/media/tria.png) no-repeat center');
		$('#circle').css('background', 'url(../styles/media/circle.png) no-repeat center');
		$('#line').css('background', 'url(../styles/media/line.png) no-repeat center');
		$('#text').css('background', 'url(../styles/media/text.png) no-repeat center');
		$('#fill').css('background', 'url(../styles/media/fill.png) no-repeat center');
		$('#fill').attr('class', '');
		filled = false;
		document.body.style.cursor = 'se-resize';
	});
	$('#tria').on("click", function () {
		$('#tria').attr('class', 'active');
		$("#" + state).attr('class', '');
		state = 'tria';
		$('#tria').attr('class', 'active');
		$('#tria').css('background', 'url(../styles/media/triaHover.png) no-repeat center');
		$('#pencil').css('background', 'url(../styles/media/draw.png) no-repeat center');
		$('#circle').css('background', 'url(../styles/media/circle.png) no-repeat center');
		$('#line').css('background', 'url(../styles/media/line.png) no-repeat center');
		$('#rect').css('background', 'url(../styles/media/rect.png) no-repeat center');
		$('#text').css('background', 'url(../styles/media/text.png) no-repeat center');
		$('#fill').css('background', 'url(../styles/media/fill.png) no-repeat center');
		$('#fill').attr('class', '');
		filled = false;
		document.body.style.cursor = 'se-resize';
	});
	$('#circle').on("click", function () {
		$('#circle').attr('class', 'active');
		$("#" + state).attr('class', '');
		state = 'circle';
		$('#circle').attr('class', 'active');
		$('#circle').css('background', 'url(../styles/media/circleHover.png) no-repeat center');
		$('#pencil').css('background', 'url(../styles/media/draw.png) no-repeat center');
		$('#tria').css('background', 'url(../styles/media/tria.png) no-repeat center');
		$('#line').css('background', 'url(../styles/media/line.png) no-repeat center');
		$('#rect').css('background', 'url(../styles/media/rect.png) no-repeat center');
		$('#text').css('background', 'url(../styles/media/text.png) no-repeat center');
		$('#fill').css('background', 'url(../styles/media/fill.png) no-repeat center');
		$('#fill').attr('class', '');
		filled = false;
		document.body.style.cursor = 'se-resize';
	});
	$('#text').on("click", function () {
		$('#text').attr('class', 'active');
		$("#" + state).attr('class', '');
		state = 'text';
		$('#text').attr('class', 'active');
		myText = prompt("Text eingeben: ", "");
		$('#text').css('background', 'url(../styles/media/textHover.png) no-repeat center');
		$('#pencil').css('background', 'url(../styles/media/draw.png) no-repeat center');
		$('#circle').css('background', 'url(../styles/media/circle.png) no-repeat center');
		$('#tria').css('background', 'url(../styles/media/tria.png) no-repeat center');
		$('#rect').css('background', 'url(../styles/media/rect.png) no-repeat center');
		$('#line').css('background', 'url(../styles/media/line.png) no-repeat center');
		$('#fill').css('background', 'url(../styles/media/fill.png) no-repeat center');
		$('#fill').attr('class', '');
		filled = false;
		document.body.style.cursor = 'text';
	});
	$('#fontSize').on("click", function () {
		$('#text').attr('class', 'active');
		$("#" + state).attr('class', '');
		state = 'text';
		$('#text').attr('class', 'active');
	});
	$('#fontFamily').on("click", function () {
		$('#text').attr('class', 'active');
		$("#" + state).attr('class', '');
		state = 'text';
		$('#text').attr('class', 'active');
	});
	$('#line').on("click", function () {
		$('#line').attr('class', 'active');
		$("#" + state).attr('class', '');
		state = 'line';
		$('#line').attr('class', 'active');
		$('#line').css('background', 'url(../styles/media/lineHover.png) no-repeat center');
		$('#pencil').css('background', 'url(../styles/media/draw.png) no-repeat center');
		$('#circle').css('background', 'url(../styles/media/circle.png) no-repeat center');
		$('#tria').css('background', 'url(../styles/media/tria.png) no-repeat center');
		$('#rect').css('background', 'url(../styles/media/rect.png) no-repeat center');
		$('#text').css('background', 'url(../styles/media/text.png) no-repeat center');
		$('#fill').css('background', 'url(../styles/media/fill.png) no-repeat center');
		$('#fill').attr('class', '');
		filled = false;
		document.body.style.cursor = 'w-resize';
	});
	$('#fill').on("click", function () {
		if (filled == true) {
			$('#fill').css('background', 'url(../styles/media/fill.png) no-repeat center');
			$('#fill').attr('class', '');
			filled = false;
		}
		else {
			$('#fill').css('background', 'url(../styles/media/fillHover.png) no-repeat center');
			$('#fill').attr('class', 'active');
			filled = true;
		}
		document.body.style.cursor = 'se-resize';
	});
	$('#colorrange').on("click", function () {
		$('#colorrange').attr('class', 'active');
		$("#" + state).attr('class', '');
		state = 'colorrange';
		$('#colorrange').attr('class', 'active');
	});
}

/** 
 * Function to load Image Start
 */
function loadImageIntoHTML() {
	window.URL = window.URL || window.webkitURL;
	let fileSelect = document.getElementById("fileSelect");
	let fileElem = document.getElementById("fileElem");

	fileSelect.addEventListener("click", function (e) {
		if (fileElem) {
			fileElem.click();
		}
		e.preventDefault();
	}, false);
}

/**
 * Creates the colorset in the Toolbar
 */
function createColorset() {
	for (let i = 0, n = colors.length; i < n; i++) {
		let swatch = document.createElement('div'); //create new div
		swatch.className = 'swatch ' + colors[i]; //classname swatch + color bsp: swatch black
		if (i == 0) {
			swatch.className += 'swatch ' + colors[i] + ' active';
		}
		swatch.style.backgroundColor = colors[i]; //dem jeweiligen swatch die hintergrundfarbe geben
		swatch.addEventListener('click', setSwatch); //durch klick die setSwatch aufrufen
		document.getElementById('colors').appendChild(swatch); //dem div "colors" das div swatch anhängen
	}
	function setSwatch(e) {
		let swatch = e.target; //identifiy swatch
		myCol = swatch.style.backgroundColor; //set color
		let x = document.getElementsByClassName('swatch');
		for (let i = 0; i < x.length; i++) {
			x[i].className = 'swatch';
		}
		swatch.className += ' active';
	}
}

