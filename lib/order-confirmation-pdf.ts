import "server-only";
import { readFile } from "node:fs/promises";
import path from "node:path";
import fontkit from "@pdf-lib/fontkit";
import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from "pdf-lib";
import { confirmationDate, confirmationLineAmounts, confirmationMoney, type OrderConfirmation } from "./order-confirmation-view";
import { confirmationImage } from "./confirmation-image";

const WIDTH = 595.28, HEIGHT = 841.89, MARGIN = 42, CONTENT = WIDTH - MARGIN * 2;
const ink = rgb(.08, .08, .075), gold = rgb(.63, .49, .29), muted = rgb(.43, .42, .38), rule = rgb(.84, .81, .75), paper = rgb(.985, .98, .96);

export async function createOrderConfirmationPdf(data: OrderConfirmation) {
  const doc = await PDFDocument.create();
  doc.registerFontkit(fontkit);
  const sans = await doc.embedFont(await readFile(path.join(process.cwd(), "public/fonts/NotoSans.ttf")), { subset: true });
  const serif = await doc.embedFont(StandardFonts.TimesRoman);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const italic = await doc.embedFont(StandardFonts.TimesRomanItalic);
  const glyphs = new Set(sans.getCharacterSet());
  const clean = (text: string) => [...text.replace(/[\u2010-\u2015]/g, "-").replace(/\s+/g, " ").normalize("NFC")].map(char => glyphs.has(char.codePointAt(0)!) ? char : "?").join("");
  const { order } = data;
  const imageSources = [...new Set(order.lines.map(item => data.pictures[item.productId]).filter(Boolean))];
  const images = new Map<string, Uint8Array | null>();
  for (let index = 0; index < imageSources.length; index += 4) {
    await Promise.all(imageSources.slice(index, index + 4).map(async src => images.set(src, await confirmationImage(src))));
  }
  const confirmed = data.status === "confirmed", received = data.paidCents > 0;
  const balancePending=data.balancePayment?.status==="zelle_submitted";
  const zellePending=data.zelle?.status==="payment_submitted"||balancePending;
  const released=data.zelle?.status==="expired"||data.zelle?.status==="rejected";
  doc.setTitle(`Blackline ${confirmed ? "booking confirmation" : "order summary"} - ${order.id}`);
  doc.setAuthor("Blackline Concierge"); doc.setSubject("Your selected experiences and payment summary"); doc.setCreator("Blackline Concierge");
  let page!: PDFPage;
  let y = 0;

  function text(value: string, x: number, top: number, size = 9, font = sans, color = ink) {
    page.drawText(clean(value), { x, y: HEIGHT - top - size, size, font, color });
  }
  function wrap(value: string, width: number, size = 9, font: PDFFont = sans) {
    const lines: string[] = []; let line = "";
    for (const word of clean(value).split(" ")) {
      if (font.widthOfTextAtSize(word, size) > width) {
        if (line) { lines.push(line); line = ""; }
        let chunk = "";
        for (const char of word) {
          if (chunk && font.widthOfTextAtSize(chunk + char, size) > width) { lines.push(chunk); chunk = ""; }
          chunk += char;
        }
        line = chunk;
      } else if (line && font.widthOfTextAtSize(`${line} ${word}`, size) > width) { lines.push(line); line = word; }
      else line = line ? `${line} ${word}` : word;
    }
    if (line) lines.push(line);
    return lines;
  }
  function paragraph(value: string, x: number, top: number, width: number, size = 9, color = muted, font = sans) {
    const lines = wrap(value, width, size, font);
    lines.forEach((line, index) => text(line, x, top + index * size * 1.55, size, font, color));
    return lines.length * size * 1.55;
  }
  function line(top: number) { page.drawLine({ start: { x: MARGIN, y: HEIGHT - top }, end: { x: WIDTH - MARGIN, y: HEIGHT - top }, thickness: .6, color: rule }); }
  function newPage(first = false) {
    page = doc.addPage([WIDTH, HEIGHT]);
    page.drawRectangle({ x: 0, y: HEIGHT - (first ? 90 : 82), width: WIDTH, height: first ? 90 : 82, color: ink });
    text("B L A C K L I N E", MARGIN, 29, 19, serif, rgb(.96, .94, .89));
    text("C O N C I E R G E", MARGIN + 1, 55, 7.5, sans, rgb(.78, .64, .42));
    const tag = order.testMode ? "TEST CONFIRMATION" : "ORDER CONFIRMATION";
    text(tag, WIDTH - MARGIN - sans.widthOfTextAtSize(tag, 7), 39, 7, sans, rgb(.78, .7, .56));
    page.drawRectangle({ x: 0, y: HEIGHT - (first ? 92 : 84), width: WIDTH, height: 2, color: gold });
    if (!first) text(order.id, MARGIN, 100, 8, sans, muted);
    y = first ? zellePending?103:113 : 128;
  }
  function ensure(height: number) { if (y + height > HEIGHT - 70) newPage(); }

  newPage(true);
  text(zellePending?"Your Miami, taking shape.":confirmed ? "Your experience, confirmed." : received ? "Payment received." : "Your order summary.", MARGIN, y, zellePending?28:31, serif);
  y += zellePending?36:40;
  y += paragraph(data.status==="review"?"Your payment has been received, but availability needs a concierge review. Contact Blackline with this order number. Do not send another payment.":zellePending?"Thank you for choosing Blackline. Your Zelle screenshot is received; bank verification is pending. The remaining payment is confirmed after checking the bank transaction. This summary is not proof of payment.":released?"Your availability hold has been released. If you sent money, contact Blackline with this order number before sending any additional payment.":confirmed ? "Thank you for choosing Blackline. Your payment is received, and your Miami experience is one step closer." : received ? "Your payment has been received. We are finalizing the booking confirmation; please do not pay again." : "This is an overview of your selection. Payment has not been confirmed; this document is not proof of payment.", MARGIN, y, CONTENT, 9.5);
  if(zellePending&&data.zelle){y+=9;y+=paragraph(`Availability held until ${new Intl.DateTimeFormat("en-US",{dateStyle:"medium",timeStyle:"short",timeZone:"America/New_York"}).format(new Date(data.zelle!.holdUntilIso))} (Miami time). Submitted for bank verification: ${confirmationMoney(order.amountDueCents??order.depositCents)}.`,MARGIN,y,CONTENT,8.5,gold);}
  y += 16; line(y); y += 12;
  text("ORDER NUMBER", MARGIN, y, 7, bold, gold);
  text(order.id, MARGIN, y + 15, 8);
  text("ORDER DATE", 370, y, 7, bold, gold);
  text(confirmationDate(order.createdAtIso), 370, y + 15, 8);
  y += 36;
  text("PREPARED FOR", MARGIN, y, 7, bold, gold);
  const nameHeight = paragraph(order.customerName, MARGIN, y + 15, 240, 10, ink);
  const emailHeight = paragraph(order.customerEmail, MARGIN, y + 19 + nameHeight, 240, 8);
  text("PAYMENT STATUS", 370, y, 7, bold, gold);
  const statusHeight=paragraph(data.status==="review"?"Payment received - concierge review needed":zellePending?"Zelle: awaiting bank verification":released?"Hold released - contact concierge":confirmed ? "Payment verified - booking confirmed" : received ? "Payment received - finalizing booking" : "Payment not confirmed", 370, y + 15, 180, 8, ink);
  if (data.paymentMethod) paragraph(data.paymentMethod, 370, y + 20 + statusHeight, 180, 8);
  y += Math.max(52, 25 + nameHeight + emailHeight,30+statusHeight+(data.paymentMethod?14:0));
  line(y); y += 14;
  text("Y O U R   S E L E C T I O N", MARGIN, y, 8, bold, gold); y += 20;

  const items = confirmationLineAmounts(order, data.paidCents);
  for (let index = 0; index < items.length; index++) {
    const item = items[index];
    const titleLines = wrap(item.title, CONTENT - 132, 12);
    const detailLines = wrap(item.description || "Details coordinated with your concierge.", CONTENT - 132, 8);
    const textHeight = titleLines.length * 18.6 + detailLines.length * 12.4;
    const height = Math.max(zellePending||order.paymentHistory?.length?80:90, textHeight + (order.paymentHistory?.length?45:52));
    // Exceptionally long descriptions can continue across pages without clipping.
    if (height > HEIGHT - 200) {
      ensure(120);
      for (const part of wrap(item.title, CONTENT, 12)) { ensure(20); text(part, MARGIN, y, 12); y += 19; }
      y += 8;
      for (const part of wrap(item.description, CONTENT, 8)) { ensure(15); text(part, MARGIN, y, 8); y += 13; }
      ensure(40);
    } else {
      ensure(height + 15);
      const imageBytes = images.get(data.pictures[item.productId]);
      if (imageBytes) {
        try { const image = await doc.embedJpg(imageBytes); page.drawImage(image, { x: MARGIN, y: HEIGHT - y - 76, width: 112, height: 70 }); }
        catch { page.drawRectangle({ x: MARGIN, y: HEIGHT - y - 76, width: 112, height: 70, color: paper }); }
      } else {
        page.drawRectangle({ x: MARGIN, y: HEIGHT - y - 76, width: 112, height: 70, color: paper, borderColor: rule, borderWidth: .5 });
        text("BLACKLINE", MARGIN + 27, y + 31, 9, serif, gold);
      }
      titleLines.forEach((part, i) => text(part, MARGIN + 132, y + i * 18.6, 12));
      let top = y + titleLines.length * 18.6 + 5;
      detailLines.forEach((part, i) => text(part, MARGIN + 132, top + i * 12.4, 8, sans, muted));
      top += detailLines.length * 12.4 + 12;
      if (item.totalCents === null) text("PRICE FOLLOWS - NOT INCLUDED", MARGIN + 132, top, 8, bold, gold);
      else {
        const labels = [`Price  ${confirmationMoney(item.totalCents)}`, `Paid  ${confirmationMoney(item.paidCents!)}`, `Remaining  ${confirmationMoney(item.remainingCents!)}`];
        paragraph(labels.join("    |    "), MARGIN + 132, top, CONTENT - 132, 8, ink);
      }
      y += height;
    }
    if (height > HEIGHT - 200) {
      paragraph(item.totalCents === null ? "PRICE FOLLOWS - NOT INCLUDED" : `Price ${confirmationMoney(item.totalCents)} | Paid ${confirmationMoney(item.paidCents!)} | Remaining ${confirmationMoney(item.remainingCents!)}`, MARGIN, y, CONTENT, 8, gold);
      y += 32;
    }
    line(y); y += 14;
  }

  const hasQuotes = items.some(item => item.totalCents === null);
  const hasHistory=!!order.paymentHistory?.length;
  const boxHeight = (hasQuotes ? 154 : 115)+(hasHistory?20:0);
  const pendingNote=`After bank verification of ${confirmationMoney(data.balancePayment?.amountCents??order.amountDueCents??order.depositCents)}, your remaining priced balance will be ${confirmationMoney(data.balancePayment?0:order.remainingCents)}. Keep your order number handy when contacting your concierge.`;
  ensure(zellePending?boxHeight+34+wrap(pendingNote,CONTENT,8).length*12.4:boxHeight+70);
  page.drawRectangle({ x: MARGIN, y: HEIGHT - y - boxHeight, width: CONTENT, height: boxHeight, color: ink });
  text("P A Y M E N T   O V E R V I E W", MARGIN + 20, y + 17, 7, bold, rgb(.78, .64, .42));
  const col = (CONTENT - 40) / 3;
  [["PRICED SERVICES", order.knownTotalCents], [data.zelle||balancePending?"VERIFIED PAID":"TOTAL PAID", data.paidCents], ["REMAINING BALANCE", data.outstandingCents]].forEach(([label, amount], i) => {
    const x = MARGIN + 20 + col * i;
    text(String(label), x, y + 47, 6.5, bold, rgb(.72, .69, .63));
    text(confirmationMoney(Number(amount)), x, y + 64, 20, serif, i === 1 ? rgb(.86, .73, .51) : rgb(.96, .94, .89));
  });
  text(zellePending?"ZELLE  |  Payment submitted - awaiting bank verification":data.outstandingCents===0&&received?"USD  |  PAID IN FULL - NO PRICED BALANCE REMAINING":order.paymentType==="full"?"USD  |  Full payment on priced services":"USD  |  30% deposit on priced services", MARGIN + 20, y + 94, 7, sans, rgb(.69, .65, .58));
  if(hasHistory)text(`Initial ${confirmationMoney(data.paidCents-order.paymentHistory!.reduce((sum,p)=>sum+p.amountCents,0))}  |  Balance ${confirmationMoney(order.paymentHistory!.reduce((sum,p)=>sum+p.amountCents,0))}  |  Received ${confirmationDate(order.paymentHistory!.at(-1)!.paidAtIso)}`,MARGIN+20,y+115,7,sans,rgb(.81,.76,.67));
  if (hasQuotes) paragraph("Services marked 'price follows' are excluded from these amounts. Their price and availability require a separate proposal and your approval.", MARGIN + 20, y + 115+(hasHistory?20:0), CONTENT - 40, 8, rgb(.81, .76, .67));
  y += boxHeight + 22;
  if(zellePending){y+=paragraph(pendingNote,MARGIN,y,CONTENT,8);y+=12;}
  if(!zellePending){y += paragraph(data.outstandingCents===0&&received?"Your priced services are paid in full. Keep this confirmation and quote your order number when contacting us.":"Your concierge will confirm the remaining balance due date before your experience. Keep this confirmation and quote your order number when contacting us.", MARGIN, y, CONTENT, 8);
  y += 18;
  text("One call. Every detail.", MARGIN, y, 15, italic, gold); }

  const pages = doc.getPages();
  pages.forEach((current, index) => {
    page = current;
    line(HEIGHT - 47);
    text("BLACKLINE CONCIERGE  |  +1 (786) 684-0345", MARGIN, HEIGHT - 35, 6.5, sans, muted);
    const number = `${index + 1} / ${pages.length}`;
    text(number, WIDTH - MARGIN - sans.widthOfTextAtSize(number, 7), HEIGHT - 35, 7, sans, muted);
  });
  return doc.save();
}
