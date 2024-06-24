
/*********************************************************************************
 * 
 * SCENE Description :
 * 
 *  Instancing with reflection of lanterns in water
 * 
 * ambar toh kya hai taro ke bhi lab chhule
 * 
 * lanterns 
 * point lights
 * Water
 * 
*/

var SCENE_SIX = 6;

// ---------------------------
function InitializeSceneSix()
{
  
}

function RenderSceneSix()
{
    gl.clearColor(1.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // console.log("GetCameraViewMatrix() "+ GetCameraViewMatrix());
    // console.log("perspectiveProjectionMatrix "+ perspectiveProjectionMatrix);

    // gl.bindFramebuffer(gl.FRAMEBUFFER, finalScene_fbo.fbo);
    // gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    DrawSkybox(SCENE_ONE);
    //Render terrain
    if (terrain_data[SCENE_FOUR]) {
      RenderTerrain(terrain_data[SCENE_FOUR], SCENE_FOUR);
    }
    // gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    // RenderWithTextureShader(finalScene_fbo.cbo, 0);
}

function UpdateSceneSix()
{
   
}

function UninitializeSceneSix()
{
    
}
