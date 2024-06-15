var grass_shaderProgramObject = null;

var grass_vao = null;

var grass_projectionMatrixUniform;
var grass_viewMatrixUniform;
var grass_modelMatrixUniform;
var grass_alphaUniform;
var grass_textureSamplerUniform;

var grass_viewMatrix;
var grass_modelMatrix;

var grass_texture = null;

var greass_time;

const BLADE_WIDTH = 0.1
const BLADE_HEIGHT = 0.8
const BLADE_HEIGHT_VARIATION = 0.6
const BLADE_VERTEX_COUNT = 5
const BLADE_TIP_OFFSET = 0.1

function interpolate(val, oldMin, oldMax, newMin, newMax) {
  return ((val - oldMin) * (newMax - newMin)) / (oldMax - oldMin) + newMin
}

// Grass blade generation, covered in https://smythdesign.com/blog/stylized-grass-webgl
// TODO: reduce vertex count, optimize & possibly move to GPU
function computeBlade(center, index = 0) {
    const height = BLADE_HEIGHT + Math.random() * BLADE_HEIGHT_VARIATION
    const vIndex = index * BLADE_VERTEX_COUNT

    // Randomize blade orientation and tip angle
    const yaw = Math.random() * Math.PI * 2
    const yawVec = [Math.sin(yaw), 0, -Math.cos(yaw)]
    const bend = Math.random() * Math.PI * 2
    const bendVec = [Math.sin(bend), 0, -Math.cos(bend)]

    // Calc bottom, middle, and tip vertices
    const bl = yawVec.map((n, i) => n * (BLADE_WIDTH / 2) * 1 + center[i])
    const br = yawVec.map((n, i) => n * (BLADE_WIDTH / 2) * -1 + center[i])
    const tl = yawVec.map((n, i) => n * (BLADE_WIDTH / 4) * 1 + center[i])
    const tr = yawVec.map((n, i) => n * (BLADE_WIDTH / 4) * -1 + center[i])
    const tc = bendVec.map((n, i) => n * BLADE_TIP_OFFSET + center[i])

    // Attenuate height
    tl[1] += height / 2
    tr[1] += height / 2
    tc[1] += height

    return {
      positions: bl.concat(br, tr, tl, tc),
      indices: [
        vIndex,
        vIndex + 1,
        vIndex + 2,
        vIndex + 2,
        vIndex + 4,
        vIndex + 3,
        vIndex + 3,
        vIndex,
        vIndex + 2
      ]
    }
  }



