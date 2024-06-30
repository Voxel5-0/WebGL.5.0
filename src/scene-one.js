/*********************************************************************************
 * 
 * SCENE Description :
 * //x will be ending time for scene zero
 * Time :	0.0 to 0.5 - Title Texture  
 * Time : 0.5 to 0.25 - Open terrain – trees – God rays and camera with music
 * Astromedicomps Voxel Group - Title
*/


/*----------------------------------- Camera Contol Points and variables -----------------------------------*/
const scene_one_controlPoints = [
  [704.8648214635622,-8.562417758347571,379.39476250089234,-7.432602672844001,-250.40000000000046],
  [558.1527762885465,5.500596646407779,438.8706648361808, -4.4326026728439984, -252.8000000000004],
  [501.15614495595594,14.73771787835936,471.7990264518865, -9.032602672843998, -230.8000000000007],
  [457.1417555632073,55.52811359214382,561.9410709168559, -25.83260267284397, -181.00000000000134],
  [493.40845117307197,107.946879821468,624.4185303303168, -52.03260267284408, -38.00000000000152],
  [522.6736636158461,162.74987233779004,577.8594525147819, -84.83260267284426, -27.40000000000148],
  [553.609623609143,174.7564869683475,560.704923881926, -98.23260267284442, 88.79999999999858],
  [553.609623609143,174.7564869683475,560.704923881926, -84.0326026728443, 137.5999999999985],
  [553.609623609143,174.7564869683475,560.704923881926, -67.83260267284429, 215.19999999999828]
];

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
    var modelMatrixArray = [];
    for(i =0 ; i<modelList[12].instanceCount;i++){
      var modelMatrix = mat4.create()
      mat4.translate(modelMatrix, modelMatrix, [positions[i][0],positions[i][1]-test_translate_Y,positions[i][2]])
      mat4.scale(modelMatrix,modelMatrix,[0.3 ,0.5 ,0.3]);
      modelMatrixArray.push(modelMatrix);
    }
    /***********************************Rendering for Godrays FBO************************************************* */
    gl.bindFramebuffer(gl.FRAMEBUFFER, godRays_scene_fbo.fbo);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    DrawSkybox(SCENE_TWO);
    //Render terrain
    if (terrain_data[SCENE_ONE]) {
      let fogColor = [0.8, 0.9, 1, 0.5];
      let terrain_model_matrix = mat4.create();
      mat4.scale(terrain_model_matrix,terrain_model_matrix,[10.3  , 11.5 , 10.3]);
     // RenderTerrain(terrain_data[SCENE_FIVE], SCENE_FIVE,fogColor ,terrain_model_matrix);
      mat4.translate(terrain_model_matrix,terrain_model_matrix,[10.3  , 10.5 , 10.3]);
      RenderTerrain(terrain_data[SCENE_FIVE], SCENE_FIVE,fogColor ,terrain_model_matrix);
    }
    
    let fogColor = [0.2, 0.2, 0.2, 0.5];
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
    gl.uniformMatrix4fv(godrays_projectionMatrixUniform_occlusion, false, gd_perspectiveProjectionMatrix);
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
    vec4.transformMat4(v, v, gd_perspectiveProjectionMatrix)

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

    /***********************************Reder with noise************************************************* */
    gl.bindFramebuffer(gl.FRAMEBUFFER, coloredFinalScene_fbo.fbo);
    RenderWithFBMTextureShader(godRays_final_fbo.cbo,0);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    /***********************************Post Processing************************************************* */
    RenderWithTextureShader(coloredFinalScene_fbo.cbo,0)
  }
   
}

/*----------------------------------- Scene one Update -----------------------------------*/
var scene_one_StartTime = 105;
var scene_one_duration = 30;

/*----------------------------------- Scene One Update -----------------------------------*/
function UpdateSceneOne() {
  let currentTime = performance.now() / 1000;
  if (startTime == 0) {
    //This will never call in ideal case, start time will always be initialized in scene zero
    d = currentTime;
  }
  // if(scene_one_StartTime + currentTime >n)
  if (scene == 1 && scene_one_StartTime < currentTime && scene_one_StartTime + scene_one_duration > currentTime) {
    scene_one_showTitle = false;
    bezierCurve(scene_one_controlPoints,currentTime, scene_one_StartTime, scene_one_duration);
  } 
  else (scene == 1)
  {
    cameraShake();
  }
  if(scene_one_StartTime + scene_one_duration - scene_tst_one < currentTime){
    scene++;
  }
  else if(scene_one_StartTime + scene_one_duration <= currentTime){
    scene++;
  } 

}
/*----------------------------------- Scene one Uninitialize -----------------------------------*/
function UninitializeSceneOne()
{
    
}
