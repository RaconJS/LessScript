//TODO: work on 1634 `function getDeclarationFromAutoparameter` ; implementing '##' '#@' '#?' get parameters for '\', 'if', 'else' etc..
	//1263 build type class for the language's type system
//name suggetions: quad`.qd` (the Quick Unreadable And Dirty programming language), `.cr` Crunch
//TODO: add code to support '::=' making '::' have the same syntax as ':'
const words_regex = /\/\*[\s\S]*?\*\/|\/\/.*|[rf]?(?:r(#+)"[\s\S]*?"\1|"(?:\\u....|\\x..|\\.|[^"\n])*?")|[@$#]\*|(?:\?&|&\?|\|\?|\?!)|[|:]>|<[|:]|>:|::?|\\|(?:!<|!>)|=>|->|[!=]==|[><!=]=?|>{1,3}|<{1,2}|([+\-*%&|^~])\2?|#(?:\.\.|[#@?/\\])|\${1,2}|[¬\\]|\s+|[\(\[\{]|[\)\]\}]|\b(?:(?:\d|[1-9][_\d]*)(?:\.[_\d]+)?|0[box][_\dA-Fa-f]+(?:\.[_\dA-Fa-f]+)?)\b|!!!|\.\.\.|\.\.=?|\.|\b\w+\b|\S/g;//TODO: add back '#.'
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
			if(!(_case instanceof Array))throw Error(`missing case at index ${i}, got '${_case}'. May have missed a comma between cases.`)
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
	function EnumSymbols(...list:String[]):{[Item<list>]:Symbol}{
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
					"ternary",// 'a ?& b |? c', 'b &? a |? c' for 'if a=>b else c'
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
				// statement
					"allowsDoubleExp"//statement that allow for `statement exp exp`
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
									word.match(/^(?:\?&|[&|]\?)$/) ? {type:SyntaxTree.type.operator,subtype:SyntaxTree.subtype.ternary} ://ternary operators
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
									word.match(/^\.$/) ? {type:SyntaxTree.type.operator,subtype2:SyntaxTree.subtype2.dot} ://dot operator 
									word.match(/^#\.$/) ? {type:SyntaxTree.type.operator,subtype:SyntaxTree.subtype.autoParameter,subtype2:SyntaxTree.subtype2.dot} ://dot operator 
									word.match(/^\.\.=?$/) ? {type:SyntaxTree.type.operator,subtype:SyntaxTree.subtype.interval} ://interval '1..3'
									word.match(/^(?:ref)$/) ? {type:SyntaxTree.type.operator} :
									word.match(/^@$/) ? {type:SyntaxTree.type.operator} :
									word.match(/^(?:\\)$/) ? {type:SyntaxTree.type.operator} :
									word.match(/^(?:\$\$)$/) ? {type:SyntaxTree.type.operator} :
									word.match(/^(?:\.\.\*)$/) ? {type:SyntaxTree.type.operator} :
									word.match(/^`$/) ? {type:SyntaxTree.type.operator}:
									word.match(/^#(?:\.\.|[#@!?/\\])?$/) ? {type:SyntaxTree.type.operator,subtype:SyntaxTree.subtype.autoParameter,afix:SyntaxTree.AfixType.nofix} ://'#' or '##' or '#@' in: '#name' '##'
									word.match(/^\$$/) ? {type:SyntaxTree.type.operator} ://'$type' '$key'
									word.match(/^[$@*]\*$/) ? {type:SyntaxTree.type.operator,afix:SyntaxTree.AfixType.prefix}://'@*' in '@* = (a=1,b=2,c=3)'
									word.match(/^\.\.\.$/) ? {type:SyntaxTree.type.operator} :
									word.match(/^(?:if|while|match)$/) ? {type:SyntaxTree.type.operator,subtype:SyntaxTree.subtype.statement,subtype2:SyntaxTree.subtype2.allowsDoubleExp} :
									word.match(/^for$/) ? {type:SyntaxTree.type.operator,subtype:SyntaxTree.subtype.statement} :
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
						.replace(/\n\t*$/,"")
						.replaceAll(/(\n|^)(\t+)/g,(_,m1,m2)=>m1+m2.substr(wordSymbol.indent+1))
						.replaceAll("\n","\\n")
						.replaceAll("\t","\\t")
					;
					if(isExtraLiteralString||isRegex){
						string = string.replaceAll(/\\(?![nt])/g,"\\\\");
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
	const Public_Object = {
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
	};
	import {parseIntoOperatorSyntaxTree_function} from "./parseOperatorSyntaxTree.ts"//:Function
	const parseIntoOperatorSyntaxTree:Function = 
		parseIntoOperatorSyntaxTree_function(Public_Object);
	//const InferedProperty = Symbol("`.b` ; infered")//`.b`
	function getNumberOfWords(rootPattern:Expression[]){
		return !rootPattern[0]?0:rootPattern[0].wordSymbol.errorData.file.words.length;
	}
	function parseAST(rootPattern:Expression[]):Expression[]{//static code parsing to add extra info ; handles function parameter indexes
		const {Expression} = parseIntoOperatorSyntaxTree;
		const numberOfWords = getNumberOfWords(rootPattern);
		link_up_auto_parameters:{//links '#' patterns with their respective function/statement
			class Context_parseAST{
				function?:{
					autoParameterIndex:uint,
					isObscuredByInnerClass:bool,//for `exp` in `\{/exp}`
					functionExp:Expression,
				};
				statements:Expression<SyntaxTree.subtype.Statement|Any>[] = [];//operators that use '#@'; each '#@' refers to a different one
				parameters:{
					"#?"?:&Expression,
					"#!"?:&Expression,
					"#/"?:&Expression,
					"#\\"?:&Expression,
					"#.."?:&Expression,
				} = {};
			};
			const getParameterIsSingleUse = (word:String)=>match(word,[//if e.g. `#@ == #@` is always true
				["#?",()=>true],
				["#@",()=>true],
				["#!",()=>true],
				["#/",()=>true],
				["#\\",()=>true],
				["#..",()=>true],
				[["##","#"],()=>true],
				["#.",()=>true],
			]);
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
						if(exp.args)forEachExp(exp.args,context,paramPath)
					}],
					[[SyntaxTree.type.operator],_=>{
						if(exp.wordSymbol.subtype == SyntaxTree.subtype.autoParameter){
							let parentExp = match(exp.wordSymbol.word,[
								[["#@"],_=>{
									exp.paramRef = context?.statements?.pop();
									exp.autoParameterIndex = context?.statements?.length;
								}],
								[["#","##"],_=>{
									if(context.function?context.function?.isObscuredByInnerClass:!!context.parameters["#/"])return exp.paramRef = context.parameters["#/"];
									if(!context.function)return undefined;
									exp.autoParameterIndex = context.function.autoParameterIndex++;
									return exp.paramRef = context.function.functionExp;
								}],
								[["#/","#\\","#..","#?","#!","#."],_=>{//non-single use parameters ;
									if(getParameterIsSingleUse(exp.wordSymbol.word)){
										exp.paramRef = context.parameters[exp.wordSymbol.word]?.pop?.();
										exp.autoParameterIndex = context.parameters[exp.wordSymbol.word]?.length;
									}
									else{
										exp.paramRef = context.parameters[exp.wordSymbol.word]?.[0];
										exp.autoParameterIndex = context.parameters[exp.wordSymbol.word]?.length-1;
									}
									return exp.paramRef;
								}],
							]);
							if(!exp.paramRef){
								let missingStatementName = match(exp.wordSymbol.word,[
									[["#", "##", "#\\", "#.."],()=>"function"],
									[["#?"],()=>"if statement"],
									[["#\\"],()=>"class"],
								],()=>"statement");
								exp.wordSymbol.throwError("syntax",`missing ${missingStatementName} for parameter`,e=>Error(e));
							}
						}
						function addStatementParameter(parameterName,numOfParameters = 1){
							let newParmaters = {...(context.parameters??{})};
							let newContext = {...context,parameters:newParmaters};
							if(parameterName == "#@"){
								context.statements = [];
								for(let i=0;i<numOfParameters;i++)context.statements.push(exp)
							}
							else{
								newContext.parameters[parameterName] = [exp];
								if(parameterName == "#\\"){
									newContext.function = {
										autoParameterIndex:0,
										functionExp:exp,
										isObscuredByInnerClass:false,
									};
									newContext.parameters["#.."] = [exp];
								}
								else if(parameterName == "#/"){
									if(newContext.function)newContext.function.isObscuredByInnerClass = true;
									newContext.parameters["#."] = [exp];
								}
							}
							forEachExp(exp.args,newContext,paramPath);
						}
						match(exp.wordSymbol.word,[
							["\\",()=>addStatementParameter("#\\")],
							[word=>word == "/" && exp.afix == Expression.AfixType.prefix,()=>addStatementParameter("#/")],
							[["if", "else"],()=>addStatementParameter("#?")],
							["for",()=>addStatementParameter("#@")],
							["if",()=>addStatementParameter("#?")],
						],()=>{forEachExp(exp.args,context,paramPath);})
					}],
					[[SyntaxTree.type.sepparator],()=>assert.impossibleCase("is removed by AST generator")],
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
		for(let i of [
			"E" , "LN10" , "LN2" , "LOG10E" , "LOG2E" , "PI" , "SQRT1_2" , "SQRT2" , "TAU" , "abs" , "acos" , "acosh" , "asin" , "asinh" , "atan" , "atan2" , "atanh" , "cbrt" , "ceil" , "clz32" , "cos" , "cosh" , "exp" , "expm1" , "floor" , "fround" , "hypot" , "imul" , "log" , "log10" , "log1p" , "log2" , "max" , "min" , "pow" , "random" , "round" , "sign" , "sin" , "sinh" , "sqrt" , "tan" , "tanh" , "tau" , "trunc"	
		]){
			if(typeof Math[i] == "function"){
				if(Math[i].length == 1)
					Object.defineProperty(Number.prototype,i,{
						get(){return Math[i](this)},
						enumerable: false,
						configurable: true,
					});
				else
					Number.prototype[i] = function(...args){
						return Math[i](this,...args);
					};
			}
			globalThis[i] = Math[i];//Object.assign(window,Math);
		}
	}
	function runAST(rootPattern:Expression[]):Expression[]{
		const {Expression} = parseIntoOperatorSyntaxTree;
		const numberOfWords = getNumberOfWords(rootPattern);
		//classes:
			interface Expression{
				typeAnnotation?:Expression<"::"> & Tree<Expression>;
			}		

			const defualtFunctionsInternal = {
				map(self:Array,mapFunc){
					assert(self instanceof Array);
					return self.map((v,i,a)=>functionCall(mapFunc,[v,i,a]))
				},
				reduce(self:Array,start,foo){
					assert(self instanceof Array);
					let innerFunction = arguments.length>2?foo:start;
					let reduceFunction = (s,v,i,a)=>functionCall(innerFunction,[s,v,i,a]);
					return self.reduce(
						...([[reduceFunction],[reduceFunction,start]][+(arguments.length>2)])
					);
				},
				reduceForNumber(self:Number,start,foo){
					assert(typeof self == "number");
					let innerFunction = arguments.length>2?foo:start;
					let reduceFunction = (s,v,i,a)=>functionCall(innerFunction,[s,i,a]);
					return new Array(self).fill().reduce(
						...([[reduceFunction,null],[reduceFunction,start]][+(arguments.length>2)])
					);
				},
				iterate(self:Number,foo):Array{
					return new Array(self).fill().map((_,i)=>functionCall(foo,[i]))
				},
				repeat(self:Number,foo):void{
					for(let i=0;i<self;i++)functionCall(foo,[i]);
				},
			};
			const defaultFunctions_ObjectValue = {
				"="():Array{return defualtFunctionsInternal.map(this.array,...arguments)},
				">"():Value{return defualtFunctionsInternal.reduce(this.array,...arguments)},
				"||":{get(self):Value{return self.array.length}},//length
			};
			const defaultFunctions_Array = {
				"="():Array{return defualtFunctionsInternal.map(this,...arguments)},
				">"():Value{return defualtFunctionsInternal.reduce(this,...arguments)},
				"||":{get(self):Value{return self.length}},//length
			};
			const defaultFunctions_number = {
				"<"():Array{return defualtFunctionsInternal.iterate(+this,...arguments)},
				"="():Array{return defualtFunctionsInternal.repeat(+this,...arguments)},
				">"():Value{return defualtFunctionsInternal.reduceForNumber(+this,...arguments)},
			};
			const defaultFunctions_all = {};

			type Name = String|Symbol|Index;
			type Index = Number&Int;
			type Index<array> = Number&Int;//index on object `array`
				//where: array[index] : Valid
			type Value =
				ValueWrapper|
				PropertyRef|PropertyRef<isReturnable<true>>|
				ValueRef|
				Value_Derefed
			;
			type Value_Assignable =
				ValueWrapper|
				Value_Returnable
			;
			type Value_Unwraped =
				PropertyRef|
				Value_Returnable
			;
			type Value_Returnable =//can pass through functions ; is derefed when storing or 
				PropertyRef<isReturnable<true>>|
				Value_Storable
			;
			type Value_Storable =
				ValueRef|
				Value_Derefed
			;
			type Value_Derefed =//used when getting actual value for operators `a+b`
				ObjectValue|
				Name|
				Index|
				JavascriptValue
			;
			type PropertyRef<isReturnable=true|false> = PropertyRef & {isReturnable};
			type Value_Javascript = Any & (
				Number|
				String|
				Array<Any>|
				Object|//JSON-like object
				Function|
				null
			);
			type ArgumentObj = ObjectValue | Array&Value_Storable[] | Object&{[Any]:Value_Storable}
			const isSearched = Symbol("searched");
			class PropertyDataInternal{//internal class, cannot be returned by an expression
				constructor(data={}){Object.assign(this,data);}
				parentValueObject?:ObjectValue;//owner of this.parent used for 'this' in function calls
				parent:Object|Array;
				name:Name|Index;
				value:Option<Value>;//where: value == parent[name]
				errorWordSymbol?:WordSymbol;
				valueExists:bool = true;//used by Namespace
					//:false --> `a:...` can only be declared ; true --> variable already exists
				canAssignToValueRef:bool = false;//set true by `&a`; allows `b = &a`
				get(){//: this:Invalid ; note if it returned a ValueRef then it would always link variables ; e.g. `a:0;b:&a;b++;c:b;c++;assert a==b!=c`
					if(this.value instanceof ValueRef)
						return this.value.get();
					return this.value;
				}
				set(value:Value_Storable,isDeclaration):Value&consumes<this>{//: this:Invalid
					if(!isDeclaration && this.parent[this.name] instanceof ValueRef && !(value instanceof ValueRef)){//allows for linked variables
						this.parent[this.name].set(value);
					}
					else this.parent[this.name] = value;
					return new this.constructor({...this,value})
				}
			}
			class PropertyRef extends PropertyDataInternal{//:Value ; used in expressions
				constructor(data={}){super();Object.assign(this,data);}
				isReturnable:bool = false;//`foo() = exp` ; allows returning assignable properties through functions 
				static new(data:Option<PropertyDataInternal>):Option<PropertyRef>{
					return data && new PropertyRef(data);
				}
				deref(){
					if(this.isReturnable){
						return new PropertyRef({...this,isReturnable:false});
					}
					else return this.get();
				}
				derefFully(){return derefValueFully(this.get());}//ignores storable PropertyRefs
			}
			class ValueRef{//value wrapper ; similar to PropertyRef but for shared variables
				constructor(data={}){Object.assign(this,data);assert(!(this.value instanceof PropertyDataInternal),)}
				value:Value_Derefed;
				static fromValue(value:Value|ValueRef):ValueRef{
					value = derefValue(value);
					if(value instanceof PropertyRef)value = value.get();//BODGED: use a function for (Value)->Value_Derefed|ValueRef
					//assert value:Value_Derefed | ValueRef
					return value instanceof ValueRef?value:
						new ValueRef({value:derefValue(value)})
					;
				}
				deref(){return this;}
				derefFully(){return derefValueFully(this.value);}//ignores storable PropertyRefs
				get(){return this.value}
				set(value){return this.value = value}
			}
			class ValueWrapper{//for passing extra data between statements
				constructor(data={}){Object.assign(this,data);}
				value:Value;
				unwrap(){return unwrapValue(this.value);}
				deref(){return derefValue(this.value);}
				derefFully(){return derefValueFully(this.value);}//ignores storable PropertyRefs
			}
			class ValueStatementWrapper{
				constructor(data={}){Object.assign(this,data);}
				value:Value;
				statementReturnValue?:{value:Value};//e.g. `a` in `if a=>a else 0` ; used by statements like 'if'/'else' to pass data between them; stores the return value of a statement
			}
			class ValueWrapperReturnValue extends ValueWrapper{//returned by `a>b` ; `if 3>2 #?` == 3
				constructor(data={}){super();Object.assign(this,data);}
				value:Value;
				boolReturnValue:Value;
			}
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
			class ParameterData{

			}
			class Break{
				constructor(data={}){Object.assign(this,data);}
				returnValue:Value;//re
				ownerScopeObject:ObjectValue&Item<Namespace.variables>;//valueObject from namespace representing the scope to return to
			}
			class Context{
				static ContextType = EnumSymbols("default","if","else","for","while","match","case");
				static ParameterSymbol = EnumSymbols("#@","#?","#!","##","#/","#\\","#..");
				namespace:Namespace = new Namespace();
				module:&Module;
				contextType:ContextType = Context.ContextType.default;
				arguments:Map<ParameterSymbol,Value[]> = {};
				functionInstance?:&ObjectValue|Object;//points to the function instance; used for decaring `#name`
				constructor(data={}){Object.assign(this,data)}
				new_child_statement(data={}){// for statements e.g. `if` statements
					let arguments_clone = {};
					Object.getOwnPropertySymbols(this.arguments).forEach(key=>arguments_clone[key]=[...this.arguments[key]]);
					return new Context({...this,arguments:arguments_clone,...data});
				}
				new_child_namespace(data={},namespaceData={}){//for inner blocks `{...}` ; use this one if in doubt
					return new Context({...this,namespace:new Namespace({parent:this.namespace,...namespaceData}),...data});
				}
				static new_root(){
					return new Context({
						namespace:new Namespace({variables:{
							inspect:(value,javascript_string)=>new Function("v,value",`return ${javascript_string}`)(value,value),
							r:Math.random,
							l(v){console.log(...arguments);return v},
							log(v){console.log(...arguments);return v},
							...{
								prompt,
								confirm,
								Deno,
								global,
								globalThis,
								Math
							},
						}}),
					});
				}
				set_parameterSymbols(symbols:{[ParameterSymbol]:Value[]}){
					Object.assign(this.arguments,symbols);
					return this;
				}
				add_parameterSymbols(symbols:{[ParameterSymbol]:Value[]}){
					getAllowedSymbols(symbols).forEach(symbol=>(this.arguments[symbol]??=[]).push(...symbols[symbol]));
					return this;
				}
				clone(){
					return new Context(this);
				}
			}
			class ObjectValue{
				constructor(data={}){Object.assign(this,data);}
				properties:Object&Map<Name,Value> = {};
				array:Value[] = [];
				prototypes?:ObjectValue = null;
				class?:ClassObj;
				call(_self,arg_name:Value):Value{//same use as method 'Function.prototype.call' ; used for function calls
					let name = try_getPropertyValue(this,arg_name);
					if(typeof name == "number")return this.array[name];
					return PropertyRef.new(try_getPropertyData(this,derefValue(name)));
				}
				clone(){
					return new ObjectValue({
						properties:{...this.properties},
						array:[...this.array],
						prototypes:this.prototypes,
					});
				}
				fromObjectOrObjectValue(value:ObjectValue|Array|Object):ObjectValue{
					return match(value,[
						[()=>value instanceof ObjectValue,()=>value],
						[()=>value instanceof Array,()=>new ObjectValue({array:value})],
						[()=>Object.getPrototypeOf(value) == Object.prototype,()=>new ObjectValue({properties:value})],
					]);
				}
				toJS(){
					return this.isArrayType?this.toJSArray():this.toJSObject;
				}
				toJSObject():&Object{
					return this.properties;
				}
				toJSArray():&Array{
					return this.array;
				}
			}
			class Namespace{
				constructor(data={}){Object.assign(this,data)}
				parent?:Namespace&Tree<Namespace> = null;
				variables:ObjectValue | Object&Map<Name,Value> = {};
				new_child(data={}){
					return new Namespace({parent:this,...data});
				}
				getVariableRef(name:Name,isDeclaration):Option<PropertyDataInternal> & PropertyDataInternal|null{
					//assume: this.parent:Tree<Namespace> ; it will stack overflow otherwise (i.e. will not crash computer from RAM use)
					let propertyData:PropertyDataInternal = this.getVariableSelf(name);
					assert(!!propertyData && propertyData instanceof PropertyDataInternal);
					if(!isDeclaration && propertyData?.valueExists === false)
						return this.parent?.getVariableRef(name)??null;
					return propertyData;
				}
				getVariableRefOrDeclareData(name:Name):PropertyDataInternal{
					return this.getVariableRef(name)??try_getPropertyData(this.variables,name);
				}
				getVariableSelf(name):PropertyDataInternal{
					assume(!!this.variables)
					//assume:namespace cannot contain cycles
					let data = try_getPropertyData(this.variables,name);
					assert(!!data,"should return Some<PropertyDataInternal> since: 1. namespaces are trees so cannot contain cycles; 2. this.variables always exists");
					return data;
				}
				assignVariable(name:Name,value:Value,isDeclaration:bool=false):Option<PropertyRef>{//note: returns Some<...> if isDeclaration
					let propertyData = this.getVariableRef(name,isDeclaration)?.set?.(value??null,isDeclaration);
					if(isDeclaration)todo.silent("handle declaration");
					return propertyData?new PropertyRef(propertyData):null;
				}
				declareVariable(name:Name,value?:Value):PropertyRef{
					todo.silent("handle modules");
					todo.silent("allow `a:(b:2);a.b=4;assert a[0]==a.b`; linking property and tuple index; maybe add a index<-->name' map")
					let propertyRef = this.assignVariable(name,value,true);
					assert(!!propertyRef);
					return propertyRef;
				}
			}
			class FunctionData{//used for external arguments `a:>foo(b)<:c|>bar`; stored as an argument in evalCode.statement
				constructor(data={}){Object.assign(this,data)}
				arguments:ArgumentObj;
				function:Value;
			}
			class ModuleObj{
				privateSymbolMap:Map<String,Symbol>;
			}
		//----
		const AllPrivateSymbols = Symbol("a.$*");
		const AllSymbols = Symbol("a.*");
		const NullSymbol = Symbol("$null");
		const ObjectAsSymbol = Symbol("$obj");
		const InvalidValueSymbolError = Symbol("syntax error invalid");
		const compilerOnlySymbols = [isSearched,ObjectAsSymbol];//symbols that can both be {added to variables} and {that should not be accessable by the language user}
		const ErrorSettings = {
			allowPropertyOfUndefined:true,
		};
		const evalCode = {
			forEach_exps(exps:Expression[],context:Context,forEachFunction?:(value)=>void):Option<Value>{//`...` in `{...}`
				let lastValue;
				let hasSepparator = false;
				for(let exp of exps){
					let value = evalCode.statement(exp,context);
					if(exp.wordSymbol.word == "£" && !exp.args[0])continue;
					hasSepparator = exp.hasSepparator;
					lastValue = value;
					forEachFunction?.(value,exp);
				}
				return hasSepparator?null:lastValue;
			},
			statement(exp:Option<Expression>,context:Context,functionData?:FunctionData):Value{
				assert(!!context)
				if(!exp)return undefined;
				let value;
				try{
					value = match(exp.wordSymbol.type,[
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
											evalCode.declareVariables_OBSILETE(firstStatement.args[1],undefined,innerContext);
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
								let innerContext = context.new_child_namespace({},{variables:variable});
								const bracket_exp = exp;
								void evalCode.forEach_exps(bracket_exp.contence,innerContext,(value,exp)=>{
									if(!(bracket_exp.wordSymbol.word=="("&&exp.wordSymbol.word==":")){//for tuples, pattern `a:b` does not add item
										let valueToPush:Value_Storable;
										if(bracket_exp.wordSymbol.word=="["&&exp.wordSymbol.word==":"){
											let property:Value = value;
											let valueRef = ValueRef.fromValue(property);
											assignToValue(property,valueRef,exp);
											valueToPush = valueRef;
										}
										else{
											valueToPush = derefValueToStorable(value);
										}
										match(Object.getPrototypeOf(variable).constructor,[
											[()=>ObjectValue,()=>variable.array.push(valueToPush)],
											[()=>Array,()=>variable.push(valueToPush)],
											[()=>Object,()=>todo()],
										])
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
							function numericOperator(foo:(x:Value_Derefed,y:Value_Derefed)=>Value_Derefed):Value_Derefed{
								return foo(
									derefValueFully(evalCode.statement(x,context)),
									derefValueFully(evalCode.statement(y,context)),
								);
							}
							let get_x = ()=>evalCode.statement(exp.args[0],context);
							let get_y = ()=>evalCode.statement(exp.args[1],context);
							return match(exp.wordSymbol.word,[
								["\\",()=>new FunctionObj({exp,context})],//function `\exp`
								[word=>word=="/"&&exp.afix == Expression.AfixType.prefix,()=>new ClassObj({exp,context})],//class `/exp`
								[":",()=>{
									let value = evalCode.declareVariables_OBSILETE(exp.args[0],exp.args[1],context);
									return value;
								}],
								["=",()=>{
									let assignValue = evalCode.statement(exp.args[1],context);
									if(exp.wordSymbol.subWord){//`a+=b`
										todo("handle pattern 'a+=b'");
									}
									let assignedValues = evalCode.assignVariables(exp.args[0],assignValue,context);
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
									if(parent == null){
										if(!ErrorSettings.allowPropertyOfUndefined)exp.wordSymbol.throwError("null",`unable to get properties on '${parent}'`,e=>Error(e));
									}
									value = try_getPropertyValueRef(parent,propertyNameValue);
									if(!!exp.args[2]){//`array.= \exp`
										let arg = evalCode.statement(exp.args[2],context);
										value = functionCall(value,[arg],todo.silent("handle methods; get `#.` (i.e. self) from namespace's class instance object"));
									}
									return value;
								}],
								...[//function calls
									[",",()=>{//function call
										todo.silent("handle arguments");
										const args = functionData?.args ?? [];
										if(exp.args[1])args.push(evalCode.statement(exp.args[1],context));
										return functionCall(evalCode.statement(exp.args[0],context),args);
									}],
									[[":>"],()=>{//external argument
										todo(`pipe arguments. got '${exp.wordSymbol.word}'`);
										const args = functionData?.args ?? [];
										let arg = evalCode.statement(exp.args[0],context,args);
										args.push(arg);
										evalCode.statement(exp.args[1],context,args)
										//[["<:"],()=>{}],
										//[["|>","<|",","],()=>{}],
									}],
								],
								[["$$","$"],()=>evalCode.getName(exp,context)],
								["£",()=>{//`a£b` --> `a`
									const isReverseOrder = exp.isReverseOrder;
									const evaluationOrder:Expression[2] = isReverseOrder?[exp.args[1],exp.args[0]]:exp.args;
									const values = evaluationOrder.map(arg_exp=>evalCode.statement(arg_exp,context));
									return isReverseOrder?values[1]:values[0];
								}],
								[word=>word == "&" && exp.afix == Expression.AfixType.postfix,()=>{//'a&' reference
									let value:Value = evalCode.statement(exp.args[0]??exp.args[1],context);
									if(value instanceof PropertyRef)value.isReturnable = true;
									return value;//BODGED
								}],
								[word=>word == "&" && exp.afix == Expression.AfixType.prefix,()=>{//'&a' linked property similar to the C code `&int a = &b`
									let value:Value = evalCode.statement(exp.args[0]??exp.args[1],context);
									todo.silent("handle `&a` references properly");
									let valueRef = ValueRef.fromValue(value);
									if(value instanceof PropertyRef && value != valueRef){//turns variable into a reference if it was not already
										value.set(valueRef);
									}
									return valueRef;//BODGED
								}],
								["¬",()=>evalCode.statement(exp.args[0],context)],
								["?",()=>{
									let returnValue = evalCode.statement(exp.args[0],context);
									let value_for_owner:Value = evalCode.statement(exp.args[1],context)??null;
									value_for_owner = unwrapValue(value_for_owner);
									let ownerScopeObject:ObjectValue;
									if(value_for_owner instanceof PropertyRef){
										ownerScopeObject = value_for_owner.parent;
										function checkNamespace(namespace){
											if(namespace.variables == ownerScopeObject)return namespace;
											if(!!namespace.parent)return checkNamespace(namespace.parent)
											return null;
										}
										let foundNamespace:Namespace|null = checkNamespace(context.namespace);
										if(!foundNamespace){
											exp.args[1].wordSymbol.throwError("return",`variable's owner namespace is not in the current scope. Looking for variable '${value_for_owner.name}' `,e=>Error(e))
										}
									}else {
										if(exp.args[1])
											exp.args[1].wordSymbol.throwError("return",`expected value belonging to a parent scope. got:'${value_for_owner}'`,e=>Error(e))
									}
									throw new Break({
										returnValue,
										ownerScopeObject,
									});
								}],
								...[//parameters
									[()=>exp.wordSymbol.subtype == SyntaxTree.subtype.autoParameter,//`##` `#?` `#@` etc...
										()=>{
											const contextParameterSymbol:Context.ParameterSymbol = Context.ParameterSymbol[
												exp.wordSymbol.word.replace(/^#$/,"##")
											];
											const args:Value[] = context.arguments[contextParameterSymbol] ?? [];
											assume(args instanceof Array);
											let value = args[exp.autoParameterIndex]??null;
											if(exp.args[1]){
												let name:Name = evalCode.getName(exp.args[1],context);
												if(["##","#"].includes(exp.wordSymbol.word)){
													let propertyData:PropertyDataInternal = try_getPropertyData(context.functionInstance,name);
													assert(!!propertyData)
													propertyData.set(value);
												}
												else{
													context.namespace.declareVariable(name,value);//TODO: do this staticly to work in conditional code
												}
											}
											return value;
										}
									]
								],
								...[//numeric and logical operators:
									[
										word=>exp.afix == Expression.AfixType.infix &&
										word.match(/^[+\-&|^%\/*]$|\*\*|>{2,3}|<{2}/),
										()=>numericOperator(
											new Function("x,y",`return x ${exp.wordSymbol.word} y`)
										)
									],
									[//nor `a~b` == `{a|b}`
										word=>exp.afix == Expression.AfixType.infix && word == "~",
										()=>numericOperator((x,y)=>~(x|y))
									],
									["~~",()=>{//logical nor
											let x = get_x();
											let y = get_y();
											[
												[true,x],//x=0
												[y,false],//x=1
											][!derefValueFully(x)][!derefValueFully(y)]
											//00 1 true
											//01 0 X
											//10 0 Y
											//11 0 false
										}
									],
									["^^",()=>{//logical xor
										let x = get_x();
										let y = get_y();
										let get_x_derefed = ()=>derefValueFully(x);
										let get_y_derefed = ()=>derefValueFully(y);
										let value =  !get_x_derefed()?y: !get_y_derefed()?x: false;
										return new ValueWrapperReturnValue({value,boolReturnValue:x});
									}],
									["&&",()=>{//logical and
										let x;
										return !derefValueFully(x = get_x())?x:get_y();
									}],
									["||",()=>{//logical or
										let x;
										return derefValueFully(x = get_x())?x:get_y();
									}],
									[//comparisons ; `a==b==c` --> `{a==b} && {b==c}`
										word=>exp.afix == Expression.AfixType.infix &&
										word.match(/^(?:[<>]=?|[!=]==?)$/),
										()=>{
											function equality(x:Value_Derefed,y:Value_Derefed){//`a==b`
												if(x == y)return true;
												if(!(x instanceof Object && y instanceof Object))return false;
												if(x[isSearched]||y[isSearched])return false;
												x[isSearched] = true;
												y[isSearched] = true;
												let bool = false;getBool:{
													if(x instanceof ObjectValue && y instanceof ObjectValue){//BODGED
														bool = equality(x.array,y.array) && equality(x.properties,y.properties);
														break getBool;
													}
													if(x instanceof Array && y instanceof Array){
														if(x.length != y.length){break getBool;}
														for(let i=0;i<x.length;i++){
															if(!(i in x) && !(i in y))continue;//handles gaps in array
															if(!equality(x[i],y[i]))break getBool;
														}
														bool = true;
														break getBool;
													}
													if(x instanceof Object && y instanceof Object){
														let keys:Name[][2] = [x,y].map(obj=>[
															...Object.keys(obj),
															...getAllowedSymbols(obj)
														]);
														if(keys[0].length != keys[1].length)break getBool;
														keys = new Set([...keys[0],...keys[1]]);
														for(let keyX of keys){
															if(!Object.hasOwn(y,keyX))break getBool;
															if(!equality(x[keyX],y[keyX]))break getBool;
														}
														bool = true;
														break getBool;
													}
												}
												delete x[isSearched];
												delete y[isSearched];
												return bool ?? false;
											};
											function handleComparisonChain(exp):{value:Value&bool,args:Value[2],isSingleArg:bool}{
												if(exp.afix == Expression.AfixType.infix && exp.wordSymbol.word.match(/[<>]=?|[!=]==?/)){
													const foo:(x,y)=>bool = 
														exp.wordSymbol.word == "=="?equality:
														exp.wordSymbol.word == "!="?(x,y)=>!equality(x,y):
														new Function("x,y",`return x ${exp.wordSymbol.word} y`)
													;
													let arg0 = handleComparisonChain(exp.args[0]);
													if(!arg0.isSingleArg && !arg0.value)return arg0;//implements `&&` ; `a>b>c` --> `a>b&&b>c`
													let arg1 = handleComparisonChain(exp.args[1]);
													let args:Value_Returnable[] = [
														derefValueFully(arg0.args[1]),
														derefValueFully(arg1.args[0]),
													];
													return {value:foo(args[0],args[1]),args};
												}else{
													let arg = evalCode.statement(exp,context);
													return {value:undefined,args:[arg,arg],isSingleArg:true};
												}
											}
											let {value,args} = handleComparisonChain(exp);
											return new ValueWrapperReturnValue({value,boolReturnValue:args[0]})
										},
									],
									[
										"++",
										()=>{
											assert(!(!!exp.args[0] && !!exp.args[1]),"should not be infix");
											let arg = exp.args[0] ?? exp.args[1];
											let afix:u2&Expression.AfixType = exp.afix;
											assert(!!arg);
											let property = unwrapValue(evalCode.statement(exp.args[0],context));
											let value:Number|Value = derefValueFully(property);
											if(typeof value != "number")value = 0;
											return match(afix,[
												[Expression.AfixType.postfix,()=>assignToValue(property,value+1)],
												[Expression.AfixType.prefix,()=>{assignToValue(property,value+1);return property}],
											]);
										}
									],
									[
										word=>exp.afix == Expression.AfixType.prefix &&
										word.match(/^[+\-~!]$/),
										()=>numericOperator(
											new Function("_,x",`return ${exp.wordSymbol.word} x`)
										)
									],
									[
										word=>exp.afix == Expression.AfixType.postfix &&
										word.match(/^[+~!]$/),
										()=>numericOperator(
											new Function("x,_",`return ${exp.wordSymbol.word} x`)
										)
									],
								],//----
								...[//ternary operators
									["&?",()=>{
										let value = unwrapValue(evalCode.statement(exp.args[0],context));
										if(!!derefValueFully(value))
											return new ValueWrapperReturnValue({value:evalCode.statement(exp.args[1],context),boolReturnValue:value});
										else return new ValueWrapperReturnValue({value:null,boolReturnValue:value});
									}],
									["?&",()=>{//python-like reversed if statement`
										let value = unwrapValue(evalCode.statement(exp.args[1],context));
										if(!!derefValueFully(value))
											return new ValueWrapperReturnValue({value:evalCode.statement(exp.args[0],context),boolReturnValue:value});
										else return new ValueWrapperReturnValue({value,boolReturnValue:value});
									}],
									["|?",()=>{//`a&?b|?c` very similar to else but without `#?`
										let value = evalCode.statement(exp.args[0],context);
										if(!(value instanceof ValueWrapperReturnValue))
											exp.wordSymbol.throwError("syntax","missing if statement in pattern 'exp&&exp|?exp'",e=>Error(e))
										let boolValue:Value = value.boolReturnValue;
										if(!!derefValueFully(boolValue)){
											return unwrapValue(value);
										}
										else {//else
											return evalCode.statement(exp.args[1],context);
										}
									}],
								],
								//keyword operators
									["=>",()=>{
										let innerContext = context.new_child_statement();
										return match(context.contextType,[
											[[Context.ContextType.default],()=>todo("use argument as #@ in right exp")],
											[[Context.ContextType.if],()=>{assert.impossibleCase("handled elsewhere")}]
										]);
									}],
									["if",()=>{//`if a => b` or `if a b`
										let innerContext = context.new_child_statement({contextType:Context.ContextType.if});
										assume(exp.args[1].wordSymbol.word == "=>" || exp.args[2],"e.g. 'if name;' is not defined in the syntax spec")
										const arrowExpArgs:Expression[2] = exp.args[2]?[exp.args[1],exp.args[2]]:exp.args[1].args;
										let argument = evalCode.statement(arrowExpArgs[0],innerContext);
										const bool = derefValueFully(argument);
										argument = argument instanceof ValueWrapperReturnValue?
											argument.boolReturnValue:
											derefValue(argument)
										;
										innerContext.add_parameterSymbols({[Context.ParameterSymbol["#?"]]:[argument]});
										let value = bool? unwrapValue(evalCode.statement(arrowExpArgs[1],innerContext)):null;
										value = new ValueWrapper({value,statementReturnValue:{value:argument}});
										return value;
									}],
									["else",()=>{
										let value:ValueWrapper<{statementReturnValue}>|Value = evalCode.statement(exp.args[0],context);//from if statement
										if(!(value instanceof ValueWrapper) || !value.statementReturnValue)
											exp.wordSymbol.throwError("syntax","missing if statement in pattern 'if exp=>exp else exp'",e=>Error(e))
										let boolValue:Value = value.value;
										let statementReturnValue:Value = value.statementReturnValue.value;
										if(!!derefValueFully(boolValue)){
											return unwrapValue(value);
										}
										else {//else
											let innerContext = context.new_child_statement({contextType:Context.ContextType.else});
											const argument = value.statementReturnValue.value;
											innerContext.add_parameterSymbols({[Context.ParameterSymbol["#?"]]:[argument]});
											return evalCode.statement(exp.args[1],innerContext);
										}
									}],
									["assert",()=>{//TODO allow `assert exp=>message_exp`
										let value = evalCode.statement(exp.args[1],context);
										if(!derefValueFully(value))exp.wordSymbol.throwError("assertion",`assertion failed${value instanceof ValueWrapperReturnValue?`: found '${value.boolReturnValue}'`:""}`,e=>Error(e))
										return value instanceof ValueWrapperReturnValue?value.boolReturnValue:value;
									}],
									["for",()=>{
										let innerContext = context.new_child_statement({contextType:Context.ContextType.for});
										innerContext.add_parameterSymbols({[Context.ParameterSymbol["#@"]]:[]});
										todo("`for in` loop");
									}],
								//----
							],);//()=>todo.silent()
						}],
					]);
				}
				catch(error){
					if(error instanceof Break && error.ownerScopeObject == context.namespace.variables){//break `value?scope_name`
						return error.returnValue;
					}
					else throw error;
				}
				return value;
			},
			functionCallArguments(args:Value[],context){//`a:>b|>foo(c;d)<:e`
				todo()
			},
			destructureObject(parameter_exp:Expression,argument_exp?:Expression,context):Object&Map<Name,Option<Value>>{
				return destructureObject_internal(parameter_exp,argument_exp,context);
			},
			destructureClassParameters(parameter_exps:Expression[],args:Value[]|ObjectValue,context):DestructureData{// `a#b#c` in `/a#b#c:...`
				const isClass = true;
				return evalCode.destructureFunction(parameter_exps,args,context,isClass);
			},
			destructureFunction(parameter_exps:Expression[],args:Value[]|ObjectValue,context,isClass:bool = false):DestructureData{
				todo("obsilete, switch to the assignment code")
				type DestructureData = {parameters:Object&Map<Name,Option<Value>>,nextIndex:Index<args>};
				let parameters:Map<Name,Option<Value>> = {};
				let i = 0;
				for(let parameter_exp of parameter_exps){
					let isPublicParameter:Bool;
					let parameterNameExp:Expression =
						parameter_exp?.wordSymbol?.word == "@"
							?(isPublicParameter=true,parameter_exp.args[1])
						:parameter_exp?.wordSymbol?.word == ":" && parameter_exp.args[0]?.wordSymbol?.word == "@"
						?(isPublicParameter=true,parameter_exp.args[0].args[1])
						:parameter_exp
					;
					isPublicParameter ||= isClass;
					let parameterName:Option<Name> = isPublicParameter?evalCode.getName(parameterNameExp,context):undefined;
					if(isClass){
						let propertyData = try_getPropertyData(args,parameterName);
						if(!propertyData.valueExists)propertyData.set(null);
						todo.silent("consider handling class parameters separate from function ones")
						void evalCode.destructureObject_internal(parameter_exp,derefValueFully(propertyData),context,parameters);
					}
					else{
						let argument:Value = isPublicParameter?try_getPropertyValue(args,parameterName):try_getPropertyValue(args,i)
						void evalCode.destructureObject_internal(parameter_exp,argument,context,parameters);
					}
					if(!isPublicParameter)i++;
				}
				return {parameters,nextIndex:i};
			},
			destructureObject_internal(parameter_exp:Expression,argument?:Value,context,currentParametersMap:Option<Map>=undefined,isClass=false):Object&Map<Name,Option<Value>>{//this function is only used by the other destructure functions
				//isClass : if true all parameters will be declared to argument 
				let parameters:Map<Name,Option<Value>> = currentParametersMap??{};
				todo.silent("support class parameters");
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
			declareVariables_OBSILETE(parameter_exp:Expression,assign:Expression,context:Context):&mutate<context>{
				return evalCode.assignVariables_OBSILETE(parameter_exp,assign,context,true);
			},
			assignVariables_OBSILETE(parameter_exp:Expression|undefined,assign:Expression,context:Context,isDeclaration = false):&mutate<context>{
				todo.silent("OBSILETE function: use evalCode.assignVariables(Exp,Value,...) instead of assignVariables_OBSILETE(Exp,Exp,...)");
				return evalCode.assignVariables(parameter_exp,evalCode.statement(assign,context),context,assign,isDeclaration);
			},
			declareVariables(parameter_exp:Expression,assign:Value,context:Context,errorWordSymbol_assignValue:WordSymbol):Value & mutate<context>{
				return evalCode.assignVariables(parameter_exp,assign,context,errorWordSymbol_assignValue,true);
			},
			assignVariables(parameter_exp:Expression|undefined,assignValue:Value,context:Context,errorWordSymbol_assignValue:WordSymbol,isDeclaration?:bool=false,operator?:WordSymbol):Value & mutate<context>{
				function error_cannotAssignTo_Value_Derefed(){
					parameter_exp.wordSymbol.throwError("logic",`in ${["assignment", "declaration"][!!isDeclaration]} pattern: expected name/property, found value '${parameter_exp.wordSymbol.word}'.`,e=>Error(e))
				}
				const getValue:()=>Value_Returnable = ()=>derefValue(assignValue);
				if(!parameter_exp){//`:a` --> `a:a;`
					assert(!!errorWordSymbol_assignValue,"errorWordSymbol_assignValue is only needed for this case")
					type Other = Unknown;
					//assignValue:PropertyRef|Value_Returnable
					if(!(assignValue instanceof PropertyRef)){
						errorWordSymbol_assignValue.wordSymbol.throwError("syntax-property",`Invalid auto ${["assignment '=a;'","declaration ':a'"][+isDeclaration]} pattern can only auto-assign values from a property.`,e=>Error(e));
					}
					let propertyName = assignValue.name;
					const value = derefValue(assignValue);
					if(isDeclaration)return context.namespace.declareVariable(propertyName,value);
					else return context.namespace.assignVariable(propertyName,value);
				}
				assert(parameter_exp instanceof Expression);
				let returnValue:Value = match(parameter_exp.wordSymbol.type,[
					[[SyntaxTree.type.value,SyntaxTree.type.label],()=>{//`a:b` or `"a":b`
						const name:Name&String = match(parameter_exp.wordSymbol.type,[
							[SyntaxTree.type.value,()=>
								match(parameter_exp.wordSymbol.subtype,[
									[SyntaxTree.subtype.formatString,()=>todo("handle strings ; allow for e.g. `'a':b;` and `a.'b'=c;`")],
									[SyntaxTree.subtype.string,()=>parameter_exp.wordSymbol.value],
								],()=>error_cannotAssignTo_Value_Derefed())
							],
							[SyntaxTree.type.label,()=>parameter_exp.wordSymbol.word],
						]);
						let assignValue:Value_Returnable = getValue();
						let value:Value&Option<PropertyRef>;
						if(isDeclaration){
							value = context.namespace.declareVariable(name,assignValue);
						}
						else value = context.namespace.assignVariable(name,assignValue);
						return value;
					}],
					[type=>//`foo()` or `a.b` in `a.b:c` or `foo():c`
						type == SyntaxTree.type.bracket && parameter_exp.args[0] ||//functionCall
						parameter_exp.wordSymbol.subtype == SyntaxTree.subtype.block||//`{...}:b`
						parameter_exp.wordSymbol.subtype2 == SyntaxTree.subtype2.dot,//`a.b:c`
						()=>{
							let assignValue:Value_Returnable = getValue();
							let parameter = evalCode.statement(parameter_exp,context);
							let value = assignToValue(parameter,assignValue);
							return value
						}
					],
					[type=>type == SyntaxTree.type.bracket && ["(","["].includes(parameter_exp.wordSymbol.word),()=>{//'' ; destructuring
						//let object = new ObjectValue;
						parameter_exp.contence.forEach((exp,i)=>match(exp.wordSymbol.word,[
							[":",()=>{//`(a:...) : c`
								let innerValue:Value_Returnable = getValue();
								let [name_exp,innerParam_exp] = exp.args;
								if(!name_exp)todo("handle `(:b) : ...` pattern")//BODGED
								let name = evalCode.try_getName(name_exp,context);
								if(!!name_exp && name == InvalidValueSymbolError)name.wordSymbol.throwError("syntax","expected name or symbol",e=>Error(e));
								let propertyData:Option<PropertyDataInternal> = try_getPropertyData(assignValue,name,name_exp);
								let innerAssignValue = propertyData?.get?.();
								let value = evalCode.assignVariables(innerParam_exp,innerAssignValue,context,errorWordSymbol_assignValue,isDeclaration);
								return value
							}],
							[()=>exp.wordSymbol.type == SyntaxTree.type.label,//`(a;b):b` --> `(a:a;b:b):b`
								()=>{
									const name = exp.wordSymbol.word;
									let value = parameter_exp.wordSymbol.word == "["?
										try_getPropertyValue(getValue(),i,exp):
										try_getPropertyValue(getValue(),name,exp)
									;
									value = isDeclaration?
										context.namespace.declareVariable(name,value):
										context.namespace.assignVariable(name,value)
									;
									return value;
								}
							],
						],()=>todo("handle general 'exp' in '(...;exp;...):...'")))
						todo.silent("deside on what {(...):...} should return")
						return assignValue;
					}],
					[SyntaxTree.type.operator,()=>
						parameter_exp.wordSymbol.throwError("syntax",`in ${["assignment","declaration"][!!isDeclaration]} pattern: expected name, found operator '${parameter_exp.wordSymbol.word}'.`,e=>Error(e))
					],
				]);
				return returnValue;
			},
			try_getName(name_exp:Expression<Any|SyntaxTree.type.Label|"$"|"$$">,context):Name|InvalidValueSymbolError{
				if(!(
					name_exp.wordSymbol.type == SyntaxTree.type.label ||
					name_exp.wordSymbol.word == "$" ||
					name_exp.wordSymbol.word == "$$"
				))return InvalidValueSymbolError;
				return evalCode.getName(name_exp,context);
			},
			getName(name_exp:Expression<SyntaxTree.type.Label|"$"|"$$">,context):Name{
				if(name_exp.wordSymbol.type == SyntaxTree.type.label)return name_exp.wordSymbol.word;
				if(name_exp.wordSymbol.word == "$$"){
					return name_exp.symbol ??= Symbol(`$$ ; static symbol`);
				}
				assert(name_exp.wordSymbol.word == "$",name_exp);
				let value = evalCode.statement(name_exp.args[1],context);
				value = unwrapValue(value);
				let name:Option<Name,undefined> = value instanceof PropertyRef?value.name:undefined;
				value = derefValueFully(value);
				return match(value,[
					[null,()=>NullSymbol],
					[()=>
						value instanceof ObjectValue||
						value instanceof PropertyRef||
						!!value && typeof value == Object,
						()=>value[ObjectAsSymbol]??=Symbol(name!==undefined?"$"+name:object instanceof Array?"[...]":"{...}")
					],
				],()=>value);
			},
			functionArguments(exp:Expression<"|>"|"<|"|":>"|"<:"|","|"foo()">){
				todo();
			},
			assignableOperator(operatorWord:WordSymbol,assignTypeWord?:WordSymbol<":"|"=">,variableExp:Expression,assignExp:Expression,context){
				
			},
		};
		function functionCall(foo:Value|PropertyRef,args:ObjectValue|Value[],self?:ObjectValue|Array|Object,hasSelf = false):Value&(Value_Assignable|Value_Returnable){
			assert(//args:ObjectValue|Value[]
				args instanceof ObjectValue || 
				args instanceof Array
			);
			const getArg0 = ()=>try_getPropertyValue(args,0);
			if(self === undefined){
				self = foo instanceof PropertyRef?foo.parentValueObject||foo.parent:undefined;//:Option<ObjectValue|Object|Array>
				hasSelf = true;
			}
			foo = derefValueFully(foo);//:Value
			let value:Value_Assignable&Value = match(foo,[
				[_=>typeof foo == "function",()=>{
					let argsArray:Array = try_toArray(args)??[];
					assert(argsArray instanceof Array,"the input type of args:ObjectValue|Value[] should ensure this");
					argsArray = argsArray.map(v=>toJSValue(v));
					return foo(...argsArray);//TODO: handle methods with 'this' better
				}],
				[_=>foo instanceof FunctionObj, ()=>{
					if(foo instanceof ClassObj){
						todo("update this section")
						const classObj:ClassObj = foo;
						const clonedArgs:ObjectValue = match(args.constructor,[
							[[ObjectValue],()=>args.clone()],
							[[Array],()=>new ObjectValue({array:[...args]})],
						]);
						let newInstance = clonedArgs;
						newInstance.class = classObj;
						let [parametersExp,classBodyExp,constructorExp] = classObj.exp.args;
						if(parametersExp){
							let {parameters,nextIndex} = evalCode.destructureClassParameters(parametersExp.args,newInstance);
						}
						if(classBodyExp){
							todo.silent("handle class body better");
							assume(clonedArgs instanceof ObjectValue);
							let innerContext = classObj.context.new_child_namespace({
								functionInstance:newInstance,
							});
							let classSymbol = classObj[ObjectAsSymbol] ??= Symbol("[Class]");
							let prototype = evalCode.statement(classBodyExp,innerContext);
							newInstance.prototypes??=new ObjectValue();
							newInstance.prototypes.properties[classSymbol] = prototype;
						}
						if(!constructorExp)return newInstance;
						const constructor = new FunctionObj({exp:constructorExp,context:classObj.context});
						return functionCall(constructor,[newInstance,foo]);
					}
					else{
						assert(foo.constructor == FunctionObj,foo.constructor);
						let lengthOfParameterExps:Int;
						let parameters:Value&argument[];{//get parameters
							parameters = new ObjectValue;//:mut
							const parameters_exps:Expression[] = foo.exp.args[0]?.args??[];
							const dummyContext:Context = foo.context.new_child_statement({namespace:foo.context.namespace.new_child({variables:parameters})});
							lengthOfParameterExps = parameters_exps.length;
							for(let i=0;i<parameters_exps.length;i++) {
								let parameter_exp = parameters_exps[i];
								let arg:Value = try_getPropertyValue(args,i,todo.silent("try remove the need for an errorWordSymbol"));
								const errorWordSymbol = {throwError(){assert.impossibleCase("should have correct syntax so should not need an errorWordSymbol")}}
								evalCode.declareVariables(parameter_exp,arg,dummyContext,errorWordSymbol);
							}
						}
						let extraArguments = try_toArray(args).slice(lengthOfParameterExps);
						assume(args instanceof ObjectValue || args instanceof Array);{
							assert(extraArguments instanceof Array);
						};
						let innerContext = foo.context.new_child_namespace(
							{functionInstance:parameters},
							{variables:parameters},
						).set_parameterSymbols({
							[Context.ParameterSymbol["##"]]:extraArguments,
						}).add_parameterSymbols({
							[Context.ParameterSymbol["#\\"]]:[foo],
							[Context.ParameterSymbol["#.."]]:[args],
						});//assume: foo is NOT a class
						let value;
						try{
							value = evalCode.statement(foo.exp.args[1],innerContext);
						}
						catch(error){
							if(error instanceof Break && error.ownerScopeObject == null){//`exp?` defaults to returning to function
								return error.returnValue;
							}
							else throw error;
						}
						return derefValue(value);
					}
				}],
				[_=>foo instanceof ClassObj, ()=>foo(...args)],
			],()=>try_getPropertyValueRef(foo,getArg0()));
			return value;
		}
		//get properties & keys:
			function try_getDefaultFunction(parent:Value,name:Name,errorWordSymbol?:WordSymbol):Option<PropertyDataInternal>{//`a.=`
				const getPropertyData = (value)=>new PropertyDataInternal({
					parent:parent.variables,
					parentValueObject:parent,
					name,
					value,
					errorWordSymbol,
				});
				if(Object.hasOwn(defaultFunctions_all,name)){
					return getPropertyData(defaultFunctions_all[name].bind(parent));
				}
				if(typeof parent == "number" && Object.hasOwn(defaultFunctions_number,name)){
					if(typeof defaultFunctions_number[name] == "function")
						return getPropertyData(defaultFunctions_number[name].bind(parent));
					else return getPropertyData(defaultFunctions_number[name].get(parent));
				}
				if(parent instanceof ObjectValue && Object.hasOwn(defaultFunctions_ObjectValue,name)){
					if(typeof defaultFunctions_ObjectValue[name] == "function")
						return getPropertyData(defaultFunctions_ObjectValue[name].bind(parent));
					else return getPropertyData(defaultFunctions_ObjectValue[name].get(parent));
				}
				if(parent instanceof Array && Object.hasOwn(defaultFunctions_Array,name)){
					if(typeof defaultFunctions_Array[name] == "function")
						return getPropertyData(defaultFunctions_Array[name].bind(parent));
					else return getPropertyData(defaultFunctions_Array[name].get(parent));
				}
			}
			function try_getPropertyData(parent:Value,name:Name|Index,errorWordSymbol?:WordSymbol):Option<PropertyDataInternal>{
				parent = derefValue(parent);
				if(parent === null || parent === undefined){
					silentError("getting property from null object");
					return null;
				}
				const constructor:Class = Object.getPrototypeOf(parent).constructor;
				assume(!(typeof parent == "object") || parent instanceof constructor);
				return match(parent,[
					[_=>parent instanceof ObjectValue,()=>{
						if(parent[isSearched])return null;//prevent infinite loops, from recursive prototype chains
						parent[isSearched] = true;
						let data:Option<PropertyDataInternal>;getData:{
							if(typeof name == "number"){//`a[i]`
								data = new PropertyDataInternal({
									parent:parent.array,
									parentValueObject:parent,
									name,
									value:parent.array[name],
									errorWordSymbol,
								});
								break getData;
							}
							if(Object.hasOwn(parent.properties,name)){
								data = new PropertyDataInternal({
									parent:parent.properties,
									name,
									value:parent.properties[name],
									errorWordSymbol,
								});
								break getData;
							}
							if(parent.prototypes){
								const asArray:Option<Value[]> = getAsArray(parent.prototypes);
								const asObject:Option<Object> = valueToPropertiesObject(parent.prototypes);
								if(asArray){
									for(const prototype of asArray){
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
									for(const key of [...Object.keys(asObject),...getAllowedSymbols(asObject)]){
										const value = asObject[key];
										assert(Object.hasOwn(asObject,key));
										const prototype = value;
										if(prototype == null){silentError("null prototype");continue;}
										data = try_getPropertyData(prototype,name,errorWordSymbol);
										if(data)break getData;
									}
								}
							}
							assert(!data);
							data = try_getDefaultFunction(parent,name,errorWordSymbol);
							if(!!data)break getData;
							assert(!data);
							data = new PropertyDataInternal({
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
				],()=>{
					let propertyData = new PropertyDataInternal({parent,name,value:parent[name],valueExists:Object.hasOwn(parent,name)});
					if(!propertyData.valueExists){
						propertyData = try_getDefaultFunction(parent,name,errorWordSymbol)??propertyData;
					}
					return propertyData;
				})
			}
			function try_getPropertyValueRef(parent:Value,name_value:Value,errorWordSymbol?:WordSymbol):Option<PropertyRef>{//returns dereferenced value
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
			function getAsProperties(object?:Object):[key:Name,value:Value][]{
				if(!object)return [];
				return Object.keys(object).map(key=>[key,object[key]]);
			}
			function getAsPropertiesSymbols(object?:Object):[key:Name,value:Value][]{
				if(!object)return [];
				assert(!(isSearched in object))
				return getAllowedSymbols(object)
					.map(key=>[key,object[key]])
					.filter(([key,_])=>!compilerOnlySymbols.includes(key))
				;
			}
			function try_toArray(value:ObjectValue|Array|Value):Array|Value{
				return value instanceof ObjectValue?value.array:value;
			}
			function assignToValue(parameter:Value_Unwraped|Value,assign:Value,errorWordSymbol?:WordSymbol):Value_Unwraped{
				assign = derefValue(assign);
				parameter = unwrapValue(parameter);
				return match(parameter,[
					[v=>v instanceof PropertyRef,()=>parameter.set(assign)],
					[v=>v instanceof ValueRef,()=>parameter.set(assign)],
				],()=>todo(loga(0,parameter,assign)));//error_cannotAssignTo_Value_Derefed());
			}
		//----
		//reference:
			function unwrapValue(value:Value|ValueWrapper):Value_Unwraped{//used at the end of statements e.g. after `else` in `if _ _ else _`
				if(value instanceof ValueWrapper)return value.unwrap();
				return value;
			}
			function derefValue(value:Value|PropertyRef):Value_Returnable{//returned by a function
				if(value instanceof PropertyRef)return value.deref();
				if(value instanceof ValueRef)return value.deref();
				if(value instanceof ValueWrapper)return value.deref();
				return value;
			}
			function derefValueToStorable(value:Value|PropertyRef):Value_Storable{
				value = derefValue(value);//:Value_Returnable&(Value_Storable|PropertyRef<isReturnable=true>)
				if(value instanceof PropertyRef && value.isReturnable){
					return value.get();
				}
				return value;
				
			}
			function derefValueFully(value:Value|PropertyRef):Value_Derefed{//used in numeric operators (e.g. `a` in `a+b`) and function calls (e.g. `foo` in `foo()`)
				if(value instanceof PropertyRef)return value.derefFully();
				if(value instanceof ValueRef)return value.derefFully();
				if(value instanceof ValueWrapper)return value.derefFully();
				return value;
			}
		//----
		//misc functions
			function getAllowedSymbols(object){
				return Object.getOwnPropertySymbols(object).filter(symbol=>!compilerOnlySymbols.includes(symbol));
			}
			function toJSValue(value:Value):Value_Javascript{
				let name;
				value = unwrapValue(value);
				if(value instanceof PropertyRef)name = value.name;
				value = derefValueFully(value);
				return match(value,[
					[()=>value instanceof ObjectValue,()=>value.toJS()],
					[value instanceof FunctionObj || value instanceof ClassObj,()=>
						({
							[name](){return functionCall(value,arguments)},
						}[name])
					],
				],()=>value);
			}
		//----
		let valueInternal;
		try{
			valueInternal = evalCode.forEach_exps(rootPattern,Context.new_root());
		}
		catch(error){
			if(error instanceof Error)throw error;
			else if(error instanceof Break){
				valueInternal = error.returnValue;
			}
			else throw error;
		}
		return {value:derefValueFully(valueInternal),valueInternal};
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
		let {value,valueInternal} = runAST(abstractSyntaxTree);
		//assert(abstractSyntaxTree == rootPattern);
		if(1)console.error(printTree(abstractSyntaxTree));
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
let {rawText:a,fileName} = (()=>{
	const terminalArgs:String[] = Deno.args;
	//`-f` run from file:
		let runFromFile = false;
		let index;
		if((index = terminalArgs.indexOf("-f"))!=-1){
			runFromFile = true;
			terminalArgs.splice(index,1);
		}
	//----
	let rawText,fileName;
	if(runFromFile || terminalArgs.length == 0){
		fileName = terminalArgs[0]??"code/temp.lang3";
		rawText = getFile_expect(fileName);;
	}
	else{
		fileName = "[bash]";
		rawText = terminalArgs[0]??"";
	}
	return {fileName,rawText};
})();
//a="a.b := 2;Coords := \(*$$:;#x:=0;#y:=0);";
if(0)compile(`a:\\a#b:a+b;a(1;2)`);
else try{compile(a)}catch(e){console.error(e)};