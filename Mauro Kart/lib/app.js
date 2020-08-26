var canvas;
var gl = null,
	program = null,
	carMesh = null,
	skybox = null,
	imgtx = null,
	skyboxLattx = null,
	skyboxTbtx = null;
	skyboxFrtx = null;
	skyboxTptx = null;
	skyboxLftx = null;
	skyboxRgtx = null;
var projectionMatrix, 
	perspectiveMatrix,
	viewMatrix,
	worldMatrix,
	gLightDir,
	skyboxWM;


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


var lookRadius = 10.0;


var keys = [];
 

var vz = 0.0;
var rvy = 0.0;

var keyFunctionDown =function(e) {
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

var keyFunctionUp = async function(e) {
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
  		keys[e.keyCode] = false;
		switch(e.keyCode) {
	  		case 37:
//console.log("KeyDown  - Dir LEFT");
		rvy = rvy - 1.0;
		//ruota la barca di carAngle gradi indietro
		//carAngle;
		var numberOfDelta = carAngle*5;
		var deltaAngle = carAngle/numberOfDelta;
		//console.log(carAngle)
		for(var i = 0; i<numberOfDelta && Math.round(parseFloat(carAngle)) > parseFloat(0.0);i++){
			
			carAngle = (carAngle-deltaAngle);
			console.log(carAngle);

			await sleep(2000/numberOfDelta);
		}

		//carAngle = 0.0;

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

		var numberOfDelta = 0.0-carAngle*5; // TOP QUALITY MATH HERE
		var deltaAngle = carAngle/numberOfDelta;
		//console.log(carAngle)
		for(var i = 0; i<numberOfDelta && Math.round(parseFloat(carAngle)) < parseFloat(0.0);i++){
			
			carAngle = (carAngle-deltaAngle);
			//console.log(carAngle);

			await sleep(2000/numberOfDelta);
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
		skybox = new OBJ.Mesh(trackNfieldObjStr);

		// Loading other faces of the skybox
		skyboxFront = new OBJ.Mesh(trackNfieldObjStr);
		skyboxLeft = new OBJ.Mesh(trackNfieldObjStr);
		skyboxRight = new OBJ.Mesh(trackNfieldObjStr);
		skyboxTop = new OBJ.Mesh(trackNfieldObjStr);
		

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
		
		OBJ.initMeshBuffers(gl, carMesh);
		OBJ.initMeshBuffers(gl, skybox);
		OBJ.initMeshBuffers(gl, skyboxFront);
		OBJ.initMeshBuffers(gl, skyboxLeft);
		OBJ.initMeshBuffers(gl, skyboxRight);
		OBJ.initMeshBuffers(gl, skyboxTop);

		
		
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
		gLightDir = [-1.0, 0.0, 0.0, 0.0];

		skyboxWM = utils.multiplyMatrices(utils.MakeRotateZMatrix(30), utils.MakeRotateYMatrix(135));
		gLightDir = utils.multiplyMatrixVector(skyboxWM, gLightDir);

		


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
var skyboxScale = 800
var carLinAcc = 0.0;
var carLinVel = 0.0;
var carAngVel = 0.0;
var preVz = 0;

function drawScene() {
		// compute time interval
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


		// //re align boat
		// if(keys[37] == false){
		// 	carAngle = carAngle*((lastUpdateTime+3000)-currentTime)
		// }

		viewMatrix = wvpMats[1];

		perspectiveMatrix = projection = utils.MakePerspective(60, aspectRatio, 0.1, 1000.0);

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
		xaxis = [dvecmat[0],dvecmat[4],dvecmat[8]];
		yaxis = [dvecmat[1],dvecmat[5],dvecmat[9]];
		zaxis = [dvecmat[2],dvecmat[6],dvecmat[10]];
		
		if(rvy != 0) {	
			qy = Quaternion.fromAxisAngle(yaxis, utils.degToRad(carAngVel));
			newDvecmat = utils.multiplyMatrices(qy.toMatrix4(), dvecmat);
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

		projectionMatrix = utils.multiplyMatrices(perspectiveMatrix, viewMatrix);		

		// draws the skybox
		gl.bindBuffer(gl.ARRAY_BUFFER, skybox.vertexBuffer);
		gl.vertexAttribPointer(program.vertexPositionAttribute, skybox.vertexBuffer.itemSize, gl.FLOAT, false, 0, 0);
	    gl.bindBuffer(gl.ARRAY_BUFFER, skybox.textureBuffer);
	    gl.vertexAttribPointer(program.textureCoordAttribute, skybox.textureBuffer.itemSize, gl.FLOAT, false, 0, 0);
		
		gl.bindBuffer(gl.ARRAY_BUFFER, skybox.normalBuffer);
		gl.vertexAttribPointer(program.vertexNormalAttribute, skybox.normalBuffer.itemSize, gl.FLOAT, false, 0, 0);

		gl.uniform4f(program.lightDir, gLightDir[0], gLightDir[1], gLightDir[2], 1.0);
		 
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, skybox.indexBuffer);		
		WVPmatrix = utils.multiplyMatrices(projectionMatrix,utils.MakeScaleNuMatrix(10.0,10.0,1000.0));
		gl.uniformMatrix4fv(program.WVPmatrixUniform, gl.FALSE, utils.transposeMatrix(WVPmatrix));
		gl.uniformMatrix4fv(program.NmatrixUniform, gl.FALSE, utils.identityMatrix());
		gl.uniform1i(program.textureUniform, 1);
		gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 12);
		//gl.uniform1i(program.textureUniform, 1);
		//gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);

		// draws the skybox front
		
		gl.bindBuffer(gl.ARRAY_BUFFER, skyboxFront.vertexBuffer);
		gl.vertexAttribPointer(program.vertexPositionAttribute, skyboxFront.vertexBuffer.itemSize, gl.FLOAT, false, 0, 0);
	    gl.bindBuffer(gl.ARRAY_BUFFER, skyboxFront.textureBuffer);
	    gl.vertexAttribPointer(program.textureCoordAttribute, skyboxFront.textureBuffer.itemSize, gl.FLOAT, false, 0, 0);
		gl.bindBuffer(gl.ARRAY_BUFFER, skyboxFront.normalBuffer);
		gl.vertexAttribPointer(program.vertexNormalAttribute, skyboxFront.normalBuffer.itemSize, gl.FLOAT, false, 0, 0);
		gl.uniform4f(program.lightDir, gLightDir[0], gLightDir[1], gLightDir[2], 1.0);
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, skyboxFront.indexBuffer);
		//translate the image of y: 30 z: 100 , rotated by 90 degree on the X axis and then scaled up by 200
		WVPmatrix = utils.multiplyMatrices(projectionMatrix,utils.multiplyMatrices(utils.MakeTranslateMatrix(0,30,1000),utils.multiplyMatrices( utils.MakeRotateXMatrix(-90) ,utils.MakeScaleMatrix(skyboxScale))));  		
		gl.uniformMatrix4fv(program.WVPmatrixUniform, gl.FALSE, utils.transposeMatrix(WVPmatrix));
		gl.uniformMatrix4fv(program.NmatrixUniform, gl.FALSE, utils.identityMatrix());
		gl.uniform1i(program.textureUniform, 3);
		gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);

		// draws the skybox left
		
		gl.bindBuffer(gl.ARRAY_BUFFER, skyboxLeft.vertexBuffer);
		gl.vertexAttribPointer(program.vertexPositionAttribute, skyboxLeft.vertexBuffer.itemSize, gl.FLOAT, false, 0, 0);
	    gl.bindBuffer(gl.ARRAY_BUFFER, skyboxLeft.textureBuffer);
	    gl.vertexAttribPointer(program.textureCoordAttribute, skyboxLeft.textureBuffer.itemSize, gl.FLOAT, false, 0, 0);
		gl.bindBuffer(gl.ARRAY_BUFFER, skyboxLeft.normalBuffer);
		gl.vertexAttribPointer(program.vertexNormalAttribute, skyboxLeft.normalBuffer.itemSize, gl.FLOAT, false, 0, 0);
		gl.uniform4f(program.lightDir, gLightDir[0], gLightDir[1], gLightDir[2], 1.0);
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, skyboxLeft.indexBuffer);

		//translate the image of y: 30 x: -1000 , rotated by 90 degree on the X and y axis and then scaled up by 500
		WVPmatrix = utils.multiplyMatrices(projectionMatrix,utils.multiplyMatrices(utils.MakeTranslateMatrix(-1000,30,0),utils.multiplyMatrices( utils.multiplyMatrices(utils.MakeRotateYMatrix(90), utils.MakeRotateXMatrix(-90)) ,utils.MakeScaleMatrix(skyboxScale))));  		
		gl.uniformMatrix4fv(program.WVPmatrixUniform, gl.FALSE, utils.transposeMatrix(WVPmatrix));
		gl.uniformMatrix4fv(program.NmatrixUniform, gl.FALSE, utils.identityMatrix());
		gl.uniform1i(program.textureUniform, 4);
		gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);

		// draws the skybox right
				
		gl.bindBuffer(gl.ARRAY_BUFFER, skyboxRight.vertexBuffer);
		gl.vertexAttribPointer(program.vertexPositionAttribute, skyboxRight.vertexBuffer.itemSize, gl.FLOAT, false, 0, 0);
		gl.bindBuffer(gl.ARRAY_BUFFER, skyboxRight.textureBuffer);
		gl.vertexAttribPointer(program.textureCoordAttribute, skyboxRight.textureBuffer.itemSize, gl.FLOAT, false, 0, 0);
		gl.bindBuffer(gl.ARRAY_BUFFER, skyboxRight.normalBuffer);
		gl.vertexAttribPointer(program.vertexNormalAttribute, skyboxRight.normalBuffer.itemSize, gl.FLOAT, false, 0, 0);
		gl.uniform4f(program.lightDir, gLightDir[0], gLightDir[1], gLightDir[2], 1.0);
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, skyboxRight.indexBuffer);

		//translate the image of y: 30 x: 100 , rotated by 90 degree on the X and Y axis and then scaled up by 200
		WVPmatrix = utils.multiplyMatrices(projectionMatrix,utils.multiplyMatrices(utils.MakeTranslateMatrix(1000,30,0),utils.multiplyMatrices( utils.multiplyMatrices(utils.MakeRotateYMatrix(-90), utils.MakeRotateXMatrix(-90)) ,utils.MakeScaleMatrix(skyboxScale))));  		
		gl.uniformMatrix4fv(program.WVPmatrixUniform, gl.FALSE, utils.transposeMatrix(WVPmatrix));
		gl.uniformMatrix4fv(program.NmatrixUniform, gl.FALSE, utils.identityMatrix());
		gl.uniform1i(program.textureUniform, 5);
		gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);

		// draws the skybox top
			
		gl.bindBuffer(gl.ARRAY_BUFFER, skyboxTop.vertexBuffer);
		gl.vertexAttribPointer(program.vertexPositionAttribute, skyboxTop.vertexBuffer.itemSize, gl.FLOAT, false, 0, 0);
		gl.bindBuffer(gl.ARRAY_BUFFER, skyboxTop.textureBuffer);
		gl.vertexAttribPointer(program.textureCoordAttribute, skyboxTop.textureBuffer.itemSize, gl.FLOAT, false, 0, 0);
		gl.bindBuffer(gl.ARRAY_BUFFER, skyboxTop.normalBuffer);
		gl.vertexAttribPointer(program.vertexNormalAttribute, skyboxTop.normalBuffer.itemSize, gl.FLOAT, false, 0, 0);
		gl.uniform4f(program.lightDir, gLightDir[0], gLightDir[1], gLightDir[2], 1.0);
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, skyboxTop.indexBuffer);

		//translate the image of y: 170  , rotated by 90 degree on the X axis and scaled up by 200
		WVPmatrix = utils.multiplyMatrices(projectionMatrix,utils.multiplyMatrices(utils.MakeTranslateMatrix(0,170,0),utils.multiplyMatrices( utils.MakeRotateXMatrix(180) ,utils.MakeScaleMatrix(200.0))));  		
		gl.uniformMatrix4fv(program.WVPmatrixUniform, gl.FALSE, utils.transposeMatrix(WVPmatrix));
		gl.uniformMatrix4fv(program.NmatrixUniform, gl.FALSE, utils.identityMatrix());
		gl.uniform1i(program.textureUniform, 6);
		gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);


		// draws the Ship
		gl.bindBuffer(gl.ARRAY_BUFFER, carMesh.vertexBuffer);
		gl.vertexAttribPointer(program.vertexPositionAttribute, carMesh.vertexBuffer.itemSize, gl.FLOAT, false, 0, 0);
	    gl.bindBuffer(gl.ARRAY_BUFFER, carMesh.textureBuffer);
	    gl.vertexAttribPointer(program.textureCoordAttribute, carMesh.textureBuffer.itemSize, gl.FLOAT, false, 0, 0);
		
		gl.bindBuffer(gl.ARRAY_BUFFER, carMesh.normalBuffer);
		gl.vertexAttribPointer(program.vertexNormalAttribute, carMesh.normalBuffer.itemSize, gl.FLOAT, false, 0, 0);
		 
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, carMesh.indexBuffer);		

		gl.uniform1i(program.textureUniform, 0);
		gl.uniform4f(program.lightDir, gLightDir[0], gLightDir[1], gLightDir[2], 0.2);


		// Aligning the Ship
		var alignMatrix = utils.MakeScaleMatrix(0.01);
		alignMatrix = utils.multiplyMatrices(alignMatrix,utils.MakeRotateYMatrix(90));

		WVPmatrix = utils.multiplyMatrices(utils.multiplyMatrices(projectionMatrix, worldMatrix),alignMatrix);
		gl.uniformMatrix4fv(program.WVPmatrixUniform, gl.FALSE, utils.transposeMatrix(WVPmatrix));		
		gl.uniformMatrix4fv(program.NmatrixUniform, gl.FALSE, utils.transposeMatrix(worldMatrix));
		gl.drawElements(gl.TRIANGLES, carMesh.indexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
		
		window.requestAnimationFrame(drawScene);		
}