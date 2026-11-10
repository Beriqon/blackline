import type {CheckoutOrder} from './checkout-orders';
export type BalancePayment={id:string;source:'stripe'|'zelle';orderId:string;status:'open'|'stripe_open'|'zelle_submitted'|'rejected'|'paid';amountCents:number;attempt:number;sessionId?:string;expiresAtIso:string;createdAtIso:string;submittedAtIso?:string;paidAtIso?:string;reviewNote?:string};
export type BalanceRecord=BalancePayment&{order:Omit<CheckoutOrder,'testMode'|'status'>&{testMode:boolean;status:string}};
