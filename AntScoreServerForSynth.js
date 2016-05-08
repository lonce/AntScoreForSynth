var express = require("express")
, app = express()
, server = require('http').createServer(app)
, WebSocketServer = require('ws').Server
, wss = new WebSocketServer({server: server})
, fs = require('fs');

var k_portnum = process.argv[2] || 8020;

var id = 1; // Given out incrementally to room joining clients
// Room list, each with an array of members (socket connections made by clients)
var rooms = {'': []};

var state={
    "currentSound" : [] // indexed by src
};

//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// message handling - functions.called to pass in 'this' (socket) contexts
var callbacks = {};
function registerCallback(name, callback) {
    callbacks[name] = callback;
    //console.log("callbacks["+name+"]="+callback);
}

// messages this server handles from clients
registerCallback('subscribe', subscribe);
registerCallback('unsubscribe', unsubscribe);
registerCallback('contGesture', contGesture);
registerCallback('beginGesture', beginGesture);
registerCallback('endGesture', endGesture);
registerCallback('startTime', startTime);
registerCallback('addToSoundbank', addToSoundbank);

// Note: for all functions used as callbacks, "this" will be a socket passed to the .call()
function subscribe(rm) {
    this.room.push(rm);

    if (rooms[rm] === undefined)
        rooms[rm] = [this];
    else
        rooms[rm].push(this);

    roomBroadcast(rm, this, 'newmember', [this.id]);
    console.log("new subscription to room " + rm);

    sendState(this);

     sendJSONmsg(this, 'roommembers', (function(){
        var rmids=[];
        for(var i=0;i<rooms[rm].length;i++){
            rmids.push(rooms[rm][i].id);
        }
        return rmids;
    }()), this.id);
}

/*
function unsubscribe(rm) {
    var ws = this;
    if (rm != ''){
        console.log("about to remove from rm " + rm)
        rooms[rm] = rooms[rm].filter(function (s) {return s !== ws;});
        room = '';
        console.log(ws.id + " is gone..." );
    }
}
*/
function unsubscribe(rm) {
    var ws = this;
    console.log("unsubscribe from room = " + rm);
    if ((rm != '') && (rm != undefined) && (rooms[rm] != undefined)){
        console.log("Unsubscribe at time="  + Date.now() + ",  with " + rooms[rm].length + " members");
        rooms[rm] = rooms[rm].filter(function (s) {return s !== ws;});

        if ((rooms[rm] != undefined) && (rooms[rm].length===0)){ // if nobody is in the room
            console.log("deleting room " + rm);
            delete rooms[rm];
        }
        room = '';

        console.log(ws.id + " is gone..." );
    }
}


//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
function genericBroadcast(m, data) {
    var that=this;
    this.room.forEach(function(r){
        roomBroadcast(r, that, m, data);
    });
    
}

// basic data exchange method for responding to one socket, sending to rest
function contGesture(data) {
    var that=this;
    this.room.forEach(function(r){
        roomBroadcast(r, that, 'contGesture', data);
    });
}

// basic data exchange method for responding to one socket, sending to rest
function beginGesture(data) {
    var that=this;
    this.room.forEach(function(r){
        //console.log("In beginGesture, my id is " + that.id);
        roomBroadcast(r, that, 'beginGesture', data);
    });
}


// basic data exchange method for responding to one socket, sending to rest
function endGesture(data) {
    var that=this;
    this.room.forEach(function(r){
        roomBroadcast(r, that, 'endGesture', data);
    });      
}

// When 'ere a client sends this message, the server sends out a new time to all room members
function startTime() {
    var JStime = Date.now();
    this.room.forEach(function(r){
        roomBroadcast(r, 0, 'startTime', [JStime]); // 0 sender sends to all members in a room
    });    
}

// basic data exchange method for responding to one socket, sending to rest
function addToSoundbank(data) {
    var that=this;
    this.room.forEach(function(r){
        roomBroadcast(r, that, 'addToSoundbank', data);
        console.log("Set state " + that.id + " = " + data);
        state.currentSound[that.id]=data;
        console.log("just set state, and state.currentSound.lenght is " + state.currentSound.length);
    });    
}
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
/*
function roomBroadcast(room, sender, name, data) {
    if (rooms[room] === undefined)
        return;
    var src = sender ? sender.id : 0;
    //if (sender !== null) console.log(name, 'from', src);
    rooms[room].forEach(function (ws) {if (ws !== sender) {sendJSONmsg(ws, name, data, src);}});
}
*/

