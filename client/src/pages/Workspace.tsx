/**
 * CreatorHubPlus — Working Surface
 * Product direction: editorial operating canvas, one dominant task, quiet context rails, no SaaS card wall.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "wouter";
import { startLogin } from "@/const";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { CreatorHubPlusLockup } from "@/components/CreatorHubPlusMark";
import {
  Archive as ArchiveIcon,
  ArrowUpRight,
  Bell,
  BookOpen,
  ChevronDown,
  Check,
  CirclePlus,
  Clock3,
  Command,
  FolderKanban,
  GripVertical,
  LayoutList,
  Pencil,
  Trash2,
  X,
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
type DisplayTask = { id: number; title: string; durationMinutes: number; completed: number; timerSeconds: number };

const views: Array<{ label: ViewKey; icon: typeof LayoutList }> = [
  { label: "Today", icon: LayoutList },
  { label: "Orbit", icon: Target },
  { label: "Rhythm", icon: Play },
  { label: "Offers", icon: LibraryBig },
];

export function normalizeTimerSeconds(totalSeconds: number) {
  return Math.max(0, Math.floor(totalSeconds));
}

export function buildTimerUpdateInput(taskId: number, seconds: number) {
  return { id: taskId, timerSeconds: normalizeTimerSeconds(seconds) };
}

export function getTimerResumeSeconds(savedSeconds: number | null | undefined, durationMinutes: number) {
  return savedSeconds ?? durationMinutes * 60;
}

export function formatFocusTime(totalSeconds: number) {
  const safeSeconds = normalizeTimerSeconds(totalSeconds);
  return `${String(Math.floor(safeSeconds / 60)).padStart(2, "0")}:${String(safeSeconds % 60).padStart(2, "0")}`;
}

export function toggleMoveState(moves: string[], item: string) {
  return moves.includes(item) ? moves.filter((move) => move !== item) : [...moves, item];
}

const viewContent: Record<ViewKey, { kicker: string; title: string; focus: string; progress: string; items: string[] }> = {
  Today: {
    kicker: "OPEN CASE / TODAY",
    title: "One case\nneeds a clear next step.",
    focus: "Confirm the active payout route and its required details",
    progress: "02 / 05 CHECKPOINTS COMPLETE",
    items: ["Read the latest case note", "Confirm the required account setting", "Record the next verified action"],
  },
  Orbit: {
    kicker: "CASE LEDGER / ACTIVE ROUTE",
    title: "Keep the route\nvisible and verified.",
    focus: "Move the selected case from review to a verified next action",
    progress: "03 / 06 ROUTE CHECKPOINTS",
    items: ["Confirm the case boundary", "Review the supporting evidence", "Choose the next compliant step"],
  },
  Rhythm: {
    kicker: "FOLLOW-UP WINDOW / THIS WEEK",
    title: "Keep every update\nattached to the case.",
    focus: "Prepare the next follow-up note for the open request",
    progress: "03 / 04 FOLLOW-UPS READY",
    items: ["Review the staff note", "Add one clear clarification", "Set the return path"],
  },
  Offers: {
    kicker: "SERVICE PATHS / AVAILABLE",
    title: "Keep each service\nclear before payment.",
    focus: "Review the selected service path and published payment route",
    progress: "01 / 03 SERVICE CHECKS READY",
    items: ["Confirm the service name", "Review the published price", "Write the next-step note"],
  },
};

export default function Workspace() {
  const [activeView, setActiveView] = useState<ViewKey>("Today");
  const [focusMode, setFocusMode] = useState(false);
  const [railOpen, setRailOpen] = useState(false);
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(50 * 60);
  const [completedMoves, setCompletedMoves] = useState<string[]>([]);
  const [composerOpen, setComposerOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDuration, setNewDuration] = useState("25");
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const { isAuthenticated } = useAuth();
  const taskInput = useMemo(() => ({ viewKey: activeView }), [activeView]);
  const taskQuery = trpc.workspaceTask.list.useQuery(taskInput, { enabled: isAuthenticated, retry: false });
  const settingsQuery = trpc.workspaceSettings.get.useQuery(undefined, { enabled: isAuthenticated, retry: false });
  const utils = trpc.useUtils();
  const createTask = trpc.workspaceTask.create.useMutation({ onSuccess: () => utils.workspaceTask.list.invalidate({ viewKey: activeView }) });
  const updateTask = trpc.workspaceTask.update.useMutation({ onSuccess: () => utils.workspaceTask.list.invalidate({ viewKey: activeView }) });
  const deleteTaskMutation = trpc.workspaceTask.delete.useMutation({ onSuccess: () => utils.workspaceTask.list.invalidate({ viewKey: activeView }) });
  const archiveTaskMutation = trpc.workspaceTask.archive.useMutation({ onSuccess: async () => { await Promise.all([utils.workspaceTask.list.invalidate({ viewKey: activeView }), utils.workspaceTask.listArchived.invalidate()]); toast("Task moved to Archive."); }, onError: (error) => toast(error.message) });
  const content = useMemo(() => viewContent[activeView], [activeView]);
  const tasks: DisplayTask[] = taskQuery.data?.length ? taskQuery.data.map((task) => ({ id: task.id, title: task.title, durationMinutes: task.durationMinutes, completed: task.completed, timerSeconds: task.timerSeconds })) : content.items.map((title, index) => ({ id: -(index + 1), title, durationMinutes: [12, 25, 18][index] ?? 25, completed: completedMoves.includes(title) ? 1 : 0, timerSeconds: [12, 25, 18][index] * 60 }));
  const activeTask = tasks[0];
  const firstServerTask = taskQuery.data?.[0];
  const resumeKey = firstServerTask ? `${firstServerTask.id}:${firstServerTask.timerSeconds}:${firstServerTask.durationMinutes}` : null;
  const resumedViewsRef = useRef<Partial<Record<ViewKey, string>>>({});
  const timerSecondsRef = useRef(timerSeconds);
  const persistTimer = useCallback((seconds: number) => {
    if (!isAuthenticated || !activeTask?.id || activeTask.id < 0) return;
    updateTask.mutate(buildTimerUpdateInput(activeTask.id, seconds));
  }, [activeTask?.id, isAuthenticated, updateTask]);
  const persistTimerRef = useRef(persistTimer);
  const timerLabel = formatFocusTime(timerSeconds);
  const progressLabel = `${String(tasks.filter((task) => task.completed === 1).length).padStart(2, "0")} / ${String(tasks.length).padStart(2, "0")} MOVES COMPLETE`;

  useEffect(() => {
    setTimerRunning(false);
    setTimerSeconds((settingsQuery.data?.focusLengthMinutes ?? 50) * 60);
    setCompletedMoves([]);
    setComposerOpen(false);
    setEditingTaskId(null);
  }, [activeView, settingsQuery.data?.focusLengthMinutes]);

  useEffect(() => {
    timerSecondsRef.current = timerSeconds;
  }, [timerSeconds]);

  useEffect(() => {
    const persistCurrentTimer = () => persistTimer(timerSecondsRef.current);
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") persistCurrentTimer();
    };
    window.addEventListener("pagehide", persistCurrentTimer);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      window.removeEventListener("pagehide", persistCurrentTimer);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [persistTimer]);

  useEffect(() => {
    persistTimerRef.current = persistTimer;
  }, [persistTimer]);

  useEffect(() => {
    return () => persistTimerRef.current(timerSecondsRef.current);
  }, []);

  useEffect(() => {
    if (!firstServerTask || !resumeKey || timerRunning || resumedViewsRef.current[activeView] === resumeKey) return;
    resumedViewsRef.current[activeView] = resumeKey;
    const nextSeconds = getTimerResumeSeconds(firstServerTask.timerSeconds, firstServerTask.durationMinutes);
    setTimerSeconds((currentSeconds) => currentSeconds === nextSeconds ? currentSeconds : nextSeconds);
  }, [activeView, firstServerTask?.durationMinutes, firstServerTask?.id, firstServerTask?.timerSeconds, resumeKey, timerRunning]);

  useEffect(() => {
    if (!timerRunning) return;
    const countdownInterval = window.setInterval(() => {
      setTimerSeconds((seconds) => Math.max(0, seconds - 1));
    }, 1000);
    const persistenceInterval = window.setInterval(() => {
      persistTimer(timerSecondsRef.current);
    }, 15000);
    return () => {
      window.clearInterval(countdownInterval);
      window.clearInterval(persistenceInterval);
    };
  }, [persistTimer, timerRunning]);

  useEffect(() => {
    if (!timerRunning || timerSeconds !== 0) return;
    setTimerRunning(false);
    persistTimer(0);
    toast("Focused session complete. Take a short reset before the next move.");
  }, [persistTimer, timerRunning, timerSeconds]);

  const toggleMove = (task: DisplayTask) => {
    const nextCompleted = task.completed !== 1;
    if (!isAuthenticated || task.id < 0) {
      if (!isAuthenticated) return startLogin();
      setCompletedMoves((moves) => toggleMoveState(moves, task.title));
    } else {
      updateTask.mutate({ id: task.id, completed: nextCompleted });
    }
    toast(nextCompleted ? `已完成「${task.title}」。` : `已将「${task.title}」移回进行中。`);
  };

  const submitNewTask = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isAuthenticated) return startLogin();
    const title = newTitle.trim();
    if (title.length < 2) return toast("任务名称至少需要两个字符。");
    createTask.mutate({ viewKey: activeView, title, durationMinutes: Number(newDuration) || 25 });
    setNewTitle("");
    setNewDuration("25");
    setComposerOpen(false);
  };

  const beginEdit = (task: DisplayTask) => {
    if (!isAuthenticated || task.id < 0) return startLogin();
    setEditingTaskId(task.id);
    setEditingTitle(task.title);
  };

  const saveEdit = (task: DisplayTask) => {
    const title = editingTitle.trim();
    if (title.length < 2) return toast("任务名称至少需要两个字符。");
    updateTask.mutate({ id: task.id, title });
    setEditingTaskId(null);
  };

  const toggleTimer = () => {
    if (!isAuthenticated) return startLogin();
    if (timerRunning) persistTimer(timerSeconds);
    if (timerSeconds === 0) setTimerSeconds(activeTask?.durationMinutes ? activeTask.durationMinutes * 60 : (settingsQuery.data?.focusLengthMinutes ?? 50) * 60);
    setTimerRunning((running) => !running);
  };

  const deleteTask = (task: DisplayTask) => {
    if (!isAuthenticated || task.id < 0) return startLogin();
    if (window.confirm(`Delete “${task.title}”?`)) deleteTaskMutation.mutate({ id: task.id });
  };

  const archiveTask = (task: DisplayTask) => {
    if (!isAuthenticated || task.id < 0) return startLogin();
    archiveTaskMutation.mutate({ id: task.id, archived: true });
  };

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
        <div className="rail-workspace"><span className="mini-avatar">M</span><div><strong>{settingsQuery.data?.studioName ?? "My case desk"}</strong><small>Signed-in case workspace</small></div><ChevronDown size={14} /></div>
        <nav className="rail-nav">
          <p>CASE DESK</p>
          {views.map(({ label, icon: Icon }) => (
            <button key={label} className={activeView === label ? "active" : ""} onClick={() => chooseView(label)}>
              <Icon size={16} strokeWidth={1.7} /><span>{label}</span>{activeView === label && <i />}
            </button>
          ))}
          <p className="rail-label-gap">RECORD</p>
          <Link className="rail-link" href="/archive"><BookOpen size={16} strokeWidth={1.7} /><span>Archive</span></Link>
          <Link className="rail-link" href="/library"><LibraryBig size={16} strokeWidth={1.7} /><span>Library</span></Link>
        </nav>
        <div className="rail-bottom"><button onClick={() => toast("快捷搜索已准备就绪。")}> <Search size={15} /> Search <kbd>⌘ K</kbd></button><Link href="/">Back to Payout Bridge <ArrowUpRight size={14} /></Link></div>
      </aside>

      <div className="app-stage">
        <header className="app-topbar">
          <button className="app-menu" onClick={() => setRailOpen((value) => !value)} aria-label="打开导航"><Menu size={19} /></button>
          <div className="app-crumb"><CreatorHubPlusLockup className="workspace-crumb-logo" label="CreatorHubPlus" /><i /> <strong>{activeView}</strong></div>
          <div className="app-top-actions"><button aria-label="通知" onClick={() => toast("今天没有新的需要回应的项目更新。")}><Bell size={17} /></button><button className="avatar-button" onClick={() => toast("个人设置将在帐户接入后可用。")}>M</button></div>
        </header>

        <main className="app-main-canvas">
          <section className="app-intro">
            <p className="app-kicker">{content.kicker}</p>
            <h1>{content.title.split("\n").map((line) => <span key={line}>{line}</span>)}</h1>
            <div className="app-intro-meta"><span className="live-dot" /> A signed-in case ledger for payout, account and verification work.</div>
          </section>

          <section className="focus-field" aria-labelledby="focus-heading">
            <div className="focus-field-top"><p id="focus-heading">NEXT CASE ACTION</p><button onClick={() => setFocusMode((value) => !value)}>{focusMode ? "Exit focus" : "Enter focus"}<Target size={15} /></button></div>
            <div className="focus-field-core">
              <div className="focus-index"><span>01</span><i /><span>NOW</span></div>
              <h2>{content.focus}</h2>
              <div className="focus-tags"><span><FolderKanban size={14} />Active service route</span><span className="focus-timer"><Clock3 size={14} />{timerLabel}</span></div>
              <div className="focus-field-actions"><button className={`start-focus${timerRunning ? " is-running" : ""}`} onClick={toggleTimer}><Play size={15} fill="currentColor" />{timerRunning ? "Pause case timer" : timerSeconds === 0 ? "Restart case timer" : "Begin case review"}</button><button className="more-focus" onClick={() => toast("下一步可以拆成更小的案例检查点。")}>More <MoreHorizontal size={18} /></button></div>
            </div>
            <img className="field-atmosphere" src={atmosphereImage} alt="" />
          </section>

          <section className="movement-list" aria-labelledby="movement-heading">
            <div className="movement-list-head"><div><p className="app-kicker">CASE CHECKPOINTS</p><h2 id="movement-heading">Clear records keep<br />the case moving.</h2></div><span>{progressLabel}</span></div>
            <div className="movement-rows">
              {tasks.map((task, index) => {
                const isComplete = task.completed === 1;
                const isEditing = editingTaskId === task.id;
                return <div className={`movement-row${isComplete ? " completed" : ""}`} key={task.id} role="button" tabIndex={0} aria-pressed={isComplete} onClick={() => !isEditing && toggleMove(task)} onKeyDown={(event) => { if ((event.key === "Enter" || event.key === " ") && !isEditing) { event.preventDefault(); toggleMove(task); } }}>
                  <span className="row-number">0{index + 2}</span><GripVertical size={15} className="row-grip" />{isEditing ? <input className="row-edit-input" value={editingTitle} onChange={(event) => setEditingTitle(event.target.value)} onClick={(event) => event.stopPropagation()} autoFocus /> : <span className="row-title">{task.title}</span>}<span className="row-time">{task.durationMinutes} min</span><span className="task-actions">{isEditing ? <><button type="button" aria-label="Save task" onClick={(event) => { event.stopPropagation(); saveEdit(task); }}><Check size={16} /></button><button type="button" aria-label="Cancel edit" onClick={(event) => { event.stopPropagation(); setEditingTaskId(null); }}><X size={16} /></button></> : <><button type="button" aria-label={`Edit ${task.title}`} onClick={(event) => { event.stopPropagation(); beginEdit(task); }}><Pencil size={15} /></button><button type="button" aria-label={`Archive ${task.title}`} onClick={(event) => { event.stopPropagation(); archiveTask(task); }}><ArchiveIcon size={15} /></button><button type="button" aria-label={`Delete ${task.title}`} onClick={(event) => { event.stopPropagation(); deleteTask(task); }}><Trash2 size={15} /></button></>}</span>{!isEditing && (isComplete ? <Check size={18} className="row-check" /> : <CirclePlus size={18} />)}
                </div>;
              })}
            </div>
            {composerOpen && <form className="task-composer" onSubmit={submitNewTask}><input aria-label="New task title" value={newTitle} onChange={(event) => setNewTitle(event.target.value)} placeholder="Name the next small move" autoFocus /><select aria-label="Task duration" value={newDuration} onChange={(event) => setNewDuration(event.target.value)}><option value="10">10 min</option><option value="25">25 min</option><option value="50">50 min</option></select><button type="submit" disabled={createTask.isPending}>Add task</button></form>}
            <button className="add-move" onClick={() => isAuthenticated ? setComposerOpen((open) => !open) : startLogin()}><CirclePlus size={17} /> {composerOpen ? "Close checkpoint composer" : "Add a case checkpoint"}</button>
          </section>
        </main>
      </div>

      <aside className="app-context" aria-label="工作上下文">
        <div className="context-section context-name"><p>CASE CONTEXT</p><h2>Active service<br />route</h2><span>PENDING NEXT ACTION</span></div>
        <div className="context-section orbit-diagram"><div className="orbit-line orbit-one" /><div className="orbit-line orbit-two" /><div className="orbit-node now">NOW</div><div className="orbit-node done">01</div><div className="orbit-node next">03</div><span>Case route</span></div>
        <div className="context-section context-note"><div><Sparkles size={15} /><p>CASE NOTE</p></div><blockquote>“A clear verified step is more useful than a fast promise.”</blockquote><button onClick={() => toast("Case notes keep decisions attached to the record.")}>Open note <ArrowUpRight size={14} /></button></div>
        <div className="context-section context-footer"><Link href="/settings"><Command size={15} /> Project settings</Link><button onClick={() => toast("No automation is running for this work yet.")}><WandSparkles size={15} /> Add a simple rule</button></div>
      </aside>
    </div>
  );
}
