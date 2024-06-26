//Reference : Learn OpenGL
//scene one camera positon var camera_position = [471.14598841841126, -157.0, 0.0];
//var camera_position = [110.00984745149007,-157,162.26821512518381];
//camera_position = [490.0, -47.0, 34.0];
var camera_position = [490.0, -45.0, 0.0];
var camera_position_vector = [490.0, -45.0, 0.0];
var camera_right_vector = [1.0, 0.0, 0.0];
var camera_direction_vector = [0.0, 0.0, 1.0];
var camera_up_vector = [0.0, 1.0, 0.0];
var camera_view_matrix;
var y_rotation_matrix;
var x_rotation;
var y_rotation;
var last_x;
var last_y;
var reflected = false;

function InitializeCamera() {
	camera_view_matrix = mat4.create();
	y_rotation_matrix = mat4.create();

	mat4.identity(camera_view_matrix);
	mat4.identity(y_rotation_matrix);

	x_rotation = Math.PI / 20;
	y_rotation = 0;
	UpdateCamera();
}

function UpdateCameraXY(x, y) {
	// x_rotation += (y - last_y) / 5;
	y_rotation -= (x - last_x) / 5;

	// x_rotation = Math.min(x_rotation, Math.PI/2.5);
	// x_rotation = Math.max(x_rotation, 0.1);

	//console.log("x = " + x + "last_x = " + last_x + "y_rotation=" + y_rotation);
	last_x = x;
	last_y = y;

	var y_rotation_radian = glMatrix.toRadian(y_rotation);
	var x_rotation_radian = glMatrix.toRadian(x_rotation);

	camera_right_vector = [Math.cos(y_rotation_radian), 0, -Math.sin(y_rotation_radian)];
	camera_direction_vector = [Math.sin(y_rotation_radian), Math.sin(x_rotation_radian), Math.cos(y_rotation_radian)];
	vec3.cross(camera_up_vector, camera_direction_vector, camera_right_vector);

	y_rotation_matrix = [
		camera_right_vector[0], camera_up_vector[0], camera_direction_vector[0], 0,
		camera_right_vector[1], camera_up_vector[1], camera_direction_vector[1], 0,
		camera_right_vector[2], camera_up_vector[2], camera_direction_vector[2], 0,
		0, 0, 0, 1,
	];
}

function UpdateCamera() {
	var y_rotation_radian = glMatrix.toRadian(y_rotation);
	var x_rotation_radian = glMatrix.toRadian(x_rotation);
	camera_right_vector = [Math.cos(y_rotation_radian), 0, -Math.sin(y_rotation_radian)];
	camera_direction_vector = [Math.sin(y_rotation_radian), Math.sin(x_rotation_radian), Math.cos(y_rotation_radian)];
	vec3.cross(camera_up_vector, camera_direction_vector, camera_right_vector);

	y_rotation_matrix = [
		camera_right_vector[0], camera_up_vector[0], camera_direction_vector[0], 0,
		camera_right_vector[1], camera_up_vector[1], camera_direction_vector[1], 0,
		camera_right_vector[2], camera_up_vector[2], camera_direction_vector[2], 0,
		0, 0, 0, 1,
	];
}

function MoveCameraRight(multiplier) {
	camera_position[0] += camera_right_vector[0] * multiplier;
	camera_position[1] += camera_right_vector[1] * multiplier;
	camera_position[2] += camera_right_vector[2] * multiplier;
}

function MoveCameraLeft(multiplier) {
	camera_position[0] -= camera_right_vector[0] * multiplier;
	camera_position[1] -= camera_right_vector[1] * multiplier;
	camera_position[2] -= camera_right_vector[2] * multiplier;
}

function MoveCameraUp(move_sensitivity) {
	camera_position[0] += camera_up_vector[0] * move_sensitivity;
	camera_position[1] += camera_up_vector[1] * move_sensitivity;
	camera_position[2] += camera_up_vector[2] * move_sensitivity;
}

function MoveCameraDown(move_sensitivity) {
	camera_position[0] -= camera_up_vector[0] * move_sensitivity;
	camera_position[1] -= camera_up_vector[1] * move_sensitivity;
	camera_position[2] -= camera_up_vector[2] * move_sensitivity;
}

function MoveCameraFront(move_sensitivity) {
	camera_position[0] -= camera_direction_vector[0] * move_sensitivity;
	camera_position[1] -= camera_direction_vector[1] * move_sensitivity;
	camera_position[2] -= camera_direction_vector[2] * move_sensitivity;
}

