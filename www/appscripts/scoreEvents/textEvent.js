define(
	["scoreEvents/genericScoreEvent"],
	function (generalScoreEvent) {

      // For rhythm, the argument to this factory function is an image
      return function (i_arg){

         var textBox=document.createElement("input");
         textBox.className="textBox1"
         var scoreElmt=document.getElementById("block1b");

         //var foo = scoreElmt.getBoundingClientRect();

        textBox.readOnly = true; // by default - change manually if its our own 


         //textBox.style.top=scoreElmt.offsetTop + "px";
         //textBox.style.left=scoreElmt.offsetLeft + "px";

         //console.log("appending textBox");
         scoreElmt.appendChild(textBox);
         textBox.focus();


         var m_scoreEvent=generalScoreEvent("textEvent");
         m_scoreEvent.head="text";
         m_scoreEvent.tail=false;

         m_scoreEvent.text= i_arg || "";

         m_textHeight=12;

/*
         m_scoreEvent.addChar = function (c){
            m_scoreEvent.text+=c;
         }
*/

        m_scoreEvent.enableEditing= function(){
          textBox.readOnly = false;
          textBox.style.border="2px solid green";
        }

        m_scoreEvent.setText=function(id, iText){
          m_scoreEvent.text=id + "> " + iText;
          textBox.value= id + "> " + iText;
          console.log("id is " + id + ", and .s is " + m_scoreEvent.s);
        }

         textBox.onkeyup=function(evt){
          var chrTyped, chrCode = 0;
          m_scoreEvent.text=textBox.value;
          //console.log("in onkeyup, on keypress m_scoreEvent.text = " + m_scoreEvent.text);
          if (evt.keyIdentifier==="Enter") {
            m_scoreEvent.comm.sendJSONmsg("update", {"gID": m_scoreEvent.gID, "text": m_scoreEvent.text});
            textBox.blur();
          }

          /*
          if (evt.charCode!=null)     chrCode = evt.charCode;
          else if (evt.which!=null)   chrCode = evt.which;
          else if (evt.keyCode!=null) chrCode = evt.keyCode;

          if (chrCode==0) chrTyped = 'SPECIAL KEY';
          else chrTyped = String.fromCharCode(chrCode);
          console.log("textBox key press:  " + chrTyped);
          //m_scoreEvent.text+=c;
          m_scoreEvent.text+=chrTyped;
          console.log("onkeypress, scoreEvent.text is " + m_scoreEvent.text);
          */
         }
         

         m_scoreEvent.draw = function(ctx, time2Px, nowishP, now){
            if (this.selectedP){
               this.drawSelected(ctx,time2Px);
            }
            this.myDraw(ctx, time2Px(this.d[0][0])  , this.d[0][1] );
         }


         m_scoreEvent.myDraw = function(ctx, x, y){

                var seRect = scoreElmt.getBoundingClientRect();
                var tbRect = textBox.getBoundingClientRect();

/*
              //console.log("rhythmTag, arg is " + i_arg);
               ctx.font = "9px sans-serif";
               
               ctx.beginPath();
               ctx.fillStyle = 'white';
               ctx.rect(x,y,ctx.measureText(m_scoreEvent.text).width,m_textHeight);
               ctx.fill();
               ctx.closePath();

               ctx.fillStyle = 'black';
              
               ctx.beginPath();
               ctx.arc(x,y,1,0,2*Math.PI);
               ctx.closePath();
               ctx.fill();      

               ctx.fillText(m_scoreEvent.text, x, y+12);
*/

                //textBox.value=m_scoreEvent.text;
                //console.log("myDraw: m_scoreEvent.text = " + m_scoreEvent.text);
                textBox.style.top=scoreElmt.offsetTop + scoreElmt.clientHeight*y/ctx.canvas.height+"px";
                textBox.style.left=scoreElmt.offsetLeft+ scoreElmt.clientWidth*x/ctx.canvas.width+"px";
                textBox.size=Math.max(3, .8*textBox.value.length);
                textBox.style.clip = "rect(0px " + (tbRect.width+seRect.right-tbRect.right) + "px " +  (tbRect.height+seRect.bottom-tbRect.bottom) +  "px " + (seRect.left-tbRect.left)  + "px)"; //scoreElmt.getBoundingClientRect();
                //console.log("textBox length = " + textBox.value.length);
                //console.log ("x = " + x + ", ctx.canvas.width = " + ctx.canvas.width + ", textBox.x is " + textBox.style.left);
         }

         m_scoreEvent.destroy = function(){
            scoreElmt.removeChild(textBox);
         }

         //m_scoreEvent.mySVG= '<svg height="12" width="12"> <text x="0" y="15" fill="red">I love SVG!</text> </svg>'
/*
         var textImage = new Image();
         m_scoreEvent.myDraw_SVG = function(ctx, x, y){

               //console.log("rhythmTag, arg is " + i_arg);
               ctx.font = "9px sans-serif";
               
               ctx.beginPath();
               ctx.fillStyle = 'white';
               ctx.rect(x,y,ctx.measureText(m_scoreEvent.text).width*1.5,m_textHeight);
               ctx.fill();
               ctx.closePath();

               ctx.fillStyle = 'red';
              
               textImage.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(getSvgForContent(m_scoreEvent.text));
               //textImage.src="images/rhythm2.jpg";
               //textImage.src.width = '40';
               //textImage.src.width = '40';
               ctx.drawImage(textImage,x,y);
         }


         var getSvgForContent = function (content) {
             return [
                 '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200">',
                 '<foreignObject width="100%" height="100%">',
                 '<html xmlns="http://www.w3.org/1999/xhtml"><head></head>',
                 '<body>',
                 '<style type="text/css">body {font-size: 9px;}</style>',
                 content,
                 '</body>',
                 '</html>',
                 '</foreignObject>',
                 '</svg>'
             ].join('\n');
         };

*/


         m_scoreEvent.touchedP = function(t,y){
            //console.log("touchedP: t= " + t + ", and y = " + y);
            //console.log("touchedP: head.t = " + this.d[0][0] + ", and head.y = " + this.d[0][1] )
            var tempy;

            if ((this.b <= t) && (this.e >= t) && (y > this.d[0][1]) &&  (y <  this.d[0][1]+m_textHeight)){
               console.log("SELECTED TEXT");
               this.selectedP=true;
            }
            else{
               this.selectedP=false;
            }
            return  this.selectedP; 
         }; // touchedP

         m_scoreEvent.getKeyFields= function(arg){
               return {
                  "text": m_scoreEvent.text
               }
            }




         return m_scoreEvent;
      }
});