var canvas = null;
var gl = null;
var bFullScreen = false;
var canvas_original_width;
var canvas_original_height;
// var move_sensitivity = 1.1;  // change this DJ
var move_sensitivity = 10.0;
var fadeInOutEffect = null;
var test_translate_X = 0.0;
var test_translate_Y = 0.0 ;
var test_translate_Z = 0.0;

var test_scale_X = 1.0;
var test_scale_Y = 1.0 ;
var test_scale_Z = 1.0;

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
							[188.54773835466648,-105,4.046151170852721], 	//scene one camera initial position
							[287.0499275829001,100.0489134224825,2020.4465969962635], // scene seven camera initial position
							[287.0499275829001,779.0489134224825,2020.4465969962635], 	//scene two camera initial position
							[298.5107073089176,785.1349368758114,2085.443908695071],     //scene three camera initial position
						 	[582.603042074097,259.96511411123737,630.7985127382476],
							[313.8060977313394,-14.586146289716707,349.4001499645148]
						];

// Camera position: 1869.1399715022253,1182.981200138941,3539.959281976318
// main.js:407 X rotation: -10.042920367320503
// main.js:408 Y rotation: -97.39999999999996

//TODO : conly camera andle y is used , Need to add Camera angle X as well for starting position
var scene_camera_angles =  [
								0.0, //scene zero
								-278.0,	//scene one
								-505.0 // scene seven
								-170.0,	//scene two
								-88.39999999999996,	//scene three
								-136.60000000000002, //scene four
								-139.0 //scene four
						  ];

var scene_camera_anglesX =  [
								0.0, //scene zero
								0.0,	//scene one
							    -7.0 // scene seven
						];

//TODO: keeping assmip model list and loading global , not right approch , we should change it later
//This is done to solve the problem for synchronisity
var modelList = [
	//{ name: "Castle", files:[ 'palace/WALT_DISNEY_PICTURES_2006_LOGO.dae' ], flipTex:true },
	//{ name: "Castle", files:[ 'src\\resources\\models\\intro\\CastleWithMaterials.obj', 'src\\resources\\models\\intro\\CastleWithMaterials.mtl'], flipTex:false , isStatic : true },
	//{ name: "Room", files:[ 'src\\resources\\models\\scene3\\Room_With_Girl (1)\\RoomWithGirl.gltf', 'src\\resources\\models\\scene3\\Room_With_Girl (1)\\RoomWithGirl.bin'], flipTex:true , isStatic : true },
	//{ name: "Bridge", files:[ 'src\\resources\\models\\scene4\\bridge\\bridge_1.obj', 'src\\resources\\models\\scene4\\bridge\\bridge_1.mtl'], flipTex:true , isStatic : true },
	//{ name: "BridgePart", files:[ 'src\\resources\\models\\scene4\\bridge\\bridge_part.obj', 'src\\resources\\models\\scene4\\bridge\\bridge_part.mtl'], flipTex:false , isStatic : true },
	{ name: "GirlPose1", files:[ 'src\\resources\\models\\main_character\\pose1\\Rapunzel_Pose1.obj', 'src\\resources\\models\\main_character\\pose1\\Rapunzel_Pose1.mtl'], flipTex:true , isStatic : true },
	//{ name: "GirlPose2", files:[ 'src\\resources\\models\\main_character\\pose2\\Rapunzel_Pose2.obj', 'src\\resources\\models\\main_character\\pose2\\Rapunzel_Pose2.mtl'], flipTex:true , isStatic : true },
	//{ name: "GirlPose3", files:[ 'src\\resources\\models\\main_character\\pose3\\Rapunzel_Pose3.obj', 'src\\resources\\models\\main_character\\pose3\\Rapunzel_Pose3.mtl'], flipTex:false , isStatic : true },
	// { name: "Bridge", files:[ 'src\\resources\\models\\intro\\CastleWithMaterials.obj', 'src\\resources\\models\\intro\\CastleWithMaterials.mtl'], flipTex:false , isStatic : true },
	// { name: "Lanturn", files:[ 'src\\resources\\models\\intro\\CastleWithMaterials.obj', 'src\\resources\\models\\intro\\CastleWithMaterials.mtl'] ,flipTex:false , isStatic : true },
	{ name: "RainbowTerrain", files:[ 'src\\resources\\models\\scene7\\Terrain_4.gltf', 'src\\resources\\models\\scene7\\Terrain_4.bin'] ,flipTex:false , isStatic : true },
	{ name: "Bushes_1", files:[ 'src\\resources\\models\\scene7\\Bushes_1.gltf', 'src\\resources\\models\\scene7\\Bushes_1.bin'] ,flipTex:false , isStatic : true },
	{ name: "Flowers_1", files:[ 'src\\resources\\models\\scene7\\Flowers_1.gltf', 'src\\resources\\models\\scene7\\Flowers_1.bin'] ,flipTex:false , isStatic : true },
]

