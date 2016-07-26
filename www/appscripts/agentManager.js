/*
Add your agent factory module to the define[] list, and give it a variable name in the arg list to the function.

Agents modules should return a factory function that takes a sound_selector as an argument,
and return an agent object with a displayName property.
*/
define(
    ["agentPlayer"],  // add you agent factory module to this list
    function (agentPlayer) {

    	var agentlist=arguments;

    	var agentMan={};
    	agentMan.agent=null;

    	var selector = document.getElementById("agentSelector"); 

    	agentMan.registerAgent=function(agent, name, selectedCb){
    		var opt = new Option(name);
    		opt.agent=agent;
    		opt.callback=selectedCb || function(){};
			selector.add(opt);
		}

		var cb = function(e){
			//console.log("selectedIndex is " + selector.selectedIndex);
			//console.log("selector.options[selector.selectedIndex] is " + selector.options[selector.selectedIndex]);
			//console.log("and its callback is " + selector.options[selector.selectedIndex].callback);
			//var foobar = selector.options[selector.selectedIndex];
			agentMan.agent=selector.options[selector.selectedIndex].agent;
			selector.options[selector.selectedIndex].callback();
			console.log("selected new agent, " + selector.options[selector.selectedIndex].value);
		}

		// steps through the list of arguments to this module to create the agents and register them
		agentMan.initialize = function(sselector){
			var agent;
			for (var i = 0; i < arguments.length; i++) {
				agent=agentlist[i](sselector);
				agentMan.registerAgent(agent, agent.displayName || "displayName");
			}
		}
		// add the "no agent" option 
		agentMan.registerAgent(null, "None");

		selector.addEventListener("change", cb);

		return agentMan;
    }
    );
