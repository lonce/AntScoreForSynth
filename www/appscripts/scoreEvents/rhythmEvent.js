define(
	[],
	function () {

      // For rhythm, the argument to this factory function is an image
      return function (i_arg){
 
         var pitchVal = i_arg;
         var pitchEvent={
            type: "rhythmEvent",
            d: null,
            s: null,

            color: "FFFFFF",
            //legalValues: k_pitches,
            pitchVal: i_arg,
 
            // args: 
            //  ctx - 2D canvas drawing context
            //  time2Px = function for translating the time samples on these objects to pixel for drawing
            draw: function(ctx, time2Px){
               var dispPx=time2Px(this.d[0][0]);
               // Display the element
               ctx.fillStyle = this.color;

               //ctx.fillText(this.s + this.pitchVal, dispPx, this.d[0][1]);
               //ctx.drawImage(i_arg, Math.round(dispPx), Math.round(this.d[0][1]));//, 41, 20);
               ctx.drawImage(i_arg, dispPx, this.d[0][1], 74, 32);

               ctx.beginPath();
               ctx.arc(dispPx,this.d[0][1],1,0,2*Math.PI);
               ctx.closePath();
               ctx.fill();
            }
         };
         
   		return pitchEvent;
      }
});