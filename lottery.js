// #! /app/bin/node

var Kaiseki = require('kaiseki');

// instantiate
var APP_ID = 'IZWcu8SYmxfJmOz0Ney00vbsrcjC7Ee5ZjrMW75v';
var REST_API_KEY = '78b5tpJZgoPBRQd7f4qxoLtjgfj486vdlp4GKOVE';
var kaiseki = new Kaiseki(APP_ID, REST_API_KEY);



exports.AlertAllUsers = function(req, res) {
	
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
exports.chooseUser = function (req, res) {

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


		

		kaiseki.getUser(user['objectId'], function(err, res, body, success) {
  
  	
  			console.log('found object = ', body);
			
			var pendingUser = {
				User: body,
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
		
	});

	
}

exports.updateWinners = function (req, res) {


	kaiseki.getObjects('Pending', function(err, res, body, success) {

		body.forEach(function(winner) {

			var now = new Date();
			var notified = new Date(Date.parse(winner['createdAt']));
			var hoursSince = Math.round((now - notified)/1000 / 60 / 60);

			//Remove delinquent Users
			if (hoursSince > 48) {
				kaiseki.deleteObject('Pending', winner['objectId'], function(err, res, body, success) {
				  if (success)
				    console.log("deleted person who didn't respond in 48 hours");
				  else
				    console.log('failed to delete!');
				});
			} 

			if (hoursSince > 24 && hoursSince < 48) {


				//Remind Users
				var token = winner['User']['deviceToken']

		  		var channel = "token_" + token;
			  	var notification = {
				  	channels: [channel],
				  	data: {
					    alert: "24 hours have passed since you won the lottery. Don't forget to send in your submission before the 48 hour limit!"
				    }
				};

				kaiseki.sendPushNotification(notification, function(err, res, body, success) {
					  if (success) {
					    console.log('Push notification successfully sent:', body);
					  } else {
					    console.log('Could not send push notification:', err);
					  }
				});	

			}

		})
	});

}

// chooseUser();
// setTimeout(function() {
//   console.log('Exiting.');
//   process.exit(0);
// }, 3600000);
// exit after an hour of work 