function grass_initialize() {
    // Code

    // Vertex shader
    const vertexShaderSourceCode = /* glsl */ `
        #version 300 es
        in vec3 vPosition;
        in vec2 vUv;
        in vec3 vNormal;
        uniform float uTime;

        float wave(float waveSize, float tipDistance, float centerDistance) {
          // Tip is the fifth vertex drawn per blade
          bool isTip = (gl_VertexID + 1) % 5 == 0;
      
          float waveDistance = isTip ? tipDistance : centerDistance;
          return sin((uTime / 500.0) + waveSize) * waveDistance;
        }
      
        void main() {
          vPosition = position;
          vUv = uv;
          vNormal = normalize(normalMatrix * normal);
      
          if (vPosition.y < 0.0) {
            vPosition.y = 0.0;
          } else {
            vPosition.x += wave(uv.x * 10.0, 0.3, 0.1);      
          }
      
          gl_Position = projectionMatrix * modelViewMatrix * vec4(vPosition, 1.0);
        }
      `

    let vertexShaderObject = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShaderObject, vertexShaderSourceCode);
    gl.compileShader(vertexShaderObject);
    if (gl.getShaderParameter(vertexShaderObject, gl.COMPILE_STATUS) == false) {
        var error = gl.getShaderInfoLog(vertexShaderObject);
        if (error.length > 0) {
            var log = "Vertex Shader Compilation Error : " + error;
            alert(log);
            grass_uninitialize();
        }
    }
    else {
        console.log("Vertex Shader Compile Successfully...\n");
    }

    // Fragment shader
     const fragmentShaderSourceCode = /* glsl */ `
        "#version 300 es" +
        uniform sampler2D uCloud;

        in vec3 vPosition;
        in vec2 vUv;
        in vec3 vNormal;
        vec3 green = vec3(0.2, 0.6, 0.3);
        void main() {
            vec3 color = mix(green * 0.7, green, vPosition.y);
            color = mix(color, texture2D(uCloud, vUv).rgb, 0.4);
        
            float lighting = normalize(dot(vNormal, vec3(10)));
            gl_FragColor = vec4(color + lighting * 0.03, 1.0);
        }
     `;

    let fragmentShaderObject = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShaderObject, fragmentShaderSourceCode);
    gl.compileShader(fragmentShaderObject);
    if (gl.getShaderParameter(fragmentShaderObject, gl.COMPILE_STATUS) == false) {
        var error = gl.getShaderInfoLog(fragmentShaderObject);
        if (error.length > 0) {
            var log = "Fragment Shader Compilation Error : " + error;
            alert(log);
            grass_uninitialize();
        }
    }
    else {
        console.log("Fragment Shader Compile Successfully...\n");
    }

    // Shader program
    grass_shaderProgramObject = gl.createProgram();
    gl.attachShader(grass_shaderProgramObject, vertexShaderObject);
    gl.attachShader(grass_shaderProgramObject, fragmentShaderObject);

    // Pre link binding
    gl.bindAttribLocation(grass_shaderProgramObject, WebGLMacros.AMC_ATTRIBUTE_VERTEX, "vPosition");
    gl.bindAttribLocation(grass_shaderProgramObject, WebGLMacros.AMC_ATTRIBUTE_TEXTURE0, "vUv");
    gl.bindAttribLocation(grass_shaderProgramObject, WebGLMacros.AMC_ATTRIBUTE_NORMAL, "vNormal");

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

    grass_projectionMatrixUniform = gl.getUniformLocation(grass_shaderProgramObject, "uProjectionMatrix");
    grass_viewMatrixUniform = gl.getUniformLocation(grass_shaderProgramObject, "uViewMatrix");
    grass_modelMatrixUniform = gl.getUniformLocation(grass_shaderProgramObject, "uModelMatrix");
    grass_alphaUniform = gl.getUniformLocation(grass_shaderProgramObject, "uAlpha");
    grass_textureSamplerUniform = gl.getUniformLocation(grass_shaderProgramObject, "uTextureSampler");

    // Create texture
    grass_loadGLTexture();

    // Create grass blead
    const positions = []
    const uvs = []
    const indices = []
    const normals = []

    for (let i = 0; i < count; i++) {
      const surfaceMin = (size / 2) * -1
      const surfaceMax = size / 2
      const radius = (size / 2) * Math.random()
      const theta = Math.random() * 2 * Math.PI

      const x = radius * Math.cos(theta)
      const y = radius * Math.sin(theta)

      //   uvs.push(
      //     ...Array.from({ length: BLADE_VERTEX_COUNT }).flatMap(() => [
      //       interpolate(x, surfaceMin, surfaceMax, 0, 1),
      //       interpolate(y, surfaceMin, surfaceMax, 0, 1)
      //     ])
      //   )
      for (let i = 0; i < BLADE_VERTEX_COUNT; i++) {
        uvs.push(interpolate(x, surfaceMin, surfaceMax, 0, 1));
        uvs.push(interpolate(y, surfaceMin, surfaceMax, 0, 1));
      }

      const blade = computeBlade([x, 0, y], i)
      //   positions.push(...blade.positions)
      //   indices.push(...blade.indices)
      blade.positions.forEach(position => {
        positions.push(position);
      });
      
      blade.indices.forEach(index => {
        indices.push(index);
      });
    }

    if (positionAttribute !== undefined) {
        let normalAttribute = this.getAttribute('normal');

        if (normalAttribute === undefined) {
            normalAttribute = new BufferAttribute(new Float32Array(positionAttribute.count * 3), 3);
            this.setAttribute('normal', normalAttribute);
        } else {
            // reset existing normals to zero
            for (let i = 0, il = normalAttribute.count; i < il; i++) {
                normalAttribute.setXYZ(i, 0, 0, 0);
            }
        }

        const pA = new Vector3(),
                    pB = new Vector3(),
                    pC = new Vector3();
        const nA = new Vector3(),
                    nB = new Vector3(),
                    nC = new Vector3();
        const cb = new Vector3(),
                    ab = new Vector3(); // indexed elements

        if (index) {
            for (let i = 0, il = index.count; i < il; i += 3) {
                const vA = index.getX(i + 0);
                const vB = index.getX(i + 1);
                const vC = index.getX(i + 2);
                pA.fromBufferAttribute(positionAttribute, vA);
                pB.fromBufferAttribute(positionAttribute, vB);
                pC.fromBufferAttribute(positionAttribute, vC);
                cb.subVectors(pC, pB);
                ab.subVectors(pA, pB);
                cb.cross(ab);
                nA.fromBufferAttribute(normalAttribute, vA);
                nB.fromBufferAttribute(normalAttribute, vB);
                nC.fromBufferAttribute(normalAttribute, vC);
                nA.add(cb);
                nB.add(cb);
                nC.add(cb);
                normalAttribute.setXYZ(vA, nA.x, nA.y, nA.z);
                normalAttribute.setXYZ(vB, nB.x, nB.y, nB.z);
                normalAttribute.setXYZ(vC, nC.x, nC.y, nC.z);
            }
        } else {
            // non-indexed elements (unconnected triangle soup)
            for (let i = 0, il = positionAttribute.count; i < il; i += 3) {
                pA.fromBufferAttribute(positionAttribute, i + 0);
                pB.fromBufferAttribute(positionAttribute, i + 1);
                pC.fromBufferAttribute(positionAttribute, i + 2);
                cb.subVectors(pC, pB);
                ab.subVectors(pA, pB);
                cb.cross(ab);
                normalAttribute.setXYZ(i + 0, cb.x, cb.y, cb.z);
                normalAttribute.setXYZ(i + 1, cb.x, cb.y, cb.z);
                normalAttribute.setXYZ(i + 2, cb.x, cb.y, cb.z);
            }
        }

        this.normalizeNormals();

     // Setup vao and vbo
     grass_vao = gl.createVertexArray();
     gl.bindVertexArray(grass_vao);
     
     // Position
     grass_vbo_position = gl.createBuffer();
     gl.bindBuffer(gl.ARRAY_BUFFER, grass_vbo_position);
     gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
     gl.vertexAttribPointer(WebGLMacros.AMC_ATTRIBUTE_VERTEX, 3, gl.FLOAT, false, 0, 0);
     gl.enableVertexAttribArray(WebGLMacros.AMC_ATTRIBUTE_VERTEX);
     gl.bindBuffer(gl.ARRAY_BUFFER, null);
 
     // Texcoords
     grass_vbo_texture = gl.createBuffer();
     gl.bindBuffer(gl.ARRAY_BUFFER, grass_vbo_texture);
     gl.bufferData(gl.ARRAY_BUFFER, uvs, gl.STATIC_DRAW);
     gl.vertexAttribPointer(WebGLMacros.AMC_ATTRIBUTE_TEXTURE0, 2, gl.FLOAT, false, 0, 0);
     gl.enableVertexAttribArray(WebGLMacros.AMC_ATTRIBUTE_TEXTURE0);
     gl.bindBuffer(gl.ARRAY_BUFFER, null);
 
     // Normals
     grass_vbo_normals = gl.createBuffer();
     gl.bindBuffer(gl.ARRAY_BUFFER, grass_vbo_normals);
     gl.bufferData(gl.ARRAY_BUFFER, normals, gl.STATIC_DRAW);
     gl.vertexAttribPointer(WebGLMacros.AMC_ATTRIBUTE_NORMAL, 3, gl.FLOAT, false, 0, 0);
     gl.enableVertexAttribArray(WebGLMacros.AMC_ATTRIBUTE_NORMAL);
     gl.bindBuffer(gl.ARRAY_BUFFER, null);
 
     // Indices
     grass_vbo_indices = gl.createBuffer();
     gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, grass_vbo_indices);
     gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);
     gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
     
     gl.bindVertexArray(null);

    console.log("Grasss initialized");
}




