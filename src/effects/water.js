// ********************************************************
// VARIABLE DECLARATIONS
// ********************************************************
// ---------------------------

// WATER

// Constants
var WATER_HEIGHT = -60.0+49.500000000000036;               // Y value for the water_vertices
const WATER_MESH_SIZE = 1024;           // Should be same as terrain size value
const WATER_TEXTURE_TILING = 4;
const WATER_DISTORTION_STRENGTH = 0.02;
const WATER_MOVE_SPEED = 0.00001;
var waterHeight		  = 0.0;
var water_plane_reflection     = new Float32Array([0.0, 1.0, 0.0, WATER_HEIGHT]);

// Mesh data
var water_vertices;
var water_texcoord;
var water_normal;
var water_indices;

// Shader objects
var water_vertex_shader_object;
var water_fragment_shader_object;
var water_shader_program_object;

// Uniforms
var water_view_matrix_uniform;
var water_model_matrix_uniform;
var water_projection_matrix_uniform;
var water_reflect_texture_sampler_uniform;
var water_refract_texture_sampler_uniform;
var water_dudv_texture_sampler_uniform;
var water_normal_texture_sampler_uniform;
var water_refract_depth_texture_sampler_uniform;
var water_camera_position_sampler_uniform;
var water_move_factor_uniform;
var water_texture_tiling_uniform;
var water_distortion_strength_uniform;
var lightColor_uniform;
var lightPosition_uniform;
var water_texture_uniform;
var water_plane_uniform;

// Vertex arrays and buffers
var vao_water;
var vbo_water_position;
var vbo_water_normals;
var vbo_water_texcoord;
var vbo_water_indices;

// Textures
var water_dudv_texture;
var water_normal_texture;

var water_move_factor = 0;

// ---------------------------

// Animation

var last_update = 0.0;
var last_fps_check = 0.0;
var frames = 0;

var delta_time = 0.0;
var fps = 0.0;

var move = 0;


// ********************************************************
// WATER
// ********************************************************
function initializeWater()
{
    // 1. Initialize shaders
    // 2. Get uniform locations
    // 3. Generate mesh and initialize VAO and VBOs
    // 4. Load textures
    // 5. Create FBOs for reflection and refraction
    
    initializeWaterShaders();
    getWaterUniformLocations();
    initializeWaterVAOAndVBO();
    loadWaterTextures();

    reflection_fbo = GenerateFramebuffer(fbo_width, fbo_height);
	refraction_fbo = GenerateFramebuffer(fbo_width, fbo_height);
}


