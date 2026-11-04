import cartUxEn from "@/messages/cartUx.en.json";
import cartUxEs from "@/messages/cartUx.es.json";
import en from "@/messages/en.json";
import es from "@/messages/es.json";
import packageBuilderEn from "@/messages/packageBuilder.en.json";
import packageBuilderEs from "@/messages/packageBuilder.es.json";
import vipNightlifeEn from "@/messages/vipNightlife.en.json";
import vipNightlifeEs from "@/messages/vipNightlife.es.json";
import privateChefsEn from "@/messages/privateChefs.en.json";
import privateChefsEs from "@/messages/privateChefs.es.json";
import villasEn from "@/messages/villas.en.json";
import villasEs from "@/messages/villas.es.json";
import villasContentEs from "@/messages/villasContent.es.json";
import privateJetsContentEs from "@/messages/privateJetsContent.es.json";
import onTheWaterContentEs from "@/messages/onTheWaterContent.es.json";
import chauffeurContentEs from "@/messages/chauffeurContent.es.json";
import exoticContentEs from "@/messages/exoticContent.es.json";
import yachtContentEs from "@/messages/yachtContent.es.json";
import atvPageEn from "@/messages/atvPage.en.json";
import atvPageEs from "@/messages/atvPage.es.json";

import { registerDictionary } from "@/lib/i18n/translate";
import type { Messages } from "@/lib/i18n/translate";

function mergeMessages(base: Messages, ...extras: Messages[]): Messages {
  return extras.reduce((acc, extra) => ({ ...acc, ...extra }), base);
}

registerDictionary(
  "en",
  mergeMessages(
    {...en,cart:{...en.cart,ux:cartUxEn}} as Messages,
    vipNightlifeEn as Messages,
    privateChefsEn as Messages,
    villasEn as Messages,
    atvPageEn as Messages,
    { packageBuilder: packageBuilderEn as Messages },
  ),
);
registerDictionary(
  "es",
  mergeMessages(
    {...es,cart:{...es.cart,ux:cartUxEs}} as Messages,
    vipNightlifeEs as Messages,
    privateChefsEs as Messages,
    villasEs as Messages,
    villasContentEs as Messages,
    privateJetsContentEs as Messages,
    onTheWaterContentEs as unknown as Messages,
    chauffeurContentEs as unknown as Messages,
    exoticContentEs as unknown as Messages,
    yachtContentEs as unknown as Messages,
    atvPageEs as Messages,
    { packageBuilder: packageBuilderEs as Messages },
  ),
);
