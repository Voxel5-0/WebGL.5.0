var terrainVertexShaderObj;
var terrainFragmentShaderObj;
var terrainShaderProgramObj;
var texture_rock1 = new Array(SCENE_COUNT);
var texture_rock2 = new Array(SCENE_COUNT);
var texture_blend_map = new Array(SCENE_COUNT);
var texture_path = new Array(SCENE_COUNT);
var texture_grass = new Array(SCENE_COUNT);
var terrain_u_model_matrix;
var terrain_u_view_matrix;
var terrain_u_projection_matrix;
var terrain_u_texture_0_sampler = new Array(SCENE_COUNT);
var terrain_u_texture_1_sampler = new Array(SCENE_COUNT);
var terrain_u_blend_map_sampler = new Array(SCENE_COUNT);
var terrain_u_path_sampler = new Array(SCENE_COUNT);
var terrain_u_grass_sampler = new Array(SCENE_COUNT);
var terrain_u_fogColor;
var terrain_u_fogNear;  
var terrain_u_fogFar;

/* terrain variables */
var terrain_data = new Array(SCENE_COUNT);
var terrain_perspectiveProjectionMatrix;

function InitializeTerrainRenderer() {
  var terrainVertexShaderSource =
    "#version 300 es" +
    "\n" +
    "in vec4 v_position;" +
    "in vec2 v_texture_0_coordinate;" +

    "uniform mat4 u_projection_matrix;" +
    "uniform mat4 u_view_matrix;" +
    "uniform mat4 u_model_matrix;" +
    "out float v_fogDepth;"+
    "out vec2 fs_v_texture_0_coordinate;" +

    "void main()" +
    "{" +
    "fs_v_texture_0_coordinate = v_texture_0_coordinate;" +
    "gl_Position = u_projection_matrix * u_view_matrix * u_model_matrix * v_position;" +
    "v_fogDepth = -(u_view_matrix * u_model_matrix * v_position).z;"+
    "}";


  terrainVertexShaderObj = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(terrainVertexShaderObj, terrainVertexShaderSource);
  gl.compileShader(terrainVertexShaderObj);

  if (gl.getShaderParameter(terrainVertexShaderObj, gl.COMPILE_STATUS) == false) {
    var error = gl.getShaderInfoLog(terrainVertexShaderObj);

    if (error.length > 0) {
      alert("Error in Terrain vertex shader:");
      alert(error);
      uninitialize();
    }
  }

  var terrainFragmentShaderSource =
    "#version 300 es" +
    "\n" +
    "precision highp float;" +
    "in vec2 fs_v_texture_0_coordinate;" +
    "in float v_fogDepth;"+

    "uniform sampler2D u_texture_0_sampler;" + //texture unit 0
    "uniform sampler2D u_texture_1_sampler;" + //texture unit 1

    "uniform sampler2D u_blend_map_sampler;" + //texture unit 2
    "uniform sampler2D u_path_sampler;" + //texture unit 3
    "uniform sampler2D u_grass_sampler;" + //texture unit 4

    "uniform vec4 u_fogColor;"+
    "uniform float u_fogNear;"+  
    "uniform float u_fogFar;"+

    "out vec4 FragColor;" +

    "void main()" +
    "{" +
    "float tiling_multiplier = 40.0f;" +
    "vec4 texture_blend_map = texture(u_blend_map_sampler, fs_v_texture_0_coordinate);" +
    "float back_texture_amount = 1.0-(texture_blend_map.r + texture_blend_map.g + texture_blend_map.b);" +

    "vec4 texture_0_color = texture(u_texture_0_sampler, fs_v_texture_0_coordinate * tiling_multiplier);" +
    "vec4 texture_1_color = texture(u_texture_1_sampler, fs_v_texture_0_coordinate * tiling_multiplier);" +
    "vec4 rock_color = mix(texture_0_color, texture_1_color, 0.5f) * back_texture_amount;" +

    "vec4 path_color = texture(u_path_sampler, fs_v_texture_0_coordinate * tiling_multiplier) * texture_blend_map.b;" +
    "vec4 grass_color = texture(u_grass_sampler, fs_v_texture_0_coordinate * tiling_multiplier) * texture_blend_map.g;" +

    "FragColor = rock_color + path_color + grass_color;" +
    "float fogAmount = smoothstep(u_fogNear, u_fogFar, v_fogDepth); "+
    "FragColor = mix(FragColor, u_fogColor, fogAmount); "+
    //"FragColor = vec4(1.0f, 0.0f, 0.0f, 1.0f);" +
    "}";

  terrainFragmentShaderObj = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(terrainFragmentShaderObj, terrainFragmentShaderSource);
  gl.compileShader(terrainFragmentShaderObj);

  if (gl.getShaderParameter(terrainFragmentShaderObj, gl.COMPILE_STATUS) == false) {
    var error = gl.getShaderInfoLog(terrainFragmentShaderObj);

    if (error.length > 0) {
      alert("Error in Terrain fragment shader:");
      alert(error);
      uninitialize();
    }
  }

  terrainShaderProgramObj = gl.createProgram();
  gl.attachShader(terrainShaderProgramObj, terrainVertexShaderObj);
  gl.attachShader(terrainShaderProgramObj, terrainFragmentShaderObj);
  gl.bindAttribLocation(terrainShaderProgramObj, WebGLMacros.AMC_ATTRIBUTE_VERTEX, "v_position");
  gl.bindAttribLocation(terrainShaderProgramObj, WebGLMacros.AMC_ATTRIBUTE_TEXTURE0, "v_texture_0_coordinate");
  gl.linkProgram(terrainShaderProgramObj);

  if (!gl.getProgramParameter(terrainShaderProgramObj, gl.LINK_STATUS)) {
    var error = gl.getProgramInfoLog(terrainShaderProgramObj);

    if (error.length > 0) {
      alert(error);
      uninitialize();
    }
  }
  terrain_perspectiveProjectionMatrix = mat4.create();
}

