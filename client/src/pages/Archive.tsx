import { Archive as ArchiveIcon, ArrowLeft, RotateCcw, Trash2 } from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";
import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";

export default function Archive() {
  const utils = trpc.useUtils();
  const archiveQuery = trpc.workspaceTask.listArchived.useQuery();
  const restoreTask = trpc.workspaceTask.archive.useMutation({
    onSuccess: async () => {
      await Promise.all([utils.workspaceTask.listArchived.invalidate(), utils.workspaceTask.list.invalidate()]);
      toast.success("Task restored to its working view.");
    },
    onError: (error) => toast.error(error.message),
  });
  const deleteTask = trpc.workspaceTask.delete.useMutation({
    onSuccess: () => {
      utils.workspaceTask.listArchived.invalidate();
      toast.success("Task permanently deleted.");
    },
    onError: (error) => toast.error(error.message),
  });

  return (
    <DashboardLayout>
      <section className="companion-page archive-page">
        <div className="companion-page-top"><Link href="/workspace" className="companion-back"><ArrowLeft size={15} /> Back to workspace</Link><span>RECORD / ARCHIVE</span></div>
        <div className="companion-heading"><div><p className="app-kicker">QUIETLY KEPT</p><h1>Make room<br />without losing the thread.</h1><p>Archived moves stay out of the active orbit until you are ready to bring them back.</p></div><ArchiveIcon size={42} strokeWidth={1.2} /></div>
        {archiveQuery.isLoading ? <div className="companion-empty">Loading your archive…</div> : archiveQuery.data?.length ? <div className="archive-list">{archiveQuery.data.map((task) => <article className="archive-item" key={task.id}><div><span>{task.viewKey}</span><h2>{task.title}</h2><p>Updated {new Date(task.updatedAt).toLocaleDateString()} · {task.durationMinutes} min</p></div><div className="archive-actions"><button onClick={() => restoreTask.mutate({ id: task.id, archived: false })} disabled={restoreTask.isPending}><RotateCcw size={15} /> Restore</button><button className="danger-action" onClick={() => { if (window.confirm(`Delete “${task.title}” permanently?`)) deleteTask.mutate({ id: task.id }); }} disabled={deleteTask.isPending}><Trash2 size={15} /> Delete</button></div></article>)}</div> : <div className="companion-empty"><ArchiveIcon size={25} /><strong>Your archive is clear.</strong><span>When a move no longer belongs in today’s orbit, archive it from Workspace.</span><Link href="/workspace">Open Workspace <ArrowLeft size={15} /></Link></div>}
      </section>
    </DashboardLayout>
  );
}
