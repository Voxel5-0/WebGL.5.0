/*********************************************************************************
 * 
 * SCENE Description :
 *  Again Open terrain – with Rapunzel – fade in out to change position
 * Time : 0.50 to 1.26  	
*/

var SCENE_THREE = 3;


const Scene3_controlPoints = [
  [503.3953273570572,1.247241509139927,917.2914864075009 , -370.1542669593973 , 9.00000000000049],
  [472.18016558072054,1.03497029966528,817.2925216369422 , -6.222215751217598 , -0.3999999999993748],
  [481.8068560025994,17.036094497555222,747.5847517903992 , -3.2222157512175187 , -6.399999999999374],
  [529.1777427383083,30.69350303936655,670.0560417845754 , -1.6222157512175213 , -0.9999999999993512],
  [496.42371029397964,32.88089047324093,602.2608595616801 , 4.777784248782519 , -1.1999999999993554],
  [523.0743615449115,27.76347967393283,544.453971278314 , 5.977784248782521 , 2.0000000000006213],
  [502.91157062458433,17.224045786580135,488.481311838547 , -4.822215751217475 , -7.199999999999405], 
  [474.99650206651233,17.51009646705504,473.2114641592713 , 0.5777842487825273 , 67.80000000000099]
];
//  [298.79398369719587,764.6333157198022,3682.657355579923, -10.467704044581433, -94.59999999999987],

const girlPositionArray = [
  [519.1215562404584,21.66288172108338 -50.60000000000004,823.2565573853633],
  [485.5019979502513,-12.42705527662795,733.0048046728047],
  [526.1251584594924,14.763731703862078 + 18.7 - 34.100000000000016 ,678.2930318335835],
  [517.8842773163087,16.312529582585356 + 1.299999999999994 - 16.499999999999996,615.0823303234904],
  [518.0915859866825,13.751705473829322 + 50.60000000000004 - 70.40000000000002 ,542.4984536133315]
];

// ---------------------------
function InitializeSceneThree()
{

}

