/*********************************************************************************
 * 
 * SCENE Description :
 * 
 * Here we need a sound effect and on screen we are able see river flowing 
 * 
 * Jhula dhanak ka dhire dhire hum jhule
 * 
 * Terrain - Done 
 * Trees - Model loading done
 * Water
 * Rainbow - Texture - blending 
 * Atmospheric scaterring 
 * Bill boarding  - field of flowers
 * 
*/

var SCENE_FIVE = 5;

var godRays_final_fbo;

 //Uniforms for point lights
//  var s5_point_lightPositions = [
//   [13.21327183125484, -67.44632010003868, -4.840837788952009], //middle
//   [9.958236978785187, -87.20368404972493, 4.3888549228581475], //left
//   [10.240470221367731, -86.58628336655747, -14.213709470661364], //right
//   [30.354274982918096, -82.16404503148408, -5.308960274678841], //middleBottom
//   [10.037352469619046, -94.20165532734516, 23.91656258654752], //Left-pit
//   [11.225923093363434, -95.20251447029362, -35.5777721241391], //Right-pit
//   [3.519062612861857, -51.2143286217448, -10.05733734202175], //longTowerbottom
//   [7.394419029927332, -37.85214289591929, -11.998835777015215], //longTowerTop
// ];

// var s5_point_lightColors = [1, 0.776, 0.559];

// ---------------------------
function InitializeSceneFive()
{
  var scene_five_height_map_image = "src/resources/textures/terrain.png";
  var scene_five_blend_map = "src/resources/textures/BlendMap.png";
  var scene_five_rock_1_image = "src/resources/textures/soil.jpg";
  var scene_five_rock_2_image = "src/resources/textures/soil.jpg";
  var scene_five_path_image = "src/resources/textures/ground.jpg";
  var scene_five_snow_image = "src/resources/textures/soil.jpg";

  var scene_four_tree_one_model_obj_file = "src\\resources\\models\\intro\\Palace_withColors.obj";
  var scene_four_tree_two_model_obj_file = "src\\resources\\intro\\scene_one_tree_two_model.obj";

  var scene_four_tree_one_model_texture_image = "src\\resources\\models\\intro\\TCom_Metal_BrassPolished_header.jpg";
  var scene_four_tree_two_model_texture_image = "src\\resources\\models\\scene_one_tree_two_texture.png";

  godRays_final_fbo = GenerateFramebuffer(1920, 1080);

  InitializeTerrainRenderer();
  InitializeHeightMapTerrain(scene_five_height_map_image,scene_five_blend_map,scene_five_rock_1_image,scene_five_rock_2_image,scene_five_path_image,scene_five_snow_image,5);
  initializeGodrays();
  
 
}

   
function RenderSceneFive()
{
		// 481.0,-120, 595.0
    var scene_one_tree_x = [481.0, 480, 480, 450, 548, 460, 470.25, 420, 537, 430, 488, 480, 480, 450, 548, 460, 470.25, 420, 537, 430, 490.65]
    var scene_one_tree_y = [-120,-120, -55, -60, -60, -60, -60, -70, -70, -70, -62, -65, -65, -65, -65, -70, -65, -70, -70, -70, -65];
    var scene_one_tree_z = [595.0, 588, 10, 10, 10, 10, 10, 13, 20, 27, 33, 40, 50, 61, 71, 80, 91, 101, 105, 120, -77];
    var modelMatrixArray = [];

    for(i =0 ; i<modelList[0].instanceCount;i++){
      var modelMatrix = mat4.create()
      mat4.translate(modelMatrix, modelMatrix, [scene_one_tree_x[i]+ test_translate_X ,scene_one_tree_y[i]+ test_translate_Y, scene_one_tree_z[i]+ test_translate_Z])
      mat4.scale(modelMatrix,modelMatrix,[10.0 +test_scale_X,10.0 + test_scale_X,10.0+test_scale_X]);
      modelMatrixArray.push(modelMatrix);
    }

    gl.bindFramebuffer(gl.FRAMEBUFFER, godRays_scene_fbo.fbo);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    DrawSkybox(SCENE_ONE);
    //Render terrain
    if (terrain_data[SCENE_FOUR]) {
      RenderTerrain(terrain_data[SCENE_FIVE], SCENE_FIVE);
    }
    renderAssimpModelWithInstancing(modelMatrixArray,0,0,[],[]);

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    /********************************************************************************************************************************* */

    gl.bindFramebuffer(gl.FRAMEBUFFER, godRays_occlusion_fbo.fbo);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.useProgram(godrays_shaderProgramObject_occlusion);
    var godrays_viewMatrix = GetCameraViewMatrix();
    var godrays_modelMatrix = mat4.create();
    // ***** Light ******
    //perform translation for light
    mat4.translate(godrays_modelMatrix, godrays_modelMatrix, [1500.0, 230.0, 1850.0])
    mat4.scale(godrays_modelMatrix, godrays_modelMatrix, [100.0, 100.0, 100.0])

    //uniform for light
    gl.uniformMatrix4fv(godrays_projectionMatrixUniform_occlusion, false, perspectiveProjectionMatrix);
    gl.uniformMatrix4fv(godrays_viewMatrixUniform_occlusion, false, godrays_viewMatrix);
    gl.uniformMatrix4fv(godrays_modelMatrixUniform_occlusion, false, godrays_modelMatrix);
    gl.uniform1i(godrays_colorShowUniform_occlusion, 1)

    //draw light source

    sphere.draw();

    gl.uniform1i(godrays_colorShowUniform_occlusion, 0);
    //light source ends

    gl.useProgram(null);

    //Render terrain
    renderAssimpModelWithInstancing(modelMatrixArray,0,0,[],[]);

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    
    godrays_display_godrays();
    
    gl.bindFramebuffer(gl.FRAMEBUFFER, godRays_final_fbo.fbo);
    godrays_display_final();
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    RenderWithTextureShader(godRays_final_fbo.cbo,0)
    //mat4.rotateY(modelMatrix, modelMatrix, [90])
    //renderAssimpModel(modelMatrixArray[0],7,0,[],[]);
    //var view_matrix = GetCameraViewMatrix();
    // RenderWithInstanceShader(view_matrix, perspectiveProjectionMatrix, scene_one_tree_model_two_texture, 0);
    // ModelInstanceRenderer(scene_one_tree_two_model, scene_one_tree_model_instances);

    // RenderWithInstanceShader(view_matrix, perspectiveProjectionMatrix, scene_one_tree_model_one_texture, 0);
    // ModelInstanceRenderer(scene_one_tree_one_model, scene_one_tree_model_instances);

    // console.log("GetCameraViewMatrix() "+ GetCameraViewMatrix());
    // console.log("perspectiveProjectionMatrix "+ perspectiveProjectionMatrix);

    
}

function UpdateSceneFive()
{
   
}

function UninitializeSceneFive(){

}