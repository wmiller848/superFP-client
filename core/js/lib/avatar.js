/**
 * William C Miller 2013
 */

/**
 * AvatarMaster Class is the "manager" of all avatars and their instances
 */
var AvatarMaster = function()
{
	var self = this;
	self.name = "Avatar Master: v0.0.1";
	
	self.buffer = null;
	
	self.spritePaths = [];
	self.packedSpriteSheets = [];
	self.avatars = [];
	self.userAvatar = null;
	
	self.delta = 0;
};

AvatarMaster.prototype.init = function(gl, sprites, callback, handler)
{
	var self = this;
	self.bind(gl);	
	self.handler = handler;
	console.log("Loading for Avatar " + self.name + " in " + sprites.spriteConfig);
	$.get(sprites.spriteConfig, function(json)
	{
		for(var i = 0; i < sprites.length; i++)
		{
			var buffer = {};
			buffer.name = "Packed Sprite Sheet";
			buffer.key = i;
			self.spritePaths.push(sprites[i]);	
			self.avatars.push(new Avatar());
			self.avatars[i].init(gl, sprites[i].proto, json, i);
			gl.textureManager.preloadTexture(gl, self.spritePaths[i].path, self.bindTexture, buffer, self);
			
			callback({properties : {assetType : 'sprite', name: self.avatars[i].buffer.name }} );
		}
	});	

};

AvatarMaster.prototype.bindTexture = function(bufferObject, AvatarMaster)
{
	var self = AvatarMaster;
	self.packedSpriteSheets.push(bufferObject);
}

AvatarMaster.prototype.bind = function(gl)
{
	var self = this;	
	var bufferObject = {};
   	var vertices = [];
	var textureCoords = [];
	var vertexIndices = [];
	
	bufferObject.vertexPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER,bufferObject.vertexPositionBuffer);
    vertices = 
    [
	    //x,y,z
	   -1.0, -1.0,  0.0,
	    1.0, -1.0,  0.0,
	    1.0,  1.0,  0.0,
	   -1.0,  1.0,  0.0,
	];
	
	gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(vertices),gl.STATIC_DRAW);
    bufferObject.vertexPositionBuffer.itemSize = 3;
    bufferObject.vertexPositionBuffer.numItems = 4;
	
	bufferObject.vertexIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,bufferObject.vertexIndexBuffer);
    vertexIndices = 
    [
    	0, 1, 2,      
    	0, 2, 3,
   	];
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,new Uint16Array(vertexIndices),gl.STATIC_DRAW);
    bufferObject.vertexIndexBuffer.itemSize = 1;
    bufferObject.vertexIndexBuffer.numItems = 6;
    
    bufferObject.name = "Avatar Master";
    bufferObject.instances = [];
   	bufferObject.instanceCount = 0;
    
    self.buffer = bufferObject;
    console.log(self);	
};

AvatarMaster.prototype.addInstance = function(avatarKey, options)
{
	var self = this;
	console.log('Adding Object Instance');
	for(var i = 0; i < self.avatars.length; i++)
	{	
		if(avatarKey == self.avatars[i].buffer.name)
		{
			if(options.user == true)
			{
				self.avatars[i].addInstance(options);	
				var l = self.avatars[i].buffer.instances.length;
				self.userAvatar = self.avatars[i].buffer.instances[l-1];
				console.log(self.userAvatar);
			}
			else
				self.avatars[i].addInstance(options);	
		}
	}
};

AvatarMaster.prototype.removeInstance = function(avatarKey, options)
{
	var self = this;
	console.log('Removing Object Instance');
	for(var i = 0; i < self.avatars.length; i++)
	{	
		if(avatarKey == self.avatars[i].buffer.name)
			self.avatars[i].removeInstance(options);
	}
};

AvatarMaster.prototype.input = function(e)
{
	var self = this;
	
	if(self.buffer != null)
	{
		var avatars = self.avatars;
		for(var j = 0; j < avatars.length; j++)
		{
			avatars[j].input(e);
		}
	};
};

AvatarMaster.prototype.inputNetwork = function(packet)
{
	var self = this;
	
	if(self.buffer != null)
	{
		var avatars = self.avatars;
		for(var j = 0; j < avatars.length; j++)
		{
			avatars[j].inputNetwork(packet);
		}
	};
};

