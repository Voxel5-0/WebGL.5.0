#version 300 es

precision highp float;

layout(location = 0)in vec4 vPos;
layout(location = 1)in vec3 vNor;
layout(location = 2)in vec2 vTex;
layout(location = 3)in ivec4 vBoneIds;
layout(location = 4)in vec4 vWeights;

uniform mat4 pMat;
uniform mat4 vMat;
uniform mat4 mMat[100];
uniform mat4 bMat[100];
uniform bool isStatic;
uniform float u_alpha[100];

out vec2 Tex;
out vec3 N;
out vec3 P;
out float alpha;
out float v_fogDepth;

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
		P = vec3(mMat[gl_InstanceID] * totalPosition);
        N = mat3(mMat[gl_InstanceID]) * totalNormal;
        Tex = vTex;
        gl_Position = pMat * vMat * vec4(P, 1.0);
    } else {
 		P = vec3(mMat[gl_InstanceID] * vPos);        	
		N = mat3(mMat[gl_InstanceID]) * vNor;
        Tex = vTex;
		gl_Position = pMat * vMat * vec4(P, 1.0);
		v_fogDepth = -(vMat * vec4(P, 1.0)).z;
		alpha = u_alpha[gl_InstanceID];
    }
}
