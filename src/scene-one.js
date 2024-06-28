/*********************************************************************************
 * 
 * SCENE Description :
 * //x will be ending time for scene zero
 * Time :	0.0 to 0.5 - Title Texture  
 * Time : 0.5 to 0.25 - Open terrain – trees – God rays and camera with music
 * Astromedicomps Voxel Group - Title
*/

/*----------------------------------- Scene one global variables -----------------------------------*/

var SCENE_ONE = 1;
var scene_one_title_texture;
var lastExecutionTime = 0;

var scene_one_showTitle = true;

/*----------------------------------- Scene one Initialise -----------------------------------*/
function InitializeSceneOne()
{

  var scene_one_height_map_image = "src/resources/textures/terrain.png";
  var scene_one_blend_map = "src/resources/textures/BlendMap.png";
  var scene_one_rock_1_image = "src/resources/textures/ground.jpg";
  var scene_one_rock_2_image = "src/resources/textures/grass.jpg";
  var scene_one_path_image = "src/resources/textures/grass.jpg";
  var scene_one_snow_image = "src/resources/textures/ground.jpg";

  InitializeTerrainRenderer();
  InitializeHeightMapTerrain(scene_one_height_map_image,scene_one_blend_map,scene_one_rock_1_image,scene_one_rock_2_image,scene_one_path_image,scene_one_snow_image,1);
  initializeGodrays();
  var scene_one_title_texture_path = "src\\resources\\textures\\Titles\\MainTitle.png";
  scene_one_title_texture = loadTexture(scene_one_title_texture_path, false) 
}

/*----------------------------------- Scene one Render -----------------------------------*/

function RenderSceneOne()
{
  if(scene_one_showTitle){
    let currentTime = performance.now();
    let modelMatrix = mat4.create();
    let identityMatrix = mat4.create();
    let x = (Math.random() * 2 - 1) / 300;
    let y = (Math.random() * 2 - 1) / 400;
    if (currentTime - lastExecutionTime >= 150) { // 100 milliseconds = 0.1 seconds
        mat4.translate(modelMatrix, modelMatrix, [x, y, 0]);

        lastExecutionTime = currentTime; // Update the last execution time
    }
    RenderWithVignnetTextureShaderMVP(modelMatrix,identityMatrix,identityMatrix,scene_one_title_texture, 0);
    // RenderWithVignnetTextureShaderMVP(modelMatrix,identityMatrix,identityMatrix,scene_one_title_texture, 0);
  }else{
    var scene_one_tree_x = [480  ,  330,  400  , 500 , 548 , 460, 470.25, 420, 537, 430, 488, 480, 480, 450, 548, 460, 470.25, 420, 537, 430, 490.65]
    var scene_one_tree_y = [-55   , -55 , -55  , -60 , -60 , -60, -60, -70, -70, -70, -62, -65, -65, -65, -65, -70, -65, -70, -70, -70, -65];
    var scene_one_tree_z = [10   ,  10 , 10   , 10  , 10  , 10, 10, 13, 20, 27, 33, 40, 50, 61, 71, 80, 91, 101, 105, 120, -77];
    var modelMatrixArray = [];
    for(i =0 ; i<modelList[12].instanceCount;i++){
      var modelMatrix = mat4.create()
      mat4.translate(modelMatrix, modelMatrix, positions[i])
      mat4.scale(modelMatrix,modelMatrix,[0.3 +test_scale_X,0.5 + test_scale_X,0.3+test_scale_X]);
      modelMatrixArray.push(modelMatrix);
    }
    /***********************************Rendering for Godrays FBO************************************************* */
    gl.bindFramebuffer(gl.FRAMEBUFFER, godRays_scene_fbo.fbo);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    DrawSkybox(SCENE_TWO);
    let fogColor = [0.2, 0.2, 0.2, 1.0];
    //Render terrain
    if (terrain_data[SCENE_ONE]) {
      let fogColor = [0.2, 0.2, 0.2, 1.0];
      RenderTerrain(terrain_data[SCENE_FIVE], SCENE_FIVE,fogColor);
    }
    // for(i =0 ; i<modelList[9].instanceCount;i++){
    //   var modelMatrix = mat4.create()
    //   mat4.translate(modelMatrix, modelMatrix, [scene_one_tree_x[i]+ test_translate_X ,scene_one_tree_y[i]+ test_translate_Y, scene_one_tree_z[i]+ test_translate_Z])
    //   mat4.scale(modelMatrix,modelMatrix,[10.0 +test_scale_X,10.0 + test_scale_X,10.0+test_scale_X]);
    //   modelMatrixArray.push(modelMatrix);
    // }
    // var aplhaArray = [0.1,0.2,1.0,0.9];
    // gl.enable(gl.BLEND);
		// gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    // var modelMatrix = mat4.create()
    // mat4.translate(modelMatrix, modelMatrix, [0.0+ test_translate_X ,0.0+ test_translate_Y, -10.0 + test_translate_Z])
    // mat4.scale(modelMatrix,modelMatrix,[0.2 +test_scale_X,0.2 + test_scale_X,0.2+test_scale_X]);
    renderAssimpModelWithInstancing(modelMatrixArray,12,0,[],[],0,fogColor,1.0);
    // gl.disable(gl.BLEND);

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
    mat4.translate(godrays_modelMatrix, godrays_modelMatrix, [100.0, 35.0, 180.0])
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
    // modelMatrix = mat4.create()
    // mat4.translate(modelMatrix, modelMatrix, [0.0+ test_translate_X ,0.0+ test_translate_Y, -10.0 + test_translate_Z])
    // mat4.scale(modelMatrix,modelMatrix,[100.0 +test_scale_X,100.0 + test_scale_X,100.0+test_scale_X]);
    renderAssimpModelWithInstancing(modelMatrixArray,12,0,[],[],0,fogColor,1.0);
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
    RenderWithGrayScaleTextureShader(godRays_final_fbo.cbo,0)
  }
   
}

/*----------------------------------- Scene one Update -----------------------------------*/
function UpdateSceneOne()
{
   
}

/*----------------------------------- Scene one Uninitialize -----------------------------------*/
function UninitializeSceneOne()
{
    
}
