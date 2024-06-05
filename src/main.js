var canvas = null;
var gl = null;
var bFullScreen = false;
var canvas_original_width;
var canvas_original_height;
var move_sensitivity = 0.5;
var fadeInOutEffect = null;

var requestAnimationFrame = window.requestAnimationFrame ||
							window.webkitRequestAnimationFrame ||
							window.mozRequestAnimationFrame ||
							window.oRequestAnimationFrame ||
							window.msRequestAnimationFrame;
var cancelAnimationFrame = window.cancelRequestAnimationFrame ||
						   window.webkitCancelAnimationFrame ||
						   window.mozCancelRequestAnimationFrame ||
						   window.mozCancelAnimationFrame ||
						   window.oCancelRequestAnimationFrame ||
						   window.oCancelAnimationFrame ||
						   window.msCancelRequestAnimationFrame ||
						   window.msCancelAnimationFrame;

var perspectiveProjectionMatrix;

/* Camera Variables */
var is_mouse_pressed;

/* Scene Display Variables */
var scene = 1;

var scene_camera_positions;
scene_camera_positions = [
							[492.45003920809063,-45,77.96151170852721],     //scene zero camera initial position,
							[492.45003920809063,-45,77.96151170852721], 	//scene one camera initial position
							[0.0, 0.0, 0.0], 	//scene two camera initial position
							[0.0, 0.0, 0.0]     //scene three camera initial position
						 ];
var scene_camera_angles =  [
								0.0, //scene zero
								-180.0,	//scene one
								0.0,	//scene two
								0.0	//scene three
						  ];




//TODO keeping assmip model list and loading global , not right approch , we should change it later
//This is done to solve the problem for synchronisity
var modelList = [
	//{ name: "Vampire", files:[ 'palace/WALT_DISNEY_PICTURES_2006_LOGO.dae' ], flipTex:true },
	{ name: "Backpack", files:[ 'src\\resources\\models\\intro\\Palace_withColors.obj', 'src\\resources\\models\\intro\\Palace_withColors.mtl'], flipTex:false , isStatic : true },
	//{ name: "Backpack", files:[ 'home.obj', 'home.mtl'], flipTex:false },
	//{ name: "Vampire", files:[ 'vampire/dancing_vampire.dae'], flipTex:false },
]

var models = [];

assimpjs().then (function (ajs) {
	Promise.all(modelList.flatMap(o => o.files).map((fileToLoad) => fetch (fileToLoad))).then ((responses) => {
		return Promise.all(responses.map ((res) => res.arrayBuffer()))
	}).then((arrayBuffers) => {
		var k = 0
		for(var i = 0; i < modelList.length; i++) {
			console.log("Loading Files for " + modelList[i].name + "....")
			let fileList = new ajs.FileList()
			for (let j = 0; j < modelList[i].files.length; j++) {
				fileList.AddFile(modelList[i].files[j], new Uint8Array(arrayBuffers[k++]))
			}
			console.log("Loaded Files")
			console.log("Converting Files to AssimpJSON....")
			let result = ajs.ConvertFileList(fileList, 'assjson')
			if (!result.IsSuccess() || result.FileCount() == 0) {
				console.log(result.GetErrorCode())
				return
			}
			console.log("Converted Files")
			console.log("Parse JSON String....")
			let resultFile = result.GetFile(0)
			let jsonContent = new TextDecoder().decode(resultFile.GetContent())
			let resultJson = JSON.parse(jsonContent)
			console.log("Parsed JSON")
			modelList[i].json = resultJson
			modelList[i].directory = modelList[i].files[0].substring(0, modelList[i].files[0].lastIndexOf('/'))
		}
		main()
	})
})

function main()
{
	canvas = document.getElementById("VoxelsCanvas");

	if (!canvas)
	{
		console.log("Obtaining Canvas Failed\n");
	}
	else
	{
		console.log("Obtaining Canvas Successful\n");
	}

	canvas_original_width = canvas.width;
    canvas_original_height = canvas.height;

	window.addEventListener("keydown", keyDown, false);
	window.addEventListener("resize", resize, false);
	window.addEventListener("mousedown", onMouseDown, false);
	window.addEventListener("mousemove", onMouseMove, false);
	window.addEventListener("mouseup", onMouseUp, false);

	init();
	resize();
	draw();
}

function init()
{
	gl = canvas.getContext("webgl2");

	if (gl == null)
	{
		console.log("failed to get the webgl rendering context");
		return;
	}

	gl.viewportWidth = canvas.width;
	gl.viewportHeight = canvas.height;

	/*--------------------- Project Initialization ---------------------*/

	/* -- Common Shader/Gemometries Initialzation */
	InitializeTextureShader();
	InitializeInstanceShader();
	InitializeQuadRenderer();
    InitializeTerrainRenderer();
    InitializeSkybox();

	// fadeInOutEffect = new FadeInOutEffect();
	// fadeInOutEffect.allocate();

	/*Scene Specific Initialization */
	InitializeSceneOne();
	InitializeSceneTwo();
	InitializeSceneThree();


	/* Other initializers */
	InitializeCamera();
	UpdateCameraPosition(scene_camera_positions[scene]);
	UpdateCameraAngle(scene_camera_angles[scene]);
	/*--------------------- Project Initialization ---------------------*/


	/*--------------------- Set OpenGL States --------------------------*/
	gl.clearDepth(1.0);
	gl.enable(gl.DEPTH_TEST);
	gl.depthFunc(gl.LEQUAL);
	//gl.enable(gl.CULL_FACE);
	//gl.clearColor(0.196078, 0.6, 0.8, 1.0);
	gl.clearColor(0.0, 0.0, 0.0, 1.0);
	/*--------------------- Set OpenGL States --------------------------*/

    perspectiveProjectionMatrix = mat4.create();
}



