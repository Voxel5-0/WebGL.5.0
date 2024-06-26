/*********************************************************************************
 * 
 * SCENE Description :
 * Astromedicomps Voxel Group - Title
*/

var SCENE_TWO = 2;
var scene_two_title_texture;
var lastExecutionTime = 0;

/*----------------------------------- Scene two Initialise -----------------------------------*/
function InitializeSceneTwo()
{
    var scene_two_title_texture_path = "src\\resources\\textures\\Titles\\MainTitle.png";
    scene_two_title_texture = loadTexture(scene_two_title_texture_path, false) 
}

/*----------------------------------- Scene two Render -----------------------------------*/

function RenderSceneTwo()
{
    let currentTime = performance.now();
    let modelMatrix = mat4.create();
    let identityMatrix = mat4.create();
    let x = (Math.random() * 2 - 1) / 300;
    let y = (Math.random() * 2 - 1) / 400;
    if (currentTime - lastExecutionTime >= 150) { // 100 milliseconds = 0.1 seconds
        mat4.translate(modelMatrix, modelMatrix, [x, y, 0]);

        lastExecutionTime = currentTime; // Update the last execution time
    }

    RenderWithGrayScaleTextureShaderMVP(modelMatrix,identityMatrix,identityMatrix,scene_two_title_texture, 0);
    // RenderWithVignnetTextureShaderMVP(modelMatrix,identityMatrix,identityMatrix,scene_two_title_texture, 0);
}

/*----------------------------------- Scene two Update -----------------------------------*/
function UpdateSceneTwo()
{
   
}

/*----------------------------------- Scene two Uninitialize -----------------------------------*/
function UninitializeSceneTwo()
{
    
}
