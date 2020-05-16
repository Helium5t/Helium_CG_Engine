// Self explainatory : generates a new identity matrix and returns it. 
function new_matrix(){
	return 	[1.0, 0.0, 0.0, 0.0, 
			 0.0, 1.0, 0.0, 0.0, 
			 0.0, 0.0, 1.0, 0.0, 
			 0.0, 0.0, 0.0, 1.0];
}

// debug print of a 4x4 matrix mapped onto a 16 len vector
function dbgprint(mtx){
	console.log(	'X:' + mtx[0] + '/' + mtx[1] +'/' + mtx[2] + '/' + mtx[3] + '\n' + 
					'Y:' + mtx[4] + '/' + mtx[5] +'/' + mtx[6] + '/' + mtx[7] + '\n' + 
					'Z:' + mtx[8] + '/' + mtx[9] +'/' + mtx[10] + '/' + mtx[11] + '\n' + 
					'W:' + mtx[12] + '/' + mtx[13] +'/' + mtx[14] + '/' + mtx[15] + '\n');
}

// Applies Row By Column multiplication in order to apply the transformation in Transf over the matrix mtx
function apply_transform(transf,mtx){
	var result=[]
	for(var row =0; row < 4; row++){
		var rw=row*4
		for(var column=0; column < 4; column++){
			result[rw+column]=	(transf[rw] * mtx[column]) +
								(transf[rw + 1 ] * mtx[4 + column]) + 
								(transf[rw + 2 ] * mtx[8 + column]) + 
								(transf[rw + 3 ] * mtx[12+ column]);
		}
	}
	return result
}

// Degree to Radiants transformation
function get_angle(alpha){
	return Math.PI*(alpha / 180)
}



// arr = 16 vector representing 4x4 matrix
// axis = char represening axis
// alpha = angle in radiants
// Generates a rotation transformation matrix given the identity matrix, the axis and the angle
function mk_rotate(arr,axis,alpha){
	// xx xy xz dx				0  1  2  3
	// yx yy yz dy				4  5  6  7
	// zx zy zz dz				8  9  10 11
	// 0  0  0  w 				12 13 14 15
	var cos=Math.cos(alpha)
	var sin=Math.sin(alpha)
	if (axis == 'x'){
		arr[5]=	cos
		arr[6]= - sin
		arr[10]= cos
		arr[9]= sin
	}
	else if (axis =='y') {
		arr[0] = cos
		arr[2] = sin
		arr[8] = -sin
		arr[10] = cos
	}

	else if (axis == 'z'){
		arr[0] = cos
		arr[1] = -sin
		arr[4] = sin
		arr[5] = cos
	}
	return 0
}

// arr = 16 len vector representing a matrix 4x4
// scalexyz = amount to scale
// Scales the transformation matrix by the factors passed
function mk_scale(arr,scalex,scaley,scalez){
	//console.log('scaling by ' + scalex + ' ' + scaley  + ' ' + scalez)
	//console.log(arr)
	arr[0]=arr[0]*scalex
	arr[5]=arr[5]*scaley
	arr[10]=arr[10]*scalez
	//console.log(arr)
	return 1
}

// applies a shear over an axis
// vec = size 2 vector representing the 2 directions in which to apply the shear over the axis
function mk_shear(arr,axis,vec){ // Convention : vec[0] contains x if y or z, y otherwise, vec[1] contains z if x or y, y otherwise
	if (axis=='x'){
		arr[4]=vec[0]
		arr[8]=vec[1]
		return 1
	}
	else if (axis == 'y'){
		arr[1]=vec[0]
		arr[9]=vec[1]
		return 1
	}
	else if (axis == 'z'){
		arr[2]=vec[0]
		arr[6]=vec[1]
		return 1
	}
	return 0
}


// shifts the matrix
function shift(mtx,x,y,z){
	mtx[3]=mtx[3] + x
	mtx[7]=mtx[7] + y
	mtx[11]=mtx[11] + z
}

//simply put : returns -1 if i+j is odd, 1 otherwise
function order(i){
	row = Math.floor(i/4) + 1
	col = i%4  + 1
	if((row + col) % 2 ==0){
		return 1
	}
	else{
		return -1
	}
}

