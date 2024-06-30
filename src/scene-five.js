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


//352.3130964125702,-9.316419231329514,398.8855402980065 , 5.599999999999855 , -14.199999999999232 
var SCENE_FIVE = 5;

var godRays_final_fbo;

//camera starting position

var scene_five_texture_rainbow;

function InitializeSceneFive()
{
  var scene_five_height_map_image = "src/resources/textures/terrain/Trial/trial1-modified.jpg";
  var scene_five_blend_map = "src/resources/textures/terrain/Trial/trial1-Blendmap.png";
  var scene_five_rock_1_image = "src/resources/textures/grass.jpg";
  var scene_five_rock_2_image = "src/resources/textures/grass.jpg";
  var scene_five_path_image = "src/resources/textures/rock.jpg";
  var scene_five_snow_image = "src/resources/textures/grass.jpg";
  scene_five_texture_rainbow = loadTexture("src\\resources\\textures\\rainbow.png", true) 

  InitializeTerrainRenderer();
  InitializeHeightMapTerrain(scene_five_height_map_image,scene_five_blend_map,scene_five_rock_1_image,scene_five_rock_2_image,scene_five_path_image,scene_five_snow_image,5);
  initializeGodrays();
}

   
function RenderSceneFive()
{
    let fogColorModel = [0.8, 0.9, 1, 0.5];
    // mat4.translate(modelMatrix, modelMatrix, [30.0 + 126.4+ 405.00 , -90.0 +  87.99  , -1.0 +  567.60 + 42.0 ])
    //188.54773835466648,-105,4.046151170852721
		// 481.0,-120, 595.0
    // 47
    var scene_one_tree_x = [25.97, 12.07, 34.14, 44.04, 58.43, 60.33, 99.23, 103.18, 136.72, 116.20, 135.18, 152.61, 167.75, 175.58, 201.51, 204.13, 224.33, 247.12, 279.17, 340.85, 344.85, 350.50, 357.79, 361.62, 366.40, 389.26, 411.72, 425.94, 439.63, 467.15, 481.98, 499.24, 520.60, 546.06, 575.87, 604.17,482.64, 463.57, 446.34, 433.30, 418.23, 409.02, 399.15, 390.91, 377.85, 350.19, 318.06,291.90]
    var scene_one_tree_y = [-138.50, -138.56, -139.41, -138.29, -139.01, -140.89, -138.55, -138.83, -142.09, -134.31, -135.12, -139.98, -141.06, -136.02, -142.16, -138.55, -140.30, -140.62, -139.03, -141.34, -135.70, -130.13, -125.17, -129.13, -120.04,-127.96, -129.93, -131.97, -134.75, -139.25, -140.86, -141.11, -141.76, -140.94, -140.84, -142.58,-140.70, -141.46, -141.71, -141.31, -140.44, -140.10, -137.48, -133.73, -130.59, -132.53, -135.95,-139.59];
    var scene_one_tree_z = [375.70, 425.95, 435.32, 383.23, 398.27, 452.60, 428.12, 484.83, 453.81, 499.67, 500.59, 459.08, 461.23, 508.45, 464.07, 507.92, 459.57, 518.47, 473.63, 447.20,  412.29, 378.45, 353.69, 338.23, 364.33, 321.46, 295.39, 276.17, 265.39, 260.69, 264.65, 262.26, 267.20, 274.13, 281.66, 292.08,310.67, 315.22, 331.64, 351.81, 380.95, 405.50, 436.91, 466.32, 491.61, 512.42, 519.47,521];
    var modelMatrixArray = [];
    
    /*----------------------------------- Rendering For Reflection FBO -----------------------------------*/
    animateWater();
    gl.bindFramebuffer(gl.FRAMEBUFFER, reflection_fbo.fbo);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    // CameraReflect();
    //render disney castle model for reflection FBO 
	  let modelMatrixRapunzal = mat4.create()
    mat4.translate(modelMatrixRapunzal, modelMatrixRapunzal, [0.0, -30.0, -1.0])
    mat4.scale(modelMatrixRapunzal,modelMatrixRapunzal,[10.0,10.0,10.0]);
    renderAssimpModel(modelMatrixRapunzal,2,0,[],[],1,fogColorModel,1);
    //render skybox for reflection FBO 
    DrawSkybox(SCENE_ZERO);  
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  
    /*----------------------------------- Rendering For Refraction FBO -----------------------------------*/
    gl.bindFramebuffer(gl.FRAMEBUFFER, refraction_fbo.fbo);
	  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    // CameraReflect();
    //render skybox for refraction FBO 
    DrawSkybox(SCENE_ZERO);
    //Bridge Model 
    var modelMatrix = mat4.create()
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    /***********************************Rendering for Godrays FBO************************************************* */
    gl.bindFramebuffer(gl.FRAMEBUFFER, godRays_scene_fbo.fbo);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    DrawSkybox(SCENE_ZERO);
    let fogColor = [0.8, 0.9, 0.1, 1];
    //Render terrain
    if (terrain_data[SCENE_FIVE]) {
      let terrain_model_matrix = mat4.create();
      let fogColor = [0.8, 0.9, 1, 0.0];
      RenderTerrain(terrain_data[SCENE_FIVE], SCENE_FIVE,fogColor ,terrain_model_matrix,1);
      //RenderTerrain(terrain_data[SCENE_FIVE], SCENE_FIVE,fogColor);
    }
    // for(i =0 ; i<modelList[9].instanceCount;i++){
    //   var modelMatrix = mat4.create()
    //   mat4.translate(modelMatrix, modelMatrix, [scene_one_tree_x[i] ,scene_one_tree_y[i] - test_translate_Y, scene_one_tree_z[i]])
    //   mat4.scale(modelMatrix,modelMatrix,[10.0 ,10.0,10.0]);
    //   modelMatrixArray.push(modelMatrix);
    // }

    //let modelMatrixRapunzal = mat4.create()
    mat4.translate(modelMatrixRapunzal, modelMatrixRapunzal, [0.0, -30.0, -1.0])
    mat4.scale(modelMatrixRapunzal,modelMatrixRapunzal,[10.0,10.0,10.0]);
    //renderAssimpModel(modelMatrixRapunzal,2,0,[],[],1,fogColorModel,1);
    // gl.enable(gl.BLEND);
		// gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    // renderAssimpModelWithInstancing(modelMatrixArray,9,0,[],[],1,fogColor,[],0,1);
    // gl.disable(gl.BLEND);
    RenderWater(reflection_fbo.cbo,refraction_fbo.cbo,refraction_fbo.dbo,705.100 + test_translate_X ,0 + 20.900000000000002 + 22.000000000000004 + 23.100000000000005 + test_translate_Y,10.0 + test_translate_Z,test_scale_X);

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
    var sunPosition = [700.0,250.0,800.0]
    mat4.translate(godrays_modelMatrix, godrays_modelMatrix, sunPosition)
    mat4.scale(godrays_modelMatrix, godrays_modelMatrix, [20.0, 20.0, 20.0])

    //uniform for light
    gl.uniformMatrix4fv(godrays_projectionMatrixUniform_occlusion, false, gd_perspectiveProjectionMatrix);
    gl.uniformMatrix4fv(godrays_viewMatrixUniform_occlusion, false, godrays_viewMatrix);
    gl.uniformMatrix4fv(godrays_modelMatrixUniform_occlusion, false, godrays_modelMatrix);
    gl.uniform1i(godrays_colorShowUniform_occlusion, 1)

    //draw light source

    sphere.draw();

    gl.uniform1i(godrays_colorShowUniform_occlusion, 0);
    //light source ends

    gl.useProgram(null);

    //function renderAssimpModelWithInstancing(modelMatrixArray: any, modelNumber: any, pointLightsCount: any, lightPositions: any, lightColors: any, isFogEnabled: any, fogColor: any, alphaArray: any, isDirectionalLightEnabled: any, isOccluded: any): void
    //renderAssimpModelWithInstancing(modelMatrixArray,9,0,[],[],1,fogColor,[],0,1);

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    /***********************************Rendering for godRays final pass************************************************* */
    v = vec4.fromValues(sunPosition[0],sunPosition[1],sunPosition[2], 1.0);
    vec4.transformMat4(v, v,godrays_viewMatrix)
    vec4.transformMat4(v, v, perspectiveProjectionMatrix)

    // perspective division
    vec4.scale(v, v, 1.0 / v[3] )

    // // scale (x,y) from range [-1,+1] to range [0,+1]
    vec4.add(v, v, [1.0, 1.0, 0.0, 0.0] )
    vec4.scale(v, v, 0.5)

    godrays_display_godrays();

    //rainbow texture
    gl.enable(gl.BLEND);
    gl.blendEquation(gl.FUNC_ADD);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
    modelMatrix = mat4.create();
    mat4.translate(modelMatrix,modelMatrix,[0.0, 0.0, -500.0]);
    RenderWithTextureShader(scene_five_texture_rainbow, 0);
    gl.disable(gl.BLEND);
    
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