function initializeWaterShaders()
{
    // Vertex shader
    var water_vertex_shader_source_code =
    `#version 300 es

    in vec4 vPosition;
    in vec2 vTexcoord;

    uniform mat4 u_modelMatrix;
    uniform mat4 u_viewMatrix;
    uniform mat4 u_projectionMatrix;
    uniform float u_textureTiling;
    uniform vec3 u_cameraPosition;
    uniform vec4 u_plane;

    out vec2 out_texcoord;
    out vec3 out_toCamera;
    out vec4 out_clipSpace;

    const float tiling = 8.0;
    float clip_distance;

    void main(void)
    {

        clip_distance = dot(u_modelMatrix * vPosition, u_plane);
        vec4 worldPosition = u_modelMatrix * vPosition;
        out_clipSpace   = u_projectionMatrix * u_viewMatrix * worldPosition;
        gl_Position = out_clipSpace;
        out_texcoord = vTexcoord * tiling;
        out_toCamera = u_cameraPosition - worldPosition.xyz;
    }
    `;

    water_vertex_shader_object = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(water_vertex_shader_object, water_vertex_shader_source_code);
    gl.compileShader(water_vertex_shader_object);
    if (gl.getShaderParameter(water_vertex_shader_object, gl.COMPILE_STATUS) == false)
    {
        var error = gl.getShaderInfoLog(water_vertex_shader_object);
        if (error.length > 0)
        {
            alert(error);
            uninitialize();
        }
    }
    
    // Fragment shader
  var water_fragment_shader_source_code =
    `#version 300 es
    precision highp float;
    const float SHINE_DAMPER = 10.0;
    const float REFLECTIVITY = 0.7;

    in vec2 out_texcoord;
    in vec3 out_toCamera;
    in vec4 out_clipSpace;

    uniform sampler2D u_reflectTextureSampler;
    uniform sampler2D u_refractTextureSampler;
    uniform sampler2D u_dudvTextureSampler;
    uniform float u_moveFactor;

    uniform sampler2D u_depthTextureSampler;

    const float waveStrenth = 0.1;

    out vec4 FragColor;

    void main(void)
    {
        vec4 texture_color;
	    vec4 texture_reflection;
	    vec4 texture_refraction;
	    vec2 ndc				= (out_clipSpace.xy/out_clipSpace.w)/2.0 + 0.5;

	    vec2 refract_texcoord   = vec2(ndc.x,  ndc.y);
	    vec2 reflect_texcoord   = vec2(ndc.x, -ndc.y);
    
	    vec2 distortion1		= (texture(u_dudvTextureSampler, vec2(out_texcoord.x + u_moveFactor, out_texcoord.y)).rg * 2.0 - 1.0) * waveStrenth;
	    vec2 distortion2		= (texture(u_dudvTextureSampler, vec2(-out_texcoord.x + u_moveFactor, out_texcoord.y + u_moveFactor)).rg * 2.0 - 1.0) * waveStrenth;

	    distortion1			    = distortion1 * distortion2;
	    refract_texcoord		= refract_texcoord + distortion1;
	    refract_texcoord		= clamp(refract_texcoord, 0.001, 0.999);

	    reflect_texcoord		= reflect_texcoord + distortion1;

	    reflect_texcoord.x		= clamp(reflect_texcoord.x,  0.001,  0.999);
	    reflect_texcoord.y		= clamp(reflect_texcoord.y, -0.999, -0.001);

	    texture_reflection		= texture(u_reflectTextureSampler, reflect_texcoord);
	    texture_refraction		= texture(u_refractTextureSampler, refract_texcoord);
	    vec3 veiwVector		    = normalize(out_toCamera);


	    float refractiveFactor  = dot(veiwVector, vec3(0.0,1.0,0.0));
	    texture_color			= mix(texture_reflection, texture_refraction, 0.4);
	    texture_color			= mix(texture_color, vec4(0.0,0.3,0.5,1.0), 0.2);
	
        FragColor				= texture_color;
    }
    `;

    water_fragment_shader_object = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(water_fragment_shader_object, water_fragment_shader_source_code);
    gl.compileShader(water_fragment_shader_object);
    if (gl.getShaderParameter(water_fragment_shader_object, gl.COMPILE_STATUS) == false)
    {
        var error = gl.getShaderInfoLog(water_fragment_shader_object);
        if (error.length > 0)
        {
            alert(error);
            uninitialize();
        }
    }
    
    // Shader program
    water_shader_program_object = gl.createProgram();
    gl.attachShader(water_shader_program_object, water_vertex_shader_object);
    gl.attachShader(water_shader_program_object, water_fragment_shader_object);
    
    // Pre link binding
    gl.bindAttribLocation(water_shader_program_object, WebGLMacros.AMC_ATTRIBUTE_VERTEX, "vPosition");
    gl.bindAttribLocation(water_shader_program_object, WebGLMacros.AMC_ATTRIBUTE_TEXTURE0, "vTexcoord");

    // Linking shaders
    gl.linkProgram(water_shader_program_object);
    if (gl.getProgramParameter(water_shader_program_object, gl.LINK_STATUS) == false)
    {
        var error = gl.getProgramInfoLog(water_shader_program_object);
        if (error.length > 0)
        {
            alert(error);
            uninitialize();
        }
    }
}


function getWaterUniformLocations()
{
    water_view_matrix_uniform = gl.getUniformLocation(water_shader_program_object, "u_viewMatrix");
    water_model_matrix_uniform = gl.getUniformLocation(water_shader_program_object, "u_modelMatrix");
    water_projection_matrix_uniform = gl.getUniformLocation(water_shader_program_object, "u_projectionMatrix");
    water_reflect_texture_sampler_uniform = gl.getUniformLocation(water_shader_program_object, "u_reflectTextureSampler");
    water_refract_texture_sampler_uniform = gl.getUniformLocation(water_shader_program_object, "u_refractTextureSampler");
    water_dudv_texture_sampler_uniform = gl.getUniformLocation(water_shader_program_object, "u_dudvTextureSampler");
    water_normal_texture_sampler_uniform = gl.getUniformLocation(water_shader_program_object, "u_normalTextureSampler");
    water_refract_depth_texture_sampler_uniform = gl.getUniformLocation(water_shader_program_object, "u_depthTextureSampler");
    water_camera_position_sampler_uniform = gl.getUniformLocation(water_shader_program_object, "u_cameraPosition");
    water_move_factor_uniform = gl.getUniformLocation(water_shader_program_object, "u_moveFactor");
    water_texture_tiling_uniform = gl.getUniformLocation(water_shader_program_object, "u_textureTiling");
    water_distortion_strength_uniform = gl.getUniformLocation(water_shader_program_object, "u_distortionStrength");
    // lightColor_uniform = gl.getUniformLocation(water_shader_program_object, "u_lightColor");
    // lightPosition_uniform = gl.getUniformLocation(water_shader_program_object, "u_lightPosition");
    
    // water_texture_uniform = gl.getUniformLocation(water_shader_program_object, "u_waterTextureSampler");
    water_plane_uniform = gl.getUniformLocation(water_shader_program_object, "u_plane");
}


