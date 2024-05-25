var scene_zero_vertexShaderObject;
var scene_zero_shaderProgramObject;
var scene_zero_fragmentShaderObject;
var scene_zero_vao_Quad;
var scene_zero_vbo_Texture_Quad;
var scene_zero_vbo_Position_Quad;

// Angles
var scene_zero_gTranslatePosition = 6.0;
var scene_zero_gTranslatePositionConstant = 2.0;
// Texture Variables
var scene_zero_textureArray = new Array(3);
// Uniforms
var scene_zero_mvpUniform;
var scene_zero_textureUniform;
var scene_zero_alphaUniform;

// Matrices
var modelViewMatrix;
var modelViewProjectionMatrix;

var bDoneScene1 = false;
var bDoneScene2 = false;
var bDoneScene3 = false;
var bIsBlendEnabled = false;

// Fade in/out transition
var scene_zero_alpha = 1.0;
var scene_zero_fade_in = false;
var scene_zero_fade_out = false;
var scene_zero_current_update_time = 0.0;


var strTextureImages = new Array(["textures\\scene_zero\\Astromedicomp.png"], 
                            ["textures\\scene_zero\\VertexGroup.png"],
                            ["textures\\scene_zero\\ProjectTitle.png"]);


function InitializeSceneZero()
{
	var scene_zero_vertexShaderSourceCode = 
    "#version 300 es"               +
    "\n"                            +
    "in vec2 vTexCoord;"            +
    "out vec2 out_TexCoord;"        +
    "in vec4 vPosition;"            +
    "uniform mat4 uMvpMatrix;"      +

    "void main(void)"               +
    "\n"                            +
    "{"                             +
        "gl_Position = uMvpMatrix * vPosition;"+
        "out_TexCoord = vTexCoord;" +
    "}";

    scene_zero_vertexShaderObject = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(scene_zero_vertexShaderObject, scene_zero_vertexShaderSourceCode);
    gl.compileShader(scene_zero_vertexShaderObject);

    if(gl.getShaderParameter(scene_zero_vertexShaderObject, gl.COMPILE_STATUS) == false)
    {
        var error = gl.getShaderInfoLog(scene_zero_vertexShaderObject);
        if(error.length > 0)
        {
            alert(error);
            uninitialize();
        }
    }

    // Fragment Shader
    var scene_zero_fragmentShaderSourceCode =
    "#version 300 es"                    +
    "\n"                                 +
    "precision highp float;"             +
    "out vec4 FragColor;"                +
    "in vec2 out_TexCoord;"              +
    "uniform highp sampler2D u_textureSampler;"+
    "uniform highp float u_alpha;"       +
    "void main(void)"                    +
    "\n"                                 +
    "{"                                  +
        "vec3 texColor = texture(u_textureSampler, out_TexCoord).rgb;" +
        "FragColor = vec4(texColor, u_alpha);" +
        "\n"                             +
    "}";

    scene_zero_fragmentShaderObject = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(scene_zero_fragmentShaderObject, scene_zero_fragmentShaderSourceCode);
    gl.compileShader(scene_zero_fragmentShaderObject);

    if(gl.getShaderParameter(scene_zero_fragmentShaderObject, gl.COMPILE_STATUS) == false)
    {
        var error = gl.getShaderInfoLog(scene_zero_fragmentShaderObject);
        if(error.length > 0)
        {
            alert(error);
            uninitialize();
        }
    }

    // Shader Program
    scene_zero_shaderProgramObject = gl.createProgram();
    gl.attachShader(scene_zero_shaderProgramObject, scene_zero_vertexShaderObject);
    gl.attachShader(scene_zero_shaderProgramObject, scene_zero_fragmentShaderObject);

    // pre-link

    gl.bindAttribLocation(scene_zero_shaderProgramObject, WebGLMacros.AMC_ATTRIBUTE_POSITION, "vPosition");
    gl.bindAttribLocation(scene_zero_shaderProgramObject, WebGLMacros.AMC_ATTRIBUTE_TEXTURE0, "vTexCoord");

    // Linking
    gl.linkProgram(scene_zero_shaderProgramObject);

    if(!gl.getProgramParameter(scene_zero_shaderProgramObject, gl.LINK_STATUS))
    {
        var error = gl.getProgramInfoLog(scene_zero_shaderProgramObject);

        if(error.length > 0)
        {
            alert(error);
            uninitialize();
        }
    }

    // Get MVP Location
    scene_zero_mvpUniform = gl.getUniformLocation(scene_zero_shaderProgramObject, "uMvpMatrix");
    scene_zero_textureUniform = gl.getUniformLocation(scene_zero_shaderProgramObject, "u_textureSampler");
    scene_zero_alphaUniform = gl.getUniformLocation(scene_zero_shaderProgramObject, "u_alpha");

    var fZero = 0.0;
    var fOne  = 1.0;

    var quadVertices = new Float32Array([
                                            2.0, 1.12, 0.0,         // right-top
                                            -2.0, 1.12, 0.0,       // left-top
                                            -2.0, -1.12, 0.0,      // left-bottom
                                            2.0, -1.12, 0.0        // right-bottom
                                        ]);

    var textureCoordinates = new Float32Array([ 
                                                fOne, fOne,
                                                fZero, fOne,
                                                fZero, fZero,
                                                fOne, fZero
                                            ]);

    
    

    scene_zero_vao_Quad = gl.createVertexArray();
    gl.bindVertexArray(scene_zero_vao_Quad);

    // Position
    scene_zero_vbo_Position_Quad = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, scene_zero_vbo_Position_Quad);
    gl.bufferData(gl.ARRAY_BUFFER, quadVertices, gl.STATIC_DRAW);
    gl.vertexAttribPointer(WebGLMacros.AMC_ATTRIBUTE_POSITION, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(WebGLMacros.AMC_ATTRIBUTE_POSITION);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    // Texture
    scene_zero_vbo_Texture_Quad = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, scene_zero_vbo_Texture_Quad);
    gl.bufferData(gl.ARRAY_BUFFER, textureCoordinates, gl.STATIC_DRAW);
    gl.vertexAttribPointer(WebGLMacros.AMC_ATTRIBUTE_TEXTURE0, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(WebGLMacros.AMC_ATTRIBUTE_TEXTURE0);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    gl.bindVertexArray(null);
    
    for(var iCounter = 0; iCounter < scene_zero_textureArray.length ; ++iCounter)
    {
        loadTexture(strTextureImages[iCounter], iCounter);
    }

}

