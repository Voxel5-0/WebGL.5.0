var fbm_texture_vertex_shader;
var fbm_texture_fragment_shader;
var fbm_texture_shader_program;

var u_fbm_model_matrix;
var u_fbm_use_model_matrix;
var u_fbm_view_matrix;
var u_fbm_projection_matrix;
var u_fbm_texture_0_sampler;
var u_fbm_time;
var fbm_time = 0.0;

function InitializeFBMTextureShader() {
    var textureVertexShaderSource =
        "#version 300 es" +
        "\n" +
        "in vec4 v_position;\n" +
        "in vec2 v_texcoord;\n" +
        "uniform mat4 u_model_matrix;\n" +
        "uniform int u_use_model_matrix;\n" +
        "uniform mat4 u_view_matrix;\n" +
        "uniform mat4 u_projection_matrix;\n" +
        "out vec2 out_texcoord;\n" +
        "void main(void)\n" +
        "{\n" +
        "if (u_use_model_matrix==1)\n" +
        "{\n" +
        "	gl_Position = u_projection_matrix * u_view_matrix * u_model_matrix * v_position;\n" +
        "}\n" +
        "else\n" +
        "{\n" +
        "	gl_Position = v_position;\n" +
        "}\n" +
        "out_texcoord = v_texcoord;\n" +
        "}";

    fbm_texture_vertex_shader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(fbm_texture_vertex_shader, textureVertexShaderSource);
    gl.compileShader(fbm_texture_vertex_shader);

    if (gl.getShaderParameter(fbm_texture_vertex_shader, gl.COMPILE_STATUS) == false) {
        var error = gl.getShaderInfoLog(fbm_texture_vertex_shader);

        if (error.length > 0) {
            alert("Error in Texture Vertex Shader:");
            alert(error);
            uninitialize();
            return -1;
        }
    }


    var textureFragmentShaderSource =
        "#version 300 es" +
        "\n" +
        "precision highp float;" +
        "in vec2 out_texcoord;" +
        "uniform sampler2D u_texture_0_sampler;" +
        "uniform int u_time;" +
        "out vec4 FragColor;" +
        "float random (in vec2 _st) {\n" +
        "    return fract(sin(dot(_st.xy, vec2(12.9898,78.233))) * 4758.5453123);\n" +
        "}\n" +
        "float noise (in vec2 _st) {\n" +
        "    vec2 i = floor(_st);\n" +
        "    vec2 f = fract(_st);\n" +
        "    float a = random(i);\n" +
        "    float b = random(i + vec2(1.0, 0.0));\n" +
        "    float c = random(i + vec2(0.0, 1.0));\n" +
        "    float d = random(i + vec2(1.0, 1.0));\n" +
        "    vec2 u = f * f * (3.0 - 2.0 * f);\n" +
        "    return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;\n" +
        "}\n" +
        "#define NUM_OCTAVES 5\n" +
        "float fbm (in vec2 _st) {\n" +
        "    float v = 0.0;\n" +
        "    float a = 0.5;\n" +
        "    vec2 shift = vec2(100.0);\n" +
        "    mat2 rot = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.5));\n" +
        "    for (int i = 0; i < NUM_OCTAVES; ++i) {\n" +
        "        v += a * noise(_st);\n" +
        "        _st = rot * _st * 2.0 + shift;\n" +
        "        a *= 0.5;\n" +
        "    }\n" +
        "    return v;\n" +
        "}\n" +
        "void main(void)\n" +
        "{\n" +
        "vec2 st = gl_FragCoord.xy / vec2(800.0, 600.0) * 1.0;\n" +
        "st += st * abs(sin(float(u_time) * 0.1) * 3.0);\n" +
        "vec3 color = vec3(0.0);\n" +
        "vec2 q = vec2(0.0);\n" +
        "q.x = fbm(st + 0.1 * float(u_time));\n" +
        "q.y = fbm(st + vec2(1.0));\n" +
        "vec2 r = vec2(0.0);\n" +
        "r.x = fbm(st + 1.0 * q + vec2(1.7, 9.2) + 0.15 * float(u_time));\n" +
        "r.y = fbm(st + 1.0 * q + vec2(8.3, 2.8) + 0.126 * float(u_time));\n" +
        "float f = fbm(st + r);\n" +
        "color = mix(vec3(0.301961, 0.919608, 0.666667), vec3(0.666667, 0.666667, 0.8039), clamp((f * f) * 4.0, 0.0, 1.0));\n" +
        "color = mix(color, vec3(0, 0.1, 0.164706), clamp(length(q), 0.0, 1.0));\n" +
        "color = mix(color, vec3(0.666667, 1.0, 1.0), clamp(length(r.x), 0.0, 1.0));\n" +
        "vec4 FBMColor = vec4((f * f * f + 0.6 * f * f + 0.5 * f) * color, 0.1);\n" +
        "vec4 imgcolor = texture(u_texture_0_sampler, out_texcoord);\n" +
        "FragColor = mix(FBMColor, imgcolor, 0.8);\n" +
        "}";

    fbm_texture_fragment_shader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fbm_texture_fragment_shader, textureFragmentShaderSource);
    gl.compileShader(fbm_texture_fragment_shader);

    if (gl.getShaderParameter(fbm_texture_fragment_shader, gl.COMPILE_STATUS) == false) {
        var error = gl.getShaderInfoLog(fbm_texture_fragment_shader);

        if (error.length > 0) {
            alert("Error in Texture Fragment Shader:");
            console.log(error);
            alert(error);
            uninitialize();
            return -1;
        }
    }

    fbm_texture_shader_program = gl.createProgram();
    gl.attachShader(fbm_texture_shader_program, fbm_texture_vertex_shader);
    gl.attachShader(fbm_texture_shader_program, fbm_texture_fragment_shader);
    gl.bindAttribLocation(fbm_texture_shader_program, WebGLMacros.AMC_ATTRIBUTE_VERTEX, "v_position");
    gl.bindAttribLocation(fbm_texture_shader_program, WebGLMacros.AMC_ATTRIBUTE_TEXTURE0, "v_texcoord");
    gl.linkProgram(fbm_texture_shader_program);

    if (!gl.getProgramParameter(fbm_texture_shader_program, gl.LINK_STATUS)) {
        var error = gl.getProgramInfoLog(fbm_texture_shader_program);

        if (error.length > 0) {
            alert(error);
            uninitialize();
            return -1;
        }
    }

    u_fbm_model_matrix = gl.getUniformLocation(fbm_texture_shader_program, "u_model_matrix");
    u_fbm_use_model_matrix = gl.getUniformLocation(fbm_texture_shader_program, "u_use_model_matrix");
    u_fbm_view_matrix = gl.getUniformLocation(fbm_texture_shader_program, "u_view_matrix");
    u_fbm_projection_matrix = gl.getUniformLocation(fbm_texture_shader_program, "u_projection_matrix");
    u_fbm_texture_0_sampler = gl.getUniformLocation(fbm_texture_shader_program, "u_texture_0_sampler");
    u_fbm_time = gl.getUniformLocation(fbm_texture_shader_program, "u_time");

}