function initializeWaterVAOAndVBO()
{

    // X translation 515.9000000000044,
    // Z translation 402.6000000000021
    var square_position = new Float32Array([
        523.0 * 1.0, -50.60000000000004,  523.0 *1.0,
        523.0 *-1.0,-50.60000000000004,  523.0 *1.0,
        523.0 *-1.0, -50.60000000000004, 523.0 *-1.0,
        523.0 *1.0, -50.60000000000004, 523.0 *-1.0
   ]);

   var square_texcoord = new Float32Array([
       1.0, 1.0,
       0.0, 1.0,
       0.0, 0.0,
       1.0, 0.0
   ]);
    
    // Setup vao and vbo
    vao_water = gl.createVertexArray();
    gl.bindVertexArray(vao_water);
    
    // Position
    vbo_water_position = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo_water_position);
    gl.bufferData(gl.ARRAY_BUFFER, square_position, gl.STATIC_DRAW);
    gl.vertexAttribPointer(WebGLMacros.AMC_ATTRIBUTE_VERTEX, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(WebGLMacros.AMC_ATTRIBUTE_VERTEX);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    // Texcoords
    vbo_water_texcoord = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo_water_texcoord);
    gl.bufferData(gl.ARRAY_BUFFER, square_texcoord, gl.STATIC_DRAW);
    gl.vertexAttribPointer(WebGLMacros.AMC_ATTRIBUTE_TEXTURE0, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(WebGLMacros.AMC_ATTRIBUTE_TEXTURE0);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    // // Normals
    // vbo_water_normals = gl.createBuffer();
    // gl.bindBuffer(gl.ARRAY_BUFFER, vbo_water_normals);
    // gl.bufferData(gl.ARRAY_BUFFER, water_normal, gl.STATIC_DRAW);
    // gl.vertexAttribPointer(WebGLMacros.AMC_ATTRIBUTE_NORMAL, 3, gl.FLOAT, false, 0, 0);
    // gl.enableVertexAttribArray(WebGLMacros.AMC_ATTRIBUTE_NORMAL);
    // gl.bindBuffer(gl.ARRAY_BUFFER, null);

    // // Indices
    // vbo_water_indices = gl.createBuffer();
    // gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, vbo_water_indices);
    // gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, water_indices, gl.STATIC_DRAW);
    // gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
    
    gl.bindVertexArray(null);
}

function loadWaterTextures()
{
    // DUDV Map
    water_dudv_texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, water_dudv_texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 255, 255]));

    water_dudv_texture.image = new Image();
    water_dudv_texture.crossOrigin = "anonymous";
    water_dudv_texture.image.src = "src/resources/textures/DuDv-Map_1.jpg";

    water_dudv_texture.image.addEventListener('load', function()
    {
        gl.bindTexture(gl.TEXTURE_2D, water_dudv_texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, water_dudv_texture.image);
        console.log("Loaded waterDUDV.png texture.");
    });

    water_dudv_texture.image.onload = function ()
    {
        gl.bindTexture(gl.TEXTURE_2D, water_dudv_texture);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, water_dudv_texture.image);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
        gl.generateMipmap(gl.TEXTURE_2D);
        gl.bindTexture(gl.TEXTURE_2D, null);
    }

    // Normal map
    water_normal_texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, water_normal_texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 255, 255]));

    water_normal_texture.image = new Image();
    water_normal_texture.crossOrigin = "anonymous";
    water_normal_texture.image.src = "src/resources/textures/water.jpg";

    water_normal_texture.image.addEventListener('load', function()
    {
        gl.bindTexture(gl.TEXTURE_2D, water_normal_texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, water_normal_texture.image);
        console.log("Loaded normalMap.png texture.");
    });

    water_normal_texture.image.onload = function ()
    {
        gl.bindTexture(gl.TEXTURE_2D, water_normal_texture);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, water_normal_texture.image);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
        gl.generateMipmap(gl.TEXTURE_2D);
        gl.bindTexture(gl.TEXTURE_2D, null);
    }

}


