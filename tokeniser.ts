const words_regex = /\/\*[\s\S]*?\*\/|\/\/.*|[rf]?(?:r(#+)"[\s\S]*?"\1|"(?:\\u....|\\x..|\\.|[^"\n])*?")|[@$#]\*|(?:\?&|&\?|\|\?|\?!)|[|:]>|<[|:]|>:|::?|\\|(?:!<|!>)|=>|->|[!=]==|[><!=]=?|>{1,3}|<{1,2}|([+\-*%&|^~])\2?|#(?:\.\.|[#@?/\\])|\${1,2}|[¬\\]|\s+|[\(\[\{]|[\)\]\}]|\b(?:(?:\d|[1-9][_\d]*)(?:\.[_\d]+)?|0[box][_\dA-Fa-f]+(?:\.[_\dA-Fa-f]+)?)\b|!!!|\.\.\.|\.\.=?|\.|\b\w+\b|\S/g;//TODO: add back '#.'
	//note: float numbers are handed during syntax parting to allow for '3.<' aswell as '3.2'
	//TODO:handle format strings: need to combine words together when a format string is encountered
		//currently cannot embed format strings in other format strings
export function tokeniser_module_method(Public_Object){
	const {
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
	} = Public_Object;
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
	return {SyntaxTree, WordSymbol};
}