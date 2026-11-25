import assert from "node:assert/strict";
import fs from "node:fs";
import {createRequire} from "node:module";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";

const require = createRequire(import.meta.url);
function loadDelivery(fetch) {
 const modules = new Map();
 function load(name) {
  if (name === "server-only") return {};
  if (name.startsWith("node:")) return require(name);
  if (modules.has(name)) return modules.get(name);
  const api = {};
  modules.set(name, api);
  const source = fs.readFileSync(new URL(`../lib/${name}.ts`, import.meta.url), "utf8");
  const {outputText} = ts.transpileModule(source, {compilerOptions: {module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022}});
  vm.runInNewContext(outputText, {exports: api, require: path => load(path.replace("./", "")), fetch, Buffer, crypto, AbortSignal, console, setTimeout: callback => callback()});
  return api;
 }
 return {...load("admin-email-delivery"), ...load("admin-email-drafts")};
}

test("campaign confirmation includes only selected opt-ins and uses a single broadcast for retries", async () => {
 const active = {id: "active", email: "active@example.com", unsubscribed: false};
 const optedOut = {id: "out", email: "out@example.com", unsubscribed: true};
 let source = [active, optedOut];
 let status = "draft";
 let sends = 0;
 const added = [];
 const {emailDelivery, makeDraft} = loadDelivery(async (url, options) => {
  const {pathname} = new URL(url);
  const response = value => Response.json(value);
  const list = data => response({data, has_more: false});
  if (pathname === "/segments" && options.method === "GET") return list([{id: "opt-in", name: "Blackline Marketing Opt-In"}]);
  if (pathname === "/segments/opt-in/contacts") return list(source);
  if (pathname === "/segments") return response({id: "destination"});
  if (pathname === "/contacts/active/segments/destination") {
   added.push(active);
   return response({id: active.id});
  }
  if (pathname === "/segments/destination/contacts") return list(added);
  if (pathname === "/broadcasts") {
   const payload = JSON.parse(options.body);
   assert.equal(payload.segment_id, "destination");
   assert.ok(payload.html.includes("{{{RESEND_UNSUBSCRIBE_URL}}}"));
   assert.ok(payload.html.includes("123 Test Street"));
   assert.ok(payload.html.includes("https://www.blacklineconcierge.group/home/affiliate-yacht-lifestyle.png"));
   assert.ok(!payload.send);
   return response({id: "broadcast"});
  }
  if (pathname === "/broadcasts/broadcast") return response({id: "broadcast", status, segment_id: "destination"});
  if (pathname === "/broadcasts/broadcast/send") {
   sends++;
   status = "sending";
   throw new Error("Connection lost after Resend accepted the send");
  }
  assert.fail(`Unexpected request ${pathname}`);
 });
 const delivery = emailDelivery("mock-secret");
 const review = await delivery.prepare(makeDraft("campaign"), ["ACTIVE@example.com", "out@example.com", "other@example.com"], "123 Test Street");
 assert.equal(review.count, 1);
 assert.equal(review.excluded, 2);
 await assert.rejects(delivery.send(review.token.slice(0, -2) + "ZZ"), /confirmation is invalid/);
 source = [optedOut];
 await assert.rejects(delivery.send(review.token), /recipient list changed/);
 assert.equal(sends, 0);
 source = [active, optedOut];
 await assert.rejects(delivery.send(review.token), /Connection lost/);
 assert.equal((await delivery.send(review.token)).id, "broadcast");
 assert.equal(sends, 1);
});

