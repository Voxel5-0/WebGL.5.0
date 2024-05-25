//global variables
var skyboxVertexShaderObject;
var skyboxFragmentShaderObject;
var skyboxShaderProgramObject;

var vaoSkybox;
var vboSkyboxPosition;

var skyboxViewMatrixUniform;
var skyboxModelMatrixUniform;
var skyboxProjectionMatrixUniform;

var skyboxUniform;
var skybox_texture = new Array(SCENE_COUNT);

var angleSky = 0.0;

function InitializeSkybox()
{
	//VERTEX shader
	var vertexShaderSourceCode = 
	"#version 300 es" +
	"\n" +
	"in vec3 vPosition;" +
	"uniform mat4 u_view_matrix;" +
	"uniform mat4 u_model_matrix;" +
	"uniform mat4 u_projection_matrix;" +
    "out vec3 out_texCoord;" +
	"void main(void)" +
	"{" +
		"out_texCoord = vPosition;" +
		"vec4 pos = u_projection_matrix * u_view_matrix * u_model_matrix  * vec4(vPosition, 1.0);" +
        "gl_Position = pos.xyww;" +
	"}";

	skyboxVertexShaderObject = gl.createShader(gl.VERTEX_SHADER);
	gl.shaderSource(skyboxVertexShaderObject, vertexShaderSourceCode);
	gl.compileShader(skyboxVertexShaderObject);
	if(gl.getShaderParameter(skyboxVertexShaderObject, gl.COMPILE_STATUS) == false)
	{
		var error = gl.getShaderInfoLog(skyboxVertexShaderObject);
		if(error.length > 0)
		{
			alert(error);
			UninitializeSkybox();
		}
	}

	//FRAGMENT shader
	var fragmentShaderSourceCode = 
	"#version 300 es" +
	"\n" +
	"precision highp float;" +
    "in vec3 out_texCoord;" +
	"uniform samplerCube skybox;" +
	"out vec4 FragColor;" +
	"void main(void)" +
	"{" +
		"FragColor = texture(skybox, out_texCoord);" +
	"}";

	skyboxFragmentShaderObject = gl.createShader(gl.FRAGMENT_SHADER);
	gl.shaderSource(skyboxFragmentShaderObject, fragmentShaderSourceCode);
	gl.compileShader(skyboxFragmentShaderObject);
	if(gl.getShaderParameter(skyboxFragmentShaderObject, gl.COMPILE_STATUS) == false)
	{
		var error = gl.getShaderInfoLog(skyboxFragmentShaderObject);
		if(error.length > 0)
		{
			alert(error);
			UninitializeSkybox();
		}
	}

	//shader program
	skyboxShaderProgramObject = gl.createProgram();
	gl.attachShader(skyboxShaderProgramObject, skyboxVertexShaderObject);
	gl.attachShader(skyboxShaderProgramObject, skyboxFragmentShaderObject);

	//pre-link binding of shader program object with vertex shader attributes
	gl.bindAttribLocation(skyboxShaderProgramObject, WebGLMacros.AMC_ATTRIBUTE_VERTEX, "vPosition");

	//linking
	gl.linkProgram(skyboxShaderProgramObject);
	if(gl.getProgramParameter(skyboxShaderProgramObject, gl.LINK_STATUS) == false)
	{
		var error = gl.getProgramInfoLog(skyboxShaderProgramObject);
		if(error.lengh > 0)
		{
			alert(error);
			UninitializeSkybox();
		}
	}

	//get MVP uniform location
	skyboxViewMatrixUniform = gl.getUniformLocation(skyboxShaderProgramObject, "u_view_matrix");
	skyboxModelMatrixUniform = gl.getUniformLocation(skyboxShaderProgramObject, "u_model_matrix");
	skyboxProjectionMatrixUniform = gl.getUniformLocation(skyboxShaderProgramObject, "u_projection_matrix");
	skyboxUniform = gl.getUniformLocation(skyboxShaderProgramObject, "skybox");

	//vertices, color, shader attribs, vbo, vao, initializations
    var size_x = 4096;
    var size_y = 3072;
    var size_z = 16000;

    var skyBoxVertices = new Float32Array([
            -size_x,  size_y, -size_z,
            -size_x, -size_y, -size_z,
             size_x, -size_y, -size_z,
             size_x, -size_y, -size_z,
             size_x,  size_y, -size_z,
            -size_x,  size_y, -size_z,

            -size_x, -size_y,  size_z,
            -size_x, -size_y, -size_z,
            -size_x,  size_y, -size_z,
            -size_x,  size_y, -size_z,
            -size_x,  size_y,  size_z,
            -size_x, -size_y,  size_z,

             size_x, -size_y, -size_z,
             size_x, -size_y,  size_z,
             size_x,  size_y,  size_z,
             size_x,  size_y,  size_z,
             size_x,  size_y, -size_z,
             size_x, -size_y, -size_z,

            -size_x, -size_y,  size_z,
            -size_x,  size_y,  size_z,
             size_x,  size_y,  size_z,
             size_x,  size_y,  size_z,
             size_x, -size_y,  size_z,
            -size_x, -size_y,  size_z,

            -size_x,  size_y, -size_z,
             size_x,  size_y, -size_z,
             size_x,  size_y,  size_z,
             size_x,  size_y,  size_z,
            -size_x,  size_y,  size_z,
            -size_x,  size_y, -size_z,

            -size_x, -size_y, -size_z,
            -size_x, -size_y,  size_z,
             size_x, -size_y, -size_z,
             size_x, -size_y, -size_z,
            -size_x, -size_y,  size_z,
             size_x, -size_y,  size_z
         ]);

    //skybox
    vaoSkybox = gl.createVertexArray();
    gl.bindVertexArray(vaoSkybox);
    
    //vertices
    vboSkyboxPosition = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vboSkyboxPosition);
    gl.bufferData(gl.ARRAY_BUFFER, skyBoxVertices, gl.STATIC_DRAW);
    gl.vertexAttribPointer(WebGLMacros.AMC_ATTRIBUTE_VERTEX,
                           3,
                           gl.FLOAT,
                           false,
                           0,
                           0);
    
    gl.enableVertexAttribArray(WebGLMacros.AMC_ATTRIBUTE_VERTEX);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    
    gl.bindVertexArray(null);
}

