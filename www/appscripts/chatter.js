define(
	["comm"],
	function (comm) {
      // For rhythm, the argument to this factory function is an image
      return function (i_publicTB, i_privateTB){

    	var chatter={};

    	var pubicTB = i_publicTB;
    	var privateTB = i_privateTB;

    	privateTB.prompt=">> ";
    	privateTB.value=privateTB.prompt;

		privateTB.onkeyup=function(evt){
			var chrTyped, chrCode = 0;
			var msg;
			//console.log("in onkeyup,  my chat text = " + privateTB.value);
			if (evt.keyIdentifier==="Enter") {
				msg=privateTB.value.slice(privateTB.prompt.length);
				comm.sendJSONmsg("chat", {"text": msg});
				chatter.setText("me ", msg);
				privateTB.value=privateTB.prompt;
			}
		}

        chatter.setText=function(id, iText){
        	pubicTB.value += id + "> " + iText;
        	pubicTB.scrollTop = pubicTB.scrollHeight;
        }

        return chatter;
    }
});






