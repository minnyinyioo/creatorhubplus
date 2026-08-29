import { AlertCircle, Home } from "lucide-react";
import { useLocation } from "wouter";

export default function NotFound() {
  const [, setLocation] = useLocation();

  const handleGoHome = () => {
    setLocation("/");
  };

  return (
    <main className="notfound-page">
      <section className="notfound-card">
        <AlertCircle className="notfound-icon" size={34} aria-hidden="true" />
        <p className="notfound-code">404</p>
        <h1>Page not found</h1>
        <p className="notfound-detail">
          The page you are looking for doesn't exist. It may have been moved or
          removed during a redesign.
        </p>
        <div id="not-found-button-group" className="notfound-actions">
          <button className="coral-button" onClick={handleGoHome}>
            <Home className="w-4 h-4" /> Back to CreatorHubPlus
          </button>
        </div>
        <p className="notfound-meta">CreatorHubPlus — creator earnings and payout support</p>
      </section>
    </main>
  );
}
