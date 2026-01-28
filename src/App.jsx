import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainPage from './Components/Pages/mainpage';
import TrackerPage from './Components/Pages/TrackerPage';
import ProfessorDashboard from './Components/Pages/ProfessorDashboard'; // New Import
import './App.css';

// Ensure this IP matches your backend terminal output
const API = 'http://192.168.1.7:8000';

function App() {
  const [attendance, setAttendance] = useState(0);
  const [activities, setActivities] = useState([]);

  const fetchData = async () => {
    try {
      // 1. Fetch count of classes completed (e.g., for the 50-class progress bar)
      const attRes = await fetch(`${API}/attendance`);
      const attData = await attRes.json();
      setAttendance(attData.count);

      // 2. Fetch the activity logs
      const actRes = await fetch(`${API}/activities`);
      const actData = await actRes.json();
      setActivities(actData);
    } catch (err) {
      console.error('Connection Failed. Check if Backend is running:', err);
    }
  };

  useEffect(() => {
    fetchData();
    // Optional: Refresh data every 30 seconds to keep the dashboard live
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Router>
      <Routes>
        {/* STUDENT MAIN DASHBOARD */}
        <Route
          path="/"
          element={<MainPage attendance={attendance} logs={activities} />}
        />

        {/* STUDENT PUNCH-IN / CALENDAR PAGE */}
        <Route
          path="/tracker"
          element={
            <TrackerPage
              attendance={attendance}
              setAttendance={setAttendance}
              activities={activities}
              setActivities={setActivities}
              refreshData={fetchData} // Pass refresh function
            />
          }
        />

        {/* PROFESSOR APPROVAL PANEL */}
        <Route
          path="/professor"
          element={<ProfessorDashboard refreshData={fetchData} />}
        />
      </Routes>
    </Router>
  );
}

export default App;