//Generates a cofactor of a matrix given the position of the cell to consider  
//returns the value of a 3x3 matrix determinant. 
//Deletes row and column from M given the index of the element associated to the complement
function det3(pos,m){
	var m3 = [	0,0,0,
				0,0,0,
				0,0,0 ];
	var p =0
	for (i=0; i < 16; i++){
		if( Math.floor(pos/4) != Math.floor(i/4)){
			if(pos % 4 != i % 4){
				m3[p] = m[i]
				p++
			}
		}
	}
	var det3 =	m3[0]*m3[4]*m3[8] + 
				m3[1]*m3[5]*m3[6] + 
				m3[2]*m3[3]*m3[7] - 
				m3[0]*m3[5]*m3[7] - 
				m3[1]*m3[3]*m3[8] -
				m3[2]*m3[4]*m3[6];
	return det3
}

// applies cross product between 2 tridimensional vectors
function cross_product(v1,v2){
	var res=[]
	res[0] = v1[1]*v2[2] - v1[2]*v2[1]
	res[1] = v1[2]*v2[0] - v1[0]*v2[2]
	res[2] = v1[0]*v2[1] - v1[1]*v2[0]
	return res
}

// subtracts 2 tridimensional vector one from the other
function subvec(v1,v2){
	resv=[]
	resv[0]=v1[0]-v2[0]
	resv[1]=v1[1]-v2[1]
	resv[2]=v1[2]-v2[2]
	return resv
}

// returns the length of a vector represented by an array
function veclen(v){
	var len = v[0] *v[0]
	len = len + (v[1] *v[1])
	len = len + (v[2] *v[2])
	len = Math.sqrt(len)
	console.log(v)
	return len
}

// fixes a negative 0 due to javascript assigning -0 to operation 0-0.
// does this for a 3 dimentional vector
function fix_neg0(v){
	for (var i = 0; i<3;i++){
		if (v[i] == 0){
			v[i] = v[i]*v[i];
		}
	}
	return v
}

//normalizes vector given, max length supported is 3
function normalize(v){
	var nm = []
	var norm = veclen(v)
	nm[0] = v[0] / norm
	nm[1] = v[1] / norm
	nm[2] = v[2] / norm
	nm = fix_neg0(nm)
	console.log(' Length: '+ norm)
	return nm
}

// returns value of determinant of a 4x4 matrix. Matrix m must be a 12 length vector
function get_det(m){
	var detv=[];
	for (var i = 0; i < 4; i++) {
		var d3 = det3(i,m)
		var ord = order(i)
		detv[i] = m[i] * ord *  d3
	}
	//console.log(detv)
	det=detv[0] + detv[1] + detv[2] + detv[3]
	return det
}
// Generates the adjunct of the matrix passed.
// mtx must be a 16 len vector
function get_adj(mtx){
	var adj=[0, 1, 2, 3, 4, 5, 6, 7, 8, 9,10,11,12,13,14,15 ];
	adj[0] = order(0) * det3(0,mtx)
	adj[1] = order(1) *det3(4,mtx)
	adj[2] = order(2) *det3(8,mtx)
	adj[3] = order(3) *det3(12,mtx)
	adj[4] = order(4) *det3(1,mtx)
	adj[5] = order(5) *det3(5,mtx)
	adj[6] = order(6) *det3(9,mtx)
	adj[7] = order(7) *det3(13,mtx)
	adj[8] = order(8) *det3(2,mtx)
	adj[9] = order(9) *det3(6,mtx)
	adj[10] = order(10) *det3(10,mtx)
	adj[11] = order(11) *det3(14,mtx)
	adj[12] = order(12) *det3(3,mtx)
	adj[13] = order(13) *det3(7,mtx)
	adj[14] = order(14) *det3(11,mtx)
	adj[15] = order(15) *det3(15,mtx)
	return adj
}

