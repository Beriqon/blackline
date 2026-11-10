import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
export function loadStripeMode(env={}){const exports={};vm.runInNewContext(ts.transpileModule(fs.readFileSync(new URL('../lib/stripe-mode.ts',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,{exports,process:{env},URL,RegExp});return exports;}
