/** Number of rocks to be generated */
const numRocks = 50;

/** true if a rock has been hit, false otherwise */
var errDetected = false;

/** webgl context */
var gl = null;
/** webgl program */
var	program = null;
/** meshes of the boat */
var	boatMesh = null;
/** mesh of the skybox */
var	skybox = null;
/** boat textures */
var	imgtx = null;
/** rock textures */
var rocktx = null;

// skybox textures
var	skyboxLattx = null,
	skyboxTbtx = null,
	skyboxFrtx = null,
	skyboxTptx = null,
	skyboxLftx = null,
	skyboxRgtx = null,
	skyboxBktx = null,
	skyboxBttx = null;

/** scale factor for the boat model */
var boatResize = 0.01;

/** scale factor for the rock model */
var rockResize = 1.5;

/*
#############################
##         MATRICES        ##
#############################
*/

/** projectionMatrix; transform 3D points in screen points */
var projectionMatrix;
/** perspectiveMatrix; apply transformations for perspective */
var	perspectiveMatrix;
/** viewMatrix; transformation wrt camera */
var	viewMatrix;
/** worldMatrix; move the boat */
var	worldMatrix;

/** Directional Ligth modeling the Sun */
var	gLightDir;
/** Position of the Moon */
var	moonPos;
/** Color of the cone light */
var	LampColor = [0, 0, 0, 0];
/** Size of the inner circle of the cone light */
var	LampConeIn = 60;
/** Size of the outer circle of the cone light */
var	LampConeOut = 120;
/** Distance where the light power of the cone light is 1 */
var	LampTarget = 20;
/** Decay factor of the cone light */
var	LampDecay = 2;
/** Position of the cone light */
var LampPos;
/** Direction of the cone light  */
var LampDir = [0.0, 0.0, -1.0];
/** Current color in partymode */
var PartyColor = [0.0, 0.0, 0.0, 1.0];

/*
 *
 * AXIS ANNOTATIONS:
 * X -> HORIZONTAL; FROM 100 TO THE LEFT TO -100 TO THE RIGHT OF THE SCREEN
 * Y -> VERTICAL;
 * Z -> ENTRANT; FROM -100 TO +INF (main movement axis)
 *  
 */

/*
#############################
##       CAMERA INIT       ##
#############################
*/

/**
 * X coordinate of the camera 
 * @type number
 */
var cx = 4.5;
/**
 * Y coordinate of the camera 
 * @type number
 */
var cy = 5.0;
/**
 * Z coordinate of the camera 
 * @type number
 */
var cz = 10.0;



/*
#############################
##        BOAT INIT        ##
#############################
*/
/**
 * Boat rotation on the Y axis in degrees
 * @type number
 */
var boatAngle = 0;
/**
 * Boat center position along the X axis
 * @type number
 */
var boatX = 0.0;
/**
 * Boat center position along the Y axis
 */
var boatY = -0.7;
/**
 * Boat center position along the Z axis
 */
var boatZ = -67;

/*
#############################
##      EVENT HANDLER      ##
#############################
*/

/** Speed of re-allignment of the boat in terms of angular speed */
var correctionFactor = 5;

/** Impose a waiting time after each reallignment step */
var correctionTime = 0;

/** set true every time the boat reach the 200.0Z milestone */
var newSector = false;

/** stores the current keys pressed */
var keys = [];

/** 
 * Determine the movement of the boat along the Z axis, based on userInput.
 * 
 * @value -0.4 if the ArrowUp key is pressed
 * @value 1.0 if the ArrowDown key is pressed, 
 * @value 0.0 otherwise
 */
var vz = 0.0;

/**
 * Determine the movement of the boat along the X axis, based on userInput.
 * 
 * @value 1.0 if ArrowLeft is pressed
 * @value -1.0 if ArrowRight is pressed
 * @value 0.0 otherwise
 */
var rvy = 0.0;

/**
 * Compute the program reaction on key pressure of the user
 * 
 * @param {any} e Pressed key on the keyboard
 */
var keyFunctionDown = function (e) {
	// console.log('X:' + boatX);
	// console.log('Y:' + boatY);
	// console.log('Z:' + boatZ);
	if (!keys[e.keyCode]) {
		keys[e.keyCode] = true;
		switch (e.keyCode) {

			/* 
			 * Mappings:
			 * 37 -> ArrowLeft
			 * 38 -> ArrowUp
			 * 39 -> ArrowRight
			 * 40 -> ArrowDown
			 */

			case 37:
				rvy = rvy + 1.0;
				//vz = vz-1;
				break;

			case 39:
				rvy = rvy - 1.0;
				break;

			case 38:
				vz = vz - 0.4;
				break;

			case 40:
				vz = vz + 1.0;
				break;
		}
	}
}

/**
 * Pause the execution for ms milliseconds
 * 
 * @param {number} ms time to sleep in millisecond
 */
function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Compute the program reaction on key release by the user
 * 
 * @param {any} e Released Key on the keyboard
 */
var keyFunctionUp = async function (e) {
	var currentTime = (new Date).getTime();
	lastUpdateTime = currentTime;

	if (keys[e.keyCode]) {
		keys[e.keyCode] = false;
		switch (e.keyCode) {

			/* 
			 * Mappings:
			 * 37 -> ArrowLeft
			 * 38 -> ArrowUp
			 * 39 -> ArrowRight
			 * 40 -> ArrowDown
			 */

			case 37:
				// Pressione su ArrowLeft terminata -> riallinea la barca 
				rvy = rvy - 1.0;

				var numberOfDelta;

				if (boatAngle < 0) {
					numberOfDelta = boatAngle * -correctionFactor;
				} else {
					numberOfDelta = boatAngle * correctionFactor;
				}

				var deltaAngle = boatAngle / numberOfDelta;

				for (var i = 0; i < numberOfDelta && !(rvy); i++) {
					boatAngle = (boatAngle - deltaAngle);
					await sleep(correctionTime / numberOfDelta);
				}

				if (Math.round(parseFloat(boatAngle)) == parseFloat(0.0) && !rvy) {
					boatAngle = boatAngle - boatAngle;
				}
				break;

			case 39:
				// Pressione su ArrowRight terminata -> riallinea la barca 
				rvy = rvy + 1.0;

				var numberOfDelta;

				if (boatAngle < 0) {
					numberOfDelta = boatAngle * -correctionFactor;
				} else {
					numberOfDelta = boatAngle * correctionFactor;
				}

				var deltaAngle = boatAngle / numberOfDelta;
				
				for (var i = 0; i < numberOfDelta && !(rvy); i++) {
					boatAngle = (boatAngle - deltaAngle);
					await sleep(correctionTime / numberOfDelta);
				}

				if (Math.round(parseFloat(boatAngle)) == parseFloat(0.0) && !rvy) {
					boatAngle = boatAngle - boatAngle;
				}

				break;

			case 38:
				vz = vz + 0.4;
				break;

			case 40:
				vz = vz - 1.0;
				break;
		}
	}
}

