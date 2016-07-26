define(
   ["comm"],
   function (comm) {

      var  gID_counter=0; /// give each event a unique id // 2015.07.01 - invented since text boxes can get messages any time - they don't stay "current" like other genestures as they are being made.


      return function (i_type){

         var genEvent={
            type: i_type || null,            // String identifying gesture type
            i: null,                         // some types use indexes to identify the display element to use (eg chords)
            d: [],                         // array data of [x,y] values for the gesture
            s: null,                         // a source ID (number)
            b: 999999999999999999999999999,  // begin time for this gesture
            e: -1, // end time for this gesture
            color: "#FFFFFF",
            head: "rectangle",                // "diamond", "circle", "rectangle"
            tail: true,                      // boolean for now     
            drawID: false, 
            font: "12px Arial",     
            selectedP: false,
            gID: gID_counter++,              // unique id for this gesture
                      // id for the source (the networked participant)
            sendData : {type: i_type, d: []} ,//, s: myID}, // a list of [t,y,z,{}] points to send to other participants; emptied after every send. 

            "comm": comm,


            duplicate: function(tshift, yshift, newEvent){

               // it would be nice not to have to hardcode this list................
               newEvent.type=this.type;
               newEvent.s=this.s;
               newEvent.color=this.color;
               newEvent.head=this.head;
               newEvent.tail=this.tail;
               newEvent.font=this.font;
               newEvent.text=this.text;
               newEvent.soundbank=this.soundbank;

               if (this.soundName) newEvent.soundName=this.soundName;
               if (this.param1) newEvent.param1=this.param1;
               if (this.param2) newEvent.param2=this.param2;

               newEvent.d=[];
               for (var n=0;n<this.d.length;n++){
                  newEvent.d.push([this.d[n][0]+tshift, this.d[n][1]+yshift, this.d[n][2] ]);
               }
               newEvent.b=this.b+tshift;
               newEvent.e=this.e+tshift;

               return newEvent;
            },

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

            draw: function(ctx, time2Px, nowishP, now){
               //var dispPx=time2Px(this.d[0][0]);
               this.myDraw(ctx, time2Px(this.d[0][0])  , this.d[0][1] );
               // Display the element
            },


            drawAtPixel: function(ctx, xval){
               this.myDraw(ctx, xval, this.d[0][1]);
            },


            // typically overridden by derivative objects
            // Is (t,y) on top of this gesture?
            touchedP: function(t,y){
               return false;
            },


            // typically overridden by derivative objects
            myDraw: function (ctx, x, y){
            },

            stopSound: function(){
               this.snd && this.snd.release();
               this.snd && this.soundbank.releaseSnd(this.snd);
            },

            destroy: function(){
               // override to so whatever you need to do to get the element off the screen or whatever
            },


            drawSelected: function(ctx, time2Px){
               var dispPx;

               // Display the element
               ctx.fillStyle = "#FFFFFF";
               ctx.globalAlpha = 0.85;
               for(var n=0;n<this.d.length;n++){
                  ctx.beginPath();
                  ctx.arc(time2Px(this.d[n][0]), this.d[n][1] ,2,0,2*Math.PI);
                  ctx.closePath();
                  ctx.fill();
               }

               ctx.globalAlpha = 1;      
            },

            select: function(arg){
               this.selectedP=arg;
            },

            // override this method to provide fields not shared with other Events
            getKeyFields: function(){
               return {};
            },

            addEvent: function(t,y,z,eobj){
               var ne = [t,y,z];
               eobj && ne.push(eobj);
               genEvent.d.push(ne);
               genEvent.sendData.d.push(ne); // actuall, only gestures that contually update and send data need to do this...
            },

            /*
            getSendData: function(){
               return genEvent.sendData;
            },
            */

            sendContinuation: function(){
               if (genEvent.sendData.d.length > 0) { 
                  comm.sendJSONmsg("contGesture", genEvent.sendData.d);
                  genEvent.sendData.d=[];
               }
            }

      };
      return genEvent;
   }
});