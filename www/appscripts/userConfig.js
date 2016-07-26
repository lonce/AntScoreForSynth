/*  Mapps touch events to mouse events.
Just include this file in a require module, no need to call anything. 
*/
require.config({
});
define(
  ["jsaSound/jsaModels/jsaMp3", "mods/gateKeeperFactory", "utils"],
  function(sndFactory, loadGateFactory, utils){

    // object to be returned by this module
    var uconfig = {
      "player": undefined,
      "room": [],
      "gatekey": (gateKeeperFactory(["resourceLoaded"], // after all keys are set(), function will execute
          function(){
            // replace "loading" with "All ready" and make the submit button available
            legend.innerHTML = "Anticipatory Score";
            inner_div.appendChild(submit_btn);
          })),
      "report": function(){}
    };


    var msgbox = document.getElementById("msg");
    var overlay_div = document.createElement("div");
      overlay_div.id = "overlay";
    var inner_div = document.createElement("div");
    var button_close = document.createElement("button");
    var submit_btn = document.createElement("input");
      submit_btn.type = "button";
      submit_btn.className = "submit";
      submit_btn.value = "Submit";
    var legend = document.createElement("legend");
 
 //++++++++++++++++++++++++++++++++++++++++++++++++
  var roomdiv = document.createElement("roomdiv");
  roomdiv.type="div";
  roomdiv.id="roomdiv";
  roomdiv.innerHTML="Join a room?";

  var roomSelector = document.createElement("select");
  roomSelector.multiple=true;
  roomSelector.type="select";
  roomSelector.id="roomSelect";

  roomSelector.options[0]=new Option("Play Offline", "", false, true);
 //roomSelector.options[1]=new Option("Default Room", "defaultRoom", true, true);

  utils.getJSON("/roomList", function(data){
      var opt;
      if (data.jsonItems.length > 0){
        for(var i=0;i<data.jsonItems.length;i++){
          console.log("rooms from server: " + data.jsonItems[i]);
          opt=document.createElement("option");
          opt.text=data.jsonItems[i];
          opt.value=data.jsonItems[i];
          roomSelector.add(opt)
        }
      }
    });

  
  roomSelector.options[roomSelector.options.length]=new Option("Create a Room", "makeNewRoom", false);

  //roomSelector.options[2]=new Option("Create a Room", prompt("Enter a room name", "Room"+Math.floor(9999*Math.random()));

  roomSelector.addEventListener('change', function(e) {
    var newRoom;
      //uconfig.room  = e.currentTarget.value;
      //console.log("uconfig.room = " + uconfig.room);
      if (e.currentTarget.value === "makeNewRoom"){
        newRoom=prompt("Enter a room name", "Room"+Math.floor(9999*Math.random()));
        if (newRoom != null){
          roomSelector.options[roomSelector.options.length-1]=new Option(newRoom, newRoom, false, true);
          roomSelector.options[roomSelector.options.length]=new Option("Create a Room", "makeNewRoom", false, false);
        }
        //roomSelector.options[roomSelector.options.length-1].selected=false;
      }
      
  });

  roomdiv.appendChild(roomSelector);

 //++++++++++++++++++++++++++++++++++++++++++++++++

    // The real reason for this sound is that Apple devices require a user-initiated sound before the program can generate sound on its own
    var okSound=sndFactory();
    
    //uconfig.report = function(c_id) {
      button_close.id = "upprev_close";
      button_close.innerHTML = "x";
      button_close.onclick = function () {
          var element = document.getElementById('overlay');
          element.parentNode.removeChild(element);
      };
      inner_div.appendChild(button_close);
   
      legend.id="legend";
      legend.innerHTML = "Performance <br> Loading ...";
      inner_div.appendChild(legend);

      inner_div.appendChild(roomdiv);
    // This is a click sound which get the iOs sound flowing
    okSound.on("resourceLoaded",  function(){
      uconfig.gatekey.set("resourceLoaded");
    });
    okSound.setParam("Sound URL", "http://animatedsoundworks.com:8001/jsaResources/sounds/click.mp3");


/*
      var buttTimer=setTimeout(function(){
        console.log("autoclick submit button");
        submit_btn.click()}, 3000);
*/

      submit_btn.onclick = function () {
          //if (buttTimer) {clearTimeout(buttTimer);}
          //var checked = false, formElems = this.parentNode.getElementsByTagName('input');

          //alert("click");
          okSound.setParam("Gain", 1);
          okSound.setParam("play", 1);
          //msgbox.value="click played";

          //console.log(roomSelector.selectedOptions);
          for(var i=0;i<roomSelector.selectedOptions.length; i++){
            uconfig.room.push(roomSelector.selectedOptions[i].value);
          }
          console.log("selected options include " + uconfig.room);

          var element = document.getElementById('overlay');
          if (! element) {
            console.log("got click on nonexistent element .... autoclick?");
            return;
          }
          element.parentNode.removeChild(element);

          uconfig.fire("submit");
          //c_id(); // call the callback when we have our info
          return false;
      }
   
      overlay_div.appendChild(inner_div);
      
      // Here, we must provide the name of the parent DIV on the main HTML page
      var attach_to = document.getElementById("wrap"), parentDiv = attach_to.parentNode;
      parentDiv.insertBefore(overlay_div, attach_to);
   
//    }
  
  utils.eventuality(uconfig); // so that we can fire an event when the SUBMIT button is pushed
  return uconfig;

  }
);
