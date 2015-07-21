define(
	["comm"],
	function (comm) {
      // For rhythm, the argument to this factory function is an image
      return function (i_publicTB, i_privateTB){

    	var chatter={};

    	var pubicTB = i_publicTB;
    	var privateTB = i_privateTB;

		privateTB.onkeyup=function(evt){
			var chrTyped, chrCode = 0;
			//console.log("in onkeyup,  my chat text = " + privateTB.value);
			if (evt.keyIdentifier==="Enter") {
				comm.sendJSONmsg("chat", {"text": privateTB.value});
				chatter.setText("me ", privateTB.value);
				privateTB.value="";
			}
		}

        chatter.setText=function(id, iText){
        	pubicTB.value += id + "> " + iText;
        	pubicTB.scrollTop = pubicTB.scrollHeight;
        }

        return chatter;
    }
});






