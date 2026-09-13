integrate:\start#end#reps#foo:{
	i:start;
	reps.>(0;\[#+foo,i;i=i+{end-start}/reps].0)
};
a:integrate(0;1;2;\log,#);