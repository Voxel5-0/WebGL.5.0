
/*********************************************************************************
 * 
 * SCENE Description :
 * Instancing with reflection of lanterns in water
 * ambar toh kya hai taro ke bhi lab chhule
 * 
 * TIME : 8.	3.11 to 3.36
 * 
 * lanterns 
 * point lights
 * Water
 * 
*/

var SCENE_SIX = 6;
var scene_six_texture_rainbow;

// ---------------------------
function InitializeSceneSix() {
}

function RenderSceneSix() {
  let fogColorModel = [0.8, 0.9, 1, 0.5];
  // mat4.translate(modelMatrix, modelMatrix, [30.0 + 126.4+ 405.00 , -90.0 +  87.99  , -1.0 +  567.60 + 42.0 ])
  //188.54773835466648,-105,4.046151170852721
  // 481.0,-120, 595.0
  // 47
  const scene_six_lantern_position = [
    [631.47, -55.286, 164.171],
    [644.05, -49.995, 181.981],
    [630.26, -45.012, 195.740],
    [627.19, -41.617, 185.181],
    [636.80, -36.969, 179.814],
    [647.40, -31.664, 187.677],
    [645.07, -34.917, 198.428],
    [653.60, -42.116, 208.504],
    [666.72, -47.908, 208.697],
    [659.01, -48.591, 221.464],
    [643.62, -49.159, 222.024],
    [627.21, -46.740, 215.710],
    [616.31, -42.306, 204.957],
    [609.36, -40.967, 188.942],
    [597.99, -37.267, 175.570],
    [574.58, -31.606, 187.652],
    [559.65, -21.558, 214.569],
    [575.23, -25.501, 250.972],
    [611.69, -24.886, 275.596],
    [645.89, -26.368, 260.448],
    [662.98, -26.307, 212.827],
    [543.74, -25.427, 116.716],
    [502.88, -26.355, 159.825],
    [496.19, -34.025, 211.990],
    [498.21, 3.790, 260.348],
    [465.95, 34.213, 233.781],
    [481.01, 73.764, 178.600],
    [400.29, 77.689, 122.449],
    [396.00, 69.746, 78.659],
    [431.29, 29.656, 48.839],
    [486.85, -23.563, 148.544],
    [649.01, -24.115, 304.629],
    [577.82, 13.245, 338.871],
    [554.35, 63.491, 280.264],
    [590.25, 59.580, 244.631],
    [563.83, 54.574, 204.079],
    [600.61, 55.910, 166.339],
    [565.25, 79.040, 144.201],
    [560.30, 96.705, 185.707],
    [599.54, 75.628, 205.620],
    [581.23, 57.475, 250.419],
    [530.44, 37.590, 264.833],
    [484.48, 6.050, 295.044],
    [447.57, -13.328, 304.318],
    [418.88, -23.052, 268.148],
    [404.82, -17.295, 221.923],
    [378.09, -36.754, 193.480],
    [414.86, -24.685, 158.714],
    [455.92, -43.627, 150.999],
    [562.54, -63.646, 138.850],
    [587.00, -25.939, 256.281],
    [414.06, -5.134, 238.920],
    [389.27, -56.044, 327.833],
    [390.96, -44.017, 303.692],
    [421.74, -29.274, 304.644],
    [422.58, -28.063, 308.860],
    [408.91, -21.822, 328.827],
    [435.27, -32.161, 296.387],
    [415.42, -44.849, 279.344],
    [402.27, -59.021, 290.629],
    [383.41, -51.403, 332.801],
    [378.70, -51.839, 337.045],
    [372.97, -49.393, 343.721],
    [379.19, -42.012, 355.115],
    [370.59, -33.841, 345.546],
    [392.97, 3.009, 299.099],
    [431.18, 16.819, 288.748],
    [410.68, 37.183, 268.809],
    [426.76, 63.396, 220.844],
    [455.38, 65.039, 210.010],
    [496.64, 64.148, 235.302],
    [539.66, 27.643, 252.159],
    [498.21, -16.060, 232.63]
  ];
  var modelMatrixArray = [];
  
  let fogColor = [0.8, 0.9, 0.1, 1];

  for(i =0 ; i<modelList[0].instanceCount;i++){
    var modelMatrix = mat4.create()
    mat4.translate(modelMatrix, modelMatrix, [scene_six_lantern_position[i][0],scene_six_lantern_position[i][1],scene_six_lantern_position[i][2]])
    mat4.scale(modelMatrix,modelMatrix,[1.5 ,1.5 ,1.5]);
    modelMatrixArray.push(modelMatrix);
  }

  /*----------------------------------- Rendering For Reflection FBO -----------------------------------*/
  animateWater();
  gl.bindFramebuffer(gl.FRAMEBUFFER, reflection_fbo.fbo);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  // CameraReflect();
  //render disney castle model for reflection FBO 
  let modelMatrixRapunzal = mat4.create()
  mat4.translate(modelMatrixRapunzal, modelMatrixRapunzal, [0.0, -30.0, -1.0])
  mat4.scale(modelMatrixRapunzal, modelMatrixRapunzal, [10.0, 10.0, 10.0]);
  //renderAssimpModel(modelMatrixRapunzal,2,0,[],[],1,fogColorModel,1);
  //render skybox for reflection FBO 
  DrawSkybox(SCENE_ZERO);
  renderAssimpModelWithInstancing(modelMatrixArray,0,0,[],[],0,fogColor,1.0);
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);

  /*----------------------------------- Rendering For Refraction FBO -----------------------------------*/
  gl.bindFramebuffer(gl.FRAMEBUFFER, refraction_fbo.fbo);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  // CameraReflect();
  //render skybox for refraction FBO 
  DrawSkybox(SCENE_ZERO);
  renderAssimpModelWithInstancing(modelMatrixArray,0,0,[],[],0,fogColor,1.0);
  //Bridge Model 
  var modelMatrix = mat4.create()
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);

  /***********************************Rendering for Godrays FBO************************************************* */
  gl.bindFramebuffer(gl.FRAMEBUFFER, godRays_scene_fbo.fbo);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  DrawSkybox(SCENE_ZERO);
  //Render terrain
  if (terrain_data[SCENE_FIVE]) {
    let terrain_model_matrix = mat4.create();
    let fogColor = [0.8, 0.9, 1, 0.0];
    RenderTerrain(terrain_data[SCENE_FIVE], SCENE_FIVE, fogColor, terrain_model_matrix, 1);
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
  mat4.scale(modelMatrixRapunzal, modelMatrixRapunzal, [10.0, 10.0, 10.0]);
  //renderAssimpModel(modelMatrixRapunzal,2,0,[],[],1,fogColorModel,1);
  // gl.enable(gl.BLEND);
  // gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  // renderAssimpModelWithInstancing(modelMatrixArray,9,0,[],[],1,fogColor,[],0,1);
  // gl.disable(gl.BLEND);
  RenderWater(reflection_fbo.cbo, refraction_fbo.cbo, refraction_fbo.dbo, 705.100 + test_translate_X, 0 + 20.90 + 22.000 + test_translate_Y, 10.0 + test_translate_Z, test_scale_X);
  renderAssimpModelWithInstancing(modelMatrixArray,0,0,[],[],0,fogColor,1.0);

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
  var sunPosition = [700.0, 250.0, 800.0]
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
  renderAssimpModelWithInstancing(modelMatrixArray,0,0,[],[],0,fogColor,0);
  //function renderAssimpModelWithInstancing(modelMatrixArray: any, modelNumber: any, pointLightsCount: any, lightPositions: any, lightColors: any, isFogEnabled: any, fogColor: any, alphaArray: any, isDirectionalLightEnabled: any, isOccluded: any): void
  //renderAssimpModelWithInstancing(modelMatrixArray,9,0,[],[],1,fogColor,[],0,1);

  gl.bindFramebuffer(gl.FRAMEBUFFER, null);

  /***********************************Rendering for godRays final pass************************************************* */
  v = vec4.fromValues(sunPosition[0], sunPosition[1], sunPosition[2], 1.0);
  vec4.transformMat4(v, v, godrays_viewMatrix)
  vec4.transformMat4(v, v, perspectiveProjectionMatrix)

  // perspective division
  vec4.scale(v, v, 1.0 / v[3])

  // // scale (x,y) from range [-1,+1] to range [0,+1]
  vec4.add(v, v, [1.0, 1.0, 0.0, 0.0])
  vec4.scale(v, v, 0.5)

  godrays_display_godrays();

  //rainbow texture
  gl.enable(gl.BLEND);
  gl.blendEquation(gl.FUNC_ADD);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
  modelMatrix = mat4.create();
  mat4.translate(modelMatrix, modelMatrix, [0.0, 0.0, -500.0]);
  RenderWithTextureShader(scene_five_texture_rainbow, 0);
  gl.disable(gl.BLEND);

  /***********************************Rendering for Actual scene************************************************* */
  gl.bindFramebuffer(gl.FRAMEBUFFER, godRays_final_fbo.fbo);
  godrays_display_final();
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);

  /***********************************Post Processing************************************************* */
  RenderWithTextureShader(godRays_final_fbo.cbo, 0)
}

function UpdateSceneSix() {

}

function UninitializeSceneSix() {

}

