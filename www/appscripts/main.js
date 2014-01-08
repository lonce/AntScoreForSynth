/* This application does simple "event chat". Here, events are mouse clicks on a canvas. 
	There is also a metronome tick that comes the server (totally unrelated to the event chat functionality).
	We register for the following messages:
		init - sent by the server after the client connects. Data returned is an id that the server and other clients will use to recognizes messages from this client.
		mouseContourGesture - sent when another chatroom member generates a mouse click. Data is x, y of their mouse position on their canvas.
		metroPulse - sent by the server evdispPxery second to all chatroom members. Data is the server Date.now.
		startTime  - sent when another chatroom member requests a new time origin. Data is the server Date.now.
*/

require.config({
	paths: {
		"jsaSound": (function(){
			if (! window.document.location.hostname){
				alert("This page cannot be run as a file, but must be served from a server (e.g. animatedsoundworks.com:8001, or localhost:8001)." );
			}
				// hardcoded to read sounds served from jsaSound listening on port 8001 (on the same server as the AnticipatoryScore server is running)
				var host = "http://"+window.document.location.hostname + ":8001";
				//alert("Will look for sounds served from " + host);
				return (host );
			})()
	}
});
require(
	["require", "comm", "utils", "touch2Mouse", "canvasSlider", "soundbank", "scoreEvents/pitchEvent", "scoreEvents/rhythmEvent", "scoreEvents/chordEvent",  "scoreEvents/contourEvent", "scoreEvents/sprayEvent", "tabs/pitchTab", "tabs/rhythmTab", "tabs/chordTab", "config"],

	function (require, comm, utils, touch2Mouse, canvasSlider, soundbank, pitchEvent, rhythmEvent, chordEvent, contourEvent, sprayEvent, pitchTabFactory, rhythmTabFactory, chordTabFactory, config) {



        var myrequestAnimationFrame = utils.getRequestAnimationFrameFunc();

		var timeOrigin=Date.now();
		var serverTimeOrigin=0;
		var serverTime=0;
		var myID=0;
		var myRoom='';
		var displayElements = [];  // list of all items to be displayed on the score
		var colorIDMap=[]; // indexed by client ID
		var current_remoteEvent=[]; // indexed by client ID

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

		var leftSlider = canvasSlider(window,"slidercanvas1");
		var radioSpray = window.document.getElementById("radioSpray"); 
		var radioContour = window.document.getElementById("radioContour");
		var radioPitch = window.document.getElementById("radioPitch");
		var radioRhythm = window.document.getElementById("radioRhythm");
		var radioChord = window.document.getElementById("radioChord");

		var toggleSoundButton = window.document.getElementById("soundToggleButton");
		var toggleSoundState=1;

		//initialize sound band
		if(config.webketAudioEnabled){
				soundbank.create(toggleSoundState*12); // max polyphony 
		}

		toggleSoundButton.onclick=function(){
			toggleSoundState=(toggleSoundState+1)%2;
			if(config.webketAudioEnabled){
				soundbank.create(toggleSoundState*12); // max polyphony 
			}
		}

		var radioSelection = "contour"; // by default

		window.addEventListener("keydown", keyDown, true);

		function keyDown(e){
         		var keyCode = e.keyCode;
         		switch(keyCode){
         			case 83:
         				if (e.ctrlKey==1){
         					//alert("control s was pressed");
         					e.preventDefault();
         					if(config.webketAudioEnabled){
								soundbank.create(12); // max polyphony 
							}
							
         				}
				}
		}

		radioSpray.onclick=function(){
			radioSelection = this.value;
			setTab("sprayTab");
		};
		radioContour.onclick=function(){
			radioSelection = this.value;
			setTab("contourTab");
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

		//radioContour.addEventListener("onclick", function(){console.log("radio Contour");});
		var setTab=function(showTab){
			window.document.getElementById("contourTab").style.display="none";
			window.document.getElementById("sprayTab").style.display="none";
			window.document.getElementById("pitchTab").style.display="none";
			window.document.getElementById("rhythmTab").style.display="none";
			window.document.getElementById("chordTab").style.display="none";

			window.document.getElementById(showTab).style.display="inline-block";
		}

		var m_pTab=pitchTabFactory();
		var m_rTab=rhythmTabFactory();
		var m_cTab=chordTabFactory();

		var k_sprayPeriod = 20;// ms between sprayed events
		var m_lastSprayEvent = 0; // time (rel origin) of the last spray event (not where on the score, but when it happened. 


		//---------------------------------------------------------------------------
		// init is called just after a client navigates to the web page
		// 	data[0] is the client number we are assigned by the server.
		comm.registerCallback('init', function(data) {
			//pong.call(this, data[1]);
			myID=data[0];
			console.log("Server acknowledged, assigned me this.id = " + myID);
			colorIDMap[myID]="#00FF00";

		});
		//---------------------------------------------------------------------------
		// data is [timestamp (relative to "now"), x,y] of mouseGesture, and src is the id of the clicking client
		comm.registerCallback('mouseGesture', function(data, src) {
			console.log("got mouse contour gesture from the net");
			//console.log("got mouseGesture event from source " + src + " ....  e: " + data[data.length-1][0]);
			//console.log("  ...   data is " + data.prettyString());
			//console.log("  ...   current_remoteEvent[src].d is " + current_remoteEvent[src].d.prettyString());
			current_remoteEvent[src].d = current_remoteEvent[src].d.concat(data);
			if (data.length === 0) console.log("Got contour event with 0 length data!");
			current_remoteEvent[src].e=data[data.length-1][0];
			//console.log(" ... after concatenation, oteEvent[src].d is " + current_remoteEvent[src].d.prettyString());

			//---displayElements.push({type: 'mouseGesture', b: data[0][0], e: data[data.length-1][0], d: data, s: src});
		});
				//---------------------------------------------------------------------------
		// data is [timestamp (relative to "now"), x,y] of mouseContourGesture, and src is the id of the clicking client
		comm.registerCallback('beginMouseContourGesture', function(data, src) {
			console.log("got begin mouse contour gesture from the net");
	

			current_remoteEvent[src]=contourEvent();
			current_remoteEvent[src].b=data[0][0];
			current_remoteEvent[src].e=data[data.length-1][0];
			current_remoteEvent[src].d=data;
			current_remoteEvent[src].s=src;
			current_remoteEvent[src].soundbank=soundbank;


			//console.log("beginMouseContourGesture from the from source " + src + " ....  b:" + data[0][0] + ", e: " + current_remoteEvent[src].e );
			displayElements.push(current_remoteEvent[src]);
			//displayElements.push({type: 'mouseContourGesture', b: data[0][0], e: data[data.length-1][0], d: data, s: src});
		});

		//---------------------------------------------------------------------------
		comm.registerCallback('beginMouseEventGesture', function(data, src) {
			//current_remoteEvent[src]={type: 'mouseEventGesture', b: data[0][0], e: data[data.length-1][0], d: data, s: src};


			current_remoteEvent[src]=sprayEvent();
			current_remoteEvent[src].b=data[0][0];
			current_remoteEvent[src].e=data[data.length-1][0];
			current_remoteEvent[src].d=data;
			current_remoteEvent[src].s=src;

			current_remoteEvent[src].soundbank=soundbank;



			//console.log("beginMouseContourGesture from the from source " + src + " ....  b:" + data[0][0] + ", e: " + current_remoteEvent[src].e );
			displayElements.push(current_remoteEvent[src]);
			//displayElements.push({type: 'mouseContourGesture', b: data[0][0], e: data[data.length-1][0], d: data, s: src});
		});

				//---------------------------------------------------------------------------
		// data is [timestamp (relative to "now"), x,y] of mouseContourGesture, and src is the id of the clicking client
		comm.registerCallback('endMouseGesture', function(data, src) {
			//console.log("endMouseGesture from the from source " + src + " ....");
			current_remoteEvent[src]=undefined; // no more data coming
			//displayElements.push({type: 'mouseContourGesture', b: data[0][0], e: data[data.length-1][0], d: data, s: src});
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
		// src is meaningless since it is this client
		comm.registerCallback('roommembers', function(data, src) {
			if (data.length > 1) 
					console.log("there are other members in this room!");
			for(var i=0; i<data.length;i++){
				if (data[i] != myID){
					colorIDMap[data[i]]=utils.getRandomColor1(100,255,0,120,100,255);
				}
			}
		});




		//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
		// Client activity
		//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
		var theCanvas = document.getElementById("score");
		var context = theCanvas.getContext("2d");
		var mouseX;
		var mouseY;
		context.font="9px Arial";

		var scoreWindowTimeLength=20000; //ms
		var pixelShiftPerMs=theCanvas.width/(scoreWindowTimeLength);
		var pxPerSec=pixelShiftPerMs*1000;
		var nowLinePx=theCanvas.width/3;
		var pastLinePx=-20; // after which we delete the display elements

		var sprocketHeight=2;
		var sprocketWidth=1;
		var sprocketInterval=1000; //ms

		var numTracks = 4;
		var trackHeight=theCanvas.height / numTracks;
		var trackY =[]; // array of y-values (pixels) that devide each track on the score
		for (var i=0;i<numTracks;i++){
			trackY[i]=i*trackHeight;
		}



		var time2PxOLD=function(time, elapsedTime){ // time measured since timeOrigin
			return nowLinePx+(time-elapsedTime)*pixelShiftPerMs;
		}
		var time2Px=function(time){ // time measured since timeOrigin
			return nowLinePx+(time-t_sinceOrigin)*pixelShiftPerMs;
		}
		var px2Time=function(px){  // relative to the now line
			return (px-nowLinePx)/pixelShiftPerMs;
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

			context.clearRect(0, 0, theCanvas.width, theCanvas.height);

			// Add to currently-in-progress mouse gesture if any drawing is going on ------------------
			if (current_mgesture) {
				var m = utils.getCanvasMousePosition(theCanvas, last_mousemove_event);
				var tx=elapsedtime + px2Time(m.x);

				if (current_mgesture && current_mgesture.type === 'mouseContourGesture'){
					// drawn contours must only go up in time
					if (tx > current_mgesture.d[current_mgesture.d.length-1][0]){
						current_mgesture.d.push([tx, m.y, k_minLineThickness + k_maxLineThickness*leftSlider.value]);
						current_mgesture_2send.d.push([tx, m.y, k_minLineThickness + k_maxLineThickness*leftSlider.value]);
					}
				} 
				if (current_mgesture &&  current_mgesture.type === 'mouseEventGesture'){
					if (elapsedtime > (m_lastSprayEvent+k_sprayPeriod)){
						current_mgesture.d.push([tx, m.y, k_minLineThickness + k_maxLineThickness*leftSlider.value]);
						current_mgesture_2send.d.push([tx, m.y, k_minLineThickness + k_maxLineThickness*leftSlider.value]);						
						m_lastSprayEvent  = Date.now()-timeOrigin;
					}
					// drawn contours must only go up in time
				} 
				if (current_mgesture &&  current_mgesture.type === 'pitchEvent'){
					// pitch events do not extend in time...
				}
			}
			//---------------------------------------------------------------
 
 			// Draw scrolling sprockets--
 			context.fillStyle = "#999999";
 			var sTime = (elapsedtime+scoreWindowTimeLength*(2/3))- (elapsedtime+scoreWindowTimeLength*(2/3))%sprocketInterval;
			var sPx= time2Px(sTime);
			while(sPx > 0){ // loop over sprocket times within score window
				context.fillRect(sPx,0,sprocketWidth,sprocketHeight);
				context.fillRect(sPx,theCanvas.height-sprocketHeight,sprocketWidth,sprocketHeight);
				sPx-=pixelShiftPerMs*sprocketInterval;
			}

			//------------
			//draw track lines
			context.strokeStyle = "#555555";	
			context.lineWidth =1;			
			for (var i=1;i<numTracks;i++){
				context.beginPath();
				context.moveTo(0, trackY[i]);
				context.lineTo(theCanvas.width, trackY[i]);
				context.stroke();
			}


			//------------		
			// Draw the musical display elements 
			var t_end; 
			for(dispElmt=displayElements.length-1;dispElmt>=0;dispElmt--){ // run through in reverse order so we can splice the array to remove long past elements

				// If its moved out of our score window, delete it from the display list
				t_end=time2Px(displayElements[dispElmt].e);

				if (t_end < pastLinePx) {
					// remove event from display list
					displayElements.splice(dispElmt,1);
				} else{

					var dispe = displayElements[dispElmt];	

					//console.log("draw event of type " + dispe.type);				
					dispe.draw(context, time2Px, nowishP);


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
			context.lineTo(nowLinePx, theCanvas.height);
			context.stroke();

			lastDrawTime=elapsedtime;

		}


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
			var z = k_minLineThickness + k_maxLineThickness*leftSlider.value;
			// time at the "now" line + the distance into the future or past 
			var t = Date.now()-timeOrigin + px2Time(x);			

			if (radioSelection==='contour'){
				//current_mgesture={type: 'mouseContourGesture', d: [[t,y,z]], s: myID};
				current_mgesture=contourEvent();
				current_mgesture.d=[[t,y,z]];
				current_mgesture.s=myID;
				current_mgesture.color="#00FF00";

				current_mgesture.soundbank=soundbank;

				comm.sendJSONmsg("beginMouseContourGesture", [[t,y,z]]);
				current_mgesture_2send={type: 'mouseContourGesture', d: [], s: myID}; // do I need to add the source here??

				displayElements.push(current_mgesture);

			} 

			if (radioSelection==='spray'){
				//current_mgesture={type: 'mouseEventGesture', d: [[t,y,z]], s: myID};
				current_mgesture=sprayEvent();
				current_mgesture.d=[[t,y,z]];
				current_mgesture.s=myID;
				current_mgesture.color="#00FF00";

				current_mgesture.soundbank=soundbank;

				comm.sendJSONmsg("beginMouseEventGesture", [[t,y,z]]);
				current_mgesture_2send={type: 'mouseEventGesture', d: [], s: myID}; // do I need to add the source here??

				m_lastSprayEvent  = Date.now()-timeOrigin; // now, regardless of where on the time score the event is
				displayElements.push(current_mgesture);
			} 

			if (radioSelection==='pitch'){
				current_mgesture=pitchEvent(m_pTab.currentSelection());
				current_mgesture.d= [[t,y,z]];
				current_mgesture.s= myID;
				current_mgesture.color="#00FF00";
				displayElements.push(current_mgesture);
			}

			if (radioSelection==='rhythm'){
				current_mgesture=rhythmEvent(m_rTab.currentSelection());
				current_mgesture.d= [[t,y,z]];
				current_mgesture.s= myID;
				current_mgesture.color="#00FF00";
				displayElements.push(current_mgesture);
			}

			if (radioSelection==='chord'){
				current_mgesture=chordEvent(m_cTab.currentSelection());
				current_mgesture.d= [[t,y,z]];
				current_mgesture.s= myID;
				current_mgesture.color="#00FF00";
				displayElements.push(current_mgesture);
			}

		}

		function endContour(){
			//console.log("current event is " + current_mgesture + " and the data length is " + current_mgesture.d.length);
			current_mgesture.b=current_mgesture.d[0][0];
			current_mgesture.e=current_mgesture.d[current_mgesture.d.length-1][0];
			
			if (myRoom != '') {
				console.log("sending event");
				if (current_mgesture_2send){
					if (current_mgesture_2send.d.length > 0){
						comm.sendJSONmsg("mouseGesture", current_mgesture_2send.d);
					}
					comm.sendJSONmsg("endMouseGesture", []);
				}	
			}
			current_mgesture=undefined;
			current_mgesture_2send=undefined;
		}
	
		// Record the time of the mouse event on the scrolling score
		function onMouseDown(e){
			event.preventDefault();
			var m = utils.getCanvasMousePosition(theCanvas, e);
			var x = m.x;
			var y = m.y;

			initiateContour(x, y);
			last_mousemove_event=e;
		}

		function onMouseUp(e){
			current_mgesture && endContour();
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

			// create a display clock tick every 1000 ms
			while ((t_sinceOrigin-m_lastDisplayTick)>1000){  // can tick more than once if computer went to sleep for a while...
				m_tickCount++;
				k_timeDisplayElm.innerHTML=Math.floor(m_lastDisplayTick/1000);
				m_lastDisplayTick += 1000;
			}

			//-----------  if an event is in the middle of being drawn, send it every sendCurrentEventInterval
			// send current event data periodically (rather than waiting until it is complete)
			//console.log("time since origin= " + t_sinceOrigin + ", (t_sinceOrigin-lastSendTimeforCurrentEvent) = "+ (t_sinceOrigin-lastSendTimeforCurrentEvent));
			if ((current_mgesture_2send!=undefined) && ((t_sinceOrigin-lastSendTimeforCurrentEvent) > sendCurrentEventInterval)){
				//console.log("tick " + t_sinceOrigin);
				if (myRoom != '') {
					//console.log("sending event");
					if (current_mgesture_2send.d.length > 0)
						comm.sendJSONmsg("mouseGesture", current_mgesture_2send.d);
				}
				current_mgesture_2send.d=[];
 				lastSendTimeforCurrentEvent=t_sinceOrigin;
			}
			
			//--------------------------------------------------------

			myrequestAnimationFrame(timerLoop);
		};

		timerLoop();  // fire it up

		//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
		// callback from html
		//var roomselect = app.querySelector('#roomList');
		var roomselect = document.getElementById('roomList');
		//console.log("roomselect = " + roomselect);

		var favBrowser = function(){
			var mylist=document.getElementById("myList");
			document.getElementById("current_room").value=mylist.options[mylist.selectedIndex].text;
		}

		roomselect.addEventListener('change', function(e) {

			if (myRoom != '') comm.sendJSONmsg("unsubscribe", [myRoom]);

        	myRoom  = e.currentTarget.value;
        	//document.getElementById("current_room").value=mylist.options[mylist.selectedIndex].text;
        	document.getElementById("current_room").value=myRoom;

			if (myRoom != '') {
        		// just choose a default room (rather than getting a list from the server and choosing)
				comm.sendJSONmsg("subscribe", [myRoom]);
				// Tell everybody in the room to restart their timers.
				comm.sendJSONmsg("startTime", []);
			} 
   		 })

		// INITIALIZATIONS --------------------
		radioContour.checked=true; // initialize
		setTab("contourTab");




	}
);