
define(
	["utils"],
	function (utils) {
		return function(){
 			var docDiv="textTab"; // already on index.html
 			var k_inputElmtName="rradio";
 			var radioButtonArray = document.getElementsByName(k_inputElmtName); 
 			var numRows=1;
 			var numCols=2;
 			var k_labels=[];

 			//------------------------------------
 			var imagesFileName=["images/rhythm1.jpg", "images/rhythm2.jpg", "images/rhythm3.jpg", "images/rhythm4.jpg"];

 			for(var i=0;i<imagesFileName.length;i++){
 				k_labels[i] = new Image(); 
				k_labels[i].src = imagesFileName[i];
				k_labels[i].width=90;  // for displaying in the tab
				k_labels[i].height=40;
			}
 			//------------------------------------

 			var myInterface={};
 			var m_currentSelectionIndex;

			// Create HTML for this Tab -------------------------------------
			var i,j, tindex;

			var thisTab=document.getElementById(docDiv);
			var tableElmt = document.createElement("div");

			var elmt = document.createElement("input");

			elmt.setAttribute("type", "text");
			//elmt.setAttribute("background", "white");
			elmt.setAttribute("value", "foo");
			elmt.setAttribute("id", "myTextInput");////////////////////////////////
			//elmt.setAttribute("style", "position: absolute;    left: " + window.innerWidth/2 + "; top: " + window.innerHeight/2 + "; width: " + window.innerWidth/2 + "; height: " + window.innerHeight/2);
			elmt.focus();

			thisTab.appendChild(elmt);

			elmt.addEventListener("keypress", keyPress, true);

			function keyPress(e){
         		//var keyCode = e.keyCode;
         		var charCode = e.charCode;
     			//console.log("OK got keydown, = " + String.fromCharCode(e.keyCode));
     			//console.log("OK charCode, = " + charCode);

     			if (charCode===13){
     				elmt.blur();
     			} else{

     			}
        }




			//----------------------------------------------------------------
			// Interface methods

			myInterface.currentSelection = function(){
				return elmt.value ;
			};


			return myInterface;
		}
	}
	)