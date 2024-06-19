/*********************************************************************************
 * 
 * SCENE Description :
 * Girl looking out from window 
*/

var SCENE_THREE = 3;



// ---------------------------
function InitializeSceneThree()
{
  
}

function RenderSceneThree()
{

  //Uniforms for point lights
  var point_lightPositions = [
   
  ];

  var point_lightColors = [1, 0.776, 0.559];


  /**
   * X , Y ,Z  adjustments:87.99999999999993 , 120.99999999999976 , 352.0000000000011
   */

  //Render final scene in final buffer
  gl.bindFramebuffer(gl.FRAMEBUFFER, finalScene_fbo.fbo);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  //Render castle for actual scene
  var modelMatrix = mat4.create()
  mat4.translate(modelMatrix, modelMatrix, [30.0, -30.0, -1.0])
  mat4.scale(modelMatrix,modelMatrix,[10.0,10.0,10.0]);
  //mat4.rotateY(modelMatrix,modelMatrix,90);
  renderAssimpModel(modelMatrix,1,0,point_lightPositions,point_lightColors);


  mat4.translate(modelMatrix, modelMatrix, [30.0 + 90 , -90.0 + 125 , -1.0 + 352])
  mat4.scale(modelMatrix,modelMatrix,[8.0 + test_scale_X , 8.0+test_scale_X , 8.0+test_scale_X]);
  mat4.rotateY(modelMatrix, modelMatrix, [90])
  renderAssimpModel(modelMatrix,4,0,point_lightPositions,point_lightColors);
  //Render skybox for actual scene
  DrawSkybox(SCENE_ONE);
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);


  //Render final scene with grayscale
  var model_matrix = mat4.create();
  RenderWithGrayScaleTextureShader(finalScene_fbo.cbo, 0);
}
//Window Position
//stop
//Camera position: 839.3748504733472,913.5699306768837,3457.2617164428516
//main.js:388 X rotation: -14.242920367320545
//main.js:389 Y rotation: -96.39999999999966

//start
// Camera position: 1385.3331602934245,954.5136326387809,3441.405774927659
// main.js:388 X rotation: -13.442920367320495
// main.js:389 Y rotation: -114.99999999999892

function UpdateSceneThree()
{
   
}

function UninitializeSceneThree()
{
    
}
