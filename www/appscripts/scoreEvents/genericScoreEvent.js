define(
   [],
   function () {
      return function (i_type){
 

         var genEvent={
            type: i_type || null,            // String identifying gesture type
            i: null,                         // some types use indexes to identify the display element to use (eg chords)
            d: null,                         // array data of [x,y] values for the gesture
            s: null,                         // a source ID (number)
            b: 999999999999999999999999999,  // begin time for this gesture
            e: -999999999999999999999999999, // end tim for this gesture
            color: "FFFFFF",
            head: "rectangle",                // "diamond", "circle", "rectangle"
            tail: true,                      // boolean for now     
            drawID: false, 
            font: "12px Arial",     
 

            updateMinTime: function(i_arg){
               if (i_arg){
                  genEvent.b=Math.min(i_arg, genEvent.b);
               } else{
                  for (var i=0;i<genEvent.d.length;i++)
                     genEvent.b=Math.min(genEvent.b, genEvent.d[i][0]);
               }
               return genEvent.b;
           },


            updateMaxTime: function(i_arg){
             if (i_arg){
                  genEvent.e=Math.max(i_arg, genEvent.e);
               } else{
                  for (var i=0;i<genEvent.d.length;i++)
                     genEvent.e=Math.max(genEvent.e, genEvent.d[i][0]);
               }
               return genEvent.e;
            }, 

            draw: function(ctx, time2Px){
               //var dispPx=time2Px(this.d[0][0]);
               this.myDraw(ctx, time2Px(this.d[0][0])  , this.d[0][1] );
               // Display the element
            },


            drawAtPixel: function(ctx, xval){
               this.myDraw(ctx, xval, this.d[0][1]);
            },


            // typically overridden by derivative objects
            myDraw: function (ctx, x, y){
            }

         };
         
         return genEvent;
      }
});