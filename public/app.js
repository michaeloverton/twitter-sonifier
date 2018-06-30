var app = angular.module('myApp', []);

app.controller('myCtrl', function($scope, $http, $interval, CrawlService, ToneService, TwitterService){

	//var vm = this;

	$scope.tweetIndex = 0;

	$scope.getUser = function(username){

		TwitterService.getUserTimeline(username)
			.then(function(data){
				
				if(data.error){

					var errorData = JSON.parse(data.error.data);
					$scope.twitterErrors = errorData.errors[0].message;

				} else if (data.result){
					$scope.twitterErrors = undefined;
					$scope.results = JSON.parse(data.result.userData);

					$scope.currentTweet = $scope.results[$scope.tweetIndex].text;

					// grab next tweet
					$scope.tweetIndex++;

					var toneInput = {"toneInput": $scope.currentTweet};
					return ToneService.getTone(toneInput);
				}

			}).then(function(tone) {

				$scope.currentTone = tone;

			});

	}

	$scope.getUrlTones = function(url){

		CrawlService.getContents(url)
			.then(function(data){
				
				if(data.error){

					var errorData = JSON.parse(data.error.data);
					$scope.twitterErrors = errorData.errors[0].message;

				} 
				else if (data.result) {

					$scope.contents = data.result.contents;

					$scope.contents = $scope.contents.join('.');

					var toneInput = {"toneInput": $scope.contents};
					return ToneService.getTone(toneInput);
				}

			}).then(function(tone) {

				$scope.currentTone = tone;

			});

	}
  
});

app.factory('TwitterService', function($http, $q){
  
	var getUserTimeline = function(username){
		var d = $q.defer();
		$http.post('/twitter/user', {username : username})
			.success(function(data){
			return d.resolve(data);
		})
		.error(function(error){
			return d.reject(error);
		});
		
		return d.promise;
	};

	return {
		getUserTimeline : getUserTimeline
	}

});

app.factory('ToneService', function($http, $q){
  
	var getTone = function(toneInput){
		var d = $q.defer();
		$http.post('/tone', toneInput)
		.success(function(tone){
			return d.resolve(tone);
		})
		.error(function(error){
			return d.reject(error);
		});
		
		return d.promise;
	};

	return {
		getTone : getTone
	}

});

app.factory('CrawlService', function($http, $q){
  
	var getContents = function(url){
		var d = $q.defer();
		$http.post('/crawl', {"url": url})
		.success(function(contents){
			console.log(contents);
			return d.resolve(contents);
		})
		.error(function(error){
			return d.reject(error);
		});
		
		return d.promise;
	};

	return {
		getContents : getContents
	}

});


var letter = 0;
	function cycleThru() {
		var currentLetter = $scope.currentTweet.charAt(letter);
		if(currentLetter != '') {
			console.log(currentLetter);
			letter++;
		}
		else {
			letter = 0;
		}
	}

	function effectedNote(_wave, _attack, _hold, _release) {

		var effectedNote = new Wad({
			source : _wave,
			//pitch : _pitch,
			env     : {
			  attack: _attack,//3.2,
			  hold : _hold,//1,
			  release: _release//2
			},

			filter  : {
			  type: 'lowpass',
			  frequency : 400
			},
			tuna   : {
			  // Chorus : {
			  //   intensity: 0.4,  //0 to 1
			  //   rate: 1,         //0.001 to 8
			  //   stereoPhase: 160,  //0 to 180
			  //   bypass: 0
			  // },
			  // Delay: {
			  //   feedback: 0.60,    //0 to 1+
			  //   delayTime: 300,    //1 to 10000 milliseconds
			  //   wetLevel: 0.6,    //0 to 1+
			  //   dryLevel: 1,       //0 to 1+
			  //   cutoff: 1000,      //cutoff frequency of the built in lowpass-filter. 20 to 22050
			  //   bypass: 0
			  // },
			  // PingPongDelay: {
			  //   wetLevel: 0.7, //0 to 1
			  //   feedback: 0.4, //0 to 1
			  //   delayTimeLeft: 300, //1 to 10000 (milliseconds)
			  //   delayTimeRight: 500 //1 to 10000 (milliseconds)
			  // }
			}
		});
		return effectedNote;
	}

	var hiNote = effectedNote('sine', 0.1, 0.1, 0.75);
	//var hiNoteInterval = $interval(playHi, 2000);

	function playHi() {
		//var octave = randomInt(4) + 3;
		var note = 'A3';
		hiNote.setVolume(.3);
		hiNote.play({pitch : note});
	}