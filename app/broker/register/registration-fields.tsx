"use client";

import { useState } from "react";
import styles from "./register.module.css";

const rules = [
  ["At least 10 characters", (value: string) => Array.from(value).length >= 10],
  ["An uppercase letter", (value: string) => /\p{Lu}/u.test(value)],
  ["A lowercase letter", (value: string) => /\p{Ll}/u.test(value)],
  ["A number", (value: string) => /\p{Nd}/u.test(value)],
  ["A special character, such as ! or #", (value: string) => /[\p{P}\p{S}]/u.test(value)],
] as const;

export function PasswordFields() {
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [visible, setVisible] = useState(false);
  return (
    <div className={styles.passwordFields}>
      <div className={styles.fields}>
        <label>
          Example password
          <input type={visible ? "text" : "password"} autoComplete="off" value={password} onChange={event => setPassword(event.target.value)} aria-describedby="broker-password-rules" />
        </label>
        <label>
          Confirm example password
          <input type={visible ? "text" : "password"} autoComplete="off" value={confirmation} onChange={event => setConfirmation(event.target.value)} />
        </label>
      </div>
      <label className={styles.toggle}><input type="checkbox" checked={visible} onChange={event => setVisible(event.target.checked)} /> Show passwords</label>
      <ul className={styles.rules} id="broker-password-rules">
        {rules.map(([label, meetsRule]) => (
          <li key={label} data-met={meetsRule(password)}>{meetsRule(password) ? "✓" : "○"} {label}</li>
        ))}
      </ul>
      {confirmation && <p role="status">{password === confirmation ? "Passwords match." : "Passwords do not match."}</p>}
    </div>
  );
}

export function ServiceSelector({ options }: { options: ReadonlyArray<readonly [string, string]> }) {
  const [selected, setSelected] = useState<string[]>([]);
  return (
    <details className={styles.services}>
      <summary>Services offered <span className={styles.count}>{selected.length} selected</span></summary>
      <fieldset aria-label="Services offered">
        <p>Select all the services your business offers.</p>
        <div className={styles.serviceOptions}>
          {options.map(([id, label]) => (
            <label key={id}>
              <input type="checkbox" name="services" value={id} checked={selected.includes(id)}
                onChange={event => {
                  const checked = event.target.checked;
                  setSelected(current => checked ? [...current, id] : current.filter(service => service !== id));
                }} />
              {label}
            </label>
          ))}
        </div>
      </fieldset>
    </details>
  );
}
