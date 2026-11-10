import type {AdminBooking} from './admin-demo-data';
import {bookingPayment} from './admin-booking-summary';
export function bookingDeskAction(booking:AdminBooking){
 const payment=bookingPayment(booking);
 if(booking.stripeOrder?.requiresReview)return {label:"Review booking",hint:"Paid · availability needs review",section:undefined,priority:0};
 const review=payment.verification||booking.zelleOrder?.status==='expired'&&!!booking.zelleOrder.hasEvidence;
 if(review)return {label:'Review payment',hint:booking.balancePayment?.status==='zelle_submitted'?'Zelle balance · bank check needed':'Zelle · bank check needed',section:booking.balancePayment?.status==='zelle_submitted'?'balance' as const:'review' as const,priority:0};
 if(booking.quoteRequest)return {label:'View request',hint:({pending:'Proposal to prepare',quoted:'Proposal sent',confirmed:'Proposal accepted',cancelled:'Request cancelled'})[booking.quoteRequest.status],section:undefined,priority:booking.quoteRequest.status==='pending'?1:4};
 if((payment.outstandingCents??0)>0&&(booking.stripeOrder||booking.zelleOrder?.status==='confirmed'))return {label:'Request balance',hint:'Send a secure payment link',section:'balance' as const,priority:2};
 return {label:'View booking',hint:payment.state==='unrecorded'?'Payment details not recorded':payment.state==='paid'?'No payment action needed':booking.status==='Cancelled'?'Reservation released':'Manage booking details',section:undefined,priority:payment.state==='unrecorded'?3:4};
}
