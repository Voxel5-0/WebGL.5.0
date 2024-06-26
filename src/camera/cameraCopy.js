
var camera_position;
var camera_front;
var camera_up;
var camera_right;
var camera_worldUp;
var reflected = false;

var yaw;
var pitch;

function InitializeCamera() {
	camera_position = [10.0, 0.0, 30.0];
	camera_front = [1.0, 0.0, 0.0];
	camera_up = [0.0, 1.0, 0.0];
	camera_right = [1.0, 0.0, 0.0];
	camera_worldUp = [0.0, 1.0, 0.0];

	yaw = -90
	pitch = 0.0;
	UpdateCamera();
}

function UpdateCameraXY(x, y) {

	pitch += (y - last_y) / 50;
	yaw += (x - last_x) / 10;
	last_x = x;
	last_y = y;


	// if (pitch > 89.0)
	// 	pitch = 89.0;
	// if (pitch < -89.0)
	// 	pitch = -89.0;

	UpdateCamera();
}

function UpdateCamera() {

	camera_front[0] = Math.cos(glMatrix.toRadian(yaw));
	camera_front[1] = Math.sin(pitch);
	camera_front[2] = Math.sin(glMatrix.toRadian(yaw));

	vec3.normalize(camera_front, camera_front);

	vec3.cross(camera_right, camera_front, camera_worldUp);
	vec3.normalize(camera_right, camera_right);

	vec3.cross(camera_worldUp, camera_right, camera_front);
	vec3.normalize(camera_up, camera_up);
}

function MoveCameraRight(multiplier) {
	camera_position[0] += camera_right[0] * multiplier;
	camera_position[1] += camera_right[1] * multiplier;
	camera_position[2] += camera_right[2] * multiplier;
}

function MoveCameraLeft(multiplier) {
	camera_position[0] -= camera_right[0] * multiplier;
	camera_position[1] -= camera_right[1] * multiplier;
	camera_position[2] -= camera_right[2] * multiplier;
}

function MoveCameraUp(move_sensitivity) {
	camera_position[0] += camera_up[0] * move_sensitivity;
	camera_position[1] += camera_up[1] * move_sensitivity;
	camera_position[2] += camera_up[2] * move_sensitivity;
}

function MoveCameraDown(move_sensitivity) {
	camera_position[0] -= camera_up[0] * move_sensitivity;
	camera_position[1] -= camera_up[1] * move_sensitivity;
	camera_position[2] -= camera_up[2] * move_sensitivity;
}

function MoveCameraFront(move_sensitivity) {
	camera_position[0] += camera_front[0] * move_sensitivity;
	camera_position[1] += camera_front[1] * move_sensitivity;
	camera_position[2] += camera_front[2] * move_sensitivity;
}

function MoveCameraBack(move_sensitivity) {
	camera_position[0] -= camera_front[0] * move_sensitivity;
	camera_position[1] -= camera_front[1] * move_sensitivity;
	camera_position[2] -= camera_front[2] * move_sensitivity;
}

function GetCameraViewMatrix() {
	if (reflected)
		return GetCameraReflectionMatrix();

	var final_view_matrix;
	final_view_matrix = mat4.create();
	var camera_lookAt = [camera_position[0] + camera_front[0], camera_position[1] + camera_front[1], camera_position[2] + camera_front[2]]
	mat4.lookAt(final_view_matrix,camera_position,camera_lookAt, camera_up);
	return final_view_matrix;
}

function GetCameraPosition() {
	return camera_position;
}

function UpdateCameraPosition(position) {
	camera_position = position;
}

function UpdateCameraAngleY(angle) {
	yaw = angle;
	UpdateCamera();
}
function UpdateCameraAngleX(angle) {
	pitch = angle;
	UpdateCamera();
}

// Reflection matrix functions
function CameraReflect() {
	reflected = !reflected;
}

function GetCameraReflectionMatrix() {

	var distance  = 2*(camera_position[1] -WATER_HEIGHT);
	var final_view_matrix;
	final_view_matrix = mat4.create();
	var temp_camera_position = [camera_position[0] , camera_position[1] - distance , camera_position[2]]
	var camera_lookAt = [temp_camera_position[0] + camera_front[0], temp_camera_position[1] + camera_front[1], temp_camera_position[2] + camera_front[2]]
	mat4.lookAt(final_view_matrix,temp_camera_position,camera_lookAt, [0.0,-1.0,0.0]);
	return final_view_matrix;

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

function cameraShake() {
	let currentTime = performance.now();
	let x = (Math.random() * 2 - 1) / 300;
	let y = (Math.random() * 2 - 1) / 400;
	if (currentTime - lastExecutionTime >= 100) {
		MoveCameraUp(y)
		MoveCameraRight(x);

		lastExecutionTime = currentTime;
	}
}