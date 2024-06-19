/*********************************************************************************
 * 
 * SCENE Description :
 * Girl looking out from window 
*/

var SCENE_THREE = 3;


const Scene3_controlPoints = [
  [298.5107073089176,785.1349368758114,2085.443908695071,-12.090902084172717, -88.39999999999996],
  [-199.5538184874672,692.6223169910097,2491.234708016791, -11.667704044581441, -94.59999999999997],
  [298.79398369719587,790.6333157198022,3682.657355579923, -10.467704044581433, -94.59999999999987],
  [1784.151260690953,1049.043325240332,3518.069790959837, -21.66770404458143, -78.39999999999988]
  //[137.52516631157724, -81.33711919060856, -5.38612557063494, -13.042920367320477, -630.9999999999997],
  //[179.3081591306077, -97.33037030294784, -3.89842326914559, -5.242920367320477, -630.9999999999995]
];
//  [298.79398369719587,764.6333157198022,3682.657355579923, -10.467704044581433, -94.59999999999987],


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
  if (startTime == 0) {
    startTime = performance.now() / 1000;
  }
  console.log("scene 3 update with start time "+startTime +" " +  performance.now()/1000);
  if (scene == 3 && (startTime + 30 + 32 > performance.now()/1000)) {
    console.log("bazier curve " + startTime);
    bezierCurve(Scene3_controlPoints, performance.now() / 1000, startTime+32, 30);
  }else{
    scene++;
  }
}

function UninitializeSceneThree()
{
    
}
