
const numRocks = 50;
var canvas;
var gl = null,
	program = null,
	carMesh = null,
	rock = new Array(numRocks).fill(null),
	skybox = null,
	imgtx = null,
	skyboxLattx = null,
	skyboxTbtx = null;
	skyboxFrtx = null;
	skyboxTptx = null;
	skyboxLftx = null;
	skyboxRgtx = null;
	skyboxBktx = null;
	skyboxBttx = null;
	rocktx = new Array(numRocks).fill(null);
var projectionMatrix, 
	perspectiveMatrix,
	viewMatrix,
	worldMatrix,
	gLightDir,
	orientLight;


//Parameters for Camera
var cx = 4.5;
var cy = 5.0;
var cz = 10.0;
var elevation = 0.01;
var angle = 0.01;
var roll = 0.01;

var carAngle = 0;
var carX = -0.0;
var carY = -0.7;
var carZ = -67;
var correctionFactor =3;
var correctionTime = 0;

var lookRadius = 10.0;


var keys = [];
 

var vz = 0.0;
var rvy = 0.0;

var keyFunctionDown = function(e) {
	
	// console.log('X:' + carX);
	// console.log('Y:' + carY);
	// console.log('Z:' + carZ);
  if(!keys[e.keyCode]) {
  	keys[e.keyCode] = true;
	switch(e.keyCode) {
	  case 37:
//console.log("KeyUp   - Dir LEFT");
		rvy = rvy + 1.0;
		//vz = vz-1;
		break;
	  case 39:
//console.log("KeyUp   - Dir RIGHT");
		rvy = rvy - 1.0;
		break;
	  case 38:
//console.log("KeyUp   - Dir UP");
		vz = vz - 0.4;
		break;
	  case 40:
//console.log("KeyUp   - Dir DOWN");
		vz = vz + 1.0;
		break;
	}
  }
}

function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
  }

var keyFunctionUp = async function(e){
	//console.log("FIRED");
	
	var currentTime = (new Date).getTime();
	var deltaT;
	if(lastUpdateTime){
		deltaT = (currentTime - lastUpdateTime) / 1000.0;
	} else {
		deltaT = 1/50;
	}
	lastUpdateTime = currentTime;

  	if(keys[e.keyCode]) {
		console.log(carAngle)
  		keys[e.keyCode] = false;
		switch(e.keyCode) {
	  		case 37:
		//console.log("KeyDown  - Dir LEFT");
		rvy = rvy - 1.0;
		//ruota la barca di carAngle gradi indietro
		//carAngle;
		var numberOfDelta ;
		if(carAngle < 0){
			numberOfDelta = carAngle*-correctionFactor;
		}
		else{
			numberOfDelta = carAngle*correctionFactor;
		}
		var deltaAngle = carAngle/numberOfDelta;
		//console.log(carAngle)
		for(var i = 0; i<numberOfDelta  && !(rvy); i++){
			
			carAngle = (carAngle-deltaAngle);
			//console.log(carAngle);

			await sleep(correctionTime/numberOfDelta);
		}
		if(Math.round(parseFloat(carAngle)) == parseFloat(0.0) && !rvy){
			carAngle = carAngle - carAngle;
		}
		

		//console.log("FINAL ANGLE (left): " + carAngle);
		

		// carAngle = carAngle-deltaAngle;
		// await sleep(2000);

		// carAngle = carAngle-deltaAngle;
		// await sleep(2000);

		// carAngle = carAngle-deltaAngle;
		
		//rvy = rvy .0;


		//vz = vz+1;
		break;
	  case 39:
		//console.log("KeyDown - Dir RIGHT");
		rvy = rvy + 1.0;

		var numberOfDelta ;
		if(carAngle < 0){
			numberOfDelta = carAngle*-correctionFactor;
		}
		else{
			numberOfDelta = carAngle*correctionFactor;
		}
		var deltaAngle = carAngle/numberOfDelta;
		//console.log(carAngle)
		for(var i = 0; i<numberOfDelta  && !(rvy);i++){

			carAngle = (carAngle-deltaAngle);
			//console.log(carAngle);

			await sleep(correctionTime/numberOfDelta);
		}
		if(Math.round(parseFloat(carAngle))  == parseFloat(0.0) && !rvy){
			carAngle = carAngle - carAngle;
		}

		//carAngle = 0.0;

		//console.log("FINAL ANGLE (right): " + carAngle);

		break;
	  case 38:
//console.log("KeyDown - Dir UP");
		vz = vz + 0.4;
		break;
	  case 40:
//console.log("KeyDown - Dir DOWN");
		vz = vz - 1.0;
		break;
	}
  }
}

var aspectRatio;

function doResize() {
    // set canvas dimensions
	var canvas = document.getElementById("my-canvas");
    if((window.innerWidth > 40) && (window.innerHeight > 240)) {
		canvas.width  = window.innerWidth-16;
		canvas.height = window.innerHeight-200;
		var w=canvas.clientWidth;
		var h=canvas.clientHeight;
		
		gl.clearColor(0.0, 0.0, 0.0, 1.0);
		gl.viewport(0.0, 0.0, w, h);
		
		aspectRatio = w/h;
    }
}

