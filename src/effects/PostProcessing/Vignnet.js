var vg_texture_vertex_shader;
var vg_texture_fragment_shader;
var vg_texture_shader_program;

var u_vig_model_matrix;
var u_vig_use_model_matrix;
var u_vig_view_matrix;
var u_vig_projection_matrix;
var u_vig_texture_0_sampler;

function InitializeVignnetTextureShader() {
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

    vg_texture_vertex_shader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vg_texture_vertex_shader, textureVertexShaderSource);
    gl.compileShader(vg_texture_vertex_shader);

    if (gl.getShaderParameter(vg_texture_vertex_shader, gl.COMPILE_STATUS) == false) {
        var error = gl.getShaderInfoLog(vg_texture_vertex_shader);

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
        "out vec4 FragColor;" +
        "void main(void)\n" +
        "{\n" +
        "	float separatorWidth = 0.5;\n" +
        "   vec2 center =vec2(0.5,0.5);\n" +
        "	vec2 delta = out_texcoord-center;\n" +
        "	float distance = length(delta);\n" +
        "	float strength_n = smoothstep(0.9,0.0,distance);\n" +
        "	vec3 color = texture(u_texture_0_sampler,out_texcoord).rgb * (strength_n * 0.8);\n" +
        "	FragColor = vec4(color,1.0);\n" +
        "}";

    vg_texture_fragment_shader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(vg_texture_fragment_shader, textureFragmentShaderSource);
    gl.compileShader(vg_texture_fragment_shader);

    if (gl.getShaderParameter(vg_texture_fragment_shader, gl.COMPILE_STATUS) == false) {
        var error = gl.getShaderInfoLog(vg_texture_fragment_shader);

        if (error.length > 0) {
            alert("Error in Texture Fragment Shader:");
            alert(error);
            uninitialize();
            return -1;
        }
    }

    vg_texture_shader_program = gl.createProgram();
    gl.attachShader(vg_texture_shader_program, vg_texture_vertex_shader);
    gl.attachShader(vg_texture_shader_program, vg_texture_fragment_shader);
    gl.bindAttribLocation(vg_texture_shader_program, WebGLMacros.AMC_ATTRIBUTE_VERTEX, "v_position");
    gl.bindAttribLocation(vg_texture_shader_program, WebGLMacros.AMC_ATTRIBUTE_TEXTURE0, "v_texcoord");
    gl.linkProgram(vg_texture_shader_program);

    if (!gl.getProgramParameter(vg_texture_shader_program, gl.LINK_STATUS)) {
        var error = gl.getProgramInfoLog(vg_texture_shader_program);

        if (error.length > 0) {
            alert(error);
            uninitialize();
            return -1;
        }
    }

    u_vig_model_matrix = gl.getUniformLocation(vg_texture_shader_program, "u_model_matrix");
    u_vig_use_model_matrix = gl.getUniformLocation(vg_texture_shader_program, "u_use_model_matrix");
    u_vig_view_matrix = gl.getUniformLocation(vg_texture_shader_program, "u_view_matrix");
    u_vig_projection_matrix = gl.getUniformLocation(vg_texture_shader_program, "u_projection_matrix");
    u_vig_texture_0_sampler = gl.getUniformLocation(vg_texture_shader_program, "u_texture_0_sampler");

}

function RenderWithVignnetTextureShaderMVP(model_matrix, view_matrix, projection_matrix, texture_obj, texture_0_sampler) {
    gl.useProgram(vg_texture_shader_program);
    gl.uniform1i(u_vig_use_model_matrix, 1);
    gl.uniformMatrix4fv(u_vig_model_matrix, false, model_matrix);
    gl.uniformMatrix4fv(u_vig_view_matrix, false, view_matrix);
    gl.uniformMatrix4fv(u_vig_projection_matrix, false, projection_matrix);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture_obj);
    gl.uniform1i(u_vig_texture_0_sampler, texture_0_sampler);

    QuadRendererXY();

    gl.useProgram(null);

}


function RenderWithVignnetTextureShader(texture_obj, texture_0_sampler) {
    gl.useProgram(vg_texture_shader_program);
    gl.uniform1i(u_vig_use_model_matrix, 0);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture_obj);
    gl.uniform1i(u_vig_texture_0_sampler, texture_0_sampler);

    QuadRendererXY();

    gl.useProgram(null);

}


function UninitializeVignnetTextureShader() {
    if (vg_texture_shader_program) {
        if (vg_texture_fragment_shader) {
            gl.detachShader(vg_texture_shader_program, vg_texture_fragment_shader);
            gl.deleteShader(vg_texture_fragment_shader);
            vg_texture_fragment_shader = null;
        }

        if (vg_texture_vertex_shader) {
            gl.detachShader(vg_texture_shader_program, vg_texture_vertex_shader);
            gl.deleteShader(vg_texture_vertex_shader);
            vg_texture_vertex_shader = null;
        }

        gl.deleteProgram(vg_texture_shader_program);
        vg_texture_shader_program = null;
    }
}