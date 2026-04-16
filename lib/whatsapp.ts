/** Same number as contact page — WhatsApp Business / team line. */
export const WHATSAPP_PHONE_E164 = "17866840345";

export function whatsAppUrlWithText(message: string): string {
  const text = encodeURIComponent(message.trim());
  return `https://wa.me/${WHATSAPP_PHONE_E164}?text=${text}`;
}
