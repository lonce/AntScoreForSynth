define(
	["scoreEvents/genericScoreEvent"],
	function (generalScoreEvent) {

      // For rhythm, the argument to this factory function is an image
      return function (i_arg){

         var m_scoreEvent=generalScoreEvent("textEvent");
         m_scoreEvent.head="text";
         m_scoreEvent.tail=false;
         m_scoreEvent.type='text';

         m_scoreEvent.text='!' + i_arg;

         m_scoreEvent.addChar = function (c){
            m_scoreEvent.text+=c;
         }

         m_scoreEvent.myDraw = function(ctx, x, y){
               //console.log("rhythmTag, arg is " + i_arg);
               ctx.font = "9px sans-serif";
               
               ctx.beginPath();
               ctx.fillStyle = 'white';
               ctx.rect(x,y,ctx.measureText(m_scoreEvent.text).width,12);
               ctx.fill();
               ctx.closePath();

               ctx.fillStyle = 'black';
              

               ctx.beginPath();
               ctx.arc(x,y,1,0,2*Math.PI);
               ctx.closePath();
               ctx.fill();      

               ctx.fillText(m_scoreEvent.text, x, y+12);

         }

         return m_scoreEvent;
      }
});