import {test} from 'node:test';
import assert from 'node:assert/strict';
import {applyCatalog,applyProduct,catalogId} from '../lib/catalog-live.ts';
import {createRequire} from 'node:module';
import fs from 'node:fs';
const product={id:'catalog:yachts:test-yacht',name:'Updated yacht',service:'yachts',status:'visible',price:2500,unit:'per 4 hours',featured:true,description:'Updated description',images:'/new-cover.webp\n/new-interior.webp',specs:'Length: 65 ft',included:'Crew\nWater',requirements:'No smoking',location:'Miami',capacity:'12',rates:'4 hours: $2,000\n6 hours: $3,000'};
test('published yacht projection uses edited price, description, photo order and capacity',()=>{
 const result=applyProduct('yachts',{id:'test-yacht',name:'Old name',galleryPaths:['/old.jpg']},product);
 assert.equal(result.name,'Updated yacht');assert.equal(result.description,product.description);assert.equal(result.priceTiers[0].amount,'$2,500');assert.equal(result.priceTiers[1].amount,'$3,000');assert.equal(result.capacityGuests,12);assert.deepEqual(result.galleryPaths,['/new-cover.webp','/new-interior.webp']);
});
test('removing photos does not restore static gallery images',()=>{const result=applyProduct('yachts',{id:'test-yacht',galleryPaths:['/old.jpg']},{...product,images:''});assert.deepEqual(result.galleryPaths,[]);assert.equal(result.cardCoverSrc,undefined);});
test('hidden and archived entries are excluded, new products appear without static source entries',()=>{const result=applyCatalog('yachts',[],[product,{...product,id:'hidden',status:'hidden'},{...product,id:'archived',status:'archived'}]);assert.equal(result.length,1);assert.equal(result[0].id,'test-yacht');assert.equal(catalogId({...product,id:'product-new'}),'product-new');});
test('quote-only rates disable online yacht pricing',()=>{const result=applyProduct('yachts',undefined,{...product,unit:'on request'});assert.equal(result.ratesPending,true);});
test('villas preserve additional weekend rate while primary nightly rate changes',()=>{const result=applyProduct('villas',undefined,{...product,service:'villas',unit:'per night',price:800,rates:'Weekday: $700 / night\nWeekend: $950 / night'});assert.equal(result.nightlyRates.weekdayUsd,800);assert.equal(result.nightlyRates.weekendUsd,950);});
test('the product gallery resolver honours database photo changes and empty galleries',()=>{
 const require=createRequire(import.meta.url),ts=require('typescript'),original=require.extensions['.ts'];
 require.extensions['.ts']=(module,filename)=>module._compile(ts.transpileModule(fs.readFileSync(filename,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,filename);
 try{const {resolveYachtGalleryPaths}=require('../lib/yacht-fleet-gallery.ts');assert.deepEqual(resolveYachtGalleryPaths({id:'166-trinity',galleryPaths:['/replacement.jpg']}),['/replacement.jpg']);assert.deepEqual(resolveYachtGalleryPaths({id:'166-trinity',galleryPaths:[]}),[]);}finally{if(original)require.extensions['.ts']=original;else delete require.extensions['.ts'];}
});
