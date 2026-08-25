/**
 * CreatorHubPlus — Soft Studio Ledger
 * Reference fidelity: airy editorial hierarchy, fine rules, restrained cards, CreatorHub Teal branding.
 */
import { useEffect, useState } from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  BriefcaseBusiness,
  ChevronRight,
  CircleDollarSign,
  Code2,
  FilePenLine,
  Lightbulb,
  Menu,
  Moon,
  PanelsTopLeft,
  Play,
  Rocket,
  Sparkles,
  Sun,
  X,
} from "lucide-react";
import { toast } from "sonner";

const heroImage = "/manus-storage/creatorhubplus-hero_2268abf4.png";
const growthImage = "/manus-storage/creatorhubplus-focus-growth_0e5e08a8.png";
const systemsImage = "/manus-storage/creatorhubplus-focus-systems_a6161c93.png";
const productsImage = "/manus-storage/creatorhubplus-focus-products_6035c521.png";
const logoImage = "/manus-storage/creatorhubplus-logo_7f1457fc.png";

const navItems = [
  ["Home", "#top"],
  ["Services", "#services"],
  ["Library", "#library"],
  ["Notes", "#notes"],
  ["Workflows", "#workflows"],
  ["Hub", "#hub"],
  ["Contact", "#contact"],
] as const;

const skills = [
  {
    number: "01",
    icon: Rocket,
    title: "Audience growth",
    description: "Publishing rhythms and channel signals that make good work easier to find.",
  },
  {
    number: "02",
    icon: CircleDollarSign,
    title: "Revenue systems",
    description: "Clear offers, product paths, and pricing that feel right for your audience.",
  },
  {
    number: "03",
    icon: FilePenLine,
    title: "Content planning",
    description: "A useful point of view, a realistic cadence, and fewer blank-page moments.",
  },
  {
    number: "04",
    icon: PanelsTopLeft,
    title: "Digital products",
    description: "Small, practical assets that turn expertise into a helpful next step.",
  },
  {
    number: "05",
    icon: BriefcaseBusiness,
    title: "Creator operations",
    description: "Behind-the-scenes structures that keep a growing creative practice calm.",
  },
  {
    number: "06",
    icon: Code2,
    title: "Tool selection",
    description: "A lean stack, sensible handoffs, and less time wrestling with software.",
  },
];

const workflows = [
  {
    eyebrow: "GROWTH",
    title: "The publishing signal",
    description: "Turn a loose collection of ideas into a useful, repeatable editorial rhythm.",
    image: growthImage,
  },
  {
    eyebrow: "SYSTEMS",
    title: "The creator playbook",
    description: "Put the decisions, templates, and handoffs in one place your team can use.",
    image: systemsImage,
  },
  {
    eyebrow: "PRODUCTS",
    title: "The offer shelf",
    description: "Design a collection of small digital products that fit your real expertise.",
    image: productsImage,
  },
];

const services = [
  {
    code: "S/01",
    title: "Creator direction",
    note: "One focused engagement to clarify positioning, priorities, and the next quarter of work.",
    detail: "Strategy sprint",
  },
  {
    code: "S/02",
    title: "Publishing system",
    note: "A practical operating system for planning, producing, repurposing, and learning from content.",
    detail: "Built around your cadence",
  },
  {
    code: "S/03",
    title: "Digital offer lab",
    note: "From a rough idea to a clear product shape, launch path, and message people understand.",
    detail: "Product development",
  },
];

const studioLinks = [
  ["Template library", "Ready-to-adapt planning tools and frameworks.", "#library"],
  ["Open office", "Small group sessions for practical problem-solving.", "#contact"],
  ["Creator notes", "Short field notes on thoughtful independent work.", "#notes"],
  ["The toolkit", "A deliberately small stack for the work behind the work.", "#hub"],
] as const;

