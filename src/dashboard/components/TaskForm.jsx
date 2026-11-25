import React, { useState, useEffect } from 'react';

const TaskForm = ({ task, onSubmit, onCancel, teamMembers }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'personal',
    assignee: 'Vous',
    status: 'pending',
    progress: 0,
    dueDate: '',
    comments: []
  });

  useEffect(() => {
    if (task) {
      setFormData(task);
    }
  }, [task]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="task-form">
      <h2 className="form-title">
        {task ? 'Modifier la tâche' : 'Nouvelle tâche'}
      </h2>
      
      <form onSubmit={handleSubmit}>
        <div className="form-grid">
          <div className="form-group full-width">
            <label className="form-label">Titre de la tâche *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="form-input"
              required
              placeholder="Ex: Préparation du sol pour la saison"
            />
          </div>

          <div className="form-group full-width">
            <label className="form-label">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="form-textarea"
              placeholder="Décrivez la tâche en détail..."
            />
          </div>

          <div className="form-group">
            <label className="form-label">Type de tâche</label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="form-select"
            >
              <option value="personal">Personnel</option>
              <option value="collective">Collectif</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Assigné à</label>
            <select
              name="assignee"
              value={formData.assignee}
              onChange={handleChange}
              className="form-select"
            >
              {teamMembers.map(member => (
                <option key={member} value={member}>{member}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Statut</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="form-select"
            >
              <option value="pending">En attente</option>
              <option value="in-progress">En cours</option>
              <option value="completed">Terminé</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Progression (%)</label>
            <input
              type="number"
              name="progress"
              value={formData.progress}
              onChange={handleChange}
              className="form-input"
              min="0"
              max="100"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Date d'échéance</label>
            <input
              type="date"
              name="dueDate"
              value={formData.dueDate}
              onChange={handleChange}
              className="form-input"
            />
          </div>
        </div>

        <div className="form-actions">
          <button type="button" onClick={onCancel} className="btn-secondary">
            Annuler
          </button>
          <button type="submit" className="btn-primary">
            {task ? 'Modifier' : 'Créer'} la tâche
          </button>
        </div>
      </form>
    </div>
  );
};

export default TaskForm;
