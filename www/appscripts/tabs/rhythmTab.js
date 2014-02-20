
define(
	["utils"],
	function (utils) {
		return function(){
 			var docDiv="rhythmTab"; // already on index.html
 			var k_inputElmtName="rradio";
 			var radioButtonArray = document.getElementsByName(k_inputElmtName); 
 			var numRows=4;
 			var numCols=1;
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
			tableElmt.setAttribute("border", "1");

			tindex=0;
			for(j=0;j<numRows;j++){
				var rowElmt=document.createElement("tr");
				for(i=0;i<numCols;i++){
					var cellElmt = document.createElement("td");
					var inputElmt = document.createElement("input");
					var uid=utils.uid();

					inputElmt.setAttribute("type", "radio");
					inputElmt.setAttribute("name", k_inputElmtName );
					inputElmt.setAttribute("value", tindex );
					inputElmt.setAttribute("id", uid);  

					cellElmt.appendChild(inputElmt);

					var labelElmt=document.createElement("label");
					labelElmt.setAttribute("for" , uid);
					//-------------------------------------------------------
					labelElmt.appendChild(k_labels[tindex]);
					//-------------------------------------------------------


					cellElmt.appendChild(labelElmt);

					rowElmt.appendChild(cellElmt);

					tindex=tindex+1;
				}

				tableElmt.appendChild(rowElmt);
			}

			thisTab.appendChild(tableElmt);


			//----------------------------------------------------------------
			// Interface methods

			myInterface.SelectRadio = function(pnum){
				//console.log("pnum is " + pnum + ", and k_inputElmtName = " + k_inputElmtName);
				radioButtonArray[pnum].checked = true;
				m_currentSelectionIndex=pnum;
			}

			myInterface.handleClick = function(object){
				console.log("in handleClick and  object is " + object + ", and pitch button has value " + object.target.value);
				myInterface.SelectRadio(object.target.value);
			}

			myInterface.currentSelection = function(){
				return k_labels[m_currentSelectionIndex]; ;
			};


			//----------------------------------------------------------------
			// Initialization

			myInterface.SelectRadio(0);

			for(var i=0;i<radioButtonArray.length;i++){
				//console.log("assigning " + radioButtonArray[i] + " a handler")
				radioButtonArray[i].onclick=myInterface.handleClick;
			};


			return myInterface;
		}
	}
	)