define(
[],
function () {
	key2note = {};

	var basic = {};
	basic.z = basic.Z = 60;
	basic.x = basic.X = 62;
	basic.c = basic.C = 64;
	basic.v = basic.V = 65;
	basic.b = basic.B = 67;
	basic.n = basic.N = 69;
	basic.m = basic.M = 71;
	basic[","] = basic["<"] = 72;

	basic.a = basic.A = 72;
	basic.s = basic.S = 74;
	basic.d = basic.D = 76;
	basic.f = basic.F = 77;
	basic.g = basic.G = 79;
	basic.h = basic.H = 81;
	basic.j = basic.J = 83;
	basic.k = basic.K = 84; 

	basic.l = basic.L = 86;

	basic.q = basic.Q = 84;
	basic.w = basic.W = 86;
	basic.e = basic.E = 88;
	basic.r = basic.R = 89;
	basic.t = basic.T = 91;
	basic.y = basic.Y = 93;
	basic.u = basic.U = 95;
	basic.i = basic.I = 96; 
	
	key2note.map=function(letter){
		return basic[letter];
	}

	key2note.minNote=function(){
		return 60;
	}

	key2note.maxNote=function(){
		return 96;
	}

 	return key2note;
 });