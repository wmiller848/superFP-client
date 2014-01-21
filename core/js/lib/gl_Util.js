/*
 * William Miller 2012
 */

/*
 * INFO logger
 */

function log(msg, object) {
    if(document != null)
    {
        if(!object) {console.log("Engine INFO: " + msg);}
        else {console.log("Engine INFO: "+msg); console.log(object);}
    }
    else
    {
        
    }
};

/*
 * Webgl window request frame animation loop
 */
// Polyfill to ensure we can always call requestAnimaionFrame
if(window != null)
{
    if(!window.requestAnimationFrame) {
        window.requestAnimationFrame=(function(){
            return  window.webkitRequestAnimationFrame || 
                    window.mozRequestAnimationFrame    || 
                    window.oRequestAnimationFrame      || 
                    window.msRequestAnimationFrame     || 
                    function(callback, element){
                        window.setTimeout(function() {
                            callback(new Date().getTime());
                        }, 1000 / 60);
                    };
        })();
    }
}

/*
 * Grab gl context
 */
function initGL(canvas) 
{
	var gl;
    try
    {
        gl = canvas.getContext("experimental-webgl");
        gl.viewportWidth = canvas.width;
        gl.viewportHeight = canvas.height;
    }
    catch (e)
    {
    	//console.log(e);
    }
    
    if (!gl)
    {
        alert("Could not initialise WebGL!");
    }
	
    return gl;
};

/*
 * Start the render loop, cross-browser support
 */
function startRenderLoopWeb(canvas, callback)
{
	var startTime=window.webkitAnimationStartTime || 
     				window.mozAnimationStartTime ||
                	new Date().getTime();
                	
   	var startTime = 0;
	
	console.log(startTime);
	
   	var lastTimeStamp = startTime;
   	var lastFpsTimeStamp = startTime;
   	var framesPerSecond = 0;
  	var frameCount = 0;
        
   	function nextFrame(time)
   	{
	  	// Recommendation from Opera devs: calling the RAF shim at the beginning of your
	    // render loop improves framerate on browsers that fall back to setTimeout
	   	window.requestAnimationFrame(nextFrame, canvas);   
	   	// Update FPS if a second or more has passed since last FPS update
	  	if(lastTimeStamp - lastFpsTimeStamp >= 1000) 
	  	{
	   		framesPerSecond = frameCount;
	     	frameCount = 0;
	    	lastFpsTimeStamp = lastTimeStamp;
	   	} 
		
		frameCount++;
	    lastTimeStamp = time;
	    
	  	callback({
	     	startTime: startTime,
	        timeStamp: time,
	        elapsed: time-startTime,
	        frameTime: time-lastTimeStamp,
	        framesPerSecond: framesPerSecond
	  	});
    };
  	window.requestAnimationFrame(nextFrame,canvas);
};

function startRenderLoopEmbedded(client, updateCallBack, renderCallBack)
{
    startUpdateLoop(client, updateCallBack);
    startRenderLoop(client, renderCallBack);
}

var GLTextureManger = function()
{
	this.textureArray = new Array();
	this.srcArray = new Array();
	this.texCount = 0;
};

GLTextureManger.prototype.init = function(gl) 
{
	//TODO: Clean up
	// Load default texture
	//var callback = this.addTexture;
	//var defaultSrc = "assets/textures/default.png";
	//var defaultTex = this.preloadTexture(gl, defaultSrc, null, null);	
};

GLTextureManger.prototype.preloadTexture = function(gl, src, callback, object, scene, texID) 
{
	var c = this.srcArray.length;
	for(var i=0; i<c; i++) 
	{
		if(this.srcArray[i] == src) 
		{
			log("Texture " + src + " already loaded");
			var promise = i;
			if(callback) {if(object) {object.texture = promise; object.hasTexture = true; callback(object, scene); return;}}
			else {
				if(object) {object.texture = promise; object.hasTexture = true; return;}
				else {return promise;}
			}
		}
	}
	
	if(callback) 
	{
		if(object) {this.loadTexture(gl,src,callback,object,scene,texID);}
		else {this.loadTexture(gl,src,callback,null,scene,texID);}
	}
	else 
	{
		if(object) {this.loadTexture(gl,src,null,object);}
		else {return this.loadTexture(gl,src,null,null);}
	}
};

