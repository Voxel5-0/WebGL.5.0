
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
    var scene_three_water_vertex_shader_source_code =
    `#version 300 es

    in vec4 vPosition;
    in vec2 vTexcoord;
    in vec3 vNormal;

    uniform mat4 u_modelMatrix;
    uniform mat4 u_viewMatrix;
    uniform mat4 u_projectionMatrix;
    uniform float u_textureTiling;
    uniform vec3 u_cameraPosition;

    out vec4 out_worldPosition;
    out vec2 out_texcoord;
    out vec3 out_normal;
    out vec3 out_toCamera;


    void main(void)
    {
        vec4 worldPos = u_modelMatrix * vPosition;
        vec4 positionRelativeToCamera = u_viewMatrix * worldPos;

        out_worldPosition = u_projectionMatrix * positionRelativeToCamera;
        out_texcoord = vTexcoord * u_textureTiling;
        out_normal = vNormal;
        out_toCamera = u_cameraPosition * worldPos.xyz;
        
        gl_Position = out_worldPosition;
    }
    `;

    scene_three_water_vertex_shader_object = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(scene_three_water_vertex_shader_object, scene_three_water_vertex_shader_source_code);
    gl.compileShader(scene_three_water_vertex_shader_object);
    if (gl.getShaderParameter(scene_three_water_vertex_shader_object, gl.COMPILE_STATUS) == false)
    {
        var error = gl.getShaderInfoLog(scene_three_water_vertex_shader_object);
        if (error.length > 0)
        {
            alert(error);
            uninitialize();
        }
    }
    
    // Fragment shader
    var scene_three_water_fragment_shader_source_code =
    `#version 300 es
    precision highp float;

    in vec4 out_worldPosition;
    in vec2 out_texcoord;
    in vec3 out_normal;
    in vec3 out_toCamera;

    uniform sampler2D u_reflectTextureSampler;
    uniform sampler2D u_refractTextureSampler;
    uniform sampler2D u_dudvTextureSampler;
    uniform sampler2D u_normalTextureSampler;
    uniform sampler2D u_depthTextureSampler;

    uniform float u_moveFactor;
    uniform float u_distortionStrength;

    out vec4 FragColor;


    // TODO: Change these values if the perspective near and far parameters change
    const float near = 0.1;
    const float far = 100.0;


    void main(void)
    {
        vec2 ndc = (out_worldPosition.xy / out_worldPosition.w) / 2.0 * 0.5;
        
        vec2 reflectionTexcoord = vec2(ndc.x, -ndc.y);
        vec2 refractionTexcoord = vec2(ndc.x, ndc.y);

        float terrainDepth = texture(u_depthTextureSampler, refractionTexcoord).r;
        float terrainDistance = 2.0 * near * far / (far + near - (2.0 * terrainDepth - 1.0) * (far - near));

        float fragmentDepth = gl_FragCoord.z;
        float fragmentDistance = 2.0 * near * far / (far + near - (2.0 * fragmentDepth - 1.0) * (far - near));

        float waterDepth = terrainDistance - fragmentDistance;

        vec2 distortedTexcoord = texture(u_dudvTextureSampler, vec2(out_texcoord.x + u_moveFactor, out_texcoord.y)).rg * 0.1;
        distortedTexcoord = out_texcoord + vec2(distortedTexcoord.x, distortedTexcoord.y + u_moveFactor);

        vec2 totalDistortion = (texture(u_dudvTextureSampler, distortedTexcoord).rg * 2.0 - 1.0) * u_distortionStrength * clamp(waterDepth / 20.0, 0.0, 1.0);

        refractionTexcoord += totalDistortion;
        refractionTexcoord = clamp(refractionTexcoord, 0.001, 0.999);

        reflectionTexcoord += totalDistortion;
        reflectionTexcoord.x = clamp(reflectionTexcoord.x, 0.001, 0.999);
        reflectionTexcoord.y = clamp(reflectionTexcoord.y, -0.999, -0.001);
        
        vec4 reflectColor = texture(u_reflectTextureSampler, reflectionTexcoord);
        vec4 refractColor = texture(u_refractTextureSampler, refractionTexcoord);
        
        vec4 normalMapColor = texture(u_normalTextureSampler, distortedTexcoord);
        vec3 normal = vec3(normalMapColor.r * 2.0 - 1.0, normalMapColor.b * 3.0, normalMapColor.g * 2.0 - 1.0);
        normal = normalize(normal);

        vec3 viewVector = normalize(out_toCamera);
        float refractiveFactor = dot(viewVector, normal);
        refractiveFactor = pow(refractiveFactor, 0.5);
        refractiveFactor = clamp(refractiveFactor, 0.001, 0.999);
        
        // TODO: Light calculations comes here....
        
        vec4 finalColor = mix(reflectColor, refractColor, refractiveFactor);
        finalColor = mix(finalColor, vec4(0.0, 0.3, 0.5, 1.0), 0.2);
        
        // TODO: Add light to the final color here...
        
        finalColor.a = clamp(waterDepth / 5.0, 0.0, 1.0);
        
        FragColor = finalColor;
    }
    `;

    scene_three_water_fragment_shader_object = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(scene_three_water_fragment_shader_object, scene_three_water_fragment_shader_source_code);
    gl.compileShader(scene_three_water_fragment_shader_object);
    if (gl.getShaderParameter(scene_three_water_fragment_shader_object, gl.COMPILE_STATUS) == false)
    {
        var error = gl.getShaderInfoLog(scene_three_water_fragment_shader_object);
        if (error.length > 0)
        {
            alert(error);
            uninitialize();
        }
    }
    
    // Shader program
    scene_three_water_shader_program_object = gl.createProgram();
    gl.attachShader(scene_three_water_shader_program_object, scene_three_water_vertex_shader_object);
    gl.attachShader(scene_three_water_shader_program_object, scene_three_water_fragment_shader_object);
    
    // Pre link binding
    gl.bindAttribLocation(scene_three_water_shader_program_object, WebGLMacros.AMC_ATTRIBUTE_VERTEX, "vPosition");
    gl.bindAttribLocation(scene_three_water_shader_program_object, WebGLMacros.AMC_ATTRIBUTE_TEXTURE0, "vTexcoord");
    gl.bindAttribLocation(scene_three_water_shader_program_object, WebGLMacros.AMC_ATTRIBUTE_NORMAL, "vNormal");

    // Linking shaders
    gl.linkProgram(scene_three_water_shader_program_object);
    if (gl.getProgramParameter(scene_three_water_shader_program_object, gl.LINK_STATUS) == false)
    {
        var error = gl.getProgramInfoLog(scene_three_water_shader_program_object);
        if (error.length > 0)
        {
            alert(error);
            uninitialize();
        }
    }
}


