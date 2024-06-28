var fl_shaderProgramObject = null;

// Array and buffer objects
var fl_vao_quad = null;
var fl_vbo_position_quad = null;
var fl_vbo_texcoord_quad = null;

// Uniforms
var fl_projectionMatrixUniform;
var fl_viewMatrixUniform;
var fl_modelMatrixUniform;
var fl_textureSamplerUniform;
var fl_offsetUniform;

// Texture objects
var fl_flag_texture = null;
var fl_offset = 1.0;

function fl_initialize() {
    // Code
    // Vertex shader
    var fl_vertexShaderSourceCode =
        "#version 300 es" +
        "\n" +
        "precision highp float;" +
        "in vec4 aPosition;" +
        "in vec2 aTexCoord;" +
        "uniform mat4 uProjectionMatrix;\n" +
        "uniform mat4 uViewMatrix;\n" +
        "uniform mat4 uModelMatrix;\n" +
        "uniform float uOffsetUniform;" +
        "out vec2 oTexCoord;" +
        "void main(void)" +
        "{" +
        "vec4 pos = aPosition;" +
        /* "pos.x += sin(pos.x * 4.0 * 2.0 * 3.14159 + uOffsetUniform) / 100.0;" + */
        "pos.x += sin(pos.y * 4.0 * 2.0 * 3.14159 + uOffsetUniform) / 100.0;" +
        "pos.y += sin(pos.z * 4.0 * 2.0 * 3.14159 + uOffsetUniform) / 100.0;" +
        "pos.z += sin(pos.x * 4.0 * 2.0 * 3.14159 + uOffsetUniform) / 100.0;" +
        "mat4 modelViewMatrix = uViewMatrix * uModelMatrix;" +
        "gl_Position = uProjectionMatrix * modelViewMatrix * pos;" +
        "oTexCoord = aTexCoord;" +
        "}";

    var fl_vertexShaderObject = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(fl_vertexShaderObject, fl_vertexShaderSourceCode);
    gl.compileShader(fl_vertexShaderObject);
    if (gl.getShaderParameter(fl_vertexShaderObject, gl.COMPILE_STATUS) == false) {
        var error = gl.getShaderInfoLog(fl_vertexShaderObject);
        if (error.length > 0) {
            var log = "Vertex Shader Compilation Error : " + error;
            alert(log);
            fl_uninitialize();
        }
    }
    else {
        console.log("Vertex Shader Compile Successfully...\n");
    }

    // Fragment shader
    var fl_fragmentShaderSourceCode =
        "#version 300 es" +
        "\n" +
        "precision highp float;" +
        "in vec2 oTexCoord;" +
        "uniform sampler2D uTextureSampler;" +
        "uniform float uOffsetUniform;" +
        "out vec4 FragColor;" +
        "void main(void)" +
        "{" +
        "vec2 texcoord = oTexCoord;" +
        "texcoord.y += sin(texcoord.x * 4.0 * 2.0 * 3.14159 + uOffsetUniform) / 100.0;" +
        "FragColor = texture(uTextureSampler, texcoord);" +
        "}";

    var fl_fragmentShaderObject = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fl_fragmentShaderObject, fl_fragmentShaderSourceCode);
    gl.compileShader(fl_fragmentShaderObject);
    if (gl.getShaderParameter(fl_fragmentShaderObject, gl.COMPILE_STATUS) == false) {
        var error = gl.getShaderInfoLog(fl_fragmentShaderObject);
        if (error.length > 0) {
            var log = "Fragment Shader Compilation Error : " + error;
            alert(log);
            fl_uninitialize();
        }
    }
    else {
        console.log("Fragment Shader Compile Successfully...\n");
    }

    // Shader program
    fl_shaderProgramObject = gl.createProgram();
    gl.attachShader(fl_shaderProgramObject, fl_vertexShaderObject);
    gl.attachShader(fl_shaderProgramObject, fl_fragmentShaderObject);

    gl.bindAttribLocation(fl_shaderProgramObject, WebGLMacros.AMC_ATTRIBUTE_VERTEX, "aPosition");
    gl.bindAttribLocation(fl_shaderProgramObject, WebGLMacros.AMC_ATTRIBUTE_TEXTURE0, "aTexCoord");

    gl.linkProgram(fl_shaderProgramObject);
    if (gl.getProgramParameter(fl_shaderProgramObject, gl.LINK_STATUS) == false) {
        var error = gl.getProgramInfoLog(fl_shaderProgramObject);
        if (error.length > 0) {
            var log = "Shader Program Linking Error : " + error;
            alert(log);
            fl_uninitialize();
        }
    }
    else {
        console.log("Shader Program Linked Successfully...\n");
    }

    fl_projectionMatrixUniform = gl.getUniformLocation(fl_shaderProgramObject, "uProjectionMatrix");
    fl_viewMatrixUniform = gl.getUniformLocation(fl_shaderProgramObject, "uViewMatrix");
    fl_modelMatrixUniform = gl.getUniformLocation(fl_shaderProgramObject, "uModelMatrix");
    fl_textureSamplerUniform = gl.getUniformLocation(fl_shaderProgramObject, "uTextureSampler");
    fl_offsetUniform = gl.getUniformLocation(fl_shaderProgramObject, "uOffsetUniform");

    // Geometry attribute declarations
    var fl_rectangle_position = new Float32Array([
        1.0, 1.0, 0.0,
        -1.0, 1.0, 0.0,
        -1.0, -1.0, 0.0,
        1.0, -1.0, 0.0
    ]);

    var fl_rectangle_texcoord = new Float32Array([
        1.0, 1.0,
        0.0, 1.0,
        0.0, 0.0,
        1.0, 0.0
    ]);

    // VAO
    fl_vao_quad = gl.createVertexArray();
    gl.bindVertexArray(fl_vao_quad);

    // VBO - position
    fl_vbo_position_quad = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, fl_vbo_position_quad);
    gl.bufferData(gl.ARRAY_BUFFER, fl_rectangle_position, gl.STATIC_DRAW);
    gl.vertexAttribPointer(
        WebGLMacros.AMC_ATTRIBUTE_VERTEX,
        3,
        gl.FLOAT,
        false,
        0,
        0
    );
    gl.enableVertexAttribArray(WebGLMacros.AMC_ATTRIBUTE_VERTEX);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    // VBO - texcoord
    fl_vbo_texcoord_quad = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, fl_vbo_texcoord_quad);
    gl.bufferData(gl.ARRAY_BUFFER, fl_rectangle_texcoord, gl.STATIC_DRAW);
    gl.vertexAttribPointer(
        WebGLMacros.AMC_ATTRIBUTE_TEXTURE0,
        2,
        gl.FLOAT,
        false,
        0,
        0
    );
    gl.enableVertexAttribArray(WebGLMacros.AMC_ATTRIBUTE_TEXTURE0);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    gl.bindVertexArray(null);

    // Create texture
    fl_loadGLTexture();
}