// Inverts mtx, mtx must be a 16 len vector
function invert(mtx){
	var fct=get_det(mtx)
	var adj=[]
	adj=get_adj(mtx)
	if( fct ==0 ){
		console.log('ERROR')
		dbgprint(mtx)
		return -1
	}
	for(var i=0;i<16;i++){
		adj[i] = adj[i] / fct
	}
	//console.log('Original matrix: \n')
	//dbgprint(mtx)
	//console.log( 'Determinant : ' + fct)
	//console.log( 'Inverted')
	//dbgprint(adj)
	return adj
}

// returns a scaling matrix in order to apply it as a transformation
function get_scaled(x,y,z){
	var ret = new_matrix()
	mk_scale(ret,x,y,z)
	return ret
}

// returns a rotating matrix in order to apply it as a transformation
// axis: char representing either x y or z. Axis along which to rotate the vector
// angle : angle in degrees of rotation.
function get_rotated(axis,angle){
	var ret = new_matrix()
	var rads = get_angle(angle)
	mk_rotate(ret,axis,rads)
	return ret
}

// returns a shearing matrix in order to apply it as a transformation
// axis: char representing either x y or z. Axis along which to apply the vector
// vec : vector of shearing
function get_sheared(axis,vec){
	var ret = new_matrix()
	mk_shear(ret,axis,vec)
	return ret
}

// returns a shifting matrix in order to apply it as a transformation
function get_shifted(x,y,z){
	var ret = new_matrix()
	shift(ret,x,y,z)
	return ret
}

// calculates the vertical bounds of the viewport, given width and aspect ratio
function h_hbounds(hwidth,aspect){
	return hwidth / aspect
}

// applies an axon trasnformation to a matrix
// supports different angles and generates an isometric transformation by default
// Isometric needs custom alpha = 45 beta = 35.26
// Dimetric needs alpha = 45, beta is arbitrarily choosen.
function axon_transform(mtx,cusotmalpha,custombeta){
	var trf = new_matrix()
	if(cusotmalpha == undefined){var angle = get_angle(45)}
	else{ var angle = get_angle(cusotmalpha)}
	mk_rotate(trf,'y',angle)
	mtx = apply_transform(trf,mtx)
	trf = new_matrix()
	if(custombeta == undefined){angle = get_angle(35.26)}
	else{angle = get_angle(custombeta)}
	mk_rotate(trf,'x',angle)
	mtx = apply_transform(trf,mtx)
	return mtx
}


// makes an oblique transformation matrix
// can be used for both cavalier and cabiner projections
// mtx : matrix to transform into an oblique view
// shear: a shear value
// deg: angle at which to shear 
// cavalier is given by deg = 45, shear = 1
// cabiner is given by deg = 45, shear = 0.5
// the angle can be changed to change the type of cavalier/cabiner projection needed
function oblique_transform(mtx,shear,deg){
	var trf = new_matrix()
	var alpha = get_angle(deg)
	var cos = Math.cos(alpha)
	var sin = Math.sin(alpha)
	shvec = [-shear*cos, -shear*sin]
	mk_shear(trf,'z',shvec)
	mtx = apply_transform(trf,mtx)
	return mtx
}

// makes a parallel projection given the view box parameters
//mtx must be the initial matrix(useless at the moment)
// hwidth must be the width of the view divided by 2
// aspect has to be the aspect ratio of the view plane
// near has to be the value of the near plane 
// far has to be the value of the far plane
function mk_parallel_projection(mtx,hwidth,aspect,near,far){
	var out  = new_matrix()
	var r = hwidth
	var l = -hwidth							
	var hheight = h_hbounds(hwidth,aspect)			// t = +hh, b = -hh
	var n = near										// Coordinates 
	var f = far
	var t = hheight
	var b = -hheight								// Coordinates
	//	SHIFT TO CENTER OF VIEWPORT
	var shiftx = -(r+l) /2
	var shifty = -(t+b)/2							// -(t+b)/2 t = hh, b=-hh => 0
	var shiftz = -(-f-n) /2
	shift(out,shiftx,shifty,shiftz)
	//	NORMALIZATION
	var scalex = 2/(r-l)
	var scaley = 2/(t-b)
	var scalez = 2/(f-n)
	var trf = new_matrix()
	mk_scale(trf,scalex,scaley,scalez)
	out = apply_transform(trf,out)
	// Z MIRROR
	trf = new_matrix()
	mk_scale(trf,1,1,-1)
	out = apply_transform(trf,out)
	if (mtx != undefined ){	return apply_transform(out,mtx)}
	else return out
}


