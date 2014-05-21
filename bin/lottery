#! /app/bin/node

var request = require('request');
var mongojs = require('mongojs');
// var shared = require('./bin/shared_functions')
var shared = require('./bin/shared_functions')
var db = mongojs('mongodb://nyassin:onesie@oceanic.mongohq.com:10020/onesie', ["submissions", "users"]);


var Parse = require('node-parse-api').Parse;

var APP_ID = "IZWcu8SYmxfJmOz0Ney00vbsrcjC7Ee5ZjrMW75v";

var MASTER_KEY = "iOOdupP9QBIFmkxyPsdTpoqsTxi0KMoeFDRGmMQR";

var app = new Parse(APP_ID, MASTER_KEY);

// the class
var Kaiseki = require('kaiseki');

// instantiate
var APP_ID = 'IZWcu8SYmxfJmOz0Ney00vbsrcjC7Ee5ZjrMW75v';
var REST_API_KEY = '78b5tpJZgoPBRQd7f4qxoLtjgfj486vdlp4GKOVE';
var kaiseki = new Kaiseki(APP_ID, REST_API_KEY);



function AlertAllUsers() {
	// Fetch Today's Submission
	var params = {
	  where: { sent: Boolean(0) },
	  order: '-createdAt'
	};
	
	kaiseki.getObjects('Submissions', params, function(err, res, body, success) {
	  	
	  	console.log('found objects = ', body);

	  	//If there are no available submissions, don't send anything for the day.
	  	if(body.length == 0) {
	  		return;
	  	}

	  	//take the last recent submission
	  	var submission = body[body.length - 1]

	    //Send this submission via notification to everyone on the app via the "user" channel! 
		var notification = {
		  	channels: ["user"],
		  	data: {
			    alert: "Today's Onesie: " + submission['title']
		    }
		};

		kaiseki.sendPushNotification(notification, function(err, res, body, success) {
			if (success) {
			   	console.log('Push notification successfully sent:', body);
			   
			   	//Update the submission once it's been sent!
			  	kaiseki.updateObject('Submissions', submission['objectId'], {sent: Boolean(1)}, function(err, res, body, success) {
			  		console.log('object updated ', body);
				});

			} else {
			    console.log('Could not send push notification:', err);
			}

		});	

		
	});
}

function chooseUser() { 

	kaiseki.getUsers(function(err, res, body, success) {

  		//Choose user at random
  		var index = Math.floor(Math.random() * (body.length));
  		var user = body[index];
  		console.log(user['deviceToken'])

  		var channel = "token_" + user['deviceToken'];
	  	var notification = {
		  	channels: [channel],
		  	data: {
			    alert: "You have won the lottery!"
		    }
		};

		var pendingUser = {
			User: user,
			Submitted: Boolean(0)
		}

		kaiseki.createObject('Pending', pendingUser, function(err, res, body, success) {
			console.log("object created = ", body);
			if(success) {
				kaiseki.sendPushNotification(notification, function(err, res, body, success) {
				  if (success) {
				    console.log('Push notification successfully sent:', body);
				  } else {
				    console.log('Could not send push notification:', err);
				  }
				});	
			} else {
    			console.log('Could not create Pending User:', err);
			}
			
		})
	});

	
}



chooseUser();
AlertAllUsers();
setTimeout(function() {
  console.log('Exiting.');
  process.exit(0);
}, 3600000);
// exit after an hour of work 
