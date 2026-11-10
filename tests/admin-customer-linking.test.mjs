import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
const source=ts.transpileModule(fs.readFileSync(new URL('../lib/admin-customers.ts',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
const api={};vm.runInNewContext(source,{exports:api,require:()=>({}),crypto});
const booking=(id,extra={})=>({id,name:'Guest Name',email:'guest@example.com',phone:'+1 786 555 0123',source:'Website',...extra});
test('confirmed test-order guests appear with contact details and combined booking history',()=>{
 const result=api.customerDirectory([],[booking('one',{testMode:true}),booking('two',{testMode:true,email:' GUEST@EXAMPLE.COM '})]);
 assert.equal(result.length,1);assert.equal(result[0].name,'Guest Name');assert.equal(result[0].email,'guest@example.com');assert.equal(result[0].phone,'+1 786 555 0123');assert.equal(result[0].bookingIds.length,2);assert.equal(result[0].testMode,true);
});
test('the same guest has one profile across test cards and live Zelle orders',()=>{
 const live={id:'saved',...booking('saved'),bookingIds:[],notes:'Keep these preferences'};
 const result=api.customerDirectory([live],[booking('test-order',{testMode:true})]);
 assert.equal(result.length,1);assert.equal(result[0].bookingIds.length,1);assert.equal(result[0].testMode,undefined);assert.equal(result[0].containsTestBookings,true);assert.equal(live.bookingIds.length,0);
});
test('existing customer details are retained and missing contact details are filled',()=>{
 const saved={id:'saved',name:'Preferred Name',email:'guest@example.com',phone:'',bookingIds:[],notes:'VIP preferences'};
 const result=api.customerDirectory([saved],[booking('online')]);
 assert.equal(result.length,1);assert.equal(result[0].name,'Preferred Name');assert.equal(result[0].phone,'+1 786 555 0123');assert.equal(result[0].notes,'VIP preferences');assert.equal(saved.phone,'');
 assert.equal(api.customerDirectory(result,[booking('online')])[0].bookingIds.length,1);
});
test('matching email OR international phone links a guest without relying on their name',()=>{
 const customer={id:'saved',name:'Guest',email:'',phone:'001 786 555 0123',bookingIds:[]};
 assert.equal(api.matchesBooking(customer,booking('order')),true);
 assert.equal(api.matchesBooking({...customer,email:'different@example.com'},booking('order')),true);
 assert.equal(api.matchesBooking({...customer,email:'different@example.com',phone:'+12025550999'},booking('order')),false);
 assert.equal(api.matchesBooking({...customer,phone:''},booking('order',{email:'',phone:''})),false);
});
test('existing duplicate profiles and contact aliases merge transitively without losing notes',()=>{
 const one={id:'first',name:'Avery',email:'one@example.com',phone:'+12025550100',bookingIds:['old-one'],notes:'Preference one',preferences:'Window seat',status:'Active'};
 const two={id:'second',name:'Avery',email:'two@example.com',phone:'+12025550200',bookingIds:['old-two'],notes:'Preference two',preferences:'Late arrival',status:'VIP'};
 const result=api.customerDirectory([one,two],[booking('bridge',{email:'ONE@example.com',phone:'001 202 555 0200'}),booking('zelle',{email:'two@example.com',phone:'+12025550300'})]);
 assert.equal(result.length,1);assert.equal(result[0].status,'VIP');assert.equal(result[0].bookingIds.length,4);assert.match(result[0].notes,/Preference one/);assert.match(result[0].notes,/Preference two/);assert.equal(result[0].sourceCustomerIds.length,2);assert.equal(api.matchesBooking(result[0],booking('later',{email:'two@example.com',phone:''})),true);
 assert.equal(one.bookingIds.length,1);assert.equal(two.notes,'Preference two');
});
