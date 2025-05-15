// TaskDetails.js
import React from "react";

const TaskDetails = ({ task, onClose }) => {
    return (
        <div
            className="modal fade bd-example-modal-lg show"
            tabIndex="-1"
            role="dialog"
            style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
        >
            <div className="modal-dialog modal-lg" role="document">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">{task.content}</h5>
                        <button
                            type="button"
                            className="close"
                            onClick={onClose}
                            aria-label="Close"
                        >
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                    <div className="modal-body">
                        {/* Contenu de la tâche */}
                        <h6 className="text-muted">Description</h6>
                        <p>{task.description || "Pas de description disponible."}</p>
                        <h6 className="text-muted">Tag</h6>
                        <p>{task.tag}</p>
                        <h6 className="text-muted">Date</h6>
                        <p>{task.date}</p>
                        <h6 className="text-muted">Assigné à</h6>
                        <div className="mb-3">
                            {task.users && task.users.length > 0 ? (
                                task.users.map((user, index) => (
                                    <span key={index} className="badge badge-secondary mr-1">
                    {user}
                  </span>
                                ))
                            ) : (
                                <p>Aucun Utilisateur assigné.</p>
                            )}
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={onClose}
                        >
                            Fermer
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TaskDetails;
