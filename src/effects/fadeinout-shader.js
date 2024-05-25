//Global variables

function FadeInOutEffect()
{
	var overlayVertexShaderObject = null;
	var overlayFragmentShaderObject = null;
	var overlayShaderProgramObject = null;

	var vaoOverlay = null;
	var vboOverlayPosition = null;

	var overlayViewMatrixUniform = null;
	var overlayModelMatrixUniform = null;
	var overlayProjectionMatrixUniform = null;
	var alphaUniform = null;

	// Fade in/out transitions
	var overlayAlpha = 0.0;
	var doesfadeInDone = false;
	var doesfadeOutDone = false;
	var alphaMultiplier = 0.001;

	this.allocate=function()
	{
		//code
		console.log("in allocate");

		//VERTEX shader
		var vertexShaderSourceCode = 
		"#version 300 es" +
		"\n" +
		"in vec4 vPosition;" +
		"uniform mat4 u_viewMatrix;" +
		"uniform mat4 u_modelMatrix;" +
		"uniform mat4 u_projectionMatrix;" +
		"void main(void)" +
		"{" +
			"gl_Position = u_projectionMatrix * u_viewMatrix * u_modelMatrix * vPosition;" +
		"}";

		overlayVertexShaderObject = gl.createShader(gl.VERTEX_SHADER);
		gl.shaderSource(overlayVertexShaderObject, vertexShaderSourceCode);
		gl.compileShader(overlayVertexShaderObject);
		if(gl.getShaderParameter(overlayVertexShaderObject, gl.COMPILE_STATUS) == false)
		{
			var error = gl.getShaderInfoLog(overlayVertexShaderObject);
			if(error.length > 0)
			{
				alert(error);
				UnInitializeFadeInOutShader();
			}
		}

		//FRAGMENT shader
		var fragmentShaderSourceCode = 
		"#version 300 es" +
		"\n" +
		"precision highp float;" +
		"uniform float u_alpha;" +
		"out vec4 FragColor;" +
		"void main(void)" +
		"{" +
			"FragColor = vec4(0.0, 0.0, 0.0, u_alpha);" +
		"}";

		overlayFragmentShaderObject = gl.createShader(gl.FRAGMENT_SHADER);
		gl.shaderSource(overlayFragmentShaderObject, fragmentShaderSourceCode);
		gl.compileShader(overlayFragmentShaderObject);
		if(gl.getShaderParameter(overlayFragmentShaderObject, gl.COMPILE_STATUS) == false)
		{
			var error = gl.getShaderInfoLog(overlayFragmentShaderObject);
			if(error.length > 0)
			{
				alert(error);
				UnInitializeFadeInOutShader();
			}
		}

		//shader program
		overlayShaderProgramObject = gl.createProgram();
		gl.attachShader(overlayShaderProgramObject, overlayVertexShaderObject);
		gl.attachShader(overlayShaderProgramObject, overlayFragmentShaderObject);

		//pre-link binding of shader program object with vertex shader attributes
		gl.bindAttribLocation(overlayShaderProgramObject, WebGLMacros.AMC_ATTRIBUTE_POSITION, "vPosition");

		//linking
		gl.linkProgram(overlayShaderProgramObject);
		if(gl.getProgramParameter(overlayShaderProgramObject, gl.LINK_STATUS) == false)
		{
			var error = gl.getProgramInfoLog(overlayShaderProgramObject);
			if(error.lengh > 0)
			{
				alert(error);
				UnInitializeFadeInOutShader();
			}
		}

		//get MVP uniform locations
		overlayViewMatrixUniform = gl.getUniformLocation(overlayShaderProgramObject, "u_viewMatrix");
		overlayModelMatrixUniform = gl.getUniformLocation(overlayShaderProgramObject, "u_modelMatrix");
		overlayProjectionMatrixUniform = gl.getUniformLocation(overlayShaderProgramObject, "u_projectionMatrix");
		alphaUniform = gl.getUniformLocation(overlayShaderProgramObject, "u_alpha");

		var xCoords = 200.0;
		var yCoords = 200.0;
		var zCoords = 0.0;

		var overlayVertices = new Float32Array([
													xCoords, yCoords, zCoords,
													-xCoords, yCoords, zCoords,
													-xCoords, -yCoords, zCoords,
													xCoords, -yCoords, zCoords
												 ]);

		vaoOverlay = gl.createVertexArray();
		gl.bindVertexArray(vaoOverlay);
    
		//vertices
		vboOverlayPosition = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, vboOverlayPosition);
		gl.bufferData(gl.ARRAY_BUFFER, overlayVertices, gl.STATIC_DRAW);
		gl.vertexAttribPointer(WebGLMacros.AMC_ATTRIBUTE_POSITION,
							   3,
							   gl.FLOAT,
							   false,
							   0,
							   0);
    
		gl.enableVertexAttribArray(WebGLMacros.AMC_ATTRIBUTE_POSITION);
		gl.bindBuffer(gl.ARRAY_BUFFER, null);

		//initial alpha setting
		//gl.uniform1f(alphaUniform, overlayAlpha);
    
		gl.bindVertexArray(null);
	}

	this.setAlphaForFadeOut=function()
	{
		overlayAlpha = 0.0;
		doesfadeOutDone = false;
	}

	this.setAlphaForFadeIn=function()
	{
		overlayAlpha = 1.0;
		doesfadeInDone = false;
	}

	drawOverlay=function()
	{
		gl.useProgram(overlayShaderProgramObject);

		var viewMatrix = mat4.create(); //GetCameraViewMatrix();
		var modelMatrix = mat4.create();
		mat4.translate(modelMatrix, modelMatrix, [0.0, 0.0, -4.0]);
		//mat4.translate(modelMatrix, modelMatrix, [670.0, 0.0, 600.0])
    
		gl.uniformMatrix4fv(overlayViewMatrixUniform, false, viewMatrix);
		gl.uniformMatrix4fv(overlayModelMatrixUniform, false, modelMatrix);
		gl.uniformMatrix4fv(overlayProjectionMatrixUniform, false, perspectiveProjectionMatrix);

		gl.uniform1f(alphaUniform, overlayAlpha);
		//console.log("drawOverlay: " + overlayAlpha);

		gl.bindVertexArray(vaoOverlay);
    
		gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
    
		gl.bindVertexArray(null);  

		gl.useProgram(null);
	}

	this.fadeInTheScene=function()
	{
		//code
		gl.enable(gl.BLEND);
		gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

		drawOverlay();

		if(overlayAlpha <= 0.0)
		{
			overlayAlpha = 0.0;
			doesfadeInDone = true;
		}
		else
		{
			overlayAlpha -= alphaMultiplier;
		}

		gl.disable(gl.BLEND);
	}

	this.fadeOutTheScene=function()
	{
		//code
		gl.enable(gl.BLEND);
		gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

		drawOverlay();

		if(overlayAlpha >= 1.0)
		{
			overlayAlpha = 1.0;
			doesfadeOutDone = true;
		}
		else
		{
			overlayAlpha += alphaMultiplier;
		}

		gl.disable(gl.BLEND);
	}

	this.deallocate=function()
	{
		if(vaoOverlay)
		{
			gl.deleteVertexArray(vaoOverlay);
			vaoOverlay = null;
		}

		if(vboOverlayPosition)
		{
			gl.deleteBuffer(vboOverlayPosition);
			vboOverlayPosition = null;
		}

		if(overlayShaderProgramObject)
		{
			if(fragmentShaderObj)
			{
				gl.detachShader(overlayShaderProgramObject,fragmentShaderObj);
				gl.deleteShader(fragmentShaderObj);
				fragmentShaderObj = null;
			}

			if(vertexShaderObj)
			{
				gl.detachShader(overlayShaderProgramObject, vertexShaderObj);
				gl.deleteShader(vertexShaderObj);
				vertexShaderObj = null;
			}

			gl.deleteProgram(overlayShaderProgramObject);
			overlayShaderProgramObject = null;
		}
	}
}
