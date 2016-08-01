define(
	["soundbank", "config", "widgets/key2note", "scoreEvents/genericScoreEvent", "utils"],
	function (soundbank, config, key2note, genericScoreEvent, utils) {
      var tempy;

      var svgscore = document.getElementById("svgscore");
      var score = document.getElementById("score");

      //console.log("loading phraseEvent with " svgscore )

      quickDelegate = function(event, target) {
            var eventCopy = document.createEvent("MouseEvents");
            eventCopy.initMouseEvent(event.type, event.bubbles, event.cancelable, event.view, event.detail,
                event.pageX || event.layerX, event.pageY || event.layerY, event.clientX, event.clientY, event.ctrlKey, event.altKey,
                event.shiftKey, event.metaKey, event.button, event.relatedTarget);
            target.dispatchEvent(eventCopy);
            // ... and in webkit I could just dispath the same event without copying it. eh.
        };

      if (svgscore){
        svgscore.addEventListener('click', function(event){
          quickDelegate(event, score);
        });
        
        svgscore.addEventListener('mousedown', function(event){
          quickDelegate(event, score);
        });
        svgscore.addEventListener('mouseup', function(event){
          quickDelegate(event, score);
        });
        
        svgscore.addEventListener('mouseover', function(event){
          quickDelegate(event, score);
        });
        svgscore.addEventListener('mouseout', function(event){
          quickDelegate(event, score);
        });
        svgscore.addEventListener('mousemove', function(event){
          quickDelegate(event, score);
        });
        
        
      }


      return function (arg){

        
        var monophonic = true;  // need more code for polyphonic..... associating noteoff numbers with note on
        var lastOn = 0;  // 0 if no notes on, most recent nuoteNum otherwise

        var pt = {}; // will hold {x: , y:  }
        var pathString = "";


        var touchMarginOfError=3;

        var soundName;// name of sound this event will play
        var param1, param2; // the string names of the parameters of the sound associated with this event

        var m_scoreEvent=genericScoreEvent("phraseGesture");

        m_scoreEvent.phraseLock = arg; 

        m_scoreEvent.draw = function(ctx, time2Px, nowishP){
         var dispPx;
         var dispPy;

         var cheight = ctx.canvas.height;
         var minNote = key2note.minNote();
         var maxNote = key2note.maxNote(); 

         var eobj; // event object, the optional 4th element in the event array: [t,x,y, obj]

         var tempNoteOnY; 
         var tempNoteOnX;
         var tempNoteSvgRect;
         //console.log("drawing phrase");

         gesturePath=[];

         if (this.selectedP){
          this.drawSelected(ctx,time2Px);
        }

        ctx.fillStyle = this.color;

        for(var n=0;n<this.d.length;n++){    
          dispPx=time2Px(this.d[n][0]);  

          if (this.d[n].length >=4){
            eobj=this.d[n][3];
            dispPy=shiftscale(eobj.noteNum, minNote, maxNote, cheight, 0);
            if (eobj.event === "noteOn"){

              if (nowishP(this.d[n][0])){
                if (monophonic){
                  if (! this.snd){
                    this.snd=this.soundbank.getSnd(this.soundName);
                      //console.log("ok, got sound " + this.soundName)
                    }
                  }
                  this.snd && this.snd.setParamNorm(this.param1, 1-dispPy/ctx.canvas.height);
                  this.snd && this.snd.setParamNorm(this.param2, 1-this.d[n][2]);
                  this.snd && this.snd.play();
                }

                // push note on
                //console.log("push note on " + dispPx + " , " + dispPy);
                //gesturePath.push({x : dispPx, y: dispPy});

                // first, if there is already a note on, visually end it (but don't send a noteoff to the synth)
                if (lastOn != 0){ 

                  pt = utils.canvas2Px(score, {x: tempNoteOnX, y: tempNoteOnY});
                  tempNoteSvgRect.setAttribute("x", pt.x);
                  tempNoteSvgRect.setAttribute("y", pt.y);
                  pt = utils.canvas2Px(score, {x: dispPx-tempNoteOnX, y: 0});
                  tempNoteSvgRect.setAttribute("width", pt.x);

                  /*
                  ctx.beginPath();
                  ctx.rect(tempNoteOnX,tempNoteOnY, dispPx-tempNoteOnX, 10);
                  ctx.closePath();
                  ctx.fill();
                  */
                }
                // now save the current note on data
                tempNoteOnY=dispPy;
                tempNoteOnX=dispPx;
                tempNoteSvgRect = eobj.noteSvgRect;
                lastOn = eobj.noteNum;

              } 

              if (eobj.event === "noteOff"){
                // if there is, in fact, a note current on, then draw the box
                if (lastOn === eobj.noteNum){//(tempNoteOnX != -1){ 

                  pt = utils.canvas2Px(score, {x: tempNoteOnX, y: tempNoteOnY});
                  tempNoteSvgRect.setAttribute("x", pt.x);
                  tempNoteSvgRect.setAttribute("y", pt.y);
                  pt = utils.canvas2Px(score, {x: dispPx-tempNoteOnX, y: 0});
                  tempNoteSvgRect.setAttribute("width", pt.x);

                  /*
                  ctx.beginPath();
                  ctx.rect(tempNoteOnX,tempNoteOnY, dispPx-tempNoteOnX, 10);
                  ctx.closePath();
                  ctx.fill();
                  */

                  if (nowishP(this.d[n][0])){
                   this.snd && this.snd.qrelease();
                   this.snd && this.soundbank.releaseSnd(this.snd);       
                 }

                 lastOn=0;
               }
             }

           } else {  // [t,y,z, obj], there is no object on this array element 
             dispPy = this.d[n][1]
           }  
             // Display the dot signalling the beginning of the gesture 
           if (n===0){
              // Set any attributes as desired
              pt = utils.canvas2Px(score, {x: dispPx, y: dispPy});
              this.svgElmt.setAttribute("cx", pt.x);
              this.svgElmt.setAttribute("cy", pt.y);
              // Add to a parent node; document.documentElement should be the root svg element.

              //console.log("push NO NOTE " + dispPx + " , " + dispPy);
              gesturePath.push({x : dispPx, y: dispPy});
            }

            
          } // done with the list 

         // if you've gone through the list, and there is a note on (with no corresponding note off) draw it "so far"
         if (lastOn != 0){

          pt = utils.canvas2Px(score, {x: tempNoteOnX, y: tempNoteOnY});
          tempNoteSvgRect.setAttribute("x", pt.x);
          tempNoteSvgRect.setAttribute("y", pt.y);
          pt = utils.canvas2Px(score, {x: this.phraseLock.pixelX-tempNoteOnX, y: 0});
          tempNoteSvgRect.setAttribute("width", pt.x);

          /* 
          ctx.beginPath();
          ctx.rect(tempNoteOnX,tempNoteOnY, this.phraseLock.pixelX-tempNoteOnX, 10);
          ctx.closePath();
          ctx.fill();
          */

          lastOn=0;
        }

         // now connect the dots
        if (gesturePath.length > 0){
          // always push "end" point on to gesture path for plotting
          gesturePath.push({x : Math.min(this.phraseLock.pixelX, dispPx=time2Px(this.e)), y: gesturePath[0].y});

          pt = utils.canvas2Px(score, {x: gesturePath[0].x, y: gesturePath[0].y});
          pathString = "M " + pt.x + "," + pt.y ;
          for(var i=1;i<gesturePath.length;i++){
            pt = utils.canvas2Px(score, {x: gesturePath[i].x, y: gesturePath[0].y});
            pathString += " L " + pt.x + "," + pt.y ;
          }

          this.svgConnectElmt.setAttribute("d", pathString);

              /*
            ctx.lineWidth="1";
            ctx.strokeStyle=this.color; // Green path
            ctx.beginPath();
            ctx.moveTo(gesturePath[0].x,gesturePath[0].y);
            for(var i=1;i<gesturePath.length;i++){
              ctx.lineTo(gesturePath[i].x,gesturePath[0].y);
            }
            ctx.stroke();
            ctx.closePath();
            */
            gesturePath=[];
          }

        }

       //m_scoreEvent.addEvent=function(t,y,z,eobj){
      m_scoreEvent.addEvent=function(evArray, broadcastP){
        
        var augEvent = [evArray[0], evArray[1], evArray[2]]; // make a new array
        var eobj = evArray.length >=4 ? evArray[3] : undefined;
        var notenum;
        var noteSvgRect; 

        // add SVG elements to this phrase
        if (! this.svgElmt){
          this.svgElmt = document.createElementNS("http://www.w3.org/2000/svg", "circle");
          this.svgElmt.setAttribute("r",  2);
          this.svgElmt.setAttribute("fill", this.color);
          this.svgElmt.setAttribute("stroke", "none");
          svgscore.appendChild(this.svgElmt);

          this.svgConnectElmt = document.createElementNS("http://www.w3.org/2000/svg", "path");
          svgscore.appendChild(this.svgConnectElmt);
          this.svgConnectElmt.setAttributeNS(null, "stroke", m_scoreEvent.color); 
          this.svgConnectElmt.setAttributeNS(null, "stroke-width", 5);  
          this.svgConnectElmt.setAttributeNS(null, "opacity", .5);  
        }


        if (eobj){
          notenum = key2note.map(eobj.key);
          if (! notenum) return; // without adding a new time-stamped data point to the gesture (unmpapped key)
          
          if (eobj.event==="keyDown"){
            noteSvgRect =  document.createElementNS("http://www.w3.org/2000/svg", "rect");
            noteSvgRect.setAttribute("fill", m_scoreEvent.color);
            noteSvgRect.setAttribute("stroke", "none");
            noteSvgRect.setAttribute("height", 10);
            svgscore.appendChild(noteSvgRect);

            augEvent.push({"event" : "noteOn", "noteNum" : notenum, "noteSvgRect" : noteSvgRect})

          } else if (eobj.event==="keyUp"){
            augEvent.push({"event" : "noteOff", "noteNum" : notenum})
          }
        }
        m_scoreEvent.d.push(augEvent);
        //this.updateMaxTime();
        if (broadcastP){
          m_scoreEvent.sendData.d.push(evArray); // send the original eventArray
        }

       }

       var shiftscale=function(g,m,n,x,y){
          return x + ((g-m)/(n-m))*(y-x);
       }

       m_scoreEvent.getKeyFields= function(arg){
          return {
             "soundName": m_scoreEvent.soundName,
             "param1": m_scoreEvent.param1,
             "param2": m_scoreEvent.param2,
             "phraseLock" : m_scoreEvent.phraseLock
          }
       }


        m_scoreEvent.updateMaxTime(Number.MAX_SAFE_INTEGER); // because we allow spaces between events in a phraseGesture
		    return m_scoreEvent;

     }
 });