function RenderSceneZeroOpeningScene()
{
    // Enable alpha blending for the 3rd project title screen only.
    if (bDoneScene1 && bDoneScene2 && !bDoneScene3)
    {
        bIsBlendEnabled = true;
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    }

    gl.useProgram(scene_zero_shaderProgramObject);

    scene_zero_modelViewMatrix = mat4.create();
    scene_zero_modelViewProjectionMatrix = mat4.create();

    if(!bDoneScene1)
    {
        astromedicompScreen();
    }
    else if(!bDoneScene2)
    {
       vertexGroupScreen();
    }
    else if (!bDoneScene3)
    {
    	projectTitleScreen();
    }
    
    
    mat4.multiply(scene_zero_modelViewProjectionMatrix, perspectiveProjectionMatrix, scene_zero_modelViewMatrix);
    gl.uniformMatrix4fv(scene_zero_mvpUniform, false, scene_zero_modelViewProjectionMatrix);
    gl.uniform1f(scene_zero_alphaUniform, scene_zero_alpha);
    gl.bindVertexArray(scene_zero_vao_Quad);
    gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
    gl.bindVertexArray(null);
    gl.useProgram(null);

    if (bIsBlendEnabled)
    {
        gl.disable(gl.BLEND);
        bIsBlendEnabled = false;
    }
}

var n;

function UpdateSceneZero(now)
{
    const fade_in_alpha_inc = 0.01;
    const fade_out_alpha_dec = 0.01;
    const on_screen_time = 9000.0;        // 9 seconds

    if (!bDoneScene1 || !bDoneScene2)
    {
        n = now;
        if(scene_zero_gTranslatePosition <= 3.0)
        {
            scene_zero_gTranslatePosition = 3.0;
        }

        scene_zero_gTranslatePosition -= 0.008;
    }

    // Project title screen
    if (bDoneScene1 && bDoneScene2 && !bDoneScene3)
    {
        // Fade in
        if (scene_zero_fade_in)
        {
            scene_zero_alpha += fade_in_alpha_inc;
            if (scene_zero_alpha >= 1.0)
            {
                scene_zero_alpha = 1.0;
                scene_zero_fade_in = false;
                // Store the current time once fade in is complete, this is used to keep the image on screen for 10 seconds
                scene_zero_current_update_time = now;
            }
        }

        // Fade out
        if (scene_zero_fade_out)
        {
            scene_zero_alpha -= fade_out_alpha_dec;
            if (scene_zero_alpha <= 0.0)
            {
                scene_zero_alpha = 0.0;
                scene_zero_fade_out = false;
                bDoneScene3 = true;
            }
        }

        // pause on screen
        if (!scene_zero_fade_in && !scene_zero_fade_out)
        {
            // Stay on the screen for 10 seconds and then start fading out
            if (now - scene_zero_current_update_time > on_screen_time)
            {
                scene_zero_current_update_time = 0.0;
                scene_zero_fade_out = true;
            }
        }
    }
}

