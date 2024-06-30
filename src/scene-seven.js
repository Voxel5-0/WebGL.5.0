/*********************************************************************************
 * 
 * SCENE Description :
 * Father oepning the arms for daughter
 * 
 * TIME :	3.36 to 3.53  
 *   
 * Surrounding lanterns
 * 
*/

var SCENE_SEVEN = 7;


// ---------------------------
function InitializeSceneSeven()
{
    //const skyboxTexturesForScene7 = [ 
    //    "src/resources/textures/skybox/Scene7/nx.png", 
    //    "src/resources/textures/skybox/Scene7/ny.png", 
    //    "src/resources/textures/skybox/Scene7/nz.png",
    //    "src/resources/textures/skybox/Scene7/px.png",
    //    "src/resources/textures/skybox/Scene7/py.png", 
    //    "src/resources/textures/skybox/Scene7/pz.png"
    //];

    //LoadSkyboxTextures(skyboxTexturesForScene7, 1);
}

function RenderSceneSeven()
{
    var view_matrix = GetCameraViewMatrix();
    let fogColor = [0.8, 0.9, 1, 1];
    gl.useProgram(null);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, null);
  
    /*----------------------------------- Rendering For Reflection FBO -----------------------------------*/
    gl.bindFramebuffer(gl.FRAMEBUFFER, reflection_fbo.fbo);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    turnCameraReflectionOn();                        
    animateWater();     
    //just castle model for reflection : index 1
      var scene1_modelMatrix = mat4.create()
      mat4.translate(scene1_modelMatrix, scene1_modelMatrix, [0.0, 0.0, -10.0])
    renderAssimpModel(scene1_modelMatrix,1,scene_zero_light_count,scene_zero_lightPositions,scene_zero_lightColors,1,fogColor,1.0);
    DrawSkybox(SCENE_ZERO);  
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  
    /*----------------------------------- Rendering For Refraction FBO -----------------------------------*/
    gl.bindFramebuffer(gl.FRAMEBUFFER, refraction_fbo.fbo);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    turnCameraReflectiOff();
    DrawSkybox(SCENE_ZERO);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  
  
    /*----------------------------------- Actual Scene One -----------------------------------*/
    gl.bindFramebuffer(gl.FRAMEBUFFER, finalScene_fbo.fbo);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    //castle complete model : index 0
    mat4.identity(scene1_modelMatrix)
      mat4.translate(scene1_modelMatrix, scene1_modelMatrix, [0.0, 0.0, -10.0])
    renderAssimpModel(scene1_modelMatrix,0,scene_zero_light_count,scene_zero_lightPositions,scene_zero_lightColors,1,fogColor,1.0,1);
    DrawSkybox(SCENE_ZERO);
  
    if(bool_start_ptrail_update){
      //One space key press- trail and AMC title
      pTrail_display(scene1_modelMatrix, perspectiveProjectionMatrix);
      mat4.identity(scene1_modelMatrix);
      mat4.translate(scene1_modelMatrix, scene1_modelMatrix, [0.0, -2.0, -7.0])
      mat4.scale(scene1_modelMatrix, scene1_modelMatrix,[1.6 , 1.2 , 1.2]);
      mat4.scale(scene1_modelMatrix, scene1_modelMatrix,[0.5 + 1.5 , 0.5 + 1 - 2.0 , 0.5 + 1]);
      var view = mat4.create();
      RenderWithTextureShaderMVP(scene1_modelMatrix,view,perspectiveProjectionMatrix,scene_zero_AMC_title_texture, 0);
    }
    //displayGrass();
    RenderWater(reflection_fbo.cbo,refraction_fbo.cbo,refraction_fbo.dbo,515.9000000000044,0,402.6000000000021,0);
  
    pfc_display();
  
    tst_display();
    // fadeOut();
  
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  
  
    /*----------------------------------- Post Processing on Scene -----------------------------------*/
    //RenderWithFBMTextureShader(finalScene_fbo.cbo, 0);
     RenderWithTextureShader(finalScene_fbo.cbo, 0);

    // var modelMatrix = mat4.create();
    // let fogColor = [0.8, 0.9, 1, 1];
    // DrawSkybox(SCENE_ONE);
    // if (terrain_data[SCENE_FOUR]) {
    //     let fogColor = [0.8, 0.9, 1, 1];
    //     RenderTerrain(terrain_data[SCENE_FOUR], SCENE_FOUR,fogColor);
    // }

    // mat4.translate(modelMatrix, modelMatrix, [0.0 + 2.2 + 639.100000000007 + test_translate_X , 0.0 + test_translate_Y , 0.0 - 5.5 + 157.29999999999959 + test_translate_Z])
    // mat4.scale(modelMatrix,modelMatrix,[ 5.0 + 106 + test_scale_X, 5.0 + 106 +test_scale_X , 5.0+ 106 + test_scale_X ]);
    // //mat4.rotateY(modelMatrix, modelMatrix, [test_scale_X])
    // renderAssimpModel(modelMatrix,9,0,[],[],1,fogColor,1.0);

    // mat4.identity(modelMatrix);
    // // mat4.translate(modelMatrix, modelMatrix, [0.0 + 2.2 + test_translate_X , 0.0 + test_translate_Y , 0.0 - 5.5 + test_translate_Z])
    // // mat4.scale(modelMatrix,modelMatrix,[ 5.0 , 5.0  , 5.0 ]);
    // // mat4.rotateY(modelMatrix, modelMatrix, [90 + (4.3 + 6.5 + 6.5 + 25.2 + 5.4 + test_scale_X)])
    // // renderAssimpModel(modelMatrix,13,0,[],[]);

}

function UpdateSceneSeven()
{
   
}

function UninitializeSceneSeven()
{
}

