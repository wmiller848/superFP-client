/**
 * William Miller
 * 2013
 */

var SkyBox = function(gl, texture)
{
	var self = this;
	self.mesh = null;
	self.textureArray = new Array();
	// Textrue is a path
	if(typeof texture == "string")
	{
		self.textureArray.push(texture);
		self.init(gl, self.ready);
	}
	// Texture is an array of paths
	else if(typeof texture == "object" && texture.length >= 1)
	{
		var texLength = texture.length;
		if(texLenght <= 6)
		{
			for(var i = 0; i < texLength; i++)
			{
				self.textureArray.push(texture[i]);
			}
			self.init(gl, self.ready);
		}
		else 
		{
			alert("Texture Path Array must be no longer than 6");
		}
	}
};

SkyBox.prototype.init = function(gl, callback)
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
	   	// Front face
	   -1.0, -1.0,  1.0,
	    1.0, -1.0,  1.0,
	    1.0,  1.0,  1.0,
	   -1.0,  1.0,  1.0,
		// Back face
	   -1.0, -1.0, -1.0,
	   -1.0,  1.0, -1.0,
	    1.0,  1.0, -1.0,
	    1.0, -1.0, -1.0,
		// Top face
	   -1.0,  1.0, -1.0,
	   -1.0,  1.0,  1.0,
	    1.0,  1.0,  1.0,
		1.0,  1.0, -1.0,
		// Bottom face
	   -1.0, -1.0, -1.0,
		1.0, -1.0, -1.0,
	    1.0, -1.0,  1.0,
	   -1.0, -1.0,  1.0,
		// Right face
	    1.0, -1.0, -1.0,
	    1.0,  1.0, -1.0,
	    1.0,  1.0,  1.0,
	    1.0, -1.0,  1.0,
		// Left face
	   -1.0, -1.0, -1.0,
	   -1.0, -1.0,  1.0,
	   -1.0,  1.0,  1.0,
	   -1.0,  1.0, -1.0,
    ];
    gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(vertices),gl.STATIC_DRAW);
    bufferObject.vertexPositionBuffer.itemSize = 3;
    bufferObject.vertexPositionBuffer.numItems = 24;

    textureCoords = 
    [
    	// Front face
       	0.0,1.0,
       	1.0,1.0,
       	1.0,0.0,
       	0.0,0.0,
		// Back face
       	0.0,1.0,
       	0.0,0.0,
       	1.0,0.0,
       	1.0,1.0,
		// Top face
        0.0, 1.0,
        0.0, 0.0,
        1.0, 0.0,
        1.0, 1.0,
		// Bottom face
        1.0, 1.0,
        0.0, 1.0,
        0.0, 0.0,
        1.0, 0.0,
		// Right face
       	0.0, 1.0,
        0.0, 0.0,
        1.0, 0.0,
        1.0, 1.0,
		// Left face
        1.0, 1.0,
        0.0, 1.0,
        0.0, 0.0,
        1.0, 0.0,
  	];
  	
  	if(self.textureArray != null) 
  	{
		bufferObject.vertexTextureBuffer = gl.createBuffer();
    	gl.bindBuffer(gl.ARRAY_BUFFER,bufferObject.vertexTextureBuffer);
    	gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(textureCoords),gl.STATIC_DRAW);
    	bufferObject.vertexTextureBuffer.itemSize = 2;
    	bufferObject.vertexTextureBuffer.numItems = textureCoords.length/2;	
    	bufferObject.shaderType = K_ShaderTexture;
	}
	else {
		bufferObject.vertexColorBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, bufferObject.vertexColorBuffer);
		var colors = [];
		var k = vertices.length/3;
		for(var i=0;i<k;i++) 
		{
			for(var j=0;j<4;j++) 
			{
				if(j % 4 == 0)
				{
					
				}
				else
				{
					colors.push(1.0);	
				}
			}
		}
		gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(colors),gl.STATIC_DRAW);
		bufferObject.vertexColorBuffer.itemSize = 4;
		bufferObject.vertexColorBuffer.numItems = colors.length;	
		bufferObject.shaderType = K_ShaderColor;
	}

    bufferObject.vertexIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,bufferObject.vertexIndexBuffer);
    vertexIndices = 
    [
    	0, 1, 2,      0, 2, 3,    // Front face
        4, 5, 6,      4, 6, 7,    // Back face
        8, 9, 10,     8, 10, 11,  // Top face
        12, 13, 14,   12, 14, 15, // Bottom face
        16, 17, 18,   16, 18, 19, // Right face
        20, 21, 22,   20, 22, 23  // Left face
   	];
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,new Uint16Array(vertexIndices),gl.STATIC_DRAW);
    bufferObject.vertexIndexBuffer.itemSize = 1;
    bufferObject.vertexIndexBuffer.numItems = 36;
    
    bufferObject.name = "SkyBox";
    bufferObject.instances = [];
   	bufferObject.instanceCount = 0;
   	
   	console.log(bufferObject);
   	
   	if(self.textureArray != null)
 	{
 		while(self.textureArray.length != 0)
 			gl.textureManager.preloadTexture(gl, self.textureArray.pop(), callback, bufferObject, self); 	
 	} 
    else	
    {
    	callback(bufferObject);	
    }
};


