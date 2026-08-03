//TODO: work on 1634 `function getDeclarationFromAutoparameter` ; implementing '##' '#@' '#?' get parameters for '\', 'if', 'else' etc..
	//1263 build type class for the language's type system
//name suggetion: quad, (the Quick Unreadable And Dirty programming language)
//TODO: add code to support '::=' making '::' have the same syntax as ':'
const words_regex = /\/\*[\s\S]*?\*\/|\/\/.*|r(#+)"[\s\S]*?"\1|"(?:\\u....|\\x..|\\.|[^"\n])*?"|[\@\$\#]\*|(?:\?&|&\?|\?\|)|\.\.=?|\.\.\.|[|:]>|<[|:]|>:|::?|\\|(?:!<|!>)|!!!|=>|->|[><!=]=?|[+\-*%&|^~]{1,2}|#[#@?]|\${1,2}|[¬\\]|\s+|[\(\[\{]|[\)\]\}]|\b(?:0[box][_0-9A-Fa-f]+|[0-9_](?:\.(?:(?!\.)|(?:[0-9_]+)))?)\b|\.|\b\w+\b|\S/g;
{//old code OBSILETE
	function loga(...args){console.log(...args);}
	let code = getFile("testCode.lang3");
	class Debug{
		constructor(data={}){Object.assign(this,data);}
		index:Number;

	}
	interface Word {
		word:String,
		debug:Debug,
	};
	let words = [];
	for(let word of code.matchAll(words_regex)){

	}
	interface Context{
		a:2;
	}
	function parseModule(words,parentContext){
		parentContext
	}
}
function swapBrackets(){
	let code1 = code.split("");
	code.replaceAll(/[\(\)\{\}]/g,(v,i)=>code1[i]={"(":"{","{":"(",")":"}","}":")"}[v]);
	code = code1.join("");
	console.log(code)
}
//{//quality of life, macro-like functions
	function loga(...a){console.log(...a);return a[0]}
	function logData(...a){
		console.log(...a.map(v=>v.toLog?.()??v))
	}//log data emmits surtain information
	/**
	 * void let loga = [...a] -> void console.log <| ...a a<|0]
	 * void let logData = [...a] -> {void console.log[...a.map <| v->traitof v >= trait[toLog=\(void)]? v.toLog?.():v}
	 * void let debugMode = true
	 * void let assert = [condision msg ??= "" errorFunc ??= a->Error[e]] -> void:(
	 *   void 
	 * )
	 * */
	const debugMode = true;
	function assert(condision,msg = "",errorFunc = e=>Error(e)){
		if(debugMode){
			msg ??= "";//msg:String|()->String
			if(!condision)throw errorFunc("ASSERTION FAILLED:" + (typeof msg == "function"?msg():msg));
		}
	}
	function assume(condision,msg = "",errorFunc = e=>Error(e)):()=>any{
		if(debugMode){
			msg ??= "";
			if(!condision)throw errorFunc("ASSUMPTION FAILLED:" + msg);
		}
		return (fooUsingAssumption:Fn|any)=>typeof fooUsingAssumption == "function" ? fooUsingAssumption(condision) : fooUsingAssumption;
	}
	assert.fail = function(msg = undefined,errorFunc = e=>Error(e)){
		if(debugMode){
			msg ??= "impossible case found";
			assert(false,msg,errorFunc);
		}
	}
	assert.impossibleCase = function(msg = "",errorFunc = e=>Error(e)){
		if(debugMode){
			assert(false,"impossible case: " + msg,errorFunc);
		}
	}
	assert.expect = function(condision,msg = "",errorFunc = e=>Error(e)){
		if(debugMode){
			assert(condision,"expected: " + msg,errorFunc);
		}
	}
	function unimplemented(msg = "",errorFunc = e=>Error(e)){
		if(debugMode){
			throw errorFunc("UNIMPLEMENTED:" + msg);
		}
	}
	function todo(msg = "",errorFunc = e=>Error(e)){
		if(debugMode){
			throw errorFunc("TODO:" + msg);
		}
	}
	todo.flaggedErrors = {};
	todo.silent = function(name?:String,state?:Any,errorFunc = e=>Error(e)){
		todo.flaggedErrors[name] = {state,error:errorFunc};
	}
	function forBailOld(length,onError_default=undefined){
		//example: let n=forBailOld(array.length);while(true){n();}
		let i_bail = 0;
		return function next(onError=onError_default){
			if(debugMode)if(i_bail++>length){
				if(onError)onError(i_bail);
				throw Error("BAILED");
			}
		}
	}
	function* forBailGenerator(length,onError_default=undefined){
		//example: for(let _ of forBailGenerator(array.length)){...}
		for(let i = 0; i < length;i++)yield i;
		if(debugMode){
			if(onError_default)onError_default(i_bail);
			throw Error("BAILED");
		}
	}
	function match<V,T>(value:V,setOfCases:MatchCase[],defaultCase:(v)=>T):T{
		"use strict";
		//type MatchCase=[(V[]|V->bool), V->T]
		let i = -1;
		let _case:MatchCase;
		let tryNext = forBailOld(setOfCases.length);
		while(++i < setOfCases.length){
			tryNext();
			_case = setOfCases[i];
			if(typeof _case[1] != "function")throw Error("compiler syntax error: case "+i+" is missing `V->T`");
			if(
				typeof _case[0] == "function"?_case[0](value):
				_case[0] instanceof Array?_case[0].includes(value):
				(()=>{
					console.error(_case[0])
					throw Error("compiler syntax error: case " + i + " is missing `V[]|V->bool`");
				})()
			)return _case[1](value);
		}
		if(defaultCase)return defaultCase(value,setOfCases);
		else throw Error("compiler error: unhandled case: '"+value?.toString()+"'");
	}
	function matchFlags<F,T>(flags:F,setOfCases:MatchCase[],defaultCase:(v)=>T):T{//UNFINISHED
		"use strict";
		//where Flags:bool[]|(Number&uint)|{[Symbol]:any}
		type F = Flags;
		//type MatchCase=[(F|F->bool), F->T]
		let i = -1;
		let _case:MatchCase;
		let unhandledFlags = [];
		let tryNext = forBailOld(setOfCases.length);
		unimplemented("need to convert the code to match flags instead of cases");
		unimplemented("while loop should run all of the valid cases, unlike")
		//while(++i < setOfCases.length){
		//	tryNext();
		//	_case = setOfCases[i];
		//	if(typeof _case[1] != "function")throw Error("compiler syntax error: case "+i+" is missing `V->T`");
		//	if(
		//		typeof _case[0] == "function"?_case[0](flags):
		//		_case[0] instanceof Array?_case[0].includes(flags):
		//		(()=>{
		//			console.error(_case[0])
		//			throw Error("compiler syntax error: case " + i + " is missing `V[]|V->bool`");
		//		})()
		//	)return _case[1](flags);
		//}
		if(defaultCase)return defaultCase(flags,setOfCases);
		else throw Error("compiler error: unhandled flag: '"+unhandledFlags[0]?.toString()+"'");
	}
	function EnumSymbols(...list:String[]):{Symbol}{
		return Object.freeze(list.reduce((s,v)=>[s,s[v]=Symbol(v)][0],{}));
	}
	type Option<T> = T|null;
	function getFile(fileName):Option<String>{
		let file;
		try {
			file = Deno.readTextFileSync(fileName);
		} catch (err) {
			if (!(err instanceof Deno.errors.NotFound)) {
				throw err;
			}
			//Error("file does not exist");
			return null;
		}
		return file;
	}
	function getFile_expect(fileName,throwError):String{
		let result = getFile(fileName);
		if(result instanceof Error)throwError();
		return result;
	}
//}//----
const fs = Deno;//require("fs");
//compiles simple lambda calculus
//classes:
	class Language{//base class
		//external interface
		constructor({compile,syntaxTree}={}){
			this.#compile = compile ?? this.compile;
			this.syntaxTree = syntaxTree ?? this.syntaxTree;
		}
		compile(text,throwError,fileName){
			fileName ??= "";
			throwError ??= e => {throw e}
			this.currentContext = {text,throwError,fileName};
			return this.#compile(this.currentContext);
		}
		//SyntaxTreeData
			syntaxTree_regex = /\s+|[\w_]+|[()\[\]{}]|\S/g;//:Regex ; main regex for passing raw file into words
			syntaxTree_getData = function(word){
				return {type:"symbol",subtype:"symbol"};
			}
		//----
		#compile(){}//:using(currentContext)->compiled object
		currentContext;
		getSyntaxTree(text,throwError,fileName){
			return new SyntaxTree(this.syntaxTree);
		}
		//internal interface
	}
	//Syntax tree:
		class WordSymbol extends String{
			constructor(data={}){
				super(data.word);
				if(data instanceof WordSymbol){
					data = {...data};
					for(let i=0;i<data.length;i++)delete data[i];
				}
				Object.assign(this,data);
				this.errorData = Object.assign(new this.constructor.ErrorData(),data.errorData);
			}
			clone(name?:String){
				return new WordSymbol({
					word:name??this.word,
					afix:this.afix,
					type:this.type,
					subtype:this.subtype,
					patternType:this.patternType,
					indent:this.indent,
					errorData:this.#errorData,
				});
			}
			//
			word;//:string
			afix;//:Int & (!!left_arg * 2) + !!right_arg
			type;//:Symbol
			subtype;//:Symbol
			patternType;//:((Object & Class())|string)? ; used to contain pattern data ; UNUSED
			indent;//:Number ; counts from 0 ; used for parsing multiline-strings
			isAfterWhiteSpace;//:bool
			//when type == (number|string)
				//value//:number|string ; is the evaluated version of 'word'
				//valueType
			//used with type == "bracket" && subtype == "open" || for many patterns in the syntax tree like 'a + b'
				//contence;//:Tree(WordSymbol?)? & (when type == "parameterPattern": [WordSymbol&"bracket"]) | when 'a' from 'a=' assignmentPatturn.arguments.contence: (WordSymbol & type=="keyword")[]
				//endBracket;//:WordSymbol & close bracket ; used when type == bracket open
			//error data
				#errorData:ErrorData;//is private so it does not show up when debugging compiler
				get errorData(){return this.#errorData}
				set errorData(value){this.#errorData = value} 
				//errorData;
			throwError(...args){this.errorData.throwError(...args)}
			static ErrorData = class ErrorData{
				file;//:SourceFile
				line;//:Number ; counts from 1
				column;//:Number ; counts from 1
				indent;//:Number ; counts from 0
				word;
				static throwError;//is message=>throw Error(message)
				getErrorMsg(errorType,errorMessage,stack=undefined){
					return " ERROR:\n"
						+ this.display_location() + "\n"
						// " ".repeat(lineLen)+" |\n"
						+ this.display_markWordInLine(" " + errorType + " error") + "\n"
						+ "error" + ": " + errorMessage + "\n"
					;
				}
				throw(msg,errorFunc){
					this.constructor.throwError(errorFunc(msg));
				}
				throwError(errorType,errorMessage,errorFunc,stack=undefined){
					this.constructor.throwError(errorFunc(this.getErrorMsg(errorType,errorMessage,stack)));
				}
				display_location(){
					return this.file.name+":"+this.line+":"+this.column;
				}
				display_markWordInLine(lineRaw){
					let line = this.file.lines[this.line-1].substr(this.indent);
					return line+"\n"+line.substr(0,(this.column-1) - this.indent).replaceAll(/./g," ")+"^".repeat(this.word.length) + lineRaw;
				}
			}
			toString(){
				return this.word;
			}
		}
		class SyntaxTree extends Array{
			//types and subtypes for the 2nd phase of building syntax tree
			static type = EnumSymbols(
				"whiteSpace",
				"comment",
				"value",//bool|number|string|special
				"label",
				"bracket",// '(' ')'
				"operator",
				"sepparator",//';'
				"constant",
			);
			static subtype = EnumSymbols(
				// whitespace
					"whiteSpace",
					"comment",
				// bracket
					"open",
					"closed",
				// value
					"string",
					"number",
					"bool",
				// label
					"operator",//operators e.g. '>' '=' in '.>' '.=' ; allows for 'a.>foo' --> 'b.>,foo'
				// operator
					"comparitor",
					"pipeline",// '|>' '<|' ':>' '<:'
					"interval",// 'a..b' , 'a..=b'
					"ternary",// 'a ?& b ?| c' 'b &? a ?| c'
					"declaration",// '::' or ':' ; used for ':=' / '::=' syntaxes
					"assignment",// '='
			);
			static AfixType = {//e.g. '!a' is prefix --> '0b01'
				nofix:0b00,//'a'
				postfix:0b10,//'a++'
				prefix:0b01,//'++a'
				infix:0b11,//'a+b'
				operatorWithLeftArg:0b10,//'a++'
				operatorWithRightArg:0b01,//'++a'
			};
			constructor(text,throwError,fileName = "",regexs = {},addExtraWordData){
				if(typeof text == "number"){super(text);return;}//for .forEach calls
				let {allRegex, types} = regexs;
				throwError ??= (msg = "", errorFunction = a => Error(a)) => {throw errorFunction(msg)};
				allRegex ??= words_regex;
				if(0)types ??= [
					{match:"",name:""},
					{match:/\s+/,name:"whiteSpace"},
					{match:/^\/[/*]/,name:"comment"},
					{match:/^[()\[\]{}]$/,name:"bracket"},
					{match:/^(?:[+\-*^&~|]{1,2}|[/!%]|\w+|\S|={1,2})$/,name:"label"},
				];
				addExtraWordData ??= (wordSymbol,wordString,wordSymbols)=>wordSymbol;
				//classes
					//WordSymbol
				//----
				const file = new SourceFile(fileName);
				const words = ((text,regex,file)=>{
					"use strict";
					let words = [];
					let column = 1, line = 1, indent = 0;
					let isIndenting = true;
					let isAfterWhiteSpace = true;//is symbol separated by white space e.g. for '+ =' vs '+='
					for(let v of text.matchAll(regex)){
						let word = v[0];
						let type;//:string
						let wordSymbol = addExtraWordData(
							new WordSymbol({
								word,
								errorData:{column,line,file,word,indent,match:v},
								//
								...((v)=>{if(!v.type)throw Error("property {type} is found but it is referencing undefined value in the SyntaxTree.type enum, for '"+word+"'");return v})(
									word.match(/^\s/) ? {type:SyntaxTree.type.whiteSpace,subtype:SyntaxTree.subtype.whiteSpace}:
									word.match(/^\/[/*]/) ? {type:SyntaxTree.type.whiteSpace,subtype:SyntaxTree.subtype.comment} :
									word.match(/^[(\[{]$/) ? {type:SyntaxTree.type.bracket,subtype:SyntaxTree.subtype.open} :
									word.match(/^[)\]}]$/) ? {type:SyntaxTree.type.bracket,subtype:SyntaxTree.subtype.closed} :
									word.match(/^"|r#+"/) ? {type:SyntaxTree.type.value,subtype:SyntaxTree.subtype.string,afix:SyntaxTree.AfixType.nofix}:
									word.match(/^(?:0[xo]?|[0-9])/) ? {type:SyntaxTree.type.value,subtype:SyntaxTree.subtype.number,afix:SyntaxTree.AfixType.nofix} :
									word.match(/^(?:NaN|Infinity)$/) ? {type:SyntaxTree.type.value,subtype:SyntaxTree.subtype.number,afix:SyntaxTree.AfixType.nofix} :
									word.match(/^(?:true|false)$/) ? {type:SyntaxTree.type.value,subtype:SyntaxTree.subtype.bool,afix:SyntaxTree.AfixType.nofix} :
									word.match(/^(?:null)$/) ? {type:SyntaxTree.type.value,subtype:SyntaxTree.subtype.object,afix:SyntaxTree.AfixType.nofix} :
									word.match(/^([!<>]=?|==)$/) ? {type:SyntaxTree.type.operator} :
									word.match(/^(?:=>|->)$/) ? {type:SyntaxTree.type.operator} :
									word.match(/=$/) ? {type:SyntaxTree.type.operator,subtype:SyntaxTree.subtype.assignment} ://e.g. '=' '+='
									word.match(/^:$|^::$/) ? {type:SyntaxTree.type.operator,subtype:SyntaxTree.subtype.declaration} :
									word.match(/^(?:[|:]>)$/) ? {type:SyntaxTree.type.operator,subtype:SyntaxTree.subtype.pipeline,isReversed:false} ://'|>' or ':>'
									word.match(/^(?:<[|:])$/) ? {type:SyntaxTree.type.operator,subtype:SyntaxTree.subtype.pipeline,isReversed:true} ://'<|' or '<:'
									word.match(/^,$/) ? {type:SyntaxTree.type.operator} ://','
									word.match(/^[!%^&*\/\-+~|<>¬?]|\?[&|]|[&]\?/) ? {type:SyntaxTree.type.operator}  ://ternary operators
									word.match(/^[!%^&*\/\-+~|<>¬?]|\?[&|]|[&]\?/) ? {type:SyntaxTree.type.operator}  ://ternary operators
									word.match(/^\.$/) ? {type:SyntaxTree.type.operator} ://dot operator 
									word.match(/^\.\.=?$/) ? {type:SyntaxTree.type.operator,subtype:SyntaxTree.subtype.interval} ://interval '1..3'
									word.match(/^(?:ref)$/) ? {type:SyntaxTree.type.operator} :
									word.match(/^@$/) ? {type:SyntaxTree.type.operator} :
									word.match(/^(?:\\)$/) ? {type:SyntaxTree.type.operator} :
									word.match(/^(?:\$\$)$/) ? {type:SyntaxTree.type.operator} :
									word.match(/^(?:\.\.\*)$/) ? {type:SyntaxTree.type.operator}:
									word.match(/^`$/) ? {type:SyntaxTree.type.operator}:
									word.match(/^(?:if|while|for|match|break|continue|return|catch|assert|is)$/) ? {type:SyntaxTree.type.operator} :
									word.match(/^(?:mod)$/) ? {type:SyntaxTree.type.operator} :
									word.match(/^in$/) ? {type:SyntaxTree.type.operator} :
									word.match(/^(?:else|do)$/) ? {type:SyntaxTree.type.operator} :
									word.match(/^#[#@!?]?$/) ? {type:SyntaxTree.type.operator,afix:SyntaxTree.AfixType.nofix} ://'#' or '##' or '#@' in: '#name' '##'
									word.match(/^\$$/) ? {type:SyntaxTree.type.operator} ://'$type' '$key'
									word.match(/^[$@*]\*$/) ? {type:SyntaxTree.type.operator,afix:SyntaxTree.AfixType.prefix}://'@*' in '@* = (a=1,b=2,c=3)'
									word.match(/^\.\.\.$/) ? {type:SyntaxTree.type.operator} :
									word.match(/^\w+$/) ? {type:SyntaxTree.type.label,afix:SyntaxTree.AfixType.nofix} :
									word.match(/^[;]$/) ? {type:SyntaxTree.type.sepparator} :
									word.match(/^"$/) ? {type:SyntaxTree.type.symbol}://extra '"'s are caught and are handled later on
									//word.match(/^\S+$/) ? "symbol":
									(()=>{throw Error(`compiler error: unhandled symbol: '${word}' on line ${line}. Either add a case using 'type:SyntaxTree.type.symbol' for this or add a proper error for this case`)})()
								),
								indent,
								isAfterWhiteSpace,//'+ ='
								//parent:undefined,//assigned later, after the expression AST is constructed
							}),
							word,
							words
						);
						isAfterWhiteSpace = [SyntaxTree.type.whiteSpace,SyntaxTree.type.comment].includes(wordSymbol.type);
						if(word.match("\n")){
							column = word.match(/(?<=\n)[^\n]*$/)[0].length+1;
							line+=[...word.matchAll("\n")].length;
							indent = word.match(/(?<=\n)[\t ]*(?=\N*$)/)?.[0]?.length??0;//note '\t \t' => 3 indents
							isIndenting = !!word.match(/[\t ]*$/);
						}else {
							if(isIndenting){
								indent+=word.match(/^[\t ]/);
								if(word.match(/\S/))isIndenting = false;
							}
							column+=word.length;
						}
						words.push(wordSymbol);
					};
					file.words = words;
					return words;
				})(text,allRegex,file);//:WordSymbol[]
				const NumberType = EnumSymbols("int","uint","float");
				interface NumberLiteral {
					type:NumberType,
					value:Number|Number[],//where Number:i32|f32
				}
				const getNumber = wordSymbol => {//:NumberType
					if("Inf" == wordSymbol.word)
						return {valueType:NumberType,value:Infinity};
					if("NaN" == wordSymbol.word)
						return {valueType:NumberType,value:NaN};
					const javascriptIntSize = 32;
					assert((1 << javascriptIntSize) == 1);
					let numberString = wordSymbol.replaceAll("_","");
					let numberMatches = numberString.match(/(^.*?)([IUF])?([8|16|32|64|128|size])?$/)??[];
					assert(numberMatches.length >= 2,"invalid number '" + wordSymbol + "'");
					let valueString = numberMatches[1];
					let type:""|"I"|"U"|"F" = numberMatches[2] ?? "";
					let size:null|Number = numberMatches[3] ? +numberMatches[2] : null;
					if(type[0] == "I" && numberString.includes("."))wordSymbol.throwError("syntax", "integers cannot have a decimal point", e=>Error(e));
					if(type[0] == "U" && numberString.includes("."))wordSymbol.throwError("syntax", "unsigned integers cannot have a decimal point", e=>Error(e));
					let value;
					if(size == null || size <= javascriptIntSize)value = +valueString;
					else {
						let [_,base,numberString] = valueString.match(/(0[box])?(.*)/);
						let numbers = [];
						for(let i = 0; i < numberString.length; i += javascriptIntSize){
							numbers.push(+(base+numberString.substr(i,javascriptIntSize)));
						}
						value = numbers;
					}
					return {value,valueType:type};
				}
				const getString = wordSymbol => {//assume: string is valid
					let string = wordSymbol.word.match(/^(?:r#+)?"([\s\S]*)"#*/)[1]
						.replace(/^\n/,"")
						.replaceAll(/(?:\n|^)\t*/g,v=>"\n"+v.substr(wordSymbol.indent+1))
						.replaceAll("\n","\\n")
						.replaceAll("\t","\\t")
					;
					string = "\"" + string + "\"";
					string = JSON.parse(string);
					return string;
				}
				const syntaxTree = ((words)=>{//()->syntaxTree:WordSymbol
					let treePartList = [[]];//:(WordSymbol[] & WordSymbol().contence & Tree<WordSymbols>)[]
					let bracketLevel = 0;
					file.lines = text.split("\n");
					let syntaxTree = words.forEach(wordSymbol=>{
						let lastTree:WordSymbol[] = treePartList[treePartList.length-2];
						if(wordSymbol=="\"")wordSymbol.throwError("syntax", "missing closing quote in string",a=>Error(a));
						if(wordSymbol.type == SyntaxTree.type.comment || wordSymbol.type == SyntaxTree.type.whiteSpace)return;
						if(wordSymbol.type == SyntaxTree.type.bracket){
							if(wordSymbol.subtype == SyntaxTree.subtype.open){
								treePartList[treePartList.length-1].push(wordSymbol);
								treePartList.push([]);
							}
							else if(wordSymbol.subtype == SyntaxTree.subtype.closed){
								if(!lastTree)
									wordSymbol.throwError("syntax",
										"extra closing bracket",
									a=>Error(a))
								;
								let openBracket = lastTree[lastTree.length-1];//:WordSymbol ; corresponding open bracket
								if({"{": "}", "[": "]", "(": ")"}[openBracket] != wordSymbol.word){
									wordSymbol.throwError("syntax",
										"unmatching brackets '" + openBracket.word + "' '" + wordSymbol.word + "'"
										+"\nopened at: "+openBracket.errorData.display_location()+"\n"
										//+openBracket.errorData.display_markWordInLine(" bracket opened", "")+"\n"
										,
									a=>Error(a));
									
								}
								if(treePartList.length == 1)wordSymbol.throwError("syntax", "too many closing brackets",a=>Error(a));
								lastTree[lastTree.length-1].contence = treePartList.pop();
								lastTree[lastTree.length-1].endBracket = wordSymbol;
							}
							else throw Error("compiler error: impossible case '"+wordSymbol+"'");
						}
						else treePartList[treePartList.length-1].push(wordSymbol);
						if(wordSymbol.subtype == SyntaxTree.subtype.string)wordSymbol.value = getString(wordSymbol);
						if(wordSymbol.subtype == SyntaxTree.subtype.number)Object.assign(wordSymbol,getNumber(wordSymbol));
					});
					let tree;//temporty variable
					if(treePartList.length > 1)(tree=treePartList[0])[tree.length-1].throwError("syntax", "unclosed bracket",a=>Error(a));
					return treePartList[0];
				})(words);
				super(...syntaxTree);
			}
		}
		class SourceFile{//used for error data
			constructor(name){
				this.name = name;
			}
			name;//:string
			words;//:WordSymbol[]
			lines;//:string[]
		};
	//----
	const parseIntoOperatorSyntaxTree = (()=>{
		class OperatorData{
			static AfixType = SyntaxTree.AfixType;
			//static infix = Symbol("'a&&b'");//default
			//static infixOrPrefix = Symbol("'a+b' or '+a'");//is prefix but will be ignored if there is an infix option
			//static prefix = Symbol("'!a'");
			//static postfix = Symbol("'a++'");
			//static nofix = Symbol("'(+)'");
			static left = 0;//:Symbol("param ->")
			static right = 1;//:Symbol("<- param")
			afix;//:u2 & []OperatorData & infix|postfix|prefix|nofix;
			proceedence:Number[2];//for left and right args
			numOfArgs;//:number
			isInverseBracketing;//:bool
			includes;//:string[] ; used for 'if' for 'if condision then else exp' -> `if[condision,then,else[exp]]`
			noRecursion;//:bool ; used to prevent 'let let let a' -> `let[let[let,a]]`, instead having `let[],let[],let[a]`
			//TODO: will later contain data about how to compile each of the operators
		}
		type item<T extends (any[]|[{[any]:any}])> = T extends (infer I)[] ? I : never;
		type Afix = _enum&(nofix|prefix|infix|postfix);
		class OperatorProceedence{
			prefix;infix;postfix;//OperatorData?
		}
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
					"##"      :{afix:OperatorData.AfixType.nofix},
					"#@"      :{afix:OperatorData.AfixType.nofix},
					"#?"      :{afix:OperatorData.AfixType.nofix},
					"#!"      :{afix:OperatorData.AfixType.nofix},
					":"       :{afix:OperatorData.AfixType.nofix},
					"::"      :{afix:OperatorData.AfixType.nofix},
				},
				{
					"#"       :{afix:OperatorData.AfixType.prefix},
					"$"       :{afix:OperatorData.AfixType.prefix},
					"#@"      :{afix:OperatorData.AfixType.prefix},
					"#?"      :{afix:OperatorData.AfixType.prefix},
					"#!"      :{afix:OperatorData.AfixType.prefix},
				},
				{
					"."       :{afix:OperatorData.AfixType.infix,optionalArg:[1,0]},
					"?."      :{afix:OperatorData.AfixType.infix,optionalArg:[1,0]},//same as in javascript's `option?.property`
				},
				{
					"("       :{afix:OperatorData.AfixType.postfix},
					"["       :{afix:OperatorData.AfixType.postfix},
					"{"       :{afix:OperatorData.AfixType.postfix},
					"`"       :{afix:OperatorData.AfixType.postfix},//early return
				},
				{
					","       :{afix:OperatorData.AfixType.infix,optionalArg:[0,1],isInverseBracketing:true},
					",\x00"   :{afix:OperatorData.AfixType.postfix},
					":>"      :{afix:OperatorData.AfixType.infix},
					"<:"      :{afix:OperatorData.AfixType.infix},
					"|>"      :{afix:OperatorData.AfixType.infix},
					"<|"      :{afix:OperatorData.AfixType.infix,isInverseBracketing:true},
				},
				{
					":"       :{afix:OperatorData.AfixType.infix,parameter:OperatorData.left,optionalArg:[0,1]},
					":\x00"   :{afix:OperatorData.AfixType.postfix,parameter:OperatorData.left,optionalArg:[0,1]},
					"::"      :{afix:OperatorData.AfixType.infix,parameter:OperatorData.left,optionalArg:[0,1]},
					"::\x00"  :{afix:OperatorData.AfixType.postfix,parameter:OperatorData.left,optionalArg:[0,1]},
				},
				{
					"="       :{afix:OperatorData.AfixType.infix,parameter:OperatorData.left,isInverseBracketing:true},
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
					"++"      :{afix:OperatorData.AfixType.postfix},
					"--"      :{afix:OperatorData.AfixType.postfix},
				},
				{
					".."      :{afix:OperatorData.AfixType.infix},
					"..="     :{afix:OperatorData.AfixType.infix},
				},
				{
					"in"      :{afix:OperatorData.AfixType.infix},
					"$*"      :{afix:OperatorData.AfixType.prefix},
					"@*"      :{afix:OperatorData.AfixType.prefix},
					"!@*"     :{afix:OperatorData.AfixType.prefix},
				},
				{
					"¬"       :{afix:OperatorData.AfixType.infix,parameter:OperatorData.left},
				},
				{
					"**"      :{afix:OperatorData.AfixType.infix},
					"%%"      :{afix:OperatorData.AfixType.infix},
				},
				{
					"*"       :{afix:OperatorData.AfixType.infix},
					"/"       :{afix:OperatorData.AfixType.infix},
				},
				{
					"+"       :{afix:OperatorData.AfixType.infix},
					"-"       :{afix:OperatorData.AfixType.infix},
				},
				{
					"%"       :{afix:OperatorData.AfixType.infix},
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
					">="      :{afix:OperatorData.AfixType.infix},
					"<="      :{afix:OperatorData.AfixType.infix},
					">"       :{afix:OperatorData.AfixType.infix},
					"<"       :{afix:OperatorData.AfixType.infix},
				},
				{
					"!"       :{afix:OperatorData.AfixType.postfix},//early return
				},
				{
					"&&"      :{afix:OperatorData.AfixType.infix},
					"||"      :{afix:OperatorData.AfixType.infix},
					"^^"      :{afix:OperatorData.AfixType.infix},
					"~~"      :{afix:OperatorData.AfixType.infix},
					"is"      :{afix:OperatorData.AfixType.infix},
				},
				{
					"?"       :{afix:OperatorData.AfixType.infix},//ternary operator
					"?&"      :{afix:OperatorData.AfixType.infix},//ternary operator
					"&?"      :{afix:OperatorData.AfixType.infix},//ternary operator
					"?|"      :{afix:OperatorData.AfixType.infix},//ternary operator
				},
				{
					":"       :{afix:OperatorData.AfixType.infix,optionalArg:[0,1]},//variable declarator and type operator
					":\x00"   :{afix:OperatorData.AfixType.prefix},//variable declarator and type operator
					"::"      :{afix:OperatorData.AfixType.infix,optionalArg:[0,1]},//variable declarator and type operator
					"::\x00"  :{afix:OperatorData.AfixType.prefix},//variable declarator and type operator
				},
				{
					"="       :{afix:OperatorData.AfixType.infix,isInverseBracketing:true},//'a=(b=c)' instead of '(a=b)=c'
					"=\x00"   :{afix:OperatorData.AfixType.prefix,isInverseBracketing:true},//'a=(b=c)' instead of '(a=b)=c'
					"\\"      :{afix:OperatorData.AfixType.prefix,optionalArg:[0,1]},//function
					"/"       :{afix:OperatorData.AfixType.prefix},//class
					"`"       :{afix:OperatorData.AfixType.prefix},
					"if"      :{afix:OperatorData.AfixType.prefix,includes:["=>"]},
					"else"    :{afix:OperatorData.AfixType.infix},//'if' else, 'if', 'while', 'match', 'for'
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
					"=>"      :{afix:OperatorData.AfixType.infix},
					"@"       :{afix:OperatorData.AfixType.prefix},
					"!<"      :{afix:OperatorData.AfixType.prefix},
					"!>"      :{afix:OperatorData.AfixType.prefix},
					"mod"     :{afix:OperatorData.AfixType.prefix},
					"ref"     :[
						{afix:OperatorData.AfixType.prefix},
						{afix:OperatorData.AfixType.infix}
					],
				},
				{
					"¬":{afix:OperatorData.AfixType.infix,parameter:OperatorData.left},
				},
			])
		;
		const operatorProceedence_type = operatorProceedence;//for T_exp in 'a : T_exp'
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
			possibleAfix = 0b11;//:Expression.afix
			afix;//:Expression.afix
			static defaultProceedence = 0;
			static AfixType = SyntaxTree.AfixType;
			static Value = class Value extends Expression {//for 'a:>b|>foo,c<:d' ; value literal constant
				//contence:Expression[]
				//value:String|Bool|Number|Number[2] ; //TODO: define NumberLiteralType
				//impl NumberLiteralType for This
				afix
				toString(){
					return this.wordSymbol.word;
				}
				static new_computeValue(wordSymbol):Expression.Value{
					return new Expression.Value(wordSymbol,
						{
							...match(wordSymbol.subtype,[
								[[SyntaxTree.subtype.bool],()=>{
									if(wordSymbol.word == "true")return {value:true};
									if(wordSymbol.word == "false")return {value:false};
								}],
								[[SyntaxTree.subtype.string],()=>
									match(wordSymbol.word[0],[
										[["\""],()=>({
											value:wordSymbol.value??assert.impossibleCase("expected: getString should be called by the first syntax tree parser"),
										})],
										[["r"],()=>({
											value:wordSymbol.value??assert.impossibleCase("expected: getString should be called by the first syntax tree parser"),
										})],
									])
								],
								[[SyntaxTree.subtype.number],()=>{}],
								[[SyntaxTree.subtype.object],()=>{}],
							])
						},
					);
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
				//contence:Expression[]
				args:Expression[1] = [undefined];
				signitureExp?:Expression = null;
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
			expressions(startIndex,parent):Expression[]{//:(Number,parent:WordSymbol&{contence:WordSymbol[]})->parent & mutate parent
				let words = parent.contence;//:WordSymbol[]
				let i = startIndex;
				let tryNext = forBailOld(words.length);
				let expressions = [];
				while(words && i < words.length){
					tryNext(()=>console.error("TEST:"+words+" "+words[i]+" "+i));
					if(";".includes(words[i])){i++;continue;}
					let expression;
					({index:i,expression} = this.expression(i,parent));
					if(expression !== undefined){
						assert(expression !== null && expression instanceof Expression);
						expressions.push(expression);
					}
				}
				return expressions;
			},
			expression(startIndex,parent):Expression{
				//note: NOT using shunting yard algorithm, since I found it overcomplicated and harder to reason about than looping through each preceedance
					//can reimplement faster algorithms if performance becomes an issue.
				if(startIndex>=parent.contence.length)return {index:startIndex,value:undefined};
				let words = parent.contence;
				let i = startIndex;
				let word;
				let exps:Expression[] = [];
				let nextOperatorData:Option<OperatorData>;
				//TODO: write a GOOD system for assigning afixes to operators.
				//TODO: replace the `{[String]:OperatorData}` type with `OperatorData[4]&[[Afix]:OperatorData]`
				function isDeclarationPattern(wordSymbol1,wordSymbol2){//:bool ; matches ': =' and ':: ='
					return wordSymbol1?.subtype == SyntaxTree.subtype.declaration && wordSymbol2?.subtype == SyntaxTree.subtype.assignment;
				}
				function afixIntoOperatorData(possibleAfixes:{[_]:OperatorData},afix:AfixType&bool[2]&Number):OperatorData{
					assert(0b00 <= afix && afix <= 0b11);
					return [
						possibleAfixes.nofix,
						possibleAfixes.prefix,
						possibleAfixes.postfix,
						possibleAfixes.infix
					][afix];
				}
				{//generate syntaxTree ; contains lots of "special case" code
					generate_exp_objects:for (; i < words.length && (word=words[i]) && word.word!=";";i++){
						let exp = match(word.type,[//:mutate current_expression & valueStack
							[[SyntaxTree.type.bracket],()=>
								new Expression.Bracket(word,{
									contence:contexts.expressions(0,word),
									operatorData:operatorProceedence[word.word].postfix,//non-functioncall brackets (e.g.`;();` instead of `foo()`) are handled as a special case later on.
									afix:OperatorData.AfixType.postfix,
									knownAfix:false,
								})
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
								if(words[i-1]?.word == "." && "><=|".includes(word.word)){//for 'array.=(mapFunction)' ; converts into label
									word.type = SyntaxTree.type.label;
									word.subtype = SyntaxTree.subtype.operator;
									return new Expression.Label(word);
								}
								let num = !!possibleAfixes.prefix + !!possibleAfixes.infix + !!possibleAfixes.postfix + !!possibleAfixes.nofix;
								let exp = new Expression.Operator(word,{});
								let operatorData;
								const isAssignableOperator = /[+\-*/&|^~&%]/;
								if(word.word.match(isAssignableOperator) && words[i+1] == "=" && !words[i+1].isAfterWhiteSpace){//'+' '=' --> '+='
									words[i+1].subWord = word;
									word.operatorData = possibleAfixes.infix;
									return null;//skip this word to
								}
								if([SyntaxTree.subtype.assignment,SyntaxTree.subtype.declaration].includes(word.subtype)){//handles ':' and '=' and their compound patterns ':=' in 'a:T=b'
									let isStart = i == 0 || "\\".includes(words[i-1].word);// '{=' or '\:=' ; no left argument
									let possibleAfix = 0b11;
									if(isStart){
										possibleAfix &= ~SyntaxTree.AfixType.operatorWithLeftArg;
									}
									if(isDeclarationPattern(words[i],words[i+1])){
										possibleAfix &= ~SyntaxTree.AfixType.operatorWithRightArg;
									}
									if(0)operatorData = 
										isStart && word==":" && words[i+1] == "=" ? (isStart?possibleAfixes.nofix:possibleAfixes.postfix) :
										word=="=" && isStart ? possibleAfixes.prefix :
										possibleAfixes.infix//cases like 'a:' e.g. '{a:;a=2;}' are handled later
									;
									operatorData = afixIntoOperatorData(possibleAfixes,possibleAfix);
									assert(operatorData,`'${exps}'`);
								}
								else{
									assert(!(possibleAfixes.infix && possibleAfixes.prefix && possibleAfixes.postfix),"assumed 2 types of operator cases: 1: '++a' / 'a++' ; 2: '+a' / 'a+b'",e=>Error(e));
									if(possibleAfixes.postfix)assert(!possibleAfixes.infix || num == 2);
									if(possibleAfixes.infix)assert(!possibleAfixes.postfix || num == 2);
									if(num == 1){
										operatorData = possibleAfixes.infix ?? possibleAfixes.prefix ?? possibleAfixes.postfix ?? possibleAfixes.nofix;
										assert(!!operatorData);
									}
									else{
										const hasArg = word => !!word && word.word != ";";//BODGED: TODO: assign preceedences & afixes in the next, expression tree building, phase.
										let possibleAfix = 0b11;
										if(
											!hasArg(words[i-1]) ||
											words[i-1]?.type == SyntaxTree.type.operator &&
											(words[i-1].afix & SyntaxTree.AfixType.operatorWithRightArg)
										)possibleAfix &= ~0b10;
										{//checks for right argument ; '+b' / 'a+b'
											if(!hasArg(words[i+1]))possibleAfix &= ~0b01;
											else if(
												words[i+1]?.type == SyntaxTree.type.operator &&
												(
													operatorProceedence[words[i+1]].infix &&
													!operatorProceedence[words[i+1]].prefix//assert: words[i+1] must have left arg so we cannot
													//ignores the nofix case here, nofix is userally for `(*)`
												)
											){
												assert(!(operatorProceedence[words[i+1]].prefix && operatorProceedence[words[i+1]].postfix),"expected: no operator has these all 3 afix types at once");
												possibleAfix &= ~0b01;//note: preceedence doesn't matter for removing right arg here since a syntax error would be thrown if it's wrong either way
											}
										}
										operatorData = afixIntoOperatorData(possibleAfixes,possibleAfix);//:OperatorData?
										if(!operatorData){//special cases
											if(possibleAfix != OperatorData.AfixType.infix && possibleAfixes.nofix){
												operatorData = possibleAfixes.nofix;
											}
											else if(possibleAfix == OperatorData.AfixType.infix && possibleAfixes.postfix){//e.g. 'i++' in 'i++ name'
												operatorData = possibleAfixes.postfix;
											}
											else if(possibleAfix != OperatorData.AfixType.infix && possibleAfixes.postfix && num == 2){//handle ',' in 'foo,;'
												operatorData = possibleAfixes.postfix;
											}
											else if(
												words[i+1]?.type == SyntaxTree.type.operator &&
												(operatorProceedence[words[i+1]].prefix)//allows for '!+a' chained prefix operators
											){
												operatorData = possibleAfixes.prefix;
											}
											else if(possibleAfix == OperatorData.AfixType.nofix){//for '(*)'
												operatorData = possibleAfixes.nofix;
											}
											else assert.impossibleCase(`unhanded case '${word}' in '${words.join(" ")}'`,e=>Error(e))
										}
										if(!operatorData)
											word.throwError("syntax", `cannot use operator in that pattern got pattern: \`${
													!!(possibleAfix&OperatorData.AfixType.operatorWithLeftArg)?words[i-1]:""//"A":""
												} ${word} ${
													!!(possibleAfix&OperatorData.AfixType.operatorWithRightArg)?words[i+1]:""//"B":""
												}\`. Expected \`${
													!!((possibleAfixes.infix??possibleAfixes.prefix??possibleAfixes.postfix??possibleAfixes.nofix).afix&OperatorData.AfixType.operatorWithLeftArg)?"A":""
												} ${word} ${
													!!((possibleAfixes.infix??possibleAfixes.prefix??possibleAfixes.postfix??possibleAfixes.nofix).afix&OperatorData.AfixType.operatorWithRightArg)?"B":""
												}\`.
											`,e=>Error(e))
										;
									}
								}
								exp.operatorData = operatorData;
								exp.afix = operatorData.afix;
								word.afix = operatorData.afix;
								return exp;
							}],
						]);
						if(exp)exps.push(exp);
						if(word.word == "{" && (!words[i+1] || words[i+1].word == "{" || ![SyntaxTree.type.bracket,SyntaxTree.type.operator].includes(words[i+1].type))){//do not need ';' for '{}'s
							i++;
							break;
						}
					}
					collect_arguments_into_tree:{//handles precedence
						function tryCollectParameterExp(startIndex = 0,exps):Option<Expression>&mutates<exps>{//'a', '[a,b,c]' ; returns Some<Expression> if succesfully found a key_exp
							const i = startIndex;
							if(!match(exps[i].wordSymbol.type,[
								[[
									SyntaxTree.type.whiteSpace,
									SyntaxTree.type.comment,
								],()=>{assert.impossibleCase("should not have white space at this stage (parsing into AST)")}],
								[[
									SyntaxTree.type.value,
									SyntaxTree.type.label,
								],()=>true],
								()=>todo()
								//"whiteSpace",
								//"comment",
								//"value",//bool|number|string|special
								//"label",
								//"bracket",// '(' ')'
								//"operator",
								//"sepparator",//';'
								//"constant",
							])){return null}
							//handle dot operator
						}
						function collectIntoTree(startIndex = 0,localMaxProceedence,exps,isTypeSyntax = false,isParameter = false):mutates<exps>{
							const excludeAssignmentOperator = isTypeSyntax;
							const excludeDeclarationOperator = isParameter;
							function isOptionalArgument(exp,j){
								return exp?.operatorData?.optionalArg?.[j] || exp?.wordSymbol?.subtype == SyntaxTree.subtype.declaration;
							}
							function missingOperatorError(selfExp,argExp,argIndex){
								selfExp.wordSymbol.throwError("syntax",`operator '${selfExp.wordSymbol}' missing ${["left", "right"][argIndex]} argument`,e=>Error(e));
							}
							function handleBracketAfix(exps,i){
								if(exps[i] instanceof Expression.Bracket && !exps[i].knownAfix){//handles `(...)` and `foo(...)`
									exps.knownAfix = true;
									if(!exps[i-1] || ((exps[i-1].afix & Expression.AfixType.operatorWithRightArg) && !exps[i-1].args[1])){
										delete exps[i].operatorData;
										exps[i].afix = Expression.AfixType.nofix;
										return true;
									}
									else exps[i].afix &= Expression.AfixType.postfix;//`{}` --> nofix , `()` and `[]` --> postfix for `foo(...)` and `bar[...]`
								}
								return false;
							}
							for(let i = startIndex; i < exps.length; i++){
								let exp = exps[i];
								if(excludeAssignmentOperator && exp.wordSymbol.subtype == SyntaxTree.subtype.assignment)break;
								if(handleBracketAfix(exps,i))continue;
								if(exp.afix != Expression.AfixType.prefix)continue;
								if(exp.args[1])continue;
								function tryGetNewAddableArg():Result<Expression,Throw>{//may return an argument that can be pushed to the parent expression's exp.args
									let argExp = exps[i+1];
									let argProceendence = argExp?.operatorData?.proceedence?.[0] ?? Expression.defaultProceedence;
									if(!isOptionalArgument(exp,1) && (exp.operatorData.proceedence[1] < argProceendence || !argExp))
										missingOperatorError(exp,argExp,1);//:throws error
									exps.splice(i+1,1);
									return argExp;
								}
								if(exp.wordSymbol.word == "\\"){//handle function parameter pattern `\exp#exp#exp:exp;`
									let args = [];
									exp.paramSeparators= [];//:Exp<"#">[]
									exp.paramEnder = undefined;//Exp<":">?
									let hasEndParam:Bool;
									for(let _ of forBailGenerator(exps.length)){
										if(!exps[i+1])break;
										let expProceedence:int = operatorProceedence[exps[i+1].wordSymbol.word]?.nofix?.proceedence?.[0]??0;//check if exp is a parameter key
										const keyProceedence:int = operatorProceedence["="].prefix.proceedence[0];//left side of `=`, i.e. `a` in `\a=2:` or `\a:`
										if(expProceedence <= keyProceedence){
											collectIntoTree(i+1,null,exps,false,true);//collects all parameters into `#names`s

										}
										let argExp = tryGetNewAddableArg();
										args.push(argExp);
										i++;
										if(exps[i+1].wordSymbol.word == ":"){
											exp.paramEnder = exps.splice(i+1,1)[0];
											hasEndParam = true;
											break;
										}
										if(exps[i+1] && exps[i+1].wordSymbol.word == "#"){//'#' act like commas to separating parameters
											i++;
											continue;
										}
										break;
									}
									if(hasEndParam){//`\a#b#c:`

									}
									else{//`\a`

									}
									exp.args = args;
									loga(printTree([exp]))
								}
								collectIntoTree(i+1,exp.operatorData.proceedence[1],exps,exp.wordSymbol.subtype == SyntaxTree.subtype.declaration,exp);
								const argExp = tryGetNewAddableArg();
								exp.args[1] = argExp;
								//note: do not `break;` here, the call to `collectIntoTree()` does not cover all `exps` ; consider removing this comment if 'collectIntoTree' was removed from this for loop
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
										if(!hasParam || selfExp.args[j])return;
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
												if(argExp.wordSymbol.word == ":" && selfExp.wordSymbol.word == "=" && j == 0){
													addArg();
													return;
												}
												if(selfExp.wordSymbol.subtype == SyntaxTree.subtype.declaration && j == 1 && exps[i+1]?.wordSymbol?.subtype != SyntaxTree.subtype.assignment){//does both arguments of ':' before the '=' to allow 'a:T=b' --> '(a:T)=b' and prevent 'a:(T=b)'
													collectIntoTree(i+1,selfExp.operatorData.proceedence[1],exps,true);//:mutates owner object of item argExp
													argExp = exps[i + argIndex];//update
												}
												assert(argExp == exps[i + argIndex]);
											}
											if((argExp.operatorData?.proceedence?.[1-j] ?? Expression.defaultProceedence) + (!selfExp.operatorData.isInverseBracketing && j) <= argProceendence){
												if(j == 1 && selfExp.wordSymbol.subtype == SyntaxTree.subtype.declaration && argExp.wordSymbol.subtype == SyntaxTree.subtype.assignment)return;//prevents 'a:=b' -> 'a:(=b)'
												addArg();
												return;
											}
											if(!isOptionalArgument(selfExp,j))missingOperatorError(selfExp,argExp,j);
										}
									});
									if(selfExp.operatorData.includes){//for `keyword_1 exp_1 keyword_2 exp_2` pattens e.g. `for (...) do (...)`
										let argExp = exps[i+1];
										if(selfExp.operatorData.includes?.includes(argExp?.wordSymbol?.word)){
											selfExp.args[2] = argExp;
											exps.splice(i+1,1);
										}
									}
									return {i};
								}
								for(let i = startIndex; i < exps.length; i++){
									if(!exps[i].operatorData)continue;
									if(exps[i].operatorData.isInverseBracketing)continue;
									if(excludeAssignmentOperator && exps[i].wordSymbol.subtype == SyntaxTree.subtype.assignment)break;
									if(handleBracketAfix(exps,i))continue;
									({i} = handleArgs(exps,i,proceedence));
								}
								for(let i = exps.length - 1; i >= startIndex; i--){
									if(!exps[i].operatorData)continue;
									if(!exps[i].operatorData.isInverseBracketing)continue;
									if(excludeAssignmentOperator && exps[i].wordSymbol.subtype == SyntaxTree.subtype.assignment)break;
									({i} = handleArgs(exps,i,proceedence));
								}
							}
						}
						collectIntoTree(0,maxProceedence,exps);
					}
				}
				if(exps.length > 1){
					if(0)console.error(printTree(exps));
					let adjacentSides:Expression[2] = [exps[0],exps[1]].map((v,i)=>{
						let otherSide = 1 - i;
						let tryNext = forBailOld(v.wordSymbol.errorData.file.words.length);
						//assume: v:Tree structure
						while(v instanceof Expression.Operator && v.args[otherSide]){
							tryNext();
							v = v.args[otherSide];
						}
						return v;
					});
					adjacentSides[1].wordSymbol.throwError("syntax", `double expression. missing expression sepparator or operator. Expected previous '.', ';', or an operator. Found '${exps[1].wordSymbol.word}'`, e=>Error(e));//TODO: make this error identify the 2 adjacent wordSymbols
				}
				return {index:i,expression:exps[0]};
			},
		};
		function parseOperatorSyntaxTree(rootPattern):Expression[]{
			return contexts.expressions(0,rootPattern,rootPattern);
		}
		Object.assign(parseOperatorSyntaxTree,{
			OperatorData,
			operatorProceedence,
			Expression,
		});
		return parseOperatorSyntaxTree;
	})();
	function parseAST(rootPattern:Expression[]):Expression[]{
		const {Expression} = parseIntoOperatorSyntaxTree;
		class DeclarationAssignmentPattern extends Expression.Operator{
			constructor(data={}){super(data);Object.assign(this,data)}
			isDeclaration:bool;//'a: ...'
			isAssignment:bool;//'a= ...' or 'a:b'
			wordSymbol:WordSymbol;
			wordSymbols:[WordSymbol?,WordSymbol?];
			typeArg?:Expression;
			args:[Expression?,Expression?];
			destructuredRefs:DestructuredRef[];
			toTree(){
				return [this.args[0],this.typeArg,this.args[1]];
			}
			static isDeclarationOrAssignmentExp(exp){//':' '='
				return exp instanceof this || [SyntaxTree.subtype.declaration,SyntaxTree.subtype.assignment].includes(exp?.wordSymbol?.subtype);
			};
			static tryFromExp(expression?:Expression):Option<Self>{
				if(this.isDeclarationOrAssignmentExp(expression))
					return this.fromExp(expression);
				return undefined;
			}
			static fromExp(declarationOrAssignment?:Expression):Self{
				let declaration:Expression;
				let assignment:Expression;
				if(declarationOrAssignment.wordSymbol.subtype == SyntaxTree.subtype.assignment){
					assignment = declarationOrAssignment;
					declaration = assignment.args[0] ?? undefined;
				}
				else{
					assignment = undefined;
					declaration = declarationOrAssignment;
				}
				if(declaration.wordSymbol.subtype != SyntaxTree.subtype.declaration)declaration = undefined;
				assert(assignment ?? declaration);
				return new DeclarationAssignmentPattern({
					wordSymbols:[declaration?.wordSymbol,assignment?.wordSymbol],
					wordSymbol:(declaration?.wordSymbol??assignment?.wordSymbol).clone(":="),
					typeArg:declaration?.args[1] ?? undefined,
					args:[declaration?.args[0] ?? (!declaration?assignment?.args[0]:undefined) ?? undefined, assignment?.args[1] ?? undefined],
					isDeclaration:!!declaration,
					isAssignment:!!assignment,
				})
			}
		}
		interface SignitureExp {//'(:T=exp; )' or '\:T=' or 'mod:'
			signitureExp?:Expression|null;
		}
		class FunctionPattern extends Expression.Operator{//'\exp'
			constructor(data={}){super(data);Object.assign(this,data)}
			parameters:Declaration[] = [];
			parametersExp?:Expression & Item<signitureExp>;
			returnTypeExp?:Expression & Item<signitureExp>;
			bodyExp?:Expression & Item<signitureExp>;
			signitureExp?:Expression & DeclarationAssignmentPattern = undefined;
			toTree(){
				return [this.args[1]];
			}
		};
		class ModulePattern extends Expression{//'mod exp'
			constructor(data={}){super(data);Object.assign(this,data)}
			wordSymbol?:WordSymbol;
			signitureExp?:Expression = null;
			contence:Expression[];
		}
		class GlobalExp extends ModulePattern{
			wordSymbol={throwError(type,msg,errorFunc){throw Error("cannot yet reference the global context in error message")}}
		}
		const rootExp = new GlobalExp();
		Expression.DeclarationAssignmentPattern = DeclarationAssignmentPattern;
		const isDeclarationOrAssignmentExp = DeclarationAssignmentPattern.isDeclarationOrAssignmentExp;
		{//identify and collect patterns '\' ':='
			function forEach(exps){
				for(let i = 0; i < exps.length; i++){
					let exp:Option<Expression> = exps[i];
					if(!exp)continue;
					if(exp)forEach(exp.toTree());
					let pattern:Option<Expression> = DeclarationAssignmentPattern.tryFromExp(exp);
					if(!pattern && exp.wordSymbol.word == "\\"){
						pattern = new FunctionPattern(exp);
						if(pattern.args[1] instanceof DeclarationAssignmentPattern){
							pattern.signitureExp = pattern.args[1];
							pattern.parametersExp = pattern.signitureExp.args[0];
							pattern.typeExp = pattern.signitureExp.typeArg;
							pattern.bodyExp = pattern.signitureExp.args[1];
						}
					}
					if(pattern){
						exps[i] = exp = pattern;
					}
				}
			}
			forEach(rootPattern);
		}
		find_references:{//handles declarations and references
			class Reference{
				constructor(data={}){Object.assign(this,data)}
				parent:Expression;//where it was declared
				lastAssignment:Expression;
			}
			interface Expression{
				context:Closure,
				args:[Expression?,Expression?],
			}
			const operators = {
				//programming note: the operator data is separate from operatorProceedence, since operatorProceedence is messy enough and this one holds different data.
				//TODO: fill in with all operators
			};
			function isGlobalExp(parentExp:Expression|null){//returns true if exp represents the global object
				return parentExp === null;
			}
			function isStructBracket(exp){//done to allow '(a=1;b=2;c=3)' --> '(a:=1;b:=2;c:=3)'
				return exp?.wordSymbol?.word == "(";
			}
			function parseKey(exp):String|Symbol&Mutates<exp>{//UNUSED
				interface Expression{
					symbol:String|Symbol<belongs_to_expression>;
				}
				if(exp.symbol !== undefined)return exp.symbol;
				if(exp instanceof Expression.Label){
					exp.symbol = exp.word;
				}
				else if(exp?.wordSymbol?.word == "$"){
					exp.symbol = exp.word;
				}
				else if(exp?.wordSymbol?.word == "$$"){
					exp.symbol = Symbol("unique symbol");
				}
				return exp.symbol;
			}
			class Closure{
				constructor(data={}){Object.assign(this,data)}
				parent?:Closure;
				labels:Map<Key,Delcaration> = new Map();
				containingKeys:Set<Key> = new Set();
			}
			class Delcaration{
				constructor(data={}){Object.assign(this,data)}
				destructuredRef:DestructuredRef;
				currentValue:Expression;
				type:Option<Type>;//if no type provided 
			}
			class Type{

			}
			class Assignment{
				constructor(data={}){Object.assign(this,data)}
				destructuredRef:DestructuredRef;
				lastAssignment?:LinkedList<Assignment|null>;
				declaration:Declaration;
			}
			function findLabelDeclaration(closure,labelName:Key):{closure,label:Option<Delcaration>}{
				if(!closure)return undefined;
				if(typeof labelName == "string"){
					if(closure.containingLabels.has(labelName))return {closure,label:closure.labels.get(labelName)??null};
				}
				else{

				}
			}
			type DestructurePath = DestructurePathItem[];
			type DestructurePathItem = ((Number&Index)|String|TypedKey);//:[]DestructurePath
			interface DestructuredRefData{//:data class ; not storeable
				key:String|KeyExp;//"a" in 'a=b'
				path:DestructurePath[];//'b' in 'a.b = c'
				exp:Expression;//'a' in 'a=b'
			}
			class DestructuredRef{//:data class ; storeable
				constructor(data={}){Object.assign(this,data)}
				key:String|KeyExp;
				path:DestructurePath[];
				pattern:Expression&(DeclarationAssignmentPattern|(Expression<"#">|"#@"|Expression<"#?">|etc___));//
				exp:Expression;//'a' in 'a=b'
			}
			type Key = String|KeyExp;
			type KeyExp = Expression;//'label' '$type_exp' e.g. '$(A.B*C)'
			class Key{
				static enum = EnumSymbols("string", "typeExp");
				static isKey(exp){
					return exp instanceof Expression.Label || exp?.wordSymbol?.word == "$";
				}
				static tryGetKey(keyExp?:Expression):Result<String|Expression,undefined>{
					return !keyExp?undefined:
						keyExp instanceof Expression.Label?keyExp.wordSymbol.word:
						keyExp?.wordSymbol?.word == "$"?keyExp:
						undefined;
				}
				static getKey_expect(keyExp){
					return this.tryGetKey(keyExp)??(keyExp?keyExp.wordSymbol.throwError("syntax",`compiler error: '${keyExp.wordSymbol}' is not a key`,e=>Error(e)):assert.impossibleCase());
				}
				static KeySymbol = Symbol("key");//:Symbol->Key
			}
			class TypedKey{//'T' and 'b' in '(a:T=b) = obj;'
				constructor(data={}){Object.assign(this,data)}
				type:Expression&type_exp;
				key:Key;
			}
			function getDestructuredKeysFromExp(exp):Pure&DestructuredRefData[]|Err<syntax>{//'[a;b] = array;' function arguments and arrays.
				let refs:DestructuredRefData[] = [];
				function forEachInTree(exp:Expression,path:owned<(Index|String|TypedKey)[]>,expectDestructable = false){
					function getRefFromDotOperatorChain(exp:Expression<".">,path:Key[]):Pure & DestructuredRefData{
						let propertiesAsExps:Stack&Exp[] = [exp.args[1]];
						//note: this could instead be done using recursion instead of a loop
						//assume: exp:Tree
						let tryNext = forBailOld(1000);
						let properties:{key:Key,exp:Expression&'key'}[] = [];//['b','c'] in 'a.b.c'
						let baseObject:Option<Exp>;//'a' in 'a.b.c = d' can also be infered e.g. 'a:Option = .None,;'
						!function forEachKey(exp:Exp&"."){
							assume(exp.args[1],
								"should be handled in expression-tree generating phase, by the afix system."
							)(()=>{
								let key = Key.tryGetKey(exp.args[1]);
								if(!key)exp.args[1].throwError("syntax", "expected property for right side of dot operator. Try patterns: 'a.b' or 'a.$T'", e=>Error(e));
								properties.push({key,exp:exp.args[1]});
							});
							match(exp.args[0],[
								[[undefined],()=>{}],
								[arg=>arg?.wordSymbol?.word == ".",arg=>{
									forEachKey(arg);
								}],
								[arg=>arg?.wordSymbol?.word == "?.",arg=>{
									unimplemented("does not yet support 'a?.b' syntax. unsure how the '?' operator works in general.");
								}],
								[
									arg=>
										arg instanceof Expression.Label ||
										arg instanceof Expression.Value ||
										arg instanceof Expression.Bracket
									,
									arg=>{
										//end of the property chain
										baseObject = arg;
									}
								],
								[arg=>arg instanceof Expression.Operator,()=>{
									;
								}],
							]);
						}(exp);
						let {key:finalProperty,exp:finalExp} = properties.pop();
						let propertiesPath:Key[] = properties.map(v=>v.key);
						{
							let baseKey = Key.tryGetKey(baseObject);
							if(!baseKey)baseObject.throwError("syntax","expected a key");
							if(finalProperty != undefined){//exp: KeyExp
								let ref:DestructuredRefData = {//in 'a = b'
									path:[...path,baseObject,...propertiesPath],//destructure path for object 'b'
									exp:finalExp,
									key:finalProperty,
								};
								return ref;
							}
						}
					}
					const isDotOperator = (exp:Expression):Bool => exp instanceof Expression.Operator && exp.wordSymbol.word == ".";
					if(exp instanceof Expression.Bracket){
						const bracketExp = exp;
						if(expectDestructable && bracketExp.wordSymbol == "{"){
							bracketExp.throwError("syntax","found pattern '{ ... } := ...'. cannot destructure code blocks '{ ... }'. Try using '[ ... ]' or '( ... )'",e=>Error(e));
						}
						let pathIndex = path.length;
						let pathI = 0;
						function handleSingleKey(exp,typedKey,expectDestructable = false){//handles 'a' , '(...)' , 'a:T' ; handles patterns directly inside brackets or from ':=' pattern
							let key;
							if(isStructBracket(bracketExp)){
								key = Key.getKey_expect(exp);
							}
							else{
								key = pathI;
							}
							if(typedKey){
								typedKey.key = key;
								key = typedKey;
							}
							forEachInTree(exp,[...path,key],expectDestructable);
						}
						const perentExp = exp;
						for(let i = 0; i < perentExp.contence.length; i++){
							let exp = perentExp.contence[i];
							match(exp,[
								[()=>exp instanceof DeclarationAssignmentPattern,()=>{//'b:;(a=b):=(a=2);assert b == 2'
									let key,value,typedKey;
									if(exp.isDeclaration){
										typedKey = new TypedKey({
											type:exp[Key.KeySymbol],
											key:undefined,//defined later
										});
									}
									if(exp.isAssignment){
										let path1 = path;
										if(isDotOperator(exp.args[0])){
											const ref:Owned&DestructuredRefData = getRefFromDotOperatorChain(exp,path);
											key = ref.path.pop();
											path1 = ref.path;
										}
										else key = Key.getKey_expect(exp.args[0]);
										value = exp.args[1];
										if(typedKey){
											typedKey.key = key;
											key = typedKey;
										}
										forEachInTree(value,[...path1,key],true);
									}
									else{
										assume(exp.isDeclaration && !exp.isAssignment,"':=' must contain ':' and/or '='")(()=>{
											value = exp.args[1];
											handleSingleKey(value,typedKey,true);
										});
									}
								}],
								[()=>exp instanceof Expression.Bracket,()=>{
									forEachInTree(exp,[...path,i]);
								}],
								[()=>Key.isKey(exp),()=>{
									handleSingleKey(exp);
								}],
							],()=>exp.wordSymbol.throwError("syntax", "invalid syntax inside descructureing pattern. Some accepted patterns include: '[...]', '(...)', 'key', 'a:T=b', 'a:T', 'a=b'",e=>Error(e)));
						}
						return;
					}
					else if(isDotOperator(exp)){//'.c' in 'a.b.c = d'
						let ref:DestructuredRefData = getRefFromDotOperatorChain(exp,path);
						refs.push(ref);
						return;
					}
					else{
						let key = Key.tryGetKey(exp);
						assume(exp,"'(:T=a)' , '\\:T=b' / '\\(...):T=b' should be handled by another function. It is not the same as a dec");
						if(key != undefined){//exp: KeyExp
							let ref:DestructuredRefData ={
								path:[...path],
								exp:exp,
								key,
							};
							refs.push(ref);
						}
						else{
							exp.wordSymbol.throwError("syntax",`invalid syntax in destructure pattern. Got '${exp?.wordSymbol?.word}'`,e=>Error(e));
						}
					}
				}
				if(!exp){
					assert.fail("compiler error: '(:T=a)' , '\\:T=b' / '\\(...):T=b' should be handled by another function. It is not the same as a dec");
				}
				forEachInTree(exp,[],true);
				return refs;
			}
			function dotOperator_getRefs(exp:Expression<".">){//UNUSED
				assert(exp&&exp.wordSymbol.word == ".", "compiler error: incorrect argument type");
				const key:Option<Key> = Key.tryFromExp(keyExp);
				const baseExp:Option<Expression> = exp.args[0];
				const isInfered = !!baseExp;
				const keyExp:Option<Expression> = exp.args[1];
				if(!key)exp.throwError("syntax","expected key",e=>Error(e));
				const data = {
					baseExp,
					isInfered,
					key,
				};
			}
			function parseExp_getRefs(parent?:Expression,closure:Closure,exp:Expression,keysArePublic:Booly):Mutate<closure,exp>{// adds 
				assert(!!exp, "expected non-null Expression");
				assert(exp instanceof Expression, "expected non-null Expression");
				match(exp.constructor,[
					[()=>exp instanceof DeclarationAssignmentPattern,()=>{//special syntax: '(a=1;b=2;c=3)' --> '(a:=1;b:=2;c:=3)'
						const pattern:DeclarationAssignmentPattern&Expression = exp;//: ':='
						if(isStructBracket(parent)){
							pattern.isDeclaration = true;
						}
						if(pattern.args[0])
						if(!pattern.destructuredRefs){//assigns destructuredRefs
							pattern.destructuredRefs = [];//:DestructuredRef[]
							let refs:DestructuredRefData[] = getDestructuredKeysFromExp(pattern.args[0]);
							for(let ref of refs){
								const {key,path,exp} = ref;
								let destructuredRef = new DestructuredRef({
									pattern,
									path,
									key,
									exp,
								});
								if(pattern.isDeclaration && keysArePublic){
									unimplemented();
									closure.module.publicKeys
								}
								pattern.destructuredRefs.push(destructuredRef);
							}
							for(let ref of pattern.destructuredRefs){//note: this should be extracted into it's own function since it is doing multiple things. ; this would make the code more 'clean' the code
								if(pattern.isDeclaration){
									closure.containingKeys.add(ref.key);
								}
							}
						}
					}],
					[()=>Key.isKey(exp),()=>{
						exp.key = Key.getKey_expect(exp);
					}],
					[()=>exp.wordSymbol.word == "@",()=>{//public ;
						parseExp_getRefs(exp,closure,exp.args[0],true);
					}],
					[()=>exp instanceof Expression.Operator,()=>{
						const parent = exp;
						for(let exp of parent.args){
							if(exp)parseExp_getRefs(parent,closure,exp,keysArePublic)
						}
					}],
					[()=>exp instanceof Expression.Operator,()=>{
						const parent = exp;
						for(let exp of parent.args){
							if(exp)parseExp_getRefs(parent,closure,exp,keysArePublic)
						}
					}],
					[()=>exp instanceof Expression.Bracket,()=>{
						const parent = exp;
						for(let exp of parent.contence){
							if(exp)parseExp_getRefs(parent,closure,exp,keysArePublic)
						}
					}],
					[()=>exp instanceof Expression.Value,()=>{}],
				]);
			}
			function parseExp_Assignment(pattern:Expression&DeclarationAssignmentPattern,closure):Mutates<pattern>{
				assert(pattern instanceof DeclarationAssignmentPattern);
				if(!pattern.args[0])return;
				for(let ref of pattern.destructuredRefs){
					let lastAssignment:Option<Assignment>;//:Invalid<Option<Assignment>>
					let declaration:Declaration;//:!Readable & Writeable
					if(pattern.isDeclaration){
						declaration = new Delcaration({
							destructuredRef:ref,
							currentValue:undefined,
							firstValue:undefined,
						});
						lastAssignment = undefined;
						closure.labels.set(ref.key,declaration);
					}else{
						declaration = closure.labels.get(ref.key,declaration);
					}
					//lastAssignment:Valid<Option<Assignment>>
					//declaration:Option<Declaration> & Readable & !Writable
					if(pattern.isAssignment){
						if(!declaration){
							function searchForLabel(key:Key,closure:Closure):Option<Delcaration>{
								if(key instanceof Expression) return undefined;//expressions are not ready for parsing
								if(closure.labels.has(key)) return closure.labels.get(key);
								else if(closure.parent) return searchForLabel(key,closure.parent);
								else return undefined;
							}
							declaration = searchForLabel(ref.key,closure);//:Option
							if(!declaration)ref.exp.wordSymbol.throwError("syntax","variable is undeclared",e=>Error(e));
						}
						let assignement = new Assignment({
							lastAssignment:declaration.currentValue ?? null,
							declaration,
							destructuredRef:ref,
						});
						declaration.currentValue = assignement;
						declaration.firstValue ??= assignement;
						let destructuredRef = closure.labels.set(ref.key,assignement);
					}
				}
			}
			function parseExp_functionCalls(parent?:Expression,exp:Expression,exps:Expression[]):Mutates<exp>{
				assume(exp instanceof Expression,exp);
				function handler(exp:Expression){
					if(!exp.wordSymbol.word.match(/[:|]>|<[:|]|[,({]/))return;//checks for function call symbols
					match(exp.wordSymbol,[
						[wordSymbol=>wordSymbol.subtype == SyntaxTree.subtype.pipeline,()=>{
							//TODO
						}],
						[wordSymbol=>wordSymbol.word == ",",()=>{
							//TODO
						}],
						[()=>exp instanceof Expression.Bracket,()=>{
							//TODO
						}],
					]);
				}
				!function forEachInTree(parent?:Expression,exp?:Expression){
					if(!exp)return;
					handler(exp);
					assert(exp.toTree);
					let contence:Expression[] = exp.toTree();
					assert(contence instanceof Array,`If contence is null then ammend this code to accept null --> {no contence}. got '${contence}'`);
					for(let expItem:Option<Expression> of contence){
						assert(!expItem || expItem instanceof Expression);
						forEachInTree(exp,expItem);
					}
				}(parent,exp);
			}
			function parseExp_getParameters(parent?:Expression,exp:Expression){
				!function forEachInTree(exp:Expression,parentFunction?:Expression,parentStatement?:Expression,parentCondision?:Expression){//:(...Exp[])->mutates arguments
					//for '#name', '#@name', '#?name'
					assert(exp);
					match(exp.constructor,[
						[[FunctionPattern],()=>{//'\'
							if(exp.parametersExp)forEachInTree(exp.parametersExp,exp,parentStatement,parentCondision);
							if(exp.returnTypeExp)forEachInTree(exp.returnTypeExp,exp,parentStatement,parentCondision);
							if(exp.bodyExp)forEachInTree(exp.bodyExp,exp,parentStatement,parentCondision);
						}],
						[()=>["#", "##", "#@", "#?", "#!"].includes(exp.wordSymbol.word),()=>{
							const condisionalKeywords = ["if", "match", ""];
							const argumentStatements = [];
							match(exp.wordSymbol.word,[
									[["#"],()=>{//'#name' named is required for the parameter
										if(!exp.args[1])exp.wordSymbol.throwError("syntax", `missing parameter name. Try using the '${exp.wordSymbol.word}name' pattern.`,e=>Error(e));
									}],
									[["##"],()=>{
										assert(!exp.args[1],"Cannot have name parameter with '##'. It is only a 'nofix' operator.")
									}],
									[["#@", "#?", "#!"],()=>{}],
								]);
							match(exp.wordSymbol.word,[
								[["#", "##"],()=>{//'#name' named is required for the parameter
									function getDeclarationFromAutoparameter(exp:Expression<"#"|"##"|etc___>){
										if(!parentFunction)exp.wordSymbol.throwError("reference", `parameter ${exp.wordSymbol.word+exp.args[1].wordSymbol.word} is not inside a argument possessing statement. Can be used inside: 'for', 'while', 'else', 'do', 'await'`,e=>Error(e));//TODO update the list of keyword statements allowed in the error message
										let key:Option<Key> & Enum<_<"#">&Some<Key> | _<"##">&None>;
										if(exp.wordSymbol.word == "#"){
											assert(exp.args[1]);
											key = Key.getKey_expect(exp.args[1]);
										}else{
											assert(exp.wordSymbol.word == "##");
											key = undefined;
										}
										//note: using a Delcaration object may be redundant
										const data = {
											key:key,
											pattern:exp,
											keyExp:exp.args[1]??exp,
											type:undefined,
											currentValue:undefined,
											path:[],
										};
										const declaration = new Delcaration({
											destructuredRef:new DestructuredRef({
												destructuredRef:data.key,
												path:data.path,
												pattern:data.exp,
												exp:data.key,
											}),
											currentValue:undefined,
										});
									}
									parentFunction.autoParameters.push(exp);//UNFINISHED
								}],
								[["#@"],()=>{//'#name' named is required for the parameter
									if(!parentStatement)exp.wordSymbol.throwError("reference", `argument ${exp.wordSymbol.word+(exp.args[1]?.wordSymbol?.word??"")} is not inside a conditional expression`,e=>Error(e));
								}],
								[["#?"],()=>{//'#name' named is required for the parameter
									if(!parentFunction)exp.wordSymbol.throwError("reference", `parameter ${exp.wordSymbol.word+(exp.args[1]?.wordSymbol?.word??"")} is not inside a function. Try adding '\\' or removing the '#'.`,e=>Error(e));
								}],[["#!"],()=>{//'#name' named is required for the parameter
									unimplemented("'#!' is not implemented yet");
								}],
							]);
						}],
					],()=>{
						const contence:Expression[] = exp.toTree();
						for(let expItem:Option<Expression> of contence){
							if(!expItem)continue;
							forEachInTree(expItem,parentFunction,parentStatement,parentCondision);
						}
					});
				}(exp,undefined,undefined,undefined);
			}
			function parseExp_getValue(){//:UNUSED
				function handler(){
					unimplemented();
				}
				!function forEachInTree(exp?:Expression){
					if(!exp)return;
					handler(exp);
					let contence:Expression[] = exp.toTree();
					for(let expItem of contence){
						forEachInTree(exp);
					}
				}()
			}
			class Module{
				publicKeys:Key[] = [];
				exp:Option<Expression>;//:'mod'
			}
			function parseExps(parent?:Expression,parentClosure?:Closure,exps:Expression[]):Mutates<exps>{
				let hasFunctionSigniture = false;
				if(exps[0] instanceof DeclarationAssignmentPattern)block:{//'(:= )' and '\:='
					if(!parent)break block;
					assert(
						parent instanceof GlobalExp || parent instanceof Expression.Bracket || parent instanceof ModulePattern || parent instanceof FunctionPattern,
						"expected to have thown an error in the expression syntax tree creation phase."
					);
					if(parent instanceof FunctionPattern){
						if(!exps[0].args[0] && !exps[0].typeArg)return;//'\= ...' and '\:= ...' is the same as '\...'
						parent.signitureExp = exps[0];
					}
					parent.signitureExp = exps[0];
				}
				let closure = new Closure({parent:parentClosure,module:parentClosure??new Module()});//:Map(Symbol -> declaration exp)
				for(let exp of exps){
					{//the order of these function calls does not matter
						parseExp_getRefs(parent,closure,exp);
						parseExp_getParameters(parent,exp);
					}
					{//mutates the exp tree structure
						parseExp_functionCalls(parent,exp,exps);
					};
				}
				for(let exp of exps){
					if(exp instanceof DeclarationAssignmentPattern)parseExp_Assignment(exp,closure);
				}
			}
			return parseExps(null,undefined,rootPattern);
		}
	}
//----
	//for each in tree
		function forEachInTree(
			//type Leaf:any
			//type Node:Leaf|Node[]
			//type Foreach:<S,S1>(node,parents:{parent,index,...any[]}[])->mutate parents
			//  example Foreach(node,parents)=>state;
			//type Tree: any tree-like Object
			tree,//:TreeLike
			[
				getNodes = tree => tree instanceof Array? tree : false,//:(TreeLike)->Node[]|false
				forEachLeaf = undefined,//:Foreach?
				forEachBranch_prefix = undefined,//:Foreach?
				forEachBranch_infix = undefined,//:Foreach?
				forEachBranch_postfix = undefined,//:Foreach?
			],
		){
			let parents = [];//:{parent:,index:}[]
			return forEachInTree()
			function forEachInTree(tree,state,parents){
				errorFunc ??= a=>Error(a);
				let i_bail;
				let nodes = getNodes(tree,state);
				if(!nodes){
					forEachLeaf(node);
					return state;
				}
				parents.unshift({parent:tree,index:0,state});
				if(forEachBranch_prefix)
					forEachBranch_prefix(parents,node);
				for(let i_bail = 0; i_bail < nodes.length && parents.index<nodes.length; i_bail++){
					let node = nodes[i];
					forEachInTree(node,state);
					if(forEachBranch_infix)
						state = forEachBranch_infix(parents,tree,node);
				}
				assert(i_bail < nodex.length,"bailed");
				if(forEachBranch_postfix)
					state = forEachBranch_postfix(parents,tree);
				return parents.shift().state;
			}
		}
	//----
function printTree(abstractSyntaxTree):String{//a TEST function for debugging
	let len = 0;
	let string = (function forEach(a,i=-4,a1){
		len++;
		return "\t".repeat(i)+(!a?a:
			a.wordSymbol
			+(a.toTree?(a.toTree().length>0?"\n":"")+a.toTree().map(v=>forEach(v,i+1,a)).join("\n")
				:(a.args?"\n"+a.args.map(v=>forEach(v,i+1,a)).join("\n"):"")
			)
			//+(a.contence?"\n"+a.contence.map(v=>forEach(v,i+1,a)).join((i-=1,"\n")):"")
			//+(a.args?"\n"+a.args.map(v=>forEach(v,i+1,a)).join("\n"):"")
		);
	})({args:abstractSyntaxTree},0);
	return string + "\n" + len;
}
function compile(text,throwError,fileName="main file"){
	text??="";
	try{
		WordSymbol.ErrorData.throwError = throwError??(e=>{throw e});
		const syntaxTree = new SyntaxTree(text,throwError,fileName);
		class RootPattern extends WordSymbol{}
		const rootPattern = new RootPattern({contence:syntaxTree});
		const abstractSyntaxTree:Expression[] = parseIntoOperatorSyntaxTree(rootPattern);//:mutates rootPattern
		parseAST(abstractSyntaxTree);//:mutates rootPattern
		//assert(abstractSyntaxTree == rootPattern);
		loga(printTree(abstractSyntaxTree));
	}
	catch(error){
		throw error;
	}
	finally{
		WordSymbol.ErrorData.throwError = (e=>{throw e});
	}
}
let {data:a,fileName} = (()=>{
	const fileName = "testCode.lang3";
	const data = getFile_expect(fileName);
	return {fileName,data};
})();
//a="a.b := 2;Coords := \(*$$:;#x:=0;#y:=0);";
if(1)compile('\\a#b=0#c:10');
else try{compile(a)}catch(e){console.error(e+"")};/