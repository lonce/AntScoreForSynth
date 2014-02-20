var express = require("express")
, app = express()
, server = require('http').createServer(app)
, WebSocketServer = require('ws').Server
, wss = new WebSocketServer({server: server})
, fs = require('fs');

var k_portnum = process.argv[2] || k_portnum;

var id = 1; // Given out incrementally to room joining clients
// Room list, each with an array of members (socket connections made by clients)
var rooms = {'': []};

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

// Note: for all functions used as callbacks, "this" will be a socket passed to the .call()
function subscribe(rm) {
    this.room = rm;
    if (rooms[rm] === undefined)
        rooms[rm] = [this];
    else
        rooms[rm].push(this);

    roomBroadcast(this.room, this, 'newmember', [this.id]);
    console.log("new subscription to room " + rm);

     sendJSONmsg(this, 'roommembers', (function(){
        var rmids=[];
        for(var i=0;i<rooms[rm].length;i++){
            rmids.push(rooms[rm][i].id);
        }
        return rmids;
    }()));
    //sendJSONmsg(this, 'instruments', activeInstruments[rm]);
    //sendJSONmsg(this, 'notes', histories[rm]);
}


function unsubscribe(rm) {
    var ws = this;
    if (rm != ''){
        console.log("about to remove from rm " + rm)
        rooms[rm] = rooms[rm].filter(function (s) {return s !== ws;});
        room = '';
        console.log(ws.id + " is gone..." );
    }
}

// basic data exchange method for responding to one socket, sending to rest
function contGesture(data) {
    roomBroadcast(this.room, this, 'contGesture', data);
}

// basic data exchange method for responding to one socket, sending to rest
function beginGesture(data) {
    roomBroadcast(this.room, this, 'beginGesture', data);
}


// basic data exchange method for responding to one socket, sending to rest
function endGesture(data) {
    roomBroadcast(this.room, this, 'endGesture', data);
}

// When 'ere a client sends this message, the server sends out a new time to all room members
function startTime() {
    var JStime = Date.now();
    roomBroadcast(this.room, 0, 'startTime', [JStime]); // 0 sender sends to all members in a room
}

//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
function roomBroadcast(room, sender, name, data) {
    if (rooms[room] === undefined)
        return;
    var src = sender ? sender.id : 0;
    //if (sender !== null) console.log(name, 'from', src);
    rooms[room].forEach(function (ws) {if (ws !== sender) {sendJSONmsg(ws, name, data, src);}});
}

function sendJSONmsg(ws, name, data, source) {
    ws.send(JSON.stringify({n: name, d: data, s:source}));
}

function receiveJSONmsg(data, flags) {
    var obj;
    try {
        obj = JSON.parse(data);
    } catch (e) {
        return;
    }
    
    if (!obj.hasOwnProperty('d') || !obj.hasOwnProperty('n') || callbacks[obj.n] === undefined)
        return;
    //console.log("object.d: " + object.d + ", object.n:"+ object.n);

    callbacks[obj.n].call(this, obj.d);
}
//****************************************************************************
// Server activity code (other than it's simple message-relay duties)

// Sends a pulse to all members of all rooms at the pulsePeriod
var pulsePeriod=1000;
function emitPulse() {
    var JStime = Date.now();
    var rm;
    for (rm in rooms){
        rooms[rm].forEach(function (ws) {
            sendJSONmsg(ws, 'metroPulse', [JStime], 0);
        });
    }
}
setInterval(emitPulse, pulsePeriod);


//****************************************************************************
app.use(express.static(__dirname + "/www"));
server.listen(k_portnum);
console.log("Connected and listening on port " + k_portnum);

wss.on('connection', function (ws) {
    ws.id = id++;
    console.log("got a connection, assigning ID = " + ws.id);
    ws.on('message', receiveJSONmsg.bind(ws));
    ws.room = '';
    sendJSONmsg(ws, 'init', [ws.id, Date.now()]);
    //sendRooms.call(ws);

    ws.on('close', function() {        
        callbacks['unsubscribe'].call(ws, ws.room);
    });
});

exports.server = server;

