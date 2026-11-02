import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import { AffiliateApplication } from "./application";
import styles from "./affiliate.module.css";

export const metadata: Metadata = { title: "Affiliate program", description: "Introduce your audience to Blackline's Miami concierge services. Apply for a personal affiliate code and give your community 15% off." };

const experiences = [
  { name: "Days on the water", detail: "YACHT CHARTERS", image: "/yachts/166trinity/166trinity.jpg", href: "/services/yachts" },
  { name: "A stay worth sharing", detail: "VILLAS & PRIVATE STAYS", image: "/stays/soleil/soleil1.jpg", href: "/services/villas" },
  { name: "Arrive exceptionally", detail: "CHAUFFEUR SERVICES", image: "/home/chauffeur-exterior.webp", href: "/services/chauffeur-services" },
];
const faqs = [
  ["Who can become a Blackline affiliate?", "Creators, travel storytellers, lifestyle communities, and people with a network that loves Miami. Tell us about your audience and how you would introduce them to Blackline. Every application is reviewed individually."],
  ["Do I need a large following?", "A relevant audience and thoughtful content matter. Share your profiles or tell us about your network so we can understand the partnership you have in mind."],
  ["How does the 15% discount work?", "Once approved, you receive a personal affiliate code. Your customers share that code with Blackline when requesting a booking and receive 15% off their Blackline services. The team confirms the discount and final price in the written quote before payment."],
  ["What can I promote?", "Blackline's concierge collection: yachts, villas, exotic cars, chauffeur services, private jets, water activities, ATV rides, private chefs, VIP nightlife, photo and video shoots, and security services."],
  ["How do affiliate rewards work?", "Commission rates, qualifying bookings, and payment arrangements are agreed directly with Blackline before your partnership begins. The 15% customer discount is separate from your affiliate compensation."],
  ["What happens after I apply?", "Your application opens as a prepared WhatsApp message. Send it to the Blackline team to start the conversation. Approval and your personal code are confirmed directly by the team; submitting an application does not activate a code."],
];

