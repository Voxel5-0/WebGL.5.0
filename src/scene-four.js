/*********************************************************************************
 * 
 * SCENE Description :
 * 
 * Here we need a sound effect and on screen we are able see river flowing 
 * 
 * saanso ki lay par koyi aisi dhun gaye
 * 
 * Terrain - Done 
 * Trees - Model loading done
 * Water
 * Atmospheric scaterring 
 * 
*/

var SCENE_FOUR = 4;

const Scene4_controlPoints = [
  [582.603042074097,259.96511411123737,630.7985127382476, -51.2495708900399, -136.60000000000002],
  [254.51460638786335,-24.475212286155987,144.58837186006048, -10.965719236359957, -159.99999999999994],
  [250.9429927679908,-13.866135666511283,293.567447006224, -14.765719236359963, -139.5999999999999],
  [331.8755808288752,9.361228072694807,397.0786166951646, -8.365719236359967, -164.7999999999998]
  //[137.52516631157724, -81.33711919060856, -5.38612557063494, -13.042920367320477, -630.9999999999997],
  //[179.3081591306077, -97.33037030294784, -3.89842326914559, -5.242920367320477, -630.9999999999995]
];

// ---------------------------
function InitializeSceneFour()
{
  var scene_four_height_map_image = "src/resources/textures/terrain/RollingHills/Terrain002_2K.png";
  var scene_four_blend_map        = "src/resources/textures/BlendMap.png";
  var scene_four_rock_1_image     = "src/resources/textures/ground.jpg";
  var scene_four_rock_2_image     = "src/resources/textures/soil.jpg";
  var scene_four_path_image       = "src/resources/textures/ground.jpg";
  var scene_four_snow_image       = "src/resources/textures/soil.jpg";

  InitializeTerrainRenderer();
  InitializeHeightMapTerrain(scene_four_height_map_image,scene_four_blend_map,scene_four_rock_1_image,scene_four_rock_2_image,scene_four_path_image,scene_four_snow_image,4);
  
}

