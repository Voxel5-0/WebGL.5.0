var canvas = null;
var gl = null;
var bFullScreen = false;
var canvas_original_width;
var canvas_original_height;
var move_sensitivity = 1.1;
var fadeInOutEffect = null;
var test_translate_X = 0.0;
var test_translate_Y = 0.0 ;
var test_translate_Z = 0.0;

var test_scale_X = 1.0;
var test_scale_Y = 1.0 ;
var test_scale_Z = 1.0;

var temp_x = 1000.0;
var temp_y = 300.0;
var temp_z = 1800.0;

var test_angleRotation= 0.0;

var fbo_width = 1920;
var fbo_height = 1080;

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
var scene = 0;

var scene_camera_positions;
scene_camera_positions = [
							[188.54773835466648,-105,4.046151170852721],     //scene zero camera initial position,
							[188.54773835466648,-105,4.046151170852721], 	//scene one camera initial position
							[188.54773835466648,-105,4.046151170852721], 	//scene two camera initial position
							[188.54773835466648,-105,4.046151170852721],     //scene three camera initial position
						 	[188.54773835466648,-105,4.046151170852721],	//four
							[188.54773835466648,-105,4.046151170852721],	//five
							[188.54773835466648,-105,4.046151170852721], // scene six camera initial position,
							[188.54773835466648,-105,4.046151170852721], // scene seven camera initial position
							[188.54773835466648,-105,4.046151170852721],	//eight
						];

// Camera position: 1869.1399715022253,1182.981200138941,3539.959281976318
// main.js:407 X rotation: -10.042920367320503
// main.js:408 Y rotation: -97.39999999999996

//TODO : conly camera andle y is used , Need to add Camera angle X as well for starting position
var scene_camera_angles =  [
								0.0, //scene zero
								-278.0,	//scene one
								-170.0,	//scene two
								-88.39999999999996,	//scene three
								-136.60000000000002, //scene four
								-139.0, //scene five
								-139.0, //scene six
								-139.0, //scene seven
								-68.0 //scene eight
						  ];

var scene_camera_anglesX =  [
							0.0, //scene zero
							0.0,	//scene one
							0.0,	//scene two
							0.0,	//scene othree
							0.0,	//scene four
							0.0,	//scene five
							0.0,	//scene six
							-7.0, // scene seven
							0.0	//scene eight
					];

