define(
   ["scoreEvents/pitchEvent", "scoreEvents/rhythmEvent", "scoreEvents/chordEvent",  "scoreEvents/contourEvent", "scoreEvents/sprayEvent", "scoreEvents/textEvent", "scoreEvents/genericScoreEvent"],
   function (pitchEvent, rhythmEvent, chordEvent, contourEvent, sprayEvent, textEvent, genericScoreEvent) {
      return function (i_type, arg){
 
         switch(i_type){
            case "pitchEvent":
               return pitchEvent(arg);
               break;
            case "rhythmEvent":
               return rhythmEvent(arg);
               break;
            case "chordEvent":
               return chordEvent(arg);
               break;
            case "mouseContourGesture": // consider normalizing the string and the function name
               return contourEvent(arg);
               break;
            case "mouseEventGesture":   // consider normalizing the string and the function name
               return sprayEvent(arg);
               break;
            case "textEvent":
               return textEvent(arg);
               break;
            default: 
         }


   }
});