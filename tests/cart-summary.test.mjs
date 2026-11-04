import test from 'node:test';
import assert from 'node:assert/strict';
import {cartNeedsQuote,internationalCartPhone} from '../lib/cart-summary.ts';
const addons={femaleHosts:false,femaleHostsCount:1,photoshoot:false,securityArmed:false,securityUnarmed:false};
const online={category:'yacht',bookingSelection:{category:'yacht'},bookingQuote:{payableOnline:true,totalUsd:1000}};
test('online payment is offered only for fully configured online services',()=>{
 assert.equal(cartNeedsQuote([online],addons),false);
 assert.equal(cartNeedsQuote([{...online,bookingSelection:undefined}],addons),true);
 assert.equal(cartNeedsQuote([{...online,bookingQuote:{payableOnline:false}}],addons),true);
 assert.equal(cartNeedsQuote([online,{category:'atv'}],addons),true);
});
test('unpriced extras route the complete selection to concierge rather than silently charging zero',()=>{
 assert.equal(cartNeedsQuote([online],{...addons,photoshoot:true}),true);
 assert.equal(cartNeedsQuote([online],{...addons,femaleHosts:true}),true);
 assert.equal(cartNeedsQuote([online],{...addons,securityArmed:true}),false);
});
test('phone entry handles a country selector, pasted international numbers and national prefixes',()=>{
 assert.equal(internationalCartPhone('+31','06 1234 5678'),'+31612345678');
 assert.equal(internationalCartPhone('+1','+31 (6) 1234-5678'),'+31612345678');
 assert.equal(internationalCartPhone('+1','0031 6 12345678'),'+31612345678');
 assert.equal(internationalCartPhone('+1','202 555 0101'),'+12025550101');
 assert.equal(internationalCartPhone('+39','06 12345678'),'+390612345678');
 assert.equal(internationalCartPhone('+1',''),'');assert.equal(internationalCartPhone('+1','call me'),'');
});