// basic transformations for preserving depth data in a perspective matrix
function persp_basic(mtx){
	mtx[11] = 1
	mtx[14] = -1
	mtx[15] = 0
	return mtx
}

// creates a matrix as shown below
// all vectors must be at least made up of 3 elements
function vecs2mat(vx,vy,vz,sht){
	// x0 y0 z0 c0
	//  0  1  2  3

	// x1 y1 z1 c1
	//  4  5  6  7

	// x2 y2 z2 c2
	//  8  9 10 11

	//  0  0  0  1
	// 12 13 14 15

	var res = []
	// vx
	res[0] = vx[0]
	res[4] = vx[1]
	res[8] = vx[2]
	// vy
	res[1] = vy[0]
	res[5] = vy[1]
	res[9] = vy[2]
	// vz
	res[2] = vz[0]
	res[6] = vz[1]
	res[10] = vz[2]
	// cam place
	res[3] = sht[0]
	res[7] = sht[1]
	res[11] = sht[2]
	// 0 vector and last pos 1
	res[12] = 0
	res[13] = 0
	res[14] = 0
	res[15] = 1
	return res
}

// ! d = n
function mk_perspective_projection(mtx,hw,hh,n,f){
	// scale to projection plane (similar triangles)
	var out = new_matrix()
	var d=n
	mk_scale(out,d,d,d)
	out = persp_basic(out)
	mtx = apply_transform(out,mtx)
	//	Normalizing 
	//	Shift to projection plane
	var r = hw
	var l = -hw
	var t = hh
	var b = -hh
	var sht = new_matrix()
	var shiftx =  -(r+l)/2
	var shifty = -(t+b)/2
	shiftx = 0
	shifty = 0 
	var shiftz = n - ((n+f)/(2*n*f))
	shift(sht,shiftx,shifty,shiftz)
	mtx =  apply_transform(sht,mtx)
	// Scaling to normalized
	sht = new_matrix()
	var scalex = 2/(r-l)
	var scaley = 2/(t-b)
	var scalez = (2*n*f)/(-n-f)
	mk_scale(sht,scalex,scaley,scalez)
	mtx = apply_transform(sht,mtx)
	return mtx
}


// creates bounds given the vertical fov and the near plane of the frustum
function fov2bounds(n,alpha){
	var rads = get_angle(alpha/2)
	return n*Math.tan(rads)
}

// cx cy cz : position of the camera looking
// alpha beta rho : rotations of the camera, x y z
function view_in_transf(cx,cy,cz,alpha,beta,rho){
	var radsa =  get_angle(alpha)
	var radsr =  get_angle(rho)
	var radsb =  get_angle(beta)
	var out = new_matrix()
	// Translate to -cx -cy -cz
	var trf = new_matrix()
	shift(trf,-cx,-cy,-cz)
	out = apply_transform(trf,out)
	// Rotate y -alpha
	trf =  new_matrix()
	mk_rotate(trf,'y',-radsa)
	out = apply_transform(trf,out)
	// Rotate x -beta
	trf =  new_matrix()
	mk_rotate(trf,'x',-radsb)
	out = apply_transform(trf,out)
	// Rotate z -rho
	trf =  new_matrix()
	mk_rotate(trf,'z',-radsr)
	out = apply_transform(trf,out)
	return out
}


//camv : position of camera: x y z vector
//atv  : position of looked at object, xyz vector
function view_at_transf(camv,atv){
	var upv = [0,1,0]
	// Getting coordinate system
	var vz = subvec(camv,atv)
	vz = normalize(vz)
	console.log(vz)
	var vx = cross_product(upv,vz)
	vx = normalize(vx)
	var vy = cross_product(vz,vx)
	// Creating matrix
	var  camat = []
	camat = vecs2mat(vx,vy,vz,camv)
	var viewmat =[]
	viewmat = invert(camat)
	return viewmat
}