// Render water
function RenderWater(reflection_texture, refraction_texture, refraction_depth_texture,xAdjustment,yAdjustment,zAdjustment,scale)
{
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    
    gl.useProgram(water_shader_program_object);
    
    var modelMatrix = mat4.create();
    var viewMatrix = mat4.create();

    mat4.translate(modelMatrix, modelMatrix, [-700.0 + xAdjustment + test_translate_X, WATER_HEIGHT + yAdjustment + test_translate_Y, -100.0+zAdjustment + + test_translate_Z]);
    mat4.scale(modelMatrix,modelMatrix,[1.0 + scale + test_scale_X,1.0+scale + test_scale_X,1.0+scale + test_scale_X])
    mat4.rotateY(modelMatrix,modelMatrix,[0.0 - 127 + test_angleRotation]);
    gl.uniformMatrix4fv(water_model_matrix_uniform, false, modelMatrix);
    gl.uniformMatrix4fv(water_view_matrix_uniform, false, GetCameraViewMatrix());
    gl.uniformMatrix4fv(water_projection_matrix_uniform, false, perspectiveProjectionMatrix);
    gl.uniform4fv(water_plane_uniform, water_plane_reflection);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, reflection_texture);
    gl.uniform1i(water_reflect_texture_sampler_uniform, 0);
    
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, refraction_texture);
    gl.uniform1i(water_refract_texture_sampler_uniform, 1);

    gl.activeTexture(gl.TEXTURE2);
    gl.bindTexture(gl.TEXTURE_2D, water_dudv_texture);
    gl.uniform1i(water_dudv_texture_sampler_uniform, 2);

    gl.activeTexture(gl.TEXTURE3);
    gl.bindTexture(gl.TEXTURE_2D, water_normal_texture);
    gl.uniform1i(water_normal_texture_sampler_uniform, 3);
    // gl.uniform1i(water_texture_uniform,3);

    gl.activeTexture(gl.TEXTURE4);
    gl.bindTexture(gl.TEXTURE_2D, refraction_depth_texture);
    gl.uniform1i(water_refract_depth_texture_sampler_uniform, 4);

    gl.uniform3fv(water_camera_position_sampler_uniform, camera_position);
    // gl.uniform3fv(lightPosition_uniform,camera_position);
    // gl.uniform3fv(lightColor_uniform,[1.0,0.0,1.0]);

    gl.uniform1f(water_move_factor_uniform, water_move_factor);
    gl.uniform1f(water_texture_tiling_uniform, WATER_TEXTURE_TILING);
    gl.uniform1f(water_distortion_strength_uniform, WATER_DISTORTION_STRENGTH);

    gl.bindVertexArray(vao_water);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, vbo_water_indices);
    //gl.drawElements(gl.TRIANGLES, water_indices.length, gl.UNSIGNED_INT, 0);
    gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
    gl.bindVertexArray(null);

    gl.useProgram(null);
    
    gl.disable(gl.BLEND);
}

function updateTime(time)
{
    frames++;
    delta_time = time - last_update;
    last_update = time;

    if (time - last_fps_check >= 1.0)
    {
        fps = frames / (time - last_fps_check);
        last_fps_check = time;
        frames = 0;
    }
}


function animateWater()
{
    updateTime(new Date().getTime());
    water_move_factor += delta_time * WATER_MOVE_SPEED;
    water_move_factor = water_move_factor % 1.0;
}


function uninitializeWater()
{
    if (vao_water)
    {
        gl.deleteVertexArray(vao_water);
        vao_water = null;
    }
    
    if (vbo_water_position)
    {
        gl.deleteBuffer(gl.ARRAY_BUFFER, vbo_water_position);
        vbo_water_position = null;
    }
    
    if (vbo_water_normals)
    {
        gl.deleteBuffer(gl.ARRAY_BUFFER, vbo_water_normals);
        vbo_water_normals = null;
    }
    
    if (vbo_water_texcoord)
    {
        gl.deleteBuffer(gl.ARRAY_BUFFER, vbo_water_texcoord);
        vbo_water_texcoord = null;
    }
    
    if (vbo_water_indices)
    {
        gl.deleteBuffer(gl.ELEMENT_ARRAY_BUFFER, vbo_water_indices);
        vbo_water_indices = null;
    }

    if (water_dudv_texture)
    {
        gl.deleteTexture(gl.TEXTURE_2D, water_dudv_texture);
        water_dudv_texture = null;
    }

    if (water_normal_texture)
    {
        gl.deleteTexture(gl.TEXTURE_2D, water_normal_texture);
        water_normal_texture = null;
    }

    if (water_shader_program_object)
    {
        if (water_vertex_shader_object)
        {
            gl.deleteShader(water_vertex_shader_object);
            water_vertex_shader_object = null;
        }
        
        if (water_fragment_shader_object)
        {
            gl.deleteShader(water_fragment_shader_object);
            water_fragment_shader_object = null;
        }
    
        gl.deleteProgram(water_shader_program_object);
        water_shader_program_object = null;
    }
}