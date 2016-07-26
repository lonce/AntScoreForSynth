/*
	The reason I use a soundbank is because I can't figure out how and when 
	ScriptAudioNodes are released (or not), so I can't just get a new sound from 
	the factory every time an event starts or else the system becomes bogged down 
	in calls to the ScriptAudioNode generate audio functions!!!
*/
define(
	["config"],
	function (config) {


	var soundbank = {};
	var m_maxPolyphony;

        var m_polyNum=[]; // indexed by sound name:  number = m_polyNum[sname]
        var snds=[];      // indexed by sound name   m_snds[sname][voice_num]


        soundbank.addSnd = function(sname, sndFactory, poly){
        	m_maxPolyphony=poly;
                if (snds[sname]){
                        console.log(" The sound " + sname + " was already loaded, so no need to do it again");
                        return;
                } else {
                        console.log("adding sound with poly = " + poly);
                }
                //else
                snds[sname]=[];
        	for(var i=0;i<poly;i++){
        		snds[sname][i]=sndFactory();
        		snds[sname][i].available=true;
        	}
                m_polyNum[sname]=0;
        }

        soundbank.getSnd = function(sname){
		var i=0;
                polylist=snds[sname];
                nextSndNum=m_polyNum[sname];

                //console.log("soundbank.getSnd: sname = " + sname + ", and nextSndNum = " + nextSndNum);

        	while(i<m_maxPolyphony) {
        		nextSndNum=(nextSndNum+1)%m_maxPolyphony;
                        //console.log("nextSndNum = " + nextSndNum);
        		//console.log("snds["+m_polyNum+"] = " + snds[m_polyNum]);
        		if (polylist[nextSndNum].available){
        			polylist[nextSndNum].available=false;
                                m_polyNum[sname]=nextSndNum;
        			return polylist[nextSndNum];
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
