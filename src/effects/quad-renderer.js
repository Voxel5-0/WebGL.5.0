var vao_quad;
var vbo_quad_position;
var vbo_quad_texcoord;

function InitializeQuadRenderer()
{
	var quad_vertices = new Float32Array([10.0, 0.0, 10.0,
										  0.0, 0.0, 10.0,
										  0.0, 0.0, 0.0,
										  10.0, 0.0, 0.0]);
	var quad_tex_coord = new Float32Array([0.0, 0.0,
										   1.0, 0.0,
										   1.0, 1.0,
										   0.0, 1.0]);

	for (var index = 0; index < 72; index++)
	{
		if (quad_vertices[index] < 0.0)
		{
			quad_vertices[index] += 0.25;
		}
		else if (quad_vertices[index] > 0.0)
		{
			quad_vertices[index] -= 0.25;
		}
	}

	vao_quad = gl.createVertexArray();
	gl.bindVertexArray(vao_quad);
	vbo_quad_position = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, vbo_quad_position);
	gl.bufferData(gl.ARRAY_BUFFER, quad_vertices, gl.STATIC_DRAW);
	gl.vertexAttribPointer(WebGLMacros.AMC_ATTRIBUTE_VERTEX, 3, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(WebGLMacros.AMC_ATTRIBUTE_VERTEX);
	gl.bindBuffer(gl.ARRAY_BUFFER, null);

	vbo_quad_texcoord = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, vbo_quad_texcoord);
	gl.bufferData(gl.ARRAY_BUFFER, quad_tex_coord, gl.STATIC_DRAW);
	gl.vertexAttribPointer(WebGLMacros.AMC_ATTRIBUTE_TEXTURE0, 2, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(WebGLMacros.AMC_ATTRIBUTE_TEXTURE0);
	gl.bindBuffer(gl.ARRAY_BUFFER, null);
	gl.bindVertexArray(null);
}

function QuadRenderer()
{
	gl.bindVertexArray(vao_quad);
	gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
	gl.bindVertexArray(null);
}

function QuadInstanceRenderer(num_instances)
{
	gl.bindVertexArray(vao_quad);
	gl.drawArrays(gl.TRIANGLE_FAN, 0, 4, num_instances);
	gl.bindVertexArray(null);
}

function UninitializeQuadRenderer()
{
	if (vao_quad)
	{
		gl.deleteVertexArray(vao_quad);
        vao_quad=null;
	}

	if(vbo_quad_position)
    {
        gl.deleteBuffer(vbo_quad_position);
        vbo_quad_position=null;
    }

    if(vbo_quad_texcoord)
    {
        gl.deleteBuffer(vbo_quad_texcoord);
        vbo_quad_texcoord=null;
    }
}

	
	

	