import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import UiIcon from '../../components/UiIcon';

const DashboardHeader = ({ onToggleSidebar, sidebarCollapsed, currentPage }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const getPageTitle = (page) => {
    switch (page) {
      case 'Tasks':
        return 'Farm Tasks';
      case 'Calendar':
        return 'Calendar & Planning';
      case 'Drone & IoT':
        return 'Drone & IoT';
      case 'Analytics':
        return 'Soil Analysis';
      case 'Financial':
        return 'Financial Management';
      case 'Learning':
        return 'Learning Hub';
      case 'Dashboard':
      default:
        return 'Overview';
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    console.log('Searching for:', searchQuery);
  };

  return (
    <header className="dashboard-header">
      <div className="dashboard-header-left">
        <button 
          className="dashboard-menu-toggle"
          onClick={onToggleSidebar}
          aria-label="Toggle sidebar"
        >
          {sidebarCollapsed ? '▶' : '◀'}
        </button>
        <div className="dashboard-header-title">
          <h1>{getPageTitle(currentPage)}</h1>
        </div>
      </div>

      <div className="dashboard-header-right">
        <form className="dashboard-search-box" onSubmit={handleSearch}>
          <input 
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </form>
        
        <div className="dashboard-user-menu">
          <span className="dashboard-notification"><UiIcon name="bell" /></span>
          <Link 
            to="/profile" 
            className="dashboard-header-user-avatar" 
            style={{ textDecoration: 'none', cursor: 'pointer' }}
            title="Voir le profil"
          >
            <UiIcon name="user" />
          </Link>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
