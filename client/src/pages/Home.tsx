/**
 * CreatorHubPlus — Payout Bridge
 * Brand direction: trusted Myanmar-first platform support, warm editorial clarity, visible service pathways.
 */
import { useState } from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  BadgeCheck,
  Check,
  ChevronDown,
  CircleDollarSign,
  CircleHelp,
  FileCheck2,
  Landmark,
  Languages,
  MapPinned,
  Menu,
  MessageCircleMore,
  MousePointerClick,
  Play,
  ShieldCheck,
  Sparkles,
  WalletCards,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { siFacebook, siPaypal, siTiktok, siYoutube, type SimpleIcon } from "simple-icons";

const logo = "/favicon.svg";

const services = [
  {
    id: "01",
    icon: CircleDollarSign,
    title: "Platform earnings",
    subtitle: "创收准备与问题梳理",
    description: "为内容创作者与线上商家整理变现条件、账户状态、资料清单与下一步处理路径。",
    accent: "blue",
  },
  {
    id: "02",
    icon: WalletCards,
    title: "Payout & receiving",
    subtitle: "收款路径与提现协助",
    description: "厘清跨平台收款所需的信息、可用路径和待处理事项，让每一步都有记录。",
    accent: "orange",
  },
  {
    id: "03",
    icon: FileCheck2,
    title: "Account setup",
    subtitle: "账户设置与异常排查",
    description: "从新账户设置到已有问题的排查，提供符合平台规则的检查清单与操作指引。",
    accent: "green",
  },
  {
    id: "04",
    icon: MapPinned,
    title: "Address support",
    subtitle: "认证地址准备支持",
    description: "帮助理解平台对认证地址的要求，并准备合规、真实、可核验的资料路径。",
    accent: "blue",
  },
];

const platformItems = [
  { label: "Facebook", icon: siFacebook },
  { label: "YouTube", icon: siYoutube },
  { label: "TikTok", icon: siTiktok },
  { label: "PayPal", icon: siPaypal },
];

const paymentMethods = [
  { label: "KBZ Pay", logo: "/manus-storage/kbzpay_b6275ce0.webp", kind: "wallet" },
  { label: "Wave Pay", logo: "/manus-storage/wavepay-appicon_9c7e244e.jpg", kind: "wallet" },
  { label: "AYA Pay", logo: "/manus-storage/ayapay_385dc148.png", kind: "wallet" },
  { label: "KBZ Bank", logo: "/manus-storage/kbzbank_ccd3a1fa.png", kind: "bank" },
  { label: "AYA Bank", logo: "/manus-storage/ayabank_d9d29f1d.png", kind: "bank" },
  { label: "Bangkok Bank", logo: "/manus-storage/bangkokbank-official_ebc198ff.svg", kind: "bank" },
  { label: "KASIKORNBANK", logo: "/manus-storage/kasikornbank-official_5108252c.png", kind: "bank" },
];

