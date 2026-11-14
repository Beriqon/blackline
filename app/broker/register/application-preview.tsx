"use client";

import { useRef, type ReactNode } from "react";
import Link from "next/link";
import { CircleCheck, LockKeyhole } from "lucide-react";
import styles from "./register.module.css";

export function ApplicationPreview({ children }: { children: ReactNode }) {
  const confirmation = useRef<HTMLDialogElement>(null);
  const status = useRef<HTMLDialogElement>(null);

  return (
    <>
      <form aria-describedby="preview-note" onSubmit={event => {
        event.preventDefault();
        confirmation.current?.showModal();
      }}>
        {children}
        <button className={styles.submit} type="submit">Create account and submit for review</button>
      </form>

      <dialog ref={confirmation} className={styles.dialog} aria-labelledby="application-confirmation">
        <CircleCheck size={28} aria-hidden="true" />
        <h2 id="application-confirmation">Application submitted</h2>
        <p>Blackline will review your application. You can sign in to check your status. Listing tools unlock once your account is verified.</p>
        <p className={styles.previewCaption}>Demo confirmation. No account was created and no files were sent.</p>
        <div className={styles.dialogActions}>
          <button type="button" onClick={() => confirmation.current?.close()}>Close</button>
          <button className={styles.submit} type="button" onClick={() => {
            confirmation.current?.close();
            status.current?.showModal();
          }}>View status preview</button>
        </div>
      </dialog>

      <dialog ref={status} className={styles.dialog} aria-labelledby="application-status">
        <LockKeyhole size={28} aria-hidden="true" />
        <h2 id="application-status">Pending verification</h2>
        <p>This is the status a broker sees after signing in while Blackline reviews the application.</p>
        <p className={styles.previewCaption}>My listings is locked until your account receives the Verified badge.</p>
        <div className={styles.dialogActions}>
          <button type="button" onClick={() => status.current?.close()}>Close preview</button>
          <Link className={styles.submit} href="/broker/dashboard?status=pending">Open dashboard preview</Link>
        </div>
      </dialog>
    </>
  );
}