/** stores the html canvas element */
var canvas;

/** Store the dimension ratio of the canvas element. 
 * @type number
 */
var aspectRatio;

/** Re-compute the canvas dimensions and ratio between them */
function doResize() {
	var canvas = document.getElementById("my-canvas");
	if ((window.innerWidth > 40) && (window.innerHeight > 240)) {
		canvas.width = (window.innerWidth - 16) * 0.7;
		canvas.height = window.innerHeight - 200;
		var w = canvas.clientWidth;
		var h = canvas.clientHeight;

		gl.clearColor(0.0, 0.0, 0.0, 1.0);
		gl.viewport(0.0, 0.0, w, h);

		aspectRatio = w / h;
	}
}

/**
 * Function that open a dialog box
 * 
 * @param {string} message Message to be display
 * @param {string} title Title of the dialog to display
 * @param {string} buttonText Message to be displayed as button text
 */
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


/*
#############################
##         SHADERS         ##
#############################
*/

//TODO: COMMENTARE ANCHE LE RIGHE DEGLI SHADER
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
uniform mat4 WMat;
uniform vec3 moonPos;


out vec3 fs_pos;
out vec3 fs_norm;
out vec2 fs_uv;
out vec3 moonDir;
out float moonDist;
out vec4 realPos;

void main() {
	
	fs_norm = (nMatrix * vec4(in_norm, 0.0)).xyz;
	fs_uv = vec2(in_uv.x, 1.0-in_uv.y);
	fs_pos = (WMat * vec4(in_pos, 1.0)).xyz;
	moonDir = normalize(moonPos - fs_pos);
	moonDist = distance(moonPos,fs_pos);

	gl_Position = (pMatrix * vec4(in_pos, 1.0));
}`;

// Fragment shader
var fs = `#version 300 es
precision highp float;

in vec3 fs_pos;
in vec3 fs_norm;
in vec2 fs_uv;
in vec4 realPos;
in vec3 moonDir;
in float moonDist;

uniform float LampOn;
uniform sampler2D u_texture;
uniform vec4 lightDir;
uniform vec4 LampCol;
uniform vec3 LampPos;
uniform vec3 LampDir;
uniform float LConeIn;
uniform float LConeOut;
uniform float LampTarget;
uniform float LampDecay;


out vec4 color;

