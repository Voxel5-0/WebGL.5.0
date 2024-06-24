var gs_texture_vertex_shader;
var gs_texture_fragment_shader;
var gs_texture_shader_program;

var u_model_matrix;
var u_use_model_matrix;
var u_view_matrix;
var u_projection_matrix;
var u_texture_0_sampler;
var u_grayScaleAnimateFactor = 1.0;
var u_viewportHeight;

var grayScaleAnimateFactor = 0.0;
var bAnimateGrayscale = false;

function InitializeGrayScaleTextureShader()
{
	var textureVertexShaderSource = 
		"#version 300 es" 							+
		"\n" 										+
		"in vec4 v_position;\n" 						+
		"in vec2 v_texcoord;\n" 						+
		"uniform mat4 u_model_matrix;\n" 				+
		"uniform int u_use_model_matrix;\n" 			+
		"uniform mat4 u_view_matrix;\n" 				+
		"uniform mat4 u_projection_matrix;\n" 		+
		"out vec2 out_texcoord;\n" 					+
		"void main(void)\n" 							+
		"{\n" 										+
		"if (u_use_model_matrix==1)\n"					+
		"{\n"											+
		"	gl_Position = u_projection_matrix * u_view_matrix * u_model_matrix * v_position;\n"	+
		"}\n"											+
		"else\n"										+
		"{\n"											+
		"	gl_Position = v_position;\n"				+
		"}\n"											+
		"out_texcoord = v_texcoord;\n" 				+
		"}" ;

	gs_texture_vertex_shader = gl.createShader(gl.VERTEX_SHADER);
	gl.shaderSource(gs_texture_vertex_shader, textureVertexShaderSource);
	gl.compileShader(gs_texture_vertex_shader);

	if (gl.getShaderParameter(gs_texture_vertex_shader, gl.COMPILE_STATUS) == false)
	{
		var error = gl.getShaderInfoLog(gs_texture_vertex_shader);

		if (error.length > 0)
		{
			alert("Error in Texture Vertex Shader:");
			alert(error);
			uninitialize();
			return -1;
		}
	}


	var textureFragmentShaderSource = 
		"#version 300 es" 														+
		"\n" 																	+
		"precision highp float;" 												+
		"in vec2 out_texcoord;" 												+
		"uniform sampler2D u_texture_0_sampler;" 								+
		"uniform float u_grayScaleAnimateFactor;"								+
		"uniform float u_viewportHeight;"										+
		"out vec4 FragColor;" 													+
		
		"void main(void)" 														+
		"{" 																	+
		"	vec4 color = texture(u_texture_0_sampler,out_texcoord);"			+
		"   if((gl_FragCoord.y / u_viewportHeight) < u_grayScaleAnimateFactor)"	+
		"   {"																	+
		"		float grayScaleFactor = ((color.r * 0.3) + (color.g * 0.59) + (color.b * 0.11 )); "+
		"   	vec4 grayScaleColor = vec4(grayScaleFactor,grayScaleFactor,grayScaleFactor,1);"+
		"		FragColor = grayScaleColor;"+
		"	}"+
		"	else"+
		"	{"+
		"		FragColor = color;"+
		"	}"+
		//"   FragColor = texture(u_texture_0_sampler, out_texcoord) * vec4(1.5,0.5,0.5,0.5);" 	+
		"}";

	gs_texture_fragment_shader = gl.createShader(gl.FRAGMENT_SHADER);
	gl.shaderSource(gs_texture_fragment_shader, textureFragmentShaderSource);
	gl.compileShader(gs_texture_fragment_shader);

	if (gl.getShaderParameter(gs_texture_fragment_shader, gl.COMPILE_STATUS) == false)
	{
		var error = gl.getShaderInfoLog(gs_texture_fragment_shader);

		if (error.length > 0)
		{
			alert("Error in Texture Fragment Shader:");
			alert(error);
			uninitialize();
			return -1;
		}
	}

	gs_texture_shader_program = gl.createProgram();
	gl.attachShader(gs_texture_shader_program, gs_texture_vertex_shader);
	gl.attachShader(gs_texture_shader_program, gs_texture_fragment_shader);
	gl.bindAttribLocation(gs_texture_shader_program, WebGLMacros.AMC_ATTRIBUTE_VERTEX, "v_position");
	gl.bindAttribLocation(gs_texture_shader_program, WebGLMacros.AMC_ATTRIBUTE_TEXTURE0, "v_texcoord");
	gl.linkProgram(gs_texture_shader_program);

	if (!gl.getProgramParameter(gs_texture_shader_program, gl.LINK_STATUS))
	{
		var error = gl.getProgramInfoLog(gs_texture_shader_program);

		if(error.length > 0)
		{
			alert(error);
			uninitialize();
			return -1;
        }
	}	

	u_model_matrix = gl.getUniformLocation(gs_texture_shader_program, "u_model_matrix");
	u_use_model_matrix = gl.getUniformLocation(gs_texture_shader_program, "u_use_model_matrix");
	u_view_matrix = gl.getUniformLocation(gs_texture_shader_program, "u_view_matrix");
	u_projection_matrix = gl.getUniformLocation(gs_texture_shader_program, "u_projection_matrix");
    u_texture_0_sampler = gl.getUniformLocation(gs_texture_shader_program, "u_texture_0_sampler");
	u_grayScaleAnimateFactor = gl.getUniformLocation(gs_texture_shader_program,"u_grayScaleAnimateFactor");
	u_viewportHeight = gl.getUniformLocation(gs_texture_shader_program,"u_viewportHeight");
}

