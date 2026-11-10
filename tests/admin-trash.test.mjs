import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
const api={};
vm.runInNewContext(ts.transpileModule(fs.readFileSync(new URL('../lib/admin-trash.ts',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,{exports:api,require:()=>({normalizeEmail:v=>v.trim().toLowerCase(),normalizePhone:v=>v.replace(/\D/g,'').replace(/^00/,'')})});
const customer={id:'guest-one',email:'one@example.com',phone:'+12025550100',bookingIds:['order-one'],emails:['one@example.com','alias@example.com']};
const entry={id:'customer:guest-one',kind:'customer',recordId:'guest-one',customer};
test('deleted automatic customers remain hidden after regrouping by contact aliases',()=>{
 assert.equal(api.customerIsDeleted({...customer,id:'different-id',email:'ALIAS@example.com',phone:'',bookingIds:[]},[entry]),true);
 assert.equal(api.customerIsDeleted({...customer,id:'other',email:'',emails:[],phone:'001 202 555 0100',bookingIds:[]},[entry]),true);
 assert.equal(api.customerIsDeleted({...customer,id:'unrelated',email:'other@example.com',emails:[],phone:'',bookingIds:[]},[entry]),false);
});
test('booking deletion never deletes a customer; restoration exposes their original data',()=>{
 assert.equal(api.customerIsDeleted(customer,[{...entry,kind:'booking'}]),false);
 assert.equal(api.customerIsDeleted(customer,[]),false);
 assert.equal(customer.bookingIds[0],'order-one');
 assert.equal(api.customerIsDeleted({...customer,id:'regrouped',email:'',emails:[],phone:''},[entry]),true);
});
test('permanently removed customers remain suppressed after a refresh',()=>{
 const permanent={...entry,permanentlyDeletedAt:'2026-11-10T12:00:00Z'};
 assert.equal(api.customerIsDeleted(customer,[permanent]),true);
 assert.equal(api.customerIsDeleted({...customer,id:'regenerated-profile'},[permanent]),true);
 assert.equal([permanent].filter(e=>!e.permanentlyDeletedAt).length,0);
});
