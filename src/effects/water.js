// ********************************************************
// VARIABLE DECLARATIONS
// ********************************************************
// ---------------------------

// ---------------------------

// FRAMEBUFFERS

// Constants
const REFLECTION_FBO_WIDTH = 512 ;
const REFLECTION_FBO_HEIGHT = 512;
const REFRACTION_FBO_WIDTH = 512;
const REFRACTION_FBO_HEIGHT = 512;

// Reflection
var reflection_fbo;
var refraction_fbo;
// var reflection_fbo;
// var reflection_depth_buffer;
// var reflection_texture;

// Refraction
// var refraction_fbo;
// var refraction_depth_texture;
// var refraction_texture;

// ---------------------------

// WATER

// Constants
const WATER_HEIGHT = -50.0;               // Y value for the water_vertices
const WATER_MESH_SIZE = 1024;           // Should be same as terrain size value
const WATER_TEXTURE_TILING = 4;
const WATER_DISTORTION_STRENGTH = 0.02;
const WATER_MOVE_SPEED = 0.00001;

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

function unbindFBO()
{
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, canvas.width, canvas.height);
}


function deleteFBO()
{
    if (refraction_depth_texture)
    {
        gl.deleteTexture(gl.TEXTURE_2D, refraction_depth_texture);
        refraction_depth_texture = null;
    }
    
    if (refraction_texture)
    {
        gl.deleteTexture(gl.TEXTURE_2D, refraction_texture);
        refraction_texture = null;
    }
    
    if (refraction_fbo)
    {
        gl.deleteFramebuffer(gl.FRAMEBUFFER, refraction_fbo);
        refraction_fbo = null;
    }

    if (reflection_depth_buffer)
    {
        gl.deleteRenderbuffer(gl.RENDERBUFFER, reflection_depth_buffer);
        reflection_depth_buffer = null;
    }
    
    
    if (reflection_texture)
    {
        gl.deleteTexture(gl.TEXTURE_2D, reflection_texture);
        reflection_texture = null;
    }
    
    if (reflection_fbo)
    {
        gl.deleteFramebuffer(gl.FRAMEBUFFER, reflection_fbo);
        reflection_fbo = null;
    }
}


// ********************************************************
// WATER
// ********************************************************
function initializeWater()
{
    // 1. Initialize shaders
    // 2. Get uniform locations
    // 3. Generate mesh and initialize VAO and VBOs
    // 4. Load textures
    
    initializeWaterShaders();
    getWaterUniformLocations();
    initializeWaterVAOAndVBO();
    loadWaterTextures();
}


