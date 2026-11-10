import type {ZelleOrder} from "./zelle-types";
import type {OrderConfirmation} from "./order-confirmation-view";
export function zelleConfirmation(order:ZelleOrder,pictures:Record<string,string>):OrderConfirmation{
 const confirmed=order.status==="confirmed";
 const released=order.status==="rejected"||order.status==="expired";
 const paidCents=confirmed?(order.amountPaidCents??order.amountDueCents??order.depositCents):0;
 return {order:{...order,status:confirmed?"deposit_paid":released?"expired":"pending"},status:confirmed?"confirmed":released?"expired":"awaiting_payment",paidCents,outstandingCents:order.knownTotalCents-paidCents,paymentMethod:"Zelle · bank transfer",pictures,zelle:{status:order.status,holdUntilIso:order.holdUntilIso,submittedAtIso:order.submittedAtIso,reviewNote:order.reviewNote}};
}