function scrollToSection(target: string) {
  document.querySelector(target)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export default function Home() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [nightMode, setNightMode] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 14);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const goTo = (target: string) => {
    setMenuOpen(false);
    window.setTimeout(() => scrollToSection(target), 90);
  };

  return (
    <div className={`site-shell${nightMode ? " night-mode" : ""}`} id="top">
      <header className={`site-header${scrolled ? " is-scrolled" : ""}`}>
        <a className="brand-lockup" href="#top" aria-label="creatorhubplus 首页" onClick={() => goTo("#top")}>
          <img src={logoImage} alt="CreatorHubPlus 双环标志" className="brand-mark" />
          <span>creatorhubplus</span>
        </a>

        <nav className="desktop-nav" aria-label="主导航">
          {navItems.map(([label, href]) => (
            <a href={href} key={label} onClick={() => goTo(href)}>{label}</a>
          ))}
        </nav>

        <div className="header-actions">
          <button
            className="theme-toggle"
            onClick={() => setNightMode((value) => !value)}
            aria-label={nightMode ? "切换到浅色模式" : "切换到深色模式"}
          >
            {nightMode ? <Sun size={15} /> : <Moon size={15} />}
          </button>
          <button className="sign-in" onClick={() => toast("会员空间正在规划中，可先联系我们讨论需求。")}>Sign in</button>
          <button className="menu-button" aria-label="打开导航" onClick={() => setMenuOpen((value) => !value)}>
            {menuOpen ? <X size={19} /> : <Menu size={20} />}
          </button>
        </div>

        {menuOpen && (
          <div className="mobile-menu">
            {navItems.map(([label, href], index) => (
              <button key={label} style={{ transitionDelay: `${index * 35}ms` }} onClick={() => goTo(href)}>
                <span>{String(index + 1).padStart(2, "0")}</span>{label}<ArrowUpRight size={16} />
              </button>
            ))}
          </div>
        )}
      </header>

      <main>
        <section className="hero-section" aria-labelledby="hero-heading">
          <div className="hero-orb hero-orb-one" />
          <div className="hero-orb hero-orb-two" />
          <img className="hero-art" src={heroImage} alt="CreatorHubPlus 创作者工作室抽象主视觉" />
          <div className="hero-copy reveal-up">
            <p className="eyebrow"><span /> CREATOR OPERATIONS STUDIO</p>
            <p className="hero-brand">creatorhubplus</p>
            <h1 id="hero-heading">Build the work<br />behind your work.</h1>
            <p className="hero-intro">We help independent creators make their next move more deliberate—from content systems to digital offers and the operations in between.</p>
            <div className="hero-buttons">
              <button className="primary-cta" onClick={() => goTo("#contact")}>Work with us <ArrowUpRight size={17} /></button>
              <button className="text-cta" onClick={() => goTo("#workflows")}>See the system <span className="circle-arrow"><ArrowDownRight size={15} /></span></button>
            </div>
          </div>
          <div className="hero-index" aria-hidden="true"><span>01</span><i /><span>06</span></div>
        </section>

        <div className="ticker-wrap" aria-label="CreatorHubPlus 专业能力">
          <div className="ticker-track">
            {["Audience growth", "Revenue systems", "Content planning", "Digital products", "Creator operations", "Tool selection", "Audience growth", "Revenue systems", "Content planning", "Digital products", "Creator operations", "Tool selection"].map((item, index) => (
              <span key={`${item}-${index}`}>{item}<b>✦</b></span>
            ))}
          </div>
        </div>

        <section className="skills-section" id="services" aria-labelledby="skills-heading">
          <div className="section-heading row-heading reveal-up">
            <div>
              <p className="eyebrow">WHAT WE DO</p>
              <h2 id="skills-heading">Skills used on<br />real work.</h2>
            </div>
            <p className="section-aside">A small studio for people building a practice with more intention.</p>
          </div>
          <div className="skills-grid">
            {skills.map(({ number, icon: Icon, title, description }, index) => (
              <article className="skill-card reveal-up" style={{ animationDelay: `${index * 45}ms` }} key={title}>
                <div className="skill-card-top"><span>{number}</span><Icon size={19} strokeWidth={1.45} /></div>
                <h3>{title}</h3>
                <p>{description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="workflows-section" id="workflows" aria-labelledby="workflows-heading">
          <div className="section-heading row-heading reveal-up">
            <div>
              <p className="eyebrow">WORKING FLOWS</p>
              <h2 id="workflows-heading">Make the next<br />chapter usable.</h2>
            </div>
            <button className="section-link" onClick={() => goTo("#contact")}>Explore a build <ArrowUpRight size={16} /></button>
          </div>
          <div className="workflow-grid">
            {workflows.map(({ eyebrow, title, description, image }, index) => (
              <article className={`workflow-card workflow-${index + 1} reveal-up`} key={title}>
                <img src={image} alt="" />
                <div className="workflow-overlay" />
                <div className="workflow-content">
                  <p>{eyebrow}</p>
                  <h3>{title}</h3>
                  <span>{description}</span>
                  <button aria-label={`查看 ${title}`} onClick={() => toast("这一工作流可以在合作咨询中进一步展开。")}><ArrowUpRight size={18} /></button>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="services-section" id="library" aria-labelledby="service-heading">
          <div className="section-heading reveal-up">
            <p className="eyebrow">HIRE THE STUDIO</p>
            <h2 id="service-heading">Services with<br />a clear next step.</h2>
          </div>
          <div className="service-list">
            {services.map((service, index) => (
              <article className="service-row reveal-up" key={service.code} style={{ animationDelay: `${index * 55}ms` }}>
                <span className="service-code">{service.code}</span>
                <div><h3>{service.title}</h3><p>{service.note}</p></div>
                <div className="service-end"><span>{service.detail}</span><button onClick={() => goTo("#contact")} aria-label={`咨询${service.title}`}><ArrowUpRight size={19} /></button></div>
              </article>
            ))}
          </div>
        </section>

        <section className="studio-section" id="hub" aria-labelledby="studio-heading">
          <div className="section-heading row-heading reveal-up">
            <div>
              <p className="eyebrow">ALSO IN THE HUB</p>
              <h2 id="studio-heading">A few useful<br />places to land.</h2>
            </div>
            <span className="section-count">04 / 04</span>
          </div>
          <div className="studio-grid">
            {studioLinks.map(([title, detail, href], index) => (
              <a href={href} key={title} className="studio-card reveal-up" style={{ animationDelay: `${index * 45}ms` }} onClick={() => goTo(href)}>
                <div><span className="studio-number">0{index + 1}</span><ArrowUpRight size={18} /></div>
                <h3>{title}</h3>
                <p>{detail}</p>
                <span className="open-label">Open <ChevronRight size={14} /></span>
              </a>
            ))}
          </div>
        </section>

        <section className="notes-section" id="notes" aria-labelledby="notes-heading">
          <div className="notes-panel reveal-up">
            <div className="notes-glow" />
            <p className="eyebrow light-eyebrow">FROM THE NOTES</p>
            <h2 id="notes-heading">A clearer practice<br />is a kinder one.</h2>
            <p>Short, useful observations on creator work, growth systems, and keeping the work sustainable.</p>
            <button onClick={() => toast("Creator notes 正在编辑中，稍后将开放订阅。")}>Read the notes <ArrowUpRight size={17} /></button>
          </div>
        </section>

        <section className="contact-section" id="contact" aria-labelledby="contact-heading">
          <div className="contact-copy reveal-up">
            <p className="eyebrow">LET’S TALK</p>
            <h2 id="contact-heading">Bring the work<br />you want to move.</h2>
            <p>Tell us where you are, what is getting complicated, and what a useful next chapter could look like.</p>
            <a href="mailto:hello@creatorhubplus.com" className="contact-button">Start a conversation <ArrowUpRight size={18} /></a>
          </div>
          <div className="contact-side reveal-up">
            <div className="contact-ring"><img src={logoImage} alt="" /></div>
            <span>Independent creator<br />operations, considered.</span>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="footer-top">
          <a className="brand-lockup footer-brand" href="#top" onClick={() => goTo("#top")}>
            <img src={logoImage} alt="CreatorHubPlus 双环标志" className="brand-mark" />
            <span>creatorhubplus</span>
          </a>
          <p>A creator operations studio for intentional independent work.</p>
          <a className="footer-mail" href="mailto:hello@creatorhubplus.com">hello@creatorhubplus.com <ArrowUpRight size={15} /></a>
        </div>
        <div className="footer-grid">
          <div><p className="footer-label">QUICK LINKS</p>{navItems.slice(0, 5).map(([label, href]) => <a href={href} key={label} onClick={() => goTo(href)}>{label}</a>)}</div>
          <div><p className="footer-label">STUDIO</p><a href="#services" onClick={() => goTo("#services")}>Services</a><a href="#workflows" onClick={() => goTo("#workflows")}>Workflows</a><a href="#hub" onClick={() => goTo("#hub")}>Toolkit</a><a href="#notes" onClick={() => goTo("#notes")}>Notes</a></div>
          <div><p className="footer-label">DETAILS</p><button onClick={() => toast("服务条款将在正式发布前配置。")}>Terms of use</button><button onClick={() => toast("隐私说明将在正式发布前配置。")}>Privacy</button><button onClick={() => toast("合作范围可通过邮件进一步确认。")}>Working together</button></div>
          <div className="footer-idea"><Lightbulb size={20} /><p>Good systems make more room for the part only you can do.</p></div>
        </div>
        <div className="footer-bottom"><span>© 2026 creatorhubplus. All rights reserved.</span><span>Built for clearer creative work.</span></div>
      </footer>
    </div>
  );
}
