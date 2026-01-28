import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import './MainPage.css';

const IP_ADDRESS = '192.168.1.7'; // Your specific IP
const API_BASE = `http://${IP_ADDRESS}:8000`;
const FRONTEND_URL = `http://${IP_ADDRESS}:3000/tracker`;

function MainPage() {
  const [attendance, setAttendance] = useState(0);
  const [studentName] = useState(
    localStorage.getItem('studentName') || 'Sneha'
  );

  const TOTAL_CLASSES = 50;
  const currentPercent = (attendance / TOTAL_CLASSES) * 100;
  const classesNeeded = Math.ceil(0.75 * TOTAL_CLASSES - attendance);
  const isSafe = currentPercent >= 75;

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch(`${API_BASE}/attendance`);
        const data = await res.json();
        setAttendance(data.count || 0);
      } catch (err) {
        console.error('Failed to fetch attendance:', err);
      }
    };
    fetchStats();
  }, []);

  const handleGenerateReport = () => {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.setTextColor(229, 9, 20);
    doc.text('OFFICIAL ATTENDANCE RECORD', 14, 22);

    autoTable(doc, {
      startY: 30,
      head: [['Metric', 'Details']],
      body: [
        ['Student Name', studentName],
        ['Student ID', 'HUM-259'],
        ['Total Classes', TOTAL_CLASSES],
        ['Attended', attendance],
        ['Percentage', `${currentPercent.toFixed(1)}%`],
        ['Status', isSafe ? 'ELIGIBLE' : 'DE-BARRED'],
      ],
      theme: 'grid',
      headStyles: { fillColor: [229, 9, 20] },
    });

    doc.save(`${studentName}_Report.pdf`);
  };

  return (
    <div className="netflix-bg">
      <div className="dashboard-wrapper">
        <header className="pro-header">
          <div className="user-profile">
            <div className="avatar-container">
              <img
                src="https://via.placeholder.com/150"
                alt="Profile"
                className="main-avatar"
              />
            </div>
            <div className="user-meta">
              <h1>{studentName}</h1>
              <p>
                ID: HUM-259 | <span>NEST Technical Project</span>
              </p>
            </div>
          </div>
          <button className="export-pill" onClick={handleGenerateReport}>
            Generate Report
          </button>
        </header>

        <div className="stats-container">
          <div className="glass-card">
            <span className="card-label">Attendance</span>
            <div className="big-stat">
              {attendance}
              <span>/{TOTAL_CLASSES}</span>
            </div>
            <div className="progress-track">
              <div
                className="progress-bar"
                style={{
                  width: `${Math.min(currentPercent, 100)}%`,
                  background: isSafe ? '#46d369' : '#e50914',
                }}
              ></div>
            </div>
            <p className="helper-text">
              {isSafe
                ? 'Criteria Met ✅'
                : `Need ${classesNeeded > 0 ? classesNeeded : 0} more sessions`}
            </p>
          </div>

          <div className="glass-card status-card">
            <span className="card-label">Eligibility Status</span>
            <div className={`status-badge ${isSafe ? 'safe' : 'danger'}`}>
              {isSafe ? 'ELIGIBLE' : 'DE-BARRED'}
            </div>
            <p className="helper-text">Requirement: 75% Attendance</p>
          </div>
        </div>

        <section className="qr-focus-area">
          <div className="qr-card shadow-pop">
            <h3>Digital Gate Pass</h3>
            <div className="qr-box-wrapper">
              {/* The Scanning Line Animation */}
              <div className="scanner-line"></div>

              <div className="qr-box">
                <QRCodeSVG
                  value={FRONTEND_URL}
                  size={180}
                  level="H"
                  includeMargin={true}
                />
              </div>
            </div>
            <p className="scan-hint">Scan to Sign-In</p>
          </div>
        </section>
      </div>
    </div>
  );
}

export default MainPage;
