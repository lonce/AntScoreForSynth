define(
	[ ],
	function () {

      var svgscore = document.getElementById("svgscore");
      var score = document.getElementById("score");

      function cloneObject(obj) {
          if (obj === null || typeof obj !== 'object') {
              return obj;
          }
       
          var temp = obj.constructor(); // give temp the original obj's constructor
          for (var key in obj) {
              temp[key] = cloneObject(obj[key]);
          }
       
          return temp;
      }

      // copy mouse event and redispatch
      quickDelegate = function(event, target) {
            var new_event = new MouseEvent(event.type, event);
            new_event.eventSelection  =  event.eventSelection; // add the property glued on by svg gestures
            target.dispatchEvent(new_event);
        };

      if (svgscore){
        svgscore.addEventListener('click', function(event){
          quickDelegate(event, score);
        });
        
        svgscore.addEventListener('mousedown', function(event){
          console.log("delegate mouse down")
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