AvatarMaster.prototype.update = function(timing)
{
	var self = this;
	
	if(self.buffer != null)
	{
		self.delta++;
		
		if(self.delta % 10 == 0 )
			self.updateNetwork(timing, self.userAvatar);
		
		if(self.delta > 1024)
		{
			self.delta = 0;
		}
		
		var avatars = self.avatars;
		for(var j = 0; j < avatars.length; j++)
		{
			avatars[j].animate(timing);
		}
	}
};

AvatarMaster.prototype.updateNetwork = function(timing, avatarInstance)
{
	var self = this;
	self.handler.updateNetwork(timing, avatarInstance);
};

AvatarMaster.prototype.render = function(gl, scene)
{
	var self = this;
	//console.log(self);
	if(self.buffer != null)
	{
		gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
		gl.enable(gl.BLEND);

		var shader = null, object = self.buffer;
		var camera = scene.camera;
		if(!object.vertexPositionBuffer || !object.vertexIndexBuffer) {return;}
		
		gl.useProgram(scene.shaders.texture);
		shader = scene.shaders.texture;
		
		gl.enableVertexAttribArray(shader.attribute.aVertexPosition);
		gl.bindBuffer(gl.ARRAY_BUFFER, object.vertexPositionBuffer);
		gl.vertexAttribPointer(shader.attribute.aVertexPosition, object.vertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
		
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, object.vertexIndexBuffer);
	    gl.uniformMatrix4fv(shader.uniform.uProjectionMatrix, false, camera.pMatrix);
	    gl.uniformMatrix4fv(shader.uniform.uViewMatrix, false, camera.getViewMatrix());
		
		for(var j = 0; j < self.avatars.length; j++)
		{
			if(!self.packedSpriteSheets[self.avatars[j].key]) {return;}
			
			// Bind SpriteSheet for avatar
			var texture = gl.textureManager.getTexture(gl, self.packedSpriteSheets[self.avatars[j].key].texture);
			gl.activeTexture(gl.TEXTURE0);
			gl.bindTexture(gl.TEXTURE_2D, texture);
			gl.uniform1i(shader.uniform.uSampler, 0);
			// Draw Avatar
			self.avatars[j].render(gl, shader);
		}
		gl.disable(gl.BLEND);
	}
};

/**
 * Avatar class
 */
var Avatar = function()
{
	var self = this;
	self.name = "";
	self.key = null;
	
	// Sprites
	// Array of UV's for sprites
	self.sprite = null;
	self.buffer = null;
	self.spriteCoords = [];
	
	// Animations
	self.delta = 0;
	//self.animations = [];
	
	self.animationKey = null;
	self.start = [0,-70,-98];
};

Avatar.prototype.init = function(gl, avatarProto, spriteJSON, key)
{	
	var self = this;
	self.name = avatarProto.spriteName;
	self.key = key;
	console.log("Looking for Avatar " + self.name + " in " + spriteJSON);
	if(spriteJSON[self.name])
		{
			self.sprite = spriteJSON[self.name];
			self.bind(gl);
		}
		else
		{
			log("No such avatar " + self.name + " could be found");
		}
	
};

