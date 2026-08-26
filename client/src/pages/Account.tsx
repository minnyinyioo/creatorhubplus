import { useState } from "react";
import { Bell, Check, Clock3, ExternalLink, FileCheck2, RefreshCw } from "lucide-react";
import { Link } from "wouter";
import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";

export function statusCopy(status: string) {
  if (status === "verified") return { label: "Verified", tone: "verified", next: "Your payment is verified. Continue with the selected service path." };
  if (status === "clarification_requested") return { label: "Needs your reply", tone: "clarification", next: "Read the staff note and submit the missing clarification." };
  if (status === "rejected") return { label: "Not approved", tone: "rejected", next: "Review the staff note before creating a corrected request." };
  return { label: "Pending review", tone: "pending", next: "Staff will compare the receipt with the approved merchant destination." };
}

export function getAccountListState(isLoading: boolean, isError: boolean, count: number) {
  if (isLoading) return "loading" as const;
  if (isError) return "error" as const;
  if (count === 0) return "empty" as const;
  return "ready" as const;
}

export function getAccountRequestPresentation(status: string, reviewNote?: string | null) {
  return { ...statusCopy(status), staffNote: reviewNote?.trim() || null };
}

function dateLabel(value: Date | string) {
  return new Date(value).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

export default function Account() {
  const requests = trpc.paymentRequest.listMine.useQuery();
  const notifications = trpc.paymentNotification.listMine.useQuery();
  const unread = trpc.paymentNotification.unreadCount.useQuery();
  const utils = trpc.useUtils();
  const markRead = trpc.paymentNotification.markRead.useMutation({ onSuccess: () => { void utils.paymentNotification.listMine.invalidate(); void utils.paymentNotification.unreadCount.invalidate(); } });
  const markAllRead = trpc.paymentNotification.markAllRead.useMutation({ onSuccess: () => { void utils.paymentNotification.listMine.invalidate(); void utils.paymentNotification.unreadCount.invalidate(); } });
  const [filter, setFilter] = useState<"all" | "pending" | "action">("all");
  const visibleRequests = requests.data?.filter((request) => {
    if (filter === "pending") return request.status === "pending_review";
    if (filter === "action") return request.status === "clarification_requested" || request.status === "rejected";
    return true;
  }) ?? [];
  const requestState = getAccountListState(requests.isLoading, requests.isError, visibleRequests.length);
  const notificationState = getAccountListState(notifications.isLoading, notifications.isError, notifications.data?.length ?? 0);

  return <DashboardLayout>
    <div className="companion-page account-page">
      <header className="companion-header"><div><span className="companion-kicker">PERSONAL CENTRE</span><h1>Your payment<br /><em>story, in one place.</em></h1><p>Track every order, read staff feedback and know the next useful move without searching through messages.</p></div><Link href="/payment" className="companion-primary">Start a payment request <ExternalLink size={16} /></Link></header>
      <section className="account-summary"><div><span>ORDERS</span><strong>{requests.data?.length ?? 0}</strong><small>Payment requests linked to this account</small></div><div><span>NEEDS ATTENTION</span><strong>{requests.data?.filter((item) => item.status === "clarification_requested").length ?? 0}</strong><small>Requests waiting for your reply</small></div><div><span>UNREAD</span><strong>{unread.isError ? "—" : unread.data ?? 0}</strong><small>{unread.isError ? "Unable to load updates" : "New review updates"}</small></div></section>
      <section className="account-grid">
        <div className="account-orders"><div className="companion-section-heading"><div><span className="companion-kicker">PAYMENT HISTORY</span><h2>Every order has<br />a clear next step.</h2></div><div className="account-filters">{(["all", "pending", "action"] as const).map((item) => <button key={item} className={filter === item ? "active" : ""} onClick={() => setFilter(item)}>{item === "all" ? "All" : item === "pending" ? "Pending" : "Needs reply"}</button>)}</div></div>{requestState === "loading" ? <p className="companion-empty">Loading your payment history…</p> : requestState === "error" ? <p className="companion-empty">We couldn’t load your payment history. Please refresh and try again.</p> : requestState === "empty" ? <p className="companion-empty">No payment orders match this view yet.</p> : <div className="account-order-list">{visibleRequests.map((request) => { const status = getAccountRequestPresentation(request.status, request.reviewNote); return <article className="account-order-card" key={request.requestCode}><div className="account-order-top"><div><span>{request.serviceLabel ?? request.serviceKey ?? "Payment service"}</span><h3>{request.orderNumber}</h3><small>{request.requestCode} · {dateLabel(request.createdAt)}</small></div><strong className={`status-pill ${status.tone}`}>{status.label}</strong></div><div className="account-order-meta"><span>Route <b>{request.paymentMethod}</b></span><span>Amount <b>{request.amountMmk.toLocaleString()} MMK</b></span></div><div className="account-next-step"><Clock3 size={16} /><p><b>Next step</b>{status.next}{status.staffNote && <><br /><span>Staff note: {status.staffNote}</span></>}</p></div></article>; })}</div>}</div>
        <aside className="account-notifications"><div className="companion-section-heading"><div><span className="companion-kicker"><Bell size={13} /> NOTIFICATIONS</span><h2>Review updates<br />that stay visible.</h2></div>{(unread.data ?? 0) > 0 && <button className="account-mark-all" onClick={() => markAllRead.mutate()}><Check size={14} /> Mark all read</button>}</div>{notificationState === "loading" ? <p className="companion-empty">Loading notifications…</p> : notificationState === "error" ? <p className="companion-empty">We couldn’t load your notifications. Please refresh and try again.</p> : notificationState === "empty" ? <p className="companion-empty">New payment-review updates will appear here.</p> : <div className="notification-list">{(notifications.data ?? []).map((notification) => <button key={notification.id} className={`notification-card${notification.readAt ? " is-read" : ""}`} onClick={() => !notification.readAt && markRead.mutate({ id: notification.id })}><span><FileCheck2 size={15} /></span><div><strong>{notification.title}</strong><p>{notification.message}</p><small>{dateLabel(notification.createdAt)}</small></div>{!notification.readAt && <i />}</button>)}</div>}</aside>
      </section>
      <footer className="companion-footer"><RefreshCw size={16} /><p>Your payment records are private to your account. The review queue only exposes the receipt and details needed by authorized staff.</p></footer>
    </div>
  </DashboardLayout>;
}
