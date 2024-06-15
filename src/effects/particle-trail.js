var pTrail_shaderProgramObject = null;

var pTrail_vao = null;

var pTrail_projectionMatrixUniform;
var pTrail_viewMatrixUniform;
var pTrail_modelMatrixUniform;
var pTrail_alphaUniform;
var pTrail_textureSamplerUniform;

var pTrail_viewMatrix;
var pTrail_modelMatrix;

var pTrail_texture_particle = null;

//var particle;
var pTrail_arch;
var pTrail_radius = 80.0;

function pTrail_initialize() {
    // Code

    // Vertex shader
    let vertexShaderSourceCode =
        "#version 300 es" +
        "\n" +
        "uniform mat4 uProjectionMatrix;\n" +
        "uniform mat4 uViewMatrix;\n" +
        "uniform mat4 uModelMatrix;\n" +
        "void main(void)\n" +
        "{\n" +
        "mat4 modelViewMatrix = uViewMatrix * uModelMatrix;" +
        "gl_PointSize = 20.0;" +
        "gl_Position = uProjectionMatrix * modelViewMatrix * vec4(0.0, 0.0, 0.0, 1.0);\n" +
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
        "uniform sampler2D uTextureSampler;\n" +
        "uniform float uAlpha;\n" +
        "out vec4 FragColor;\n" +
        "void main(void)\n" +
        "{\n" +
        "FragColor.rgb = texture(uTextureSampler, gl_PointCoord).rgb;\n" +
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

    // VAO
    pTrail_vao = gl.createVertexArray();
    gl.bindVertexArray(pTrail_vao);
    gl.bindVertexArray(null);

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

        pTrail_arch[i] = new Array(2);
        initFountain(pTrail_arch[i], pos);
    }

    console.log("Particles initialized");
}

function initFountain(f, pos) {
    //f = new Array(5);
    for (let i = 0; i < f.length; ++i) {
        f[i] = new Particle();
        initParticle(f[i], true, pos);
    }
}

function Particle() {
    this.velocity = new Array(3);
    this.position = new Array(3);
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

    p.position[0] = pos[0];
    p.position[1] = pos[1];
    p.position[2] = pos[2];

    // Transparency
    p.alpha = 4;

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

    gl.enable(gl.PROGRAM_POINT_SIZE);
    gl.enable(gl.POINT_SPRITE);

    gl.useProgram(pTrail_shaderProgramObject);

    // Transformation
    pTrail_viewMatrix = mat4.create();
    pTrail_modelMatrix = mat4.create();

    pTrail_viewMatrix = GetCameraViewMatrix();

    gl.uniformMatrix4fv(pTrail_projectionMatrixUniform, false, perspectiveProjectionMatrix);
    gl.uniformMatrix4fv(pTrail_viewMatrixUniform, false, pTrail_viewMatrix);

    // Draw
    mat4.translate(pTrail_modelMatrix, pTrail_modelMatrix, [0.0, -90.0, -5.0]);
    mat4.rotateY(pTrail_modelMatrix, pTrail_modelMatrix, degToRad(90.0));
    drawArch(pTrail_arch, pTrail_modelMatrix);

    gl.useProgram(null);

    // Restore the states of OpenGL
    gl.depthMask(true);
    gl.disable(gl.BLEND);
    gl.disable(gl.PROGRAM_POINT_SIZE);
    gl.disable(gl.POINT_SPRITE);

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

        if(i == pTrail_arch.length -1){
            bool_start_ptrail_update = false;
            //initParticle();
        }
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

    let destModelMatrix = mat4.create();
    for (let i = 0; i < p.length; ++i) {
        mat4.identity(destModelMatrix);
        if (p[i].wait <= 0) {
            mat4.translate(destModelMatrix, pTrail_modelMatrix, [p[i].position[0], p[i].position[1], p[i].position[2]]);

            gl.uniformMatrix4fv(pTrail_modelMatrixUniform, false, destModelMatrix);
            gl.uniform1f(pTrail_alphaUniform, p[i].alpha);
            
            gl.drawArrays(gl.POINTS, 0, 1);
        }
    }

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

    if (pTrail_vao) {
        gl.deleteVertexArray(pTrail_vao);
        pTrail_vao = null;
    }
}