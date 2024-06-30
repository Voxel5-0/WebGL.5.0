
var wave_shaderProgramObject = null;

// Array and buffer objects
var wave_vao_quad = null;
var wave_vbo_position_quad = null;
var wave_vbo_texcoord_quad = null;

// Data arrays
var points = [];
var pointCoords = [];
var mesh_elements = [];

var wiggle_count;
var hold;

// Uniforms
var wave_pMatrixUniform;
var wave_mMatrixUniform;
var wave_vMatrixUniform;
var wave_textureSamplerUniform;
var wave_offsetUniform;

// Matrices
var perspectiveProjectionMatrix;

// Texture objects
var offset = 1.0;

const wave_VertexAttributeEnum =
{
    AMC_ATTRIBUTE_POSITION: 0,
    AMC_ATTRIBUTE_TEXCOORD: 1
};

function wave_initialize() {
    // Code

    // Vertex shader
    var vertexShaderSourceCode =
        "#version 300 es" +
        "\n" +
        "precision highp float;" +
        "in vec4 aPosition;" +
        "in vec2 aTexCoord;" +
        "uniform mat4 uMMatrix;" +
        "uniform mat4 uVMatrix;" +
        "uniform mat4 uPMatrix;" +
        "uniform float uOffsetUniform;" +
        "out vec2 oTexCoord;" +
        "void main(void)" +
        "{" +
        "vec4 pos = aPosition;" +
        /* "pos.x += sin(pos.x * 4.0 * 2.0 * 3.14159 + uOffsetUniform) / 100.0;" + */
        "pos.x += sin(pos.y * 4.0 * 2.0 * 3.14159 + uOffsetUniform) / 250.0;" +
        "pos.y += sin(pos.z * 4.0 * 2.0 * 3.14159 + uOffsetUniform) / 250.0;" +
        "pos.z += sin(pos.x * 4.0 * 2.0 * 3.14159 + uOffsetUniform) / 250.0;" +
        "gl_Position = uPMatrix * uVMatrix * uMMatrix * pos;" +
        "oTexCoord = aTexCoord;" +
        "}";

    var vertexShaderObject = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShaderObject, vertexShaderSourceCode);
    gl.compileShader(vertexShaderObject);
    if (gl.getShaderParameter(vertexShaderObject, gl.COMPILE_STATUS) == false) {
        var error = gl.getShaderInfoLog(vertexShaderObject);
        if (error.length > 0) {
            var log = "Vertex Shader Compilation Error : " + error;
            alert(log);
            uninitialize();
        }
    }
    else {
        console.log("Vertex Shader Compile Successfully...\n");
    }

    // Fragment shader
    var fragmentShaderSourceCode =
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
        "texcoord.y += sin(texcoord.x * 4.0 * 2.0 * 3.14159 + uOffsetUniform) / 250.0;" +
        "FragColor = texture(uTextureSampler, texcoord);" +
        "}";

    var fragmentShaderObject = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShaderObject, fragmentShaderSourceCode);
    gl.compileShader(fragmentShaderObject);
    if (gl.getShaderParameter(fragmentShaderObject, gl.COMPILE_STATUS) == false) {
        var error = gl.getShaderInfoLog(fragmentShaderObject);
        if (error.length > 0) {
            var log = "Fragment Shader Compilation Error : " + error;
            alert(log);
            uninitialize();
        }
    }
    else {
        console.log("Fragment Shader Compile Successfully...\n");
    }

    // Shader program
    wave_shaderProgramObject = gl.createProgram();
    gl.attachShader(wave_shaderProgramObject, vertexShaderObject);
    gl.attachShader(wave_shaderProgramObject, fragmentShaderObject);

    gl.bindAttribLocation(wave_shaderProgramObject, wave_VertexAttributeEnum.AMC_ATTRIBUTE_POSITION, "aPosition");
    gl.bindAttribLocation(wave_shaderProgramObject, wave_VertexAttributeEnum.AMC_ATTRIBUTE_TEXCOORD, "aTexCoord");

    gl.linkProgram(wave_shaderProgramObject);
    if (gl.getProgramParameter(wave_shaderProgramObject, gl.LINK_STATUS) == false) {
        var error = gl.getProgramInfoLog(wave_shaderProgramObject);
        if (error.length > 0) {
            var log = "Shader Program Linking Error : " + error;
            alert(log);
            uninitialize();
        }
    }
    else {
        console.log("Shader Program Linked Successfully...\n");
    }

    wave_pMatrixUniform = gl.getUniformLocation(wave_shaderProgramObject, "uPMatrix");
    wave_mMatrixUniform = gl.getUniformLocation(wave_shaderProgramObject, "uMMatrix");
    wave_vMatrixUniform = gl.getUniformLocation(wave_shaderProgramObject, "uVMatrix");
    wave_textureSamplerUniform = gl.getUniformLocation(wave_shaderProgramObject, "uTextureSampler");
    wave_offsetUniform = gl.getUniformLocation(wave_shaderProgramObject, "uOffsetUniform");

    // Geometry attribute declarations
    var rectangle_position = new Float32Array([
        1.0, 1.0, 0.0,
        -1.0, 1.0, 0.0,
        -1.0, -1.0, 0.0,
        1.0, -1.0, 0.0
    ]);

    var rectangle_texcoord = new Float32Array([
        1.0, 1.0,
        0.0, 1.0,
        0.0, 0.0,
        1.0, 0.0
    ]);

    // VAO
    wave_vao_quad = gl.createVertexArray();
    gl.bindVertexArray(wave_vao_quad);

    // VBO - position
    wave_vbo_position_quad = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, wave_vbo_position_quad);
    gl.bufferData(gl.ARRAY_BUFFER, rectangle_position, gl.STATIC_DRAW);
    gl.vertexAttribPointer(
        wave_VertexAttributeEnum.AMC_ATTRIBUTE_POSITION,
        3,
        gl.FLOAT,
        false,
        0,
        0
    );
    gl.enableVertexAttribArray(wave_VertexAttributeEnum.AMC_ATTRIBUTE_POSITION);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    // VBO - texcoord
    wave_vbo_texcoord_quad = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, wave_vbo_texcoord_quad);
    gl.bufferData(gl.ARRAY_BUFFER, rectangle_texcoord, gl.STATIC_DRAW);
    gl.vertexAttribPointer(
        wave_VertexAttributeEnum.AMC_ATTRIBUTE_TEXCOORD,
        2,
        gl.FLOAT,
        false,
        0,
        0
    );
    gl.enableVertexAttribArray(wave_VertexAttributeEnum.AMC_ATTRIBUTE_TEXCOORD);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    gl.bindVertexArray(null);

}

