export function parseIntoOperatorSyntaxTree_function(
	{
		todo,
		unimplemented,
		loga,
		logData,
		match,
		pass,
		assert,
		assume,
		forBailOld,
		forBailGenerator,
		matchFlags,
		printTree,
		EnumSymbols,
		SyntaxTree,
		WordSymbol,
		silentError
	}
){
	//proceedence:
		class OperatorData{
			constructor(data={}){Object.assign(this,data)}
			static AfixType = SyntaxTree.AfixType;
			//static infix = Symbol("'a&&b'");//default
			//static infixOrPrefix = Symbol("'a+b' or '+a'");//is prefix but will be ignored if there is an infix option
			//static prefix = Symbol("'!a'");
			//static postfix = Symbol("'a++'");
			//static nofix = Symbol("'(+)'");
			static left = 0;//:Symbol("param ->")
			static right = 1;//:Symbol("<- param")
			afix;//:u2 & bool[2] & []OperatorData & infix|postfix|prefix|nofix;
			proceedence:Number[2];//for left and right args
			numOfArgs;//:number
			isInverseBracketing;//:bool
			includes;//:string[] ; used for 'if' for 'if condision then else exp' -> `if[condision,then,else[exp]]`
			noRecursion;//:bool ; used to prevent 'let let let a' -> `let[let[let,a]]`, instead having `let[],let[],let[a]`
			//TODO: will later contain data about how to compile each of the operators
		}
		class OperatorProceedence{
			prefix?:OperatorData;
			infix?:OperatorData;
			postfix?:OperatorData;
		}
		type item<T extends (any[]|[{[any]:any}])> = T extends (infer I)[] ? I : never;
		type Afix = _enum&(nofix|prefix|infix|postfix);
		//assume: '!x' is a prefix operator
		let maxProceedence:Number;
		function intoOperatorProceedence(dataObj){
			maxProceedence = dataObj.length - 1;
			let operators = {};
			dataObj.forEach((proceedenceOpers,i)=>{//adds the rest of the poperties to the OperatorData objects
				Object.keys(proceedenceOpers).forEach((v:String)=>{//operator:OperatorData
					let operatorDataList:OperatorData[] = proceedenceOpers[v];
					if(!(operatorDataList instanceof Array))operatorDataList = [operatorDataList];
					for(let operatorData:OperatorData of operatorDataList){
						operatorData = new OperatorData(operatorData);//convert raw object into OperatorData
						v = v.match(/[^\x00]+/)[0];
						operatorData.proceedence = [undefined,undefined];
						let parameter:Option<Bool[2]> = operatorData.parameter;
						operators[v]??={prefix:null,infix:null,postfix:null,nofix:null};//:OperatorProceedence
						if(operatorData.afix == OperatorData.AfixType.prefix){
							operatorData = (operators[v].prefix ??= operatorData);
							operatorData.numOfArgs ??= 1;
						}
						else if(operatorData.afix == OperatorData.AfixType.infix){
							operatorData = (operators[v].infix ??= operatorData);
							operatorData.numOfArgs ??= 2;
						}
						else if(operatorData.afix == OperatorData.AfixType.postfix){
							operatorData = (operators[v].postfix ??= operatorData);
							operatorData.numOfArgs ??= 1;
						}
						else if(operatorData.afix == OperatorData.AfixType.nofix){
							operatorData = (operators[v].nofix ??= operatorData);
							operatorData.numOfArgs ??= 0;
						}
						if(parameter != undefined)operatorData.proceedence[parameter] = i;
						else {
							operatorData.proceedence[0] ??= operatorData.afix & OperatorData.AfixType.operatorWithLeftArg ? i : 0;
							operatorData.proceedence[1] ??= operatorData.afix & OperatorData.AfixType.operatorWithRightArg ? i : 0;
						};
					}
				})
			});
			return operators;
		}
		const operatorProceedence = //:Object & Map(string->{prefix:OperatorData?,infix:OperatorData?,postfix:OperatorData?})
			//optionalArg:[is_left_arg_optional:bool,is_right_arg_optional:bool];
			intoOperatorProceedence([//:{[string]:OperatorData}[] ; note: '\x00's are ignored to allow for duplicate entries with the same preceedence
				{
					"..."     :{afix:OperatorData.AfixType.nofix},
					"!!!"     :{afix:OperatorData.AfixType.nofix},
					"$$"      :{afix:OperatorData.AfixType.nofix},
					"$"       :{afix:OperatorData.AfixType.nofix},
					"#"       :{afix:OperatorData.AfixType.nofix,useIfNextWordCanHaveLeftArgument:true},
					"##"      :{afix:OperatorData.AfixType.nofix,useIfNextWordCanHaveLeftArgument:true},
					"#@"      :{afix:OperatorData.AfixType.nofix,useIfNextWordCanHaveLeftArgument:true},
					"#?"      :{afix:OperatorData.AfixType.nofix,useIfNextWordCanHaveLeftArgument:true},
					"#!"      :{afix:OperatorData.AfixType.nofix,useIfNextWordCanHaveLeftArgument:true},
					"#."      :{afix:OperatorData.AfixType.nofix,useIfNextWordCanHaveLeftArgument:true},
					"#/"      :{afix:OperatorData.AfixType.nofix,useIfNextWordCanHaveLeftArgument:true},
					"#\\"     :{afix:OperatorData.AfixType.nofix,useIfNextWordCanHaveLeftArgument:true},
					"#.."     :{afix:OperatorData.AfixType.nofix,useIfNextWordCanHaveLeftArgument:true},
					":"       :{afix:OperatorData.AfixType.nofix},
					"::"      :{afix:OperatorData.AfixType.nofix},
					"{"       :{afix:OperatorData.AfixType.nofix},
				},
				{//consumes a key_exp
					"$"       :{afix:OperatorData.AfixType.prefix},
					"#"       :{afix:OperatorData.AfixType.prefix,optionalArg:[0,1]},
					"#@"      :{afix:OperatorData.AfixType.prefix},
					"#?"      :{afix:OperatorData.AfixType.prefix},
					"#!"      :{afix:OperatorData.AfixType.prefix},
					"#."      :{afix:OperatorData.AfixType.prefix},
					"#/"      :{afix:OperatorData.AfixType.prefix},
					"#\\"     :{afix:OperatorData.AfixType.prefix},
					"#.."     :{afix:OperatorData.AfixType.prefix},
				},
				{
					"."       :{afix:OperatorData.AfixType.infix,optionalArg:[1,0]},
					"?."      :{afix:OperatorData.AfixType.infix,optionalArg:[1,0]},//same as in javascript's `option?.property`
				},
				{
					"("       :{afix:OperatorData.AfixType.postfix},
					"["       :{afix:OperatorData.AfixType.postfix},
					"`"       :{afix:OperatorData.AfixType.postfix},//early return
					"."       :{afix:OperatorData.AfixType.infix,parameter:OperatorData.left},
					"?."      :{afix:OperatorData.AfixType.infix,parameter:OperatorData.left},//same as in javascript's `option?.property`
				},
				{
					","       :{afix:OperatorData.AfixType.infix,optionalArg:[0,1],isInverseBracketing:true},
					",\x00"   :{afix:OperatorData.AfixType.postfix,useIfNextWordCanHaveLeftArgument:true},
					":>"      :{afix:OperatorData.AfixType.infix},
					"<:"      :{afix:OperatorData.AfixType.infix},
					"|>"      :{afix:OperatorData.AfixType.infix},
					"<|"      :{afix:OperatorData.AfixType.infix,isInverseBracketing:true},//'a<|(b<|c)`
				},
				{
					":"       :[//using an array `[{...}, {...}]` here is the same as `":" : ...` + `":\x00" : ...`
						{afix:OperatorData.AfixType.infix,parameter:OperatorData.left,optionalArg:[0,1],prefixIgnorePreceedence:true},
						{afix:OperatorData.AfixType.postfix,optionalArg:[0,1]},//'a:;' for declaration ; same as 'a:();'
					],
					"::"      :{afix:OperatorData.AfixType.infix,parameter:OperatorData.left,optionalArg:[0,1],prefixIgnorePreceedence:true},
					"::\x00"  :{afix:OperatorData.AfixType.postfix,parameter:OperatorData.left,optionalArg:[0,1]},
					"£"       :[
						{afix:OperatorData.AfixType.prefix},
						{afix:OperatorData.AfixType.infix,optionalArg:[1,0]}
					],//isInverseBracketing is false for: 'a £b £c' --> '(a £b) £c' <--> 'a £{b;c}'
				},
				{
					"="       :{afix:OperatorData.AfixType.infix,parameter:OperatorData.left,isInverseBracketing:true,prefixIgnorePreceedence:true},//isInverseBracketing does: 'a=b=c' --> 'a=(b=c)'
					"=\x00"   :{afix:OperatorData.AfixType.postfix,parameter:OperatorData.left,isInverseBracketing:true},
				},
				{
					"!"       :{afix:OperatorData.AfixType.prefix},
					"+"       :{afix:OperatorData.AfixType.prefix},//:to number
					"-"       :{afix:OperatorData.AfixType.prefix},//:to negative number
					"~"       :{afix:OperatorData.AfixType.prefix},//:not
					"*"       :{afix:OperatorData.AfixType.prefix},//:array type 
					"^"       :{afix:OperatorData.AfixType.prefix},//:enum type
					"|"       :{afix:OperatorData.AfixType.prefix},//:boolean set type
					"&"       :{afix:OperatorData.AfixType.prefix},//:reference type ; this type is not implemented since this is a high-level langauge
					"++"      :{afix:OperatorData.AfixType.prefix},
					"--"      :{afix:OperatorData.AfixType.prefix},
				},
				{
					"!"       :{afix:OperatorData.AfixType.postfix},//:logical not
					"+"       :{afix:OperatorData.AfixType.postfix},//:to number
					"-"       :{afix:OperatorData.AfixType.postfix},//:to negative number
					"~"       :{afix:OperatorData.AfixType.postfix},//:not
					"*"       :{afix:OperatorData.AfixType.postfix},//:array type 
					"^"       :{afix:OperatorData.AfixType.postfix},//:enum type
					"|"       :{afix:OperatorData.AfixType.postfix},//:boolean set type
					"&"       :{afix:OperatorData.AfixType.postfix},//:reference type ; this type is not implemented since this is a high-level langauge

					"?!"      :[{afix:OperatorData.AfixType.infix},{afix:OperatorData.AfixType.postfix}],//ealy return error/null
					"?"       :[{afix:OperatorData.AfixType.infix},{afix:OperatorData.AfixType.postfix}],//ealy return

					"++"      :{afix:OperatorData.AfixType.postfix},
					"--"      :{afix:OperatorData.AfixType.postfix},
				},
				{
					".."      :[{afix:OperatorData.AfixType.infix},{afix:OperatorData.AfixType.prefix}],
					"..="     :{afix:OperatorData.AfixType.infix},
				},
				{
					"in"      :{afix:OperatorData.AfixType.infix},
					"$*"      :{afix:OperatorData.AfixType.prefix},
					"@*"      :{afix:OperatorData.AfixType.prefix},
					"!@*"     :{afix:OperatorData.AfixType.prefix},
				},
				{
					"**"      :{afix:OperatorData.AfixType.infix},//pow
					"%%"      :{afix:OperatorData.AfixType.infix},//log
				},
				{
					"*"       :{afix:OperatorData.AfixType.infix,optionalArg:[1,1]},
					"/"       :{afix:OperatorData.AfixType.infix},
				},
				{
					"+"       :{afix:OperatorData.AfixType.infix},
					"-"       :{afix:OperatorData.AfixType.infix},
				},
				{
					"%"       :{afix:OperatorData.AfixType.infix},
					"%%%"     :{afix:OperatorData.AfixType.infix},//positive modulo operator
				},
				{
					"&"       :{afix:OperatorData.AfixType.infix},
					"^"       :{afix:OperatorData.AfixType.infix},
					"~"       :{afix:OperatorData.AfixType.infix},
				},
				{
					">>"      :{afix:OperatorData.AfixType.infix},
					"<<"      :{afix:OperatorData.AfixType.infix},
					">>>"     :{afix:OperatorData.AfixType.infix},
				},
				{
					"|"       :{afix:OperatorData.AfixType.infix},
				},
				{
					"=="      :{afix:OperatorData.AfixType.infix},
					"!="      :{afix:OperatorData.AfixType.infix},
					"==="     :{afix:OperatorData.AfixType.infix},
					"!=="     :{afix:OperatorData.AfixType.infix},
					">="      :{afix:OperatorData.AfixType.infix},
					"<="      :{afix:OperatorData.AfixType.infix},
					">"       :{afix:OperatorData.AfixType.infix},
					"<"       :{afix:OperatorData.AfixType.infix},
				},
				{
					"&&"      :{afix:OperatorData.AfixType.infix},
					"||"      :{afix:OperatorData.AfixType.infix},
					"^^"      :{afix:OperatorData.AfixType.infix},
					"~~"      :{afix:OperatorData.AfixType.infix},
					"is"      :{afix:OperatorData.AfixType.infix},
					"as"      :{afix:OperatorData.AfixType.infix},
				},
				{
					"?&"      :{afix:OperatorData.AfixType.infix},//ternary operator
					"&?"      :{afix:OperatorData.AfixType.infix},//ternary operator
					"|?"      :{afix:OperatorData.AfixType.infix},//ternary operator
				},
				{
					":"       :{afix:OperatorData.AfixType.infix,optionalArg:[0,1]},//variable declarator and type operator
					":\x00"   :{afix:OperatorData.AfixType.prefix},//variable declarator and type operator
					"::"      :{afix:OperatorData.AfixType.infix,optionalArg:[0,1]},//variable declarator and type operator
					"::\x00"  :{afix:OperatorData.AfixType.prefix},//variable declarator and type operator
				},
				{
					"=>"      :{afix:OperatorData.AfixType.infix,optionalArg:[1,0]},
					"if"      :{afix:OperatorData.AfixType.prefix,includes:["=>"]},
				},
				{
					"="       :{afix:OperatorData.AfixType.infix,isInverseBracketing:true},//'a=(b=c)' instead of '(a=b)=c'
					"=\x00"   :{afix:OperatorData.AfixType.prefix,isInverseBracketing:true},//'a=(b=c)' instead of '(a=b)=c'
					"\\"      :{afix:OperatorData.AfixType.prefix,optionalArg:[0,1]},//function
					"/"       :{afix:OperatorData.AfixType.prefix,optionalArg:[0,1]},//class
					"`"       :{afix:OperatorData.AfixType.prefix},
					"else"    :{afix:OperatorData.AfixType.infix,parameter:OperatorData.right},//'if' else, 'if', 'while', 'match', 'for'
					"match"   :{afix:OperatorData.AfixType.prefix},
					"do"      :{afix:OperatorData.AfixType.infix,includes:["while"]},//'while _ => _' or '_ do _ while _ => _'
					"while"   :{afix:OperatorData.AfixType.prefix,includes:["=>"]},//'while _ => _' or '_ do _ while _ => _'
					"for"     :{afix:OperatorData.AfixType.prefix,includes:["=>"]},
					"do"      :{afix:OperatorData.AfixType.infix,includes:["while"]},//'_ do _'
					"try"     :{afix:OperatorData.AfixType.prefix,includes:["=>"]},// 'try exp => finally_exp else catch_exp' returns Result type
					"break"   :{afix:OperatorData.AfixType.prefix,optionalArg:[0,1]},//TODO: replace optionalArg:[0,1] with `true`
					"continue":{afix:OperatorData.AfixType.prefix,optionalArg:[0,1]},
					"return"  :{afix:OperatorData.AfixType.prefix,optionalArg:[0,1]},
					"assert"  :{afix:OperatorData.AfixType.prefix},
					"async"   :{afix:OperatorData.AfixType.prefix},
					"await"   :{afix:OperatorData.AfixType.prefix},
					"$$"      :{afix:OperatorData.AfixType.prefix},//'\$${a=2;b=3}' '$$:=2' ; unique symbol
					"@"       :{afix:OperatorData.AfixType.prefix},
					"!<"      :{afix:OperatorData.AfixType.prefix},
					"!>"      :{afix:OperatorData.AfixType.prefix},
					"mod"     :{afix:OperatorData.AfixType.prefix},
					"ref"     :{afix:OperatorData.AfixType.prefix},
				},
				{
					"¬":{afix:OperatorData.AfixType.postfix},
				},
			])
		;
		const operatorProceedence_type = operatorProceedence;//for T_exp in 'a : T_exp'
	//----
	interface NumberLiteralType{
		value:Number|Number[],
		//base:2|8|10|16,
		size:(null&unknown&_default)|8|16|32|64|128|size,
		type:(int&_default)|uint|float,
	}
	class Expression{
		constructor(wordSymbol,data={}){
			this.wordSymbol=wordSymbol;
			this.proceedence = wordSymbol?.proceedence;
			this.afix = wordSymbol?.afix;
			Object.assign(this,data);
		}
		toString(){return this.wordSymbol.word}
		toTree():Tree<Expression>[]{return this.contence??this.args??[]}
		//wordSymbol;//:WordSymbol?
		possibleAfix:Expression.AfixType&u2 = 0b11;
		afix:Expression.AfixType&u2;
		isReverseOrder;//`£` in `a + £x b` ; evaluates the 2nd argument first but still returns the 1st argument
		static defaultProceedence = 0;
		static AfixType = SyntaxTree.AfixType;
		static Value = class Value extends Expression {//for 'a:>b|>foo,c<:d' ; value literal constant
			//contence:Expression[]
			//value:String|Bool|Number|Number[2] ; //TODO: define NumberLiteralType
			//impl NumberLiteralType for This
			constructor(data={}){super();Object.assign(this,data)}
			afix
			toString(){
				return this.wordSymbol.word;
			}
			static new_computeValue(wordSymbol):Expression.Value{
				return new Expression.Value({
					wordSymbol,
					...wordSymbol.value!==undefined?{value:wordSymbol.value}:match(wordSymbol.subtype,[
						[[
							SyntaxTree.subtype.string,
							SyntaxTree.subtype.formatString,
							SyntaxTree.subtype.number
						],()=>assert.impossible("handled ealier by WordSymbol generater")],
						[[SyntaxTree.subtype.bool],()=>({
							value:match(wordSymbol.word,[["true",()=>true],["false",()=>false]]),
						})],
						[[SyntaxTree.subtype.null],()=>({value:null})],
						[[SyntaxTree.subtype.undefined],()=>({value:undefined})],
					],)
				});
			}
		}
		static Label = class Label extends Expression {//for 'a:>b|>foo,c<:d'
			//contence:Expression[]
		}
		static Operator = class Operator extends Expression {//for 'a:>b|>foo,c<:d'
			//proceedence:Number[2] ; //is `[left,right]` ; some operators like 'key=value' have difference left/right proceedence
			args:Expression[2] = [undefined,undefined]; //[foo,bar] in 'foo+bar'
			//operatorData;
			toString(){
				return (this.leftArgExp ? " " + this.leftArgExp : "") + this.wordSymbol + (this.rightArgExp ? " " + this.rightArgExp : "");
			}
		}
		static Bracket = class Bracket extends Expression {//for 'a:>b|>foo,c<:d'
			//super.contence:Expression[] ; note: using 'super.___' for properties used from parent class
			//super.wordSymbol?:WordSymbol;
			args:Expression[1] = [undefined];
			signitureExp?:Expression = null;
			toTree():Tree<Expression>[]{return this.contence}
			toString(){
				return this.wordSymbol + " " + this.contence + " " + this.wordSymbol.endBracket;
			}
		}
		static KeywordBlock = class KeywordBlock extends Expression {//for 'a:>b|>foo,c<:d'
			//arg1Exp:Expression;
			//arg2Exp:Expression;
			toString(){
				return this.wordSymbol + (this.arg1Exp ? " " + this.arg1Exp : "") + (this.arg2Exp ? " " + this.arg2Exp : "");
			}
		}
		static FunctionCall = class FunctionCall extends Expression {//for 'a:>b|>foo,c<:d'
			//baseExp:Expression ; //foo in 'foo,arg'
			//argsExp:Expression[] ; //',arg' in 'foo,arg'
		}
	}
	type Expression_FunctionCall = Expression[];
	const contexts = {//()->WordSymbol
		expressions(startIndex,parent:WordSymbol):Expression[]{//:(Number,parent:WordSymbol&{contence:WordSymbol[]})->parent & mutate parent
			let words = parent.contence;//:WordSymbol[]
			let i = startIndex;
			let tryNext = forBailOld(words.length);
			let expressions = [];
			while(words && i < words.length){
				tryNext(()=>console.error("TEST:"+words+" "+words[i]+" "+i));
				if(words[i] == ";"){
					let exp = expressions[expressions.length-1];
					if(exp){exp.hasSepparator = true}//`exp;` ; used so `{a;}` == `null` but `{a}` == `a`
					if(!words[i-1]||words[i-1] == ";"){//inserts an null for `(a;) --> (a;null)` and `(a;;b) --> (a;null;b)`
						let word = words[i];
						word.afix = 0;
						word.type = SyntaxTree.type.value;
						word.subtype = SyntaxTree.subtype.null;
						expressions.push(new Expression.Value({wordSymbol:word,value:null}));
					}
					i++;continue;
				}
				let newExpressions:Option<Expression[]>;
				({index:i,newExpressions} = this.expression(i,parent));
				if(newExpressions !== undefined){
					assert(newExpressions !== null && newExpressions[0] instanceof Expression);
					expressions.push(...newExpressions);
				}
			}
			return expressions;
		},
		expression(startIndex,parent:WordSymbol):Expression{
			//note: NOT using shunting yard algorithm, since I found it overcomplicated and harder to reason about than looping through each preceedance
				//can reimplement faster algorithms if performance becomes an issue.
			if(startIndex>=parent.contence.length)return {index:startIndex,value:undefined};
			let words:WordSymbol[] = parent.contence;
			let i = startIndex;
			let word;
			let exps:Expression[] = [];
			let nextOperatorData:Option<OperatorData>;
			//TODO: write a GOOD system for assigning afixes to operators.
			//TODO: replace the `{[String]:OperatorData}` type with `OperatorData[4]&[[Afix]:OperatorData]`
			function isDeclarationPattern(wordSymbol1,wordSymbol2){//:bool ; matches ': =' and ':: ='
				return wordSymbol1?.subtype == SyntaxTree.subtype.declaration && wordSymbol2?.subtype == SyntaxTree.subtype.assignment;
			}
			function afixIntoOperatorData(possibleAfixes:{[_]:OperatorData},afix:AfixType&Number&bool[2]):OperatorData{
				assert(0b00 <= afix && afix <= 0b11);
				return [
					possibleAfixes.nofix,
					possibleAfixes.prefix,
					possibleAfixes.postfix,
					possibleAfixes.infix
				][afix];
			}
			{//generate syntaxTree ; contains lots of "special case" code
				const hasArg = word => !!word && word.word != ";";//BODGED: TODO: assign preceedences & afixes in the next, expression tree building, phase.
				function isCanHaveLeftArgument(i,isBracket=false):u2&AfixType{
					return !(
						!hasArg(words[i-1]) ||
						isBracket && words[i-1]?.subtype == SyntaxTree.subtype.operator ||
						words[i-1].type == SyntaxTree.type.operator
						&& exps[exps.length-1].afix & SyntaxTree.AfixType.operatorWithRightArg
					);
				}
				generate_exp_objects:for (; i < words.length && (word=words[i]) && word.word!=";";i++){
					let exp = match(word.type,[//:mutate current_expression & valueStack
						[[SyntaxTree.type.bracket],()=>
							match(word.word,[
								[["(","["],()=>new Expression.Bracket(word,{
									contence:contexts.expressions(0,word),
									operatorData:operatorProceedence[word.word].postfix,//non-functioncall brackets (e.g.`;();` instead of `foo()`) are handled as a special case later on.
									afix:isCanHaveLeftArgument(i,true)?
										Expression.AfixType.postfix:
										Expression.AfixType.nofix,
									knownAfix:false,
								})],
								["{",()=>new Expression.Bracket(word,{
									contence:contexts.expressions(0,word),
									afix:Expression.AfixType.nofix
								})],
							])
						],
						[[SyntaxTree.type.label],()=>
							new Expression.Label(word)
						],
						[[SyntaxTree.type.value],()=>
							Expression.Value.new_computeValue(word)
						],
						[[SyntaxTree.type.operator],()=>{
							let possibleAfixes:{[_]:OperatorData} = operatorProceedence[word.word];
							assert(!!possibleAfixes,`unhandled case for operator '${word.word}' in \`operatorProceedence\``);
							if(
								word.subtype2 == SyntaxTree.subtype2.dot
								&& words[i+1]?.type == SyntaxTree.type.operator && words[i+1]?.word != "$"
								&& !(word.word == "#." && words[i+1].isAfterWhiteSpace)//'#.<' --> '{#.}."<"' ; `#. <` --> '{#.} <'
							){//for patterns like 'array.=(mapFunction)' ; converts into label ; 'a.$name' is an exception
								let propertyWord:WordSymbol = words[i+1];
								propertyWord.type = SyntaxTree.type.label;
								propertyWord.subtype = SyntaxTree.subtype.operator;
							}
							let num = !!possibleAfixes.prefix + !!possibleAfixes.infix + !!possibleAfixes.postfix + !!possibleAfixes.nofix;//number of afixs
							let exp = new Expression.Operator(word,{});
							let operatorData;
							const isAssignableOperator = /[+\-*/&|^~&%]|[&|^]{2}|\*\*/;//operators that can be used in '+='
							if(word.word.match(isAssignableOperator) && ":=".includes(words[i+1]) && !words[i+1].isAfterWhiteSpace){//'+' '=' --> '+='
								words[i+1].subWord = word;
								word.operatorData = possibleAfixes.infix;
								return null;//skip this word '+='
							}
							let possibleAfix:u2&Bool[2] = 0b11;//:u2&[has_left_arg,has_right_arg]
							if([SyntaxTree.subtype.assignment,SyntaxTree.subtype.declaration].includes(word.subtype)){//handles ':' and '='
								let isStart = i == 0 || "\\".includes(words[i-1].word);// '{=' or '\:' ; no left argument
								if(isStart){
									possibleAfix &= ~SyntaxTree.AfixType.operatorWithLeftArg;
								}
								const nextWordmustHaveLeftArg = words[i+1]?.type == SyntaxTree.type.operator && (operatorProceedence[words[i+1]].postfix||operatorProceedence[words[i+1]].infix) && !(operatorProceedence[words[i+1]].prefix||operatorProceedence[words[i+1]].nofix)
								if(nextWordmustHaveLeftArg){
									possibleAfix &= ~SyntaxTree.AfixType.operatorWithRightArg;		
								}
								operatorData = afixIntoOperatorData(possibleAfixes,possibleAfix);
								assert(operatorData,`'${exps}'`);
								//note: ':' and '=' does not need a right argument; 
							}
							else get_afix:{
								if(num == 1){
									operatorData = possibleAfixes.infix ?? possibleAfixes.prefix ?? possibleAfixes.postfix ?? possibleAfixes.nofix;
									assert(!!operatorData);
									break get_afix;
								}
								if(!isCanHaveLeftArgument(i))possibleAfix &= ~SyntaxTree.AfixType.operatorWithLeftArg;
								if(//checks for right argument ; '+b' / 'a+b'
									!hasArg(words[i+1]) ||
									words[i+1]?.type == SyntaxTree.type.operator &&
									(//if words[i+1]'s left argument cannot be removed
										(possibleAfixes.nofix?.useIfNextWordCanHaveLeftArgument || possibleAfixes.postfix?.useIfNextWordCanHaveLeftArgument) && (
											operatorProceedence[words[i+1]].postfix || operatorProceedence[words[i+1]].infix
										)
										|| !operatorProceedence[words[i+1]].prefix && !operatorProceedence[words[i+1]].nofix &&
										operatorProceedence[words[i+1]].infix//assert: words[i+1] must have left arg afix other than infix so we cannot
										//ignores the nofix case here, nofix is userally for `(*)`

										//operatorProceedence[words[i+1]].infix &&
										//!operatorProceedence[words[i+1]].prefix
									)
								){
									possibleAfix &= ~SyntaxTree.AfixType.operatorWithRightArg;//note: preceedence doesn't matter for removing right arg here since a syntax error would be thrown if it's wrong either way
								}
								operatorData = afixIntoOperatorData(possibleAfixes,possibleAfix);//:OperatorData?
								{//special cases ; afix is not obvious works out which one to choose
									if(!operatorData){//assign afix based on afix priority
										operatorData = 
											possibleAfix == OperatorData.AfixType.operatorWithBothArgs?
												//e.g. 'i++' in 'i++ name' ; postfix takes priority over prefix
												possibleAfixes.postfix??possibleAfixes.prefix??possibleAfixes.nofix
											:possibleAfixes.prefix || possibleAfixes.postfix?undefined
											:possibleAfix == possibleAfixes.nofix? undefined
											:(
												assert([OperatorData.AfixType.operatorWithLeftArg,OperatorData.AfixType.operatorWithRightArg,OperatorData.AfixType.nofix].includes(possibleAfix),possibleAfix),
												undefined
											)
												
										;
									}
										
									if(!operatorData){//handle optional arguments
										//assume: only one operator from has optional arguments
										operatorData =
											(
												(possibleAfixes.infix?.optionalArg?.[0] || !!(possibleAfix&OperatorData.AfixType.operatorWithLeftArg)) &&
												(possibleAfixes.infix?.optionalArg?.[1] || !!(possibleAfix&OperatorData.AfixType.operatorWithRightArg))
											)?possibleAfixes.infix
											:(
												possibleAfixes.postfix?.optionalArg?.[1] || !!(possibleAfix&OperatorData.AfixType.operatorWithLeftArg)
											)?possibleAfixes.postfix
											:(
												possibleAfixes.prefix?.optionalArg?.[1] || !!(possibleAfix&OperatorData.AfixType.operatorWithRightArg)
											)?possibleAfixes.prefix
											:possibleAfixes.nofix
									}
								}
							}
							if(!operatorData)
								word.throwError("syntax", `cannot use operator in that pattern got pattern: \`${
										!!(possibleAfix&OperatorData.AfixType.operatorWithLeftArg)?words[i-1]:""//"A": ""
									} ${word} ${
										!!(possibleAfix&OperatorData.AfixType.operatorWithRightArg)?words[i+1]:""//"B": ""
									}\`. Expected \`${
										!!((possibleAfixes.infix??possibleAfixes.prefix??possibleAfixes.postfix??possibleAfixes.nofix).afix&OperatorData.AfixType.operatorWithLeftArg)?"A": ""
									} ${word} ${
										!!((possibleAfixes.infix??possibleAfixes.prefix??possibleAfixes.postfix??possibleAfixes.nofix).afix&OperatorData.AfixType.operatorWithRightArg)?"B": ""
									}\`.
								`,e=>Error(e))
							;
							exp.operatorData = operatorData;
							exp.afix = operatorData.afix;
							word.afix = operatorData.afix;
							return exp;
						}],
					]);
					if(exp)exps.push(exp);
					if(word.word == "{" && (
						!words[i+1] || 
						![SyntaxTree.type.bracket,SyntaxTree.type.operator].includes(words[i+1]?.type) ||
						!(operatorProceedence[words[i+1].word].infix || operatorProceedence[words[i+1].word].postfix) &&
						exps[exps.length-2]?.wordSymbol?.subtype2 != SyntaxTree.subtype2.operatorAllowsDoubleExp
					)){//do not need ';' for '{}'s
						i++;
						break;
					}
				}
				collect_arguments_into_tree:{//handles precedence
					function collectIntoTree(startIndex = 0,localMaxProceedence,exps,isTypeSyntax = false,isParameter = false):mutates<exps>{
						function isExpExcluded(i,alwaysAllowParameter = false){
							let exp = exps[i];
							if(!exp)return true;
							const excludeAssignmentOperator = isTypeSyntax;
							const excludeDeclarationOperator = isParameter||isTypeSyntax;
							const excludeParameterSeparator = isParameter;//'\a#b#c' '#' is parameter separator
							return !alwaysAllowParameter 
								&& (excludeParameterSeparator && 
									exp.wordSymbol == "#" &&
									!(
										exps[i-1]?.wordSymbol?.word == "\\"
										|| (exps[i-1]?.afix&Expression.AfixType.operatorWithRightArg)
										&& !exps[i-1]?.args?.[1]
									)
								)
								|| (excludeAssignmentOperator && exp.wordSymbol.subtype == SyntaxTree.subtype.assignment)
								|| (excludeDeclarationOperator && exp.wordSymbol.subtype == SyntaxTree.subtype.declaration)
							;
						}
						function isOptionalArgument(exp,j){
							return exp?.operatorData?.optionalArg?.[j] || exp?.wordSymbol?.subtype == SyntaxTree.subtype.declaration;
						}
						function missingOperatorError(selfExp,argExp,argIndex){
							if(1)console.error(printTree(exps));
								selfExp.wordSymbol.throwError("syntax",`${
									{"¬":"collection "}[selfExp.wordSymbol.word]??""
								}operator '${
									selfExp.wordSymbol
								}' missing ${
									["left", "right"][argIndex]
								} argument`,
							e=>Error(e));
						}
						function handleBracketAfix(exps,i){
							if(exps[i] instanceof Expression.Bracket && !exps[i].knownAfix){//handles `(...)` and `foo(...)`
								exps[i].knownAfix = true;
								if(!exps[i-1] || ((exps[i-1].afix & Expression.AfixType.operatorWithRightArg) && !exps[i-1].args[1])){
									delete exps[i].operatorData;
									exps[i].afix = Expression.AfixType.nofix;
									return true;
								}
								else exps[i].afix = Expression.AfixType.postfix;//`{}` --> nofix , `()` and `[]` --> postfix for `foo(...)` and `bar[...]`
							}
							return false;
						}
						function handleDotOperatorRightSideArgument(exps,i){
							let selfExp = exps[i];
							let argExp = selfExp.args[1];
							if(
								selfExp.wordSymbol.subtype2 == SyntaxTree.subtype2.dot//'a.=b' '#.=b'
								&& argExp.wordSymbol.type == SyntaxTree.type.label
								&& argExp.wordSymbol.subtype == SyntaxTree.subtype.operator
								&& !(exps[i+1] && exps[i+1].afix & Expression.AfixType.operatorWithLeftArg)
							){//'a.=b` == `a.=,b`
								selfExp.args[2] = exps.splice(i+1,1)[0];
							}
						}
						for(let i = startIndex; i < exps.length; i++){
							let exp = exps[i];
							if(isExpExcluded(i,false))break;
							if(handleBracketAfix(exps,i))continue;
							if(exp.wordSymbol.type != SyntaxTree.type.operator)continue;
							if(
								Expression.AfixType.prefix != exp.afix && !(Expression.AfixType.infix == exp.afix && exp.operatorData.prefixIgnorePreceedence)//TODO:add prefixLike
							)continue;
							if(exp.args[1])continue;
							function tryGetNewAddableArg():Result<Expression,Throw>{//may return an argument that can be pushed to the parent expression's exp.args
								let argExp = exps[i+1];
								let argProceendence = argExp?.operatorData?.proceedence?.[0] ?? Expression.defaultProceedence;
								if(!isOptionalArgument(exp,1) && (exp.operatorData.proceedence[1] < argProceendence || !argExp))
									missingOperatorError(exp,argExp,1);//:throws error
								exps.splice(i+1,1);
								return argExp;
							}
							if(exp.wordSymbol.word == "\\" || exp.wordSymbol.word == "/" && exp.afix == Expression.AfixType.prefix){//handle function parameter pattern `\exp#exp#exp:exp;`
								let args = [];
								exp.paramSeparators= [];//:Exp<"#">[]
								let hasParamEnder;
								exp.paramEnder = undefined;//Exp<":">?
								const i1 = i+1;
								for(let _ of forBailGenerator(exps.length-startIndex)){//TODO: add type pattern support '\::T=a#b:a+b'
									if(!exps[i1])break;
									{
										const parameterProceedence:int = operatorProceedence["="].infix.proceedence[1];//left side of `=`, i.e. `a` in `\a=2:` or `\a:`
										collectIntoTree(i1,parameterProceedence,exps,false,true);//collects all parameters into `#names`s
									}
									assert(!!exps[i1]);{
										const arg = exps.splice(i1,1)[0];
										if(!hasParamEnder && arg?.wordSymbol?.word == ":"){
											const functionBody = arg;
											hasParamEnder = true;
											exp.paramEnder = functionBody;
											break;
										}
										args.push(arg);
									}
									if(!exps[i1])break;
									if(exps[i1].wordSymbol.word == ":"){
										exp.paramEnder = exps.splice(i1,1)[0];
										hasParamEnder = true;
										break;
									}
									if(exps[i1] && exps[i1].wordSymbol.word == "#"){//'#' act like commas to separating parameters
										exp.paramSeparators.push(exps.splice(i1,1)[0]);
										continue;
									}
									break;
								}
								if(hasParamEnder){
									exp.paramEnder.args = args;
									collectIntoTree(i1,exp.operatorData.proceedence[1],exps,isTypeSyntax,false);
									exp.args = [exp.paramEnder,exps.splice(i1,1)[0]??undefined];
									continue;
								}
								else{
									if(args.length>1){
										exp.args = args;
										if(0)console.error(printTree(exps));
										exp.wordSymbol.throwError("syntax", "function missing ':' after argument list. Alternatively missing operator between '#'s. found pattern '\\a#b#c:'.",a=>Error(a));
									}
									assert(args.length <= 1);
									if(args.length == 1){
										exp.args[1] = args[0];//'\exp'
										continue;
									}
									else{assert(args.length == 0)
										args[0] = null;
									}
								}
								collectIntoTree(i1,exp.operatorData.proceedence[1],exps,isTypeSyntax,isParameter);
							}
							else if(exp.wordSymbol.word == "£"){
								collectIntoTree(i+1,exp.operatorData.proceedence[1],exps,false,false);
								exp.args[1] = exps.splice(i+1,1)[0];
								if(!exp.args[0] && !!exps[i+1]){//e.g. `a + £{...} b` --> `a+b`
									exp.args[0] = exps.splice(i+1,1)[0];
									exp.isReverseOrder = true;
								}
							}
							else if(exp.wordSymbol.word == "#" && !(//allows `#+b`--> `{#} + {b}` instead of `#{+b}` 
								exps[i+1].wordSymbol.type == SyntaxTree.type.label||
								["$","$$"].includes(exps[i+1].wordSymbol.word)
							))continue;
							else{
								collectIntoTree(i+1,exp.operatorData.proceedence[1],exps,exp.wordSymbol.subtype == SyntaxTree.subtype.typeAnnotation,isParameter);
								const argExp = tryGetNewAddableArg();
								exp.args[1] = argExp;
								if(exp.wordSymbol.subtype2 == SyntaxTree.subtype2.operatorAllowsDoubleExp && argExp && argExp.wordSymbol.word != "=>"){//allow for `if exp exp` --> `if exp => exp`
									collectIntoTree(i+1,exp.operatorData.proceedence[1],exps,exp.wordSymbol.subtype == SyntaxTree.subtype.typeAnnotation,isParameter);
									const argExp = tryGetNewAddableArg();
									exp.args[2] = argExp;
								}
								if(exp.wordSymbol.subtype2 == SyntaxTree.subtype2.operatorAllowsDoubleExp && exps[i+1]?.wordSymbol?.word == "else" && !exps[i+1].args[0]){
									const else_exp = exps[i+1];
									else_exp.args[0] = exps.splice(i,1)[0];//for e.g. `a+if exp=>exp else exp` --> `a+{if exp=>exp else exp}`
									collectIntoTree(i+1,else_exp.operatorData.proceedence[1],exps,else_exp.wordSymbol.subtype == SyntaxTree.subtype.typeAnnotation,isParameter);
									const argExp = tryGetNewAddableArg();
									else_exp.args[1] = argExp;
								}
								handleDotOperatorRightSideArgument(exps,i);
								if(exp.wordSymbol.word == "/" && exps[i+1]?.wordSymbol?.word == "\\"){//'/(...)\(...)' ; handle classes with constructor functions
									collectIntoTree(i+1,exp.operatorData.proceedence[1],exps,isTypeSyntax,isParameter);
									exp.args[2] = exps.splice(i+1,1)[0];
								}
								//note: do not `break;` here, the call to `collectIntoTree()` does not cover all `exps` ; consider removing this comment if 'collectIntoTree' was removed from this for loop
							}
						}
						for(let proceedence = 0; proceedence <= localMaxProceedence; proceedence++){
								function afixWrongArgumentError(exp):Never{
								exp.wordSymbol.throwError("syntax",`invalid argument pattern for operator '${exp.wordSymbol.word}'`,e=>Error(e));
							}
							function handleArgs(exps,i,proceedence):out<{i}> & mutates<exps,exps[i]>{
								let selfExp = exps[i];
								if(match(selfExp.constructor,[
									[[Expression.Operator,Expression.Bracket],()=>false],
									[[Expression.Label,Expression.Value],()=>true],
								])){return {i}};
								selfExp.operatorData.proceedence.forEach((argProceendence,j)=>{//for each argument ; note: j:0|1 ; is the index of the argument
									if(!(selfExp.operatorData.proceedence[0] == proceedence && selfExp.wordSymbol.subtype == SyntaxTree.subtype.declaration)){
										if(argProceendence != proceedence)return;
									}
									let argIndex = j * 2 - 1;//:Index<exps->Expression>
									let argExp = exps[i + argIndex];//:+1|-1
									let hasParam = !!(selfExp.afix & [Expression.AfixType.operatorWithLeftArg,Expression.AfixType.operatorWithRightArg][j]);
									let hasArg = !!selfExp.args[j];
									if(!hasParam || hasArg)return;
									assert(hasParam && !selfExp.args[j]);
									if(!argExp){//:return
										if(hasParam && !hasArg){
											if(j == 0 && (i == 0 && ":=".includes(selfExp.wordSymbol.word))){//for '(:=exp)' and '\=exp'
												selfExp.afix &= ~Expression.AfixType.operatorWithLeftArg;
											}
											else if(!isOptionalArgument(selfExp,j)) missingOperatorError(selfExp,argExp,j);
										}
										return;
									}
									else{
										const addArg = ()=>{
											selfExp.args[j] = argExp;
											exps.splice(i + argIndex,1);
											if(j == 0)i--;
										};
										{//handle special cases
											if(selfExp.wordSymbol.word == "::" && j == 1 && ":=".includes(argExp.wordSymbol.word)){// 'a::T+U:3' ; type syntax is only stopped by '=' or ':' ;
												//then ignore
												return;
											}
											if(":=".includes(selfExp.wordSymbol.word) && j == 0 && argExp.wordSymbol.word == "::"){
												addArg();
												return;
											}
											if(
												selfExp.wordSymbol.subtype == SyntaxTree.subtype.declaration//TODO
												|| (j == 1 && selfExp.afix == Expression.AfixType.prefix)//allow for '1+if a => 0'
											){//does both arguments of ':' before the '=' to allow 'a:T=b' --> '(a:T)=b' and prevent 'a:(T=b)'
												if(!selfExp.operatorData.prefixIgnorePreceedence)todo.silent("TODO:check if statement condition logic. test: may need to add `&&selfExp.operatorData.prefixIgnorePreceedence` to fix syntaxtree bugs ")
												collectIntoTree(i+1,selfExp.operatorData.proceedence[1],exps,false,isParameter);//:mutates owner object of item argExp
												argExp = exps[i + argIndex];//update
											}
											assert(argExp == exps[i + argIndex]);
										}
										if((argExp.operatorData?.proceedence?.[1-j] ?? Expression.defaultProceedence) + (!selfExp.operatorData.isInverseBracketing && j) <= argProceendence){
											addArg();
											if(j == 1)handleDotOperatorRightSideArgument(exps,i);
											return;
										}
										if(!isOptionalArgument(selfExp,j))missingOperatorError(selfExp,argExp,j);
									}
								});
								if(0)if(selfExp.operatorData.includes){//for `keyword_1 exp_1 keyword_2 exp_2` pattens e.g. `for (...) do (...)`
									let argExp = exps[i+1];
									if(selfExp.operatorData.includes?.includes(argExp?.wordSymbol?.word)){
										selfExp.args[2] = argExp;
										exps.splice(i+1,1);
									}
								}
								return {i};
							}
							let maxIndex;
							for(let i = startIndex; i < exps.length; i++){
								if(isExpExcluded(i))break;
								maxIndex = i;
								if(!exps[i].operatorData)continue;
								if(exps[i].operatorData.isInverseBracketing)continue;
								if(handleBracketAfix(exps,i))continue;
								({i} = handleArgs(exps,i,proceedence));
								maxIndex = i;
							}
							for(let i = maxIndex; i >= startIndex; i--){
								if(!exps[i].operatorData)continue;
								if(!exps[i].operatorData.isInverseBracketing)continue;
								({i} = handleArgs(exps,i,proceedence));
							}
						}
					}
					for(let i=0;i<exps.length;i++){
						if(exps[i] == "¬"){
							todo("redo '¬' code to handle multiple exps support")
							let expsSlice = exps.slice(0,i);
							collectIntoTree(0,maxProceedence,expsSlice);
							assert(expsSlice.length == 1);{
								exps[i].args[0] = expsSlice.pop();
							}
							exps.splice(0,i);
						}
					}
					if(exps.length>1)collectIntoTree(0,maxProceedence,exps);
				}
			}
			if(exps.length > 1){
				if(1)silentError("double expression",null,e=>Error(e));
				else {
					if(1)console.error(printTree(exps));
					let adjacentSides:Expression[2] = [exps[0],exps[1]].map((v,i)=>{
						let otherSide = 1 - i;
						let tryNext = forBailOld();
						//assume: v:finite Tree structure
						for(let _ of forBailGenerator(v.wordSymbol.errorData.file.words.length)){
							let nextExp = v.args?.[otherSide];
							if(!nextExp)break;
							v = nextExp;
						}
						return v;
					});
					adjacentSides[1].wordSymbol.throwError("syntax", `double expression. missing expression sepparator or operator. Expected previous '.', ';', or an operator. Found '${adjacentSides[0]}' and '${adjacentSides[1]}'`, e=>Error(e));//TODO: make this error identify the 2 adjacent wordSymbols
				}
			}
			return {index:i,newExpressions:exps};
		},
		parameter(startIndex,parent:Expression&{contence:Expression[]}){

		},
	};
	function parseOperatorSyntaxTree(rootPattern:RootPattern&WordSymbol):Expression[]{
		return contexts.expressions(0,rootPattern,rootPattern);
	}
	Object.assign(parseOperatorSyntaxTree,{
		OperatorData,
		operatorProceedence,
		Expression,
	});
	return parseOperatorSyntaxTree;
}