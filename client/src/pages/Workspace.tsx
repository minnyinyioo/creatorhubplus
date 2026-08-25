/**
 * CreatorHubPlus — Working Surface
 * Product direction: editorial operating canvas, one dominant task, quiet context rails, no SaaS card wall.
 */
import { useMemo, useState } from "react";
import { Link } from "wouter";
import {
  ArrowUpRight,
  Bell,
  BookOpen,
  ChevronDown,
  CirclePlus,
  Clock3,
  Command,
  FolderKanban,
  GripVertical,
  LayoutList,
  LibraryBig,
  Menu,
  MoreHorizontal,
  Play,
  Search,
  Sparkles,
  Target,
  WandSparkles,
} from "lucide-react";
import { toast } from "sonner";

const atmosphereImage = "/manus-storage/creatorhubplus-app-atmosphere_6fb8d4c8.png";

type ViewKey = "Today" | "Orbit" | "Rhythm" | "Offers";

const views: Array<{ label: ViewKey; icon: typeof LayoutList }> = [
  { label: "Today", icon: LayoutList },
  { label: "Orbit", icon: Target },
  { label: "Rhythm", icon: Play },
  { label: "Offers", icon: LibraryBig },
];

const viewContent: Record<ViewKey, { kicker: string; title: string; focus: string; progress: string; items: string[] }> = {
  Today: {
    kicker: "SATURDAY / A QUIET START",
    title: "Only one move\nneeds your full attention.",
    focus: "Shape the opening for “The small offer”",
    progress: "02 / 05 MOVES PLACED",
    items: ["Read the two audience replies", "Cut the lesson outline to three parts", "Name the first downloadable asset"],
  },
  Orbit: {
    kicker: "PROJECT ORBIT / IN MOTION",
    title: "A project is a\nset of returning decisions.",
    focus: "Move “The small offer” from shape to share",
    progress: "03 / 06 STAGES IN VIEW",
    items: ["Confirm the offer boundary", "Draft the preview page", "Choose one channel for first release"],
  },
  Rhythm: {
    kicker: "PUBLISHING RHYTHM / THIS WEEK",
    title: "Let the work keep\na beat you can live with.",
    focus: "Prepare the Thursday field note",
    progress: "03 / 04 PUBLISHING POINTS",
    items: ["Pull the source note", "Add one useful example", "Set the re-use path"],
  },
  Offers: {
    kicker: "OFFER SHELF / NEXT RELEASE",
    title: "Give your expertise\na useful shape.",
    focus: "Finish the first edition of the Studio Pack",
    progress: "01 / 03 OFFER PIECES READY",
    items: ["Name the collection", "Place the first template", "Write the one-sentence promise"],
  },
};

