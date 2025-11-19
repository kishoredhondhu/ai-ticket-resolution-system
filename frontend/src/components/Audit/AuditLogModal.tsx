import React from "react";

interface Props {
  logs: string[];

  onClose: () => void;
}

const AuditLogModal: React.FC<Props> = ({ logs, onClose }) => (
  <div className="modal audit-log-modal">
    <h3>Audit Log</h3>

    <ul>
      {logs.map((log, idx) => (
        <li key={idx}>{log}</li>
      ))}
    </ul>

    <button onClick={onClose}>Close</button>
  </div>
);

export default AuditLogModal;