//sht : a shift vector which is the movement of the looked at object
//euler : angles of rotation of the object : x y z order
//scl : scaling parameters for the object: x,y,z
//returns : a world trasnformation matrix
function world_transf(sht,euler,scl){
	var scaler = get_scaled(scl[0],scl[1],scl[2])
	var rotx = get_rotated('x',euler[0])
	var roty = get_rotated('y',euler[1])
	var rotz = get_rotated('z',euler[2])
	var shifter = get_shifted(sht[0],sht[1],sht[2])
	var final =  new_matrix()
	//SCALING
	final = apply_transform(scaler,final)
	//ROTATIONS ZXY
	final = apply_transform(rotz,final)
	final = apply_transform(rotx,final)
	final = apply_transform(roty,final)
	// SHIFTING
	final = apply_transform(shifter,final)
	return final
}

// Applies quaternion product q1 x q2
function qtr_product(q1,q2){
	var res=[]
	res[0] = q1[0]*q2[0] - q1[1]*q2[1] - q1[2]*q2[2] - q1[3]*q2[3]
	res[1] = q1[0]*q2[1] + q1[1]*q2[0] + q1[2]*q2[3] - q1[3]*q2[2]
	res[2] = q1[0]*q2[2] + q1[2]*q2[0] + q1[3]*q2[1] - q1[1]*q2[3]
	res[3] = q1[0]*q2[3] + q1[3]*q2[0] + q1[1]*q2[2] - q1[2]*q2[1]
	return res
}

// returns a vector obtained by rotating a main axis by a given amount of degrees
// alpha : amount of degrees by which to rotate the cusotm axis
function rotated_vec(axis,alpha){
	var rads = get_angle(alpha)
	var r =[]
	if (axis=='x'){
		// A rotation aorund x means a point lying on the yz plane will move on y by cos() and on z by sin()
		r[1] = Math.cos(rads)
		r[2] = Math.sin(rads)
		r[0] = 0
	}else if (axis=='y'){
		// A rotation aorund y means a point lying on the xz plane will move on z by cos() and on x by sin()
		r[2] = Math.cos(rads)
		r[0] = Math.sin(rads)
		r[1] = 0
	}else if (axis=='z'){
		// A rotation aorund z means a point lying on the xy plane will move on x by cos() and on y by sin()
		r[0] = Math.cos(rads)
		r[1] = Math.sin(rads)
		r[2] = 0
	}
	else{
		alert('error')	
		console.log(axis)
		return 0
	}
	return r
}

// returns a normal tridimentional vector representing one of the 3 axis
function get_axis_vec(axis){
	if (axis == 'x'){
		return [1,0,0]
	}
	else if (axis =='y'){
		return [0,1,0]
	}
	else if (axis =='z'){
		return [0,0,1]
	}
	else{
		alert('error: wrong axis given:' + axis)
		return [0,0,0]
	}
}

// rotates an object by rads amount around the given axis
// axis : tridimensional vector representing the axis, does not have to be normalized
// rads : radiants by which to rotate
function qtr_rotate(rads,axis){
	if (!vec_isnormal(axis)){
		axis = normalize(axis)
	}	
	sin = Math.sin(rads)
	cos = Math.cos(rads)
	qtr = []
	qtr[0] = cos
	qtr[1] = sin*axis[0]
	qtr[2] = sin*axis[1]
	qtr[3] = sin*axis[2]
	return qtr
}

// returns 1 if the tridimentional vector passed is normal, 0 otherwise 
function vec_isnormal(v){
	var x = v[0]*v[0]
	var y = v[1]*v[3]
	var z = v[2]*v[2]
	if (Math.sqrt(x+y+z) == 1){
		return 1
	}
	else{
		return 0
	}
	return -1
}

// returns 1 if the quaternion passed is normal, 0 otherwise
function qtr_isnormal(v){
	var a = v[0]*v[0]
	var x = v[1]*v[1]
	var y = v[2]*v[2]
	var z = v[3]*v[3]
	if (Math.sqrt(a+x+y+z) == 1){
		return 1
	}
	else{
		return 0
	}
	return -1
}

