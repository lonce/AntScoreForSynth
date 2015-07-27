define(
	["comm"],
	function (comm) {
      // argurments are <textareas>
      return function (i_publicTB, i_privateTB){

    	var chatter={};

    	var publicTB = i_publicTB;
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
				chatter.setText("me", msg);
				privateTB.value=privateTB.prompt;
			}
		}

        chatter.setText=function(id, iText){
        	/* can't have different color text in a text area 
        	if (id === "me") {
        		publicTB.style.color="green";
        	} else {
        		publicTB.style.color="white";
        	} */
        	publicTB.value += id + "> " + iText;
        	publicTB.scrollTop = publicTB.scrollHeight;
        }

        return chatter;
    }
});