function alert2(message, title, buttonText) {

    buttonText = (buttonText == undefined) ? "Ok" : buttonText;
    title = (title == undefined) ? "The page says:" : title;

    var div = $('#dialog1');
    div.html(message);
    div.attr('title', title);
    div.dialog({
        autoOpen: true,
        modal: true,
        draggable: false,
        resizable: false,
        buttons: [{
            text: buttonText,
            click: function () {
				$(this).dialog("close");
				window.location.reload(false);

                div.remove();
            }
        }]
    });
}

		
// Vertex shader
var vs = `#version 300 es
#define POSITION_LOCATION 0
#define NORMAL_LOCATION 1
#define UV_LOCATION 2

layout(location = POSITION_LOCATION) in vec3 in_pos;
layout(location = NORMAL_LOCATION) in vec3 in_norm;
layout(location = UV_LOCATION) in vec2 in_uv;

uniform mat4 pMatrix;
uniform mat4 nMatrix;

out vec3 fs_pos;
out vec3 fs_norm;
out vec2 fs_uv;

void main() {
	fs_pos = in_pos;
	fs_norm = (nMatrix * vec4(in_norm, 0.0)).xyz;
	fs_uv = vec2(in_uv.x, 1.0-in_uv.y);
	
	gl_Position = pMatrix * vec4(in_pos, 1.0);
}`;

// Fragment shader
var fs = `#version 300 es
precision highp float;

in vec3 fs_pos;
in vec3 fs_norm;
in vec2 fs_uv;

uniform sampler2D u_texture;
uniform vec4 lightDir;
//uniform float ambFact;

out vec4 color;

void main() {
	vec4 texcol = texture(u_texture, fs_uv);
	float ambFact = lightDir.w;
	float dimFact = (1.0-ambFact) * clamp(dot(normalize(fs_norm), lightDir.xyz),0.0,1.0) + ambFact;
	color = vec4(texcol.rgb * dimFact, texcol.a);
}`;

// event handler

var mouseState = false;
var lastMouseX = -100, lastMouseY = -100;
function doMouseDown(event) {
	lastMouseX = event.pageX;
	lastMouseY = event.pageY;
	mouseState = true;
}
function doMouseUp(event) {
	lastMouseX = -100;
	lastMouseY = -100;
	mouseState = false;
}
function doMouseMove(event) {
	if(mouseState) {
		var dx = event.pageX - lastMouseX;
		var dy = lastMouseY - event.pageY;
		lastMouseX = event.pageX;
		lastMouseY = event.pageY;
		
		if((dx != 0) || (dy != 0)) {
			angle = angle + 0.5 * dx;
			elevation = elevation + 0.5 * dy;
		}
	}
}
function doMouseWheel(event) {
	var nLookRadius = lookRadius + event.wheelDelta/1000.0;
	if((nLookRadius > 2.0) && (nLookRadius < 20.0)) {
		lookRadius = nLookRadius;
	}
}

// texture loader callback
var textureLoaderCallback = function() {
	var textureId = gl.createTexture();
	gl.activeTexture(gl.TEXTURE0 + this.txNum);
	gl.bindTexture(gl.TEXTURE_2D, textureId);		
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this);		
// set the filtering so we don't need mips
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
}

