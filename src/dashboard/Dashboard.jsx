import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import DashboardHeader from './components/DashboardHeader';
import StatsOverview from './components/StatsOverview';
import QuickAccess from './components/QuickAccess';
import OverviewPanel from './components/OverviewPanel';
import AlertsPanel from './components/AlertsPanel';
import ChartsSection from './components/ChartsSection';
import NotificationsPanel from './components/NotificationsPanel';
import TasksList from './components/TasksList';
import WeatherWidget from './components/WeatherWidget';
import TasksPage from './pages/TasksPage';
import CalendarPage from './pages/CalendarPage';
import AnalyticsPage from './pages/AnalyticsPage';
import DroneIoTPage from './pages/DroneIoTPage';
import FinancialPage from './pages/FinancialPage';
import LearningPage from './pages/LearningPage';
import TransportPage from './pages/TransportPage';
import './styles/Dashboard.css';
import './styles/RagoujDashboard.css';

const Dashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentPage, setCurrentPage] = useState('Dashboard');

  const renderContent = () => {
    switch (currentPage) {
      case 'Tasks':
        return <TasksPage />;
      case 'Calendar':
        return <CalendarPage />;
      case 'Transport':
        return <TransportPage />;
      case 'Analytics':
        return <AnalyticsPage />;
      case 'Drone & IoT':
        return <DroneIoTPage />;
      case 'Financial':
        return <FinancialPage />;
      case 'Learning':
        return <LearningPage />;
      case 'Dashboard':
      default:
        return (
          <main className="dashboard-main">
            <section className="dashboard-ragouj-hero">
              <div className="dashboard-hero-copy">
                <span>RAGOUJ RURAL COOPERATIVE · SHEFARMS</span>
                <h2>Welcome inside the village fields</h2>
                <p>One workspace for farm planning, soil insights, and shared progress.</p>
              </div>
            </section>
            <div className="dashboard-demo-notice">
              <strong>Demonstration data notice</strong>
              <span>Some overview, weather, and finance cards are sample data. Soil Analysis is connected to the virtual sensor service when it is running.</span>
            </div>
            <StatsOverview />
            
            <div className="dashboard-grid">
              <div className="main-content-column">
                <div className="dashboard-row">
                  <QuickAccess />
                  <OverviewPanel />
                </div>
                
                <div className="dashboard-row">
                  <ChartsSection />
                  <WeatherWidget />
                </div>
              </div>
              
              <div className="side-panels-column">
                <AlertsPanel />
                <NotificationsPanel />
                <TasksList />
              </div>
            </div>
          </main>
        );
    }
  };

  return (
    <div className="dashboard-app">
      <Sidebar 
        isOpen={sidebarOpen} 
        currentPage={currentPage}
        onPageChange={setCurrentPage}
      />
      
      <div className={`dashboard-main-content ${sidebarOpen ? '' : 'collapsed'}`}>
        <DashboardHeader 
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} 
          sidebarCollapsed={!sidebarOpen}
          currentPage={currentPage}
        />
        
        {renderContent()}
      </div>
    </div>
  );
};

export default Dashboard;