//TODO: keeping assmip model list and loading global , not right approch , we should change it later
//This is done to solve the problem for synchronisity
var modelList = [
	{ name: "Castle",	 	files:[ 'src\\resources\\models\\intro\\CastleWithMaterials.obj', 'src\\resources\\models\\intro\\CastleWithMaterials.mtl'],								flipTex:false,	isStatic : true , isInstanced :false, instanceCount : 1},
	{ name: "CastleReflection",	 	files:[ 'src\\resources\\models\\intro\\JustCastle.obj', 'src\\resources\\models\\intro\\JustCastle.mtl'],											flipTex:false,	isStatic : true , isInstanced :false, instanceCount : 1},
	{ name: "Room", 		files:[ 'src\\resources\\models\\scene3\\Room_With_Girl (1)\\RoomWithGirl.gltf', 'src\\resources\\models\\scene3\\Room_With_Girl (1)\\RoomWithGirl.bin'], 	flipTex:true, 	isStatic : true , isInstanced :false, instanceCount : 1},
	{ name: "Bridge", 		files:[ 'src\\resources\\models\\scene4\\bridge\\bridge_1.obj', 'src\\resources\\models\\scene4\\bridge\\bridge_1.mtl'], 									flipTex:true, 	isStatic : true , isInstanced :false, instanceCount : 1},
	{ name: "BridgePart", 	files:[ 'src\\resources\\models\\scene4\\bridge\\bridge_part.obj', 'src\\resources\\models\\scene4\\bridge\\bridge_part.mtl'], 								flipTex:false, 	isStatic : true , isInstanced :false, instanceCount : 1},
	{ name: "GirlPose1", 	files:[ 'src\\resources\\models\\main_character\\pose1\\Rapunzel_Pose1.obj', 'src\\resources\\models\\main_character\\pose1\\Rapunzel_Pose1.mtl'], 			flipTex:true, 	isStatic : true , isInstanced :false, instanceCount : 1},
	{ name: "GirlPose2", 	files:[ 'src\\resources\\models\\main_character\\pose2\\Rapunzel_Pose2.obj', 'src\\resources\\models\\main_character\\pose2\\Rapunzel_Pose2.mtl'], 			flipTex:true, 	isStatic : true , isInstanced :false, instanceCount : 1},
	{ name: "GirlPose3", 	files:[ 'src\\resources\\models\\main_character\\pose3\\Rapunzel_NewPose_3.obj', 'src\\resources\\models\\main_character\\pose3\\Rapunzel_NewPose_3.mtl'], 			flipTex:false, 	isStatic : true , isInstanced :false, instanceCount : 1},
	{ name: "GirlPose4", 	files:[ 'src\\resources\\models\\main_character\\pose4\\Rapunzel_Pose4.obj', 'src\\resources\\models\\main_character\\pose4\\Rapunzel_Pose4.mtl'], 			flipTex:false, 	isStatic : true , isInstanced :false, instanceCount : 1},
	{ name: "mapelTree", 	files:[ 'src\\resources\\models\\scene5\\MapleTree\\tree.obj', 'src\\resources\\models\\scene5\\MapleTree\\tree.mtl'], 										flipTex:true, 	isStatic : true , isInstanced :true, instanceCount : 4 },
	{ name: "FatherPose1", 	files:[ 'src\\resources\\models\\Character2\\Poses\\Father_pose1.obj', 'src\\resources\\models\\Character2\\Poses\\Father_pose1.mtl'], 						flipTex:true, 	isStatic : true , isInstanced :false, instanceCount : 1},
	{ name: "FatherPose2", 	files:[ 'src\\resources\\models\\Character2\\Poses\\Father_pose2.obj', 'src\\resources\\models\\Character2\\Poses\\Father_pose2.mtl'], 						flipTex:true, 	isStatic : true , isInstanced :false, instanceCount : 1},
	// { name: "Bridge", files:[ 'src\\resources\\models\\intro\\CastleWithMaterials.obj', 'src\\resources\\models\\intro\\CastleWithMaterials.mtl'], flipTex:false , isStatic : true },
	// { name: "Lanturn", files:[ 'src\\resources\\models\\intro\\CastleWithMaterials.obj', 'src\\resources\\models\\intro\\CastleWithMaterials.mtl'] ,flipTex:false , isStatic : true },
	// { name: "RainbowTerrain", files:[ 'src\\resources\\models\\scene7\\Terrain_4.gltf', 'src\\resources\\models\\scene7\\Terrain_4.bin'] 												,flipTex:false , isStatic : true, isInstanced :false, instanceCount : 1 },
	// { name: "Bushes_1", 	files:[ 'src\\resources\\models\\scene7\\Bushes_1.gltf', 'src\\resources\\models\\scene7\\Bushes_1.bin'] 													,flipTex:false , isStatic : true, isInstanced :false, instanceCount : 1 },
	// { name: "Flowers_1", 	files:[ 'src\\resources\\models\\scene7\\Flowers_1.gltf', 'src\\resources\\models\\scene7\\Flowers_1.bin'] 													,flipTex:false , isStatic : true, isInstanced :false, instanceCount : 1 },
]

var grayscale = 1;
var models = [];

