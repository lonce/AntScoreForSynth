define(
    [],
        function(){
            var utils = {};

            var uidBase="uid";
            var uidCount=0;
            utils.uid=function(){
                uidCount++;
                return (uidBase+uidCount);
            }

    		// utilities
		    // Until requestAnimationFrame comes standard in all browsers, test
            // for the prefixed names as well.

            utils.getRequestAnimationFrameFunc = function() {
                try {
                    return (window.requestAnimationFrame ||
                            window.webkitRequestAnimationFrame ||
                            window.mozRequestAnimationFrame ||
                            window.msRequestAnimationFrame ||
                            (function (cb) {
                                setTimeout(cb, 1000/60);
                            }));
                } catch (e) {
                    return undefined;
                }
            };


            utils.getCanvasMousePosition = function (canvas, evt) {
                var rect = canvas.getBoundingClientRect();
                //context.scale(1, 0.5);
                var bbox = canvas.getBoundingClientRect();
                return {
                x: (evt.clientX - rect.left)*(canvas.width/bbox.width),
                y: (evt.clientY - rect.top)*(canvas.height/bbox.height)
                };
            }

           function byte2Hex(n)
            {
                var nybHexString = "0123456789ABCDEF";
                return String(nybHexString.substr((n >> 4) & 0x0F,1)) + nybHexString.substr(n & 0x0F,1);
            }


            utils.getRandomColor1 = function(rmin,rmax,gmin,gmax,bmin,bmax){
                var r = rmin+ Math.round((rmax-rmin)*Math.random());
                var g = gmin+ Math.round((gmax-gmin)*Math.random());
                var b = bmin+ Math.round((bmax-bmin)*Math.random());
                return '#' + byte2Hex(r) + byte2Hex(g) + byte2Hex(b);
            }

            utils.getRandomColor = function(){
                var r = Math.round(255*Math.random());
                var g = Math.round(255*Math.random());
                var b = Math.round(255*Math.random());
                return '#' + byte2Hex(r) + byte2Hex(g) + byte2Hex(b);
            }


            // Print out the array with brackets - for 2D arrarys, print each "sub" array on a separate line
            Array.prototype.prettyString = function () {
                var s="[";
                var i;
                for(i=0;i<this.length;i++){
                    if (Array.isArray(this[i])){
                        s+=this[i].prettyString();
                        if (i<(this.length-1)) s+=",\n";
                    } else{
                        s+= this[i].toString();
                        if (i<(this.length-1)) s+=", ";
                    }
                }
                s += "]";
                return s;   
            }

            //------------------------------------------------------------------------
            // This is Douglas Crockfords "composing objects by parts" code from his book
            utils.eventuality = function (that) {
                var registry = {};
                that.fire = function (event) {
            // Fire an event on an object. The event can be either
            // a string containing the name of the event or an
            // object containing a type property containing the
            // name of the event. Handlers registered by the 'on'
            // method that match the event name will be invoked.
                    var array,
                        func,
                        handler,
                        i,
                        type = typeof event === 'string' ?
                                event : event.type;
            // If an array of handlers exist for this event, then
            // loop through it and execute the handlers in order.
                    if (registry.hasOwnProperty(type)) {
                        array = registry[type];
                        for (i = 0; i < array.length; i += 1) {
                            handler = array[i];
            // A handler record contains a method and an optional
            // array of parameters. If the method is a name, look
            // up the function.
                            func = handler.method;
                            if (typeof func === 'string') {
                                func = this[func];
                            }
            // Invoke a handler. If the record contained
            // parameters, then pass them. Otherwise, pass the
            // event object.
                            func.apply(this,
                                handler.parameters || [event]);
                        }
                    }
                    return this;
                };
                that.on = function (type, method, parameters) {
            // Register an event. Make a handler record. Put it
            // in a handler array, making one if it doesn't yet
            // exist for this type.
                    var handler = {
                        method: method,
                        parameters: parameters
                    };
                    if (registry.hasOwnProperty(type)) {
                        registry[type].push(handler);
                    } else {
                        registry[type] = [handler];
                    }
                    return this;
                };
                return that;
            }

            return utils;
});
