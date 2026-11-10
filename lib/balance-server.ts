import 'server-only';
import {createHmac,timingSafeEqual} from 'node:crypto';
import {publicDatabase} from './supabase-server';
import type {BalanceRecord} from './balance-types';
export function balanceSignature(id:string){const key=process.env.BLACKLINE_BOOKING_TOKEN;if(!key)throw Error('Booking database is not configured.');return createHmac('sha256',key).update('balance-link-v1:'+id).digest('hex');}
export function validBalanceAccess(id:string,token:string){if(!/^[a-f0-9-]{36}$/.test(id)||!/^[a-f0-9]{64}$/.test(token))return false;return timingSafeEqual(Buffer.from(token),Buffer.from(balanceSignature(id)));}
export async function balanceDatabase<T=BalanceRecord|null>(operation:string,payload:unknown):Promise<T>{const {data,error}=await publicDatabase().rpc('blackline_balance',{token:process.env.BLACKLINE_BOOKING_TOKEN,operation,payload});if(error)throw Error(error.message);return data as T;}
export async function balanceAccess(id:string,token:string){if(!validBalanceAccess(id,token))return null;return balanceDatabase('get',{id});}
export function balancePath(id:string){return `/payment/balance?id=${encodeURIComponent(id)}&token=${balanceSignature(id)}`;}
