import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import SignalForm from '../components/SignalForm';
import SignalList from '../components/SignalList';

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'submit'>('dashboard');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleSignalSubmitted = () => {
    setRefreshTrigger(prev => prev + 1);
    setActiveTab('dashboard');
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-content">
          <h1>Secure Signal Dashboard</h1>
          <div className="user-info">
            <span>Welcome, {user?.username}</span>
            <button onClick={handleLogout} className="logout-button">
              Logout
            </button>
          </div>
        </div>
        
        <nav className="dashboard-nav">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`nav-button ${activeTab === 'dashboard' ? 'active' : ''}`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('submit')}
            className={`nav-button ${activeTab === 'submit' ? 'active' : ''}`}
          >
            Submit Signal
          </button>
        </nav>
      </header>

      <main className="dashboard-main">
        {activeTab === 'dashboard' ? (
          <SignalList refreshTrigger={refreshTrigger} />
        ) : (
          <SignalForm onSuccess={handleSignalSubmitted} />
        )}
      </main>
    </div>
  );
};

export default Dashboard;