
var grass_shaderProgramObject = null;
var grass_vao = null;

// var grass_mvpMatrixUniform;
var grass_modelMatrixUniform;
var grass_viewMatrixUniform;
var grass_projectionMatrixUniform;

var grass_angle_g_locUniform; 
var grass_bend_g_locUniform;

var grass_viewMatrix;
var grass_modelMatrix;

var tex_grass_palette;
var tex_grass_length;
var tex_grass_orientation;
var tex_grass_color;
var tex_grass_bend;

var tex_grass_palette_uniform;
var tex_grass_length_uniform;
var tex_grass_orientation_uniform;
var tex_grass_color_uniform;
var tex_grass_bend_uniform;

// var grass_texture = null;
// var greass_time;

var angle_blend = 1.0;
var angle_animation = 1.0;

function initializeGrass() {
    // Code

    // Vertex shader
    const vertexShaderSourceCode = /* glsl */ `#version 300 es

        // Incoming per vertex position                                                                             
        in vec4 vVertex;                                                                                            

        // Output varyings                                                                                          
        out vec4 color;                                                                                             

        //uniform mat4 mvpMatrix;  
        uniform mat4 modelMatrix;                                                                                     
        uniform mat4 viewMatrix;                                                                                     
        uniform mat4 projectionMatrix;                                                                                     
                                                                                   
        uniform float animation;                                                                                    
        uniform float bend_animation;                                                                               
        uniform sampler2D grasspalette_texture;                                                
        uniform sampler2D length_texture;                                                      
        uniform sampler2D orientation_texture;                                                 
        uniform sampler2D grasscolor_texture;                                                  
        uniform sampler2D bend_texture;                                                        

        int random(int seed, int iterations)                                                                        
        {                                                                                                           
            int value = seed;                                                                                       
            int n;                                                                                                  

            for (n = 0; n < iterations; n++) {                                                                      
                value = ((value >> 7) ^ (value << 9)) * 15485863;                                                   
            }                                                                                                       

            return value;                                                                                           
        }                                                                                                           

        vec4 random_vector(int seed)                                                                                
        {                                                                                                           
            int r = random(gl_InstanceID, 4);                                                                       
            int g = random(r, 2);                                                                                   
            int b = random(g, 2);                                                                                   
            int a = random(b, 2);                                                                                   

            return vec4(float(r & 0x3FF) / 1024.0,                                                                  
                        float(g & 0x3FF) / 1024.0,                                                                  
                        float(b & 0x3FF) / 1024.0,                                                                  
                        float(a & 0x3FF) / 1024.0);                                                                 
        }                                                                                                           

        mat4 construct_rotation_matrix(float angle)                                                                 
        {                                                                                                           
            float st = sin(angle);                                                                                  
            float ct = cos(angle);                                                                                  

            return mat4(vec4(ct, 0.0, st, 0.0),                                                                     
                        vec4(0.0, 1.0, 0.0, 0.0),                                                                   
                        vec4(-st, 0.0, ct, 0.0),                                                                    
                        vec4(0.0, 0.0, 0.0, 1.0));                                                                  
        }                                                                                                           

        void main(void)                                                                                             
        {                                                                                                           
            vec4 offset = vec4(float(gl_InstanceID >> 10) - 512.0,                                                  
                               0.0f,                                                                                
                               float(gl_InstanceID & 0x3FF) - 512.0,                                                
                               0.0f);                                                                               
            int number1 = random(gl_InstanceID, 3);                                                                 
            int number2 = random(number1, 2);                                                                       
            offset += vec4(float(number1 & 0xFF) / 256.0,                                                           
                           0.0f,                                                                                    
                           float(number2 & 0xFF) / 256.0,                                                           
                           0.0f);                                                                                   
             //float angle = float(random(number2, 2) & 0x3FF) / 1024.0;                                            

            vec2 texcoord = offset.xz / 1024.0 + vec2(0.5);                                                         

            // float bend_factor = float(random(number2, 7) & 0x3FF) / 1024.0;                                      
            float bend_factor = texture(bend_texture, texcoord).r * bend_animation;                                 
            float bend_amount = cos(vVertex.y);                                                                     

            float angle = texture(orientation_texture, texcoord).r * animation * 3.141592;                          
            mat4 rot = construct_rotation_matrix(angle);                                                            
            vec4 position = (rot * (vVertex + vec4(0.0, 0.0, bend_amount * bend_factor, 0.0))) + offset;            

            position *= vec4(1.0, texture(length_texture, texcoord).r * 0.9 + 0.3, 1.0, 1.0);                       

            gl_Position = projectionMatrix * viewMatrix * modelMatrix * position; // (rot * position);                                                
            //color = vec4(random_vector(gl_InstanceID).xyz * vec3(0.1, 0.5, 0.1) + vec3(0.1, 0.4, 0.1), 1.0);     
            color = texture(orientation_texture, texcoord);                                                      
            // color = texture(grasspalette_texture, texture(grasscolor_texture, texcoord).r) +                        
            //         vec4(random_vector(gl_InstanceID).xyz * vec3(0.1, 0.5, 0.1), 1.0);                              
        
            // color = texture(grasspalette_texture, vec2(texture(grasscolor_texture, texcoord).r, 0.0)) +
            //     vec4(random_vector(gl_InstanceID).xyz * vec3(0.1, 0.5, 0.1), 1.0);

            //color = vec4(1.0,0.0,0.0,1.0);
        }                                                                                                           
      `

    let vertexShaderObject = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShaderObject, vertexShaderSourceCode);
    gl.compileShader(vertexShaderObject);
    if (gl.getShaderParameter(vertexShaderObject, gl.COMPILE_STATUS) == false) {
        console.log("Vertex shader compilation failed for grass");
        var error = gl.getShaderInfoLog(vertexShaderObject);
        if (error.length > 0) {
            var log = "Vertex Shader Compilation Error : " + error;
            alert(log);
            grass_uninitialize();
        }
    }
    else {
        console.log("Vertex Shader Compile Successfully For Grass...\n");
    }

    // Fragment shader
     const fragmentShaderSourceCode = /* glsl */ `#version 300 es           
        precision highp float;                      
        in vec4 color;                   
                                         
        out vec4 output_color;           
                                         
        void main(void)                  
        {                                
            output_color = vec4(1.0,0.0,0.0,1.0);        
        } 
     `;

    let fragmentShaderObject = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShaderObject, fragmentShaderSourceCode);
    gl.compileShader(fragmentShaderObject);
    if (gl.getShaderParameter(fragmentShaderObject, gl.COMPILE_STATUS) == false) {
        console.log("Fragment shader compilation failed for grass");
        var error = gl.getShaderInfoLog(fragmentShaderObject);
        if (error.length > 0) {
            var log = "Fragment Shader Compilation Error : " + error;
            alert(log);
            grass_uninitialize();
        }
    }
    else {
        console.log("Fragment Shader Compile Successfully For Grass...\n");
    }

    // Shader program
    grass_shaderProgramObject = gl.createProgram();
    gl.attachShader(grass_shaderProgramObject, vertexShaderObject);
    gl.attachShader(grass_shaderProgramObject, fragmentShaderObject);

    // Pre link binding
    gl.bindAttribLocation(grass_shaderProgramObject, WebGLMacros.AMC_ATTRIBUTE_VERTEX, "vVertex");

    gl.linkProgram(grass_shaderProgramObject);
    if (gl.getProgramParameter(grass_shaderProgramObject, gl.LINK_STATUS) == false) {
        var error = gl.getProgramInfoLog(grass_shaderProgramObject);
        if (error.length > 0) {
            var log = "Shader Program Linking Error : " + error;
            alert(log);
            grass_uninitialize();
        }
    }
    else {
        console.log("Shader Program Linked Successfully...\n");
    }

    //post-linking
    // grass_mvpMatrixUniform = gl.getUniformLocation(grass_shaderProgramObject, "mvpMatrix");
    grass_modelMatrixUniform = gl.getUniformLocation(grass_shaderProgramObject, "modelMatrix");
    grass_viewMatrixUniform = gl.getUniformLocation(grass_shaderProgramObject, "viewMatrix");
    grass_projectionMatrixUniform = gl.getUniformLocation(grass_shaderProgramObject, "projectionMatrix");

    grass_angle_g_locUniform = gl.getUniformLocation(grass_shaderProgramObject, "animation"); 
    grass_bend_g_locUniform = gl.getUniformLocation(grass_shaderProgramObject, "bend_animation");

    tex_grass_palette_uniform = gl.getUniformLocation(grass_shaderProgramObject, "grasspalette_texture");
    tex_grass_length_uniform = gl.getUniformLocation(grass_shaderProgramObject, "length_texture");
    tex_grass_orientation_uniform = gl.getUniformLocation(grass_shaderProgramObject, "orientation_texture");
    tex_grass_color_uniform = gl.getUniformLocation(grass_shaderProgramObject, "grasscolor_texture");
    tex_grass_bend_uniform = gl.getUniformLocation(grass_shaderProgramObject, "bend_texture");

     // Setup vao and vbo
     grass_vao = gl.createVertexArray();
     gl.bindVertexArray(grass_vao);
     
    const grass_blade =
        [
        	-0.3, 0.0, 0,
        	 0.3, 0.0, 0,
        	-0.20, 1.0, 0,
        
        	 0.1, 1.3, 0,
        	-0.05, 2.3, 0,
        	 0.0, 3.3, 0,
        ];

     // Position
     grass_vbo_position = gl.createBuffer();
     gl.bindBuffer(gl.ARRAY_BUFFER, grass_vbo_position);
     gl.bufferData(gl.ARRAY_BUFFER, grass_blade, gl.STATIC_DRAW);
     gl.vertexAttribPointer(WebGLMacros.AMC_ATTRIBUTE_VERTEX, 3, gl.FLOAT, false, 0, 0);
     gl.enableVertexAttribArray(WebGLMacros.AMC_ATTRIBUTE_VERTEX);
     gl.bindBuffer(gl.ARRAY_BUFFER, null);
     
     gl.bindVertexArray(null);

     grass_loadGLTexture();
}

