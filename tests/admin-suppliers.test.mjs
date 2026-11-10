import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

const source=ts.transpileModule(fs.readFileSync(new URL('../lib/admin-suppliers.ts',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
const api={};vm.runInNewContext(source,{exports:api,crypto});
const products=[{id:'yacht-1',name:'Example yacht',service:'yachts'}];
const rate=(extra={})=>({...api.blankSupplierRate(),productId:'yacht-1',productName:'Old name',service:'yachts',cost:'1250',...extra});
const supplier=(extra={})=>({...api.blankSupplier(),company:'Rental company',rates:[rate()],...extra});

test('supplier details may be saved before product pricing is agreed',()=>{
 assert.equal(api.validateSupplier(supplier({rates:[]}),products),null);
 assert.ok(api.validateSupplier(supplier({company:'  '}),products));
});
test('unknown costs cannot silently become zero and invalid costs are rejected',()=>{
 for(const cost of ['', ' ', '-1', 'NaN', 'Infinity', '12.345', '1e4', '1000000000'])assert.ok(api.validateSupplier(supplier({rates:[rate({cost})]}),products),cost);
 for(const cost of ['0','0.00','1299.99'])assert.equal(api.validateSupplier(supplier({rates:[rate({cost})]}),products),null);
});
test('one product may have different duration rates but duplicate bases are rejected',()=>{
 assert.equal(api.validateSupplier(supplier({rates:[rate({unit:'per hour'}),rate({unit:'per day'})]}),products),null);
 assert.ok(api.validateSupplier(supplier({rates:[rate(),rate()]}),products));
 assert.ok(api.validateSupplier(supplier({rates:[rate({productId:''})]}),products));
 assert.ok(api.validateSupplier(supplier({rates:[rate({tax:'unknown'})]}),products));
});
test('normalizing saves current catalog references without mutating the draft or losing removed products',()=>{
 const draft=supplier({company:' Rental company ',rates:[rate({notes:' Delivery included '})]});
 const saved=api.normalizeSupplier(draft,products);
 assert.equal(saved.company,'Rental company');assert.equal(saved.rates[0].productName,'Example yacht');assert.equal(saved.rates[0].cost,'1250.00');assert.equal(saved.rates[0].notes,'Delivery included');
 assert.equal(draft.rates[0].productName,'Old name');assert.equal(draft.rates[0].cost,'1250');
 assert.equal(api.normalizeSupplier(draft,[]).rates[0].productName,'Old name');
 assert.equal(api.validateSupplier(draft,[]),null);
});
test('directory combines product search, status and service filters',()=>{
 const active=supplier({company:'Alpha',rates:[rate({productName:'Sunseeker'})]});
 const inactive=supplier({company:'Beta',status:'Inactive',rates:[]});
 assert.equal(api.filterSuppliers([inactive,active],' sunSEEKER ','Active','yachts')[0].id,active.id);
 assert.equal(api.filterSuppliers([inactive,active],'','Inactive','yachts').length,0);
 assert.equal(api.filterSuppliers([inactive,active],'','Inactive','all')[0].id,inactive.id);
});
