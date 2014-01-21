/**
 * Index.js
 * William C Miller 2013
 * Main JS File for Super Fight Pals
 */

// Global Client Referece
var client = null;

var SFP_Client = function(debug)
{
	var self = this;
	self.debug = debug;
	
	self.os = "JavaScript Browser";
	self.scene = new scene(self, debug);
	
	self.io = null;
};

SFP_Client.prototype.init = function()
{
	var self = this;
	self.name = "SFP Client -" + self.os;
	self.version = "v.0.0.1";
	self.auth = uniqueid();
	
	self.log('CopyRight (c) William C Miller 2013');
	self.log(self.version);
	// Set up Sockets
	var url = window.location.hostname;
	var port = "3333";
	url = "http://" + url + ":" + port;
	self.log("Connecting to " + url);

    var socketIO = document.createElement('script');
    socketIO.setAttribute("type","text/javascript");
    socketIO.setAttribute("src", url + "/socket.io/socket.io.js");

    socketIO.addEventListener('load', function()
    {

        if(typeof io != "undefined")
        {
            self.io = io.connect(url);
            if(self.io == null)
            {
                console.log("Failed to init socket.io");
            }
            else
            {
                self.io.on('requestClientID', self.authenticate);
                self.io.on('rN', self.receiveNetwork);
                self.io.on('uN', self.p2pReceieveNetwork);
                self.io.on('addNetworkUser', self.addNetworkUser);
                self.io.on('removeNetworkUser', self.removeNetworkUser);
                //self.scene.init();
            }
        }
    });
    document.getElementsByTagName("head")[0].appendChild(socketIO);
};

SFP_Client.prototype.log = function(msg, obj)
{
	var self = this;
	if(self.debug == true)
	{
		if(typeof msg == "string")
		{
			console.log(self.name + '- ' + msg);
		}
		else
		{
			console.log(msg);
		}
		
		if(obj)
		{
			console.log(obj);
		}
	}
};

// Socket Handlers
SFP_Client.prototype.authenticate = function()
{
	var self = client;
	self.log("Authenticating...");
	self.io.emit('clientInfo', {auth : self.auth});
};

SFP_Client.prototype.addNetworkUser = function(packet)
{
	var self = client;
	self.scene.addNetworkUser(packet);
};

SFP_Client.prototype.removeNetworkUser = function(packet)
{
	var self = client;
	self.scene.removeNetworkUser(packet);
};

SFP_Client.prototype.receiveNetwork = function(packet)
{
	var self = client;
	self.scene.inputNetwork(packet);
};

SFP_Client.prototype.p2pReceieveNetwork = function(packet)
{
	var self = client;
	self.log(packet)
};


SFP_Client.prototype.updateNetwork = function(timing, avatarInstance)
{
	var self = client;
    if(self.io)
	    self.io.emit('uN', { auth: self.auth, timing : timing, avatarInstance: avatarInstance});
};

// Start Client via Anonymous Function
(function()
{
	client = new SFP_Client(true);
	client.init();
})();

// Start WebGL via jquery (the DOM needs to be loaded)
$(document).ready(function()
{
	// Start WebGL
	client.scene.init();
});

function uniqueid(){
    // always start with a letter (for DOM friendlyness)
    var idstr=String.fromCharCode(Math.floor((Math.random()*25)+65));
    do {                
        // between numbers and characters (48 is 0 and 90 is Z (42-48 = 90)
        var ascicode=Math.floor((Math.random()*42)+48);
        if (ascicode<58 || ascicode>64){
            // exclude all chars between : (58) and @ (64)
            idstr+=String.fromCharCode(ascicode);    
        }                
    } while (idstr.length<32);

    return (idstr);
}