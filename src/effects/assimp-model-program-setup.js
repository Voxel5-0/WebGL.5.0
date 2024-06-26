var pMatUnifromForAssimpModel;
var vMatUnifromForAssimpModel;
var mMatUnifromForAssimpModel;
var bMatUnifromForAssimpModel;
var viewPosUnifromForAssimpModel;
var diffuseUnifromForAssimpModel;
var isStaticUniformForAssimpModel;
var isInstancedUniformForAssimpModel;

//Model view matrices are not used for point lights remove later
//var ptL_modelMatrixUniform, ptL_viewMatrixUniform, ptL_projectionMatrixUniform;
var ptL_viewPosUniform;
var ptL_materialDiffuseUniform,ptL_materialSpecularUniform,ptL_materialShininessUniform;
var pointLightUniforms = [];

function initAssimpModelShader(pointLightsCount) {
    setupProgram(pointLightsCount);
	gl.enable(gl.DEPTH_TEST);
    for(i = 0; i<modelList.length;i++){
        models[i] = initalizeModel(modelList[i].name,modelList,i);
    }

}

function renderAssimpModelWithInstancing(modelMatrixArray,modelNumber, pointLightsCount ,lightPositions,lightColors){
	gl.useProgram(program)
	gl.uniformMatrix4fv(pMatUnifromForAssimpModel, false, perspectiveProjectionMatrix)
	gl.uniformMatrix4fv(vMatUnifromForAssimpModel, false, GetCameraViewMatrix())
	gl.uniform3fv(viewPosUnifromForAssimpModel, GetCameraPosition())
    gl.uniform1i(isStaticUniformForAssimpModel, 0)
	for (let i = 0; i < pointLightsCount; i++) {
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
	
	//For instancing we are passing array of model matrix
	//gl.uniformMatrix4fv(mMatUnifromForAssimpModel, false, modelMatrix)
	gl.uniform3fv(ptL_viewPosUniform, [0.0, 0.0, 5.0]);
	// if(modelList[modelNumber].isInstanced){
		//gl.uniformMatrix4fv(mMatUnifromForAssimpModel[0], false,modelMatrixArray[0])
		for (let i = 0; i < modelList[modelNumber].instanceCount ; i++) {
			var modelMatrixForInst = mat4.create();
			modelMatrixForInst = modelMatrixArray[i];
			gl.uniformMatrix4fv(mMatUnifromForAssimpModel[i], false,modelMatrixForInst)
		}
		//renderModel(models[modelNumber])
		renderModelWithInstancing(models[modelNumber] , modelList[modelNumber].instanceCount)
	// }
    gl.useProgram(null)
}

function renderAssimpModel(modelMatrix,modelNumber, pointLightsCount ,lightPositions,lightColors){
    gl.useProgram(program)
	gl.uniformMatrix4fv(pMatUnifromForAssimpModel, false, perspectiveProjectionMatrix)
	gl.uniformMatrix4fv(vMatUnifromForAssimpModel, false, GetCameraViewMatrix())
	gl.uniform3fv(viewPosUnifromForAssimpModel, GetCameraPosition())
    //TODO : commented code is for dynamic model
    // if(!modelList[i].isStatic) {
    //   updateModel(models[i], 0, 0.01)
    //     var boneMat = getBoneMatrixArray(models[i], 0)
    //     for(var i = 0; i < boneMat.length; i++) {
    //         gl.uniformMatrix4fv(bMatUnifromForAssimpModel[i], false, boneMat[i])
    //     }
    //     gl.uniform1i(isStaticUniformForAssimpModel, 1)
    //     renderModel(models[i])
    // } else {
	// Above code is commented and unifrom value is passes 0 by default to use Static Model
    gl.uniform1i(isStaticUniformForAssimpModel, 0)
	//gl.uniform1i(isInstancedUniformForAssimpModel,modelList[modelNumber].isInstanced);
    //renderModel(vampire)
	
    // }
	//console.log("rendered model "+modelNumber);
	for (let i = 0; i < pointLightsCount; i++) {
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
	
	//For instancing we are passing array of model matrix
	//gl.uniformMatrix4fv(mMatUnifromForAssimpModel, false, modelMatrix)
	gl.uniform3fv(ptL_viewPosUniform, [0.0, 0.0, 5.0]);
	// if(modelList[modelNumber].isInstanced){
	// 	//gl.uniformMatrix4fv(mMatUnifromForAssimpModel[0], false,modelMatrix[0])
	// 	for (var i = 0; i < modelList[modelNumber].instanceCount ; i++) {
	// 		var modelMatrixForInst = mat4.create();
	// 		modelMatrixForInst = modelMatrix[i];
	// 		gl.uniformMatrix4fv(mMatUnifromForAssimpModel[i], false,modelMatrixForInst)
	// 	}
	// 	renderModelWithInstancing(models[modelNumber] , modelList[modelNumber].instanceCount)
	// }else{
		gl.uniformMatrix4fv(mMatUnifromForAssimpModel[0], false,modelMatrix)
		renderModel(models[modelNumber])
	// }
	
	

    gl.useProgram(null)
}

function setupProgram(pointLightsCount) {
    var vertexShaderSourceCode = "";
    var fragmentShaderSourceCode = "";

	var vertShader = createShader('src\\shaders\\assimp-model.vert', gl.VERTEX_SHADER);
	var fragShader = createShader('src\\shaders\\assimp-model.frag', gl.FRAGMENT_SHADER);
	program = createProgram([vertShader, fragShader]);
	deleteShader(vertShader);
	deleteShader(fragShader);

	pMatUnifromForAssimpModel = gl.getUniformLocation(program, "pMat")
	vMatUnifromForAssimpModel = gl.getUniformLocation(program, "vMat")
	//mMatUnifromForAssimpModel = gl.getUniformLocation(program, "mMat")
	mMatUnifromForAssimpModel = []
	for (var i = 0; i < 100; i++) {
		mMatUnifromForAssimpModel.push(gl.getUniformLocation(program, "mMat[" + i + "]"))
	}

	bMatUnifromForAssimpModel = []
	for(var i = 0; i < 100; i++) {
		bMatUnifromForAssimpModel.push(gl.getUniformLocation(program, "bMat["+i+"]"))
	}
	viewPosUnifromForAssimpModel = gl.getUniformLocation(program, "viewPos")
	diffuseUnifromForAssimpModel = gl.getUniformLocation(program, "diffuse")
	isStaticUniformForAssimpModel = gl.getUniformLocation(program, "isStatic")
	//isInstancedUniformForAssimpModel = gl.getUniformLocation(program, "isInstanced")

	//Uniform Locations For Point Light
	//ptL_modelMatrixUniform = gl.getUniformLocation(program, "mMat");
	//ptL_viewMatrixUniform = gl.getUniformLocation(program, "vMat");
	//ptL_projectionMatrixUniform = gl.getUniformLocation(program, "pMat");
	//ptL_viewPosUniform = gl.getUniformLocation(program, "viewPos");

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

	for (let i = 0; i < pointLightsCount; i++) {
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
	var shader = gl.createShader(shaderType)
	var xhr = new XMLHttpRequest()
	xhr.open("GET", filename, false)
	xhr.overrideMimeType("text/plain")
	xhr.send()
	gl.shaderSource(shader, xhr.responseText)
	gl.compileShader(shader)
	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		console.log(gl.getShaderInfoLog(shader))
	}
	return shader
}

function deleteShader(shader) {
	gl.deleteShader(shader)
}

function createProgram(shaders) {
	var program = gl.createProgram()
	for (var i = 0; i < shaders.length; i++) {
		gl.attachShader(program, shaders[i])
	}
	gl.linkProgram(program)
	if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
		console.log(gl.getProgramInfoLog(program))
	}
	for (var i = 0; i < shaders.length; i++) {
		gl.detachShader(program, shaders[i])
	}
	return program
}

function deleteProgram(program) {
	gl.deleteProgram(program)
}

function loadTexture(path, isTexFlipped) {
	var tbo = gl.createTexture()
	tbo.image = new Image()
	tbo.image.src = path
	tbo.image.onload = function() {
		gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, isTexFlipped)
		gl.bindTexture(gl.TEXTURE_2D, tbo)
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR)
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, tbo.image)
		gl.generateMipmap(gl.TEXTURE_2D)
		//console.log("Texture :" + path)
	}
	return tbo
}