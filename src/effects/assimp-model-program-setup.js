var pMatUnifromForDeepCube;
var vMatUnifromForDeepCube;
var mMatUnifromForDeepCube;
var bMatUnifromForDeepCube;
var viewPosUnifromForDeepCube;
var diffuseUnifromForDeepCube;
var isStaticUniformForDeepCube;

var ptL_modelMatrixUniform, ptL_viewMatrixUniform, ptL_projectionMatrixUniform;
var ptL_viewPosUniform;
var ptL_materialDiffuseUniform,
  ptL_materialSpecularUniform,
  ptL_materialShininessUniform;

// Define the number of point lights
const ptL_numPointLights = 8;

// Create an array of uniforms for each point light
var pointLightUniforms = [];

function initAssimpModelShader() {
  setupProgram();
  gl.enable(gl.DEPTH_TEST);
  for (i = 0; i < modelList.length; i++) {
    models[i] = initalizeModel(modelList[i].name, modelList);
  }
}

function renderAssimpModel(modelMatrix) {
  gl.useProgram(program);
  gl.uniformMatrix4fv(
    pMatUnifromForDeepCube,
    false,
    perspectiveProjectionMatrix
  );
  gl.uniformMatrix4fv(vMatUnifromForDeepCube, false, GetCameraViewMatrix());
  gl.uniformMatrix4fv(mMatUnifromForDeepCube, false, modelMatrix);
  gl.uniform3fv(viewPosUnifromForDeepCube, GetCameraPosition());
  for (i = 0; i < models.length; i++) {
    //TODO : commented code is for dynamic model
    // if(!modelList[i].isStatic) {
    //     updateModel(models[i], 0, 0.01)
    //     var boneMat = getBoneMatrixArray(models[i], 0)
    //     for(var i = 0; i < boneMat.length; i++) {
    //         gl.uniformMatrix4fv(bMatUnifromForDeepCube[i], false, boneMat[i])
    //     }
    //     gl.uniform1i(isStaticUniformForDeepCube, 1)
    //     renderModel(models[i])
    // } else {
    gl.uniform1i(isStaticUniformForDeepCube, 0);
    //renderModel(vampire)
    renderModel(models[i]);
    // }
  }

  //Uniforms for point lights
  var lightPositions = [
    [13.21327183125484, -67.44632010003868, -4.840837788952009], //middle
    [9.958236978785187, -87.20368404972493, 4.3888549228581475], //left
    [10.240470221367731, -86.58628336655747, -14.213709470661364], //right
    [30.354274982918096, -82.16404503148408, -5.308960274678841], //middleBottom
    [10.037352469619046, -94.20165532734516, 23.91656258654752], //Left-pit
    [11.225923093363434, -95.20251447029362, -35.5777721241391], //Right-pit
    [3.519062612861857, -51.2143286217448, -10.05733734202175], //longTowerbottom
    [7.394419029927332, -37.85214289591929, -11.998835777015215], //longTowerTop
  ];

  var lightColors = [1, 0.776, 0.559];

  for (let i = 0; i < ptL_numPointLights; i++) {
    gl.uniform3fv(pointLightUniforms[i].position, lightPositions[i]);
    gl.uniform3fv(pointLightUniforms[i].ambient, [0.2, 0.2, 0.2]);
    gl.uniform3fv(pointLightUniforms[i].diffuse, lightColors);
    gl.uniform3fv(pointLightUniforms[i].specular, [2.0, 2.0, 2.0]);
    gl.uniform1f(pointLightUniforms[i].constant, 0.5);
    gl.uniform1f(pointLightUniforms[i].linear, 0.02);
    gl.uniform1f(pointLightUniforms[i].quadratic, 0.005);
  }

  gl.uniform1f(ptL_materialDiffuseUniform, 0.0);
  gl.uniform1f(ptL_materialSpecularUniform, 1.0);
  gl.uniform1f(ptL_materialShininessUniform, 32.0);

  gl.uniform3fv(ptL_viewPosUniform, [0.0, 0.0, 5.0]);

  gl.useProgram(null);
}

