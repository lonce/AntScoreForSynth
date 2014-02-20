
define(
	["utils"],
	function (utils) {
		return function(){
			var docDiv="rhythmTab"; // already on index.html
			var k_inputElmtName="rradio";

			var imagesFileName=["images/rhythm1", "images/rhythm2", "images/rhythm3", "images/rhythm4"];

         	//var k_pitches=["1c3", "1C3#", "1D3", "1D3#",  "1E3", "1F3", "1F3#", "1G3", "1G3#", "1A3", "1A3#", "1B3" ];
         	var k_pitches=["c3", "C3#", "D3", "D3#",  "E3", "F3", "F3#", "G3", "G3#", "A3", "A3#", "B3" ];
         	//var k_pitches=["1c3", "1C3#", "1D3", "1D3#"];


         	var pitchVal;

			var pitchTab={};

			var randomNumber;
			var correct = 0, wrong=0;


			// Create HTML for this Tab -------------------------------------
			var numRows=2;
			var numCols=2;
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
					labelElmt.innerHTML= k_pitches[tindex];

					cellElmt.appendChild(labelElmt);

					rowElmt.appendChild(cellElmt);

					tindex=tindex+1;
				}

				tableElmt.appendChild(rowElmt);
			}

			thisTab.appendChild(tableElmt);

			// Create HTML for this Tab -------------------------------------


			pitchTab.SelectRadio = function(pnum){
				//console.log("pnum is " + pnum + ", and k_inputElmtName = " + k_inputElmtName);
				var array = document.getElementsByName(k_inputElmtName); 
				array[pnum].checked = true;
				pitchVal=k_pitches[pnum];
			}

			pitchTab.handleClick = function(object){
				console.log("in handle (rhythm) click, and object is " + object + ", and rhythm has value " + object.target.value);
				pitchTab.SelectRadio(object.target.value);
			}

			pitchTab.currentSelection = function(){
				return pitchVal;
			};


		//pitchTab.SelectRadio(k_pitches.length/2);
		pitchTab.SelectRadio(0);

		return pitchTab;
	}
}
)