import React, { useState } from 'react';
import { mockTasks, teamMembers } from '../data/tasks';
import TaskCard from '../components/TaskCard';
import TaskForm from '../components/TaskForm';
import TaskFilters from '../components/TaskFilters';
import './TasksPage.css';
import '../styles/PageTitles.css';

const TasksPage = () => {
  const [tasks, setTasks] = useState(mockTasks);
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [filters, setFilters] = useState({
    status: 'all',
    type: 'all',
    assignee: 'all'
  });

  // Filtrer les tâches
  const filteredTasks = tasks.filter(task => {
    if (filters.status !== 'all' && task.status !== filters.status) return false;
    if (filters.type !== 'all' && task.type !== filters.type) return false;
    if (filters.assignee !== 'all' && task.assignee !== filters.assignee) return false;
    return true;
  });

  // Séparer les tâches actives et complétées
  const activeTasks = filteredTasks.filter(task => task.status !== 'completed');
  const completedTasks = filteredTasks.filter(task => task.status === 'completed');

  // Gérer l'ajout/modification de tâche
  const handleTaskSubmit = (taskData) => {
    if (editingTask) {
      setTasks(tasks.map(task => 
        task.id === editingTask.id ? { ...taskData, id: editingTask.id } : task
      ));
      setEditingTask(null);
    } else {
      const newTask = {
        ...taskData,
        id: Math.max(...tasks.map(t => t.id)) + 1,
        createdAt: new Date().toISOString().split('T')[0]
      };
      setTasks([...tasks, newTask]);
    }
    setShowForm(false);
  };

  // Gérer la suppression de tâche
  const handleDeleteTask = (taskId) => {
    setTasks(tasks.filter(task => task.id !== taskId));
  };

  // Gérer l'édition de tâche
  const handleEditTask = (task) => {
    setEditingTask(task);
    setShowForm(true);
  };

  // Mettre à jour le statut d'une tâche
  const handleStatusChange = (taskId, newStatus) => {
    setTasks(tasks.map(task => 
      task.id === taskId ? { ...task, status: newStatus } : task
    ));
  };

  return (
    <div className="tasks-container">
      <div className="tasks-header">
        <h1 className="page-main-title">Gestion des Tâches</h1>
        <button 
          className="btn-primary"
          onClick={() => {
            setEditingTask(null);
            setShowForm(true);
          }}
        >
          + Nouvelle Tâche
        </button>
      </div>

      <TaskFilters 
        filters={filters}
        onFiltersChange={setFilters}
        teamMembers={teamMembers}
      />

      {showForm && (
        <TaskForm
          task={editingTask}
          onSubmit={handleTaskSubmit}
          onCancel={() => {
            setShowForm(false);
            setEditingTask(null);
          }}
          teamMembers={teamMembers}
        />
      )}

      {/* Tâches actives */}
      <div className="tasks-section">
        <div className="section-header">
          <h2 className="section-title-pink">
            Tâches Actives ({activeTasks.length})
          </h2>
        </div>
        <div className="tasks-grid">
          {activeTasks.map(task => (
            <TaskCard
              key={task.id}
              task={task}
              onEdit={handleEditTask}
              onDelete={handleDeleteTask}
              onStatusChange={handleStatusChange}
            />
          ))}
        </div>
        {activeTasks.length === 0 && (
          <div className="empty-state">
            <p>Aucune tâche active trouvée</p>
          </div>
        )}
      </div>

      {/* Tâches complétées */}
      {completedTasks.length > 0 && (
        <div className="history-section">
          <div className="section-header">
            <h2 className="section-title-pink">
              Tâches Complétées ({completedTasks.length})
            </h2>
          </div>
          <div className="tasks-grid completed-tasks">
            {completedTasks.map(task => (
              <TaskCard
                key={task.id}
                task={task}
                onEdit={handleEditTask}
                onDelete={handleDeleteTask}
                onStatusChange={handleStatusChange}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TasksPage;
