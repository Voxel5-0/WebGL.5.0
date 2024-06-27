/*********************************************************************************
 * 
 * SCENE Description :
 * Here we need a sound effect and on screen we are able see river flowing 
 * Jhula dhanak ka dhire dhire hum jhule
 * 
 * TIME : 2.19 to 3.11 
 * 
 * Atmospheric scaterring 
 * Bill boarding  - field of flowers
 * 
*/

var SCENE_FIVE = 5;

var godRays_final_fbo;


function InitializeSceneFive()
{
  var scene_five_height_map_image = "src/resources/textures/terrain.png";
  var scene_five_blend_map = "src/resources/textures/BlendMap.png";
  var scene_five_rock_1_image = "src/resources/textures/soil.jpg";
  var scene_five_rock_2_image = "src/resources/textures/soil.jpg";
  var scene_five_path_image = "src/resources/textures/ground.jpg";
  var scene_five_snow_image = "src/resources/textures/soil.jpg";

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

    
    /***********************************Rendering for Godrays FBO************************************************* */
    gl.bindFramebuffer(gl.FRAMEBUFFER, godRays_scene_fbo.fbo);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    DrawSkybox(SCENE_ZERO);
    let fogColor = [0.8, 0.9, 1, 1];
    //Render terrain
    if (terrain_data[SCENE_FIVE]) {
      let fogColor = [0.8, 0.9, 1, 0.0];
      RenderTerrain(terrain_data[SCENE_FIVE], SCENE_FIVE,fogColor);
    }
    for(i =0 ; i<modelList[0].instanceCount;i++){
      var modelMatrix = mat4.create()
      mat4.translate(modelMatrix, modelMatrix, [scene_one_tree_x[i]+ test_translate_X ,scene_one_tree_y[i]+ test_translate_Y, scene_one_tree_z[i]+ test_translate_Z])
      mat4.scale(modelMatrix,modelMatrix,[10.0 +test_scale_X,10.0 + test_scale_X,10.0+test_scale_X]);
      modelMatrixArray.push(modelMatrix);
    }
    renderAssimpModelWithInstancing(modelMatrixArray,9,0,[],[],1,fogColor);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);


    /***********************************Rendering for godRays occlusion FBO************************************************* */
    gl.bindFramebuffer(gl.FRAMEBUFFER, godRays_occlusion_fbo.fbo);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.useProgram(godrays_shaderProgramObject_occlusion);
    var godrays_viewMatrix = GetCameraViewMatrix();
    var godrays_modelMatrix = mat4.create();

    // ***** Light ******
    //perform translation for light
    mat4.translate(godrays_modelMatrix, godrays_modelMatrix, [1000.0, 350.0, 1800.0])
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
    renderAssimpModelWithInstancing(modelMatrixArray,9,0,[],[],1,fogColor);

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    /***********************************Rendering for godRays final pass************************************************* */
    v = vec4.fromValues(1000.0,350.0,1800.0, 1.0);
    vec4.transformMat4(v, v,godrays_viewMatrix)
    vec4.transformMat4(v, v, perspectiveProjectionMatrix)

    // perspective division
    vec4.scale(v, v, 1.0 / v[3] )

    // // scale (x,y) from range [-1,+1] to range [0,+1]
    vec4.add(v, v, [1.0, 1.0, 0.0, 0.0] )
    vec4.scale(v, v, 0.5)

    godrays_display_godrays();
    
    /***********************************Rendering for Actual scene************************************************* */
    gl.bindFramebuffer(gl.FRAMEBUFFER, godRays_final_fbo.fbo);
    godrays_display_final();
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    /***********************************Post Processing************************************************* */
    RenderWithTextureShader(godRays_final_fbo.cbo,0)
}

function UpdateSceneFive()
{
   
}

function UninitializeSceneFive(){

}