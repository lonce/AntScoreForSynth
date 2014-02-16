define(
	["utils", "touch2Mouse"],
	function (utils, touch2Mouse) {
      return function (w,id){
         var myWindow=w;
   		var canvasSlider = w.document.getElementById(id);

         var sliderButtonHeight=10;
         var k_sliderInc=.05; // proportion of total slider value length
         var mousePressed=false;

         var m_Color="#FFFFFF";
         

         canvasSlider.value = .5; // normallized

         var sliderCanvas=canvasSlider;

         var outsideElmtListener;


         sliderCanvas.addEventListener("mousedown", onMouseDown, false);
         sliderCanvas.addEventListener("mouseup", onMouseUp, false);
         sliderCanvas.addEventListener("mousemove", onMouseMove, false);

         sliderCanvas.addEventListener("touchstart", touch2Mouse.touchHandler, true);
         sliderCanvas.addEventListener("touchmove", touch2Mouse.touchHandler, true);
         sliderCanvas.addEventListener("touchend", touch2Mouse.touchHandler, true);
         sliderCanvas.addEventListener("touchcancel", touch2Mouse.touchHandler, true);    

         function onMouseDown (e){
            mousePressed=true;
            var m = utils.getCanvasMousePosition(sliderCanvas, e);
            canvasSlider.value= Math.max(0,  Math.min(1, 1-m.y/sliderCanvas.height));
            canvasSlider.fire(e); // uses eventuality funcitonality
            canvasSlider.drawSlider();

/*
            document.body.addEventListener('mouseup', function(){
    mouseDown = false;
    log()
});
*/

            
            myWindow.document.body.addEventListener('mousemove', onMouseMove, false);
            myWindow.document.body.addEventListener('mouseup', onMouseUp, false);

            console.log("myWindow is " + myWindow);
            console.log("elmt is "+ myWindow.document.getElementById(id));
            //console.log("outsideElmtListener = " + outsideElmtListener);
         }

         function onMouseMove(e){
            //console.log("onMouseMove");
            if (!mousePressed) return;
            var m = utils.getCanvasMousePosition(sliderCanvas, e);
            canvasSlider.value= Math.max(0,  Math.min(1, 1-m.y/sliderCanvas.height));
            canvasSlider.fire(e); // uses eventuality funcitonality
            canvasSlider.drawSlider();
        }

         function onMouseUp(e){
            if (!mousePressed) return;
            mousePressed=false;
            var m = utils.getCanvasMousePosition(sliderCanvas, e);
            canvasSlider.value= Math.max(0,  Math.min(1, 1-m.y/sliderCanvas.height));
            canvasSlider.fire(e); // uses eventuality funcitonality
            canvasSlider.drawSlider();

            myWindow.document.body.removeEventListener('mousemove'); 
            myWindow.document.body.removeEventListener('mouseup');

         }


         // DRAWING ----------------------------------------------------------------
         var ctx = canvasSlider.getContext("2d");

         canvasSlider.drawSlider = function (pos){
            ctx.clearRect(0, 0, sliderCanvas.width, sliderCanvas.height);
            ctx.fillStyle=m_Color;
            ctx.strokeStyle=m_Color;
            ctx.fillRect(0,(1-canvasSlider.value)*sliderCanvas.height-sliderButtonHeight/2.,sliderCanvas.width,sliderButtonHeight);
            ctx.font="20px Arial";
         }

         // mapping keys so computer players can changed paramters while the play ----------------
         // (Multi-touch surfaces don't need this)
   		//window.addEventListener("keydown", keyDown, true);
   		
   		// note quite sure why this can't be: var keyDown=function(e){}
         	function keyDown(e){
         		var keyCode = e.keyCode;
         		switch(keyCode){
         			case 87:  //87=w
         				canvasSlider.value = Math.min(1, parseFloat(canvasSlider.value) + k_sliderInc);
         			break;
         			case 88: //88=x
            			canvasSlider.value = Math.max(0,parseFloat(canvasSlider.value) - k_sliderInc);
         			break; 
         			default:
         				console.log("w is up, x is down"); 			
         		}
               canvasSlider.drawSlider();
          	};

         canvasSlider.setColor = function(c){
            m_Color=c;
            canvasSlider.drawSlider();
         }

         // Let this guy be an event generator (adding 'fire' and 'on' functionality)
         utils.eventuality(canvasSlider);
         canvasSlider.drawSlider();
         
   		return canvasSlider;
      }
});