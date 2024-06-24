var texture_vertex_shader;
var texture_fragment_shader;
var texture_shader_program;

var u_texture_model_matrix;
var u_texture_view_matrix;
var u_texture_projection_matrix;
var u_texture_texture_0_sampler;
var u_texture_use_model_matrix;

function InitializeTextureShader()
{
	var textureVertexShaderSource = 
		"#version 300 es" 							+
		"\n" 										+
		"in vec4 v_position;" 						+
		"in vec2 v_texcoord;" 						+

		"uniform mat4 u_model_matrix;" 				+
		"uniform mat4 u_view_matrix;" 				+
		"uniform mat4 u_projection_matrix;" 		+
		"uniform int u_use_model_matrix;\n" 			+

		"out vec2 out_texcoord;" 					+

		"void main(void)" 							+
		"{" +
		"	if (u_use_model_matrix==1)\n"					+
		"	{\n"											+
		"		gl_Position = u_projection_matrix * u_view_matrix * u_model_matrix * v_position;\n"	+
		"	}\n"											+
		"	else\n"										+
		"	{\n"											+
		"		gl_Position = v_position;\n"				+
		"	}\n"											+
		"	out_texcoord = v_texcoord;" +
		"}" ;

	texture_vertex_shader = gl.createShader(gl.VERTEX_SHADER);
	gl.shaderSource(texture_vertex_shader, textureVertexShaderSource);
	gl.compileShader(texture_vertex_shader);

	if (gl.getShaderParameter(texture_vertex_shader, gl.COMPILE_STATUS) == false)
	{
		var error = gl.getShaderInfoLog(texture_vertex_shader);

		if (error.length > 0)
		{
			alert("Error in Texture Vertex Shader:");
			alert(error);
			uninitialize();
			return -1;
		}
	}

	var textureFragmentShaderSource = 
		"#version 300 es" 													+
		"\n" 																+
		"precision highp float;" 											+
		"in vec2 out_texcoord;" 											+
		"uniform sampler2D u_texture_0_sampler;" 							+
		"out vec4 FragColor;" 												+
		
		"void main(void)" 													+
		"{" 																+
		"	vec4 color = texture(u_texture_0_sampler,out_texcoord);"+
		"	if(color.a == 0.0)"+
		"		discard;"+
		"   FragColor = color;" 	+
		"}";

	texture_fragment_shader = gl.createShader(gl.FRAGMENT_SHADER);
	gl.shaderSource(texture_fragment_shader, textureFragmentShaderSource);
	gl.compileShader(texture_fragment_shader);

	if (gl.getShaderParameter(texture_fragment_shader, gl.COMPILE_STATUS) == false)
	{
		var error = gl.getShaderInfoLog(texture_fragment_shader);

		if (error.length > 0)
		{
			alert("Error in Texture Fragment Shader:");
			alert(error);
			uninitialize();
			return -1;
		}
	}

	texture_shader_program = gl.createProgram();
	gl.attachShader(texture_shader_program, texture_vertex_shader);
	gl.attachShader(texture_shader_program, texture_fragment_shader);
	gl.bindAttribLocation(texture_shader_program, WebGLMacros.AMC_ATTRIBUTE_VERTEX, "v_position");
	gl.bindAttribLocation(texture_shader_program, WebGLMacros.AMC_ATTRIBUTE_TEXTURE0, "v_texcoord");
	gl.linkProgram(texture_shader_program);

	if (!gl.getProgramParameter(texture_shader_program, gl.LINK_STATUS))
	{
		var error = gl.getProgramInfoLog(texture_shader_program);

		if(error.length > 0)
		{
			alert(error);
			uninitialize();
			return -1;
        }
	}	

	u_texture_model_matrix = gl.getUniformLocation(texture_shader_program, "u_model_matrix");
	u_texture_view_matrix = gl.getUniformLocation(texture_shader_program, "u_view_matrix");
	u_texture_projection_matrix = gl.getUniformLocation(texture_shader_program, "u_projection_matrix");
    u_texture_texture_0_sampler = gl.getUniformLocation(texture_shader_program, "u_texture_0_sampler");
	u_texture_use_model_matrix = gl.getUniformLocation(texture_shader_program,"u_use_model_matrix");

}

function RenderWithTextureShaderMVP(model_matrix, view_matrix, projection_matrix, texture_obj, texture_0_sampler)
{
	gl.useProgram(texture_shader_program);

	gl.uniform1i(u_texture_use_model_matrix,1);
    gl.uniformMatrix4fv(u_texture_model_matrix, false, model_matrix);
    gl.uniformMatrix4fv(u_texture_view_matrix, false, view_matrix);
    gl.uniformMatrix4fv(u_texture_projection_matrix, false, projection_matrix);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture_obj);
    gl.uniform1i(u_texture_texture_0_sampler, texture_0_sampler);

	QuadRendererXY();

	gl.useProgram(null);

}

function RenderWithTextureShader(texture_obj, texture_0_sampler)
{
	gl.useProgram(texture_shader_program);
	gl.uniform1i(u_texture_use_model_matrix,0);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture_obj);
    gl.uniform1i(u_texture_texture_0_sampler, texture_0_sampler);

	QuadRendererXY();

	gl.useProgram(null);

}


function UninitializeTextureShader()
{
	if(texture_shader_program)
    {
        if(texture_fragment_shader)
        {
            gl.detachShader(texture_shader_program, texture_fragment_shader);
            gl.deleteShader(texture_fragment_shader);
            texture_fragment_shader = null;
        }

        if(texture_vertex_shader)
        {
            gl.detachShader(texture_shader_program, texture_vertex_shader);
            gl.deleteShader(texture_vertex_shader);
            texture_vertex_shader = null;
        }

        gl.deleteProgram(texture_shader_program);
        texture_shader_program = null;
    }
}