function RenderWithGrayScaleTextureShaderMVP(model_matrix, view_matrix, projection_matrix, texture_obj, texture_0_sampler)
{
	gl.useProgram(gs_texture_shader_program);
	gl.uniform1i(u_use_model_matrix, 1);
    gl.uniformMatrix4fv(u_model_matrix, false, model_matrix);
    gl.uniformMatrix4fv(u_view_matrix, false, view_matrix);
    gl.uniformMatrix4fv(u_projection_matrix, false, projection_matrix);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture_obj);
    gl.uniform1i(u_texture_0_sampler, texture_0_sampler);

	gl.uniform1f(u_viewportHeight,1080.0);
	if(bAnimateGrayscale){
		gl.uniform1f(u_grayScaleAnimateFactor,grayScaleAnimateFactor);
		if(grayScaleAnimateFactor > 0.0)
			grayScaleAnimateFactor = grayScaleAnimateFactor - 0.001;
	}else{
		gl.uniform1f(u_grayScaleAnimateFactor,grayScaleAnimateFactor);
		if(grayScaleAnimateFactor < 1.0)
			grayScaleAnimateFactor = grayScaleAnimateFactor + 0.001;
	}

	QuadRendererXY();

	gl.useProgram(null);

}


function RenderWithGrayScaleTextureShader(texture_obj, texture_0_sampler)
{
	gl.useProgram(gs_texture_shader_program);
	gl.uniform1i(u_use_model_matrix, 0);
	
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture_obj);
    gl.uniform1i(u_texture_0_sampler, texture_0_sampler);

	gl.uniform1f(u_viewportHeight,1080.0);
	if(bAnimateGrayscale){
		gl.uniform1f(u_grayScaleAnimateFactor,grayScaleAnimateFactor);
		if(grayScaleAnimateFactor > 0.0)
			grayScaleAnimateFactor = grayScaleAnimateFactor - 0.001;
		else{
			grayscale = 0;
		}
	}else{
		gl.uniform1f(u_grayScaleAnimateFactor,grayScaleAnimateFactor);
		if(grayScaleAnimateFactor < 1.0){
			grayScaleAnimateFactor = grayScaleAnimateFactor + 0.001;
		}
	}

	QuadRendererXY();

	gl.useProgram(null);

}


function UninitializeGrayScaleTextureShader()
{
	if(gs_texture_shader_program)
    {
        if(gs_texture_fragment_shader)
        {
            gl.detachShader(gs_texture_shader_program, gs_texture_fragment_shader);
            gl.deleteShader(gs_texture_fragment_shader);
            gs_texture_fragment_shader = null;
        }

        if(gs_texture_vertex_shader)
        {
            gl.detachShader(gs_texture_shader_program, gs_texture_vertex_shader);
            gl.deleteShader(gs_texture_vertex_shader);
            gs_texture_vertex_shader = null;
        }

        gl.deleteProgram(gs_texture_shader_program);
        gs_texture_shader_program = null;
    }
}