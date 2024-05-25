function GenerateFramebuffer(width, height)
{
	var fbo_obj;
	var depth_buffer;
	var texture_color_buffer;

	fbo_obj = gl.createFramebuffer();
	gl.bindFramebuffer(gl.FRAMEBUFFER, fbo_obj);

	depth_buffer = gl.createRenderbuffer();
	gl.bindRenderbuffer(gl.RENDERBUFFER, depth_buffer);
	gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT32F, width, height);
	gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, depth_buffer);

	texture_color_buffer = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, texture_color_buffer);
	//gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, width, height, 0, gl.RGB, gl.UNSIGNED_BYTE, null);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
	gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture_color_buffer, 0);

	gl.drawBuffers([gl.COLOR_ATTACHMENT0]);
	var status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);

	if (status == gl.FRAMEBUFFER_COMPLETE)
	{
		//console.log("Framebuffer Complete status = "  + status);
	}
	else
	{
		console.log("Framebuffer Incomplete status = "  + status);
	}
	
	gl.bindFramebuffer(gl.FRAMEBUFFER, null);

	return framebuffer = {
		fbo: fbo_obj,
		dbo: depth_buffer,
		cbo: texture_color_buffer
	}

}