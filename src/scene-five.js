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

var scene_one_tree_model_one_texture;
var scene_one_tree_model_two_texture;
var scene_one_tree_model_instances = 10;

// ---------------------------
function InitializeSceneFive()
{

  var scene_four_height_map_image = "src/resources/textures/terrain.png";
  var scene_four_blend_map = "src/resources/textures/BlendMap.png";
  var scene_four_rock_1_image = "src/resources/textures/rock.png";
  var scene_four_rock_2_image = "src/resources/textures/soil.jpg";
  var scene_four_path_image = "src/resources/textures/ground.jpg";
  var scene_four_snow_image = "src/resources/textures/soil.jpg";
  
  InitializeTerrainRenderer();
  InitializeHeightMapTerrain(scene_four_height_map_image,scene_four_blend_map,scene_four_rock_1_image,scene_four_rock_2_image,scene_four_path_image,scene_four_snow_image,5);
 
    var scene_one_tree_one_model_obj_file = "src\\resources\\models\\scene_one_tree_one_model.obj";
    var scene_one_tree_two_model_obj_file = "src\\resources\\models\\scene_one_tree_two_model.obj";
  
    var scene_one_tree_one_model_texture_image = "src\\resources\\models\\scene_one_tree_one_texture.png";
    var scene_one_tree_two_model_texture_image = "src\\resources\\models\\scene_one_tree_two_texture.png";
  
    scene_one_tree_model_one_texture = gl.createTexture();
    scene_one_tree_model_one_texture.image = new Image();
    scene_one_tree_model_one_texture.image.src = scene_one_tree_one_model_texture_image;
    scene_one_tree_model_one_texture.image.onload = function()
    {
      gl.bindTexture(gl.TEXTURE_2D, scene_one_tree_model_one_texture);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, scene_one_tree_model_one_texture.image);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.bindTexture(gl.TEXTURE_2D, null);
    }

    scene_one_tree_model_two_texture = gl.createTexture();
    scene_one_tree_model_two_texture.image = new Image();
    scene_one_tree_model_two_texture.image.src = scene_one_tree_two_model_texture_image;
    scene_one_tree_model_two_texture.image.onload = function()
    {
      gl.bindTexture(gl.TEXTURE_2D, scene_one_tree_model_two_texture);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, scene_one_tree_model_two_texture.image);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.bindTexture(gl.TEXTURE_2D, null);
    }

    //481.0,-120, 595.0

    //	InitializeHeightMapTerrain(scene_one_height_map_image);
    scene_one_tree_x = [481.0, 480, 480, 450, 548, 460, 470.25, 420, 537, 430, 488, 480, 480, 450, 548, 460, 470.25, 420, 537, 430, 490.65]
    scene_one_tree_y = [-50, -50, -55, -60, -60, -60, -60, -70, -70, -70, -62, -65, -65, -65, -65, -70, -65, -70, -70, -70, -65];
    scene_one_tree_z = [595.0, 588, 10, 10, 10, 10, 10, 13, 20, 27, 33, 40, 50, 61, 71, 80, 91, 101, 105, 120, -77];
    scene_one_tree_one_model = InitializeModelRenderer(scene_one_tree_one_model_obj_file);
    InitializeInstanceDataForSceneOneTreeModel(scene_one_tree_one_model);

    //Camera position: 502.6543722806024,-45,351.7588870153239

    scene_one_tree_x = [500, 480, 480, 450 - 10, 548 + 10, 460 - 10, 470.25 - 10, 420 - 10, 537 + 10, 430 - 10, 500, 480, 480, 450 - 10, 548 + 10, 460 - 10, 470.25 - 10, 420 - 10, 537 + 10, 430 - 10, 502.65]
    scene_one_tree_y = [-55, -55, -55, -60, -60, -60, -60, -70, -70, -70, -55, -55, -55, -60, -60, -60, -60, -70, -70, -70, -70];
    scene_one_tree_z = [500, 593, 10, 10, 10, 10, 10, 13, 20, 27, 33, 40, 50, 61, 71, 80, 91, 101, 105, 120, 105.75];
    scene_one_tree_two_model = InitializeModelRenderer(scene_one_tree_two_model_obj_file);
    InitializeInstanceDataForSceneOneTreeModel(scene_one_tree_two_model);
}

