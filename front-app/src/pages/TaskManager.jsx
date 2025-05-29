import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card } from '../components/Card';
import ProcessExecutionService from '../services/ProcessExecutionService';
import toast from 'react-hot-toast';

export default function TaskManager() {
    const { t } = useTranslation();
    const [myTasks, setMyTasks] = useState([]);
    const [candidateTasks, setCandidateTasks] = useState([]);
    const [activeTab, setActiveTab] = useState('my-tasks');
    const [loading, setLoading] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);
    const [taskDetails, setTaskDetails] = useState(null);

    // Charger les tâches au montage du composant
    useEffect(() => {
        loadTasks();
    }, []);

    const loadTasks = async () => {
        setLoading(true);
        try {
            const [myTasksData, candidateTasksData] = await Promise.all([
                ProcessExecutionService.getMyTasks(),
                ProcessExecutionService.getCandidateTasks()
            ]);
            
            setMyTasks(myTasksData);
            setCandidateTasks(candidateTasksData);
        } catch (error) {
            console.error('Erreur lors du chargement des tâches:', error);
            toast.error(t("Erreur lors du chargement des tâches"));
        } finally {
            setLoading(false);
        }
    };

    const handleClaimTask = async (taskId) => {
        try {
            await ProcessExecutionService.claimTask(taskId);
            toast.success(t("Tâche assignée avec succès"));
            loadTasks(); // Recharger les tâches
        } catch (error) {
            console.error('Erreur lors de l\'assignation:', error);
            toast.error(t("Erreur lors de l'assignation de la tâche"));
        }
    };

    const handleCompleteTask = async (taskId, variables = {}) => {
        try {
            await ProcessExecutionService.completeTask(taskId, variables);
            toast.success(t("Tâche complétée avec succès"));
            loadTasks(); // Recharger les tâches
            setSelectedTask(null);
            setTaskDetails(null);
        } catch (error) {
            console.error('Erreur lors de la completion:', error);
            toast.error(t("Erreur lors de la completion de la tâche"));
        }
    };

    const handleTaskDetails = async (task) => {
        try {
            setSelectedTask(task);
            const details = await ProcessExecutionService.getTaskDetails(task.id);
            setTaskDetails(details);
        } catch (error) {
            console.error('Erreur lors du chargement des détails:', error);
            toast.error(t("Erreur lors du chargement des détails"));
        }
    };

    const renderTaskCard = (task, canClaim = false) => (
        <div key={task.id} className="card mb-3">
            <div className="card-body">
                <div className="row">
                    <div className="col-md-8">
                        <h5 className="card-title">
                            {task.name || 'Tâche sans nom'}
                            {task.priority && (
                                <span className={`badge ml-2 ${getPriorityBadgeClass(task.priority)}`}>
                                    {getPriorityText(task.priority)}
                                </span>
                            )}
                        </h5>
                        <p className="card-text text-muted">
                            <small>
                                <strong>{t("Processus")}:</strong> {task.processDefinitionKey || 'N/A'} <br/>
                                <strong>{t("Créée le")}:</strong> {new Date(task.created).toLocaleString()} <br/>
                                {task.assignee && (
                                    <>
                                        <strong>{t("Assignée à")}:</strong> {task.assignee} <br/>
                                    </>
                                )}
                                {task.dueDate && (
                                    <>
                                        <strong>{t("Échéance")}:</strong> 
                                        <span className={isOverdue(task.dueDate) ? 'text-danger' : 'text-warning'}>
                                            {new Date(task.dueDate).toLocaleString()}
                                        </span>
                                    </>
                                )}
                            </small>
                        </p>
                        {task.description && (
                            <p className="card-text">{task.description}</p>
                        )}
                    </div>
                    <div className="col-md-4 text-right">
                        <div className="btn-group-vertical">
                            <button 
                                className="btn btn-outline-info btn-sm mb-1"
                                onClick={() => handleTaskDetails(task)}
                            >
                                <i className="fas fa-eye mr-1"></i>
                                {t("Détails")}
                            </button>
                            
                            {canClaim ? (
                                <button 
                                    className="btn btn-outline-primary btn-sm mb-1"
                                    onClick={() => handleClaimTask(task.id)}
                                >
                                    <i className="fas fa-hand-paper mr-1"></i>
                                    {t("Prendre")}
                                </button>
                            ) : (
                                <button 
                                    className="btn btn-success btn-sm mb-1"
                                    onClick={() => handleCompleteTask(task.id)}
                                >
                                    <i className="fas fa-check mr-1"></i>
                                    {t("Compléter")}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderTaskDetails = () => {
        if (!selectedTask || !taskDetails) return null;

        return (
            <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                <div className="modal-dialog modal-lg">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">
                                {t("Détails de la tâche")}: {selectedTask.name}
                            </h5>
                            <button 
                                type="button" 
                                className="close" 
                                onClick={() => {
                                    setSelectedTask(null);
                                    setTaskDetails(null);
                                }}
                            >
                                <span>&times;</span>
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="row">
                                <div className="col-md-6">
                                    <h6>{t("Informations générales")}</h6>
                                    <table className="table table-sm">
                                        <tbody>
                                            <tr>
                                                <td><strong>{t("ID")}:</strong></td>
                                                <td>{selectedTask.id}</td>
                                            </tr>
                                            <tr>
                                                <td><strong>{t("Nom")}:</strong></td>
                                                <td>{selectedTask.name}</td>
                                            </tr>
                                            <tr>
                                                <td><strong>{t("Assignée à")}:</strong></td>
                                                <td>{selectedTask.assignee || t("Non assignée")}</td>
                                            </tr>
                                            <tr>
                                                <td><strong>{t("Créée le")}:</strong></td>
                                                <td>{new Date(selectedTask.created).toLocaleString()}</td>
                                            </tr>
                                            {selectedTask.dueDate && (
                                                <tr>
                                                    <td><strong>{t("Échéance")}:</strong></td>
                                                    <td>{new Date(selectedTask.dueDate).toLocaleString()}</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                                <div className="col-md-6">
                                    <h6>{t("Variables du processus")}</h6>
                                    {taskDetails.variables && Object.keys(taskDetails.variables).length > 0 ? (
                                        <table className="table table-sm">
                                            <tbody>
                                                {Object.entries(taskDetails.variables).map(([key, value]) => (
                                                    <tr key={key}>
                                                        <td><strong>{key}:</strong></td>
                                                        <td>{JSON.stringify(value)}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    ) : (
                                        <p className="text-muted">{t("Aucune variable disponible")}</p>
                                    )}
                                </div>
                            </div>
                            
                            {selectedTask.description && (
                                <div className="mt-3">
                                    <h6>{t("Description")}</h6>
                                    <p>{selectedTask.description}</p>
                                </div>
                            )}
                        </div>
                        <div className="modal-footer">
                            <button 
                                type="button" 
                                className="btn btn-secondary"
                                onClick={() => {
                                    setSelectedTask(null);
                                    setTaskDetails(null);
                                }}
                            >
                                {t("Fermer")}
                            </button>
                            {!selectedTask.assignee && (
                                <button 
                                    type="button" 
                                    className="btn btn-primary"
                                    onClick={() => handleClaimTask(selectedTask.id)}
                                >
                                    <i className="fas fa-hand-paper mr-1"></i>
                                    {t("Prendre cette tâche")}
                                </button>
                            )}
                            {selectedTask.assignee && (
                                <button 
                                    type="button" 
                                    className="btn btn-success"
                                    onClick={() => handleCompleteTask(selectedTask.id)}
                                >
                                    <i className="fas fa-check mr-1"></i>
                                    {t("Compléter")}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const getPriorityBadgeClass = (priority) => {
        switch (priority) {
            case 'HIGH': return 'badge-danger';
            case 'MEDIUM': return 'badge-warning';
            case 'LOW': return 'badge-success';
            default: return 'badge-secondary';
        }
    };

    const getPriorityText = (priority) => {
        switch (priority) {
            case 'HIGH': return t("Haute");
            case 'MEDIUM': return t("Moyenne");
            case 'LOW': return t("Basse");
            default: return t("Non définie");
        }
    };

    const isOverdue = (dueDate) => {
        return new Date(dueDate) < new Date();
    };

    return (
        <div className="container-fluid">
            <div className="row">
                <div className="col-12">
                    <Card title={t("Gestionnaire de tâches")}>
                        {/* Onglets */}
                        <ul className="nav nav-tabs mb-3">
                            <li className="nav-item">
                                <button 
                                    className={`nav-link ${activeTab === 'my-tasks' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('my-tasks')}
                                >
                                    {t("Mes tâches")} 
                                    {myTasks.length > 0 && (
                                        <span className="badge badge-primary ml-1">{myTasks.length}</span>
                                    )}
                                </button>
                            </li>
                            <li className="nav-item">
                                <button 
                                    className={`nav-link ${activeTab === 'candidate-tasks' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('candidate-tasks')}
                                >
                                    {t("Tâches disponibles")}
                                    {candidateTasks.length > 0 && (
                                        <span className="badge badge-secondary ml-1">{candidateTasks.length}</span>
                                    )}
                                </button>
                            </li>
                        </ul>

                        {/* Bouton de rechargement */}
                        <div className="mb-3">
                            <button 
                                className="btn btn-outline-primary"
                                onClick={loadTasks}
                                disabled={loading}
                            >
                                <i className={`fas fa-sync-alt mr-1 ${loading ? 'fa-spin' : ''}`}></i>
                                {t("Actualiser")}
                            </button>
                        </div>

                        {/* Contenu des onglets */}
                        {loading ? (
                            <div className="text-center py-4">
                                <div className="spinner-border text-primary" role="status">
                                    <span className="sr-only">{t("Chargement...")}</span>
                                </div>
                            </div>
                        ) : (
                            <>
                                {activeTab === 'my-tasks' && (
                                    <div>
                                        <h5>{t("Mes tâches assignées")} ({myTasks.length})</h5>
                                        {myTasks.length === 0 ? (
                                            <div className="alert alert-info">
                                                <i className="fas fa-info-circle mr-2"></i>
                                                {t("Aucune tâche assignée pour le moment")}
                                            </div>
                                        ) : (
                                            myTasks.map(task => renderTaskCard(task, false))
                                        )}
                                    </div>
                                )}

                                {activeTab === 'candidate-tasks' && (
                                    <div>
                                        <h5>{t("Tâches disponibles")} ({candidateTasks.length})</h5>
                                        {candidateTasks.length === 0 ? (
                                            <div className="alert alert-info">
                                                <i className="fas fa-info-circle mr-2"></i>
                                                {t("Aucune tâche disponible pour le moment")}
                                            </div>
                                        ) : (
                                            candidateTasks.map(task => renderTaskCard(task, true))
                                        )}
                                    </div>
                                )}
                            </>
                        )}
                    </Card>
                </div>
            </div>

            {/* Modal des détails */}
            {renderTaskDetails()}
        </div>
    );
}