function RenderSceneFour()
{
    //Uniforms for point lights
  var point_lightPositions = [
    [13.21327183125484, -67.44632010003868, -4.840837788952009], //middle
    [9.958236978785187, -87.20368404972493, 4.3888549228581475], //left
    [10.240470221367731, -86.58628336655747, -14.213709470661364], //right
    [30.354274982918096, -82.16404503148408, -5.308960274678841], //middleBottom
    [10.037352469619046, -94.20165532734516, 23.91656258654752], //Left-pit
    [11.225923093363434, -95.20251447029362, -35.5777721241391], //Right-pit
    [3.519062612861857, -51.2143286217448, -10.05733734202175], //longTowerbottom
    [7.394419029927332, -37.85214289591929, -11.998835777015215], //longTowerTop
  ];

  var point_lightColors = [1, 0.776, 0.559];


  //Render final scene in final buffer grayscale
  gl.bindFramebuffer(gl.FRAMEBUFFER, finalScene_fbo.fbo);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  //Render terrain
  if (terrain_data[SCENE_FOUR]) {
    RenderTerrain(terrain_data[SCENE_FOUR], SCENE_FOUR);
  }
  //Render models for actual scene grayscale
  var modelMatrix = mat4.create()
  mat4.translate(modelMatrix, modelMatrix, [481.0,-120, 595.0])
  mat4.scale(modelMatrix,modelMatrix,[18.0,18.0,18.0]);
  mat4.rotateY(modelMatrix, modelMatrix, [90])
  renderAssimpModel(modelMatrix,2,0,point_lightPositions,point_lightColors);
  //mat4.translate(modelMatrix, modelMatrix, [0.0,0.0, 2.2])
  //renderAssimpModel(modelMatrix,3,0,point_lightPositions,point_lightColors);
  //Render skybox for actual scene
  DrawSkybox(SCENE_ONE);
  modelMatrix = mat4.create()
  mat4.translate(modelMatrix, modelMatrix, [30.0 + 126.4+ 405.00 , -90.0 +  87.99  , -1.0 +  567.60 + 42.0 ])
  mat4.scale(modelMatrix,modelMatrix,[8.0 , 8.0 , 8.0]);
  //mat4.rotateY(modelMatrix, modelMatrix, [90])
  renderAssimpModel(modelMatrix,5,0,point_lightPositions,point_lightColors);
  RenderWater(reflection_fbo.cbo,refraction_fbo.cbo,refraction_fbo.dbo,705.100,70.899,10.0);
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);

  //Render final scene in final buffer grayscale
  gl.bindFramebuffer(gl.FRAMEBUFFER, coloredFinalScene_fbo.fbo);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  //Render terrain
  if (terrain_data[SCENE_FOUR]) {
    RenderTerrain(terrain_data[SCENE_FOUR], SCENE_FOUR);
  }
  //Render models for actual scene grayscale
  var modelMatrix = mat4.create()
  mat4.translate(modelMatrix, modelMatrix, [481.0,-120, 595.0])
  mat4.scale(modelMatrix,modelMatrix,[18.0,18.0,18.0]);
  mat4.rotateY(modelMatrix, modelMatrix, [90])
  renderAssimpModel(modelMatrix,2,0,point_lightPositions,point_lightColors);
  mat4.translate(modelMatrix, modelMatrix, [0.0,0.0, 2.2])
  renderAssimpModel(modelMatrix,3,0,point_lightPositions,point_lightColors);
  //Render skybox for actual scene
  DrawSkybox(SCENE_ONE);
  modelMatrix = mat4.create()
  mat4.translate(modelMatrix, modelMatrix, [30.0 + 126.4+ 405.00 + test_translate_X , -90.0 +  87.99 + test_translate_Y , -1.0 +  567.60 + 42.0 + test_translate_Z])
  mat4.scale(modelMatrix,modelMatrix,[8.0 + test_scale_X , 8.0+test_scale_X , 8.0+test_scale_X]);
  //mat4.rotateY(modelMatrix, modelMatrix, [90])
  renderAssimpModel(modelMatrix,5,0,point_lightPositions,point_lightColors);
  RenderWater(reflection_fbo.cbo,refraction_fbo.cbo,refraction_fbo.dbo,705.100,70.899,10.0);
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);


  animateWater();
  //Render in Reflection FBO
  //bindReflectionFBO();
  gl.bindFramebuffer(gl.FRAMEBUFFER, reflection_fbo.fbo);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  // CameraReflect();
  //render disney castle model for reflection FBO 
	var modelMatrix = mat4.create()
  mat4.translate(modelMatrix, modelMatrix, [0.0, -30.0, -1.0])
  mat4.scale(modelMatrix,modelMatrix,[10.0,10.0,10.0]);
  renderAssimpModel(modelMatrix,2,0,point_lightPositions,point_lightColors);
  //render skybox for reflection FBO 
  DrawSkybox(SCENE_ONE);  
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);

  //Render in Refraction FBO
  gl.bindFramebuffer(gl.FRAMEBUFFER, refraction_fbo.fbo);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  // CameraReflect();
  //render skybox for refraction FBO 
  DrawSkybox(SCENE_ONE);
  //render disney castle model for refraction FBO 
  var modelMatrix = mat4.create()
  mat4.translate(modelMatrix, modelMatrix, [0.0, -30.0, -1.0])
  mat4.scale(modelMatrix,modelMatrix,[10.0,10.0,10.0]);
  renderAssimpModel(modelMatrix,2,0,point_lightPositions,point_lightColors);
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);

  //Render final scene with grayscale
  var model_matrix = mat4.create();
  if(grayscale == 1){
    RenderWithGrayScaleTextureShader(finalScene_fbo.cbo, 0);
  }else{
    RenderWithTextureShader(coloredFinalScene_fbo.cbo, 0);
  }
}

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
