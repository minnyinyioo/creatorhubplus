import { useEffect, useMemo, useState } from "react";
import { ExternalLink, FileCheck2, FileQuestion, FileWarning, RefreshCcw, ShieldCheck, UserRound } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";

const filterOptions = [
  { value: "needs_action", label: "Needs action" },
  { value: "pending_review", label: "New" },
  { value: "clarification_requested", label: "Clarification requested" },
  { value: "verified", label: "Verified" },
  { value: "rejected", label: "Rejected" },
] as const;
type ReviewFilter = (typeof filterOptions)[number]["value"];

type ReviewableStatus = "pending_review" | "clarification_requested" | "verified" | "rejected";

function formatDate(value: Date | string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

function statusLabel(status: ReviewableStatus) {
  return status.replaceAll("_", " ");
}

function StaffReviewContent() {
  const { user, loading } = useAuth();
  const [filter, setFilter] = useState<ReviewFilter>("needs_action");
  const [selectedRequestCode, setSelectedRequestCode] = useState<string | null>(null);
  const [reviewNote, setReviewNote] = useState("");
  const queryInput = useMemo(() => ({ status: filter === "needs_action" ? undefined : filter }), [filter]);
  const query = trpc.paymentReview.list.useQuery(queryInput, { enabled: !loading && user?.role === "admin" });
  const utils = trpc.useUtils();
  const reviewMutation = trpc.paymentReview.update.useMutation({
    onSuccess: async (result) => {
      await utils.paymentReview.list.invalidate();
      setReviewNote("");
      toast(`${result.requestCode} marked ${statusLabel(result.status)}.`);
    },
    onError: (error) => toast(error.message),
  });

  const requests = query.data ?? [];
  const selectedRequest = requests.find((request) => request.requestCode === selectedRequestCode) ?? requests[0];

  useEffect(() => {
    if (!selectedRequestCode && requests[0]) setSelectedRequestCode(requests[0].requestCode);
    if (selectedRequestCode && !requests.some((request) => request.requestCode === selectedRequestCode)) {
      setSelectedRequestCode(requests[0]?.requestCode ?? null);
    }
  }, [requests, selectedRequestCode]);

  const runReview = (status: "clarification_requested" | "verified" | "rejected") => {
    if (!selectedRequest) return;
    if (status === "clarification_requested" && !reviewNote.trim()) {
      toast("Add a note explaining what the submitter should clarify.");
      return;
    }
    reviewMutation.mutate({
      requestCode: selectedRequest.requestCode,
      status,
      reviewNote: reviewNote.trim() || undefined,
    });
  };

  if (!loading && user && user.role !== "admin") {
    return <div className="staff-access-denied"><ShieldCheck size={28} /><p className="staff-kicker">STAFF AREA</p><h1>Staff access required.</h1><p>Your account is signed in, but it does not have permission to review payment submissions.</p></div>;
  }

  return <div className="staff-page">
    <header className="staff-header"><div><p className="staff-kicker">OPERATIONS / REVIEW QUEUE</p><h1>Payment proof review</h1><p className="staff-lede">Verify the receipt against the approved merchant destination before marking a request complete.</p></div><Button variant="outline" onClick={() => query.refetch()} disabled={query.isFetching}><RefreshCcw size={15} className={query.isFetching ? "staff-spin" : ""} /> Refresh queue</Button></header>
    <section className="staff-summary-grid"><article><span>Open queue</span><strong>{requests.filter((request) => request.status === "pending_review").length}</strong><small>new submissions</small></article><article><span>Needs clarification</span><strong>{requests.filter((request) => request.status === "clarification_requested").length}</strong><small>follow-up required</small></article><article><span>Review standard</span><strong>100%</strong><small>receipt + recipient match</small></article></section>
    <div className="staff-toolbar"><div className="staff-filter-tabs" role="tablist" aria-label="Review filters">{filterOptions.map((option) => <button key={option.value} role="tab" aria-selected={filter === option.value} className={filter === option.value ? "active" : ""} onClick={() => setFilter(option.value)}>{option.label}</button>)}</div><span>{query.isLoading ? "Loading…" : `${requests.length} request${requests.length === 1 ? "" : "s"}`}</span></div>
    <section className="staff-review-grid">
      <div className="staff-request-list">{query.isLoading ? <div className="staff-empty"><RefreshCcw className="staff-spin" size={20} /><p>Loading the review queue…</p></div> : query.error ? <div className="staff-empty"><FileWarning size={20} /><p>{query.error.message}</p></div> : requests.length === 0 ? <div className="staff-empty"><FileCheck2 size={22} /><p>No requests in this view.</p><small>New submissions will appear here after a receipt is uploaded.</small></div> : requests.map((request) => <button type="button" key={request.requestCode} className={`staff-request-card${selectedRequest?.requestCode === request.requestCode ? " selected" : ""}`} onClick={() => setSelectedRequestCode(request.requestCode)}><div><strong>{request.requestCode}</strong><span>{formatDate(request.createdAt)}</span></div><div><b>{request.amountMmk.toLocaleString()} MMK</b><i className={`staff-status ${request.status}`}>{statusLabel(request.status)}</i></div><p>{request.serviceLabel ?? "Unlinked payment"} · {request.payerName} · {request.paymentMethod}</p></button>)}</div>
      <article className="staff-detail-card">{selectedRequest ? <><div className="staff-detail-head"><div><p className="staff-kicker">REQUEST DETAIL</p><h2>{selectedRequest.requestCode}</h2></div><i className={`staff-status ${selectedRequest.status}`}>{statusLabel(selectedRequest.status)}</i></div><div className="staff-detail-meta"><div><span>Service</span><b>{selectedRequest.serviceLabel ?? "Unlinked payment"}</b></div><div><span>Submitted</span><b>{formatDate(selectedRequest.createdAt)}</b></div><div><span>Method</span><b>{selectedRequest.paymentMethod}</b></div><div><span>Amount</span><b>{selectedRequest.amountMmk.toLocaleString()} MMK</b></div><div><span>Account hint</span><b>{selectedRequest.accountHint || "Not provided"}</b></div></div><div className="staff-submitter"><UserRound size={17} /><div><span>Submitted by</span><b>{selectedRequest.submitterName || selectedRequest.payerName}</b><small>{selectedRequest.submitterEmail || "No email on file"}</small></div></div><div className="staff-receipt-panel"><div><div><p className="staff-kicker">RECEIPT</p><h3>{selectedRequest.receiptName}</h3></div><a href={selectedRequest.receiptUrl} target="_blank" rel="noreferrer">Open receipt <ExternalLink size={14} /></a></div>{selectedRequest.receiptContentType.startsWith("image/") ? <img src={selectedRequest.receiptUrl} alt={`Receipt for ${selectedRequest.requestCode}`} /> : <div className="staff-pdf-placeholder"><FileQuestion size={24} /><span>PDF receipt</span><small>Open the receipt in a new tab to inspect it.</small></div>}</div>{selectedRequest.paymentReference && <div className="staff-reference"><span>Payment reference</span><p>{selectedRequest.paymentReference}</p></div>}<label className="staff-note-field"><span>Review note {selectedRequest.status === "pending_review" || selectedRequest.status === "clarification_requested" ? "(required for clarification)" : "(optional)"}</span><textarea value={reviewNote} onChange={(event) => setReviewNote(event.target.value.slice(0, 2000))} placeholder="Record what was verified, rejected, or needs clarification…" maxLength={2000} /></label>{selectedRequest.status === "pending_review" || selectedRequest.status === "clarification_requested" ? <div className="staff-action-row"><Button variant="outline" className="staff-clarify" onClick={() => runReview("clarification_requested")} disabled={reviewMutation.isPending}><FileQuestion size={15} /> Request clarification</Button><Button variant="outline" className="staff-reject" onClick={() => runReview("rejected")} disabled={reviewMutation.isPending}><FileWarning size={15} /> Reject</Button><Button onClick={() => runReview("verified")} disabled={reviewMutation.isPending}><ShieldCheck size={15} /> Verify payment</Button></div> : <div className="staff-reviewed-banner"><ShieldCheck size={16} /><span>This request has already been reviewed. The note and reviewer audit fields remain available for staff reference.</span></div>}</> : <div className="staff-empty staff-detail-empty"><FileCheck2 size={24} /><p>Select a request to inspect its receipt and review status.</p></div>}</article>
    </section>
  </div>;
}

export default function StaffReview() {
  return <DashboardLayout><StaffReviewContent /></DashboardLayout>;
}
