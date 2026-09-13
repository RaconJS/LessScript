//1:
	// ',' and ';' consumes up to function, 'short;', ',' does not consume past ':' '=' or functions '\ ...' and '[]'
	//idea use '[...]' as wrapped function and '\...' as unwrapped function
	//use '@' for named arguments and public properties (with public keys) (public up to the parent module)
	//(...) returns the last item,
	//{...} object, takes inner variables '{a:2}' as properties local to the module
	//[...] can be used for structs
	//[ #_shortExp_:exp ] ==> [ #parameters:type ]
	//#:exp ==> unnamed parameter of type
	//$$ unnamed static symbol, e.g. (1:int,2:int) == (int,int)
	//[:a b] = (1,2) ==> destructuring
	//[: exp_return_struct other] ==> struct syntax, using 'exp' as the return values
	//[exps] exp ==> function
	a:mod @(
		foo:\(#a.push;#b a)
		array:{1 2 3}
		foo;array,2
	)
	a;a.foo;(1,2),3 == {1 2 3}
	add:[#a+#b]#0
	b:($a.foo:\#a)

	\(#+#,\#-#)
	vec2:[:#$$#int#int]

	object:struct;
//2:
	//use '`' for no function called with no argument
	//foo{} calls a function
	//use .. to insert multiple arguments
	//comparisons can be chained e.g. 'a>b>c' ==> 'a>b && b>c'
	//{ ... } ==> object & array
	normalDistribution : mod {
		value:$int=\(#:int).iterate;\(#:int)+random{}>0.5
		getList:iter{1000 value{}}
	}
	assert {1 2},{3 4} != {1 2 3 4}
	assert {1 2} == (1,2)
	assert {a:2} == (a:2)
	assert {a:2} != (a:2 a) == 2
//3:
	//fizz buzz
	100.iterate[
		#i:Int += 1;
		value:String = "";
		if i % 3 == 0 value += "fizz";
		if i % 5 == 0 value += "buzz";
		print<|value;
	];
	T:=[#a:Int,#b:3*Char];
	t:={a:Int=2,b:3*Char="abc"};//_*T for array
	t:={a=2,b="abc"};
	LinkedList := [$$,#last:LinkedList[$#T],#:$T];
	linkedList : LinkedList = LinkedList<|LinkedList<|;
	a:T=b//declare local value 'a' with type 'T' 
	#a:=b//declare parameter
	$A//marks (declaration or reference) as symbol called '$A' of type 'A'
	@shortExp//marks symbols public
	@a:=b//
	# $   _ //declare public? : arg local
	@//public
	\ //function call
	¬ £ ,
	=> =< <=>
	-> -< <-> <->
	>>= =<<
	<| |> <: :>
//4:
	//'\' denotes a function
	//function: '\exp' with '#a' parameters, '##' or '(#)' for unnamed parameters ; also '\:type=exp' for a return type ; '\(args):type=exp' for full function signiture
	//struct: '{exps}' have special patterns: '{lbl=exp}' == '{lbl:=exp}' ; hoisting 'lbl=' or 'lbl:=' e.g. '{a=;b=} == {a:=a;b:=b}' ; 'lbl:' in '{a:;b:;}' adds a property but doesn't assign it a value. can be used to add Unit type symbols '{$:;1;2}'
	//array: '[exps]' ; is a dynamic array
	//block: '(exps)' return ; returns last item ; '(:type=exps)' or '(=exps)' returns the first item, which is evaluated last
	//'mod exp' 'lbl:exp=exp' 'lbl=exp,'
	//'lbl::exp=exp' for declaring types 'T::traitsOrMetaType=type' ; uses type syntax for the 'type' part.
	//'a(b(c(x)))' == 'a<|b<|c<|x' ; ',' == '<|'
	//'f(a)(b)(c)' == 'f,a,b,c' == '((f(a))(b))(c)'
	//'c(b(a(x)))' == 'a,x|>b|>c'
	//'foo(a)<:b' == 'foo,a<:b' == 'foo(a;b)'
	//'<:' and ':>' work similar to how they do in 0xmin ; 'short_exp<:short_exp' ; consume the same way as '<|' and '|>' respectively
	//'foo(exps)' 'obj[exps]' 'foo{exps}' ; 'foo{exps}' is useful to construct structs with named properties
		//note: 'foo{...}' == 'foo({...})'
	//';' consumes up to the top i.e. nearest bracket
	//',' consumes up to nearest short_exp since it's used for function calls
	//end expression: ';' in 'exp;'
	//function call: ',' in 'short_exp,short_exp' e.g. 'foo,bar' == 'foo(bar)'
	//key using: '.' in 'short_exp.short_exp' e.g. 'obj.a' or 'obj.$A'
	//'$lbl' for external symbol ; '#lbl' for parameter
	//about modules (i.e. 'mod'): only '@' labels are public. the call actions 'f()' 'f{}' are always public
	//'short_exp(a;b;c)' can use array-like syntax in '( )' blocks when used in function calls, can still use `foo,(a:=2;bar();a)` to return the last value `a`
	//'( exps ) : type_exp' for typing expressions
	//'{ args_exps } = exp' , '[ args_exps ] = exp' destructureing 
	//'short_exp..short_exp' and 'short_exp..=short_exp' range syntax, same as in Rust.
	//'...' is similar to 'todo!()' in rust marks unfinished or dummy code; '...' is a full 'exp', allowing for e.g. 'foo<|\...<|3' --> 'foo((\(...))(3))' .
		//'...' normally does not throw an error unless it's inspected.
		//'!!!' throws an error always, just like Rusts `todo!()`
			\if !##=>(10)
		//'...' throws an error throws an error if:
			//a property of '...' is accessed e.g. `(...).a`
		a:={...};
		a.c;//error: a is not implemented
		foo:=\...;
	// '*' in '* : type = value' injects properties & arrays into the parent block
		// '* @ : type = value' injects all public properties into the parent block
		// '* $ : type = value' injects all properties (both public and non-public) into the parent block
		//note that '*$' and '*@' can work within the same module
			(
				*$ := {a:=2}
				print(a)
			)
	//'@ short_exp' in '@ obj' makes all symbols in 'obj' public (recursively), to the parent module.
		//e.g.
		obj:=mod@({a=2}); //a is public
		obj[0].a;
	//symbols:
		//
		//without '@'s,  '$short_exp' is needed to access private fields; symbols are like types, and are worked out at compile time
		(
			*@ := {
				privateKey ::= $$ Int;// there cannot be a space between the 2 '$'s in '$$'
				@ obj := mod{$privateKey=2};
				@ reader := \#obj.$privateKey;
			};
			innerA := reader();
		);
		(
			obj:;
			reader:;
			(
				privateKey ::= $$ Int;// there cannot be a space between the 2 '$'s in '$$'
				obj = mod{$privateKey=2; a=2;@printA=\print,a};
				reader = \#obj.$privateKey;
			);
			innerA := reader();
		);
		(
			uniqueObject := {$$$:;1;2;3};
			assert uniqueObject != {1;2;3};
			symbol ::= $$$;
			obj := {$symbol:;1;2;3};
			assert obj == {$symbol:;1;2;3} != {1;2;3};
		)
		//'$ T' returns a label from the key 'T'. it will also be of type 'T'.
		//'$$ T' returns a unique key type. It is "static" meaning only 1 unique key can be made per 1 '$$' (or '$$$') in the source code.
		//'$$$' == '$$any' : returns a generic key
		//note: '$' is also used to access type syntax
		//compound objects:
			T := \{$$:};//unique unit type
			U := \{$$:};
			normal_object : {a:Char;b:Int} = {b:=2;a:="A"};
			compound_object1 :{T;U}={T,;U,};
			compound_object2 :{T;U}={$T:T=T();$U:U=U()};
	//types:
		//primitives:
			Bool;
			Int;Float;
			String;
		//misc/special:
			Any;//generic type; 'a=$$;' == 'a=$$Any;' == 'a=Symbol(Any);'
			Undefined;//cannot be constructed; is also used as the 'void' value for functions
			Symbol(T);//similar to 'Key' but can be used as properties to a value
			...;//note that '...' is still a whole exp so may need to use brackets '(...)'
			Unit(t)
			Type
		//compounds:
			Enum(Array(Type))
			Option(T);
			Result(T;E);
			Array(T;L);//'[],T' ; array of type 'T' and length:L e.g. a:Array(T;2);b:Array(T;any);c:Array(T;1..=4);
			Item(T;U);//'T.U' ; item on object 'T' of type U
			Index(T;U);//'T[U]' ; index from object 'T' to item of type 'U' ; can also have 'Index(T)' if 'T' is a type of array where 'U' would always be the same.
			Key(T);
			Compound(Array(Type));//
			Fn(Array(InputType);OutputType);//function; note that functions are also types
		//e.g.
		listOfTypes := [_::Int;_::Char;_::{Int;Char}]//{$Int} or {Int}? for {}
	//control flow:
		//note on preceedence: these keyword-based expressions (e.g. 'for' , 'match' ) consume more that other 'exp' patterns, only ';' has higher priority.
		//variables
			#@ ; #@lbl ;
			for 0..10 => print,#@//can use '#@' and '#@lbl' to name parameters to expressions like e.g. 'for' and 'match'.
		//use
		return exp;
		break exp;
		//for
			//for loops returns last value
			for exp => exp; /*or*/ for exp in exp => exp;
			for exp short_exp;
			for iterable_exp => body_exp;
			for parameters_exp in iterable_exp => body_exp;
			//e.g.
				for {v;i} in [2;4;6] => v+i;
				print,for [2;4;6] => #@v+#@i;//prints "8" ; Int(6)+Index(2) = 8
			//experimental syntax:
				for,start_special_exp,while_exp,next_exp => body_exp;
				for condition_exp => exp
				//'in'
					//'in iter_exp' adds iterator 'iter_exp' as an argument to the for-loop. It's elements can be referenced using '#@label' or 'label in iter_exp' syntax
					//'in' expressions are evaluated at the start of a for loop, they return a Some
				//e.g.
					//this loop is bounded to the min of all the iterators
					for(s:=0;in "ABC";in "123";in 0..100)=>(=s;s += #@ + #@);//"A1B2C3"
		//if
			if exp exp else exp;
			if condision_exp then_exp else exp;
		//ternary operator
			condision_exp ? then_exp ?: otherwise_epxp
		//match
			match short_exp => exp;
			//e.g.
			match Option.Some(3) => (
				.Some=>print(#@);
				.None=>print("none");
			)
		//example
			mod(
				print("squares");
				//for list value=>exp
				for [2;4;6] \(//takes in 2 expressions
					print(v**2);
					if v == 25 break;
				);
			)//note: unsure how 'for' loops should work
	//iterators
		iter exp//returns an iterator
		yeild exp//breaks from a 'iter' block returning an Iter(Some<exp>,Done<exp>)
		yeild * exp//same as 'yeild exp' but yeilds for every value in the 'exp' iterator
		//yeild* looks at `bar.$iter` or `bar.$\iter()` to find which one to yeild
		iter yeild* [2;4;6]//returns a iterator
	//async
		async exp //returns a promise
		//async is similar to iter but it continues when 'resolve' functions are called.
			//similar to javacsript async uses 'Promise'-like objects with
			//async also allows for runs asyncronously.
			//unlike javascript, iterators and async do not need their own function block
		await exp //returns promise 'exp', contines when the promise resolves returns the return value
		//example
			sum_5_numbers_slowly := async \#nums.reduce(0;\(await sleep(2);#s+#v));
			sum_numbers := \(nums_a : Array(Int;5); nums_b : Array(Int;5)) : async(Int) =
				async (await sum_5_numbers_slowly,nums_a) + (await sum_5_numbers_slowly,nums_b)
			;
		//TODO make async not require leaky awaits/asyncs, (leaky like rust lifetime refactoring)
	//short type coersions
		int_to_string:=\:String=""+(#int:Int);
	//defer:
		defer exp;//runs exp at the end of a block
	//special properties
		//note: '$T.a.b' == '($T).a.b' ; '$(T.a).b' == '$(T.a).b'
		obj.$Array.>//reduce function "many to one"
		obj.$Array.=//map function "many to many"
		obj.$Int.<//repeat function ; for Int-like types only ; "one to many"
	//assert
		//throws an error in debug mode or at compile time if assersion fails
		assert bool_exp;//
		assert value_exp:type_exp;
		assert (value_exp:type_exp);
		assert !(value_exp:type_exp);
		assert value_exp:type_exp=value_state_exp;
	//'is'
		exp is type_exp
		exp is! type_exp
		compairs type
	a := 2;
	b := 3;
	c := \#x + #y;
	a = c,a<:b;
	mod {
		\:{a:Int;b:Int;c:Int}={a=2;b=3;c=4};
	};
	compound_object:{$Int;$Char}={$Int=2;$Char="a";$Int+=2;};
	assert compound_object == {$Char="a";$Int=4};
	normal_distribution := mod (:Fn=
		@get_distribution := \
			#size.$Int.<,[]<:\//note: the '.$Int' isn't needed since 'size.<' is already public
				(
					#s[single_value,size¬.$Int] ??= 0 ¬ += 1
				)
		;
		single_value := \(##:Float):Float=
			#size.$Int.<,0<:\#sum+Float.random()
		;
	);
	//23:00 ; 23:01
	linked_list := \(it):=it.>,[]<:\[#s;#v];
	//ones made after
		linked_list := \#it.$Iter.>,[]<:\[#s;#v];
		linked_list := \##.>,None<:\{#s;#v};
	//oop
	struct := \{$:;#a:Int;#b:Int;sum=\a+b;min=\a.min,b};
	obj : struct = struct(2;3);//functions are types 
	assert obj.$struct.b == 3;
	//note: fully private keys (e.g. the '.a' key in 'mod(obj:={a=2};obj.a);') can never leak outside their module, although their values can. e.g. a getter can leak the value from a private key.
	//TODO: consider adding Value state (Valid,Invalid)
	//TODO: consider adding low-level memory management including borrow checking with lifetimes.
	//TODO[DONE]: improve for loops

	(
		for(//start
			s:=[];
			i:=0;
			v:= in iter 1000.<,\yeild ##;
			in 0..100;
		)do i+=1 =>
		=>
			s.push,
		;
		//'=>' subfunction: 'keyword special_args_exp => special_exp' ; use '#@label' and '#@' for parameters instead of '#label' and '##'
	);
	(
		//leat code daily question
		//https://leetcode.com/problems/shortest-subarray-with-or-at-least-k-ii/description/?envType=daily-question&envId=2024-11-10
		or_sum := \##.>,<:\##|##;
		is_specail := \or_sum,##>=##;
		\(array;k):Int=(
			sum := or_sum(array;k);
			sum < k && return -1;
			min_length := array.len;
			(2**array.len).<\(
				#i:I128;
				sub_array := array.>,[]<:\(s;v;j):=(=s;(i&(1<<j)) && s.push,v);
				min_length := min_length.min<|is_specail,sub_array<:k
			);
			min_length;
		)
	);
//4.1:
	{$:=T()}; //adds symbol T to object, expressions in '{ exps }' adds it's type as a key to the object;
		//To support tuples, if the type is already a key it is a repetition and doesn't mutate the existing key. It only adds to the tuple part.
	//$$ can be used outside of types in expressions to make an object unique to it's source code
		UniqueType : Fn([];$$+3*Int);
		UniqueType = \$${1;2;3};
		struct : UniqueType = UniqueType();
		assert struct.$UniqueType is! \{1;2;3};
	//idea:swapping '{}' and '()'
		//so '()' for struct, '{}' for block
//4.2:
	//past compiler tests:
		//##;
		//#@;
		//#?;
		//#!>;
		{
			a:=2;
			a+=2;
			:a=b;
			\##.<,0<:a;
			health:Int=10;
			$:=nodes=a;
			obj:=(a=(b=2));
			(a=(b=v)):=(a=(b=2));
			v:=(a=(b=2)).a.b;
			(b=v):=(a=(b=2)).a;
			(a.b=v):=(a=(b=2));
		};
	//patterns:
		//short_exp
			//block
				{exps}
				{=exp;exps} ; {:type_exp=exp;exps}//the first exp is executed last; note: if it contains any '#lbl's then they will still will address the first parameters
				{:type_exp;exps}//types a block. the last expression in the block must be of type 'type_exp'.
			//array
				[exps]
			//struct
				(exps)
				//special_struct_inner_patterns:
					key = value //as syntax-sugar, ':' is not needed for declarations '=' declares instead
				//value_exp: expressions add to the tuple part.
				//declaration_exp: declaration and assignment expressions add fields to the struct part.
				//properties can only be added to local objects, obeying module encapsulation/scoping rules.
			key
			short_exp.key//similar to javascript 'a.b = c' mutates 'a'
			short_exp[exp]//returns item using index
			short_exp{args_list}//function call: list of args
			short_exp(args_list_and_struct)//function call: allows for both named and indexed arguments
			//primitive literals
				"string"
				r#"
					multi
					line string
				"#//same as "multi\nline string";
				r###""###;//need equal amounts of '###'s
				123//number literal
				123_456_789//can space out digits with '_'
				0xDEAF//hexidecinal
				0b10100//binary
				0o24//octal
				2.3//float
				0x2.4F64//rust-like number typing
				true false//boolean literal
			//types ; the type system
				//primitives
					N Number Float Fixed Int

					I I8 I16 I32 I64 I128
					U U8 U16 U32 U64 U128
					F F8 F16 F32 F64 F128
					Fx Fx8 Fx16 Fx32 Fx64 Fx128//Fixed
					S String
					C Char
					B B8 B16 B32 B64 B128//BoolSet
					E E8 E16 E32 E64 E128//Enum
					Ec8 Ec16 Ec32 Ec64 Ec128//EnumCase
					Bc8 Bc16 Ec32 Bc64 Bc128//BoolSetCase
				//objects
					Array{T;L} ; [...] ; L*T ; *T //array of T's of length 'L'
					Vector ; V*T //where: V:Vector, T:Type
					Struct(...) ; (...) //list of key type pairs + tuple items
					Fn{T;[...]} ; Fn->T ; Fn[...]->T ; \T ; \(...):=T //function that takes in parameters 'P' and returns a 'T' ; P is must be a bracket literal
					Enum(...) ; ^(...) ;  //if proceeded by a 'short_short_exp' then it matches to the "enum case" pattern '^short_short_exp.key' ; note: this syntax is a companise since we would prefer `case operator enum` syntax.
					EnumCase //stored as only an Int, item from an enum
					BoolSet(...) ; |(...)//array of booleans ; can me matched against like an enum but multiple cases will run instead of just 1, similar to Enum
					BoolSetCase
					//e.g.
						Compound_type1_multi_inheritence ::= $$($*:Int;$*:String);
						Compound_type2_traits ::= $$($Int:;$String:);
						Compound_type3_tuple ::= $$(Int;String);
						Compound_type4_JSON_object ::= $$(int:Int;string:String);
						Colours ::Enum= ^(
							Red;//same as ';'
							Green;
							Blue:$$;//makes blue a unique unit type ; enum varients can have types just like rust
							Grey:^(Light;_;Dark);
							Black = 8;//can assign values as well as types to enums
						);
						Settings :: BoolSet = |(//can be used as an array of Option types
							A;
							B;
							C;
							D:Float;
						);
						enumCaseObject :Enum= ^().;
				//

					Index{T;A}  //A[T] ; index to a 'T' on object of type 'A'
					Item{T;O}  //
				//
					Any
					Undefined
					Unit
				//meta types
					Type{T}
					Symbol{T}  $$//key to a type T
				//Type cannot be overwriten, all the basic types are properties of 'Type'
		//type properties:
			//special properties
				//note: '$T.a.b' == '{$T}.a.b' ; '${T.a}.b' == '${T.a}.b'
				obj.$Array.>//reduce function "many to one"
				obj.$Array.=//map function "many to many"
				obj.$Int.<//repeat function ; for Int-like types only ; "one to many"
		//args:
			argument_exp
			args;argument_exp
			//argument_exp:
				key
		//exp
			short_exp
			//alternate block expression typing ; TODO: decide wheather to keep this syntax
				{ ... }:short_type_exp,//for asserting types for parts of expressions
					//e.g.
					print{"1 + 2 = " + {:Float; 1 + 2}:Float¬.$String}:{};
			//function:
				\exp
				//typing
					\function_params:type=exp
					\function_params:=exp
					\:type=exp
					//function_params:
						{destructures}
						(destructures)
						destructures
						key
				//named parameters (aka public parameters since the parameter symbols are public)
					//can put '@' behind a parameter key to allow for named arguments
					//e.g.
						\(a;b)=a+b;
						\(a:Int;b:Int):Int=a+b;
						foo:=\(@a;@b)=a+b;
						foo(a=2;b=3);
						bar:=\[@#a;##];
						assert bar(a:=2;3) == [3;2];
					//public arguments can only be accessed
					//REVISION:
						//using 'key#' for named parameters
						//using 'key# exp' for named arguments
						foo:=\a#+b#;
						foo:=\(a#:F;$F):F=a+$F;
						foo(2;a#2);
						//note: in '#name' '#@name' 'etc...' parameter patterns there cannot be a space between the '#' and the name. this makes ( 'a #a' --> error ) different from ( 'a# a' --> uses named argument)
							//'a#b' == 'a# b'
			//extra control flow '?' 'break' 'return'
				return exp;
				break exp;
				continue exp;
				exp?//ealy return ; same as `return exp`
				exp?#@//breaks from the nearest owner of 
					//can break from for,
			//enum
				Enum (
					String;
				);
				^(exps)//enum
				^(exps).key//case
				Enum
			//modules 'mod'
				mod exp
				//the types inside a module can be infered.
				//types must be defined by the end of statically parsing a module.
				//variables within a module are considered "local"
				//keys cannot be added to external objects, only internal ones.
				//the global scope is considered a module
			//public '@'
				//makes the 'short_short_exp' accessable to the parent 'mod' module
				@short_short_exp
				//e.g.
					@key : type = exp ;
					//
					@( ... ) ;//public object ; '@' makes all keys inside brackets recursively public
					@[ ... ] ;//
					@{ ... } ;//public object
					@\ ... ;//public function ; the type of this function is public
				//e.g.
					obj := mod{
						newObject := (
							@publicProperty := \print,"accessable by parent module";
							privateProperty := \print,"accessable only inside this module";
						)//does not end in ';' so 'obj' is returned by the '{}' block
					};
					obj.privateProperty,;
			//references 'ref'
				ref exp
				//can use '#@' to reference the refed object
				cyclic_object := ref(#@);
			//operators
				exp+exp//can use any infix operator
				!short_exp//prefix operator
				exp > exp < exp //chainable comparison operators e.g. 'x<y<z' --> 'x<y && y<z'
				exp == exp == exp //chainable equality operators e.g. 'x == y == z' --> 'x==y && y==z'
				//operators
					//infix
						+ - * / ** %% % //float note: 'a%%b' is for log i.e. {log_b{a}} == 'log{a}/log{b}'
						& | ~ ^ << >> >>>//bitewise
						&& || ^^ ~~
						== != >= <= //note: these operators can be chained for '4 > x >= 2' expressions
					//prefix operators
						! ++ -- + -
				key += exp
				key :+= exp
				key : type += exp
				//type casting '>:'
					exp >: short_short_type_exp
					//'a >: T' is equivelant to 'a.into::<T>()' from Rust, where as 'a.$T' is more like 'a as T' from Rust
					//In general 'a.$T' should be used for converting types, 
					//e.g.
					a := 45:<Int;
						ascii_code :U8= {:Char;"a"}U8;
				//specall assign with operator operators '>>='
					key >>= foo_exp//same as 'key = foo_exp{key}'
			//'¬'
				exp ¬ exp
				exp ¬ .short_exp
				//consumes all of the exp on the left
				//same as in 0xmin
				assert {\##+##¬{2;3}*2} == {{\##+##}{2;3}*2};
			//ternary operator '?&' + '?|'
				//functions the same as a for loop
				condition_exp ?& then_exp ?| otherwise_exp //"and then" "or else"
				then_exp &? condition_exp ?| otherwise_exp
			//"todo" macro
				...
			//declaration/assignment
				//general_declaration_or_assignment
					short_exp:type_exp//general declaration
					short_exp=exp//assignment
					short_exp:=exp//declaration and assignment
					short_exp:type_exp=exp//declaration and assignment with type 'type_exp'
				key:type=exp
				key::SuperType_exp=type
				//auto_declare symbol ; '$:=' ''
					$:type
					$:=exp
					$:type=exp
					$=exp//auto_assignment
				//hoisting
					key:=*
				a.b=c//assigns property similar to Javascript {mutating referenced object 'a'} ; if key 'b' is not on 'a's type and 'a's struct is local, then it is added to the struct and object.
					//auto adding properties cannot be done, if the object's type is well defined, or if the object's type is private to this scope.
				a.b:=c//
				{exps}.key = exp;
				destructure=exp
				destructure:=exp
				destructure:type=exp
				//destructure:
					short_exp //'a.b.c = exp' == 'c = {exp}.a.b.c'
					(destructures)
					[destructures]
					//destructures:
						destructure
						destructures destructure
					//note: can be recursive, e.g. [a;[b;(c;d)]] = [1;[2;(c=3;d=4)]];
					//e.g.
						\(obj):=(
							(a;[b;x.y.z=(c;w=d)]) := obj;
							//or can also put in types
							(a;[b;x.y.z:(c:;w:)=(c;w=d)]) : (a:;[_;(x:(y:(z:(c:;w:(d)))))]) = obj;
						);
				//declaring types
					T::=U;
					key::type_exp=type_exp;
					T::meta_type=type;
					//e.g.
						T::Type=2*Int;
			//type_exp:
				type_short_exp
				type_exp * type_exp // array 'size * type' == Array{$Int:size;$Type::type}
				type_exp + type_exp //compound objects ; similar to combining traits in Rust.
				$$ type_short_exp
				//type_short_exp:
					{type_exps}//block
					(type_exps)//struct
					[type_exps]//array
					\normal_exp//enters normal typeing ; this is done since types are functions
			//params_exp:
				//parameter_exp:
					key
					key:type
					key=default
					key:=default
					key:type=default
				//parameters_exps:
					parameter_exp
					parameters_exps;parameter_exp
				parameter_exp
				{parameters_exps}
			//keyword expressions:
				//general
					keyword body_exp
					keyword > exp = body_exp
					keyword > = body_exp
					keyword >= body_exp//can use '>=', less than or equal to symbol, the same way as '> =' pattern
					keyword exp => body_exp
					//can also use '=>' instead of '>='
					#@//can use '#@' keyword's parameter declarations
				//if expression
					if condition_exp => then_exp else otherwise_exp
					//condition_exp:
						//normal exp with special pattern for Rusts 'if let'-like expression
						key:type=obj
						:type=obj //inner value can then be reverenced with '#?' or '#?name'
						//can do 'if let T{inner} = obj (inner)'
							obj := Option.Some(2);
							if (inner) : Option.Some = obj => print,inner else inner;
							if (inner) : .Some = obj =>
								print,inner
							else inner;
							@* = Option;
							if obj : Some => print,#?inner else assert #?inner is Option.None;
							if null != null => print,"some value:\""+#?+"\"";
					//ternary 
				//
					//can use '#@key' in these expressions
					//keywords:
						for do in
						match
						while
					while exp => exp
					for exp do exp => exp
						for => exp
						in iterable_exp
						do exp
					match exp => match_exp
					//for loops
						//for loops:
						in iterable_exp //takes in an iterable object and returns each value from it, per loop in a for loop
							//a 'for' loop runs as long as at least 1 unfinished iterator in one of it's 'in' expressions
						key in iterable_exp //syntax sugar for 'key := iterable_exp'
						start_exp do next_exp while condition_exp => body_exp //a triditional for loop.
							//runs 'start_exp' once. Then checks 'condision_exp' 'body_exp' with 'next_exp' at the end of each loop.
							//has 2 parameters:
								//'#?key': for the unwrapped value from condition_exp, works same as the 'if's '#?'.
								//'#@key': for the value of the variable declared in 'start_exp', if no variable was declared then 'start_exp's value will be assigned to the '#@' value.
							//note that unlike for loops in some other languages, the 'i++' part is written before the condision.
								//this design choice is done since the 'next_exp' code is userally simpler than the 'condision_exp' code.
					//e.g.
						for in [1;2;3] => print,#@v; 
						for v := in [1;2;3] => print,v; 
						for v in [1;2;3] => print,v; 
						for print,in [1;2;3];//'for condision_exp => body_exp' or 'for body_exp'
						for{v := in[1;2;3]; print,v};//
						i := 0 do i++ while i < 10 => print,[1;2;3][i];
						0 do #@i++ while i < 10 => print,[1;2;3][i];
						for i := 0 in i++ while i < 10
						match Option.Some{3} => (
							Option.Some:=print{#@};
							Option.None:=print{"none"};
						)
						//note can use syntax-sugar '.key' instead of 'EnumType.key' in match statements and when a type can be infered
						match Option.Some{3} => (
							.Some=print{#@};
							.None=print{"none"};
						)
						a := 2
						match a => [
							{assert #@ == a == 0;print,"a == 0"};
							print,"a == 1";
						]
				//
					iter yeild//used for iterators, similar to Javascript
					async await//async
					!< !>
					!> //can be used as 'yeild' or 'await' depending on smallest context
						//'!> exp' returns the first argument to the "resolve" function
						//'!>' contains a '#@' argument for the 'next' function that, when called continues the async/iter function.
							//if the 'next' function is called before the 'exp' in '!> exp' finishes then it will not yeild a '(value:;next:)' object and will just continue the function with the resolved result.
							//if the 'next' function is not called an await block will return a '(value;next)' pair
					!>* iterable_exp //same as 'yeild* exp' in javascript ; it joins the inner async/iterator ; same as 'for !> in iterable_exp'
					!< //'!< exp' ; same as 'async' ; a '!>' (aka 'await') breaks out of the nearest '!<' block
				//
					if else

				//
					defer
						//defers the running of a statement till the end of its block
						//similar to the '(:=exp; )' pattern ; 'blocks' include statements like 'if' 'for', functions (i.e. '\'), brackets '()', etc...
				//assertions:
					assert assert_condision_exp;
					assert assert_condision_exp => exp;
					//assert_condision_exp:
						exp
						exp is type_exp//returns true the type of 'exp' equals 'type_exp'
						exp is//returns true if all property parts of 'exp' involve existing keys; can be used for checking keys on objects
					//e.g.
						assert exp is type_exp;
						assert exp == exp;
						assert exp.$type_exp is;
					exp is exp;
					//exp's in assert expressions can use 'is' keyword to compair types
					assume exp => exp;
				//error handling
					try exp
						//returns an Result that can be detected with 'if else' or '?&' statements
					try exp else catch_exp
					try exp => finally_exp else catch_exp
					try exp ?& finally_exp ?| catch_exp
					try exp ?| catch_exp
				//importing files
					import short_exp:type_exp;
					use.short_exp//imports module
					//note: importing the same file twice will NOT create 2 separate sets of keys.
					//TODO: work out how running modules would work as well
					//uses rust-like file including
					//main_folder
						//main_folder/module1
						//main_folder/module2
						//main_folder/module3
					main_folder := mod (
						module1 := mod (...);
						module2 := mod (...);
						module3 := mod (...);
					);
					//e.g.
						//main_file
							use mod.folder1.module_2 as 

						//folder1
							//module 2
				//
		//exps
			exp
			exps;exp
		//key
			name //any word 'abc' 'foo' 'bar' etc...
			$name
			$short_short_type_exp //a.$B.c == (a.$B).c != a.$(B.c)
			//declare function parameter
				#name
				##
				//for declaring and using parameters while in a function
			//declare statement parameter e.g. in 'for' blocks
				#@name
				#@ //followed by no name
			//condision case
				#?name
				#?
			//situational
				@*//gets all public keys of 'obj'; excludes private keys ; also injects array elements
				!@*//gets all the non-public key of 'obj';
				$*//gets all keys of ; includes both public and private keys ; also injects array elements
				//e.g.
					$*:=(a=2;b=3);
					assert a == 2;
					!@*
				..//range syntax
					short_exp .. short_exp
					short_exp ..= short_exp
				$//auto key, gets the appropreate key depending on the type required ; '$ = 2' --> '$Int = 2' 
					//e.g. 'foo:=\{:String}:=#str+str;' 'foo,$' --> 'foo,$String'
		//unique symbols '$$' ; unique types
			//key
				$$
			$$short_exp//turns 'short_exp' into a class-instance-like object
			//e.g.
				{
					obj:=(1;2;3);
					UniqueObj := \$$obj;
					unique_obj := UniqueObj{};
					assert unique_obj is UniqueObj;
					assert unique_obj.$UniqueObj == unique_obj;
					$$obj
				}
				//

				//is the same as
					($$:;1;2;3);
		//typeof
			assert short_exp.$Type
		//TODO
			error handling
	//misc syntax:
		//destructuring
			obj:=(a=1;b=(2;3);c=3;4;5;6);
			(a:x;b:y;c:3)=obj;
			(a=x;b=(y;z);c=w)=obj;
			(a=b=foo)=obj;
			four:;five:;six:;
			[four;five;six] = obj;
	//learning:
		//hello world
			print,"hello world";
		
		//uses
			function,argument
			//syntax
		//variables
			a:;//declaration
			a = 2;//assignment
			b := 2;//declaration and assignmnt
			c :I= 5;//typed variable declaration and assignment ; types are infered othersise. 'I' is short for the 'Int' type
			[a;b] = [5;6];//destructuring assignment
		//data structures
			//arrays and structs are supported
			//arrays use '[]' brackets.
			//structs use '()' brackets.
			//'{}' are for code blocks, similar to rust, that return their last statement.
				//"erm actually" note: the '{:= ... }' pattern can be used to run the first line last and return that.
					//however, this simply reorders the code so would still count as the last line.
			//arrays elements, just like all code, are separated by ';'s.
			array : *I = [1;2;3];
			array.push,10;
			object : (...) = (a=1;b=2;3);// structs can contain tuples aswell ; in a struct 
			assert object.a == 1;
			assert object[0] == 3;
			assert array[1] == 2;
		//functions
			//supports unnamed parameters, reducing one of the 3 hardest problems in computer science.
			addTwoNumbers := \##+##;//terse unnamed function
			multiplyTwoNumbers := \(a:F;b:F):F= a * b;//a verbose function
			//what if I want typed but I do not want to name my variables?
				power := \:F= ##:F * ##:F;
				//or if we just wanted to have names but only want to write them once
				power = \#a * #b;
		//unnaming variables
			//there are only 2 hard problems in computer science, cashe invalidation and naming things
			//we have already seen how parameters need not be named but variables can also
			//types can be used to name variables
			$I := 2;//'$I' translates to "the integer" in english
			//and fields in structs
			obj := ($I = 2; $S = "ABC"; $F = 3.14);
			assert obj.$I == 2;
		//type system
			//grammer wise: types are treated as static functions and vise-verser.
			//they are evaluated at compile time.
			//we can use '::=' to declare a variable as a type
			Animal ::= (
				legs:I;
				speek:\;
				name:S;
			);
			Cat ::Animal= (
				legs:I=4;
				speek:=\print,"meow";
				name:S;
			);
			Car := \(wheels:I=##; model:S=##);
			car1 :Car= Car(4;"car model 1");
			//note type checking is duck typed by defualt.
			//Any object with the same named properties would be seen as the same type.
			//To fix this was can use the unique object type operator '$$'
			UniqueInt := \$$##:I;
			assert UniqueInt,5 == 5;
			assert UniqueInt,5 !is I;//we use '!is' to compair a value to a type
			//now we get in to the complex world of symbol-ception.
				//a "UniqueInt" contains the properties '$I' since it contains it.
					//this is so type conversions can be made.
					asInt = \{##:UniqueInt}.$I == 5
	//examples:
		{//example
			mod{
				Coords := \($$:;#x:=0;#y:=0);
				player := (
					$ = Coords{0;0};
					health:Int=10;
				);
			}
			/*
				//Rust
				struct Coords{x:Int;y:Int};
				struct Player {
					coords:Coords,
					health:Int,
				}
				let player = Player{
					coords:Coords(0,0),
					health:10,
				};
			*/
			/*
				//Javascript
				let player = {
					coords:Coords(0,0),
					health:10,
				};
			*/
		};
		//btw the reason '{}' is used for blocks instead of '()' is that Sublime-text always treats '{}' as blocks and doesn't like using '()' as blocks.
		{
			DiGraph := \{#T;Self:=\($DiGraph=this;$:=#nodes:{*Self};T)};
			assert DiGraph == \($DiGraph:;$\:);
			DiGraph.a := $$();
			assert DiGraph is \DiGraph(#T);
			//note: an object's type is always a key of the object e.g. '(2;"a").$(Int;String)'
			//note: 'a:T=b' only declares to a block if it's not inside another expression
		};
		{//callbacks
			foo1:=\#callBack{};
			foo2:=\#callBack{};
			foo3:=\#callBack{};
			foo4:=\#callBack{};
			foo1{
				\foo2{
					\foo3{
						\foo4,
							\print,"done";
					}
				}
			};
			foo1,
				\foo2,
					\foo3,
						\foo4,
							\print,"done"
			;
			foo1,\foo2,\foo3,\foo4,\print,"done";
			async {
				await>=foo1,#@;
				await>=foo2,#@;
				await>=foo3,#@;
				await>=foo4,#@;
				await>=print,"done";
			};
			!< {
				!> foo1,#@;
				!> foo2,#@;
				!> foo3,#@;
				!> foo4,#@;
				!> print,"done";
			};
			church_numeral_five := \f:=\f,f,f,f,f,#x;
		};
		{
			Word := \(
				#word:String;
				#type:^(
					Bracket:* *Word;
					Label;
					Symbol;
					Number;
				);
				#debug:(
					column:Int;
					line:Int;
					indent:Int;

				);
			);
		};
		{
			normal_distribution := mod {
				\##.<,\##[\1000|>(\##.<,0<:\##+1F.random)]+=1;
			};
		};
		{
			sum = \($*I):I=
				##.>{;\##+##};
			//(a:Int[]):Int=>//JS
			//	a.r((s,v)=>s+v)
			//f :: [Int] -> Int//haskell
			//f [] = 0
			//f (x:xs) = x + sumList xs
		};
		{
			//idea: [] for enums
				\:$[red;green;blue;$Int;Some:T,]=.Some(3);
			*$
			//note: language does not need 'dyn' keyword. functions are typed by their return values
		};
		add := \##+##;
	//extra updates:
		//4.2.1:
			struct := \{x:I;y:I};
			trait := /{a:\;b=};
		//4.2.2:
			//notes on design so far:
				//problems with previous language design:
					//lack of nice rust-like struct constructors.
				//some of the language strengths so far:
					//very reduced naming variables.
					//terse
					//lack of brackets for keyword expressions
					//fast to write, (harder to read)
					//makes a good, terse advent of code, language
					//assign&declareing parameters, parts of keyword-statements, properties on objects &/| structs.
			//ealy return with '?':
				exp ?
			//postfix not operator
				short_exp!
		//4.2.3 example: removing types by default
			//idea: no types ; use 'short_exp:exp' for assignment
			//- special class syntax
			//- no 'foo{}' function calls, only 'foo()','foo,' etc... and 'array[]'
			//- normal ternary funcitons 'a?b?:c' or 'b?a?|c'
			//'mod' is not needed so much 
			//idea: use '/exp' for classes, use 'keyword exp { exps }' patterns aswell as 'keyword exp => exp'
			a:b;
			a:T=b;
			1 + 1;
			//reference
				//'key ref exp'
				this ref (getThis:this);
				//the 'key' is only usable inside the ref's expression
				//syntax is similar to the 'key in exp' pattern
			//classes
				Class:/(//use '/exp' for class function ; a class adds properties to an object
					//first argument referse to the instance object 'self'
					method1 : \#this.$(*I)[0] + this.$(*I)[1];
					method2 : \"hello world {a}";
					defaultProperty : (4;5);
				);
				// '/exp' the exp is a prototype. The class function has 1 argument for this and combines the value of '#0' with the return value
				classPollyfill:\classPrototype:
					Self ref \data:{
						newObj:(*:classPrototype;*:data);
						newObj.$Self : newObj//'a:b' returns 'b' ; similar to 0xmin, cannot add properties with 'a.b=c' only with 'a.b:c'
					}
				;
				mergeObject:\##|>/##;
				instance:Class($*I:[2;3]);
				assert instance.method1() == Class;
				assert instance.$*I == [2;3];
				Car:/(displayNumber:\print,##);
				CarBody::(Window:\$$;Frame:\$$);
				myCar : Car(Wheel();CarBody());
			//lazy expressions
				//add a '`' for '`exp' to make an expression lazly evaluated
				//lazy expressions are only evaluated when a property or call action is applied to the lazy expression.
				//use 'exp`' to turn a lazy expression into a iterator
				y_combinator : \f:{\#x,x},\f(`#x,x);
				factorial : y_combinator,\#fact:\#n==0?1?|n*fact(n-1);
				//without lazy version
					factorial : fact ref \#n==0?&1?|n*fact(n-1);
				nextedLazyExpression : ``````5;
				lazyFullEvaluator:\lazy:{
					//(*):(lazy);
					lazyIter:!< {
						while lazy is Lazy =>
							!> lazy = lazy`;
						;
					};
					for
						print,
							in lazyIter;
					return lazy;
				}
				//idea: use 'param\exp' and '(params)\exp' instead of '\(params):exp'
			a:7;
			if 5 > a%10 > 0 => {//in Set:[1,4]
				print,"low:{a}";
			} else {
				print,"high:{a}";
			};
			//objects
				object:(a:;b:;c:);
				(a;b;c):object;
				newObject:(a;b;c);
				assert (a;b) == (a;a:a;b;b:b);
			//type syntax:
				//use '::' for type annotations
				//'key::type_exp' states the type of a key
				//'exp::type_exp' states the type of an expression
				number::Number:2;
				SomeStruct::\/(a;b;c);
			//public/private fields
				//similar to JS we can use '@' to denote private keys, and private blocks
				//if a block is private it limits it to the local 'mod' block
				object : mod {
					publicField:2;
					@privateField:3;
					privateField:4;
					assert @privateField != privateField;
					(publicValue;@privateValue);
				};
				//using symbols instead
				object:{
					publicKey:$$;
					$publicKey:2;
					($publicKey);
				};
			//function arguments
				//variables declared inside function arguments 'foo( ... )' are used as named arguments
			//blocks
				{};exp;//is the same as
				{} exp;//do not need a semi-colon after '{}' brackets
			//references '&short_exp'
				//assignment clones an object by default
				//'&object' can be used to take a reference to one
				obj:(1;2;3);
				obj[3] = obj;//clones obj, and assigns it to obj[3] ; this prevents circular references
				assert obj[3] = (1;2;3);
				assert obj = (1;2;(1;2;3));
				obj[3] = &obj;
				//'&' references are not cloned
			//idea: can use '#' aswell as '##' for unnamed parameters
			//idea: can use '@' instead of '#@', 'for in [1,2]=>#@'
			//idea: to turn this into a strongly typed language:
				//use 'short_exp::type_short_exp' to annotate expressions or variables
				//can also use '#key:type_short_exp' for parameters
					//in Rust only function parameters need to be typed
			//idea: allow '#' instead of '##', '#label' now requires no spaces inbetween '#' and 'label'
			//idea: function syntax
				\a:b:c=a+b+c;
				//instead of 
				\(a;b;c)=a+b+c;
			//proposal: swap ';' and ',' ; ',' ends expressions, ';' is for fuction calls ; this was done for eugonomics with typing arrays []
			//examples:
				normalDistrabution:\##.>(0,\##+F.random);
				update:ref{$*:[];$Fn:\this.<};
				dt:1/60;
				game:{
					Bullet:/ref(
						coords:[0;0];
						velocity:[0;0];
						update:\
							coords.=,\##+velocity[##]*dt;
							objects.=,\##.coords.>(0;coords);
						;
					)
				}
				sum:\#.>,\#+#;
				sum=\a=a.>,\s:v=s+v;

//4.3:
	//note:
		//refer to version '4.5:testCode.lang3' for a more up to date features;
		//this document is however more organised than testCode.lang3
	//note: any mention of 'a:=b' pattern or 'value:Type' patterns are obsilete old syntax ; ':' is always declaration, '::' is type annotaions
	//design ideas:
		//quick to write
		//terse
		//reduce naming things
		//little to no typing
	//examples:
		//assignment
			a:2;
			b:c:3;
		//function
			foo:\#+#;
			functions:(
				\a=a;
				mul:\a:b=a*b;
				baz:\a:b:c=;
			);
			destructured_function:\();
			sum:\#.>0<:\#+#;
		//function calls
			a:\;b:\;c:\;d:\;foo:\;bar:\;//using these functions for examples ; `a:\` == `let a = ()=>undefined` in javascript
			foo(a;b;c);foo[a;b;c];
			a,b,c == a(b)(c);//pattern: `a,b` `short_exp,short_exp` ; but excludes `<|` and `|>` in the argument side
			a<|b<|c == a(b(c));//'<|' consumes big on the right
			a<|b|>c|>d == a(d(c(b)));
			a|>b<|c == b(a)(c);
			a|>b,c,d == b(a)(c)(d);
			a<|b,c,d == a(b(c)(d));
			
			a,b<:c == a(b;c);
			a<|b<:c == a(b;c);
			a,b|>c<:d == c(a(b);d);
			a,b<|c<:d == a(b(c;d));

	//patterns:
		//short_exp
			//block
				{exps}//returns the result of the last expression (similar to the Rust language)
				{=exp; exps}//the first exp is executed last; note: if it contains any '#lbl's then they will still will address the first parameters
				{:key_exp; exps} ; {:key_exp=exp;exps}//first declares 'key_exp'; then executes 'exps' and finally assigns 'exp' to the 'key_exp' (if where is an '=exp') and returns the value of'key_exp'
					//[TODO]:resolve if `=exp` is run at the start or end
				{::Type_exp; exps} //types annotates a block
				{::Type_exp:key_exp=exp; exps}//these patterns can be combined
					{:: Float : v += a+b; v="a"; a:"b"; b:"c"} == "abc"
					//is the same as
					{:: Float; v:; v="a"; a:"b"; b:"c"; v+=a+b} == "abc"
				//e.g.
					{:key_exp;exps} == {key_exp:;exps;key_exp};
					{:key_exp=exp;exps} == {key_exp:exp;exps;key_exp};
					assert {:vector;vector.x=2;vector.y=3;vector.z=4} == (x:2;y:3;z:4);
			//array
				[exps]
				//same syntax as struct (exps) except:
					key_exp:exp;//adds both an indexed item and an associated named property
			//struct
				(exps)
				//containing patterns:
					(
						key_exp:exp;//property
						@key_exp:exp;//private property ; can be referenced with '@key_exp'
						value_exp;//tuple-like item
					)
				//value_exp: expressions add to the tuple part.
					exp
				//declaration_exp: declaration and assignment expressions add fields to the struct part.
					key_exp:exp
				//note: new properties can only be added to local objects, obeying module encapsulation/scoping rules.
					//otherwise for local objects: doing 'a.b' will add 'b' to its struct (aka its class)
			//destructure_keys_exp:
				key_exp
				{keys}
				[keys]
				(keys)
			//key_exp
				key//a name
				$key// symbol ; uses a value as a key ; 'key' references a existing value 
				${exp}
				$(exp) ; $[exp] //evaluates types where `[a;b] == [a;b]` ; equality isn't done by reference
				//property_exp
					short_exp.key//similar to javascript 'a.b = c' mutates 'a'
					short_exp
					short_exp[exps]//returns item using index
					short_exp{exps}//function call: list of args
			//primitive literals
				"string"
				r#"
					multi
					line string
				"#//same as "multi\nline string";
				r###""###;//need equal amounts of '###'s
				123//number literal
				123_456_789//can space out digits with '_'
				0xDEAF//hexidecinal
				0b10100//binary
				0o24//octal
				2.3//float
				0x2.4F64//rust-like number typing
				true false//boolean literal
			//types ; the type system
				//primitives
					N Number Float Fixed Int

					I I8 I16 I32 I64 I128
					U U8 U16 U32 U64 U128
					F F8 F16 F32 F64 F128
					Fx Fx8 Fx16 Fx32 Fx64 Fx128//Fixed
					S String
					C Char
					B B8 B16 B32 B64 B128//BoolSet
					E E8 E16 E32 E64 E128//Enum
					Ec8 Ec16 Ec32 Ec64 Ec128//EnumCase
					Bc8 Bc16 Ec32 Bc64 Bc128//BoolSetCase
				//objects
					Array{T;L} ; [...] ; L*T ; *T //array of T's of length 'L'
					Vector ; V*T //where: V:Vector, T:Type
					Struct(...) ; (...) //list of key type pairs + tuple items
					Fn{T;[...]} ; Fn->T ; Fn[...]->T ; \T ; \(...):=T //function that takes in parameters 'P' and returns a 'T' ; P is must be a bracket literal
					Enum(...) ; ^(...) ;  //if proceeded by a 'short_short_exp' then it matches to the "enum case" pattern '^short_short_exp.key' ; note: this syntax is a compremise since we would prefer `case operator enum` syntax.
					EnumCase //stored as only an Int, item from an enum
					BoolSet(...) ; |(...)//array of booleans ; can me matched against like an enum but multiple cases will run instead of just 1, similar to Enum
					BoolSetCase
					//e.g.
						Compound_type1_multi_inheritence ::= $$($*:Int;$*:String);
						Compound_type2_traits ::= $$($Int:;$String:);
						Compound_type3_tuple ::= $$(Int;String);
						Compound_type4_JSON_object ::= $$(int:Int;string:String);
						Colours ::Enum= ^(
							Red;//same as ';'
							Green;
							Blue:$$;//makes blue a unique unit type ; enum varients can have types just like rust
							Grey:^(Light;_;Dark);
							Black = 8;//can assign values as well as types to enums
						);
						Settings :: BoolSet = |(//can be used as an array of Option types
							A;
							B;
							C;
							D:Float;
						);
						enumCaseObject :Enum= ^().;
				//

					Index{T;A}  //A[T] ; index to a 'T' on object of type 'A'
					Item{T;O}  //
				//
					Any
					Undefined
					Unit
				//meta types
					Type{T}
					Symbol{T}  $$//key to a type T
				//Type cannot be overwriten, all the basic types are properties of 'Type'
		//exp
			short_exp
			//declaration/assignment
				//general_declaration_or_assignment
					short_exp:exp//declaration + assignment
					short_exp: ;//declaration
					short_exp=exp//assignment
				key:value
				key=value
				$key : value//symbol declaration
				$key = value//symbol assignment
				//symbols injection ; '$:' '' ; injects symbols of
					$:exp
					@:exp//private symbols of
					$=exp//auto_assignment ;
					//e.g.
						foo:(a:2;b:3);
						($:foo) == (a:2;b:3);
				//hoisting
					key:*
				a.b=c//assigns property similar to Javascript {mutating referenced object 'a'} ; if key 'b' is not on 'a's type and 'a's struct is local, then it is added to the struct and object.
					//auto adding properties cannot be done, if the object's type is well defined, or if the object's type is private to this scope.
				a.b:c//
				{exps}.key = exp
				destructure:exp
				destructure=exp
				//destructure:
					short_exp //'a.b.c = exp' == 'c = {exp}.a.b.c'
					key:new_variable
					(destructures)
					[destructures]
					//destructures:
						destructure
						destructures destructure
					//note: can be recursive, e.g. [a;[b;(c;d)]] = [1;[2;(c=3;d=4)]];
					//e.g.
						\(obj):(
							(a;[b;x.y.z=(c;w=d)]) : obj;
							//or can also put in types
							(a;[b;x.y.z:(c:;w:)=(c;w=d)]) : (a:;[_;(x:(y:(z:(c:;w:(d)))))]) = obj;
						);
				//declaring types
					key::type_exp:exp;
					key::type_exp=exp;
					//e.g.
						i :: Int = 0;
			//alternate block expression typing ; TODO: decide wheather to keep this syntax
				{ ... }::short_type_exp;//for asserting types for parts of expressions
					//e.g.
					print{"1 + 2 = " + {::Float; 1 + 2}::Float¬.$String}:{};
			//function:
				\exp
				\function_params:exp
				//typing
					\::type=exp
					\::type=function_params:exp
				//function_param:
					{destructures}
					(destructures)
					destructures
					key
				//function_params:
					function_param
					function_param # function_param # function_param etc...

				//e.g.
					\a:a*2;
					\a#b#c:a+b+c;
				//named parameters (aka public parameters since the parameter symbols are public)
					//can put '@' behind a parameter key to allow for named arguments
					//e.g.
						\(a;b)=a+b;
						\(a:Int;b:Int):Int=a+b;
						foo:=\(@a;@b)=a+b;
						foo(a=2;b=3);
						bar:=\[@#a;##];
						assert bar(a:=2;3) == [3;2];
					//public arguments can only be accessed
					//REVISION:
						//using 'key#' for named parameters
						//using 'key# exp' for named arguments
						foo:=\a#+b#;
						foo:=\(a#:F;$F):F=a+$F;
						foo(2;a#2);
						//note: in '#name' '#@name' 'etc...' parameter patterns there cannot be a space between the '#' and the name. this makes ( 'a #a' --> error ) different from ( 'a# a' --> uses named argument)
							//'a#b' == 'a# b'
			//extra control flow '?' 'break' 'return'
				return exp;
				break exp;
				continue exp;
				exp?//ealy return ; same as `return exp`
				exp?#@//breaks from the nearest owner of `#@`
					//can break from for,
					exp?key_exp//breaks to the owner of the scope where the 'key_exp' was declared
				exp?!//returns if null or error value
			//enum
				Enum (
					String;
				);
				^(exps)//enum
				^(exps).key//case
				Enum
			//modules 'mod'
				mod exp
				//the types inside a module can be infered.
				//types must be defined by the end of statically parsing a module.
				//variables within a module are considered "local"
				//keys cannot be added to external objects, only internal ones.
				//the global scope is considered a module
			//public '@'
				//makes the 'short_short_exp' accessable to the parent 'mod' module
				@short_short_exp
				//e.g.
					@key : type = exp ;
					//
					@( ... ) ;//public object ; '@' makes all keys inside brackets recursively public
					@[ ... ] ;//
					@{ ... } ;//public object
					@\ ... ;//public function ; the type of this function is public
				//e.g.
					obj := mod{
						newObject := (
							@publicProperty := \print,"accessable by parent module";
							privateProperty := \print,"accessable only inside this module";
						)//does not end in ';' so 'obj' is returned by the '{}' block
					};
					obj.privateProperty,;
			//references 'ref'
				ref exp
				//creates a lazy expression for the end value of ref
					//may error if the self reference is referenced before it is clear what it refers to.
						ref print,#@ //is NOT ok
						ref \print,#@ //is ok
				//can use '#@' to reference the refed object
				cyclic_object := ref(#@);
				assert cyclic_object.0 == cyclic_object;
			//operators
				exp+exp//can use any infix operator
				!short_exp//prefix operator
				exp > exp < exp //chainable comparison operators e.g. 'x<y<z' --> 'x<y && y<z'
				exp == exp == exp //chainable equality operators e.g. 'x == y == z' --> 'x==y && y==z'
				{exp == exp} == exp //have to use other methods to get traditional equaliting bool expression
					a:{::bool;exp == exp};
				//operators
					//infix
						+ - * / ** %% % //float note: 'a%%b' is for log i.e. {log_b{a}} == 'log{a}/log{b}'
						& | ~ ^ << >> >>>//bitewise
						&& || ^^ ~~
						== != >= <= //note: these operators can be chained for '4 > x >= 2' expressions
					//prefix operators
						! ++ -- + -
				key += exp
				key :+= exp
				key :: type : += exp
				//type casting '>:'
					exp >: short_short_type_exp
					//'a >: T' is equivelant to 'a.into::<T>()' from Rust, where as 'a.$T' is more like 'a as T' from Rust
					//In general 'a.$T' should be used for converting types, 
					//e.g.
					a := 45:<Int;
						ascii_code :U8= "a"U8;
				//call assign with operator operators '>>='
					key >>= foo_exp//same as 'key = foo_exp{key}'
			//'¬'
				exp ¬ exp
				exp ¬ .short_exp
				//consumes all of the exp on the left
				//same as in 0xmin
				assert {\##+##¬{2;3}*2} == {{\##+##}{2;3}*2};
			//ternary operator '?&' + '?|'
				//functions the same as a for loop
				condition_exp ?& then_exp ?| otherwise_exp //"and then" "or else"
				then_exp &? condition_exp ?| otherwise_exp
			//"todo" macro
				...
			//type_exp:
				type_short_exp
				type_exp * type_exp // array 'size * type' == Array{$Int:size;$Type::type}
				type_exp + type_exp //compound objects ; similar to combining traits in Rust.
				$$ type_short_exp
				//type_short_exp:
					{type_exps}//block
					(type_exps)//struct
					[type_exps]//array
					\normal_exp//enters normal typeing ; this is done since types are functions
			//params_exp:
				//parameter_exp:
					key
					key:type
					key=default
					key:=default
					key:type=default
				//parameters_exps:
					parameter_exp
					parameters_exps;parameter_exp
				parameter_exp
				{parameters_exps}
			//keyword expressions:
				//general
					keyword body_exp
					keyword > exp = body_exp
					keyword > = body_exp
					keyword >= body_exp//can use '>=', less than or equal to symbol, the same way as '> =' pattern
					keyword exp => body_exp
					//can also use '=>' instead of '>='
					#@//can use '#@' keyword's parameter declarations
				//if expression
					if condition_exp => then_exp else otherwise_exp
					//condition_exp:
						//normal exp with special pattern for Rusts 'if let'-like expression
						key:type=obj
						:type=obj //inner value can then be reverenced with '#?' or '#?name'
						//can do 'if let T{inner} = obj (inner)'
							obj := Option.Some(2);
							if (inner) : Option.Some = obj => print,inner else inner;
							if (inner) : .Some = obj =>
								print,inner
							else inner;
							@* = Option;
							if obj : Some => print,#?inner else assert #?inner is Option.None;
							if null != null => print,"some value:\""+#?+"\"";
					//ternary 
				//
					//can use '#@key' in these expressions
					//keywords:
						for do in
						match
						while
					while exp => exp
					for exp do exp => exp
						for => exp
						for exp => exp ; for starting => body;
						in iterable_exp
						do exp
					match exp => match_exp
					//for loops
						//for loops:
						in iterable_exp //takes in an iterable object and returns each value from it, per loop in a for loop
							//a 'for' loop runs as long as at least 1 unfinished iterator in one of it's 'in' expressions
						key in iterable_exp //syntax sugar for 'key := iterable_exp'
						start_exp do next_exp while condition_exp => body_exp //a triditional for loop.
							//runs 'start_exp' once. Then checks 'condision_exp' 'body_exp' with 'next_exp' at the end of each loop.
							//has 2 parameters:
								//'#?key': for the unwrapped value from condition_exp, works same as the 'if's '#?'.
								//'#@key': for the value of the variable declared in 'start_exp', if no variable was declared then 'start_exp's value will be assigned to the '#@' value.
							//note that unlike for loops in some other languages, the 'i++' part is written before the condision.
								//this design choice is done since the 'next_exp' code is userally simpler than the 'condision_exp' code.
					//e.g.
						for in [1;2;3] => print,#@v; 
						for v : in [1;2;3] => print,v; 
						for v in [1;2;3] => print,v; 
						for print,in [1;2;3];//'for condision_exp => body_exp' or 'for body_exp'
						for{v : in[1;2;3]; print,v};//
						i : 0 do i++ while i < 10 => print,[1;2;3][i];
						0 do #@i++ while i < 10 => print,[1;2;3][i];
						for i : 0 in i++ while i < 10
						match Option.Some{3} => (
							Option.Some => print{#@};
							Option.None => print{"none"};
						);
						//note can use syntax-sugar '.key' instead of 'EnumType.key' in match statements and when a type can be infered
						match Option.Some{3} => (
							.Some => print{#@};
							.None => print{"none"};
						);
						a : 2;
						match a => [
							{assert #@ == a == 0;print,"a == 0"};
							print,"a == 1";
						];
				//
					iter yeild//used for iterators, similar to Javascript
					async await//async
					!< !>
					!> //can be used as 'yeild' or 'await' depending on smallest context
						//'!> exp' returns the first argument to the "resolve" function
						//'!>' contains a '#@' argument for the 'next' function that, when called continues the async/iter function.
							//if the 'next' function is called before the 'exp' in '!> exp' finishes then it will not yeild a '(value:;next:)' object and will just continue the function with the resolved result.
							//if the 'next' function is not called an await block will return a '(value;next)' pair
					!>* iterable_exp //same as 'yeild* exp' in javascript ; it joins the inner async/iterator ; same as 'for !> in iterable_exp'
					!< //'!< exp' ; same as 'async' ; a '!>' (aka 'await') breaks out of the nearest '!<' block
				//
					if else

				//
					defer
						//defers the running of a statement till the end of its block
						//similar to the '(:=exp; )' pattern ; 'blocks' include statements like 'if' 'for', functions (i.e. '\'), brackets '()', etc...
				//assertions:
					assert assert_condision_exp;
					assert assert_condision_exp => exp;
					//assert_condision_exp:
						exp
						exp is type_exp//returns true the type of 'exp' equals 'type_exp'
						exp is//returns true if all property parts of 'exp' involve existing keys; can be used for checking keys on objects
					//e.g.
						assert exp is type_exp;
						assert exp == exp;
						assert exp.$type_exp is;
					exp is exp;
					//exp's in assert expressions can use 'is' keyword to compair types
					assume exp => exp;
				//error handling
					try exp
						//returns an Result that can be detected with 'if else' or '?&' statements
					try exp else catch_exp
					try exp => finally_exp else catch_exp
					try exp ?& finally_exp ?| catch_exp
					try exp ?| catch_exp
				//importing files
					import short_exp:type_exp;
					use.short_exp//imports module
					//note: importing the same file twice will NOT create 2 separate sets of keys.
					//TODO: work out how running modules would work as well
					//uses rust-like file including
					//main_folder
						//main_folder/module1
						//main_folder/module2
						//main_folder/module3
					main_folder := mod (
						module1 := mod (...);
						module2 := mod (...);
						module3 := mod (...);
					);
					//e.g.
						//main_file
							use mod.folder1.module_2 as 

						//folder1
							//module 2
				//
		//exps
			//list of expressions sepparated by ';'
			exp
			exps;exp
//4.4:
	//patterns/systems:
		//keyword patterns:
			//all keyword patterns are treated as expressions
			//because of this, keywords cannot be used in variable names
			//general forms:
				//e.g.
				keyword1 exp1 keyword2 exp2_1 => exp2_2 keyword3 exp3;
			keyword exp => exp;//'=>' design note: cannot have double expressions next to eachother so 2 argument infix keyword expressions use '=>' inbetween them
			if condition_exp => then_exp;
			if condition_exp => then_exp else otherwise_exp;
			for  exp
			for key in exp => exp
		//'#param' inbuilt parameter/variable references
			//parameters
				//function:
					## or #name or # //function parameter
					#.. //array of the rest of the arguments in a function
				#? or #?name//if statement's argument
				#@ or #@name//miscilanious parameter ; some other controll blocks use this parameter
				//'#@' and '#@name' always gets the next '#@' parameter so '(#@;#@)' refers to 2 different parameters
					a:10;
					b:();
					if a=>if b=>(#?;#?)
			#/ or #/name //Self reference class
			#\ or #\name //self reference function
			
			{.}//'.' returns the nearest `(...)` scope or class instance `/(...)`
			//'.key' returns the property of the nearest object/(class instance) scope `(...)` / `/(...)`
			a:ref(
				assert {.} == #@
			);
		//'\' functions:
			\exp;
			\a:exp;//single argument
			//multi argument
				\(a;b;c):exp;
				\a#b#c:exp;
			\(a;(b;c);[d;e]):exp;//destructuring
			\ a=exp # b=exp # c=exp : exp;
			\$Foo # $bar://note that in this context (of the start parameters section of a function) the '#'s act more like separators between parameters
			//arguments can be declared later with '#key' pattern
		//'/' classes:
			/()
		//references '&':
			exp&; //allows returning assignable values from functions
			&key_exp:exp;//variable that is linked to another variable ; the linked variable

			//can be used to assign to whole variables and link 2 variables together.
			//objects are passed by value and are cloned up to any '&' references.
			//e.g.
				a:(1;2);
				b:a;//clones 'a' up to any '&' properties ; TODO: add cloning syntax
				//TODO: fix this example
				&c:a;
				assert a == b == (1;2);//performs contence equality;
				a.0 = 11;
				assert a != b;//a and b are not linked
				assert a != b;//a and b are not linked
			//e.g.
				a:2;
				foo:\a&;
				foo, = 4;//references allow for this
				assert a == 4;
				obj:(b:2);
				foo:\#.b&;
				assert obj.b == 2;
				foo,obj += 10;
				assert obj.b == 12;
			//e.g.
				a:2
			//refs do not stack i.e. cannot have '&&a'
				a&&
				//is the same as
				a&
		//pattern matching:
			//declaration expressions either return the new variables, a struct of the new variables or null. 
			Bar:/;
			bar1 : {Bar(a):obj};
			//is the same as
			a:;
			bar1:{
				temp_obj : Bar(a&:a&);
				obj_as_bar : temp_obj as Bar;
				(a:obj_as_bar.a)
			};


			([a;b];Bar(_;c)):obj;
		//'£' for voiding expressions
			£exp
				//use £ for embedding expressions that do not return and that do not affect the surrounding syntax
			//TODO: work out how it's syntax tree precedence works
			//e.g.
				if a == 2 =>
					foo,
				£print("a is "+a)//getting the value of 'a' inbetween if-else expressions
				else if a < 10 =>
					bar,
				else
					baz,
				;
		//'*' wild card symbol
			//reflection:
				short_exp.$*//returns a list of all properties&symbols of 'short_exp' as key-value pairs
			
			//e.g.
				$* = (a:2;b:3;4);//ext
				assert a==2 && b==3
				//same as 
				(a;b;:c)=(a:2;b:3;4);//[TODO]:check if this syntaax
			
			@* = (@a:2;@b:3;4);//gets public keys
		//array properties
			//'.=' map
				[1;2;3].=\#value*2//map
				//same as
				[1;2;3].=,\#value*2//the ',' is optional and the function call can be implied without it
				//optimisation note: a resulting array is not created if the result is not consumed by anything e.g. as a non-last expression in '{...}', '£'
			//'.<' repeat
				evens : 5.<\#index*2
				assert evens == [0;2;4;6;8]
			//'.>' reduce
				start_value:4
				[1;2;3].>start_value<:\#sum+#value//starts with sum == start_value, and value == 1st item
				[1;2;3].>\#sum+#value//starts with sum == 1st item, and value == 2nd item
//4.4.1: docs rewrite
	//design philosophy:
		//terse short code
		//unnamed paradigm: reduced naming things
			//one of the 2 hardest things in programming is naming things
		//dry:
			//reduced need to repeat names
		//weakly typed
		//C-like ; uncaring of tab indentation
	//patterns:
		//note:
			//using `A__B` for labeled pattern types e.g. `A__exp` is of type `exp`
		//short_exp
			//block
				{exps}//returns the last expression ; (similar to in Rust)
				{::type_exp:short_exp=final__exp;exps}//declared
				{:short_exp;exps}//declares `short_exp` and returns `short_exp` at the end 
				{=exp;exps}//evaluates `exp` last and returns it's result
			//array
				[exps]
				//e.g.
					[1;2;3]
					[a:1;b:2;3;4;c:5;6]
			//struct/tuple
				(struct_exps)
				//e.g.
					(a:2;b:4;c:6;1;2;3)
					(a.b.c == 2)
				//special patterns:
					//declaration pattern used for adding properties to struct
		//exp
	//misc:
		//`#.operator_symbol` cannot have a space between the `#.` and the `operator_symbol`
		\#.< \# + 1;//`a.<,foo `
		\#. < 5;//`a < b`
//4.5 testCode.lang3
	//testCode.lang3
	//idea: can use '#' aswell as '##'
	//idea: `a.$*` ; reflection pattern ; gets all keys in object as a sort of list ; `a.$*.=` maps only accessable keys
	//idea: `#..` returns rest of arguments in a function
		//TODO: consider using `#$*` and `#@*` instead
	//idea: `#..` or `#..label` for all arguments of function`
	//idea: `args..` to inject all symbols into function arguments
	//idea: `$$` = unique symbol ; `$$mod` = unique to the module ; `$$$` = static unique symbol
	//$short_short_exp for referenceing a symbol, userally the name of a type
	//multi named parameter function pattern:
		\ a : exp;
		\a#b#c: exp;//can put spaces between all '#'s ; using '#' to be more ergonomic
		\foo#bar#baz: exp;
	//idea: arrays are like objects but all properties are indexed in arrays
		assert [11;22;a:33][2] == 33;
		assert [11;22;a:33].2 == 33;//can use rust-like tuple indexing aswell
	//idea: references: use `&(a) = v` for referencing values allowing them to be assignable
		obj:(a:2);
		assert obj.a == 2;
		&(a) : obj;
		a = 4;
		assert obj.a == 4;
		b = 1;
		&b_ref : b;
		b_ref = 4;
		assert b == 4;
		//can also return a reference
			(get_reference_to_i;print_i):(
				get_reference_to_i:\&i;
				print_i:\print(i);
				i:;
			);
			get_reference_to_i, = 10;
			print_i,//10
		foo:{a:\a&};//can use postfix form aswell for referencing
		foo, = 2;
		assert foo, == 2;
	//idea: type annotations :
		//a::T ; {::T; exps };
		//a:T=v ???

		//also allows calling type methods on objects without
		//'a:T:value'
	//idea: `a1.=a2<:a3<:foo` map function map(array1,array2,...,mapping_function:Fn(Item<array1>,Item<array2>,...)-> )
		print<|[1;2;3].=["A";"B";"C"]<:\##+##;//["1A";"2B";"3C"]
	//idea: `array1.>array2<:array3<:start_value<:{reduce_function:\s:v1:v2:v3:s+v1+v2+v3};`
		//if reduce function has more than 2 args then the first args become arrays
	//idea: '#/' '#\'
		#/ ; //idea: use '#/' to reference 'This' the class of an object
		#\ ; //use '#\' to refer to the function itself
			function_that_returns_itself:\#\;
			//note functions are always unique so an object with a function is always unique to that function/closure
		//idea: use '#' for variables that are unique to each object instance, and can add default values
			Vec2 : /(
				#x:0;//only adds 'x' to object instances
				#y:0;
				length:\{x**2+y**2}**0.5
			);
		/(
			#a:2;
			print_add:\{
				#this;
				#other;
				assert this == #.;
				assert this.a == #.a;
				assert this.a& === #.a&;
				print(#.a + other.a);
			};
		);
	//idea: if tuple contains one item it can be treated at it's item
		assert 3>2>1;
		assert (1) == 1 != [1];
		assert 1 != (a:1);
	//idea: '.name' pattern ; infered parent object
		//can be used for keyword property names
			//
		{
			a:2;
			(
				.a:4;
				£assert a == 2;//exp_a £ exp_b === exp_a
			)
		};
	//idea: ref patterns
		ref => exp;
		ref exp;
		ref name => exp;//name:key
	//idea: inheritance/traits
		A:/;
		B:/;
		AB:/(./.$A:;./.$B:;foo:\11;bar:\22;#baz:);
		AB:/A+B+(foo:\11;bar:\22;#baz:);


		A:/;
		B:/;
		AB:/(./.$A;./.$B);
		AB:/A+B+();
	//idea:
		rng;//random function; "random number generator" ; generates a number in range 0 <= x < 1
		assert 2.rng, == rng, * 2;
	//idea: number.= for return last value
		assert {3.=\#i} == 2;
		number.=\index#length:{
			assert number == length,
			assert index < length,
		};
	//idea: auto named parameters
	//idea: '::=' instead of 'is'
	type:$$;
	class_polyfill:\prototype:
		ref \data:{
			#@Self;
			self:;
			protoTypeInstance:prototype.$*.=,\method:\method,self<:..#..;
			prototypeInstances:(prototype);//can contain the prototypes for multiple classes
				//each prototype contain
			prototypes:[prototype];
			self=ref(
				& $* : protoTypeInstance;//injects all of protoTypeInstances
				& $* : prototypeInstances.>,()<:\#sum.+=#value;//injects rest of references
				$* : data;
				.\ = Self;
				./ = prototypes;//stores all the base properties can be accessed by the class
			)
		}
	;
	A:ref class_polyfill,\ref(//note: the parameters '#@' of the 'ref's can be lazilly evaluated to allow for this ; will through an error if 'self' is read before definision
		self:#@;
		Self:#@;
		foo:\#.a;
		bar:\#.num + 5;
	);
	A:/(;
		:#@self;//using parameter pattern '#@' to refer to an instance of the class. '#%' comes from the '/exp'.
		:#/Self;//using parameter pattern '#/' for refering to class
		foo:\#.a;
		bar:\#.num + 5;
	);
	B:/(
		print_self:\#|>print;
		add:\#.num + #;
	);
	add:\#+#;
	struct:/();
	struct(
		a:1;
		b:2;
		c:3;
		foo:\#s.a+s.b;
	);
	/()(
		a:1;
		b:2;
		c:3;
		foo:\#.a+b;
	);
	//idea: '*:exp'
		a:(a:2;b:3;c:[1;2];"abc";"123");
		*:a;
		assert (a;b) == (2;3);
	//idea: `short_exp.=short_exp` --> `short_exp.=,short_exp`
	//idea: clone with depth function
		clone:\object::(...):depth::Int:
			object.=\item:...
		;
	{//using RS for Rust and JS for Javascript ; JS: {
		Input:*;//RS: let Input = Input;//Input refers to the last definision of Input ; in this case from a higher namespace
		player: (//JS: let player = {
			pos: [x:0; y:0];//vec2 ; JS: pos:[0,0], //or pos:{"0":0,"1":0,get x(){return this[0]},get y(){return this[1]}}
			health : 100;//JS: health:100
		);//JS: };
		player.onUpdate= \{//RS: fn onUpdate(self){
			&*: ##;//RS: let Player{mut pos,mut health,mut onUpdate} = &mut self;
			move_vec: get_movement_vec,;//RS: let move_vec = get_movement_vec();
			moved_pos: pos.= move_vec<: \##+##;//JS: let moved_pos = this.pos.map((v,i)=>v+move_vec[i]);
			pos = !walls[..pos] ?& move_vec ?| pos;//RS: *pos = if !(walls[pos[1]][pos[0]] != 0) {move_vec} else {*pos};
		};//RS: };
		walls:[//1 for wall ; JS: let wall = [
			[0;0;0;0;0;0;0;0;0;0];//JS: [0,0,0,0,0,0,0,0,0,0],
			[0;0;0;0;0;0;0;1;1;1];//JS: [0,0,0,0,0,0,0,1,1,1],
			[1;1;0;1;1;1;0;0;0;0];//JS: [1,1,0,1,1,1,0,0,0,0],
			[0;0;0;0;1;0;0;0;0;0];//JS: [0,0,0,0,1,0,0,0,0,0],
			[0;0;0;0;0;0;0;0;0;0];//JS: [0,0,0,0,0,0,0,0,0,0],
			[0;0;0;1;1;1;0;1;1;0];//JS: [0,0,0,1,1,1,0,1,1,0],
			[1;1;0;1;0;0;0;0;1;0];//JS: [1,1,0,1,0,0,0,0,1,0],
			[0;0;0;1;0;0;0;0;1;0];//JS: [0,0,0,1,0,0,0,0,1,0],
			[0;0;0;1;0;0;0;0;1;0];//JS: [0,0,0,1,0,0,0,0,1,0],
			[0;0;0;1;0;0;0;0;1;0];//JS: [0,0,0,1,0,0,0,0,1,0],
		];//JS: ];
		get_movement_vec: {//RS: let get_movement_vec = {
			= //JS:let returned_expression = ()=>
				\{//:vec2 ; JS: ||{
					*: input_data.get_input, ;//JS: let {up,down,right,left} = get_input;
					[up - down; right - left]//JS: return [up - down, right - left]
				}//JS: }
			;//JS: ;
			keydata: (//JS: let keydata = {
				up: "w";   //JS: up: "w",
				down: "s"; //JS: down: "s",
				right: "d";//JS: right: "d",
				left: "a"; //JS: left: "a",
			);//JS: };
			get_input : \{: input_data;//JS: let get_input = ()=> {let input_data;
				key : Input.getKeyDown;//JS: let key = Input.getKeyDown;
				i : input_data;//JS: let i = input_data;
				i.up = key,"w";//JS: i.up = key("w");
				i.left = key,"a";//JS: i.left = key("a");
				i.down = key,"s";//JS: i.down = key("s");
				i.right = key,"d";//JS: i.right = key("d");
			};//JS: return input_data};
		};//RS: returned_expression()};
	};//JS: };
	{
		a:mod (
			*:@(//'@' makes all public keys private (i.e. belong to the 'mod')
				a:1;
				b:2;
				c:3;
			);
			get_a:\a;
			mut_a:\a&;//idea: use postfix aswell of prefix operators for `a&` `a!` etc... uses postfix by default
			get_b:\b;
			get_c:\c;
		);
		a.get_a,;
		a.mut_a, = 2;
		assert a.a == undefined == {};
	};
	{
		normal:\##.>0<:\##+1.random,;
		LinkedList:/();
	};
	{
		concat:\#.+ #;
		map:\#.= #;
		reduce:\#.> #;
		splice:\#.- ##..# <: #..;
		shift:\#.- 0..#;
		unshift:\#.- , <: 0..#;
		slice:\#[##..#];
		TypedEnum:/(
			//item
		);
		Option:TypedEnum(
			Some:/();
			None:$$;
		);
		a:Option.Some(4);
		b:Option.None;
		if a as Option.Some => print("is some value {#?}")
		else assert #? == Option.None;
		if b as Option.Some => print("is some value {#?}")
		else assert #? == Option.None;
	};
	{
		Agent:/(// players/enemies
			agents:[];
			#health:0;//health is assigned to 0 before assigning the input struct/tuple
			#pos:[x:0;y:0];
			#size:10;
			get_has_collition:\{
				dist:{
					a.pos.>#b.pos <:0 <:\#s + #v.0**2+v.1**2//convention: (s=sum,v=values,i=index,a=array)
				}**0.5;
				dist < #a.size+#b.size
			};
		)\{//can add a '\' to do something with a object after it is defined
			assert #this.agents == #/.agents;
			this.agents.+[this];
			has_collition:this.agents.filter,\
				this.get_has_collition,#agent
			;
			if has_collition => null?;//using '?' for early return of 'null'
		};
	};



	//idea:
		//can use '#{}' or '#()' for declaring things to the local '{}' or '()' scope respectively
		{(#{a}= 2;)} --> {a:;(a=2);()};
	//
	{//idea: pattern matching
		//all finals function calls in declarations count as pattern matching 
			{
				a:4;
				f:\[;;;;\(#;10)][#];
				f(a)(new_value):f(a)(2);
				assert new_value == (2;10);
			};
		Foo:/;
		a:(1;(b));
		if (a:_;(b:value)):(a:1;(b:2)) => {
			assert value == 2;
		}
		else {
			;
		};
		string:"aabbabbaasd";
		if string.match,r"(\w)\1" {//r for regex
			print,"match{#@}";
		}
		Result:ref(Ok:/($match:#@self);Err:/);
		result:Result.Ok,;
		(Ok;Err):Result;
		assert !!{.Ok:result};
		assert !{.Err:result};
		assert !{Err:result};//does not do pattern matching
		if Result.Ok:result =>
			print,"{result}"
		;
		match result {
			.Ok(value) => value;//'.Ok' is syntax sugar for 'result.$match.Ok'; using '.Name' where the root object 'Result' is infered by the type of 'result' 
			Result.Err(err) => err?;
		};
	};
	{
		100.<\{#a%3||"fizz"}+{a%5||"buzz"}||""+a;
		100.<\a:{a%3||"fizz"}+{a%5||"buzz"}||""+a;
		print,{1..=100}.<\
			{#a%3||"fizz"}
			+{a%5||"buzz"}
			||""+a
		;
		//inbuilt special traits:
			$null;//null-like value
				//is treated as 0
					assert +($null:) == 0;
				//is returned by 'short_exp?!' pattern
					assert {\($null:5)?! ¬()}.$null == 5;
			//conversions
		Result: /(
			Ok: /($Enum:#/);
			Err:/($Enum:#/;$null:);
		);
		Result:^(Ok;Err:($null:));//using a more rust form of results
		Err:/(&$null:);
		{
			;
		};
	};

	parentModle:module;
	Object_polyfill:\ref(
		:parentModle;
		traits:(
			$parentModle:#objectData;
		);
		dotOperator:\propertyName:
			traits.$*.>undefined<:\out#value:
				out ||
				#key==propertyName?&
					null||value
		;
	);

	{
		sort:\
			#ints
		;
		normal_distribution:\{a:#.<\:0;#.=\a[#.>0<:\#+rng,]++};
	}; 
	mod signal_polyfill : {
		signal_emit:\message:#recievers.=\#,message;
		//let signal_emit = (message,recievers)=>recievers.map((a)=>a(message));
		signal:(
			signals:[]
		);
	};


	{//idea: '.#key_exp' or '.@$'
		//'.#key_exp' is similar to '.$key_exp' except all properties of 'key_exp' are accessable publicly {like javascript prototypes}
		FooSymbol::Symbol:();
		BarSymbol::Symbol:();
		obj:(
			$FooSymbol:(name:"foo");
			$BarSymbol:(name:"bar");
		);&
		assert obj.$* == [FooSymbol;BarSymbol];
		assert !obj.name;
		obj:(
			#FooSymbol:(name:"foo");
			$BarSymbol:(name:"bar");
		);
		assert obj.name == foo == obj.$FooSymbol.foo;
	};
	{//idea 'statement exp => exp' <-- 'statement exp exp' ; for statements that always have 2 parts
		exp:;
		if 1==1 print,1;
		while exp exp;
		match exp {};
	};
	a.b.c.d.e.f;
	(a.b:2):(a:(b:2));
	{::T:a=exp;};
	foo::T:bar;
	(a:p1;p2;:a);
	//designs made due to development of the language interpreter
	{//references update:
		a:2;
		b:&a;//linking variables ; same as `Any &a = &b;` in C
		b = 4;
		assert a==b;
	};
	{//destructuring update:
		//array destructuring can be used on tuples or arrays and is the only way of indexed items from an object via destructuring.
		(a;b) : object;
		//is the same as
		(a:a;b:b) : object;
		//is the same as
		a:object.a;
		b:object.b;

		[a;b;:c] : object;//array destructuring
		a:object[0];
		b:object[1];
		c:object.c;
	};
	$$;//static symbol
	getSymbol:\$$;
	assert getSymbol, == getSymbol,;
	{//`a&?b|?c`
		//use `|?` instead of `?|`
			//reasons:
				//- `|?` cannot be confused with postfix ealy-returning operator `exp?`
				//- is more consistant with  `|?`+`#?` where `?` goes second
				//- is may be faster to type since can start typing a `||` but decide to switch to a `|?`
	}