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

var allObj = [];
var pencilObj = [];
var fileName = "/draw/";

/*
* is run once, when the program starts. 
* important functions to receive Objects and load Objects. 
*/
function setup() {
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

	//handle messages
	/*
	*	receive Objects from Server
	*/
	socket.on('receiveObj',
		function (obj, username, fileName) {
			drawX(obj);
			allObj.push(obj);
			//console.log("allObj length: " + allObj.length);
			//displays username on mousex and mousey from obj and fadeOut after 3000
			if (obj.fileName == fileName) {
				$("#foreground").html(username);
				if (obj.name == 'pencilarray') {
					for (var i = 1; i < obj.objArray.length; i++) {
						$("#foreground").css({ 'top': obj.objArray[i].y, 'left': obj.objArray[i].x, 'background-color': 'moccasin', 'padding': '5px' }).fadeIn('fast');
					}
				}
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
	//handle messages end


	/*
	* updateUserList, updates the user list and convert loaded string data from db to create obj
	*/
	function updateUserList() {
		socket.emit("appUpdateUsers", username, fileName);
		var drawElem = drawObjData.split("***");
		var nameOfFile;
		var objName;

		for (var i = 0; i < drawElem.length; i++) {
			var elem = drawElem[i]; //something like 1775###187###15###1775###187###black###0###pencil###Nena###Ship
			elem = elem.replace("+++", "");
			var elem2 = elem.split("###"); //something like 1775,187,15,1775,187,black,0,pencil,Nena, Ship
			var lastNum = elem2.length - 1;
			objName = elem2.length - 2;
			nameOfObj = elem2[objName];		//something like pencil
			nameOfFile = elem2[lastNum];	//something like Ship
			if (fileName == nameOfFile) {
				switch (nameOfObj) {
					case 'pencil':
						var newObject = new PencilObj(elem2[0], elem2[1], elem2[2], elem2[3], elem2[4], elem2[5], elem2[6], elem2[7]);
						oldObject = new PencilObj(elem2[0], elem2[1], elem2[2], elem2[3], elem2[4], elem2[5], elem2[6], elem2[7]);
						canvasBackground.strokeWeight(newObject.v);
						canvasBackground.stroke(newObject.col);
						canvasBackground.line(newObject.x, newObject.y, newObject.xp, newObject.yp);
						break;
					case 'rect':
						var newObject = new RectObj(elem2[0], elem2[1], elem2[2], elem2[3], elem2[4], elem2[5], elem2[6], elem2[7], elem2[8], elem2[9], elem2[10]);

						canvasBackground.strokeWeight(newObject.v);
						canvasBackground.stroke(newObject.col);
						if (newObject.filled === "true") {
							canvasBackground.fill(newObject.col);
						}
						else {
							canvasBackground.noFill();
						}
						canvasBackground.rect(newObject.x, newObject.y, newObject.width, newObject.height);
						break;
					case 'line':
						var newObject = new LineObj(elem2[0], elem2[1], elem2[2], elem2[3], elem2[4], elem2[5], elem2[6], elem2[7]);
						canvasBackground.strokeWeight(newObject.v);
						canvasBackground.stroke(newObject.col);
						canvasBackground.noFill();
						canvasBackground.line(newObject.x, newObject.y, newObject.xp, newObject.yp);
						break;
					case 'text':
						var newObject = new TextObj(elem2[0], elem2[1], elem2[2], elem2[3], elem2[4], elem2[5], elem2[6], elem2[7]);
						canvasBackground.textSize(newObject.size);
						canvasBackground.textFont(newObject.family);
						canvasBackground.noStroke();
						canvasBackground.fill(newObject.col);
						canvasBackground.text(newObject.str, newObject.x, newObject.y);
						break;
					case 'img':
						var newObject = new ImgObj(elem2[0], elem2[1], elem2[2], elem2[3], elem2[4]);
						var path = newObject.src;
						var image2 = new Image();
						image2.src = path;
						image2.onload = function () {
							drawingContext.drawImage(image2, 0, 0);
						}
						break;
					case 'circle':
						var newObject = new CircleObj(elem2[0], elem2[1], elem2[2], elem2[3], elem2[4], elem2[5], elem2[6], elem2[7]);
						canvasBackground.strokeWeight(newObject.v);
						canvasBackground.stroke(newObject.col);
						if (newObject.filled === "true") {
							canvasBackground.fill(newObject.col);
						}
						else {
							canvasBackground.noFill();
						}
						canvasBackground.ellipse(newObject.x, newObject.y, newObject.width, newObject.height);
						break;
				}
			}
		}
	}
	updateUserList();

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
* drawX function: draws something with the currentObject from the Server to the canvas
*/
function drawX(curObj) {
	var elem = document.getElementById("submen");
	var top = 48;
	var body = document.body;
	var doc = document.documentElement;

	var rectangle = elem.getBoundingClientRect();
	var scrollX = window.pageXOffset || doc.scrollLeft || body.scrollLeft;
	var scrollY = window.pageYOffset || doc.scrollTop || body.scrollTop;
	var clientX = doc.clientLeft || body.clientLeft || 0;
	var clientY = doc.clientTop || body.clientTop || 0;

	var posX = rectangle.left + scrollX - clientY;
	var posY = rectangle.top + scrollY - clientX - top;

	if (!((mouseX > posX && mouseX < (posX + elem.offsetWidth)) && (mouseY > 0 && mouseY < (elem.offsetHeight)))) {
		if (fileName == curObj.fileName) {
			switch (curObj.name) {
				case 'img':
					var path = curObj.src;
					var image2 = new Image();
					image2.src = curObj.src;
					drawingContext.drawImage(image2, 0, 0);
					break;
				case 'pencilarray':
					for (var i = 0; i < curObj.objArray.length; i++) {
						drawX(curObj.objArray[i]);
					}
					break;
				case 'pencil':
					canvasBackground.strokeWeight(curObj.v);
					canvasBackground.stroke(curObj.col);
					canvasBackground.line(curObj.x, curObj.y, curObj.xp, curObj.yp);
					break;
				case 'line':
					if (curObj.l == 0) {
						canvasBackground.strokeWeight(curObj.v);
						canvasBackground.stroke(curObj.col);
						canvasBackground.noFill();
						canvasBackground.line(curObj.x, curObj.y, curObj.xp, curObj.yp);
						clear();
					}
					else {
						clear();
						canvasBackground.strokeWeight(curObj.v);
						canvasBackground.stroke(curObj.col);
						canvasBackground.noFill();
						line(curObj.x, curObj.y, curObj.xp, curObj.yp);
					}
					break;
				case 'rect':
					if (curObj.l == 0) {
						canvasBackground.strokeWeight(curObj.v);
						canvasBackground.stroke(curObj.col);
						if (curObj.filled == true) {
							canvasBackground.fill(curObj.col);
						}
						else {
							canvasBackground.noFill();
						}
						canvasBackground.rect(curObj.x, curObj.y, curObj.width, curObj.height);
						clear();
					}
					else {
						clear();
						canvasBackground.strokeWeight(curObj.v);
						canvasBackground.stroke(curObj.col);
						noFill();
						rect(curObj.x, curObj.y, curObj.width, curObj.height);
					}
					break;
				case 'circle':
					if (curObj.l == 0) {
						canvasBackground.strokeWeight(curObj.v);
						canvasBackground.stroke(curObj.col);
						if (curObj.filled == true) {
							canvasBackground.fill(curObj.col);
						}
						else {
							canvasBackground.noFill();
						}
						canvasBackground.ellipse((curObj.x + curObj.width / 2), (curObj.y + curObj.height / 2), curObj.width, curObj.height);
						clear();
					}
					else {
						clear();
						canvasBackground.strokeWeight(curObj.v);
						canvasBackground.stroke(curObj.col);
						noFill();
						ellipse((curObj.x + curObj.width / 2), (curObj.y + curObj.height / 2), curObj.width, curObj.height);
						rect(curObj.x - 1, curObj.y - 1, curObj.width + 2, curObj.height + 2);
					}
					break;
				case 'text':
					canvasBackground.textSize(curObj.size);
					canvasBackground.textFont(curObj.family);
					canvasBackground.noStroke();
					canvasBackground.fill(curObj.col);
					canvasBackground.text(curObj.str, curObj.x, curObj.y);
					clear();
					break;
			}
		}
	}
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
				socket.emit('sendObj', activeObj, username, fileName);
			}
			else {
				var newObject = new PencilObj(mouseX, mouseY, document.getElementById("slid").value, mouseX, mouseY, myCol, 0, fileName);
				drawX(newObject);
				socket.emit('sendObj', newObject, username, fileName);
			}
			stroke = false;
			break;
		case 'rect':
			activeObj.l = 0;
			drawX(activeObj);
			socket.emit('sendObj', activeObj, username, fileName);
			break;
		case 'circle':
			activeObj.l = 0;
			drawX(activeObj);
			socket.emit('sendObj', activeObj, username, fileName);
			break;
		case 'line':
			activeObj.l = 0;
			drawX(activeObj);
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
			drawX(newObject);
			pencilObj.push(newObject);
			stroke = true;
			break;
		case 'rect':
			activeObj = new RectObj(startPosX, startPosY, document.getElementById("slid").value, mouseX - startPosX, mouseY - startPosY, myCol, filled, 1, fileName);
			drawX(activeObj);
			break;
		case 'circle':
			activeObj = new CircleObj(startPosX, startPosY, document.getElementById("slid").value, mouseX - startPosX, mouseY - startPosY, myCol, filled, 1, fileName);
			drawX(activeObj);
			break;
		case 'line':
			activeObj = new LineObj(startPosX, startPosY, document.getElementById("slid").value, mouseX, mouseY, myCol, 1, fileName);
			drawX(activeObj);
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
			drawX(activeObj);
			socket.emit('sendObj', activeObj, username, fileName);
			break;
	}
}

/*
* function to delete the drawing start
*/
function clearCanvas() {
	canvasBackground.clear();
	clear();
	allObj.length = 0;
	pencilObj.length = 0;
	$("#foreground").html("");
	$("#foreground").css({ 'display': 'none' });
	saveFile(fileName);
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
	//console.log(image);
	socket.emit("appDrawingSave", image, fileName, function (message) {
		if (message.error) {
			console.log(message.error);
			$("#sidebarItemSaveNotice").css({ 'left': '40%', 'top': '40%', 'padding': '20px' });
			$("#sidebarItemSaveNotice").html(message.error);
			$("#sidebarItemSaveNotice").show().delay(2000).fadeOut();
		} else if (message.fileName){
			console.log("saved " + message.fileName + " successfully");
			$("#sidebarItemSaveNotice").css({ 'left': '40%', 'top': '40%', 'padding': '20px' });
			$("#sidebarItemSaveNotice").html("saved " + message.fileName + " successfully");
			$("#sidebarItemSaveNotice").show().delay(2000).fadeOut();
		} else {
			console.log("Someting went wrong appDrawFunction.js");
			$("#sidebarItemSaveNotice").css({ 'left': '40%', 'top': '40%', 'padding': '20px' });
			$("#sidebarItemSaveNotice").html("Someting went wrong appDrawFunction.js");
			$("#sidebarItemSaveNotice").show().delay(2000).fadeOut();
		}
	}); //fileName!
	//$("#sidebarItemSaveNotice").css({ 'left': '40%', 'top': '40%', 'padding': '20px' });
	//$("#sidebarItemSaveNotice").html("saved successfully");
	//$("#sidebarItemSaveNotice").show().delay(2000).fadeOut();
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
			var draw1_canvas = document.getElementById('visible');
			var dataurl = draw1_canvas.toDataURL("image/png");
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

$(document).ready(function () {
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

	/*
	* functions to create colorset start
	*/
	for (var i = 0, n = colors.length; i < n; i++) {
		var swatch = document.createElement('div'); //create new div
		swatch.className = 'swatch ' + colors[i];		//classname swatch + color bsp: swatch black
		if (i == 0) {
			swatch.className += 'swatch ' + colors[i] + ' active';
		}
		swatch.style.backgroundColor = colors[i];	//dem jeweiligen swatch die hintergrundfarbe geben
		swatch.addEventListener('click', setSwatch);	//durch klick die setSwatch aufrufen
		document.getElementById('colors').appendChild(swatch);	//dem div "colors" das div swatch anhängen
	}
	function setSwatch(e) {
		var swatch = e.target; //identifiy swatch
		myCol = swatch.style.backgroundColor; //set color
		var x = document.getElementsByClassName('swatch');
		for (var i = 0; i < x.length; i++) {
			x[i].className = 'swatch';
		}
		swatch.className += ' active'; //give active class
	}
	$('#pencil').attr('class', 'active');

	/*
	* on.('click') Events Start 
	*/
	$('#clear').on("click", function () {
		clearCanvas();
		socket.emit('clear', fileName);
	});
	$('#back').on("click", function () {
		saveFile(fileName);
		setTimeout(function () {
			document.location.href ="/";
		}, 500);
		
	});
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
	$('#save').on("click", function () {
		saveWindow(fileName);
	});
	$('#saveFile').on("click", function () {
		saveFile(fileName);
	});

	/* 
	* Function to load Image Start
	*/
	window.URL = window.URL || window.webkitURL;
	var fileSelect = document.getElementById("fileSelect");
	var fileElem = document.getElementById("fileElem");

	fileSelect.addEventListener("click", function (e) {
		if (fileElem) {
			fileElem.click();
		}
		e.preventDefault();
	}, false);
});