Avatar.prototype.bind = function(gl)
{
	var self = this;	
	self.animationKey = [];
	
	var bufferObject = {};
	bufferObject.spriteBuffers = [];
	var textureCoords = [];
   	
   	// Set Idle Left As Default
   	// TODO: NOT HARDCODE PSS INFO
   	var imgWidth = 512;
   	var imgHeight = 512;
   	var n = 0;
   	var animationKey = 0;
   	
   	// 
   	// Idle
   	//
   	
   	var idle = self.sprite.idle;
   	var width = idle.spriteWidth;
   	var height = idle.spriteHeight;
   	var baseCoords = idle.left;
   	
   	self.animationKey['idleLeft'] = animationKey;	
	animationKey += idle.spriteCount;
	self.animationKey['idleRight'] = animationKey;	
	animationKey += idle.spriteCount;
   	
   	for(var i = 0; i < idle.spriteCount; i++)
   	{
   		var coordAx = baseCoords[0] + width * i;
	   	coordAx = coordAx/imgWidth;
	   	var coordAy = imgHeight + baseCoords[1];
	   	coordAy = coordAy/imgHeight;
	   	
	   	var coordBx = baseCoords[0] + width + (width * i);
	   	coordBx = coordBx/imgWidth;
	   	var coordBy = imgHeight + baseCoords[1];
	   	coordBy = coordBy/imgHeight;
	   	
	   	var coordCx = baseCoords[0] + width + (width * i);
	   	coordCx = coordCx/imgWidth;
	   	var coordCy = imgHeight + baseCoords[1] + height;
	   	coordCy = coordCy/imgHeight;
	   	
	   	var coordDx = baseCoords[0] + width * i;
	   	coordDx = coordDx/imgWidth;
	   	var coordDy = imgHeight + baseCoords[1] + height;
	   	coordDy = coordDy/imgHeight;
	   	
	   	textureCoords = 
	    [
	       	coordDx, coordDy,
	       	coordCx, coordCy,
	       	coordBx, coordBy,
	       	coordAx, coordAy,
	    ];
	    	
	    bufferObject.spriteBuffers.push(gl.createBuffer());
		gl.bindBuffer(gl.ARRAY_BUFFER,bufferObject.spriteBuffers[n]);
		gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(textureCoords),gl.DYNAMIC_DRAW);
		bufferObject.spriteBuffers[n].itemSize = 2;
		bufferObject.spriteBuffers[n].numItems = textureCoords.length/2;
		bufferObject.spriteBuffers[n].spriteCount = idle.spriteCount;	
		n++;
   	}
   	
   	baseCoords = idle.right;
   	
   	for(var i = 0; i < idle.spriteCount; i++)
   	{
   		var coordAx = baseCoords[0] + width * i;
	   	coordAx = coordAx/imgWidth;
	   	var coordAy = imgHeight + baseCoords[1];
	   	coordAy = coordAy/imgHeight;
	   	
	   	var coordBx = baseCoords[0] + width + (width * i);
	   	coordBx = coordBx/imgWidth;
	   	var coordBy = imgHeight + baseCoords[1];
	   	coordBy = coordBy/imgHeight;
	   	
	   	var coordCx = baseCoords[0] + width + (width * i);
	   	coordCx = coordCx/imgWidth;
	   	var coordCy = imgHeight + baseCoords[1] + height;
	   	coordCy = coordCy/imgHeight;
	   	
	   	var coordDx = baseCoords[0] + width * i;
	   	coordDx = coordDx/imgWidth;
	   	var coordDy = imgHeight + baseCoords[1] + height;
	   	coordDy = coordDy/imgHeight;
	   	
	   	textureCoords = 
	    [
	       	coordDx, coordDy,
	       	coordCx, coordCy,
	       	coordBx, coordBy,
	       	coordAx, coordAy,
	    ];
	    	
	    bufferObject.spriteBuffers.push(gl.createBuffer());
		gl.bindBuffer(gl.ARRAY_BUFFER,bufferObject.spriteBuffers[n]);
		gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(textureCoords),gl.DYNAMIC_DRAW);
		bufferObject.spriteBuffers[n].itemSize = 2;
		bufferObject.spriteBuffers[n].numItems = textureCoords.length/2;
		bufferObject.spriteBuffers[n].spriteCount = idle.spriteCount;
		n++;
   	}
   	
   	// 
   	// WALK
   	//
   	var walk = self.sprite.walk;
   	width = walk.spriteWidth;
   	height = walk.spriteHeight;
   	baseCoords = walk.left;
   	
   	self.animationKey['walkLeft'] = animationKey;	
	animationKey += walk.spriteCount;
	self.animationKey['walkRight'] = animationKey;	
	animationKey += walk.spriteCount;
   	
   	for(var i = 0; i < walk.spriteCount; i++)
   	{
   		var coordAx = baseCoords[0] + width * i;
	   	coordAx = coordAx/imgWidth;
	   	var coordAy = imgHeight + baseCoords[1];
	   	coordAy = coordAy/imgHeight;
	   	
	   	var coordBx = baseCoords[0] + width + (width * i);
	   	coordBx = coordBx/imgWidth;
	   	var coordBy = imgHeight + baseCoords[1];
	   	coordBy = coordBy/imgHeight;
	   	
	   	var coordCx = baseCoords[0] + width + (width * i);
	   	coordCx = coordCx/imgWidth;
	   	var coordCy = imgHeight + baseCoords[1] + height;
	   	coordCy = coordCy/imgHeight;
	   	
	   	var coordDx = baseCoords[0] + width * i;
	   	coordDx = coordDx/imgWidth;
	   	var coordDy = imgHeight + baseCoords[1] + height;
	   	coordDy = coordDy/imgHeight;
	   	
	   	textureCoords = 
	    [
	       	coordDx, coordDy,
	       	coordCx, coordCy,
	       	coordBx, coordBy,
	       	coordAx, coordAy,
	    ];
	    	
	    bufferObject.spriteBuffers.push(gl.createBuffer());
		gl.bindBuffer(gl.ARRAY_BUFFER,bufferObject.spriteBuffers[n]);
		gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(textureCoords),gl.DYNAMIC_DRAW);
		bufferObject.spriteBuffers[n].itemSize = 2;
		bufferObject.spriteBuffers[n].numItems = textureCoords.length/2;
		bufferObject.spriteBuffers[n].spriteCount = walk.spriteCount;	
		n++;
   	}
   	
   	baseCoords = walk.right;
		
   	for(var i = 0; i < walk.spriteCount; i++)
   	{
   		var coordAx = baseCoords[0] + width * i;
	   	coordAx = coordAx/imgWidth;
	   	var coordAy = imgHeight + baseCoords[1];
	   	coordAy = coordAy/imgHeight;
	   	
	   	var coordBx = baseCoords[0] + width + (width * i);
	   	coordBx = coordBx/imgWidth;
	   	var coordBy = imgHeight + baseCoords[1];
	   	coordBy = coordBy/imgHeight;
	   	
	   	var coordCx = baseCoords[0] + width + (width * i);
	   	coordCx = coordCx/imgWidth;
	   	var coordCy = imgHeight + baseCoords[1] + height;
	   	coordCy = coordCy/imgHeight;
	   	
	   	var coordDx = baseCoords[0] + width * i;
	   	coordDx = coordDx/imgWidth;
	   	var coordDy = imgHeight + baseCoords[1] + height;
	   	coordDy = coordDy/imgHeight;
	   	
	   	textureCoords = 
	    [
	       	coordDx, coordDy,
	       	coordCx, coordCy,
	       	coordBx, coordBy,
	       	coordAx, coordAy,
	    ];
	    	
	    bufferObject.spriteBuffers.push(gl.createBuffer());
		gl.bindBuffer(gl.ARRAY_BUFFER,bufferObject.spriteBuffers[n]);
		gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(textureCoords),gl.DYNAMIC_DRAW);
		bufferObject.spriteBuffers[n].itemSize = 2;
		bufferObject.spriteBuffers[n].numItems = textureCoords.length/2;
		bufferObject.spriteBuffers[n].spriteCount = walk.spriteCount;
		n++;
   	}
   	bufferObject.shaderType = K_ShaderTexture;
    
    bufferObject.name = self.sprite.name;
    bufferObject.instances = [];
   	bufferObject.instanceCount = 0;
    self.buffer = bufferObject;
    console.log(self);	
};