function BrandGlyph({ icon, className }: { icon: SimpleIcon; className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" aria-hidden="true"><path d={icon.path} fill="currentColor" /></svg>;
}

const steps = [
  ["01", "Tell us the real issue", "选择平台与问题类型，说明你现在卡在哪一步。"],
  ["02", "Get a clean path", "得到清晰的资料清单、注意事项和推荐的下一行动。"],
  ["03", "Keep the case visible", "将处理进度留在同一条路径里，方便回看与继续推进。"],
];

const faqs = [
  ["Can you guarantee platform approval?", "不能。任何平台的审批都由平台自行决定。我们做的是帮助你理解要求、准备真实资料，并减少可避免的设置错误。"],
  ["Do you provide fake documents or verification bypasses?", "不提供。CreatorHubPlus 只支持合法、真实和可核验的资料准备，不制作虚假身份或地址资料，也不协助绕过平台规则。"],
  ["Which platforms can a case start with?", "可以从常见的内容与收款平台开始。先提交实际问题；若不在当前服务范围，我们会明确说明，而不是给出含糊承诺。"],
  ["What should I prepare before asking for help?", "准备平台名称、目前页面状态、报错截图（注意遮住敏感信息）以及已尝试过的步骤即可。"],
];

function scrollTo(target: string) {
  document.querySelector(target)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedService, setSelectedService] = useState("Platform earnings");

  const chooseService = (service: string) => {
    setSelectedService(service);
    scrollTo("#start");
  };

  return (
    <div className="payout-site" id="top">
      <header className="payout-header">
        <a href="#top" className="payout-brand" onClick={() => scrollTo("#top")}>
          <img src={logo} alt="CreatorHubPlus Payout Bridge 标志" />
          <span>creatorhub<span>plus</span></span>
        </a>
        <nav className="payout-nav" aria-label="主导航">
          <a href="#services" onClick={() => scrollTo("#services")}>Services</a>
          <a href="#how" onClick={() => scrollTo("#how")}>How it works</a>
          <a href="#trust" onClick={() => scrollTo("#trust")}>Trust & rules</a>
          <a href="#faq" onClick={() => scrollTo("#faq")}>Help</a>
        </nav>
        <div className="payout-actions">
          <button className="language-switch" onClick={() => toast("မြန်မာဘာသာ版本正在整理中。")}> <Languages size={15} /> မြန်မာ</button>
          <button className="header-cta" onClick={() => scrollTo("#start")}>Start a case <ArrowUpRight size={15} /></button>
          <button className="payout-menu" aria-label="打开导航" onClick={() => setMenuOpen((open) => !open)}>{menuOpen ? <X size={19} /> : <Menu size={20} />}</button>
        </div>
        {menuOpen && <div className="payout-mobile-menu">
          {[["Services", "#services"], ["How it works", "#how"], ["Trust & rules", "#trust"], ["Help", "#faq"]].map(([label, target]) => <button key={label} onClick={() => { setMenuOpen(false); scrollTo(target); }}>{label}<ArrowUpRight size={17} /></button>)}
        </div>}
      </header>

      <main>
        <section className="payout-hero">
          <div className="hero-copy-payout">
            <p className="payout-eyebrow"><span /> MYANMAR CREATOR & BUSINESS SUPPORT</p>
            <p className="burmese-kicker">မြန်မာ Creator များအတွက်</p>
            <h1>Earn online.<br /><em>Get paid.</em><br />Stay set up.</h1>
            <p className="hero-detail">CreatorHubPlus helps Myanmar creators and online businesses navigate earnings, payouts, account setup, and verified address requirements—one clear case at a time.</p>
            <div className="hero-ctas"><button className="coral-button" onClick={() => scrollTo("#start")}>Tell us your issue <ArrowUpRight size={17} /></button><button className="quiet-button" onClick={() => scrollTo("#services")}>See services <ArrowDownRight size={17} /></button></div>
            <p className="hero-rule"><ShieldCheck size={15} /> Clear support for legitimate platform use. No false documents. No shortcuts.</p>
          </div>
          <div className="payout-map" aria-label="平台到收款路径示意">
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

        <section className="platform-strip" aria-label="支持的常见平台">
          <span>COMMON STARTING POINTS</span>{platformItems.map(({ label, icon }) => <b key={label}><BrandGlyph icon={icon} />{label}</b>)}<i>Not affiliated with listed platforms.</i>
        </section>

        <section className="payment-methods-rail" aria-label="可接受的本地钱包和银行方式">
          <div className="payment-rail-intro"><p>ACCEPTED PAYMENT METHODS</p><span>Wallets & banks used in case planning</span></div>
          <div className="payment-rail-window">
            <div className="payment-rail-track">
              {paymentMethods.map((method) => <div className={`payment-method ${method.kind}`} key={method.label}>
                <img src={method.logo} alt={`${method.label} official logo`} />
              </div>)}
            </div>
          </div>
          <p className="payment-rail-disclaimer">Brand names and logos belong to their respective owners. Displayed for payment-path identification only; no affiliation is implied.</p>
        </section>

        <section className="service-section" id="services">
          <div className="section-top-payout"><div><p className="payout-eyebrow">WHAT WE HELP WITH</p><h2>Four real problems.<br /><em>One clear place to start.</em></h2></div><p>Designed around the questions that delay online income—not around generic “digital services.”</p></div>
          <div className="service-grid-payout">
            {services.map(({ id, icon: Icon, title, subtitle, description, accent }) => <article className={`payout-service-card ${accent}`} key={title}>
              <div className="service-card-head"><span>{id}</span><Icon size={22} strokeWidth={1.6} /></div><i className="service-route" /><p className="service-subtitle">{subtitle}</p><h3>{title}</h3><p className="service-description">{description}</p><button onClick={() => chooseService(title)}>Start with this <ArrowUpRight size={16} /></button>
            </article>)}
          </div>
        </section>

        <section className="case-section" id="start">
          <div className="case-intro"><p className="payout-eyebrow"><span /> START A CASE</p><h2>What are you<br />trying to <em>unlock?</em></h2><p>Choose the closest path. This does not promise an outcome; it gives your situation a clean place to begin.</p></div>
          <div className="case-chooser"><div className="case-choice-grid">{services.map(({ title, id, icon: Icon }) => <button key={title} className={selectedService === title ? "selected" : ""} onClick={() => setSelectedService(title)}><span>{id}</span><Icon size={18} /><strong>{title}</strong><i><Check size={14} /></i></button>)}</div><div className="case-selection"><p>YOUR STARTING POINT</p><h3>{selectedService}</h3><p>We will first help organize the requirement, the documents or settings involved, and your next legitimate action.</p><button className="navy-button" onClick={() => toast("Case intake form is ready for connection. Next, we can add Telegram, WhatsApp, Messenger or a secure form.")}>Continue with this case <ArrowUpRight size={17} /></button></div></div>
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

      <footer className="payout-footer"><div className="footer-logo-line"><a href="#top" className="payout-brand" onClick={() => scrollTo("#top")}><img src={logo} alt="CreatorHubPlus Payout Bridge 标志" /><span>creatorhub<span>plus</span></span></a><p>Creator earnings, payouts and setup support for Myanmar.</p></div><div className="footer-columns"><div><b>START HERE</b><a href="#services" onClick={() => scrollTo("#services")}>Services</a><a href="#start" onClick={() => scrollTo("#start")}>Start a case</a><a href="#how" onClick={() => scrollTo("#how")}>How it works</a></div><div><b>SUPPORT RULES</b><a href="#trust" onClick={() => scrollTo("#trust")}>Trust & rules</a><a href="#faq" onClick={() => scrollTo("#faq")}>Questions</a><button onClick={() => toast("Privacy policy can be added before public launch.")}>Privacy</button></div><div className="footer-note"><Sparkles size={17} /><p>Clear work is more valuable than fast promises.</p></div></div><div className="footer-base"><span>© 2026 CreatorHubPlus</span><span>Not affiliated with third-party platforms.</span></div></footer>
    </div>
  );
}