function UninitializeSceneZero()
{
    for(var iCounter = 0; iCounter < scene_zero_textureArray.length ; ++iCounter)
    {
        if (scene_zero_textureArray[iCounter])
        {
            gl.deleteTexture(scene_zero_textureArray[iCounter]);
            scene_zero_textureArray[iCounter] = null;
        }
    }
    
	if(scene_zero_vao_Quad)
    {
        gl.deleteVertexArray(scene_zero_vao_Quad);
        scene_zero_vao_Quad = null;
    }

    if(scene_zero_vbo_Position_Quad)
    {
        gl.deleteVertexArray(scene_zero_vbo_Position_Quad);
        scene_zero_vbo_Position_Quad = null;
    }

    if(scene_zero_vbo_Texture_Quad)
    {
        gl.deleteVertexArray(scene_zero_vbo_Texture_Quad);
        scene_zero_vbo_Texture_Quad = null;
    }

    if(scene_zero_shaderProgramObject)
    {
        if(scene_zero_fragmentShaderObject)
        {
            gl.detachShader(scene_zero_shaderProgramObject, scene_zero_fragmentShaderObject);
            gl.deleteShader(scene_zero_fragmentShaderObject);
            scene_zero_fragmentShaderObject = null;
        }

        if(vertexShaderObject)
        {
            gl.detachShader(scene_zero_shaderProgramObject, scene_zero_vertexShaderObject);
            gl.deleteShader(scene_zero_vertexShaderObject);
            scene_zero_vertexShaderObject = null;
        }

        gl.deleteProgram(scene_zero_shaderProgramObject);
        scene_zero_shaderProgramObject = 0;
    }
}

function astromedicompScreen()
{
    if(scene_zero_gTranslatePosition <= 3.0)
    {
        bDoneScene1 = true;
        scene_zero_gTranslatePosition = 6.0;
        gl.bindTexture(gl.TEXTURE_2D, null);
    }   
    else
        gl.bindTexture(gl.TEXTURE_2D, scene_zero_textureArray[0]);
    
    mat4.translate(scene_zero_modelViewMatrix, scene_zero_modelViewMatrix, [0.0, 0.0, -scene_zero_gTranslatePosition]);
}

function vertexGroupScreen()
{
    if(scene_zero_gTranslatePosition <= 3.0)
    {
        bDoneScene2 = true;
        scene_zero_gTranslatePosition = 6.0;
        gl.bindTexture(gl.TEXTURE_2D, null);
        scene_zero_fade_in = true;
        scene_zero_alpha = 0.0;
    }
    else
        gl.bindTexture(gl.TEXTURE_2D, scene_zero_textureArray[1]);

    mat4.translate(scene_zero_modelViewMatrix, scene_zero_modelViewMatrix, [0.0, 0.0, -scene_zero_gTranslatePosition]);
}

function projectTitleScreen()
{
    gl.bindTexture(gl.TEXTURE_2D, scene_zero_textureArray[2])
	mat4.translate(scene_zero_modelViewMatrix, scene_zero_modelViewMatrix, [0.0, 0.0, -2.0]);
}

function loadTexture(temp, iElementCounter)
{
    /*******  Loading texture   ********/

    // Created texture and assigned to astromedicomp_texure
    scene_zero_textureArray[iElementCounter] = gl.createTexture();
    // As after creating object we can call member function of an class object.
    // Image() is a browser preefined class.
    scene_zero_textureArray[iElementCounter].image = new Image();
    // Giving resource (Image File Name)
    scene_zero_textureArray[iElementCounter].image.src = temp;
    // using Lamba/block/closure/unamed function 
    // onload is a function pointer
    scene_zero_textureArray[iElementCounter].image.onload = function()
    {
        gl.bindTexture(gl.TEXTURE_2D, scene_zero_textureArray[iElementCounter]);
        // Ultya Y cha ulta Y
        // It was internally does by android and windows function but as here is no library, 
        // we have to do it manually here
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, scene_zero_textureArray[iElementCounter].image);
        
        gl.bindTexture(gl.TEXTURE_2D, null);
    };
}
