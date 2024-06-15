/*********************************************************************************
 * 
 * SCENE Description :
 * Start intro to demo Scene
 * Follow structure similar to that of disney intro https://www.youtube.com/watch?v=cv6ncEYLRlk
 * Effects used:
   ●	Particle System for star - Trail around castle done
   ●	Particle System for Fireworks - Pending
   ●	Particle System - which is followed ny camera - Pending

    Low Poly Tree - Pending
    Water effect with reflection - Done - TODO : Camera and reflection correction
    Waterfall - Pending
    Castle  - Done - Pending TODO PBR

    Camera - Pending - follow same as video
*/

var SCENE_ONE = 1;

var scene_one_tree_one_model;
var scene_one_tree_two_model;

var scene_one_tree_model_one_texture;
var scene_one_tree_model_two_texture;

var scene_one_tree_model_matrices_vbo;
var scene_one_tree_two_model_matrices_vbo;

var scene_one_tree_model_instances = 1;

var scene_one_tree_x;
var scene_one_tree_y;
var scene_one_tree_z;

var bool_start_ptrail_update = false;

var light_count = 8;

function InitializeSceneOne() {
  
  const skyboxTexturesForScene1 = [ 
    "src/resources/textures/skybox/Scene1/right.jpg", 
    "src/resources/textures/skybox/Scene1/left.jpg", 
    "src/resources/textures/skybox/Scene1/top.jpg",
    "src/resources/textures/skybox/Scene1/bottom.jpg",
    "src/resources/textures/skybox/Scene1/front.jpg", 
    "src/resources/textures/skybox/Scene1/back.jpg"
];

  initAssimpModelShader(light_count); 
  pTrail_initialize(); 
  
  finalScene_fbo = GenerateFramebuffer(1920, 1080);
  reflection_fbo = GenerateFramebuffer(1920, 1080);
	refraction_fbo = GenerateFramebuffer(1920, 1080);


  initializeWater();
  InitializeGrayScaleTextureShader();
  InitializeQuadRendererXY();
  LoadSkyboxTextures(skyboxTexturesForScene1, 1);
}


function RenderSceneOne() {
  var view_matrix = GetCameraViewMatrix();

  gl.useProgram(null);
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, null);
  
  //Uniforms for point lights
  var lightPositions = [
    [13.21327183125484, -67.44632010003868, -4.840837788952009], //middle
    [9.958236978785187, -87.20368404972493, 4.3888549228581475], //left
    [10.240470221367731, -86.58628336655747, -14.213709470661364], //right
    [30.354274982918096, -82.16404503148408, -5.308960274678841], //middleBottom
    [10.037352469619046, -94.20165532734516, 23.91656258654752], //Left-pit
    [11.225923093363434, -95.20251447029362, -35.5777721241391], //Right-pit
    [3.519062612861857, -51.2143286217448, -10.05733734202175], //longTowerbottom
    [7.394419029927332, -37.85214289591929, -11.998835777015215], //longTowerTop
  ];

  var lightColors = [1, 0.776, 0.559];

  
  animateWater();
  //Render in Reflection FBO
  //bindReflectionFBO();
  gl.bindFramebuffer(gl.FRAMEBUFFER, reflection_fbo.fbo);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  CameraReflect();
  //render disney castle model for reflection FBO 
	var modelMatrix = mat4.create()
	mat4.rotate(modelMatrix, modelMatrix, 0, [0.0, 0.0, 0.0])
	mat4.translate(modelMatrix, modelMatrix, [0.0, 0.0, -10.0])
  renderAssimpModel(modelMatrix,0,light_count,lightPositions,lightColors);
  pTrail_display(modelMatrix, perspectiveProjectionMatrix);
  //render skybox for reflection FBO 
  DrawSkybox(SCENE_ONE);  
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);

  //Render in Refraction FBO
  gl.bindFramebuffer(gl.FRAMEBUFFER, refraction_fbo.fbo);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  CameraReflect();
  //render skybox for refraction FBO 
  DrawSkybox(SCENE_ONE);
  //render disney castle model for refraction FBO 
  var modelMatrix = mat4.create()
	mat4.rotate(modelMatrix, modelMatrix, 0, [0.0, 0.0, 0.0])
	mat4.translate(modelMatrix, modelMatrix, [0.0, 0.0, -10.0])
  renderAssimpModel(modelMatrix,0,light_count,lightPositions,lightColors);
  pTrail_display(modelMatrix, perspectiveProjectionMatrix);
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);


  //Render final scene in final buffer
  gl.bindFramebuffer(gl.FRAMEBUFFER, finalScene_fbo.fbo);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  //Render castle for actual scene
  var modelMatrix = mat4.create()
	mat4.rotate(modelMatrix, modelMatrix, 0, [0.0, 0.0, 0.0])
	mat4.translate(modelMatrix, modelMatrix, [0.0, 0.0, -10.0])
  renderAssimpModel(modelMatrix,0,light_count,lightPositions,lightColors);
  //Render skybox for actual scene
  DrawSkybox(SCENE_ONE);
  pTrail_display(modelMatrix, perspectiveProjectionMatrix);
  RenderWater(reflection_fbo.cbo,refraction_fbo.cbo,refraction_fbo.dbo);
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);


  //Render final scene with grayscale
  var model_matrix = mat4.create();
  RenderWithGrayScaleTextureShader(finalScene_fbo.cbo, 0);
}

function UpdateSceneOne() {
  if(bool_start_ptrail_update == true){
    pTrail_update();
  }
}

function UninitializeSceneOne() {
 
  if (scene_one_tree_model_one_texture)
  {
    gl.deleteTexture(scene_one_tree_model_one_texture);
  }

  if (scene_one_tree_model_two_texture)
  {
    gl.deleteTexture(scene_one_tree_model_two_texture);
  }

  // UninitializeTerrainData(SCENE_ONE);
  // UninitializeModelRenderer(scene_one_tree_one_model);
  // UninitializeModelRenderer(scene_one_tree_two_model);

  // pTrail_uninitialize();
  // uninitializeWater();
}