var grayscale = 1;
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

	fadeInOutEffect = new FadeInOutEffect();
	fadeInOutEffect.allocate();

	/*Scene Specific Initialization */
	InitializeSceneOne();
	//InitializeSceneTwo();
	//InitializeSceneThree();
	//InitializeSceneFour();
	//InitializeSceneFive();
	InitializeSceneSeven();

	/* Other initializers */
	InitializeCamera();
	UpdateCameraPosition(scene_camera_positions[scene]);
	UpdateCameraAngleY(scene_camera_angles[scene]);
	UpdateCameraAngleX(scene_camera_anglesX[scene]);
	cameraInitialPositionForScene[scene] = 1;
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

var cameraInitialPositionForScene = [];

function draw(now)
{
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	if(cameraInitialPositionForScene[scene] != 1){
		console.log("Setting initial camera position for scene "+scene);
		UpdateCameraPosition(scene_camera_positions[scene]);
		UpdateCameraAngleY(scene_camera_angles[scene]);
		cameraInitialPositionForScene[scene] = 1;
	}
	switch(scene){
		case 0 :
			RenderSceneZeroOpeningScene();
			break;
		case 1 :
			RenderSceneOne();
			break;
		case 2 :
			UninitializeSceneOne();
			RenderSceneSeven();  // change it later DJ
    		//RenderSceneTwo();
			break;
		case 3 :
			//UninitializeSceneTwo();
			//RenderSceneThree();
			break;
		case 4 : 
			//UninitializeSceneThree();
    		//RenderSceneFour();
			break;
		case 5 : 
			//UninitializeSceneFour();
    		//RenderSceneFive();
			break;
		case 6 : 
			break;
		case 7 : 
			//UninitializeSceneFive(); // change it later to scene six DJ
    		//RenderSceneSeven();
			break;
			
	}
    requestAnimationFrame(draw, canvas);
    update(now);
}

function update(now)
{

	switch(scene){
		case 0:
			break;
		case 1 :
			//UpdateSceneOne();
			break;
		case 2:
			UpdateSceneSeven();  // change it later DJ
			break;
		case 3 :
			//UpdateSceneThree();
			break;
		case 4:
			//UpdateSceneFour();
			break;
		case 5:
			break;	
		case 6:
			break;
		case 7:
			// UpdateSceneSeven(); // change it later DJ
			break;

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

	switch(event.code){
		case 'KeyN':
			scene = scene + 1;
			console.log("Moving to scene :"+scene);
			break;	
		break;
		
		case 'KeyB':
			scene = scene - 1;
			console.log("Moving to scene :"+scene);
			break;
		case 'KeyG':
			grayscale = 0;
			console.log("Converting to grayscale");
			break;		
				
	}

	switch(event.keyCode)
	{
		case 68: //D
			MoveCameraRight(move_sensitivity*2);
		break;
		case 65: //A
			MoveCameraLeft(move_sensitivity*2);
		break;
		case 87: //w
			MoveCameraFront(move_sensitivity*2);
		break;
		case 83: //s
			MoveCameraBack(move_sensitivity*2);
		break;

		case 88:
				test_translate_X += move_sensitivity;
			break;	
		case 89:
				test_translate_Y += move_sensitivity;
			break;
		case 90:
				test_translate_Z += move_sensitivity;
			break;		

		case 120:
				test_translate_X -= move_sensitivity;
			break;	
		case 121:
				test_translate_Y -= move_sensitivity;
			break;
		case 122:
				test_translate_Z -= move_sensitivity;
			break;			
		
		case 49:
				test_scale_X += move_sensitivity;
			break;	
		case 50:
				test_scale_Y += move_sensitivity;
			break;
		case 51:
				test_scale_Z += move_sensitivity;
			break;		
		case 32:
			//start - trail
			console.log("Start particle trail "+bool_start_ptrail_update);
			bool_start_ptrail_update = true;
			console.log("Start particle trail "+bool_start_ptrail_update);
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
			console.log("X , Y ,Z  adjustments:" + test_translate_X +" , "+ test_translate_Y +" , "+test_translate_Z);
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
		//console.log("camera mouse X: " + e.pageX);
		//console.log("camera mouse Y: " + e.pageY);
	}
}
