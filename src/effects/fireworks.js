var fw_shaderProgramObject = null;

var fw_particleVertexPosBuffer;
var fw_particleVertexColorBuffer;
var fw_particleVertexSizeBuffer;

var fw_gravityVector = new fw_Vector(0, -9.87, 0);

var fw_particleSystem = new fw_ParticleSystem();

var fw_explosionSoundBuffer;

var fw_rockets = [];
var fw_rocketInterval = 1000;
var fw_lastRocket = 0;

var fw_lastT = 0;
var fw_dt;

function fw_initialize() {
    // code
    // vertex shader
    var fw_vertexShaderSourceCode =
        "#version 300 es" +
        "\n" +
        "in vec3 aVertexPosition;" +
		"in vec4 aVertexColor;" +
		"in float aVertexSize;" +
		"uniform mat4 uMMatrix;" +
		"uniform mat4 uVMatrix;" +
		"uniform mat4 uPMatrix;" +
		"out vec4 vColor;" +
		"void main(void)" +
        "{" +
		"mat4 modelViewMatrix = uVMatrix * uMMatrix;" +
		"gl_Position = uPMatrix * modelViewMatrix * vec4(aVertexPosition, 1.0);" +
	    "gl_PointSize = aVertexSize;" +
		"vColor = aVertexColor;" +
		"}";

    var fw_vertexShaderObject = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(fw_vertexShaderObject, fw_vertexShaderSourceCode);
    gl.compileShader(fw_vertexShaderObject);

    if (gl.getShaderParameter(fw_vertexShaderObject, gl.COMPILE_STATUS) == false) {
        var error = gl.getShaderInfoLog(fw_vertexShaderObject);
        if (error.length > 0) {
            var log = "Vertex shader compilation error log: " + error;
            alert(log);
            fw_uninitialize();
        }
    }
    else {
        console.log("Vertex shader compiled successfully\n");
    }

    // fragment shader
    var fw_fragmentShaderSourceCode =
        "#version 300 es" +
        "\n" +
        "precision highp float;" +
        "in vec4 vColor;" +
        "out vec4 FragColor;" +
        "void main(void)" +
        "{" +
        "FragColor = vColor;" +
        "}";


    var fw_fragmentShaderObject = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fw_fragmentShaderObject, fw_fragmentShaderSourceCode);
    gl.compileShader(fw_fragmentShaderObject);

    if (gl.getShaderParameter(fw_fragmentShaderObject, gl.COMPILE_STATUS) == false) {
        var error = gl.getShaderInfoLog(fw_fragmentShaderObject);
        if (error.length > 0) {
            var log = "Fragment shader compilation error log: " + error;
            alert(log);
            fw_uninitialize();
        }
    }
    else {
        console.log("Fragment shader compiled successfully\n");
    }

    // shader program
    fw_shaderProgramObject = gl.createProgram();
    gl.attachShader(fw_shaderProgramObject, fw_vertexShaderObject);
    gl.attachShader(fw_shaderProgramObject, fw_fragmentShaderObject);

    gl.linkProgram(fw_shaderProgramObject);

    if (gl.getProgramParameter(fw_shaderProgramObject, gl.LINK_STATUS) == false) {
        var error = gl.getProgramInfoLog(fw_shaderProgramObject);
        if (error.length > 0) {
            var log = "Shader prgram linking error log: " + error;
            alert(log);
            fw_uninitialize();
        }
    }
    else {
        console.log("Shader prgram linked successfully\n");
    }

    gl.useProgram(fw_shaderProgramObject);

    fw_shaderProgramObject.vertexPositionAttribute = gl.getAttribLocation(fw_shaderProgramObject, "aVertexPosition");
    gl.enableVertexAttribArray(fw_shaderProgramObject.vertexPositionAttribute);

    fw_shaderProgramObject.vertexColorAttribute = gl.getAttribLocation(fw_shaderProgramObject, "aVertexColor");
    gl.enableVertexAttribArray(fw_shaderProgramObject.vertexColorAttribute);

    fw_shaderProgramObject.vertexSizeAttribute = gl.getAttribLocation(fw_shaderProgramObject, "aVertexSize");
    gl.enableVertexAttribArray(fw_shaderProgramObject.vertexSizeAttribute);

    fw_shaderProgramObject.pMatrixUniform = gl.getUniformLocation(fw_shaderProgramObject, "uPMatrix");
    fw_shaderProgramObject.mMatrixUniform = gl.getUniformLocation(fw_shaderProgramObject, "uMMatrix");
	fw_shaderProgramObject.vMatrixUniform = gl.getUniformLocation(fw_shaderProgramObject, "uVMatrix");

    fw_particleVertexPosBuffer = gl.createBuffer();
    //gl.bindBuffer(gl.ARRAY_BUFFER, fw_particleVertexPosBuffer);
    //gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(), gl.DYNAMIC_DRAW);

    fw_particleVertexColorBuffer = gl.createBuffer();
    //gl.bindBuffer(gl.ARRAY_BUFFER, fw_particleVertexColorBuffer);
    //gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(), gl.DYNAMIC_DRAW);

    fw_particleVertexSizeBuffer = gl.createBuffer();
    //gl.bindBuffer(gl.ARRAY_BUFFER, fw_particleVertexSizeBuffer);
    //gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(), gl.DYNAMIC_DRAW);

    gl.useProgram(null);

    // initialize projection matrix
    // pMatrix = mat4.create();

    //t = 20;
}

