// import React, { useState, useEffect } from 'react';
// import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
// import { toast } from 'react-hot-toast';
// import { Card , Breadcrumb, theme } from 'antd';
// import { FaPlus, FaEdit, FaTrash, FaClock, FaUser, FaTag, FaTimes, FaPaperclip, FaEllipsisH, FaArrowUp, FaArchive, FaPrint } from 'react-icons/fa';
// // import './KanbanBoard.css';
// import Main from "../layout/Main";

// const KanbanBoard = () => {
//   const [columns, setColumns] = useState({});
//   const [isLoading, setIsLoading] = useState(true);
//   const [showTaskModal, setShowTaskModal] = useState(false);
//   const [currentTask, setCurrentTask] = useState(null);
//   const [showColumnModal, setShowColumnModal] = useState(false);
//   const [currentColumn, setCurrentColumn] = useState(null);
//   const [selectedTask, setSelectedTask] = useState(null);

//   // Charger les données du tableau Kanban
//   useEffect(() => {
//     const mockData = {
//       columns: {
//         'column-1': {
//           id: 'column-1',
//           title: 'À faire',
//           taskIds: ['task-1', 'task-2', 'task-3'],
//         },
//         'column-2': {
//           id: 'column-2',
//           title: 'En cours',
//           taskIds: ['task-4', 'task-5'],
//         },
//         'column-3': {
//           id: 'column-3',
//           title: 'Terminé',
//           taskIds: ['task-6'],
//         },
//       },
//       tasks: {
//         'task-1': {
//           id: 'task-1',
//           title: 'Réviser le document de spécifications',
//           description: 'Vérifier que toutes les exigences sont couvertes',
//           assignee: 'Jean Dupont',
//           dueDate: '2025-05-20',
//           priority: 'high',
//           labels: ['Documentation', 'Urgent'],
//         },
//         'task-2': {
//           id: 'task-2',
//           title: 'Implémenter la fonctionnalité de login',
//           description: 'Ajouter l\'authentification par JWT',
//           assignee: 'Marie Martin',
//           dueDate: '2025-05-22',
//           priority: 'medium',
//           labels: ['Frontend', 'Backend'],
//         },
//         'task-3': {
//           id: 'task-3',
//           title: 'Corriger le bug #123',
//           description: 'Le formulaire ne se soumet pas correctement',
//           assignee: 'Pierre Dubois',
//           dueDate: '2025-05-18',
//           priority: 'high',
//           labels: ['Bug'],
//         },
//         'task-4': {
//           id: 'task-4',
//           title: 'Optimiser les requêtes SQL',
//           description: 'Améliorer les performances de la page d\'accueil',
//           assignee: 'Sophie Petit',
//           dueDate: '2025-05-25',
//           priority: 'medium',
//           labels: ['Backend', 'Performance'],
//         },
//         'task-5': {
//           id: 'task-5',
//           title: 'Mettre à jour les dépendances',
//           description: 'Mettre à jour les packages npm vers les dernières versions',
//           assignee: 'Jean Dupont',
//           dueDate: '2025-05-30',
//           priority: 'low',
//           labels: ['Maintenance'],
//         },
//         'task-6': {
//           id: 'task-6',
//           title: 'Créer les maquettes UI',
//           description: 'Concevoir les interfaces utilisateur pour les nouvelles fonctionnalités',
//           assignee: 'Marie Martin',
//           dueDate: '2025-05-15',
//           priority: 'high',
//           labels: ['Design', 'UI/UX'],
//         },
//       },
//       columnOrder: ['column-1', 'column-2', 'column-3'],
//     };

//     setColumns(mockData);
//     setIsLoading(false);
//   }, []);

//   // Gérer le glisser-déposer des tâches
//   const onDragEnd = (result) => {
//     const { destination, source, draggableId } = result;

//     if (!destination) return;

//     if (destination.droppableId === source.droppableId &&
//         destination.index === source.index) {
//       return;
//     }

//     const sourceColumn = columns.columns[source.droppableId];
//     const destColumn = columns.columns[destination.droppableId];

//     if (sourceColumn.id === destColumn.id) {
//       const newTaskIds = Array.from(sourceColumn.taskIds);
//       newTaskIds.splice(source.index, 1);
//       newTaskIds.splice(destination.index, 0, draggableId);

//       const newColumn = {
//         ...sourceColumn,
//         taskIds: newTaskIds,
//       };

//       const newState = {
//         ...columns,
//         columns: {
//           ...columns.columns,
//           [newColumn.id]: newColumn,
//         },
//       };

//       setColumns(newState);
//       return;
//     }

//     const sourceTaskIds = Array.from(sourceColumn.taskIds);
//     sourceTaskIds.splice(source.index, 1);
//     const newSourceColumn = {
//       ...sourceColumn,
//       taskIds: sourceTaskIds,
//     };