function grass_update() {
    // Code
    //updateGrass(Grass);
    greass_time += 0.1;
}


function displayGrass() {
   //Transformation
    var currentTime = 0.0;
    currentTime++;
    var t = currentTime * 0.02;
    var r = 550.0;
    grass_viewMatrix = GetCameraViewMatrix();
    grass_modelMatrix = mat4.create();

    var yPos = -40.0;

    if (yPos < -20.0)
    {
	    yPos = yPos + 1.0;
    }
    gl.useProgram(grass_shaderProgramObject);

    mat4.translate(grass_modelMatrix, grass_modelMatrix, [0.0 + test_translate_X, -10.0 + test_translate_Y, -10.0 + test_translate_Z]);
    mat4.scale(grass_modelMatrix, grass_modelMatrix,[1.0 + test_scale_X,1.0 + test_scale_X ,1.0+ test_scale_X]);

    gl.uniformMatrix4fv(grass_modelMatrixUniform, false, grass_modelMatrix);
    gl.uniformMatrix4fv(grass_viewMatrixUniform, false, grass_viewMatrix);
    gl.uniformMatrix4fv(grass_projectionMatrixUniform, false, perspectiveProjectionMatrix);

    gl.uniform1f(grass_angle_g_locUniform, angle_blend);
    gl.uniform1f(grass_bend_g_locUniform, angle_animation);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, tex_grass_palette);
    gl.uniform1i(tex_grass_palette_uniform,0);

    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, tex_grass_length);
    gl.uniform1i(tex_grass_length_uniform, 1);

    gl.activeTexture(gl.TEXTURE2);
    gl.bindTexture(gl.TEXTURE_2D, tex_grass_orientation);
    gl.uniform1i(tex_grass_orientation_uniform, 2);

    gl.activeTexture(gl.TEXTURE3);
    gl.bindTexture(gl.TEXTURE_2D, tex_grass_color);
    gl.uniform1i(tex_grass_color_uniform, 3);

    gl.activeTexture(gl.TEXTURE4);
    gl.bindTexture(gl.TEXTURE_2D, tex_grass_bend);
    gl.uniform1i(tex_grass_bend_uniform, 4);

    gl.bindVertexArray(grass_vao);

    gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, 6, 1024 * 1024);

    gl.bindVertexArray(null);
    gl.bindTexture(gl.TEXTURE_2D, null);

    gl.useProgram(null);

    angle_animation += 0.01;
	if (angle_animation > 2.0)
	{
		animation_flag = false;
	}
    angle_blend += 0.01;
	if (angle_blend > 2.0)
	{
		bend_flag = false;
	}
}

