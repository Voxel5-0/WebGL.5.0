var pTrail_shaderProgramObject = null;

var pTrail_vao = null;
var pTrail_vbo_position = null;
var pTrail_vbo_texcoord = null;
var pTrail_vbo_indices = null;

var pTrail_projectionMatrixUniform;
var pTrail_viewMatrixUniform;
var pTrail_modelMatrixUniform;
var pTrail_alphaUniform;
var pTrail_textureSamplerUniform;

var pTrail_perspectiveProjectionMatrix;
var pTrail_viewMatrix;
var pTrail_modelMatrix;

var pTrail_texture_particle = null;

//var particle;
var pTrail_arch;
var pTrail_radius = 75.0;

function pTrail_initialize() {
    // Code

    // Vertex shader
    let vertexShaderSourceCode =
        "#version 300 es" +
        "\n" +
        "in vec3 aPosition;\n" +
        "in vec2 aTexCoord;\n" +
        "uniform mat4 uProjectionMatrix;\n" +
        "uniform mat4 uViewMatrix;\n" +
        "uniform mat4 uModelMatrix;\n" +
        "out vec2 oTexCoord;\n" +
        "void main(void)\n" +
        "{\n" +
        "mat4 modelViewMatrix = uViewMatrix * uModelMatrix;" +
        "gl_Position = uProjectionMatrix * modelViewMatrix * vec4(aPosition, 1.0);\n" +
        "oTexCoord = aTexCoord;\n" +
        "}\n";

    let vertexShaderObject = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShaderObject, vertexShaderSourceCode);
    gl.compileShader(vertexShaderObject);
    if (gl.getShaderParameter(vertexShaderObject, gl.COMPILE_STATUS) == false) {
        var error = gl.getShaderInfoLog(vertexShaderObject);
        if (error.length > 0) {
            var log = "Vertex Shader Compilation Error : " + error;
            alert(log);
            pTrail_uninitialize();
        }
    }
    else {
        console.log("Vertex Shader Compile Successfully...\n");
    }

    // Fragment shader
    let fragmentShaderSourceCode =
        "#version 300 es" +
        "\n" +
        "precision highp float;\n" +
        "in vec2 oTexCoord;\n" +
        "uniform sampler2D uTextureSampler;\n" +
        "uniform float uAlpha;\n" +
        "out vec4 FragColor;\n" +
        "void main(void)\n" +
        "{\n" +
        "FragColor.rgb = texture(uTextureSampler, oTexCoord).rgb;\n" +
        "FragColor.a = uAlpha;\n" +
        "}\n";

    let fragmentShaderObject = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShaderObject, fragmentShaderSourceCode);
    gl.compileShader(fragmentShaderObject);
    if (gl.getShaderParameter(fragmentShaderObject, gl.COMPILE_STATUS) == false) {
        var error = gl.getShaderInfoLog(fragmentShaderObject);
        if (error.length > 0) {
            var log = "Fragment Shader Compilation Error : " + error;
            alert(log);
            pTrail_uninitialize();
        }
    }
    else {
        console.log("Fragment Shader Compile Successfully...\n");
    }

    // Shader program
    pTrail_shaderProgramObject = gl.createProgram();
    gl.attachShader(pTrail_shaderProgramObject, vertexShaderObject);
    gl.attachShader(pTrail_shaderProgramObject, fragmentShaderObject);

    gl.bindAttribLocation(pTrail_shaderProgramObject, WebGLMacros.AMC_ATTRIBUTE_VERTEX, "aPosition");
    gl.bindAttribLocation(pTrail_shaderProgramObject, WebGLMacros.AMC_ATTRIBUTE_TEXTURE0, "aTexCoord");

    gl.linkProgram(pTrail_shaderProgramObject);
    if (gl.getProgramParameter(pTrail_shaderProgramObject, gl.LINK_STATUS) == false) {
        var error = gl.getProgramInfoLog(pTrail_shaderProgramObject);
        if (error.length > 0) {
            var log = "Shader Program Linking Error : " + error;
            alert(log);
            pTrail_uninitialize();
        }
    }
    else {
        console.log("Shader Program Linked Successfully...\n");
    }

    pTrail_projectionMatrixUniform = gl.getUniformLocation(pTrail_shaderProgramObject, "uProjectionMatrix");
    pTrail_viewMatrixUniform = gl.getUniformLocation(pTrail_shaderProgramObject, "uViewMatrix");
    pTrail_modelMatrixUniform = gl.getUniformLocation(pTrail_shaderProgramObject, "uModelMatrix");
    pTrail_alphaUniform = gl.getUniformLocation(pTrail_shaderProgramObject, "uAlpha");
    pTrail_textureSamplerUniform = gl.getUniformLocation(pTrail_shaderProgramObject, "uTextureSampler");

    //init_gl();
    sendQuadVertexBuffers();

    // Create texture
    pTrail_loadGLTexture();

    // Create pTrail_arch
    pTrail_arch = new Array(361);
    archPos = new Array(361);
    let angle = 180.0;

    for (let i = 0; i <= 360; i++) {
        let pos = new Array(3);
        pos[0] = pTrail_radius * Math.cos(degToRad(angle));
        pos[1] = -(pTrail_radius * Math.sin(degToRad(angle)));
        pos[2] = 0.0;

        archPos[i] = new Array(4);
        archPos[i][0] = pos[0];
        archPos[i][1] = pos[1];
        archPos[i][2] = 0.0;
        archPos[i][3] = i;
        archPos[i][4] = 360 - i / 1.5;

        angle = angle + 0.5;

        pTrail_arch[i] = new Array(5);
        initFountain(pTrail_arch[i], pos);
    }

    // Initialize projection matrix
    pTrail_perspectiveProjectionMatrix = mat4.create();
    // Set perspective projection
    mat4.perspective(
        pTrail_perspectiveProjectionMatrix,
        30.0,
        parseFloat(canvas.width) / parseFloat(canvas.height),
        0.1,
        10000.0
    );

    console.log("Particles initialized");
}