function getWaterUniformLocations()
{
    scene_three_water_view_matrix_uniform = gl.getUniformLocation(scene_three_water_shader_program_object, "u_viewMatrix");
    scene_three_water_model_matrix_uniform = gl.getUniformLocation(scene_three_water_shader_program_object, "u_modelMatrix");
    scene_three_water_projection_matrix_uniform = gl.getUniformLocation(scene_three_water_shader_program_object, "u_projectionMatrix");
    scene_three_water_reflect_texture_sampler_uniform = gl.getUniformLocation(scene_three_water_shader_program_object, "u_reflectTextureSampler");
    scene_three_water_refract_texture_sampler_uniform = gl.getUniformLocation(scene_three_water_shader_program_object, "u_refractTextureSampler");
    scene_three_water_dudv_texture_sampler_uniform = gl.getUniformLocation(scene_three_water_shader_program_object, "u_dudvTextureSampler");
    scene_three_water_normal_texture_sampler_uniform = gl.getUniformLocation(scene_three_water_shader_program_object, "u_normalTextureSampler");
    scene_three_water_refract_depth_texture_sampler_uniform = gl.getUniformLocation(scene_three_water_shader_program_object, "u_depthTextureSampler");
    scene_three_water_camera_position_sampler_uniform = gl.getUniformLocation(scene_three_water_shader_program_object, "u_cameraPosition");
    scene_three_water_move_factor_uniform = gl.getUniformLocation(scene_three_water_shader_program_object, "u_moveFactor");
    scene_three_water_texture_tiling_uniform = gl.getUniformLocation(scene_three_water_shader_program_object, "u_textureTiling");
    scene_three_water_distortion_strength_uniform = gl.getUniformLocation(scene_three_water_shader_program_object, "u_distortionStrength");
}