Avatar.prototype.addInstance = function(options)
{
	var self = this;
	console.log('Adding instance to ' + self.buffer.name);
	
	addObjectInstance(self.buffer);	
	var i = self.buffer.instances.length-1;
  	setObjectInstancePosition(self.buffer.instances[i], vec3.create(self.start));  	
  	setObjectInstanceScale(self.buffer.instances[i], options.scale);
  	setObjectInstanceSpeed(self.buffer.instances[i], options.speed);
  	self.buffer.instances[i].user = options.user;  	
  	self.buffer.instances[i].id = options.id;
  	
  	console.log(self.buffer);
};

Avatar.prototype.removeInstance = function(options)
{
	var self = this;
	console.log('Removing instance from ' + self.buffer.name);
	console.log(options);
	
	for(var i = 0; i < self.buffer.instances.length; i++)
	{
		if(self.buffer.instances[i].id == options.key)
		{
			console.log('Removing Instance with ID: ' + self.buffer.instances[i].id);
			self.buffer.instances[i] = null;	
		}
	}
	
	var newInstances = [];
	for(var i = 0; i < self.buffer.instances.length; i++)
	{
		if(self.buffer.instances[i] != null)
			newInstances.push(self.buffer.instances[i]);
	}
	self.buffer.instances = newInstances;
	self.buffer.instanceCount--;
};

