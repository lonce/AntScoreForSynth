/*
	The reason I use a soundbank is because I can't figure out how and when 
	ScriptAudioNodes are released (or not), so I can't just get a new sound from 
	the factory every time an event starts or else the system becomes bogged down 
	in calls to the ScriptAudioNode generate audio functions!!!
*/
define(
	["config", "require", "jsaSound/jsaModels/jsaFMnative"],
	function (config, require, sndFactory) {


	var soundbank = {};
	var m_maxPolyphony;

	var m_nextsnd=0;

        var snds=[];

        soundbank.create = function(poly){
        	m_maxPolyphony=poly;
        	for(var i=0;i<poly;i++){
        		snds[i]=sndFactory();
        		snds[i].available=true;
        	}
        }

        soundbank.getSnd = function(){
			var i=0;
        	while(i<m_maxPolyphony) {
        		m_nextsnd=(m_nextsnd+1)%m_maxPolyphony;
        		//console.log("snds["+m_nextsnd+"] = " + snds[m_nextsnd]);
        		if (snds[m_nextsnd].available){
        			snds[m_nextsnd].available=false;
        			return snds[m_nextsnd];
        		} else{
        			i=i+1;
        		}
        	}
        	console.log("No sounds currently available - reached maximum polyphony");
        	return undefined;
        }

        soundbank.releaseSnd = function(snd){
        	snd.available=true;
        }


        return soundbank;
});