function initializeWaterVAOAndVBO()
{
    // Generate the water mesh vertices, texcoords normals and indices
    generateWaterMesh();
    
    // Setup vao and vbo
    scene_three_vao_water = gl.createVertexArray();
    gl.bindVertexArray(scene_three_vao_water);
    
    // Position
    scene_three_vbo_water_position = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, scene_three_vbo_water_position);
    gl.bufferData(gl.ARRAY_BUFFER, scene_three_water_vertices, gl.STATIC_DRAW);
    gl.vertexAttribPointer(WebGLMacros.AMC_ATTRIBUTE_VERTEX, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(WebGLMacros.AMC_ATTRIBUTE_VERTEX);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    // Texcoords
    scene_three_vbo_water_texcoord = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, scene_three_vbo_water_texcoord);
    gl.bufferData(gl.ARRAY_BUFFER, scene_three_water_texcoord, gl.STATIC_DRAW);
    gl.vertexAttribPointer(WebGLMacros.AMC_ATTRIBUTE_TEXTURE0, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(WebGLMacros.AMC_ATTRIBUTE_TEXTURE0);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    // Normals
    scene_three_vbo_water_normals = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, scene_three_vbo_water_normals);
    gl.bufferData(gl.ARRAY_BUFFER, scene_three_water_normal, gl.STATIC_DRAW);
    gl.vertexAttribPointer(WebGLMacros.AMC_ATTRIBUTE_NORMAL, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(WebGLMacros.AMC_ATTRIBUTE_NORMAL);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    // Indices
    scene_three_vbo_water_indices = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, scene_three_vbo_water_indices);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, scene_three_water_indices, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
    
    gl.bindVertexArray(null);
}



function generateWaterMesh()
{
    // Create a quad with vertices -
    // (0, 0, 0),
    // (0, 0, SCENE_THREE_WATER_MESH_SIZE),
    // (SCENE_THREE_WATER_MESH_SIZE, 0, 0),
    // (SCENE_THREE_WATER_MESH_SIZE, 0, SCENE_THREE_WATER_MESH_SIZE)

    const vertexCount = 4;
    
    scene_three_water_vertices = new Float32Array(vertexCount * 3);
    scene_three_water_texcoord = new Float32Array(vertexCount * 2);
    scene_three_water_normal = new Float32Array(vertexCount * 3);
    scene_three_water_indices = new Uint32Array(6);
   
    var verticesIndex = 0;
    var texcoordsIndex = 0;
    var normalsIndex = 0;
    var indicesIndex = 0;


    for (var i = 0; i < 2; i++)
    {
        var x = i * SCENE_THREE_WATER_MESH_SIZE;
        
        for (var j = 0; j < 2; j++)
        {
            var z = j * SCENE_THREE_WATER_MESH_SIZE;
            
            scene_three_water_vertices[verticesIndex++] = x;
            scene_three_water_vertices[verticesIndex++] = SCENE_THREE_WATER_HEIGHT;
            scene_three_water_vertices[verticesIndex++] = z;
            
            scene_three_water_texcoord[texcoordsIndex++] = i;
            scene_three_water_texcoord[texcoordsIndex++] = j;
            
            scene_three_water_normal[normalsIndex++] = 0.0;
            scene_three_water_normal[normalsIndex++] = 1.0;
            scene_three_water_normal[normalsIndex++] = 0.0;
        }
    }

    // Push indices in the order 0, 1, 2, 2, 1, 3 for the 2 triangles of a quad
    scene_three_water_indices[indicesIndex++] = 0;
    scene_three_water_indices[indicesIndex++] = 1;
    scene_three_water_indices[indicesIndex++] = 2;

    scene_three_water_indices[indicesIndex++] = 2;
    scene_three_water_indices[indicesIndex++] = 1;
    scene_three_water_indices[indicesIndex++] = 3;
}