GLTextureManger.prototype.loadTexture = function(gl, src, callback, object, scene, texID) 
{
    if (document != null)
    {
        var texture = gl.createTexture();
        var image = new Image();
        var self = this;
        image.addEventListener("load", function()
        {
            gl.bindTexture(gl.TEXTURE_2D, texture);
            if (!self.isPowerOfTwo(image.width) || !self.isPowerOfTwo(image.height))
            {
                // Scale up the texture to the next highest power of two dimensions.
                var canvas = document.createElement("canvas");
                canvas.width = gl.textureManager.nextHighestPowerOfTwo(image.width);
                canvas.height = gl.textureManager.nextHighestPowerOfTwo(image.height);
                var ctx = canvas.getContext("2d");
                // TODO: Center image in new power of two demnsion
                ctx.drawImage(image,0,0,image.width,image.height);
                image = canvas;
            }
            gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,image);
            gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR_MIPMAP_NEAREST);
            gl.generateMipmap(gl.TEXTURE_2D);
       
            if(!texture) {log("Texture FAILED: "+ src); return;}
       
            log("Texture loaded: " + src);
       
            if(callback)
            {
                if(object) {object.texture = self.addTexture(gl,texture,src); object.hasTexture = true; callback(object, scene);}
            else
            {
                var promise = self.addTexture(gl, texture, src); callback(promise, scene, texID);}
            }
            else
            {
                if(object) {object.texture = self.addTexture(gl,texture,src); object.hasTexture = true;}
                else {log("No callback or object provided for texture " + src);}
            }
        });
        image.src = src;
        this.srcArray.push(src);
        console.log("When Loaded " + src);
    }
};

/*
 * Look if texture x^2
 */

GLTextureManger.prototype.isPowerOfTwo = function(x) 
{
    return (x&(x-1))==0;
};

/*
 * If not find the nearest power of two
 */

GLTextureManger.prototype.nextHighestPowerOfTwo = function(x) 
{
    --x;
    for (var i=1;i<32;i<<=1) 
    {
        x=x|x>> i;
    }
    return x+1;
};

GLTextureManger.prototype.addTexture = function(gl, texture, src) 
{
	var promise = this.texCount;
	texture.index = promise;
	texture.src = src;
	
	this.textureArray[promise] = texture;
	this.texCount++;
	
	log("Texture added: " + texture.src + " with promise " + texture.index); 
	
	return promise;
	
};

GLTextureManger.prototype.getTexture = function(gl, promise) 
{
	var texture = this.textureArray[promise];
	if(!texture) {return this.textureArray[0];}
	else {return texture;}
};

GLTextureManger.prototype.getCurrentIndex = function(gl) 
{
	return this.texCount;
};

/*
 * Heightmap functions
 */

// Load heightmap
function loadHeightMap(gl, scene, map, seed, faceID, mapSrc, callback) 
{
	// Create an empty canvas element
    var canvas = document.createElement("canvas");
    canvas.width = seed-1;
    canvas.height = seed-1;
    var hMap = new Image();
    var heightMap = map[faceID];
	hMap.onload = function() {
		// Draw the image after its loaded so we can get the pixel data	
		// Copy the image contents to the canvas
    	var context = canvas.getContext("2d");
		context.drawImage(hMap,0,0);	
		var x = 0, y = 0, u = 0;
		var rec = seed-1;
		var rawRGB = context.getImageData(0, 0, rec, rec);
		
		for(var i = 0; i < rawRGB.data.length/4; i++) {
			
			var height = (rawRGB.data[u+0] + rawRGB.data[u+1] + rawRGB.data[u+2])/3;
			var offset = 256.0/0.0265;
			height = height/offset;
			height += 1;
			if(x == 0 || x == seed || y == 0 || y == seed) 
			{
				heightMap[x][y] = 0;
			}
			else 
			{
				heightMap[x][y] = height;
			}
				
			u += 4;
			y++
			
			if(y > seed-2)
			{
				y = 0;
				x++;
			}	
				
		}
			
		if(callback) { callback(gl, scene); }			
	};
	hMap.src = mapSrc;		
};

// Save current height map PNG
function saveHeightMap()	
{		
};
/*
 * Shader Utils
 */

function initShader(gl, scene, shaderName) 
{
    getShader(gl, scene, shaderName, "fsh");
    getShader(gl, scene, shaderName, "vsh");
};