function fw_display(t) {
    // code

    fw_flushRockets();

    
    // call update
    fw_update();

    fw_dt = t - fw_lastT;
	fw_lastT = t;

    if (Date.now() > fw_lastRocket + fw_rocketInterval) {
        var x = -2 + 4 * Math.random(),

            r = Math.random() > 0.5 ? true : false,
            g = Math.random() > 0.5 ? true : false,
            b = Math.random() > 0.5 ? true : false,

            speed = 0.7 + 0.7 * Math.random(),

            life = 3000 + 2000 * Math.random();

            fw_rockets.push(new fw_Rocket(x, -3, speed, life, fw_particleSystem, r, g, b, fw_explosionSoundBuffer));

            fw_rocketInterval = 600 + 800 * Math.random();

            fw_lastRocket = Date.now();
    }
    for (var i = 0; i < fw_rockets.length; i++) {
        fw_rockets[i].update(fw_dt);
    }

    fw_particleSystem.update(fw_dt);

    gl.useProgram(fw_shaderProgramObject);

    var mMatrix = mat4.create();
	var vMatrix = mat4.create();
    mat4.identity(mMatrix);
	mat4.identity(vMatrix);

	var eyeVector = [0.0, 0.0, 2.0];
	var centerVector = [0.0, 0.0, 0.0];
	var upVector = [0.0, 1.0, 0.0];

    // vMatrix = GetCameraViewMatrix();
    pMatrix = perspectiveProjectionMatrix;

    mat4.translate(mMatrix, mMatrix, [0.0, 0.0, -2.0]);
    // mat4.rotateY(mMatrix, mMatrix, degToRad(90.0));
	mat4.lookAt(vMatrix, eyeVector, centerVector, upVector);
    gl.bindBuffer(gl.ARRAY_BUFFER, fw_particleVertexPosBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(fw_particleSystem.vertices), gl.STATIC_DRAW);
    gl.vertexAttribPointer(fw_shaderProgramObject.vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    gl.bindBuffer(gl.ARRAY_BUFFER, fw_particleVertexColorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(fw_particleSystem.colors), gl.STATIC_DRAW);
    gl.vertexAttribPointer(fw_shaderProgramObject.vertexColorAttribute, 4, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    gl.bindBuffer(gl.ARRAY_BUFFER, fw_particleVertexSizeBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(fw_particleSystem.sizes), gl.STATIC_DRAW);
    gl.vertexAttribPointer(fw_shaderProgramObject.vertexSizeAttribute, 1, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    gl.uniformMatrix4fv(fw_shaderProgramObject.pMatrixUniform, false, pMatrix);
	gl.uniformMatrix4fv(fw_shaderProgramObject.vMatrixUniform, false, vMatrix);
    gl.uniformMatrix4fv(fw_shaderProgramObject.mMatrixUniform, false, mMatrix);
    
    gl.drawArrays(gl.POINTS, 0, fw_particleSystem.vertices.length / 3);

    gl.useProgram(null);
}

function fw_flushRockets() {
    fw_rockets = fw_rockets.filter(function(elem) {
        return elem.alive;
    });
}

function fw_update() {
    // code
    
}

function fw_uninitialize() {
    // code

    if (fw_shaderProgramObject) {
        gl.useProgram(fw_shaderProgramObject);
        var shaderObjects = gl.getAttachedShaders(fw_shaderProgramObject);
        if (shaderObjects && shaderObjects.length > 0) {
            for (let i = 0; i < shaderObjects.length; i++) {
                gl.detachShader(fw_shaderProgramObject, shaderObjects[i]);
                gl.deleteShader(shaderObjects[i]);
                shaderObjects[i] = null;
            }
        }
        gl.useProgram(null);
        gl.deleteProgram(fw_shaderProgramObject);
        fw_shaderProgramObject = null;
    }
}


// particle-system

function fw_Particle(x, y, initialVel, gravityVec, lifetime, color, size) {
    this.pos = new fw_Vector(x, y, -1);
    this.vel = initialVel ? initialVel : new fw_Vector(0, 0, 0);

    this.lifetime = lifetime;
    this.created = Date.now();

    this.gravity = gravityVec ? gravityVec : new fw_Vector(0, 0, 0);

    this.alive = true;

    this.color = color ? color : [1.0, 1.0, 1.0, 1.0];
    this.size = size ? size : 1.0;
};

fw_Particle.prototype.revive = function(pos, vel, lifetime, gravity, color, size) {
    this.pos = pos ? pos : new fw_Vector(0, 0, 0);
    this.vel = vel ? vel : new fw_Vector(0, 0, 0);

    this.lifetime = lifetime;
    this.created = Date.now();

    this.gravity = gravity ? gravity : new fw_Vector(0, 0, 0);

    this.color = color ? color : [1.0, 1.0, 1.0, 1.0];

    this.size = size ? size : 1.0;

    this.alive = true;
};

fw_Particle.prototype.update = function(dt) {
    this.vel.add(this.gravity.clone().mul(dt / 1000));
    this.pos.add(this.vel.clone().mul(dt / 1000));
};

fw_Particle.prototype.draw = function(ctx) {
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(this.pos.i, this.pos.j, 1, 1);
};

function fw_ParticleEmitter(x, y, rate, amount, lifetime, gravityVec, direction, settings) {
    this.pos = new fw_Vector(x, y, -1);

    this.rate = rate;
    this.lastEmit = 0;

    this.amount = amount;

    this.lifetime = lifetime;
    this.created = Date.now();
    this.alive = true;

    this.gravity = gravityVec ? gravityVec : new fw_Vector(0, 0, 0);

    this.direction = direction ? direction : new fw_Vector(1, 0, 0);
    this.direction.normalize();


    this.options = {
        lifetime: 1000,
        lifeScatter: 200,

        angleScatter: Math.PI * 2,

        power: 2,
        powerScatter: 2,

        minSize: 2.0,
        maxSize: 2.0,

        minR: 1.0,
        minG: 1.0,
        minB: 1.0,
        minA: 1.0,

        maxR: 1.0,
        maxG: 1.0,
        maxB: 1.0,
        maxA: 1.0
    };

    if (settings) {
        fw_extend(this.options, settings);
    }
};

function fw_extend(a, b){
    for(var key in b)
        if(b.hasOwnProperty(key))
            a[key] = b[key];
    return a;
}

fw_ParticleEmitter.prototype.setPosition = function(x, y, z) {
    this.pos.set(x, y, z);
};

fw_ParticleEmitter.prototype.move = function(d) {
    this.pos.add(d);
};

fw_ParticleEmitter.prototype.update = function(particleSystem, dt) {
    if (Date.now() > this.lastEmit + this.rate) {
        for (var i = 0; i < this.amount; i++) {
            var newParticle = particleSystem.pool.pop();

            if (typeof newParticle === "undefined") {
                newParticle = new fw_Particle(0, 0, null, null, 0);
                particleSystem.particles.push(newParticle);
            }


            var power = fw_rand(this.options.power - this.options.powerScatter / 2, this.options.power + this.options.powerScatter / 2),
                angleScatter = fw_rand(-this.options.angleScatter / 2, this.options.angleScatter / 2),
                newVel = this.direction.clone().rotate(angleScatter).mul(power),
                size = fw_rand(this.options.minSize, this.options.maxSize),
                life = fw_rand(this.options.lifetime - this.options.lifeScatter / 2, this.options.lifetime + this.options.lifeScatter / 2),
                color = [
                    fw_rand(this.options.minR, this.options.maxR),
                    fw_rand(this.options.minG, this.options.maxG),
                    fw_rand(this.options.minB, this.options.maxB),
                    fw_rand(this.options.minA, this.options.maxA)
                ];

            newParticle.revive(this.pos.clone(), newVel, life, this.gravity, color, size);
        }

        this.lastEmit = Date.now();	
    }
};






function fw_ParticleSystem() {
    this.pool = [];
    this.particles = [];

    this.emitters = [];

    this.vertices = [];
    this.colors = [];
    this.sizes = [];
};

fw_ParticleSystem.prototype.addEmitter = function(emitter) {
    this.emitters.push(emitter);
};

fw_ParticleSystem.prototype.update = function(dt) {
    this.vertices = [];
    this.colors = [];
    this.sizes = [];

    for (var i = 0; i < this.emitters.length; i++) {
        this.emitters[i].update(this, dt);

        if (this.emitters[i].lifetime >= 0 && Date.now() > this.emitters[i].created + this.emitters[i].lifetime) {
            this.emitters[i].alive = false;
        }
    }

    this.emitters = this.emitters.filter(function(elem) {
        return elem.alive;
    });

    for (var i = 0; i < this.particles.length; i++) {
        var particle = this.particles[i];

        if (!particle.alive) {
            continue;
        }

        particle.update(dt);
        // particle.draw(ctx);

        if (Date.now() > (particle.created + particle.lifetime)) {
            this.pool.push(particle);
            particle.alive = false;
        } else {
            this.vertices = this.vertices.concat(particle.pos.toArray());
            this.colors = this.colors.concat(particle.color);
            this.sizes.push(particle.size);
        }

        
    }
};

function fw_rand(min, max) {
    if (min > max) {
        var tmp = min;
        min = max;
        max = tmp;
    }


    return min + (max - min) * Math.random();
}






// rocket
function fw_Rocket(x, y, speed, lifetime, particleSystem, r, g, b, explosionBuffer) {
    this.particleSystem = particleSystem;

    this.pos = new fw_Vector(x, y, -1);
    this.vel = new fw_Vector(0, speed, 0);

    this.lastTurn = Math.random() < 0.5 ? -1 : 1;

    this.lifetime = lifetime;
    this.created = Date.now();
    this.alive = true;

    this.r = r ? r : false;
    this.g = g ? g : false;
    this.b = b ? b : false;

    this.sparks = new fw_ParticleEmitter(x, y, 10, 2, -1, null, this.vel.clone().reverse(), {
        lifetime: 1000,
        lifeScatter: 800,

        angleScatter: Math.PI / 7,

        power: 0.2,
        powerScatter: 0,

        minSize: 1.0,
        maxSize: 1.0,

        minR: 1.0,
        minG: 0.0,
        minB: 0.0,

        maxG: 1.0,
        maxB: 0.0
    });
    this.sparks.pos = this.pos;


    particleSystem.addEmitter(this.sparks);

    this.explosionBuffer = explosionBuffer;
};

fw_Rocket.prototype.move = function(vel) {
    this.pos.add(vel);
    this.sparks.pos = this.pos.clone();
};

fw_Rocket.prototype.update = function(dt) {
    if (!this.alive) {
        return;
    }

    var turn = -this.lastTurn * 0.1 + -this.lastTurn * 0.2 * Math.random();
    this.vel.rotate(turn);

    this.lastTurn = turn < 0 ? -1 : 1;
    if (this.vel.j < 0) {
        this.vel.j = this.vel.j * -1;
    }

    this.pos.add(this.vel.clone().mul(dt / 1000));

    this.sparks.pos = this.pos.clone();
    this.sparks.direction = this.vel.clone().reverse().normalize();

    if (Date.now() > this.created + this.lifetime) {
        this.sparks.alive = false;

        var amount = 10 + 190 * Math.random();

        var explosion = new fw_ParticleEmitter(this.pos.i, this.pos.j, 0, amount, 1, null, null, {
            lifetime: 400,
            lifeScatter: 300,

            power: 2,
            powerScatter: 3 * Math.random(),

            minSize: 1.0,
            maxSize: 3.0,

            minR: this.r ? 1.0 : 0,
            minG: this.g ? 1.0 : 0,
            minB: this.b ? 1.0 : 0,

            maxR: 1.0,
            maxG: 1.0,
            maxB: 1.0
        });
        this.particleSystem.addEmitter(explosion);

        this.alive = false;

    }
};



// vector
function fw_Vector(i, j, k) {
    this.i = i ? i : 0;
    this.j = j ? j : 0;
    this.k = k ? k : 0;
}

fw_Vector.prototype.set = function(i, j, k) {
    this.i = i ? i : 0;
    this.j = j ? j : 0;
    this.k = k ? k : 0;

    return this;
};

fw_Vector.prototype.div = function(scalar) {
    this.i /= scalar;
    this.j /= scalar;
    this.k /= scalar;

    return this;
};

fw_Vector.prototype.mul = function(scalar) {
    this.i *= scalar;
    this.j *= scalar;
    this.k *= scalar;

    return this;
};

fw_Vector.prototype.add = function(vec) {
    this.i += vec.i;
    this.j += vec.j;
    this.k += vec.k;

    return this;
};

fw_Vector.prototype.sub = function(vec) {
    this.i -= vec.i;
    this.j -= vec.j;
    this.k -= vec.k;

    return this;
};

fw_Vector.prototype.length = function() {
    return Math.sqrt(this.i * this.i + this.j * this.j + this.k * this.k);
};

fw_Vector.prototype.normalize = function() {
    this.div(this.length());

    return this;
};

fw_Vector.prototype.dot = function(vec) {
    return this.i * vec.i + this.j * vec.j + this.k * vec.k;
};

fw_Vector.prototype.reverse = function() {
    this.mul(-1);

    return this;
};

fw_Vector.prototype.rotate = function(angle) {
    var tmpI = this.i,
        tmpJ = this.j,
        cos = Math.cos(angle),
        sin = Math.sin(angle);

    this.i = tmpI * cos - tmpJ * sin;
    this.j = tmpI * sin + tmpJ * cos;

    return this;
};

fw_Vector.prototype.clone = function(vec) {
    return new fw_Vector(this.i, this.j, this.k);
};

fw_Vector.prototype.toString = function() {
    return "[" + this.i + ", " + this.j + ", " + this.k + "]";
};

fw_Vector.prototype.toArray = function() {
    return [this.i, this.j, this.k];
};

fw_Vector.angle = function(vec1, vec2) {
    return Math.acos(vec1.dot(vec2) / (vec1.length() * vec2.length()));
}



