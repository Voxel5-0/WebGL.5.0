var pMatUnifromForDeepCube;
var vMatUnifromForDeepCube;
var mMatUnifromForDeepCube;
var bMatUnifromForDeepCube;
var viewPosUnifromForDeepCube;
var diffuseUnifromForDeepCube;
var isStaticUniformForDeepCube;

function initAssimpModelShader() {
    setupProgram();
	gl.enable(gl.DEPTH_TEST);
    for(i = 0; i<modelList.length;i++){
        models[i] = initalizeModel(modelList[i].name,modelList);
    }

}

function renderAssimpModel(modelMatrix){
    gl.useProgram(program)
	gl.uniformMatrix4fv(pMatUnifromForDeepCube, false, perspectiveProjectionMatrix)
	gl.uniformMatrix4fv(vMatUnifromForDeepCube, false, GetCameraViewMatrix())
	gl.uniformMatrix4fv(mMatUnifromForDeepCube, false, modelMatrix)
	gl.uniform3fv(viewPosUnifromForDeepCube, GetCameraPosition())
    for(i=0 ; i < models.length ; i++){
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
            gl.uniform1i(isStaticUniformForDeepCube, 0)
            //renderModel(vampire)
            renderModel(models[i])
        // }
    }
    gl.useProgram(null)
}

function setupProgram() {
    var vertexShaderSourceCode = "";
    var fragmentShaderSourceCode = "";

	var vertShader = createShader('src\\shaders\\assimp-model.vert', gl.VERTEX_SHADER);
	var fragShader = createShader('src\\shaders\\assimp-model.frag', gl.FRAGMENT_SHADER);
	program = createProgram([vertShader, fragShader]);
	deleteShader(vertShader);
	deleteShader(fragShader);

	pMatUnifromForDeepCube = gl.getUniformLocation(program, "pMat")
	vMatUnifromForDeepCube = gl.getUniformLocation(program, "vMat")
	mMatUnifromForDeepCube = gl.getUniformLocation(program, "mMat")
	bMatUnifromForDeepCube = []
	for(var i = 0; i < 100; i++) {
		bMatUnifromForDeepCube.push(gl.getUniformLocation(program, "bMat["+i+"]"))
	}
	viewPosUnifromForDeepCube = gl.getUniformLocation(program, "viewPos")
	diffuseUnifromForDeepCube = gl.getUniformLocation(program, "diffuse")
	isStaticUniformForDeepCube = gl.getUniformLocation(program, "isStatic")
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
		console.log("Successfully Loaded: " + path)
	}
	return tbo
}