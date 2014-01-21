/**
 * William C Miller
 * 2013
 */

var cameraScroll = function(keyHandler)
{
	var self = this;
	self.moving = false;
	
	self.rotMatrix = mat4.create(); 
    mat4.identity(self.rotMatrix);
     
    self.viewMatrix = mat4.create();
    self.pMatrix = mat4.create();
    
    self.center = vec3.create();
    
    self.keys = new Array(128);
    self.keyHanler = keyHandler;
    self.shift = false;
    self.dirty = true;
};

cameraScroll.prototype.init = function(canvas) 
{
	var self = this,
    lastX,lastY;  
	// Set up the appropriate event hooks
	// Set up the appropriate event hooks
   	document.addEventListener("keydown", function (event) {
    	self.keys[event.keyCode] = true;
      	if(event.keyCode == 32) { // Prevent the page from scrolling
       		event.preventDefault();
      		return false;
       	}
       	if(event.shiftKey)
       	{
       		self.shift = true;
       	}
       	
       	self.keyHanler(event);
  	}, true);

 	document.addEventListener("keyup", function (event) {
    	self.keys[event.keyCode] = false;
    	if(self.shift) {self.shift = false;}
    	self.keyHanler(event);
   	}, false);
   	
    canvas.addEventListener('mousedown',function(event) 
    {
   		if(event.which === 1) 
   		{
         	self.moving = true;
        }
        lastX = event.pageX;
        lastY = event.pageY;
    }, false);

    canvas.addEventListener('mousemove',function(event) 
    {
   		if(self.moving)
   		{
       		var xDelta = event.pageX-lastX,
            yDelta = event.pageY-lastY;
			
         	lastX = event.pageX;
          	lastY = event.pageY;
          	
          	if(self.shift)
          	{
          		
          	}
          	else 
          	{
          		var angle = Math.atan2(yDelta, xDelta);
				var movX = Math.cos(-angle);
				//var movZ = Math.sin(angle);
				var mov = vec3.create([movX,0.0,0.0]);
				var rot = self.rotMatrix;
				mat4.multiplyVec3(rot, mov);
				vec3.add(self.center, mov);
          	}
            self.dirty = true;
      	}
  	},false);

  	canvas.addEventListener('mouseup',function() 
  	{
     	self.moving = false;
     	self.dirty = true;
  	},false);
  	
  	canvas.addEventListener('mousewheel',function(event) 
  	{
  		var speed = -event.wheelDelta;
  		/*
  		self.distance += speed/self.zoomSpeed;
     	self.dirty = true;
     	*/
  	},false);
  	
  	canvas.addEventListener('DOMMouseScroll',function(event) 
  	{	
  		/*
  		var speed = event.detail*30;
  		self.distance += speed/self.zoomSpeed;
  		*/
     	self.dirty = true;
  	},false);
};

cameraScroll.prototype.getCenter = function() 
{
	return this.center;
};

cameraScroll.prototype.setCenter = function(value) 
{
 	this.center = value;
   	this.dirty = true;
};

cameraScroll.prototype.getViewMatrix = function() 
{
	if(this.dirty) 
	{
     	var view = this.viewMatrix;
     	mat4.identity(view);
     	//mat4.rotateX(view,this.orbitX);
     	//mat4.rotateY(view,this.orbitY);
     	mat4.translate(view, this.center);
        this.dirty = false;
  	}

   	return this.viewMatrix;
};

cameraScroll.prototype.update = function() 
{
	
};
