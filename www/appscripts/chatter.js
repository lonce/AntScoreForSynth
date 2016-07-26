define(
	["comm"],
	function (comm) {
      // argurments are <textareas>
      return function (i_publicTB, i_privateTB, time_cb){

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
				comm.sendJSONmsg("chat", {"text": msg, "time": time_cb()});
				chatter.setText("me", msg, time_cb());
				privateTB.value=privateTB.prompt;
			}
		}


        chatter.setText=function(id, iText, t){
        	publicTB.value += id + (t? " @ " + Math.floor(t/100)/10 : "") + "> " + iText;
        	publicTB.scrollTop = publicTB.scrollHeight;
        }



        return chatter;
    }
});






