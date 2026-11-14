import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { ADMIN_SERVICES } from "@/lib/admin-demo-data";
import { PasswordFields, ServiceSelector } from "./registration-fields";
import { ApplicationPreview } from "./application-preview";
import styles from "./register.module.css";

export const metadata: Metadata = {
  title: "Create a broker account",
  robots: { index: false, follow: false },
};

const sections = [
  { title: "Account details", fields: ["Full name", "Work email", "Phone number"] },
  { title: "Business information", fields: ["Legal business name", "Company registration number", "Country", "Business address", "Website (optional)"] },
  { title: "Verification documents", fields: ["Government-issued ID", "Signed broker agreement", "Business registration document"] },
];

export default function BrokerRegistrationPage() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <Link href="/broker"><ArrowLeft size={16} aria-hidden="true" /> Back to broker sign in</Link>
        <span>BLACKLINE CONCIERGE</span>
      </header>
      <div className={styles.layout}>
        <div>
          <h1>Create a broker account</h1>
          <p>Enter your account and business details and submit your documents for review by Blackline.</p>
          <p id="preview-note" className={styles.notice}>Demo only. Use sample details and files to try the full application. Nothing is sent or saved.</p>
          <nav className={styles.sectionLinks} aria-label="Application sections">
            {sections.map(({ title }, index) => <a key={title} href={"#application-" + index}>{title}</a>)}
          </nav>
          <ApplicationPreview>
            {sections.map(({ title, fields }, index) => (
              <section className={styles.card} key={title} id={"application-" + index}>
                <h2>{title}</h2>
                {index === 2 && <p className={styles.documentHint}>Choose a sample PDF, JPG or PNG for each document.</p>}
                <div className={styles.fields}>
                  {fields.map(label => (
                    <label key={label}>
                      {label}
                        <input
                          type={index === 2 ? "file" : label === "Work email" ? "email" : label === "Phone number" ? "tel" : label.startsWith("Website") ? "url" : "text"}
                          accept={index === 2 ? ".pdf,.jpg,.jpeg,.png" : undefined}
                        />
                    </label>
                  ))}
                </div>
                {index === 0 && <PasswordFields />}
                {index === 1 && <ServiceSelector options={ADMIN_SERVICES} />}
              </section>
            ))}
          </ApplicationPreview>
          <p className={styles.privacy}>Already have an account? <Link href="/broker">Sign in</Link> · <Link href="/privacy">Privacy policy</Link></p>
        </div>
        <aside className={styles.card} aria-labelledby="review-heading">
          <ShieldCheck size={27} aria-hidden="true" />
          <h2 id="review-heading">After you apply</h2>
          <div className={styles.step}>
            <strong>Pending verification</strong>
            <p>You can sign in to check your application status while Blackline reviews your details. Listing actions stay locked.</p>
          </div>
          <div className={styles.step}>
            <strong>Verified</strong>
            <p>Once Blackline approves your application, your profile shows the Verified badge and you can manage your listings.</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
