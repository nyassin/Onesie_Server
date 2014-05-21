var feedparser = require('feedparser');
var parser = require('rssparser');
var async = require('async');
var request = require('request');
var counter =0;
var collections = ["technology", "business", "politics"]
var shared = require('./shared_functions')


exports.makediffbotAPIcall = function (item_url, category, source, callback) {

	var url_to_send_diffbot = "http://www.diffbot.com/api/article?token=e3b024894417cb019671964c7c17b362&url=" + item_url
	request(url_to_send_diffbot, function (error, response, body) {
    	if (!error && response.statusCode == 200) {
        	var article_object = JSON.parse(body); 

			if(article_object != null) {
				var image = ""
				if (article_object.media != null && article_object.media.length > 0) { image = article_object.media[0].link } else {  image = null}
				return callback({"title": article_object.title, "url":article_object.url, "media": image, 
				                 "preview": shared.getSummary(article_object.text), 
				                 "length": shared.wordsCounter(article_object.text),
				                 "body": shared.getBody(article_object.text),    
				                "reading_time": shared.ReadingTime(article_object.text),
				                 "last_updated": new Date(), "category": category,
				                  "source": source, "shares": null});
			} else {
				return callback(null)
			}
    	}
    	else
        	return callback(null);
		});
}



// TODO: no error handling when cannot connect to DB (as in, found.length throws error since found does not exist)
exports.saveObjectToMongoDB = function(object, category, db) {
	mycollection = db.collection(category)
	mycollection.find({"title": object.title}, function(err, found) {
			if (found.length == 0 ) {
			mycollection.save(object, function(err, saved) {
				console.log("saved!")
			})		
		}
	})

}


exports.getNumberofShares = function (url, callback_for_shares) {
	var url_to_send_facebook = "http://graph.facebook.com/?id=" + url;	
	request(url_to_send_facebook, function (error, response, body) {
    	if (!error && response.statusCode == 200) {
        	var object = JSON.parse(body); 
		return callback_for_shares(object.shares);
    	}
    	else
        	return callback_for_shares(null);
		});
}

exports.wordsCounter = function(article) {
	return article ? article.match(/\S+/g).length : 0;
}

// these in turn need to be respective categories
exports.ReadingTime = function(article) {
  var count = shared.wordsCounter(article); 
  var minutes = count/130; // 130 as avg reading time
  switch(true) {
	case (minutes < .5):return .5;
	  break;
	case (minutes < 2): return 1;
	  break;
	case (minutes < 7): return 5;
	  break;
    case (minutes < 12):return 10;
      break;
    case (minutes < 20): return 15;
      break;
	default: return 20; 
 }
}

exports.getSummary = function(article) {
	return article ? article.replace(/\s{2,}/g, ' ') + "..." : "";
}

exports.getBody = function(article) {
	return article
}