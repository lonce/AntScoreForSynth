define(
[],
function () {
	key2note = {};

	var basic = {};
	basic.z = basic.Z = 51;
	basic.x = basic.X = 53;
	basic.c = basic.C = 55;
	basic.v = basic.V = 56;
	basic.b = basic.B = 58;
	basic.n = basic.N = 60;
	basic.m = basic.M = 62;
	basic[","] = basic["<"] = 63;

	basic.a = basic.A = 63;
	basic.s = basic.S = 65;
	basic.d = basic.D = 67;
	basic.f = basic.F = 68;
	basic.g = basic.G = 70;
	basic.h = basic.H = 72;
	basic.j = basic.J = 74;
	basic.k = basic.K = 75; 

	basic.l = basic.L = 77;

	basic.q = basic.Q = 75;
	basic.w = basic.W = 77;
	basic.e = basic.E = 79;
	basic.r = basic.R = 80;
	basic.t = basic.T = 82;
	basic.y = basic.Y = 84;
	basic.u = basic.U = 86;
	basic.i = basic.I = 87; 
	
	key2note.map=function(letter){
		return basic[letter];
	}

	key2note.minNote=function(){
		return 51;
	}

	key2note.maxNote=function(){
		return 87;
	}

 	return key2note;
 });