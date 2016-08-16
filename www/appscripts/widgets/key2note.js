define(
[],
function () {
	key2note = {};

	var basic = {};
	basic.a = basic.A = 63;
	basic.s = basic.S = 65;
	basic.d = basic.D = 67;
	basic.f = basic.F = 68;
	basic.g = basic.G = 70;
	basic.h = basic.H = 72;
	basic.j = basic.J = 74;
	basic.k = basic.K = 75; 
	basic.l = basic.L = 77;
	
	key2note.map=function(letter){
		return basic[letter];
	}

	key2note.minNote=function(){
		return 51;
	}

	key2note.maxNote=function(){
		return 89+1;
	}

 	return key2note;
 });