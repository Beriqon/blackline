import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import nextEnv from '@next/env';
nextEnv.loadEnvConfig(process.cwd(),process.env.NODE_ENV!=='production',{info(){},error(){}});
const api={};vm.runInNewContext(ts.transpileModule(fs.readFileSync(new URL('../lib/stripe-mode.ts',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,{exports:api,process,URL,RegExp});
const mode=api.stripeMode();
const checks=[
 ['Environment is explicitly test or live',process.env.STRIPE_MODE===undefined||['test','live'].includes(process.env.STRIPE_MODE)],
 ['Secret key matches the selected environment',new RegExp(`^(sk|rk)_${mode}_`).test(process.env.STRIPE_SECRET_KEY?.trim()??'')],
 ['Publishable key matches the selected environment',api.stripePublishableKeyValid()],
 ['Webhook signing secret is configured',process.env.STRIPE_WEBHOOK_SECRET?.trim().startsWith('whsec_')],
 ['Booking database credential is configured',!!process.env.BLACKLINE_BOOKING_TOKEN?.trim()],
 ['Live activation gate passes (or test mode is selected)',api.liveStripeEnabled()],
];
if(process.argv.includes('--require-live'))checks.push(['Live mode is selected',mode==='live']);
console.log(`Stripe configuration: ${mode.toUpperCase()}`);
for(const [label,ok] of checks)console.log(`${ok?'PASS':'FAIL'}  ${label}`);
console.log('This checks configuration only. It does not make a payment or verify account activation, webhook delivery, or deployment.');
if(checks.some(([,ok])=>!ok))process.exitCode=1;
