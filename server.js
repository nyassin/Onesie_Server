var express = require('express'),
	lottery = require('./lottery');

var app = express.createServer();

// app.get('/', function(res, req){
// 	req.send("IM AWAKE!!")
// })
app.get('/', lottery.chooseUser)
var port = process.env.PORT || 3000;
app.listen(port, function() {
  console.log("Listening on " + port);	
});