function RenderWithFBMTextureShaderMVP(model_matrix, view_matrix, projection_matrix, texture_obj, texture_0_sampler) {
    gl.useProgram(fbm_texture_shader_program);
    gl.uniform1i(u_fbm_use_model_matrix, 1);
    gl.uniformMatrix4fv(u_fbm_model_matrix, false, model_matrix);
    gl.uniformMatrix4fv(u_fbm_view_matrix, false, view_matrix);
    gl.uniformMatrix4fv(u_fbm_projection_matrix, false, projection_matrix);
    gl.uniform1i(u_fbm_time, fbm_time);
    fbm_time += 0.1;
    
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture_obj);
    gl.uniform1i(u_fbm_texture_0_sampler, texture_0_sampler);
    
    QuadRendererXY();
    
    gl.useProgram(null);
    
}


function RenderWithFBMTextureShader(texture_obj, texture_0_sampler) {
    gl.useProgram(fbm_texture_shader_program);
    gl.uniform1i(u_fbm_use_model_matrix, 0);
    gl.uniform1i(u_fbm_time, fbm_time);
    fbm_time += 0.001;

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture_obj);
    gl.uniform1i(u_fbm_texture_0_sampler, texture_0_sampler);

    QuadRendererXY();

    gl.useProgram(null);

}


function UninitializeFBMTextureShader() {
    if (fbm_texture_shader_program) {
        if (fbm_texture_fragment_shader) {
            gl.detachShader(fbm_texture_shader_program, fbm_texture_fragment_shader);
            gl.deleteShader(fbm_texture_fragment_shader);
            fbm_texture_fragment_shader = null;
        }

        if (fbm_texture_vertex_shader) {
            gl.detachShader(fbm_texture_shader_program, fbm_texture_vertex_shader);
            gl.deleteShader(fbm_texture_vertex_shader);
            fbm_texture_vertex_shader = null;
        }

        gl.deleteProgram(fbm_texture_shader_program);
        fbm_texture_shader_program = null;
    }
}