export default function AffiliateProgramPage() {
  return <div className={styles.page}>
    <section className={styles.hero}>
      <Image src="/home/affiliate-yacht-lifestyle.png" alt="Friends enjoying Biscayne Bay from the lounge of a private yacht" fill priority sizes="100vw" className={styles.heroImage}/>
      <div className={styles.heroShade}/>
      <div className={`${styles.container} ${styles.heroContent}`}>
        <p className={styles.eyebrow}>BLACKLINE / THE AFFILIATE PROGRAM</p>
        <h1>Your influence.<br/>Their next <em>escape.</em></h1>
        <p className={styles.heroBody}>Introduce your world to ours. Share extraordinary Miami experiences with your community, with a personal code that gives them 15% off.</p>
        <div className={styles.actions}><a href="#apply" className={styles.primary}>Become an affiliate <ArrowUpRight size={17}/></a><a href="#how-it-works" className={styles.textLink}>Discover the program <ArrowDown size={15}/></a></div>
        <div className={styles.heroBottom}><span>MIAMI, FLORIDA · CONNECTIONS THAT GO FURTHER</span><span>01 / THE INVITATION</span></div>
      </div>
      <div className={styles.discount}><span>YOUR COMMUNITY RECEIVES</span><strong>15<small>%</small></strong><p>off Blackline services</p><span>ONE PERSONAL CODE. A WORLD OF EXPERIENCES.</span></div>
    </section>

    <div className={styles.ribbon}><span>YOUR VOICE</span><i/><span>OUR MIAMI</span><i/><span>THEIR NEXT GREAT EXPERIENCE</span></div>

    <section className={`${styles.container} ${styles.intro}`}>
      <div><p className={styles.eyebrow}>A PARTNERSHIP WITH POSSIBILITY</p><h2>Good connections.<br/><em>Exceptional possibilities.</em></h2></div>
      <div><p>You know the people. We know the city. Bring your audience closer to Miami’s private stays, open-water days, and unforgettable arrivals — all arranged by one dedicated concierge team.</p><p>This is for creators and connectors who want to share experiences worth talking about.</p></div>
    </section>

    <section className={`${styles.container} ${styles.benefits}`} aria-label="Program benefits">
      {[ ["01", "A code that’s yours", "A personal affiliate code your community can share when booking with Blackline."], ["02", "15% for your people", "A clear reason to book: your audience receives 15% off Blackline services with your code."], ["03", "One dedicated team", "We coordinate the details, from the first enquiry to the confirmed experience."], ["04", "Built around you", "Discuss your audience, content ideas, and partnership rewards directly with our team."] ].map(([n,title,body])=><article key={n}><span>{n}</span><h3>{title}</h3><p>{body}</p></article>)}
    </section>

    <section className={`${styles.container} ${styles.collection}`}><div className={styles.sectionHeading}><div><p className={styles.eyebrow}>MORE THAN SOMETHING TO PROMOTE</p><h2>A lifestyle to <em>share.</em></h2></div><Link href="/services" className={styles.textLink}>Explore all services <ArrowUpRight size={16}/></Link></div><div className={styles.experiences}>{experiences.map(item=><Link href={item.href} key={item.href} className={styles.experience}><Image src={item.image} alt={item.name} fill sizes="(max-width:700px) 90vw, 33vw"/><div className={styles.experienceShade}/><div className={styles.experienceCopy}><p className={styles.eyebrow}>{item.detail}</p><h3>{item.name}</h3><span>Discover the experience <ArrowUpRight size={15}/></span></div></Link>)}</div><p className={styles.collectionNote}>From exotic cars and private jets to chefs, nightlife, and adventures. One code connects your community to the full Blackline collection.</p></section>

    <section className={styles.process} id="how-it-works"><div className={styles.container}><p className={styles.eyebrow}>YOUR NEXT CHAPTER, IN FOUR STEPS</p><h2>Make the <em>introduction.</em><br/>We’ll take it from there.</h2><div className={styles.steps}>{[["Apply", "Tell us who you are, where you share, and what your community loves."],["Connect", "We review your application and agree the partnership details together."],["Share", "Receive your personal code and introduce your audience to Blackline."],["Create experiences", "Your customers quote your code for 15% off. We arrange the experience and confirm the booking."]].map(([title,body],i)=><article key={title}><span>0{i+1}</span><h3>{title}</h3><p>{body}</p></article>)}</div></div></section>

    <section className={`${styles.container} ${styles.apply}`} id="apply"><div className={styles.applyIntro}><p className={styles.eyebrow}>LET’S BUILD SOMETHING EXCEPTIONAL</p><h2>Your world.<br/>The Blackline<br/><em>connection.</em></h2><p>Tell us a little about yourself. Whether you create content or connect people, we’d love to hear your vision.</p><div className={styles.applicationNote}><span>THE PERSONAL APPROACH</span><p>No automated approval. A real conversation with the people behind Blackline.</p></div><a href="mailto:Blackline235@gmail.com" className={styles.textLink}>Have a question? Email us <ArrowUpRight size={15}/></a></div><AffiliateApplication/></section>

    <section className={`${styles.container} ${styles.faq}`}><div><p className={styles.eyebrow}>A FEW THINGS TO KNOW</p><h2>Before you<br/><em>come aboard.</em></h2></div><div>{faqs.map(([question,answer])=><details key={question}><summary>{question}<span aria-hidden>+</span></summary><p>{answer}</p></details>)}</div></section>
    <section className={styles.closing}><p className={styles.eyebrow}>ONE CONNECTION CAN CHANGE THE EXPERIENCE</p><h2>Bring your people.<br/><em>We’ll bring Miami.</em></h2><a href="#apply" className={styles.primary}>Start the conversation <ArrowUpRight size={16}/></a></section>
  </div>;
}
