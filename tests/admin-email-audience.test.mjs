import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
const modules=new Map();
function load(name){
 if(name==='workspace-store')return {};
 if(modules.has(name))return modules.get(name);
 const api={};modules.set(name,api);
 const source=ts.transpileModule(fs.readFileSync(new URL(`../lib/${name}.ts`,import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
 vm.runInNewContext(source,{exports:api,require:p=>load(p.replace('./','')),crypto});return api;
}
const api=load('admin-email-audience'),customers=load('admin-customers');
const filters={query:'',status:'all',source:'all',service:'all',relationship:'all'};

test('combined customer filters select a targeted returning VIP audience',()=>{
 const rows=api.filterMarketingAudience(api.SAMPLE_MARKETING_CONTACTS,{...filters,status:'VIP',service:'yachts',relationship:'returning',source:'Website'});
 assert.equal(rows.length,1);assert.equal(rows[0].id,'sample-01');
 assert.equal(api.filterMarketingAudience(rows,{...filters,query:'AVERY@EXAMPLE.COM'}).length,1);
});
test('bulk selection affects all eligible matches and preserves selections outside current filters',()=>{
 const all=api.SAMPLE_MARKETING_CONTACTS;
 const vip=api.filterMarketingAudience(all,{...filters,status:'VIP'});
 const original=new Set(['sample-02']);
 const selected=api.toggleMarketingGroup(original,vip,true);
 assert.equal(original.size,1);assert.equal(selected.size,3);assert.equal(selected.has('sample-02'),true);
 const deselected=api.toggleMarketingGroup(selected,vip,false);
 assert.equal(deselected.size,1);assert.equal(deselected.has('sample-02'),true);
 const selectedAll=api.toggleMarketingGroup(new Set(),all,true);
 assert.equal(selectedAll.size,5);assert.equal(selectedAll.has('sample-05'),false);assert.equal(selectedAll.has('sample-06'),false);
});
test('selected recipients are deduplicated by normalized email and exclude unselectable contacts',()=>{
 const one=api.SAMPLE_MARKETING_CONTACTS[0],duplicate={...one,id:'duplicate',email:' AVERY@EXAMPLE.COM '};
 const contacts=[one,duplicate,...api.SAMPLE_MARKETING_CONTACTS.slice(1)];
 const result=api.selectedMarketingRecipients(contacts,new Set(contacts.map(c=>c.id)));
 assert.equal(result.length,5);
 assert.equal(result.filter(c=>c.email.trim().toLowerCase()==='avery@example.com').length,1);
});
test('existing audience excludes test/demo-only guests and deleted customers without altering records',()=>{
 const saved={...customers.blankCustomer(),id:'saved',name:'Existing guest',email:'guest@example.com',status:'VIP'};
 const booking=(id,email,extra={})=>({id,name:'Guest',email,phone:'',status:'Confirmed',source:'Website',items:[{service:'yachts',product:'Example',start:'2026-11-01T10:00',end:'2026-11-01T14:00'}],...extra});
 const bookings=[booking('live','guest@example.com'),booking('test','test@example.com',{testMode:true}),booking('BL-DEMO-001','demo@example.com'),booking('deleted','deleted@example.com')];
 const trash=[{kind:'customer',recordId:'guest-deleted%40example.com'}];
 const result=api.marketingAudience([saved],bookings,trash);
 assert.equal(result.length,1);assert.equal(result[0].id,'saved');assert.equal(result[0].bookingCount,1);assert.equal(result[0].status,'VIP');assert.equal(result[0].services[0],'yachts');
 assert.equal(saved.bookingIds.length,0);assert.equal(bookings.length,4);
});

test('each service selects only that filtered group and the selection cap also applies to individual additions',()=>{
 const all=api.SAMPLE_MARKETING_CONTACTS;
 const yachts=api.filterMarketingAudience(all,{...filters,service:'yachts'});
 const cars=api.filterMarketingAudience(all,{...filters,service:'exotic-cars'});
 const yachtSelection=api.toggleMarketingGroup(new Set(),yachts,true);
 const carSelection=api.toggleMarketingGroup(new Set(),cars,true);
 assert.equal(yachtSelection.size,3);assert.equal(carSelection.size,1);assert.equal(carSelection.has('sample-02'),true);assert.equal(carSelection.has('sample-01'),false);
 const many=Array.from({length:510},(_,i)=>({...all[0],id:`person-${i}`,email:`person-${i}@example.com`}));
 const capped=api.toggleMarketingGroup(new Set(),many,true);
 assert.equal(capped.size,500);assert.equal(api.toggleMarketingGroup(capped,[many[509]],true).size,500);
 const smaller=api.toggleMarketingGroup(capped,[many[0]],false);
 assert.equal(api.toggleMarketingGroup(smaller,[many[509]],true).has('person-509'),true);
});

test('booked service filters use agreed history from any year and ignore pending or cancelled requests',()=>{
 const customer={...customers.blankCustomer(),id:'history',name:'Guest',email:'history@example.com'};
 const booking=(id,status,service,extra={})=>({id,name:'Guest',email:'history@example.com',phone:'',source:'Website',status,items:[{service,start:'2020-01-01T10:00',end:'2020-01-01T14:00',...extra}]});
 const rows=api.marketingAudience([customer],[booking('old','Completed','yachts'),booking('confirmed','Confirmed','exotic-cars'),booking('pending','Pending','villas'),booking('cancelled','Cancelled','private-jets'),booking('price-follows','Confirmed','private-chefs',{priceFollows:true})],[]);
 assert.equal(api.filterMarketingAudience(rows,{...filters,service:'yachts'}).length,1);
 assert.equal(api.filterMarketingAudience(rows,{...filters,service:'exotic-cars'}).length,1);
 for(const service of ['villas','private-jets','private-chefs'])assert.equal(api.filterMarketingAudience(rows,{...filters,service}).length,0);
});
