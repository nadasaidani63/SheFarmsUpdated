import React from 'react';

const TaskFilters = ({ filters, onFiltersChange, teamMembers }) => {
  const handleFilterChange = (filterType, value) => {
    onFiltersChange(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  return (
    <div className="tasks-filters">
      <div className="filter-group">
        <div className="filter-item">
          <label className="filter-label">Statut</label>
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="filter-select"
          >
            <option value="all">Tous les statuts</option>
            <option value="pending">En attente</option>
            <option value="in-progress">En cours</option>
            <option value="completed">Terminé</option>
          </select>
        </div>

        <div className="filter-item">
          <label className="filter-label">Type</label>
          <select
            value={filters.type}
            onChange={(e) => handleFilterChange('type', e.target.value)}
            className="filter-select"
          >
            <option value="all">Tous les types</option>
            <option value="personal">Personnel</option>
            <option value="collective">Collectif</option>
          </select>
        </div>

        <div className="filter-item">
          <label className="filter-label">Assigné à</label>
          <select
            value={filters.assignee}
            onChange={(e) => handleFilterChange('assignee', e.target.value)}
            className="filter-select"
          >
            <option value="all">Tous les membres</option>
            {teamMembers.map(member => (
              <option key={member} value={member}>
                {member}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-item">
          <label className="filter-label">Actions rapides</label>
          <div className="quick-actions">
            <button
              className={`filter-btn ${filters.status === 'pending' ? 'active' : ''}`}
              onClick={() => handleFilterChange('status', filters.status === 'pending' ? 'all' : 'pending')}
            >
              En attente
            </button>
            <button
              className={`filter-btn ${filters.status === 'in-progress' ? 'active' : ''}`}
              onClick={() => handleFilterChange('status', filters.status === 'in-progress' ? 'all' : 'in-progress')}
            >
              En cours
            </button>
            <button
              className={`filter-btn ${filters.assignee === 'Vous' ? 'active' : ''}`}
              onClick={() => handleFilterChange('assignee', filters.assignee === 'Vous' ? 'all' : 'Vous')}
            >
              Mes tâches
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskFilters;