// applies roation rq to the quaternion qvec
function qtr_applyrot(rotq,qvec){
	return qtr_product(rotq,qvec)
}

// Given the direction in which to rotate and the amount, it rotates the object
// rx : -1,0,+1 respectively counter clockwise, no rotation or clockwise rotaiton by rads amount
// ry : -1,0,+1
// rz : -1,0,+1
// rads : amount of radiants by which to rotate the object in the given directions
function rot_from_xyz(rx,ry,rz,rads){
	var qtrx = qtr_rotate(rads*rx,[1,0,0])
	var qtry = qtr_rotate(rads*ry,[0,1,0])
	var qtrz = qtr_rotate(rads*rz,[0,0,1])
	var rot= qtr_applyrot(qtry,qtrx)
	rot = qtr_applyrot(qtrz,rot)
	return rot
}

// Given a quaternion, it transforms it into a trasnformation matrix
function qtr2mat(qtr){
	mtx =[]
	r = qtr[0] //a
	x = qtr[1] //b
	y = qtr[2] //c
	z = qtr[3] //d
	mtx[0] = 1 - (2*y*y) - (2*z*z)
	mtx[1] = (2*x*y) + (2*r*z)
	mtx[2] = (2*x*z) - (2*r*y)
	mtx[3] = 0
	mtx[4] = (2*x*y) - (2*r*z)
	mtx[5] = 1 - (2*x*x) - (2*z*z)
	mtx[6] = (2*y*z) + (2*r*x)
	mtx[7] = 0
	mtx[8] = (2*x*z) + (2*r*y)
	mtx[9] = (2*y*z) - (2*r*x)
	mtx[10] = 1 - (2*x*x) - (2*y*y)
	mtx[11] = 0
	mtx[12] = 0
	mtx[13] = 0
	mtx[14] = 0
	mtx[15] = 1
	return mtx
}

// L MODE
function build_cube(dim,mode){
	if (dim<1){
		dim = 1
	}
	var vertarr = []
	var ref = []
	ref[0] = [dim,dim,dim]			//  1  1  1 
	ref[1] = [dim,dim,-dim]			//  1  1 -1 
	ref[2] = [dim,-dim,-dim]		//  1 -1 -1
	ref[3] = [dim,-dim,dim]			//  1 -1  1
	ref[4] = [-dim,dim,dim]			// -1  1  1
	ref[5] = [-dim,dim,-dim]		// -1  1 -1
	ref[6] = [-dim,-dim,-dim]		// -1 -1 -1
	ref[7] = [-dim,-dim,dim]		// -1  1  1
	// FACE ONE
	if (mode == 'l'){
		vertarr[0] = ref[0]
		vertarr[1] = ref[1]
		vertarr[2] = ref[2]
		vertarr[3] = ref[3]
		vertarr[4] = ref[0]
		vertarr[5] = ref[2]
		vertarr[6] = ref[2]
		vertarr[7] = ref[6]
		vertarr[8] = ref[1]
		vertarr[9] = ref[1]
		vertarr[10] = ref[5]
		vertarr[11] = ref[6]
		vertarr[12] = ref[0]
		vertarr[13] = ref[1]
		vertarr[14] = ref[5]
		vertarr[15] = ref[0]
		vertarr[16] = ref[4]
		vertarr[17] = ref[5]
		vertarr[18] = ref[4]
		vertarr[19] = ref[5]
		vertarr[20] = ref[6]
		vertarr[21] = ref[4]
		vertarr[22] = ref[7]
		vertarr[23] = ref[6]
		vertarr[24] = ref[6]
		vertarr[25] = ref[2]
		vertarr[26] = ref[3]
		vertarr[27] = ref[3]
		vertarr[28] = ref[7]
		vertarr[29] = ref[6]
		vertarr[30] = ref[4]
		vertarr[31] = ref[0]
		vertarr[32] = ref[7]
		vertarr[33] = ref[7]
		vertarr[34] = ref[0]
		vertarr[35] = ref[3]
	}
	else if (mode == 's'){
		vertarr[0] = ref[0]
		vertarr[1] = ref[1]
		vertarr[2] = ref[3]
		vertarr[3] = ref[2]
		vertarr[4] = ref[7]
		vertarr[5] = ref[6]
		vertarr[6] = ref[4]
		vertarr[7] = ref[5]
		vertarr[8] = ref[0]
		vertarr[9] = ref[1]
		vertarr[10] = ref[5]
		vertarr[11] = ref[2]
		vertarr[12] = ref[6]
		vertarr[13] = ref[4]
		vertarr[14] = ref[0]
		vertarr[15] = ref[7]
		vertarr[16] = ref[3]

	}
	else if(mode =='f'){
		alert('ERROR : cannot display cube through fan method')
	}
	else {
		alert('ERROR : mode ' + mode + ' is not supported')
	}
	return vertarr
}

