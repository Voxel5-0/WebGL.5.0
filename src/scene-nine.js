var SCENE_NINE = 9;

// ---------------------------
function InitializeSceneNine()
{
    wave_initialize();

    var scene_nine_texture_path = "src\\resources\\textures\\cloth.png";
    scene_nine_texture = wave_loadTexture(scene_nine_texture_path, false);
}

function RenderSceneNine()
{
    var nine_modelMatrix = mat4.create();
    var nine_view = mat4.create();

    mat4.identity(nine_modelMatrix)
	mat4.translate(nine_modelMatrix, nine_modelMatrix, [0.0, 0.0, -10.0])

    wave_display(scene_nine_texture);


}

function UpdateSceneNine()
{
   
}

function UninitializeSceneNine()
{
    wave_uninitialize();
}