function initFountain(f, pos) {
    //f = new Array(5);
    for (let i = 0; i < f.length; ++i) {
        f[i] = new Particle();
        initParticle(f[i], true, pos);
    }
}

// function init_gl() {
//     //  Depth initialization
//     //gl.clearDepth(1.0);
//     //gl.enable(gl.DEPTH_TEST);
//     //gl.depthFunc(gl.LEQUAL);

//     gl.depthMask(false);

//     // Set clear color
//     //gl.clearColor(0.0, 0.0, 0.0, 1.0);

//     gl.enable(gl.BLEND);
//     gl.blendEquation(gl.FUNC_ADD);
//     gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
// }

function sendQuadVertexBuffers() {
    // Geometry attribute declarations
    let rectangle_position = new Float32Array([
        -0.5, -0.5, 0.0,
        0.5, -0.5, 0.0,
        0.5, 0.5, 0.0,
        -0.5, 0.5, 0.0
    ]);

    let rectangle_texcoord = new Float32Array([
        0.0, 0.0,
        1.0, 0.0,
        1.0, 1.0,
        0.0, 1.0
    ]);

    let rectangle_indices = new Uint8Array([
        0, 1, 2,
        2, 3, 0
    ]);

    // VAO
    pTrail_vao = gl.createVertexArray();
    gl.bindVertexArray(pTrail_vao);

    // VBO - position
    pTrail_vbo_position = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, pTrail_vbo_position);
    gl.bufferData(gl.ARRAY_BUFFER, rectangle_position, gl.STATIC_DRAW);
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
    pTrail_vbo_texcoord = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, pTrail_vbo_texcoord);
    gl.bufferData(gl.ARRAY_BUFFER, rectangle_texcoord, gl.STATIC_DRAW);
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

    // VBO - indices
    pTrail_vbo_indices = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, pTrail_vbo_indices);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, rectangle_indices, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

    gl.bindVertexArray(null);
}

function Particle() {
    this.velocity = new Array(3);
    this.position = new Array(3);
    this.angle = 0;
    this.scale = 0;
    this.alpha = 0;
    this.wait = 0;
}

