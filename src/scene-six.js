
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
function InitializeSceneSix()
{
    scene_six_texture_rainbow = loadTexture("src\\resources\\textures\\rainbow.png", true) 
}

function RenderSceneSix()
{
    gl.clearColor(1.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    var point_lightPositions = [];
    var point_lightColors = [1, 0.776, 0.559];
    
    DrawSkybox(SCENE_ZERO);
    let fogColor = [0.8, 0.9, 0.1, 1];
    //Render terrain
    if (terrain_data[SCENE_FIVE]) {
      let fogColor = [0.8, 0.9, 1, 0.0];
      let modelMatrix = mat4.create();
      RenderTerrain(terrain_data[SCENE_FIVE], SCENE_SIX,fogColor, modelMatrix, false);
    }
  
  // terrain
  var modelMatrix = mat4.create();
//   mat4.translate(modelMatrix, modelMatrix, [30.0 + 90 + 7.699999999999999 , -90.0 + 130 + 1.1, -1.0 + 352 - 1.1 ])
//   mat4.scale(modelMatrix,modelMatrix,[8.5 , 8.5 , 8.5]);
//   mat4.rotateY(modelMatrix, modelMatrix, [90])
//   //Model :Rapunzel, index : 5
//   renderAssimpModel(modelMatrix,5,0,point_lightPositions,point_lightColors,0,fogColor);
  
  //mat4.translate(modelMatrix, modelMatrix, [30.0, -30.0, -1.0]);
  //mat4.scale(modelMatrix,modelMatrix,[10.0,10.0,10.0]);
  //mat4.translate(modelMatrix, modelMatrix, [2564.0999999998876, -1490.499999999971, 22240.999999999782]);
  //mat4.translate(modelMatrix, modelMatrix, [2564.0999999998876 + test_translate_X, 6320.499999999971 + test_translate_Y, 22240.999999999782 + test_translate_Z]);
  //mat4.rotateX(modelMatrix, modelMatrix, degToRad(-21.0));
  //mat4.rotateY(modelMatrix, modelMatrix, degToRad(-109.0));
  mat4.translate(modelMatrix, modelMatrix, [2564.0999999998876, -1490.499999999971, 22240.999999999782]);
//   mat4.scale(modelMatrix, modelMatrix,[10000.0, 2500.0, 10000.0]);
    //renderAssimpModel(modelMatrix,13,0,point_lightPositions,point_lightColors,1,fogColor,1.0);
  renderAssimpModel(modelMatrix, 8, 0, point_lightPositions, point_lightColors, 0, fogColor, 1.0, 1.0);
  
  // Render terrain
//   if (terrain_data[SCENE_FOUR]) {
//     let fogColor = [0.8, 0.9, 1, 1];
//     RenderTerrain(terrain_data[SCENE_FOUR], SCENE_FOUR,fogColor, modelMatrix, false);
//   }

  // girl pose 1
//   modelMatrix = mat4.create();
//   mat4.translate(modelMatrix, modelMatrix, [30.0, -30.0, 1910]);
//   mat4.scale(modelMatrix,modelMatrix,[25.0, 25.0, 25.0]);
//   mat4.rotateY(modelMatrix, modelMatrix, degToRad(240.0));
//   renderAssimpModel(modelMatrix,8,0,point_lightPositions,point_lightColors,1,fogColor,1.0);

  // // bushes
  // modelMatrix = mat4.create();
  // mat4.translate(modelMatrix, modelMatrix, [-190, -30.0, 1910]);
  // mat4.scale(modelMatrix,modelMatrix,[100.0, 100.0, 100.0]);
  // renderAssimpModel(modelMatrix,11,0,point_lightPositions,point_lightColors,1,fogColor,1.0);

  // modelMatrix = mat4.create();
  // mat4.translate(modelMatrix, modelMatrix, [-190, -30.0, 1530]);
  // mat4.scale(modelMatrix,modelMatrix,[100.0, 100.0, 100.0]);
  // renderAssimpModel(modelMatrix,11,0,point_lightPositions,point_lightColors,1,fogColor,1.0);

  // modelMatrix = mat4.create();
  // mat4.translate(modelMatrix, modelMatrix, [170, -30.0, 1740]);
  // mat4.scale(modelMatrix,modelMatrix,[80.0, 80.0, 80.0]);
  // renderAssimpModel(modelMatrix,11,0,point_lightPositions,point_lightColors,1,fogColor,1.0);

  // modelMatrix = mat4.create();
  // mat4.translate(modelMatrix, modelMatrix, [170, -30.0, 2030]);
  // mat4.scale(modelMatrix,modelMatrix,[80.0, 80.0, 80.0]);
  // renderAssimpModel(modelMatrix,11,0,point_lightPositions,point_lightColors,1,fogColor,1.0);

  // modelMatrix = mat4.create();
  // mat4.translate(modelMatrix, modelMatrix, [170, -30.0, 2290]);
  // mat4.scale(modelMatrix,modelMatrix,[80.0, 80.0, 80.0]);
  // renderAssimpModel(modelMatrix,11,0,point_lightPositions,point_lightColors,1,fogColor,1.0);

  // modelMatrix = mat4.create();
  // mat4.translate(modelMatrix, modelMatrix, [-190, -30.0, 2170]);
  // mat4.scale(modelMatrix,modelMatrix,[100.0, 100.0, 100.0]);
  // renderAssimpModel(modelMatrix,11,0,point_lightPositions,point_lightColors,1,fogColor,1.0);


  // // flowers
  // modelMatrix = mat4.create();
  // mat4.translate(modelMatrix, modelMatrix, [180, -28.0, 1860]);
  // mat4.rotateX(modelMatrix, modelMatrix, degToRad(-90.0));
  // mat4.scale(modelMatrix,modelMatrix,[2.0, 2.0, 2.0]);
  // renderAssimpModel(modelMatrix,12,0,point_lightPositions,point_lightColors,1,fogColor,1.0);

  // modelMatrix = mat4.create();
  // mat4.translate(modelMatrix, modelMatrix, [-770, -28.0, 1860]);
  // mat4.rotateX(modelMatrix, modelMatrix, degToRad(-90.0));
  // mat4.scale(modelMatrix,modelMatrix,[3.0, 3.0, 3.0]);
  // renderAssimpModel(modelMatrix,12,0,point_lightPositions,point_lightColors,1,fogColor,1.0);

  // modelMatrix = mat4.create();
  // mat4.translate(modelMatrix, modelMatrix, [-470, -28.0, 1530]);
  // mat4.rotateX(modelMatrix, modelMatrix, degToRad(-90.0));
  // mat4.scale(modelMatrix,modelMatrix,[4.0, 4.0, 4.0]);
  // renderAssimpModel(modelMatrix,12,0,point_lightPositions,point_lightColors,1,fogColor,1.0);

  // modelMatrix = mat4.create();
  // mat4.translate(modelMatrix, modelMatrix, [-470, -28.0, 970]);
  // mat4.rotateX(modelMatrix, modelMatrix, degToRad(-90.0));
  // mat4.scale(modelMatrix,modelMatrix,[4.0, 4.0, 4.0]);
  // renderAssimpModel(modelMatrix,12,0,point_lightPositions,point_lightColors,1,fogColor,1.0);

  // modelMatrix = mat4.create();
  // mat4.translate(modelMatrix, modelMatrix, [-1600, -28.0, 1750]);
  // mat4.rotateX(modelMatrix, modelMatrix, degToRad(-90.0));
  // mat4.scale(modelMatrix,modelMatrix,[3.0, 3.0, 3.0]);
  // renderAssimpModel(modelMatrix,12,0,point_lightPositions,point_lightColors,1,fogColor,1.0);


  // // rainbow texture
  // gl.enable(gl.BLEND);
  // gl.blendEquation(gl.FUNC_ADD);
  // gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
  // modelMatrix = mat4.create();
  // mat4.translate(modelMatrix,modelMatrix,[0.0, 0.0, -500.0]);
  // RenderWithTextureShader(scene_six_texture_rainbow, 0);
  // gl.disable(gl.BLEND);

}

function UpdateSceneSix()
{
   
}

function UninitializeSceneSix()
{
    
}

