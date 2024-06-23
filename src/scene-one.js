var SCENE_ONE = 1;

var scene_one_tree_one_model;
var scene_one_tree_two_model;

var scene_one_tree_model_one_texture;
var scene_one_tree_model_two_texture;

var scene_one_tree_model_matrices_vbo;
var scene_one_tree_two_model_matrices_vbo;

var scene_one_tree_model_instances = 1;

var scene_one_tree_x;
var scene_one_tree_y;
var scene_one_tree_z;

function InitializeSceneOne() {
  var scene_one_height_map_image = "src/resources/textures/terrain.png";
  var scene_one_blend_map = "src/resources/textures/BlendMap.png";
  var scene_one_rock_1_image = "src/resources/textures/rock.png";
  var scene_one_rock_2_image = "src/resources/textures/snow.jpg";
  var scene_one_path_image = "src/resources/textures/ground.jpg";
  var scene_one_snow_image = "src/resources/textures/snow.jpg";

  var scene_one_tree_one_model_obj_file = "src\\resources\\models\\intro\\Palace_withColors.obj";
  //var scene_one_tree_two_model_obj_file = "src\\resources\\intro\\scene_one_tree_two_model.obj";

  var scene_one_tree_one_model_texture_image = "src\\resources\\models\\intro\\TCom_Metal_BrassPolished_header.jpg";
  //var scene_one_tree_two_model_texture_image = "src\\resources\\models\\scene_one_tree_two_texture.png";

  var skyboxTexturesForScene1 = [
                "src/resources/textures/skybox/Scene1/px.png",
                "src/resources/textures/skybox/Scene1/nx.png",
                "src/resources/textures/skybox/Scene1/py.png",
                "src/resources/textures/skybox/Scene1/ny.png",
                "src/resources/textures/skybox/Scene1/pz.png",
                "src/resources/textures/skybox/Scene1/nz.png"
                ];



  initAssimpModelShader();  

  //LoadSkyboxTextures(skyboxTexturesForScene1, 1);
  pTrail_initialize();

  // scene_one_tree_model_one_texture = gl.createTexture();
  // scene_one_tree_model_one_texture.image = new Image();
  // scene_one_tree_model_one_texture.image.src = scene_one_tree_one_model_texture_image;
  // scene_one_tree_model_one_texture.image.onload = function()
  // {
  //   gl.bindTexture(gl.TEXTURE_2D, scene_one_tree_model_one_texture);
  //   gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
  //   gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, scene_one_tree_model_one_texture.image);
  //   gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  //   gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  //   gl.bindTexture(gl.TEXTURE_2D, null);
  // }

  // scene_one_tree_model_two_texture = gl.createTexture();
  // scene_one_tree_model_two_texture.image = new Image();
  // scene_one_tree_model_two_texture.image.src = scene_one_tree_two_model_texture_image;
  // scene_one_tree_model_two_texture.image.onload = function()
  // {
  //   gl.bindTexture(gl.TEXTURE_2D, scene_one_tree_model_two_texture);
  //   gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
  //   gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, scene_one_tree_model_two_texture.image);
  //   gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  //   gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  //   gl.bindTexture(gl.TEXTURE_2D, null);
  // }

  // InitializeHeightMapTerrain(scene_one_height_map_image, scene_one_blend_map, scene_one_rock_1_image,
  // scene_one_rock_2_image, scene_one_path_image, scene_one_snow_image, SCENE_ONE);
  // InitializeHeightMapTerrain(scene_one_height_map_image);
  // //tree 1 position : 554.6145372585742,-45,373.97876705809426
  // //TODO : need to arrange position for each tree instance 
  // scene_one_tree_x = [554.6145372585742];
  // scene_one_tree_y = [-45.0];
  // scene_one_tree_z = [373.97876705809426];
  // scene_one_tree_one_model = InitializeModelRenderer(scene_one_tree_one_model_obj_file);
  // InitializeInstanceDataForSceneOneTreeModel(scene_one_tree_one_model);

  //Camera position: 502.6543722806024,-45,351.7588870153239

  //TODO : need to arrange position for each tree instance 
  //scene_one_tree_x = [400.6145372585742, 0, 1, 2];
  //scene_one_tree_y = [-45.0, 1, 0, 2];
  //scene_one_tree_z = [373.97876705809426, 1, 1, 3];
  //scene_one_tree_two_model = InitializeModelRenderer(scene_one_tree_two_model_obj_file);
  //InitializeInstanceDataForSceneOneTreeModel(scene_one_tree_two_model);
}

// function InitializeInstanceDataForSceneOneTreeModel(model_data)
// {
//   /* --------------------- Initialize Instance Data for Tree ---------------------*/
//     var model_matrices = [];
//     var size_of_float = 4;
//     var num_floats_in_matrix = 16;
//     var bytes_per_matrix = num_floats_in_matrix * size_of_float;
//     var matrix_data = new Float32Array(scene_one_tree_model_instances * num_floats_in_matrix);

