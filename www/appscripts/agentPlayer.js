define(
    ["comm", "soundbank", "scoreEvents/scoreEvent"],
    function (comm, soundbank, generalScoreEvent) {

        var theCanvas = document.getElementById("score");

        var k_max_d = 5000; //ms
        var k_min_d = 50; 
        var k_max_y = theCanvas.height;

        var m_g_start_t;
        var m_g_end_t;
        var m_g_start_y;
        var m_g_end_y;

        var m_soundSelector;

        // global to all agents
        // tso is "time since origin" - the time value of the "now" line when the method is called
        function makeGesture(tso){
                var m_gesture=generalScoreEvent("mouseContourGesture");

                // get the starting and ending time value
                m_g_start_t = 2000+10000*Math.random(); // from 10 to 12 seconds into the future
                m_g_end_t = m_g_start_t + k_min_d + (k_max_d-k_min_d)*Math.random();
                // get the starting and ending y value
                m_g_start_y = k_max_y*Math.random();
                m_g_end_y = k_max_y*Math.random();

                //CREATE THE GESTURE [[t,y,z],[t,y,z],[t,y,z], ...]
                m_gesture.d=[[tso+m_g_start_t,m_g_start_y,0], [tso+(m_g_start_t+m_g_end_t)/2,(m_g_start_y+m_g_end_y)/2,15], [tso+m_g_end_t,m_g_end_y,0]];  // third param is the same as provided by the slider on the interface

                // just in case the gesture array is not time ordered
                m_gesture.updateMaxTime();
                m_gesture.updateMinTime();

                m_gesture.s=0;//  myID;
                m_gesture.color="#FFFFFF";

                m_gesture.soundbank=soundbank;

                // from the display, selected by the user
                m_gesture.soundName = m_soundSelector.getModelName();
                m_gesture.param1=m_soundSelector.getSelectedParamName(1);
                m_gesture.param2=m_soundSelector.getSelectedParamName(2);


                comm.sendJSONmsg("beginGesture", {"d":m_gesture.d, "type": "mouseContourGesture", "cont": false, "fields": m_gesture.getKeyFields()});
                console.log("starting gesture at " + m_gesture.d[0][0] + ", " + m_gesture.d[0][1] + ", " + m_gesture.d[0][2]);
                return m_gesture;
        }

        return function (sselector){

            var agent={};
            agent.displayName="Agent Bonehead"
 
            var m_actInterval=5000;  // make a new gester this often
            var clockTimeOfLastAction=2000;


             agent.tick=function(tso, scoreEvents){
                if (! m_soundSelector) return;  // don't make a gesture if no sound models have been selected yet.
                if ((tso-clockTimeOfLastAction) > m_actInterval){
                    console.log("doing something at time " + tso);
                    scoreEvents.push(makeGesture(tso));
                    clockTimeOfLastAction = tso;
                }
                return;
            }

            agent.reset=function(){
                clockTimeOfLastAction=0;
            }


            agent.setSoundSelector = function(s){
                m_soundSelector=s;
            }

            sselector && agent.setSoundSelector(sselector);
            return agent;
        }
    }
);