function fl_loadGLTexture() {
    fl_flag_texture = gl.createTexture();
    fl_flag_texture.image = new Image();
    fl_flag_texture.image.src = "bharatFlag.png";
    fl_flag_texture.image.onload = function () {
        gl.bindTexture(gl.TEXTURE_2D, fl_flag_texture);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, fl_flag_texture.image);
        gl.generateMipmap(gl.TEXTURE_2D);
        gl.bindTexture(gl.TEXTURE_2D, null);
    }
}

function fl_display() {
    // Code
    gl.useProgram(fl_shaderProgramObject);

    // Transformation
    fl_viewMatrix = mat4.create();
    fl_modelMatrix = mat4.create();

    fl_viewMatrix = GetCameraViewMatrix();

    gl.uniformMatrix4fv(fl_projectionMatrixUniform, false, perspectiveProjectionMatrix);
    gl.uniformMatrix4fv(fl_viewMatrixUniform, false, fl_viewMatrix);

    // mat4.translate(fl_modelMatrix, fl_modelMatrix, [3.129209431888981,-18.00056257017179,-10.215952084752216]);
    mat4.translate(fl_modelMatrix, fl_modelMatrix, [0.0, 0.0, -5.0]);
    mat4.rotateY(pTrail_modelMatrix, pTrail_modelMatrix, degToRad(90.0));
    mat4.scale(pTrail_modelMatrix, pTrail_modelMatrix, [2.0, 2.0, 2.0]);

    gl.uniform1f(fl_offsetUniform, fl_offset);
    fl_offset += 0.2;

    // For texture
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, fl_flag_texture);
    gl.uniform1i(fl_textureSamplerUniform, 0);

    // VAO rectangle
    gl.bindVertexArray(fl_vao_quad);
    gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
    gl.bindVertexArray(null);

    // Unbind texture
    gl.bindTexture(gl.TEXTURE_2D, null);

    gl.useProgram(null);
}

function fl_uninitialize() {
    // Code
    if (fl_shaderProgramObject) { // It can be if(fl_shaderProgramObject == null)
        gl.useProgram(fl_shaderProgramObject);

        var shaderObjects = gl.getAttachedShaders(fl_shaderProgramObject);
        if (shaderObjects && shaderObjects.length > 0) {
            for (let i = 0; i < shaderObjects.length; i++) {
                gl.detachShader(fl_shaderProgramObject, shaderObjects[i]);
                gl.deleteShader(shaderObjects[i]);
                shaderObjects[i] = null;
            }
        }

        gl.useProgram(null);

        gl.deleteProgram(fl_shaderProgramObject);
        fl_shaderProgramObject = null;
    }

    if (fl_flag_texture) {
        gl.deleteTexture(fl_flag_texture);
        fl_flag_texture = null;
    }

    if (fl_vbo_texcoord_quad) {
        gl.deleteBuffer(fl_vbo_texcoord_quad);
        fl_vbo_texcoord_quad = null;
    }

    if (fl_vbo_position_quad) {
        gl.deleteBuffer(fl_vbo_position_quad);
        fl_vbo_position_quad = null;
    }

    if (fl_vao_quad) {
        gl.deleteVertexArray(fl_vao_quad);
        fl_vao_quad = null;
    }
}
