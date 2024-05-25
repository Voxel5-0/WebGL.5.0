//Reference : Learn OpenGL
//scene one camera positon var camera_position = [471.14598841841126, -157.0, 0.0];
//var camera_position = [110.00984745149007,-157,162.26821512518381];
//camera_position = [490.0, -47.0, 34.0];


var camera_position = [490.0, -45.0, 0.0];
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


function InitializeCamera()
{
	camera_view_matrix = mat4.create();
	y_rotation_matrix = mat4.create();

	mat4.identity(camera_view_matrix);
	mat4.identity(y_rotation_matrix);	

	x_rotation = Math.PI/20;
	y_rotation = 0;
	UpdateCamera();
}

function UpdateCameraXY(x, y)
{
	x_rotation += (y - last_y) / 50;
	y_rotation -= (x - last_x) / 5;

	x_rotation = Math.min(x_rotation, Math.PI/2.5);
	x_rotation = Math.max(x_rotation, 0.1);

	//console.log("x = " + x + "last_x = " + last_x + "y_rotation=" + y_rotation);
	last_x = x;
	last_y = y;

	var y_rotation_radian = glMatrix.toRadian(y_rotation);
	camera_right_vector = [Math.cos(y_rotation_radian), 0, -Math.sin(y_rotation_radian)];
	camera_direction_vector = [Math.sin(y_rotation_radian), 0, Math.cos(y_rotation_radian)];
	vec3.cross(camera_up_vector, camera_direction_vector, camera_right_vector);

	y_rotation_matrix = [
				camera_right_vector[0], camera_up_vector[0], camera_direction_vector[0], 0,
				camera_right_vector[1], camera_up_vector[1], camera_direction_vector[1], 0,
				camera_right_vector[2], camera_up_vector[2], camera_direction_vector[2], 0,
				0, 0, 0, 1,
	];
}

function UpdateCamera()
{
	var y_rotation_radian = glMatrix.toRadian(y_rotation);
	camera_right_vector = [Math.cos(y_rotation_radian), 0, -Math.sin(y_rotation_radian)];
	camera_direction_vector = [Math.sin(y_rotation_radian), 0, Math.cos(y_rotation_radian)];
	vec3.cross(camera_up_vector, camera_direction_vector, camera_right_vector);

	y_rotation_matrix = [
				camera_right_vector[0], camera_up_vector[0], camera_direction_vector[0], 0,
				camera_right_vector[1], camera_up_vector[1], camera_direction_vector[1], 0,
				camera_right_vector[2], camera_up_vector[2], camera_direction_vector[2], 0,
				0, 0, 0, 1,
	];
}

function MoveCameraRight(multiplier)
{
	camera_position[0] += camera_right_vector[0] * multiplier;
	camera_position[1] += camera_right_vector[1] * multiplier;
	camera_position[2] += camera_right_vector[2] * multiplier;
}

function MoveCameraLeft(multiplier)
{
	camera_position[0] -= camera_right_vector[0] * multiplier;
	camera_position[1] -= camera_right_vector[1] * multiplier;
	camera_position[2] -= camera_right_vector[2] * multiplier;
}

function MoveCameraUp(move_sensitivity)
{
	camera_position[0] += camera_up_vector[0] * move_sensitivity;
	camera_position[1] += camera_up_vector[1] * move_sensitivity;
	camera_position[2] += camera_up_vector[2] * move_sensitivity;
}

function MoveCameraDown(move_sensitivity)
{
	camera_position[0] -= camera_up_vector[0] * move_sensitivity;
	camera_position[1] -= camera_up_vector[1] * move_sensitivity;
	camera_position[2] -= camera_up_vector[2] * move_sensitivity;
}

function MoveCameraFront(move_sensitivity)
{
	camera_position[0] -= camera_direction_vector[0] * move_sensitivity;
	camera_position[1] -= camera_direction_vector[1] * move_sensitivity;
	camera_position[2] -= camera_direction_vector[2] * move_sensitivity;
}

function MoveCameraBack(move_sensitivity)
{
	camera_position[0] += camera_direction_vector[0] * move_sensitivity;
	camera_position[1] += camera_direction_vector[1] * move_sensitivity;
	camera_position[2] += camera_direction_vector[2] * move_sensitivity;
}

function GetCameraViewMatrix()
{
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

function GetCameraPosition()
{
	return camera_position;
}

function UpdateCameraPosition(position)
{
	camera_position = position;
}

function UpdateCameraAngle(angle)
{
	y_rotation = angle;
	UpdateCamera();
}

// Reflection matrix functions
function CameraReflect()
{
    reflected = !reflected;
}

function GetCameraReflectionMatrix()
{
    var reflectionMatrix = mat4.create();
    mat4.identity(reflectionMatrix);

    if (reflected)
    {
    var position = new Float32Array(camera_position);

    var distance = 2 * position[1] - SCENE_THREE_WATER_HEIGHT;
    position[1] = position[1] - distance;

    var camera_pos_inv = vec3.create();
    vec3.negate(camera_pos_inv, position);

    mat4.translate(reflectionMatrix, reflectionMatrix, camera_pos_inv);
    
    var x_rotation_matrix = mat4.create();
    var x_rotation_angle_radian = glMatrix.toRadian(-x_rotation);

    mat4.rotateX(x_rotation_matrix, x_rotation_matrix, x_rotation_angle_radian);

    mat4.multiply(reflectionMatrix, reflectionMatrix, x_rotation_matrix);
    mat4.multiply(reflectionMatrix, reflectionMatrix, y_rotation_matrix);

    }
    
    return reflectionMatrix;
}