function initializeWaterShaders()
{
    // Vertex shader
    var water_vertex_shader_source_code =
    `#version 300 es

    in vec4 vPosition;
    in vec2 vTexcoord;
    in vec3 vNormal;

    uniform mat4 u_modelMatrix;
    uniform mat4 u_viewMatrix;
    uniform mat4 u_projectionMatrix;
    uniform float u_textureTiling;
    uniform vec3 u_cameraPosition;
    uniform vec3 u_lightPosition;

    out vec4 out_worldPosition;
    out vec2 out_texcoord;
    out vec3 out_normal;
    out vec3 out_toCamera;
    out vec3 out_fromLightVector;

    void main(void)
    {
        vec4 worldPos = u_modelMatrix * vPosition;
        vec4 positionRelativeToCamera = u_viewMatrix * worldPos;

        out_worldPosition = u_projectionMatrix * positionRelativeToCamera;
        out_texcoord = vTexcoord * u_textureTiling;
        out_normal = vNormal;
        out_toCamera = u_cameraPosition * worldPos.xyz;
        
        out_fromLightVector.x = out_worldPosition.x - u_lightPosition.x;
        out_fromLightVector.y = out_worldPosition.y - u_lightPosition.y;
        out_fromLightVector.z = -out_worldPosition.z + u_lightPosition.z;

        gl_Position = out_worldPosition;
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

    in vec4 out_worldPosition;
    in vec2 out_texcoord;
    in vec3 out_normal;
    in vec3 out_toCamera;
    in vec3 out_fromLightVector;

    uniform sampler2D u_reflectTextureSampler;
    uniform sampler2D u_refractTextureSampler;
    uniform sampler2D u_dudvTextureSampler;
    uniform sampler2D u_normalTextureSampler;
    uniform sampler2D u_depthTextureSampler;

    uniform vec3 u_lightColor;

    uniform float u_moveFactor;
    uniform float u_distortionStrength;

    out vec4 FragColor;


    // TODO: Change these values if the perspective near and far parameters change
    const float near = 0.1;
    const float far = 100.0;


    void main(void)
    {
        vec2 ndc = (out_worldPosition.xy / out_worldPosition.w) / 2.0 * 0.5;
        
        vec2 refractionTexcoord = vec2(ndc.x, ndc.y);
        vec2 reflectionTexcoord = vec2(ndc.x, -ndc.y);

        float terrainDepth = texture(u_depthTextureSampler, refractionTexcoord).r;
        float terrainDistance = 2.0 * near * far / (far + near - (2.0 * terrainDepth - 1.0) * (far - near));

        vec2 distortedTexcoord = texture(u_dudvTextureSampler, vec2(out_texcoord.x + u_moveFactor, out_texcoord.y)).rg * 0.1;
        distortedTexcoord = out_texcoord + vec2(distortedTexcoord.x, distortedTexcoord.y + u_moveFactor);
        vec2 totalDistortion = (texture(u_dudvTextureSampler, distortedTexcoord).rg * 2.0 - 1.0) * u_distortionStrength ;

        
        refractionTexcoord += totalDistortion;
        refractionTexcoord = clamp(refractionTexcoord, 0.001, 0.999);
        reflectionTexcoord += totalDistortion;

        reflectionTexcoord.x = clamp(reflectionTexcoord.x, 0.001, 0.999);
        reflectionTexcoord.y = clamp(reflectionTexcoord.y, -0.999, -0.001);

        vec4 reflectColor = texture(u_reflectTextureSampler, reflectionTexcoord);
        vec4 refractColor = texture(u_refractTextureSampler, refractionTexcoord);

        vec3 viewVector = normalize(out_toCamera);
        float refractiveFactor = dot(viewVector, vec3(0.0, 1.0, 0.0));
        refractiveFactor = pow(refractiveFactor, 0.5);
        refractiveFactor = clamp(refractiveFactor, 0.001, 0.999);

        vec4 normalMapColor = texture(u_normalTextureSampler, distortedTexcoord);
        vec3 normal = vec3(normalMapColor.r * 2.0 - 1.0, normalMapColor.b * 3.0, normalMapColor.g * 2.0 - 1.0);
        normal = normalize(normal);

        vec3 reflectedLight = reflect(normalize(out_fromLightVector), normal);
        float specular = max(dot(reflectedLight, viewVector), 0.0);
        specular = pow(specular, SHINE_DAMPER);
        vec3 specularHighlights = u_lightColor * specular * REFLECTIVITY;
        FragColor = mix(refractColor,reflectColor,refractiveFactor);
        FragColor = mix(FragColor, vec4(0.0, 0.0, 1.0, 1.0), 0.2) + vec4(specularHighlights, 0.0);
    }
    `;

    //        FragColor = mix(refractColor,reflectColor,refractiveFactor);


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
    gl.bindAttribLocation(water_shader_program_object, WebGLMacros.AMC_ATTRIBUTE_NORMAL, "vNormal");

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
    //    uniform vec3 u_lightColor;
    lightColor_uniform = gl.getUniformLocation(water_shader_program_object, "u_lightColor");
    lightPosition_uniform = gl.getUniformLocation(water_shader_program_object, "u_lightPosition");

}