function build_L(dim,mode){
	// shape reference
	var ref =[]
	ref[0]=[-dim/2,dim,0]
	ref[1]=[0,dim,0]
	ref[2]=[0,0,0]
	ref[3]=[(dim/2),0,0]
	ref[4]=[(dim/2),-(dim/2),0]
	ref[5]=[-dim/2,-(dim/2),0]

	var vertarr=[]
	if (mode == 'l'){
		vertarr[0] = ref[0]
		vertarr[1] = ref[1]
		vertarr[2] = ref[2]
		vertarr[3] = ref[0]
		vertarr[4] = ref[2]
		vertarr[5] = ref[5]
		vertarr[6] = ref[2]
		vertarr[7] = ref[5]
		vertarr[8] = ref[3]
		vertarr[9] = ref[3]
		vertarr[10] = ref[4]
		vertarr[11] = ref[5]
	}
	else if (mode == 's'){
		vertarr[0] = ref[1]
		vertarr[1] = ref[0]
		vertarr[2] = ref[2]
		vertarr[3] = ref[5]
		vertarr[4] = ref[3]
		vertarr[5] = ref[4]
	}
	else if(mode == 'f'){
		vertarr[0] = ref[5]
		vertarr[1] = ref[0]
		vertarr[2] = ref[1]
		vertarr[3] = ref[2]
		vertarr[4] = ref[3]
		vertarr[5] = ref[4]
	}
	else {
		alert('ERROR : mode ' + mode + ' is not supported')
	}
	return vertarr
}

function build_hex(dim,mode){
	if (dim < 1) {
		dim =1 
	}
	var ref= []
	var vertarr = []
	ref[0] = [-dim,dim,0]
	ref[1] = [dim,dim,0]
	ref[2] = [(2*dim),0,0]
	ref[3] = [dim,-dim,0]
	ref[4] = [-dim,-dim,0]
	ref[5] = [-(2*dim),0,0]

	if (mode == 'l'){
		vertarr[0] =ref[0]
		vertarr[1] =ref[1]
		vertarr[2] =ref[2]
		vertarr[3] =ref[0]
		vertarr[4] =ref[3]
		vertarr[5] =ref[4]
		vertarr[6] =ref[0]
		vertarr[7] =ref[4]
		vertarr[8] =ref[5]
	}
	else if(mode == 's'){
		vertarr[0] =ref[5]
		vertarr[1] =ref[0]
		vertarr[2] =ref[4]
		vertarr[3] =ref[1]
		vertarr[4] =ref[3]
		vertarr[5] =ref[2]
	}
	else if(mode == 'f'){
		vertarr[0] =ref[0]
		vertarr[1] =ref[1]
		vertarr[2] =ref[2]
		vertarr[3] =ref[3]
		vertarr[4] =ref[4]
		vertarr[5] =ref[5]
	}
	else {
		alert('ERROR : mode ' + mode + ' is not supported')
	}
	return vertarr
}


function build_cylinder_list(dim,def){
	if (dim < 1){
		dim = 1
	}
	if (def < 8){
		def = 8
	}
	var anginc = 360 / def
	var rads = 0
	var verts =[]
	var alpha = 0
	var x =0
	var z =0
	var topi = 0
	var boti =0
	verts[0] = [0,dim,0]
	verts[1 + (2*def)] = [0,-dim,0]
	for (var i = 0; i <def ; i++){
		topi = 1 + i
		boti = def + i + 1 
		alpha = i* anginc
		rads = get_angle(alpha)
		x = Math.sin(rads)
		z = Math.cos(rads)
		verts[topi] = [x,dim,z]
		verts[boti] = [x,-dim,z]
	}
	return verts
}

