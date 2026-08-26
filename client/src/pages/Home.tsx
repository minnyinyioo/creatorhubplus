/**
 * CreatorHubPlus — Payout Bridge
 * Brand direction: English-first platform support, warm editorial clarity, visible service pathways.
 */
import { useState } from "react";
import { Link } from "wouter";
import {
  ArrowDownRight,
  ArrowUpRight,
  BadgeCheck,
  Check,
  ChevronDown,
  CircleDollarSign,
  CircleHelp,
  FileCheck2,
  MapPinned,
  Menu,
  MessageCircleMore,
  ShieldCheck,
  Sparkles,
  WalletCards,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { siFacebook, siPaypal, siTiktok, siYoutube, type SimpleIcon } from "simple-icons";
import { useSiteLocale } from "@/lib/useSiteLocale";
import CaseIntakeDialog, { type CaseServiceKey } from "@/components/CaseIntakeDialog";

const logo = "/favicon.svg";

const services = [
  {
    id: "01",
    icon: CircleDollarSign,
    title: "Platform earnings",
    subtitle: "Monetisation readiness",
    state: "CHECK",
    next: "Confirm the platform’s earning requirements against the current account state.",
    description: "Clarify earning requirements, account status, required information and the next useful action.",
    accent: "blue",
    caseKey: "platform_earnings",
  },
  {
    id: "02",
    icon: WalletCards,
    title: "Payout & receiving",
    subtitle: "Payout paths & withdrawals",
    state: "MAP",
    next: "Identify the receiving route, the open step, and the details that must match.",
    description: "Map the information, route and open questions involved in receiving money across platforms.",
    accent: "orange",
    caseKey: "payout_receiving",
  },
  {
    id: "03",
    icon: FileCheck2,
    title: "Account setup",
    subtitle: "Setup & issue checks",
    state: "VERIFY",
    next: "Work through the account settings that can block a legitimate next step.",
    description: "Use a focused checklist for new account setup and legitimate account issue investigation.",
    accent: "green",
    caseKey: "account_setup",
  },
  {
    id: "04",
    icon: MapPinned,
    title: "Address support",
    subtitle: "Verified address preparation",
    state: "PREPARE",
    next: "Review what a platform can genuinely verify before you submit anything.",
    description: "Understand address requirements and prepare a legitimate, truthful, verifiable path.",
    accent: "blue",
    caseKey: "address_support",
  },
];

const paymentMethods = [
  { label: "KBZ Pay", logo: "/manus-storage/kbzpay_b6275ce0.webp", kind: "wallet" },
  { label: "Wave Pay", logo: "/manus-storage/wavepay-appicon_9c7e244e.jpg", kind: "wallet" },
  { label: "AYA Pay", logo: "/manus-storage/ayapay_385dc148.png", kind: "wallet" },
  { label: "KBZ Bank", logo: "/manus-storage/kbzbank_ccd3a1fa.png", kind: "bank" },
  { label: "AYA Bank", logo: "/manus-storage/ayabank_d9d29f1d.png", kind: "bank" },
  { label: "Bangkok Bank", logo: "/manus-storage/bangkok-bank-blue-wide_277247ab.png", kind: "bank" },
  { label: "KASIKORNBANK", logo: "/manus-storage/kasikornbank-official_5108252c.png", kind: "bank" },
];

function BrandGlyph({ icon, className }: { icon: SimpleIcon; className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" aria-hidden="true"><path d={icon.path} fill="currentColor" /></svg>;
}

const steps = [
  ["01", "Tell us the real issue", "Choose the platform and issue type, then describe where progress has stopped."],
  ["02", "Get a clean path", "Receive a focused checklist, practical notes and a recommended next action."],
  ["03", "Keep the case visible", "Keep the progress in one clear path so it is easier to return to and move forward."],
];

const faqs = [
  ["Can you guarantee platform approval?", "No. Each platform makes its own approval decisions. We help you understand requirements, prepare genuine information and avoid preventable setup mistakes."],
  ["Do you provide fake documents or verification bypasses?", "No. CreatorHubPlus supports lawful, truthful and verifiable preparation only. We do not create false identity or address documents, and we do not help bypass platform rules."],
  ["Which platforms can a case start with?", "Start with a common creator or payout platform and describe the actual issue. If it is outside the current service scope, we will say so clearly rather than make vague promises."],
  ["What should I prepare before asking for help?", "Bring the platform name, the current page state, any error screenshots with sensitive data hidden, and the steps you have already tried."],
];

function scrollTo(target: string) {
  document.querySelector(target)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function openCookiePreferences() {
  (window as Window & { CookieConsent?: { showPreferences?: () => void } }).CookieConsent?.showPreferences?.();
}

export default function Home() {
  useSiteLocale("en", "CreatorHubPlus — Creator earnings and payout support");
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedService, setSelectedService] = useState("Platform earnings");
  const [caseDialogOpen, setCaseDialogOpen] = useState(false);
  const selectedServiceRecord = services.find((service) => service.title === selectedService) ?? services[0];

  const chooseService = (service: string) => {
    setSelectedService(service);
    scrollTo("#start");
  };

  return (
    <div className="payout-site" id="top">
      <header className="payout-header">
        <a href="#top" className="payout-brand" onClick={() => scrollTo("#top")}>
          <img src={logo} alt="CreatorHubPlus Payout Bridge logo" />
          <span>creatorhub<span>plus</span></span>
        </a>
        <nav className="payout-nav" aria-label="Main navigation">
          <a href="#services" onClick={() => scrollTo("#services")}>Services</a>
          <a href="#how" onClick={() => scrollTo("#how")}>How it works</a>
          <a href="#trust" onClick={() => scrollTo("#trust")}>Trust & rules</a>
          <a href="#faq" onClick={() => scrollTo("#faq")}>Help</a>
          <Link href="/account" className="workspace-nav-link">Personal centre</Link>
          <Link href="/workspace" className="workspace-nav-link">Workspace</Link>
        </nav>
        <div className="payout-actions">
          <Link href="/my" className="language-link">မြန်မာ</Link>
          <Link href="/payment" className="payment-nav-link">Payment request</Link>
          <button className="header-cta" onClick={() => scrollTo("#start")}>Start a case <ArrowUpRight size={15} /></button>
          <button className="payout-menu" aria-label="Open navigation" onClick={() => setMenuOpen((open) => !open)}>{menuOpen ? <X size={19} /> : <Menu size={20} />}</button>
        </div>
        {menuOpen && <div className="payout-mobile-menu">
          {[["Services", "#services"], ["How it works", "#how"], ["Trust & rules", "#trust"], ["Help", "#faq"]].map(([label, target]) => <button key={label} onClick={() => { setMenuOpen(false); scrollTo(target); }}>{label}<ArrowUpRight size={17} /></button>)}
          <Link href="/account" onClick={() => setMenuOpen(false)}>Personal centre<ArrowUpRight size={17} /></Link>
          <Link href="/workspace" onClick={() => setMenuOpen(false)}>Workspace<ArrowUpRight size={17} /></Link>
        </div>}
      </header>

      <main>
        <section className="payout-hero">
          <div className="hero-copy-payout">
            <p className="payout-eyebrow"><span /> MYANMAR CREATOR & BUSINESS SUPPORT</p>
            <h1>Earn online.<br /><em>Get paid.</em><br />Stay set up.</h1>
            <p className="hero-detail">CreatorHubPlus helps Myanmar creators and online businesses navigate earnings, payouts, account setup, and verified address requirements—one clear case at a time.</p>
            <div className="hero-ctas"><button className="coral-button" onClick={() => scrollTo("#start")}>Tell us your issue <ArrowUpRight size={17} /></button><button className="quiet-button" onClick={() => scrollTo("#services")}>See services <ArrowDownRight size={17} /></button></div>
            <p className="hero-rule"><ShieldCheck size={15} /> Clear support for legitimate platform use. No false documents. No shortcuts.</p>
          </div>
          <div className="payout-map" aria-label="Platform-to-payout route illustration">
            <div className="map-topline"><span>YOUR PLATFORM PATH</span><i /><span>01 / 04</span></div>
            <div className="platform-badge platform-one"><span><BrandGlyph icon={siFacebook} /></span> Facebook</div>
            <div className="platform-badge platform-two"><span><BrandGlyph icon={siYoutube} /></span> YouTube</div>
            <div className="platform-badge platform-three"><span><BrandGlyph icon={siTiktok} /></span> TikTok</div>
            <div className="platform-badge platform-four"><span><BrandGlyph icon={siPaypal} /></span> PayPal</div>
            <div className="route-line route-one" /><div className="route-line route-two" /><div className="route-line route-three" /><div className="route-line route-four" />
            <div className="route-hub"><img src={logo} alt="" /><strong>Case path</strong><span>check → prepare → move</span></div>
            <div className="route-status"><BadgeCheck size={16} /><span>Start with the<br /><b>real requirement</b></span></div>
            <div className="map-foot"><span>Platform</span><b>→</b><span>Checklist</span><b>→</b><span>Next action</span></div>
          </div>
        </section>

        <section className="payment-section" aria-label="Payment route overview">
          <div className="payment-section-banner">
            <div><p className="payout-eyebrow light"><span /> PAYMENT ROUTES</p><h2>Keep the method.<br /><em>Make the path clear.</em></h2></div>
            <div className="payment-banner-note"><span>01 / 03</span><p>Local wallets and banks, arranged in one practical case path.</p></div>
          </div>
        <section className="payment-methods-rail" aria-label="Accepted wallet and bank methods">
          <div className="payment-rail-intro"><p>CHOOSE YOUR PAYOUT METHOD</p><span>Find the wallet or bank you plan to use, then start a case so we can map the required details and the next legitimate step.</span></div>
          <div className="payment-rail-window">
            <div className="payment-rail-track">
              {[0, 1].map((repeat) => <div className="payment-rail-set" key={repeat} aria-hidden={repeat === 1}>
                {paymentMethods.map((method) => <div className={`payment-method ${method.kind}${method.label === "Bangkok Bank" ? " bangkok-bank" : ""}`} key={`${method.label}-${repeat}`}>
                  <img src={method.logo} alt={repeat === 1 ? "" : `${method.label} official logo`} />
                </div>)}
              </div>)}
            </div>
          </div>
          <p className="payment-rail-disclaimer">Brand names and logos belong to their respective owners. Displayed for payment-path identification only; no affiliation is implied.</p>
        </section>
        </section>

        <section className="service-section" id="services">
          <div className="section-top-payout"><div><p className="payout-eyebrow">WHAT WE HELP WITH</p><h2>Four real problems.<br /><em>One clear place to start.</em></h2></div><p>Designed around the questions that delay online income—not around generic “digital services.”</p></div>
          <div className="service-grid-payout">
            {services.map(({ id, icon: Icon, title, subtitle, state, next, description, accent, caseKey }) => <article className={`payout-service-card ${accent}`} key={title}>
              <div className="service-card-head"><span>{id}</span><p>ROUTE / {state}</p><Icon size={20} strokeWidth={1.65} /></div><i className="service-route" /><p className="service-subtitle">{subtitle}</p><h3>{title}</h3><p className="service-description">{description}</p><p className="service-next"><span>Next check</span>{next}</p><div className="service-file-end"><span>CASE READY</span><div className="service-card-actions"><button onClick={() => chooseService(title)}>Open route <ArrowUpRight size={16} /></button><Link className="service-payment-link" href={`/payment?service=${caseKey}`}>Pay for this service <ArrowUpRight size={15} /></Link></div></div>
            </article>)}
          </div>
        </section>

        <section className="case-section" id="start">
          <div className="case-intro"><p className="payout-eyebrow"><span /> START A CASE</p><h2>What are you<br />trying to <em>unlock?</em></h2><p>Choose the closest path. This does not promise an outcome; it gives your situation a clean place to begin.</p></div>
          <div className="case-chooser"><div className="case-choice-grid">{services.map(({ title, id, icon: Icon }) => <button key={title} className={selectedService === title ? "selected" : ""} onClick={() => setSelectedService(title)}><span>{id}</span><Icon size={18} /><strong>{title}</strong><i><Check size={14} /></i></button>)}</div><div className="case-selection"><p>YOUR STARTING POINT</p><h3>{selectedService}</h3><p>We will first help organize the requirement, the documents or settings involved, and your next legitimate action.</p><button className="navy-button" onClick={() => setCaseDialogOpen(true)}>Continue with this case <ArrowUpRight size={17} /></button></div></div>
        </section>

        <section className="how-section" id="how">
          <div className="how-header"><p className="payout-eyebrow">HOW A CASE MOVES</p><h2>Less guessing.<br />More <em>visible progress.</em></h2></div>
          <div className="how-steps">{steps.map(([num, title, description]) => <article key={num}><span>{num}</span><i /><h3>{title}</h3><p>{description}</p></article>)}</div>
        </section>

        <section className="trust-section" id="trust">
          <div className="trust-statement"><p className="payout-eyebrow light"><span /> TRUST IS PART OF THE SERVICE</p><h2>A good path is<br />never a <em>risky shortcut.</em></h2><p>We help customers understand legitimate platform requirements and prepare real information. We do not create false documents, bypass verification, impersonate users, or promise approvals.</p><button onClick={() => scrollTo("#faq")}>Read the support rules <ArrowDownRight size={17} /></button></div>
          <div className="trust-list"><article><ShieldCheck size={25} /><h3>Legitimate use</h3><p>Every recommendation starts from platform rules and genuine account information.</p></article><article><FileCheck2 size={25} /><h3>Clear preparation</h3><p>Know which documents and settings matter before you spend more time.</p></article><article><MessageCircleMore size={25} /><h3>Plain-language support</h3><p>Understand the next move without technical filler or vague claims.</p></article></div>
        </section>

        <section className="faq-section" id="faq"><div className="faq-title"><p className="payout-eyebrow">HELP, WITHOUT THE FILLER</p><h2>Before you<br />start a case.</h2><CircleHelp size={34} /></div><div className="faq-list">{faqs.map(([question, answer]) => <details key={question}><summary>{question}<ChevronDown size={18} /></summary><p>{answer}</p></details>)}</div></section>

        <section className="contact-panel"><div><p className="payout-eyebrow light">READY WHEN THE ISSUE IS REAL</p><h2>Bring the platform.<br />We’ll map the <em>next move.</em></h2></div><div><p>Start with one situation, not a long form. We will help make the route clearer.</p><button onClick={() => scrollTo("#start")}>Start a support case <ArrowUpRight size={18} /></button></div></section>
      </main>
      <CaseIntakeDialog open={caseDialogOpen} serviceKey={selectedServiceRecord.caseKey as CaseServiceKey} serviceLabel={selectedServiceRecord.title} onClose={() => setCaseDialogOpen(false)} />

      <footer className="payout-footer"><div className="footer-logo-line"><a href="#top" className="payout-brand" onClick={() => scrollTo("#top")}><img src={logo} alt="CreatorHubPlus Payout Bridge logo" /><span>creatorhub<span>plus</span></span></a><p>Creator earnings, payouts and setup support for Myanmar.</p></div><div className="footer-columns"><div><b>START HERE</b><a href="#services" onClick={() => scrollTo("#services")}>Services</a><a href="#start" onClick={() => scrollTo("#start")}>Start a case</a><a href="#how" onClick={() => scrollTo("#how")}>How it works</a></div><div><b>SUPPORT RULES</b><a href="#trust" onClick={() => scrollTo("#trust")}>Trust & rules</a><a href="#faq" onClick={() => scrollTo("#faq")}>Questions</a><a href="/privacy">Privacy Policy</a><a href="/terms">Terms of Service</a><button onClick={openCookiePreferences}>Manage Cookie Settings</button></div><div className="footer-note"><Sparkles size={17} /><p>Clear work is more valuable than fast promises.</p></div></div><div className="footer-base"><span>© 2026 CreatorHubPlus</span><span>Not affiliated with third-party platforms.</span></div></footer>
    </div>
  );
}
