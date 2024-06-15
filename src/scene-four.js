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

// ---------------------------
function InitializeSceneFour()
{
  var scene_four_height_map_image = "src/resources/textures/terrain.png";
  var scene_four_blend_map = "src/resources/textures/BlendMap.png";
  var scene_four_rock_1_image = "src/resources/textures/rock.png";
  var scene_four_rock_2_image = "src/resources/textures/snow.jpg";
  var scene_four_path_image = "src/resources/textures/ground.jpg";
  var scene_four_snow_image = "src/resources/textures/snow.jpg";

  var scene_four_tree_one_model_obj_file = "src\\resources\\models\\intro\\Palace_withColors.obj";
  var scene_four_tree_two_model_obj_file = "src\\resources\\intro\\scene_one_tree_two_model.obj";

  var scene_four_tree_one_model_texture_image = "src\\resources\\models\\intro\\TCom_Metal_BrassPolished_header.jpg";
  var scene_four_tree_two_model_texture_image = "src\\resources\\models\\scene_one_tree_two_texture.png";

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

  //Render final scene in final buffer
//   gl.bindFramebuffer(gl.FRAMEBUFFER, finalScene_fbo.fbo);
//   gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  //Render terrain
  if (terrain_data[SCENE_FOUR]) {
    RenderTerrain(terrain_data[SCENE_FOUR], SCENE_FOUR);
  }

  //Render castle for actual scene
  var modelMatrix = mat4.create()
  mat4.translate(modelMatrix, modelMatrix, [0.0, -30.0, -1.0])
  mat4.scale(modelMatrix,modelMatrix,[10.0,10.0,10.0]);
  renderAssimpModel(modelMatrix,2,0,point_lightPositions,point_lightColors);
  //Render skybox for actual scene
  DrawSkybox(SCENE_ONE);
//   gl.bindFramebuffer(gl.FRAMEBUFFER, null);


  //Render final scene with grayscale
//   var model_matrix = mat4.create();
//   RenderWithTextureShader(finalScene_fbo.cbo, 0);
}

function UpdateSceneFour()
{
   
}

function UninitializeSceneFour()
{
    
}