// The real app starts here
function main(){
	
	// setup everything else
	var canvas = document.getElementById("my-canvas");
	canvas.addEventListener("mousedown", doMouseDown, false);
	canvas.addEventListener("mouseup", doMouseUp, false);
	canvas.addEventListener("mousemove", doMouseMove, false);
	canvas.addEventListener("mousewheel", doMouseWheel, false);
	window.addEventListener("keyup", keyFunctionUp, false);
	window.addEventListener("keydown", keyFunctionDown, false);
	window.onresize = doResize;
	canvas.width  = window.innerWidth-16;
	canvas.height = window.innerHeight-200;
	
	try{
		gl= canvas.getContext("webgl2");
	} catch(e){
		console.log(e);
	}
	
	if(gl){
		// Compile and link shaders
		program = gl.createProgram();
		var v1 = gl.createShader(gl.VERTEX_SHADER);
		gl.shaderSource(v1, vs);
		gl.compileShader(v1);
		if (!gl.getShaderParameter(v1, gl.COMPILE_STATUS)) {
			alert("ERROR IN VS SHADER : " + gl.getShaderInfoLog(v1));
		}
		var v2 = gl.createShader(gl.FRAGMENT_SHADER);
		gl.shaderSource(v2, fs)
		gl.compileShader(v2);		
		if (!gl.getShaderParameter(v2, gl.COMPILE_STATUS)) {
			alert("ERROR IN FS SHADER : " + gl.getShaderInfoLog(v2));
		}			
		gl.attachShader(program, v1);
		gl.attachShader(program, v2);
		gl.linkProgram(program);				
		
		gl.useProgram(program);

		// Load mesh using the webgl-obj-loader library

		carMesh = new OBJ.Mesh(boatObjStr);
		initRocks();
		// rock[0] = new OBJ.Mesh(rockObjStr)
		skybox = new OBJ.Mesh(trackNfieldObjStr);
		skybox2 = new OBJ.Mesh(trackNfieldObjStr);
		skybox3 = new OBJ.Mesh(trackNfieldObjStr);

		// Loading other faces of the skybox
		skyboxFront = new OBJ.Mesh(trackNfieldObjStr);
		skyboxBack = new OBJ.Mesh(trackNfieldObjStr);
		skyboxLeft = new OBJ.Mesh(trackNfieldObjStr);
		skyboxRight = new OBJ.Mesh(trackNfieldObjStr);
		skyboxTop = new OBJ.Mesh(trackNfieldObjStr);
		skyboxBottom = new OBJ.Mesh(trackNfieldObjStr);
		

		// Create the textures
		imgtx = new Image();
		imgtx.txNum = 0;
		imgtx.onload = textureLoaderCallback;
		imgtx.src = CarTextureData;

		skyboxLattx = new Image();
		skyboxLattx.txNum = 1;
		skyboxLattx.onload = textureLoaderCallback;
		skyboxLattx.src = TrackTextureData;

		skyboxTbtx = new Image();
		skyboxTbtx.txNum = 2;
		skyboxTbtx.onload = textureLoaderCallback;
		skyboxTbtx.src = FieldTextureData;

		skyboxFrtx = new Image();
		skyboxFrtx.txNum = 3;
		skyboxFrtx.onload = textureLoaderCallback;
		skyboxFrtx.src = frontTextureData;

		skyboxLftx = new Image();
		skyboxLftx.txNum = 4;
		skyboxLftx.onload = textureLoaderCallback;
		skyboxLftx.src = leftTextureData;
		
		skyboxRgtx = new Image();
		skyboxRgtx.txNum = 5;
		skyboxRgtx.onload = textureLoaderCallback;
		skyboxRgtx.src = rightTextureData;
		
		skyboxTptx = new Image();
		skyboxTptx.txNum = 6;
		skyboxTptx.onload = textureLoaderCallback;
		skyboxTptx.src = topTextureData;
		
		rocktx[0] = new Image();
		rocktx[0].txNum = 7;
		rocktx[0].onload = textureLoaderCallback;
		rocktx[0].src = RockTextureData;
		skyboxBttx = new Image();
		skyboxBttx.txNum = 8;
		skyboxBttx.onload = textureLoaderCallback;
		skyboxBttx.src = bottomTextureData;
		
		skyboxBktx = new Image();
		skyboxBktx.txNum = 9;
		skyboxBktx.onload = textureLoaderCallback;
		skyboxBktx.src = backTextureData;
		

		
		// links mesh attributes to shader attributes
		program.vertexPositionAttribute = gl.getAttribLocation(program, "in_pos");
		gl.enableVertexAttribArray(program.vertexPositionAttribute);
		 
		program.vertexNormalAttribute = gl.getAttribLocation(program, "in_norm");
		gl.enableVertexAttribArray(program.vertexNormalAttribute);
		 
		program.textureCoordAttribute = gl.getAttribLocation(program, "in_uv");
		gl.enableVertexAttribArray(program.textureCoordAttribute);

		program.WVPmatrixUniform = gl.getUniformLocation(program, "pMatrix");
		program.NmatrixUniform = gl.getUniformLocation(program, "nMatrix");
		program.textureUniform = gl.getUniformLocation(program, "u_texture");
		program.lightDir = gl.getUniformLocation(program, "lightDir");
//		program.ambFact = gl.getUniformLocation(program, "ambFact");
		//OBJ.initMeshBuffers(gl, rock[0])
		OBJ.initMeshBuffers(gl, carMesh);
		OBJ.initMeshBuffers(gl, skybox);
		OBJ.initMeshBuffers(gl, skybox3);
		OBJ.initMeshBuffers(gl, skybox2);
		OBJ.initMeshBuffers(gl, skyboxFront);
		OBJ.initMeshBuffers(gl, skyboxLeft);
		OBJ.initMeshBuffers(gl, skyboxRight);
		OBJ.initMeshBuffers(gl, skyboxTop);
		OBJ.initMeshBuffers(gl, skyboxBack);
		OBJ.initMeshBuffers(gl, skyboxBottom);

		
		
		// prepares the world, view and projection matrices.
		var w=canvas.clientWidth;
		var h=canvas.clientHeight;
		
		gl.clearColor(0.0, 0.0, 0.0, 1.0);
		gl.viewport(0.0, 0.0, w, h);
		
//		perspectiveMatrix = utils.MakePerspective(60, w/h, 0.1, 1000.0);
		aspectRatio = w/h;
		
	 // turn on depth testing
	    gl.enable(gl.DEPTH_TEST);
	
	
		// algin the skybox with the light
		gLightDir = [1.0, 0.0, 0.0, 0.0];

		orientLight = utils.multiplyMatrices(utils.MakeRotateZMatrix(-45), utils.MakeRotateYMatrix(180));
		gLightDir = utils.multiplyMatrixVector(orientLight, gLightDir);

		initRock();
		generateRockPositions(0, 200, rocks1);
		generateRockPositions(0, 200, rocks2);

		drawScene();
	}else{
		alert("Error: WebGL not supported by your browser!");
	}
}

