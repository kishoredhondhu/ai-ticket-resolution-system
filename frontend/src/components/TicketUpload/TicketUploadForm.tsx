import React, { useState, useEffect } from "react";

import { useUploadTicket } from "../../hooks/useUploadTicket";

import { useResolutionSuggestion } from "../../hooks/useResolutionSuggestion";

import LoadingSpinner from "../Common/LoadingSpinner";

import "./TicketUploadForm.css";

/**

 * TicketUploadForm - Handles file upload and description input for ticket submission.

 */

const TicketUploadForm: React.FC = () => {
  const [description, setDescription] = useState("");

  const [category, setCategory] = useState("");

  const [priority, setPriority] = useState("");

  const [uploadProgress, setUploadProgress] = useState(0);

  const [submittedCategory, setSubmittedCategory] = useState("");

  const [submittedDescription, setSubmittedDescription] = useState("");

  const [submittedPriority, setSubmittedPriority] = useState("");

  const { uploadTicket, loading, error, ticket } = useUploadTicket();

  const {
    suggestion,

    confidence,

    similarTickets,

    loading: resolutionLoading,

    error: resolutionError,

    fetchResolution,
  } = useResolutionSuggestion();

  const categories = [
    "Hardware Request",

    "System Crash",

    "Email Issues",

    "VPN Access",

    "Password Reset",

    "Application Bug",

    "Login Issue",
  ];

  const priorities = ["Low", "Medium", "High", "Critical"];

  // Monitor ticket state updates

  useEffect(() => {
    if (ticket) {
      console.log("✅ Ticket state updated:", ticket);
    }
  }, [ticket]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setUploadProgress(0);

    // Store the submitted values before clearing

    setSubmittedCategory(category);

    setSubmittedDescription(description);

    setSubmittedPriority(priority);

    // Simulate upload progress

    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval);

          return 90;
        }

        return prev + 10;
      });
    }, 100);

    await uploadTicket({ file: null, description, category, priority });

    console.log("Ticket data received:", ticket);

    clearInterval(interval);

    setUploadProgress(100);

    // Fetch resolution from RAG service (optional - won't break if service is down)

    try {
      console.log("Fetching RAG resolution...");

      await fetchResolution(category, priority, description);

      console.log("RAG resolution received");
    } catch (err) {
      console.warn("RAG service not available:", err);

      // Continue even if resolution fails - this is optional
    }

    // Reset form after successful upload

    setTimeout(() => {
      setDescription("");

      setCategory("");

      setPriority("");

      setUploadProgress(0);
    }, 1000);
  };

  return (
    <form className="ticket-upload-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <label className="form-label">
          <span className="label-text">Category</span>

          <span className="label-required">*</span>
        </label>

        <select
          className="form-select"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          required
        >
          <option value="">Select a category...</option>

          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label className="form-label">
          <span className="label-text">Priority</span>

          <span className="label-required">*</span>
        </label>

        <select
          className="form-select"
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          required
        >
          <option value="">Select a priority...</option>

          {priorities.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label className="form-label">
          <span className="label-text">Description</span>

          <span className="label-required">*</span>
        </label>

        <textarea
          className="form-textarea"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          placeholder="Describe the issue or error encountered in detail..."
          rows={5}
        />

        <div className="char-counter">{description.length} characters</div>
      </div>

      <button
        type="submit"
        className="btn-submit"
        disabled={loading || !description || !category || !priority}
      >
        {loading ? (
          <span className="btn-loading">
            <LoadingSpinner />

            <span>Uploading...</span>
          </span>
        ) : (
          <>
            <span className="btn-icon">🚀</span>

            <span>Submit Ticket</span>
          </>
        )}
      </button>

      {loading && uploadProgress > 0 && (
        <div className="upload-progress">
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>

          <div className="progress-text">{uploadProgress}%</div>
        </div>
      )}

      {error && (
        <div className="error-message">
          <span className="error-icon">⚠️</span>

          <span>{error}</span>
        </div>
      )}

      {resolutionLoading && (
        <div className="resolution-loading">
          <LoadingSpinner />

          <span>Generating AI resolution suggestion...</span>
        </div>
      )}

      {resolutionError && (
        <div
          className="error-message"
          style={{
            background: "#fef3c7",
            color: "#92400e",
            border: "1px solid #fbbf24",
          }}
        >
          <span className="error-icon">ℹ️</span>

          <span>
            AI Resolution service is not available. Start the RAG service to get
            AI-powered suggestions.
          </span>
        </div>
      )}

      {ticket &&
        !loading &&
        !resolutionLoading &&
        (suggestion || resolutionError) && (
          <div className="resolution-container">
            <div className="ticket-summary-section">
              <div className="summary-header">
                <span className="summary-icon">📋</span>

                <h4 className="summary-title">Ticket Summary</h4>
              </div>

              <div className="summary-content">
                <div className="summary-item">
                  <span className="summary-label">Category:</span>

                  <span className="summary-value">{submittedCategory}</span>
                </div>

                <div className="summary-item">
                  <span className="summary-label">Priority:</span>

                  <span className="summary-value">{submittedPriority}</span>
                </div>

                <div className="summary-item">
                  <span className="summary-label">Description:</span>

                  <p className="summary-description">{submittedDescription}</p>
                </div>
              </div>
            </div>

            <div className="resolution-divider"></div>

            {suggestion && (
              <>
                <div className="resolution-divider"></div>

                <div className="resolution-section">
                  <div className="resolution-header">
                    <span className="resolution-icon">
                      {similarTickets && similarTickets.length > 0
                        ? "✨"
                        : "🤖"}
                    </span>

                    <h4 className="resolution-title">
                      {similarTickets && similarTickets.length > 0
                        ? "AI-Generated Resolution"
                        : "AI-Powered Solution"}
                    </h4>

                    <span className="confidence-badge">
                      {(confidence * 100).toFixed(0)}% confidence
                    </span>
                  </div>

                  {similarTickets && similarTickets.length === 0 && (
                    <div
                      className="ai-fallback-notice"
                      style={{
                        background: "#fef3c7",
                        border: "1px solid #fbbf24",
                        borderRadius: "8px",
                        padding: "12px",
                        marginBottom: "16px",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <span
                        style={{ fontSize: "20px", flexShrink: 0 }}
                        role="img"
                        aria-label="info"
                      >
                        ℹ️
                      </span>
                      <span style={{ fontSize: "14px", color: "#92400e" }}>
                        No similar historical tickets found. This solution was
                        generated by AI based on general IT support knowledge.
                      </span>
                    </div>
                  )}

                  <div className="resolution-content">
                    <p
                      className="resolution-text"
                      style={{ whiteSpace: "pre-wrap" }}
                    >
                      {suggestion}
                    </p>
                  </div>
                </div>
              </>
            )}

            {!suggestion && resolutionError && (
              <>
                <div className="resolution-divider"></div>

                <div className="resolution-section">
                  <div className="resolution-header">
                    <span className="resolution-icon">💡</span>

                    <h4 className="resolution-title">
                      Ticket Submitted Successfully
                    </h4>
                  </div>

                  <div className="resolution-content">
                    <p className="resolution-text">
                      Your ticket has been created and is ready for processing.
                      To get AI-powered resolution suggestions, please start the
                      RAG service.
                    </p>
                  </div>
                </div>
              </>
            )}

            {similarTickets &&
              similarTickets.length > 0 &&
              similarTickets.some((t) => t.similarity_score >= 0.95) && (
                <>
                  <div className="resolution-divider"></div>

                  <div className="similar-tickets-section">
                    <div className="similar-header">
                      <span className="similar-icon">🔍</span>

                      <h4 className="similar-title">
                        Similar Resolved Tickets
                      </h4>

                      <span className="similar-count">
                        {
                          similarTickets.filter(
                            (t) => t.similarity_score >= 0.95
                          ).length
                        }
                      </span>
                    </div>

                    <div className="similar-tickets-list">
                      {similarTickets
                        .filter((t) => t.similarity_score >= 0.95)
                        .map((ticket, index) => (
                          <div key={index} className="similar-ticket-card">
                            <div className="similar-ticket-header">
                              <span className="similar-ticket-category">
                                {ticket.category}
                              </span>

                              <span className="similarity-score">
                                {(ticket.similarity_score * 100).toFixed(0)}%
                                match
                              </span>
                            </div>

                            <p className="similar-ticket-description">
                              {ticket.description}
                            </p>

                            <div className="similar-ticket-resolution">
                              <strong>Resolution:</strong>

                              <p>{ticket.resolution}</p>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                </>
              )}
          </div>
        )}
    </form>
  );
};

export default TicketUploadForm;
