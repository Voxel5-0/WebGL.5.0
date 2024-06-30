/*********************************************************************************
 * 
 * SCENE Description :
 * 
 * Time - 31.0 to 1.00 end not decides 
 * 
 * Start intro to demo Scene
 * Follow structure similar to that of disney intro https://www.youtube.com/watch?v=cv6ncEYLRlk
 * Effects used:
   ●	Particle System for Fireworks - Pending

    
*/

var SCENE_ZERO = 0;
var scene_zero_AMC_title_texture;
var bool_start_ptrail_update = false;
var scene_zero_init_flag = false;

/*----------------------------------- Camera Contol Points and variables -----------------------------------*/
const scene_zero_controlPoints = [
  [-5.99579627507126, -0.983638457861292, 35.95826514464386, -62.4429236732048, -570.19999999998],
  [-5.243557997172071, -3.4811357751406176, 21.678070445282525, -23.042920367320533, -544.7999999995],
  [-2.9448600533500287, -19.595267421016295, -24.700377140328975, -10.24292036, -576.2],
  [60.6748741583053, -47.665544074232514, -9.0377138685706, -21.642920367320475, -633.3999999999999],
  [137.52516631157724, -81.33711919060856, -5.38612557063494, -13.042920367320477, -630.9999999999997],
  [179.3081591306077, -97.33037030294784, -3.89842326914559, -5.242920367320477, -630.9999999999995]
];

/*----------------------------------- Point Light Variables and Positions -----------------------------------*/
var scene_zero_lightPositions = [
  [13.21327183125484, -67.44632010003868, -4.840837788952009], //middle
  [9.958236978785187, -87.20368404972493, 4.3888549228581475], //left
  [10.240470221367731, -86.58628336655747, -14.213709470661364], //right
  [30.354274982918096, -82.16404503148408, -5.308960274678841], //middleBottom
  [10.037352469619046, -94.20165532734516, 23.91656258654752], //Left-pit
  [11.225923093363434, -95.20251447029362, -35.5777721241391], //Right-pit
  [3.519062612861857, -51.2143286217448, -10.05733734202175], //longTowerbottom
  [7.394419029927332, -37.85214289591929, -11.998835777015215], //longTowerTop
];
var scene_zero_lightColors = [1, 0.776, 0.559];
var scene_zero_light_count = 8;


/*----------------------------------- Scene One Initialise -----------------------------------*/

function InitializeSceneZero() {
  let scene_zero_skyboxTextures = [ 
    "src/resources/textures/skybox/Scene1/right.jpg", 
    "src/resources/textures/skybox/Scene1/left.jpg", 
    "src/resources/textures/skybox/Scene1/top.jpg",
    "src/resources/textures/skybox/Scene1/bottom.jpg",
    "src/resources/textures/skybox/Scene1/front.jpg", 
    "src/resources/textures/skybox/Scene1/back.jpg"
  ];
  InitializeQuadRendererXY();
  LoadSkyboxTextures(scene_zero_skyboxTextures, 0);
  var scene_zero_AMC_title_texture_path = "src\\resources\\textures\\Titles\\Astromedicomp.png";
  scene_zero_AMC_title_texture = loadTexture(scene_zero_AMC_title_texture_path, false) 
  scene_zero_init_flag = true;
}


/*----------------------------------- Scene One Render -----------------------------------*/
function RenderSceneZero() {
  var view_matrix = GetCameraViewMatrix();
  let fogColor = [0.8, 0.9, 1, 1];
  gl.useProgram(null);
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, null);

  /*----------------------------------- Rendering For Reflection FBO -----------------------------------*/
  gl.bindFramebuffer(gl.FRAMEBUFFER, reflection_fbo.fbo);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  turnCameraReflectionOn();                        
  animateWater();     
  //just castle model for reflection : index 1
	var scene1_modelMatrix = mat4.create()
	mat4.translate(scene1_modelMatrix, scene1_modelMatrix, [0.0, 0.0, -10.0])
  renderAssimpModel(scene1_modelMatrix,1,scene_zero_light_count,scene_zero_lightPositions,scene_zero_lightColors,1,fogColor,1.0);
  DrawSkybox(SCENE_ZERO);  
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);

  /*----------------------------------- Rendering For Refraction FBO -----------------------------------*/
  gl.bindFramebuffer(gl.FRAMEBUFFER, refraction_fbo.fbo);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  turnCameraReflectiOff();
  DrawSkybox(SCENE_ZERO);
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);


  /*----------------------------------- Actual Scene One -----------------------------------*/
  gl.bindFramebuffer(gl.FRAMEBUFFER, finalScene_fbo.fbo);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  //castle complete model : index 0
  mat4.identity(scene1_modelMatrix)
	mat4.translate(scene1_modelMatrix, scene1_modelMatrix, [0.0, 0.0, -10.0])
  renderAssimpModel(scene1_modelMatrix,0,scene_zero_light_count,scene_zero_lightPositions,scene_zero_lightColors,1,fogColor,1.0,1);
  DrawSkybox(SCENE_ZERO);

  if(bool_start_ptrail_update){
    //One space key press- trail and AMC title
    pTrail_display(scene1_modelMatrix, perspectiveProjectionMatrix);
    mat4.identity(scene1_modelMatrix);
    mat4.translate(scene1_modelMatrix, scene1_modelMatrix, [0.0, -2.0, -7.0])
    mat4.scale(scene1_modelMatrix, scene1_modelMatrix,[1.6 , 1.2 , 1.2]);
    mat4.scale(scene1_modelMatrix, scene1_modelMatrix,[0.5 + 1.5 , 0.5 + 1  , 0.5 + 1]);
    var view = mat4.create();
    RenderWithTextureShaderMVP(scene1_modelMatrix,view,perspectiveProjectionMatrix,scene_zero_AMC_title_texture, 0);
  }
  //displayGrass();
  RenderWater(reflection_fbo.cbo,refraction_fbo.cbo,refraction_fbo.dbo,515.9000000000044,0,402.6000000000021,0);

  pfc_display();

  tst_display();
  // fadeOut();

  gl.bindFramebuffer(gl.FRAMEBUFFER, null);


  /*----------------------------------- Post Processing on Scene -----------------------------------*/
  //RenderWithFBMTextureShader(finalScene_fbo.cbo, 0);
   RenderWithTextureShader(finalScene_fbo.cbo, 0);
}



/*----------------------------------- Scene One Update -----------------------------------*/
var scene_zero_StartTime = 70.0;
var scene_zero_duration = 30.0;

var scene_tst_one = 2.0;

function UpdateSceneZero() {
  let currentTime = performance.now() / 1000;

  if (startTime == 0) {
    startTime = currentTime;
    console.log("Start time initialized in scene zero :" + startTime);
  }
  if (scene_zero_StartTime <= currentTime && scene_zero_StartTime + scene_zero_duration > currentTime) {
    bezierCurve(scene_zero_controlPoints, currentTime, scene_zero_StartTime, scene_zero_duration);
  } else{
    // scene++ ;
  }

  if (scene_zero_StartTime <= currentTime) {
    fadeIn();
  }

  if(scene_zero_StartTime + scene_zero_duration - scene_tst_one < currentTime){
    fadeOut();
  }

  if(bool_start_ptrail_update){
    pTrail_update();
  }
}

/*----------------------------------- Scene One  Uninitialize -----------------------------------*/
function UninitializeSceneZero() {
    scene_zero_init_flag = false;

    // pfc_uninitialize();
}
