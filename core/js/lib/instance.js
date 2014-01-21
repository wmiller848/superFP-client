/**
 * William Miller
 * 2013
 */

// Instance methods
function loadInstances(model, count) 
{
	var maxInstanceCount = RedditMain.maxInstanceCount;
	if(count > maxInstanceCount) {count = maxInstanceCount}
	var scale = 1.0,speed = 0.08,range = 100,isRandom = true;
	// Create an instance or many 2nd arg optional, 1 instance required to render
  	addObjectInstance(model,count);	 
  	var n = count;
	var k = n;
	var m = Math;
	do
	{
		var i = k-n;
		var position = [range,0.0,0.0];
  		if(isRandom) 
  		{
  			var plusOrMinus = m.random()<0.5?-1:1;
  			position = [m.random()*range*plusOrMinus,m.random()*2*plusOrMinus,m.random()*range*plusOrMinus];
  			//scale=m.random()*2.0;
  			speed = m.random()*0.08;
  		}
  		var instance = model.instances[i];
  		setObjectInstancePosition(instance,position);
  		setObjectInstanceScale(instance,scale);
  		setObjectInstanceSpeed(instance,speed);
	}
	while(--n); 
};

function addObjectInstance(object, count) 
{
	var u = object.instanceCount;
	var instances = object.instances;
	if(count) {
		var n = count;
		var k = n;
		do
		{
			var i = k-n;
			instances[u+i] = new instance();
		}
		while(--n);
	}
	else {
		instances[u] = new instance();	
		count = 1;
	}
	object.instanceCount = u+count;
	
	//RedditGL_LOG("'"+object.name+"' "+" Instance(s) created - Count: "+object.instanceCount);
};

function removeObjectInstances(objectName)
{
	var sceneObjects = RedditMain.scene.sceneObjects;
	var n = sceneObjects.length;
	var k = n;
	do 
	{
		var i = k-n
		var object = sceneObjects[i];
		if(objectName == object.name)
		{
			if(object.instanceCount > 0)
			{
				var instances = object.instances;
				var nn = object.instanceCount;
				var kk = nn;
				do
				{
					var ii = kk-nn;
					instances[i] = null;
				}
				while(--nn);
				object.instances = null;
				object.instances = [];
				object.instanceCount = 0;	
			}
		}
	}
	while(--n);
};

function setObjectInstanceRotation(objectInstance, rot) 
{
	objectInstance.rotation = vec3.create(rot);
};

function setObjectInstancePosition(objectInstance, pos) 
{
	objectInstance.position = vec3.create(pos);
};

function setObjectInstanceScale(objectInstance, value) 
{
	objectInstance.scale = value;
	objectInstance.BBox = value*1.5;
};

function setObjectInstanceSpeed(objectInstance, speed) 
{
	objectInstance.speed = speed;
};

function setObjectInstanceTexture(gl, objectInstance, src) 
{
	gl.textureManager.preloadTexture(gl,src,null,objectInstance);
};

/*
 * Object Instance
 */
var instance = function()
{
	var self = this;
	// Matrix's
	self.mvMatrix = mat4.create();
	self.rotation = vec3.create();
	self.position = vec3.create();
	// Buffers
	self.vertexTextureBuffer = null;
	self.currentAnimation = 0;
	self.step = 0;
	// 
	self.scale = 1.0;
	self.speed = 1.0;
	self.BBox = self.scale*1.5;
	//
	self.id = null;
	self.user = false;
	self.hidden = false;	
	self.hasTexture = false;
	self.texture = 0;
}; 