function initParticle(p, wait, pos) {
    // Movement speed
    var angle = Math.random() * Math.PI * 2;
    var height = Math.random() * 0.02;
    var speed = Math.random() * 0.01 + 0.0002;
    p.velocity[0] = Math.cos(angle) * speed;
    p.velocity[1] = height;
    p.velocity[2] = Math.sin(angle) * speed;

    //p.position[0] = Math.random() * 0.2;
    //p.position[1] = Math.random() * 0.2;
    //p.position[2] = Math.random() * 0.2;

    p.position[0] = pos[0];
    p.position[1] = pos[1];
    p.position[2] = pos[2];

    // Rotation angle
    p.angle = Math.random() * 360;
    // Size
    p.scale = Math.random() * 0.5 + 0.5;
    // Transparency
    p.alpha = 3;
    // In initial stage, vary a time for creation
    if (wait == true) {
        // Time to wait
        p.wait = Math.random() * 120;
    }
}

function pTrail_loadGLTexture() {
    pTrail_texture_particle = gl.createTexture();
    if (!pTrail_texture_particle) {
        console.log("createTexture() : Failed !!!\n");
        alert(log);
    }

    pTrail_texture_particle.image = new Image();
    if (!pTrail_texture_particle.image) {
        console.log("Failed to create Image object !!!\n");
        alert(log);
    }

    pTrail_texture_particle.image.onload = function () {
        console.log('Texture loaded successfully.')
        console.log(pTrail_texture_particle.image)

        gl.bindTexture(gl.TEXTURE_2D, pTrail_texture_particle);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, pTrail_texture_particle.image);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        // gl.generateMipmap(gl.TEXTURE_2D);
        gl.bindTexture(gl.TEXTURE_2D, null);
    }
    pTrail_texture_particle.image.src = "src\\resources\\textures\\particle.png";
}

function pTrail_display() {
    // Code
    pTrail_update();
    
    //init_gl();
    gl.depthMask(false);

    gl.enable(gl.BLEND);
    gl.blendEquation(gl.FUNC_ADD);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE);

    gl.useProgram(pTrail_shaderProgramObject);

    // Transformation
    pTrail_viewMatrix = mat4.create();
    pTrail_modelMatrix = mat4.create();
    //mat4.identity(pTrail_viewMatrix);
    //mat4.identity(pTrail_modelMatrix);

    // let eye = vec3.create();
    // let center = vec3.create();
    // let up = vec3.create();

    // eye[0] = 0.0;
    // eye[1] = 0.0;
    // eye[2] = -10.0;

    // center[0] = 100.0;
    // center[1] = 0.0;
    // center[2] = 0.0;

    // up[0] = 0.0;
    // up[1] = 1.0;
    // up[2] = 0.0;

    // mat4.lookAt(pTrail_viewMatrix, eye, center, up);
    pTrail_viewMatrix = GetCameraViewMatrix();

    // gl.uniformMatrix4fv(pTrail_projectionMatrixUniform, false, pTrail_perspectiveProjectionMatrix);
    gl.uniformMatrix4fv(pTrail_projectionMatrixUniform, false, perspectiveProjectionMatrix);
    gl.uniformMatrix4fv(pTrail_viewMatrixUniform, false, pTrail_viewMatrix);

    // Draw
    mat4.translate(pTrail_modelMatrix, pTrail_modelMatrix, [0.0, -90.0, -5.0]);
    mat4.rotateY(pTrail_modelMatrix, pTrail_modelMatrix, degToRad(90.0));
    //drawParticle(particle, pTrail_modelMatrix);
    drawArch(pTrail_arch, pTrail_modelMatrix);
    //mat4.translate(modelMatrix, modelMatrix, [0.0, 0.0, -10.0]);
    //drawArch(pTrail_arch, modelMatrix);

    gl.useProgram(null);

    // Restore the states of OpenGL
    gl.depthMask(true);
    gl.disable(gl.BLEND);

    // Double buffering
    requestAnimationFrame(pTrail_display, canvas);
}

function pTrail_update() {
    // Code
    //updateParticle(particle);
    updateArch(pTrail_arch);
}

function updateArch(pTrail_arch) {
    for (let i = 0; i < pTrail_arch.length; i++) {
        //console.log(pTrail_arch[i]);
        if(archPos[i][3] > 0.0)
        {
            archPos[i][3] -= 0.125;
        }
        // if(archPos[i][3] > 0.0)
        // {
        //     archPos[i][3] -= 0.5;
        // }
        updateParticle(pTrail_arch[i], i);
    }
}

