import { useState, useEffect } from 'react';
import './ProfessorDashboard.css';

const API = 'http://192.168.1.7:8000';

export default function ProfessorDashboard() {
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await fetch(`${API}/professor/pending`);
      const data = await res.json();
      setRequests(data);
    } catch (err) {
      console.error('Failed to fetch pending requests:', err);
    }
  };

  const handleAction = async (id, status) => {
    try {
      await fetch(`${API}/professor/action/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      fetchRequests(); // Refresh the list after action
    } catch (err) {
      console.error('Action failed:', err);
    }
  };

  return (
    <div className="netflix-bg prof-wrapper">
      <div className="glass-card">
        <div className="prof-header">
          <h2 className="prof-title">Regularization Requests</h2>
          <span className="request-count">{requests.length} Pending</span>
        </div>

        {requests.length === 0 ? (
          <div className="empty-state">
            <p className="status-text">All caught up! No pending requests.</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="prof-table">
              <thead>
                <tr>
                  <th>Student Name</th>
                  <th>Request Info & Reason</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {requests.map(req => (
                  <tr key={req.id}>
                    <td className="student-name-cell">
                      {req.student_name || `Student #${req.id}`}
                    </td>
                    <td className="notes-cell">
                      <div className="request-notes">{req.notes}</div>
                    </td>
                    <td className="actions-cell">
                      <button
                        className="btn-approve"
                        onClick={() => handleAction(req.id, 'Approved')}
                      >
                        Approve
                      </button>
                      <button
                        className="btn-reject"
                        onClick={() => handleAction(req.id, 'Rejected')}
                      >
                        Reject
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
