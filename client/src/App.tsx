import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, useLocation } from "wouter";
import { useEffect } from "react";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import BurmeseHome from "./pages/BurmeseHome";
import Privacy from "./pages/Privacy";
import BurmesePrivacy from "@/pages/BurmesePrivacy";
import Terms from "@/pages/Terms";
import BurmeseTerms from "@/pages/BurmeseTerms";
import PaymentRequest from "@/pages/PaymentRequest";
import StaffRecipients from "@/pages/StaffRecipients";
import StaffReview from "@/pages/StaffReview";
import StaffCases from "@/pages/StaffCases";
import Workspace from "@/pages/Workspace";
import Archive from "@/pages/Archive";
import Library from "@/pages/Library";
import ProjectSettings from "@/pages/ProjectSettings";
import Account from "@/pages/Account";
import StaffPricing from "@/pages/StaffPricing";

export function getDocumentLocale(pathname: string, search = "") {
  const queryLocale = new URLSearchParams(search).get("lang");
  return pathname === "/my" || pathname.startsWith("/my/") || queryLocale === "my" ? "my" : "en";
}

function DocumentLocale() {
  const [location] = useLocation();
  useEffect(() => {
    document.documentElement.lang = getDocumentLocale(location, window.location.search);
  }, [location]);
  return null;
}

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <>
      <DocumentLocale />
      <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/my"} component={BurmeseHome} />
      <Route path={"/privacy"} component={Privacy} />
      <Route path={"/my/privacy"} component={BurmesePrivacy} />
      <Route path={"/terms"} component={Terms} />
      <Route path={"/my/terms"} component={BurmeseTerms} />
      <Route path={"/payment"} component={PaymentRequest} />
      <Route path={"/account"} component={Account} />
      <Route path={"/staff/review"} component={StaffReview} />
      <Route path={"/staff/cases"} component={StaffCases} />
      <Route path={"/workspace"} component={Workspace} />
      <Route path={"/archive"} component={Archive} />
      <Route path={"/library"} component={Library} />
      <Route path={"/settings"} component={ProjectSettings} />
      <Route path={"/staff/recipients"} component={StaffRecipients} />
      <Route path={"/staff/pricing"} component={StaffPricing} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
      </Switch>
    </>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        // switchable
      >
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
