import React from 'react';
import UiIcon from '../../components/UiIcon';

const TaskCard = ({ task, onEdit, onDelete, onStatusChange }) => {
  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return 'clock';
      case 'in-progress': return 'settings';
      case 'completed': return 'completed';
      default: return 'tasks';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'pending': return 'En attente';
      case 'in-progress': return 'En cours';
      case 'completed': return 'Terminé';
      default: return status;
    }
  };

  const getNextStatus = (currentStatus) => {
    switch (currentStatus) {
      case 'pending': return 'in-progress';
      case 'in-progress': return 'completed';
      case 'completed': return 'pending';
      default: return 'pending';
    }
  };

  const getNextStatusLabel = (currentStatus) => {
    switch (currentStatus) {
      case 'pending': return 'Commencer';
      case 'in-progress': return 'Terminer';
      case 'completed': return 'Réactiver';
      default: return 'Changer statut';
    }
  };

  return (
    <div className={`task-card ${task.type}`}>
      <div className="task-header">
        <div>
          <h3 className="task-title">{task.title}</h3>
          <div className="task-assignee"><UiIcon name="user" size={15} /> {task.assignee}</div>
        </div>
        <span className={`task-type ${task.type}`}>
          {task.type === 'personal' ? 'Personnel' : 'Collectif'}
        </span>
      </div>

      <p className="task-description">{task.description}</p>

      <div className="task-progress">
        <div className="progress-label">
          <span className="progress-text">Progression</span>
          <span className="progress-percentage">{task.progress}%</span>
        </div>
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${task.progress}%` }}
          ></div>
        </div>
      </div>

      <div className={`task-status status-${task.status}`}>
        <span><UiIcon name={getStatusIcon(task.status)} size={15} /></span>
        <span>{getStatusLabel(task.status)}</span>
      </div>

      {task.comments && task.comments.length > 0 && (
        <div className="task-comments">
          <div className="comments-title"><UiIcon name="message" size={15} /> Commentaires :</div>
          {task.comments.map((comment, index) => (
            <div key={index} className="comment-item">
              {comment}
            </div>
          ))}
        </div>
      )}

      <div className="task-meta">
        <small><UiIcon name="calendar" size={14} /> Créé le : {new Date(task.createdAt).toLocaleDateString('fr-FR')}</small>
        {task.dueDate && (
          <small><UiIcon name="clock" size={14} /> Échéance : {new Date(task.dueDate).toLocaleDateString('fr-FR')}</small>
        )}
      </div>

      <div className="task-actions">
        <button 
          className="btn-small btn-status"
          onClick={() => onStatusChange(task.id, getNextStatus(task.status))}
        >
          {getNextStatusLabel(task.status)}
        </button>
        <button 
          className="btn-small btn-edit"
          onClick={() => onEdit(task)}
        >
          <UiIcon name="edit" size={14} /> Modifier
        </button>
        <button 
          className="btn-small btn-delete"
          onClick={() => onDelete(task.id)}
        >
          <UiIcon name="trash" size={14} /> Supprimer
        </button>
      </div>
    </div>
  );
};

export default TaskCard;
