define(
	["soundbank", "config", "widgets/key2note", "scoreEvents/genericScoreEvent"],
	function (soundbank, config, key2note, genericScoreEvent) {
      var tempy;
      return function (arg){

        
        var monophonic = true;  // need more code for polyphonic..... associating noteoff numbers with note on
        var lastOn = 0;  // 0 if no notes on, most recent nuoteNum otherwise

/*
        var playlist= {
          lastOn : 0;
          notesOn : {}, //associative list of {noteNum : snd}, where snd is only interesting if we are in polyphonic mode
          add : function(nn, snd){
            this.notesOn[nn.toString()]=snd;
          },
          remove : function(nn){
            delete this.notesOn[nn.toString()]
          },
          onP : function(nn){
            if (this.notesOn.hasOwnProperty(nn.toString())){
              return true;
            } else {
              return false;
            }
          }
        }; 
*/

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

                  gesturePath.push({x : dispPx, y: dispPy});

                  // first, if there is already a note on, visually end it (but don't send a noteoff to the synth)
                  if (lastOn != 0){ 
                    ctx.beginPath();
                    ctx.rect(tempNoteOnX,tempNoteOnY, dispPx-tempNoteOnX, 10);
                    ctx.closePath();
                    ctx.fill();
                  }
                  // now save the current note on data
                  tempNoteOnY=dispPy;
                  tempNoteOnX=dispPx;
                  lastOn = eobj.noteNum;

                } if (eobj.event === "noteOff"){
                  // if there is, in fact, a note current on, then draw the box
                  if (lastOn === eobj.noteNum){//(tempNoteOnX != -1){ 
                    ctx.beginPath();
                    ctx.rect(tempNoteOnX,tempNoteOnY, dispPx-tempNoteOnX, 10);
                    ctx.closePath();
                    ctx.fill();


                    if (nowishP(this.d[n][0])){
                       this.snd && this.snd.qrelease();
                       this.snd && this.soundbank.releaseSnd(this.snd);       
                    }

                    lastOn=0;
                  }
                }

              } else {
              	dispPy = this.d[n][1]
              }
               // Display the element
               if (n===0){
                ctx.fillText(this.s, dispPx, dispPy);
                ctx.beginPath();
                ctx.arc(dispPx,dispPy,1,0,2*Math.PI);
                ctx.closePath();
                ctx.fill();

                gesturePath.push({x : dispPx, y: dispPy});
              }

              
           }
           // if you've gone through the list, and there is a note on (with no corresponding note off) draw it "so far"
           if (lastOn != 0){
              ctx.beginPath();
              ctx.rect(tempNoteOnX,tempNoteOnY, this.phraseLock.pixelX-tempNoteOnX, 10);
              ctx.closePath();
              ctx.fill();

              lastOn=0;
           }

           // always push 
           gesturePath.push({x : Math.min(this.phraseLock.pixelX, dispPx=time2Px(this.e)), y: tempNoteOnY});


           // now connect the dots
           if (gesturePath.length > 0){
              ctx.lineWidth="1";
              ctx.strokeStyle=this.color; // Green path
              ctx.beginPath();
              ctx.moveTo(gesturePath[0].x,gesturePath[0].y);
              for(var i=1;i<gesturePath.length;i++){
                ctx.lineTo(gesturePath[i].x,gesturePath[0].y);
              }
              ctx.stroke();
              ctx.closePath();
              gesturePath=[];
         }

       }

       m_scoreEvent.addEvent=function(t,y,z,eobj){
        var ne = [t,y,z];
        var notenum;
        if (eobj){
          notenum = key2note.map(eobj.key);
          if (! notenum) return; // without adding a new time-stamped data point to the gesture (unmpapped key)
          
          if (eobj.event==="keyDown"){
            ne.push({"event" : "noteOn", "noteNum" : notenum})
          } else if (eobj.event==="keyUp"){
            ne.push({"event" : "noteOff", "noteNum" : notenum})
          }
        }
        m_scoreEvent.d.push(ne);
        //this.updateMaxTime();
        m_scoreEvent.sendData.d.push(ne);
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
