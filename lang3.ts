//TODO: work on 1634 `function getDeclarationFromAutoparameter` ; implementing '##' '#@' '#?' get parameters for '\', 'if', 'else' etc..
	//1263 build type class for the language's type system
//name suggetions: quad`.qd` (the Quick Unreadable And Dirty programming language), `.cr` Crunch
//TODO: add code to support '::=' making '::' have the same syntax as ':'
const words_regex = /\/\*[\s\S]*?\*\/|\/\/.*|[rf]?(?:r(#+)"[\s\S]*?"\1|"(?:\\u....|\\x..|\\.|[^"\n])*?")|[@$#]\*|(?:\?&|&\?|\?\||\?!)|[|:]>|<[|:]|>:|::?|\\|(?:!<|!>)|!!!|=>|->|[!=]==|[><!=]=?|>{1,3}|<{1,2}|([+\-*%&|^~])\2?|#(?:\.\.|[#@?\./\\])|\${1,2}|[¬\\]|\s+|[\(\[\{]|[\)\]\}]|\b(?:0[box][_0-9A-Fa-f]+|[1-9][_\d]*)\b|\.\.\.|\.\.=?|\.|\b\w+\b|\S/g;
	//note: float numbers are handed during syntax parting to allow for '3.<' aswell as '3.2'
	//TODO:handle format strings: need to combine words together when a format string is encountered
		//currently cannot embed format strings in other format strings
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
	function assert(condision,msg = "",errorFunc = e=>Error(e)):true|Error{
		if(debugMode){
			msg ??= "";//msg:String|()->String
			if(!condision)throw errorFunc("ASSERTION FAILLED:" + (typeof msg == "function"?msg():msg));
		}
		return true
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
	function todo(msg = "",errorFunc:(e)=>Error<e>){
		if(debugMode){
			throw (errorFunc??Error)("TODO:" + msg);
		}
	}
	todo.flaggedErrors = {};
	todo.silent = function(name?:String,returnValue,state?:Any,errorFunc = e=>Error(e)){
		todo.flaggedErrors[name] ??= {state,error:errorFunc};
		return returnValue;
	}
	function silentError(name?:String,state?:Any,errorFunc = e=>Error(e)){
		silentError.flaggedErrors[name] ??= {state,error:errorFunc};
	}
	silentError.flaggedErrors = {};
	function pass(v?:Any){return v}//marks a block as not meant to contain any code 
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
	function match<V,B,T>(value:V,setOfCases:MatchCase[],defaultCase:(v)=>T):T{
		"use strict";
		//type MatchCase=[(V[]|V->B|bool), B|V->T]
		let i = -1;
		let tryNext = forBailOld(setOfCases.length);
		while(++i < setOfCases.length){
			let _case:MatchCase;
			tryNext();
			_case = setOfCases[i];
			if(!(_case instanceof Array))throw Error(`missing case index '${i}', got '${_case}'`)
			let condition = _case[0];
			let then = _case[1];
			let input:V|B = value;
			if(typeof then != "function")throw Error("compiler syntax error: case "+i+" is missing `V->T`");
			if(
				typeof condition == "function"?input=condition(value):
				condition instanceof Array?input=condition.includes(value):
				value == condition
				//(()=>{
					//console.error(_case[0])
					//throw Error("compiler syntax error: case " + i + " is missing `V[]|V->bool`");
				//})()
			)return then(input,value);
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
	const closingBracketMap = {"{": "}", "[": "]", "(": ")"};
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
	class Errors{//for error messages that need to mark multiple words
		constructor(data={}){Object.assign(this,data)}
		static new(type,message,comments:[WordSymbol,String][]){
			return new Errors({
				type,
				message,
				errors:comments.map(([wordSymbol,message])=>({wordSymbol,message})),
			})
		}
		type:String;
		message:String;
		errors:{wordSymbol:WordSymbol,message:String}[];//words to be underlines
		getErrorString(extraIndentation = 0):String{
			let lines = new Map();
			for(let {wordSymbol,message} of this.errors){
				lines.getOrInsert(wordSymbol.errorData.line,[]).push({wordSymbol,message});
			}
			todo()
		}
		intoError(error=e=>Error(e)):Error{
			return error(this.getErrorString());
		}
		throwError(error=e=>Error(e)){
			throw this.intoError(error);
		}
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
					"formatString",
					"number",
					"bool",
					"object",
					"null",// 'null', ';' in ';;'
					//UNUSED: "undefined",//'undefined' == '{}'
				// label
					"operator",//operators e.g. '>' '=' in '.>' '.=' ; allows for 'a.>foo' --> 'b.>,foo'
				// operator
					"comparitor",
					"pipeline",// '|>' '<|' ':>' '<:'
					"interval",// 'a..b' , 'a..=b'
					"ternary",// 'a ?& b ?| c' 'b &? a ?| c'
					"declaration",// ':' ; used for ':=' syntaxes
					"assignment",// '='
					"typeAnnotation",
					"return",// '?' '?!'
					"statement",// 'if' 'while' etc... ; statements with 'statement exp => exp'
					"autoParameter",// '#' e.g. '#', '#@', '#?' etc...
			);
			static subtype2 = EnumSymbols(//misc operators
				"regex",// 'r"..."'
				"dot",// '.' '#.'
				// bracket
					"struct",// `(`
					"array",// `[`
					"block",// `(`
			);
			static AfixType = {//e.g. '!a' is prefix --> '0b01'
				nofix:0b00,//'a'
				postfix:0b10,//'a++'
				prefix:0b01,//'++a'
				infix:0b11,//'a+b'
				operatorWithBothArgs:0b11,//default value
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
									word.match(/^\($/) ? {type:SyntaxTree.type.bracket,subtype:SyntaxTree.subtype.open,subtype2:SyntaxTree.subtype2.struct} :
									word.match(/^\[$/) ? {type:SyntaxTree.type.bracket,subtype:SyntaxTree.subtype.open,subtype2:SyntaxTree.subtype2.array} :
									word.match(/^\{$/) ? {type:SyntaxTree.type.bracket,subtype:SyntaxTree.subtype.open,subtype2:SyntaxTree.subtype2.block} :
									word.match(/^[)\]}]$/) ? {type:SyntaxTree.type.bracket,subtype:SyntaxTree.subtype.closed} :
									word.match(/^r(?:"|r#+")/) ? {type:SyntaxTree.type.value,subtype:SyntaxTree.subtype.string,subtype2:SyntaxTree.subtype2.regex,afix:SyntaxTree.AfixType.nofix}:
									word.match(/^f(?:"|r#+")/) ? {type:SyntaxTree.type.value,subtype:SyntaxTree.subtype.formatString,afix:SyntaxTree.AfixType.nofix}:
									word.match(/^"|^r#+"/) ? {type:SyntaxTree.type.value,subtype:SyntaxTree.subtype.string,afix:SyntaxTree.AfixType.nofix}:
									word.match(/^(?:0[xo]?|[0-9])/) ? {type:SyntaxTree.type.value,subtype:SyntaxTree.subtype.number,afix:SyntaxTree.AfixType.nofix} :
									word.match(/^(?:NaN|Infinity)$/) ? {type:SyntaxTree.type.value,subtype:SyntaxTree.subtype.number,afix:SyntaxTree.AfixType.nofix} :
									word.match(/^(?:true|false)$/) ? {type:SyntaxTree.type.value,subtype:SyntaxTree.subtype.bool,afix:SyntaxTree.AfixType.nofix} :
									word.match(/^null$/) ? {type:SyntaxTree.type.value,subtype:SyntaxTree.subtype.null,afix:SyntaxTree.AfixType.nofix} :
									//word.match(/^undefined$/) ? {type:SyntaxTree.type.value,subtype:SyntaxTree.subtype.undefined,afix:SyntaxTree.AfixType.nofix} :
									word.match(/^(?:([+\-*%&|^~])\1?|>{1,3}|<{1,2}|[!\/<>])$/) ? {type:SyntaxTree.type.operator} ://numerical operators
									word.match(/^([!<>]=?|[!=]?==)$/) ? {type:SyntaxTree.type.operator} :
									word.match(/^(?:\?[&|]|[&]\?)$/) ? {type:SyntaxTree.type.operator,subtype:SyntaxTree.subtype.ternary} ://ternary operators
									word.match(/^(?:=>|->)$/) ? {type:SyntaxTree.type.operator} :
									word.match(/=$/) ? {type:SyntaxTree.type.operator,subtype:SyntaxTree.subtype.assignment} ://e.g. '=' '+='
									word.match(/^:$/) ? {type:SyntaxTree.type.operator,subtype:SyntaxTree.subtype.declaration} :
									word.match(/^::$/) ? {type:SyntaxTree.type.operator,subtype:SyntaxTree.subtype.typeAnnotation} ://type operator
									word.match(/^(?:[|:]>)$/) ? {type:SyntaxTree.type.operator,subtype:SyntaxTree.subtype.pipeline,isReversed:false} ://'|>' or ':>'
									word.match(/^(?:<[|:])$/) ? {type:SyntaxTree.type.operator,subtype:SyntaxTree.subtype.pipeline,isReversed:true} ://'<|' or '<:'
									word.match(/^,$/) ? {type:SyntaxTree.type.operator} ://','
									word.match(/^¬$/) ? {type:SyntaxTree.type.operator} ://'¬'
									word.match(/^\?!?$/) ? {type:SyntaxTree.type.operator,subtype:SyntaxTree.subtype.return} ://
									word.match(/^£$/) ? {type:SyntaxTree.type.operator}://void operator
									word.match(/^(?:\.|#\.)$/) ? {type:SyntaxTree.type.operator,subtype2:SyntaxTree.subtype2.dot} ://dot operator 
									word.match(/^(?:#\.)$/) ? {type:SyntaxTree.type.operator,subtype:SyntaxTree.subtype.autoParameter,subtype2:SyntaxTree.subtype2.dot} ://dot operator 
									word.match(/^\.\.=?$/) ? {type:SyntaxTree.type.operator,subtype:SyntaxTree.subtype.interval} ://interval '1..3'
									word.match(/^(?:ref)$/) ? {type:SyntaxTree.type.operator} :
									word.match(/^@$/) ? {type:SyntaxTree.type.operator} :
									word.match(/^(?:\\)$/) ? {type:SyntaxTree.type.operator} :
									word.match(/^(?:\$\$)$/) ? {type:SyntaxTree.type.operator} :
									word.match(/^(?:\.\.\*)$/) ? {type:SyntaxTree.type.operator} :
									word.match(/^`$/) ? {type:SyntaxTree.type.operator}:
									word.match(/^#(?:\.\.|[#@!?/\\])?$/) ? {type:SyntaxTree.type.operator,afix:SyntaxTree.AfixType.nofix} ://'#' or '##' or '#@' in: '#name' '##'
									word.match(/^\$$/) ? {type:SyntaxTree.type.operator} ://'$type' '$key'
									word.match(/^[$@*]\*$/) ? {type:SyntaxTree.type.operator,afix:SyntaxTree.AfixType.prefix}://'@*' in '@* = (a=1,b=2,c=3)'
									word.match(/^\.\.\.$/) ? {type:SyntaxTree.type.operator} :
									word.match(/^(?:if|while|for|match)$/) ? {type:SyntaxTree.type.operator,subtype:SyntaxTree.subtype.statement} :
									word.match(/^(?:break|continue|return|catch|assert|as|is)$/) ? {type:SyntaxTree.type.operator} :
									word.match(/^(?:mod)$/) ? {type:SyntaxTree.type.operator} :
									word.match(/^in$/) ? {type:SyntaxTree.type.operator} :
									word.match(/^(?:else|do)$/) ? {type:SyntaxTree.type.operator} :
									word.match(/^\w+$/) ? {type:SyntaxTree.type.label,afix:SyntaxTree.AfixType.nofix} :
									word.match(/^[;]$/) ? {type:SyntaxTree.type.sepparator} :
									word.match(/^"$/) ? {type:SyntaxTree.type.symbol} ://extra '"'s are caught and are handled later on
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
					let numberMatches = numberString.match(/(^.*?)(?:([IUF])([8|16|32|64|128|size])?)?$/)??[];
					assert(numberMatches.length >= 2,"invalid number '" + wordSymbol + "'");
					let valueString = numberMatches[1];
					let type:""|"I"|"U"|"F" = numberMatches[2] ?? "";
					let size:null|Number = numberMatches[3] ? +numberMatches[2] : null;
					if(type[0] == "I" && numberString.includes("."))wordSymbol.throwError("syntax", "integers cannot have a decimal point", e=>Error(e));
					if(type[0] == "U" && numberString.includes("."))wordSymbol.throwError("syntax", "unsigned integers cannot have a decimal point", e=>Error(e));
					let value;
					if(size == null || size <= javascriptIntSize)value = +valueString;
					else {todo("remove this `else`branch. this untyped language does not have(or need) number types")
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
					let isExtraLiteralString = !!wordSymbol.word.match(/^r?r#/);
					let isRegex = wordSymbol.subtype2 == SyntaxTree.subtype2.regex;
					let string = wordSymbol.word.match(/^r?(?:r#+)?"([\s\S]*)"#*/)[1]
						.replace(/^\n/,"")
						.replaceAll(/(?:\n|^)\t*/g,v=>"\n"+v.substr(wordSymbol.indent+1))
						.replaceAll("\n","\\n")
						.replaceAll("\t","\\t")
					;
					if(isExtraLiteralString||isRegex){
						string = string.replaceAll("\\","\\\\");
					}
					string = "\"" + string + "\"";
					try{
						string = JSON.parse(string);
					}catch(err){
						wordSymbol.throwError("syntax",`invalid ${isRegex?"regex":"string"} got error:"${err}"`,a=>Error(a))
					}
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
						if(wordSymbol.subtype == SyntaxTree.subtype.string || wordSymbol.subtype == SyntaxTree.subtype.formatString)
							wordSymbol.value = getString(wordSymbol);
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
//----
//main compiler logic
	const parseIntoOperatorSyntaxTree:Function = (()=>{
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
						"#"       :{afix:OperatorData.AfixType.nofix},
						"##"      :{afix:OperatorData.AfixType.nofix},
						"#@"      :{afix:OperatorData.AfixType.nofix},
						"#?"      :{afix:OperatorData.AfixType.nofix},
						"#!"      :{afix:OperatorData.AfixType.nofix},
						"#."      :{afix:OperatorData.AfixType.nofix},
						"#/"      :{afix:OperatorData.AfixType.nofix},
						"#\\"     :{afix:OperatorData.AfixType.nofix},
						"#.."     :{afix:OperatorData.AfixType.nofix},
						":"       :{afix:OperatorData.AfixType.nofix},
						"::"      :{afix:OperatorData.AfixType.nofix},
					},
					{//consumes a key_exp
						"$"       :{afix:OperatorData.AfixType.prefix},
						"#"       :{afix:OperatorData.AfixType.prefix},
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
					},
					{
						"("       :{afix:OperatorData.AfixType.postfix},
						"["       :{afix:OperatorData.AfixType.postfix},
						"{"       :{afix:OperatorData.AfixType.postfix},
						"`"       :{afix:OperatorData.AfixType.postfix},//early return
						"."       :{afix:OperatorData.AfixType.infix,parameter:OperatorData.left},
						"?."      :{afix:OperatorData.AfixType.infix,parameter:OperatorData.left},//same as in javascript's `option?.property`
					},
					{
						","       :{afix:OperatorData.AfixType.infix,optionalArg:[0,1],isInverseBracketing:true},
						",\x00"   :{afix:OperatorData.AfixType.postfix},
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
						"¬"       :{afix:OperatorData.AfixType.infix,parameter:OperatorData.right},
					},
					{
						"**"      :{afix:OperatorData.AfixType.infix},
						"%%"      :{afix:OperatorData.AfixType.infix},
					},
					{
						"*"       :{afix:OperatorData.AfixType.infix,optionalArg:[1,1]},
						"/"       :{afix:OperatorData.AfixType.infix,optionalArg:[1,1]},
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
						"?|"      :{afix:OperatorData.AfixType.infix},//ternary operator
					},
					{
						":"       :{afix:OperatorData.AfixType.infix,optionalArg:[0,1]},//variable declarator and type operator
						":\x00"   :{afix:OperatorData.AfixType.prefix},//variable declarator and type operator
						"::"      :{afix:OperatorData.AfixType.infix,optionalArg:[0,1]},//variable declarator and type operator
						"::\x00"  :{afix:OperatorData.AfixType.prefix},//variable declarator and type operator
					},
					{
						"=>"      :{afix:OperatorData.AfixType.infix,optionalArg:[1,0]},
					},
					{
						"="       :{afix:OperatorData.AfixType.infix,isInverseBracketing:true},//'a=(b=c)' instead of '(a=b)=c'
						"=\x00"   :{afix:OperatorData.AfixType.prefix,isInverseBracketing:true},//'a=(b=c)' instead of '(a=b)=c'
						"\\"      :{afix:OperatorData.AfixType.prefix,optionalArg:[0,1]},//function
						"/"       :{afix:OperatorData.AfixType.prefix,optionalArg:[0,1]},//class
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
						"@"       :{afix:OperatorData.AfixType.prefix},
						"!<"      :{afix:OperatorData.AfixType.prefix},
						"!>"      :{afix:OperatorData.AfixType.prefix},
						"mod"     :{afix:OperatorData.AfixType.prefix},
						"ref"     :{afix:OperatorData.AfixType.prefix},
					},
					{
						"¬":{afix:OperatorData.AfixType.infix,parameter:OperatorData.left},
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
			possibleAfix = 0b11;//:Expression.afix
			afix;//:Expression.afix
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
							[[SyntaxTree.subtype.bool],()=>({
								value:match(wordSymbol.word,[["true",()=>true],["false",()=>false]]),
							})],
							[[SyntaxTree.subtype.string],()=>todo(wordSymbol)],
							[[SyntaxTree.subtype.formatString],()=>todo(wordSymbol)],
							[[SyntaxTree.subtype.number],()=>todo(wordSymbol)],
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
					let expression;
					({index:i,expression} = this.expression(i,parent));
					if(expression !== undefined){
						assert(expression !== null && expression instanceof Expression);
						expressions.push(expression);
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
								new Expression.Bracket(word,{
									contence:contexts.expressions(0,word),
									operatorData:operatorProceedence[word.word].postfix,//non-functioncall brackets (e.g.`;();` instead of `foo()`) are handled as a special case later on.
									afix:isCanHaveLeftArgument(i,true)?
										SyntaxTree.AfixType.postfix:
										SyntaxTree.AfixType.nofix,
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
								if([SyntaxTree.subtype.assignment,SyntaxTree.subtype.declaration].includes(word.subtype)){//handles ':' and '=' and their compound patterns ':=' in 'a:T=b'
									let isStart = i == 0 || "\\".includes(words[i-1].word);// '{=' or '\:' ; no left argument
									let possibleAfix:u2&Bool[2] = 0b11;//:u2&[has_left_arg,has_right_arg]
									if(isStart){
										possibleAfix &= ~SyntaxTree.AfixType.operatorWithLeftArg;
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
									let possibleAfix = 0b11;
									if(!isCanHaveLeftArgument(i))possibleAfix &= ~SyntaxTree.AfixType.operatorWithLeftArg;
									if(//checks for right argument ; '+b' / 'a+b'
										!hasArg(words[i+1]) ||
										words[i+1]?.type == SyntaxTree.type.operator &&
										(//if words[i+1]'s left argument cannot be removed
											!(operatorProceedence[words[i+1]].prefix||operatorProceedence[words[i+1]].nofix) &&
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
													possibleAfixes.postfix?.optionalArg?.[1] || !!(possibleAfix&OperatorData.AfixType.operatorWithLefArg)
												)?possibleAfixes.postfix
												:(
													possibleAfixes.prefix?.optionalArg?.[1] || !!(possibleAfix&OperatorData.AfixType.operatorWithRightArg)
												)?possibleAfixes.prefix
												:possibleAfixes.nofix
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
											exps[i-1].wordSymbol.word == "\\"
											|| (exps[i-1].afix&Expression.AfixType.operatorWithRightArg)
											&& !exps[i-1].args?.[1])
									)
									|| (excludeAssignmentOperator && exp.wordSymbol.subtype == SyntaxTree.subtype.assignment)
									|| (excludeDeclarationOperator && exp.wordSymbol.subtype == SyntaxTree.subtype.declaration)
							}
							function isOptionalArgument(exp,j){
								return exp?.operatorData?.optionalArg?.[j] || exp?.wordSymbol?.subtype == SyntaxTree.subtype.declaration;
							}
							function missingOperatorError(selfExp,argExp,argIndex){
								if(0)console.error(printTree(exps));
								selfExp.wordSymbol.throwError("syntax",`operator '${selfExp.wordSymbol}' missing ${["left", "right"][argIndex]} argument`,e=>Error(e));
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
									selfExp.wordSymbol.subtype2 == SyntaxTree.subtype2.dot//'a.=b' '#.'
									&& argExp.wordSymbol.type == SyntaxTree.type.label
									&& argExp.wordSymbol.subtype == SyntaxTree.subtype.operator
									&& !(exps[i+1].afix & Expression.AfixType.operatorWithLeftArg)
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
								if(exp.wordSymbol.word == "\\"){//handle function parameter pattern `\exp#exp#exp:exp;`
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
										collectIntoTree(i1,exp.operatorData.proceedence[1],exps);
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
									collectIntoTree(i1,exp.operatorData.proceedence[1],exps,false,isParameter);
								}
								else if(exp.wordSymbol.word == "£"){
									collectIntoTree(i+1,exp.operatorData.proceedence[1],exps,false,false);
									exp.args[1] = exps.splice(i+1,1)[0];
									if(!exp.args[0] && !!exps[i+1]){//e.g. `a + £{...} b` --> `a+b`
										exp.args[0] = exps.splice(i+1,1)[0];
										exp.isReverseOrder = true;
									}
								}
								else{
									collectIntoTree(i+1,exp.operatorData.proceedence[1],exps,exp.wordSymbol.subtype == SyntaxTree.subtype.typeAnnotation,isParameter);
									const argExp = tryGetNewAddableArg();
									exp.args[1] = argExp;
									handleDotOperatorRightSideArgument(exps,i);
									if(exp.wordSymbol.word == "/" && exps[i+1]?.wordSymbol.word == "\\"){//'/(...)\(...)' ; handle classes with constructor functions
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
												if(selfExp.wordSymbol.word == "::" && j == 1 && ":=".includes(argExp.wordSymbol.word)){// 'a::T+U:3' ; type syntax is only stopped by '=' or ':' ;
													//then ignore
													return;
												}
												if(":=".includes(selfExp.wordSymbol.word) && j == 0 && argExp.wordSymbol.word == "::"){
													addArg();
													return;
												}
												if(
													selfExp.wordSymbol.subtype == SyntaxTree.subtype.declaration
													|| j == 1 && selfExp.afix == Expression.AfixType.prefix//allow for '1+if a => 0'
												){//does both arguments of ':' before the '=' to allow 'a:T=b' --> '(a:T)=b' and prevent 'a:(T=b)'
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
						collectIntoTree(0,maxProceedence,exps);
					}
				}
				if(exps.length > 1){
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
				return {index:i,expression:exps[0]};
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
	})();
	//const InferedProperty = Symbol("`.b` ; infered")//`.b`
	function getNumberOfWords(rootPattern:Expression[]){
		return !rootPattern[0]?0:rootPattern[0].wordSymbol.errorData.file.words.length;
	}
	function parseAST(rootPattern:Expression[]):Expression[]{//static code parsing to add extra info ; handles function parameter indexes
		const {Expression} = parseIntoOperatorSyntaxTree;
		const numberOfWords = getNumberOfWords(rootPattern);
		link_up_auto_parameters:{//links '#' patterns with their respective function/statement
			class Context_parseAST{
				function:{autoParameterIndex:uint};
				get functionExp(){return this.parameters["#\\"]}
				statements:Expression<SyntaxTree.subtype.Statement|Any>[] = [];//operators that use '#@'; each '#@' refers to a different one
				parameters:{
					"#?"?:&Expression,
					"#!"?:&Expression,
					"#/"?:&Expression,
					"#\\"?:&Expression,
					"#.."?:&Expression,
				} = {};
			};
			interface Expression{//Expression<SyntaxTree.subtype.autoParameter>
				autoParameterIndex?:Number&Index;//for '#name' and '##'
				paramRef?:&Expression;//for '#?', '#@', etc...
			}
			function forEachExp(exps:Expression[],context:Context_parseAST,paramPath?:ParamPath){//`...` in `(...)`
				for(let exp of exps)if(!!exp)forEachExpSingle(exp,context,paramPath)
			}
			function forEachExpSingle(exp:Expression,context:Context_parseAST,paramPath?:ParamPath){
				function throwMissingPropertyError(dotExpression){//`(a.b.c).`
					dotExpression.wordSymbol.throwError("syntax","missing property at the end of property chain",e=>Error(e));
				}
				match(exp.wordSymbol.type,[
					[[SyntaxTree.type.value,SyntaxTree.type.label],_=>{}],
					[[SyntaxTree.type.bracket],_=>{
						const bracket = exp;
						forEachExp(exp.contence,context,paramPath)
					}],
					[[SyntaxTree.type.operator],_=>{
						if(exp.wordSymbol.subtype == SyntaxTree.subtype.autoParameter){
							let parentExp = match(exp.wordSymbol.word,[
								[["#@"],_=>exp.paramRef = context?.statements?.pop()],
								[["#","##"],_=>{
									exp.autoParameterIndex = context.function.autoParameterIndex++
									return exp.paramRef = context.functionExp;
								}],
								[["#?","#!","#.","#/","#\\","#.."],_=>{
									exp.paramRef = context.parameters[exp.wordSymbol.word]?.pop();
									return exp.paramRef;
								}],
							]);
							if(!exp.paramRef)exp.wordSymbol.throwError("syntax","missing statement for parameter",e=>Error(e))
						}
						function addStatementParameter(parameterName,numOfParameters = 1){
							let newParmaters = {...(context.parameters??{})};
							let newContext = {...context,parameters:newParmaters};
							if(parameterName == "#@"){
								for(let i=0;i<numOfParameters;i++)context.statements.push(exp)
							}
							else{
								newParmaters[parameterName] = exp;
							}
							forEachExp(exp.args,newContext,paramPath);
						}
						match(exp.wordSymbol.word,[
							["\\",()=>addStatementParameter("#\\")],
							[["if", "else"],()=>addStatementParameter("#?")],
							["for",()=>addStatementParameter("#@5")],
							["if",()=>addStatementParameter("#?")],
						],()=>{
							forEachExp(exp.args,context,paramPath);
						})
					}],
					[[SyntaxTree.type.sepparator],()=>assert.impossible("is removed by AST generator")],
				])
			}
			forEachExp(rootPattern,new Context_parseAST(),null)
		}
		return rootPattern;
	}
	javascript_mods:{
		Object.assign(Array.prototype,{
			call(index){return this[arg]},
		})
	}
	function runAST(rootPattern:Expression[]):Expression[]{
		const {Expression} = parseIntoOperatorSyntaxTree;
		const numberOfWords = getNumberOfWords(rootPattern);
		//classes:
			interface Expression{
				typeAnnotation?:Expression<"::"> & Tree<Expression>;
			}
			const assignSymbol = Symbol("a = b");//allows custom assignment function
			
			type Name = String|Symbol|Index;
			type Index = Number&Int;
			type Index<array> = Number&Int;//index on object `array`
				//where: array[index] : Valid
			type Value =
				PropertyRef<false>|
				Value_Storable
			;
			type Value_Assignable = 
				PropertyRef<false>|
				Value_Storable
			;
			type Value_Storable =
				PropertyRef<true>|
				Value_Derefed
			;
			type Value_Derefed = 
				ObjectValue|
				Name|
				Index|
				JavascriptValue
			;
			type PropertyRef<isStorable=true|false> = PropertyRef & {isStorable};
			type Value_Javascript = Any & (
				Number|
				String|
				Array<Any>|
				Object|//JSON-like object
				Function|
				null
			);
			const isSearched = Symbol();
			class PropertyParentPair{
				constructor(data={}){Object.assign(this,data);}
				parent:Object|Array;
				name:Name|Index;
				value:Option<Value>;//where: value == parent[name]
				errorWordSymbol?:WordSymbol;
				valueExists:bool = true;//used by Namespace
					//:false --> `a:...` can only be declared ; true --> variable already exists
				get(){//: this:Invalid
					return this.value;
				}
				set(value):Value&consumes<this>{//: this:Invalid
					this.parent[this.name] = value;
					return value;
				}
			}
			class PropertyRef extends PropertyParentPair{//:Value ; used in expressions
				constructor(data={}){super();Object.assign(this,data);}
				isStorable:bool = false;
				static new(data:Option<PropertyParentPair>):Option<PropertyRef>{
					return data && new PropertyRef(data);
				}
				deref(){return this.isStorable?this:this.get();}
				derefFully(){return derefValueFully(this.get());}//ignores storable PropertyRefs
			}
			class Value{}
			class FunctionObj{
				constructor(data={}){Object.assign(this,data);}
				toTree(){return this.exp.toTree();}
				toString(){return "\\ function";}
				context:Context;
				exp:Expression<"\\">;
			}
			class ClassObj extends FunctionObj{
				constructor(data={}){super();Object.assign(this,data);}
				toString(){return "/ class";}
				toTree(){return this.exp.args.slice(1)}
				context:Context;
				exp:Expression<"\\">;
			}
			class Context{
				static ContextType = EnumSymbols("default","if","match","case");
				static ParameterSymbols = EnumSymbols("#@","#?","#!","##","#/","#\\");
				namespace:Namespace = new Namespace();
				module:&Module;
				contextType:ContextType = Context.ContextType.default;
				arguments:Map<ParameterSymbols,Value[]|Value> = {};
				functionParameters?:(PropertyParentPair&LinkedList)[];
				constructor(data={}){Object.assign(this,data)}
				new_child(data={}){
					return new Context({...this,...data});
				}
				new_child_namespace(data={},namespaceData={}){
					return new Context({...this,namespace:new Namespace({parent:this.namespace,...namespaceData}),...data});
				}
				clone(){
					new Context(this);
				}
			}

			class ObjectValue{
				constructor(data={}){Object.assign(this,data);}
				properties:Object&Map<Name,Value> = {};
				array:Value[] = [];
				prototypes = null;
				call(_self,arg_name:Value):Value{//same use as method 'Function.prototype.call' ; used for function calls
					let name = try_getPropertyValue(this,arg_name);
					if(typeof name == "number")return this.array[name];
					return PropertyRef.new(try_getPropertyData(this,derefValue(name)));
				}
			}
			class Namespace{
				constructor(data={}){Object.assign(this,data)}
				parent?:Namespace&Tree<Namespace> = null;
				variables:ObjectValue | Object&Map<Name,Value> = {};
				new_child(data={}){
					return new Namespace({parent:this,...data});
				}
				getVariableRef(name:Name,isDeclaration):Option<PropertyParentPair> & PropertyParentPair|null{
					//assume: this.parent:Tree<Namespace> ; it will stack overflow otherwise (i.e. will not crash computer from RAM use)
					
					let propertyData = this.getVariableSelf(name)??null;
					if(!isDeclaration && propertyData?.valueExists === false)
						return this.parent?.getVariableRef(name)??null;
					return propertyData;
				}
				getVariableRefOrDeclareData(name:Name):Option<PropertyParentPair>{
					return this.getVariableRef(name)??try_getPropertyData(this.variables,name);
				}
				getVariableSelf(name):Option<PropertyParentPair>{
					return try_getPropertyData(this.variables,name);
				}
				assignVariable(name:Name,value:Value):Option<Value>{
					return this.getVariableRef(name,true)?.set?.(value)??null;
				}
				declareVariable(name:Name,value?:Value){
					todo.silent("handle modules");
					todo.silent("allow `a:(b:2);a.b=4;assert a[0]==a.b`; linking property and tuple index; maybe add a index<-->name' map")
					return this.assignVariable(name,value??null);
				}
			}
			class ModuleObj{
				privateSymbolMap:Map<String,Symbol>;
			}
			class Destruture{
				constructor(data={}){Object.assign(this,data);}
				parameterName:Name;//`a` in `(b:a):obj` or `(b:${exp}):obj`

			}
		//----
		const AllPrivateSymbols = Symbol("a.$*");
		const AllSymbols = Symbol("a.*");
		const NullSymbol = Symbol("$null");
		const compilerOnlySymbols = [isSearched];//symbols that can both be {added to variables} and {that should not be accessable by the language user}
		const evalCode = {
			forEach_exps(exps:Expression[],context:Context,forEachFunction?:(value)=>void):Option<Value>{//`...` in `{...}`
				let lastValue;
				let hasSepparator = false;
				for(let exp of exps){
					let value = evalCode.statement(exp,context);
					hasSepparator = exp.hasSepparator;
					if(exp.wordSymbol.word == "£" && !exp.args[0])continue;
					lastValue = value;
					forEachFunction?.(value);
				}
				return hasSepparator?null:lastValue;
			},
			statement(exp:Option<Expression>,context:Context):Value{
				assert(!!context)
				if(!exp)return undefined;
				return match(exp.wordSymbol.type,[
					[SyntaxTree.type.value,()=>match(exp.wordSymbol.subtype,[
						[[
							SyntaxTree.subtype.string,
							SyntaxTree.subtype.number,
							SyntaxTree.subtype.bool,
							SyntaxTree.subtype.object,
							SyntaxTree.subtype.null,
						],()=>exp.wordSymbol.value],
						[SyntaxTree.subtype.formatString,()=>todo("handle format strings")],
					])],
					[SyntaxTree.type.label,()=>PropertyRef.new(context.namespace.getVariableRef(exp.wordSymbol.word))],
					[SyntaxTree.type.bracket,()=>match(exp.wordSymbol.word,[
						["{",()=>{
							let i=0;
							const firstStatement:Option<Expression> = exp.contence[0];
							const blockExp = exp;
							let lastStatementToEval:Option<Expression> = null;//executes expression at the end ; `{=last_exp;...}` ; e.g. `{=c;a;b}`
							const innerContext = context.new_child_namespace();
							if(!firstStatement?.args?.[0]&&[":", "::", "="].includes(firstStatement?.wordSymbol?.word)){//'{=exp;}'
								match(firstStatement?.wordSymbol?.word,[
									["::",()=>{blockExp.typeAnnotation = firstStatement}],
									[":",()=>{
										if(":=".includes(firstStatement.args[1]?.wordSymbol?.word)){
											lastStatementToEval = firstStatement.args[1];
										}
										evalCode.declareVariables(firstStatement.args[1],undefined,innerContext);
									}],
									["=",()=>{
										lastStatementToEval = firstStatement;
									}],
								],()=>{});
								i+=1;
							}
							let lastValue = evalCode.forEach_exps(blockExp.contence,innerContext);
							if(lastStatementToEval)lastValue = evalCode.statement(lastStatementToEval,innerContext);
							return lastValue;
						}],
						[["[","("],()=>{
							let functionObj:Option<Value> = undefined;
							let isFunctionCall = false;
							if(exp.afix == Expression.AfixType.postfix){//function call
								isFunctionCall = true;
								functionObj = evalCode.statement(exp.args[0],context);
							}
							let variable = new ObjectValue();
							let namespaceObj = new Namespace({parent:context.namespace,variables:variable});
							let innerContext = context.new_child({namespace:namespaceObj});
							const bracket_exp = exp;
							void evalCode.forEach_exps(bracket_exp.contence,context,value=>{
								if(!(bracket_exp.wordSymbol.word=="("&&exp.wordSymbol.word==":")){
									variable.array.push(value);//for tuples, pattern `a:b` does not add item
								}
							});
							if(isFunctionCall){
								todo.silent("BODGED; handle pipe operators");
								return functionCall(functionObj,variable);
							}
							return variable;
						}],
					])],
					[SyntaxTree.type.operator,()=>{
						const args = exp.args;
						const [x,y] = args;//for numeric operators
						function numericOperator(foo:(x:Value,y:Value)=>Value):Value{
							return foo(
								derefValue(evalCode.statement(x,context)),
								derefValue(evalCode.statement(y,context)),
							);
						}
						return match(exp.wordSymbol.word,[
							["\\",()=>new FunctionObj({exp,context})],//function `\exp`
							[word=>word=="/"&&exp.afix == Expression.AfixType.prefix,()=>new ClassObj({exp,context})],//class `/exp`
							[":",()=>{
								let declaredValues = evalCode.declareVariables(exp.args[0],exp.args[1],context);
								return declaredValues;
							}],
							["=",()=>{
								let assignedValues = evalCode.assignVariables(exp.args[0],exp.args[1],context);
								return assignedValues;
							}],
							[".",()=>{
								let parent = derefValue(evalCode.statement(exp.args[0],context));
								let value;
								let propertyNameValue:Name|Value;
								assume(!!exp.args[1]);
								propertyNameValue = exp.args[1].wordSymbol.type == SyntaxTree.type.label?
									exp.args[1].wordSymbol.word:
									derefValue(evalCode.statement(exp.args[1],context))
								;
								if(parent == null){//TODO:silent this error
									exp.wordSymbol.throwError("null",`unable to get properties on '${parent}'`,e=>Error(e));
								}
								value = try_getPropertyValueRef(parent,propertyNameValue);
								if(!!exp.args[2]){//`array.= \exp`
									value = functionCall(value,evalCode.statement([exp.args[2]],context),todo.silent("get `#.` from namespace's class instance object"));
								}
								return value;
							}],
							["$$",()=>Symbol("unique `$$`")],
							["$",()=>{
								let value = evalCode.statement(exp.args[1],context);
								let name:Name = value instanceof PropertyRef?value.name:undefined;
								value = derefValueFully(value);
								match(value,[
									[null,()=>NullSymbol],
									[()=>
										value instanceof ObjectValue||
										value instanceof PropertyRef||
										!!value && typeof value == Object,
										()=>object[ObjectAsSymbol]??=Symbol(name??object instanceof Array?"[...]":"{...}")
									],
								],value);
							}],
							["£",()=>{//`a£b` --> `a`
								const isReverseOrder = exp.isReverseOrder;
								const evaluationOrder:Expression[2] = isReverseOrder?[exp.args[1],exp.args[0]]:exp.args;
								const values = evaluationOrder.map(arg_exp=>evalCode.statement(arg_exp,context));
								return isReverseOrder?values[1]:values[0];
							}],
							[word=>word == "&" && Expression.AfixType.postfix.includes(exp.afix),()=>{//'a&' reference
								let value:Value = evalCode.statement(exp.args[0]??exp.args[1],context);
								if(value instanceof PropertyRef)value.isStorable = true;
								return value;//BODGED
							}],
							[word=>word == "&" && Expression.AfixType.prefix.includes(exp.afix),()=>{//'&a' linked property similar to the C code `&int a = &b`
								let value:Value = evalCode.statement(exp.args[0]??exp.args[1],context);
								todo.silent("handle `&a` references properly");
								return value;//BODGED
							}],
							...[//numeric and logical operators:
								[
									word=>exp.afix == Expression.AfixType.infix &&
									word.match(/[+\-*%&|^\/]|>{1,3}|<{1,2}/),
									()=>numericOperator(
										new Function("x,y",`return x ${exp.wordSymbol.word} y`)
									)
								],
								[//nor
									word=>exp.afix == Expression.AfixType.infix && word == "~",
									()=>numericOperator((x,y)=>~(x|y))
								],
								[//logical nor
									word=>exp.afix == Expression.AfixType.infix && word == "~~",
									()=>todo("handle logical nor, with lazy evaluation")//numericOperator((x,y)=>x||y)
								],
								[//logical xor
									word=>exp.afix == Expression.AfixType.infix && word == "^^",
									()=>numericOperator((x,y)=>!x?y:!y?x:false)
								],
								[//comparisons ; `a==b==c` --> `{a==b} && {b==c}`
									word=>exp.afix == Expression.AfixType.infix &&
									word.match(/[<>]=?|[!=]==?/),
									()=>{
										function handleComparisonChain(exp){
											if(exp.afix == Expression.AfixType.infix && exp.wordSymbol.word.match(/[<>]=?|[!=]==?/)){
												const foo = new Function("x,y",`return x ${exp.wordSymbol.word} y`);
												return foo(
													derefValue(handleComparisonChain(exp.args[0])),
													derefValue(handleComparisonChain(exp.args[1])),
												);
											}else{
												return evalCode.statement(exp,context);
											}
										}
										return handleComparisonChain(exp);
									},
								],
								[
									word=>exp.afix == Expression.AfixType.prefix &&
									word.match(/[+\-~]/),
									()=>numericOperator(
										new Function("_,x",`return ${exp.wordSymbol.word} x`)
									)
								],
								[
									word=>exp.afix == Expression.AfixType.postfix &&
									word.match(/[+~!]/),
									()=>numericOperator(
										new Function("x,_",`return ${exp.wordSymbol.word} x`)
									)
								],
							],//----
							//keyword operators
							["=>",()=>{
								let argument = derefValue(evalCode.statement(exp.args[0],context));
								let innerContext = context.new_child();
								return match(context.contextType,[
									[[Context.ContextType.default],()=>todo("use argument as #@ in right exp")],
									[[Context.ContextType.default],()=>{
										innerContext
									}]
								]);
							}],
							["assert",()=>{
								let value = derefValue(evalCode.statement(exp.args[1],context));
								if(!value)exp.wordSymbol.throwError("assertion","assertion failed",e=>Error(e))
							}],
						],);//()=>todo.silent()
					}],
				]);
			},
			destructureObject(parameter_exp:Expression,argument_exp?:Expression,context):Object&Map<Name,Option<Value>>{
				return destructureObject_internal(parameter_exp,argument_exp,context);
			},
			destructureFunction(parameter_exps:Expression[],argument_exps:Value[]|ObjectValue,context):Map<Name,Option<Value>>{
				let parameters:Map<Name,Option<Value>> = {};
				let i = 0;
				for(let parameter_exp of parameter_exps){
					let isPublicParameter:Bool =
						parameter_exp?.wordSymbol?.word == "@" ||
						parameter_exp?.wordSymbol?.word == ":" && parameter_exp.args[0]?.wordSymbol?.word == "@"
					;
					let parameterName:Option<Name> = isPublicParameter?todo("get public parameter name"):undefined;
					let argument = isPublicParameter?try_getPropertyValue(argument_exps,parameterName):try_getPropertyValue(argument_exps,i)
					void evalCode.destructureObject_internal(parameter_exp,argument,context,parameters);
					if(!isPublicParameter)i++;
				}
				return parameters;
			},
			destructureObject_internal(parameter_exp:Expression,argument?:Value,context,currentParametersMap?:Map=undefined):Object&Map<Name,Option<Value>>{//this function is only used by the other destructure functions
				let parameters:Map<Name,Option<Value>> = currentParametersMap??{};
				function destructure(parameter_exp,argument){
					void match(parameter_exp.wordSymbol.type,[
						[SyntaxTree.type.bracket,()=>
							match(parameter_exp.wordSymbol.subtype2,[
								[SyntaxTree.subtype2.struct,()=>todo()],
								[SyntaxTree.subtype2.array,()=>todo()],
								[SyntaxTree.subtype2.block,evalCode.statement(parameter_exp,context)],
							])
						],
						[SyntaxTree.type.label,()=>
							parameters[parameter_exp.wordSymbol.word] = argument
						],
					],()=>parameter_exp)
				}
				destructure(parameter_exp,argument);
				return parameters;
			},
			declareVariables(parameter_exp:Expression,assign:Expression,context:Context):&mutate<context>{
				return this.assignVariables(parameter_exp,assign,context,true);
			},
			assignVariables(parameter_exp:Expression,assign:Expression,context:Context,isDeclaration = false):&mutate<context>{
				return match(parameter_exp.wordSymbol.type,[
					[SyntaxTree.type.value,()=>{
						if([SyntaxTree.subtype.string,SyntaxTree.subtype.formatString].includes(parameter_exp.wordSymbol.subtype)){
							todo("handle strings ; allow for e.g. `'a':b;` and `a.'b'=c;`");
						}
						parameter_exp.wordSymbol.throwError("syntax",`in ${["assignment", "declaration"][!!isDeclaration]} pattern: expected name, found value '${parameter_exp.wordSymbol.word}'.`,e=>Error(e))
					}],
					[SyntaxTree.type.label,()=>{//`a:b`
						let assignValue:Value = derefValue(evalCode.statement(assign,context));
						let name:Name = parameter_exp.wordSymbol.word;
						if(isDeclaration)return context.namespace.declareVariable(name,assignValue);
						else return context.namespace.assignVariable(name,assignValue);
					}],
					[SyntaxTree.type.bracket,()=>{//''
						todo.silent("destructure support; ")
					}],
					[SyntaxTree.type.operator,()=>
						parameter_exp.wordSymbol.throwError("syntax",`in ${["assignment","declaration"][!!isDeclaration]} pattern: expected name, found operator '${parameter_exp.wordSymbol.word}'.`,e=>Error(e))
					],
				]);
			},
		};
		function functionCall(foo:Value|PropertyRef,args:ObjectValue|Value[],self):Value{
			assert(//args:ObjectValue|Value[]
				args instanceof ObjectValue || 
				args instanceof Array && (!args[0] || args[0] instanceof ObjectValue)
			);
			const getArg0 = ()=>try_getPropertyValue(args,0);
			foo = derefValueFully(foo);//:Value
			let value:Value_Assignable&Value = match(foo,[
				[_=>typeof foo == "function",()=>{
					let argsArray:Array = try_toArray(args)??[];
					foo(...argsArray)
				}],
				[_=>foo instanceof FunctionObj, ()=>{
					let parameters = evalCode.destructureFunction(foo.exp.args[0]?.args??[],args);
					let innerContext = foo.context.new_child_namespace({functionParameters:parameters},{variables:parameters});
					let value = evalCode.statement(foo.exp.args[1],innerContext);
					return derefValue(value);
				}],
				[_=>foo instanceof ClassObj, ()=>foo(...args)],
			],()=>try_getPropertyValue(foo,getArg0()));
			return value;
		}
		//get properties & keys:
			function try_getPropertyData(parent:Value,name:Name|Index,errorWordSymbol?:WordSymbol):Option<PropertyParentPair>{
				parent = derefValue(parent);
				if(parent === null || parent === undefined){
					silentError("getting property from null object");
					return null;
				}
				const constructor:Class = Object.getPrototypeOf(parent).constructor;
				assume(parent instanceof constructor);
				return match(parent,[
					[_=>parent instanceof ObjectValue,()=>{
						if(parent[isSearched])return null;//prevent infinite loops, from recursive prototype chains
						parent[isSearched] = true;
						let data:Option<PropertyParentPair>;getData:{
							if(typeof name == "number"){//`a[i]`
								data = new PropertyParentPair({
									parent:parent.array,
									name,
									value:parent.array[name],
									errorWordSymbol,
								});
								break getData;
							}
							else if(Object.hasOwn(parent.properties,name)){
								data = new PropertyParentPair({
									parent:parent.properties,
									name,
									value:parent.properties[name],
									errorWordSymbol,
								});
								break getData;
							}
							else if(parent.prototypes){
								const asArray:Option<Value[]> = getAsArray(parent.prototypes);
								const asObject:Option<Object> = valueToPropertiesObject(parent.prototypes);
								if(asArray){
									for(const prototype of prototypes){
										if(prototype == null){silentError("null prototype");continue;}
										data = try_getPropertyData(prototype,name,errorWordSymbol);
										if(data)break getData;
									}
								}
								if(asObject){
									const keyValuePairs = [
										getAsPropertiesSymbols(asObject),//these are the main properties, the type inbuilt classes use `/...`
										getAsProperties(asObject),
									];
									for(const [key,value] of Object.keys(asObject)){
										assert(Object.hasOwn(asObject,key));
										const prototype = value;
										if(prototype == null){silentError("null prototype");continue;}
										data = try_getPropertyData(prototype,name,errorWordSymbol);
										if(data)break getData;
									}
								}
							}
							if(!data)data = new PropertyParentPair({
								parent:parent.properties,
								name,
								value:undefined,
								errorWordSymbol,
								valueExists:false,
							});
						}
						delete parent[isSearched];
						return data;
					}],
					[_=>
						parent instanceof FunctionObj ||
						parent instanceof ClassObj ||
						parent instanceof ModuleObj
					,()=>todo("handle getting/setting properties to functions")],
				],()=>new PropertyParentPair({parent,name,value:parent[name],valueExists:Object.hasOwn(parent,name)}))
			}
			function try_getPropertyValueRef(parent:Value,name_value:Value,errorWordSymbol?:WordSymbol):Value{//returns dereferenced value
				let data = try_getPropertyData(parent,derefValue(name_value),errorWordSymbol);
				return PropertyRef.new(data);
			}
			function try_getPropertyValue(parent:Value,name_value:Value,errorWordSymbol?:WordSymbol):Value{//returns dereferenced value
				let data = try_getPropertyData(parent,derefValue(name_value),errorWordSymbol);
				return data && data.get();
			}
			function getAsArray(value:Value):Option<Array>{
				if(value instanceof Array)return value;
				if(value instanceof ObjectValue)return value.array;
			}
			function valueToPropertiesObject(value:Value):Option<Object>{
				if(value instanceof ObjectValue)return value.properties;
				if(value instanceof Object)return value;
				return null;
			}
			function getAsProperties(object?:Object):[key:Name,value][]{
				if(!object)return [];
				return Object.keys(object).map(key=>[key,object[key]]);
			}
			function getAsPropertiesSymbols(object?:Object):[key:Name,value][]{
				if(!object)return [];
				assert(!(isSearched in object))
				return Object.getOwnPropertySymbols(object)
					.map(key=>[key,object[key]])
					.filter(([key,_])=>!compilerOnlySymbols.includes(key))
				;
			}
			function try_toArray(value:ObjectValue|Array|Value):Array|Value{
				return value instanceof ObjectValue?value.array:value;
			}
		//----
		//reference:
			function derefValue(value:Value|PropertyRef):Value&Value_Storable{
				if(value instanceof PropertyRef)return value.deref();
				return value;
			}
			function derefValueFully(value:Value|PropertyRef):Value&Value_Derefed{//for when 
				if(value instanceof PropertyRef)return value.derefFully();
				return value;
			}
		//----
		return evalCode.forEach_exps(rootPattern,new Context);
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
	let string = (function forEach(exp:Expression,indent=-4,parent?:Expression,isFunctionCall:bool){
		const i = indent;
		const a = exp;
		len++;
		if(!isFunctionCall && "([{".includes(a?.wordSymbol)&&a?.args?.[0]){
			return "\t".repeat(i)+"[[function call]]"+"\n"
				+forEach(a.args[0],i+1,a,true)
				+"\n"
				+forEach(a,i+1,a,true)
			;
		}
		return "\t".repeat(i)+(!a?a:
			(a.wordSymbol??a+"")// name
			+(a.toTree?// contence/arguments
				(a.toTree().length>0?"\n":"")+a.toTree().map((v,j)=>forEach(v,i+1,a)).join("\n")
				:(a.args?"\n"+a.args.map(v=>forEach(v,i+1,a)).join("\n"):"")
			)
			//+(a.contence?"\n"+a.contence.map(v=>forEach(v,i+1,a)).join((i-=1,"\n")):"")
			//+(a.args?"\n"+a.args.map(v=>forEach(v,i+1,a)).join("\n"):"")
		);
	})({args:abstractSyntaxTree,wordSymbol:"[[root]]"},0);
	return string + "\n" + len;
}
function compile(text,throwError,fileName="main file"){
	text??="";
	try{
		WordSymbol.ErrorData.throwError = throwError??(e=>{throw e});
		const syntaxTree = new SyntaxTree(text,throwError,fileName);
		class RootPattern extends WordSymbol{}
		const rootPattern:RootPattern&WordSymbol = new RootPattern({contence:syntaxTree});
		const abstractSyntaxTree:Expression[] = parseIntoOperatorSyntaxTree(rootPattern);//:mutates rootPattern
		parseAST(abstractSyntaxTree);//:mutates rootPattern
		let value = runAST(abstractSyntaxTree);
		//assert(abstractSyntaxTree == rootPattern);
		console.error(printTree(abstractSyntaxTree));
		console.error(value);
		return value;
	}
	catch(error){
		throw error;
	}
	finally{
		WordSymbol.ErrorData.throwError = (e=>{throw e});
	}
}
let {data:a,fileName} = (()=>{
	const fileName = Deno.args[0]??"temp.lang3";
	const data = getFile_expect(fileName);
	return {fileName,data};
})();
//a="a.b := 2;Coords := \(*$$:;#x:=0;#y:=0);";
if(0)compile(`a:\\a#b:a+b;a(1;2)`);
else try{compile(a)}catch(e){console.error(e)};