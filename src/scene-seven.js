
/*********************************************************************************
 * 
 * SCENE Description :
 * 
 * Once the song ends intro scene will start again with end credit music(100 years camera)
 *   
 * Effects : Same as Into - Scene One
 * 
*/

var SCENE_SEVEN = 7;

var texture_rainbow;

// ---------------------------
function InitializeSceneSeven()
{
    //const skyboxTexturesForScene7 = [ 
    //    "src/resources/textures/skybox/Scene7/nx.png", 
    //    "src/resources/textures/skybox/Scene7/ny.png", 
    //    "src/resources/textures/skybox/Scene7/nz.png",
    //    "src/resources/textures/skybox/Scene7/px.png",
    //    "src/resources/textures/skybox/Scene7/py.png", 
    //    "src/resources/textures/skybox/Scene7/pz.png"
    //];

    //LoadSkyboxTextures(skyboxTexturesForScene7, 1);

    InitializeTextureShader();

    scene7_loadGLTexture();
}

function RenderSceneSeven()
{

    


   //Uniforms for point lights
  var point_lightPositions = [13.21327183125484, -67.44632010003868, -4.840837788952009];

  var point_lightColors = [1, 0.776, 0.559];

  //gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  
  // terrain
  var modelMatrix = mat4.create();
  //mat4.translate(modelMatrix, modelMatrix, [30.0, -30.0, -1.0]);
  //mat4.scale(modelMatrix,modelMatrix,[10.0,10.0,10.0]);
  //mat4.translate(modelMatrix, modelMatrix, [2564.0999999998876, -1490.499999999971, 22240.999999999782]);
  //mat4.translate(modelMatrix, modelMatrix, [2564.0999999998876 + test_translate_X, 6320.499999999971 + test_translate_Y, 22240.999999999782 + test_translate_Z]);
  //mat4.rotateX(modelMatrix, modelMatrix, degToRad(-21.0));
  //mat4.rotateY(modelMatrix, modelMatrix, degToRad(-109.0));
  mat4.translate(modelMatrix, modelMatrix, [2564.0999999998876, -1490.499999999971, 22240.999999999782]);
  mat4.scale(modelMatrix, modelMatrix,[10000.0, 2500.0, 10000.0]);
  renderAssimpModel(modelMatrix,10,0,point_lightPositions,point_lightColors);

  // girl pose 1
  modelMatrix = mat4.create();
  mat4.translate(modelMatrix, modelMatrix, [30.0, -30.0, 1910]);
  mat4.scale(modelMatrix,modelMatrix,[25.0, 25.0, 25.0]);
  mat4.rotateY(modelMatrix, modelMatrix, degToRad(240.0));
  renderAssimpModel(modelMatrix,4,0,point_lightPositions,point_lightColors);

  // bushes
  modelMatrix = mat4.create();
  mat4.translate(modelMatrix, modelMatrix, [-190, -30.0, 1910]);
  mat4.scale(modelMatrix,modelMatrix,[100.0, 100.0, 100.0]);
  renderAssimpModel(modelMatrix,10,0,point_lightPositions,point_lightColors);

  modelMatrix = mat4.create();
  mat4.translate(modelMatrix, modelMatrix, [-190, -30.0, 1530]);
  mat4.scale(modelMatrix,modelMatrix,[100.0, 100.0, 100.0]);
  renderAssimpModel(modelMatrix,10,0,point_lightPositions,point_lightColors);

  modelMatrix = mat4.create();
  mat4.translate(modelMatrix, modelMatrix, [170, -30.0, 1740]);
  mat4.scale(modelMatrix,modelMatrix,[80.0, 80.0, 80.0]);
  renderAssimpModel(modelMatrix,10,0,point_lightPositions,point_lightColors);

  modelMatrix = mat4.create();
  mat4.translate(modelMatrix, modelMatrix, [170, -30.0, 2030]);
  mat4.scale(modelMatrix,modelMatrix,[80.0, 80.0, 80.0]);
  renderAssimpModel(modelMatrix,10,0,point_lightPositions,point_lightColors);

  modelMatrix = mat4.create();
  mat4.translate(modelMatrix, modelMatrix, [170, -30.0, 2290]);
  mat4.scale(modelMatrix,modelMatrix,[80.0, 80.0, 80.0]);
  renderAssimpModel(modelMatrix,10,0,point_lightPositions,point_lightColors);

  modelMatrix = mat4.create();
  mat4.translate(modelMatrix, modelMatrix, [-190, -30.0, 2170]);
  mat4.scale(modelMatrix,modelMatrix,[100.0, 100.0, 100.0]);
  renderAssimpModel(modelMatrix,10,0,point_lightPositions,point_lightColors);


  // flowers
  modelMatrix = mat4.create();
  mat4.translate(modelMatrix, modelMatrix, [180, -28.0, 1860]);
  mat4.rotateX(modelMatrix, modelMatrix, degToRad(-90.0));
  mat4.scale(modelMatrix,modelMatrix,[2.0, 2.0, 2.0]);
  renderAssimpModel(modelMatrix,11,0,point_lightPositions,point_lightColors);

  modelMatrix = mat4.create();
  mat4.translate(modelMatrix, modelMatrix, [-770, -28.0, 1860]);
  mat4.rotateX(modelMatrix, modelMatrix, degToRad(-90.0));
  mat4.scale(modelMatrix,modelMatrix,[3.0, 3.0, 3.0]);
  renderAssimpModel(modelMatrix,11,0,point_lightPositions,point_lightColors);

  modelMatrix = mat4.create();
  mat4.translate(modelMatrix, modelMatrix, [-470, -28.0, 1530]);
  mat4.rotateX(modelMatrix, modelMatrix, degToRad(-90.0));
  mat4.scale(modelMatrix,modelMatrix,[4.0, 4.0, 4.0]);
  renderAssimpModel(modelMatrix,11,0,point_lightPositions,point_lightColors);

  modelMatrix = mat4.create();
  mat4.translate(modelMatrix, modelMatrix, [-470, -28.0, 970]);
  mat4.rotateX(modelMatrix, modelMatrix, degToRad(-90.0));
  mat4.scale(modelMatrix,modelMatrix,[4.0, 4.0, 4.0]);
  renderAssimpModel(modelMatrix,11,0,point_lightPositions,point_lightColors);

  modelMatrix = mat4.create();
  mat4.translate(modelMatrix, modelMatrix, [-1600, -28.0, 1750]);
  mat4.rotateX(modelMatrix, modelMatrix, degToRad(-90.0));
  mat4.scale(modelMatrix,modelMatrix,[3.0, 3.0, 3.0]);
  renderAssimpModel(modelMatrix,11,0,point_lightPositions,point_lightColors);


  // rainbow texture
  gl.enable(gl.BLEND);
  gl.blendEquation(gl.FUNC_ADD);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
  modelMatrix = mat4.create();
  mat4.translate(modelMatrix,modelMatrix,[0.0, 0.0, -500.0]);
  RenderWithTextureShader(texture_rainbow, 0);
  gl.disable(gl.BLEND);


  //DrawSkybox(SCENE_SEVEN);  
  DrawSkybox(SCENE_ONE);  

}

function UpdateSceneSeven()
{
   
}

function UninitializeSceneSeven()
{
    UninitializeTextureShader();
}


function scene7_loadGLTexture() {
    texture_rainbow = gl.createTexture();
    if (!texture_rainbow) {
        console.log("createTexture() : Failed !!!\n");
        alert(log);
    }

    texture_rainbow.image = new Image();
    if (!texture_rainbow.image) {
        console.log("Failed to create Image object !!!\n");
        alert(log);
    }

    texture_rainbow.image.onload = function () {
        console.log('Texture loaded successfully.')
        console.log(texture_rainbow.image)

        gl.bindTexture(gl.TEXTURE_2D, texture_rainbow);
        
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture_rainbow.image);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        
        gl.bindTexture(gl.TEXTURE_2D, null);
    }
    texture_rainbow.image.src = "src\\resources\\textures\\rainbow.png";
}