SkyBox.prototype.ready = function(bufferObject, skyBox)
{
	var self = skyBox;
	
	addObjectInstance(bufferObject);	
  	setObjectInstancePosition(bufferObject.instances[0], vec3.create([0,0,0]));  	
  	setObjectInstanceScale(bufferObject.instances[0], 100);
  	setObjectInstanceSpeed(bufferObject.instances[0], 0.0);
  	
  	self.mesh = bufferObject;
	console.log("SkyBox loaded")
};

SkyBox.prototype.update = function(timing)
{
	
};
SkyBox.prototype.render = function(gl, scene)
{
	var self = this;
	if(self.mesh != null)
	{
		gl.enable(gl.DEPTH_TEST);

		var shader = null, object = self.mesh;
		var camera = scene.camera;
		if(!object.vertexPositionBuffer || !object.vertexIndexBuffer) {return;}
		
		switch(object.shaderType) 
		{
			case K_ShaderColor:
				gl.useProgram(scene.shaders.color);
				shader = scene.shaders.color;
			break;
			
			case K_ShaderTexture:
				gl.useProgram(scene.shaders.texture);
				shader = scene.shaders.texture;
			break;
			
			default:
			break;
		}
		
		gl.enableVertexAttribArray(shader.attribute.aVertexPosition);
		gl.bindBuffer(gl.ARRAY_BUFFER, object.vertexPositionBuffer);
		gl.vertexAttribPointer(shader.attribute.aVertexPosition, object.vertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
		
		var texture = null, objTexture = null;
		if(object.hasTexture) 
		{	
			if(!object.vertexTextureBuffer) {return;}
			gl.enableVertexAttribArray(shader.attribute.aTextureCoord);
			gl.bindBuffer(gl.ARRAY_BUFFER, object.vertexTextureBuffer);
			gl.vertexAttribPointer(shader.attribute.aTextureCoord, object.vertexTextureBuffer.itemSize, gl.FLOAT, false, 0, 0);
			objTexture = object.texture;
		}
		else 
		{	
			if(!object.vertexColorBuffer) {return;}
			gl.enableVertexAttribArray(shader.attribute.aColor);
			gl.bindBuffer(gl.ARRAY_BUFFER, object.vertexColorBuffer);
			gl.vertexAttribPointer(shader.attribute.aColor, object.vertexColorBuffer.itemSize, gl.FLOAT,false, 0, 0);
		
		}
			
	    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, object.vertexIndexBuffer);
	    gl.uniformMatrix4fv(shader.uniform.uProjectionMatrix, false, camera.pMatrix);
	    gl.uniformMatrix4fv(shader.uniform.uViewMatrix, false, camera.getViewMatrix());
	    
	    if(objTexture != null)
	    {
	   		var texture = gl.textureManager.getTexture(gl, objTexture);
			gl.activeTexture(gl.TEXTURE0);
			gl.bindTexture(gl.TEXTURE_2D, texture);
			gl.uniform1i(shader.uniform.uSampler, 0);	
	    }
		
		var instances = object.instances;
	 	if(!instances) {return;}
		var n = instances.length;
		var k = n;
		do
		{
			var i = k-n;
			var objectInstance = instances[i]; 
			var mv = mat4.create(objectInstance.mvMatrix);
			mat4.identity(mv);	
			
			var scale = [objectInstance.scale, objectInstance.scale, objectInstance.scale];
			mat4.scale(mv, scale);
			mat4.rotate(mv,degToRad(-objectInstance.rotation[1]),[0,1,0]);	
			mat4.translate(mv, objectInstance.position);	
			
			gl.uniformMatrix4fv(shader.uniform.uModelMatrix, false, mv);
			gl.drawElements(gl.TRIANGLES, object.vertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
		}
		while(--n)
		
		gl.disable(gl.DEPTH_TEST);
	}
};
