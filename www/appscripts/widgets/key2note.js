define(
[],
function () {
	key2note = {};

	var basic = {};
	basic.a = 63;
	basic.s = 65;
	basic.d = 67;
	basic.f = 68;
	basic.g = 70;
	basic.h = 72;
	basic.j = 74;
	basic.k = 75; 

	basic.l = 77;
	
	key2note.map=function(letter){
		return basic[letter];
	}

 	return key2note;
 });