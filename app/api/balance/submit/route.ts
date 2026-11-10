import sharp from 'sharp';
import {sameOrigin} from '@/lib/zelle-server';
import {balanceAccess,balanceDatabase} from '@/lib/balance-server';
export const runtime='nodejs';
export async function POST(request:Request){
 if(!sameOrigin(request))return Response.json({error:'Invalid request origin.'},{status:403});
 try{
 const reader=request.body?.getReader();if(!reader)return Response.json({error:'A screenshot is required.'},{status:400});let size=0;const chunks:Uint8Array[]=[];
 while(true){const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>6*1024*1024){await reader.cancel();return Response.json({error:'Choose a screenshot under 5 MB.'},{status:413});}chunks.push(value);}
 const form=await new Response(Buffer.concat(chunks),{headers:{'Content-Type':request.headers.get('content-type')??''}}).formData();const id=form.get('id'),token=form.get('token'),file=form.get('screenshot');
 if(typeof id!=='string'||typeof token!=='string')return Response.json({error:'Invalid link.'},{status:403});const record=await balanceAccess(id,token);if(!record||record.source!=='zelle')return Response.json({error:'Invalid transfer link.'},{status:403});
 if(!(file instanceof File)||file.size===0||file.size>5*1024*1024||!['image/jpeg','image/png','image/webp'].includes(file.type))return Response.json({error:'Choose a payment screenshot: JPG, PNG or WebP under 5 MB.'},{status:400});
 const image=await sharp(Buffer.from(await file.arrayBuffer()),{limitInputPixels:25000000,animated:false}).rotate().resize({width:2000,height:2400,fit:'inside',withoutEnlargement:true}).jpeg({quality:85}).toBuffer();if(image.length>2*1024*1024)throw Error('Image too large');
 await balanceDatabase('submit',{id,imageBase64:image.toString('base64')});return Response.json({submitted:true},{headers:{'Cache-Control':'no-store'}});
 }catch{return Response.json({error:'Screenshot could not be submitted. Check the image and your payment link, or contact your concierge before sending more money.'},{status:409});}
}
