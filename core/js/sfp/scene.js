/**
 * William C Miller
 * 2013
 */
var K_ShaderTexture = 0;
var K_ShaderColor = 1;

var scene = function(handler, debug)
{
	var self = this;
	self.debug = debug;
	self.handler = handler;
	self.log = self.handler.log;
	self.name = "Super Fight Pals -Test Scene";
	
	// WebGL
	self.gl = null;
	self.context = null;
	// Shaders
	self.shaders = null;
	// Camera
	self.camera = null;
	
	// Skybox
	self.skyBox = null;
	
	// Avatars
	self.avatarMaster = null;
	
	// Load Handlers
	self.loadCount = 0;
	self.sceneObjects = new Array();
	self.ready = false;
};

scene.prototype.init = function()
{
	var self = this;
	self.log("Starting WebGL...");
	self.context = document.getElementById('glContext');
	self.gl = initGL(self.context);
	self.configureGL();
	
	self.loadScene();
	
	var fps = $('#fps');
	console.log(fps);
	// Start Loop
	startRenderLoopWeb(self.context, function(timing)
	{
		fps.text(timing.framesPerSecond);
		//fps.innerHTML = timing.framesPerSecond;
		self.run(timing)
	}); 
	self.log("WebGL Ready");
};

scene.prototype.configureGL = function()
{
	var self = this;
	var gl = self.gl;
	gl.clearColor(0.0, 0.0, 0.0, 1.0); // BLACK
	gl.enable(gl.DEPTH_TEST); //Enable debth testing
	
	gl.textureManager = new GLTextureManger();
};

scene.prototype.assetLoading = function()
{
	var self = this;
	self.loadCount++;
};

scene.prototype.assetReady = function()
{
	var self = this;
	self.loadCount--;
};

scene.prototype.loadScene = function()
{
	var self = this;
	var gl = self.gl;
	
	// Camera
	self.camera = new cameraScroll(self.input);
	self.camera.init(self.context);
	self.camera.setCenter(vec3.create([0,50,65]));
	
	var camera = self.camera;
	var canvas = self.context;
	gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
  	var aspectRatio = gl.viewportWidth / gl.viewportHeight;
  	mat4.perspective(75, aspectRatio, 0.1, 10000, camera.pMatrix);
  	
  	// Load Shaders
    self.shaders =
    {
        textureProto:
        {
            fsh : null,
            vsh : null,
            name : "core/shaders/ShaderFlatTexture",
            attribs : ["aVertexPosition", "aTextureCoord"],
            uniforms : ["uViewMatrix", "uModelMatrix", "uProjectionMatrix", "uSampler"]
        },
        texture : null
    };
    
    self.assetLoading();
    initShader(gl, self, self.shaders.textureProto.name);
    
	// SkyBox
	self.skyBox = new SkyBox(gl, "environment/cloudSky.jpg");
	
	// Avatars	
	var sprites = 
	[	
		{
			path : "avatars/pss_SFPv2.png",
			key: "mickey",
			proto :
			{
				spriteName: "MICKEY",
			}
		},
		{
			path : "avatars/pss_SFPv2.png",
			key: "frieza",
			proto :
			{
				spriteName: "FRIEZA",
			}
		},
	];
	// Master Sprite config for all PackedSpriteSheets
	sprites.spriteConfig = "avatars/pss_SFPv2.json";
	
	self.avatarMaster = new AvatarMaster();
	self.assetLoading();
	self.assetLoading();
	self.avatarMaster.init(gl, sprites, self.assetLoaded, self);
};

// Async loading
scene.prototype.assetLoaded = function(asset)
{
    var self = client.scene;
    if(asset == null) {return;}
    
    var assetType = asset.properties.assetType;
    var assetName = asset.properties.name;
    if(assetType == "shader")
    {
        self.handleShader(asset);
    }
    else if (assetType == "object")
    {
    	self.sceneObjects.push(asset);
    }
    else if(assetType == "sprite")
    {
    	self.assetReady();
    }
    
    if(self.loadCount == 0) 
	{
		self.loadComplete();
	}
};

scene.prototype.handleShader = function(shader)
{
    var self = this;
    var properties = shader.properties;
    var shaders = self.shaders;
    // Compare Shader Protos
    if(properties.name == shaders.textureProto.name)
    {
        if(properties.type == "fsh")
        {
            shaders.textureProto.fsh = shader;
        }
        else if(properties.type == "vsh")
        {
            shaders.textureProto.vsh = shader;
        }
        
        // Make sure both shaders have compiled
        if(shaders.textureProto.vsh == null || shaders.textureProto.fsh == null) {return;}
        shaders.texture = compileShader(self.gl, shaders.textureProto);
        self.assetReady();
    }
}

scene.prototype.loadComplete = function() 
{
	var self = this;
	self.ready = true;
	console.log(self);
};

scene.prototype.addUser = function(avatarName)
{
	var self = client.scene;
	document.getElementById('popup').className = 'popup-invisible';
	var packet = 
	{
		auth : self.handler.auth,
		avatar :
		{
			selected : false,
			id : avatarName,
			instance : null,
			timeStamp : 0,
			direction : self.left
		}
	};
    if(self.handler.io != null)
	    self.handler.io.emit('addAvatar', packet);

	self.avatarMaster.addInstance(avatarName , {scale : 3, speed: 0.9, user: true});
};

scene.prototype.addNetworkUser = function(packet)
{
	var self = client.scene;
	self.avatarMaster.addInstance(packet.avatarName ,{scale : 3, speed: 0.9, user: false, id: packet.id});
};

scene.prototype.removeNetworkUser = function(packet)
{
	var self = client.scene;
	self.avatarMaster.removeInstance(packet.avatarName ,{key : packet.id});
};

scene.prototype.input = function(e)
{
	var self = client.scene;
	if(self.ready == true)
	{
		self.avatarMaster.input(e);
	}
};

scene.prototype.inputNetwork = function(packet)
{
	var self = client.scene;
	if(self.ready == true)
	{
		self.avatarMaster.inputNetwork(packet);
	}
};
// Run Loop Handler
scene.prototype.run = function(timing)
{
	var self = client.scene;
	var gl = self.gl;
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	
	if(self.ready == true)
	{
		self.skyBox.update(timing);
		self.skyBox.render(gl, self);
		
		self.avatarMaster.render(gl, self);
		self.avatarMaster.update(timing);
	}
};

scene.prototype.updateNetwork = function(timing, avatarInstance)
{
	var self = client.scene;
	self.handler.updateNetwork(timing, avatarInstance);
};


