/*********************************************************************************
 * 
 * SCENE Description :
 * Girl looking out from window - Father looking at her
 * 
 * Time : 0.25 to 0.50 	- Scene 2 – Room – camera from painting to window
 * Pending : make frame and particle color
 * 
*/

/*----------------------------------- Scene two global variables -----------------------------------*/

var SCENE_TWO = 2;

/*----------------------------------- Camera Contol Points and variables -----------------------------------*/
const Scene2_controlPoints = [
  [298.5107073089176,785.1349368758114,2085.443908695071,-12.090902084172717, -88.39999999999996],
  [-199.5538184874672,692.6223169910097,2491.234708016791, -11.667704044581441, -94.59999999999997],
  [298.79398369719587,790.6333157198022,3682.657355579923, -10.467704044581433, -94.59999999999987],
  [1784.151260690953,1049.043325240332,3518.069790959837, -21.66770404458143, -78.39999999999988]
  //[137.52516631157724, -81.33711919060856, -5.38612557063494, -13.042920367320477, -630.9999999999997],
  //[179.3081591306077, -97.33037030294784, -3.89842326914559, -5.242920367320477, -630.9999999999995]
];
//  [298.79398369719587,764.6333157198022,3682.657355579923, -10.467704044581433, -94.59999999999987],


/*----------------------------------- Scene Two Initialise -----------------------------------*/

function InitializeSceneTwo()
{
  let scene_two_skyboxTextures = [ 
    "src/resources/textures/skybox/Scene2/night/px.png", 
    "src/resources/textures/skybox/Scene2/night/nx.png", 
    "src/resources/textures/skybox/Scene2/night/py.png",
    "src/resources/textures/skybox/Scene2/night/ny.png",
    "src/resources/textures/skybox/Scene2/night/pz.png", 
    "src/resources/textures/skybox/Scene2/night/nz.png"
  ];
  LoadSkyboxTextures(scene_two_skyboxTextures, 2);
  pl_initialize();
}

/*----------------------------------- Scene Two Render -----------------------------------*/
function RenderSceneTwo()
{

  //Uniforms for point lights
  var point_lightPositions = [];
  var point_lightColors = [1, 0.776, 0.559];
  let fogColor = [0.8, 0.9, 1, 1];
  /**
   * X , Y ,Z  adjustments:87.99999999999993 , 120.99999999999976 , 352.0000000000011
   */

    /*----------------------------------- Actual Scene Two -----------------------------------*/
  gl.bindFramebuffer(gl.FRAMEBUFFER, finalScene_fbo.fbo);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  var modelMatrix = mat4.create()
  mat4.translate(modelMatrix, modelMatrix, [30.0, -30.0, -1.0])
  //mat4.scale(modelMatrix,modelMatrix,[10.0,10.0,10.0]);
  //mat4.rotateY(modelMatrix,modelMatrix,90);
  //Model : Room , index : 2
  renderAssimpModel(modelMatrix,2,0,point_lightPositions,point_lightColors,0,fogColor);

  mat4.translate(modelMatrix, modelMatrix, [30.0 + 90 + 7.699999999999999 , -90.0 + 130 + 1.1, -1.0 + 352 - 1.1 ])
  mat4.scale(modelMatrix,modelMatrix,[8.5 , 8.5 , 8.5]);
  mat4.rotateY(modelMatrix, modelMatrix, [90])
  //Model :Rapunzel, index : 5
  renderAssimpModel(modelMatrix,5,0,point_lightPositions,point_lightColors,0,fogColor);

  // X , Y ,Z  adjustments:2.2 , 0 , -5.5
  
  //mat4.identity(modelMatrix);
  mat4.translate(modelMatrix, modelMatrix, [0.0 + 2.2 + test_translate_X , 0.0 + test_translate_Y , 0.0 - 5.5 + test_translate_Z])
  mat4.scale(modelMatrix,modelMatrix,[ 5.0 , 5.0  , 5.0 ]);
  mat4.rotateY(modelMatrix, modelMatrix, [90 + (4.3 + 6.5 + 6.5 + 25.2 + 5.4 + test_scale_X)])
  //Model : Father , index : 10
  renderAssimpModel(modelMatrix,10,0,point_lightPositions,point_lightColors,0,fogColor);

  // DrawSkybox(SCENE_ZERO);
  DrawSkybox(SCENE_TWO);
  
  //mat4.identity(modelMatrix);
  //mat4.translate(modelMatrix, modelMatrix, [30.0 + 90 + test_translate_X, -90.0 + 125  + test_translate_Y, -1.0 + 352 + test_translate_Z])
  //mat4.scale(modelMatrix,modelMatrix,[1.0 + test_scale_X,1.0 + test_scale_X ,1.0 + test_scale_X]);
  //pl_display(modelMatrix);

  pl_display();
  
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  
  /*----------------------------------- Post Processing on Scene -----------------------------------*/
  var model_matrix = mat4.create();
  RenderWithGrayScaleTextureShader(finalScene_fbo.cbo, 0);
}


/*----------------------------------- Scene Two Update -----------------------------------*/
function UpdateSceneTwo()
{
  // if (startTime == 0) {
  //   startTime = performance.now() / 1000;
  // }
  // if (scene == 2 && (startTime + 30 + 32 > performance.now()/1000)) {
  //   bezierCurve(Scene2_controlPoints, performance.now() / 1000, startTime+32, 30);
  // }else{
  //  scene++;
  // }
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


/*----------------------------------- Scene Two Uninitialize -----------------------------------*/

function UninitializeSceneTwo()
{
  // pl_uninitialize();
}