function roomBroadcast(room, sender, name, data) {
    if (rooms[room] === undefined)
        return;

    var src = sender ? sender.id : 0; // 0 means from server - send to all members in a room
    //if (sender !== null) console.log("roombroadcast: " + name +  ' from sender ' +  sender + " with id = " + src);
    rooms[room].forEach(function (ws) {
        if (ws !== sender) {
            if (ws.readyState === 1){
                sendJSONmsg(ws, name, data, src);
            } else {
                console.log( "roomBroadcast: ws" + ws + " with ws.id =" + ws.id + " is not in ready state");
            }
        }
    });
}

// Send state to a particular recipient
function sendState(ws){
    console.log("In send state with state.currentSound length = " + state.currentSound.length)
    state.currentSound.forEach(function(element, index){
        console.log("sending state to " + ws + ", addToSoundbank " + element);
        sendJSONmsg(ws, 'addToSoundbank', element, index);
    });
}

function sendJSONmsg(ws, name, data, source) {
    ws.send(JSON.stringify({n: name, d: data, s:source}));
}

function receiveJSONmsg(data, flags) {
    //console.log("recevieJSONmessge, this.id is " + this.id);
    var obj;
    try {
        obj = JSON.parse(data);
    } catch (e) {
        return;
    }
    
    if (!obj.hasOwnProperty('d') || !obj.hasOwnProperty('n'))
        return;
    //console.log("object.d: " + object.d + ", object.n:"+ object.n);

    //callbacks[obj.n].call(this, obj.d);
    if (callbacks[obj.n]){
        //console.log("callback: " + obj.n);
        callbacks[obj.n].call(this, obj.d);
    } else {
        //console.log("generic callback: " + obj.n);
        genericBroadcast.call(this, obj.n, obj.d);
    }


}
//****************************************************************************
// Server activity code (other than it's simple message-relay duties)

// Sends a pulse to all members of all rooms at the pulsePeriod
var pulsePeriod=1000;
function emitPulse() {
    var JStime = Date.now();
    var rm;
    for (rm in rooms){
        if (rm === '') continue;
        if (rooms.hasOwnProperty(rm)){
            rooms[rm].forEach(function (ws) {
                sendJSONmsg(ws, 'metroPulse', [JStime], 0);
            });
        } else {
            console.log("No problem: rooms has no property " + rm);
        }
    }
}
setInterval(emitPulse, pulsePeriod);

// This works to allow x-domain in jsaSound - doesn't do the trick here tho. 
// If I run AntSynth locally, the client complains about requests to animatedsoundworks...
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    next();
});
//****************************************************************************
app.use(express.static(__dirname + "/www"));
server.listen(k_portnum);
console.log("Connected and listening on port " + k_portnum);



wss.on('connection', function (ws) {
    ws.id = id++;
    console.log("got a connection, assigning ID = " + ws.id);
    ws.on('message', receiveJSONmsg.bind(ws));
    ws.room = [];
    console.log("send init message to " + ws + ", with id = " + ws.id);
    sendJSONmsg(ws, 'init', [ws.id, Date.now()]);
    //sendRooms.call(ws);

    ws.on('close', function() { 
        ws.room.forEach(function(r){
            callbacks['unsubscribe'].call(ws, r);
        });
    });
});


function getRoomList(){
    rlist=[];
    for (r in rooms){
        if (r==='') continue;
        if(rooms.hasOwnProperty(r)){
            rlist.push(r);
        }
    }
    console.log("getRoomList: " + rlist);
    return rlist;
}

app.get(["/roomList"],function(req, res){
  var jsonObj;
  var jsonList=[];
  console.log("got request for roomlist, so send it")
  res.send({"jsonItems":   getRoomList()  }); // returns an array of room names
});

// check the client code to see if we still need to respond to "soundlist" requests to get roomlists....
app.get(["/soundList", "/soundList/ModelDescriptors"],function(req, res){
  var jsonObj;
  var jsonList=[];
  console.log("fetching from ModelDescriptors");
  res.send({"jsonItems":   getRoomList()  }); // returns an array of room names
});


exports.server = server;