//     for (var index = 0; index < scene_one_tree_model_instances; index++)
//     {
//       const byte_offset_to_matrix = index * bytes_per_matrix;
//       model_matrices.push(new Float32Array(matrix_data.buffer, byte_offset_to_matrix, num_floats_in_matrix));
//       mat4.identity(model_matrices[index]);
//       mat4.translate(model_matrices[index], model_matrices[index], [scene_one_tree_x[index], scene_one_tree_y[index], 95.0*(index+1)*0.2+scene_one_tree_z[index]]); //510.0+Math.sin(index%2==0? index : -index)
//       //mat4.scale(model_matrices[index], model_matrices[index], [1.2, 1.5, 1.0]);
//     }

//     gl.bindVertexArray(model_data.vao_model);

//     scene_one_tree_model_matrices_vbo = gl.createBuffer();
//     gl.bindBuffer(gl.ARRAY_BUFFER, scene_one_tree_model_matrices_vbo);
//     gl.bufferData(gl.ARRAY_BUFFER, matrix_data, gl.STATIC_DRAW);

//     gl.vertexAttribPointer(WebGLMacros.AMC_ATTRIBUTE_INSTANCE_VEC0, 4, gl.FLOAT, false, bytes_per_matrix, 0 * 16); //vec4 - 0th in 4 vec4s
//     gl.enableVertexAttribArray(WebGLMacros.AMC_ATTRIBUTE_INSTANCE_VEC0);

//     gl.vertexAttribPointer(WebGLMacros.AMC_ATTRIBUTE_INSTANCE_VEC1, 4, gl.FLOAT, false, bytes_per_matrix, 1* 16); //stride 1*vec4 - 1st in 4 vec4s
//     gl.enableVertexAttribArray(WebGLMacros.AMC_ATTRIBUTE_INSTANCE_VEC1);

//     gl.vertexAttribPointer(WebGLMacros.AMC_ATTRIBUTE_INSTANCE_VEC2, 4, gl.FLOAT, false, bytes_per_matrix, 2* 16); //stride 2*vec4 - 2nd in 4 vec4s
//     gl.enableVertexAttribArray(WebGLMacros.AMC_ATTRIBUTE_INSTANCE_VEC2);

//     gl.vertexAttribPointer(WebGLMacros.AMC_ATTRIBUTE_INSTANCE_VEC3, 4, gl.FLOAT, false, bytes_per_matrix, 3* 16); //stride 3*vec4 - 3rd in 4 vec4s
//     gl.enableVertexAttribArray(WebGLMacros.AMC_ATTRIBUTE_INSTANCE_VEC3);

//     gl.vertexAttribDivisor(WebGLMacros.AMC_ATTRIBUTE_INSTANCE_VEC0, 1);
//     gl.vertexAttribDivisor(WebGLMacros.AMC_ATTRIBUTE_INSTANCE_VEC1, 1);
//     gl.vertexAttribDivisor(WebGLMacros.AMC_ATTRIBUTE_INSTANCE_VEC2, 1);
//     gl.vertexAttribDivisor(WebGLMacros.AMC_ATTRIBUTE_INSTANCE_VEC3, 1);

//     gl.bindBuffer(gl.ARRAY_BUFFER, null);

//     gl.bindVertexArray(null);

//     /* if any issues comes for tree see if this line needs to be uncommented */
//     gl.deleteBuffer(scene_one_tree_model_matrices_vbo);

//     /* --------------------- Initialize Instance Data for Tree ---------------------*/
// }

function RenderSceneOne() {
  /*---------------- Render Model Tree With Instance Shader ----------------*/
  var view_matrix = GetCameraViewMatrix();
  //RenderWithInstanceShader(view_matrix, perspectiveProjectionMatrix, scene_one_tree_model_two_texture, 0);
  //ModelInstanceRenderer(scene_one_tree_two_model, scene_one_tree_model_instances);

  // RenderWithInstanceShader(view_matrix, perspectiveProjectionMatrix, scene_one_tree_model_one_texture, 0);
  // ModelInstanceRenderer(scene_one_tree_one_model, scene_one_tree_model_instances);

  //render disney castle model
	var modelMatrix = mat4.create()
	mat4.rotate(modelMatrix, modelMatrix, 0, [0.0, 0.0, 0.0])
	mat4.translate(modelMatrix, modelMatrix, [0.0, 0.0, -10.0])
  renderAssimpModel(modelMatrix);

  gl.useProgram(null);
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, null);
  /*---------------- Render Model Tree With Instance Shader ----------------*/

  /* Render Terrain */
  // if (terrain_data[SCENE_ONE]) {
  //   RenderTerrain(terrain_data[SCENE_ONE], SCENE_ONE);
  // }

  //DrawSkybox(SCENE_ONE);
  if(bDraw)
  {
    pTrail_display(modelMatrix, perspectiveProjectionMatrix);
  }
}

function UpdateSceneOne() {
    if(bDraw)
    {
      pTrail_update();
    }
}

function UninitializeSceneOne() {
 
  if (scene_one_tree_model_one_texture)
  {
    gl.deleteTexture(scene_one_tree_model_one_texture);
  }

  if (scene_one_tree_model_two_texture)
  {
    gl.deleteTexture(scene_one_tree_model_two_texture);
  }

  pTrail_uninitialize();
  UninitializeTerrainData(SCENE_ONE);
  UninitializeModelRenderer(scene_one_tree_one_model);
  UninitializeModelRenderer(scene_one_tree_two_model);
}
