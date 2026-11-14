"use client";

import { useState } from "react";
import { ArrowUpRight, Eye, EyeOff, KeyRound, Mail } from "lucide-react";
import styles from "../admin/admin.module.css";

export function BrokerLoginForm() {
  const [recovering, setRecovering] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <>
      <h2 id="broker-login-title">
        {recovering ? <>Reset your <em>password.</em></> : <>Broker <em>sign in.</em></>}
      </h2>
      <p className={styles.intro}>
        {recovering
          ? "Use the work email associated with your broker account."
          : "Access your listings with your approved Blackline broker account."}
      </p>
      <label className={styles.field}>
        <span>Work email</span>
        <div>
          <Mail size={16} aria-hidden="true" />
          <input type="email" autoComplete="off" placeholder="you@company.com" />
        </div>
      </label>
      {!recovering && (
        <label className={styles.field} htmlFor="broker-password">
          <span>Password</span>
          <div>
            <KeyRound size={16} aria-hidden="true" />
            <input id="broker-password" type={showPassword ? "text" : "password"} autoComplete="off" placeholder="Enter your password" />
            <button className={styles.showPassword} type="button" aria-label={showPassword ? "Hide password" : "Show password"} onClick={() => setShowPassword(value => !value)}>
              {showPassword ? <EyeOff size={17} aria-hidden="true" /> : <Eye size={17} aria-hidden="true" />}
            </button>
          </div>
        </label>
      )}
      <div className={styles.formOptions}>
        <button type="button" onClick={() => { setRecovering(value => !value); setShowPassword(false); }}>
          {recovering ? "Back to sign in" : "Forgot password?"}
        </button>
      </div>
      <button className={styles.submit} type="button" disabled aria-describedby="broker-preview-status">
        {recovering ? "Send reset link" : "Sign in"}<ArrowUpRight size={18} aria-hidden="true" />
      </button>
      <p className={styles.feedback} id="broker-preview-status">
        Portal preview. {recovering ? "Reset emails are disabled." : "Account access is disabled."}
      </p>
    </>
  );
}