function grass_loadGLTexture() {
    grass_texture_Grass = gl.createTexture();
    if (!grass_texture_Grass) {
        console.log("createTexture() : Failed !!!\n");
        alert(log);
    }

    grass_texture_Grass.image = new Image();
    if (!grass_texture_Grass.image) {
        console.log("Failed to create Image object !!!\n");
        alert(log);
    }

    grass_texture_Grass.image.onload = function () {
        console.log('Texture loaded successfully.')
        console.log(grass_texture_Grass.image)

        gl.bindTexture(gl.TEXTURE_2D, grass_texture_Grass);
        
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, grass_texture_Grass.image);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        
        gl.bindTexture(gl.TEXTURE_2D, null);
    }
    grass_texture_Grass.image.src = "src\\resources\\textures\\Grass.png";
}

function grass_display() {
    // Code
    grass_update();
    
    //init_gl();
    gl.depthMask(false);

    gl.enable(gl.BLEND);
    gl.blendEquation(gl.FUNC_ADD);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE);

    gl.enable(gl.PROGRAM_POINT_SIZE);
    gl.enable(gl.POINT_SPRITE);

    gl.useProgram(grass_shaderProgramObject);

    // Transformation
    grass_viewMatrix = mat4.create();
    grass_modelMatrix = mat4.create();

    grass_viewMatrix = GetCameraViewMatrix();

    gl.uniformMatrix4fv(grass_projectionMatrixUniform, false, perspectiveProjectionMatrix);
    gl.uniformMatrix4fv(grass_viewMatrixUniform, false, grass_viewMatrix);

    // Draw
    mat4.translate(grass_modelMatrix, grass_modelMatrix, [0.0, -90.0, -5.0]);
    mat4.rotateY(grass_modelMatrix, grass_modelMatrix, degToRad(90.0));
    drawArch(grass_arch, grass_modelMatrix);

    gl.useProgram(null);

    // Restore the states of OpenGL
    gl.depthMask(true);
    gl.disable(gl.BLEND);
    gl.disable(gl.PROGRAM_POINT_SIZE);
    gl.disable(gl.POINT_SPRITE);

    // Double buffering
    requestAnimationFrame(grass_display, canvas);
}

