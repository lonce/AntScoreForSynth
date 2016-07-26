/* This application does simple "event chat". Here, events are mouse clicks on a canvas. 
	There is also a metronome tick that comes the server (totally unrelated to the event chat functionality).
	We register for the following messages:
		init - sent by the server after the send connects. Dta returned is an id that the server and other clients will use to recognizes messages from this client.
		mouseContourGesture - sent when select chatroom member generates a mouse click. Data is x, y of their mouse position on their canvas.
		metroPulse - sent by the server evdispPxery second to all chatroom members. Data is the server Date.now.
		startTime  - sent when another chatroom member requests a new time origin. Data is the server Date.now.
*/

require(
	["require", "soundSelect", "comm", "utils", "touch2Mouse", "canvasSlider", "soundbank",  "scoreEvents/scoreEvent", "tabs/pitchTab", "tabs/rhythmTab", "tabs/chordTab",    "tabs/selectTab", "agentManager", "config", "userConfig",  "chatter"],

	function (require, soundSelect, comm, utils, touch2Mouse, canvasSlider, soundbank, scoreEvent, pitchTabFactory, rhythmTabFactory, chordTabFactory,  selectTabFactory, agentMan,  config, userConfig,  chatter) {

		//var mphraseLock.pixelX_agent;
		//agentMan.registerAgent(agentPlayer(soundSelect), "my real agent");
		agentMan.initialize(soundSelect);

		userConfig.on("submit", function(){
			if (userConfig.player === "agent"){
				console.log("you will play with (or as) an agent");
				//m_agent=agentPlayer();
				//m_agent && m_agent.setSoundSelector(soundSelect);
				//agentMan.registerAgent(agentPlayer, "my real agent");

			}

			// unsubscribe to previous room, join new room
			if (myRoom != []) {
				myRoom.forEach(function(r){
					comm.sendJSONmsg("unsubscribe", [r]);
				});
			}
    		myRoom  = userConfig.room;
			if (myRoom != []) {
				myRoom.forEach(function(r){
					console.log("userConfig.report: joing room(s) named " + r); 
					comm.sendJSONmsg("subscribe", [r]);
					
				});
				// Tell everybody in the room to restart their timers.
				comm.sendJSONmsg("startTime", []);
			} 
		});


        var myrequestAnimationFrame = utils.getRequestAnimationFrameFunc();

		var timeOrigin=Date.now();
		var serverTimeOrigin=0;
		var serverTime=0;
		var myID=0;
		var myRoom=[];
		var displayElements = [];  // list of all items to be displayed on the score

		var findElmt=function(objArray,src,id){
			for(var i=0;i<objArray.length;i++){
				//console.log("findElmt: obj.gID = " + objArray[i].gID + " (id = " + id + "), and obj.s = " + objArray[i].s + " ( src = " + src + ")");
				if ((objArray[i].gID===id) && (objArray[i].s===src)){
					return objArray[i];
				}
			}
			return undefined;
		}


		var colorIDMap=[]; // indexed by client ID
		var current_remoteEvent=[]; // indexed by client ID

		var m_currentTab = false;
		var m_selectedElement = undefined;

		var m_lastDisplayTick=0;
		var m_tickCount=0;
		var k_timeDisplayElm=window.document.getElementById("timeDisplayDiv");

		var current_mgesture=undefined;
		var last_mousemove_event; // holds the last known position of the mouse over the canvas (easier than getting the position of a mouse that hasn't moved even though the score underneath it has....)
		var current_mgesture_2send=undefined; // used to send line segments being drawn before they are completed by mouse(finger) up. 

		var lastSendTimeforCurrentEvent=0; 
		var sendCurrentEventInterval=100;  //can't wait till done drawing to send contour segments

		var k_minLineThickness=1;
		var k_maxLineThickness=16; // actually, max will be k_minLineThickness + k_maxLineThickness
		config.maxContourWidth = 17;

		var leftSlider = canvasSlider(window,"slidercanvas1");
		var radioSpray = window.document.getElementById("radioSpray"); 
		var radioContour = window.document.getElementById("radioContour");
		var radioText = window.document.getElementById("radioText");
		var radioSelect = window.document.getElementById("radioSelectDuplicate");
		var radioPitch = window.document.getElementById("radioPitch");
		var radioRhythm = window.document.getElementById("radioRhythm");
		var radioChord = window.document.getElementById("radioChord");
		var radioPhrase = window.document.getElementById("radioPhrase");

		var yLockButton = window.document.getElementById("yLockButton");
		var toggleYLockP=0;
		var yLockVal;
		yLockButton.style.background='#590000';

		yLockButton.onclick=function(){
			toggleYLockP=(toggleYLockP+1)%2;
			if (toggleYLockP===0){
				yLockButton.style.background='#590000';
			} else {
				yLockButton.style.background='#005900';
			}
		}


		var timeLockButton = window.document.getElementById("timeLockButton");
		var toggleTimeLockP=0;
		timeLockButton.style.background='#590000';

		timeLockButton.onclick=function(){
			toggleTimeLockP=(toggleTimeLockP+1)%2;
			if (toggleTimeLockP===0){
				timeLockButton.style.background='#590000';
			} else {
				timeLockButton.style.background='#005900';
			}
		}

		var timeLockSlider = window.document.getElementById("timeLockSlider");

		var phraseLock = {
			value : 0, 		// in [0,1], used the same way the timeLockSlider is
			pixelX : 0,
			window : null
		}
	

		var toggleSoundButton = window.document.getElementById("soundToggleButton");
		var toggleSoundState=1;
		toggleSoundButton.style.background='#005900';


		var descXMsInterval; // =1000*descXSlider.value;
		var descXPxInterval;
		var descXSlider = window.document.getElementById("descXSlider");
		descXSlider.oninput = function(e){
			descXMsInterval =1000*descXSlider.value;
			descXPxInterval = pixelShiftPerMs*descXMsInterval;
			console.log("descxsliderchange");
		}

		var descYInterval;
		var descYSlider = window.document.getElementById("descYSlider");
		descYSlider.oninput = function(e){
			descYInterval =theCanvas.height/descYSlider.value;
		}


		var descXButton = document.getElementById("descXButton");
		descXButton.toggleState=0;
		descXButton.style.background='#590000';
		descXButton.onclick=function(){
			descXButton.toggleState=(descXButton.toggleState+1)%2;
			if (descXButton.toggleState===0){
				descXButton.style.background='#590000';
			} else {
				descXButton.style.background='#005900';
				descXMsInterval =1000*descXSlider.value;
				descXPxInterval = pixelShiftPerMs*descXMsInterval;
			}
		}

		var descYButton = document.getElementById("descYButton");
		descYButton.toggleState=0;
		descYButton.style.background='#590000';
		descYButton.onclick=function(){
			descYButton.toggleState=(descYButton.toggleState+1)%2;
			if (descYButton.toggleState===0){
				descYButton.style.background='#590000';
			} else {
				descYButton.style.background='#005900';
			}
		}




		var getScoreTime=function(){
			return t_sinceOrigin;
		}

		var m_chatter=chatter(window.document.getElementById("publicChatArea"),
			window.document.getElementById("myChatArea"), getScoreTime);

		//-----------------------------------------------------------------------------
		//var newSoundSelector = window.document.getElementById("newSoundSelector")
		soundSelect.setCallback("newSoundSelector", newSoundHandler, "Pentatonic Tone"); // last arg is an (optional) default sound to load
		function newSoundHandler(currentSMFactory) {
			var model = soundSelect.getModelName();
			//agentMan.agent && agentMan.agent.setSoundSelector(soundSelect);

			if (! model) return;
			if(config.webkitAudioEnabled){
					soundbank.addSnd(model, currentSMFactory, toggleSoundState*12); // max polyphony 
			}
			comm.sendJSONmsg('addToSoundbank', [model]);
		}



		//-----------------------------------------------------------------------------


		toggleSoundButton.onclick=function(){
			toggleSoundState=(toggleSoundState+1)%2;
			/*
			if(config.webkitAudioEnabled){
				soundbank.addSnd(toggleSoundState*12); // max polyphony 
			}
			*/
			if (toggleSoundState===0){
				toggleSoundButton.style.background='#590000';
				soundSelect.setMute(true);
			} else {
				toggleSoundButton.style.background='#005900';
				soundSelect.setMute(false);
			}
		}


		var radioSelection = "contour"; // by default

		window.addEventListener("keydown", keyDown, true);

		function keyDown(e){
			var t;
			if (e.repeat) return;
         		var keyCode = e.which;
         		//console.log("keyCode  is " + keyCode + ", and e.key is " + e.key);
         		switch(keyCode){
         			case 84:   //'T'
         				if (e.altKey===true){
         					e.preventDefault();
         					radioSelection = "text"; // the radio button value attribute is "text"
							setTab("textTab");
							document.getElementById("radioText").checked=true;
         				}
         				break;
         			case 77:  // 'M'
         				if (e.altKey===true){
         					e.preventDefault();
         					radioSelection = "contour"; // the radio button value attribute is "contour"
							setTab("contourTab");
							document.getElementById("radioContour").checked=true;
         				}
         				break;
         			case 83:
         				if (e.ctrlKey==1){
         					//alert("control s was pressed");
         					e.preventDefault();
         					if(config.webkitAudioEnabled){
								soundbank.addSnd(12); // max polyphony 
							}
							
         				}
				}
				if (radioSelection === "phrase"){
					//console.log("keyDown in phraseMode: " + keyCode + ", with value = " );

					if (! current_mgesture){
							// AUTO start phrase gesture at now line if keypressed before mousepress
							phraseLock.pixelX=nowLinePx+.5;
							phraseLock.value=px2NormFuture(phraseLock.pixelX);
							
							if (soundSelect.getModelName()===undefined){
								console.log("mousedown: soundselect.model name is " + soundSelect.getModelName());
								return;
							}
							// it would be great to set the y value for this gesture to be at the level where the first note is displayed....
							initiateContour(phraseLock.pixelX,  theCanvas.height/2 - 10*myID);
					}


					if (current_mgesture){
						switch(keyCode){
							case 13: 
								t=t_sinceOrigin+scoreWindowTimeLength*(2/3)*phraseLock.value;
								//current_mgesture.updateMaxTime(t);
								//current_mgesture.addEvent(current_mgesture.e, 0, 0, {"event" : "endPhrase"});
								endContour(t, 0);
								break;
							default: 
								t=t_sinceOrigin+scoreWindowTimeLength*(2/3)*phraseLock.value;
								current_mgesture.addEvent(t, 0, leftSlider.value, {"event" : "keyDown", "key" : e.key});
								break;
						}
					} else{
						console.log("no gesture to add noteon event to.")
					}
				}
		}


		window.addEventListener("keyup", keyUp, true);

		function keyUp(e){
			if (e.repeat) return;
         	var keyCode = e.which;
			var t; 
			if (! current_mgesture) return;
			t=t_sinceOrigin+scoreWindowTimeLength*(2/3)*phraseLock.value;
			current_mgesture.addEvent(t, 0, leftSlider.value, {"event" : "keyUp", "key" : e.key});
	     }




		radioSpray.onclick=function(){
			radioSelection = this.value;
			setTab("sprayTab");
		};
		radioContour.onclick=function(){
			radioSelection = this.value;
			setTab("contourTab");
		};
		radioText.onclick=function(){
			radioSelection = this.value;
			setTab("textTab");
		};

		radioSelect.onclick=function(){
			radioSelection = this.value;
			setTab("selectTab");

		};

		radioPitch.onclick=function(){
			radioSelection = this.value;
			setTab("pitchTab");
		};
		radioRhythm.onclick=function(){
			radioSelection = this.value;
			setTab("rhythmTab");
		};
		radioChord.onclick=function(){
			radioSelection = this.value;
			setTab("chordTab");
		};

		radioPhrase.onclick=function(){
			radioSelection = this.value;
			setTab("phraseTab");
		};

		//radioContour.addEventListener("onclick", function(){console.log("radio Contour");});
		var setTab=function(showTab){

			m_currentTab=showTab;
			if (showTab != "selectTab"){
				m_selectedElement = undefined;
				// unselect any and all elements on the score
				for(dispElmt=displayElements.length-1;dispElmt>=0;dispElmt--){
					displayElements[dispElmt].select(false);
				}
			}	
			

			// unshow whichever tab was perviuosly selected (in fact all others)
			window.document.getElementById("contourTab").style.display="none";
			window.document.getElementById("sprayTab").style.display="none";
			window.document.getElementById("textTab").style.display="none";
			window.document.getElementById("pitchTab").style.display="none";
			window.document.getElementById("rhythmTab").style.display="none";
			window.document.getElementById("chordTab").style.display="none";
			window.document.getElementById("selectTab").style.display="none";
			window.document.getElementById("phraseTab").style.display="none";

			// now show the tab that was selected with the radio buttons
			// (these tabs provide the options for the selected mode)
			window.document.getElementById(showTab).style.display="inline-block";
	

		}

		var m_pTab=pitchTabFactory();
		var m_rTab=rhythmTabFactory();
		var m_cTab=chordTabFactory();
		//var m_tTab=textTabFactory();
		var m_sTab=selectTabFactory();

		var k_sprayPeriod = 100;// ms between sprayed events
		var m_lastSprayEvent = 0; // time (rel origin) of the last spray event (not where on the score, but when it happened. 



		//---------------------------------------------------------------------------
		// data is [timestamp (relative to "now"), x,y] of contGesture, and src is the id of the clicking client
		comm.registerCallback('contGesture', function(data, src) {
			current_remoteEvent[src].d = current_remoteEvent[src].d.concat(data);
			if (data.length === 0) console.log("Got contour event with 0 length data!");
			current_remoteEvent[src].updateMaxTime();
			//current_remoteEvent[src].e=data[data.length-1][0];
		});
		//---------------------------------------------------------------------------
		// data is [timestamp (relative to "now"), x,y] of mouseContourGesture, and src is the id of the clicking client
		comm.registerCallback('beginGesture', function(data, src) {
			var fname;

			console.log("new begin gesture from src " + src + ", and gID = " + data.gID);
			current_remoteEvent[src]=scoreEvent(data.type);
			current_remoteEvent[src].gID=data.gID;
			current_remoteEvent[src].color=colorIDMap[src];
			// automatically fill any fields of the new scoreEvent sent
			for (fname in data.fields){
				current_remoteEvent[src][fname]=data.fields[fname];
				console.log("adding fields " + fname + " = " + data.fields[fname])
			}
			current_remoteEvent[src].d=data.d;
			current_remoteEvent[src].s=src;

			// These are "derived" fields, so no need to send them with the message
			current_remoteEvent[src].updateMinTime();
			current_remoteEvent[src].updateMaxTime();
			//current_remoteEvent[src].b=data.d[0][0];
			//current_remoteEvent[src].e=data.d[data.d.length-1][0];
			console.log("Begin Gesture: END TIME NOW " + current_remoteEvent[src].e);

			current_remoteEvent[src].soundbank=soundbank;


			displayElements.push(current_remoteEvent[src]);

			if (data.cont && (data.cont===true)){
				//console.log("more data for this gesture will be expected");
			} else {
				//console.log("received completed gesture, terminate the reception of data for this gesture");
				current_remoteEvent[src]=undefined; // no more data coming
			}
		});

	//------------------------
	// Finds the at most one element on the display list from the src with data.gID 
	// and updates with all the fields sent
		comm.registerCallback('update', function (data, src){
				var foo = findElmt(displayElements, src, data.gID);
				//console.log("foo is " + foo);
				for (fname in data){
					foo[fname]=data[fname];
					if (fname === "text"){
						foo.setText(src, data[fname]);
					}
				}
		});
		//---------------------------------------------------------------------------
		// data is [timestamp (relative to "now"), x,y] of mouseContourGesture, and src is the id of the clicking client
		comm.registerCallback('endGesture', function(data, src) {
			console.log("end gester received");
			if (data.length >=1){
				current_remoteEvent[src].e=data[0];
			}
			current_remoteEvent[src]=undefined; // no more data coming

		});

		//---------------------------------------------------------------------------
		comm.registerCallback('metroPulse', function(data, src) {
			serverTime=data;
			// check server elapsed time again client elapsed time
			//console.log("on metropulse, server elapsed time = " + (serverTime-serverTimeOrigin) +  ", and client elapsed = "+ (Date.now() - timeOrigin ));
		});
		//---------------------------------------------------------------------------
		comm.registerCallback('startTime', function(data) {
			console.log("server startTime = " + data[0] );

			clearScore();
			agentMan.agent && agentMan.agent.reset();
			
			timeOrigin=Date.now();
			lastSendTimeforCurrentEvent= -Math.random()*sendCurrentEventInterval; // so time-synched clients don't all send their countour chunks at the same time. 
			serverTimeOrigin=data[0];
			m_lastDisplayTick=0;
			displayElements=[];		
		});
		//---------------------------------------------------------------------------
		// Just make a color for displaying future events from the client with the src ID
		comm.registerCallback('newmember', function(data, src) {
			console.log("new member : " + src);
			colorIDMap[src]=utils.getRandomColor1(100,255,0,120,100,255);			
		});
		//---------------------------------------------------------------------------
		// a list of all members including yourself
		comm.registerCallback('roommembers', function(data, src) {
			console.log("In rommembers callback, src (to set myID is " + src);
			myID=src; /// THIS IS WHERE WE FIRST GET IT.
			colorIDMap[myID]="#00FF00"; // I am always green
			data.forEach(function(m){
				if (m != myID){
					console.log("... " + m + " is also in this room");
					colorIDMap[m]=utils.getRandomColor1(100,255,0,120,100,255);
				} 
			});

		});

		//---------------------------------------------------------------------------
		// Server calls this before weve registered callbacks. 
		// MOVED myID assignment into ROMMEMBERS callback
		comm.registerCallback('init', function(data) {
			//pong.call(this, data[1]);
			myID=data[0];
			console.log("***********Server acknowledged, assigned me this.id = " + myID);
			colorIDMap[myID]="#00FF00";

		});


		comm.registerCallback('addToSoundbank', function(data, src) {
			console.log("add to soundbank for remote client " + data[0]);
			soundSelect.loadSound(data[0],function(sfactory){
				console.log("loaded sound for remote client")
				soundbank.addSnd(data[0], sfactory, 12); // max polyphony 
			});

		});

	//------------------------
	// For chatting
		comm.registerCallback('chat', function (data, src){
			console.log("got chat from src = " + src);
			m_chatter.setText(src, data.text, data.time); 
		});


		//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
		// Client activity
		//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
		var theCanvas = document.getElementById("score");
		var context = theCanvas.getContext("2d");
		var mouseX;
		var mouseY;
		context.font="9px Arial";

		var scoreWindowTimeLength=40000; //ms
		var pixelShiftPerMs=1*theCanvas.width/(scoreWindowTimeLength);
		var pxPerSec=pixelShiftPerMs*1000;
		var nowLinePx=1*theCanvas.width/3;
		var pastLinePx=-20; // after which we delete the display elements

		var sprocketHeight=2;
		var sprocketWidth=1;
		var sprocketInterval=1000; //ms

		var numTracks = 4;
		var trackHeight=1*theCanvas.height / numTracks;
		var trackY =[]; // array of y-values (pixels) that devide each track on the score
		for (var i=0;i<numTracks;i++){
			trackY[i]=i*trackHeight;
		}



		var time2Px=function(time){ // time measured since timeOrigin
			return nowLinePx+(time-t_sinceOrigin)*pixelShiftPerMs;
		}
		var px2Time=function(px){  // relative to the now line
			return (px-nowLinePx)/pixelShiftPerMs;
		}

		var px2TimeO=function(px){  // relative to origin
			return t_sinceOrigin+(px-nowLinePx)/pixelShiftPerMs;
		}

		var pxTimeSpan=function(px){  //units of ms
			return (px/pixelShiftPerMs);
		}

		var px2NormFuture=function(px){
			return (px2Time(px)/((2/3)*scoreWindowTimeLength));
		}

		var lastDrawTime=0;
		var t_sinceOrigin;
		var nowishP = function(t){
			if ((t > lastDrawTime) && (t <= t_sinceOrigin)) return true;
		}




		theCanvas.addEventListener("mousedown", onMouseDown, false);
		theCanvas.addEventListener("mouseup", onMouseUp, false);
		theCanvas.addEventListener("mousemove", onMouseMove, false);

		theCanvas.addEventListener("touchstart", touch2Mouse.touchHandler, true);
      	theCanvas.addEventListener("touchmove", touch2Mouse.touchHandler, true);
      	theCanvas.addEventListener("touchend", touch2Mouse.touchHandler, true);
      	theCanvas.addEventListener("touchcancel", touch2Mouse.touchHandler, true);    


		drawScreen(0);

		var dispElmt;

		function drawScreen(elapsedtime) {

			context.clearRect(0, 0, 1*theCanvas.width, 1*theCanvas.height);

			// Add to currently-in-progress mouse gesture if any drawing is going on ------------------
			if (current_mgesture) {
				var m = utils.getCanvasMousePosition(theCanvas, last_mousemove_event);
				var tx=m.x;
				var ty=m.y;

				tx= (toggleTimeLockP===0) ? elapsedtime + px2Time(m.x) : elapsedtime+scoreWindowTimeLength*(2/3)*timeLockSlider.value;

				//Descretize the new point in time and height
				if (descXButton.toggleState === 1){ 
					tx = px2TimeO(m.x) - px2TimeO(m.x)%descXMsInterval;
				}

				if (descYButton.toggleState === 1){
					ty= m.y + descYInterval- m.y%descYInterval;
				}

				// var ty = (toggleYLockP===0)? m.y : yLockVal;
				if (toggleYLockP===1) {
					ty = yLockVal;
				}
			

				if (current_mgesture && current_mgesture.type === 'mouseContourGesture'){
					// drawn contours must only go up in time
					if (tx > current_mgesture.d[current_mgesture.d.length-1][0]){

						// If either y or x is descrete, no gliding - CREATE EXTRA POINT TO EXTEND OLD ONE
						if ((descYButton.toggleState === 1) ||  (descXButton.toggleState === 1)){
							var interx = tx;
							var intery = ty;

							if (descYButton.toggleState === 1 ){ // if descrete in y, extend the old x
								interx = current_mgesture.d[current_mgesture.d.length-1][0];
								console.log("discrete in y - extend x at " + (Date.now()-timeOrigin));
							}
							if (descXButton.toggleState === 1 ){ // if descrete in x, extend the old y
								intery = current_mgesture.d[current_mgesture.d.length-1][1];
								console.log("discrete in x - extend y at " + (Date.now()-timeOrigin));
							}
							// if descrete in BOTH, etra point needs to be at the descritized y 
							if ((descYButton.toggleState === 1) &&  (descXButton.toggleState === 1)){
								intery = ty; // so that new point extends back to last descretized x value
							}


							current_mgesture.addEvent(interx, intery, k_minLineThickness + k_maxLineThickness*leftSlider.value);
							current_mgesture_2send.d.push([interx, intery, k_minLineThickness + k_maxLineThickness*leftSlider.value]);
						}

						// after extending previous point, add the new point
						current_mgesture.addEvent(tx, ty, k_minLineThickness + k_maxLineThickness*leftSlider.value);
						current_mgesture_2send.d.push([tx, ty, k_minLineThickness + k_maxLineThickness*leftSlider.value]);
					}
					current_mgesture.updateMaxTime();
				} 
				if (current_mgesture &&  current_mgesture.type === 'mouseEventGesture'){
					if (elapsedtime > (m_lastSprayEvent+k_sprayPeriod)){
						// add a spray splotto the current gesture
						current_mgesture.addEvent(tx, ty, k_minLineThickness + k_maxLineThickness*leftSlider.value);
						current_mgesture_2send.d.push([tx, ty, k_minLineThickness + k_maxLineThickness*leftSlider.value]);						
						m_lastSprayEvent  = Date.now()-timeOrigin;
					}
					current_mgesture.updateMaxTime();
					current_mgesture.updateMinTime();

				} 
				if (current_mgesture &&  current_mgesture.type === 'pitchEvent'){
					// pitch events do not extend in time...
				}
			}
			//---------------------------------------------------------------
 
 			// Draw scrolling sprockets--
 			context.fillStyle = "#999999";
 			var sTime = (elapsedtime+scoreWindowTimeLength*(2/3))- (elapsedtime+scoreWindowTimeLength*(2/3))%sprocketInterval;
 			//console.log("sprocket stime: " + sTime);
			var sPx= time2Px(sTime);
			//console.log("t since origin is " + t_sinceOrigin + ", and sTime is " + sTime);
			while(sPx > 0){ // loop over sprocket times within score window
				context.fillRect(sPx,0,sprocketWidth,sprocketHeight);
				context.fillRect(sPx,1*theCanvas.height-sprocketHeight,sprocketWidth,sprocketHeight);
				sPx-=pixelShiftPerMs*sprocketInterval;
			}
			var disTime=sTime-(sTime%5000);
			context.font="7px Verdana";
			while (disTime >=(sTime-scoreWindowTimeLength)){
				context.fillText(disTime/1000,time2Px(disTime),10);
				//console.log("write disTime= " + disTime);
				disTime-=5000;
			}
			context.font="9px Arial";

			// Draw DescX lines if necessary
			if (descXButton.toggleState===1){
				context.lineWidth =1;
				context.strokeStyle = "#333";
				sTime = (elapsedtime+scoreWindowTimeLength*(2/3))- (elapsedtime+scoreWindowTimeLength*(2/3))%(descXMsInterval);
				//console.log("descX sTime: " + sTime);
				//console.log(" ");
				var start_sPx= time2Px(sTime);
				sPx=start_sPx;

				var loopCount=0;
				while(sPx > 0){ // loop over sprocket times within score window			
					context.beginPath();					
					context.moveTo(sPx, 0);
					context.lineTo(sPx, 1*theCanvas.height);
					context.stroke();
					context.closePath();

					loopCount++;
					sPx=start_sPx-loopCount*pixelShiftPerMs*descXMsInterval;
					//sPx-=pixelShiftPerMs*descXMsInterval;
				}
			}
			/*
			//------------
			//draw track lines
			context.strokeStyle = "#444";	
			context.lineWidth =1;			
			for (var i=1;i<numTracks;i++){
				context.beginPath();
				context.moveTo(0, trackY[i]);
				context.lineTo(1*theCanvas.width, trackY[i]);
				context.stroke();
			}
			*/
			// Draw DescY lines if necessary
			if (descYButton.toggleState===1){
				context.lineWidth =1;
				context.strokeStyle = "#333";
				descYInterval=1*theCanvas.height / numTracks;
				descYInterval=1*theCanvas.height/descYSlider.value;
				for (var i=1;i<descYSlider.value;i++){
					context.beginPath();
					context.moveTo(0, i*descYInterval);
					context.lineTo(1*theCanvas.width, i*descYInterval);
					context.stroke();
				}
			}


			//------------		
			// Draw the musical display elements 
			var t_end; 
			for(dispElmt=displayElements.length-1;dispElmt>=0;dispElmt--){ // run through in reverse order so we can splice the array to remove long past elements

				// If its moved out of our score window, delete it from the display list
				t_end=time2Px(displayElements[dispElmt].e);

				if (t_end < pastLinePx) {
					// remove event from display list
					//console.log("deleting element at time " + displayElements[dispElmt].e);
					displayElements[dispElmt].destroy();
					displayElements.splice(dispElmt,1);

				} else{

					var dispe = displayElements[dispElmt];	

					//console.log("draw event of type " + dispe.type);				
					dispe.draw(context, time2Px, nowishP, t_sinceOrigin);


					// If element is just crossing the "now" line, create little visual explosion
					if (nowishP(dispe.d[0][0])){					
						explosion(time2Px(dispe.d[0][0]), dispe.d[0][1], 5, "#FF0000", 3, "#FFFFFF");

					} 
				}
			}

			// draw the "now" line
			context.strokeStyle = "#FF0000";	
			context.lineWidth =1;
			context.beginPath();					
			context.moveTo(nowLinePx, 0);
			context.lineTo(nowLinePx, 1*theCanvas.height);
			context.stroke();
			context.closePath();

			lastDrawTime=elapsedtime;

			//--------------------------------------------
			// Draw the timeLocked line if necessary
			//slider
			if (toggleTimeLockP===1){
				//console.log ("slider val is " + timeLockSlider.value);

				sTime=elapsedtime+scoreWindowTimeLength*(2/3)*timeLockSlider.value;
				sPx= time2Px(sTime);

				context.strokeStyle = "#FFFF00";
				context.lineWidth =1;
				context.beginPath();					
				context.moveTo(sPx, 0);
				context.lineTo(sPx, 1*theCanvas.height);
				context.stroke();
				context.closePath();
			}

		} // closes the drawscreen function




		function explosion(x, y, size1, color1, size2, color2) {
			var fs=context.fillStyle;
			var ss = context.strokeStyle;

			context.beginPath();
			context.fillStyle=color1;
			context.arc(x,y,size1,0,2*Math.PI);
			context.closePath();
			context.fill();
									
			context.beginPath();
			context.strokeStyle=color2;
			context.lineWidth = size2;
			context.arc(x,y,size1,0,2*Math.PI);
			context.stroke();
			context.lineWidth = 1;

			context.fillStyle=fs;
			context.strokeStyle=ss;
		}


//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
		function initiateContour(x, y){
			//console.log("initateContour: radioSelection is " + radioSelection);
			// don't draw contours if no sound is loaded (but allow text entry)
			if((! soundSelect.loaded()) && (! (radioSelection==='text'))) return;

			var z = k_minLineThickness + k_maxLineThickness*leftSlider.value;
			// time at the "now" line + the distance into the future or past 
			var t = Date.now()-timeOrigin + px2Time(x);		

			//console.log("initiateContour with t = " + t)	;

			if (radioSelection==='contour'){
				current_mgesture=scoreEvent("mouseContourGesture");
				current_mgesture.d=[[t,y,z]];
				current_mgesture.soundbank=soundbank;
				current_mgesture.soundName = soundSelect.getModelName();
				current_mgesture.param1=soundSelect.getSelectedParamName(1);
				current_mgesture.param2=soundSelect.getSelectedParamName(2);


				comm.sendJSONmsg("beginGesture", {"d":[[t,y,z]], "type": "mouseContourGesture", "gID": current_mgesture.gID, "cont": true, "fields": current_mgesture.getKeyFields()  });
				current_mgesture_2send={type: 'mouseContourGesture', d: [], s: myID}; // do I need to add the source here??

				//console.log("starting gesture at " + t + ", " + y + ", " + z);
			} 

			if (radioSelection==='spray'){
				current_mgesture=scoreEvent("mouseEventGesture");
				current_mgesture.d=[[t,y,z]];
				current_mgesture.soundbank=soundbank;
				current_mgesture.soundName = soundSelect.getModelName();
				current_mgesture.param1=soundSelect.getSelectedParamName(1);
				current_mgesture.param2=soundSelect.getSelectedParamName(2);


				comm.sendJSONmsg("beginGesture", {"d":[[t,y,z]], "type": "mouseEventGesture", "cont": true, "fields": current_mgesture.getKeyFields() });
				current_mgesture_2send={type: 'mouseEventGesture', d: [], s: myID}; // do I need to add the source here??

				m_lastSprayEvent  = Date.now()-timeOrigin; // now, regardless of where on the time score the event is
			} 

			if (radioSelection==='text'){
				//current_mgesture=scoreEvent("textEvent", m_tTab.currentSelection());
				current_mgesture=scoreEvent("textEvent");
				current_mgesture.enableEditing(); // enable since it's our own for typing into
				current_mgesture.d=[[t,y,z]];

				// calculate the length of the text box on the canvas
				//current_mgesture.addEvent(t + pxTimeSpan(context.measureText(m_tTab.currentSelection()).width),y,z);

				// send WHLE GESTRE AT ONCE (no need to send updated data in real time )
				//comm.sendJSONmsg("beginGesture", {"d":[[t,y,z]], "type": "textEvent", "cont": false, "fields": {"text": m_tTab.currentSelection()} });
				comm.sendJSONmsg("beginGesture", {"d":[[t,y,z]], "type": "textEvent", "gID": current_mgesture.gID, "cont": false, "fields": current_mgesture.getKeyFields() });

			}

			if (radioSelection==='pitch'){
				current_mgesture=scoreEvent("pitchEvent", m_pTab.currentSelection());
				current_mgesture.d= [[t,y,z]];
			}

			if (radioSelection==='rhythm'){
				current_mgesture=scoreEvent("rhythmEvent", m_rTab.currentSelection());
				current_mgesture.d= [[t,y,z]];
			}

			if (radioSelection==='chord'){
				current_mgesture=scoreEvent("chordEvent", m_cTab.currentSelection());
				current_mgesture.d= [[t,y,z]];
			}

			if (radioSelection==='phrase'){
				current_mgesture=scoreEvent("phraseEvent", phraseLock);
				current_mgesture.d= [[t,y,z]];

				current_mgesture.soundbank=soundbank;
				current_mgesture.soundName = soundSelect.getModelName();
				current_mgesture.param1=soundSelect.getSelectedParamName(1);
				current_mgesture.param2=soundSelect.getSelectedParamName(2);

				comm.sendJSONmsg("beginGesture", {"d":[[t,y,z]], "type": "phraseEvent", "gID": current_mgesture.gID, "cont": true, "fields": current_mgesture.getKeyFields() });

			}

			current_mgesture.updateMinTime();
			current_mgesture.updateMaxTime();
			current_mgesture.s= myID;
			current_mgesture.color="#00FF00";
			displayElements.push(current_mgesture);
		}

		function clearScore(){
			for(dispElmt=displayElements.length-1;dispElmt>=0;dispElmt--){
				displayElements[dispElmt].stopSound();
			}
			current_mgesture=undefined;
			current_mgesture_2send=undefined;
		}


		function endContour(){
			//console.log("endContour: current event is " + current_mgesture + " and the data length is " + current_mgesture.d.length);
			current_mgesture.b=current_mgesture.d[0][0];
			//console.log("contour length is " + current_mgesture.d.length);
			current_mgesture.e=current_mgesture.d[current_mgesture.d.length-1][0];
			//console.log("gesture.b= "+current_mgesture.b + ", and gesture.e= "+current_mgesture.e);
			
			if (myRoom != []) {
				//console.log("sending event");
				if (current_mgesture_2send){
					if (current_mgesture_2send.d.length > 0){
						comm.sendJSONmsg("contGesture", current_mgesture_2send.d);
					}
					comm.sendJSONmsg("endGesture", [current_mgesture.e]);
				}	

				//"new" api to purge main.js of any "current_mgesture_2send" crap.
				if (current_mgesture.type==="phraseGesture"){ // only phraseGesture uses new api so far.
					current_mgesture.sendContinuation();
					comm.sendJSONmsg("endGesture", [current_mgesture.e]);
				}

			}
			current_mgesture=undefined;
			current_mgesture_2send=undefined;
		}
	
		// Record the time of the mouse event on the scrolling score
		function onMouseDown(e){
			event.preventDefault();
			var m = utils.getCanvasMousePosition(theCanvas, e);

			// by default,
			var x=m.x;
			var y=m.y;

			if (descXButton.toggleState === 1){
				x = time2Px(px2TimeO(m.x) - px2TimeO(m.x)%descXMsInterval);
				//console.log("descritizing x time to " + (px2TimeO(m.x) - px2TimeO(m.x)%descXMsInterval))
				//console.log("mouse time is " + px2Time(m.x) + ", mod time is " + px2Time(m.x)%descXMsInterval);
			}

			// time lock takes prcedence
			x= (toggleTimeLockP===0) ? x : nowLinePx+1*theCanvas.width*(2/3)*timeLockSlider.value;


			if (descYButton.toggleState === 1){
				y= m.y + descYInterval - m.y%descYInterval;
			}

			if (toggleYLockP===1){
				yLockVal=m.y
			}



			last_mousemove_event=e;

			//console.log("mousedown: m_currentTab is " + m_currentTab);


			if ((m_currentTab === "sprayTab") || (m_currentTab === "contourTab")) {
				if (soundSelect.getModelName()===undefined){
					console.log("mousedown: soundselect.model name is " + soundSelect.getModelName());
					return;
				}
			}

			if (m_currentTab === "phraseTab") {
				console.log("mouse down with phraseTab selected");
				if (current_mgesture) {
					endContour(t_sinceOrigin+scoreWindowTimeLength*(2/3)*phraseLock.value, 0);
				}
				phraseLock.value=px2NormFuture(x);
				phraseLock.pixelX=x;
				console.log("MouseDown: setting phraseLockValue to " + phraseLock.value);
				if (soundSelect.getModelName()===undefined){
					console.log("mousedown: soundselect.model name is " + soundSelect.getModelName());
					return;
				}
			}

			// now either select a duplicate a selected contour or initiate a new one.
			if (m_currentTab === "selectTab"){
				console.log("onMouseDown: check for selected element");
				for(dispElmt=displayElements.length-1;dispElmt>=0;dispElmt--){
						if (displayElements[dispElmt].touchedP(t_sinceOrigin + px2Time(m.x), m.y)){
							m_selectedElement=displayElements[dispElmt];
							return; // we are done with MouseDown!
						}
				}
				if (m_selectedElement){
					//console.log("about to dubplicate elmt of type " + m_selectedElement.type);
					var tshift = t_sinceOrigin + px2Time(m.x) - m_selectedElement.b;
					var yshift = y-m_selectedElement.d[0][1];
					var newG = m_selectedElement.duplicate(tshift,yshift,scoreEvent(m_selectedElement.type));

					if (document.getElementById("radio_copyNewSound").checked === true){
			               newG.soundName=soundSelect.getModelName();
			               newG.param1=soundSelect.getSelectedParamName(1);
			               newG.param2=soundSelect.getSelectedParamName(2);
					}
					

					comm.sendJSONmsg("beginGesture", {"d":newG.d, "type": m_selectedElement.type, "cont": false, "fields": newG.getKeyFields() });
					m_selectedElement.select(false);
					newG.select(true);
					displayElements.push(newG);
				}

			} else {

				initiateContour(x, y);
			}

		}

		function onMouseUp(e){
			if (m_currentTab === "phraseTab") return; // don't end phrase gestures until RETURN key is hit
			current_mgesture && endContour();
			var m = utils.getCanvasMousePosition(theCanvas, e);

		}

		function onMouseMove(e){
			last_mousemove_event=e;
		}


		//	++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
		var t_myMachineTime;
		var t_count=0;
		var timerLoop = function(){

			t_myMachineTime = Date.now();
			t_sinceOrigin = t_myMachineTime-timeOrigin;
			
			drawScreen(t_sinceOrigin);

			agentMan.agent && agentMan.agent.tick(t_sinceOrigin, displayElements);

			// create a display clock tick every 1000 ms
			while ((t_sinceOrigin-m_lastDisplayTick)>1000){  // can tick more than once if computer went to sleep for a while...
				m_tickCount++;
				m_lastDisplayTick += 1000;
				k_timeDisplayElm.innerHTML=Math.floor(m_lastDisplayTick/1000);

				
				//console.log("displayElements length is " + displayElements.length)
				if (displayElements.length >2){
					var foo = 4;
				}
			}

			//-----------  if an event is in the middle of being drawn, send it every sendCurrentEventInterval
			// send current event data periodically (rather than waiting until it is complete)
			//console.log("time since origin= " + t_sinceOrigin + ", (t_sinceOrigin-lastSendTimeforCurrentEvent) = "+ (t_sinceOrigin-lastSendTimeforCurrentEvent));
			if ((t_sinceOrigin-lastSendTimeforCurrentEvent) > sendCurrentEventInterval){
				//console.log("tick " + t_sinceOrigin);
				if (myRoom != []) {
					//console.log("sending event");
					if (current_mgesture_2send && (current_mgesture_2send.d.length > 0)) {
						comm.sendJSONmsg("contGesture", current_mgesture_2send.d);
						current_mgesture_2send.d=[];
					}
					//"new" api to purge main.js of any "current_mgesture_2send" crap.
					if (current_mgesture && current_mgesture.type==="phraseGesture"){ // only phraseGesture uses new api so far.
						current_mgesture.sendContinuation();
					}

				}
 				lastSendTimeforCurrentEvent=t_sinceOrigin;
			}
			
			//--------------------------------------------------------

			myrequestAnimationFrame(timerLoop);
		};

		timerLoop();  // fire it up

		//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
		// callback from html
/*
		var roomselect = document.getElementById('roomList');

		roomselect.addEventListener('change', function(e) {

			if (myRoom != undefined) comm.sendJSONmsg("unsubscribe", [myRoom]);

        	myRoom  = e.currentTarget.value;
        	//document.getElementById("current_room").value=mylist.options[mylist.selectedIndex].text;
        	//document.getElementById("current_room").value=myRoom;

			if (myRoom != undefined) {
        		// just choose a default room (rather than getting a list from the server and choosing)
				comm.sendJSONmsg("subscribe", [myRoom]);
				// Tell everybody in the room to restart their timers.
				comm.sendJSONmsg("startTime", []);
			} 
   		 })
*/


		// INITIALIZATIONS --------------------
		radioContour.checked=true; // initialize
		setTab("contourTab");

	}
);