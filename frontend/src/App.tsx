import { Route, Routes, Link, useLocation } from "react-router-dom";

import { useState, useEffect } from "react";

import DashboardPage from "./pages/DashboardPage";

import TicketDetailPage from "./pages/TicketDetailPage";

import HistoryPage from "./pages/HistoryPage";

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
  return (
    <div className="app">
      <header className="app-header">
        <div className="app-header-content">
          <Link to="/" className="app-logo">
            TicketGenie
          </Link>

          <nav className="app-nav">
            <Link to="/">Dashboard</Link>

            <Link to="/history">History</Link>
          </nav>
        </div>
      </header>

      <main className="app-main">
        <PageTransition>
          <Routes>
            <Route path="/" element={<DashboardPage />} />

            <Route path="/ticket/:id" element={<TicketDetailPage />} />

            <Route path="/history" element={<HistoryPage />} />
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
