define(
	["soundbank", "config", "widgets/key2note", "scoreEvents/genericScoreEvent", "utils"],
	function (soundbank, config, key2note, genericScoreEvent, utils) {

      


      return function (arg){

        var svgscore = document.getElementById("svgscore"); // by default, but this can be set with setScore
        svgscore.AAAAAAAAAAAAA = "AAAAAAAAAAAAAA"
        var score = document.getElementById("score");

        //console.log("+++++++++initially, my phrasselock is " + arg);

        var monophonic = true;  // need more code for polyphonic..... associating noteoff numbers with note on
        var lastOn = 0;  // 0 if no notes on, most recent nuoteNum otherwise
        var dangling = 0;

        var pt = {}; // will hold {x: , y:  }
        var temp = {}; // will hold {x: , y:  }
        var pathString = "";


        var touchMarginOfError=3;

        var soundName;// name of sound this event will play
        var param1, param2; // the string names of the parameters of the sound associated with this event

        var m_scoreEvent=genericScoreEvent("phraseGesture");  // factory output
        //m_scoreEvent.phraseLock = arg; 
        m_scoreEvent.phraseLock = arg; 

        //---------------------------------------------------------------------
        // called periodically by scrolling score -----------------------------
        //---------------------------------------------------------------------
        m_scoreEvent.draw = function(ds){
          var ctx=ds.canvas.getContext("2d");

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

          ctx.fillStyle = this.color;

          for(var n=0;n<this.d.length;n++){    
            dispPx=ds.time2Px(this.d[n][0]);  

            if (this.d[n].length >=4){
              eobj=this.d[n][3];
              

                dispPy=shiftscale(eobj.noteNum, minNote, maxNote, cheight, 0);
                if (eobj.event === "noteOn"){
                  if (! eobj.noteSvgRect.removed){

                    if (ds.latishP(this.d[n][0]) && (! eobj.played)){
                      if (monophonic){
                        if (! this.snd){
                          this.snd=this.soundbank.getSnd(this.soundName);
                            //console.log("ok, got sound " + this.soundName)
                        }
                      }
                      this.snd && this.snd.setParamNorm(this.param1, 1-dispPy/ctx.canvas.height);
                      this.snd && this.snd.setParamNorm(this.param2, 1-this.d[n][2]);
                      this.snd && this.snd.setParam("play", 1);
                      eobj.played=true;
                      //console.log("NOTEON : " + eobj.noteNum); 
                      //console.log("play  dnum = " + n + ", note " + eobj.noteNum);
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

                        if (ds.nowishP(this.d[n][0])){
                            //console.log("SWITHCING NOTES from " + lastOn + " to " + eobj.noteNum)
                        }
                    }
                    // now save the current note on data
                    tempNoteOnY=dispPy;
                    tempNoteOnX=dispPx;
                    tempNoteSvgRect = eobj.noteSvgRect;
                    lastOn = eobj.noteNum;

                  } // if svg rect not removed

                } // if eobj.event === noteOn

                if (eobj.event === "noteOff"){

                  if (tempNoteSvgRect && (! tempNoteSvgRect.removed)){

                    pt = utils.canvas2Px(score, {x: tempNoteOnX, y: tempNoteOnY});
                    temp = utils.canvas2Px(score, {x: dispPx-tempNoteOnX, y: 0});

                    if ((pt.x + temp.x) < 0){ // prevents laggy performance when there are lots of events on a long phrase gesture
                        svgscore.removeChild(tempNoteSvgRect);
                        tempNoteSvgRect.removed=true;
                        console.log("removed a phrase elemt rect");
                    }

                    // if there is, in fact, a note currently on, then draw the box
                    if (lastOn === eobj.noteNum){//(tempNoteOnX != -1){ 

                      tempNoteSvgRect.setAttribute("x", pt.x);
                      tempNoteSvgRect.setAttribute("y", pt.y);
                      tempNoteSvgRect.setAttribute("width", temp.x);


                      if (ds.latishP(this.d[n][0]) && (! eobj.played)){
                       this.snd && this.snd.setParam("play", 0);
                       console.log("release dnum = " + n + ", note " + eobj.noteNum);
                       this.snd && this.soundbank.releaseSnd(this.snd); 
                       this.snd=null;
                       eobj.played=true;    
                       //console.log("NOTEOFF ( " + eobj.noteNum + ") ")  ;
                     }

                     lastOn=0;
                   } else {
                      if (ds.latishP(this.d[n][0]) && (! eobj.played)){
                        //console.log("NOWISH NOTEOFF ( " + eobj.noteNum + ") IGNORED")  ;
                      }
                    }
                  } // removed
               } // noeoff


             } else {  // [t,y,z, obj], there is no object on this array element 
               dispPy = this.d[n][1]

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
            }// if not removed already
            
          } // done with the list 

           // if you've gone through the list, and there is a note on (with no corresponding note off) draw it "so far"
           if (lastOn != 0){

            if (tempNoteSvgRect && (! tempNoteSvgRect.removed)){
              pt = utils.canvas2Px(score, {x: tempNoteOnX, y: tempNoteOnY});
              tempNoteSvgRect.setAttribute("x", pt.x);
              tempNoteSvgRect.setAttribute("y", pt.y);
              temp = utils.canvas2Px(score, {x: m_scoreEvent.phraseLock-tempNoteOnX, y: 0});
              tempNoteSvgRect.setAttribute("width", temp.x);


              dangling = lastOn;
              lastOn=0; 
            }

          } else {
            dangling=0;
          }

           // now connect the dots
          if (gesturePath.length > 0){
            // always push "end" point on to gesture path for plotting
            if (this.e){
              gesturePath.push({x : dispPx=ds.time2Px(this.e), y: gesturePath[0].y});
            } else {
              gesturePath.push({x : m_scoreEvent.phraseLock, y: gesturePath[0].y});
            }
            //gesturePath.push({x : Math.max(m_scoreEvent.phraseLock, dispPx=ds.time2Px(this.e)), y: gesturePath[0].y});

            pt = utils.canvas2Px(score, {x: gesturePath[0].x, y: gesturePath[0].y});
            pathString = "M " + pt.x + "," + pt.y ;
            for(var i=1;i<gesturePath.length;i++){
              pt = utils.canvas2Px(score, {x: gesturePath[i].x, y: gesturePath[0].y});
              pathString += " L " + pt.x + "," + pt.y ;
            }
            //console.log("draw path");
            this.svgConnectElmt.setAttribute("d", pathString);
              gesturePath=[];
          }
        }  // closes the draw function 

        // draw Static ------------------------------------------------------------------
        m_scoreEvent.drawStatic = function(t, ms2pix, cheight){

          ms2pix=svgscore.ms2pix;
          cheight = svgscore.getHeight();


          var dispPx;
          var dispPy;

          var minNote = key2note.minNote();
          var maxNote = key2note.maxNote(); 

          var eobj; // event object, the optional 4th element in the event array: [t,x,y, obj]

          var tempNoteOnY; 
          var tempNoteOnX;
          var tempNoteOnT;
          var tempNoteSvgRect;


          if ((! this.clientX) || (! this.clientY)){
            console.log("scoreEvent.drawStatic requires clientX and clientY properties to draw");
            return;
          }


          for(var n=0;n<this.d.length;n++){    
              dispPx = this.clientX + ms2pix(this.d[n][0]-this.d[0][0]);

            if (this.d[n].length >=4){
              eobj=this.d[n][3];
              dispPy=shiftscale(eobj.noteNum, minNote, maxNote, cheight, 0);
              if (eobj.event === "noteOn"){

                // first, if there is already a note on, visually end it (but don't send a noteoff to the synth)
                if (lastOn != 0){ 

                  tempNoteSvgRect.setAttribute("x", tempNoteOnX);
                  tempNoteSvgRect.setAttribute("y", tempNoteOnY);

                  tempNoteSvgRect.setAttribute("width", dispPx-tempNoteOnX);

                }
                // now save the current note on data
                tempNoteOnY=dispPy;
                tempNoteOnX=dispPx;
                tempNoteOnT = this.d[n][0];
                tempNoteSvgRect = eobj.noteSvgRect;

                lastOn = eobj.noteNum;

              } 

              if (eobj.event === "noteOff"){
                // if there is, in fact, a note current on, then draw the box
                if (lastOn === eobj.noteNum){//(tempNoteOnX != -1){ 

                  tempNoteSvgRect.setAttribute("x", tempNoteOnX);
                  tempNoteSvgRect.setAttribute("y", tempNoteOnY);

                  tempNoteSvgRect.setAttribute("width", dispPx-tempNoteOnX);

                 lastOn=0;
               }
             }

           } else {  // [t,y,z, obj], there is no object on this array element 
             dispPy = this.d[n][1]
           }  
               // Display the dot signalling the beginning of the gesture 
           if (n===0){
              svgscore.setAttribute("fill", this.color);  

              this.svgElmt.setAttribute("cx", dispPx);
              this.svgElmt.setAttribute("cy", dispPy);

            }
          } // done with the list 

         // if you've gone through the list, and there is a note on (with no corresponding note off) draw it "so far"
         if (lastOn != 0){
            tempNoteSvgRect.setAttribute("x", tempNoteOnX);
            tempNoteSvgRect.setAttribute("y", tempNoteOnY);

            console.log("dangler width in pixels is " + ms2pix(t-tempNoteOnT));
            tempNoteSvgRect.setAttribute("width", ms2pix(t-tempNoteOnT)); 

            dangling = lastOn;
            lastOn=0; 

          } else {
            dangling=0;
          }

          // Draw gesture indicator line
          pathString = "M " + this.clientX + "," + this.clientY;
          var len = ms2pix((t?t:this.e)-this.d[0][0]); // starting time

          if (! t){
            console.log("setting the length of the path to " + len);
          }

          pathString += " L " + (this.clientX+len) + "," + this.clientY;
          this.svgConnectElmt.setAttribute("d", pathString);


        }  // closes the drawStatic function 



        m_scoreEvent.endContour = function(t){
          var augEvent = [t, 0, 0, {"event" : "noteOff", "noteNum" : dangling}];
          if (dangling != 0){
            console.log("adding noteoff for laston");
            m_scoreEvent.d.push(augEvent);
          } else{
            console.log("ending contour with no dangling notes!!!!!!!!!!!!")
          }
          m_scoreEvent.updateMaxTime();
          console.log("endContour, setting m_scoreEvent.e to " + m_scoreEvent.e);

        }

        m_scoreEvent.setScore = function(s){
          svgscore = s;

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
          this.svgElmt.setAttribute("r",  4);
          this.svgElmt.setAttribute("fill", this.color);
          this.svgElmt.setAttribute("stroke", "none");

          this.svgElmt.addEventListener("mousedown", function(e){
            //e.stopPropagation();
            e.eventSelection=m_scoreEvent; // let the mouse event propogate, but inform the bubblees that this was a selection event.
            console.log("click on sbg rect");
            //m_scoreEvent.select(true);
          });


          svgscore.appendChild(this.svgElmt);

          this.svgConnectElmt = document.createElementNS("http://www.w3.org/2000/svg", "path");
          svgscore.appendChild(this.svgConnectElmt);
          this.svgConnectElmt.setAttributeNS(null, "stroke", m_scoreEvent.color); 
          this.svgConnectElmt.setAttributeNS(null, "stroke-width", 1);  
          this.svgConnectElmt.setAttributeNS(null, "opacity", .5);  
        }


        if (eobj){
          notenum = eobj.noteNum || key2note.map(eobj.key);
          if (! notenum) return; // without adding a new time-stamped data point to the gesture (unmpapped key)
          
          if ((eobj.event==="keyDown") || (eobj.event==="noteOn")){
            noteSvgRect =  document.createElementNS("http://www.w3.org/2000/svg", "rect");
            noteSvgRect.setAttribute("fill", m_scoreEvent.color);
            noteSvgRect.setAttribute("stroke", "none");
            noteSvgRect.setAttribute("height", 10);
            noteSvgRect.addEventListener("mousedown", function(e){
              //e.stopPropagation();
              e.eventSelection=m_scoreEvent; // let the mouse event propogate, but inform the bubblees that this was a selection event.
              console.log("click on sbg rect");
              //m_scoreEvent.select(true);
            });
            svgscore.appendChild(noteSvgRect);

            augEvent.push({"event" : "noteOn", "noteNum" : notenum, "noteSvgRect" : noteSvgRect})

          } else if ((eobj.event==="keyUp") || (eobj.event==="noteOff")){
            augEvent.push({"event" : "noteOff", "noteNum" : notenum})
          }
        }
        m_scoreEvent.d.push(augEvent);
        //this.updateMaxTime();
        if (broadcastP){
          m_scoreEvent.sendData.d.push(evArray); // send the original eventArray
        }

       }

       // override
       m_scoreEvent.select = function(arg){
        var eobj;
        this.selectedP=arg;   // set the flag
                         
        if (arg){   // change the stroke to white on all the elements

          this.svgElmt.setAttribute("stroke", "white");
          this.svgElmt.setAttribute("stroke-width", 1);

          //this.svgConnectElmt.setAttribute("stroke", "white"); 
          //this.svgConnectElmt.setAttribute("stroke-width", 1);  

          for(var n=0;n<this.d.length;n++){    
            if (this.d[n].length >=4){
              eobj=this.d[n][3];
              eobj.noteSvgRect && eobj.noteSvgRect.setAttribute("stroke", "white"); // only objects with noteon events have svgrects
              eobj.noteSvgRect && eobj.noteSvgRect.setAttribute("stroke-width", 1); 
            }
          }
        }  

        else{
          this.svgElmt.setAttribute("stroke", "none");
          //this.svgConnectElmt.setAttribute("stroke", "none");  

          for(var n=0;n<this.d.length;n++){    
            if (this.d[n].length >=4){
              eobj=this.d[n][3];
              eobj.noteSvgRect && eobj.noteSvgRect.setAttribute("stroke", "none"); // only objects with noteon events have svgrects
            }
          }
        }
               
       };

      m_scoreEvent.emptyP = function(){
          for(var n=0;n<this.d.length;n++){    
            if (this.d[n].length >=4){  // phrase gestures must have elements with objects containing noteon or noteoffs to be considered non-empty
              return false;
            }
          }
          return true;
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

       // Remove elements from canvas 
        m_scoreEvent.destroy = function(){
          var eobj;

          // remove all the svg elements for this phrase from the score canvas
          if (this.svgElmt) {
            svgscore.removeChild(this.svgElmt);
          }
          if (this.svgConnectElmt) {
            svgscore.removeChild(this.svgConnectElmt);
          }
          for(var n=0;n<this.d.length;n++){
              if (this.d[n].length >=4){
                eobj=this.d[n][3];
                if (eobj.noteSvgRect && (! eobj.noteSvgRect.removed)){
                  //console.log("removing nodeSvgRect");
                  svgscore.removeChild(eobj.noteSvgRect);
                } 
              }             // override to so whatever you need to do to get the element off the screen or whatever
          }
        }  // destroy



        m_scoreEvent.updateMaxTime(Number.MAX_SAFE_INTEGER); // because we allow spaces between events in a phraseGesture
		    return m_scoreEvent;

     }  // end of function returned by module load

 });
