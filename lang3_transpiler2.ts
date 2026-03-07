//{//quality of life, macro-like functions
	function loga(...a){console.log(...a);return a[0]}
	function logData(...a){
		console.log(...a.map(v=>v.toLog?.()??v))
	}//log data emmits surtain information
	/**
	 * void let loga = [...a] -> void console.log <| ...a a<|0]
	 * void let logData = [...a] -> {void console.log[...a.map <| v->traitof v >= trait[toLog=\(void)]? v.toLog?.():v}
	 * void let DEBUG_MODE = true
	 * void let assert = [condision msg ??= "" errorFunc ??= a->Error[e]] -> void:(
	 *   void 
	 * )
	 * */
	const DEBUG_MODE = true;
	function assert(condision,msg = "",errorFunc = e=>Error(e)){
		if(DEBUG_MODE){
			msg ??= "";//msg:String|()->String
			if(!condision)throw errorFunc("ASSERTION FAILLED:" + (typeof msg == "function"?msg():msg));
		}
	}
	function assume(condision,msg = "",errorFunc = e=>Error(e)):()=>any{
		if(DEBUG_MODE){
			msg ??= "";
			if(!condision)throw errorFunc("ASSUMPTION FAILLED:" + msg);
		}
		return (fooUsingAssumption:Fn|any)=>typeof fooUsingAssumption == "function" ? fooUsingAssumption(condision) : fooUsingAssumption;
	}
	assert.fail = function(msg = undefined,errorFunc = e=>Error(e)){
		if(DEBUG_MODE){
			msg ??= "impossible case found";
			assert(false,msg,errorFunc);
		}
	}
	assert.impossibleCase = function(msg = "",errorFunc = e=>Error(e)){
		if(DEBUG_MODE){
			assert(false,"impossible case: " + msg,errorFunc);
		}
	}
	function unreachable(msg = "",errorFunc = e=>Error(e)){
		if(DEBUG_MODE){
			assert(false,"unreachable: " + msg,errorFunc);
		}
	}
	assert.expect = function(condision,msg = "",errorFunc = e=>Error(e)){
		if(DEBUG_MODE){
			assert(condision,"expected: " + msg,errorFunc);
		}
	}
	function todo(msg = "",errorFunc = e=>Error(e)){
		if(DEBUG_MODE){
			throw errorFunc("TODO:" + msg);
		}
	}
	function unimplemented(msg = "",errorFunc = e=>Error(e)){
		if(DEBUG_MODE){
			throw errorFunc("UNIMPLEMENTED:" + msg);
		}
	}
	/// throws an error if called more than the max number of times
	/// is for making while-loops safe
	/// for(let _ of forBail(10)) { ... }
	function* forBail(length,error_message?:(i)=>String):true{
		//example: let n=forBail(array.length);while(true){n();}
		for(let i=0;i<length;i++){yield true}
		if(DEBUG_MODE){
			let msg:String = (error_message!==undefined?": "+error_message(length):"");
			throw Error("BAILED"+msg);
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
	function throwError(message,err=msg=>Error(msg)){
		throw err(message)
	}
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
const bracketMap = {
	openClosed:{
		"(":")","[":"]","{":"}",
		")":"(","]":"[","}":"{",
	},
	toJavascriptBrackets:{
		"(":"{",")":"}",
		"[":"[","]":"]",
		"{":"(","}":")",
	},
};
function transpile(rawText:String){
	class Word extends String {//wraps string into an object
		constructor(string,i){
			super(string);
			this.word = string;
			this.index = i;
		}
		getText(){
			return this+"";
		}
	}
	class Bracket extends Word {
		constructor(bracket,i){
			super(bracket+"",i);
		}
		getText(){
			return ""+this+this.contence.map(v=>v.getText?.()??v+"").join()+this.closingBracket;
		}
		flat(){
			return [""+this,...this.contence,this.closingBracket];
		}
		contence:Word[] = [];
		closingBracket:Word&(")"|"]"|"}") = undefined;
	}
	const words_regex = /\/\*[\s\S]*?\*\/|\/\/.*|r(#+)"[\s\S]*?"\1|"(?:\\u....|\\x..|\\.|[^"\n])*?"|[\@\$\#]\*|(?:\?&|&\?|\?\|)|\.\.=?|\.\.\.|[|:]>|<[|:]|>:|::?|\\|(?:!<|!>)|!!!|=>|->|[><!=]=?|[+\-*%&|^~]{1,2}|#[#@?]|\${1,2}|[¬\\]|\s+|[\(\[\{]|[\)\]\}]|\b(?:0[box][_0-9A-Fa-f]+|[0-9_](?:\.(?:(?!\.)|(?:[0-9_]+)))?)\b|\.|\b\w+\b|\S/g;
	let words = rawText.match(words_regex)??[];
	let tryNext=forBail(words.length);
	function skipKey(i):Option<int>{//None case if no match found
		for(let _ of forBail(words.length)){
			if("$@".includes(words[i])){i++;continue;}
			break;
		}
		if([",", "<|", "|>", "<:", ":>"].includes(words[i]))
			return null;
		i++;//skips key name
		return i;
	}
	function skipShortExp_commaArgument(words:String[],i:int):int{
		//TODO: include transpiling for short expressions including `a:b` --> `let a = b` 
		let next_i = skipKey(i);
		if(skipKey(i) == null) {
			return i;
		}
		i = skipKey(i);
		for(let _ of forBail(words.length)){
			let word = words[i];
			if(".".includes(word)){
				i++;
				i = skipKey(i);
				continue;
			}
			if("([".includes(word)){i++;continue}//function call
			break;
		}
		return i;
	}
	function tryParseStatement(words:Word[],i:int):[int,Word]{
		match(words[i],[
			[["if",""],word=>{
				words[i] = new Word(word+"(")//'if a => b' --> 'if(a )(()=>b)'
				i++;
			}]
		])
	}
	function parseBracket(i,parentOpeningBracket:Word&OpenBracket=undefined){
		let contence = parentOpeningBracket?.contence??[];
		for(let word;(word = words[i])&&tryNext.next();){
			if("([{".includes(word)){
				words[i] = word = new Bracket(word,i);
				contence.push(word);
				i++;
				[i] = parseBracket(i,word);
				continue;
			}
			if(")]}".includes(word)){
				let expectedOpeningBracket:Char = bracketMap.openClosed[word];
				if(!parentOpeningBracket)throwError(`extra closing bracket '${word}'`);
				if(expectedOpeningBracket+"" != parentOpeningBracket)throwError(`mismatching closing brackets got '${parentOpeningBracket}' '${word}'`);
				parentOpeningBracket.closingBracket = words[i] = word = new Word(word,i);
				i++;
				return [i,contence];
			}
			contence.push(word);
			i++;
		}
		handle_patterns:{
			let i = 0;
			for(let _ of forBail(contence.length+1,(a)=>contence[i])){
				let word = contence[i];
				assume(word!="");
				if(!word)break;
				if(word == ","){//function call
					let bracket = new Bracket("(",i);
					bracket.closingBracket = ")";
					i++;
					let nextI = skipShortExp_commaArgument(contence,i);
					loga(i,nextI,contence[i],contence[nextI]);
					let functionArgument = contence.splice(i,nextI-i);
					bracket.contence = functionArgument;
					contence.splice(i-1,1,bracket);
					continue;
				}
				i++;
			}
		}
		if(parentOpeningBracket)throwError(`missing closing bracket for '${parentOpeningBracket}'`);
		return [i,contence];
	}
	let [_,bracketTree]:Tree<Word> = parseBracket(0);
	let flattened = (function map(tree:Word[]&Tree<Word>){
		let a = bracketTree.map((v,i)=>
			v.flat?
				v.flat():
				v
		).flat();
		return a;
	})(bracketTree)
	loga(flattened);
	//code = new Function(rawText);
	return code;
}
let code = `
	console.log,,"hello world";
`
transpile(code);
//Deno.readTextFileSync