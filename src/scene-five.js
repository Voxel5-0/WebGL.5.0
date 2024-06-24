/*********************************************************************************
 * 
 * SCENE Description :
 * 
 * Here we need a sound effect and on screen we are able see river flowing 
 * 
 * Jhula dhanak ka dhire dhire hum jhule
 * 
 * Terrain - Done 
 * Trees - Model loading done
 * Water
 * Rainbow - Texture - blending 
 * Atmospheric scaterring 
 * Bill boarding  - field of flowers
 * 
*/

var SCENE_FIVE = 5;

 //Uniforms for point lights
 var s5_point_lightPositions = [
  [13.21327183125484, -67.44632010003868, -4.840837788952009], //middle
  [9.958236978785187, -87.20368404972493, 4.3888549228581475], //left
  [10.240470221367731, -86.58628336655747, -14.213709470661364], //right
  [30.354274982918096, -82.16404503148408, -5.308960274678841], //middleBottom
  [10.037352469619046, -94.20165532734516, 23.91656258654752], //Left-pit
  [11.225923093363434, -95.20251447029362, -35.5777721241391], //Right-pit
  [3.519062612861857, -51.2143286217448, -10.05733734202175], //longTowerbottom
  [7.394419029927332, -37.85214289591929, -11.998835777015215], //longTowerTop
];

var s5_point_lightColors = [1, 0.776, 0.559];

// ---------------------------
function InitializeSceneFive()
{

 
}

   
function RenderSceneFive()
{
    var modelMatrix = mat4.create()
    mat4.translate(modelMatrix, modelMatrix, [481.0,-120, 595.0])
    mat4.scale(modelMatrix,modelMatrix,[1.0,1.0,1.0]);
    //mat4.rotateY(modelMatrix, modelMatrix, [90])
    renderAssimpModel(modelMatrix,7,0,s5_point_lightPositions,s5_point_lightColors);
    // var view_matrix = GetCameraViewMatrix();
    // RenderWithInstanceShader(view_matrix, perspectiveProjectionMatrix, scene_one_tree_model_two_texture, 0);
    // ModelInstanceRenderer(scene_one_tree_two_model, scene_one_tree_model_instances);

    // RenderWithInstanceShader(view_matrix, perspectiveProjectionMatrix, scene_one_tree_model_one_texture, 0);
    // ModelInstanceRenderer(scene_one_tree_one_model, scene_one_tree_model_instances);

    DrawSkybox(SCENE_ONE);
    // //Render terrain
    // if (terrain_data[SCENE_FIVE]) {

    //     RenderTerrain(terrain_data[SCENE_FIVE], SCENE_FIVE);
    // }
}

function UpdateSceneFive()
{
   
}