Avatar.prototype.input = function(e)
{
	var self = this;
	// 'a' & 'd' keys
	var moveLeft = 65,
		moveRight = 68;

	if(!self.buffer) {return;}	
	var instances = self.buffer.instances;
	
 	if(!instances || instances.length == 0) {return;}
	var n = instances.length;
	var k = n;
	do
	{
		var i = k-n;
		var objectInstance = instances[i]; 
		// Ignore user input for npc's
		if(objectInstance.user == false) {return;}
		var speed = objectInstance.speed;
	
		if(e.type == "keyup") 
		{
			if(objectInstance.currentAnimation == self.animationKey['walkLeft'])
				objectInstance.currentAnimation = self.animationKey['idleLeft'];
			else if(objectInstance.currentAnimation == self.animationKey['walkRight'])
				objectInstance.currentAnimation = self.animationKey['idleRight'];
			
			objectInstance.step = 0;
			return;
		}
		
		
		if(e.keyCode == moveLeft)
		{
			objectInstance.position[0] -= speed;
			objectInstance.currentAnimation = self.animationKey['walkLeft'];
		}
		else if(e.keyCode == moveRight)
		{
			objectInstance.position[0] += speed;
			objectInstance.currentAnimation = self.animationKey['walkRight'];
		}
		// We found the user	
		break;	
	}
	while(--n);	
};

Avatar.prototype.inputNetwork = function(packet)
{
	var self = this;
	if(!self.buffer) {return;}	
	var instances = self.buffer.instances;
	
 	if(!instances || instances.length == 0) {return;}
	var n = instances.length;
	var k = n;
	do
	{
		var i = k-n;
		var objectInstance = instances[i]; 
		// Ignore user instance
		if(objectInstance.user == true) {return;}
		
		if(objectInstance.id == packet.id && packet.avatarInstance != null)
		{
			
			var tmpInstance = packet.avatarInstance;
			tmpInstance.position = vec3.create([tmpInstance.position['0'], tmpInstance.position['1'], tmpInstance.position['2']]);
			
			objectInstance.currentAnimation = tmpInstance.currentAnimation;
			objectInstance.speed = tmpInstance.speed;
			//objectInstance.step = tmpInstance.step;
			objectInstance.position = tmpInstance.position;
			
			/*
			var tmpInstance = objectInstance;
			objectInstance = packet.avatarInstance;
			objectInstance.position = vec3.create([objectInstance.position['0'], objectInstance.position['1'], objectInstance.position['2']]);
			
			objectInstance.vertexTextureBuffer = tmpInstance.vertexTextureBuffer;
			console.log(objectInstance);
			*/
		}
	}
	while(--n)	
};

Avatar.prototype.render = function(gl, shader)
{
	var self = this;
	var texture = null;	
	
	if(!self.buffer) {return;}	
	var instances = self.buffer.instances;
 	if(!instances || instances.length == 0) {return;}
	var n = instances.length;
	var k = n;
	do
	{
		var i = k-n;
		var objectInstance = instances[i]; 
		
		if(objectInstance.vertexTextureBuffer == null) {return;}
		gl.enableVertexAttribArray(shader.attribute.aTextureCoord);
		gl.bindBuffer(gl.ARRAY_BUFFER, objectInstance.vertexTextureBuffer);
		gl.vertexAttribPointer(shader.attribute.aTextureCoord, objectInstance.vertexTextureBuffer.itemSize, gl.FLOAT, false, 0, 0);
	
		var mv = mat4.create(objectInstance.mvMatrix);
		mat4.identity(mv);	
		
		mat4.translate(mv, objectInstance.position);
		
		var scale = [objectInstance.scale, objectInstance.scale, objectInstance.scale];
		mat4.scale(mv, scale);
		mat4.rotate(mv,degToRad(-objectInstance.rotation[0]),[1,0,0]);		
		
		gl.uniformMatrix4fv(shader.uniform.uModelMatrix, false, mv);
		gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);				
	}
	while(--n)
};

Avatar.prototype.animate = function(timing)
{
	var self = this;
	self.delta++;
	
	if(!self.buffer) {return;}	
	var instances = self.buffer.instances;
 	if(!instances || instances.length == 0) {return;}
	var n = instances.length;
	var k = n;
	do
	{
		var i = k-n;
		var objectInstance = instances[i]; 
		if(self.delta % 7 == 0)
		{
			objectInstance.vertexTextureBuffer = self.buffer.spriteBuffers[objectInstance.currentAnimation + objectInstance.step];	
			if(objectInstance.vertexTextureBuffer == null) {objectInstance.vertexTextureBuffer = self.buffer.spriteBuffers[0]}
			objectInstance.step++;
			if(objectInstance.step >= objectInstance.vertexTextureBuffer.spriteCount || objectInstance.step >= 20)
				objectInstance.step = 0;
		}				
	}
	while(--n)
	
	if(self.delta >= 1024)
	{
		self.delta = 0;
	}
};
