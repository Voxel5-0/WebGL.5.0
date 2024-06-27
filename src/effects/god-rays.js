const GODRAYS_SCENE_FBO_WIDTH = 512;
const GODRAYS_SCENE_FBO_HEIGHT = 512;

//FBOs
var godRays_scene_fbo = null;
var godRays_occlusion_fbo = null;
var godRays_godrays_fbo = null;

//1st shadderprogram object final
var godrays_shaderProgramObject_final;

var gd_perspectiveProjectionMatrix = mat4.create();
var godrays_sceneSamplerUniform_final;
var godrays_godraysSamplerUniform_final;

// scene without light
var godrays_shaderProgramObject_scene;
var godrays_viewMatrixUniform_scene;
var godrays_modelMatrixUniform_scene;
var godrays_projectionMatrixUniform_scene;

// Your occlusion
var godrays_shaderProgramObject_occlusion;
var godrays_viewMatrixUniform_occlusion;
var godrays_modelMatrixUniform_occlusion;
var godrays_projectionMatrixUniform_occlusion;
var godrays_colorShowUniform_occlusion;

//***** Shaders for Godrays *****
var godrays_shaderProgramObject_godrays;
var godrays_occlusionTextureSamplerUniform_Godrays;
var godrays_sceneTextureUniform_godrays;
var godrays_lightPositionUniform_godrays;

var godrays_decayUniform_godrays;
var godrays_exposureUniform_godrays;
var godrays_densityUniform_godrays;
var godrays_weightUniform_godrays;
var godrays_numSamplesUniform_godrays;

//*****ADD YOUR VAO AND VBO*****
// scene related vao and vbo
var vao_square = null;
var vbo_square_position = null;
var vbo_square_texcoord = null;
var sphere = null;

var gd_mvpMatrixUniform;
var trial_data;
var gd_shaderProgramObject;