assimpjs().then (function (ajs) {
	Promise.all(modelList.flatMap(o => o.files).map((fileToLoad) => fetch (fileToLoad))).then ((responses) => {
		return Promise.all(responses.map ((res) => res.arrayBuffer()))
	}).then((arrayBuffers) => {
		var k = 0
		for(var i = 0; i < modelList.length; i++) {
			let fileList = new ajs.FileList()
			for (let j = 0; j < modelList[i].files.length; j++) {
				fileList.AddFile(modelList[i].files[j], new Uint8Array(arrayBuffers[k++]))
			}
			let result = ajs.ConvertFileList(fileList, 'assjson')
			if (!result.IsSuccess() || result.FileCount() == 0) {
				console.log(result.GetErrorCode())
				return
			}
			let resultFile = result.GetFile(0)
			let jsonContent = new TextDecoder().decode(resultFile.GetContent())
			let resultJson = JSON.parse(jsonContent)
			modelList[i].json = resultJson
			modelList[i].directory = modelList[i].files[0].substring(0, modelList[i].files[0].lastIndexOf('/'))
			console.log("Loading Files for Model : " + modelList[i].name + " Done!")
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

	fbo_width = canvas.width;
	fbo_height = canvas.height;

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
		/* Default FBOs Creation*/
		finalScene_fbo = GenerateFramebuffer(fbo_width, fbo_height);
		coloredFinalScene_fbo = GenerateFramebuffer(fbo_width, fbo_height);
		godRays_scene_fbo = GenerateFramebuffer(fbo_width, fbo_height);
		godRays_occlusion_fbo = GenerateFramebuffer(fbo_width, fbo_height);
		godRays_godrays_fbo = GenerateFramebuffer(fbo_width, fbo_height);
		godRays_final_fbo = GenerateFramebuffer(fbo_width, fbo_height);

	/* -- Common Shader/Gemometries/Effects Initialzation */
	InitializeTextureShader();
	InitializeInstanceShader();
	InitializeQuadRenderer();
    InitializeTerrainRenderer();
    InitializeSkybox();
	initAssimpModelShader(scene_zero_light_count); 
	pTrail_initialize(); 
	initializeGrass();
	InitializeVignnetTextureShader();
	initializeWater();
	InitializeGrayScaleTextureShader();

	/*Scene Specific Initialization */
	InitializeSceneZero();
	InitializeSceneOne();
	InitializeSceneTwo();
	InitializeSceneThree();
	InitializeSceneFour();
	InitializeSceneFive();
	InitializeSceneSix();
	InitializeSceneSeven();
	InitializeSceneEight();

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

	//Z-Fighting solution
	// gl.enable(gl.PERSPECTIVE_CORRECTION_HINT);
	// gl.enable(gl.POLYGON_OFFSET_FILL); 
	// gl.polygonOffset(1.0, 1.0);
	/**
	 * Pending 
	 * Use Floating-Point Depth Buffer:
	 *  Consider using a floating-point depth buffer (GL_DEPTH_COMPONENT32F) if available,
	 *  which provides better precision compared to the standard depth buffer.
	 */

	gl.clearColor(0.6, 0.6, 0.6, 1.0);
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
			//RenderSceneZeroOpeningScene();
			RenderSceneZero();
			break;
		case 1 :
			RenderSceneOne();
			break;
		case 2 :
			UninitializeSceneOne();
    		RenderSceneTwo();
			break;
		case 3 :
			UninitializeSceneTwo();
			RenderSceneThree();
			break;
		case 4 : 
			UninitializeSceneThree();
    		RenderSceneFour();
			break;
		case 5 : 
			UninitializeSceneFour();
    		RenderSceneFive();
			break;	
		case 6 : 
			UninitializeSceneFive();
    		RenderSceneSix();
			break;	
		case 7:
			UninitializeSceneSix();
			RenderSceneSeven(); 
			break;
		case 8:
			UninitializeSceneSeven();
			RenderSceneEight(); 
			break;

	}
    requestAnimationFrame(draw, canvas);
    update(now);
}

function update(now)
{

	switch(scene){
		case 0:
			UpdateSceneZero();
			break;
		case 1 :
			UpdateSceneOne();
			break;
		case 2:
			break;
		case 3 :
			UpdateSceneThree();
			break;
		case 4:
			UpdateSceneFour();
			break;
		case 5:
			UpdateSceneFive();
			break;	
		case 6:
			UpdateSceneSix();
			break;					
		case 7:
			UpdateSceneSeven();
			break;				
		case 8:
			UpdateSceneEight();
			break;				
	}
}

function resize()
{
	if(bFullScreen==true)
	{
		canvas.width=window.innerWidth;
		canvas.height=window.innerHeight;

		fbo_width = canvas.width;
		fbo_height = canvas.height;
	}
	else
	{
		canvas.width=canvas_original_width;
		canvas.height=canvas_original_height;

		fbo_width = canvas.width;
		fbo_height = canvas.height;
	}

	finalScene_fbo = GenerateFramebuffer(fbo_width, fbo_height);
	coloredFinalScene_fbo = GenerateFramebuffer(fbo_width, fbo_height);
	reflection_fbo = GenerateFramebuffer(fbo_width, fbo_height);
	refraction_fbo = GenerateFramebuffer(fbo_width, fbo_height);
	godRays_scene_fbo = GenerateFramebuffer(fbo_width, fbo_height);
    godRays_occlusion_fbo = GenerateFramebuffer(fbo_width, fbo_height);
    godRays_godrays_fbo = GenerateFramebuffer(fbo_width, fbo_height);
	godRays_final_fbo = GenerateFramebuffer(fbo_width, fbo_height);

	//console.log("Resize: canvas width=" + canvas.width + " canvas height = " + canvas.height);
	gl.viewport(0, 0, canvas.width, canvas.height);
	mat4.perspective(perspectiveProjectionMatrix, 45.0, canvas.width/canvas.height, 0.1, 1000.0);
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
	//TODO : add uninitialize calls

	fadeInOutEffect.deallocate();
	if(scene_zero_init_flag){
		UninitializeSceneZero();
	}
	

}

function UpdateMoveSensitivity(sensitivity)
{
	move_sensitivity = sensitivity;
}

function keyDown(event)
{

	switch(event.code){
		case 'KeyN':
			if(scene<SCENE_COUNT){
				if(scene == 1 && scene_one_showTitle){
					scene_one_showTitle = false;
					console.log("Moving to actual scene from titles");
				}else{
					scene = scene + 1;
					console.log("Moving to scene :"+scene);
				}
			}else{
				console.log("Scene "+scene+" was last scene");
			}
			break;
		
		case 'KeyB':
			if(scene > 1){
				scene = scene - 1;
				console.log("Moving to scene :"+scene);
			}else{
				console.log("Scene "+scene+" was first scene");
			}
			break;

		case 'KeyG':
			bAnimateGrayscale = !bAnimateGrayscale;
			console.log("Converting to grayscale");
			break;	
		case 'KeyR':
			test_angleRotation+=0.01;
			break;	
		case "Numpad7"://7
			temp_x += 100.0;
			break;	
		case "Numpad4"://4
			temp_x -= 100.0;
			break;	
		case "Numpad8"://8
			temp_y += 100.0;
			break;	
		case "Numpad5"://5
			temp_y -= 100.0;
			break;	
		case "Numpad9"://9
			temp_z += 100.0;
			break;	
		case "Numpad6"://6
			temp_z -= 100.0;
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

		case 88://x
				test_translate_X += move_sensitivity;
			break;	
		case 89://y
				test_translate_Y += move_sensitivity;
			break;
		case 90://z
				test_translate_Z += move_sensitivity;
			break;		

		// case 49://1
		// 	test_translate_X -= move_sensitivity;
		// 	break;	
		// case 50://2
		// 		test_translate_Y -= move_sensitivity;
		// 	break;	
		// case 51://3
		// 		test_translate_Z -= move_sensitivity;
		// 	break;	
		// case 52://4
		// 		test_scale_X += move_sensitivity;
		// 	break;	
		// case 53://5
		// 		test_scale_X -= move_sensitivity;
		// 	break;	
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
		case 70://F
			document.getElementById('audio').play();
			toggleFullScreen();
		break;
            
        case 80://p
            console.log("Camera position: " + camera_position);
            console.log("X rotation: " + x_rotation);
            console.log("Y rotation: " + y_rotation);
			console.log("X , Y ,Z  adjustments: " + test_translate_X +" , "+ test_translate_Y +" , "+test_translate_Z);
			console.log("Scale :" + test_scale_X);
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
