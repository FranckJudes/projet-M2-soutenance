import React, { useState } from 'react';
import { FaTimes, FaPaperclip, FaEllipsisH, FaArrowUp, FaArchive, FaTrash, FaPrint } from 'react-icons/fa';
import '../utils/TaskModal.css'
const TaskModal = ({ task, onClose }) => {
  const [attachments, setAttachments] = useState([
    { name: 'Silly_sight_1.png', date: '21st December, 12:56 PM' },
    { name: 'All_images.zip', date: '21st December, 12:56 PM' }
  ]);
  const [activities, setActivities] = useState([
    { user: 'Alfen Loebe', action: 'Moved the task "the standard chunk" from Doing to To Do', date: '10:41 AM August 7, 2022' },
    { user: 'Jessie Samson', action: 'Attached images3.png to the task "the standard chunk"', date: '10:41 AM August 7, 2022' }
  ]);

  const handleAddAttachment = (file) => {
    // Dans une implémentation réelle, vous géreriez le téléchargement du fichier
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
        {/* En-tête du modal */}
        <div className="task-modal-header">
          <h2>{task?.title || 'Détails de la tâche'}</h2>
          <button className="close-btn" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        {/* Corps du modal */}
        <div className="task-modal-body">
          {/* Section Description */}
          <div className="task-section">
            <h3>Description</h3>
            <p>{task?.description || 'Aucune description fournie.'}</p>
          </div>

          {/* Section Board */}
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

          {/* Section Attachments */}
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

          {/* Section Actions */}
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

          {/* Section Activities */}
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

        {/* Pied de page du modal */}
        <div className="task-modal-footer">
          <span className="copyright">02.4 © Themewagon</span>
        </div>
      </div>
    </div>
  );
};

export default TaskModal;