function wave_loadTexture(path, isTexFlipped) {
	var tbo = gl.createTexture()
	tbo.image = new Image()
	tbo.image.src = path
	tbo.image.onload = function() {
		gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, isTexFlipped)
		gl.bindTexture(gl.TEXTURE_2D, tbo)
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR)
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, tbo.image)
		gl.generateMipmap(gl.TEXTURE_2D)
		//console.log("Texture :" + path)
	}
	return tbo
}

function wave_display(wave_texture) {
    // update();

    // Code
   // gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.enable(gl.BLEND);
    gl.blendEquation(gl.FUNC_ADD);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE);

    gl.useProgram(wave_shaderProgramObject);

    // Transformation
    var modelMatrix = mat4.create();
    mat4.identity(modelMatrix);
    var viewMatrix = mat4.create();

    mat4.translate(modelMatrix, modelMatrix, [0.0, 0.0, -10.0]);
    //mat4.multiply(modelViewProjectionMatrix, perspectiveProjectionMatrix, modelViewMatrix);

    gl.uniformMatrix4fv(wave_pMatrixUniform, false, perspectiveProjectionMatrix);
    gl.uniformMatrix4fv(wave_vMatrixUniform, false, viewMatrix);
    gl.uniformMatrix4fv(wave_mMatrixUniform, false, modelMatrix);

    gl.uniform1f(wave_offsetUniform, offset);
    offset += 0.2;

    // For texture
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, wave_texture);
    gl.uniform1i(wave_textureSamplerUniform, 0);

    // VAO rectangle
    gl.bindVertexArray(wave_vao_quad);
    gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
    gl.bindVertexArray(null);

    // Unbind texture
    gl.bindTexture(gl.TEXTURE_2D, null);

    gl.useProgram(null);

    gl.disable(gl.BLEND);
    
}

// function wave_update() {
//     // Variable declarations
// 	let x, y;

//     // Code
//     if (wiggle_count == 5)
//     {
//         for (y = 0; y < 45; y++)
//         {
//             hold = points[y * 3 + 2];
//             for (x = 0; x < 44; x++)
//             {
//                 points[(x * 45) + (y * 3) + 2] = points[((x + 1) * 45) + (y * 3) + 2];

//             }
//             points[(44 * 45) + (y * 3) + 2] = hold;
//         }
//         wiggle_count = 0;
//     }
//     wiggle_count++;
// }

function wave_uninitialize() {
    // Code
    if (wave_shaderProgramObject) { // It can be if(shaderProgramObject == null)
        gl.useProgram(wave_shaderProgramObject);

        var shaderObjects = gl.getAttachedShaders(wave_shaderProgramObject);
        if (shaderObjects && shaderObjects.length > 0) {
            for (let i = 0; i < shaderObjects.length; i++) {
                gl.detachShader(wave_shaderProgramObject, shaderObjects[i]);
                gl.deleteShader(shaderObjects[i]);
                shaderObjects[i] = null;
            }
        }

        gl.useProgram(null);

        gl.deleteProgram(wave_shaderProgramObject);
        wave_shaderProgramObject = null;
    }

    //if (wave_texture) {
    //    gl.deleteTexture(wave_texture);
    //    wave_texture = null;
    //}

    if (wave_vbo_texcoord_quad) {
        gl.deleteBuffer(wave_vbo_texcoord_quad);
        wave_vbo_texcoord_quad = null;
    }

    if (wave_vbo_position_quad) {
        gl.deleteBuffer(wave_vbo_position_quad);
        wave_vbo_position_quad = null;
    }

    if (wave_vao_quad) {
        gl.deleteVertexArray(wave_vao_quad);
        wave_vao_quad = null;
    }
}