var lastUpdateTime;
var camVel = [0,0,0];
var fSk = 500.0;
var fDk = 2.0 * Math.sqrt(fSk);

// Driving dynamic coefficients
var sAT = 0.5;
var mAT = 5.0;
var ATur = 3.0;
var ATdr = 5.5;
var sBT = 1.0;
var mBT = 3.0;
var BTur = 5.0;
var BTdr = 5.5;
var Tfric = Math.log(0.05);
var sAS = 0.1;	// Not used yet
var mAS = 108.0;
var ASur = 1.0;	// Not used yet
var ASdr = 0.5;	// Not used yet
var trackZmulti = 10.0;
var trackScale = 100.0;
var trackZpos = [0,200,400];
var skyboxScale = 800
var carLinAcc = 0.0;
var carLinVel = 0.0;
var carAngVel = 0.0;
var preVz = 0;

var rockPosition = [];
var rockRotation = [];


function generateRockPositions(lowerLimit, upperLimit, destMatrix, numElements){
	for(i = 0; i<numElements;i++){
		var positionX = Math.floor(Math.random() * 200) - 100;
		var positionZ = lowerLimit + Math.floor(Math.random() * upperLimit-lowerLimit);
		rockPosition[i] = [positionX,positionZ + getHundreds(carZ) * 100];
		destMatrix[positionX + 100][positionZ] = true;
		rockRotation[i] = Math.floor(Math.random() * 360);
	}
}
function generateRock(rockPositionsArray,rockRotationsArray, numElements){
	// var angleX = Math.floor(Math.random() * 360);
	// var angleY = Math.floor(Math.random() * 360);
	// var angleZ = Math.floor(Math.random() * 360);

	//var rotatedMatrixRock = utils.multiplyMatrices(utils.MakeRotateZMatrix(angleZ),utils.multiplyMatrices(utils.MakeRotateYMatrix(angleY),utils.multiplyMatrices(utils.MakeRotateXMatrix(angleX),utils.identityMatrix)));

	for(i=0; i<numElements; i++){
		// draws the rock
		gl.bindBuffer(gl.ARRAY_BUFFER, rock[i].vertexBuffer);
		gl.vertexAttribPointer(program.vertexPositionAttribute, rock[i].vertexBuffer.itemSize, gl.FLOAT, false, 0, 0);
		gl.bindBuffer(gl.ARRAY_BUFFER, rock[i].textureBuffer);
		gl.vertexAttribPointer(program.textureCoordAttribute, rock[i].textureBuffer.itemSize, gl.FLOAT, false, 0, 0);

		gl.bindBuffer(gl.ARRAY_BUFFER, rock[i].normalBuffer);
		gl.vertexAttribPointer(program.vertexNormalAttribute, rock[i].normalBuffer.itemSize, gl.FLOAT, false, 0, 0);
			
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, rock[i].indexBuffer);		

		gl.uniform1i(program.textureUniform, 7);
		gl.uniform4f(program.lightDir, gLightDir[0], gLightDir[1], gLightDir[2], 0.2);


		var alignMatrix = utils.MakeScaleMatrix(1.5);
		alignMatrix = utils.multiplyMatrices(utils.MakeRotateYMatrix(rockRotationsArray[i]),alignMatrix);
		var rockx = rockPositionsArray[i][0];
		var rocky = 0;
		var rockz = rockPositionsArray[i][1];
		WVPmatrix = utils.multiplyMatrices(projectionMatrix, utils.multiplyMatrices(utils.MakeTranslateMatrix(rockx,rocky,rockz),alignMatrix));
		gl.uniformMatrix4fv(program.WVPmatrixUniform, gl.FALSE, utils.transposeMatrix(WVPmatrix));		
		gl.uniformMatrix4fv(program.NmatrixUniform, gl.FALSE,utils.transposeMatrix(alignMatrix));
		gl.drawElements(gl.TRIANGLES, rock[i].indexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
	}
	
}

function initRocks(){
	for(i=0; i<numRocks;i++){
		rock[i] = new OBJ.Mesh(rockObjStr)
		OBJ.initMeshBuffers(gl, rock[i])
	}
}
//var aRock;

var rocks1 = [];
var rocks2 = [];

var deathRadius = 2;

function initRock() {
	for (let i = 0; i < 200; i ++) {
		rocks1[i] = [];
		rocks2[i] = [];
		for (let j = 0; j < 200; j++) {
			rocks1[i][j] = false;
			rocks2[i][j] = false;
			//rocks2[i][j] = true;
		}
	}
}


function distance(pointX, pointY, boatX, boatY) {
	return Math.sqrt(Math.pow(pointX - boatX, 2) + Math.pow(pointY - boatY, 2));
}

function getHundreds(number) {
	return parseInt(number/100);
}

