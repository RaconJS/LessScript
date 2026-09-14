integrate:\:{::float;//definite integral
	x:#start;
	dx:{#end-start}/#reps;
	#foo;
	reps.>(0;\[#+foo,x;x=x+dx].0)*dx
};
i:\:{
	x:#s;
	dx:{#end-start}/#reps£#foo
	¬*reps.>\[#+foo,x;x=x+dx].0
};
[i(0;1;100;\#.sin);{1-1.cos}];
l,1+£l,2 l,3