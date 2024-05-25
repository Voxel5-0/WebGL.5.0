var instance_vertex_shader;
var instance_fragment_shader;
var instance_shader_program;

var instance_u_view_matrix;
var instance_u_projection_matrix;
var instance_u_texture_0_sampler;

function InitializeInstanceShader()
{
	var instanceVertexShaderSource = 
		"#version 300 es" 							+
		"\n" 										+
		"in vec4 v_position;" 						+
		"in vec2 v_texcoord;" 						+
		"in mat4 v_instance_model_matrix;"			+

		"uniform mat4 u_view_matrix;" 				+
		"uniform mat4 u_projection_matrix;" 		+

		"out vec2 out_texcoord;" 					+

		"void main(void)" 							+
		"{" 										+
			"gl_Position = u_projection_matrix * u_view_matrix * (v_instance_model_matrix * v_position);" +
			"out_texcoord = v_texcoord;" +
		"}" ;

	instance_vertex_shader = gl.createShader(gl.VERTEX_SHADER);
	gl.shaderSource(instance_vertex_shader, instanceVertexShaderSource);
	gl.compileShader(instance_vertex_shader);

	if (gl.getShaderParameter(instance_vertex_shader, gl.COMPILE_STATUS) == false)
	{
		var error = gl.getShaderInfoLog(instance_vertex_shader);

		if (error.length > 0)
		{
			alert("Error in Instance Vertex Shader:");
			alert(error);
			uninitialize();
			return -1;
		}
	}


	var instanceFragmentShaderSource = 
		"#version 300 es" 													+
		"\n" 																+
		"precision highp float;" 											+
		"in vec2 out_texcoord;" 											+
		"uniform sampler2D u_texture_0_sampler;" 							+
		"out vec4 FragColor;" 												+
		
		"void main(void)" 													+
		"{" 																+
			"FragColor = texture(u_texture_0_sampler, out_texcoord);" 		+
			"if (FragColor.a == 0.0)" +
			"{"																+
				"discard;"													+
			"}"																+
		"}";

	instance_fragment_shader = gl.createShader(gl.FRAGMENT_SHADER);
	gl.shaderSource(instance_fragment_shader, instanceFragmentShaderSource);
	gl.compileShader(instance_fragment_shader);

	if (gl.getShaderParameter(instance_fragment_shader, gl.COMPILE_STATUS) == false)
	{
		var error = gl.getShaderInfoLog(instance_fragment_shader);

		if (error.length > 0)
		{
			alert("Error in Instance Fragment Shader:");
			alert(error);
			uninitialize();
			return -1;
		}
	}


	instance_shader_program = gl.createProgram();
	gl.attachShader(instance_shader_program, instance_vertex_shader);
	gl.attachShader(instance_shader_program, instance_fragment_shader);
	gl.bindAttribLocation(instance_shader_program, WebGLMacros.AMC_ATTRIBUTE_VERTEX, "v_position");
	gl.bindAttribLocation(instance_shader_program, WebGLMacros.AMC_ATTRIBUTE_TEXTURE0, "v_texcoord");
	gl.bindAttribLocation(instance_shader_program, WebGLMacros.AMC_ATTRIBUTE_INSTANCE_VEC0, "v_instance_model_matrix");
	gl.linkProgram(instance_shader_program);

	if (!gl.getProgramParameter(instance_shader_program, gl.LINK_STATUS))
	{
		var error = gl.getProgramInfoLog(instance_shader_program);

		if(error.length > 0)
		{
			alert(error);
			uninitialize();
			return -1;
        }
	}	

	instance_u_view_matrix = gl.getUniformLocation(instance_shader_program, "u_view_matrix");
	instance_u_projection_matrix = gl.getUniformLocation(instance_shader_program, "u_projection_matrix");
    instance_u_texture_0_sampler = gl.getUniformLocation(instance_shader_program, "u_texture_0_sampler");

}

function RenderWithInstanceShader(view_matrix, projection_matrix, texture_object, texture_0_sampler)
{
	gl.useProgram(instance_shader_program);

	gl.uniformMatrix4fv(instance_u_view_matrix, false, view_matrix);
    gl.uniformMatrix4fv(instance_u_projection_matrix, false, projection_matrix);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture_object);
    gl.uniform1i(instance_u_texture_0_sampler, texture_0_sampler);
}