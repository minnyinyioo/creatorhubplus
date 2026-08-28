import { Bell, Check, Clock3, Download, ExternalLink, FileCheck2, FileText, LoaderCircle, RefreshCw, Search, SlidersHorizontal } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { Link } from "wouter";
import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";

export type AccountStatusFilter = "all" | "pending" | "needs_reply" | "verified" | "rejected";
export type AccountDateFilter = "all" | "7d" | "30d";
export type AccountSortOrder = "newest" | "oldest";
export type InvoiceStatusFilter = "all" | "issued";
export type InvoiceSortOrder = "newest" | "oldest" | "amount_high" | "amount_low";

type AccountInvoice = {
  id: number;
  invoiceNumber: string;
  orderNumber: string;
  serviceLabel: string;
  paymentMethod: string;
  amountMmk: number;
  currency: string;
  status: string;
  issuedAt: Date | string;
};

type AccountOrder = {
  requestCode: string;
  orderNumber: string;
  serviceKey?: string | null;
  serviceLabel?: string | null;
  paymentMethod: string;
  amountMmk: number;
  status: string;
  reviewNote?: string | null;
  createdAt: Date | string;
};

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

export function getExportButtonLabel(isExporting: boolean) {
  return isExporting ? "Preparing CSV…" : "Export CSV";
}

export function searchOrders<T extends { orderNumber: string; requestCode: string }>(orders: readonly T[], query: string) {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) return [...orders];
  return orders.filter((order) => order.orderNumber.toLowerCase().includes(normalizedQuery) || order.requestCode.toLowerCase().includes(normalizedQuery));
}

export function filterAndSortOrders<T extends { status: string; createdAt: Date | string }>(
  orders: readonly T[],
  statusFilter: AccountStatusFilter,
  dateFilter: AccountDateFilter,
  sortOrder: AccountSortOrder,
  now = new Date(),
) {
  const statusMatches = (status: string) => {
    if (statusFilter === "all") return true;
    if (statusFilter === "pending") return status === "pending_review";
    if (statusFilter === "needs_reply") return status === "clarification_requested";
    return status === statusFilter;
  };
  const dateCutoff = dateFilter === "all" ? null : new Date(now.getTime() - (dateFilter === "7d" ? 7 : 30) * 24 * 60 * 60 * 1000);
  return orders
    .filter((order) => statusMatches(order.status))
    .filter((order) => !dateCutoff || new Date(order.createdAt).getTime() >= dateCutoff.getTime())
    .sort((a, b) => {
      const difference = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      return sortOrder === "newest" ? -difference : difference;
    });
}

export function filterAndSortInvoices<T extends { invoiceNumber: string; orderNumber: string; serviceLabel: string; status: string; amountMmk: number; issuedAt: Date | string }>(invoices: readonly T[], query: string, statusFilter: InvoiceStatusFilter, sortOrder: InvoiceSortOrder) {
  const normalizedQuery = query.trim().toLowerCase();
  return [...invoices]
    .filter((invoice) => statusFilter === "all" || invoice.status === statusFilter)
    .filter((invoice) => !normalizedQuery || [invoice.invoiceNumber, invoice.orderNumber, invoice.serviceLabel].some((value) => value.toLowerCase().includes(normalizedQuery)))
    .sort((a, b) => {
      if (sortOrder === "amount_high" || sortOrder === "amount_low") {
        const difference = a.amountMmk - b.amountMmk;
        return sortOrder === "amount_high" ? -difference : difference;
      }
      const difference = new Date(a.issuedAt).getTime() - new Date(b.issuedAt).getTime();
      return sortOrder === "newest" ? -difference : difference;
    });
}

