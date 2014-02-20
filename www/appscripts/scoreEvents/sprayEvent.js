define(
	["soundbank", "config", "scoreEvents/genericScoreEvent"],
	function (soundbank, config, genericScoreEvent) {
      return function (){

         var m_scoreEvent=genericScoreEvent("mouseEventGesture");

         var kScaleMI=.15;

          m_scoreEvent.draw = function(ctx, time2Px, nowishP){

               var dispPx;

               if (this.selectedP){
                  this.drawSelected(ctx,time2Px);
               }

               for(var n=0;n<this.d.length;n++){    
                  dispPx=time2Px(this.d[n][0]);  

                  if (nowishP(this.d[n][0])){
                     this.snd=this.soundbank.getSnd();
                     this.snd && this.snd.setParamNorm("Carrier Frequency", 1-this.d[n][1]/ctx.canvas.height);
                     this.snd && this.snd.setParamNorm("Modulation Index", kScaleMI*(1-this.d[n][2]));
                     this.snd && this.snd.play();
                     //console.log("event playtime = " + this.d[n][0]);
                     this.snd && this.snd.qrelease(config.minSndDuration);
                     this.snd && this.soundbank.releaseSnd(this.snd);     
                     //explosion(dispPx, this.d[n][1], 5, "#FF0000", 3, "#FFFFFF")  
                  }

                  // Display the element
                  ctx.fillStyle = this.color;
                  ctx.fillText(this.s, dispPx, this.d[n][1]);

                  ctx.beginPath();
                  ctx.arc(dispPx,this.d[n][1],1,0,2*Math.PI);
                  ctx.closePath();
                  ctx.fill();
               }
         };

         m_scoreEvent.touchedP = function(t,y){
            for(var n=0;n<this.d.length;n++){    
            //console.log("spray touchedP:  |t|= " + Math.abs(t-this.d[n][0]) + ", and |y|= " + Math.abs(y-this.d[n][1]));
               if (( Math.abs(t-this.d[n][0]) < 300) && (Math.abs(y-this.d[n][1]) < config.touchMarginOfError)){
                  this.selectedP=true;
                  return true;
               }
            }
            this.selectedP=false;
            return false;
         };

         return m_scoreEvent;
      }
});