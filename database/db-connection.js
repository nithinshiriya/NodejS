'use strict';

//mongoose for Mongo db
var mongoose 			= require('mongoose');
var crypto       		= require('crypto');
var mongoUrl;
var userName;
var password;
var algorithm = 'aes-256-ctr';
var cryp; // = 'sstteepp';
var status = {connected: false, message: ""};
function connectWithRetry(resolve, reject) {
	TryConnect();
	var i  = 0;

	//On Connection event to capture the successfully connected to database.
	var db = mongoose.connection;

	/* on mongodb error event*/
	db.on('error', function(err) {
		console.error('Failed to connect to mongo on startup - retrying in 5 sec', err);
		status.message = "Trying to reconnect " +  i;
		mongoose.disconnect();
		setTimeout(TryConnect, 5000);
		i++;
		if(i > 20){
			reject("Failed to connect to mongo");
		}
	});

	/* on mongodb open event*/
	db.on('open', function(){
		console.log('================================');
		console.log('Connected to mongo server.');
		console.log('================================');
		status.connected = true;
		status.message ="";
		resolve();
	});
};

function TryConnect() {
	mongoose.Promise = global.Promise;
	if(userName) {	
		mongoose.connect(mongoUrl,{user: decrypt(userName), pass: decrypt(password)});	
	}else{		
		mongoose.connect(mongoUrl);
	}
}

function decrypt(text){
  var decipher = crypto.createDecipher(algorithm,cryp)
  var dec = decipher.update(text,'hex','utf8')
  dec += decipher.final('utf8');
  console.log(dec);
  return dec;
}


module.exports = {	
		/**
		 * [connect to database]	 
		 */
		connect : function(dbPath, cyrptoSecret) {			
			cryp = cyrptoSecret;			
			var position = dbPath.indexOf("]");
			if(position != -1){
				mongoUrl =  dbPath.substring(position+1);			
				var credentials =  dbPath.substring(1, position);
				position = credentials.indexOf(":");
				userName = credentials.substring(0,position);
				password = credentials.substring(position+1);
			}else{
				mongoUrl =  dbPath;
			}
			return new Promise(function(resolve, reject){
				connectWithRetry(resolve, reject);
			})							
		},

		/**
		 * [disconnect from database]	 
		 */
		disconnect : function() {
			mongoose.disconnect();
		},

		getMongoose : function(){
			return mongoose;
		},
		
		getId: function() {        
			return new mongoose.Types.ObjectId();        
		},
		getStatus: function(){
			return status;
		}	
};	