//     const destTaskIds = Array.from(destColumn.taskIds);
//     destTaskIds.splice(destination.index, 0, draggableId);
//     const newDestColumn = {
//       ...destColumn,
//       taskIds: destTaskIds,
//     };

//     const newState = {
//       ...columns,
//       columns: {
//         ...columns.columns,
//         [newSourceColumn.id]: newSourceColumn,
//         [newDestColumn.id]: newDestColumn,
//       },
//     };

//     setColumns(newState);
//     toast.success(`Tâche déplacée vers ${destColumn.title}`);
//   };

//   const handleTaskModal = (task = null, columnId = null) => {
//     setCurrentTask(task ? { ...task } : { columnId });
//     setShowTaskModal(true);
//   };

//   const handleColumnModal = (column = null) => {
//     setCurrentColumn(column ? { ...column } : {});
//     setShowColumnModal(true);
//   };

//   const handleSaveTask = (task) => {
//     let newState = { ...columns };

//     if (task.id) {
//       newState.tasks[task.id] = task;
//       toast.success('Tâche mise à jour avec succès');
//     } else {
//       const taskId = `task-${Date.now()}`;
//       const newTask = {
//         id: taskId,
//         ...task,
//       };
//       newState.tasks[taskId] = newTask;
//       newState.columns[task.columnId].taskIds.push(taskId);
//       toast.success('Tâche ajoutée avec succès');
//     }

//     setColumns(newState);
//     setShowTaskModal(false);
//   };

//   const handleSaveColumn = (column) => {
//     let newState = { ...columns };

//     if (column.id) {
//       newState.columns[column.id].title = column.title;
//       toast.success('Colonne mise à jour avec succès');
//     } else {
//       const columnId = `column-${Date.now()}`;
//       const newColumn = {
//         id: columnId,
//         title: column.title,
//         taskIds: [],
//       };
//       newState.columns[columnId] = newColumn;
//       newState.columnOrder.push(columnId);
//       toast.success('Colonne ajoutée avec succès');
//     }

//     setColumns(newState);
//     setShowColumnModal(false);
//   };

//   const handleDeleteTask = (taskId) => {
//     let newState = { ...columns };

//     let columnId = null;
//     for (const colId in newState.columns) {
//       if (newState.columns[colId].taskIds.includes(taskId)) {
//         columnId = colId;
//         break;
//       }
//     }

//     if (columnId) {
//       newState.columns[columnId].taskIds = newState.columns[columnId].taskIds.filter(
//         (id) => id !== taskId
//       );
//       delete newState.tasks[taskId];
//       setColumns(newState);
//       toast.success('Tâche supprimée avec succès');
//     }
//   };

//   const handleDeleteColumn = (columnId) => {
//     let newState = { ...columns };

//     const taskIdsToDelete = newState.columns[columnId].taskIds;
//     taskIdsToDelete.forEach((taskId) => {
//       delete newState.tasks[taskId];
//     });

//     delete newState.columns[columnId];
//     newState.columnOrder = newState.columnOrder.filter((id) => id !== columnId);

//     setColumns(newState);
//     toast.success('Colonne supprimée avec succès');
//   };

//   if (isLoading) {
//     return <div className="loading">Chargement du tableau Kanban...</div>;
//   }

 

//   return (
//     <Main>
//                 <Card 
//                     className="shadow-sm mb-4"
//                 >
//                     <div className="d-flex justify-content-between align-items-center p-3">
//                         <div>
//                             <h4 className="mb-0">Gestion des tâches</h4>
//                             <p className="text-muted mb-0">Gérez les tâches de l'application</p>
//                         </div>
                      
//                     </div>
//                 </Card>
//           <Card>
//           <div className="kanban-container">
//           <div className="kanban-header">
//             <h1>Tableau Kanban des Tâches</h1>
//             <button className="btn btn-primary" onClick={() => handleColumnModal()}>
//               <FaPlus /> Ajouter une colonne
//             </button>
//           </div>

//           <DragDropContext onDragEnd={onDragEnd}>
//             <div className="kanban-board">
//               {columns.columnOrder.map((columnId) => {
//                 const column = columns.columns[columnId];
//                 const tasks = column.taskIds.map((taskId) => columns.tasks[taskId]);