function draw(now)
{
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    /* Prepare Model Matrix */
    /*var model_matrix = mat4.create();
    mat4.identity(model_matrix);
    mat4.translate(model_matrix, model_matrix, [450.0, -50.0, 100.0-5]);*/

    /* Prepare View Matrix */
    /*var view_matrix = mat4.create();
    mat4.identity(view_matrix);
    view_matrix = GetCameraViewMatrix();*/

    if (scene == 0)
    {
    	//RenderSceneZeroOpeningScene();
    }
    else if (scene == 1)
    {
    	RenderSceneOne();
		
    }
    else if (scene == 2)
    {
		UninitializeSceneOne();
    	RenderSceneTwo();
    }
    else if (scene == 3)
    {
    	RenderSceneThree();
    }
   
    requestAnimationFrame(draw, canvas);
    update(now);
}

function update(now)
{

	//UpdateCameraPosition(scene_camera_positions[scene]);
	//UpdateCameraAngle(scene_camera_angles[scene]);

	if (scene == 0)
    {
    	//UpdateCameraXY();
	}
    else if (scene == 1)
    {
    	
	}
    else if (scene == 2)
    {
    	
    }
}

function resize()
{
	if(bFullScreen==true)
	{
		canvas.width=window.innerWidth;
		canvas.height=window.innerHeight;
	}
	else
	{
		canvas.width=canvas_original_width;
		canvas.height=canvas_original_height;
	}

	//console.log("Resize: canvas width=" + canvas.width + " canvas height = " + canvas.height);
	gl.viewport(0, 0, canvas.width, canvas.height);
	mat4.perspective(perspectiveProjectionMatrix, 45.0, canvas.width/canvas.height, 0.1, 20000.0);

}

function toggleFullScreen()
{
	var fullscreen_element = document.fullscreenElement ||
							 document.webkitFullscreenElement ||
							 document.mozFullScreenElement ||
							 document.msFullscreenElement || null;

	if (fullscreen_element == null)
	{
		if (canvas.requestFullscreen)
		{
			canvas.requestFullscreen();
		}
		else if (canvas.mozRequestFullScreen)
		{
			canvas.mozRequestFullScreen();
		}
		else if (canvas.webkitRequestFullscreen)
		{
			canvas.webkitRequestFullscreen();
		}
		else if (canvas.msRequestFullscreen)
		{
			canvas.msRequestFullscreen();
		}

		bFullScreen = true;
	}
	else
	{
		if (document.exitFullScreen)
		{
			document.exitFullscreen();
		}
		else if (document.mozCancelFullScreen)
		{
			document.mozCancelFullScreen();
		}
		else if (document.webkitExitFullscreen)
		{
			document.webkitExitFullscreen();
		}
		else if (document.msExitFullscreen)
		{
			document.msExitFullscreen();
		}

		bFullScreen = false;
	}
}

function uninitialize()
{
    if(vao_triangle)
    {
        gl.deleteVertexArray(vao_triangle);
        vao_triangle = null;
    }

    if(vbo)
    {
        gl.deleteBuffer(vbo);
        vbo = null;
    }

    if(shaderProgramObj)
    {
        if(fragmentShaderObj)
        {
            gl.detachShader(shaderProgramObj,fragmentShaderObj);
            gl.deleteShader(fragmentShaderObj);
            fragmentShaderObj = null;
        }

        if(vertexShaderObj)
        {
            gl.detachShader(shaderProgramObj, vertexShaderObj);
            gl.deleteShader(vertexShaderObj);
            vertexShaderObj = null;
        }

        gl.deleteProgram(shaderProgramObj);
        shaderProgramObj = null;
    }

	fadeInOutEffect.deallocate();
}

function UpdateMoveSensitivity(sensitivity)
{
	move_sensitivity = sensitivity;
}

function keyDown(event)
{
	switch(event.keyCode)
	{
		case 68: //D
			MoveCameraRight(move_sensitivity);
		break;
		case 65: //A
			MoveCameraLeft(move_sensitivity);
		break;
		case 87: //w
			MoveCameraFront(move_sensitivity);
		break;
		case 83: //s
			MoveCameraBack(move_sensitivity);
		break;
		case 'N':
		case 'n':
			scene = scene + 1;
			break;	
		break;
		case 27:
			uninitialize();
			window.close();
		break;
		case 70:
			toggleFullScreen();
		break;
            
        case 80:
            console.log("Camera position: " + camera_position);
            console.log("X rotation: " + x_rotation);
            console.log("Y rotation: " + y_rotation);
            break;
	}
}

function onMouseDown(e)
{
	//code
	last_x = e.pageX;
	last_y = e.pageY;
	is_mouse_pressed = true;
}

function onMouseUp()
{
	is_mouse_pressed = false;
}

function onMouseOut()
{
	is_mouse_pressed = false;
}

function onMouseMove(e)
{
	if (is_mouse_pressed) {

		UpdateCameraXY(e.pageX, e.pageY);
	}
}
