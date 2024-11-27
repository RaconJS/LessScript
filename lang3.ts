const words_regex = /\/\*[\s\S]*?\*\/|\/\/.*|r(#+)"[\s\S]*?"\1|"(?:\\u....|\\x..|\\.|[^"\n])*?"|[\@\$\#]\*|(?:\?&|&\?|\?\|)|\.\.\*|::?|\\|[><!=]=?|[+\-*%&|^~]{1,2}=?|[!/¬\\#]|\.{1,3}|\${1,2}|\s+|[\(\[\{]|[\)\]\}]|(?:0[box][_0-9A-Fa-f]+|[0-9_](\.))|\w+|:>|<:|>:|\S/g;
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
			if(!condision)throw errorFunc("ASSERTION FAILLED:" + (typeof msg == "function?"?msg():msg));
		}
	}
	function assume(condision,msg = "",errorFunc = e=>Error(e)):()=>any{
		if(debugMode){
			msg ??= "";
			if(!condision)throw errorFunc("ASSUMPTION FAILLED:" + msg);
		}
		return fooUsingAssumption=>fooUsingAssumption(condision);
	}
	assert.fail = function(msg = undefined,errorFunc = e=>Error(e)){
		if(debugMode){
			msg ??= "impossible case found";
			assert(false,msg,errorFunc);
		}
	}
	assert.impossibleCase = function(msg = undefined,errorFunc = e=>Error(e)){
		if(debugMode){
			assert(false,"impossible case: "+msg,errorFunc);
		}
	}
	function unimplemented(msg = "",errorFunc = e=>Error(e)){
		if(debugMode){
			throw errorFunc("UNIMPLEMENTED:" + msg);
		}
	}
	function forBail(length,onError_default=undefined){
		//example: let n=forBail(array.length);while(true){n();}
		let i_bail = 0;
		return function next(onError=onError_default){
			if(debugMode)if(i_bail++>length){
				if(onError)onError(i_bail);
				throw Error("BAILED");
			}
		}
	}
	function match<V,T>(value:V,setOfCases:MatchCase[],defaultCase:(v)=>T):T{
		"use strict";
		//type MatchCase=[(V[]|V->bool), V->T]
		let i = -1;
		let _case:MatchCase;
		let tryNext = forBail(setOfCases.length);
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
		let tryNext = forBail(setOfCases.length);
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
				else Object.assign(this,data);
				this.errorData = Object.assign(new this.constructor.ErrorData(),data.errorData);
			}
			get asd(){return 42}
			//
			word;//:string
			afix;//:Int & (!!left_arg * 2) + !!right_arg
			type;//:Symbol
			subtype;//:Symbol
			patternType;//:((Object & Class())|string)? ; used to contain pattern data
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
				// operator
					"comparitor",
					"pipeline",// '|>' '<|' ':>' '<:'
					"interval",// 'a..b' , 'a..=b'
					"ternary",// 'a ?& b ?| c' 'b &? a ?| c'
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
									word.match(/^([!<>]=?|==)$/) ? {type:SyntaxTree.type.operator,afix:SyntaxTree.AfixType.infix} :
									word.match(/=$/) ? {type:SyntaxTree.type.operator} ://e.g. 'mut=' '*mut=>' '=<*mut'
									word.match(/^:$/) ? {type:SyntaxTree.type.operator} ://e.g. 'mut=' '*mut=>' '=<*mut'
									word.match(/^::$/) ? {type:SyntaxTree.type.operator} ://e.g. 'mut=' '*mut=>' '=<*mut'
									word.match(/^(?:[|:]>)$/) ? {type:SyntaxTree.type.operator,subtype:SyntaxTree.subtype.pipeline,isReversed:false,afix:SyntaxTree.AfixType.infix} ://'|>' or ':>'
									word.match(/^(?:<[|:])$/) ? {type:SyntaxTree.type.operator,subtype:SyntaxTree.subtype.pipeline,isReversed:true,afix:SyntaxTree.AfixType.infix} ://'<|' or '<:'
									word.match(/^,$/) ? {type:SyntaxTree.type.operator,afix:SyntaxTree.AfixType.infix} ://','
									word.match(/^[!%^&*\/\-+~|<>¬?]|\?[&|]|[&]\?/) ? {type:SyntaxTree.type.operator,afix:SyntaxTree.AfixType.infix}  ://ternary operators
									word.match(/^\.$/) ? {type:SyntaxTree.type.operator,afix:SyntaxTree.AfixType.infix} ://dot operator 
									word.match(/^\.\.=?$/) ? {type:SyntaxTree.type.operator,subtype:SyntaxTree.subtype.interval} ://interval '1..3'
									word.match(/^(?:ref)$/) ? {type:SyntaxTree.type.operator,afix:SyntaxTree.AfixType.prefix} :
									word.match(/^@$/) ? {type:SyntaxTree.type.operator,afix:SyntaxTree.AfixType.prefix} :
									word.match(/^(?:\\)$/) ? {type:SyntaxTree.type.operator} :
									word.match(/^(?:\$\$)$/) ? {type:SyntaxTree.type.operator} :
									word.match(/^(?:\.\.\*)$/) ? {type:SyntaxTree.type.operator}:
									word.match(/^(?:if|while|for|match)$/) ? {type:SyntaxTree.type.operator} :
									word.match(/^(?:else|do)$/) ? {type:SyntaxTree.type.operator} :
									word.match(/^#@$|^##?$/) ? {type:SyntaxTree.type.operator,afix:SyntaxTree.AfixType.nofix} ://'#' or '##' or '#@' in: '#name' '##'
									word.match(/^\$$/) ? {type:SyntaxTree.type.operator} ://'$type' '$key'
									word.match(/^[$@*]\*$/) ? {type:SyntaxTree.type.operator,afix:SyntaxTree.AfixType.prefix}://'@*' in '@* = (a=1,b=2,c=3)'
									word.match(/^\.\.\.$/) ? {type:SyntaxTree.type.operator} :
									word.match(/^\w+$/) ? {type:SyntaxTree.type.label,afix:SyntaxTree.AfixType.nofix} :
									word.match(/^[;]$/) ? {type:SyntaxTree.type.sepparator} :
									word.match(/^"$/) ? {type:SyntaxTree.type.symbol}://extra '"'s are caught and are handled later on
									//word.match(/^\S+$/) ? "symbol":
									(()=>{throw Error("compiler error: unhandled symbol: '" + word + "'. Either add a case using 'type:SyntaxTree.type.symbol' for this or add a proper error for this case")})()
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
			afix;//:[]OperatorData & infix|postfix|prefix|nofix;
			proceedence:Number[2];
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
		const operatorProceedence = //:Object & Map(string->{prefix:OperatorData?,infix:OperatorData?,postfix:OperatorData?})
			(a=>{
				maxProceedence = a.length;
				let operators = {};
				a.forEach((proceedenceOpers,i)=>{//adds the rest of the poperties to the OperatorData objects
					Object.keys(proceedenceOpers).forEach((v:String)=>{//operator:OperatorData
						let operatorData = proceedenceOpers[v];//:OperatorData
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
							operatorData.proceedence[0] ??= i;
							operatorData.proceedence[1] ??= i;
						};
					})
				});
				return operators;
			})([//:{[string]:OperatorData}[] ; note: '\x00's are ignored to allow for duplicate entries with the same preceedence
				{
					"$$" :{afix:OperatorData.AfixType.nofix},
				},
				{
					"#"  :{afix:OperatorData.AfixType.prefix},
					"$"  :{afix:OperatorData.AfixType.prefix},
				},
				{
					"."  :{afix:OperatorData.AfixType.infix},
				},
				{
					","  :{afix:OperatorData.AfixType.infix},
					":>" :{afix:OperatorData.AfixType.infix},
					"<:" :{afix:OperatorData.AfixType.infix},
					"|>" :{afix:OperatorData.AfixType.infix},
					"<|" :{afix:OperatorData.AfixType.infix},
				},
				{
					"(":{afix:OperatorData.AfixType.postfix},
					"[":{afix:OperatorData.AfixType.postfix},
					"{":{afix:OperatorData.AfixType.postfix},
				},
				{
					":"    :{afix:OperatorData.AfixType.infix,parameter:OperatorData.left},
					"="    :{afix:OperatorData.AfixType.infix,parameter:OperatorData.left},
					":\x00":{afix:OperatorData.AfixType.postfix,parameter:OperatorData.left},
					"=\x00":{afix:OperatorData.AfixType.postfix,parameter:OperatorData.left},
				},
				{
					"!"  :{afix:OperatorData.AfixType.prefix},
					"+"  :{afix:OperatorData.AfixType.prefix},
					"~"  :{afix:OperatorData.AfixType.prefix},
					"*"  :{afix:OperatorData.AfixType.prefix},//for array 
					"&"  :{afix:OperatorData.AfixType.prefix},
					"¬"  :{afix:OperatorData.AfixType.prefix},
				},
				{
					"++" :{afix:OperatorData.AfixType.prefix},
					"--" :{afix:OperatorData.AfixType.prefix},
				},
				{
					"++" :{afix:OperatorData.AfixType.postfix},
					"--" :{afix:OperatorData.AfixType.postfix},
				},
				{
					".." :{afix:OperatorData.AfixType.infix},
					"..=":{afix:OperatorData.AfixType.infix},
				},
				{
					"¬"  :{afix:OperatorData.AfixType.infix,parameter:OperatorData.left},
				},
				{
					"**" :{afix:OperatorData.AfixType.infix},
					"%%" :{afix:OperatorData.AfixType.infix},
				},
				{
					"*"  :{afix:OperatorData.AfixType.infix},
					"/"  :{afix:OperatorData.AfixType.infix},
				},
				{
					"+"  :{afix:OperatorData.AfixType.infix},
					"-"  :{afix:OperatorData.AfixType.infix},
				},
				{
					"%"  :{afix:OperatorData.AfixType.infix},
				},
				{
					"&"  :{afix:OperatorData.AfixType.infix},
					"^"  :{afix:OperatorData.AfixType.infix},
					"~"  :{afix:OperatorData.AfixType.infix},
				},
				{
					">>" :{afix:OperatorData.AfixType.infix},
					"<<" :{afix:OperatorData.AfixType.infix},
					">>>":{afix:OperatorData.AfixType.infix},
				},
				{
					"|"  :{afix:OperatorData.AfixType.infix},
				},
				{
					"==" :{afix:OperatorData.AfixType.infix},
					"!=" :{afix:OperatorData.AfixType.infix},
					">=" :{afix:OperatorData.AfixType.infix},
					"<=" :{afix:OperatorData.AfixType.infix},
					">"  :{afix:OperatorData.AfixType.infix},
					"<"  :{afix:OperatorData.AfixType.infix},
				},
				{
					"&&" :{afix:OperatorData.AfixType.infix},
					"||" :{afix:OperatorData.AfixType.infix},
					"^^" :{afix:OperatorData.AfixType.infix},
					"~~" :{afix:OperatorData.AfixType.infix},
				},
				{
					"?&"  :{afix:OperatorData.AfixType.infix,includes:["?|"]},//ternary operator
					"&?"  :{afix:OperatorData.AfixType.infix,includes:["?|"]},//ternary operator
					"?|"  :{afix:OperatorData.AfixType.infix},//ternary operator
				},
				{
					":"    :{afix:OperatorData.AfixType.infix},//variable declarator and type operator
					":\x00":{afix:OperatorData.AfixType.prefix},//variable declarator and type operator
				},
				{
					"\\" :{afix:OperatorData.AfixType.prefix},
					"=" :{afix:OperatorData.AfixType.infix,isInverseBracketing:true},//'a=(b=c)' instead of '(a=b)=c'
					"if":{afix:OperatorData.AfixType.prefix,numOfArgs:1,includes:["else"]},
					"else":{afix:OperatorData.AfixType.prefix,numOfArgs:1},
					"while":{afix:OperatorData.AfixType.prefix,numOfArgs:2,includes:["else"]},
					"match":{afix:OperatorData.AfixType.prefix,numOfArgs:2},
					//"iterate":{afix:OperatorData.AfixType.prefix,numOfArgs:3,includes:[""]},//'iterate array startValue iterFunction'
					"for":{afix:OperatorData.AfixType.prefix,numOfArgs:4}, // 'for let i = 0 i<10 i++ print<|i'
					"do":{afix:OperatorData.AfixType.prefix,numOfArgs:1,includes:["while"]},
					"try":{afix:OperatorData.AfixType.prefix,numOfArgs:1,includes:["catch", "finally"]},
					"finally":{afix:OperatorData.AfixType.prefix,numOfArgs:1},
					"$$" :{afix:OperatorData.AfixType.prefix},//'\$${a=2;b=3}' '$$:=2' ; unique symbol
				},
				{
					"@"  :{afix:OperatorData.AfixType.prefix},
				},
				{
					"¬":{afix:OperatorData.AfixType.infix,parameter:OperatorData.left},
				},
			])
		;
		class FunctionCallWordSymbol extends WordSymbol{
			constructor(data){
				super({word:"<|",...data});
			}
			word="<|";
			operatorType=operatorProceedence.FunctionCallWordSymbol.prefix;
			type=SyntaxTree.type.operator;
			subtype=SyntaxTree.subtype.pipeline;
			isReversed=true;
			contence=[];
			arguments=[];
		}
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
			//wordSymbol;//:WordSymbol?
			afix;//:Expression.afix
			static defaultProceedence = 0;
			static AfixType = SyntaxTree.AfixType;
			static Value = class Value extends Expression {//for 'a:>b|>foo,c<:d' ; value literal constant
				//contence:Expression[]
				//value:String|Bool|Number|Number[2] ; //TODO: define NumberLiteralType
				//impl NumberLiteralType for This
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
				let tryNext = forBail(words.length);
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
				let tryNext = forBail(words.length,()=>words[i]+"");
				let nextOperatorData:Option<OperatorData>;
				//TODO: write a GOOD system for assigning afixes to operators.
				//TODO: replace the `{[String]:OperatorData}` type with `OperatorData[4]&[[Afix]:OperatorData]`
				generate_exp_objects:while((word=words[i])&&word.word!=";"){
					tryNext();
					exps.push(match(word.type,[//:mutate current_expression & valueStack
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
							assert(!!possibleAfixes,`unhandled case for operator '${word.word}' in \`operatorProceedence\``)
							let num = !!possibleAfixes.prefix + !!possibleAfixes.infix + !!possibleAfixes.postfix + !!possibleAfixes.nofix;
							let exp = new Expression.Operator(word,{});
							let operatorData;
							if(nextOperatorData){
								operatorData = nextOperatorData;
								nextOperatorData = undefined;
							}
							else{
								if(num == 1){
									operatorData = possibleAfixes.infix ?? possibleAfixes.prefix ?? possibleAfixes.postfix ?? possibleAfixes.nofix;
									assert(!!operatorData);
								}
								else{
									const hasArg = word => !!word && word.word != ";";//BODGED: TODO: assign preceedences & afixes in the next, expression tree building, phase.
									const isArgSymbol_andGetArg = (wordArg,expArg,isRightArg) => match(wordArg.type,[
										[[SyntaxTree.type.bracket,SyntaxTree.type.label,SyntaxTree.type.value],()=>true],
										[[SyntaxTree.type.operator],()=>{
											if(isRightArg){
												let operatorData = operatorProceedence[wordArg.word].prefix;
												if(wordArg.afix != undefined ? wordArg.afix == SyntaxTree.AfixType.infix || wordArg.afix == SyntaxTree.AfixType.prefix : operatorData){
													special_case:if(wordArg.word == ":" && !["\\"].includes(word.word)){//allow for '$$:'--> ':'[ '$$' ] and '\:...' --> '\'[ ':'[ '...' ] ]
														
														return false;
													}
													wordArg.afix = SyntaxTree.AfixType.prefix;
													nextOperatorData = operatorProceedence[wordArg.word].prefix;
													return true;
												}
											}
											else{
												let operatorData = operatorProceedence[wordArg.word].postfix;
												loga("??",wordArg+"",word+"")
												if(wordArg.afix != undefined ? wordArg.afix == SyntaxTree.AfixType.infix || wordArg.afix == SyntaxTree.AfixType.postfix : operatorData){
													expArg.afix = expArg.afix == Expression.AfixType.prefix ? Expression.AfixType.nofix : Expression.AfixType.postfix;
													expArg.operatorData = operatorData;
													wordArg.afix = expArg.afix;
													return true;
												}
											}
											if(operatorProceedence[wordArg.word].nofix){
												wordArg.afix = SyntaxTree.AfixType.nofix;
												return true;
											}
											return false;
										}],
									]);
									let hasLeftArg:bool = hasArg(words[i-1]) && ((false && word.word == "=" && [":"].includes(words[i-1]?.word))?false: isArgSymbol_andGetArg(words[i-1],exps[exps.length-2],false));
									let hasRightArg:bool = hasArg(words[i+1]) && ((word.word == ":" && ["="].includes(words[i+1]?.word))?false: isArgSymbol_andGetArg(words[i+1],undefined,true));
									assume(typeof OperatorData.AfixType.operatorWithLeftArg == "number","assumed type is a FlagSet");
									type FlagSet = uint & bool[];
									let expectedAfixFromGivenWords:AfixType&FlagSet =
										(hasLeftArg*OperatorData.AfixType.operatorWithLeftArg) |
										(hasRightArg*OperatorData.AfixType.operatorWithRightArg)
									;
									operatorData = match(expectedAfixFromGivenWords,[
										[[OperatorData.AfixType.prefix],()=>possibleAfixes.prefix],
										[[OperatorData.AfixType.infix],()=>possibleAfixes.infix],
										[[OperatorData.AfixType.postfix],()=>possibleAfixes.postfix],
										[[OperatorData.AfixType.nofix],()=>possibleAfixes.nofix],
									]);
									if(!operatorData)
										word.throwError("syntax", `cannot use operator in that pattern got pattern: \`${
												!!(expectedAfixFromGivenWords&OperatorData.AfixType.operatorWithLeftArg)?"A":""
											} ${word} ${
												!!(expectedAfixFromGivenWords&OperatorData.AfixType.operatorWithRightArg)?"B":""
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
							return exp;
						}],
					]));
					i++;
				}
				collect_arguments_into_tree:{
					function collectIntoTree(startIndex = 0,localMaxProceedence,exps):mutates<exps>{
						for(let proceedence = 0; proceedence < localMaxProceedence; proceedence++){
							function afixWrongArgumentError(exp):Never{
								exp.wordSymbol.throwError("syntax",`invalid argument pattern for operator '${exp.wordSymbol.word}'`,e=>Error(e));
							}
							function handleArgs(exps,i,proceedence):out<{i}> & mutates<exps,exps[i]>{
								let selfExp = exps[i];
								function missingOperatorError(selfExp,argExp,argIndex){
									selfExp.wordSymbol.throwError("syntax",`operator '${selfExp.wordSymbol}' missing ${["left", "right"][argIndex]} argument`,e=>Error(e));
								}
								if(match(selfExp.constructor,[
									[[Expression.Operator,Expression.Bracket],()=>false],
									[[Expression.Label,Expression.Value],()=>true],
								])){return {i}};
								selfExp.operatorData.proceedence.forEach((argProceendence,j)=>{
									if(argProceendence != proceedence)return;
									let argIndex = j * 2 - 1;//:Index<exps->Expression>
									let argExp = exps[i + argIndex];
									let hasParam = !!(selfExp.operatorData.afix & [Expression.AfixType.operatorWithLeftArg,Expression.AfixType.operatorWithRightArg][j]);
									let hasArg = !!selfExp.args[j];
									if(!argExp){//:return
										if(hasParam && !hasArg){
											if(j == 0 && (i == 0 || ["\\"].includes(argExp.wordSymbol.word)) && ":=".includes(selfExp.wordSymbol.word)){//for '(:=exp)' and '\=exp'
												assert.fail("unreachable??");
												selfExp.afix = Expression.AfixType.prefix;
												return;
											}
											else missingOperatorError(selfExp,argExp,j);
										}
										else return;
									}
									else if(hasParam){
										const addArg = ()=>{
											selfExp.args[j] = argExp;
											exps.splice(i + argIndex,1);
											if(j == 0)i--;
										};
										if((argExp.operatorData?.proceedence?.[1] ?? Expression.defaultProceedence) <= argProceendence){
											addArg()
											return;
										}
										{//e.g. $\#a+#b
											const operatorFacingTowardsSelf:Afix = [Expression.AfixType.operatorWithLeftArg,Expression.AfixType.operatorWithRightArg][1-j];
											const selfConsumingArgOfHigherPreceedence = argExp.operatorData && !(argExp.operatorData.afix & operatorFacingTowardsSelf);
											if(
												j == 1
												&& selfConsumingArgOfHigherPreceedence
											){
												collectIntoTree(argIndex,argExp.operatorData.proceedence,exps);
												addArg();
												return;
											}
											else missingOperatorError(selfExp,argExp,j);
										}
									}
								});
								return {i};
							}
							for(let i = startIndex; i < exps.length; i++){
								if(!exps[i].operatorData)continue;
								if(exps[i].operatorData.isInverseBracketing)continue;
								if(exps[i] instanceof Expression.Bracket && !exps[i].knownAfix){
									exps.knownAfix = true;
									if(!exps[i-1] || exps[i-1].operatorData?.proceedence?.[1] > exps[i].operatorData.proceedence[0]){
										delete exps[i].operatorData;
										exps[i].afix = Expression.AfixType.nofix;
										continue;
									}
									else exps[i].afix = Expression.AfixType.postfix;
								}
								({i} = handleArgs(exps,i,proceedence));
							}
							for(let i = exps.length - 1; i >= startIndex; i--){
								if(!exps[i].operatorData)continue;
								if(!exps[i].operatorData.isInverseBracketing)continue;
								({i} = handleArgs(exps,i,proceedence));
								i--;
							}
						}
					}
					collectIntoTree(0,maxProceedence,exps);
				}
				assert(exps.length == 1,"",msg=>{console.error(""+exps.map(v=>[v.wordSymbol.errorData.line,v]));return Error(msg)});
				return {index:i,expression:exps[0]};
			},
		};
		function parseOperatorSyntaxTree(rootPattern):Expression[]{
			return contexts.expressions(0,rootPattern,rootPattern);
		}
		Object.assign(parseOperatorSyntaxTree,{
			OperatorData,
			operatorProceedence,
			FunctionCallWordSymbol,
		});
		return parseOperatorSyntaxTree;
	})();
	function parseAST(rootPattern){//parses abstract syntax tree
		//data
			class Value{
				constructor(data={}){Object.assign(this,data);}
				static type = EnumSymbols("string", "number", "bool", "optional", "type");
			}
			class Value_Type extends Value{
				constructor(data={}){super();Object.assign(this,data);}
			}
			class VariableRef extends Value{//'a'
				constructor(data={}){super();Object.assign(this,data);}
				declaration?:&Variable;
				name:WordSymbol & label;
			}
			interface WordSymbol{
				//input:
					word;
					operatorType;
					type:SyntaxTree.type;
					parent:WordSymbol;
				//intermideate:
				//output:
					parentScope:WordSymbol & (bracket | function_ | typeScope);
					pattern:PatternData;
					wordScopeType:WordScopeType;
			}
			const WordScopeType = EnumSymbols("expression", "type", "parameter");
			type LabelIdentifier = String|index;//might not need symbols
			class Variable{//variable declarations
				constructor(data={}){Object.assign(this,data);}
				name:WordSymbol&string;
				firstAssignment:VariableRef=undefined;
				currentAssignment:VariableRef=undefined;
				refs:VariableRef[]=[];
			}
			class Parameter extends Variable{//'let a' or 'a->'
				name:WordSymbol&string;
				refs:VariableRef[]=[];
				constructor(data={}){super();Object.assign(this,data);}
				type:WordSymbol&expression;
				path:(int|WordSymbol)[];// index or property
				rootParameterWord:WordSymbol//the root parameter expression e.g. '()' in '(a b)->'
				isSpreadParameter:bool;//'args' in '(a b ...args c)->'
				toString(){
					return this.name+"";
				}
			}
			class ScopeRef extends Variable{
				constructor(data={}){super();Object.assign(this,data);}
				scopeRef:WordSymbol;//for 'a' in 'ref a'
				refs:(&VariableRef)[];//refs to this variable
				value:Parameter;//'a' in 'let a = 2' ; includes variable's declaration
			}
			interface PatternData {//used in word.pattern
				parameter:WordSymbol&param;//for 'a' in 'a=b' 'a->b' 'a|b'
				argument:WordSymbol&(exp|shortExp); //for 'b' in 'a=b' 'a->b' 'a<|b'
				arguments:WordSymbol[]&(exp|shortExp)[];//e.g. for 'foo[a][b][c]'
				parameters:Parameter[];//:Map(parameter_name=>type&expression) & Map((String|WordSymbol)=>WordSymbol)
				refs;
				variables_start:Map<String,Variable>;
				variables_current:Map<String,Variable>;
				value:VariableRef|Value|WordSymbol&type.value;
				contence:{
					words:WordSymbol[],
					scopeType:ScopeTypes,
				}
			}
			interface ScopeData extends PatternData{
				variables_start:Map<String,Variable>;
				variables_current:Map<String,Variable>;
				contence:{
					words:WordSymbol[],
					scopeType:ScopeTypes,
				}
			}
		//----
		{//syntax checking
			type W = WordSymbol;
			let ScopeTypes = EnumSymbols(
				"normal",//'()', '{}', '[]'
				"type",//'trait exp'
				"match",//'...' in 'match v {...}'
			 )
			const todo = [];
			function addScopeProperties(word):mutates<word>{
				word.pattern ??= {};
				Object.assign(word.pattern,{
					variables_start:new Set(),
					variables_current:new Map(),
					variables_declared:new Set(),
					...word.pattern,
				});
			}
			pass1:{//checks syntax, links some variable refs, adds declarations, readjusts syntax tree
				function addParents(parent:W){
					for(let word of parent.contence){
						if(!word)continue;
						word.parent = parent;
						if(word.contence)addParents(word)
					}
				}
				addParents(rootPattern);
				function expression(words:Tree<W>,scopeType?:ScopeType,scopeObj:W){//() or {}
					scopeType ??= ScopeTypes.normal;
					addScopeProperties(scopeObj);
					function tryDeclareVariable(word:WordSymbol&Parameter.rootParameterWord,isScopeRef:bool=false){
						let parameters:Parameter[] = word.pattern.parameters;
						for(let parameter of parameters){
							let parameterName:String = parameter.name.word;
							if(!scopeObj.pattern.variables_start.has(parameterName)){
								scopeObj.pattern.variables_start.add(parameterName,parameter);
								scopeObj.pattern.variables_current.set(parameter.name.word,parameter);
							}
						}
					}
					function tryGetVariable(word:WordSymbol&Parameter.rootParameterWord,isScopeRef:bool=false){
						scopeType.variables_current.set(parameter.name,parameter);
					}
					for(let i=0;i<words.length;i++){
						const word:(WordSymbol|null) = words[i];
						if(word===null){continue}//handle `= 2` -> `'='[null,'2']`
						assert(word instanceof WordSymbol);
						word.pattern ??= {};
						word.wordScopeType = WordScopeType.expression;
						let innerScope = scopeType;//:ScopeType? & bool ; is Some<> if we want to parse the contence after the match statement
						if(word.type == SyntaxTree.type.parameterExp){//done for both normal and match expressions
							word.pattern.parameter = word.isReversed ? word.arguments[1] : word.arguments[0];
							word.pattern.arguments = [word.isReversed ? word.arguments[1] : word.arguments[0]];//note: pattern's args are in the correct ordered, which is baced on the operator
							let parameterIndex = word.contence.indexOf(word.arguments[0]);
							
						}
						match(scopeType,[
							[[ScopeTypes.match],()=>{
								match(word.type,[
									[[SyntaxTree.type.parameterExp],()=>{
										//'case->exp'
										let caseParam = word.pattern.parameter;
										{//parse case type/param exp
											expression([caseParam],ScopeTypes.type,word);
										}
										expression([word.pattern.arguments[0]],ScopeTypes.normal,word.pattern.arguments[0]);
										expression(word.contence.filter(v=>!word.arguments.includes(v)),ScopeTypes.normal,word);//handle voids
										innerScope = undefined;
									}],
								],()=>{expression([word],ScopeTypes.normal,scopeObj)});
								if(word.contence?.length && innerScope){
									expression(word.contence,ScopeTypes.normal,scopeObj);
								}
							}],
							[[ScopeTypes.normal,ScopeTypes.type],()=>{
								match(word.type,[
									[[SyntaxTree.type.parameterExp],()=>{//'a->b' 'a=>b' 'b<-a' 'b=<a'
										if(word.isReversed)word.arguments = [word.arguments[1],word.arguments[0]];
										{
											if(!word.isReversed){// 'a->' in 'parem->exp'
												if(word.subtype == SyntaxTree.subtype.function)mutates_AST:if(!word.pattern.parameter && !word.isReversed){//tries: unwrap and pull parameter from leftside function call chain
													//'[a[a] ->a]' --> '[a [a]->a]'
													let endParent = words[i-1];//:Tree<WordSymbol>
													//let tryNext = forBail();
													while(endParent?.arguments){
														function checkIsParameter(word){
															return (word?.operatorType?.proceedence||-Infinity)<=parseIntoOperatorSyntaxTree.operatorProceedence.parameter.prefix.proceedence;
														}
														let lastWord = endParent.arguments[endParent.arguments.length-1];
														if(checkIsParameter(lastWord)){
															const parameter = lastWord;
															endParent.arguments[endParent.arguments.length-1] = word;
															endParent.contence.splice(endParent.contence.indexOf(parameter),1);
															word.parent = endParent;
															parameter.parent = word;
															if(word.parent){
																word.parent.contence.splice(word.parent.contence.indexOf(word),1);
																word.parent.arguments.splice(word.parent.contence.indexOf(word),1);
																if(words == word.parent.contence || words == word.parent.arguments)i--;
															}
															word.arguments[0] = parameter;
															{//assersions
																let indexOnContence = endParent.contence.indexOf(parameter);
																if(indexOnContence == -1)assert.impossibleCase("invalid contence/arguments");
															}
															break;
														}
														endParent = lastWord;
													}
												}
											}
											if(
												match(word.subtype,[//allows for 'mut=b' and '[=b]' throws error on '(=b)' or '->b'
													[[undefined,SyntaxTree.subtype.function],()=>true],
													[[SyntaxTree.subtype.assignment],()=>!(word.word == "[" || word.parent.subtype == SyntaxTree.subtype.mutabilityModifier)]
												])&&
												!word.pattern.parameter
											){
												let isFunction = word.subtype == SyntaxTree.subtype.function;
												word.throwError("syntax",
													"missing " + ["variable name", "parameter"][+isFunction]
													+ " on " + ["assignment", "function declaration"][+isFunction],
													e=>Error(e)
												);
											}
											word.pattern.parameters = getParameters(word.pattern.parameter,word.subtype == SyntaxTree.subtype.function);
											if(word.pattern.arguments[0]){
												expression(word.pattern.arguments,scopeType,word);
											}
											innerScope = undefined;
										}
									}],
									[[SyntaxTree.type.keyword_parameter,SyntaxTree.type.keyword_parameter_expression],()=>{//'let param' and 'into param exp'
										if(!word.arguments[0] && word.subtype == SyntaxTree.subtype.declaration && word.parent.subtype == SyntaxTree.subtype.assignment){
											if(!word.arguments[0]){//'let= a' ; same as 'let a = a'
												assert(word.parent.arguments[0] == word);//assume: arguments from '=>' and '=<' are in the right order
												word.pattern.parameter = word.parent.arguments[1];
											}
											else word.pattern.parameter = word.parent.arguments[1];
										}
										else {
											if(!word.arguments[0])word.throwError("syntax", "missing expression", e=>Error(e));
											word.pattern.parameter = word.arguments[0];
										}
										word.pattern.parameters = getParameters(word.pattern.parameter);
										if(word.subtype == SyntaxTree.subtype.declaration){//'let a'
											tryDeclareVariable(word);
											innerScope = undefined;
										}
										else if(word.subtype == SyntaxTree.subtype.scopeRef){//'into a exp' or 'from a exp'
											expression(word.contence,innerScope,word);
											innerScope = undefined;
										}
									}],
									[[SyntaxTree.type.keyword_expression],()=>{//'static exp'
										match(word.subtype,[
											[[SyntaxTree.subtype.typeScope],()=>{//'type' or 'trait'
												expression(word.contence,ScopeTypes.type,word);
											}],
											[[SyntaxTree.subtype.void],()=>{
											}],
											[()=>["break", "yeild"].includes(word.word),()=>{
											}],
										],()=>{
											if(!word.arguments?.[0])word.throwError("syntax", "missing expression", e=>Error(e));
										});
									}],
									[[SyntaxTree.type.label],()=>{
										function addVariableRef(word,scopeObj):mutates<word>{
											word.pattern ??= {};
											let name = word.word;
											Object.assign(word.pattern,{
												value:new VariableRef({
													name:name,
													source:word,
													declaration:undefined,
												})
											});
											if(scopeObj.pattern.variables_current.has(name)){
												const declaration:Variable = scopeObj.pattern.variables_current.get(name);
												word.pattern.value.declaration = declaration;
												declaration.refs.push(word.pattern.var);
											}
											else{
											}
										}
										addVariableRef(word,scopeObj);
									}],
									[[SyntaxTree.type.value],()=>{
										word.pattern ??= {};
										word.pattern.value = word.parent;
									}],
									[[SyntaxTree.type.blockType],()=>{
										if(word.arguments.length < word.operatorType.numOfArgs)
										if(!word.parent.operatorType?.includes?.includes(word.word)){//allow for 'do exp while exp'
											word.throwError("syntax", "missing argument for " + word.word + " statement", e=>Error(e));
										}
										match(word.word,[
											[["for"],()=>{
												expression(word.contence,scopeType,word.arguments[3]);
												innerScope = undefined;
												//'for start condision next do'
											}],
											[["match"],()=>{//TODO
												expression([word.arguments[0]],scopeType,scopeObj);
												expression(word.arguments[1].contence,ScopeTypes.match,word);
												innerScope = undefined;
											}],
											//if|else|while|for|try|do|match
										],()=>{});
									}],
									[[SyntaxTree.type.bracket],()=>{
										expression(word.contence,word.word=="{"?ScopeTypes.normal:scopeType,word);
										innerScope = undefined;
									}],
									[[SyntaxTree.type.operator],()=>{}],
									[[SyntaxTree.type.keyword_shortExpression],()=>{}],//'trait shortExp'
									[[SyntaxTree.type.sepparator],()=>{}]//',' or ';'
								]);
								if(word.contence?.length && innerScope){
									expression(word.contence,innerScope,scopeObj);
								}
							}],
						]);
					}
					function getParameters(parameterExp:W,isFunctionParam:bool=false,isActionTrait=false):Parameter[]{
						//`isFunctionParam` is for '->' and 'let' only. if false, allows for 'pub exp'
						const baseParameter = parameterExp;
						function getParameter(parameterExp:WordSymbol,parameterList,parameterPath):mutates<Parameter[]>{
							parameterExp.wordScopeType = WordScopeType.parameter;
							//parameterExp: WordSymbol ; parameter(s) expression
							let parameterType;//:WordSymbol?
							let isSpreadParameter = false;
							if(parameterExp.word == "..."){
								isSpreadParameter = true;
								parameterExp = parameterExp.arguments[0];
							}
							if(parameterExp.subtype == SyntaxTree.subtype.declaration){//'((pub a=int))->'
								parameterExp = parameterExp.arguments[0];
							}
							if(!parameterExp)return;
							if(parameterExp.subtype == SyntaxTree.subtype.assignment){//for 'let= a' or '(a=b)->'
								expression([parameterExp],scopeType,scopeObj);
								parameterType = parameterExp.pattern.arguments[0];
								parameterExp = parameterExp.pattern.parameter;
							}
							if(!parameterExp)return;
							if(parameterExp.subtype == SyntaxTree.subtype.void){
								parameterExp.throwError("syntax", "not allowed 'void' expressions in parameters. This rule exists to simplify the transpiler.", e=>Error(e));
							}
							if(parameterExp.type == SyntaxTree.type.bracket){
								let index = 0;
								for(let i = 0;i < parameterExp.contence.length;i++){
									let word:WordSymbol = parameterExp.contence[i];
									if(word.word != ";")index++
									getParameter(word,parameterList,[...parameterPath,index]);
								}
								return;
							}
							else if(parameterExp.word == ","){//',' arrays
								let parameterExp1 = parameterExp;
								let i = 0;
								while(parameterExp1.word == ","){//assume 'a,b,c' -> '",":[",":[a,b],c]'
									getParameter(parameterExp1.arguments[1],parameterList,[...parameterPath,i]);
									parameterExp1 = parameterExp1.arguments[0];
									i++;
								}
								getParameter(parameterExp1,parameterList,[...parameterPath,i]);
								return;
							}
							else if(parameterExp.type == SyntaxTree.type.label){
								parameterList.push(new Parameter({
									name:parameterExp,
									type:parameterType??undefined,
									path:parameterPath,
									rootParameterWord:parameterExp,
									isSpreadParameter,
								}));
								return;
							}
							else if(!isFunctionParam && parameterExp instanceof parseIntoOperatorSyntaxTree.FunctionCallWordSymbol){//'a[1][2] = '
								//note this is only allowed on simple objects, not general types.
								expression(parameterExp.contence,scopeType,parameterExp);
								parameterList.push(new Parameter({
									name:parameterExp,
									type:parameterType??undefined,
									path:parameterPath,
									rootParameterWord:parameterExp,
									isSpreadParameter,
								}));
								return
							}
							else if(!isFunctionParam  && parameterExp.word == "."){//'a.b = '
								let parentObject = parameterExp.arguments[0];
								let property = parameterExp.arguments[1];
								if(parameterExp.arguments.length == 0){
									if(!isActionTrait){
										parameterExp.throwError("syntax", "expected values e.g.`a.b` on dot operator. note: using `.` on it's own is only allowed in the action traits or `(.).->` `this.->`", e=>Error(e));
									}
									return
								}
								getParameter(property,parameterList,[...parameterPath,parameterExp]);
								return;
							}
							//asset parameterExp is invalid for normal parameter values
							{
								if(parameterExp.type == SyntaxTree.type.value){
									parameterExp.throwError("syntax", "invalid parameter, got value literal",e=>Error(e));
									return;
								}
								else parameterExp.throwError("syntax", "invalid parameter",e=>Error(e));
							}
						}
						let parameterList = [];//:Word().contence
						if(parameterExp)getParameter(parameterExp,parameterList,[]);
						return parameterList;
					}
				}
				addScopeProperties(rootPattern)
				expression(rootPattern.contence,ScopeTypes.normal,rootPattern);
				addParents(rootPattern);//BODGED; update parents to account for any mutations to the AST
			}
			function findVariable(){}
			pass2:{//link variables declarations, refs and assignment
				function expressions(words:W[]&Tree<W>,parent:W){
					for(let i=0;i<words.length;i++){
						const word:(WordSymbol|null) = words[i];
						if(word===null){continue}//handle `= 2` -> `'='[null,'2']`
						match(word.wordScopeType,[
							[[WordScopeType.expression,undefined],()=>{
								if(word.type == SyntaxTree.type.label){//'a'
									let ref:VariableRef = word.pattern.value;
									assert(ref instanceof VariableRef);
								}
								else if(word.type == SyntaxTree.type.parameterExp && word.subtype == SyntaxTree.subtype.assignment){//'a=b'
									
								}
								if(word.contence){
									expressions(word.contence,word);
								}
							}],
							[[WordScopeType.type],()=>{
								
							}],
							[[WordScopeType.parameter],()=>{return}],
						]);
					}
				}
				expressions(rootPattern.contence,undefined)
			}
		}
		{//handle '[]' special syntax e.g. '[a = 2]' -> '[pub let a = 2]'
		}
		{//get variables
			function expressions(wordSymbol,parent){//() or {}
				;
			}
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
function compile(text,throwError,fileName="main file"){
	text??="";
	try{
		WordSymbol.ErrorData.throwError = throwError??(e=>{throw e});
		const syntaxTree = new SyntaxTree(text,throwError,fileName);
		class RootPattern extends WordSymbol{}
		const rootPattern = new RootPattern({contence:syntaxTree});
		const abstractSyntaxTree:Expression[] = parseIntoOperatorSyntaxTree(rootPattern);//:mutates rootPattern
		//assert(abstractSyntaxTree == rootPattern);
		//parseAST(rootPattern);//:mutates rootPattern
		function printTree(){//a TEST function for debugging
			let len = 0;
			let string = (function forEach(a,i=-4,a1){
				len++;
				return "\t".repeat(i)+(!a?a:
					a.wordSymbol+
					(a.args?"\n"+a.args.map(v=>forEach(v,i+1,a)).join("\n"):"")
				);
			})({args:abstractSyntaxTree},0);
			return string + "\n" + len;
		}
		loga(printTree());
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
//a="Coords := \(*$$:;#x:=0;#y:=0);";
if(1)compile(a??"");
else try{compile(a)}catch(e){console.error(e+"")};