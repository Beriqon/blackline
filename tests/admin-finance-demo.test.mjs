import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
const source=ts.transpileModule(fs.readFileSync(new URL('../lib/admin-finance-demo.ts',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
const api={};vm.runInNewContext(source,{exports:api});
const sum=(rows,key)=>Math.round(rows.reduce((total,row)=>total+row[key],0)*100)/100;

test('every period reconciles headline figures with chart, costs and paid product revenue',()=>{
 const {payments,expenses}=api.createFinanceDemo();
 for(const {days} of api.FINANCE_PERIODS){
  const s=api.financeSummary(payments,expenses,days,25);
  assert.equal(sum(s.paid,'amount'),s.revenue);
  assert.equal(sum(s.trend,'revenue'),s.revenue);
  assert.equal(sum(s.trend,'cost'),s.totalCosts);
  assert.equal(sum(s.products,'revenue'),s.revenue);
  assert.equal(sum(s.categories,'amount'),s.totalCosts);
  assert.equal(Math.round((s.revenue-s.totalCosts)*100)/100,s.profit);
  assert.equal(Math.round((s.profit-s.tax)*100)/100,s.net);
  assert.equal(s.hours.reduce((n,h)=>n+h.count,0),s.bookingActivity.length);
  assert.equal(s.weekdays.reduce((n,h)=>n+h.count,0),s.bookingActivity.length);
 }
});
test('pending bookings never become revenue and payments use paid dates',()=>{
 const base={id:'demo',guest:'Demo guest',product:'Yacht',service:'Yachts',amount:1000,bookedAt:'2026-01-01T12:00:00Z',hour:18,supplierCost:500};
 const rows=[{...base,status:'Paid',paidAt:'2026-11-09T12:00:00Z'},{...base,id:'pending',status:'Pending',paidAt:null,amount:9000,bookedAt:'2026-11-09T12:00:00Z'}];
 const s=api.financeSummary(rows,[],30,25);
 assert.equal(s.revenue,1000);assert.equal(s.paid.length,1);assert.equal(s.pending.length,1);assert.equal(s.net,750);
});
test('temporary manual expense reduces profit and loss periods have no illustrative profit tax',()=>{
 const {payments,expenses}=api.createFinanceDemo();
 const before=api.financeSummary(payments,expenses,30,25);
 const expense={id:'preview',description:'Temporary expense',category:'Operations',amount:100,date:'2026-11-10',manual:true};
 const after=api.financeSummary(payments,[expense,...expenses],30,25);
 assert.equal(after.revenue,before.revenue);assert.equal(after.totalCosts,before.totalCosts+100);assert.equal(after.profit,before.profit-100);assert.equal(after.net,before.net-75);
 const loss=api.financeSummary([], [expense],30,25);
 assert.equal(loss.profit,-100);assert.equal(loss.tax,0);assert.equal(loss.net,-100);
 assert.equal(api.financeSummary([], [{...expense,date:'2026-01-01'}],30,25).totalCosts,0);
});
