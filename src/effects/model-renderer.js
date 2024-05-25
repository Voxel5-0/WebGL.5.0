function InitializeModelRenderer(filepath)
{
	var vao_model;
	var vbo_model_position;
	var vbo_model_indices;
	var vbo_model_texcoord;
	var vbo_model_normals;

	vertex_data = loadObjModel(filepath);

	vao_model = gl.createVertexArray();
	gl.bindVertexArray(vao_model);
	
	vbo_model_position = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, vbo_model_position);
	gl.bufferData(gl.ARRAY_BUFFER, vertex_data.vertices, gl.STATIC_DRAW);
	gl.vertexAttribPointer(WebGLMacros.AMC_ATTRIBUTE_VERTEX, 3, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(WebGLMacros.AMC_ATTRIBUTE_VERTEX);
	gl.bindBuffer(gl.ARRAY_BUFFER,null);

	vbo_model_indices = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, vbo_model_indices);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, vertex_data.indices, gl.STATIC_DRAW);
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

	vbo_model_texcoord = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, vbo_model_texcoord);
	gl.bufferData(gl.ARRAY_BUFFER, vertex_data.textures, gl.STATIC_DRAW);
	gl.vertexAttribPointer(WebGLMacros.AMC_ATTRIBUTE_TEXTURE0, 2, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(WebGLMacros.AMC_ATTRIBUTE_TEXTURE0);
	gl.bindBuffer(gl.ARRAY_BUFFER, null);


	/*vbo_model_normals = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, vbo_model_normals);
	gl.bufferData(gl.ARRAY_BUFFER, vertex_data.normals, gl.STATIC_DRAW);
	gl.vertexAttribPointer(WebGLMacros.AMC_ATTRIBUTE_NORMAL, 3, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(WebGLMacros.AMC_ATTRIBUTE_NORMAL);
	gl.bindBuffer(gl.ARRAY_BUFFER, null);*/

	gl.bindVertexArray(null);

	idx_count = vertex_data.indices.length;
	vertex_data.vertices = null;
	vertex_data.textures = null;
	vertex_data.indices = null;
	vertex_data.normals = null;

	return {
		vao_model: vao_model,
		vbo_position: vbo_model_position,
		vbo_texcoords: vbo_model_texcoord,
		//vbo_normals: vbo_model_normals,
		vbo_indices: vbo_model_indices,
		indices_count: idx_count,
	}

}

function ModelRenderer(model_data)
{
	gl.bindVertexArray(model_data.vao_model);
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, model_data.vbo_indices);
	gl.drawElements(gl.TRIANGLES, model_data.indices_count, gl.UNSIGNED_INT, 0);
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
	gl.bindVertexArray(null);
}

function ModelInstanceRenderer(model_data, num_instances)
{
	gl.bindVertexArray(model_data.vao_model);
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, model_data.vbo_indices);
	gl.drawElementsInstanced(gl.TRIANGLES, model_data.indices_count, gl.UNSIGNED_INT, 0, num_instances);
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
	gl.bindVertexArray(null);
}

function UninitializeModelRenderer(model_data)
{
	if (model_data.vao_model)
	{
		gl.deleteVertexArray(model_data.vao_model);
        model_data.vao_model=null;
	}

	if(model_data.vbo_position)
    {
        gl.deleteBuffer(model_data.vbo_position);
        model_data.vbo_position=null;
    }

    if(model_data.vbo_texcoords)
    {
        gl.deleteBuffer(model_data.vbo_texcoords);
        model_data.vbo_texcoords=null;
    }

    if(model_data.vbo_normals)
    {
        gl.deleteBuffer(model_data.vbo_normals);
        model_data.vbo_normals=null;
    }

    if(model_data.vbo_indices)
    {
        gl.deleteBuffer(model_data.vbo_indices);
        model_data.vbo_indices=null;
    }

}