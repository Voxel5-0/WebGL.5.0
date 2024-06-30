var tst_shaderProgramObject = null;

var tst_vao = null;
var tst_vbo_position = null;

var tst_fadeIn_alpha = 1.0;
var tst_fadeOut_alpha = 0.0;
var tst_enabled_transition = false;

var tst_mvpMatrixUniform;
var tst_alphaUniform;

function tst_initialize() {
    // Code

    // Vertex shader
    var tst_vertexShaderSourceCode =
        "#version 300 es" +
        "\n" +
        "precision highp float;" +
        "in vec4 aPosition;" +
        "uniform mat4 uMVPMatrix;" +
        "void main(void)" +
        "{" +
        "gl_Position = uMVPMatrix * aPosition;" +
        "}";

    var tst_vertexShaderObject = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(tst_vertexShaderObject, tst_vertexShaderSourceCode);
    gl.compileShader(tst_vertexShaderObject);
    if (gl.getShaderParameter(tst_vertexShaderObject, gl.COMPILE_STATUS) == false) {
        var error = gl.getShaderInfoLog(tst_vertexShaderObject);
        if (error.length > 0) {
            var log = "Vertex Shader Compilation Error : " + error;
            alert(log);
            tst_uninitialize();
        }
    }
    else {
        console.log("Vertex Shader Compile Successfully...\n");
    }

    // Fragment shader
    var tst_fragmentShaderSourceCode =
        "#version 300 es" +
        "\n" +
        "precision highp float;" +
        "uniform float uAlpha;" +
        "out vec4 FragColor;" +
        "void main(void)" +
        "{" +
        "FragColor = vec4(0.0, 0.0, 0.0, uAlpha);" +
        "}";

    var tst_fragmentShaderObject = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(tst_fragmentShaderObject, tst_fragmentShaderSourceCode);
    gl.compileShader(tst_fragmentShaderObject);
    if (gl.getShaderParameter(tst_fragmentShaderObject, gl.COMPILE_STATUS) == false) {
        var error = gl.getShaderInfoLog(tst_fragmentShaderObject);
        if (error.length > 0) {
            var log = "Fragment Shader Compilation Error : " + error;
            alert(log);
            tst_uninitialize();
        }
    }
    else {
        console.log("Fragment Shader Compile Successfully...\n");
    }

    // Shader program
    tst_shaderProgramObject = gl.createProgram();
    gl.attachShader(tst_shaderProgramObject, tst_vertexShaderObject);
    gl.attachShader(tst_shaderProgramObject, tst_fragmentShaderObject);

    gl.bindAttribLocation(tst_shaderProgramObject, WebGLMacros.AMC_ATTRIBUTE_VERTEX, "aPosition");

    gl.linkProgram(tst_shaderProgramObject);
    if (gl.getProgramParameter(tst_shaderProgramObject, gl.LINK_STATUS) == false) {
        var error = gl.getProgramInfoLog(tst_shaderProgramObject);
        if (error.length > 0) {
            var log = "Shader Program Linking Error : " + error;
            alert(log);
            tst_uninitialize();
        }
    }
    else {
        console.log("Shader Program Linked Successfully...\n");
    }

    tst_mvpMatrixUniform = gl.getUniformLocation(tst_shaderProgramObject, "uMVPMatrix");
    tst_alphaUniform = gl.getUniformLocation(tst_shaderProgramObject, "uAlpha");

    // Geometry attribute declarations
    var tst_rectangle_position = new Float32Array([
        100.0, 100.0, 0.0,
        -100.0, 100.0, 0.0,
        -100.0, -100.0, 0.0,
        100.0, -100.0, 0.0
    ]);

    // VAO
    tst_vao = gl.createVertexArray();
    gl.bindVertexArray(tst_vao);

    // VBO
    tst_vbo_position = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, tst_vbo_position);
    gl.bufferData(gl.ARRAY_BUFFER, tst_rectangle_position, gl.STATIC_DRAW);
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

    gl.bindVertexArray(null);
}

function tst_display() {
    // Code
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    
    gl.useProgram(tst_shaderProgramObject);

    // Transformation
    let modelViewMatrix = mat4.create();
    let modelMatrix = mat4.create();
    let viewMatrix = mat4.create();
    let modelViewProjectionMatrix = mat4.create();

    mat4.translate(modelMatrix, modelMatrix, [0.0, 0.0, -3.0]);
    // viewMatrix = GetCameraViewMatrix();
    mat4.multiply(modelViewMatrix, viewMatrix, modelMatrix);
    mat4.multiply(modelViewProjectionMatrix, perspectiveProjectionMatrix, modelViewMatrix);

    gl.uniformMatrix4fv(tst_mvpMatrixUniform, false, modelViewProjectionMatrix);
    if (tst_enabled_transition == true)
        gl.uniform1f(tst_alphaUniform, tst_fadeIn_alpha);
    else
        gl.uniform1f(tst_alphaUniform, tst_fadeOut_alpha);

    gl.bindVertexArray(tst_vao);
    gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
    gl.bindVertexArray(null);

    gl.useProgram(null);

    gl.disable(gl.BLEND);
}

function tst_update() {
    // Code

}

function tst_uninitialize() {
    // Code
    if (tst_shaderProgramObject) { // It can be if(tst_shaderProgramObject == null)
        gl.useProgram(tst_shaderProgramObject);

        var shaderObjects = gl.getAttachedShaders(tst_shaderProgramObject);
        if (shaderObjects && shaderObjects.length > 0) {
            for (let i = 0; i < shaderObjects.length; i++) {
                gl.detachShader(tst_shaderProgramObject, shaderObjects[i]);
                gl.deleteShader(shaderObjects[i]);
                shaderObjects[i] = null;
            }
        }

        gl.useProgram(null);

        gl.deleteProgram(tst_shaderProgramObject);
        tst_shaderProgramObject = null;
    }

    if (tst_vbo_position) {
        gl.deleteBuffer(tst_vbo_position);
        tst_vbo_position = null;
    }

    if (tst_vao) {
        gl.deleteVertexArray(tst_vao);
        tst_vao = null;
    }
}

function fadeIn()
{
    tst_enabled_transition = true;
    
    tst_fadeIn_alpha = tst_fadeIn_alpha - 0.005;
    if(tst_fadeIn_alpha < 0.0)
        tst_fadeIn_alpha = 0.0;
}

function fadeOut()
{
    tst_enabled_transition = false;

    tst_fadeOut_alpha = tst_fadeOut_alpha + 0.005;
    if (tst_fadeOut_alpha > 1.0) {
        tst_fadeOut_alpha = 0.0;
        tst_fadeIn_alpha = 1.0;
        scene++;
    }
}

function setFadeInAlpha()
{
    tst_fadeIn_alpha = 1.0;
    // tst_enabled_transition = true;
}

function setFadeOutAlpha()
{
    tst_fadeOut_alpha = 0.0;
    // tst_enabled_transition = false;
}
