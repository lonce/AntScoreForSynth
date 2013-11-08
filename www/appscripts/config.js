define(
	function () {
		exports = {};
		exports.webketAudioEnabled=true;

		if (!window.webkitAudioContext) {
			alert("Web Audio API is not supported. You can join a score room interactively as a controller, but you won't hear your sounds unless you are within earshot of a webkitAudio enabled machine in the same score room.");
			exports.webketAudioEnabled=false;
		}

		return exports;
});