function updateParticle(p, count) {
    for (let i = 0; i < p.length; ++i) {
        // Wait for creation
        if (p[i].wait > 0) {
            p[i].wait--;
            continue;
        }

        // Update a vertex coordinate
        p[i].position[0] += p[i].velocity[0];
        p[i].position[1] += p[i].velocity[1] / 2;
        p[i].position[2] += p[i].velocity[2];

        // Decreate Y translation
        p[i].velocity[1] -= 0.003;
        // Fading out
        p[i].alpha -= 0.03;

        if (p[i].alpha <= 0) {
            initParticle(p[i], false, archPos[count]);
        }
    }
}

function drawArch(pTrail_arch, pTrail_modelMatrix) {
    for (let i = 0; i < pTrail_arch.length; i++) {
        if (archPos[i][3] <= 0.0 && archPos[i][4] >= 0.0)
        {
            drawParticle(pTrail_arch[i], pTrail_modelMatrix);
            archPos[i][4] -= 0.125;
            // archPos[i][4] -= 0.5;
        }
    }
}

function drawParticle(p, pTrail_modelMatrix) {
    // For texture
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, pTrail_texture_particle);
    gl.uniform1i(pTrail_textureSamplerUniform, 0);

    gl.bindVertexArray(pTrail_vao);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, pTrail_vbo_indices);

    let destModelMatrix = mat4.create();
    for (let i = 0; i < p.length; ++i) {
        mat4.identity(destModelMatrix);
        if (p[i].wait <= 0) {
            mat4.translate(destModelMatrix, pTrail_modelMatrix, [p[i].position[0], p[i].position[1], p[i].position[2]]);
            // Rotate around z-axis to show the front face
            //mat4.rotateZ(pTrail_modelMatrix, pTrail_modelMatrix, degToRad(p[i].angle));
            mat4.rotateZ(destModelMatrix, destModelMatrix, p[i].angle);
            let scale = 0.5 * p[i].scale;
            mat4.scale(destModelMatrix, destModelMatrix, [scale, scale, scale]);

            gl.uniformMatrix4fv(pTrail_modelMatrixUniform, false, destModelMatrix);
            gl.uniform1f(pTrail_alphaUniform, p[i].alpha);
            gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_BYTE, 0);
        }
    }

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
    gl.bindVertexArray(null);

    // Unbind texture
    gl.bindTexture(gl.TEXTURE_2D, null);
}

function degToRad(degrees) {
    return (degrees * Math.PI / 180.0);
}

function pTrail_uninitialize() {
    // Code
    if (pTrail_shaderProgramObject) { // It can be if(pTrail_shaderProgramObject == null)
        gl.useProgram(pTrail_shaderProgramObject);

        let shaderObjects = gl.getAttachedShaders(pTrail_shaderProgramObject);
        if (shaderObjects && shaderObjects.length > 0) {
            for (let i = 0; i < shaderObjects.length; i++) {
                gl.detachShader(pTrail_shaderProgramObject, shaderObjects[i]);
                gl.deleteShader(shaderObjects[i]);
                shaderObjects[i] = null;
            }
        }

        gl.useProgram(null);

        gl.deleteProgram(pTrail_shaderProgramObject);
        pTrail_shaderProgramObject = null;
    }

    if (pTrail_texture_particle) {
        gl.deleteTexture(pTrail_texture_particle);
        pTrail_texture_particle = null;
    }

    if (pTrail_vbo_indices) {
        gl.deleteBuffer(pTrail_vbo_indices);
        pTrail_vbo_indices = null;
    }

    if (pTrail_vbo_texcoord) {
        gl.deleteBuffer(pTrail_vbo_texcoord);
        pTrail_vbo_texcoord = null;
    }

    if (pTrail_vbo_position) {
        gl.deleteBuffer(pTrail_vbo_position);
        pTrail_vbo_position = null;
    }

    if (pTrail_vao) {
        gl.deleteVertexArray(pTrail_vao);
        pTrail_vao = null;
    }
}