function MoveCameraBack(move_sensitivity) {
	camera_position[0] += camera_direction_vector[0] * move_sensitivity;
	camera_position[1] += camera_direction_vector[1] * move_sensitivity;
	camera_position[2] += camera_direction_vector[2] * move_sensitivity;
}

function GetCameraViewMatrix() {
	if (reflected)
		return GetCameraReflectionMatrix();

	mat4.identity(camera_view_matrix);
	var translation_matrix = mat4.create();
	mat4.identity(translation_matrix);
	var camera_pos_inv = vec3.create();
	vec3.negate(camera_pos_inv, camera_position)
	mat4.translate(translation_matrix, translation_matrix, camera_pos_inv);
	mat4.multiply(camera_view_matrix, y_rotation_matrix, translation_matrix);
	return camera_view_matrix;
}

function GetCameraPosition() {
	return camera_position;
}

function UpdateCameraPosition(position) {
	camera_position = position;
}

function UpdateCameraAngleY(angle) {
	y_rotation = angle;
	UpdateCamera();
}
function UpdateCameraAngleX(angle) {
	x_rotation = angle;
	UpdateCamera();
}

// Reflection matrix functions
function CameraReflect() {
	reflected = !reflected;
}

function GetCameraReflectionMatrix() {
	var reflectionMatrix = mat4.create();
	
	var position = new Float32Array(camera_position);
	//var distance = 2 * position[1] - WATER_HEIGHT;
	// position[1] = -position[1];
	var y_rotation_radian = glMatrix.toRadian(y_rotation);
	var x_rotation_radian = glMatrix.toRadian(x_rotation);
	mat4.identity(camera_view_matrix);
	var translation_matrix = mat4.create();
	mat4.identity(translation_matrix);
	var camera_pos_inv = vec3.create();
	vec3.negate(camera_pos_inv, position);
	mat4.translate(translation_matrix, translation_matrix, camera_pos_inv);
	camera_direction_vector = [Math.sin(y_rotation_radian), -Math.sin(x_rotation_radian), Math.cos(y_rotation_radian)];
	vec3.cross(camera_up_vector, camera_direction_vector, camera_right_vector);

	y_rotation_matrix = [
		camera_right_vector[0], camera_up_vector[0], camera_direction_vector[0], 0,
		camera_right_vector[1], -camera_up_vector[1], camera_direction_vector[1], 0,
		camera_right_vector[2], camera_up_vector[2], camera_direction_vector[2], 0,
		0, 0, 0, 1,
	];

	mat4.multiply(camera_view_matrix, y_rotation_matrix, translation_matrix);
	UpdateCamera();

	return camera_view_matrix;
}


function bernstein(i, n, t) {
	let binomial_coeff = 1;
	for (let k = 0; k < i; ++k) {
		binomial_coeff *= (n - k) / (k + 1);
	}
	return binomial_coeff * Math.pow(t, i) * Math.pow(1 - t, n - i);
}

function bezierCurve(controlPoints, currentTime, startTime, Duration) {
	let n = controlPoints.length - 1;
	let currentTimeInterval = currentTime - startTime;
	let t = currentTimeInterval / Duration;
	if (t > 1)
		t = 1;
	let x = 0.0, y = 0.0, z = 0.0, xAngle = 0.0, yAngle = 0.0;
	let i = 0
	for (i; i <= n; ++i) {
		let b = bernstein(i, n, t);
		x += b * controlPoints[i][0];
		y += b * controlPoints[i][1];
		z += b * controlPoints[i][2];
		xAngle += b * controlPoints[i][3];
		yAngle += b * controlPoints[i][4];
	}
	// console.log(x, y, z);
	// console.log(xAngle, yAngle);
	camera_position_vector = [x, y, z]
	UpdateCameraPosition([x, y, z]);
	UpdateCameraAngleY(yAngle % 360);
	UpdateCameraAngleX(xAngle % 360);
}

function cameraShake()
{
	let currentTime = performance.now();
    let x = (Math.random() * 2 - 1) / 300;
    let y = (Math.random() * 2 - 1) / 400;
    if (currentTime - lastExecutionTime >= 100) { 
		MoveCameraUp(y)
		MoveCameraRight(x);

        lastExecutionTime = currentTime;
    }
}