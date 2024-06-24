/*********************************************************************************
 * 
 * SCENE Description :
 * Astromedicomps Voxel Group - 
*/

var SCENE_TWO = 2;
var scene_two_title_texture;

// ---------------------------
function InitializeSceneTwo()
{
    var scene_two_title_texture_path = "src\\resources\\textures\\Titles\\MainTitle.png";
    scene_two_title_texture = loadTexture(scene_two_title_texture_path, false) 
}

function RenderSceneTwo()
{
    let x = (Math.random() *2 -1)/300;
	let y = (Math.random() *2 -1)/400;
    let modelMatrix=mat4.create();
    let identityMatrix=mat4.create();
    mat4.translate(modelMatrix,modelMatrix,[x,y,0]);
    RenderWithGrayScaleTextureShaderMVP(modelMatrix,identityMatrix,identityMatrix,scene_two_title_texture, 0);
    // RenderWithVignnetTextureShaderMVP(modelMatrix,identityMatrix,identityMatrix,scene_two_title_texture, 0);
}

function UpdateSceneTwo()
{
   
}

function UninitializeSceneTwo()
{
    
}
