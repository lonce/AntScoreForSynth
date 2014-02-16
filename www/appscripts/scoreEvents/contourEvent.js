define(
	["soundbank", "config"],
	function (soundbank, config) {
      var tempy;
      return function (){

         var kScaleMI=.15;
         var touchMarginOfError=3;
 
         var contourEvent={
            type: "mouseContourGesture",
            d: null,
            s: null,

            color: "FFFFFF",

            soundbank: null,
            snd: null,

            // args: 
            //  ctx - 2D canvax drawing contex
            //  time2Px = function for translating the time sampls on these objects to pixel for drawing
            draw: function(ctx, time2Px, nowishP, now){

               var dispPx=time2Px(this.d[0][0]);
                     // If crossing the "now" line, make a little explosion

               if (nowishP(this.d[0][0])){
                  //console.log("contour start, get a new snd")
                  this.snd=this.soundbank.getSnd();
                  this.snd && this.snd.play();
               } 

               // Display the element
               ctx.fillStyle = this.color;
               ctx.fillText(this.s, dispPx, this.d[0][1]);

               ctx.beginPath();
               ctx.arc(dispPx,this.d[0][1],1,0,2*Math.PI);
               ctx.closePath();
               ctx.fill();

               // DRAW ONE BIG POLYGON
               // One line all the way to the end
               ctx.beginPath();
               ctx.strokeStyle = this.color;
               ctx.moveTo(dispPx,this.d[0][1]);
               ctx.lineWidth = 1;
               //console.log("drawing - datalenght = " + this.d.length+ ", color = " + ctx.strokeStyle + ", px = "+ dispPx + ", " + this.d[0][1]);
               for(var n=0;n<this.d.length;n++){

                  // Send parameter updates on every frame, interpolating between the segment endpoints we are in
                  if (n<this.d.length-1){
                     if (this.snd && ((this.d[n][0] < now) && (this.d[n+1][0] > now))){

                        // y0 + (x1-x0)(y-y0)/(x1-x0) for the height parameter
                        tempy=this.d[n][1] + (now-this.d[n][0])*((this.d[n+1][1] -this.d[n][1])) / (this.d[n+1][0] -this.d[n][0]);
                        this.snd.setParamNorm("Carrier Frequency", 1-tempy/ctx.canvas.height);

                        // y0 + (x1-x0)(y-y0)/(x1-x0) for the slider val parameter 
                        tempy=this.d[n][2] + (now-this.d[n][0])*((this.d[n+1][2] -this.d[n][2])) / (this.d[n+1][0] -this.d[n][0]);
                        this.snd.setParamNorm("Modulation Index", kScaleMI*(1-tempy));


                     }
                  }


                  ctx.lineTo(time2Px(this.d[n][0]), this.d[n][1]);
               }
               // "turn around" the end
               if (nowishP(this.d[n-1][0])){
                  //console.log("contour end across now, and this.snd is " + this.snd);
                  if ((this.d[n-1][0] - this.d[0][0]) < config.minSndDuration) {
                     //console.log("enforcing minimum contour duration law");
                     this.snd && this.snd.qrelease(config.minSndDuration);
                  } else {
                     this.snd && this.snd.release();
                  }
                  this.snd && this.soundbank.releaseSnd(this.snd); 
               }
               ctx.lineTo(time2Px(this.d[n-1][0]), this.d[n-1][1]-this.d[n-1][2]);
               // go backwards at the line width
               for(var n=this.d.length-1;n>=0; n--){
                  ctx.lineTo(time2Px(this.d[n][0]), this.d[n][1]-this.d[n][2]);
               }
               // close and fill the whole shape as one big plygon
               ctx.closePath();
               ctx.stroke();  
               ctx.globalAlpha = 0.25;
               ctx.fill(); 
               ctx.globalAlpha = 1;      
            },
 

            touchedP: function(t,y){
               //console.log("touchedP: t= " + t + ", and y = " + y);
               //console.log("touchedP: head.t = " + this.d[0][0] + ", and head.y = " + this.d[0][1] )
               var tempy;
               for(var n=0;n<this.d.length;n++){
                  if (n<this.d.length-1){
                        if ((this.d[n][0] < t) && (this.d[n+1][0] > t)){
                           tempy=this.d[n][1] + (t-this.d[n][0])*((this.d[n+1][1] -this.d[n][1])) / (this.d[n+1][0] -this.d[n][0]);
                           break;
                        }
                     }
               }
               if ((tempy != undefined) && ((tempy - y) > - touchMarginOfError) && ((tempy - y) < (this.d[n][2] + touchMarginOfError))){
                  console.log("got a touch!");
                  return true;
               } else{
                  return false;
               }
            } // touchedP
            
          } // end contour event
         return contourEvent;

      };

});