var pfc_shaderProgramObject = null;

var pfc_vao = null;

var pfc_projectionMatrixUniform;
var pfc_viewMatrixUniform;
var pfc_modelMatrixUniform;
var pfc_alphaUniform;
var pfc_textureSamplerUniform;

var pfc_viewMatrix;
var pfc_modelMatrix;

var pfc_texture_particle = null;

var pfc_particle;

function pfc_initialize() {
    // Code

    // Vertex shader
    var pfc_vertexShaderSourceCode =
        "#version 300 es" +
        "\n" +
        "uniform mat4 uProjectionMatrix;\n" +
        "uniform mat4 uViewMatrix;\n" +
        "uniform mat4 uModelMatrix;\n" +
        "void main(void)\n" +
        "{\n" +
        "mat4 modelViewMatrix = uViewMatrix * uModelMatrix;" +
        "gl_PointSize = 5.0;" +
        "gl_Position = uProjectionMatrix * modelViewMatrix * vec4(0.0, 0.0, 0.0, 1.0);\n" +
        "}\n";

    var pfc_vertexShaderObject = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(pfc_vertexShaderObject, pfc_vertexShaderSourceCode);
    gl.compileShader(pfc_vertexShaderObject);
    if (gl.getShaderParameter(pfc_vertexShaderObject, gl.COMPILE_STATUS) == false) {
        var error = gl.getShaderInfoLog(pfc_vertexShaderObject);
        if (error.length > 0) {
            var log = "Vertex Shader Compilation Error : " + error;
            alert(log);
            pfc_uninitialize();
        }
    }
    else {
        // console.log("Vertex Shader Compile Successfully...\n");
    }

    // Fragment shader
    var pfc_fragmentShaderSourceCode =
        "#version 300 es" +
        "\n" +
        "precision highp float;\n" +
        "uniform sampler2D uTextureSampler;\n" +
        "uniform float uAlpha;\n" +
        "out vec4 FragColor;\n" +
        "void main(void)\n" +
        "{\n" +
        "FragColor.rgb = texture(uTextureSampler, gl_PointCoord).rgb;\n" +
        "FragColor.a = uAlpha;\n" +
        "}\n";

    var pfc_fragmentShaderObject = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(pfc_fragmentShaderObject, pfc_fragmentShaderSourceCode);
    gl.compileShader(pfc_fragmentShaderObject);
    if (gl.getShaderParameter(pfc_fragmentShaderObject, gl.COMPILE_STATUS) == false) {
        var error = gl.getShaderInfoLog(pfc_fragmentShaderObject);
        if (error.length > 0) {
            var log = "Fragment Shader Compilation Error : " + error;
            alert(log);
            pfc_uninitialize();
        }
    }
    else {
        // console.log("Fragment Shader Compile Successfully...\n");
    }

    // Shader program
    pfc_shaderProgramObject = gl.createProgram();
    gl.attachShader(pfc_shaderProgramObject, pfc_vertexShaderObject);
    gl.attachShader(pfc_shaderProgramObject, pfc_fragmentShaderObject);

    gl.linkProgram(pfc_shaderProgramObject);
    if (gl.getProgramParameter(pfc_shaderProgramObject, gl.LINK_STATUS) == false) {
        var error = gl.getProgramInfoLog(pfc_shaderProgramObject);
        if (error.length > 0) {
            var log = "Shader Program Linking Error : " + error;
            alert(log);
            pfc_uninitialize();
        }
    }
    else {
        // console.log("Shader Program Linked Successfully...\n");
    }

    pfc_projectionMatrixUniform = gl.getUniformLocation(pfc_shaderProgramObject, "uProjectionMatrix");
    pfc_viewMatrixUniform = gl.getUniformLocation(pfc_shaderProgramObject, "uViewMatrix");
    pfc_modelMatrixUniform = gl.getUniformLocation(pfc_shaderProgramObject, "uModelMatrix");
    pfc_alphaUniform = gl.getUniformLocation(pfc_shaderProgramObject, "uAlpha");
    pfc_textureSamplerUniform = gl.getUniformLocation(pfc_shaderProgramObject, "uTextureSampler");

    //init_gl();
    //sendQuadVertexBuffers();

    // VAO
    pfc_vao = gl.createVertexArray();
    gl.bindVertexArray(pfc_vao);
    gl.bindVertexArray(null);

    // Create texture
    pfc_loadGLTexture();

    // Create particles
    pfc_particle = new Array(500);
    for (let i = 0; i < pfc_particle.length; ++i) {
        pfc_particle[i] = new pfc_Particle();
        pfc_initParticle(pfc_particle[i], true);
    }

    console.log("Particles following camera initialized...\n");

}

function pfc_Particle() {
    this.velocity = new Array(3);
    this.position = new Array(3);
    this.alpha = 0;
    this.wait = 0;
}

function pfc_initParticle(p, wait) {
    // Movement speed
    var angle = Math.random() * Math.PI * 2;
    var height = Math.random() * 0.02;
    var speed = Math.random() * 0.01;
    p.velocity[0] = Math.cos(angle) * speed;
    p.velocity[1] = height;
    p.velocity[2] = Math.sin(angle) * speed;

    p.position[0] = Math.random() * 0.001;
    p.position[1] = Math.random() * 0.001;
    p.position[2] = Math.random() * 0.001;

    // Transparency
    p.alpha = 5;

    // In initial stage, vary a time for creation
    if (wait == true) {
        // Time to wait
        p.wait = Math.random() * 120;
    }
}

