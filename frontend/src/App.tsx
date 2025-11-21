import { Route, Routes, Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";

import TicketDetailPage from "./pages/TicketDetailPage";

import "./styles/main.scss";

import "./App.css";

function PageTransition({ children }: { children: React.ReactNode }) {
  const location = useLocation();

  const [displayLocation, setDisplayLocation] = useState(location);

  const [transitionStage, setTransitionStage] = useState("fadeIn");

  useEffect(() => {
    if (location !== displayLocation) {
      setTransitionStage("fadeOut");
    }
  }, [location, displayLocation]);

  return (
    <div
      className={`page-transition ${transitionStage}`}
      onAnimationEnd={() => {
        if (transitionStage === "fadeOut") {
          setTransitionStage("fadeIn");

          setDisplayLocation(location);
        }
      }}
    >
      {children}
    </div>
  );
}

function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => 'light');

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === 'light' ? 'dark' : 'light'));

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-header-content">
          <Link to="/" className="app-logo">
            TicketGenie
          </Link>
          {/* Navigation removed per user request (dashboard & history). */}
          <button
            type="button"
            aria-label="Toggle theme"
            className="theme-toggle-btn btn-secondary"
            onClick={toggleTheme}
          >
            <span className="theme-toggle-icon" role="img" aria-hidden="true">
              {theme === 'light' ? '🌙' : '☀️'}
            </span>
          </button>
        </div>
      </header>
      <main className="app-main">
        <PageTransition>
          <Routes>
            {/* Minimal home placeholder after removing dashboard/history pages */}
            <Route path="/" element={<div className="home-placeholder">Welcome to TicketGenie</div>} />
            <Route path="/ticket/:id" element={<TicketDetailPage />} />
          </Routes>
        </PageTransition>
      </main>
      <footer className="app-footer">
        <p>TicketGenie</p>
        <p>&copy; 2025 AI-Powered IT Support - Developed for Hackathon 2025</p>
      </footer>
    </div>
  );
}

export default App;
