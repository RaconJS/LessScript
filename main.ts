//TODO: work on 1634 `function getDeclarationFromAutoparameter` ; implementing '##' '#@' '#?' get parameters for '\', 'if', 'else' etc..
	//1263 build type class for the language's type system
//name suggetions: quad`.qd` (the Quick Unreadable And Dirty programming language), `.cr` Crunch
//TODO: add code to support '::=' making '::' have the same syntax as ':'
import {methods as Public_Object} from "./qualityOfLife.ts";
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
	EnumSymbols,
	getFile_expect,
	silentError,
} = Public_Object;
Public_Object.printTree = printTree;
const fs = Deno;//require("fs");
//compiles simple lambda calculus
//tokeniser
	import {tokeniser_module_method} from "./tokeniser.ts";
	const {SyntaxTree, WordSymbol} = tokeniser_module_method(Public_Object);
	Object.assign(Public_Object,{
		SyntaxTree,
		WordSymbol,
	});
//parse tokens list into AST
	import {parseIntoOperatorSyntaxTree_function} from "./parseOperatorSyntaxTree.ts"//:Function
	const parseIntoOperatorSyntaxTree:Function = 
		parseIntoOperatorSyntaxTree_function(Public_Object);
//main compiler logic
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
				statementData?:{//operators that use '#@'; each '#@' refers to a different one
					statementExp:Expression<SyntaxTree.subtype.Statement|Any>,
					nextAutoParameterIndex:uint,//`#@`
					nextArgumentIndex:uint,//`in exp`
					params:Expression[],//used to address params for errors in `for in` statements (when not enough parameters)
				};
				forIn_statement?:&Context_parseAST.statementData;//reference to the last for statement
				parameters:{
					"#?"?:(&Expression)[],
					"#!"?:(&Expression)[],
					"#/"?:(&Expression)[],
					"#\\"?:(&Expression)[],
					"#.."?:(&Expression)[],
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
						if(exp.wordSymbol.subtype == SyntaxTree.subtype.autoParameter || exp.wordSymbol.word == "in"){
							let parentExp = match(exp.wordSymbol.word,[
								[["#@"],_=>{
									if(!context.statementData)return undefined;//throws error later
									exp.autoParameterIndex = context.statementData.nextAutoParameterIndex++;
									context.statementData.params.push(exp);
									return exp.paramRef = context.statementData.statementExp;
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
								["in",()=>{
									if(!context.forIn_statement)return undefined;
									exp.paramRef = context.forIn_statement.statementExp++;
									exp.autoParameterIndex = context.forIn_statement.nextArgumentIndex++;
								}],
							]);
							if(!exp.paramRef){
								let missingStatementName = match(exp.wordSymbol.word,[
									[["#", "##", "#\\", "#.."],()=>"function"],
									[["#?"],()=>"if expression"],
									[["#\\"],()=>"class"],
									[["in"],()=>"for-in expression"]
								],()=>"expression");
								exp.wordSymbol.throwError("syntax",`missing ${missingStatementName} for parameter`,e=>Error(e));
							}
						}
						function addStatementParameter(parameterName,isForLoop){
							let newParmaters = {...(context.parameters??{})};//deep clone parameters 
							let newContext = {...context,parameters:newParmaters};
							if(isForLoop){
								newContext.forIn_statement = newContext.statementData
								newContext.statementData = {
									statementExp:exp,
									nextAutoParameterIndex:0,
									nextArgumentIndex:0,
									params:[],
								};
							}
							if([].includes(parameterName)){
								newContext.parameters[parameterName]=[exp];
							}
							else {//stackable
								newContext.parameters[parameterName]??=[];
								newContext.parameters[parameterName].push(exp);
							}
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
							forEachExp(exp.args,newContext,paramPath);
						}
						match(exp.wordSymbol.word,[
							["\\",()=>addStatementParameter("#\\")],
							[word=>word == "/" && exp.afix == Expression.AfixType.prefix,()=>addStatementParameter("#/")],
							[["if", "else"],()=>addStatementParameter("#?")],
							["for",()=>addStatementParameter("#@",true)],
							["match",()=>addStatementParameter("#@")],
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
			const commonDefaultProperties = {
				"js":{get(self):Value_Derefed{return toJSValue(self)}},//to javascript object
				"log"(v){console.log(...arguments);return v},
			};
			const defaultFunctions_ObjectValue = {
				"="():Array{return defualtFunctionsInternal.map(this.array,...arguments)},
				">"():Value{return defualtFunctionsInternal.reduce(this.array,...arguments)},
				"||":{get(self):Value{return self.array.length}},//length
				...commonDefaultProperties,
			};
			const defaultFunctions_Array = {
				"="():Array{return defualtFunctionsInternal.map(this,...arguments)},
				">"():Value{return defualtFunctionsInternal.reduce(this,...arguments)},
				"||":{get(self):Value{return self.length}},//length
				...commonDefaultProperties,
			};
			const defaultFunctions_number = {
				"<"():Array{return defualtFunctionsInternal.iterate(+this,...arguments)},
				"="():Array{return defualtFunctionsInternal.repeat(+this,...arguments)},
				">"():Value{return defualtFunctionsInternal.reduceForNumber(+this,...arguments)},
				"r"():Value{return Math.random()*this},
				...commonDefaultProperties,
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
				Value_Javascript
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
				static Typed = class Typed{
					type:Expression|Value;
				}
			}
			class ValueStatementWrapper{//UNUSED
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
				exp:Expression<"\\",[":"&{args:params&Expression[]}]|[body_exp]>;
				//function tree structure: `"\"[":"[...params],body]` || `"\"[_,body]`
			}
			class ClassObj extends FunctionObj{
				constructor(data={}){super();Object.assign(this,data);}
				toString(){return "/ class";}
				toTree(){return this.exp.args.slice(1)}
				context:Context;
				exp:Expression<"/",{args:[parameters,body,Option<"\\" & constructor>]}>;
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
				forLoopExp?:{index:Number,exp:Expression<"for">,args:Value_Derefed[]};//index is the current iteration index
				constructor(data={}){Object.assign(this,data)}
				new_child(data={}){
					return new Context({...this,...data});
				}
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
							"inspect":(value,javascript_string)=>new Function("v,value",`return ${javascript_string}`)(value,value),
							"r":Math.random,
							"l"(v){console.log(...arguments);return v},
							"log"(v){console.log(...arguments);return v},
							...{
								prompt,
								confirm,
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
				static fromObjectOrObjectValue(value:ObjectValue|Array|Object):ObjectValue{
					return match(value,[
						[()=>value instanceof ObjectValue,()=>value],
						[()=>value instanceof Array,()=>new ObjectValue({array:value})],
						[()=>Object.getPrototypeOf(value) == Object.prototype,()=>new ObjectValue({properties:value})],
					]);
				}
				toJS(){
					return this.isArrayType?this.toJSArray():this.toJSObject();
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
		const JavascriptFunctionUseRawValues_symbol = Symbol("use Value");
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
								if(exp.wordSymbol.word == "[")variable.isArrayType = true;
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
							function getArgFromDoubleExpStatement(statement_exp):Expression[2]{//`if a=>b` --> `if a b` --> [a,b]
								assume(exp.args[1].wordSymbol.word == "=>" || exp.args[2],"e.g. 'if name;' is not defined in the syntax spec")
								const arrowExpArgs:Expression[2] = exp.args[2]?[exp.args[1],exp.args[2]]:exp.args[1].args;
								return arrowExpArgs;
							}
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
								["::",()=>{
									todo.silent("handle semi-type evaluation and comment-like type annotations propperly");
									return new ValueWrapper.Typed({
										value:evalCode.statement(exp.args[0],context),
										type:exp.wordSymbol.word,
									})
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
									value = try_getPropertyRef(parent,propertyNameValue);
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
									["%%%",()=>numericOperator((x,y)=>((x)%y+y)%y)],//positive modulo
									["%%",()=>numericOperator((x,y)=>!exp.args[1]?Math.log(x):Math.log2(x)/Math.log2(y))],//log
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
											assume(!(!!exp.args[0]&&!!exp.args[1]),"there is only one argument for `i++` or `++i`")
											let property = unwrapValue(evalCode.statement(exp.args[0]||exp.args[1],context));
											let value:Number|Value_Derefed = derefValueFully(property);
											if(typeof value != "number")value = 0;
											return match(afix,[
												[Expression.AfixType.prefix,()=>{assignToValue(property,value+1,exp);return +value}],//i++
												[Expression.AfixType.postfix,()=>assignToValue(property,value+1,exp)],//++i
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
										const arrowExpArgs:Expression[2] = getArgFromDoubleExpStatement(exp);
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
									["while",()=>{
										const [condition_exp,body_exp]:Expression[2] = getArgFromDoubleExpStatement(exp);
										let returnValue:Value;
										let argument:Value;
										while(!!derefValueFully(argument = evalCode.statement(condition_exp,context))){
											const innerContext = context.new_child_statement();
											innerContext.add_parameterSymbols({[Context.ParameterSymbol["#?"]]:[argument]});
											returnValue = evalCode.statement(body_exp,innerContext);
										}
										return returnValue;
									}],
									["for",()=>{
										let innerContext = context.new_child_statement({contextType:Context.ContextType.for});
										let indexRef = new ValueRef({value:0});//index `i`
										let iterators:Value_Derefed[] = [];//userally in the form of arrays
										innerContext.add_parameterSymbols({
											[Context.ParameterSymbol["#@"]]:args
										});
										const [firstIterableArg,body]:Expression[2] = getArgFromDoubleExpStatement(exp);
										if(firstIterableArg){
											args.push(evalCode.statement(firstIterableArg,context))
										}
										let returnValue;
										if(args.length == 0)returnValue = evalCode.statement(body,indexRef);

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
							let value = assignToValue(parameter,assignValue,parameter_exp);
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
					if(!foo[JavascriptFunctionUseRawValues_symbol])argsArray = argsArray.map(v=>toJSValue(v));
					return foo.call(self,...argsArray);//TODO: handle methods with 'this' better
				}],
				[_=>foo instanceof FunctionObj, ()=>{
					if(foo instanceof ClassObj){
						const classObj:ClassObj = foo;
						const clonedArgs:ObjectValue = match(args.constructor,[
							[[ObjectValue],()=>args.clone()],
							[[Array],()=>args.length == 0?new ObjectValue({class:classObj}):[...args]],
							[[Object],()=>Object.assign(Object.create(classObj))],
						],()=>({...args}))
						let newInstance:ArgumentObj = clonedArgs;
						let [parameters_exp,classBodyExp,constructorExp] = classObj.exp.args;
						let parameters_exps:Expression[] = parameters_exp?.args||[];
						assert(parameters_exps instanceof Array);
						const dummyContext:Context = foo.context.new_child({namespace:foo.context.namespace.new_child({variables:newInstance})});
						handleParameters:for(let i=0;i<parameters_exps.length;i++) {
							let parameter_exp = parameters_exps[i];
							let arg:Value = try_getPropertyValue(args,i,todo.silent("try remove the need for an errorWordSymbol"));
							const errorWordSymbol = {throwError(){assert.impossibleCase("should have correct syntax so should not need an errorWordSymbol")}}
							//assume: parameters only included named properties and no array-like items
							evalCode.declareVariables(parameter_exp,arg,dummyContext,errorWordSymbol);
						}
						if(classBodyExp){
							todo.silent("handle class body better");
							let innerContext = classObj.context.new_child_namespace({
								functionInstance:newInstance,
							});
							let classSymbol = classObj[ObjectAsSymbol] ??= Symbol("[Class]");
							let prototype = evalCode.statement(classBodyExp,innerContext);
							if(newInstance instanceof ObjectValue){
								newInstance.prototypes??=new ObjectValue();
								newInstance.prototypes.properties[classSymbol] = prototype;
							}
							else{
								todo.silent("support adding prototypes to *some* javascript object types");
								unimplemented.silent("don't add prototypes to javascript objects");
							}
						}
						if(!constructorExp)return newInstance;
						const constructor = new FunctionObj({exp:constructorExp,context:classObj.context});todo.silent("store the function staticly along with the class")
						return functionCall(constructor,[newInstance,foo]);
					}
					else{
						assert(foo.constructor == FunctionObj,foo.constructor);
						let lengthOfParameterExps:Int;
						let parameters:Value&argument[];{//get parameters
							parameters = new ObjectValue;//:mut
							const parameters_exps:Expression[] = foo.exp.args[0]?.args??[];
							const dummyContext:Context = foo.context.new_child({namespace:foo.context.namespace.new_child({variables:parameters})});
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
			],()=>try_getPropertyRef(foo,getArg0()));
			return value;
		}
		//get properties & keys:
			function try_getDefaultFunction(parent:Value,name:Name,errorWordSymbol?:WordSymbol):Option<PropertyDataInternal>{//`a.=`
				const getPropertyData = (value)=>new PropertyDataInternal({
					parent:
						parent instanceof PropertyRef?parent.variables:
						parent instanceof Array?parent:
						typeof parent == "object"?parent:
						todo("throw an error or change parameter types in this case. Case comes up when getting properties on a number or string"),
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
				if(Object.hasOwn(defaultFunctions_Array,name)){
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
			function try_getPropertyRef(parent:Value,name_value:Value,errorWordSymbol?:WordSymbol):Option<PropertyRef>{//returns dereferenced value
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
				function error_cannotAssignTo_Value_Derefed(parameter_exp,parameter){
					parameter_exp.wordSymbol.throwError("type",`can only assign to variable, property, or value reference. found '${parameter}'.`,e=>Error(e))
				}
				return match(parameter,[
					[v=>v instanceof PropertyRef,()=>parameter.set(assign)],
					[v=>v instanceof ValueRef,()=>parameter.set(assign)],
				],()=>error_cannotAssignTo_Value_Derefed(errorWordSymbol,parameter));
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
					[()=>value instanceof FunctionObj || value instanceof ClassObj,()=>
						({
							[name](){return functionCall(value,[...arguments])},
						}[name])
					],
				],()=>value);
			}
			type Iterator1 = ()=>Option<Array & [key:Value_Returnable,value:Value_Returnable] | Value_Returnable[]>;//userally of 
			const GeneratorFunction = function*(){}.constructor;
			function try_getIterator(value:Value):Option<Iterator>{
				value = derefValueFully(value);//:Value_Derefed
				if(value instanceof ObjectValue){
					try_getPropertyData(value,Symbol.iterator);
						todo.silent("add errorWordSymbol argument");
					if(value.isArrayType){try_getIterator(value.array)}
					else{
						return function* forOwnInObject(){
							let keys = [
								...getAsProperties(value.properties),
								...getAsPropertiesSymbols(value.properties),
							];
							for(let key of keys){
								yield try_getPropertyRef(value,key);
							}
						}();
					}
				}
				else if(value instanceof GeneratorFunction){
					return value();
				}
				else if(typeof value == "function"){
					return function*(){
						let item;
						while(!!(item = value())){
							yield item;
						}
					}();
				}
				else return value[Symbol.iterator]?.()??null;
			}
		//----
		let valueInternal;
		let rootContext;
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
		if(0)console.error(printTree(abstractSyntaxTree));
		console.error(valueInternal);
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
		fileName = terminalArgs[0]??"code/temp.ls";
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