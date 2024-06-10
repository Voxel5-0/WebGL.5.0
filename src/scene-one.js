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

function InitializeSceneOne() {
  var scene_one_height_map_image = "src/resources/textures/terrain.png";
  var scene_one_blend_map = "src/resources/textures/BlendMap.png";
  var scene_one_rock_1_image = "src/resources/textures/rock.png";
  var scene_one_rock_2_image = "src/resources/textures/snow.jpg";
  var scene_one_path_image = "src/resources/textures/ground.jpg";
  var scene_one_snow_image = "src/resources/textures/snow.jpg";

  var scene_one_tree_one_model_obj_file = "src\\resources\\models\\intro\\Palace_withColors.obj";
  //var scene_one_tree_two_model_obj_file = "src\\resources\\intro\\scene_one_tree_two_model.obj";

  var scene_one_tree_one_model_texture_image = "src\\resources\\models\\intro\\TCom_Metal_BrassPolished_header.jpg";
  //var scene_one_tree_two_model_texture_image = "src\\resources\\models\\scene_one_tree_two_texture.png";

  const skyboxTexturesForScene1 = [ 
    "src/resources/textures/skybox/Scene1/right.jpg", 
    "src/resources/textures/skybox/Scene1/left.jpg", 
    "src/resources/textures/skybox/Scene1/top.jpg",
    "src/resources/textures/skybox/Scene1/bottom.jpg",
    "src/resources/textures/skybox/Scene1/front.jpg", 
    "src/resources/textures/skybox/Scene1/back.jpg"
];

  initAssimpModelShader(); 
  pTrail_initialize();
  // createReflectionFBO();
  // createRefractionFBO(); 
  reflection_fbo = GenerateFramebuffer(1920, 1920);
	refraction_fbo = GenerateFramebuffer(1920, 1920);
  initializeWater();
  LoadSkyboxTextures(skyboxTexturesForScene1, 1);

}


function RenderSceneOne() {
  var view_matrix = GetCameraViewMatrix();

  gl.useProgram(null);
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, null);
  
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
  renderAssimpModel(modelMatrix);
  pTrail_display(modelMatrix, perspectiveProjectionMatrix);
  //render skybox for reflection FBO 
  DrawSkybox(SCENE_ONE);  
  unbindFBO();

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
  renderAssimpModel(modelMatrix);
  pTrail_display(modelMatrix, perspectiveProjectionMatrix);
  unbindFBO();

  //Render castle for actual scene
  var modelMatrix = mat4.create()
	mat4.rotate(modelMatrix, modelMatrix, 0, [0.0, 0.0, 0.0])
	mat4.translate(modelMatrix, modelMatrix, [0.0, 0.0, -10.0])
  renderAssimpModel(modelMatrix);
  //Render skybox for actual scene
  DrawSkybox(SCENE_ONE);
  pTrail_display(modelMatrix, perspectiveProjectionMatrix);
  RenderWater(reflection_fbo.cbo,refraction_fbo.cbo,refraction_fbo.dbo);

}

function UpdateSceneOne() {
  pTrail_update();
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

  UninitializeTerrainData(SCENE_ONE);
  UninitializeModelRenderer(scene_one_tree_one_model);
  UninitializeModelRenderer(scene_one_tree_two_model);

  pTrail_uninitialize();
  uninitializeWater();
}