function LoadSkyboxTextures(skyboxTextures, sceneNumber)
{
	//loading skybox texture code
	skybox_texture[sceneNumber] = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_CUBE_MAP, skybox_texture[sceneNumber]);

	//right
	var right_texture = gl.createTexture();
	right_texture.image = new Image();
	right_texture.image.src = skyboxTextures[0];
	right_texture.image.onload = function()
	{
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, skybox_texture[sceneNumber]);
		gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, right_texture.image);
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, null);
	};

	//left
	var left_texture = gl.createTexture();
	left_texture.image = new Image();
	left_texture.image.src = skyboxTextures[1];
	left_texture.image.onload = function()
	{
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, skybox_texture[sceneNumber]);
		gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_X, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, left_texture.image);
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, null);
	};

	//top
	var top_texture = gl.createTexture();
	top_texture.image = new Image();
	top_texture.image.src = skyboxTextures[2];
	top_texture.image.onload = function()
	{
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, skybox_texture[sceneNumber]);
		gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Y, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, top_texture.image);
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, null);
	};

	//bottom
	var bottom_texture = gl.createTexture();
	bottom_texture.image = new Image();
	bottom_texture.image.src = skyboxTextures[3];
	bottom_texture.image.onload = function()
	{
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, skybox_texture[sceneNumber]);
		gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, bottom_texture.image);
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, null);
	};

	//back
	var back_texture = gl.createTexture();
	back_texture.image = new Image();
	back_texture.image.src = skyboxTextures[4];
	back_texture.image.onload = function()
	{
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, skybox_texture[sceneNumber]);
		gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Z, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, back_texture.image);
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, null);
	};

	//front
	var front_texture = gl.createTexture();
	front_texture.image = new Image();
	front_texture.image.src = skyboxTextures[5];
	front_texture.image.onload = function()
	{
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, skybox_texture[sceneNumber]);
		gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, front_texture.image);
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, null);
	};
	
	gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
	gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.NEAREST);

	gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_R, gl.CLAMP_TO_EDGE);

	gl.bindTexture(gl.TEXTURE_CUBE_MAP, null);
}

function DrawSkybox(sceneNumber)
{
	gl.useProgram(skyboxShaderProgramObject);

	var view_matrix = mat4.create();
	var modelMatrix = mat4.create();
    mat4.translate(modelMatrix, modelMatrix, [1024.0, 0.0, 1024.0]);

	gl.uniformMatrix4fv(skyboxViewMatrixUniform, false, GetCameraViewMatrix());
	gl.uniformMatrix4fv(skyboxModelMatrixUniform, false, modelMatrix);
	gl.uniformMatrix4fv(skyboxProjectionMatrixUniform, false, perspectiveProjectionMatrix);
	
	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_CUBE_MAP, skybox_texture[sceneNumber]);
	gl.uniform1i(skyboxUniform, 0);

    gl.bindVertexArray(vaoSkybox);
    
    gl.drawArrays(gl.TRIANGLES, 0, 36);
//	gl.drawArrays(gl.TRIANGLE_FAN, 4, 4);
//	gl.drawArrays(gl.TRIANGLE_FAN, 8, 4);
//	gl.drawArrays(gl.TRIANGLE_FAN, 12, 4);
//	gl.drawArrays(gl.TRIANGLE_FAN, 16, 4);
//	gl.drawArrays(gl.TRIANGLE_FAN, 20, 4);
    
    gl.bindVertexArray(null);

	//gl.bindTexture(gl.TEXTURE_CUBE_MAP, null);

	gl.useProgram(null);

	UpdateSkybox();
}

function degToRad(degree)
{
	return (degree * (Math.PI / 180.0));
}

function UpdateSkybox()
{
    //code

	angleSky += 0.1;
}

function UninitializeSkybox()
{
	//code    
    if(vaoSkybox)
    {
        gl.deleteVertexArray(vaoSkybox);
        vaoSkybox = null;
    }
    
    if(vboSkyboxPosition)
    {
        gl.deleteBuffer(vboSkyboxPosition);
        vboSkyboxPosition = null;
    }

	if(skyboxShaderProgramObject)
	{
		if(skyboxFragmentShaderObject)
		{
			gl.detachShader(skyboxShaderProgramObject, skyboxFragmentShaderObject);
			gl.deleteShader(skyboxFragmentShaderObject);
			skyboxFragmentShaderObject = null;
		}

		if(skyboxVertexShaderObject)
		{
			gl.detachShader(skyboxShaderProgramObject, skyboxVertexShaderObject);
			gl.deleteShader(skyboxVertexShaderObject);
			skyboxVertexShaderObject = null;
		}

		gl.deleteProgram(skyboxShaderProgramObject);
		skyboxShaderProgramObject = null;
	}
}