function checkDeath(roundedX, roundedZ) {
	//console.log("ROUNDEDX: " + roundedX + "\nROUNDEDZ: " + roundedZ + "\nZ%200: " + (roundedZ%200));
	var offsetedX = roundedX + 100;
	var zPosition = roundedZ - getHundreds(roundedZ) * 100;
	var directionsX = [-1, 0, 1, -1, 0, 1, -1, 0, -1];
	var directionsZ = [-1, -1, -1, 0, 0, 0, 1, 1, 1];
	
	if (roundedZ % 200 >= 100) { //use rocks2
		for (i = 0; i < deathRadius; i++) {
			for (j = 0; j < directionsX.length; j++) {
				if (rocks2[offsetedX + directionsX[j] * deathRadius][zPosition + directionsZ[j] * deathRadius]) {

					//console.log("X: " + offsetedX + directionsX[j] * deathRadius + "\nZ: " + zPosition + directionsZ[j] * deathRadius + "\n")

		 			//console.log("/ndistance: " + d);
		 			//console.log("DEATH BY ROCK: " + i + ".." + j + "\n");
			 		//console.log("logging data:\ni: " + i + "\nj: " + j + "\nroundedx: "+ roundedX + "\nroundedZ: " + roundedZ)
					return true;
				}
			}
		}

		// for (i = 0; i < 200; i++) {
		// 	for (j = 0; j < 200; j++) {
		// 		if (rocks2[i][j]) {
		// 			var d = distance((i-100), j, roundedX, roundedZ);
					
		// 			if (Math.round(parseFloat(d)) <= parseFloat(deathRadius)) {
		// 				// collision
		// 				console.log("/ndistance: " + d);
		// 				console.log("DEATH BY ROCK: " + i + ".." + j + "\n");
		// 				console.log("logging data:\ni: " + i + "\nj: " + j + "\nroundedx: "+ roundedX + "\nroundedZ: " + roundedZ)
		// 			}
		// 		}
				
		// 	}
		// }
	} else { //use rocks1



		// for (i = 0; i < 200; i++) {
		// 	for (j = 0; j < 200; j++) {
		// 		if (rocks1[i][j]) {
		// 			var d = distance((i-100), j, roundedX, roundedZ);
					
		// 			if (Math.round(parseFloat(d)) <= parseFloat(deathRadius)) {
		// 				// collision
		// 				console.log("/ndistance: " + d);
		// 				console.log("DEATH BY ROCK: " + i + ".." + j + "\n");
		// 				console.log("logging data:\ni: " + i + "\nj: " + j + "\nroundedx: "+ roundedX + "\nroundedZ: " + roundedZ)
		// 			}
		// 		}
				
		// 	}
		// }
	}
}

function prepare_object_rendering(object,light_mul){
	gl.bindBuffer(gl.ARRAY_BUFFER, object.vertexBuffer);
		gl.vertexAttribPointer(program.vertexPositionAttribute, object.vertexBuffer.itemSize, gl.FLOAT, false, 0, 0);
	    gl.bindBuffer(gl.ARRAY_BUFFER, object.textureBuffer);
	    gl.vertexAttribPointer(program.textureCoordAttribute, object.textureBuffer.itemSize, gl.FLOAT, false, 0, 0);
		gl.bindBuffer(gl.ARRAY_BUFFER, object.normalBuffer);
		gl.vertexAttribPointer(program.vertexNormalAttribute, object.normalBuffer.itemSize, gl.FLOAT, false, 0, 0);
		gl.uniform4f(program.lightDir, gLightDir[0], gLightDir[1], gLightDir[2], light_mul);
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, object.indexBuffer);
}


function generateTrack(){
	// draws the skybox

	if(carZ > trackZpos[0] + 150){
		trackZpos = [trackZpos[1],trackZpos[2],trackZpos[2]+200]
	}

	for(var i = 0; i<3;i++){
	prepare_object_rendering(skybox,1.0);
	WVPmatrix = utils.multiplyMatrices(projectionMatrix,utils.multiplyMatrices(utils.MakeTranslateMatrix(0,0,trackZpos[i]), utils.MakeScaleNuMatrix(trackScale,trackScale,trackScale)));
	gl.uniformMatrix4fv(program.WVPmatrixUniform, gl.FALSE, utils.transposeMatrix(WVPmatrix));
	gl.uniformMatrix4fv(program.NmatrixUniform, gl.FALSE, utils.identityMatrix());
	gl.uniform1i(program.textureUniform, 1);
	gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
	}
}

function floatComparison(num1, num2, cComparison) {
	switch (cComparison) {
		case ">":
			return Math.round(parseFloat(num1)) > Math.round(parseFloat(num2));
		
		case "<":
			return Math.round(parseFloat(num1)) < Math.round(parseFloat(num2));

		case ">=":
			return Math.round(parseFloat(num1)) >= Math.round(parseFloat(num2));

		case "<=":
			return Math.round(parseFloat(num1)) <= Math.round(parseFloat(num2));
		
		case "==":
			return Math.round(parseFloat(num1)) == Math.round(parseFloat(num2));
	
		case "===":
			return Math.round(parseFloat(num1)) === Math.round(parseFloat(num2));

		default:
			return false;
	}
}


var done = false;

