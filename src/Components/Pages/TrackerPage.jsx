import { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import './TrackerPage.css';

// TrackerPage.jsx
const API = 'https://attendance-backend-tbry.onrender.com';

export default function TrackerPage() {
  const [time, setTime] = useState(new Date());
  const [sessionId, setSessionId] = useState(
    localStorage.getItem('activeSession')
  );
  const [attendanceData, setAttendanceData] = useState({});
  const [selectedDate, setSelectedDate] = useState(null);
  const [regReason, setRegReason] = useState('');
  const [studentName, setStudentName] = useState(
    localStorage.getItem('studentName') || ''
  );
  const [totalPresent, setTotalPresent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    fetchMonthlySummary();
    fetchStats();
    return () => clearInterval(timer);
  }, []);

  const fetchMonthlySummary = async () => {
    try {
      const res = await fetch(`${API}/attendance/month-summary`);
      const data = await res.json();
      setAttendanceData(data);
    } catch (err) {
      console.error('Failed to fetch summary:', err);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await fetch(`${API}/attendance`);
      const data = await res.json();
      // Adjust this based on your API response structure
      setTotalPresent(data.count || 0);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  // --- PDF GENERATION LOGIC ---
  const generatePDF = () => {
    const doc = new jsPDF();

    // Design Settings
    const primaryColor = [229, 9, 20]; // Netflix Red

    doc.setFontSize(22);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text('ATTENDANCE REPORT', 14, 20);

    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Student: ${studentName || 'Not Specified'}`, 14, 30);
    doc.text(
      `Month: ${time.toLocaleString('default', { month: 'long' })} ${time.getFullYear()}`,
      14,
      36
    );
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 42);

    const tableRows = Object.entries(attendanceData)
      .sort((a, b) => new Date(a[0]) - new Date(b[0]))
      .map(([date, status]) => [date, status]);

    autoTable(doc, {
      startY: 50,
      head: [['Date', 'Status']],
      body: tableRows,
      headStyles: { fillColor: primaryColor },
      alternateRowStyles: { fillColor: [250, 250, 250] },
      margin: { top: 50 },
    });

    doc.save(`${studentName || 'Student'}_Attendance.pdf`);
  };

  const handlePunch = async () => {
    let currentName = studentName;
    if (!currentName) {
      currentName = prompt('Please enter your Full Name:');
      if (!currentName) return;
      setStudentName(currentName);
      localStorage.setItem('studentName', currentName);
    }

    if (!sessionId) {
      const res = await fetch(`${API}/attendance/signin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: currentName }),
      });
      const data = await res.json();
      if (data.record_id) {
        setSessionId(data.record_id);
        localStorage.setItem('activeSession', data.record_id);
      }
    } else {
      await fetch(`${API}/attendance/signout/${sessionId}`, { method: 'POST' });
      setSessionId(null);
      localStorage.removeItem('activeSession');
      fetchMonthlySummary();
      fetchStats();
    }
  };

  const submitRegularization = async e => {
    e.preventDefault();
    await fetch(`${API}/attendance/regularize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        date: selectedDate,
        reason: regReason,
        name: studentName,
      }),
    });
    alert(`Request for ${selectedDate} submitted.`);
    setSelectedDate(null);
    setRegReason('');
    fetchMonthlySummary();
  };

  const getDaysInMonth = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const daysCount = new Date(year, month + 1, 0).getDate();
    return Array.from({ length: daysCount }, (_, i) => {
      const day = i + 1;
      return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    });
  };

  return (
    <div className="netflix-bg">
      <div className="tracker-wrapper">
        <div className="clock-section glass-card">
          <div className="user-profile-header">
            {studentName && (
              <div className="user-info">
                <p className="user-welcome">
                  Active: <strong>{studentName}</strong>
                </p>
                <button
                  className="btn-switch"
                  onClick={() => {
                    localStorage.removeItem('studentName');
                    setStudentName('');
                  }}
                >
                  Switch User
                </button>
              </div>
            )}
          </div>

          <div className="live-clock-container">
            <div className="live-date">
              {time.toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
              })}
            </div>
            <div className="live-clock">{time.toLocaleTimeString()}</div>
          </div>

          <button
            className={`punch-btn-pro ${sessionId ? 'out' : 'in'}`}
            onClick={handlePunch}
          >
            {sessionId ? 'PUNCH OUT' : 'PUNCH IN'}
          </button>
        </div>

        <div className="stats-strip">
          <div className="stat-item">
            <span className="stat-label">Present</span>
            <span className="stat-value">{totalPresent}</span>
          </div>
          <button className="btn-download" onClick={generatePDF}>
            Download PDF Report
          </button>
        </div>

        <div className="calendar-section glass-card">
          <div className="calendar-header">
            <h3>Attendance Health</h3>
            <div className="legend">
              <span className="legend-item">
                <i className="dot present"></i> Present
              </span>
              <span className="legend-item">
                <i className="dot pending-approval"></i> Pending
              </span>
              <span className="legend-item">
                <i className="dot shortage"></i> Shortage
              </span>
            </div>
          </div>

          <div className="calendar-grid">
            {getDaysInMonth().map(dateStr => {
              const rawStatus = attendanceData[dateStr] || 'Absent';
              const statusClass = rawStatus.replace(/\s+/g, '-').toLowerCase();
              const dayNum = dateStr.split('-')[2];
              const isFuture = new Date(dateStr) > new Date();

              return (
                <div
                  key={dateStr}
                  className={`day-tile ${statusClass} ${isFuture ? 'future' : ''}`}
                  onClick={() => !isFuture && setSelectedDate(dateStr)}
                >
                  <span className="tile-num">{dayNum}</span>
                  {!isFuture && <div className="status-bar"></div>}
                </div>
              );
            })}
          </div>
        </div>

        {selectedDate && (
          <div className="modal-overlay">
            <div className="reg-modal glass-card">
              <h2>Regularize</h2>
              <p>Date: {selectedDate}</p>
              <form onSubmit={submitRegularization}>
                <select
                  required
                  onChange={e => setRegReason(e.target.value)}
                  className="reg-select"
                >
                  <option value="">Reason</option>
                  <option value="Forgot to Punch">Forgot to Punch</option>
                  <option value="College Event">College Event (OD)</option>
                  <option value="Technical Error">Technical Error</option>
                </select>
                <textarea
                  placeholder="Notes..."
                  value={regReason}
                  onChange={e => setRegReason(e.target.value)}
                  required
                />
                <div className="modal-btns">
                  <button type="button" onClick={() => setSelectedDate(null)}>
                    Close
                  </button>
                  <button type="submit" className="btn-submit">
                    Submit
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
