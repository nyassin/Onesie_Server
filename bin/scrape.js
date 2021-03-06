#! /app/bin/node

var feedparser = require('feedparser');
var rssparser = require('rssparser');
var async = require('async');
var request = require('request');
var counter =0;
var collections = ["technology", "business", "politics"];
var mongojs = require('mongojs');
var db = mongojs('mongodb://nyassin:DreamIt2012@widmore.mongohq.com:10010/articles', ["technology", "business", "politics"]);

function scrape() {
	
	// TODO: Bug with CNN video
	// TODO: Word count fails if article redirects (e.g., USAToday)
	var sources = [
	{
		"name": "cnn",
		'parser': 'feed',
		"categories" : [
		  {'name': 'technology', 'url': 'http://rss.cnn.com/rss/cnn_tech.rss'},
		  {'name': 'business', 'url': 'http://rss.cnn.com/rss/money_latest.rss'},
		  {'name': 'politics', 'url': 'http://rss.cnn.com/rss/cnn_allpolitics.rss'},
		]
	},
	{
		"name": "economist",
		'parser': 'rss',
		"categories" : [
			{'name': 'technology', 'url': 'http://www.economist.com/feeds/print-sections/80/science-and-technology.xml'},
			{'name': 'business', 'url': 'http://www.economist.com/feeds/print-sections/77/business.xml'},
		]
	},
	{
		'name': 'newser',
		'parser': 'feed',
		'categories' : [
			{'name': 'technology', "url": 'http://rss.newser.com/rss/section/7.rss'},
			{'name': 'business', "url": 'http://rss.newser.com/rss/section/5.rss'},
			{'name': 'politics', "url": 'http://rss.newser.com/rss/section/4.rss'},
		]
	},
	{
		'name': 'nytimes',
		'parser': 'rss',
		'categories' : [
			{'name': 'technology', "url": 'http://rss.nytimes.com/services/xml/rss/nyt/Technology.xml'},
			{'name': 'business', "url": 'http://rss.nytimes.com/services/xml/rss/nyt/Politics.xml'},
			{'name': 'politics', "url": 'http://rss.nytimes.com/services/xml/rss/nyt/Business.xml'},
		]
	},
	{
		'name': 'usatoday',
		'parser': 'rss',
		'categories' : [
			{'name': 'technology', "url": 'http://rssfeeds.usatoday.com/usatoday-TechTopStories'},
			{'name': 'business', "url": 'http://rssfeeds.usatoday.com/UsatodaycomMoney-TopStories'},
			{'name': 'politics', "url": 'http://rssfeeds.usatoday.com/usatoday-NewsTopStories'},
		]
	},
    // reuters
    	{
		'name': 'reuters',
		'parser': 'rss',  
		'categories' : [
			{'name': 'technology', "url": 'http://feeds.reuters.com/reuters/businessNews?format=xml'},
			{'name': 'business', "url": 'http://feeds.reuters.com/reuters/businessNews?format=xml'},
			{'name': 'politics', "url": 'http://feeds.reuters.com/reuters/businessNews?format=xml'},
		]
	},
	// world news -- this one is missing news
		{
		'name': 'worldnews',
		'parser': 'rss',
		'categories' : [
			{'name': 'business', "url": 'http://feeds.nbcnews.com/feeds/technology'},
			{'name': 'politics', "url": 'http://rss.wn.com/English/keyword/mideast'},
		]
	},
	// MSNBC
		{
		'name': 'MSNBC',
		'parser': 'rss',
		'categories' : [
			{'name': 'technology', "url": 'http://feeds.nbcnews.com/feeds/technology'},
			{'name': 'politics', "url": 'http://feeds.nbcnews.com/feeds/politics'},
			{'name': 'business', "url": 'http://feeds.nbcnews.com/feeds/business'},
		]
	},
	// CBC News
		{
		'name': 'cbc_news',
		'parser': 'rss',
		'categories' : [
			{'name': 'technology', "url": 'http://rss.cbc.ca/lineup/technology.xml'},
			{'name': 'politics', "url": 'http://rss.cbc.ca/lineup/politics.xml'},
			{'name': 'business', "url": 'http://rss.cbc.ca/lineup/business.xml'},
		]
	},
		{
		'name': 'time',
		'parser': 'rss',
		'categories' : [
			{'name': 'technology', "url": 'http://feeds.feedburner.com/timeblogs/nerd_world'},
			{'name': 'politics', "url": 'http://feeds2.feedburner.com/time/ThePage'},
			{'name': 'business', "url": 'http://feeds2.feedburner.com/time/business'},
		]
	},
		{
		'name': 'techcrunch',
		'parser': 'rss',
		'categories' : [
			{'name': 'technology', "url": 'http://feeds.feedburner.com/TechCrunch/'},
		]
	},
		{
		'name': 'cbs_news',
		'parser': 'rss',
		'categories' : [
			{'name': 'technology', "url": 'http://feeds.cbsnews.com/CBSNewsSciTech'},
			{'name': 'politics', "url": 'http://feeds.cbsnews.com/CBSNewsPolitics'},
			{'name': 'business', "url": 'http://feeds.cbsnews.com/CBSNewsBusiness'},
		]
	},
		{
		'name': 'washington_post',
		'parser': 'rss',
		'categories' : [
			{'name': 'technology', "url": 'http://feeds.washingtonpost.com/rss/business/technology'},
			{'name': 'politics', "url": 'http://feeds.washingtonpost.com/rss/politics'},
			{'name': 'business', "url": 'http://feeds.washingtonpost.com/rss/business'},
		]
	},
	    {
		'name': 'verge',
		'parser': 'rss',
		'urlField': 'id',
		'categories' : [
			{'name': 'technology', "url": 'http://www.theverge.com/rss/index.xml'},
		]
	}
	];

	sources.forEach(function(source) {
		source.categories.forEach(function(category) {
			console.log("getting data");
			getData(source.name, category.name, category.url, source.parser, source.urlField);
		});
	});
}

function getData(source, category, url, parser, urlField)
{
	console.log("in data section")

	if (parser == 'feed')
	{
		if (!urlField)
			urlField = "guid";
		feedparser.parseUrl(url).on('article', function(article) {
			console.log("sending to diffbot")
			shared.makediffbotAPIcall(article[urlField], category, source, function(object) {		
				shared.getNumberofShares(article[urlField], function(shares) {
						object.shares = shares;
						console.log(object);
						shared.saveObjectToMongoDB(object, object.category, db);
				});
			})
		});
	}
	else if (parser == 'rss')
	{
		if (!urlField)
			urlField = "url";
		rssparser.parseURL(url, function(err, out) {
			out.items.forEach(function(article) {
				shared.makediffbotAPIcall(article[urlField], category, source, function(object) {		
					shared.getNumberofShares(article[urlField], function(shares) {
							object.shares = shares;
							console.log(object);
							shared.saveObjectToMongoDB(object, object.category, db);
					});
				})
			});
		});
	}
	// TODO: ELSE WHAT? Also, error handling, and scoping issue (language issue; will address soon)
}

scrape();
setTimeout(function() {
  console.log('Exiting.');
  process.exit(0);
}, 3600000);
// exit after an hour of work 

// var express = require('express');
// var app = express.createServer();

// app.get('/', scrape);

// var port = process.env.PORT || 3000;
// app.listen(port, function() {
//   console.log("Listening on " + port);	
// });