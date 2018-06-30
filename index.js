module.exports = require('./node_modules/twitter-js-client/lib/Twitter');

var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var ToneAnalyzer = require('watson-developer-cloud/tone-analyzer/v3');
var Crawler = require("crawler");


// MOVE CONFIGS TO SEPARATE FILES
var twitterConfig = {
	"consumerKey": "4aONsAS8x7bShvflBeHdkXOKH",
	"consumerSecret": "sw0Z9XUnhBhPB9eaj6czi1jDXMdl9gI6QaiOvVJBlEobafqMBN",
	"accessToken": "766041800-mfzJMJPm6AsVLKmXgi2ThSrlxIbOQiZ1RiM1gAbz",
	"accessTokenSecret": "YdJSgghgsX9JLFSXgd6lXmT6fUWynkv8algBer2y1Lrxy",
};

var ibmConfig = {
	"username": "0efe4426-f32e-4505-9131-f8b1f478e0c5",
    "password": "aPhuLL1uT1oV",
	"version_date": "2018-02-09"
}

var twitter = new module.exports.Twitter(twitterConfig);
var toneAnalyzer = new ToneAnalyzer(ibmConfig);
var crawler = new Crawler({
    maxConnections : 10,
    // This will be called for each crawled page
    callback : function (error, res, done) {
        if(error){
            console.log(error);
        }else{
            var $ = res.$; // cheerio
            var pars = [];
            $("p").each(function(i, element) {
            	var content = element.children[0].data;
            	pars.push(content)
		    });
        }
        done();
    }
});


app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
	extended: true
}));

/*
 * To connect to a front end app (i.e. AngularJS) store all your files you will *
 * statically store in declared below (i.e. ./public) *
*/
app.use(express.static('public'));

//post to retrieve user data
app.post('/twitter/user', function (req, res) {
	
	var username = req.body.username;
	
	var data = twitter.getUserTimeline({ screen_name: username}, 

		function(error, response, body){
			res.send({
				"error" : error
			});
		}, function(data){
			res.send({
				result : {
					"userData" : data
				}
			});
		});
});

//post to retrieve tone
app.post('/tone', function (req, res) {
	
	var toneInput = req.body.toneInput;
	var params = {
		"tone_input": toneInput,
		"content_type": "text/plain"
	}

	toneAnalyzer.tone(params,
		function(err, tone) {
			if (err) {
				res.send({
					"error" : error
				});
				console.log(err);
			} 
			else {
				res.send({
					result : {
						"tone" : tone
					}
				});
			}
		}
	);

});

//post to retrieve array of p tag
app.post('/crawl', function (req, res) {
	
	var url = req.body.url;

	crawler.queue([{
	    uri: url,
	 
	    // The global callback won't be called
	    callback: function (error, response, done) {
	        if(error){
	            console.log(error);
	            res.send({
					"error" : error
				});
	        } 
	        else {
	        	var $ = response.$; // cheerio
	            var contents = [];
	            $("p").each(function(i, element) {
	            	if(element.children[0]) {
	            		var content = element.children[0].data;
	            		contents.push(content);
	            	}
			    });
	            res.send({
					result : {
						"contents" : contents
					}
				});
	        }
	        done();
	    }
	}]);

});


var server = app.listen(3000, function () {
  	var host = server.address().address;
  	var port = server.address().port;
});