test("test email uses the fixed Blackline inbox and never creates a broadcast", async () => {
 const {emailDelivery, makeDraft} = loadDelivery(async (url, options) => {
  assert.equal(new URL(url).pathname, "/emails");
  const payload = JSON.parse(options.body);
  assert.deepEqual(payload.to, ["blackline235@gmail.com"]);
  assert.match(payload.subject, /^\[TEST\] /);
  assert.equal(options.headers.Authorization, "Bearer mock-secret");
  assert.match(options.headers["Idempotency-Key"], /^blackline-campaign-test\//);
  return Response.json({id: "email"});
 });
 assert.equal((await emailDelivery("mock-secret").test(makeDraft("campaign"), crypto.randomUUID())).id, "email");
});

test("customer consent creates the opt-in segment and syncs once without resetting an unsubscribe", async () => {
 let contact;
 let segment;
 let joined = false;
 let writes = 0;
 const {emailDelivery} = loadDelivery(async (url, options) => {
  const {pathname} = new URL(url);
  if (options.method === "POST") writes++;
  if (pathname === "/contacts/guest%40example.com") {
   return contact ? Response.json(contact) : Response.json({}, {status:404});
  }
  if (pathname === "/contacts" && options.method === "POST") {
   assert.deepEqual(JSON.parse(options.body), {email:"guest@example.com"});
   contact = {id:"guest", email:"guest@example.com", unsubscribed:false};
   return Response.json({id:contact.id});
  }
  if (pathname === "/segments" && options.method === "GET") return Response.json({data:segment?[segment]:[],has_more:false});
  if (pathname === "/segments" && options.method === "POST") {
   assert.deepEqual(JSON.parse(options.body), {name:"Blackline Marketing Opt-In"});
   segment = {id:"opt-in",name:"Blackline Marketing Opt-In"};
   return Response.json(segment);
  }
  if (pathname === "/contacts/guest/segments") return Response.json({data:joined?[segment]:[],has_more:false});
  if (pathname === "/contacts/guest/segments/opt-in") {
   joined = true;
   return Response.json({id:contact.id});
  }
  assert.fail(`Unexpected request ${pathname}`);
 });
 const delivery = emailDelivery("mock-secret");
 assert.equal((await delivery.subscription("guest@example.com")).status,"unknown");
 await assert.rejects(delivery.synchronizeOptIn("guest@example.com",false),/Confirm/);
 assert.equal(writes,0);
 assert.equal((await delivery.synchronizeOptIn("GUEST@example.com",true)).status,"subscribed");
 assert.equal(writes,3);
 assert.equal((await delivery.subscription("guest@example.com")).status,"subscribed");
 await delivery.synchronizeOptIn("guest@example.com",true);
 assert.equal(writes,3);
 contact.unsubscribed = true;
 assert.equal((await delivery.subscription("guest@example.com")).status,"unsubscribed");
 await assert.rejects(delivery.synchronizeOptIn("guest@example.com",true),/unsubscribed/);
 assert.equal(writes,3);
 const bulk = await delivery.syncExisting(["guest@example.com","GUEST@example.com"],true);
 assert.equal(bulk.unsubscribed,1);
 assert.equal(bulk.subscribed,0);
 assert.equal(writes,3);
});

test("checkout opt-in requires an explicit same-origin choice and retries without blocking the checkout response", async () => {
 const exports = {};
 const tasks = [];
 const attempts = [];
 const source = fs.readFileSync(new URL("../lib/checkout-marketing.ts", import.meta.url), "utf8");
 const {outputText} = ts.transpileModule(source, {compilerOptions: {module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022}});
 vm.runInNewContext(outputText, {exports, URL, process:{env:{RESEND_API_KEY:"mock-secret"}}, require:name => {
  if (name === "next/server") return {after: fn => tasks.push(fn)};
  if (name === "./admin-email-delivery") return {CampaignError:Error,emailDelivery:()=>({
   synchronizeOptIn:async (email, confirmed) => {
    attempts.push({email,confirmed});
    if (attempts.length===1) throw new Error("temporary provider error");
   },
  })};
  return {};
 }});
 const request = new Request("https://www.blacklineconcierge.group/api/stripe/checkout", {headers:{origin:"https://www.blacklineconcierge.group"}});
 assert.equal(exports.checkoutMarketingConsent(request,false,"guest@example.com"),undefined);
 assert.equal(exports.checkoutMarketingConsent(request,"true","guest@example.com"),undefined);
 assert.equal(exports.checkoutMarketingConsent(new Request(request.url),true,"guest@example.com"),undefined);
 const consent = exports.checkoutMarketingConsent(request,true," GUEST@example.com ");
 assert.equal(consent.email,"guest@example.com");
 assert.equal(consent.source,"checkout");
 assert.ok(Number.isFinite(Date.parse(consent.recordedAt)));
 exports.syncCheckoutMarketing(consent);
 assert.equal(attempts.length,0);
 await tasks[0]();
 assert.equal(attempts.length,2);
 assert.equal(attempts[1].confirmed,true);
});