function loadWaterTextures()
{
    // DUDV Map
    scene_three_water_dudv_texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, scene_three_water_dudv_texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 255, 255]));

    scene_three_water_dudv_texture.image = new Image();
    scene_three_water_dudv_texture.crossOrigin = "anonymous";
    scene_three_water_dudv_texture.image.src = "textures/scene3_waterDUDV.png";

    scene_three_water_dudv_texture.image.addEventListener('load', function()
    {
        gl.bindTexture(gl.TEXTURE_2D, scene_three_water_dudv_texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, scene_three_water_dudv_texture.image);
        console.log("Loaded waterDUDV.png texture.");
    });

    scene_three_water_dudv_texture.image.onload = function ()
    {
        gl.bindTexture(gl.TEXTURE_2D, scene_three_water_dudv_texture);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, scene_three_water_dudv_texture.image);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
        gl.generateMipmap(gl.TEXTURE_2D);
        gl.bindTexture(gl.TEXTURE_2D, null);
    }

    // Normal map
    scene_three_water_normal_texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, scene_three_water_normal_texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 255, 255]));

    scene_three_water_normal_texture.image = new Image();
    scene_three_water_normal_texture.crossOrigin = "anonymous";
    scene_three_water_normal_texture.image.src = "textures/scene3_normalmap.png";

    scene_three_water_normal_texture.image.addEventListener('load', function()
    {
        gl.bindTexture(gl.TEXTURE_2D, scene_three_water_normal_texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, scene_three_water_normal_texture.image);
        console.log("Loaded normalMap.png texture.");
    });

    scene_three_water_normal_texture.image.onload = function ()
    {
        gl.bindTexture(gl.TEXTURE_2D, scene_three_water_normal_texture);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, scene_three_water_normal_texture.image);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
        gl.generateMipmap(gl.TEXTURE_2D);
        gl.bindTexture(gl.TEXTURE_2D, null);
    }

}


// Render water
function renderWater()
{
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    
    gl.useProgram(scene_three_water_shader_program_object);
    
    var modelMatrix = mat4.create();
    var viewMatrix = mat4.create();

    mat4.translate(modelMatrix, modelMatrix, [0.0, -60.0, 0.0]);
    gl.uniformMatrix4fv(scene_three_water_model_matrix_uniform, false, modelMatrix);
    gl.uniformMatrix4fv(scene_three_water_view_matrix_uniform, false, GetCameraViewMatrix());
    gl.uniformMatrix4fv(scene_three_water_projection_matrix_uniform, false, perspectiveProjectionMatrix);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, scene_three_reflection_texture);
    gl.uniform1i(scene_three_water_reflect_texture_sampler_uniform, 0);
    
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, scene_three_refraction_texture);
    gl.uniform1i(scene_three_water_refract_texture_sampler_uniform, 1);

    gl.activeTexture(gl.TEXTURE2);
    gl.bindTexture(gl.TEXTURE_2D, scene_three_water_dudv_texture);
    gl.uniform1i(scene_three_water_dudv_texture_sampler_uniform, 2);

    gl.activeTexture(gl.TEXTURE3);
    gl.bindTexture(gl.TEXTURE_2D, scene_three_water_normal_texture);
    gl.uniform1i(scene_three_water_normal_texture_sampler_uniform, 3);

    gl.activeTexture(gl.TEXTURE4);
    gl.bindTexture(gl.TEXTURE_2D, scene_three_refraction_depth_texture);
    gl.uniform1i(scene_three_water_refract_depth_texture_sampler_uniform, 4);

    gl.uniform3fv(scene_three_water_camera_position_sampler_uniform, camera_position);
    gl.uniform1f(scene_three_water_move_factor_uniform, scene_three_water_move_factor);
    gl.uniform1f(scene_three_water_texture_tiling_uniform, SCENE_THREE_WATER_TEXTURE_TILING);
    gl.uniform1f(scene_three_water_distortion_strength_uniform, SCENE_THREE_WATER_DISTORTION_STRENGTH);

    gl.bindVertexArray(scene_three_vao_water);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, scene_three_vbo_water_indices);
    gl.drawElements(gl.TRIANGLES, scene_three_water_indices.length, gl.UNSIGNED_INT, 0);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
    gl.bindVertexArray(null);

    gl.useProgram(null);
    
    gl.disable(gl.BLEND);
}