function build_cylinder_idx(def){
	if (def < 8){
		def = 8
	}
	var idx=[]
	var topi=0
	var boti=0
	var idxer = 0
	var sidxer =0
	var bidxer =0
	for(var i = 0; i<def; i++){
		idxer = i*3
		sidxer = i*6 + (def*3)
		bidxer = i*3 + (def*3) + (def*6)
		topi = i +1
		boti = def + i +1
		// Top circle
		idx[idxer] = 0
		idx[idxer+1] = topi
		idx[idxer+2] = ((i+1 )%def)+1
		// sidedd
		idx[sidxer] = boti
		idx[sidxer + 1] = ((i +1) % def) +1
		idx[sidxer + 2] = topi
		idx[sidxer + 3] = boti
		idx[sidxer + 4] = ((i +1 )%def) + def +1
		idx[sidxer + 5] = ((i +1) % def) +1
		//bottom circle
		idx[bidxer] =  ((i +1 )%def) + def +1
		idx[bidxer+1] = boti
		idx[bidxer +2 ] = 1+ 2*def
		
	}
	return idx
}

function build_torus_list(dimr,dimt,defx,defy){
	if (defy >= 180){
		defy = 179
		console.log('Resized some parameters')
	}
	if (dimr < 1){
		dimr =1
		console.log('Resized some parameters')
	}if (dimt < 0.5){
		dimt = 0.5
		console.log('Resized some parameters')
	}if (defx <36){
		dimr =36
		console.log('Resized some parameters')
	}if (defy < 8){
		dimr =8
		console.log('Resized some parameters')
	}
	var aix = 360 /  defx
	var aiy = 360 /  defy
	var hinc = aiy/2
	var verts =[]
	for (var cx =0 ; cx < defx+1 ; cx++){
		radsx =  get_angle(cx * aix)
		rotoff = hinc*(cx %2)
		for (var cy = 0; cy < defy ; cy++){

			radsy = get_angle((cy*aiy) + rotoff)
			x = (dimr + (dimt*Math.cos(radsy))) * Math.cos(radsx)
			y = Math.sin(radsy) * dimt
			z = (dimr + (dimt*Math.cos(radsy)))* Math.sin(radsx)
			verts[(defy*cx) + cy] = [x,y,z]
		}
	}
	return verts
}

function build_torus_idx(defx,defy){
	var idx =[]
	var idxer =0
	var offset =0
	var max = defx* defy
	var base =0
	for (var cx = 0; cx < defx; cx++){
		base = cx * defy
		offset = cx * 6 * defy
		if(cx % 2 ==0){
			for (var cy =0; cy < defy; cy++){
				idxer = cy * 6 + offset
				bckward = (cy + defy -1) % defy
				
				idx[idxer] = base + cy
				idx[idxer + 1] = base + (cy +1)%defy
				idx[idxer + 2] = (base + cy + defy) % max

				idx[idxer + 3] = (base + bckward + defy)% max
				idx[idxer + 4] = base + cy
				idx[idxer + 5] = (base + cy + defy)% max
			}
		}
		else{
			for (var cy =0; cy < defy; cy++){
				idxer = cy * 6 + offset
				bckward = (cy + defy -1) % defy
				idx[idxer] = base + cy + defy
				idx[idxer +1] = base + cy 
				idx[idxer + 2] = base + ((cy + 1) % defy) + defy
				idx[idxer + 3] = base + ((cy + 1) % defy) 
				idx[idxer + 4] = base + ((cy + 1) % defy) + defy
				idx[idxer + 5] = base + cy				
			}
		}
	}
	return idx
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////

					// I'D LOVE TO IMPORT BUT JAVASCRIPT IS BAD

//////////////////////////////////////////////////////////////////////////////////////////////////////////