//                 return (
//                   <div className="kanban-column" key={column.id}>
//                     <div className="column-header">
//                       <h2>{column.title}</h2>
//                       <div className="column-actions">
//                         <button
//                           className="btn btn-sm btn-outline"
//                           onClick={() => handleColumnModal(column)}
//                         >
//                           <FaEdit />
//                         </button>
//                         <button
//                           className="btn btn-sm btn-outline btn-danger"
//                           onClick={() => handleDeleteColumn(column.id)}
//                         >
//                           <FaTrash />
//                         </button>
//                       </div>
//                     </div>
//                     <button
//                       className="btn btn-sm btn-outline btn-block"
//                       onClick={() => handleTaskModal(null, column.id)}
//                     >
//                       <FaPlus /> Ajouter une tâche
//                     </button>
//                     <Droppable droppableId={column.id}>
//                       {(provided, snapshot) => (
//                         <div
//                           className={`task-list ${
//                             snapshot.isDraggingOver ? 'dragging-over' : ''
//                           }`}
//                           ref={provided.innerRef}
//                           {...provided.droppableProps}
//                         >
//                           {tasks.map((task, index) => (
//                             <Draggable
//                               key={task.id}
//                               draggableId={task.id}
//                               index={index}
//                             >
//                               {(provided, snapshot) => (
//                                 <div
//                                   className={`task-card ${
//                                     snapshot.isDragging ? 'dragging' : ''
//                                   } priority-${task.priority}`}
//                                   ref={provided.innerRef}
//                                   {...provided.draggableProps}
//                                   {...provided.dragHandleProps}
//                                   onClick={() => setSelectedTask(task)}
//                                 >
//                                   <div className="task-header">
//                                     <h3>{task.title}</h3>
//                                     <div className="task-actions">
//                                       <button
//                                         className="btn btn-sm"
//                                         onClick={(e) => {
//                                           e.stopPropagation();
//                                           handleTaskModal(task);
//                                         }}
//                                       >
//                                         <FaEdit />
//                                       </button>
//                                       <button
//                                         className="btn btn-sm btn-danger"
//                                         onClick={(e) => {
//                                           e.stopPropagation();
//                                           handleDeleteTask(task.id);
//                                         }}
//                                       >
//                                         <FaTrash />
//                                       </button>
//                                     </div>
//                                   </div>
//                                   <p className="task-description">
//                                     {task.description}
//                                   </p>
//                                   <div className="task-meta">
//                                     <div className="task-assignee">
//                                       <FaUser /> {task.assignee}
//                                     </div>
//                                     <div className="task-due-date">
//                                       <FaClock /> {task.dueDate}
//                                     </div>
//                                   </div>
//                                   <div className="task-labels">
//                                     {task.labels.map((label, i) => (
//                                       <span key={i} className="task-label">
//                                         <FaTag /> {label}
//                                       </span>
//                                     ))}
//                                   </div>
//                                 </div>
//                               )}
//                             </Draggable>
//                           ))}
//                           {provided.placeholder}
//                         </div>
//                       )}
//                     </Droppable>
//                   </div>
//                 );
//               })}
//             </div>
//           </DragDropContext>

//           {showTaskModal && (
//             <TaskFormModal
//               task={currentTask}
//               onClose={() => setShowTaskModal(false)}
//               onSave={handleSaveTask}
//             />
//           )}

//           {showColumnModal && (
//             <ColumnModal
//               column={currentColumn}
//               onClose={() => setShowColumnModal(false)}
//               onSave={handleSaveColumn}
//             />
//           )}

//           {selectedTask && (
//             <TaskDetailModal 
//               task={selectedTask} 
//               onClose={() => setSelectedTask(null)} 
//             />
//           )}
//         </div>
//       </Card>
//     </Main>
//   );
// };

// // Modal de formulaire pour tâche (existant)
// const TaskFormModal = ({ task, onClose, onSave }) => {
//   const [formData, setFormData] = useState({
//     id: task?.id || '',
//     title: task?.title || '',
//     description: task?.description || '',
//     assignee: task?.assignee || '',
//     dueDate: task?.dueDate || '',
//     priority: task?.priority || 'medium',
//     labels: task?.labels || [],
//     columnId: task?.columnId || task?.id ? '' : task.columnId,
//   });