function RenderSceneThree()
{
// mat4.translate(modelMatrix, modelMatrix, [30.0 + 126.4+ 405.00 , -90.0 +  87.99  , -1.0 +  567.60 + 42.0 ])
  //188.54773835466648,-105,4.046151170852721
		// 481.0,-120, 595.0
    // 47
    // var scene_one_tree_x = [25.97, 12.07, 34.14, 44.04, 58.43, 60.33, 99.23, 103.18, 136.72, 116.20, 135.18, 152.61, 167.75, 175.58, 201.51, 204.13, 224.33, 247.12, 279.17, 340.85, 344.85, 350.50, 357.79, 361.62, 366.40, 389.26, 411.72, 425.94, 439.63, 467.15, 481.98, 499.24, 520.60, 546.06, 575.87, 604.17,482.64, 463.57, 446.34, 433.30, 418.23, 409.02, 399.15, 390.91, 377.85, 350.19, 318.06,291.90]
    // var scene_one_tree_y = [-138.50, -138.56, -139.41, -138.29, -139.01, -140.89, -138.55, -138.83, -142.09, -134.31, -135.12, -139.98, -141.06, -136.02, -142.16, -138.55, -140.30, -140.62, -139.03, -141.34, -135.70, -130.13, -125.17, -129.13, -120.04,-127.96, -129.93, -131.97, -134.75, -139.25, -140.86, -141.11, -141.76, -140.94, -140.84, -142.58,-140.70, -141.46, -141.71, -141.31, -140.44, -140.10, -137.48, -133.73, -130.59, -132.53, -135.95,-139.59];
    // var scene_one_tree_z = [375.70, 425.95, 435.32, 383.23, 398.27, 452.60, 428.12, 484.83, 453.81, 499.67, 500.59, 459.08, 461.23, 508.45, 464.07, 507.92, 459.57, 518.47, 473.63, 447.20,  412.29, 378.45, 353.69, 338.23, 364.33, 321.46, 295.39, 276.17, 265.39, 260.69, 264.65, 262.26, 267.20, 274.13, 281.66, 292.08,310.67, 315.22, 331.64, 351.81, 380.95, 405.50, 436.91, 466.32, 491.61, 512.42, 519.47,521];
    var modelMatrixArray = [];
    
    /***********************************Rendering for Godrays FBO************************************************* */
    var modelMatrixArray = [];
    for(i =0 ; i<modelList[12].instanceCount;i++){
      let modelMatrixTree = mat4.create()
      if(positions[i][0] < 500){
        mat4.translate(modelMatrixTree, modelMatrixTree, [positions[i][0] - 36.30000000000002 ,positions[i][1] ,positions[i][2] +test_translate_Z])
      }else{
        mat4.translate(modelMatrixTree, modelMatrixTree, [positions[i][0] + -36.30000000000002 ,positions[i][1] ,positions[i][2] + test_translate_Z])
      }
      mat4.scale(modelMatrixTree,modelMatrixTree,[0.3 ,0.5 ,0.3]);
      modelMatrixArray.push(modelMatrixTree);
    }

    var modelMatrixArrayForGirl = [];
    for(i =0 ; i<modelList[8].instanceCount;i++){
      let modelMatrixGirl = mat4.create()
      // if(i==3){
      //   mat4.translate(modelMatrix, modelMatrix, [girlPositionArray[i][0],girlPositionArray[i][1]-test_translate_Y,girlPositionArray[i][2]])
      // }else if(i==4){
      //   mat4.translate(modelMatrix, modelMatrix, [girlPositionArray[i][0],girlPositionArray[i][1]-test_translate_X,girlPositionArray[i][2]])
      // }
      // else if(i==2){
      //   mat4.translate(modelMatrix, modelMatrix, [girlPositionArray[i][0],girlPositionArray[i][1]-test_translate_Z,girlPositionArray[i][2]])
      // }else{
        mat4.translate(modelMatrixGirl, modelMatrixGirl, [girlPositionArray[i][0],girlPositionArray[i][1],girlPositionArray[i][2]])
      // }
      mat4.scale(modelMatrixGirl,modelMatrixGirl,[1.0 +4.4 ,1.0+4.4 ,1.0+4.4]);
      mat4.rotateY(modelMatrixGirl,modelMatrixGirl,[degToRad(180)]);

      modelMatrixArrayForGirl.push(modelMatrixGirl);
    }
    /***********************************Rendering for Godrays FBO************************************************* */
    gl.bindFramebuffer(gl.FRAMEBUFFER, godRays_scene_fbo.fbo);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    DrawSkybox(SCENE_ZERO);
    //Render terrain
    if (terrain_data[SCENE_ONE]) {
      let fogColor = [0.8, 0.9, 1, 0.5];
      let terrain_model_matrix = mat4.create();
      mat4.scale(terrain_model_matrix,terrain_model_matrix,[10.3  , 11.5 , 10.3]);
     // RenderTerrain(terrain_data[SCENE_FIVE], SCENE_FIVE,fogColor ,terrain_model_matrix);
      mat4.translate(terrain_model_matrix,terrain_model_matrix,[10.3  , 10.5 , 10.3]);
      RenderTerrain(terrain_data[SCENE_FIVE], SCENE_FIVE,fogColor ,terrain_model_matrix,0);

      // let modelMatrixTerrainModel = mat4.create();
      // mat4.translate(modelMatrixTerrainModel, modelMatrixTerrainModel, [1.0 + test_translate_X, 35.0 + test_translate_Y, 180.0 + test_translate_Z])
      // mat4.scale(modelMatrixTerrainModel, modelMatrixTerrainModel, [1.0 + test_scale_X, 35.0 + test_scale_X, 180.0 + test_scale_X])
      // renderAssimpModel(modelMatrixTerrainModel,13,0,[],[],0,fogColor,1.0);
    }
    
    let fogColor = [0.2, 0.2, 0.2, 0.0];
    //renderAssimpModelWithInstancing(modelMatrixArray,12,0,[],[],0,fogColor,1.0);
    renderAssimpModelWithInstancing(modelMatrixArray,12,0,[],[],0,fogColor,1.0,0,0);
    renderAssimpModelWithInstancing(modelMatrixArrayForGirl,8,0,[],[],0,fogColor,1.0,0,0);
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
    renderAssimpModelWithInstancing(modelMatrixArray,12,0,[],[],0,fogColor,1.0,0,1);
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

    /***********************************Post Processing************************************************* */
    RenderWithGrayScaleTextureShader(godRays_final_fbo.cbo,0)
 
}

function degToRad(degrees) {
  return (degrees * Math.PI / 180.0);
}

var scene_three_StartTime = 155;
var scene_three_duration = 60;

function UpdateSceneThree()
{
  if (scene == 3 && (scene_three_StartTime + scene_three_duration  > performance.now()/1000)) {
    bezierCurve(Scene3_controlPoints, performance.now() / 1000, scene_three_StartTime, scene_three_duration);
  }else{
   //scene++;
  }
}

function UninitializeSceneThree()
{
}