function InitializeHeightMapTerrain(terrain_height_map_image, blend_map_imaage, rock_1_image, rock_2_image, path_image, grass_image, scene) {
  var terrain_vertices_array = [];
  var terrain_texture_coord_array = [];
  var terrain_index_array = [];

  var terrain_vao;
  var terrain_vbo_pos;
  var terrain_vbo_idx;
  var terrain_vbo_tex;
  var terrain_vao_ready = false;

  terrain_u_model_matrix = gl.getUniformLocation(terrainShaderProgramObj, "u_model_matrix");
  terrain_u_view_matrix = gl.getUniformLocation(terrainShaderProgramObj, "u_view_matrix");
  terrain_u_projection_matrix = gl.getUniformLocation(terrainShaderProgramObj, "u_projection_matrix");
  terrain_u_texture_0_sampler[scene] = gl.getUniformLocation(terrainShaderProgramObj, "u_texture_0_sampler");
  terrain_u_texture_1_sampler[scene] = gl.getUniformLocation(terrainShaderProgramObj, "u_texture_1_sampler");
  terrain_u_blend_map_sampler[scene] = gl.getUniformLocation(terrainShaderProgramObj, "u_blend_map_sampler");
  terrain_u_path_sampler[scene] = gl.getUniformLocation(terrainShaderProgramObj, "u_path_sampler");
  terrain_u_grass_sampler[scene] = gl.getUniformLocation(terrainShaderProgramObj, "u_grass_sampler");
  //Fog
  terrain_u_fogColor = gl.getUniformLocation(terrainShaderProgramObj, "u_fogColor");
  terrain_u_fogNear = gl.getUniformLocation(terrainShaderProgramObj, "u_fogNear");  
  terrain_u_fogFar = gl.getUniformLocation(terrainShaderProgramObj, "u_fogFar");

  texture_rock1[scene] = gl.createTexture();
  texture_rock1[scene].image = new Image();
  texture_rock1[scene].image.crossOrigin = "anonymous";
  texture_rock1[scene].image.src = rock_1_image; //"rock.png";
  texture_rock1[scene].image.onload = function() {
    gl.bindTexture(gl.TEXTURE_2D, texture_rock1[scene]);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture_rock1[scene].image);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.bindTexture(gl.TEXTURE_2D, null);
  }

  texture_rock2[scene] = gl.createTexture();
  texture_rock2[scene].image = new Image();
  texture_rock2[scene].image.crossOrigin = "anonymous";
  texture_rock2[scene].image.src = rock_2_image; //"rock.jpg";
  texture_rock2[scene].image.onload = function() {
    gl.bindTexture(gl.TEXTURE_2D, texture_rock2[scene]);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture_rock2[scene].image);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.bindTexture(gl.TEXTURE_2D, null);
  }

  texture_blend_map[scene] = loadBlendMap(blend_map_imaage);

  texture_path[scene] = gl.createTexture();
  texture_path[scene].image = new Image();
  texture_path[scene].crossOrigin = "anonymous";
  texture_path[scene].image.src = path_image; //"ground.jpg";
  texture_path[scene].image.onload = function() {
    gl.bindTexture(gl.TEXTURE_2D, texture_path[scene]);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture_path[scene].image);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.bindTexture(gl.TEXTURE_2D, null);
  }

  texture_grass[scene] = gl.createTexture();
  texture_grass[scene].image = new Image();
  texture_grass[scene].crossOrigin = "anonymous";
  texture_grass[scene].image.src = grass_image; //"grass.jpg";
  texture_grass[scene].image.onload = function() {
    gl.bindTexture(gl.TEXTURE_2D, texture_grass[scene]);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture_grass[scene].image);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.bindTexture(gl.TEXTURE_2D, null);
  }

  var height_map_image = new Image();
  height_map_image.crossOrigin = "anonymous";
  height_map_image.src = terrain_height_map_image;
  height_map_image.onload = function() {
    var width = height_map_image.width;
    var height = height_map_image.height;
    var channels = 4; //height_map_image.channels;

    var scale_terrain_area = 1.0;
    var scale_terrain_height = 80.0;

    var terrain_width = (width) * scale_terrain_area;
    var terrain_height = (height) * scale_terrain_area;
    var max_color_value = 256 * 256 * 256;


    var canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    var context = canvas.getContext('2d');
    context.drawImage(height_map_image, 0, 0);
    var pixels = context.getImageData(0, 0, width, height).data;
    var v_index = 0;
    var s_index = 0;

    for (var row = 0; row < height; row++) {
      for (var column = 0; column < width; column++) {
        var pixel_index = (row * width) + column;
        var byte_location = pixel_index * channels;

        var data_byte0 = pixels[byte_location];
        var data_byte1 = pixels[byte_location + 1];
        var data_byte2 = pixels[byte_location + 2];

        var point_height = (0 << 24 | data_byte2 << 16 | data_byte1 << 8 || data_byte0) / (max_color_value);
        var s = (column / width);
        var t = (row / height);

        var x = (s * terrain_width);
        var z = (t * terrain_height);
        var y = point_height * (-scale_terrain_height);

        terrain_vertices_array[v_index++] = x;
        terrain_vertices_array[v_index++] = y;
        terrain_vertices_array[v_index++] = z;

        terrain_texture_coord_array[s_index++] = s;
        terrain_texture_coord_array[s_index++] = t;
      }
    }

    var i_index = 0;
    for (var row = 0; row < height - 1; row++) {
      for (var column = 0; column < width - 1; column++) {
        var vertex_index = row * width + column;
        terrain_index_array[i_index++] = vertex_index;
        terrain_index_array[i_index++] = (vertex_index + width + 1);
        terrain_index_array[i_index++] = (vertex_index + 1);

        terrain_index_array[i_index++] = vertex_index;
        terrain_index_array[i_index++] = (vertex_index + width);
        terrain_index_array[i_index++] = (vertex_index + width + 1);
      }
    }

    var vertices_array = new Float32Array(terrain_vertices_array);;
    var texture_coord_array = new Float32Array(terrain_texture_coord_array);
    var index_array = new Uint32Array(terrain_index_array);

    terrain_vao = gl.createVertexArray();
    gl.bindVertexArray(terrain_vao);
    terrain_vbo_pos = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, terrain_vbo_pos);
    gl.bufferData(gl.ARRAY_BUFFER, vertices_array, gl.STATIC_DRAW);
    gl.vertexAttribPointer(WebGLMacros.AMC_ATTRIBUTE_VERTEX, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(WebGLMacros.AMC_ATTRIBUTE_VERTEX);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    terrain_vbo_idx = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, terrain_vbo_idx);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, index_array, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

    terrain_vbo_tex = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, terrain_vbo_tex);
    gl.bufferData(gl.ARRAY_BUFFER, texture_coord_array, gl.STATIC_DRAW);
    gl.vertexAttribPointer(WebGLMacros.AMC_ATTRIBUTE_TEXTURE0, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(WebGLMacros.AMC_ATTRIBUTE_TEXTURE0);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    gl.bindVertexArray(null);

    /* Free the dynamically allocated references of the float 32 arrays, garbage collector will clean it up */
    vertices_array = null;
    texture_coord_array = null;
    index_array = null;

    terrain_vao_ready = true;
    terrain_data[scene] = {
      vao: terrain_vao,
      vbo_pos: terrain_vbo_pos,
      vbo_idx: terrain_vbo_idx,
      vbo_tex: terrain_vbo_tex,
      index_array_length: terrain_index_array.length,
      vao_ready: terrain_vao_ready,
    }
  }
}

