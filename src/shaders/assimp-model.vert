#version 300 es

layout(location = 0)in vec4 vPos;
layout(location = 1)in vec3 vNor;
layout(location = 2)in vec2 vTex;
layout(location = 3)in ivec4 vBoneIds;
layout(location = 4)in vec4 vWeights;
layout(location = 5)in mat4 v_instance_model_matrix;

uniform mat4 pMat;
uniform mat4 vMat;
uniform mat4 mMat;
uniform mat4 bMat[100];
uniform bool isStatic;
uniform bool isInstanced;

out vec2 Tex;
out vec3 N;
out vec3 P;

void main(void) {
	if(isStatic) {
		vec4 totalPosition = vec4(0.0);
		vec3 totalNormal = vec3(0.0);
		for(int i = 0 ; i < 4; i++) {
			if(vBoneIds[i] == -1) {
				continue;
			}
			vec4 localPosition = bMat[vBoneIds[i]] * vPos;
			totalPosition += localPosition * vWeights[i];
			vec3 localNormal = mat3(bMat[vBoneIds[i]]) * vNor;
			totalNormal += localNormal;
		}
		P = vec3(mMat * totalPosition);
        N = mat3(mMat) * totalNormal;
        Tex = vTex;
        gl_Position = pMat * vMat * vec4(P, 1.0);
    } else {
		if(isInstanced){
 			P = vec3(mMat * ( v_instance_model_matrix * vPos));        	
		}else{
			P = vec3(mMat * vPos);
		}
		N = mat3(mMat) * vNor;
        Tex = vTex;
		gl_Position = pMat * vMat * vec4(P, 1.0);

    }
}