//call this to initialize godrays
function initializeGodrays() {
    godRays_scene_fbo = GenerateFramebuffer(1920, 1080);
    godRays_occlusion_fbo = GenerateFramebuffer(1920, 1080);
    godRays_godrays_fbo = GenerateFramebuffer(1920, 1080);

    initializeFinalShader();
    if (godRays_scene_fbo != null) {
        initializeSceneShader();
    }
    if (godRays_occlusion_fbo != null) {
        initializeGodraysShader();
    }
    if (godRays_godrays_fbo != null) {
        initializeOcclusionShader();
    }

    // call any vao and vbos needed here 
    var square_position = new Float32Array
        (
            [
				1.0, 1.0, 0.0,
                -1.0, 1.0, 0.0,
                -1.0, -1.0, 0.0,
                1.0, -1.0, 0.0
            ]
        );
    var square_texcoord = new Float32Array
        (
            [

                1.0, 1.0,
                0.0, 1.0,
                0.0, 0.0,
                1.0, 0.0,

            ]
        );


    // vao square
    vao_square = gl.createVertexArray();
    gl.bindVertexArray(vao_square);

    // vbo for position
    vbo_square_position = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo_square_position);
    // prepare triangle vertices array for glbuffer data
    gl.bufferData(gl.ARRAY_BUFFER, square_position, gl.STATIC_DRAW);
    gl.vertexAttribPointer(WebGLMacros.AMC_ATTRIBUTE_POSITION, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(WebGLMacros.AMC_ATTRIBUTE_POSITION);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    vbo_square_texcoord = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo_square_texcoord);
    // prepare triangle vertices array for glbuffer data
    gl.bufferData(gl.ARRAY_BUFFER, square_texcoord, gl.STATIC_DRAW);
    gl.vertexAttribPointer(WebGLMacros.AMC_ATTRIBUTE_TEXTURE0, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(WebGLMacros.AMC_ATTRIBUTE_TEXTURE0);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    gl.bindVertexArray(null);

    sphere = new Mesh();
    makeSphere(sphere, 2.0, 30, 30);

    trial_data = InitializeModelRenderer("src/resources/models/ship.obj")
	trial_data = InitializeModelRenderer("src\\resources\\models\\Rapunzel\\Rapunzel_Pose1\\Rapunzel_Pose1.obj");

    gl.clearDepth(1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
}

function initializeFinalShader() {
    var godrays_vertexShaderSourceCode_final = (
		"#version 300 es" +
		"\n" +
		"in vec4 aPosition;\n" +
		"in vec2 aTexCoord;\n" +
		"out vec2 oTexCoord;\n" +
		"void main(void)\n" +
		"{\n" +
		"gl_Position=aPosition;\n" +
		"oTexCoord=aTexCoord;\n" +
		"}");

	var godrays_vertexShaderObject_final = gl.createShader(gl.VERTEX_SHADER);
	gl.shaderSource(godrays_vertexShaderObject_final, godrays_vertexShaderSourceCode_final);
	gl.compileShader(godrays_vertexShaderObject_final);

	if (!gl.getShaderParameter(godrays_vertexShaderObject_final, gl.COMPILE_STATUS)) {
		var error = gl.getShaderInfoLog(godrays_vertexShaderObject_final);
		if (error.length > 0) {
			var log = "Godrays Final Vertex Shader Compilation Error : " + error;
			alert(log);
			godrays_uninitialize();
		}
	}
	else {
		console.log("Godrays Final Vertex Shader compiled successfully.")
	}

	var godrays_fragmentShaderSourceCode_final = (
		"#version 300 es" +
		"\n" +
		"precision highp float;\n" +
		"in vec2 oTexCoord;\n" +
		"uniform sampler2D uSceneTextureSampler;\n" +
		"uniform sampler2D uGodraysTextureSampler;\n" +
		"out vec4 FragColor;\n" +
		"void main(void)\n" +
		"{\n" +
		"vec4 sceneColor=texture(uSceneTextureSampler,oTexCoord);\n" +
		"vec4 godraysColor=texture(uGodraysTextureSampler,oTexCoord);\n" +
		"FragColor=sceneColor+godraysColor;\n" +
		"}\n");

	var godrays_fragmentShaderObject_final = gl.createShader(gl.FRAGMENT_SHADER);
	gl.shaderSource(godrays_fragmentShaderObject_final, godrays_fragmentShaderSourceCode_final);
	gl.compileShader(godrays_fragmentShaderObject_final);

	if (!gl.getShaderParameter(godrays_fragmentShaderObject_final, gl.COMPILE_STATUS)) {
		var error = gl.getShaderInfoLog(godrays_fragmentShaderObject_final);
		if (error.length > 0) {
			var log = "Godrays Final Fragment Shader Compilation Error : " + error;
			alert(log);
			godrays_uninitialize();
		}
	}
	else {
		console.log("Godrays Final Fragment Shader compiled successfully.")
	}

	// SHADER PROGRAM
	godrays_shaderProgramObject_final = gl.createProgram();
	gl.attachShader(godrays_shaderProgramObject_final, godrays_vertexShaderObject_final);
	gl.attachShader(godrays_shaderProgramObject_final, godrays_fragmentShaderObject_final);

	gl.bindAttribLocation(godrays_shaderProgramObject_final, WebGLMacros.AMC_ATTRIBUTE_POSITION, "aPosition");
	gl.bindAttribLocation(godrays_shaderProgramObject_final, WebGLMacros.AMC_ATTRIBUTE_TEXTURE0, "aTexCoord");

	gl.linkProgram(godrays_shaderProgramObject_final);

	if (!gl.getProgramParameter(godrays_shaderProgramObject_final, gl.LINK_STATUS)) {
		var error = gl.getProgramInfoLog(godrays_shaderProgramObject_final);
		if (error.length > 0) {
			var log = "Shader Linking Error : " + error;
			alert(log);
			godrays_uninitialize();
		}
	} else {
		console.log("Shader Linked successfully.");
	}

	godrays_sceneSamplerUniform_final = gl.getUniformLocation(godrays_shaderProgramObject_final, "uSceneTextureSampler");
	godrays_godraysSamplerUniform_final = gl.getUniformLocation(godrays_shaderProgramObject_final, "uGodraysTextureSampler");
}

function initializeSceneShader() {
	var godrays_vertexShaderSourceCode_scene = (
		"#version 300 es" +
		"\n" +
		"precision highp float;\n" +
		"in vec4 aPosition;\n" +
		"in vec4 aColor;\n" +
		"uniform mat4 uViewMatrix;\n" +
		"uniform mat4 uModelMatrix;\n" +
		"uniform mat4 uProjectionMatrix;\n" +
		"out vec4 oColor ;\n" +
		"void main(void)\n" +
		"{\n" +
		"gl_Position=uProjectionMatrix*uViewMatrix*uModelMatrix*aPosition;\n" +
		"oColor=aColor;\n" +
		"}");

	var godrays_vertexShaderObject_scene = gl.createShader(gl.VERTEX_SHADER);
	gl.shaderSource(godrays_vertexShaderObject_scene, godrays_vertexShaderSourceCode_scene);
	gl.compileShader(godrays_vertexShaderObject_scene);

	if (!gl.getShaderParameter(godrays_vertexShaderObject_scene, gl.COMPILE_STATUS)) {
		var error = gl.getShaderInfoLog(godrays_vertexShaderObject_scene);
		if (error.length > 0) {
			var log = "Godrays scene Vertex Shader Compilation Error : " + error;
			alert(log);
			godrays_uninitialize();
		}
	}
	else {
		console.log("Godrays scene Vertex Shader compiled successfully.")
	}

	var godrays_fragmentShaderSourceCode_scene = (
		"#version 300 es" +
		"\n" +
		"precision highp float;\n" +
		"in vec4 oColor;\n" +
		"out vec4 FragColor;\n" +
		"void main(void)\n" +
		"{\n" +
		"FragColor=vec4(1.0,1.0,1.0,1.0);\n" +
		"}\n");

	var godrays_fragmentShaderObject_scene = gl.createShader(gl.FRAGMENT_SHADER);
	gl.shaderSource(godrays_fragmentShaderObject_scene, godrays_fragmentShaderSourceCode_scene);
	gl.compileShader(godrays_fragmentShaderObject_scene);

	if (!gl.getShaderParameter(godrays_fragmentShaderObject_scene, gl.COMPILE_STATUS)) {
		var error = gl.getShaderInfoLog(godrays_fragmentShaderObject_scene);
		if (error.length > 0) {
			var log = "Godrays scene Fragment Shader Compilation Error : " + error;
			alert(log);
			godrays_uninitialize();
		}
	}
	else {
		console.log("Godrays scene Fragment Shader compiled successfully.")
	}

	// SHADER PROGRAM
	godrays_shaderProgramObject_scene = gl.createProgram();
	gl.attachShader(godrays_shaderProgramObject_scene, godrays_vertexShaderObject_scene);
	gl.attachShader(godrays_shaderProgramObject_scene, godrays_fragmentShaderObject_scene);

	gl.bindAttribLocation(godrays_shaderProgramObject_scene, WebGLMacros.AMC_ATTRIBUTE_POSITION, "aPosition");
	gl.bindAttribLocation(godrays_shaderProgramObject_scene, WebGLMacros.AMC_ATTRIBUTE_COLOR, "aColor");

	gl.linkProgram(godrays_shaderProgramObject_scene);

	if (!gl.getProgramParameter(godrays_shaderProgramObject_scene, gl.LINK_STATUS)) {
		var error = gl.getProgramInfoLog(godrays_shaderProgramObject_scene);
		if (error.length > 0) {
			var log = "Godrays Shader scene Linking Error : " + error;
			alert(log);
			godrays_uninitialize();
		}
	} else {
		console.log("Godrays Shader scene Linked successfully.");
	}

	godrays_viewMatrixUniform_scene = gl.getUniformLocation(godrays_shaderProgramObject_scene, "uViewMatrix");
	godrays_modelMatrixUniform_scene = gl.getUniformLocation(godrays_shaderProgramObject_scene, "uModelMatrix");
	godrays_projectionMatrixUniform_scene = gl.getUniformLocation(godrays_shaderProgramObject_scene, "uProjectionMatrix");


}

function initializeOcclusionShader() {
	var godrays_vertexShaderSourceCode_occlusion = (
		"#version 300 es" +
		"\n" +
		"precision highp float;\n" +
		"in vec4 aPosition;\n" +
		"uniform mat4 uViewMatrix;\n" +
		"uniform mat4 uModelMatrix;\n" +
		"uniform mat4 uProjectionMatrix;\n" +
		"void main(void)\n" +
		"{\n" +
		"gl_Position=uProjectionMatrix*uViewMatrix*uModelMatrix*aPosition;\n" +
		"}");

	var godrays_vertexShaderObject_occlusion = gl.createShader(gl.VERTEX_SHADER);
	gl.shaderSource(godrays_vertexShaderObject_occlusion, godrays_vertexShaderSourceCode_occlusion);
	gl.compileShader(godrays_vertexShaderObject_occlusion);

	if (!gl.getShaderParameter(godrays_vertexShaderObject_occlusion, gl.COMPILE_STATUS)) {
		var error = gl.getShaderInfoLog(godrays_vertexShaderObject_occlusion);
		if (error.length > 0) {
			var log = "Godrays Occlusion Vertex Shader Compilation Error : " + error;
			alert(log);
			godrays_uninitialize();
		}
	}
	else {
		console.log("Godrays Occlusion Vertex Shader compiled successfully.")
	}

	var godrays_fragmentShaderSourceCode_occlusion = (
		"#version 300 es" +
		"\n" +
		"precision highp float;\n" +
		"uniform int uColorShow;\n" +
		"out vec4 FragColor;\n" +
		"void main(void)\n" +
		"{\n" +
		"if(uColorShow == 1)\n" +
		"{\n" +
		"    FragColor=vec4(1.0,1.0,1.0,1.0);\n" +
		"}\n" +
		"else\n" +
		"{\n" +
		"    FragColor=vec4(0.0,0.0,0.0,1.0);\n" +
		"}\n" +
		"}\n");

	var godrays_fragmentShaderObject_occlusion = gl.createShader(gl.FRAGMENT_SHADER);
	gl.shaderSource(godrays_fragmentShaderObject_occlusion, godrays_fragmentShaderSourceCode_occlusion);
	gl.compileShader(godrays_fragmentShaderObject_occlusion);

	if (!gl.getShaderParameter(godrays_fragmentShaderObject_occlusion, gl.COMPILE_STATUS)) {
		var error = gl.getShaderInfoLog(godrays_fragmentShaderObject_occlusion);
		if (error.length > 0) {
			var log = "Godrays Occlusion Fragment Shader Compilation Error : " + error;
			alert(log);
			godrays_uninitialize();
		}
	}
	else {
		console.log("Godrays Occlusion Frwagment Shader compiled successfully.")
	}

	// Shader Program
	godrays_shaderProgramObject_occlusion = gl.createProgram();
	gl.attachShader(godrays_shaderProgramObject_occlusion, godrays_vertexShaderObject_occlusion);
	gl.attachShader(godrays_shaderProgramObject_occlusion, godrays_fragmentShaderObject_occlusion);

	gl.bindAttribLocation(godrays_shaderProgramObject_occlusion, WebGLMacros.AMC_ATTRIBUTE_POSITION, "aPosition");

	gl.linkProgram(godrays_shaderProgramObject_occlusion);

	if (!gl.getProgramParameter(godrays_shaderProgramObject_occlusion, gl.LINK_STATUS)) {
		var error = gl.getProgramInfoLog(godrays_shaderProgramObject_occlusion);
		if (error.length > 0) {
			var log = "Godrays Shader occlusion Linking Error : " + error;
			alert(log);
			godrays_uninitialize();
		}
	} else {
		console.log("Godrays Shader occlusion Linked successfully.");
	}

	godrays_viewMatrixUniform_occlusion = gl.getUniformLocation(godrays_shaderProgramObject_occlusion, "uViewMatrix");
	godrays_modelMatrixUniform_occlusion = gl.getUniformLocation(godrays_shaderProgramObject_occlusion, "uModelMatrix");
	godrays_projectionMatrixUniform_occlusion = gl.getUniformLocation(godrays_shaderProgramObject_occlusion, "uProjectionMatrix");
	godrays_colorShowUniform_occlusion = gl.getUniformLocation(godrays_shaderProgramObject_occlusion, "uColorShow");
}

function initializeGodraysShader() {
	var godrays_vertexShaderSourceCode_godrays = (
		"#version 300 es" +
		"\n" +
		"in vec4 aPosition;\n" +
		"in vec2 aTexCoord;\n" +
		"out vec2 oTexCoord;\n" +
		"void main(void)\n" +
		"{\n" +
		"gl_Position=aPosition;\n" +
		"oTexCoord=aTexCoord;\n" +
		"}");

	var godrays_vertexShaderObject_godrays = gl.createShader(gl.VERTEX_SHADER);
	gl.shaderSource(godrays_vertexShaderObject_godrays, godrays_vertexShaderSourceCode_godrays);
	gl.compileShader(godrays_vertexShaderObject_godrays);

	if (!gl.getShaderParameter(godrays_vertexShaderObject_godrays, gl.COMPILE_STATUS)) {
		var error = gl.getShaderInfoLog(godrays_vertexShaderObject_godrays);
		if (error.length > 0) {
			var log = "Godrays godrays Vertex Shader Compilation Error : " + error;
			alert(log);
			godrays_uninitialize();
		}
	}
	else {
		console.log("Godrays godrays Vertex Shader compiled successfully.")
	}

	var godrays_fragmentShaderSourceCode_godrays = (
		"#version 300 es" +
		"\n" +
		"precision highp float;\n" +
		"in vec2 oTexCoord;\n" +
		"uniform sampler2D uOcclusionTextureSampler;\n" +
		"uniform sampler2D uSceneTextureSampler;\n" +
		"uniform vec2 ulightPositionOnScreen;\n" +
		"uniform float uDecay;\n" +
		"uniform float uExposure;\n" +
		"uniform float uDensity;\n" +
		"uniform float uWeight;\n" +
		"uniform int uNUM_SAMPLES;\n" +
		"out vec4 FragColor;\n" +
		"void main()\n" +
		"{\n" +
		"    vec2 tc = oTexCoord;\n" +
		"    vec2 deltaTexCoord = tc - ulightPositionOnScreen;\n" +
		"    deltaTexCoord *= 1.0 / float(uNUM_SAMPLES) * uDensity;\n" +
		"    float illuminationDecay = 1.0;\n" +
		"    vec4 color = texture(uOcclusionTextureSampler, tc) * 0.4;\n" +
		"    for (int i = 0; i < uNUM_SAMPLES; i++)\n" +
		"    {\n" +
		"        tc -= deltaTexCoord;\n" +
		"        vec4 temp = texture(uOcclusionTextureSampler, tc) * 0.4;\n" +
		"        temp *= illuminationDecay * uWeight;\n" +
		"        color += temp;\n" +
		"        illuminationDecay *= uDecay;\n" +
		"    }\n" +
		"	vec4 realColor = texture(uSceneTextureSampler, oTexCoord);\n" +
		"	FragColor = ((vec4((vec3(color.r, color.g, color.b) * uExposure), 1)) + (realColor*(1.1)));\n" +
		"}\n");

	var godrays_fragmentShaderObject_godrays = gl.createShader(gl.FRAGMENT_SHADER);
	gl.shaderSource(godrays_fragmentShaderObject_godrays, godrays_fragmentShaderSourceCode_godrays);
	gl.compileShader(godrays_fragmentShaderObject_godrays);

	if (!gl.getShaderParameter(godrays_fragmentShaderObject_godrays, gl.COMPILE_STATUS)) {
		var error = gl.getShaderInfoLog(godrays_fragmentShaderObject_godrays);
		if (error.length > 0) {
			var log = "Godrays godrays Fragment Shader Compilation Error : " + error;
			alert(log);
			godrays_uninitialize();
		}
	}
	else {
		console.log("Godrays godrays Fragment Shader compiled successfully.")
	}

	// SHADER PROGRAM
	godrays_shaderProgramObject_godrays = gl.createProgram();
	gl.attachShader(godrays_shaderProgramObject_godrays, godrays_vertexShaderObject_godrays);
	gl.attachShader(godrays_shaderProgramObject_godrays, godrays_fragmentShaderObject_godrays);

	gl.bindAttribLocation(godrays_shaderProgramObject_godrays, WebGLMacros.AMC_ATTRIBUTE_POSITION, "aPosition");
	gl.bindAttribLocation(godrays_shaderProgramObject_godrays, WebGLMacros.AMC_ATTRIBUTE_TEXTURE0, "aTexCoord");

	gl.linkProgram(godrays_shaderProgramObject_godrays);

	if (!gl.getProgramParameter(godrays_shaderProgramObject_godrays, gl.LINK_STATUS)) {
		var error = gl.getProgramInfoLog(godrays_shaderProgramObject_godrays);
		if (error.length > 0) {
			var log = "Shader godrays Linking Error : " + error;
			alert(log);
			godrays_uninitialize();
		}
	} else {
		console.log("Shader godrays Linked successfully.");
	}

	godrays_occlusionTextureSamplerUniform_godrays = gl.getUniformLocation(godrays_shaderProgramObject_godrays, "uOcclusionTextureSampler");
	godrays_sceneTextureUniform_godrays = gl.getUniformLocation(godrays_shaderProgramObject_godrays, "uSceneTextureSampler");
	godrays_lightPositionUniform_godrays = gl.getUniformLocation(godrays_shaderProgramObject_godrays, "ulightPositionOnScreen");
	godrays_decayUniform_godrays = gl.getUniformLocation(godrays_shaderProgramObject_godrays, "uDecay");
	godrays_exposureUniform_godrays = gl.getUniformLocation(godrays_shaderProgramObject_godrays, "uExposure");
	godrays_densityUniform_godrays = gl.getUniformLocation(godrays_shaderProgramObject_godrays, "uDensity");
	godrays_weightUniform_godrays = gl.getUniformLocation(godrays_shaderProgramObject_godrays, "uWeight");
	godrays_numSamplesUniform_godrays = gl.getUniformLocation(godrays_shaderProgramObject_godrays, "uNUM_SAMPLES");

}

function godrays_resize(gd_width, gd_height) {
	if (gd_height == 0)
		gd_height = 1;

	//set viewport
	gl.viewport(0.0, 0.0, gd_width, gd_height);

	//set perspective projection
	mat4.perspective(gd_perspectiveProjectionMatrix, 45.0, gd_width / gd_height, 0.1, 100.0);
}

function godrays_display_final()
{
    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    gl.useProgram(godrays_shaderProgramObject_final);

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.activeTexture(gl.TEXTURE0);

    gl.bindTexture(gl.TEXTURE_2D, godRays_scene_fbo.cbo);

    gl.uniform1i(godrays_sceneSamplerUniform_final, 0);

    gl.activeTexture(gl.TEXTURE1);

    gl.bindTexture(gl.TEXTURE_2D, godRays_godrays_fbo.cbo);

    gl.uniform1i(godrays_godraysSamplerUniform_final, 1);

    gl.bindVertexArray(vao_square);
    gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
    gl.bindVertexArray(null);

    gl.useProgram(null);

}

//make changes in this function
function godrays_display_scene() {
    //do not include light source in this function
    gl.bindFramebuffer(gl.FRAMEBUFFER, godRays_scene_fbo.fbo);

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.useProgram(godrays_shaderProgramObject_scene);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    //model and view matrix
    var godrays_viewMatrix = mat4.create();
    var godrays_modelMatrix = mat4.create();

    mat4.translate(godrays_modelMatrix,godrays_modelMatrix,[0.0,0.0,-10.0]);

    //uniform call
    gl.uniformMatrix4fv(godrays_projectionMatrixUniform_scene, false, gd_perspectiveProjectionMatrix);
    gl.uniformMatrix4fv(godrays_viewMatrixUniform_scene, false, godrays_viewMatrix);
    gl.uniformMatrix4fv(godrays_modelMatrixUniform_scene, false, godrays_modelMatrix);

    //draw call
    ModelRenderer(trial_data);

    gl.useProgram(null);

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
}

//make changes in this function
function godrays_update() {

}

//make changes in this function
function godrays_display_scene_Occlusion() {
    //do not include light source in this function
    gl.bindFramebuffer(gl.FRAMEBUFFER, godRays_occlusion_fbo.fbo);

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.useProgram(godrays_shaderProgramObject_occlusion);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    var godrays_viewMatrix = mat4.create();
    var godrays_modelMatrix = mat4.create();
    // ***** Light ******
    //perform translation for light
    mat4.translate(godrays_modelMatrix, godrays_modelMatrix, [0.0, 5.0, -15.0])

    //uniform for light
    gl.uniformMatrix4fv(godrays_projectionMatrixUniform_occlusion, false, gd_perspectiveProjectionMatrix);
    gl.uniformMatrix4fv(godrays_viewMatrixUniform_occlusion, false, godrays_viewMatrix);
    gl.uniformMatrix4fv(godrays_modelMatrixUniform_occlusion, false, godrays_modelMatrix);
    gl.uniform1i(godrays_colorShowUniform_occlusion, 1)

    //draw light source

    sphere.draw();

    gl.uniform1i(godrays_colorShowUniform_occlusion, 0);
    //light source ends

    //***enter code same as in above function*** for display scene
	var godrays_viewMatrix = mat4.create();
    var godrays_modelMatrix = mat4.create();

    mat4.translate(godrays_modelMatrix,godrays_modelMatrix,[0.0,0.0,-10.0]);

    //uniform call
    gl.uniformMatrix4fv(godrays_projectionMatrixUniform_scene, false, gd_perspectiveProjectionMatrix);
    gl.uniformMatrix4fv(godrays_viewMatrixUniform_scene, false, godrays_viewMatrix);
    gl.uniformMatrix4fv(godrays_modelMatrixUniform_scene, false, godrays_modelMatrix);

    //draw call
    ModelRenderer(trial_data);

    gl.useProgram(null);

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
}

function godrays_display_godrays() {
    //do not include light source in this function
    gl.bindFramebuffer(gl.FRAMEBUFFER, godRays_godrays_fbo.fbo);

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.useProgram(godrays_shaderProgramObject_godrays);

    gl.activeTexture(gl.TEXTURE0);

    gl.bindTexture(gl.TEXTURE_2D, godRays_occlusion_fbo.cbo);

    gl.uniform1i(godrays_occlusionTextureSamplerUniform_Godrays, 0);

    gl.activeTexture(gl.TEXTURE1);

    gl.bindTexture(gl.TEXTURE_2D, godRays_scene_fbo.cbo);

    gl.uniform1i(godrays_sceneTextureUniform_godrays, 1);

    var godrays_decay = 0.968;
	var godrays_exposure = 0.2;
	var godrays_density = 0.92;
	var godrays_weight = 0.587;
	var godrays_numsamples = 100;

    gl.uniform2fv(godrays_lightPositionUniform_godrays, [0.5, 0.8]);
    gl.uniform1f(godrays_decayUniform_godrays, godrays_decay);
    gl.uniform1f(godrays_exposureUniform_godrays, godrays_exposure);
    gl.uniform1f(godrays_densityUniform_godrays, godrays_density);
    gl.uniform1f(godrays_weightUniform_godrays, godrays_weight);
    gl.uniform1i(godrays_numSamplesUniform_godrays, godrays_numsamples);

    gl.bindVertexArray(vao_square);
    gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
    gl.bindVertexArray(null);

gl.useProgram(null);
gl.bindFramebuffer(gl.FRAMEBUFFER, null);

}

function godrays_uninitialize() {
    if (godrays_shaderProgramObject_final) {
        gl.useProgram(godrays_shaderProgramObject_final)
        var shaderObjects = gl.getAttachedShaders(godrays_shaderProgramObject_final);
        if (shaderObjects && shaderObjects.length > 0) {
            for (let i = 0; i < shaderObjects.length; i++) {
                gl.detachShader(godrays_shaderProgramObject_final, shaderObjects[i]);
                gl.deleteShader(shaderObjects[i]);
                shaderObjects[i] = null;
            }
        }
        gl.useProgram(null);
        gl.deleteProgram(godrays_shaderProgramObject_final);
        godrays_shaderProgramObject_final = null;
    }
    if (godrays_shaderProgramObject_scene) {
        gl.useProgram(godrays_shaderProgramObject_scene)
        var shaderObjects = gl.getAttachedShaders(godrays_shaderProgramObject_scene);
        if (shaderObjects && shaderObjects.length > 0) {
            for (let i = 0; i < shaderObjects.length; i++) {
                gl.detachShader(godrays_shaderProgramObject_scene, shaderObjects[i]);
                gl.deleteShader(shaderObjects[i]);
                shaderObjects[i] = null;
            }
        }
        gl.useProgram(null);
        gl.deleteProgram(godrays_shaderProgramObject_scene);
        godrays_shaderProgramObject_scene = null;
    }
    if (godrays_shaderProgramObject_occlusion) {
        gl.useProgram(godrays_shaderProgramObject_occlusion)
        var shaderObjects = gl.getAttachedShaders(godrays_shaderProgramObject_occlusion);
        if (shaderObjects && shaderObjects.length > 0) {
            for (let i = 0; i < shaderObjects.length; i++) {
                gl.detachShader(godrays_shaderProgramObject_occlusion, shaderObjects[i]);
                gl.deleteShader(shaderObjects[i]);
                shaderObjects[i] = null;
            }
        }
        gl.useProgram(null);
        gl.deleteProgram(godrays_shaderProgramObject_occlusion);
        godrays_shaderProgramObject_occlusion = null;
    }
    if (godrays_shaderProgramObject_godrays) {
        gl.useProgram(godrays_shaderProgramObject_godrays)
        var shaderObjects = gl.getAttachedShaders(godrays_shaderProgramObject_godrays);
        if (shaderObjects && shaderObjects.length > 0) {
            for (let i = 0; i < shaderObjects.length; i++) {
                gl.detachShader(godrays_shaderProgramObject_godrays, shaderObjects[i]);
                gl.deleteShader(shaderObjects[i]);
                shaderObjects[i] = null;
            }
        }
        gl.useProgram(null);
        gl.deleteProgram(godrays_shaderProgramObject_godrays);
        godrays_shaderProgramObject_godrays = null;
    }
}

function trial_init() {
    var vertexShaderSourceCode = (
        "#version 300 es" +
        "\n" +
        "in vec4 aPosition;" +
        "uniform mat4 uMVPMatrix;" +
        "void main(void)" +
        "{" +
        "gl_Position=uMVPMatrix*aPosition;" +
        "}");

    var vertexShaderObject = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShaderObject, vertexShaderSourceCode);
    gl.compileShader(vertexShaderObject);

    if (!gl.getShaderParameter(vertexShaderObject, gl.COMPILE_STATUS)) {
        var error = gl.getShaderInfoLog(vertexShaderObject);
        if (error.length > 0) {
            var log = "Vertex Shader Compilation Error : " + error;
            alert(log);
            uninitialize();
        }
    }
    else {
        console.log("Vertex Shader compiled successfully.")
    }

    //fragment shader
    var fragmentShaderSourceCode = (
        "#version 300 es" +
        "\n" +
        "precision highp float;" +
        "out vec4 FragColor;" +
        "void main(void)" +
        "{" +
        "FragColor=vec4(0.0f,1.0f,1.0f,1.0f);" +
        "}");

    var fragmentShaderObject = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShaderObject, fragmentShaderSourceCode);
    gl.compileShader(fragmentShaderObject);

    if (!gl.getShaderParameter(fragmentShaderObject, gl.COMPILE_STATUS)) {
        var error = gl.getShaderInfoLog(fragmentShaderObject);
        if (error.length > 0) {
            var log = "Fragment Shader Compilation Error : " + error;
            alert(log);
            uninitialize();
        }
    }
    else {
        console.log("Fragment Shader compiled successfully.")
    }

    // SHADER PROGRAM
    gd_shaderProgramObject = gl.createProgram();
    gl.attachShader(gd_shaderProgramObject, vertexShaderObject);
    gl.attachShader(gd_shaderProgramObject, fragmentShaderObject);

    gl.bindAttribLocation(gd_shaderProgramObject, WebGLMacros.AMC_ATTRIBUTE_POSITION, "aPosition");

    gl.linkProgram(gd_shaderProgramObject);

    if (!gl.getProgramParameter(gd_shaderProgramObject, gl.LINK_STATUS)) {
        var error = gl.getProgramInfoLog(gd_shaderProgramObject);
        if (error.length > 0) {
            var log = "Shader Linking Error : " + error;
            alert(log);
            uninitialize();
        }
    } else {
        console.log("Shader Linked successfully.");
    }

    gd_mvpMatrixUniform = gl.getUniformLocation(gd_shaderProgramObject, "uMVPMatrix");

    trial_data = InitializeModelRenderer("src/resources/models/ship.obj")

    gl.clearDepth(1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);

    //set clear color
    gl.clearColor(0.0, 0.0, 0.0, 1.0);

}

function gd_display() {
    //code
    godrays_resize(canvas.width, canvas.height);
	gl.clearColor(1.0,0.0,0.0,1.0)
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.useProgram(gd_shaderProgramObject);

    var gd_viewmatrix = mat4.create();
    var gd_modelmatrix = mat4.create();
	mat4.translate(gd_modelmatrix,gd_modelmatrix,0.0,0.0,-6.0);
    mat4.multiply(gd_perspectiveProjectionMatrix, gd_perspectiveProjectionMatrix, gd_modelmatrix);

    gl.uniformMatrix4fv(gd_mvpMatrixUniform, false, gd_perspectiveProjectionMatrix);

    sphere.draw();

    gl.useProgram(null);

}


