define(
	function () {
		exports = {};
		exports.webkitAudioEnabled=true;

		if (!window.webkitAudioContext) {
			alert("Web Audio API is not supported. You can join a score room interactively as a controller, but you won't hear your sounds unless you are within earshot of a webkitAudio enabled machine in the same score room.");
			exports.webkitAudioEnabled=false;
		}

		exports.touchMarginOfError = 3; //px, used for "selecting" items on the score
		exports.minSndDuration=60; // must be longer than frame duration so start and stop and not sent to the synthesizer at the same time. 

		exports.maxContourWidth=0; //set this in main 
		return exports;
});

