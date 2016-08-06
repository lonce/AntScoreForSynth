define(
	[ ],
	function () {

      var svgscore = document.getElementById("svgscore");
      var score = document.getElementById("score");


      quickDelegate = function(event, target) {
            var eventCopy = document.createEvent("MouseEvents");
            eventCopy.initMouseEvent(event.type, event.bubbles, event.cancelable, event.view, event.detail,
                event.pageX || event.layerX, event.pageY || event.layerY, event.clientX, event.clientY, event.ctrlKey, event.altKey,
                event.shiftKey, event.metaKey, event.button, event.relatedTarget);
            target.dispatchEvent(eventCopy);
            // ... and in webkit I could just dispath the same event without copying it. eh.
        };

      if (svgscore){
        svgscore.addEventListener('click', function(event){
          quickDelegate(event, score);
        });
        
        svgscore.addEventListener('mousedown', function(event){
          quickDelegate(event, score);
        });
        svgscore.addEventListener('mouseup', function(event){
          quickDelegate(event, score);
        });
        
        svgscore.addEventListener('mouseover', function(event){
          quickDelegate(event, score);
        });
        svgscore.addEventListener('mouseout', function(event){
          quickDelegate(event, score);
        });
        svgscore.addEventListener('mousemove', function(event){
          quickDelegate(event, score);
        });
        
        
      }
    });