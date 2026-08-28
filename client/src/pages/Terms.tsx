/**
 * CreatorHubPlus — Terms of Service
 * Baseline public terms; review with qualified local counsel before production reliance.
 */
import { ArrowLeft, ArrowUpRight, FileCheck2 } from "lucide-react";
import { Link } from "wouter";
import { useSiteLocale } from "@/lib/useSiteLocale";
import { CreatorHubPlusLockup } from "@/components/CreatorHubPlusMark";

const sections = [
  { label: "01", title: "The service", content: "CreatorHubPlus provides informational support for creator earnings, payout routes, account setup, and verified address preparation. We help organize legitimate requirements and next steps; we do not operate or control any third-party platform." },
  { label: "02", title: "Truthful information", content: "You agree to provide accurate information about your situation and to use the service lawfully. Do not submit passwords, false documents, another person’s identity information, or material intended to bypass a platform’s rules." },
  { label: "03", title: "Payment requests and review", content: "A payment request is created for the selected service and the server-controlled quoted amount shown at submission. Uploads may be reviewed by authorized staff. A submitted receipt does not mean that a request is verified, and platform approval is never guaranteed." },
  { label: "04", title: "Third-party platforms", content: "Platform names, payment methods, logos, policies, and decisions belong to their respective owners. CreatorHubPlus is not affiliated with or endorsed by those third parties, and their terms and fees may change independently." },
  { label: "05", title: "Refunds and contact", content: "If you need to ask about a payment, receipt, clarification request, or refund review, use the support pathway and include your order number. Any refund decision is subject to the applicable service arrangement and the facts of the request." },
  { label: "06", title: "Changes and acceptable use", content: "We may update these terms, improve the service, or suspend access where needed to protect users and the service. Continued use after an update means you acknowledge the revised terms. If you do not agree, stop using the service." },
];

export default function Terms() {
  useSiteLocale("en", "CreatorHubPlus — Terms of Service");
  return <main className="privacy-page">
    <header className="privacy-header"><Link href="/" className="privacy-brand"><CreatorHubPlusLockup label="CreatorHubPlus" /></Link><div className="locale-links"><Link href="/" className="privacy-return"><ArrowLeft size={15} /> Return to site</Link></div></header>
    <section className="privacy-hero"><div><p className="privacy-eyebrow"><FileCheck2 size={14} /> TERMS OF SERVICE</p><h1>A clear service.<br /><em>A clear agreement.</em></h1></div><p>These baseline terms explain how CreatorHubPlus support, payment requests, reviews, and responsible use work together.</p></section>
    <section className="privacy-content"><aside className="privacy-aside"><p>LAST UPDATED</p><strong>26 August 2026</strong><span>CreatorHubPlus</span><Link href="/privacy">Read Privacy Policy <ArrowUpRight size={14} /></Link></aside><div className="privacy-sections">{sections.map((section) => <article key={section.label}><span>{section.label}</span><div><h2>{section.title}</h2><p>{section.content}</p></div></article>)}</div></section>
    <footer className="privacy-footer"><p>CreatorHubPlus Terms of Service</p><Link href="/">Back to CreatorHubPlus <ArrowUpRight size={14} /></Link></footer>
  </main>;
}