//   const [labelInput, setLabelInput] = useState('');

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData({
//       ...formData,
//       [name]: value,
//     });
//   };

//   const handleAddLabel = () => {
//     if (labelInput.trim() !== '') {
//       setFormData({
//         ...formData,
//         labels: [...formData.labels, labelInput.trim()],
//       });
//       setLabelInput('');
//     }
//   };

//   const handleRemoveLabel = (index) => {
//     const newLabels = [...formData.labels];
//     newLabels.splice(index, 1);
//     setFormData({
//       ...formData,
//       labels: newLabels,
//     });
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     onSave(formData);
//   };

//   return (
//     <div className="modal-overlay">
//       <div className="modal-content">
//         <div className="modal-header">
//           <h2>{task?.id ? 'Modifier la tâche' : 'Ajouter une tâche'}</h2>
//           <button className="btn-close" onClick={onClose}>
//             &times;
//           </button>
//         </div>
//         <form onSubmit={handleSubmit}>
//           <div className="form-group">
//             <label htmlFor="title">Titre</label>
//             <input
//               type="text"
//               id="title"
//               name="title"
//               value={formData.title}
//               onChange={handleChange}
//               required
//             />
//           </div>
//           <div className="form-group">
//             <label htmlFor="description">Description</label>
//             <textarea
//               id="description"
//               name="description"
//               value={formData.description}
//               onChange={handleChange}
//               rows="3"
//             ></textarea>
//           </div>
//           <div className="form-group">
//             <label htmlFor="assignee">Assigné à</label>
//             <input
//               type="text"
//               id="assignee"
//               name="assignee"
//               value={formData.assignee}
//               onChange={handleChange}
//             />
//           </div>
//           <div className="form-group">
//             <label htmlFor="dueDate">Date d'échéance</label>
//             <input
//               type="date"
//               id="dueDate"
//               name="dueDate"
//               value={formData.dueDate}
//               onChange={handleChange}
//             />
//           </div>
//           <div className="form-group">
//             <label htmlFor="priority">Priorité</label>
//             <select
//               id="priority"
//               name="priority"
//               value={formData.priority}
//               onChange={handleChange}
//             >
//               <option value="low">Basse</option>
//               <option value="medium">Moyenne</option>
//               <option value="high">Haute</option>
//             </select>
//           </div>
//           <div className="form-group">
//             <label>Étiquettes</label>
//             <div className="label-input-container">
//               <input
//                 type="text"
//                 value={labelInput}
//                 onChange={(e) => setLabelInput(e.target.value)}
//                 placeholder="Ajouter une étiquette"
//               />
//               <button
//                 type="button"
//                 className="btn btn-sm"
//                 onClick={handleAddLabel}
//               >
//                 <FaPlus />
//               </button>
//             </div>
//             <div className="labels-container">
//               {formData.labels.map((label, index) => (
//                 <div key={index} className="label-item">
//                   <span>{label}</span>
//                   <button
//                     type="button"
//                     className="btn-remove-label"
//                     onClick={() => handleRemoveLabel(index)}
//                   >
//                     &times;
//                   </button>
//                 </div>
//               ))}
//             </div>
//           </div>
//           <div className="modal-footer">
//             <button type="button" className="btn btn-secondary" onClick={onClose}>
//               Annuler
//             </button>
//             <button type="submit" className="btn btn-primary">
//               {task?.id ? 'Mettre à jour' : 'Ajouter'}
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };

// // Modal pour colonnes (existant)
// const ColumnModal = ({ column, onClose, onSave }) => {
//   const [title, setTitle] = useState(column?.title || '');

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     onSave({
//       id: column?.id || '',
//       title,
//     });
//   };

//   return (
//     <div className="modal-overlay">
//       <div className="modal-content">
//         <div className="modal-header">
//           <h2>{column?.id ? 'Modifier la colonne' : 'Ajouter une colonne'}</h2>
//           <button className="btn-close" onClick={onClose}>
//             &times;
//           </button>
//         </div>
//         <form onSubmit={handleSubmit}>
//           <div className="form-group">
//             <label htmlFor="title">Titre</label>
//             <input
//               type="text"
//               id="title"
//               value={title}
//               onChange={(e) => setTitle(e.target.value)}
//               required
//             />
//           </div>
//           <div className="modal-footer">
//             <button type="button" className="btn btn-secondary" onClick={onClose}>
//               Annuler
//             </button>
//             <button type="submit" className="btn btn-primary">
//               {column?.id ? 'Mettre à jour' : 'Ajouter'}
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };

// // Nouveau modal de détail de tâche
// const TaskDetailModal = ({ task, onClose }) => {
//   const [attachments, setAttachments] = useState([
//     { name: 'Silly_sight_1.png', date: '21st December, 12:56 PM' },
//     { name: 'All_images.zip', date: '21st December, 12:56 PM' }
//   ]);
//   const [activities, setActivities] = useState([
//     { user: 'Alfen Loebe', action: 'Moved the task "the standard chunk" from Doing to To Do', date: '10:41 AM August 7, 2022' },
//     { user: 'Jessie Samson', action: 'Attached images3.png to the task "the standard chunk"', date: '10:41 AM August 7, 2022' }
//   ]);

//   const handleAddAttachment = (file) => {
//     const newAttachment = {
//       name: file.name,
//       date: new Date().toLocaleString('en-US', { 
//         day: 'numeric', 
//         month: 'long', 
//         year: 'numeric', 
//         hour: '2-digit', 
//         minute: '2-digit' 
//       })
//     };
//     setAttachments([...attachments, newAttachment]);
//   };

//   const handleDeleteAttachment = (index) => {
//     const newAttachments = [...attachments];
//     newAttachments.splice(index, 1);
//     setAttachments(newAttachments);
//   };

//   return (
//     <div className="task-modal-overlay">
//       <div className="task-modal">
//         <div className="task-modal-header">
//           <h2>{task?.title || 'Détails de la tâche'}</h2>
//           <button className="close-btn" onClick={onClose}>
//             <FaTimes />
//           </button>
//         </div>

//         <div className="task-modal-body">
//           <div className="task-section">
//             <h3>Description</h3>
//             <p>{task?.description || 'Aucune description fournie.'}</p>
//           </div>

//           <div className="task-section">
//             <h3>Board</h3>
//             <div className="board-info">
//               <div className="board-column">
//                 <span className="column-name">Phoenix</span>
//                 <span className="task-status">Doing</span>
//               </div>
//               <div className="board-details">
//                 <div className="detail">
//                   <span className="detail-label">Assigned to</span>
//                   <span className="detail-value">{task?.assignee || 'Non assigné'}</span>
//                 </div>
//                 <div className="detail">
//                   <span className="detail-label">Priority</span>
//                   <span className={`detail-value priority-${task?.priority || 'medium'}`}>
//                     {task?.priority === 'high' ? 'High' : 
//                      task?.priority === 'low' ? 'Low' : 'Medium'}
//                   </span>
//                 </div>
//                 <div className="detail">
//                   <span className="detail-label">Category</span>
//                   <span className="detail-value">
//                     {task?.labels?.length ? task.labels[0] : 'Aucune catégorie'}
//                   </span>
//                 </div>
//               </div>
//             </div>
//           </div>

//           <div className="task-section">
//             <h3>Attachments</h3>
//             <div className="attachments-list">
//               {attachments.map((attachment, index) => (
//                 <div key={index} className="attachment-item">
//                   <div className="attachment-icon">
//                     <FaPaperclip />
//                   </div>
//                   <div className="attachment-info">
//                     <span className="attachment-name">{attachment.name}</span>
//                     <span className="attachment-date">{attachment.date}</span>
//                   </div>
//                   <button 
//                     className="attachment-delete"
//                     onClick={() => handleDeleteAttachment(index)}
//                   >
//                     &times;
//                   </button>
//                 </div>
//               ))}
//             </div>
//             <div className="add-attachment">
//               <label htmlFor="file-upload" className="attachment-upload-btn">
//                 <FaPaperclip /> Add an Attachment
//               </label>
//               <input 
//                 id="file-upload" 
//                 type="file" 
//                 onChange={(e) => handleAddAttachment(e.target.files[0])}
//                 style={{ display: 'none' }}
//               />
//             </div>
//           </div>

//           <div className="task-section">
//             <h3>Actions</h3>
//             <div className="actions-grid">
//               <button className="action-btn">
//                 <FaArrowUp /> Move
//               </button>
//               <button className="action-btn">
//                 <FaEllipsisH /> Duplicate
//               </button>
//               <button className="action-btn">
//                 <FaEllipsisH /> Share
//               </button>
//               <button className="action-btn">
//                 <FaEllipsisH /> Create template
//               </button>
//               <button className="action-btn">
//                 <FaArrowUp /> Jump to top
//               </button>
//               <button className="action-btn">
//                 <FaArchive /> Move to Archive
//               </button>
//               <button className="action-btn danger">
//                 <FaTrash /> Move to Trash
//               </button>
//               <button className="action-btn">
//                 <FaPrint /> Print/Download
//               </button>
//             </div>
//           </div>

//           <div className="task-section">
//             <h3>Activities</h3>
//             <div className="activities-list">
//               {activities.map((activity, index) => (
//                 <div key={index} className="activity-item">
//                   <div className="activity-user">{activity.user}</div>
//                   <div className="activity-action">{activity.action}</div>
//                   <div className="activity-date">{activity.date}</div>
//                 </div>
//               ))}
//             </div>
//           </div>
//         </div>

//         <div className="task-modal-footer">
//           <span className="copyright">02.4 © Themewagon</span>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default KanbanBoard;

import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { 
  Card, 
  Button, 
  Modal, 
  Form, 
  Input, 
  Select, 
  DatePicker, 
  Tag, 
  Space, 
  Typography, 
  Upload, 
  Divider,
  Row,
  Col,
  Avatar,
  Timeline,
  message,
  Popconfirm
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  ClockCircleOutlined, 
  UserOutlined, 
  TagOutlined, 
  CloseOutlined, 
  PaperClipOutlined, 
  MoreOutlined, 
  ArrowUpOutlined, 
  InboxOutlined, 
  PrinterOutlined 
} from '@ant-design/icons';
import dayjs from 'dayjs';
import Main from "../layout/Main";

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Option } = Select;

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
    message.success(`Tâche déplacée vers ${destColumn.title}`);
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
      message.success('Tâche mise à jour avec succès');
    } else {
      const taskId = `task-${Date.now()}`;
      const newTask = {
        id: taskId,
        ...task,
      };
      newState.tasks[taskId] = newTask;
      newState.columns[task.columnId].taskIds.push(taskId);
      message.success('Tâche ajoutée avec succès');
    }

    setColumns(newState);
    setShowTaskModal(false);
  };

  const handleSaveColumn = (column) => {
    let newState = { ...columns };

    if (column.id) {
      newState.columns[column.id].title = column.title;
      message.success('Colonne mise à jour avec succès');
    } else {
      const columnId = `column-${Date.now()}`;
      const newColumn = {
        id: columnId,
        title: column.title,
        taskIds: [],
      };
      newState.columns[columnId] = newColumn;
      newState.columnOrder.push(columnId);
      message.success('Colonne ajoutée avec succès');
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
      message.success('Tâche supprimée avec succès');
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
    message.success('Colonne supprimée avec succès');
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'red';
      case 'medium': return 'orange';
      case 'low': return 'green';
      default: return 'blue';
    }
  };

  if (isLoading) {
    return (
      <Main>
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <Text>Chargement du tableau Kanban...</Text>
        </div>
      </Main>
    );
  }

  return (
    <Main>
      <Card className="shadow-sm mb-4">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <Title level={4} style={{ margin: 0 }}>Gestion des tâches</Title>
            <Text type="secondary">Gérez les tâches de l'application</Text>
          </div>
        </div>
      </Card>

      <Card>
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <Title level={2}>Tableau Kanban des Tâches</Title>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => handleColumnModal()}>
              Ajouter une colonne
            </Button>
          </div>

          <DragDropContext onDragEnd={onDragEnd}>
            <div style={{ display: 'flex', gap: '16px', overflowX: 'auto' }}>
              {columns.columnOrder.map((columnId) => {
                const column = columns.columns[columnId];
                const tasks = column.taskIds.map((taskId) => columns.tasks[taskId]);

                return (
                  <div key={column.id} style={{ minWidth: '300px', backgroundColor: '#f5f5f5', padding: '16px', borderRadius: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                      <Title level={4} style={{ margin: 0 }}>{column.title}</Title>
                      <Space>
                        <Button 
                          size="small" 
                          icon={<EditOutlined />} 
                          onClick={() => handleColumnModal(column)}
                        />
                        <Popconfirm
                          title="Êtes-vous sûr de vouloir supprimer cette colonne ?"
                          onConfirm={() => handleDeleteColumn(column.id)}
                          okText="Oui"
                          cancelText="Non"
                        >
                          <Button size="small" danger icon={<DeleteOutlined />} />
                        </Popconfirm>
                      </Space>
                    </div>
                    
                    <Button 
                      type="dashed" 
                      icon={<PlusOutlined />} 
                      style={{ width: '100%', marginBottom: 16 }}
                      onClick={() => handleTaskModal(null, column.id)}
                    >
                      Ajouter une tâche
                    </Button>

                    <Droppable droppableId={column.id}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          style={{
                            minHeight: '200px',
                            backgroundColor: snapshot.isDraggingOver ? '#e6f7ff' : 'transparent',
                            borderRadius: '4px',
                            transition: 'background-color 0.2s ease'
                          }}
                        >
                          {tasks.map((task, index) => (
                            <Draggable key={task.id} draggableId={task.id} index={index}>
                              {(provided, snapshot) => (
                                <Card
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  size="small"
                                  style={{
                                    marginBottom: 8,
                                    cursor: 'pointer',
                                    transform: snapshot.isDragging ? 'rotate(5deg)' : 'none',
                                    boxShadow: snapshot.isDragging ? '0 4px 12px rgba(0,0,0,0.15)' : undefined,
                                    borderLeft: `4px solid ${getPriorityColor(task.priority)}`
                                  }}
                                  onClick={() => setSelectedTask(task)}
                                  actions={[
                                    <EditOutlined 
                                      key="edit" 
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleTaskModal(task);
                                      }} 
                                    />,
                                    <Popconfirm
                                      key="delete"
                                      title="Supprimer cette tâche ?"
                                      onConfirm={(e) => {
                                        e.stopPropagation();
                                        handleDeleteTask(task.id);
                                      }}
                                      okText="Oui"
                                      cancelText="Non"
                                    >
                                      <DeleteOutlined />
                                    </Popconfirm>
                                  ]}
                                >
                                  <Card.Meta
                                    title={<Text strong>{task.title}</Text>}
                                    description={
                                      <div>
                                        <Paragraph 
                                          ellipsis={{ rows: 2 }} 
                                          style={{ marginBottom: 8 }}
                                        >
                                          {task.description}
                                        </Paragraph>
                                        <div style={{ marginBottom: 8 }}>
                                          <Space size="small">
                                            <UserOutlined />
                                            <Text type="secondary" style={{ fontSize: '12px' }}>
                                              {task.assignee}
                                            </Text>
                                          </Space>
                                          <br />
                                          <Space size="small">
                                            <ClockCircleOutlined />
                                            <Text type="secondary" style={{ fontSize: '12px' }}>
                                              {dayjs(task.dueDate).format('DD/MM/YYYY')}
                                            </Text>
                                          </Space>
                                        </div>
                                        <div>
                                          {task.labels.map((label, i) => (
                                            <Tag key={i} size="small" color="blue">
                                              {label}
                                            </Tag>
                                          ))}
                                        </div>
                                      </div>
                                    }
                                  />
                                </Card>
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
        </div>
      </Card>

      {/* Task Form Modal */}
      <TaskFormModal
        visible={showTaskModal}
        task={currentTask}
        onClose={() => setShowTaskModal(false)}
        onSave={handleSaveTask}
      />

      {/* Column Modal */}
      <ColumnModal
        visible={showColumnModal}
        column={currentColumn}
        onClose={() => setShowColumnModal(false)}
        onSave={handleSaveColumn}
      />

      {/* Task Detail Modal */}
      <TaskDetailModal 
        visible={!!selectedTask}
        task={selectedTask} 
        onClose={() => setSelectedTask(null)} 
      />
    </Main>
  );
};

// Modal de formulaire pour tâche
const TaskFormModal = ({ visible, task, onClose, onSave }) => {
  const [form] = Form.useForm();
  const [labels, setLabels] = useState(task?.labels || []);

  useEffect(() => {
    if (visible && task) {
      form.setFieldsValue({
        title: task.title || '',
        description: task.description || '',
        assignee: task.assignee || '',
        dueDate: task.dueDate ? dayjs(task.dueDate) : null,
        priority: task.priority || 'medium',
      });
      setLabels(task.labels || []);
    } else if (visible) {
      form.resetFields();
      setLabels([]);
    }
  }, [visible, task, form]);

  const handleSubmit = (values) => {
    const taskData = {
      ...task,
      ...values,
      dueDate: values.dueDate ? values.dueDate.format('YYYY-MM-DD') : '',
      labels,
      columnId: task?.columnId || task?.id ? '' : task?.columnId,
    };
    onSave(taskData);
  };

  const handleAddLabel = (value) => {
    if (value && !labels.includes(value)) {
      setLabels([...labels, value]);
    }
  };

  const handleRemoveLabel = (removedLabel) => {
    setLabels(labels.filter(label => label !== removedLabel));
  };

  return (
    <Modal
      title={task?.id ? 'Modifier la tâche' : 'Ajouter une tâche'}
      open={visible}
      onCancel={onClose}
      footer={null}
      width={600}
    >
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Form.Item
          name="title"
          label="Titre"
          rules={[{ required: true, message: 'Veuillez saisir un titre' }]}
        >
          <Input placeholder="Titre de la tâche" />
        </Form.Item>

        <Form.Item name="description" label="Description">
          <TextArea rows={3} placeholder="Description de la tâche" />
        </Form.Item>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="assignee" label="Assigné à">
              <Input placeholder="Nom de la personne" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="dueDate" label="Date d'échéance">
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item name="priority" label="Priorité">
          <Select placeholder="Sélectionner une priorité">
            <Option value="low">Basse</Option>
            <Option value="medium">Moyenne</Option>
            <Option value="high">Haute</Option>
          </Select>
        </Form.Item>

        <Form.Item label="Étiquettes">
          <Select
            mode="tags"
            style={{ width: '100%' }}
            placeholder="Ajouter des étiquettes"
            value={labels}
            onChange={setLabels}
            onSelect={handleAddLabel}
            onDeselect={handleRemoveLabel}
          />
        </Form.Item>

        <Form.Item style={{ marginBottom: 0 }}>
          <Space style={{ float: 'right' }}>
            <Button onClick={onClose}>Annuler</Button>
            <Button type="primary" htmlType="submit">
              {task?.id ? 'Mettre à jour' : 'Ajouter'}
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
};

// Modal pour colonnes
const ColumnModal = ({ visible, column, onClose, onSave }) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (visible && column) {
      form.setFieldsValue({ title: column.title || '' });
    } else if (visible) {
      form.resetFields();
    }
  }, [visible, column, form]);

  const handleSubmit = (values) => {
    onSave({
      id: column?.id || '',
      title: values.title,
    });
  };

  return (
    <Modal
      title={column?.id ? 'Modifier la colonne' : 'Ajouter une colonne'}
      open={visible}
      onCancel={onClose}
      footer={null}
    >
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Form.Item
          name="title"
          label="Titre"
          rules={[{ required: true, message: 'Veuillez saisir un titre' }]}
        >
          <Input placeholder="Titre de la colonne" />
        </Form.Item>

        <Form.Item style={{ marginBottom: 0 }}>
          <Space style={{ float: 'right' }}>
            <Button onClick={onClose}>Annuler</Button>
            <Button type="primary" htmlType="submit">
              {column?.id ? 'Mettre à jour' : 'Ajouter'}
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
};

// Modal de détail de tâche
const TaskDetailModal = ({ visible, task, onClose }) => {
  const [attachments, setAttachments] = useState([
    { name: 'Silly_sight_1.png', date: '21st December, 12:56 PM' },
    { name: 'All_images.zip', date: '21st December, 12:56 PM' }
  ]);

  const activities = [
    { user: 'Alfen Loebe', action: 'Moved the task "the standard chunk" from Doing to To Do', date: '10:41 AM August 7, 2022' },
    { user: 'Jessie Samson', action: 'Attached images3.png to the task "the standard chunk"', date: '10:41 AM August 7, 2022' }
  ];

  const handleUpload = (info) => {
    const newAttachment = {
      name: info.file.name,
      date: new Date().toLocaleString()
    };
    setAttachments([...attachments, newAttachment]);
    message.success(`${info.file.name} téléchargé avec succès`);
  };

  const handleDeleteAttachment = (index) => {
    const newAttachments = [...attachments];
    newAttachments.splice(index, 1);
    setAttachments(newAttachments);
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'red';
      case 'medium': return 'orange';
      case 'low': return 'green';
      default: return 'blue';
    }
  };

  return (
    <Modal
      title={task?.title || 'Détails de la tâche'}
      open={visible}
      onCancel={onClose}
      footer={null}
      width={800}
    >
      {task && (
        <div>
          <Title level={4}>Description</Title>
          <Paragraph>{task.description || 'Aucune description fournie.'}</Paragraph>

          <Divider />

          <Title level={4}>Informations</Title>
          <Row gutter={[16, 16]}>
            <Col span={8}>
              <Text strong>Assigné à:</Text>
              <br />
              <Space>
                <Avatar icon={<UserOutlined />} size="small" />
                <Text>{task.assignee || 'Non assigné'}</Text>
              </Space>
            </Col>
            <Col span={8}>
              <Text strong>Priorité:</Text>
              <br />
              <Tag color={getPriorityColor(task.priority)}>
                {task.priority === 'high' ? 'Haute' : 
                 task.priority === 'low' ? 'Basse' : 'Moyenne'}
              </Tag>
            </Col>
            <Col span={8}>
              <Text strong>Date d'échéance:</Text>
              <br />
              <Text>{dayjs(task.dueDate).format('DD/MM/YYYY')}</Text>
            </Col>
          </Row>

          <div style={{ marginTop: 16 }}>
            <Text strong>Étiquettes:</Text>
            <br />
            <div style={{ marginTop: 8 }}>
              {task.labels?.map((label, i) => (
                <Tag key={i} color="blue">{label}</Tag>
              ))}
            </div>
          </div>

          <Divider />

          <Title level={4}>Pièces jointes</Title>
          <div style={{ marginBottom: 16 }}>
            {attachments.map((attachment, index) => (
              <Card key={index} size="small" style={{ marginBottom: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Space>
                    <PaperClipOutlined />
                    <div>
                      <Text>{attachment.name}</Text>
                      <br />
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        {attachment.date}
                      </Text>
                    </div>
                  </Space>
                  <Button 
                    size="small" 
                    danger 
                    icon={<DeleteOutlined />}
                    onClick={() => handleDeleteAttachment(index)}
                  />
                </div>
              </Card>
            ))}
          </div>

          <Upload
            customRequest={handleUpload}
            showUploadList={false}
          >
            <Button icon={<PaperClipOutlined />}>
              Ajouter une pièce jointe
            </Button>
          </Upload>

          <Divider />

          <Title level={4}>Actions</Title>
          <Row gutter={[8, 8]}>
            <Col span={6}>
              <Button block icon={<ArrowUpOutlined />}>Déplacer</Button>
            </Col>
            <Col span={6}>
              <Button block icon={<MoreOutlined />}>Dupliquer</Button>
            </Col>
            <Col span={6}>
              <Button block icon={<MoreOutlined />}>Partager</Button>
            </Col>
            <Col span={6}>
              <Button block icon={<MoreOutlined />}>Modèle</Button>
            </Col>
            <Col span={6}>
              <Button block icon={<ArrowUpOutlined />}>Haut</Button>
            </Col>
            <Col span={6}>
              <Button block icon={<InboxOutlined />}>Archiver</Button>
            </Col>
            <Col span={6}>
              <Button block danger icon={<DeleteOutlined />}>Supprimer</Button>
            </Col>
            <Col span={6}>
              <Button block icon={<PrinterOutlined />}>Imprimer</Button>
            </Col>
          </Row>

          <Divider />

          <Title level={4}>Activités</Title>
          <Timeline>
            {activities.map((activity, index) => (
              <Timeline.Item key={index}>
                <Text strong>{activity.user}</Text>
                <br />
                <Text>{activity.action}</Text>
                <br />
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  {activity.date}
                </Text>
              </Timeline.Item>
            ))}
          </Timeline>
        </div>
      )}
    </Modal>
  );
};

export default KanbanBoard;