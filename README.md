# Elis(WIP name) aka LessScript

For short code that is writen once and never read.

Type less, name less, stay DRY


## general langauge design idea

e.g. JavaScript

`function add(firstNumberToSum,secondNumberToSum){return firstNumberToSum + secondNumberToSum}`


In Elis we can use parameters without having to declare them first.

`add : \ #firstNumberToSum + #secondNumberToSum`

If we are only using the parameter once, we do not even need to name it.

`add : \ # + #`





## Function calls

```java
log("Hello world");
```

To reduce charactors `,` can be used instead of `()` for single argument* function calls

```java
log,"Hello world"
```

## Declarations

Elis uses `:` for declarations

```java
two : 2
```

## Block expressions
curly brackets `{...}` can be used for making block scopes

```java
a:"Hello";
{
	a:"World";
}
assert a == "Hello";
```

`{...}`s also return their last value if they do not end in a comma.

This is similar to `(...)` in JavaScript and just like `{...}` from Rust.
note: everything is an expression and returns something.

```java
{a:"Hello";a}//"Hello"
```

`{...}`s can also be used for grouping expressions like curved brackets

```java
{2+3} * 2//10
```

## Arrays

Since `,` is already used for function calls array items are separated by `;` instead.

`;` is used for separating all expressions.

```java
fruit : ["Apple"; "Banana"; "Orange"];
fruit[0]
```

This makes the syntax more consistant with `;` for block and objects as expression separators.

## Objects
Because `{}` is already used for blocks and grouping expressions, Elis uses '()' for objects.

```js
cat:(
	legs:4;
	tail:1;
	head:1;	
);
cat.legs//4
```

## Tuples

`()` can also be used for tuples

```java
tuple:("A";0;[1;2;3]);
assert tuple.1 == 0;
```

Infact they are considered no different than `()` declared objects, and so can combine elements of both.

```java
mixedTupleObject:(
	"A";"B";
	p1:"C";
	p2:"D";
);
assert mixedTupleObject.0 == "A";
assert mixedTupleObject.p1 == "C";
```

## Functions

All functions are declared with `\` like lambdas in Haskel.

```java
foo : \log("Hello World");
foo()//prints Hello World
```

### Functions with DRY named parameters

Can use `#` to declare and use a parameter without naming it at the top of the function.

This keeps the function DRY.

```java
joinStrings : \ #firstString + #secondString;//no parameter repetision
joinStrings("Hello"; "World");
```

Once a parameter is declared with `#` they can be used like a normal variable.

```java
repeatString : \ #string1 + string1;
assert repeatString("Hello!") == "Hello!Hello!";
```

### Functions with DRY unnamed parameters

There are only 2 hard problems in computer science, cashe invalidation and naming things.

Elis is designed to reduce the latter.

If a parameter is only needed once it's name can be ommited.

```java
joinStrings : \ # + #;
joinStrings("Hello "; "World");
```


### Functions with WET parameters

If you still need to declare some parameters at the start of the function you can.

This can be useful if a functions arguments need to be in a specific order

```java
joinStringsReversed : \ stringA # stringB : stringB + stringA;
joinStringsReversed("Hello"; "World");//"WorldHello"
```

## if else

`if condition => then else then`

```java
a : 1;
b :
	if rainLevel == 1 =>
		"put on a coat"
	else 
		"Do not put on a coat"
;
log,b
```

the `=>` is optional

```java
\if #>=0 "positive" else "negative"
```

## not operator

To improve speed not operators are both prefix and postfix.

```java
a! === !a
```

if there is any confusion `!` operator is postfix `a!`


## early return `?`

```java
sumElements:\{
	if #array! 0?;//returns default 0 if no input provided
	array.>\#+#
}
```

## e.g. sum all elements in a list:

Javascript:
```js
let sum=a=>a.reduce((s,v)=>s+v);
```
LessScript:

```
sum:\#.>\#+#;
```

side by side translation comparison

`let sum = array => array . reduce ((sum,value) => sum + value);`

`    sum :       \  #     . >                   \  #   + #     ;`