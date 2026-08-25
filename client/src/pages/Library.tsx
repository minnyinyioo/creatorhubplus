import { BookOpen, Pin, Plus, Trash2 } from "lucide-react";
import { FormEvent, useState } from "react";
import { toast } from "sonner";
import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";

const kindLabels = { template: "Template", guide: "Guide", prompt: "Prompt" } as const;

export default function Library() {
  const utils = trpc.useUtils();
  const libraryQuery = trpc.workspaceLibrary.list.useQuery();
  const [composerOpen, setComposerOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [kind, setKind] = useState<keyof typeof kindLabels>("template");
  const [description, setDescription] = useState("");
  const createItem = trpc.workspaceLibrary.create.useMutation({ onSuccess: async () => { await utils.workspaceLibrary.list.invalidate(); setTitle(""); setDescription(""); setComposerOpen(false); toast.success("Library item added."); }, onError: (error) => toast.error(error.message) });
  const updateItem = trpc.workspaceLibrary.update.useMutation({ onSuccess: () => utils.workspaceLibrary.list.invalidate(), onError: (error) => toast.error(error.message) });
  const deleteItem = trpc.workspaceLibrary.delete.useMutation({ onSuccess: () => { utils.workspaceLibrary.list.invalidate(); toast.success("Library item deleted."); }, onError: (error) => toast.error(error.message) });

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (title.trim().length < 2 || description.trim().length < 10) return toast.error("Add a title and at least 10 characters of context.");
    createItem.mutate({ title: title.trim(), kind, description: description.trim() });
  };

  return <DashboardLayout><section className="companion-page library-page">
    <div className="companion-page-top"><span>RECORD / LIBRARY</span><button className="companion-primary" onClick={() => setComposerOpen((open) => !open)}><Plus size={15} /> {composerOpen ? "Close composer" : "Add item"}</button></div>
    <div className="companion-heading"><div><p className="app-kicker">REUSABLE MATERIAL</p><h1>Keep the useful<br />parts close.</h1><p>Templates, guides and prompts that make the next small move easier to begin.</p></div><BookOpen size={42} strokeWidth={1.2} /></div>
    {composerOpen && <form className="library-composer" onSubmit={submit}><input aria-label="Library item title" placeholder="Item title" value={title} onChange={(event) => setTitle(event.target.value)} /><select aria-label="Library item type" value={kind} onChange={(event) => setKind(event.target.value as keyof typeof kindLabels)}><option value="template">Template</option><option value="guide">Guide</option><option value="prompt">Prompt</option></select><textarea aria-label="Library item description" placeholder="What is this useful for?" value={description} onChange={(event) => setDescription(event.target.value)} /><button type="submit" disabled={createItem.isPending}>Save to library</button></form>}
    {libraryQuery.isLoading ? <div className="companion-empty">Loading your library…</div> : <div className="library-grid">{libraryQuery.data?.map((item) => <article className="library-card" key={item.id}><div className="library-card-top"><span>{kindLabels[item.kind]}</span><button aria-label={`${item.pinned ? "Unpin" : "Pin"} ${item.title}`} className={item.pinned ? "pinned" : ""} onClick={() => updateItem.mutate({ id: item.id, pinned: !item.pinned })}><Pin size={15} /></button></div><h2>{item.title}</h2><p>{item.description}</p><div className="library-card-bottom"><small>{item.pinned ? "Pinned" : "Ready to reuse"}</small><button aria-label={`Delete ${item.title}`} onClick={() => { if (window.confirm(`Delete “${item.title}”?`)) deleteItem.mutate({ id: item.id }); }}><Trash2 size={15} /></button></div></article>)}</div>}
  </section></DashboardLayout>;
}
