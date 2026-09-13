//misc:
	//general design idea:
		//this language is evolved from javascript and has some of the same syntax and behaviour
		//a javascript or rust eqivalent will be in '...'s
		//this language is designed for code that is written in the console
			//short/terse
			//fast to type
		//DRY: don't repeat yourself
		//reduce name variables
			//"there are only 2 hard problems in computer science: naming things and cashe invalidation"
	//show case:

	//learning:
		a : 2;//`let a = 2;` declaration
		a = 3;//assignment
		a:1;//can also redeclare variables;
		//',' vs ';'
		//';'s are always used to separate items or lines of code
		//','s are only for function calls
		log,a;//`log(a)` function call
		assert 1 == 1;//assert statement throws an error if the value is false/falsey ; see Javascript for meaning of truethy/falsey
		//bracket types: {} [] ()
			//code block
			{//inner scope
				a:11;
				b:22;
				c:a+b;
			}//the ';' can be infered for '{}'s
			array:[1;2;3];//uses ';' instead of ','s
			object:(a:"apple";b:"banana";c:"carrot");
			//'{}'s are also used for bracketing expressions
				4*{2+1};//12
			//{} acts like '{}' from rust
			ten : {
				log,"hello";
				returnValue:10;
				returnValue+=1;
				returnValue
			}