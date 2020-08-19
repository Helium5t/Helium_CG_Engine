function worldViewProjection(carx, cary, carz, cardir, camx, camy, camz) {
// Computes the world, view and projection matrices for the game.

// carx, cary and carz encodes the position of the car.
// Since the game is basically in 2D, camdir contains the rotation about the y-axis to orient the car

// The camera is placed at position camx, camy and camz. The view matrix should be computed using the
// LookAt camera matrix procedure, with the correct up-vector.

	var world = [1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1];
	var view  = [1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1];

	var V_z = [camx-carx,camy-cary,camz-carz];

	V_z = utils.normalizeVector3(V_z);

	var u = [0,1,0];

	var V_x = utils.crossVector(u, V_z);

	V_x = utils.normalizeVector3(V_x);

	var V_y = utils.crossVector(V_z, V_x);

	var M_c = [V_x[0], V_y[0], V_z[0], camx,
				V_x[1], V_y[1], V_z[1], camy,
				V_x[2], V_y[2], V_z[2], camz,
				0,	0, 	0, 	1];

	view = utils.invertMatrix(M_c);

	var R = utils.MakeRotateYMatrix(cardir);
	var T = utils.MakeTranslateMatrix(carx, cary, carz);

	world = utils.multiplyMatrices(R, world);
	world = utils.multiplyMatrices(T, world);
	return [world, view];
}

