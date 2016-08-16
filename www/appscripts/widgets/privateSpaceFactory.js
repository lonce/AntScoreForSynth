define(
[],
function () {
	return function (svgCanvas, timespan){
		var privateSpace = {}; 
		//var height = svgCanvas.getBoundingClientRect().height;
		var pixPerMs = svgCanvas.getBoundingClientRect().width/timespan; 

		//--------   make a canvas into a canvasScore by adding methods------//
		var svgBkgd = document.createElementNS("http://www.w3.org/2000/svg", "rect");
		svgBkgd.setAttribute("x", 0);
		svgBkgd.setAttribute("y", 0);
		svgBkgd.setAttribute("width", svgCanvas.getBoundingClientRect().width);
		svgBkgd.setAttribute("height", svgCanvas.getBoundingClientRect().height);
		svgBkgd.setAttribute("fill", "#707070"); 
		svgCanvas.appendChild(svgBkgd);

		svgCanvas.getHeight = function(){
			return svgCanvas.getBoundingClientRect().height;
		}

		svgCanvas.ms2pix=function(ms){
			return pixPerMs*ms;
		}
		//---------------------------------------------------//
		
		//svgCanvas.AAAAAAAAA = "AAAAAAAAAAA";


		privateSpace.displayElements=[]; // list of score elememnts




		privateSpace.currentGesture=null; // the one in the middle of being drawn




		privateSpace.initiateContour = function(g, t, x,y, z){
			//console.log("begin static pgesture on canvas with height = " + height + ", at point [" + x + ", " + y + "]" + "  with a pixPerMs = " + pixPerMs);
			g.clientX = x;
			g.clientY = y;
			g.setScore(svgCanvas);  // should be passing the privateSpace, not the canvas, to the gesture
			g.addEvent([t,y,z], false); // events record the time, not the x-value pixel
			g.updateMinTime();
			privateSpace.currentGesture = g;
			privateSpace.displayElements.push(g);
			if (g.type === "phraseGesture"){
				g.drawStatic(t);//,privateSpace.ms2pix, height);
			}
		}

		privateSpace.keyDown = function(e, t, z, radioSelection){
			if (e.repeat) return;
         		var keyCode = e.which;
         		if (keyCode===17) return; // ignore ctl key
         		if (keyCode === 27) { // escape key unselects 
         			//dynamicScore.select();
         			privateSpace.select();
         			//m_selectedElement = undefined;
         		}


				if (radioSelection === "phrase"){
					if (privateSpace.currentGesture){
						switch(keyCode){
							case 13: 
								privateSpace.endContour(t);
								break;
							default: 
								privateSpace.currentGesture.addEvent([t, 0, z, {"event" : "keyDown", "key" : e.key}], true);
								break;
						}
					} else{
						console.log("no gesture to add noteon event to.")
					}
				}
		}

		privateSpace.keyUp = function(e, t, z, radioSelection){
			if (e.repeat) return;
         	var keyCode = e.which;
			if (! privateSpace.currentGesture) return;

			privateSpace.currentGesture.addEvent([t, 0, z, {"event" : "keyUp", "key" : e.key}], true);
	     }


		privateSpace.endContour = function(t){
			if (privateSpace.currentGesture){
				//privateSpace.currentGesture.updateMaxTime(t);
				//privateSpace.currentGesture.addEvent(privateSpace.currentGesture.e, 0, 0, {"event" : "endPhrase"});
				privateSpace.currentGesture.endContour(t);
				if (privateSpace.currentGesture.emptyP()){
					privateSpace.displayElements.remove(privateSpace.currentGesture);
					privateSpace.currentGesture.destroy();
				}
				privateSpace.currentGesture=null;
			}
		}

		privateSpace.drawScreen = function(t){ // should be passing the privateSpace, not the canvas, to the gesture so that it has access to functions such as ms2pix()
			if (privateSpace.currentGesture){
				privateSpace.currentGesture.drawStatic(t);//, privateSpace.ms2pix, height);
			}
		}

		privateSpace.drawGesture=function(g){
			g.drawStatic();
		}

		privateSpace.select=function(g){
			for(var dispElmt=privateSpace.displayElements.length-1;dispElmt>=0;dispElmt--){
					if (privateSpace.displayElements[dispElmt].selectedP){
						privateSpace.displayElements[dispElmt].select(false);
						privateSpace.displayElements[dispElmt].drawStatic();
					}
			}
			g && g.select(true);
			g && g.drawStatic();

		}

		return privateSpace;
	}


 });