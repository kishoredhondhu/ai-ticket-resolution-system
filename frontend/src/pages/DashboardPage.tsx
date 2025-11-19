import React, { useEffect, useState } from "react";

import TicketUploadForm from "../components/TicketUpload/TicketUploadForm";

import SimilarTicketsList from "../components/SimilarTickets/SimilarTicketsList";

import { useSimilarTickets } from "../hooks/useSimilarTickets";

import "./DashboardPage.css";

const DashboardPage: React.FC = () => {
  // Disable the similar tickets API call since we're using RAG service

  const { tickets } = useSimilarTickets({ enabled: false });

  const [statsVisible, setStatsVisible] = useState(false);

  useEffect(() => {
    setTimeout(() => setStatsVisible(true), 300);
  }, []);

  return (
    <div className="dashboard-page">
      <div className="hero-section">
        <div className="hero-background">
          <div className="floating-shape shape-1"></div>

          <div className="floating-shape shape-2"></div>

          <div className="floating-shape shape-3"></div>
        </div>

        <div className="hero-content">
          <div className="hero-badge">
            <span className="badge-icon">🚀</span>

            <span>Powered by Advanced AI</span>
          </div>

          <h1 className="hero-title">TicketGenie Dashboard</h1>

          <p className="hero-subtitle">
            AI-Powered IT Support Ticket Management System
          </p>

          <div className={`hero-stats ${statsVisible ? "visible" : ""}`}>
            <div className="stat-item">
              <div className="stat-icon">⚡</div>

              <div className="stat-value">95%</div>

              <div className="stat-label">Accuracy Rate</div>
            </div>

            <div className="stat-item">
              <div className="stat-icon">⏱️</div>

              <div className="stat-value">&lt;2s</div>

              <div className="stat-label">Avg Response</div>
            </div>

            <div className="stat-item">
              <div className="stat-icon">📊</div>

              <div className="stat-value">10K+</div>

              <div className="stat-label">Tickets Resolved</div>
            </div>
          </div>
        </div>
      </div>

      <div className="dashboard-container">
        <div className="dashboard-section">
          <div className="section-header">
            <div className="section-icon">📝</div>

            <h2>Submit New Ticket</h2>
          </div>

          <TicketUploadForm />
        </div>

        {/* Similar tickets are now shown within the resolution response from RAG service */}

        {tickets.length > 0 && (
          <div className="dashboard-section">
            <div className="section-header">
              <div className="section-icon">🔍</div>

              <h2>Similar Historical Tickets</h2>
            </div>

            <SimilarTicketsList tickets={tickets} />
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
