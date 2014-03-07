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


        // global to all agents
        // tso is "time since origin" - the time value of the "now" line when the method is called
        function makeGesture(tso){
                var m_gesture=generalScoreEvent("mouseContourGesture");

                m_g_start_t = 2000+10000*Math.random(); // from 10 to 12 seconds into the future
                m_g_end_t = m_g_start_t + k_min_d + (k_max_d-k_min_d)*Math.random();

                m_g_start_y = k_max_y*Math.random();
                m_g_end_y = k_max_y*Math.random();

                m_gesture.d=[[tso+m_g_start_t,m_g_start_y,5], [tso+m_g_end_t,m_g_end_y,5]];
                m_gesture.updateMaxTime();
                m_gesture.updateMinTime();
                m_gesture.s=0;//  myID;
                m_gesture.color="#00FF00";


                m_gesture.soundbank=soundbank;

                comm.sendJSONmsg("beginGesture", {"d":m_gesture.d, "type": "mouseContourGesture", "cont": false});
 
                console.log("starting gesture at " + m_gesture.d[0][0] + ", " + m_gesture.d[0][1] + ", " + m_gesture.d[0][2]);
                return m_gesture;
        }

        return function (){

            var agent={};
 
            var m_actInterval=5000;
            var clockTimeOfLastAction=2000;


             agent.tick=function(tso, scoreEvents){
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



            return agent;
        }
    }
);
