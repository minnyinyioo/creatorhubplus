import { useAuth } from "@/_core/hooks/useAuth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { startLogin } from "@/const";
import { trpc } from "@/lib/trpc";
import { useIsMobile } from "@/hooks/useMobile";
import { Archive, BadgeDollarSign, Bell, BookOpen, Check, FileCheck2, Landmark, LayoutDashboard, LoaderCircle, LogOut, PanelLeft, Settings2, ShieldCheck, Target, UserRound } from "lucide-react";
import { CSSProperties, useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { DashboardLayoutSkeleton } from './DashboardLayoutSkeleton';
import { Button } from "./ui/button";

const menuItems = [
  { icon: UserRound, label: "Personal centre", path: "/account" },
  { icon: Target, label: "Workspace", path: "/workspace" },
  { icon: Archive, label: "Archive", path: "/archive" },
  { icon: BookOpen, label: "Library", path: "/library" },
  { icon: Settings2, label: "Project settings", path: "/settings" },
  { icon: ShieldCheck, label: "Review queue", path: "/staff/review" },
  { icon: FileCheck2, label: "Support cases", path: "/staff/cases" },
  { icon: Landmark, label: "Merchant accounts", path: "/staff/recipients" },
  { icon: BadgeDollarSign, label: "Payment pricing", path: "/staff/pricing" },
  { icon: LayoutDashboard, label: "Public site", path: "/" },
];

const SIDEBAR_WIDTH_KEY = "sidebar-width";
const DEFAULT_WIDTH = 280;
const MIN_WIDTH = 200;
const MAX_WIDTH = 480;

export function formatUnreadBadgeCount(count: number | null | undefined) {
  if (!count || count < 1) return null;
  return count > 99 ? "99+" : String(count);
}

export function requestMarkAllNotificationsRead(unreadCount: number | null | undefined, isPending: boolean, onMarkAll: () => void) {
  if (!unreadCount || unreadCount < 1 || isPending) return false;
  onMarkAll();
  return true;
}

type NotificationMenuItem = {

  id: number;
  title: string;
  message: string;
  readAt: Date | string | null;
  createdAt: Date | string;
};

export type NotificationMenuProps = {
  unreadCount?: number;
  notifications?: readonly NotificationMenuItem[];
  isLoading: boolean;
  isError: boolean;
  isMarkingAll: boolean;
  onMarkRead: (id: number) => void;
  onMarkAll: () => void;
  onNavigate: () => void;
};

export function NotificationMenu({ unreadCount, notifications, isLoading, isError, isMarkingAll, onMarkRead, onMarkAll, onNavigate }: NotificationMenuProps) {
  const badge = formatUnreadBadgeCount(unreadCount);
  const recentNotifications = (notifications ?? []).slice(0, 5);
  return <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <button type="button" className="account-notification-trigger" aria-label={badge ? `${badge} unread review notifications` : "Review notifications"}>
        <Bell size={16} />
        {badge && <span className="account-nav-badge" aria-hidden="true">{badge}</span>}
      </button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end" sideOffset={8} className="account-notification-menu">
      <DropdownMenuLabel className="account-notification-menu-heading"><span>Review updates</span>{badge && <b>{badge} unread</b>}</DropdownMenuLabel>
      <DropdownMenuSeparator />
      {isLoading ? <div className="account-notification-state">Loading updates…</div> : isError ? <div className="account-notification-state">Updates are unavailable right now.</div> : recentNotifications.length === 0 ? <div className="account-notification-state">No review updates yet.</div> : <div className="account-notification-items">{recentNotifications.map((notification) => <DropdownMenuItem key={notification.id} className={`account-notification-item${notification.readAt ? " is-read" : ""}`} onClick={() => { if (!notification.readAt) onMarkRead(notification.id); onNavigate(); }}><span className="account-notification-icon"><FileCheck2 size={14} /></span><span><strong>{notification.title}</strong><small>{notification.message}</small></span>{!notification.readAt && <i aria-label="Unread" />}</DropdownMenuItem>)}</div>}
      <DropdownMenuSeparator />
      <div className="account-notification-actions"><button type="button" className="account-notification-all" disabled={!badge || isMarkingAll} onClick={() => { requestMarkAllNotificationsRead(unreadCount, isMarkingAll, onMarkAll); }}>{isMarkingAll ? <LoaderCircle className="account-spinner" size={14} /> : <Check size={14} />} {isMarkingAll ? "Marking…" : "Mark all as read"}</button><button type="button" className="account-notification-view" onClick={onNavigate}>View all updates</button></div>
    </DropdownMenuContent>
  </DropdownMenu>;
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarWidth, setSidebarWidth] = useState(() => {
    const saved = localStorage.getItem(SIDEBAR_WIDTH_KEY);
    return saved ? parseInt(saved, 10) : DEFAULT_WIDTH;
  });
  const { loading, user } = useAuth();

  useEffect(() => {
    localStorage.setItem(SIDEBAR_WIDTH_KEY, sidebarWidth.toString());
  }, [sidebarWidth]);

  if (loading) {
    return <DashboardLayoutSkeleton />
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-8 p-8 max-w-md w-full">
          <div className="flex flex-col items-center gap-6">
            <h1 className="text-2xl font-semibold tracking-tight text-center">
              Sign in to continue
            </h1>
            <p className="text-sm text-muted-foreground text-center max-w-sm">
              Access to this dashboard requires authentication. Continue to launch the login flow.
            </p>
          </div>
          <Button
            onClick={() => startLogin()}
            size="lg"
            className="w-full shadow-lg hover:shadow-xl transition-all"
          >
            Sign in
          </Button>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": `${sidebarWidth}px`,
        } as CSSProperties
      }
    >
      <DashboardLayoutContent setSidebarWidth={setSidebarWidth}>
        {children}
      </DashboardLayoutContent>
    </SidebarProvider>
  );
}