function RenderTerrain(terrain_data, scene , fogColor ,model_matrix_terrain_1 ) {
  if (!terrain_data.vao_ready)
    return;
  gl.useProgram(terrainShaderProgramObj);

  /* Implement camera and supply it through view matrix */
  //mat4.lookAt(view_matrix, [450.0, -50.0, 100.0], [0.0, 0.0, 1.0], [0.0, 1.0, 0.0]);
  //mat4.translate(view_matrix, view_matrix, [-450.0, -40, -300]);
  //mat4.translate(model_matrix, model_matrix, [0.0, -100.0, -10]);
  //mat4.translate(model_matrix, model_matrix, [0.0, 0.0, -0.1]);

  gl.uniformMatrix4fv(terrain_u_projection_matrix, false, terrain_perspectiveProjectionMatrix);
  gl.uniformMatrix4fv(terrain_u_view_matrix, false, GetCameraViewMatrix());
  gl.uniformMatrix4fv(terrain_u_model_matrix, false, model_matrix_terrain_1);

  gl.activeTexture(gl.TEXTURE0); //terrain color mix of 0 and 1
  gl.bindTexture(gl.TEXTURE_2D, texture_rock1[scene]);
  gl.uniform1i(terrain_u_texture_0_sampler[scene], 0);

  gl.activeTexture(gl.TEXTURE1); //terrain color mix of 0 and 1
  gl.bindTexture(gl.TEXTURE_2D, texture_rock2[scene]);
  gl.uniform1i(terrain_u_texture_1_sampler[scene], 1);

  gl.activeTexture(gl.TEXTURE2); //blendmap
  gl.bindTexture(gl.TEXTURE_2D, texture_blend_map[scene]);
  var temp_sampler = terrain_u_blend_map_sampler[scene];
  gl.uniform1i(temp_sampler, 2);

  gl.activeTexture(gl.TEXTURE3); //path
  gl.bindTexture(gl.TEXTURE_2D, texture_path[scene]);
  gl.uniform1i(terrain_u_path_sampler[scene], 3);

  gl.activeTexture(gl.TEXTURE4); //grass
  gl.bindTexture(gl.TEXTURE_2D, texture_grass[scene]);
  gl.uniform1i(terrain_u_grass_sampler[scene], 4);

  //Fog uniforms
  gl.uniform4fv(terrain_u_fogColor, fogColor);
  gl.uniform1f(terrain_u_fogNear, 0.01);
  gl.uniform1f(terrain_u_fogFar, 1000);

  gl.bindVertexArray(terrain_data.vao);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, terrain_data.vbo_idx);
  gl.drawElements(gl.TRIANGLES, terrain_data.index_array_length, gl.UNSIGNED_INT, 0);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
  gl.bindVertexArray(null);

  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, null);

  gl.activeTexture(gl.TEXTURE1);
  gl.bindTexture(gl.TEXTURE_2D, null);

  gl.activeTexture(gl.TEXTURE2);
  gl.bindTexture(gl.TEXTURE_2D, null);

  gl.activeTexture(gl.TEXTURE3);
  gl.bindTexture(gl.TEXTURE_2D, null);

  gl.activeTexture(gl.TEXTURE4);
  gl.bindTexture(gl.TEXTURE_2D, null);

  gl.useProgram(null);
}

