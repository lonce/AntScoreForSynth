/*  Mapps touch events to mouse events.
Just include this file in a require module, no need to call anything. 
*/

define(
  [],
  function(){

    var touch2Mouse={};

    touch2Mouse.touchHandler = function (event) { 
      var touches = event.changedTouches,
          first = touches[0],
          type = "";
           switch(event.type)
      {
          case "touchstart": type = "mousedown"; break;
          case "touchmove":  type="mousemove"; break;        
          case "touchend":   type="mouseup"; break;
          default: return;
      }

               //initMouseEvent(type, canBubble, cancelable, view, clickCount, 
      //           screenX, screenY, clientX, clientY, ctrlKey, 
      //           altKey, shiftKey, metaKey, button, relatedTarget);

      var simulatedEvent = document.createEvent("MouseEvent");
      simulatedEvent.initMouseEvent(type, true, true, window, 1, 
                                first.screenX, first.screenY, 
                                first.clientX, first.clientY, false, 
                                false, false, false, 0, null); // second to last arg is "left"
                                                                      
      first.target.dispatchEvent(simulatedEvent);
      event.preventDefault();
    }


/*
    (function (){
      console.log("in appUtils, mapping touch to mouse events");
      document.addEventListener("touchstart", touchHandler, true);
      document.addEventListener("touchmove", touchHandler, true);
      document.addEventListener("touchend", touchHandler, true);
      document.addEventListener("touchcancel", touchHandler, true);    
    })();
*/

    return touch2Mouse;

  }
);