export default function Workspace() {
  const [activeView, setActiveView] = useState<ViewKey>("Today");
  const [focusMode, setFocusMode] = useState(false);
  const [railOpen, setRailOpen] = useState(false);
  const content = useMemo(() => viewContent[activeView], [activeView]);

  const chooseView = (view: ViewKey) => {
    setActiveView(view);
    setRailOpen(false);
  };

  return (
    <div className={`working-surface${focusMode ? " focus-mode" : ""}`}>
      <aside className={`app-rail${railOpen ? " rail-open" : ""}`} aria-label="App 主导航">
        <div className="app-rail-brand">
          <Link href="/" className="orbit-mark" aria-label="返回 CreatorHubPlus 首页"><img src="/favicon.svg" alt="" /></Link>
          <button className="rail-collapse" onClick={() => setRailOpen(false)} aria-label="关闭导航"><Menu size={18} /></button>
        </div>
        <div className="rail-workspace"><span className="mini-avatar">M</span><div><strong>My studio</strong><small>Personal space</small></div><ChevronDown size={14} /></div>
        <nav className="rail-nav">
          <p>WORKING VIEW</p>
          {views.map(({ label, icon: Icon }) => (
            <button key={label} className={activeView === label ? "active" : ""} onClick={() => chooseView(label)}>
              <Icon size={16} strokeWidth={1.7} /><span>{label}</span>{activeView === label && <i />}
            </button>
          ))}
          <p className="rail-label-gap">RECORD</p>
          <button onClick={() => toast("Archive 会在项目阶段完成后自动收纳记录。")}><BookOpen size={16} strokeWidth={1.7} /><span>Archive</span></button>
          <button onClick={() => toast("Library 将集中放置可复用的模板与资产。")}><LibraryBig size={16} strokeWidth={1.7} /><span>Library</span></button>
        </nav>
        <div className="rail-bottom"><button onClick={() => toast("快捷搜索已准备就绪。")}> <Search size={15} /> Search <kbd>⌘ K</kbd></button><Link href="/">Back to studio <ArrowUpRight size={14} /></Link></div>
      </aside>

      <div className="app-stage">
        <header className="app-topbar">
          <button className="app-menu" onClick={() => setRailOpen((value) => !value)} aria-label="打开导航"><Menu size={19} /></button>
          <div className="app-crumb"><span>CreatorHubPlus</span><i /> <strong>{activeView}</strong></div>
          <div className="app-top-actions"><button aria-label="通知" onClick={() => toast("今天没有新的需要回应的项目更新。")}><Bell size={17} /></button><button className="avatar-button" onClick={() => toast("个人设置将在帐户接入后可用。")}>M</button></div>
        </header>

        <main className="app-main-canvas">
          <section className="app-intro">
            <p className="app-kicker">{content.kicker}</p>
            <h1>{content.title.split("\n").map((line) => <span key={line}>{line}</span>)}</h1>
            <div className="app-intro-meta"><span className="live-dot" /> A living workspace, not another dashboard.</div>
          </section>

          <section className="focus-field" aria-labelledby="focus-heading">
            <div className="focus-field-top"><p id="focus-heading">YOUR NEXT MOVE</p><button onClick={() => setFocusMode((value) => !value)}>{focusMode ? "Exit focus" : "Enter focus"}<Target size={15} /></button></div>
            <div className="focus-field-core">
              <div className="focus-index"><span>01</span><i /><span>NOW</span></div>
              <h2>{content.focus}</h2>
              <div className="focus-tags"><span><FolderKanban size={14} />The small offer</span><span><Clock3 size={14} />50 min</span></div>
              <div className="focus-field-actions"><button className="start-focus" onClick={() => toast("Focus timer will start when tasks are connected.")}><Play size={15} fill="currentColor" /> Begin a focused session</button><button className="more-focus" onClick={() => toast("下一步可以拆成更小的动作。")}>More <MoreHorizontal size={18} /></button></div>
            </div>
            <img className="field-atmosphere" src={atmosphereImage} alt="" />
          </section>

          <section className="movement-list" aria-labelledby="movement-heading">
            <div className="movement-list-head"><div><p className="app-kicker">IN THE SAME ORBIT</p><h2 id="movement-heading">Small moves keep<br />the work in motion.</h2></div><span>{content.progress}</span></div>
            <div className="movement-rows">
              {content.items.map((item, index) => (
                <button className="movement-row" key={item} onClick={() => toast(`已将「${item}」放入焦点队列。`)}>
                  <span className="row-number">0{index + 2}</span><GripVertical size={15} className="row-grip" /><span className="row-title">{item}</span><span className="row-time">{["12 min", "25 min", "18 min"][index]}</span><CirclePlus size={18} />
                </button>
              ))}
            </div>
            <button className="add-move" onClick={() => toast("新的下一步将出现在这条工作轨道中。")}><CirclePlus size={17} /> Add a small move</button>
          </section>
        </main>
      </div>

      <aside className="app-context" aria-label="工作上下文">
        <div className="context-section context-name"><p>IN CONTEXT</p><h2>The small<br />offer</h2><span>EARLY SHAPING</span></div>
        <div className="context-section orbit-diagram"><div className="orbit-line orbit-one" /><div className="orbit-line orbit-two" /><div className="orbit-node now">NOW</div><div className="orbit-node done">01</div><div className="orbit-node next">03</div><span>Project orbit</span></div>
        <div className="context-section context-note"><div><Sparkles size={15} /><p>FIELD NOTE</p></div><blockquote>“A smaller offer is easier to understand, make, and improve.”</blockquote><button onClick={() => toast("Field notes keep useful decisions attached to the work.")}>Open note <ArrowUpRight size={14} /></button></div>
        <div className="context-section context-footer"><button onClick={() => toast("Project settings will hold ownership, due dates and sharing controls.")}><Command size={15} /> Project settings</button><button onClick={() => toast("No automation is running for this work yet.")}><WandSparkles size={15} /> Add a simple rule</button></div>
      </aside>
    </div>
  );
}
