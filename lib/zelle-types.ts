import type {CheckoutOrder} from "./checkout-orders";
export const ZELLE_EMAIL="blackline235@gmail.com";
export type ZelleStatus="awaiting_transfer"|"payment_submitted"|"confirmed"|"rejected"|"expired";
export type ZelleOrder=Omit<CheckoutOrder,"testMode"|"status"> & {testMode:false;paymentMethod:"zelle";status:ZelleStatus;holdUntilIso:string;submittedAtIso?:string;reviewedAtIso?:string;reviewNote?:string;hasEvidence?:boolean};
export function zelleStatusLabel(status:ZelleStatus){return {awaiting_transfer:"Awaiting transfer and screenshot",payment_submitted:"Payment submitted — awaiting verification",confirmed:"Deposit confirmed — booking secured",rejected:"Payment rejected — availability released",expired:"Hold expired — contact your concierge"}[status];}