type DashboardLayoutContentProps = {
  children: React.ReactNode;
  setSidebarWidth: (width: number) => void;
};

function DashboardLayoutContent({
  children,
  setSidebarWidth,
}: DashboardLayoutContentProps) {
  const { user, logout } = useAuth();
  const [location, setLocation] = useLocation();
  const { state, toggleSidebar } = useSidebar();
  const isCollapsed = state === "collapsed";
  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const activeMenuItem = menuItems.find(item => item.path === location);
  const isMobile = useIsMobile();
  const notificationList = trpc.paymentNotification.listMine.useQuery(undefined, {
    refetchInterval: 30_000,
    refetchOnWindowFocus: true,
    staleTime: 15_000,
  });
  const unreadNotifications = trpc.paymentNotification.unreadCount.useQuery(undefined, {
    refetchInterval: 30_000,
    refetchOnWindowFocus: true,
    staleTime: 15_000,
  });
  const utils = trpc.useUtils();
  const markRead = trpc.paymentNotification.markRead.useMutation({ onSuccess: () => { void utils.paymentNotification.listMine.invalidate(); void utils.paymentNotification.unreadCount.invalidate(); } });
  // The dropdown action calls the protected bulk-read mutation; its success handler invalidates both caches so the badge clears immediately.
  const markAllRead = trpc.paymentNotification.markAllRead.useMutation({ onSuccess: () => { void utils.paymentNotification.listMine.invalidate(); void utils.paymentNotification.unreadCount.invalidate(); } });

  useEffect(() => {
    if (isCollapsed) {
      setIsResizing(false);
    }
  }, [isCollapsed]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;

      const sidebarLeft = sidebarRef.current?.getBoundingClientRect().left ?? 0;
      const newWidth = e.clientX - sidebarLeft;
      if (newWidth >= MIN_WIDTH && newWidth <= MAX_WIDTH) {
        setSidebarWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [isResizing, setSidebarWidth]);

  return (
    <>
      <div className="relative dashboard-layout-shell" ref={sidebarRef}>
        <Sidebar
          collapsible="icon"
          className="border-r-0"
          disableTransition={isResizing}
        >
          <SidebarHeader className="h-16 justify-center">
            <div className="flex items-center gap-3 px-2 transition-all w-full">
              <button
                onClick={toggleSidebar}
                className="h-8 w-8 flex items-center justify-center hover:bg-accent rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring shrink-0"
                aria-label="Toggle navigation"
              >
                <PanelLeft className="h-4 w-4 text-muted-foreground" />
              </button>
                                {!isCollapsed ? (
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="font-semibold tracking-tight truncate">
                        Navigation
                      </span>
                    </div>
                  ) : null}
                  <NotificationMenu
                    unreadCount={unreadNotifications.data}
                    notifications={notificationList.data}
                    isLoading={notificationList.isLoading}
                    isError={notificationList.isError}
                    isMarkingAll={markAllRead.isPending}
                    onMarkRead={(id) => markRead.mutate({ id })}
                    onMarkAll={() => markAllRead.mutate()}
                    onNavigate={() => setLocation("/account")}
                  />

            </div>
          </SidebarHeader>

          <SidebarContent className="gap-0">
            <SidebarMenu className="px-2 py-1">
              {menuItems.map(item => {
                const isActive = location === item.path;
                return (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton
                      isActive={isActive}
                      onClick={() => setLocation(item.path)}
                      tooltip={item.label}
                      className={`h-10 transition-all font-normal`}
                    >
                      <item.icon
                        className={`h-4 w-4 ${isActive ? "text-primary" : ""}`}
                      />
                      <span>{item.label}</span>
                      {item.path === "/account" && formatUnreadBadgeCount(unreadNotifications.data) && <span className="account-nav-badge group-data-[collapsible=icon]:hidden" aria-label={`${unreadNotifications.data} unread review notifications`}>{formatUnreadBadgeCount(unreadNotifications.data)}</span>}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarContent>

          <SidebarFooter className="p-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-3 rounded-lg px-1 py-1 hover:bg-accent/50 transition-colors w-full text-left group-data-[collapsible=icon]:justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  <Avatar className="h-9 w-9 border shrink-0">
                    <AvatarFallback className="text-xs font-medium">
                      {user?.name?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0 group-data-[collapsible=icon]:hidden">
                    <p className="text-sm font-medium truncate leading-none">
                      {user?.name || "-"}
                    </p>
                    <p className="text-xs text-muted-foreground truncate mt-1.5">
                      {user?.email || "-"}
                    </p>
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem
                  onClick={logout}
                  className="cursor-pointer text-destructive focus:text-destructive"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarFooter>
        </Sidebar>
        <div
          className={`absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-primary/20 transition-colors ${isCollapsed ? "hidden" : ""}`}
          onMouseDown={() => {
            if (isCollapsed) return;
            setIsResizing(true);
          }}
          style={{ zIndex: 50 }}
        />
      </div>

      <SidebarInset>
        {isMobile && (
          <div className="flex border-b h-14 items-center justify-between bg-background/95 px-2 backdrop-blur supports-[backdrop-filter]:backdrop-blur sticky top-0 z-40">
                          <div className="flex items-center gap-2">
                <SidebarTrigger className="h-9 w-9 rounded-lg bg-background" />
                <div className="flex items-center gap-3">

                <div className="flex flex-col gap-1">
                  <span className="tracking-tight text-foreground">
                    {activeMenuItem?.label ?? "Menu"}
                  </span>
                </div>
              </div>
              <NotificationMenu
                unreadCount={unreadNotifications.data}
                notifications={notificationList.data}
                isLoading={notificationList.isLoading}
                isError={notificationList.isError}
                isMarkingAll={markAllRead.isPending}
                onMarkRead={(id) => markRead.mutate({ id })}
                onMarkAll={() => markAllRead.mutate()}
                onNavigate={() => setLocation("/account")}
              />
            </div>
          </div>
        )}
        <main className="flex-1 p-4">{children}</main>
      </SidebarInset>
    </>
  );
}
