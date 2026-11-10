import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import {normalizeQuoteContact} from '../lib/quote-contact.ts';
test('new quote contacts require name, email and an international phone number',()=>{
 assert.equal(normalizeQuoteContact({name:'',email:'guest@example.com',phone:'+12025550100'}),null);assert.equal(normalizeQuoteContact({name:'Guest',email:'invalid',phone:'+12025550100'}),null);assert.equal(normalizeQuoteContact({name:'Guest',email:'guest@example.com',phone:'0612345678'}),null);
 assert.deepEqual(normalizeQuoteContact({name:' Guest ',email:' GUEST@EXAMPLE.COM ',phone:'0031 (6) 1234-5678'}),{name:'Guest',email:'guest@example.com',phone:'+31612345678'});
});
test('the quote endpoint stores structured contact and items and ignores a client-confirmed status',async()=>{
 let saved;const exports={};const source=ts.transpileModule(fs.readFileSync(new URL('../app/api/quote-requests/create/route.ts',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
 vm.runInNewContext(source,{exports,Request,Response,require:id=>id==='next/server'?{NextResponse:Response}:id==='@/lib/quote-contact'?{normalizeQuoteContact}:{createQuoteRequest:async data=>{saved=data;return {...data,id:'qr-fixture'};}}});
 const invalid=await exports.POST(new Request('http://localhost/api/quote-requests/create',{method:'POST',body:JSON.stringify({message:'A villa please'})}));assert.equal(invalid.status,400);assert.equal(saved,undefined);
 const response=await exports.POST(new Request('http://localhost/api/quote-requests/create',{method:'POST',body:JSON.stringify({message:'A villa please',customerName:'Guest',customerEmail:'GUEST@example.com',customerPhone:'+1 202 555 0100',source:'whatsapp',status:'confirmed',items:[{id:'villa',title:'Villa',category:'villas'}]})}));assert.equal(response.status,200);assert.equal(saved.customerPhone,'+12025550100');assert.equal(saved.customerEmail,'guest@example.com');assert.equal(saved.items[0].title,'Villa');assert.equal(saved.status,'pending');
});
