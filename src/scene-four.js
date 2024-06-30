/*********************************************************************************
 * 
 * SCENE Description :
 * 
 * Here we need a sound effect and on screen we are able see river flowing 
 * Bridge scene – b&w to color transition
 * 
 * Time : 1.26 to 2.19
 * 
*/

//camera position to see bridge
//1570.2434640288338,-93.22419543218302,3530.6151734854398 , 2.245201098695191 , -54.999999999997975


//bridge position
//2778.607833344282,-284.1836686699762,2523.7304319691375 , 10.845201098695203 , -37.79999999999799

var SCENE_FOUR = 4;
/*----------------------------------- Camera Contol Points and variables -----------------------------------*/
const Scene4_controlPoints = [
  [582.603042074097,259.96511411123737,630.7985127382476, -51.2495708900399, -136.60000000000002],
  [254.51460638786335,-24.475212286155987,144.58837186006048, -10.965719236359957, -159.99999999999994],
  [250.9429927679908,-13.866135666511283,293.567447006224, -14.765719236359963, -139.5999999999999],
  [331.8755808288752,9.361228072694807,397.0786166951646, -8.365719236359967, -164.7999999999998]
  //[137.52516631157724, -81.33711919060856, -5.38612557063494, -13.042920367320477, -630.9999999999997],
  //[179.3081591306077, -97.33037030294784, -3.89842326914559, -5.242920367320477, -630.9999999999995]
];

/*----------------------------------- Scene Four Initialise -----------------------------------*/
function InitializeSceneFour()
{
  var scene_four_height_map_image = "src/resources/textures/terrain.png";
  var scene_four_blend_map        = "src/resources/textures/BlendMap.png";
  var scene_four_rock_1_image     = "src/resources/textures/ground.jpg";
  var scene_four_rock_2_image     = "src/resources/textures/soil.jpg";
  var scene_four_path_image       = "src/resources/textures/ground.jpg";
  var scene_four_snow_image       = "src/resources/textures/soil.jpg";

  InitializeHeightMapTerrain(scene_four_height_map_image,scene_four_blend_map,scene_four_rock_1_image,scene_four_rock_2_image,scene_four_path_image,scene_four_snow_image,4);  
}

/*----------------------------------- Scene Four Render -----------------------------------*/
function RenderSceneFour()
{

  let fogColorModel = [0.8, 0.9, 1, 0.5];
  /*----------------------------------- Rendering For Reflection FBO -----------------------------------*/
  // animateWater();
  // gl.bindFramebuffer(gl.FRAMEBUFFER, reflection_fbo.fbo);
  // gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  // // CameraReflect();
  // //render disney castle model for reflection FBO 
	// var modelMatrix = mat4.create()
  // mat4.translate(modelMatrix, modelMatrix, [0.0, -30.0, -1.0])
  // mat4.scale(modelMatrix,modelMatrix,[10.0,10.0,10.0]);
  // renderAssimpModel(modelMatrix,2,0,[],[],1,fogColorModel,1);
  // //render skybox for reflection FBO 
  // DrawSkybox(SCENE_ZERO);  
  // gl.bindFramebuffer(gl.FRAMEBUFFER, null);

  /*----------------------------------- Rendering For Refraction FBO -----------------------------------*/
  // gl.bindFramebuffer(gl.FRAMEBUFFER, refraction_fbo.fbo);
	// gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  // // CameraReflect();
  // //render skybox for refraction FBO 
  // DrawSkybox(SCENE_ZERO);
  // //Bridge Model 
  // var modelMatrix = mat4.create()
  // mat4.translate(modelMatrix, modelMatrix, [0.0, -30.0, -1.0])
  // mat4.scale(modelMatrix,modelMatrix,[10.0,10.0,10.0]);
  // renderAssimpModel(modelMatrix,3,0,[],[],1,fogColorModel,1);
  // gl.bindFramebuffer(gl.FRAMEBUFFER, null);



  /*----------------------------------- Actual Scene One -----------------------------------*/
  //Render final scene in final buffer grayscale
  gl.bindFramebuffer(gl.FRAMEBUFFER, finalScene_fbo.fbo);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  let fogColor = [0.8, 0.9, 1, 0.5];
  //Render terrain
  if (terrain_data[SCENE_FOUR]) {
    let fogColor = [0.8, 0.9, 1, 0.5];
    let terrain_model_matrix = mat4.create();
    //mat4.scale(terrain_model_matrix,terrain_model_matrix,[10.3  , 11.5 , 10.3]);
    //mat4.translate(terrain_model_matrix,terrain_model_matrix,[10.3  , 10.5 , 10.3]);
    RenderTerrain(terrain_data[SCENE_FIVE], SCENE_FIVE,fogColor ,terrain_model_matrix,0);
  }
  //Render models for actual scene grayscale
  var modelMatrix = mat4.create()
  mat4.translate(modelMatrix, modelMatrix, [481.0,-120, 595.0])
  mat4.scale(modelMatrix,modelMatrix,[18.0,18.0,18.0]);
  mat4.rotateY(modelMatrix, modelMatrix, [90])
  renderAssimpModel(modelMatrix,3,0,[],[],0,fogColorModel,1,1);
  mat4.translate(modelMatrix, modelMatrix, [0.0,0.0, 2.2])
  renderAssimpModel(modelMatrix,10,0,[],[],0,fogColor);
  renderAssimpModel(modelMatrix,4,0,[],[],1,fogColorModel,1,1);
  //Render skybox for actual scene
  DrawSkybox(SCENE_ZERO);
  modelMatrix = mat4.create()
  mat4.translate(modelMatrix, modelMatrix, [30.0 + 126.4+ 405.00 , -90.0 +  87.99  , -1.0 +  567.60 + 42.0 ])
  mat4.scale(modelMatrix,modelMatrix,[8.0 , 8.0 , 8.0]);
  //mat4.rotateY(modelMatrix, modelMatrix, [90])
  renderAssimpModel(modelMatrix,6,0,[],[],1,fogColorModel,1,1);
  RenderWater(reflection_fbo.cbo,refraction_fbo.cbo,refraction_fbo.dbo,705.100,0,10.0);
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  
  /*----------------------------------- Post Processing on Scene -----------------------------------*/
  //Render final scene with grayscale
  var model_matrix = mat4.create();
  RenderWithGrayScaleTextureShader(finalScene_fbo.cbo, 0);
  
}

var scene_four_StartTime = 155;
var scene_four_duration = 30;

function UpdateSceneFour()
{
  if (startTime == 0) {
    startTime = performance.now() / 1000;
  }
  if (scene == 4 && (startTime + 30 + 32 + 32 > performance.now()/1000)) {
    bezierCurve(Scene4_controlPoints, performance.now() / 1000, startTime+64, 30);
  }else{
    scene++;
  }
}

function UninitializeSceneFour()
{
    
}
