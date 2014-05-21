
var feedparser = require('feedparser');
var parser = require('rssparser');
var async = require('async');
var request = require('request');
var counter =0;
var collections = ["technology", "business", "politics"]
var mongojs = require('mongojs');
var shared = require('./bin/shared_functions')
var db = mongojs('mongodb://nyassin:DreamIt2012@widmore.mongohq.com:10010/usatoday', ["business", "technology", "politics"]);

exports.mainUSA = function () {
	array_of_links = []
	technology_object =	{"category": 'business', "url": 'http://feeds.feedburner.com/TechCrunch/'};
    business_object =	{"category": 'technology', "url": 'http://rssfeeds.usatoday.com/usatoday-TechTopStories'};
    politics_object =	{"category": 'politics', "url": 'http://feeds.washingtonpost.com/rss/politics'};

	array_of_links.push(technology_object);
	array_of_links.push(business_object);
    array_of_links.push(politics_object);

	async.forEach(array_of_links, function(item) {
		getUSAToday(item.url, item.category, function(object) {
		})
	})
}

 function getUSAToday(category_url, category, callback_for_main) {
	counter=0;
	var parser = require('rssparser');
	parser.parseURL(category_url, function(err, out) {

		async.each(out.items, function(item,callback){
			console.log(item)
			shared.makediffbotAPIcall(item.url, category, "usatoday", function(object){
				var shares_number;
				shared.getNumberofShares(item.url, function(item, callback_for_shares) {
					shares_number = item;
					object.shares = shares_number
					console.log(object)
					shared.saveObjectToMongoDB(object, object.category, db);
					counter++;
				});
			})	
			
		})
	})
}
//HELPER FUNCTIONS FOUND IN SHARED_FUNCTIONS.JS

