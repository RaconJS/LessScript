//{//quality of life, macro-like functions
	function loga(...a){console.log(...a);return a[0]}
	function logData(...a){
		console.log(...a.map(v=>v.toLog?.()??v))
	}//log data emmits surtain information
	/**
	 * loga : \# £console.log(..#..);
	 * logData : \{£console.log[...a.map <| v->traitof v >= trait[toLog=\(void)]? v.toLog?.():v};
	 * debugMode : true;
	 * assert : [condision msg ??= "" errorFunc ??= a->Error[e]] -> void:(
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
	unimplemented.flaggedErrors = {};
	unimplemented.silent = function(name?:String,returnValue,state?:Any,errorFunc = e=>Error(e)){
		unimplemented.flaggedErrors[name] ??= {state,error:errorFunc};
		return returnValue;
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
	const methods = {
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
		EnumSymbols,
		getFile_expect,
		silentError,
	};
	export {methods};
//}//----