function UninitializeTerrainData(scene){
  if(texture_rock1[scene]){
    gl.deleteTexture(texture_rock1[scene]);
    texture_rock1[scene] = null;
  }
  if(texture_rock2[scene]){
    gl.deleteTexture(texture_rock2[scene]);
    texture_rock2[scene] = null;
  }
  if(texture_blend_map[scene]){
    gl.deleteTexture(texture_blend_map[scene]);
    texture_blend_map[scene] = null;
  }
  if(texture_path[scene]){
    gl.deleteTexture(texture_path[scene]);
    texture_path[scene] = null;
  }
  if(texture_grass[scene]){
    gl.deleteTexture(texture_grass[scene]);
    texture_grass[scene] = null;
  }
  if(terrain_data[scene]){
    terrain_data[scene] = null;
  }
}

function UninitializeTerrain(terrain_data) {
  if (terrain_data.vao) {
    gl.deleteVertexArray(terrain_data.vao);
    terrain_data.vao = null;
  }

  if (terrain_data.vbo_pos) {
    gl.deleteBuffer(terrain_data.vbo_pos);
    terrain_data.vbo_pos = null;
  }

  if (terrain_data.vbo_idx) {
    gl.deleteBuffer(terrain_data.vbo_idx);
    terrain_data.vbo_idx = null;
  }

  if (terrain_data.vbo_tex) {
    gl.deleteBuffer(terrain_data.vbo_tex);
    terrain_data.vbo_tex = null;
  }

  if (terrainShaderProgramObj) {
    if (terrainFragmentShaderObj) {
      gl.detachShader(terrainShaderProgramObj, terrainFragmentShaderObj);
      gl.deleteShader(terrainFragmentShaderObj);
      terrainFragmentShaderObj = null;
    }

    if (terrainVertexShaderObj) {
      gl.detachShader(terrainShaderProgramObj, terrainVertexShaderObj);
      gl.deleteShader(terrainVertexShaderObj);
      terrainVertexShaderObj = null;
    }

    gl.deleteProgram(terrainShaderProgramObj);
    terrainShaderProgramObj = null;
  }
}

