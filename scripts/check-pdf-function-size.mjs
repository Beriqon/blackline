import fs from 'node:fs';
import path from 'node:path';

// Run after a production build. Allow headroom for Vercel's function wrapper.
const limit=200*1024*1024;
let failed=false;
for(const route of ['balance','orders','zelle']){
 const trace=path.resolve(`.next/server/app/api/${route}/confirmation/route.js.nft.json`);
 if(!fs.existsSync(trace)){console.error(`Missing PDF trace for ${route}. Run the production build first.`);failed=true;continue;}
 const files=JSON.parse(fs.readFileSync(trace,'utf8')).files;
 let bytes=0;const publicFiles=new Set(),seen=new Set();
 for(const file of files){
  const absolute=path.resolve(path.dirname(trace),file);
  try{
   const canonical=fs.realpathSync(absolute);
   if(seen.has(canonical))continue;
   seen.add(canonical);bytes+=fs.statSync(canonical).size;
   if(canonical.replaceAll('\\','/').includes('/public/'))publicFiles.add(canonical.replaceAll('\\','/'));
  }catch{console.error(`Missing traced file: ${file}`);failed=true;}
 }
 const onlyFont=publicFiles.size===1&&[...publicFiles][0].endsWith('/public/fonts/NotoSans.ttf');
 const ok=bytes<limit&&onlyFont;
 console.log(`${ok?'PASS':'FAIL'} /api/${route}/confirmation: ${(bytes/1024/1024).toFixed(2)} MB, ${seen.size} unique traced files, ${publicFiles.size} public assets`);
 if(!ok){console.error('PDF functions must bundle only the PDF font, not the website photo library, and remain below 200 MB.');failed=true;}
}
if(failed)process.exitCode=1;
