var pl_shaderProgramObject = null;

var pl_vao = null;

var pl_projectionMatrixUniform;
var pl_viewMatrixUniform;
var pl_modelMatrixUniform;
var pl_alphaUniform;
var pl_textureSamplerUniform;

var pl_viewMatrix;
var pl_modelMatrix;

var pl_texture_particle = null;

var pl_particle;

function pl_initialize() {
    // Code

    // Vertex shader
    var pl_vertexShaderSourceCode =
        "#version 300 es" +
        "\n" +
        "uniform mat4 uProjectionMatrix;\n" +
        "uniform mat4 uViewMatrix;\n" +
        "uniform mat4 uModelMatrix;\n" +
        "void main(void)\n" +
        "{\n" +
        "mat4 modelViewMatrix = uViewMatrix * uModelMatrix;" +
        "gl_PointSize = 15.0;" +
        "gl_Position = uProjectionMatrix * modelViewMatrix * vec4(0.0, 0.0, 0.0, 1.0);\n" +
        "}\n";

    var pl_vertexShaderObject = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(pl_vertexShaderObject, pl_vertexShaderSourceCode);
    gl.compileShader(pl_vertexShaderObject);
    if (gl.getShaderParameter(pl_vertexShaderObject, gl.COMPILE_STATUS) == false) {
        var error = gl.getShaderInfoLog(pl_vertexShaderObject);
        if (error.length > 0) {
            var log = "Vertex Shader Compilation Error : " + error;
            alert(log);
            pl_uninitialize();
        }
    }
    else {
        console.log("Vertex Shader Compile Successfully...\n");
    }

    // Fragment shader
    var pl_fragmentShaderSourceCode =
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

    var pl_fragmentShaderObject = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(pl_fragmentShaderObject, pl_fragmentShaderSourceCode);
    gl.compileShader(pl_fragmentShaderObject);
    if (gl.getShaderParameter(pl_fragmentShaderObject, gl.COMPILE_STATUS) == false) {
        var error = gl.getShaderInfoLog(pl_fragmentShaderObject);
        if (error.length > 0) {
            var log = "Fragment Shader Compilation Error : " + error;
            alert(log);
            pl_uninitialize();
        }
    }
    else {
        console.log("Fragment Shader Compile Successfully...\n");
    }

    // Shader program
    pl_shaderProgramObject = gl.createProgram();
    gl.attachShader(pl_shaderProgramObject, pl_vertexShaderObject);
    gl.attachShader(pl_shaderProgramObject, pl_fragmentShaderObject);

    gl.linkProgram(pl_shaderProgramObject);
    if (gl.getProgramParameter(pl_shaderProgramObject, gl.LINK_STATUS) == false) {
        var error = gl.getProgramInfoLog(pl_shaderProgramObject);
        if (error.length > 0) {
            var log = "Shader Program Linking Error : " + error;
            alert(log);
            pl_uninitialize();
        }
    }
    else {
        console.log("Shader Program Linked Successfully...\n");
    }

    pl_projectionMatrixUniform = gl.getUniformLocation(pl_shaderProgramObject, "uProjectionMatrix");
    pl_viewMatrixUniform = gl.getUniformLocation(pl_shaderProgramObject, "uViewMatrix");
    pl_modelMatrixUniform = gl.getUniformLocation(pl_shaderProgramObject, "uModelMatrix");
    pl_alphaUniform = gl.getUniformLocation(pl_shaderProgramObject, "uAlpha");
    pl_textureSamplerUniform = gl.getUniformLocation(pl_shaderProgramObject, "uTextureSampler");

    //init_gl();
    //sendQuadVertexBuffers();

    // VAO
    pl_vao = gl.createVertexArray();
    gl.bindVertexArray(pl_vao);
    gl.bindVertexArray(null);

    // Create texture
    pl_loadGLTexture();

    // Create particles
    pl_particle = new Array(5000);
    for (let i = 0; i < pl_particle.length; ++i) {
        pl_particle[i] = new pl_Particle();
        pl_initParticle(pl_particle[i], true);
    }

    console.log("Particles for lanterns initialized...\n");

}

function pl_Particle() {
    this.velocity = new Array(3);
    this.position = new Array(3);
    this.angle = 0;
    this.scale = 0;
    this.alpha = 0;
    this.wait = 0;
    this.limit = 0;
}

function pl_initParticle(p, wait) {
    // Movement speed
    var angle = Math.random() * Math.PI * 2;
    var height = Math.random() * 0.01;
    var speed = Math.random() * 0.001 + 0.02;
    p.velocity[0] = Math.cos(angle) * speed;
    p.velocity[1] = height;
    p.velocity[2] = Math.sin(angle) * speed;

    p.position[0] = Math.random() * 0.2;
    p.position[1] = Math.random() * 0.2;
    p.position[2] = Math.random() * 5.2;

    // Rotation angle
    p.angle = Math.random() * 360;

    // Size
    p.scale = Math.random() * 0.5 + 0.5;

    // Transparency
    p.alpha = 1;

    p.limit = -(Math.random() * (500 - 5) + 5);
    
    // In initial stage, vary a time for creation
    if (wait == true) {
        // Time to wait
        p.wait = Math.random() * 40000;
    }
}

