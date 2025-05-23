import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { toast } from 'react-hot-toast';
import { FaPlus, FaEdit, FaTrash, FaClock, FaUser, FaTag, FaTimes, FaPaperclip, FaEllipsisH, FaArrowUp, FaArchive, FaPrint } from 'react-icons/fa';
// import './KanbanBoard.css';
import TaskModal from '../components/TaskModal';

const KanbanBoard = () => {
  const [columns, setColumns] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [currentTask, setCurrentTask] = useState(null);
  const [showColumnModal, setShowColumnModal] = useState(false);
  const [currentColumn, setCurrentColumn] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);

  // Charger les données du tableau Kanban
  useEffect(() => {
    const mockData = {
      columns: {
        'column-1': {
          id: 'column-1',
          title: 'À faire',
          taskIds: ['task-1', 'task-2', 'task-3'],
        },
        'column-2': {
          id: 'column-2',
          title: 'En cours',
          taskIds: ['task-4', 'task-5'],
        },
        'column-3': {
          id: 'column-3',
          title: 'Terminé',
          taskIds: ['task-6'],
        },
      },
      tasks: {
        'task-1': {
          id: 'task-1',
          title: 'Réviser le document de spécifications',
          description: 'Vérifier que toutes les exigences sont couvertes',
          assignee: 'Jean Dupont',
          dueDate: '2025-05-20',
          priority: 'high',
          labels: ['Documentation', 'Urgent'],
        },
        'task-2': {
          id: 'task-2',
          title: 'Implémenter la fonctionnalité de login',
          description: 'Ajouter l\'authentification par JWT',
          assignee: 'Marie Martin',
          dueDate: '2025-05-22',
          priority: 'medium',
          labels: ['Frontend', 'Backend'],
        },
        'task-3': {
          id: 'task-3',
          title: 'Corriger le bug #123',
          description: 'Le formulaire ne se soumet pas correctement',
          assignee: 'Pierre Dubois',
          dueDate: '2025-05-18',
          priority: 'high',
          labels: ['Bug'],
        },
        'task-4': {
          id: 'task-4',
          title: 'Optimiser les requêtes SQL',
          description: 'Améliorer les performances de la page d\'accueil',
          assignee: 'Sophie Petit',
          dueDate: '2025-05-25',
          priority: 'medium',
          labels: ['Backend', 'Performance'],
        },
        'task-5': {
          id: 'task-5',
          title: 'Mettre à jour les dépendances',
          description: 'Mettre à jour les packages npm vers les dernières versions',
          assignee: 'Jean Dupont',
          dueDate: '2025-05-30',
          priority: 'low',
          labels: ['Maintenance'],
        },
        'task-6': {
          id: 'task-6',
          title: 'Créer les maquettes UI',
          description: 'Concevoir les interfaces utilisateur pour les nouvelles fonctionnalités',
          assignee: 'Marie Martin',
          dueDate: '2025-05-15',
          priority: 'high',
          labels: ['Design', 'UI/UX'],
        },
      },
      columnOrder: ['column-1', 'column-2', 'column-3'],
    };

    setColumns(mockData);
    setIsLoading(false);
  }, []);

  // Gérer le glisser-déposer des tâches
  const onDragEnd = (result) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    if (destination.droppableId === source.droppableId &&
        destination.index === source.index) {
      return;
    }

    const sourceColumn = columns.columns[source.droppableId];
    const destColumn = columns.columns[destination.droppableId];

    if (sourceColumn.id === destColumn.id) {
      const newTaskIds = Array.from(sourceColumn.taskIds);
      newTaskIds.splice(source.index, 1);
      newTaskIds.splice(destination.index, 0, draggableId);

      const newColumn = {
        ...sourceColumn,
        taskIds: newTaskIds,
      };

      const newState = {
        ...columns,
        columns: {
          ...columns.columns,
          [newColumn.id]: newColumn,
        },
      };

      setColumns(newState);
      return;
    }

    const sourceTaskIds = Array.from(sourceColumn.taskIds);
    sourceTaskIds.splice(source.index, 1);
    const newSourceColumn = {
      ...sourceColumn,
      taskIds: sourceTaskIds,
    };

    const destTaskIds = Array.from(destColumn.taskIds);
    destTaskIds.splice(destination.index, 0, draggableId);
    const newDestColumn = {
      ...destColumn,
      taskIds: destTaskIds,
    };

    const newState = {
      ...columns,
      columns: {
        ...columns.columns,
        [newSourceColumn.id]: newSourceColumn,
        [newDestColumn.id]: newDestColumn,
      },
    };

    setColumns(newState);
    toast.success(`Tâche déplacée vers ${destColumn.title}`);
  };

  const handleTaskModal = (task = null, columnId = null) => {
    setCurrentTask(task ? { ...task } : { columnId });
    setShowTaskModal(true);
  };

  const handleColumnModal = (column = null) => {
    setCurrentColumn(column ? { ...column } : {});
    setShowColumnModal(true);
  };

  const handleSaveTask = (task) => {
    let newState = { ...columns };

    if (task.id) {
      newState.tasks[task.id] = task;
      toast.success('Tâche mise à jour avec succès');
    } else {
      const taskId = `task-${Date.now()}`;
      const newTask = {
        id: taskId,
        ...task,
      };
      newState.tasks[taskId] = newTask;
      newState.columns[task.columnId].taskIds.push(taskId);
      toast.success('Tâche ajoutée avec succès');
    }

    setColumns(newState);
    setShowTaskModal(false);
  };

  const handleSaveColumn = (column) => {
    let newState = { ...columns };

    if (column.id) {
      newState.columns[column.id].title = column.title;
      toast.success('Colonne mise à jour avec succès');
    } else {
      const columnId = `column-${Date.now()}`;
      const newColumn = {
        id: columnId,
        title: column.title,
        taskIds: [],
      };
      newState.columns[columnId] = newColumn;
      newState.columnOrder.push(columnId);
      toast.success('Colonne ajoutée avec succès');
    }

    setColumns(newState);
    setShowColumnModal(false);
  };

  const handleDeleteTask = (taskId) => {
    let newState = { ...columns };

    let columnId = null;
    for (const colId in newState.columns) {
      if (newState.columns[colId].taskIds.includes(taskId)) {
        columnId = colId;
        break;
      }
    }

    if (columnId) {
      newState.columns[columnId].taskIds = newState.columns[columnId].taskIds.filter(
        (id) => id !== taskId
      );
      delete newState.tasks[taskId];
      setColumns(newState);
      toast.success('Tâche supprimée avec succès');
    }
  };

  const handleDeleteColumn = (columnId) => {
    let newState = { ...columns };

    const taskIdsToDelete = newState.columns[columnId].taskIds;
    taskIdsToDelete.forEach((taskId) => {
      delete newState.tasks[taskId];
    });

    delete newState.columns[columnId];
    newState.columnOrder = newState.columnOrder.filter((id) => id !== columnId);

    setColumns(newState);
    toast.success('Colonne supprimée avec succès');
  };

  if (isLoading) {
    return <div className="loading">Chargement du tableau Kanban...</div>;
  }

  return (
    <div className="kanban-container">
      <div className="kanban-header">
        <h1>Tableau Kanban des Tâches</h1>
        <button className="btn btn-primary" onClick={() => handleColumnModal()}>
          <FaPlus /> Ajouter une colonne
        </button>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="kanban-board">
          {columns.columnOrder.map((columnId) => {
            const column = columns.columns[columnId];
            const tasks = column.taskIds.map((taskId) => columns.tasks[taskId]);

            return (
              <div className="kanban-column" key={column.id}>
                <div className="column-header">
                  <h2>{column.title}</h2>
                  <div className="column-actions">
                    <button
                      className="btn btn-sm btn-outline"
                      onClick={() => handleColumnModal(column)}
                    >
                      <FaEdit />
                    </button>
                    <button
                      className="btn btn-sm btn-outline btn-danger"
                      onClick={() => handleDeleteColumn(column.id)}
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
                <button
                  className="btn btn-sm btn-outline btn-block"
                  onClick={() => handleTaskModal(null, column.id)}
                >
                  <FaPlus /> Ajouter une tâche
                </button>
                <Droppable droppableId={column.id}>
                  {(provided, snapshot) => (
                    <div
                      className={`task-list ${
                        snapshot.isDraggingOver ? 'dragging-over' : ''
                      }`}
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                    >
                      {tasks.map((task, index) => (
                        <Draggable
                          key={task.id}
                          draggableId={task.id}
                          index={index}
                        >
                          {(provided, snapshot) => (
                            <div
                              className={`task-card ${
                                snapshot.isDragging ? 'dragging' : ''
                              } priority-${task.priority}`}
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              onClick={() => setSelectedTask(task)}
                            >
                              <div className="task-header">
                                <h3>{task.title}</h3>
                                <div className="task-actions">
                                  <button
                                    className="btn btn-sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleTaskModal(task);
                                    }}
                                  >
                                    <FaEdit />
                                  </button>
                                  <button
                                    className="btn btn-sm btn-danger"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteTask(task.id);
                                    }}
                                  >
                                    <FaTrash />
                                  </button>
                                </div>
                              </div>
                              <p className="task-description">
                                {task.description}
                              </p>
                              <div className="task-meta">
                                <div className="task-assignee">
                                  <FaUser /> {task.assignee}
                                </div>
                                <div className="task-due-date">
                                  <FaClock /> {task.dueDate}
                                </div>
                              </div>
                              <div className="task-labels">
                                {task.labels.map((label, i) => (
                                  <span key={i} className="task-label">
                                    <FaTag /> {label}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            );
          })}
        </div>
      </DragDropContext>

      {showTaskModal && (
        <TaskFormModal
          task={currentTask}
          onClose={() => setShowTaskModal(false)}
          onSave={handleSaveTask}
        />
      )}

      {showColumnModal && (
        <ColumnModal
          column={currentColumn}
          onClose={() => setShowColumnModal(false)}
          onSave={handleSaveColumn}
        />
      )}

      {selectedTask && (
        <TaskDetailModal 
          task={selectedTask} 
          onClose={() => setSelectedTask(null)} 
        />
      )}
    </div>
  );
};

// Modal de formulaire pour tâche (existant)
const TaskFormModal = ({ task, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    id: task?.id || '',
    title: task?.title || '',
    description: task?.description || '',
    assignee: task?.assignee || '',
    dueDate: task?.dueDate || '',
    priority: task?.priority || 'medium',
    labels: task?.labels || [],
    columnId: task?.columnId || task?.id ? '' : task.columnId,
  });

  const [labelInput, setLabelInput] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleAddLabel = () => {
    if (labelInput.trim() !== '') {
      setFormData({
        ...formData,
        labels: [...formData.labels, labelInput.trim()],
      });
      setLabelInput('');
    }
  };

  const handleRemoveLabel = (index) => {
    const newLabels = [...formData.labels];
    newLabels.splice(index, 1);
    setFormData({
      ...formData,
      labels: newLabels,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>{task?.id ? 'Modifier la tâche' : 'Ajouter une tâche'}</h2>
          <button className="btn-close" onClick={onClose}>
            &times;
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title">Titre</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
            ></textarea>
          </div>
          <div className="form-group">
            <label htmlFor="assignee">Assigné à</label>
            <input
              type="text"
              id="assignee"
              name="assignee"
              value={formData.assignee}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="dueDate">Date d'échéance</label>
            <input
              type="date"
              id="dueDate"
              name="dueDate"
              value={formData.dueDate}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="priority">Priorité</label>
            <select
              id="priority"
              name="priority"
              value={formData.priority}
              onChange={handleChange}
            >
              <option value="low">Basse</option>
              <option value="medium">Moyenne</option>
              <option value="high">Haute</option>
            </select>
          </div>
          <div className="form-group">
            <label>Étiquettes</label>
            <div className="label-input-container">
              <input
                type="text"
                value={labelInput}
                onChange={(e) => setLabelInput(e.target.value)}
                placeholder="Ajouter une étiquette"
              />
              <button
                type="button"
                className="btn btn-sm"
                onClick={handleAddLabel}
              >
                <FaPlus />
              </button>
            </div>
            <div className="labels-container">
              {formData.labels.map((label, index) => (
                <div key={index} className="label-item">
                  <span>{label}</span>
                  <button
                    type="button"
                    className="btn-remove-label"
                    onClick={() => handleRemoveLabel(index)}
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Annuler
            </button>
            <button type="submit" className="btn btn-primary">
              {task?.id ? 'Mettre à jour' : 'Ajouter'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Modal pour colonnes (existant)
const ColumnModal = ({ column, onClose, onSave }) => {
  const [title, setTitle] = useState(column?.title || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      id: column?.id || '',
      title,
    });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>{column?.id ? 'Modifier la colonne' : 'Ajouter une colonne'}</h2>
          <button className="btn-close" onClick={onClose}>
            &times;
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title">Titre</label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Annuler
            </button>
            <button type="submit" className="btn btn-primary">
              {column?.id ? 'Mettre à jour' : 'Ajouter'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Nouveau modal de détail de tâche
const TaskDetailModal = ({ task, onClose }) => {
  const [attachments, setAttachments] = useState([
    { name: 'Silly_sight_1.png', date: '21st December, 12:56 PM' },
    { name: 'All_images.zip', date: '21st December, 12:56 PM' }
  ]);
  const [activities, setActivities] = useState([
    { user: 'Alfen Loebe', action: 'Moved the task "the standard chunk" from Doing to To Do', date: '10:41 AM August 7, 2022' },
    { user: 'Jessie Samson', action: 'Attached images3.png to the task "the standard chunk"', date: '10:41 AM August 7, 2022' }
  ]);

  const handleAddAttachment = (file) => {
    const newAttachment = {
      name: file.name,
      date: new Date().toLocaleString('en-US', { 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    };
    setAttachments([...attachments, newAttachment]);
  };

  const handleDeleteAttachment = (index) => {
    const newAttachments = [...attachments];
    newAttachments.splice(index, 1);
    setAttachments(newAttachments);
  };

  return (
    <div className="task-modal-overlay">
      <div className="task-modal">
        <div className="task-modal-header">
          <h2>{task?.title || 'Détails de la tâche'}</h2>
          <button className="close-btn" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <div className="task-modal-body">
          <div className="task-section">
            <h3>Description</h3>
            <p>{task?.description || 'Aucune description fournie.'}</p>
          </div>

          <div className="task-section">
            <h3>Board</h3>
            <div className="board-info">
              <div className="board-column">
                <span className="column-name">Phoenix</span>
                <span className="task-status">Doing</span>
              </div>
              <div className="board-details">
                <div className="detail">
                  <span className="detail-label">Assigned to</span>
                  <span className="detail-value">{task?.assignee || 'Non assigné'}</span>
                </div>
                <div className="detail">
                  <span className="detail-label">Priority</span>
                  <span className={`detail-value priority-${task?.priority || 'medium'}`}>
                    {task?.priority === 'high' ? 'High' : 
                     task?.priority === 'low' ? 'Low' : 'Medium'}
                  </span>
                </div>
                <div className="detail">
                  <span className="detail-label">Category</span>
                  <span className="detail-value">
                    {task?.labels?.length ? task.labels[0] : 'Aucune catégorie'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="task-section">
            <h3>Attachments</h3>
            <div className="attachments-list">
              {attachments.map((attachment, index) => (
                <div key={index} className="attachment-item">
                  <div className="attachment-icon">
                    <FaPaperclip />
                  </div>
                  <div className="attachment-info">
                    <span className="attachment-name">{attachment.name}</span>
                    <span className="attachment-date">{attachment.date}</span>
                  </div>
                  <button 
                    className="attachment-delete"
                    onClick={() => handleDeleteAttachment(index)}
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>
            <div className="add-attachment">
              <label htmlFor="file-upload" className="attachment-upload-btn">
                <FaPaperclip /> Add an Attachment
              </label>
              <input 
                id="file-upload" 
                type="file" 
                onChange={(e) => handleAddAttachment(e.target.files[0])}
                style={{ display: 'none' }}
              />
            </div>
          </div>

          <div className="task-section">
            <h3>Actions</h3>
            <div className="actions-grid">
              <button className="action-btn">
                <FaArrowUp /> Move
              </button>
              <button className="action-btn">
                <FaEllipsisH /> Duplicate
              </button>
              <button className="action-btn">
                <FaEllipsisH /> Share
              </button>
              <button className="action-btn">
                <FaEllipsisH /> Create template
              </button>
              <button className="action-btn">
                <FaArrowUp /> Jump to top
              </button>
              <button className="action-btn">
                <FaArchive /> Move to Archive
              </button>
              <button className="action-btn danger">
                <FaTrash /> Move to Trash
              </button>
              <button className="action-btn">
                <FaPrint /> Print/Download
              </button>
            </div>
          </div>

          <div className="task-section">
            <h3>Activities</h3>
            <div className="activities-list">
              {activities.map((activity, index) => (
                <div key={index} className="activity-item">
                  <div className="activity-user">{activity.user}</div>
                  <div className="activity-action">{activity.action}</div>
                  <div className="activity-date">{activity.date}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="task-modal-footer">
          <span className="copyright">02.4 © Themewagon</span>
        </div>
      </div>
    </div>
  );
};

export default KanbanBoard;