void main() {
	vec4 texcol = texture(u_texture, fs_uv);
	float LampDist = distance(LampPos,fs_pos);
	vec3 ToLampDir = normalize(LampPos - fs_pos); 
	vec4 LampLight = LampCol * pow(LampTarget / LampDist,LampDecay) * clamp(  dot(LampDir,ToLampDir) - cos(radians(LConeOut) ) / ( cos(radians(LConeIn)) - cos(radians(LConeOut)) ) , 0.0,1.0 ) * texcol;
	//LampLight = LampCol * pow(LampTarget / LampDist,LampDecay) *texcol;
	vec4 LampDiffuse  = LampLight * clamp( dot( ToLampDir,normalize(fs_norm) ), 0.0, 1.0 );
	vec4 MoonCol = vec4(1.0,1.0,1.0,1.0) * pow(50.0/moonDist,1.0) * texcol;
	vec4 MoonDiffuse  = MoonCol * clamp(dot(normalize(fs_norm), moonDir),0.0,1.0);
	float dimFact = clamp(lightDir.w * dot(normalize(fs_norm), lightDir.xyz),0.0,1.0);
	vec4 DayDiffuse = vec4(clamp(texcol.rgb * dimFact,0.0,1.0),1);
	color = clamp(DayDiffuse + LampOn*LampDiffuse + MoonDiffuse,0.0,1.0);
}`;

/** texture loader callback */
var textureLoaderCallback = function () {
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


/*
#############################
##          MAIN           ##
#############################
*/

function main() {
	// setup everything else
	var canvas = document.getElementById("my-canvas");
	window.addEventListener("keyup", keyFunctionUp, false);
	window.addEventListener("keydown", keyFunctionDown, false);
	window.onresize = doResize;
	canvas.width = (window.innerWidth - 16) * 0.7;
	canvas.height = window.innerHeight - 200;

	try {
		gl = canvas.getContext("webgl2");
	} catch (e) {
		console.log(e);
	}

	if (gl) {
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
		boatMesh = new OBJ.Mesh(boatObjStr);
		initRocks();
		
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
		imgtx.src = boatTextureData;

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

		rocktx = new Image();
		rocktx.txNum = 7;
		rocktx.onload = textureLoaderCallback;
		rocktx.src = RockTextureData;
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
		program.WMat = gl.getUniformLocation(program, "WMat");
		program.textureUniform = gl.getUniformLocation(program, "u_texture");
		program.lightDir = gl.getUniformLocation(program, "lightDir");
		// adding cusotm lights
		program.LampOn = gl.getUniformLocation(program, "LampOn");
		program.LampPos = gl.getUniformLocation(program, "LampPos");
		program.LampDir = gl.getUniformLocation(program, "LampDir");
		program.LampColor = gl.getUniformLocation(program, "LampCol");
		program.LampConeIn = gl.getUniformLocation(program, "LConeIn");
		program.LampConeOut = gl.getUniformLocation(program, "LConeOut");
		program.LampTarget = gl.getUniformLocation(program, "LampTarget");
		program.LampDecay = gl.getUniformLocation(program, "LampDecay");
		program.moonPos = gl.getUniformLocation(program, "moonPos");
		
		//OBJ.initMeshBuffers(gl, rock[0])
		OBJ.initMeshBuffers(gl, boatMesh);
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
		var w = canvas.clientWidth;
		var h = canvas.clientHeight;

		gl.clearColor(0.0, 0.0, 0.0, 1.0);
		gl.viewport(0.0, 0.0, w, h);

		// perspectiveMatrix = utils.MakePerspective(60, w/h, 0.1, 1000.0);
		aspectRatio = w / h;

		// turn on depth testing
		gl.enable(gl.DEPTH_TEST);


		// algin the skybox with the light
		gLightDir = [1.0, 0.0, 0.0, 0.0];

		gLightDir = HourToSunlight(TimeOfDay.value);
		initRock();
		// generateRockPositions(0, 200, rocks1);
		// generateRockPositions(0, 200, rocks2);

		drawScene();
	} else {
		alert("Error: WebGL not supported by your browser!");
	}
}


//TODO: ALL THIS
var lastUpdateTime;
var camVel = [0, 0, 0];
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
var Tfric = Math.log(0.000001);
var sAS = 0.1;	// Not used yet
var mAS = 108.0;
var ASur = 1.0;	// Not used yet
var ASdr = 0.5;	// Not used yet
var trackZmulti = 10.0;
var trackScale = 100.0;
var trackZpos = [0, 200, 400];
var skyboxScale = 800
var boatLinAcc = 0.0;
var boatLinVel = 0.0;
var boatAngVel = 0.0;
var preVz = 0;

/*
#############################
##         ROCKS           ##
#############################
*/

/** Array containing all the meshes for the generated rocks */
var rock1 = new Array(numRocks).fill(null);
/** Array containing all the meshes for the generated rocks */
var	rock2 = new Array(numRocks).fill(null);
/** Contains all the X and Z positions of the generated rocks with (Z % 400) < 200 */
var position1 = [];
/** Contains all the rotations of the generated rocks with (Z % 400) < 200 */
var rotation1 = [];
/** Contains all the X and Z positions of the generated rocks with (Z % 400) > 200 */
var position2 = [];
/** Contains all the rotations of the generated rocks with (Z % 400) > 200 */
var rotation2 = [];
/** parameter to execute the first call of rock generation */
var isStarting = true;
/** 200x200 matrix mapping the positions of the rocks for direct access */
var rocksCol1 = [];
/** 200x200 matrix mapping the positions of the rocks for direct access */
var rocksCol2 = [];

/**
 * Function that generated X and Z coordinates of the rocks
 * 
 * @param {number} lowerLimit lowest possible Z coordinate of the rocks to be generated
 * @param {number} upperLimit highest possible Z coordinate of the rocks to be generated
 * @param {number} numElements number of rocks to be generated
 * 
 * @returns an array containing the X and Z coordinate of the generated rocks
 */
function generateRockPositionOnMatrix(lowerLimit, upperLimit, numElements) {
	let rockPos = [];
	for (i = 0; i < numElements; i++) {
		var positionX = Math.floor(Math.random() * 199) - 99; // between [-99 and 100]
		var positionZ = lowerLimit + Math.floor(Math.random() * (upperLimit - lowerLimit));
		rockPos[i] = [positionX, positionZ];
	}
	return rockPos;
}

/**
 * Function that generates the rotation angles of the rocks
 * 
 * @param {number} numElements the number of rocks that need a rotation parameter
 * @param {any[][]} destMatrix matrix that store the values generated
 * @param {any[]} rocksPosition array containing the positions of the rocks
 * 
 * @returns an array containing the generated rotations for the rocks; Dom [0, 360]
 */
function generateRockRotationOnMatrix(numElements, destMatrix, rocksPosition) {
	let rockRot = [];
	for (i = 0; i < numElements; i++) {
		rockRot[i] = Math.floor(Math.random() * 360);
		let rock = rocksPosition[i];

		destMatrix[100 - rock[0]][rock[1] % 200] = {
			"X": rock[0],
			"Z": rock[1],
			"angle": rockRot[i]
		};
	}

	return rockRot;
}

/**
 * Draw the rocks in the world
 * 
 * @param {number[][]} rockPositionsArray Array containing the X and Z coordinate of the rocks
 * @param {number[]} rockRotationsArray Array containing the rotation of the rock along Y
 * @param {number} numElements Number of rock to draw
 * @param {any} rocksArray Array containing the rock meshes
 */
function generateRock(rockPositionsArray, rockRotationsArray, numElements, rocksArray) {
	// var angleX = Math.floor(Math.random() * 360);
	// var angleY = Math.floor(Math.random() * 360);
	// var angleZ = Math.floor(Math.random() * 360);

	//var rotatedMatrixRock = utils.multiplyMatrices(utils.MakeRotateZMatrix(angleZ),utils.multiplyMatrices(utils.MakeRotateYMatrix(angleY),utils.multiplyMatrices(utils.MakeRotateXMatrix(angleX),utils.identityMatrix)));

	for (i = 0; i < numElements; i++) {
		// draws the rock
		/*
		gl.bindBuffer(gl.ARRAY_BUFFER, rocksArray[i].vertexBuffer);
		gl.vertexAttribPointer(program.vertexPositionAttribute, rocksArray[i].vertexBuffer.itemSize, gl.FLOAT, false, 0, 0);
		gl.bindBuffer(gl.ARRAY_BUFFER, rocksArray[i].textureBuffer);
		gl.vertexAttribPointer(program.textureCoordAttribute, rocksArray[i].textureBuffer.itemSize, gl.FLOAT, false, 0, 0);

		gl.bindBuffer(gl.ARRAY_BUFFER, rocksArray[i].normalBuffer);
		gl.vertexAttribPointer(program.vertexNormalAttribute, rocksArray[i].normalBuffer.itemSize, gl.FLOAT, false, 0, 0);
			
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, rocksArray[i].indexBuffer);		
		*/
		prepare_object_rendering(rocksArray[i])
		gl.uniform1i(program.textureUniform, 7);
		//gl.uniform4f(program.lightDir, gLightDir[0], gLightDir[1], gLightDir[2], gLightDir[3]);


		var rockTrans = utils.MakeScaleMatrix(rockResize);
		rockTrans = utils.multiplyMatrices(utils.MakeRotateYMatrix(rockRotationsArray[i]), rockTrans);
		var rockx = rockPositionsArray[i][0];
		var rocky = 0;
		var rockz = rockPositionsArray[i][1];
		WVPmatrix = utils.multiplyMatrices(projectionMatrix, utils.multiplyMatrices(utils.MakeTranslateMatrix(rockx, rocky, rockz), rockTrans));
		gl.uniformMatrix4fv(program.WVPmatrixUniform, gl.FALSE, utils.transposeMatrix(WVPmatrix));
		gl.uniformMatrix4fv(program.NmatrixUniform, gl.FALSE, utils.transposeMatrix(utils.invertMatrix(utils.transposeMatrix(rockTrans))));
		gl.uniformMatrix4fv(program.WMat, gl.FALSE, utils.transposeMatrix(utils.multiplyMatrices(utils.MakeTranslateMatrix(rockx, rocky, rockz), rockTrans)));
		gl.drawElements(gl.TRIANGLES, rocksArray[i].indexBuffer.numItems, gl.UNSIGNED_SHORT, 0);

	}

}

/** Generate meshes for the rocks */
function initRocks() {
	for (i = 0; i < numRocks; i++) {
		rock1[i] = new OBJ.Mesh(rockObjStr);
		OBJ.initMeshBuffers(gl, rock1[i]);
		rock2[i] = new OBJ.Mesh(rockObjStr);
		OBJ.initMeshBuffers(gl, rock2[i]);
	}
}

/** Function that initialize rock positions at the start of the game; 
 * this function MUST be called only once per game */
function startingRockBuffer() {
	isStarting = false;
	position2 = generateRockPositionOnMatrix((1) * 200, (1) * 200 + 200, numRocks);
	rotation2 = generateRockRotationOnMatrix(numRocks, rocksCol2, position2);

	position1 = generateRockPositionOnMatrix((0) * 200, (0) * 200 + 200, numRocks);
	rotation1 = generateRockRotationOnMatrix(numRocks, rocksCol1, position1);
	//da chiamare sempre e comunque anche senza modifiche
	generateRock(position1, rotation1, numRocks, rock1)
	generateRock(position2, rotation2, numRocks, rock2)

}

/**
 * Function to generate new rocks after the boat has reached the selected checkpoint
 * 
 * @param {boolean} isEven true if sectionNum is even, false otherwise
 * @param {boolean} isSectionChanged true if the boat has reached the checkpoint, false otherwise
 * @param {number} sectionNum int value representing the current section the boat is in
 */
function rockBuffer(isEven, isSectionChanged, sectionNum) {
	if (isSectionChanged) {
		if (isEven) {
			//sono in una sezione pari e genero una sezione dispari
			position2 = generateRockPositionOnMatrix((sectionNum + 1) * 200, (sectionNum + 1) * 200 + 200, numRocks);
			rotation2 = generateRockRotationOnMatrix(numRocks, rocksCol2, position2);
		} else {
			//sono in una sezione dispari e genero una sezione pari
			position1 = generateRockPositionOnMatrix((sectionNum + 1) * 200, (sectionNum + 1) * 200 + 200, numRocks);
			rotation1 = generateRockRotationOnMatrix(numRocks, rocksCol1, position1);
		}
	}
	generateRock(position1, rotation1, numRocks, rock1)
	generateRock(position2, rotation2, numRocks, rock2)

}

/** Initialize square matrices for rocks */
function initRock() {
	for (let i = 0; i < 200; i++) {
		rocksCol1[i] = [];
		rocksCol2[i] = [];
		for (let j = 0; j < 200; j++) {
			rocksCol1[i][j] = { "X": null, "Z": null, "angle": null };
			rocksCol2[i][j] = { "X": null, "Z": null, "angle": null };
		}
	}
}


/*
#############################
##       COLLISIONS        ##
#############################
*/

/** dimensions X and Z of the rock model without modifications */
var rockBaseDimensions = [10.029, 5.886];

/** dimensions X and Z of the boat model without modifications */
var boatBaseDimensions = [1137.463, 240.86];

/**
 * Perform the dot product of two segment in 2D-space
 * 
 * @param {array} firstVector 2 endpoints of the first segment
 * @param {array} secondVector 2 endpoints of the second segment
 * 
 * @returns the dot product between firstVector and secondVector
 */
function dotProduct2D(firstVector, secondVector) {
	let firstX = firstVector[0];
	let firstZ = firstVector[1];
	let secondX = secondVector[0];
	let secondZ = secondVector[1];

	return (firstX * secondX + firstZ * secondZ);
}

/**
 * Compute the normalization of the provided 2D vector
 * 
 * @param {number} x X coordinate of the vector
 * @param {number} z Z coordinate of the vector
 */
function normalizeVector2D(x, z) {
	var normalized = [];

	var length = Math.sqrt(x * x + z * z);

	normalized = [(x / length), (z / length)];

	return normalized;
}

/**
 * build the list of verteces of a rectangle enclosing the boat
 * @param {number} centerX the X coordinate of the center of the rectangle to build
 * @param {number} centerZ the Z coordinate of the center of the rectangle to build
 * @param {number} angle the current rotation angle of the boat
 * @returns an array containing the list of verteces starting from top-left corner and going clockwise.
 */
function buildRectangleBoat(centerX, centerZ, angle) {
	let boatLength = boatBaseDimensions[0] * boatResize;
	let boatWidth = boatBaseDimensions[1] * boatResize;

	var rectangleVerteces;
	var tempX, tempZ, rotatedX, rotatedZ;
	let sin;

	if (floatComparison(angle, 0.0, "<")) {
		sin = Math.sin(get_angle(360.0 + angle));
	} else {
		sin = Math.sin(get_angle(angle));
	}

	let cos = Math.cos(get_angle(angle));

	let topLeftCorner;
	tempX = -boatWidth / 2;
	tempZ = boatLength / 2;
	rotatedX = tempX * cos - tempZ * sin;
	rotatedZ = tempX * sin + tempZ * cos;
	topLeftCorner = [(rotatedX + centerX), (rotatedZ + centerZ)];

	let topRightCorner = [];
	tempX = boatWidth / 2;
	tempZ = boatLength / 2;
	rotatedX = tempX * cos - tempZ * sin;
	rotatedZ = tempX * sin + tempZ * cos;
	topRightCorner = [(rotatedX + centerX), (rotatedZ + centerZ)];

	let bottomRightCorner = [];
	tempX = boatWidth / 2;
	tempZ = -boatLength / 2;
	rotatedX = tempX * cos - tempZ * sin;
	rotatedZ = tempX * sin + tempZ * cos;
	bottomRightCorner = [(rotatedX + centerX), (rotatedZ + centerZ)];

	let bottomLeftCorner = [];
	tempX = -boatWidth / 2;
	tempZ = -boatLength / 2;
	rotatedX = tempX * cos - tempZ * sin;
	rotatedZ = tempX * sin + tempZ * cos;
	bottomLeftCorner = [(rotatedX + centerX), (rotatedZ + centerZ)];


	rectangleVerteces = [topLeftCorner, topRightCorner, bottomRightCorner, bottomLeftCorner];

	return rectangleVerteces;
}

/**
 * build the list of verteces of a rectangle enclosing the rock
 * @param {number} rockCenterX X coordinate of the center of the rock
 * @param {number} rockCenterZ Z coordinate of the center of the rock
 * @param {number} rockAngle angular coordinate of the rock. Dom = [0, 360]
 * @returns an array containing the list of verteces starting from top-left corner and going clockwise.
 */
function buildRectangleRock(rockCenterX, rockCenterZ, rockAngle) {
	var rectangleVerteces;

	let correctionCoefficient = 0.3;

	let rockLength = rockBaseDimensions[1] * rockResize * correctionCoefficient;
	let rockWidth = rockBaseDimensions[0] * rockResize * correctionCoefficient;

	var tempX, tempZ, rotatedX, rotatedZ;
	let sin = Math.sin(get_angle(rockAngle));
	let cos = Math.cos(get_angle(rockAngle));

	let topLeftCorner = [];
	tempX = -rockWidth / 2;
	tempZ = rockLength / 2;
	rotatedX = tempX * cos - tempZ * sin;
	rotatedZ = tempX * sin + tempZ * cos;
	topLeftCorner = [(rotatedX + rockCenterX), (rotatedZ + rockCenterZ)];

	let topRightCorner = [];
	tempX = rockWidth / 2;
	tempZ = rockLength / 2;
	rotatedX = tempX * cos - tempZ * sin;
	rotatedZ = tempX * sin + tempZ * cos;
	topRightCorner = [(rotatedX + rockCenterX), (rotatedZ + rockCenterZ)];

	let bottomRightCorner = [];
	tempX = rockWidth / 2;
	tempZ = -rockLength / 2;
	rotatedX = tempX * cos - tempZ * sin;
	rotatedZ = tempX * sin + tempZ * cos;
	bottomRightCorner = [(rotatedX + rockCenterX), (rotatedZ + rockCenterZ)];


	let bottomLeftCorner = [];
	tempX = -rockWidth / 2;
	tempZ = -rockLength / 2;
	rotatedX = tempX * cos - tempZ * sin;
	rotatedZ = tempX * sin + tempZ * cos;
	bottomLeftCorner = [(rotatedX + rockCenterX), (rotatedZ + rockCenterZ)];


	rectangleVerteces = [topLeftCorner, topRightCorner, bottomRightCorner, bottomLeftCorner];
	return rectangleVerteces;
}

/**
 * Apply the SAT theorem to boat and the selected rock
 * 
 * @param {array} boatVertices list of verteces of the rectangle of the boat
 * @param {array} rockVertices list of verteces of the rectangle of the rock
 * 
 * @returns true if the boat and the rock are colliding, false otherwise
 */
function separatingAxisTheorem(boatVertices, rockVertices) {
	let collide = true;
	let notCollide = false;

	let axes = [
		[boatVertices[1][0] - boatVertices[0][0], boatVertices[1][1] - boatVertices[0][1]],
		[boatVertices[1][0] - boatVertices[2][0], boatVertices[1][1] - boatVertices[2][1]],
		[rockVertices[1][0] - rockVertices[0][0], rockVertices[1][1] - rockVertices[0][1]],
		[rockVertices[1][0] - rockVertices[2][0], rockVertices[1][1] - rockVertices[2][1]]
	];

	for (let i = 0; i < axes.length; i++) {
		const axis = normalizeVector2D(axes[i][0], axes[i][1]);

		var boatVertOnAxis = [
			(dotProduct2D(axis, boatVertices[0])),
			(dotProduct2D(axis, boatVertices[1])),
			(dotProduct2D(axis, boatVertices[2])),
			(dotProduct2D(axis, boatVertices[3]))
		];

		var rockVertOnAxis = [
			(dotProduct2D(axis, rockVertices[0])),
			(dotProduct2D(axis, rockVertices[1])),
			(dotProduct2D(axis, rockVertices[2])),
			(dotProduct2D(axis, rockVertices[3]))
		];

		var bMax = boatVertOnAxis[0];
		var bMin = boatVertOnAxis[0];
		var rMax = rockVertOnAxis[0];
		var rMin = rockVertOnAxis[0];

		for (let i = 1; i < boatVertOnAxis.length; i++) {
			const boat = boatVertOnAxis[i];
			const rock = rockVertOnAxis[i];

			if (floatComparison(boat, bMax, ">")) {
				bMax = boat;
			}

			if (floatComparison(boat, bMin, "<")) {
				bMin = boat;
			}

			if (floatComparison(rock, rMax, ">")) {
				rMax = rock;
			}

			if (floatComparison(rock, rMin, "<")) {
				rMin = rock;
			}
		}

		// check condition
		// if two object are separated along one axis, then they are not colliding
		// if two object are separated along one axis, then this method can saftly conclude computation,
		// returning the requested value
		var separated = !(floatComparison(rMax, bMin, ">") && floatComparison(rMin, bMax, "<"));

		//(floatComparison(bMax, rMin, "<")) || (floatComparison(rMax, bMin, "<"));

		if (separated) {
			return notCollide;
		}
	}

	return collide;
}

/**
 * Perform a bound check in rockCol1 and rockCol2 matrices
 * 
 * @param {number} x X value to check
 * @param {number} z Z value to check
 * 
 * @returns true if the point is in-bound, false otherwise
 */
function checkBoundsMatrix(x, z) {
	if (x >= 0 && x < 200 && z >= 0 && z < 200) {
		return true;
	} else {
		return false;
	}
}

/**
 * Retrieve the list of possible colliding rocks given the actual position of the boat
 * 
 * @param {number} boatX position over X axis (unrounded) of the boat 
 * @param {number} boatZ position over Z axis (unrounded) of the boat
 * 
 * @returns the list of possible colliding rocks
 */
function gatherRocks(boatX, boatZ) {
	var roundedZ = Math.round(boatZ);

	var offsettedX = 100 - Math.round(boatX);
	var offsettedZ = roundedZ % 200;

	var rockSize = Math.round(rockBaseDimensions[0] * rockResize);

	var rocks = [];

	// choice between rock1 and rock2
	var rockMatrix;
	if ((Math.floor(getHundreds(roundedZ) / 2)) % 2 == 0) {
		rockMatrix = rocksCol1;
	} else {
		rockMatrix = rocksCol2;
	}

	let researchWidth = rockSize + 1;
	let researchRadius = Math.floor((researchWidth - 1) / 2);

	// if (rockSize % 2 == 0) {
	// 	researchWidth = rockSize + 2;
	// } else {
	// 	researchWidth = rockSize + 3;
	// }

	var startingPoint = {
		"X": Math.floor(offsettedX - researchRadius),
		"Z": Math.floor(offsettedZ - researchRadius)
	}

	for (let deltaX = 0; deltaX < (researchWidth + 2); deltaX++) {
		for (let deltaZ = 0; deltaZ < (researchWidth + 2); deltaZ++) {
			let elem;

			if (checkBoundsMatrix((startingPoint["X"] + deltaX), (startingPoint["Z"] + deltaZ))) {
				elem = rockMatrix[startingPoint["X"] + deltaX][startingPoint["Z"] + deltaZ];
			}

			if (elem) {
				if (elem["X"] != null) {
					rocks.push(elem);
				}
			}
		}
	}

	return rocks;
}

/**
 * check if the the boat collides with a rock
 * @param {number} posX the current X position of the boat
 * @param {number} posZ the current Z position of the boat 
 * @param {number} angle current orientation of the boat
 */
function checkDeath(posX, posZ, angle) {
	// build a rectangle around the center of the boat
	var boatRectangle = buildRectangleBoat(posX, posZ, angle);

	// get nearby rocks
	var nearbyRocks = gatherRocks(posX, posZ);
	//magic for gathering nearbyRocks

	// check collisions with the rock
	for (let i = 0; i < nearbyRocks.length; i++) {
		const rock = nearbyRocks[i];

		let rockX = rock["X"];
		let rockZ = rock["Z"];
		let rockAngle = rock["angle"];

		var rockRectangle = buildRectangleRock(rockX, rockZ, rockAngle);

		var collision = separatingAxisTheorem(boatRectangle, rockRectangle);

		if (collision) {
			// collision detected, launch the error function
			// console.log("COLLISION DETECTED");
			errDetected = true;

			//console.log("COLLISION: \nROCK: " /* + rockX + "," + rockZ + "," + rockAngle + ","  */+ rockRectangle +
			//	"\nBOAT: " /* + posX + "," + posZ + "," + angle + "," */ + boatRectangle);

			//var x = 2;
			alert2("YOU HAVE FAILED!!!!!!!", "", "Try Again");


		}
	}
}

/*
#############################
##         LIGHTS          ##
#############################
*/

/**
 * Compute the position of the prow based on the rotation of the boat
 * 
 * @param {number} Yrotation rotation of the boat along Y axis
 * 
 * @returns the position of the prow (= prua) of the boat
 */
function get_boat_prow(Yrotation) {
	var prowPos = (boatBaseDimensions[0] * boatResize) - 5;
	var prowX = prowPos * Math.sin(get_angle(Yrotation));
	var prowZ = prowPos * Math.cos(get_angle(Yrotation));

	return [prowX, prowZ];
}

/**
  * Compute the light vector generated by the Sun (directional light)
  * 
  * @param {number} hour Value indicating the hour of the day.
  * 
  * @returns {number[]} the computed light vector
  */
 function HourToSunlight(hour) {
	var angle = (hour - 6.0) * 15.0;
	var lightVec = [-1.0, 0.0, 0.0, 1.0];

	if (angle >= 0.0 && angle <= 180) {
		var ZRotation = utils.MakeRotateZMatrix(-angle);
		lightVec = utils.multiplyMatrixVector(ZRotation, lightVec);
	} else {
		if (angle >= 350.0) {
			lightVec[3] = 1.0 - utils.clamp((360.0 - angle) / 10.0, 0.0, 0.7)
		} else {
			if (angle > 180) {
				lightVec[0] = 1.0;
				lightVec[3] = 1.0 - utils.clamp((angle - 180.0) / 10.0, 0.0, 0.7)
			} else {
				lightVec[3] = 1.0 - utils.clamp((-angle) / 10.0, 0.0, 0.7)
			}
		}
	}

	return lightVec;
}

/**
 * Compute the color from a provided string
 * 
 * @param {string} hexstring string value storing the RGB informations.
 * 
 * @returns {number[]} the computed RGB values.
 */
function parseColor(hexstring) {
	var fullhex = hexstring.substring(0, 7);

	R = parseInt(fullhex.substring(0, 2), 16) / 255;
	G = parseInt(fullhex.substring(2, 4), 16) / 255;
	B = parseInt(fullhex.substring(4, 6), 16) / 255;
	return [R, G, B]
}

/**
 * Computed the position of the Moon (point light).
 * 
 * @param {number} hour	Value indicating the hour of the day. 
 * 
 * @returns {number[]} moon Position in an array of 3 elements X, Y, Z.
 */
function moonPosition(hour) {
	var moonPos = [1000.0, 0.0, 200];
	var angle = (hour - 6.0) * 15.0;
	var r = 100;

	moonPos[0] = r * Math.cos(angle * Math.PI / 180);
	moonPos[1] = -r * Math.sin(angle * Math.PI / 180);
	moonPos[2] = boatZ + 100;
	
	return moonPos;
}

/** Binds the light inside webgl shaders */
function prepare_light() {
	gl.uniform4f(program.lightDir, gLightDir[0], gLightDir[1], gLightDir[2], gLightDir[3]);
	gl.uniform3f(program.moonPos, moonPos[0], moonPos[1], moonPos[2]);
	gl.uniform1f(program.LampOn, LampOn.checked);
	gl.uniform4f(program.LampColor, LampColor[0], LampColor[1], LampColor[2], LampColor[3]);
	gl.uniform1f(program.LampConeIn, LampConeIn);
	gl.uniform3f(program.LampDir, LampDir[0], LampDir[1], LampDir[2]);
	gl.uniform1f(program.LampConeOut, LampConeOut);
	gl.uniform1f(program.LampTarget, LampTarget);
	gl.uniform1f(program.LampDecay, LampDecay);
	let prowPos = get_boat_prow(boatAngle);
	gl.uniform3f(program.LampPos, boatX + prowPos[0], boatY + 1, boatZ + prowPos[1]);
}

/*
#############################
##          MISC           ##
#############################
*/

/**
 * Sets up the common pre-rendering calls for the passed object
 * @param {OBJ} object the object to be rendered
 */
function prepare_object_rendering(object) {
	gl.bindBuffer(gl.ARRAY_BUFFER, object.vertexBuffer);
	gl.vertexAttribPointer(program.vertexPositionAttribute, object.vertexBuffer.itemSize, gl.FLOAT, false, 0, 0);
	gl.bindBuffer(gl.ARRAY_BUFFER, object.textureBuffer);
	gl.vertexAttribPointer(program.textureCoordAttribute, object.textureBuffer.itemSize, gl.FLOAT, false, 0, 0);
	gl.bindBuffer(gl.ARRAY_BUFFER, object.normalBuffer);
	gl.vertexAttribPointer(program.vertexNormalAttribute, object.normalBuffer.itemSize, gl.FLOAT, false, 0, 0);
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, object.indexBuffer);
}

/**
 * Generates the track elements on which the boat rides.
 * It is also responsible for moving the track in order not to go out of bounds
 */
function generateTrack() {
	// draws the skybox

	if (boatZ > trackZpos[0] + 150) {
		trackZpos = [trackZpos[1], trackZpos[2], trackZpos[2] + 200]
	}
	for (var i = 0; i < 3; i++) {
		prepare_object_rendering(skybox);
		var scaleMat = utils.MakeScaleNuMatrix(trackScale, trackScale, trackScale);
		WVPmatrix = utils.multiplyMatrices(projectionMatrix, utils.multiplyMatrices(utils.MakeTranslateMatrix(0, 0, trackZpos[i]), scaleMat));
		gl.uniformMatrix4fv(program.WVPmatrixUniform, gl.FALSE, utils.transposeMatrix(WVPmatrix));
		gl.uniformMatrix4fv(program.NmatrixUniform, gl.FALSE, utils.transposeMatrix(utils.invertMatrix(utils.transposeMatrix(scaleMat))));
		gl.uniformMatrix4fv(program.WMat, gl.FALSE, utils.transposeMatrix(utils.multiplyMatrices(utils.MakeTranslateMatrix(0, 0, trackZpos[i]), scaleMat)));
		gl.uniform1i(program.textureUniform, 1);
		gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
	}
}

/**
 * Returns the hundreds contained in the numeric expression 
 * 
 * @param {number} number a numeric expression
 */
function getHundreds(number) {
	return Math.trunc(number / 100);
}

/**
 * collection of comparison results of the main bool operations.
 * 
 * @returns either true or false based on the numbers and the comparison to compute
 * @param {number} num1 first number to compare
 * @param {number} num2 second number to compare
 * @param {string} cComparison comparison to execute
 */
function floatComparison(num1, num2, cComparison) {
	switch (cComparison) {
		case ">":
			return parseFloat(num1) > parseFloat(num2);

		case "<":
			return parseFloat(num1) < parseFloat(num2);

		case ">=":
			return parseFloat(num1) >= parseFloat(num2);

		case "<=":
			return parseFloat(num1) <= parseFloat(num2);

		case "==":
			return parseFloat(num1) == parseFloat(num2);

		case "===":
			return parseFloat(num1) === parseFloat(num2);

		default:
			return false;
	}
}

/**
 * Compute the world, view and projection matrices for the game.
 * 
 * @param {number} boatX coordinate X of the boat
 * @param {number} boatY coordinate Y of the boat
 * @param {number} boatZ coordinate Z of the boat
 * @param {number} boatDir angle wrt Y axis of the boat
 * @param {number} camX coordinate X of the camera
 * @param {number} camY coordinate Y of the camera
 * @param {number} camZ coordinate Z of the camera
 */
function worldViewProjection(boatX, boatY, boatZ, boatDir, camX, camY, camZ) {
	var world = [1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1];
	var view = [1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1];

	var V_z = [camX - boatX, camY - boatY, camZ - boatZ];

	V_z = utils.normalizeVector3(V_z);

	var u = [0, 1, 0];

	var V_x = utils.crossVector(u, V_z);

	V_x = utils.normalizeVector3(V_x);

	var V_y = utils.crossVector(V_z, V_x);

	var M_c = [
		V_x[0], V_y[0], V_z[0], camX,
		V_x[1], V_y[1], V_z[1], camY,
		V_x[2], V_y[2], V_z[2], camZ,
		0, 0, 0, 1
	];

	view = utils.invertMatrix(M_c);

	var R = utils.MakeRotateYMatrix(boatDir);
	var T = utils.MakeTranslateMatrix(boatX, boatY, boatZ);

	world = utils.multiplyMatrices(R, world);
	world = utils.multiplyMatrices(T, world);
	return [world, view];
}


/*
#############################
##          DRAW           ##
#############################
*/

/**
 * Handles all the drawings in the world space
 */
function drawScene() {
	if (!errDetected) {
		gLightDir = HourToSunlight(TimeOfDay.value);
		moonPos = moonPosition(TimeOfDay.value);

		if (!PartyMode.checked) {
			LampColor = parseColor(LampHex.value.substring(1, 7));
		} else {
			var change = Math.random();
			var color = Math.floor(Math.random() * 3);
			PartyColor[color] = (PartyColor[color] + change) % 1.0;
			LampColor = PartyColor;
		}

		LampDir = utils.multiplyMatrixVector(utils.MakeRotateYMatrix(boatAngle), [0.0, 0.0, -1.0, 1.0]);
		LampColor[3] = 1.0;
		
		// compute time interval
		var currentTime = (new Date).getTime();
		var deltaT;
		if (lastUpdateTime) {
			deltaT = (currentTime - lastUpdateTime) / 1000.0;
		} else {
			deltaT = 1 / 50;
		}
		lastUpdateTime = currentTime;

		// the generated matrices depend on the boat's position and direction, 
		// the world is a rotation by boatDir degrees and translation over to the boat's coordinates
		wvpMats = worldViewProjection(boatX, boatY, boatZ, boatAngle, cx, cy, cz);
		
		viewMatrix = wvpMats[1];

		perspectiveMatrix = projection = utils.MakePerspective(60, aspectRatio, 0.1, 2000.0);

		// dvecmat is actually the world matrix
		dvecmat = wvpMats[0];

		// computing boat velocities
		boatAngVel = mAS * deltaT * rvy;

		//  TODO: enrich the description here
		vz = -vz;
		// = 0.8 * deltaT * 60 * vz;
		if (vz > 0.1) {
			if (preVz > 0.1) {
				boatLinAcc = boatLinAcc + ATur * deltaT;

				if (boatLinAcc > mAT) boatLinAcc = mAT;
			} else if (boatLinAcc < sAT) boatLinAcc = sAT;
		} else if (vz > -0.1) {
			boatLinAcc = boatLinAcc - ATdr * deltaT * Math.sign(boatLinAcc);
			if (Math.abs(boatLinAcc) < 0.001) boatLinAcc = 0.0;
		} else {
			if (preVz < 0.1) {
				boatLinAcc = boatLinAcc - BTur * deltaT;
				if (boatLinAcc < -mBT) boatLinAcc = -mBT;
			}
			else if (boatLinAcc > -sBT) boatLinAcc = -sBT;
		}

		preVz = vz;
		vz = -vz;
		boatLinVel = boatLinVel * Math.exp(Tfric * deltaT) - deltaT * boatLinAcc;

		if (Math.abs(boatLinVel) < 0.01 && !vz) {
			boatLinVel = 0.0;
		}

		// Magic for moving the boat
		worldMatrix = utils.multiplyMatrices(dvecmat, utils.MakeScaleMatrix(1.0));

		//axises transformed by the world matrix (boat position)
		xaxis = [dvecmat[0], dvecmat[4], dvecmat[8]]; 
		yaxis = [dvecmat[1], dvecmat[5], dvecmat[9]];
		zaxis = [dvecmat[2], dvecmat[6], dvecmat[10]];

		if (rvy != 0) {
			qy = Quaternion.fromAxisAngle(yaxis, utils.degToRad(boatAngVel));

			// New world matrix after the boat rotation has been computed according to angular speed
			newDvecmat = utils.multiplyMatrices(qy.toMatrix4(), dvecmat);
			R11 = newDvecmat[10]; R12 = newDvecmat[8]; R13 = newDvecmat[9];
			R21 = newDvecmat[2]; R22 = newDvecmat[0]; R23 = newDvecmat[1];
			R31 = newDvecmat[6]; R32 = newDvecmat[4]; R33 = newDvecmat[5];

			if ((R31 < 1) && (R31 > -1)) {
				theta = -Math.asin(R31);
				phi = Math.atan2(R32 / Math.cos(theta), R33 / Math.cos(theta));
				psi = Math.atan2(R21 / Math.cos(theta), R11 / Math.cos(theta));

			} else {
				phi = 0;
				if (R31 <= -1) {
					theta = Math.PI / 2;
					psi = phi + Math.atan2(R12, R13);
				} else {
					theta = -Math.PI / 2;
					psi = Math.atan2(-R12, -R13) - phi;
				}
			}
			
			boatAngle = psi / Math.PI * 180;

			// max rotation angle is 90 counterclockwise
			if (Math.round(parseFloat(boatAngle)) > parseFloat(90.0)) {
				boatAngle = 90.0;
			}

			//max rotation angle is -90 clockwise
			if (Math.round(parseFloat(boatAngle)) < parseFloat(0.0 - 90.0)) {
				boatAngle = 0.0 - 90.0;
			}
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

		// boat motion
		delta = utils.multiplyMatrixVector(dvecmat, [0, 0, boatLinVel, 0.0]);

		//bound the boat with X > -100
		if (boatX - delta[0] < -100 && delta[0] > 0) {
			delta[0] = 100.0 + boatX;
		}

		// bound the boat with X < 100
		if (boatX - delta[0] > 100 && delta[0] < 0) {
			delta[0] = boatX - 100.0;
		}

		boatX -= delta[0];
		if (getHundreds(boatZ) % 2 != 0 && getHundreds(boatZ - delta[2]) % 2 == 0 && delta[2] < 0) {
			newSector = true;
		}

		boatZ -= delta[2];

		projectionMatrix = utils.multiplyMatrices(perspectiveMatrix, viewMatrix);

		prepare_light();

		// draw rocks
		if (isStarting) {
			isStarting = false;
			startingRockBuffer();
		}

		if (newSector) {
			newSector = false;
			if (getHundreds(boatZ) > 0) {
				// sono in una posizione multipla di 200
				let isEven = ((getHundreds(boatZ) / 2) % 2 == 0);
				let isSectionChanged = true;
				let sectionNum = Math.floor(getHundreds(boatZ) / 2);
				rockBuffer(isEven, isSectionChanged, sectionNum);

			}
		} else {
			rockBuffer(null, false, null);
		}

		// draws the track
		generateTrack();

		// draws the skybox front
		prepare_object_rendering(skyboxFront);

		//translate the image of y: 30 z: 100 , rotated by 90 degree on the X axis and then scaled up by 200
		WVPmatrix = utils.multiplyMatrices(projectionMatrix, utils.multiplyMatrices(utils.MakeTranslateMatrix(0, 30, 1000 + boatZ), utils.multiplyMatrices(utils.MakeRotateXMatrix(-90), utils.MakeScaleMatrix(skyboxScale))));
		gl.uniformMatrix4fv(program.WVPmatrixUniform, gl.FALSE, utils.transposeMatrix(WVPmatrix));
		gl.uniformMatrix4fv(program.NmatrixUniform, gl.FALSE, utils.identityMatrix());
		gl.uniform1i(program.textureUniform, 3);
		gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);

		// draws the skybox back
		prepare_object_rendering(skyboxBack);
		//translate the image of y: 30 z: 100 , rotated by 90 degree on the X axis and then scaled up by 200
		WVPmatrix = utils.multiplyMatrices(projectionMatrix, utils.multiplyMatrices(utils.MakeTranslateMatrix(0, 30, -600 + boatZ), utils.multiplyMatrices(utils.multiplyMatrices(utils.MakeRotateYMatrix(180), utils.MakeRotateXMatrix(-90)), utils.MakeScaleMatrix(skyboxScale))));
		gl.uniformMatrix4fv(program.WVPmatrixUniform, gl.FALSE, utils.transposeMatrix(WVPmatrix));
		gl.uniformMatrix4fv(program.NmatrixUniform, gl.FALSE, utils.identityMatrix());
		gl.uniform1i(program.textureUniform, 9);
		gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);

		// draws the skybox right of ship (left world)
		prepare_object_rendering(skyboxLeft);
		//translate the image of y: 30 x: -1000 , rotated by 90 degree on the X and y axis and then scaled up by 500
		WVPmatrix = utils.multiplyMatrices(projectionMatrix, utils.multiplyMatrices(utils.MakeTranslateMatrix(-800, 30, 200 + boatZ), utils.multiplyMatrices(utils.multiplyMatrices(utils.MakeRotateYMatrix(-90), utils.MakeRotateXMatrix(-90)), utils.MakeScaleMatrix(skyboxScale))));
		gl.uniformMatrix4fv(program.WVPmatrixUniform, gl.FALSE, utils.transposeMatrix(WVPmatrix));
		gl.uniformMatrix4fv(program.NmatrixUniform, gl.FALSE, utils.identityMatrix());
		gl.uniform1i(program.textureUniform, 4);
		gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);

		// draws the skybox left of ship (right world)
		prepare_object_rendering(skyboxRight);
		//translate the image of y: 30 x: 100 , rotated by 90 degree on the X and Y axis and then scaled up by 200
		WVPmatrix = utils.multiplyMatrices(projectionMatrix, utils.multiplyMatrices(utils.MakeTranslateMatrix(800, 30, 200 + boatZ), utils.multiplyMatrices(utils.multiplyMatrices(utils.MakeRotateYMatrix(90), utils.MakeRotateXMatrix(-90)), utils.MakeScaleMatrix(skyboxScale))));
		gl.uniformMatrix4fv(program.WVPmatrixUniform, gl.FALSE, utils.transposeMatrix(WVPmatrix));
		gl.uniformMatrix4fv(program.NmatrixUniform, gl.FALSE, utils.identityMatrix());
		gl.uniform1i(program.textureUniform, 5);
		gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);

		// draws the skybox top
		prepare_object_rendering(skyboxTop);
		//translate the image of y: 170  , rotated by 90 degree on the X axis and scaled up by 200
		WVPmatrix = utils.multiplyMatrices(projectionMatrix, utils.multiplyMatrices(utils.MakeTranslateMatrix(0, 630, 200 + boatZ), utils.multiplyMatrices(utils.MakeRotateXMatrix(180), utils.MakeScaleMatrix(skyboxScale))));
		gl.uniformMatrix4fv(program.WVPmatrixUniform, gl.FALSE, utils.transposeMatrix(WVPmatrix));
		gl.uniformMatrix4fv(program.NmatrixUniform, gl.FALSE, utils.identityMatrix());
		gl.uniform1i(program.textureUniform, 6);
		gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);


		// draws the skybox bottom
		prepare_object_rendering(skyboxBottom)
		//translate the image of y: -230, scaled up by 200
		WVPmatrix = utils.multiplyMatrices(projectionMatrix, utils.multiplyMatrices(utils.MakeTranslateMatrix(0, -770, 200 + boatZ), utils.multiplyMatrices(utils.MakeRotateYMatrix(180), utils.MakeScaleMatrix(skyboxScale))));
		gl.uniformMatrix4fv(program.WVPmatrixUniform, gl.FALSE, utils.transposeMatrix(WVPmatrix));
		gl.uniformMatrix4fv(program.NmatrixUniform, gl.FALSE, utils.identityMatrix());
		gl.uniform1i(program.textureUniform, 8);
		gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);

		// draws the ship
		prepare_object_rendering(boatMesh);


		// Aligning the ship
		var alignMatrix = utils.MakeScaleMatrix(0.01);
		alignMatrix = utils.multiplyMatrices(alignMatrix, utils.MakeRotateYMatrix(90));

		WVPmatrix = utils.multiplyMatrices(utils.multiplyMatrices(projectionMatrix, worldMatrix), alignMatrix);
		gl.uniformMatrix4fv(program.WVPmatrixUniform, gl.FALSE, utils.transposeMatrix(WVPmatrix));
		gl.uniformMatrix4fv(program.NmatrixUniform, gl.FALSE, utils.transposeMatrix(utils.multiplyMatrices(worldMatrix, alignMatrix)));
		gl.uniformMatrix4fv(program.WMat, gl.FALSE, utils.transposeMatrix(utils.multiplyMatrices(worldMatrix, alignMatrix)));
		gl.uniform1i(program.textureUniform, 0);
		gl.drawElements(gl.TRIANGLES, boatMesh.indexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
		window.requestAnimationFrame(drawScene);

		checkDeath(boatX, boatZ, boatAngle);
	}
}
