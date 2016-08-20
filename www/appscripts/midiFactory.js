define(
	[],
	function () {

 	var midiAccess=null;  // the MIDIAccess object.


	return function (cb) {

		if (navigator.requestMIDIAccess)
        	navigator.requestMIDIAccess().then( onMIDIInit, onMIDIReject );
      	else
        	alert("No MIDI support present in your browser - use the QWERTY keyboard for note inpu.")

		//----------
		function onMIDIInit(midi) {
	      midiAccess = midi;

	      var haveAtLeastOneDevice=false;
	      var inputs=midiAccess.inputs.values();
	      for ( var input = inputs.next(); input && !input.done; input = inputs.next()) {
	        input.value.onmidimessage = MIDIMessageEventHandler;
	        haveAtLeastOneDevice = true;
	      }
	      if (!haveAtLeastOneDevice){
	        alert("No MIDI input devices present.  Use QWERTY keys for notes.");
	    	} else {
	    		console.log("OK - got your midi divice");
	    	}
	    }

	    //----------
	    function onMIDIReject(err) {
	      alert("The MIDI system failed to start.  You're gonna have a bad time.");
	    }

	    //---------
	    function MIDIMessageEventHandler(event) {
	      // Mask off the lower nibble (MIDI channel, which we don't care about)
	      switch (event.data[0] & 0xf0) {
	        case 0x90:
	          if (event.data[2]!=0) {  // if velocity != 0, this is a note-on message
	            //noteOn(event.data[1]);
	            console.log("noteon");
	            cb("noteOn", event.data[1]);
	            return;
	          }
	          // if velocity == 0, fall thru: it's a note-off.  MIDI's weird, y'all.
	        case 0x80:
	          //noteOff(event.data[1]);
	          console.log("noteon");
	          cb("noteOff", event.data[1])
	          return;
	      }
	    } //MIDIMessageEventHandler

	}
});