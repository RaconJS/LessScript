Javascript-like programming language for writing code shortly and quickly
requires: Deno, the javascript runtime
run with `Deno main.ts -f filename.ls` or `Deno main.ts "log,'hello world'"` for executing code from terminal


e.g. sum all elements
Javascript:

`let sum=a=>a.reduce((s,v)=>s+v);`

LessScript:

`sum:\#.>\#+#;`

side by side translation comparison

```js
let sum = array => array . reduce ((sum,value) => sum + value);
    sum :   \  # . >             \                #   + #;
```
