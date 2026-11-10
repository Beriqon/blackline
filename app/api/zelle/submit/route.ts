import {NextResponse} from "next/server";
import sharp from "sharp";
import {hasZelleAccess,sameOrigin,zelleDatabase} from "@/lib/zelle-server";
export const runtime="nodejs";
export async function POST(request:Request){
 if(!sameOrigin(request))return NextResponse.json({error:"Invalid request origin."},{status:403});
 if(Number(request.headers.get("content-length")??0)>6*1024*1024)return NextResponse.json({error:"Choose an image under 5 MB."},{status:413});
 try{
  const reader=request.body?.getReader();if(!reader)return NextResponse.json({error:"A screenshot is required."},{status:400});
  const chunks:Uint8Array[]=[];let bytes=0;
  while(true){const {done,value}=await reader.read();if(done)break;bytes+=value.length;if(bytes>6*1024*1024){await reader.cancel();return NextResponse.json({error:"Choose an image under 5 MB."},{status:413});}chunks.push(value);}
  const form=await new Response(Buffer.concat(chunks),{headers:{"Content-Type":request.headers.get("content-type")??""}}).formData(),id=form.get("orderId"),file=form.get("screenshot");
  if(typeof id!=="string"||!await hasZelleAccess(id))return NextResponse.json({error:"Open your Zelle payment instructions again."},{status:403});
  if(!(file instanceof File)||!file.size||file.size>5*1024*1024||!["image/jpeg","image/png","image/webp"].includes(file.type))return NextResponse.json({error:"A payment screenshot is required. Choose JPG, PNG or WebP under 5 MB."},{status:400});
  let image:Buffer;
  try{image=await sharp(Buffer.from(await file.arrayBuffer()),{limitInputPixels:25000000,animated:false}).rotate().resize({width:2000,height:2400,fit:"inside",withoutEnlargement:true}).jpeg({quality:85}).toBuffer();}catch{return NextResponse.json({error:"This file is not a supported image. Choose a screenshot in JPG, PNG or WebP format."},{status:400});}
  if(image.length>2*1024*1024)return NextResponse.json({error:"Choose a smaller screenshot."},{status:400});
  await zelleDatabase("submit",{orderId:id,imageBase64:image.toString("base64")});
  return NextResponse.json({url:`/payment/zelle?order_id=${encodeURIComponent(id)}`},{headers:{"Cache-Control":"no-store"}});
 }catch{return NextResponse.json({error:"Could not submit your payment screenshot. Your hold may have expired. Contact your concierge before sending any additional money."},{status:409});}
}