function RenderSceneFive()
{
    var view_matrix = GetCameraViewMatrix();
    RenderWithInstanceShader(view_matrix, perspectiveProjectionMatrix, scene_one_tree_model_two_texture, 0);
    ModelInstanceRenderer(scene_one_tree_two_model, scene_one_tree_model_instances);

    RenderWithInstanceShader(view_matrix, perspectiveProjectionMatrix, scene_one_tree_model_one_texture, 0);
    ModelInstanceRenderer(scene_one_tree_one_model, scene_one_tree_model_instances);

    DrawSkybox(SCENE_ONE);
    //Render terrain
    if (terrain_data[SCENE_FIVE]) {

        RenderTerrain(terrain_data[SCENE_FIVE], SCENE_FIVE);
    }
}

function UpdateSceneFive()
{
   
}

function UninitializeSceneFive()
{
    
}

function InitializeInstanceDataForSceneOneTreeModel(model_data)
{
  /* --------------------- Initialize Instance Data for Tree ---------------------*/
    var model_matrices = [];
    var size_of_float = 4;
    var num_floats_in_matrix = 16;
    var bytes_per_matrix = num_floats_in_matrix * size_of_float;
    var matrix_data = new Float32Array(scene_one_tree_model_instances * num_floats_in_matrix);

    for (var index = 0; index < scene_one_tree_model_instances; index++)
    {
      const byte_offset_to_matrix = index * bytes_per_matrix;
      model_matrices.push(new Float32Array(matrix_data.buffer, byte_offset_to_matrix, num_floats_in_matrix));
      mat4.identity(model_matrices[index]);
      mat4.translate(model_matrices[index], model_matrices[index], [scene_one_tree_x[index], scene_one_tree_y[index], 95.0*(index+1)*0.2+scene_one_tree_z[index]]); //510.0+Math.sin(index%2==0? index : -index)
      //mat4.scale(model_matrices[index], model_matrices[index], [1.2, 1.5, 1.0]);
    }

    gl.bindVertexArray(model_data.vao_model);

    scene_one_tree_model_matrices_vbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, scene_one_tree_model_matrices_vbo);
    gl.bufferData(gl.ARRAY_BUFFER, matrix_data, gl.STATIC_DRAW);

    gl.vertexAttribPointer(WebGLMacros.AMC_ATTRIBUTE_INSTANCE_VEC0, 4, gl.FLOAT, false, bytes_per_matrix, 0 * 16); //vec4 - 0th in 4 vec4s
    gl.enableVertexAttribArray(WebGLMacros.AMC_ATTRIBUTE_INSTANCE_VEC0);

    gl.vertexAttribPointer(WebGLMacros.AMC_ATTRIBUTE_INSTANCE_VEC1, 4, gl.FLOAT, false, bytes_per_matrix, 1* 16); //stride 1*vec4 - 1st in 4 vec4s
    gl.enableVertexAttribArray(WebGLMacros.AMC_ATTRIBUTE_INSTANCE_VEC1);

    gl.vertexAttribPointer(WebGLMacros.AMC_ATTRIBUTE_INSTANCE_VEC2, 4, gl.FLOAT, false, bytes_per_matrix, 2* 16); //stride 2*vec4 - 2nd in 4 vec4s
    gl.enableVertexAttribArray(WebGLMacros.AMC_ATTRIBUTE_INSTANCE_VEC2);

    gl.vertexAttribPointer(WebGLMacros.AMC_ATTRIBUTE_INSTANCE_VEC3, 4, gl.FLOAT, false, bytes_per_matrix, 3* 16); //stride 3*vec4 - 3rd in 4 vec4s
    gl.enableVertexAttribArray(WebGLMacros.AMC_ATTRIBUTE_INSTANCE_VEC3);

    gl.vertexAttribDivisor(WebGLMacros.AMC_ATTRIBUTE_INSTANCE_VEC0, 1);
    gl.vertexAttribDivisor(WebGLMacros.AMC_ATTRIBUTE_INSTANCE_VEC1, 1);
    gl.vertexAttribDivisor(WebGLMacros.AMC_ATTRIBUTE_INSTANCE_VEC2, 1);
    gl.vertexAttribDivisor(WebGLMacros.AMC_ATTRIBUTE_INSTANCE_VEC3, 1);

    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    gl.bindVertexArray(null);

    /* if any issues comes for tree see if this line needs to be uncommented */
    gl.deleteBuffer(scene_one_tree_model_matrices_vbo);

    /* --------------------- Initialize Instance Data for Tree ---------------------*/
}