function pfc_loadGLTexture() {
    pfc_texture_particle = gl.createTexture();
    if (!pfc_texture_particle) {
        console.log("createTexture() : Failed !!!\n");
        alert(log);
    }

    pfc_texture_particle.image = new Image();
    if (!pfc_texture_particle.image) {
        console.log("Failed to create Image object !!!\n");
        alert(log);
    }

    pfc_texture_particle.image.onload = function () {
        console.log('Texture loaded successfully.')
        console.log(pfc_texture_particle.image)

        gl.bindTexture(gl.TEXTURE_2D, pfc_texture_particle);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, pfc_texture_particle.image);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        // gl.generateMipmap(gl.TEXTURE_2D);
        gl.bindTexture(gl.TEXTURE_2D, null);
    }
    pfc_texture_particle.image.src = "src\\resources\\textures\\particleStar.png";
}

function pfc_display() {
    // Code
    pfc_update();

    gl.depthMask(false);

    gl.enable(gl.BLEND);
    gl.blendEquation(gl.FUNC_ADD);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE);

    //gl.pointSize(50.0);
    gl.enable(gl.PROGRAM_POINT_SIZE);
    gl.enable(gl.POINT_SPRITE);

    gl.useProgram(pfc_shaderProgramObject);

    // Transformation
    pfc_viewMatrix = mat4.create();
    pfc_modelMatrix = mat4.create();
    
    // pfc_viewMatrix = GetCameraViewMatrix();

    gl.uniformMatrix4fv(pfc_projectionMatrixUniform, false, perspectiveProjectionMatrix);
    gl.uniformMatrix4fv(pfc_viewMatrixUniform, false, pfc_viewMatrix);

    mat4.translate(pfc_modelMatrix, pfc_modelMatrix, [camera_position[0] + test_translate_X, camera_position[1] + test_translate_Y, camera_position[2] - 10.0 + test_translate_Z]);

    // Draw
    pfc_drawParticle(pfc_particle, pfc_modelMatrix);

    gl.useProgram(null);

    gl.depthMask(true);
    gl.disable(gl.BLEND);
    gl.disable(gl.PROGRAM_POINT_SIZE);
    gl.disable(gl.POINT_SPRITE);
}

function pfc_update() {
    // Code
    pfc_updateParticle(pfc_particle);
}

function pfc_updateParticle(p) {
    for (var i = 0; i < p.length; ++i) {
        var angle = Math.random() * Math.PI * 2;
        // Wait for creation
        if (p[i].wait > 0) {
            p[i].wait--;
            continue;
        }

        // Update a vertex coordinate
        // p[i].position[0] += p[i].velocity[0] + 0.01 + (Math.cos(angle) / 10);
        // p[i].position[1] += p[i].velocity[1] + (Math.sin(angle) / 10);
        p[i].position[0] += p[i].velocity[0] + 0.01;
        p[i].position[1] += p[i].velocity[1];
        p[i].position[2] += p[i].velocity[2];

        // Decreate Z translation
        p[i].velocity[2] += 0.001;
        // Fading out
        p[i].alpha -= 0.005;

        if (p[i].alpha <= 4.4) {
            pfc_initParticle(p[i], false);
        }
    }
}

function pfc_drawParticle(p, pfc_modelMatrix) {
    // For texture
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, pfc_texture_particle);
    gl.uniform1i(pfc_textureSamplerUniform, 0);

    gl.bindVertexArray(pfc_vao);

    let destModelMatrix = mat4.create();
    for (var i = 0; i < p.length; ++i) {
        mat4.identity(destModelMatrix);
        if (p[i].wait <= 0) {
            mat4.translate(destModelMatrix, pfc_modelMatrix, [p[i].position[0], p[i].position[1], p[i].position[2]]);
            

            gl.uniformMatrix4fv(pfc_modelMatrixUniform, false, destModelMatrix);
            gl.uniform1f(pfc_alphaUniform, p[i].alpha);
            gl.drawArrays(gl.POINTS, 0, 1);
        }
    }

    gl.bindVertexArray(null);

    // Unbind texture
    gl.bindTexture(gl.TEXTURE_2D, null);
}

function pfc_degToRad(degrees) {
    return (degrees * Math.PI / 180.0);
}

function pfc_uninitialize() {
    // Code
    if (pfc_shaderProgramObject) { // It can be if(pfc_shaderProgramObject == null)
        gl.useProgram(pfc_shaderProgramObject);

        var shaderObjects = gl.getAttachedShaders(pfc_shaderProgramObject);
        if (shaderObjects && shaderObjects.length > 0) {
            for (let i = 0; i < shaderObjects.length; i++) {
                gl.detachShader(pfc_shaderProgramObject, shaderObjects[i]);
                gl.deleteShader(shaderObjects[i]);
                shaderObjects[i] = null;
            }
        }

        gl.useProgram(null);

        gl.deleteProgram(pfc_shaderProgramObject);
        pfc_shaderProgramObject = null;
    }

    if (pfc_texture_particle) {
        gl.deleteTexture(pfc_texture_particle);
        pfc_texture_particle = null;
    }

    if (pfc_vao) {
        gl.deleteVertexArray(pfc_vao);
        pfc_vao = null;
    }
}