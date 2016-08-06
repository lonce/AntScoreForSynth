define(
[],
function () {
	return function (svgCanvas, timespan){
		var privateSpace = {}; 
		var height = svgCanvas.getBoundingClientRect().height;

		svgCanvas.AAAAAAAAA = "AAAAAAAAAAA";

		privateSpace.displayElements=[]; // list of score elememnts
		var pixPerMs = svgCanvas.getBoundingClientRect().width/timespan; 

		privateSpace.initiateContour = function(g,x,y, z){
			console.log("begin static pgesture on canvas with height = " + height + ", at point [" + x + ", " + y + "]" + "  with a pixPerMs = " + pixPerMs);
			g.clientX = x;
			g.clientY = y;
			g.setScore(svgCanvas);
			g.addEvent([0,y,z]); // events record the time, not the x-value pixel
			privateSpace.displayElements.push(g);
			if (g.type === "phraseGesture"){
				g.drawStatic()
			}
		}

		return privateSpace;
	}


 });