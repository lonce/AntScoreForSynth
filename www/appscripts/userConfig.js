/*  Mapps touch events to mouse events.
Just include this file in a require module, no need to call anything. 
*/

define(
  ["jsaSound/jsaModels/jsaMp3"],
  function(sndFactory){

    var uconfig = {
      "player": undefined,
      "room": undefined
    };

    // This is a click sound which get the iOs sound flowing
    var okSound=sndFactory();
    okSound.setParam("Sound URL", "resources/click.mp3");
    okSound.setParam("Gain", 1);


    uconfig.report = function(c_id) {
      var form = document.createElement("form", "report_form");
      form.id = "report_form";
      form.method = "post";
      form.action = "index.php?mode=post_comment";
   
      var reply_place = document.createElement("div");
      reply_place.id = "overlay";
      var inner_div = document.createElement("div"), button_close = document.createElement("button");
      button_close.id = "upprev_close";
      button_close.innerHTML = "x";
      button_close.onclick = function () {
          var element = document.getElementById('overlay');
          element.parentNode.removeChild(element);
      };
      inner_div.appendChild(button_close);
   
      var legend = document.createElement("legend");
      legend.id="legend";
      legend.innerHTML = "Choose one:";
      /*
      form.appendChild(legend);
      */

      var input1 = document.createElement("input");
      input1.type = "radio";
      input1.checked = "true";
      input1.id = "humanID";
      input1.value = "human";
      input1.name = "options";
      //input1.style.visibility = 'hidden';
      var radio_label1 = document.createElement("label");
      radio_label1.htmlFor = "humanID";
      radio_label1_text = "Play As Human";
      radio_label1.appendChild(document.createTextNode(radio_label1_text));
      //radio_label1.style.visibility = 'hidden';
      form.appendChild(input1);
      form.appendChild(radio_label1);
      

      var input2 = document.createElement("input");
      input2.type = "radio";
      input2.id = "agentID";
      input2.value = "agent";
      input2.name = "options";
      //input2.style.visibility = 'hidden';
      var radio_label2 = document.createElement("label");

      radio_label2.htmlFor = "agentID";
      radio_label2_text = "Play With Agent";
      radio_label2.appendChild(document.createTextNode(radio_label2_text));
      //radio_label2.style.visibility = 'hidden';
      
      form.appendChild(input2);
      form.appendChild(radio_label2);
      

      var roomdiv = document.createElement("roomdiv");
      roomdiv.type="div";
      roomdiv.id="roomdiv";
      roomdiv.innerHTML="Join a room?";


      var input3 = document.createElement("select");
      input3.type="select";
      input3.id="roomSelect";
      input3.options[0]=new Option("Play Offline", "", true, false);
      input3.options[1]=new Option("Default Room", "defaultRoom", false, false);

      input3.addEventListener('change', function(e) {
          uconfig.room  = e.currentTarget.value;
          console.log("uconfig.room = " + uconfig.room);
      });

      roomdiv.appendChild(input3);


   
      var submit_btn = document.createElement("input", "the_submit");
      submit_btn.type = "submit";
      submit_btn.className = "submit";
      submit_btn.value = "Submit";
      form.appendChild(submit_btn);
   
      submit_btn.onclick = function () {
          var checked = false, formElems = this.parentNode.getElementsByTagName('input');
          for (var i = 0; i < formElems.length; i++) {
              if (formElems[i].type === 'radio' && formElems[i].checked === true) {
                  checked = true;
                  var el = formElems[i];
                  break;
              }
          }
          if (!checked) return false;

           okSound.setParam("play", 1);

          uconfig.player = el.value;
          var element = document.getElementById('overlay');
          element.parentNode.removeChild(element);
          c_id(); // call the callback when we have our info

          //var poststr = "c_id=" + c_id + "&reason=" + encodeURI(el.value);
          //alert(poststr);
          return false;
      }
   
      form.appendChild(roomdiv);
      inner_div.appendChild(form);
      reply_place.appendChild(inner_div);

   
      // Here, we must provide the name of the parent DIV on the main HTML page
      var attach_to = document.getElementById("wrap"), parentDiv = attach_to.parentNode;
      parentDiv.insertBefore(reply_place, attach_to);
   
    }
  
  return uconfig;

  }
);
