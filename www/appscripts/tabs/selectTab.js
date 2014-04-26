
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


			var elmt1 = document.createElement("input");

			elmt1.setAttribute("type", "radio");
			elmt1.setAttribute("name", "copymode");
			elmt1.setAttribute("id", "radio_copyOrigSound");
			elmt1.setAttribute("checked", true);
			thisTab.appendChild(elmt1);
			thisTab.appendChild(document.createTextNode("original sound  "));

			var elmt2 = document.createElement("input");

			elmt2.setAttribute("type", "radio");
			elmt2.setAttribute("name", "copymode");
			elmt2.setAttribute("id", "radio_copyNewSound");
			thisTab.appendChild(elmt2);
			thisTab.appendChild(document.createTextNode("current sound"));

			//----------------------------------------------------------------
			// Interface methods

			myInterface.currentSelection = function(){
				return elmt.value ;
			};


			return myInterface;
		}
	}
	)