import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {allowedPushEndpoint,pushResult} from '../supabase/functions/booking-push/policy.js';

test('push sender allows only known HTTPS push services, with no redirects to private hosts',()=>{
 for(const endpoint of ['https://fcm.googleapis.com/fcm/send/a','https://updates.push.services.mozilla.com/wpush/v2/a','https://web.push.apple.com/a','https://wns2-abc.notify.windows.com/a'])assert.equal(allowedPushEndpoint(endpoint),true);
 for(const endpoint of ['http://fcm.googleapis.com/a','https://localhost/a','https://127.0.0.1/a','https://fcm.googleapis.com.evil.test/a','https://fcmXgoogleapisXcom/a','https://user:password@fcm.googleapis.com/a','https://fcm.googleapis.com:444/a','https://fcm.googleapis.com/a#b','not a URL'])assert.equal(allowedPushEndpoint(endpoint),false);
});
test('expired endpoints stop retrying while temporary failures remain retryable',()=>{
 for(const status of [200,201,204,404,410])assert.deepEqual(pushResult(status),{done:true});
 for(const status of [0,401,403,429,500,503])assert.deepEqual(pushResult(status),{done:false});
});

function serviceWorker(){
 const handlers={},notifications=[],opened=[];
 const self={location:{origin:'https://www.blacklineconcierge.group'},addEventListener:(type,handler)=>{handlers[type]=handler;},registration:{showNotification:async(title,options)=>{notifications.push({title,...options});}},clients:{matchAll:async()=>[],openWindow:async url=>opened.push(url)}};
 vm.runInNewContext(fs.readFileSync(new URL('../public/admin/push-sw.js',import.meta.url),'utf8'),{self,URL});
 return {handlers,notifications,opened};
}
test('service worker shows background alerts without caching dashboard data',async()=>{
 const {handlers,notifications}=serviceWorker();let finished;
 handlers.push({data:{json:()=>({title:'New booking',body:'Open dashboard',tag:'booking:42',url:'https://evil.test/'})},waitUntil:p=>{finished=p;}});await finished;
 assert.equal(notifications[0].title,'New booking');assert.equal(notifications[0].tag,'booking:42');assert.equal(notifications[0].data.url,'/admin/dashboard?view=bookings');assert.equal(handlers.fetch,undefined);
});
test('clicking an alert opens the secure dashboard and rejects external destinations',async()=>{
 const {handlers,opened}=serviceWorker();let finished;let closed=false;
 handlers.notificationclick({notification:{data:{url:'/admin/dashboard?view=bookings'},close:()=>{closed=true;}},waitUntil:p=>{finished=p;}});await finished;
 assert.equal(closed,true);assert.equal(opened[0],'https://www.blacklineconcierge.group/admin/dashboard?view=bookings');
 handlers.notificationclick({notification:{data:{url:'https://evil.test/'},close(){}},waitUntil(){throw Error('must not open');}});
});

test('deployed worker authenticates dispatch, filters endpoints and records retries (mock network)',async()=>{
 let handle;const finishes=[];let requests=0;
 const jobs=[{id:'ok',lease:'l',payload:{title:'New booking'},subscription:{endpoint:'https://fcm.googleapis.com/a'}},{id:'retry',lease:'l',payload:{},subscription:{endpoint:'https://web.push.apple.com/a'}},{id:'gone',lease:'l',payload:{},subscription:{endpoint:'https://updates.push.services.mozilla.com/a'}},{id:'unsafe',lease:'l',payload:{},subscription:{endpoint:'https://localhost/a'}}];
 const config={dispatchSecret:'a'.repeat(64),publicKey:'public',privateKey:'private'};
 const db={rpc:async(_name,{action,input})=>({data:action==='config'?config:action==='claim'?jobs:(finishes.push(input),{}),error:null})};
 const source=fs.readFileSync(new URL('../supabase/functions/booking-push/index.js',import.meta.url),'utf8').replace(/^import .*;\r?\n/gm,'');
 vm.runInNewContext(source,{Deno:{env:{get:()=>''},serve:handler=>{handle=handler;}},createClient:()=>db,webpush:{generateRequestDetails:(subscription)=>({endpoint:subscription.endpoint,headers:{},body:'encrypted-mock'})},timingSafeEqual:(a,b)=>Buffer.from(a).equals(Buffer.from(b)),allowedPushEndpoint,pushResult,TextEncoder,Response,AbortSignal,console,fetch:async url=>{requests++;return new Response(null,{status:url.includes('apple')?503:url.includes('mozilla')?410:201});}});
 assert.equal((await handle(new Request('https://worker.test/'))).status,200);
 assert.equal((await handle(new Request('https://worker.test/',{method:'POST'}))).status,401);assert.equal(requests,0);
 const response=await handle(new Request('https://worker.test/',{method:'POST',headers:{authorization:'Bearer '+config.dispatchSecret}}));
 assert.equal(response.status,200);assert.equal(requests,3);
 assert.equal(finishes.find(x=>x.id==='ok').done,true);assert.equal(finishes.find(x=>x.id==='retry').done,false);assert.equal(finishes.find(x=>x.id==='gone').status,410);assert.equal(finishes.find(x=>x.id==='unsafe').done,true);
});
