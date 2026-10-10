import { useCallback, useEffect, useState } from 'react';
import { getStudents } from './api.js';
import AttendanceForm from './components/AttendanceForm.jsx';
import Dashboard from './components/Dashboard.jsx';
import MarksForm from './components/MarksForm.jsx';
import MessagesForm from './components/MessagesForm.jsx';
import Monitor from './components/Monitor.jsx';
import { AlertMessage } from './components/shared.jsx';

const TABS = [
  { id: 'dashboard', label: 'Dashboard', icon: 'bi-grid-1x2' },
  { id: 'marks', label: 'Marks & Assessments', icon: 'bi-pencil-square' },
  { id: 'attendance', label: 'Attendance', icon: 'bi-calendar-check' },
  { id: 'monitor', label: 'Monitor', icon: 'bi-activity' },
  { id: 'messages', label: 'Messages', icon: 'bi-chat-dots' },
];

export default function App() {
  const [students, setStudents] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const reloadStudents = useCallback(async () => {
    const data = await getStudents();
    if (!Array.isArray(data)) throw new Error('The server returned an invalid student list.');
    setStudents(data);
    setLoadError('');
  }, []);

  useEffect(() => {
    let active = true;
    getStudents()
      .then((data) => {
        if (!Array.isArray(data)) throw new Error('The server returned an invalid student list.');
        if (active) {
          setStudents(data);
          setLoadError('');
        }
      })
      .catch((error) => {
        if (active) setLoadError(error.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-bs-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  function toggleTheme() {
    setTheme((current) => current === 'dark' ? 'light' : 'dark');
  }

  return (
    <main className="min-vh-100 bg-app">
      <div className="position-absolute top-0 start-0 p-3 p-md-4 mt-1 z-3">
        <button type="button" className="d-flex align-items-center justify-content-center theme-toggle-btn" aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`} onClick={toggleTheme}>
          <i className={`bi ${theme === 'dark' ? 'bi-sun-fill text-warning' : 'bi-moon-stars-fill text-primary'}`} />
        </button>
      </div>
      <div className="container py-4 py-md-5">
        <header className="mb-4 text-center">
          <h1 className="app-title">Student Performance Predictor</h1>
          <p className="app-subtitle">AI-Based Early Intervention System for Academic Excellence</p>
        </header>

        <nav className="d-flex justify-content-center w-100 mb-4" aria-label="Main navigation">
          <div className="nav nav-tabs app-tabs" role="tablist">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                id={`tab-${tab.id}`}
                type="button"
                role="tab"
                aria-selected={activeTab === tab.id}
                aria-controls={`pane-${tab.id}`}
                className={`nav-link ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <i className={`bi ${tab.icon} me-1`} />{tab.label}
              </button>
            ))}
          </div>
        </nav>

        {loadError && (
          <AlertMessage className="mb-4">
            Unable to load students from the Spring Boot API: {loadError}
            <button type="button" className="btn btn-sm btn-outline-danger ms-3" onClick={() => { setLoading(true); reloadStudents().catch((error) => setLoadError(error.message)).finally(() => setLoading(false)); }}>
              Retry
            </button>
          </AlertMessage>
        )}
        {loading ? (
          <div className="card app-card p-5 text-center" role="status">
            <div className="spinner-border text-primary mx-auto mb-3" aria-hidden="true" />
            <span>Loading student data…</span>
          </div>
        ) : (
          <div id={`pane-${activeTab}`} role="tabpanel" aria-labelledby={`tab-${activeTab}`}>
            {activeTab === 'dashboard' && <Dashboard students={students} theme={theme} />}
            {activeTab === 'marks' && <MarksForm />}
            {activeTab === 'attendance' && <AttendanceForm students={students} onSaved={reloadStudents} />}
            {activeTab === 'monitor' && <Monitor students={students} />}
            {activeTab === 'messages' && <MessagesForm students={students} />}
          </div>
        )}
        <footer className="text-center text-muted small mt-4">
          React frontend · Spring Boot API
        </footer>
      </div>
    </main>
  );
}