function setupProgram() {
  var vertexShaderSourceCode = "";
  var fragmentShaderSourceCode = "";

  var vertShader = createShader(
    "src\\shaders\\assimp-model.vert",
    gl.VERTEX_SHADER
  );
  var fragShader = createShader(
    "src\\shaders\\assimp-model.frag",
    gl.FRAGMENT_SHADER
  );
  program = createProgram([vertShader, fragShader]);
  deleteShader(vertShader);
  deleteShader(fragShader);

  pMatUnifromForDeepCube = gl.getUniformLocation(program, "pMat");
  vMatUnifromForDeepCube = gl.getUniformLocation(program, "vMat");
  mMatUnifromForDeepCube = gl.getUniformLocation(program, "mMat");
  bMatUnifromForDeepCube = [];
  for (var i = 0; i < 100; i++) {
    bMatUnifromForDeepCube.push(
      gl.getUniformLocation(program, "bMat[" + i + "]")
    );
  }
  viewPosUnifromForDeepCube = gl.getUniformLocation(program, "viewPos");
  diffuseUnifromForDeepCube = gl.getUniformLocation(program, "diffuse");
  isStaticUniformForDeepCube = gl.getUniformLocation(program, "isStatic");

  //Uniform Locations For Point Light
  ptL_modelMatrixUniform = gl.getUniformLocation(program, "mMat");
  ptL_viewMatrixUniform = gl.getUniformLocation(program, "vMat");
  ptL_projectionMatrixUniform = gl.getUniformLocation(program, "pMat");
  ptL_viewPosUniform = gl.getUniformLocation(program, "viewPos");

  ptL_materialDiffuseUniform = gl.getUniformLocation(
    program,
    "material.diffuse"
  );
  ptL_materialSpecularUniform = gl.getUniformLocation(
    program,
    "material.specular"
  );
  ptL_materialShininessUniform = gl.getUniformLocation(
    program,
    "material.shininess"
  );

  for (let i = 0; i < ptL_numPointLights; i++) {
    pointLightUniforms.push({
      position: gl.getUniformLocation(program, `pointLights[${i}].position`),
      ambient: gl.getUniformLocation(program, `pointLights[${i}].ambient`),
      diffuse: gl.getUniformLocation(program, `pointLights[${i}].diffuse`),
      specular: gl.getUniformLocation(program, `pointLights[${i}].specular`),
      constant: gl.getUniformLocation(program, `pointLights[${i}].constant`),
      linear: gl.getUniformLocation(program, `pointLights[${i}].linear`),
      quadratic: gl.getUniformLocation(program, `pointLights[${i}].quadratic`),
    });
  }
}

function createShader(filename, shaderType) {
  var shader = gl.createShader(shaderType);
  var xhr = new XMLHttpRequest();
  xhr.open("GET", filename, false);
  xhr.overrideMimeType("text/plain");
  xhr.send();
  gl.shaderSource(shader, xhr.responseText);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.log(gl.getShaderInfoLog(shader));
  }
  return shader;
}

function deleteShader(shader) {
  gl.deleteShader(shader);
}

function createProgram(shaders) {
  var program = gl.createProgram();
  for (var i = 0; i < shaders.length; i++) {
    gl.attachShader(program, shaders[i]);
  }
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.log(gl.getProgramInfoLog(program));
  }
  for (var i = 0; i < shaders.length; i++) {
    gl.detachShader(program, shaders[i]);
  }
  return program;
}

function deleteProgram(program) {
  gl.deleteProgram(program);
}

function loadTexture(path, isTexFlipped) {
  var tbo = gl.createTexture();
  tbo.image = new Image();
  tbo.image.src = path;
  tbo.image.onload = function () {
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, isTexFlipped);
    gl.bindTexture(gl.TEXTURE_2D, tbo);
    gl.texParameteri(
      gl.TEXTURE_2D,
      gl.TEXTURE_MIN_FILTER,
      gl.LINEAR_MIPMAP_LINEAR
    );
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      tbo.image
    );
    gl.generateMipmap(gl.TEXTURE_2D);
    console.log("Successfully Loaded: " + path);
  };
  return tbo;
}