export function escapeCsvField(value: unknown) {
  const text = value === null || value === undefined ? "" : String(value);
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export function buildOrdersCsv(orders: readonly AccountOrder[]) {
  const header = ["Order number", "Request code", "Service", "Payment method", "Amount (MMK)", "Status", "Staff note", "Created at"];
  const rows = orders.map((order) => [
    order.orderNumber,
    order.requestCode,
    order.serviceLabel ?? order.serviceKey ?? "Payment service",
    order.paymentMethod,
    order.amountMmk.toString(),
    statusCopy(order.status).label,
    order.reviewNote ?? "",
    new Date(order.createdAt).toISOString(),
  ]);
  return `\ufeff${[header, ...rows].map((row) => row.map(escapeCsvField).join(",")).join("\r\n")}\r\n`;
}

function dateLabel(value: Date | string) {
  return new Date(value).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

function downloadOrdersCsv(orders: readonly AccountOrder[]) {
  const blob = new Blob([buildOrdersCsv(orders)], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `creatorhubplus-orders-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

type ExportFeedbackDependencies = {
  waitForPaint?: () => Promise<void>;
  download?: (orders: readonly AccountOrder[]) => void;
  onSuccess?: (count: number) => void;
  onError?: () => void;
};

export async function exportOrdersCsvWithFeedback(orders: readonly AccountOrder[], dependencies: ExportFeedbackDependencies = {}) {
  const waitForPaint = dependencies.waitForPaint ?? (() => new Promise<void>((resolve) => requestAnimationFrame(() => resolve())));
  const download = dependencies.download ?? downloadOrdersCsv;
  try {
    await waitForPaint();
    download(orders);
    dependencies.onSuccess?.(orders.length);
    return true;
  } catch {
    dependencies.onError?.();
    return false;
  }
}

export default function Account() {
  const requests = trpc.paymentRequest.listMine.useQuery();
  const invoices = trpc.invoice.listMine.useQuery();
  const downloadInvoice = trpc.invoice.downloadUrl.useMutation({
    onSuccess: (result) => {
      if (!result?.url) {
        toast.error("This invoice is not available for download yet.");
        return;
      }
      window.open(result.url, "_blank", "noopener,noreferrer");
    },
    onError: () => toast.error("We couldn’t prepare the invoice download. Please try again."),
  });
  const notifications = trpc.paymentNotification.listMine.useQuery();
  const unread = trpc.paymentNotification.unreadCount.useQuery();
  const utils = trpc.useUtils();
  const markRead = trpc.paymentNotification.markRead.useMutation({ onSuccess: () => { void utils.paymentNotification.listMine.invalidate(); void utils.paymentNotification.unreadCount.invalidate(); } });
  const markAllRead = trpc.paymentNotification.markAllRead.useMutation({ onSuccess: () => { void utils.paymentNotification.listMine.invalidate(); void utils.paymentNotification.unreadCount.invalidate(); } });
  const [statusFilter, setStatusFilter] = useState<AccountStatusFilter>("all");
  const [dateFilter, setDateFilter] = useState<AccountDateFilter>("all");
  const [sortOrder, setSortOrder] = useState<AccountSortOrder>("newest");
  const [searchQuery, setSearchQuery] = useState("");
  const [isExporting, setIsExporting] = useState(false);
  const [invoiceSearchQuery, setInvoiceSearchQuery] = useState("");
  const [invoiceStatusFilter, setInvoiceStatusFilter] = useState<InvoiceStatusFilter>("all");
  const [invoiceSortOrder, setInvoiceSortOrder] = useState<InvoiceSortOrder>("newest");
  const allRequests = (requests.data ?? []) as AccountOrder[];
  const allInvoices = (invoices.data ?? []) as AccountInvoice[];
  const visibleRequests = filterAndSortOrders(searchOrders(allRequests, searchQuery), statusFilter, dateFilter, sortOrder);
  const visibleInvoices = filterAndSortInvoices(allInvoices, invoiceSearchQuery, invoiceStatusFilter, invoiceSortOrder);
  const requestState = getAccountListState(requests.isLoading, requests.isError, visibleRequests.length);
  const notificationState = getAccountListState(notifications.isLoading, notifications.isError, notifications.data?.length ?? 0);
  const exportVisibleOrders = async () => {
    if (!visibleRequests.length || isExporting) return;
    setIsExporting(true);
    try {
      await exportOrdersCsvWithFeedback(visibleRequests, {
        onSuccess: (count) => toast.success(`${count} order${count === 1 ? "" : "s"} exported as CSV.`),
        onError: () => toast.error("We couldn’t export your order history. Please try again."),
      });
    } finally {
      setIsExporting(false);
    }
  };

  return <DashboardLayout>
    <div className="companion-page account-page case-ledger-page">
      <header className="companion-header"><div><span className="companion-kicker">PERSONAL CENTRE</span><h1>Your payment<br /><em>story, in one place.</em></h1><p>Track every order, read staff feedback and know the next useful move without searching through messages.</p></div><Link href="/payment" className="companion-primary">Start a payment request <ExternalLink size={16} /></Link></header>
      <div className="case-route-rail" aria-label="Payment case route"><span><b>01</b> Payment record</span><i /><span><b>02</b> Review update</span><i /><span><b>03</b> Next action</span></div><section className="account-summary"><div><span>ORDERS</span><strong>{requests.data?.length ?? 0}</strong><small>Payment requests linked to this account</small></div><div><span>NEEDS ATTENTION</span><strong>{requests.data?.filter((item) => item.status === "clarification_requested").length ?? 0}</strong><small>Requests waiting for your reply</small></div><div><span>UNREAD</span><strong>{unread.isError ? "—" : unread.data ?? 0}</strong><small>{unread.isError ? "Unable to load updates" : "New review updates"}</small></div></section>
      <section className="account-grid">
        <div className="account-orders">
          <div className="companion-section-heading"><div><span className="companion-kicker">PAYMENT HISTORY</span><h2>Every order has<br />a clear next step.</h2></div><button className="account-export" type="button" disabled={!visibleRequests.length || requests.isError || isExporting} onClick={() => void exportVisibleOrders()}>{isExporting ? <LoaderCircle className="account-spinner" size={15} /> : <Download size={15} />} {getExportButtonLabel(isExporting)}</button></div>
          <div className="account-controls" aria-label="Order history filters"><label className="account-search"><span>Find an order</span><div><Search size={14} /><input value={searchQuery} onChange={(event) => setSearchQuery(event.target.value.slice(0, 80))} placeholder="Order number or request code" aria-label="Search orders by ID" /></div></label><label><span>Status</span><select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as AccountStatusFilter)}><option value="all">All statuses</option><option value="pending">Pending review</option><option value="needs_reply">Needs your reply</option><option value="verified">Verified</option><option value="rejected">Not approved</option></select></label><label><span>Date range</span><select value={dateFilter} onChange={(event) => setDateFilter(event.target.value as AccountDateFilter)}><option value="all">All dates</option><option value="7d">Last 7 days</option><option value="30d">Last 30 days</option></select></label><label><span>Sort by date</span><select value={sortOrder} onChange={(event) => setSortOrder(event.target.value as AccountSortOrder)}><option value="newest">Newest first</option><option value="oldest">Oldest first</option></select></label><span className="account-result-count"><SlidersHorizontal size={14} /> {visibleRequests.length} shown</span></div>
          {requestState === "loading" ? <p className="companion-empty">Loading your payment history…</p> : requestState === "error" ? <p className="companion-empty">We couldn’t load your payment history. Please refresh and try again.</p> : requestState === "empty" ? <p className="companion-empty">No payment orders match these filters yet.</p> : <div className="account-order-list">{visibleRequests.map((request) => { const status = getAccountRequestPresentation(request.status, request.reviewNote); return <article className="account-order-card" key={request.requestCode}><div className="account-order-top"><div><span>{request.serviceLabel ?? request.serviceKey ?? "Payment service"}</span><h3>{request.orderNumber}</h3><small>{request.requestCode} · {dateLabel(request.createdAt)}</small></div><strong className={`status-pill ${status.tone}`}>{status.label}</strong></div><div className="account-order-meta"><span>Route <b>{request.paymentMethod}</b></span><span>Amount <b>{request.amountMmk.toLocaleString()} MMK</b></span></div><div className="account-next-step"><Clock3 size={16} /><p><b>Next step</b>{status.next}{status.staffNote && <><br /><span>Staff note: {status.staffNote}</span></>}</p></div></article>; })}</div>}
        <section className="account-invoices">
          <div className="companion-section-heading"><div><span className="companion-kicker"><FileText size={13} /> ELECTRONIC INVOICES</span><h2>Your verified<br />payment documents.</h2></div><span className="account-invoice-note">Issued automatically after verification</span></div>
          {invoices.isLoading ? <p className="companion-empty">Loading your invoices…</p> : invoices.isError ? <p className="companion-empty">We couldn’t load your invoices. Please refresh and try again.</p> : !allInvoices.length ? <p className="companion-empty">Verified payment invoices will appear here automatically.</p> : <><div className="account-invoice-controls" aria-label="Invoice filters"><label className="account-search"><span>Find an invoice</span><div><Search size={14} /><input value={invoiceSearchQuery} onChange={(event) => setInvoiceSearchQuery(event.target.value.slice(0, 80))} placeholder="Invoice, order or service" aria-label="Search invoices" /></div></label><label><span>Status</span><select value={invoiceStatusFilter} onChange={(event) => setInvoiceStatusFilter(event.target.value as InvoiceStatusFilter)}><option value="all">All statuses</option><option value="issued">Issued</option></select></label><label><span>Sort</span><select value={invoiceSortOrder} onChange={(event) => setInvoiceSortOrder(event.target.value as InvoiceSortOrder)}><option value="newest">Newest first</option><option value="oldest">Oldest first</option><option value="amount_high">Highest amount</option><option value="amount_low">Lowest amount</option></select></label><span className="account-result-count"><SlidersHorizontal size={14} /> {visibleInvoices.length} shown</span></div>{!visibleInvoices.length ? <p className="companion-empty">No invoices match these filters.</p> : <div className="account-invoice-list">{visibleInvoices.map((invoice) => <article className="account-invoice-card" key={invoice.id}><div><span>{invoice.serviceLabel}</span><h3>{invoice.invoiceNumber}</h3><small>{invoice.orderNumber} · {dateLabel(invoice.issuedAt)}</small></div><div className="account-invoice-side"><strong>{invoice.amountMmk.toLocaleString()} {invoice.currency}</strong><button type="button" disabled={downloadInvoice.isPending} onClick={() => downloadInvoice.mutate({ id: invoice.id })}>{downloadInvoice.isPending ? <LoaderCircle className="account-spinner" size={14} /> : <Download size={14} />} {downloadInvoice.isPending ? "Preparing…" : "Download PDF"}</button></div></article>)}</div>}</>}
        </section>
        </div>
        <aside className="account-notifications"><div className="companion-section-heading"><div><span className="companion-kicker"><Bell size={13} /> NOTIFICATIONS</span><h2>Review updates<br />that stay visible.</h2></div>{(unread.data ?? 0) > 0 && <button className="account-mark-all" onClick={() => markAllRead.mutate()}><Check size={14} /> Mark all read</button>}</div>{notificationState === "loading" ? <p className="companion-empty">Loading notifications…</p> : notificationState === "error" ? <p className="companion-empty">We couldn’t load your notifications. Please refresh and try again.</p> : notificationState === "empty" ? <p className="companion-empty">New payment-review updates will appear here.</p> : <div className="notification-list">{(notifications.data ?? []).map((notification) => <button key={notification.id} className={`notification-card${notification.readAt ? " is-read" : ""}`} onClick={() => !notification.readAt && markRead.mutate({ id: notification.id })}><span><FileCheck2 size={15} /></span><div><strong>{notification.title}</strong><p>{notification.message}</p><small>{dateLabel(notification.createdAt)}</small></div>{!notification.readAt && <i />}</button>)}</div>}</aside>
      </section>
      <footer className="companion-footer"><RefreshCw size={16} /><p>Your payment records are private to your account. The review queue only exposes the receipt and details needed by authorized staff.</p></footer>
    </div>
  </DashboardLayout>;
}
