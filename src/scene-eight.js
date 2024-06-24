/*********************************************************************************
 * 
 * SCENE Description :
 * 
 * End Credits - Texture with some effects - blending 
 * 
*/

var SCENE_EIGHT = 8;

// ---------------------------
function InitializeSceneEight()
{
  
}

function RenderSceneEight()
{
    
    var modelMatrix = mat4.create();
    DrawSkybox(SCENE_ONE);
    if (terrain_data[SCENE_FOUR]) {
        RenderTerrain(terrain_data[SCENE_FOUR], SCENE_FOUR);
    }

    mat4.translate(modelMatrix, modelMatrix, [0.0 + 2.2 + 639.100000000007 + test_translate_X , 0.0 + test_translate_Y , 0.0 - 5.5 + 157.29999999999959 + test_translate_Z])
    mat4.scale(modelMatrix,modelMatrix,[ 5.0 + 106 + test_scale_X, 5.0 + 106 +test_scale_X , 5.0+ 106 + test_scale_X ]);
    //mat4.rotateY(modelMatrix, modelMatrix, [test_scale_X])
    renderAssimpModel(modelMatrix,9,0,[],[]);

    // mat4.translate(modelMatrix, modelMatrix, [0.0 + 2.2 + test_translate_X , 0.0 + test_translate_Y , 0.0 - 5.5 + test_translate_Z])
    // mat4.scale(modelMatrix,modelMatrix,[ 5.0 , 5.0  , 5.0 ]);
    // mat4.rotateY(modelMatrix, modelMatrix, [90 + (4.3 + 6.5 + 6.5 + 25.2 + 5.4 + test_scale_X)])
    // renderAssimpModel(modelMatrix,13,0,[],[]);
}

function UpdateSceneEight()
{
   
}

function UninitializeSceneEight()
{
    
}
