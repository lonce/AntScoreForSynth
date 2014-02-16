
define(
	["utils"],
	function (utils) {
		return function(){
 			var docDiv="selectTab"; // already on index.html
 			var k_inputElmtName="rradio";
 			var radioButtonArray = document.getElementsByName(k_inputElmtName); 
 			var numRows=1;
 			var numCols=2;
 			var k_labels=[];


 			var myInterface={};
 			var m_currentSelectionIndex;

			// Create HTML for this Tab -------------------------------------
			var i,j, tindex;

			var thisTab=document.getElementById(docDiv);
			var tableElmt = document.createElement("div");

/*
			var elmt = document.createElement("input");

			elmt.setAttribute("type", "text");
			//elmt.setAttribute("background", "white");
			elmt.setAttribute("value", "foo");
			elmt.setAttribute("id", "myTextInput");////////////////////////////////
			//elmt.setAttribute("style", "position: absolute;    left: " + window.innerWidth/2 + "; top: " + window.innerHeight/2 + "; width: " + window.innerWidth/2 + "; height: " + window.innerHeight/2);

			document.getElementById("block3b").appendChild(elmt);
			elmt.focus();

			thisTab.appendChild(elmt);


			//----------------------------------------------------------------
			// Interface methods

			myInterface.currentSelection = function(){
				return elmt.value ;
			};
*/

			return myInterface;
		}
	}
	)