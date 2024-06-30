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
//Need to reset camera paths
const Scene2_controlPoints = [
  [94.99358310261765,74.33581786789497,210.49747779588023 , -9.248153863973856 , -92.99999999999936],
  [10.62901167174151,95.65099812412927,244.2914614603873 , 2.364373357682116 , -97.99999999999952],
  [208.21280150157958,72.81144436996345,345.55190974760137 , -14.635626642317867 , -94.59999999999941],
  [219.6143804144843,88.37598001356025,350.49216348625794 , -14.635626642317867 , -94.59999999999941]
  // [144.3809611232921,79.18538151916013,343.3457449067854 , -7.461111947191337 , -87.19999999999942],
  // [948.199097797844,212.81782870451985,291.73360447533565 , -18.261111947191317 , -90.99999999999946]
];
//  [298.79398369719587,764.6333157198022,3682.657355579923, -10.467704044581433, -94.59999999999987],


/*----------------------------------- Scene Two Initialise -----------------------------------*/

function InitializeSceneTwo()
{
  let scene_two_skyboxTextures = [ 
    "src/resources/textures/skybox/Scene2/night_2/px.png", 
    "src/resources/textures/skybox/Scene2/night_2/nx.png", 
    "src/resources/textures/skybox/Scene2/night_2/py.png",
    "src/resources/textures/skybox/Scene2/night_2/ny.png",
    "src/resources/textures/skybox/Scene2/night_2/pz.png", 
    "src/resources/textures/skybox/Scene2/night_2/nz.png"
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
  mat4.translate(modelMatrix, modelMatrix, [0.0 + 2.2  , 0.0  , 0.0 - 5.5 ])
  mat4.scale(modelMatrix,modelMatrix,[ 5.0 , 5.0  , 5.0 ]);
  mat4.rotateY(modelMatrix, modelMatrix, [90 + (4.3 + 6.5 + 6.5 + 25.2 + 5.4 )])
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

var scene_two_StartTime = 155;
var scene_two_duration = 30;

/*----------------------------------- Scene Two Update -----------------------------------*/
function UpdateSceneTwo()
{
  if (scene == 2 && (scene_two_StartTime + scene_two_duration  > performance.now()/1000)) {
    bezierCurve(Scene2_controlPoints, performance.now() / 1000, scene_two_StartTime, scene_two_duration);
  }else{
   //scene++;
  }
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
