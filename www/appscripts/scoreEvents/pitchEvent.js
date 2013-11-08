define(
	[],
	function () {
      return function (i_str){
 
         var pitchVal = i_str;
         var pitchEvent={
            type: "pitchEvent",
            d: null,
            s: null,

            color: "FFFFFF",
            //legalValues: k_pitches,
            pitchVal: i_str,

            //setPitch: function(pval){pitchVal=pval;},
 
            // args: 
            //  ctx - 2D canvax drawing contex
            //  time2Px = function for translating the time sampls on these objects to pixel for drawing
            draw: function(ctx, time2Px){
               var dispPx=time2Px(this.d[0][0]);
               // Display the element
               ctx.fillStyle = this.color;
               ctx.fillText(this.s + this.pitchVal, dispPx, this.d[0][1]);

               ctx.beginPath();
               ctx.arc(dispPx,this.d[0][1],1,0,2*Math.PI);
               ctx.closePath();
               ctx.fill();
            }
         };
         
   		return pitchEvent;
      }
});