function initializeWaterVAOAndVBO()
{
    // Generate the water mesh vertices, texcoords normals and indices
    generateWaterMesh();
    
    // Setup vao and vbo
    vao_water = gl.createVertexArray();
    gl.bindVertexArray(vao_water);
    
    // Position
    vbo_water_position = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo_water_position);
    gl.bufferData(gl.ARRAY_BUFFER, water_vertices, gl.STATIC_DRAW);
    gl.vertexAttribPointer(WebGLMacros.AMC_ATTRIBUTE_VERTEX, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(WebGLMacros.AMC_ATTRIBUTE_VERTEX);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    // Texcoords
    vbo_water_texcoord = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo_water_texcoord);
    gl.bufferData(gl.ARRAY_BUFFER, water_texcoord, gl.STATIC_DRAW);
    gl.vertexAttribPointer(WebGLMacros.AMC_ATTRIBUTE_TEXTURE0, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(WebGLMacros.AMC_ATTRIBUTE_TEXTURE0);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    // Normals
    vbo_water_normals = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo_water_normals);
    gl.bufferData(gl.ARRAY_BUFFER, water_normal, gl.STATIC_DRAW);
    gl.vertexAttribPointer(WebGLMacros.AMC_ATTRIBUTE_NORMAL, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(WebGLMacros.AMC_ATTRIBUTE_NORMAL);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    // Indices
    vbo_water_indices = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, vbo_water_indices);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, water_indices, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
    
    gl.bindVertexArray(null);
}



function generateWaterMesh()
{
    // Create a quad with vertices -
    // (0, 0, 0),
    // (0, 0, WATER_MESH_SIZE),
    // (WATER_MESH_SIZE, 0, 0),
    // (WATER_MESH_SIZE, 0, WATER_MESH_SIZE)

    const vertexCount = 4;
    
    water_vertices = new Float32Array(vertexCount * 3);
    water_texcoord = new Float32Array(vertexCount * 2);
    water_normal = new Float32Array(vertexCount * 3);
    water_indices = new Uint32Array(6);
   
    var verticesIndex = 0;
    var texcoordsIndex = 0;
    var normalsIndex = 0;
    var indicesIndex = 0;


    for (var i = 0; i < 2; i++)
    {
        var x = i * WATER_MESH_SIZE;
        
        for (var j = 0; j < 2; j++)
        {
            var z = j * WATER_MESH_SIZE;
            
            water_vertices[verticesIndex++] = x;
            water_vertices[verticesIndex++] = WATER_HEIGHT;
            water_vertices[verticesIndex++] = z;
            
            water_texcoord[texcoordsIndex++] = i;
            water_texcoord[texcoordsIndex++] = j;
            
            water_normal[normalsIndex++] = 0.0;
            water_normal[normalsIndex++] = 1.0;
            water_normal[normalsIndex++] = 0.0;
        }
    }

    // Push indices in the order 0, 1, 2, 2, 1, 3 for the 2 triangles of a quad
    water_indices[indicesIndex++] = 0;
    water_indices[indicesIndex++] = 1;
    water_indices[indicesIndex++] = 2;

    water_indices[indicesIndex++] = 2;
    water_indices[indicesIndex++] = 1;
    water_indices[indicesIndex++] = 3;
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
    water_normal_texture.image.src = "src/resources/textures/matchingNormalMap.png";

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
function RenderWater(reflection_texture, refraction_texture, refraction_depth_texture)
{
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    
    gl.useProgram(water_shader_program_object);
    
    var modelMatrix = mat4.create();
    var viewMatrix = mat4.create();

    mat4.translate(modelMatrix, modelMatrix, [-700.0, -60.0, -100.0]);
    gl.uniformMatrix4fv(water_model_matrix_uniform, false, modelMatrix);
    gl.uniformMatrix4fv(water_view_matrix_uniform, false, GetCameraViewMatrix());
    gl.uniformMatrix4fv(water_projection_matrix_uniform, false, perspectiveProjectionMatrix);

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

    gl.activeTexture(gl.TEXTURE4);
    gl.bindTexture(gl.TEXTURE_2D, refraction_depth_texture);
    gl.uniform1i(water_refract_depth_texture_sampler_uniform, 4);

    gl.uniform3fv(water_camera_position_sampler_uniform, camera_position);
    gl.uniform3fv(lightPosition_uniform,camera_position);
    gl.uniform3fv(lightColor_uniform,[1.0,0.0,1.0]);

    gl.uniform1f(water_move_factor_uniform, water_move_factor);
    gl.uniform1f(water_texture_tiling_uniform, WATER_TEXTURE_TILING);
    gl.uniform1f(water_distortion_strength_uniform, WATER_DISTORTION_STRENGTH);

    gl.bindVertexArray(vao_water);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, vbo_water_indices);
    gl.drawElements(gl.TRIANGLES, water_indices.length, gl.UNSIGNED_INT, 0);
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