function grass_update() {
    // Code
    //updateGrass(Grass);
    greass_time += 0.1;
}


function drawGrass(p, grass_modelMatrix) {
    // For texture
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, grass_texture_Grass);
    gl.uniform1i(grass_textureSamplerUniform, 0);

    gl.bindVertexArray(grass_vao);

    let destModelMatrix = mat4.create();
    for (let i = 0; i < p.length; ++i) {
        mat4.identity(destModelMatrix);
        if (p[i].wait <= 0) {
            mat4.translate(destModelMatrix, grass_modelMatrix, [p[i].position[0], p[i].position[1], p[i].position[2]]);

            gl.uniformMatrix4fv(grass_modelMatrixUniform, false, destModelMatrix);
            gl.uniform1f(grass_alphaUniform, p[i].alpha);
            
            gl.drawArrays(gl.POINTS, 0, 1);
        }
    }

    gl.bindVertexArray(null);

    // Unbind texture
    gl.bindTexture(gl.TEXTURE_2D, null);
}

function grass_uninitialize() {
    // Code
    if (grass_shaderProgramObject) { // It can be if(grass_shaderProgramObject == null)
        gl.useProgram(grass_shaderProgramObject);

        let shaderObjects = gl.getAttachedShaders(grass_shaderProgramObject);
        if (shaderObjects && shaderObjects.length > 0) {
            for (let i = 0; i < shaderObjects.length; i++) {
                gl.detachShader(grass_shaderProgramObject, shaderObjects[i]);
                gl.deleteShader(shaderObjects[i]);
                shaderObjects[i] = null;
            }
        }

        gl.useProgram(null);

        gl.deleteProgram(grass_shaderProgramObject);
        grass_shaderProgramObject = null;
    }

    if (grass_texture_Grass) {
        gl.deleteTexture(grass_texture_Grass);
        grass_texture_Grass = null;
    }

    if (grass_vao) {
        gl.deleteVertexArray(grass_vao);
        grass_vao = null;
    }
}