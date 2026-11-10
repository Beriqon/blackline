import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
const source=ts.transpileModule(fs.readFileSync(new URL('../lib/admin-calendar-demo.ts',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
const api={};vm.runInNewContext(source,{exports:api});

test('month navigation preserves the selected day where possible and clamps short months',()=>{
 assert.equal(api.moveCalendarMonth('2026-01-31',1),'2026-02-28');
 assert.equal(api.moveCalendarMonth('2028-01-31',1),'2028-02-29');
 assert.equal(api.moveCalendarMonth('2026-12-10',1),'2027-01-10');
 assert.equal(api.moveCalendarMonth('2026-01-10',-1),'2025-12-10');
});
test('calendar weeks start on Monday and a month shows 42 consecutive days',()=>{
 const week=api.calendarWeek('2026-11-01');
 assert.equal(week[0],'2026-10-26');assert.equal(week[6],'2026-11-01');
 const month=api.calendarMonth('2026-11-10');
 assert.equal(month.length,42);assert.equal(month[0],'2026-10-26');assert.equal(month[41],'2026-12-06');
 assert.equal(new Set(month).size,42);
});
test('multi-day bookings occupy each intersecting date but not the exclusive midnight end',()=>{
 const events=[{id:'rental',start:'2026-11-10T15:00',end:'2026-11-13T00:00'},{id:'later',start:'2026-11-13T09:00',end:'2026-11-13T13:00'}];
 for(const date of ['2026-11-10','2026-11-11','2026-11-12'])assert.equal(api.eventsOnCalendarDay(events,date)[0].id,'rental');
 assert.equal(api.eventsOnCalendarDay(events,'2026-11-09').length,0);
 assert.equal(api.eventsOnCalendarDay(events,'2026-11-13').length,1);
 assert.equal(api.eventsOnCalendarDay(events,'2026-11-13')[0].id,'later');
 assert.equal(api.eventsInCalendarRange(events,'2026-11-13','2026-11-14').length,1);
});
test('demo events reference demo products, have unique IDs and valid intervals',()=>{
 const events=api.createCalendarDemo();
 assert.equal(new Set(events.map(e=>e.id)).size,events.length);
 for(const event of events){assert.ok(api.CALENDAR_PRODUCTS.some(p=>p.id===event.productId));assert.ok(event.end>event.start);assert.match(event.id,/^DEMO-/);}
 for(const kind of ['Confirmed','Pending','Blocked'])assert.ok(events.some(e=>e.kind===kind));
 assert.ok(api.eventsOnCalendarDay(events,api.CALENDAR_DEMO_TODAY).length>0);
});