function drawScene() {
		// compute time interval
		//console.log('X: ' + carX);
		//console.log('Z: ' + carZ);
		//console.log('\n');
		var currentTime = (new Date).getTime();
		var deltaT;
		if(lastUpdateTime){
			deltaT = (currentTime - lastUpdateTime) / 1000.0;
		} else {
			deltaT = 1/50;
		}
		lastUpdateTime = currentTime;

		// call user procedure for world-view-projection matrices
		wvpMats = worldViewProjection(carX, carY, carZ, carAngle, cx, cy, cz);
		// the generated matrices (one world and 2 is projection) depend on the boat's position and direction, 
		// the world is a rotation by CarDir degrees and translation over to the boat's coordinates

		// //re align boat
		// if(keys[37] == false){
		// 	carAngle = carAngle*((lastUpdateTime+3000)-currentTime)
		// }

		viewMatrix = wvpMats[1];

		perspectiveMatrix = projection = utils.MakePerspective(60, aspectRatio, 0.1, 2000.0);

		// dvecmat is actually the world matrix at the moment
		dvecmat = wvpMats[0];
		
		// computing car velocities
		carAngVel = mAS * deltaT * rvy;	
		//console.log(carAngVel)
		
		vz = -vz;
		// = 0.8 * deltaT * 60 * vz;
		if(vz > 0.1) {
		  if(preVz > 0.1) {
			carLinAcc = carLinAcc + ATur * deltaT;
			//console.log(ATur);
			if(carLinAcc > mAT) carLinAcc = mAT;
		  } else if(carLinAcc < sAT) carLinAcc = sAT;
		} else if(vz > -0.1) {
			carLinAcc = carLinAcc - ATdr * deltaT * Math.sign(carLinAcc);
			if(Math.abs(carLinAcc) < 0.001) carLinAcc = 0.0;
		} else { 
		  if(preVz < 0.1) {
			carLinAcc = carLinAcc - BTur * deltaT;
			if(carLinAcc < -mBT) carLinAcc = -mBT;
		  } else if(carLinAcc > -sBT) carLinAcc = -sBT;
		}
		preVz = vz;
		vz = -vz;
		carLinVel = carLinVel * Math.exp(Tfric * deltaT) - deltaT * carLinAcc;
		
		
		if(carLinVel>0.3 ){
			carLinVel = 0.3;
		}
		if (carLinVel < (0.0-0.3)) {
			carLinVel = 0.0-0.3; // TOP QUALITY MATH HERE
		}
		//console.log(carLinVel)
		
		// Magic for moving the car
		worldMatrix = utils.multiplyMatrices(dvecmat, utils.MakeScaleMatrix(1.0));
		xaxis = [dvecmat[0],dvecmat[4],dvecmat[8]]; //axises transformed by the world matrix (boat position)
		yaxis = [dvecmat[1],dvecmat[5],dvecmat[9]];
		zaxis = [dvecmat[2],dvecmat[6],dvecmat[10]];
		
		if(rvy != 0) {	
			qy = Quaternion.fromAxisAngle(yaxis, utils.degToRad(carAngVel));
			newDvecmat = utils.multiplyMatrices(qy.toMatrix4(), dvecmat);  // New world matrix after the boat rotation has been computed according to angular speed
			R11=newDvecmat[10];R12=newDvecmat[8];R13=newDvecmat[9];
			R21=newDvecmat[2]; R22=newDvecmat[0];R23=newDvecmat[1];
			R31=newDvecmat[6]; R32=newDvecmat[4];R33=newDvecmat[5];
			
			if((R31<1)&&(R31>-1)) {
				theta = -Math.asin(R31);
				phi = Math.atan2(R32/Math.cos(theta), R33/Math.cos(theta));
				psi = Math.atan2(R21/Math.cos(theta), R11/Math.cos(theta));
				
			} else {
				phi = 0;
				if(R31<=-1) {
					theta = Math.PI / 2;
					psi = phi + Math.atan2(R12, R13);
				} else {
					theta = -Math.PI / 2;
					psi = Math.atan2(-R12, -R13) - phi;
				}
			}
//			elevation = theta/Math.PI*180;
//			roll      = phi/Math.PI*180;
//			angle     = psi/Math.PI*180;
			carAngle  = psi/Math.PI*180;
			if (Math.round(parseFloat(carAngle)) > parseFloat(90.0)) {
				carAngle = 90.0;
			}
			if (Math.round(parseFloat(carAngle)) < parseFloat(0.0-90.0)) {
				carAngle = 0.0-90.0;
			}
			//console.log(carAngle);
		}
		// spring-camera system
			// target coordinates
		nC = utils.multiplyMatrixVector(worldMatrix, [0, 5, -10, 1]);
			// distance from target
			
		deltaCam = [cx - nC[0], cy - nC[1], cz - nC[2]];
		
		camAcc = [-fSk * deltaCam[0] - fDk * camVel[0], -fSk * deltaCam[1] - fDk * camVel[1], -fSk * deltaCam[2] - fDk * camVel[2]];
		
		camVel = [camVel[0] + camAcc[0] * deltaT, camVel[1] + camAcc[1] * deltaT, camVel[2] + camAcc[2] * deltaT];
		cx += camVel[0] * deltaT;
		cy += camVel[1] * deltaT;
		cz += camVel[2] * deltaT;
		
		// car motion
		delta = utils.multiplyMatrixVector(dvecmat, [0, 0, carLinVel, 0.0]);
		
		if(carX<-100 && delta[0]>0){
			delta[0] = 0
		}
		if(carX>100 && delta[0]<0){
			delta[0] = 0
		}

		carX -= delta[0];
		carZ -= delta[2];

//		console.log("X: " + carX + "\nZ: " + carZ + "\n")

		projectionMatrix = utils.multiplyMatrices(perspectiveMatrix, viewMatrix);	

		// if (Math.round(parseFloat(carX)) == Math.round(parseFloat(badX)) /*&& carZ == badZ*/) {
		// 	console.log("X: " + badX + "\nZ: "  + "\n");
		// 	console.log("LOST THE BOAT\n");
		// 	window.location.reload(false);
		// }

		
		// un paio di cose da sistemare ancora
		if (floatComparison(carZ%200, 0.0, "===") && !(done)) {
			if (getHundreds(carZ) > 0) {
				if (getHundreds(carZ) % 2 == 0) {
					generateRockPositions(0, 200, rocks2);
					done = true;
				} else {
					generateRockPositions(0, 200, rocks1);
					done = true;
				}
			}
		} else {
			if (!(floatComparison(carZ%100, 0.0, "===")) && delta[2]>0) {
				done = false;
			}
		}

		//checkDeath(Math.round(parseFloat(carX)), Math.round(parseFloat(carZ)));
		// ANNOTATION: DE-COMMENT THE ABOVE LINE

		// draws the track
		//gl.uniform1i(program.textureUniform, 1);
		//gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
		generateTrack();

		// draws the skybox front
		
		//gl.bindBuffer(gl.ARRAY_BUFFER, skyboxFront.vertexBuffer);
		//gl.vertexAttribPointer(program.vertexPositionAttribute, skyboxFront.vertexBuffer.itemSize, gl.FLOAT, false, 0, 0);
	    //gl.bindBuffer(gl.ARRAY_BUFFER, skyboxFront.textureBuffer);
	    //gl.vertexAttribPointer(program.textureCoordAttribute, skyboxFront.textureBuffer.itemSize, gl.FLOAT, false, 0, 0);
		//gl.bindBuffer(gl.ARRAY_BUFFER, skyboxFront.normalBuffer);
		//gl.vertexAttribPointer(program.vertexNormalAttribute, skyboxFront.normalBuffer.itemSize, gl.FLOAT, false, 0, 0);
		//gl.uniform4f(program.lightDir, gLightDir[0], gLightDir[1], gLightDir[2], 1.0);
		//gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, skyboxFront.indexBuffer);
		prepare_object_rendering(skyboxFront,1.0);
		//translate the image of y: 30 z: 100 , rotated by 90 degree on the X axis and then scaled up by 200
		WVPmatrix = utils.multiplyMatrices(projectionMatrix,utils.multiplyMatrices(utils.MakeTranslateMatrix(0,30,1000+carZ),utils.multiplyMatrices( utils.MakeRotateXMatrix(-90) ,utils.MakeScaleMatrix(skyboxScale))));  		
		gl.uniformMatrix4fv(program.WVPmatrixUniform, gl.FALSE, utils.transposeMatrix(WVPmatrix));
		gl.uniformMatrix4fv(program.NmatrixUniform, gl.FALSE, utils.identityMatrix());
		gl.uniform1i(program.textureUniform, 3);
		gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);

		// draws the skybox back
		
		prepare_object_rendering(skyboxBack,1.0);
		//translate the image of y: 30 z: 100 , rotated by 90 degree on the X axis and then scaled up by 200
		WVPmatrix = utils.multiplyMatrices(projectionMatrix,utils.multiplyMatrices(utils.MakeTranslateMatrix(0,30,-600+carZ),utils.multiplyMatrices(utils.multiplyMatrices(utils.MakeRotateYMatrix(180), utils.MakeRotateXMatrix(-90) ),utils.MakeScaleMatrix(skyboxScale))));  		
		gl.uniformMatrix4fv(program.WVPmatrixUniform, gl.FALSE, utils.transposeMatrix(WVPmatrix));
		gl.uniformMatrix4fv(program.NmatrixUniform, gl.FALSE, utils.identityMatrix());
		gl.uniform1i(program.textureUniform, 9);
		gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);

		// draws the skybox right of ship (left world)
		
		prepare_object_rendering(skyboxLeft,1.0);
		//translate the image of y: 30 x: -1000 , rotated by 90 degree on the X and y axis and then scaled up by 500
		WVPmatrix = utils.multiplyMatrices(projectionMatrix,utils.multiplyMatrices(utils.MakeTranslateMatrix(-800,30,200+carZ),utils.multiplyMatrices( utils.multiplyMatrices(utils.MakeRotateYMatrix(-90), utils.MakeRotateXMatrix(-90)) ,utils.MakeScaleMatrix(skyboxScale))));  		
		gl.uniformMatrix4fv(program.WVPmatrixUniform, gl.FALSE, utils.transposeMatrix(WVPmatrix));
		gl.uniformMatrix4fv(program.NmatrixUniform, gl.FALSE, utils.identityMatrix());
		gl.uniform1i(program.textureUniform, 4);
		gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);

		// draws the skybox left of ship (right world)
				
		prepare_object_rendering(skyboxRight,1.0);
		//translate the image of y: 30 x: 100 , rotated by 90 degree on the X and Y axis and then scaled up by 200
		WVPmatrix = utils.multiplyMatrices(projectionMatrix,utils.multiplyMatrices(utils.MakeTranslateMatrix(800,30,200+carZ),utils.multiplyMatrices( utils.multiplyMatrices(utils.MakeRotateYMatrix(90), utils.MakeRotateXMatrix(-90)) ,utils.MakeScaleMatrix(skyboxScale))));  		
		gl.uniformMatrix4fv(program.WVPmatrixUniform, gl.FALSE, utils.transposeMatrix(WVPmatrix));
		gl.uniformMatrix4fv(program.NmatrixUniform, gl.FALSE, utils.identityMatrix());
		gl.uniform1i(program.textureUniform, 5);
		gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);

		// draws the skybox top
		prepare_object_rendering(skyboxTop,1.0);
		//translate the image of y: 170  , rotated by 90 degree on the X axis and scaled up by 200
		WVPmatrix = utils.multiplyMatrices(projectionMatrix,utils.multiplyMatrices(utils.MakeTranslateMatrix(0,170,carZ),utils.multiplyMatrices( utils.MakeRotateXMatrix(180) ,utils.MakeScaleMatrix(skyboxScale))));  		
		gl.uniformMatrix4fv(program.WVPmatrixUniform, gl.FALSE, utils.transposeMatrix(WVPmatrix));
		gl.uniformMatrix4fv(program.NmatrixUniform, gl.FALSE, utils.identityMatrix());
		gl.uniform1i(program.textureUniform, 6);
		gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);


		// draws the skybox bottom
			
		
		prepare_object_rendering(skyboxBottom,1.0)
		//translate the image of y: -230, scaled up by 200
		WVPmatrix = utils.multiplyMatrices(projectionMatrix,utils.multiplyMatrices(utils.MakeTranslateMatrix(0,-770,200+carZ), utils.multiplyMatrices(utils.MakeRotateYMatrix(180),  utils.MakeScaleMatrix(skyboxScale))));  		
		gl.uniformMatrix4fv(program.WVPmatrixUniform, gl.FALSE, utils.transposeMatrix(WVPmatrix));
		gl.uniformMatrix4fv(program.NmatrixUniform, gl.FALSE, utils.identityMatrix());
		gl.uniform1i(program.textureUniform, 8);
		gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);


		// // draws the rock
		// gl.bindBuffer(gl.ARRAY_BUFFER, rock[0].vertexBuffer);
		// gl.vertexAttribPointer(program.vertexPositionAttribute, rock[0].vertexBuffer.itemSize, gl.FLOAT, false, 0, 0);
	    // gl.bindBuffer(gl.ARRAY_BUFFER, rock[0].textureBuffer);
	    // gl.vertexAttribPointer(program.textureCoordAttribute, rock[0].textureBuffer.itemSize, gl.FLOAT, false, 0, 0);
		
		// gl.bindBuffer(gl.ARRAY_BUFFER, rock.normalBuffer);
		// gl.vertexAttribPointer(program.vertexNormalAttribute, rock[0].normalBuffer.itemSize, gl.FLOAT, false, 0, 0);
		 
		// gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, rock[0].indexBuffer);		

		// gl.uniform1i(program.textureUniform, 7);
		// gl.uniform4f(program.lightDir, gLightDir[0], gLightDir[1], gLightDir[2], 0.2);

		// // Aligning the Rock
		// var alignMatrix = utils.MakeScaleMatrix(1.5);
		// alignMatrix = utils.multiplyMatrices(alignMatrix,utils.MakeRotateYMatrix(90));

		// var rockx = 0;
		// var rocky = 0;
		// var rockz = 56;
		// WVPmatrix = utils.multiplyMatrices(projectionMatrix, utils.MakeTranslateMatrix(rockx,rocky,rockz));
		// gl.uniformMatrix4fv(program.WVPmatrixUniform, gl.FALSE, utils.transposeMatrix(WVPmatrix));		
		// gl.uniformMatrix4fv(program.NmatrixUniform, gl.FALSE, utils.transposeMatrix(worldMatrix));
		// gl.drawElements(gl.TRIANGLES, rock[0].indexBuffer.numItems, gl.UNSIGNED_SHORT, 0);


		generateRock();


		// draws the Ship
		prepare_object_rendering(carMesh,0.2);


		// Aligning the Ship
		var alignMatrix = utils.MakeScaleMatrix(0.01);
		alignMatrix = utils.multiplyMatrices(alignMatrix,utils.MakeRotateYMatrix(90));

		WVPmatrix = utils.multiplyMatrices(utils.multiplyMatrices(projectionMatrix, worldMatrix),alignMatrix);
		gl.uniformMatrix4fv(program.WVPmatrixUniform, gl.FALSE, utils.transposeMatrix(WVPmatrix));		
		gl.uniformMatrix4fv(program.NmatrixUniform, gl.FALSE, utils.transposeMatrix(worldMatrix));
		gl.uniform1i(program.textureUniform, 0);
		gl.drawElements(gl.TRIANGLES, carMesh.indexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
		window.requestAnimationFrame(drawScene);		
}

