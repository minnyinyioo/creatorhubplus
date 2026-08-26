/**
 * CreatorHubPlus — Privacy Policy
 * Product direction: clear, calm privacy information with an editorial reading rhythm and a visible way back.
 */
import { ArrowLeft, ArrowUpRight, ShieldCheck } from "lucide-react";
import { Link } from "wouter";
import { useSiteLocale } from "@/lib/useSiteLocale";

const sections = [
  {
    label: "01",
    title: "What this policy covers",
    content: "This Privacy Policy explains how CreatorHubPlus handles personal information when you visit this site, use its contact and support pathways, or choose analytics cookies. It applies to this website and the related support experience described here.",
  },
  {
    label: "02",
    title: "Information you choose to share",
    content: "If you contact CreatorHubPlus, you may choose to provide details about your platform, account situation, payout route, or support question. Please do not send passwords, payment card details, or other highly sensitive information through public contact channels.",
  },
  {
    label: "03",
    title: "Cookies and analytics",
    content: "Essential cookies keep the website functioning and remember your privacy choice. Optional analytics cookies help us understand site use in aggregate. Analytics is not activated unless you choose to accept it through the Cookie Settings panel.",
  },
  {
    label: "04",
    title: "How information is used",
    content: "Information is used to respond to support enquiries, maintain the website, improve clarity in the user experience, and protect the service from misuse. CreatorHubPlus does not sell personal information.",
  },
  {
    label: "05",
    title: "Your choices",
    content: "You can reopen Cookie Settings at any time from the website footer to change analytics consent. You can also use your browser settings to control cookies. For questions about this policy or information connected to a support enquiry, contact CreatorHubPlus through the site’s support channel.",
  },
];

export default function Privacy() {
  useSiteLocale("en", "CreatorHubPlus — Privacy Policy");
  return (
    <main className="privacy-page">
      <header className="privacy-header">
        <Link href="/" className="privacy-brand"><img src="/favicon.svg" alt="CreatorHubPlus logo" /><span>creatorhub<span>plus</span></span></Link>
        <div className="locale-links"><Link href="/my/privacy">မြန်မာ</Link><Link href="/" className="privacy-return"><ArrowLeft size={15} /> Return to site</Link></div>
      </header>

      <section className="privacy-hero">
        <div><p className="privacy-eyebrow"><ShieldCheck size={14} /> PRIVACY POLICY</p><h1>Clear choices.<br /><em>Clearer use.</em></h1></div>
        <p>This page explains what information CreatorHubPlus uses, why it is used, and how you can manage your privacy choices.</p>
      </section>

      <section className="privacy-content">
        <aside className="privacy-aside"><p>LAST UPDATED</p><strong>25 August 2026</strong><span>CreatorHubPlus</span><button onClick={() => (window as Window & { CookieConsent?: { showPreferences?: () => void } }).CookieConsent?.showPreferences?.()}>Manage Cookie Settings <ArrowUpRight size={14} /></button></aside>
        <div className="privacy-sections">{sections.map((section) => <article key={section.label}><span>{section.label}</span><div><h2>{section.title}</h2><p>{section.content}</p></div></article>)}</div>
      </section>

      <footer className="privacy-footer"><p>CreatorHubPlus Privacy Policy</p><span><Link href="/terms">Terms of Service <ArrowUpRight size={14} /></Link> <Link href="/">Back to CreatorHubPlus <ArrowUpRight size={14} /></Link></span></footer>
    </main>
  );
}