function grass_uninitialize() {
   
}


function grass_loadGLTexture() {

    tex_grass_palette = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex_grass_palette);
    // 3x1 pixel 1d texture
    var oneDTextureTexels = new Uint8Array([
        255,0,0,255, 
        0,255,0,255,
        0,0,255,255,
    ]);
    var width = 3;
    var height = 1;
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE,
              oneDTextureTexels);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_W, gl.CLAMP_TO_EDGE);          
    gl.bindTexture(gl.TEXTURE_2D, null);

    //grass length
    tex_grass_length = gl.createTexture();
    tex_grass_length.image = new Image();
    tex_grass_length.image.onload = function () {
        console.log('Texture loaded successfully.' + tex_grass_length.image.src)
        gl.bindTexture(gl.TEXTURE_2D, tex_grass_length);
        
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, tex_grass_length.image);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        
        gl.bindTexture(gl.TEXTURE_2D, null);
    }
    tex_grass_length.image.src = "src\\resources\\textures\\grass\\grass_length.bmp";

    //grass orientation
    tex_grass_orientation = gl.createTexture();
    tex_grass_orientation.image = new Image();
    tex_grass_orientation.image.onload = function () {
        console.log('Texture loaded successfully.' + tex_grass_orientation.image.src)
        gl.bindTexture(gl.TEXTURE_2D, tex_grass_orientation);
        
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, tex_grass_orientation.image);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        
        gl.bindTexture(gl.TEXTURE_2D, null);
    }
    tex_grass_orientation.image.src = "src\\resources\\textures\\grass\\grass_orientation.bmp";

    // tex_grass_color;
    tex_grass_color = gl.createTexture();
    tex_grass_color.image = new Image();
    tex_grass_color.image.onload = function () {
        console.log('Texture loaded successfully.' + tex_grass_color.image.src)
        gl.bindTexture(gl.TEXTURE_2D, tex_grass_color);
        
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, tex_grass_color.image);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        
        gl.bindTexture(gl.TEXTURE_2D, null);
    }
    tex_grass_color.image.src = "src\\resources\\textures\\grass\\grass_color.bmp";

    // tex_grass_bend;
    tex_grass_bend = gl.createTexture();
    tex_grass_bend.image = new Image();
    tex_grass_bend.image.onload = function () {
        console.log('Texture loaded successfully.'+tex_grass_bend.image.src)
        gl.bindTexture(gl.TEXTURE_2D, tex_grass_bend);
        
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, tex_grass_bend.image);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        
        gl.bindTexture(gl.TEXTURE_2D, null);
    }
    tex_grass_bend.image.src = "src\\resources\\textures\\grass\\grass_bend.bmp";
}