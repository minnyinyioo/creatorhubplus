import { useEffect, useMemo, useState } from "react";
import { FileCheck2, FileQuestion, FileWarning, RefreshCcw, ShieldCheck, UserRound } from "lucide-react";
import { toast } from "sonner";
import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";

type CaseFilter = "all" | "open" | "clarification_requested" | "resolved" | "closed";
type CaseReviewStatus = Exclude<CaseFilter, "all" | "open">;

const statusLabels: Record<CaseFilter, string> = {
  all: "Open cases",
  open: "New",
  clarification_requested: "Clarification",
  resolved: "Resolved",
  closed: "Closed",
};

function formatDate(value: Date | string) {
  return new Date(value).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

export default function StaffCases() {
  const { user } = useAuth();
  const [filter, setFilter] = useState<CaseFilter>("all");
  const [selectedCode, setSelectedCode] = useState<string>();
  const [staffNote, setStaffNote] = useState("");
  const query = trpc.supportCase.listForReview.useQuery(filter === "all" ? undefined : { status: filter });
  const reviewMutation = trpc.supportCase.review.useMutation({
    onSuccess: (result) => {
      toast(`${result.caseCode} marked ${statusLabels[result.status as CaseFilter]}.`);
      void query.refetch();
      setStaffNote("");
    },
    onError: (error) => toast(error.message),
  });

  const cases = query.data ?? [];
  const selectedCase = useMemo(() => cases.find((item) => item.caseCode === selectedCode) ?? cases[0], [cases, selectedCode]);

  useEffect(() => {
    if (selectedCase && selectedCase.caseCode !== selectedCode) setSelectedCode(selectedCase.caseCode);
  }, [selectedCase, selectedCode]);

  useEffect(() => {
    setStaffNote(selectedCase?.staffNote ?? "");
  }, [selectedCase?.caseCode, selectedCase?.staffNote]);

  const runReview = (status: CaseReviewStatus) => {
    if (!selectedCase) return;
    if (status === "clarification_requested" && !staffNote.trim()) {
      toast("Add a note explaining what the submitter should clarify.");
      return;
    }
    reviewMutation.mutate({ caseCode: selectedCase.caseCode, status, staffNote: staffNote.trim() || undefined });
  };

  if (!user || user.role !== "admin") {
    return <div className="staff-access-denied"><ShieldCheck size={32} /><h1>Staff access only</h1><p>Sign in with an administrator account to review support cases.</p></div>;
  }

  return <DashboardLayout>
    <div className="staff-page case-review-page">
      <header className="staff-header"><div><p className="staff-kicker">CASE INTAKE</p><h1>Support cases</h1><p>Turn a real platform issue into a clear next action without asking for credentials.</p></div><div className="staff-header-mark"><FileCheck2 size={26} /><span>CASE DESK<br /><b>01 / 04</b></span></div></header>
      <section className="staff-summary-grid case-summary-grid"><div><span>OPEN WORK</span><b>{cases.filter((item) => item.status === "open" || item.status === "clarification_requested").length}</b></div><div><span>VIEW</span><b>{statusLabels[filter]}</b></div><div><span>LAST REFRESH</span><b>{query.dataUpdatedAt ? formatDate(new Date(query.dataUpdatedAt)) : "—"}</b></div></section>
      <div className="staff-toolbar"><div className="staff-filter-tabs" role="tablist" aria-label="Case status"><button className={filter === "all" ? "active" : ""} onClick={() => setFilter("all")}>Open work</button><button className={filter === "resolved" ? "active" : ""} onClick={() => setFilter("resolved")}>Resolved</button><button className={filter === "closed" ? "active" : ""} onClick={() => setFilter("closed")}>Closed</button></div><button className="staff-refresh" onClick={() => query.refetch()} disabled={query.isFetching}><RefreshCcw size={14} className={query.isFetching ? "staff-spin" : ""} /> Refresh</button></div>
      <section className="case-review-grid"><div className="case-review-list">{query.isLoading ? <div className="staff-empty"><RefreshCcw className="staff-spin" size={20} /><p>Loading support cases…</p></div> : query.error ? <div className="staff-empty"><FileWarning size={20} /><p>{query.error.message}</p></div> : cases.length === 0 ? <div className="staff-empty"><FileCheck2 size={22} /><p>No cases in this view.</p><small>New authenticated submissions will appear here.</small></div> : cases.map((item) => <button type="button" key={item.caseCode} className={`case-review-list-item${selectedCase?.caseCode === item.caseCode ? " selected" : ""}`} onClick={() => setSelectedCode(item.caseCode)}><div><strong>{item.caseCode}</strong><span>{formatDate(item.createdAt)}</span></div><p>{item.serviceLabel} · {item.platformName}</p><b>{item.issueSummary}</b><i className={`staff-status ${item.status}`}>{statusLabels[item.status as CaseFilter]}</i></button>)}</div><article className="case-review-detail">{selectedCase ? <><div className="staff-detail-head"><div><p className="staff-kicker">CASE DETAIL</p><h2>{selectedCase.caseCode}</h2></div><i className={`staff-status ${selectedCase.status}`}>{statusLabels[selectedCase.status as CaseFilter]}</i></div><div className="case-detail-meta"><div><span>Service path</span><b>{selectedCase.serviceLabel}</b></div><div><span>Platform</span><b>{selectedCase.platformName}</b></div><div><span>Submitted</span><b>{formatDate(selectedCase.createdAt)}</b></div><div><span>Submitter</span><b>{selectedCase.submitterName || "Account holder"}</b></div></div><div className="staff-submitter"><UserRound size={17} /><div><span>Account email</span><b>{selectedCase.submitterEmail || "No email on file"}</b><small>Use the account record for the approved follow-up channel.</small></div></div><div className="case-detail-copy"><p className="staff-kicker">ISSUE SUMMARY</p><h3>{selectedCase.issueSummary}</h3><p>{selectedCase.details}</p></div>{selectedCase.status === "open" || selectedCase.status === "clarification_requested" ? <><label className="staff-note-field"><span>Staff note {selectedCase.status === "open" ? "(optional)" : "(required for clarification)"}</span><textarea value={staffNote} onChange={(event) => setStaffNote(event.target.value.slice(0, 2000))} placeholder="Record what was checked or what the submitter should clarify…" maxLength={2000} /></label><div className="staff-action-row case-action-row"><button className="staff-clarify" onClick={() => runReview("clarification_requested")} disabled={reviewMutation.isPending}><FileQuestion size={15} /> Request clarification</button><button className="staff-reject" onClick={() => runReview("closed")} disabled={reviewMutation.isPending}><FileWarning size={15} /> Close case</button><button onClick={() => runReview("resolved")} disabled={reviewMutation.isPending}><ShieldCheck size={15} /> Mark resolved</button></div></> : <div className="staff-reviewed-banner"><ShieldCheck size={16} /><span>Review completed on {selectedCase.reviewedAt ? formatDate(selectedCase.reviewedAt) : "the recorded date"}. The note remains available for staff reference.</span></div>}</> : <div className="staff-empty staff-detail-empty"><FileCheck2 size={24} /><p>Select a support case to inspect the issue and next action.</p></div>}</article></section>
    </div>
  </DashboardLayout>;
}
