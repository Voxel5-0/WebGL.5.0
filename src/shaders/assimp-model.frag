#version 300 es

precision highp float;

in vec2 Tex;
in vec3 N;
in vec3 P;

uniform vec3 viewPos;

uniform sampler2D diffuse;

//Point Light Uniforms
struct Material {
    sampler2D diffuse;
    sampler2D specular;
    float shininess;
};
struct PointLight {
    vec3 position;
    float constant;
    float linear;
    float quadratic;
    vec3 ambient;
    vec3 diffuse;
    vec3 specular;
};  
uniform PointLight pointLights[8];
uniform Material material;

out vec4 color;

void main(void) {
	vec3 normal = normalize(N);
	vec3 lightDir = normalize(vec3(0.0, 0.0, 100.0) - P);
	vec3 viewDir = normalize(viewPos - P);
	vec3 reflectVec = reflect(-lightDir, normal);
	vec3 matcolor = vec3(texture(diffuse, Tex));

	vec3 result = 0.1 * matcolor + max(dot(normal, lightDir), 0.0) * matcolor + pow(max(dot(reflectVec, viewDir), 0.0), 129.0) * vec3(0.7);    
	//color = vec4(0.1 * matcolor + max(dot(normal, lightDir), 0.0) * matcolor + pow(max(dot(reflectVec, viewDir), 0.0), 129.0) * vec3(0.7), 1.0);

    for (int i = 0; i < 8; i++) {
        vec3 lightDir2 = normalize(pointLights[i].position - P);
        float diff = max(dot(normal, lightDir2), 0.0);
        vec3 reflectDir = reflect(-lightDir2, normal);
        float spec = pow(max(dot(viewDir, reflectDir), 0.0), material.shininess);
        float distance = length(pointLights[i].position - P);
        float attenuation = 1.0 / (pointLights[i].constant + pointLights[i].linear * distance + pointLights[i].quadratic * (distance * distance));
        vec3 ambient = pointLights[i].ambient * vec3(texture(material.diffuse, Tex));
        vec3 diffuse = pointLights[i].diffuse * diff * vec3(texture(material.diffuse, Tex));
        vec3 specular = pointLights[i].specular * spec * vec3(texture(material.specular, Tex));
        ambient *= attenuation;
        diffuse *= attenuation;
        specular *= attenuation;
        result += ambient + diffuse + specular;
    }
	color =  vec4(result, 1.0);
}