function pl_loadGLTexture() {
    pl_texture_particle = gl.createTexture();
    if (!pl_texture_particle) {
        console.log("createTexture() : Failed !!!\n");
        alert(log);
    }

    pl_texture_particle.image = new Image();
    if (!pl_texture_particle.image) {
        console.log("Failed to create Image object !!!\n");
        alert(log);
    }

    pl_texture_particle.image.onload = function () {
        console.log('Texture loaded successfully.')
        console.log(pl_texture_particle.image)

        gl.bindTexture(gl.TEXTURE_2D, pl_texture_particle);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, pl_texture_particle.image);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        // gl.generateMipmap(gl.TEXTURE_2D);
        gl.bindTexture(gl.TEXTURE_2D, null);
    }
    pl_texture_particle.image.src = "src\\resources\\textures\\particle-lantern.png";
}

function pl_display() {
    // Code
    pl_update();

    gl.depthMask(false);

    gl.enable(gl.BLEND);
    gl.blendEquation(gl.FUNC_ADD);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE);

    //gl.pointSize(50.0);
    gl.enable(gl.PROGRAM_POINT_SIZE);
    gl.enable(gl.POINT_SPRITE);

    gl.useProgram(pl_shaderProgramObject);

    // Transformation
    pl_viewMatrix = mat4.create();
    pl_modelMatrix = mat4.create();
    
    pl_viewMatrix = GetCameraViewMatrix();

    gl.uniformMatrix4fv(pl_projectionMatrixUniform, false, perspectiveProjectionMatrix);
    gl.uniformMatrix4fv(pl_viewMatrixUniform, false, pl_viewMatrix);

    mat4.translate(pl_modelMatrix, pl_modelMatrix, [989.14013063897 + 40.70000000000003 + test_translate_X, 107.66411107641261 + -412.5000000000023 + test_translate_Y, 390.70468057373 + 226.59999999999923 + test_translate_Z]);
    // 40.70000000000003 , -412.5000000000023 , 226.59999999999923
    // Draw
    pl_drawParticle(pl_particle, pl_modelMatrix);

    gl.useProgram(null);

    gl.depthMask(true);
    gl.disable(gl.BLEND);
    gl.disable(gl.PROGRAM_POINT_SIZE);
    gl.disable(gl.POINT_SPRITE);
}

function pl_update() {
    // Code
    pl_updateParticle(pl_particle);
}

function pl_updateParticle(p) {
    for (var i = 0; i < p.length; ++i) {
        // Wait for creation
        if (p[i].wait > 0) {
            p[i].wait--;
            continue;
        }

        // Update a vertex coordinate
        // p[i].position[0] += p[i].velocity[0];
        // p[i].position[1] -= p[i].velocity[1];
        // p[i].position[2] += p[i].velocity[2];

        p[i].position[0] += 0.001;
        p[i].position[1] += 0.9;
        p[i].position[2] += p[i].limit / 500.0;
        
        // Decreate Y translation
        // p[i].velocity[0] -= 0.0003;
        // p[i].velocity[1] -= 0.0005;
        // p[i].velocity[2] -= 0.0000001;
    }
}

function pl_drawParticle(p, pl_modelMatrix) {
    // For texture
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, pl_texture_particle);
    gl.uniform1i(pl_textureSamplerUniform, 0);

    gl.bindVertexArray(pl_vao);

    let destModelMatrix = mat4.create();
    for (var i = 0; i < p.length; ++i) {
        mat4.identity(destModelMatrix);
        if (p[i].wait <= 0) {
            mat4.translate(destModelMatrix, pl_modelMatrix, [p[i].position[0], p[i].position[1], p[i].position[2]]);
            

            gl.uniformMatrix4fv(pl_modelMatrixUniform, false, destModelMatrix);
            gl.uniform1f(pl_alphaUniform, p[i].alpha);
            gl.drawArrays(gl.POINTS, 0, 1);
        }
    }

    gl.bindVertexArray(null);

    // Unbind texture
    gl.bindTexture(gl.TEXTURE_2D, null);
}

function pl_degToRad(degrees) {
    return (degrees * Math.PI / 180.0);
}

function pl_uninitialize() {
    // Code
    if (pl_shaderProgramObject) { // It can be if(pl_shaderProgramObject == null)
        gl.useProgram(pl_shaderProgramObject);

        var shaderObjects = gl.getAttachedShaders(pl_shaderProgramObject);
        if (shaderObjects && shaderObjects.length > 0) {
            for (let i = 0; i < shaderObjects.length; i++) {
                gl.detachShader(pl_shaderProgramObject, shaderObjects[i]);
                gl.deleteShader(shaderObjects[i]);
                shaderObjects[i] = null;
            }
        }

        gl.useProgram(null);

        gl.deleteProgram(pl_shaderProgramObject);
        pl_shaderProgramObject = null;
    }

    if (pl_texture_particle) {
        gl.deleteTexture(pl_texture_particle);
        pl_texture_particle = null;
    }

    // if (vbo_indices) {
    //     gl.deleteBuffer(vbo_indices);
    //     vbo_indices = null;
    // }

    // if (vbo_normal) {
    //     gl.deleteBuffer(vbo_normal);
    //     vbo_normal = null;
    // }

    // if (vbo_texcoord) {
    //     gl.deleteBuffer(vbo_texcoord);
    //     vbo_texcoord = null;
    // }

    // if (vbo_position) {
    //     gl.deleteBuffer(vbo_position);
    //     vbo_position = null;
    // }

    if (pl_vao) {
        gl.deleteVertexArray(pl_vao);
        pl_vao = null;
    }
}