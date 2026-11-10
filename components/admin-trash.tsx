"use client";
import {useCallback,useEffect,useState} from 'react';
import {loadRows,saveRow,removeRow} from '@/lib/workspace-store';
import type {TrashEntry} from '@/lib/admin-trash';
import {isLocalDashboardPreview} from '@/lib/dashboard-preview';
import styles from '@/app/admin/dashboard/dashboard.module.css';
export function useAdminTrash(){
 const [entries,setEntries]=useState<TrashEntry[]>([]),[error,setError]=useState(''),[ready,setReady]=useState(false),[busy,setBusy]=useState(false);
 const reload=useCallback(async()=>{try{if(!isLocalDashboardPreview())setEntries(await loadRows<TrashEntry>('admin_trash'));setReady(true);setError('');}catch{setReady(false);setError('Trash could not be loaded. Reload before deleting or restoring records.');}},[]);
 useEffect(()=>{void reload();const sync=()=>void reload();window.addEventListener('focus',sync);return()=>window.removeEventListener('focus',sync);},[reload]);
 const trash=async(entry:Omit<TrashEntry,'id'|'deletedAt'>)=>{if(!ready||busy||isLocalDashboardPreview())throw Error('Trash is not available.');setBusy(true);try{const next={...entry,id:entry.kind+':'+entry.recordId,deletedAt:new Date().toISOString()};await saveRow('admin_trash',next.id,next);setEntries(old=>[...old.filter(e=>e.id!==next.id),next]);}finally{setBusy(false);}};
 const restore=async(entry:TrashEntry)=>{if(busy||entry.permanentlyDeletedAt||isLocalDashboardPreview())return;setBusy(true);try{await removeRow('admin_trash',entry.id);setEntries(old=>old.filter(e=>e.id!==entry.id));setError('');}catch{setError('Could not restore this record. Reload and try again.');}finally{setBusy(false);}};
 const permanentlyDelete=async(entry:TrashEntry)=>{if(!ready||busy||entry.permanentlyDeletedAt||isLocalDashboardPreview())return;setBusy(true);try{
  // Keep the suppression marker: removing it would regenerate online orders and
  // booking-derived customer profiles on the next refresh. Financial records and
  // inventory reservations are deliberately independent of workspace deletion.
  const next={...entry,permanentlyDeletedAt:new Date().toISOString()};
  await saveRow('admin_trash',entry.id,next);setEntries(old=>old.map(e=>e.id===entry.id?next:e));setError('');
 }catch{setError('Could not permanently remove this record. Reload and try again.');}finally{setBusy(false);}};
 return {entries,ready,busy,error,trash,restore,permanentlyDelete};
}
export function AdminTrash({kind,store}:{kind:TrashEntry['kind'];store:ReturnType<typeof useAdminTrash>}){
 const [open,setOpen]=useState(false);const entries=store.entries.filter(e=>e.kind===kind&&!e.permanentlyDeletedAt);
 return <section className={styles.panel} style={{padding:16,marginBottom:20}}>{store.error&&<p role="alert" className={styles.error}>{store.error}</p>}<button className={styles.secondary} onClick={()=>setOpen(v=>!v)} aria-expanded={open}>Trash · {entries.length} deleted {kind==='booking'?'bookings / quotes':'customers'}</button>{open&&<><p className={styles.formHint}>Deleted records are hidden from the overview and can be restored. Payments, reservations and availability are unchanged. Customer deletion keeps booking history. Permanently deleting removes the item from the workspace and Trash without a restore option; underlying financial records and reservations are retained.</p>{entries.length?<div className={styles.tableScroll}><table><thead><tr><th>Name / record</th><th>Deleted</th><th>Action</th></tr></thead><tbody>{entries.map(e=><tr key={e.id}><td>{e.name}<small>{e.recordId}</small></td><td>{new Date(e.deletedAt).toLocaleString('en-US')}</td><td><button disabled={store.busy||!store.ready} className={styles.secondary} onClick={()=>void store.restore(e)}>Restore</button><button disabled={store.busy||!store.ready} className={styles.deleteLink} style={{display:"inline-flex",marginLeft:16}} onClick={async()=>{if(!window.confirm(`Permanently remove ${e.name} (${e.recordId}) from this workspace and Trash? This cannot be restored through the dashboard. Payment records, bookings linked to customers, and reserved dates remain unchanged.`))return;await store.permanentlyDelete(e);}}>Permanently delete</button></td></tr>)}</tbody></table></div>:<p>No deleted records.</p>}</>}</section>;
}
