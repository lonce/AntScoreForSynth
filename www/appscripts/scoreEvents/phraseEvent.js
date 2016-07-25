define(
	["soundbank", "config", "widgets/key2note", "scoreEvents/genericScoreEvent"],
	function (soundbank, config, key2note, genericScoreEvent) {
      var tempy;
      return function (){

        var touchMarginOfError=3;

        var soundName;// name of sound this event will play
        var param1, param2; // the string names of the parameters of the sound associated with this event

        var m_scoreEvent=genericScoreEvent("phraseGesture");

        m_scoreEvent.draw = function(ctx, time2Px, nowishP){
           var dispPx;
           var dispPy;

           //console.log("drawing phrase");

           if (this.selectedP){
              this.drawSelected(ctx,time2Px);
           }

           for(var n=0;n<this.d.length;n++){    
              dispPx=time2Px(this.d[n][0]);  


              if (this.d[n].length >=4){
              	dispPy = 86;
              } else {
              	dispPy = this.d[n][1]
              }
               // Display the element
              ctx.fillStyle = this.color;
              ctx.fillText(this.s, dispPx, dispPy);

              ctx.beginPath();
              ctx.arc(dispPx,dispPy,1,0,2*Math.PI);
              ctx.closePath();
              ctx.fill();


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
       }


		return m_scoreEvent;

     }
 });
