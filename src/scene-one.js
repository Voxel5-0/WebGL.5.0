/*********************************************************************************
 * 
 * SCENE Description :
 * //x will be ending time for scene zero
 * Time :	0.0 to 0.5 - Title Texture  
 * Time : 0.5 to 0.25 - Open terrain – trees – God rays and camera with music
 * Astromedicomps Voxel Group - Title
*/

/*----------------------------------- Scene one global variables -----------------------------------*/

var SCENE_ONE = 1;
var scene_one_title_texture;
var lastExecutionTime = 0;

var scene_one_showTitle = true;

/*----------------------------------- Scene one Initialise -----------------------------------*/
function InitializeSceneOne()
{
    var scene_one_title_texture_path = "src\\resources\\textures\\Titles\\MainTitle.png";
    scene_one_title_texture = loadTexture(scene_one_title_texture_path, false) 
}

/*----------------------------------- Scene one Render -----------------------------------*/

function RenderSceneOne()
{
  if(scene_one_showTitle){
    let currentTime = performance.now();
    let modelMatrix = mat4.create();
    let identityMatrix = mat4.create();
    let x = (Math.random() * 2 - 1) / 300;
    let y = (Math.random() * 2 - 1) / 400;
    if (currentTime - lastExecutionTime >= 150) { // 100 milliseconds = 0.1 seconds
        mat4.translate(modelMatrix, modelMatrix, [x, y, 0]);

        lastExecutionTime = currentTime; // Update the last execution time
    }
    RenderWithGrayScaleTextureShaderMVP(modelMatrix,identityMatrix,identityMatrix,scene_one_title_texture, 0);
    // RenderWithVignnetTextureShaderMVP(modelMatrix,identityMatrix,identityMatrix,scene_one_title_texture, 0);
  }else{

  }
   
}

/*----------------------------------- Scene one Update -----------------------------------*/
function UpdateSceneOne()
{
   
}

/*----------------------------------- Scene one Uninitialize -----------------------------------*/
function UninitializeSceneOne()
{
    
}
