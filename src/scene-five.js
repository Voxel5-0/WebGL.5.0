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

  InitializeTerrainRenderer();
  InitializeHeightMapTerrain(scene_five_height_map_image,scene_five_blend_map,scene_five_rock_1_image,scene_five_rock_2_image,scene_five_path_image,scene_five_snow_image,5);
  initializeGodrays();
}

   
function RenderSceneFive()
{

  // mat4.translate(modelMatrix, modelMatrix, [30.0 + 126.4+ 405.00 , -90.0 +  87.99  , -1.0 +  567.60 + 42.0 ])
  //188.54773835466648,-105,4.046151170852721
		// 481.0,-120, 595.0
    var modelMatrixArray = [];

    /***********************************Rendering for Godrays FBO************************************************* */
    gl.bindFramebuffer(gl.FRAMEBUFFER, godRays_scene_fbo.fbo);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    DrawSkybox(SCENE_ZERO);
    let fogColor = [0.8, 0.9, 0.1, 1];
    //Render terrain
    if (terrain_data[SCENE_FIVE]) {
      let fogColor = [0.8, 0.9, 1, 0.0];
      RenderTerrain(terrain_data[SCENE_FIVE], SCENE_FIVE,fogColor);
    }
    for(i =0 ; i<modelList[12].instanceCount;i++){
      var modelMatrix = mat4.create()
      mat4.translate(modelMatrix, modelMatrix, positions[i])
      mat4.scale(modelMatrix,modelMatrix,[0.2,0.4,0.2]);
      modelMatrixArray.push(modelMatrix);
    }
    var aplhaArray = [0.1,0.2,1.0,0.9];
    gl.enable(gl.BLEND);
		gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    renderAssimpModelWithInstancing(modelMatrixArray,12,0,[],[],1,fogColor);
    gl.disable(gl.BLEND);

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
    mat4.translate(godrays_modelMatrix, godrays_modelMatrix, [1000.0, 350.0, 180.0])
    mat4.scale(godrays_modelMatrix, godrays_modelMatrix, [10.0, 10.0, 10.0])

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
    gl.enable(gl.BLEND);
		gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    renderAssimpModelWithInstancing(modelMatrixArray,12,0,[],[],1,fogColor);
    gl.disable(gl.BLEND);

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    /***********************************Rendering for godRays final pass************************************************* */
    v = vec4.fromValues(100.0,35.0,180.0, 1.0);
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