import React, { useState, useEffect } from "react";
import Main from "../layout/Main";
import workflowService from "../services/WorkflowService";
import { toast } from "react-hot-toast";
import { FaPlay, FaStop, FaInfoCircle, FaCalendarAlt, FaCheck, FaExclamationCircle } from "react-icons/fa";
import "./Workflows.css";

function Workflows() {
  const [workflows, setWorkflows] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showStartModal, setShowStartModal] = useState(false);
  const [selectedProcess, setSelectedProcess] = useState("");
  const [variables, setVariables] = useState({});
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedWorkflow, setSelectedWorkflow] = useState(null);
  
  // ID utilisateur (à remplacer par l'ID de l'utilisateur connecté)
  const userId = '1';
  
  // Processus disponibles (à remplacer par des données réelles)
  const availableProcesses = [
    { id: "process-1", name: "Validation de document" },
    { id: "process-2", name: "Onboarding d'un nouvel employé" },
    { id: "process-3", name: "Approbation de congés" },
    { id: "process-4", name: "Demande d'achat" }
  ];

  // Charger les workflows actifs
  useEffect(() => {
    const fetchWorkflows = async () => {
      try {
        setIsLoading(true);
        const data = await workflowService.getActiveInstances(userId);
        setWorkflows(data);
        setIsLoading(false);
      } catch (error) {
        console.error('Erreur lors du chargement des workflows:', error);
        toast.error('Erreur lors du chargement des workflows');
        setIsLoading(false);
        
        // Utiliser des données fictives en cas d'erreur
        setWorkflows([
          {
            id: 'wf1',
            processName: 'Validation de document',
            status: 'ACTIVE',
            startDate: '2025-05-15T14:20:00',
            currentTask: 'Révision par le responsable',
            initiator: { id: '1', name: 'Utilisateur Actuel' },
            variables: { documentName: 'Rapport Q1 2025.pdf' }
          },
          {
            id: 'wf2',
            processName: 'Onboarding d\'un nouvel employé',
            status: 'ACTIVE',
            startDate: '2025-05-10T09:00:00',
            currentTask: 'Configuration du poste de travail',
            initiator: { id: '1', name: 'Utilisateur Actuel' },
            variables: { employeeName: 'Jean Dupont', department: 'IT' }
          },
          {
            id: 'wf3',
            processName: 'Approbation de congés',
            status: 'ACTIVE',
            startDate: '2025-05-16T11:30:00',
            currentTask: 'Validation par le manager',
            initiator: { id: '1', name: 'Utilisateur Actuel' },
            variables: { startDate: '2025-06-15', endDate: '2025-06-30', reason: 'Vacances d\'été' }
          }
        ]);
      }
    };
    
    fetchWorkflows();
  }, [userId]);
  
  // Démarrer un nouveau processus
  const handleStartProcess = async () => {
    if (!selectedProcess) {
      toast.error('Veuillez sélectionner un processus');
      return;
    }
    
    try {
      const process = availableProcesses.find(p => p.id === selectedProcess);
      await workflowService.startProcess(process.name, userId, variables);
      
      toast.success(`Processus "${process.name}" démarré avec succès`);
      setShowStartModal(false);
      
      // Rafraîchir la liste des workflows
      const data = await workflowService.getActiveInstances(userId);
      setWorkflows(data);
    } catch (error) {
      console.error('Erreur lors du démarrage du processus:', error);
      toast.error('Erreur lors du démarrage du processus');
    }
  };
  
  // Afficher les détails d'un workflow
  const showWorkflowDetails = (workflow) => {
    setSelectedWorkflow(workflow);
    setShowDetailsModal(true);
  };
  
  // Formater la date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
  };
  
  // Déterminer la classe CSS pour le statut
  const getStatusClass = (status) => {
    switch (status) {
      case 'ACTIVE':
        return 'status-active';
      case 'COMPLETED':
        return 'status-completed';
      case 'SUSPENDED':
        return 'status-suspended';
      default:
        return '';
    }
  };
  
  // Déterminer l'icône pour le statut
  const getStatusIcon = (status) => {
    switch (status) {
      case 'ACTIVE':
        return <FaPlay />;
      case 'COMPLETED':
        return <FaCheck />;
      case 'SUSPENDED':
        return <FaStop />;
      default:
        return <FaExclamationCircle />;
    }
  };
  
  return (
    <Main>
      <div className="workflows-container">
        <div className="workflows-header">
          <h1 className="page-title">Gestion des workflows</h1>
          <button 
            className="btn btn-primary" 
            onClick={() => {
              setSelectedProcess("");
              setVariables({});
              setShowStartModal(true);
            }}
          >
            <FaPlay /> Démarrer un nouveau processus
          </button>
        </div>
        
        <p className="page-description">Suivez et gérez vos processus métier en cours</p>
        
        {isLoading ? (
          <div className="loading">Chargement des workflows...</div>
        ) : (
          <div className="workflows-list">
            {workflows.length === 0 ? (
              <div className="empty-state">
                Aucun workflow actif. Démarrez un nouveau processus pour commencer.
              </div>
            ) : (
              workflows.map(workflow => (
                <div key={workflow.id} className="workflow-card">
                  <div className="workflow-header">
                    <h3 className="workflow-name">{workflow.processName}</h3>
                    <span className={`workflow-status ${getStatusClass(workflow.status)}`}>
                      {getStatusIcon(workflow.status)} {workflow.status}
                    </span>
                  </div>
                  
                  <div className="workflow-details">
                    <div className="workflow-info">
                      <div className="info-item">
                        <FaCalendarAlt /> Démarré le: {formatDate(workflow.startDate)}
                      </div>
                      <div className="info-item">
                        <strong>Tâche actuelle:</strong> {workflow.currentTask}
                      </div>
                    </div>
                    
                    <button 
                      className="btn btn-outline" 
                      onClick={() => showWorkflowDetails(workflow)}
                    >
                      <FaInfoCircle /> Détails
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
      
      {/* Modal pour démarrer un nouveau processus */}
      {showStartModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Démarrer un nouveau processus</h2>
              <button className="btn-close" onClick={() => setShowStartModal(false)}>
                &times;
              </button>
            </div>
            
            <div className="modal-body">
              <div className="form-group">
                <label htmlFor="process">Sélectionnez un processus</label>
                <select 
                  id="process" 
                  value={selectedProcess} 
                  onChange={(e) => setSelectedProcess(e.target.value)}
                >
                  <option value="">-- Sélectionnez --</option>
                  {availableProcesses.map(process => (
                    <option key={process.id} value={process.id}>
                      {process.name}
                    </option>
                  ))}
                </select>
              </div>
              
              {selectedProcess === 'process-1' && (
                <div className="form-group">
                  <label htmlFor="documentName">Nom du document</label>
                  <input 
                    type="text" 
                    id="documentName" 
                    value={variables.documentName || ''} 
                    onChange={(e) => setVariables({...variables, documentName: e.target.value})}
                  />
                </div>
              )}
              
              {selectedProcess === 'process-2' && (
                <>
                  <div className="form-group">
                    <label htmlFor="employeeName">Nom de l'employé</label>
                    <input 
                      type="text" 
                      id="employeeName" 
                      value={variables.employeeName || ''} 
                      onChange={(e) => setVariables({...variables, employeeName: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="department">Département</label>
                    <input 
                      type="text" 
                      id="department" 
                      value={variables.department || ''} 
                      onChange={(e) => setVariables({...variables, department: e.target.value})}
                    />
                  </div>
                </>
              )}
              
              {selectedProcess === 'process-3' && (
                <>
                  <div className="form-group">
                    <label htmlFor="startDate">Date de début</label>
                    <input 
                      type="date" 
                      id="startDate" 
                      value={variables.startDate || ''} 
                      onChange={(e) => setVariables({...variables, startDate: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="endDate">Date de fin</label>
                    <input 
                      type="date" 
                      id="endDate" 
                      value={variables.endDate || ''} 
                      onChange={(e) => setVariables({...variables, endDate: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="reason">Motif</label>
                    <textarea 
                      id="reason" 
                      value={variables.reason || ''} 
                      onChange={(e) => setVariables({...variables, reason: e.target.value})}
                    ></textarea>
                  </div>
                </>
              )}
            </div>
            
            <div className="modal-footer">
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={() => setShowStartModal(false)}
              >
                Annuler
              </button>
              <button 
                type="button" 
                className="btn btn-primary" 
                onClick={handleStartProcess}
              >
                Démarrer
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Modal pour afficher les détails d'un workflow */}
      {showDetailsModal && selectedWorkflow && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Détails du workflow</h2>
              <button className="btn-close" onClick={() => setShowDetailsModal(false)}>
                &times;
              </button>
            </div>
            
            <div className="modal-body">
              <div className="workflow-detail-item">
                <strong>ID:</strong> {selectedWorkflow.id}
              </div>
              <div className="workflow-detail-item">
                <strong>Processus:</strong> {selectedWorkflow.processName}
              </div>
              <div className="workflow-detail-item">
                <strong>Statut:</strong> 
                <span className={`workflow-status ${getStatusClass(selectedWorkflow.status)}`}>
                  {getStatusIcon(selectedWorkflow.status)} {selectedWorkflow.status}
                </span>
              </div>
              <div className="workflow-detail-item">
                <strong>Démarré le:</strong> {formatDate(selectedWorkflow.startDate)}
              </div>
              <div className="workflow-detail-item">
                <strong>Initiateur:</strong> {selectedWorkflow.initiator.name}
              </div>
              <div className="workflow-detail-item">
                <strong>Tâche actuelle:</strong> {selectedWorkflow.currentTask}
              </div>
              
              <div className="workflow-detail-item">
                <strong>Variables:</strong>
                <pre>{JSON.stringify(selectedWorkflow.variables, null, 2)}</pre>
              </div>
            </div>
            
            <div className="modal-footer">
              <button 
                type="button" 
                className="btn btn-primary" 
                onClick={() => setShowDetailsModal(false)}
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </Main>
  );
}

export default Workflows;