function loadBlendMap(fileName) {
  var temp_texture_blend_map;
  temp_texture_blend_map = gl.createTexture();
  temp_texture_blend_map.image = new Image();
  temp_texture_blend_map.crossOrigin = "anonymous";
  temp_texture_blend_map.image.src = fileName;

  temp_texture_blend_map.image.addEventListener('load', function() {
    gl.bindTexture(gl.TEXTURE_2D, temp_texture_blend_map);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, temp_texture_blend_map.image);
  });

  temp_texture_blend_map.image.onload = function() {
    gl.bindTexture(gl.TEXTURE_2D, temp_texture_blend_map);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, temp_texture_blend_map.image);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.bindTexture(gl.TEXTURE_2D, null);
  }
  return temp_texture_blend_map;
}


/* Light try in vertex shader */
/*//"float atten = 0.4f;" 				+
			//"vec3 light_0_color = vec3(1.0f, 1.0f, 1.0f);" +
			//"vec3 material_specular = vec3(0.000023328007955569774, 0.000005077052719570929, 0.000005077052719570929);"  +
			//"vec3 diffuse_light = vec3(0.0f, 0.0f, 0.0f);"									  							 +
			//"diffuse_light += vec3(0.02899118699133396,0.02899118699133396, 0.02899118699133396);" 						 +
			//"diffuse_light += atten * light_0_color;" 										  +
			//"vec3 specular_light = vec3(0.0f, 0.0f, 0.0f);"									  +
			//"specular_light += atten * light_0_color;"										  +


//"vec3  f_color = mix(FragColor.rgb * diffuse_light, specular_light, material_specular);"  +
//"vec4 FragColor = vec4(f_color, 1.0f);"											  +
*/
