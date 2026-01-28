import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import './MainPage.css';

// --- UPDATED FOR CLOUD ---
const API_BASE = 'https://attendance-backend-tbry.onrender.com';
const FRONTEND_URL = 'https://attendance-tracker-frontend-psi.vercel.app/tracker';

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
        // This now calls Render instead of your local IP
        const res = await fetch(`${API_BASE}/attendance`);
        const data = await res.json();
        setAttendance(data.count || 0);
      } catch (err) {
        console.error('Failed to fetch attendance:', err);
      }
    };
    fetchStats();
  }, []);

  // ... (rest of your handleGenerateReport function stays the same)