function getShader(gl, scene, shaderName, type) 
{
    var shader;
    var self = this;
    if (type == "fsh") 
    {
      	shader = gl.createShader(gl.FRAGMENT_SHADER);
        // Web Based async load
        if ($ != null)
        {
            $.get(shaderName + '.fsh', function(source)
            {
                gl.shaderSource(shader, source);
                gl.compileShader(shader);
                if (!gl.getShaderParameter(shader,gl.COMPILE_STATUS))
                {
                  console.log(gl.getShaderInfoLog(shader));
                  alert(gl.getShaderInfoLog(shader));
                }
                else
                {
                  var shaderProperties =
                  {
                    name: shaderName,
                    assetType: "shader",
                    type: type
                  };
                  shader.properties = shaderProperties;
                  scene.assetLoaded(shader, shaderProperties);
                }	    		
            });
        }
        // iOS-v8 gl
        else
        {
            var source = get(shaderName, type, "local");
            gl.shaderSource(shader, source);
            gl.compileShader(shader);
            if (!gl.getShaderParameter(shader,gl.COMPILE_STATUS))
            {
                log("Error compiling shader");
                // TODO: Bind GL_Log
                //console.log(gl.getShaderInfoLog(shader));
                //alert(gl.getShaderInfoLog(shader));
            }
            else
            {
                //scene.log("fsh Shader Compiled");
                var shaderProperties =
                {
                    name: shaderName,
                    assetType: "shader",
                    type: type
                };
                shader.properties = shaderProperties;
                scene.assetLoaded(shader);
            }
            
        }
    }
    else if (type == "vsh")
    {
        shader = gl.createShader(gl.VERTEX_SHADER);
        // Web Based async load
        if($ != null)
        {
            $.get(shaderName + '.vsh', function(source)
            {
                gl.shaderSource(shader, source);
                gl.compileShader(shader);
                if (!gl.getShaderParameter(shader,gl.COMPILE_STATUS))
                {
                  console.log(gl.getShaderInfoLog(shader));
                  alert(gl.getShaderInfoLog(shader));
                }
                var shaderProperties =
                {
                  name: shaderName,
                  assetType: "shader",
                  type: type
                };
                shader.properties = shaderProperties;
                scene.assetLoaded(shader);
            });
        }
        // iOS-v8 gl
        else
        {
            var source = get(shaderName, type, "local");
            gl.shaderSource(shader, source);
            gl.compileShader(shader);
            if (!gl.getShaderParameter(shader,gl.COMPILE_STATUS))
            {
                log("Error compiling shader");
                // TODO: Bind GL_Log
                //console.log(gl.getShaderInfoLog(shader));
                //alert(gl.getShaderInfoLog(shader));
            }
            else
            {
                //scene.log("vsh Shader Compiled");
                var shaderProperties =
                {
                    name: shaderName,
                    assetType: "shader",
                    type: type
                };
                shader.properties = shaderProperties;
                scene.assetLoaded(shader);
            }
        }
    }
};

function compileShader(gl, shaderProto)
{
	log("Shader loading: " + shaderProto.name);
	var shaderProgram = gl.createProgram();
	gl.attachShader(shaderProgram, shaderProto.fsh);
    gl.attachShader(shaderProgram, shaderProto.vsh);
    gl.linkProgram(shaderProgram);
    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) 
    {
    	//alert("Could not initialise shaders");
        log("Could not initialise shaders");
    }
    
    gl.useProgram(shaderProgram);
    
    // Add any shader attributes and uniforms that we specified needing
    var attribs = shaderProto.attribs;
    if(attribs) 
    {
    	shaderProgram.attribute = {};
    	for(var i in attribs) {
        	var attrib = attribs[i];
           	shaderProgram.attribute[attrib] = gl.getAttribLocation(shaderProgram, attrib);
            if(shaderProgram.attribute[attrib] != -1)
            {
                log("Shader added attribute: " + attrib);
                //log("Attribute location " + shaderProgram.attribute[attrib]);
            }
            else
            {
                log("Attribute " + attrib + " not found");
            }
            
        }
  	}
  	var uniforms = shaderProto.uniforms;
    if(uniforms) 
    {
     	shaderProgram.uniform = {};
      	for(var i in uniforms) 
      	{
       		var uniform = uniforms[i];
            shaderProgram.uniform[uniform] = gl.getUniformLocation(shaderProgram, uniform);
            if(shaderProgram.uniform[uniform] != -1)
            {
                log("Shader added uniform: " + uniform);
                //log("Uniform location " + shaderProgram.uniform[uniform]);
            }
            else
            {
                log("Uniform " + uniform + " not found");
            }
        }
  	}
  	if(shaderProgram)
    {
        log("Shader loaded: " + shaderProto.name);
        return shaderProgram;
    }
    else
    {
        return null;
    }
}