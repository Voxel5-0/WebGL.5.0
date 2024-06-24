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
    RenderWithGrayScaleTextureShader(scene_two_title_texture, 0);
}

function UpdateSceneTwo()
{
   
}

function UninitializeSceneTwo()
{
    
}
