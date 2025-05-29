import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card } from '../components/Card';
import ProcessExecutionService from '../services/ProcessExecutionService';
import toast from 'react-hot-toast';
import Select from 'react-select';

export default function ProcessStarter() {
    const { t } = useTranslation();
    const [availableProcesses, setAvailableProcesses] = useState([]);
    const [selectedProcess, setSelectedProcess] = useState(null);
    const [processVariables, setProcessVariables] = useState({});
    const [businessKey, setBusinessKey] = useState('');
    const [loading, setLoading] = useState(false);
    const [startingProcess, setStartingProcess] = useState(false);

    useEffect(() => {
        loadAvailableProcesses();
    }, []);

    const loadAvailableProcesses = async () => {
        setLoading(true);
        try {
            const processes = await ProcessExecutionService.getAvailableProcesses();
            setAvailableProcesses(processes.map(process => ({
                value: process.key,
                label: `${process.name || process.key} (v${process.version})`,
                data: process
            })));
        } catch (error) {
            console.error('Erreur lors du chargement des processus:', error);
            toast.error(t("Erreur lors du chargement des processus disponibles"));
        } finally {
            setLoading(false);
        }
    };

    const handleProcessChange = (selectedOption) => {
        setSelectedProcess(selectedOption);
        // Réinitialiser les variables lors du changement de processus
        setProcessVariables({});
        setBusinessKey('');
    };

    const handleVariableChange = (key, value) => {
        setProcessVariables(prev => ({
            ...prev,
            [key]: value
        }));
    };

    const addVariable = () => {
        const key = prompt(t("Nom de la variable:"));
        if (key && key.trim()) {
            handleVariableChange(key.trim(), '');
        }
    };

    const removeVariable = (key) => {
        const newVariables = { ...processVariables };
        delete newVariables[key];
        setProcessVariables(newVariables);
    };

    const handleStartProcess = async () => {
        if (!selectedProcess) {
            toast.error(t("Veuillez sélectionner un processus"));
            return;
        }

        setStartingProcess(true);
        try {
            const result = await ProcessExecutionService.startProcess(
                selectedProcess.value,
                processVariables,
                businessKey || null
            );

            toast.success(t("Processus démarré avec succès !"));
            console.log("Instance de processus créée:", result);

            // Réinitialiser le formulaire
            setSelectedProcess(null);
            setProcessVariables({});
            setBusinessKey('');

            // Optionnel: rediriger vers la liste des tâches
            // navigate('/tasks');

        } catch (error) {
            console.error('Erreur lors du démarrage du processus:', error);
            toast.error(t("Erreur lors du démarrage du processus"));
        } finally {
            setStartingProcess(false);
        }
    };

    const renderVariableInput = (key, value) => {
        // Détecter le type de valeur pour l'affichage approprié
        const renderInput = () => {
            // Si la valeur ressemble à un booléen
            if (value === true || value === false || value === 'true' || value === 'false') {
                return (
                    <select
                        className="form-control"
                        value={value.toString()}
                        onChange={(e) => handleVariableChange(key, e.target.value === 'true')}
                    >
                        <option value="true">{t("Vrai")}</option>
                        <option value="false">{t("Faux")}</option>
                    </select>
                );
            }
            
            // Si la valeur ressemble à un nombre
            if (!isNaN(value) && value !== '') {
                return (
                    <input
                        type="number"
                        className="form-control"
                        value={value}
                        onChange={(e) => handleVariableChange(key, parseFloat(e.target.value) || 0)}
                    />
                );
            }
            
            // Par défaut, input texte
            return (
                <input
                    type="text"
                    className="form-control"
                    value={value}
                    onChange={(e) => handleVariableChange(key, e.target.value)}
                    placeholder={t("Valeur de la variable")}
                />
            );
        };

        return (
            <div key={key} className="row mb-2 align-items-center">
                <div className="col-md-4">
                    <input
                        type="text"
                        className="form-control"
                        value={key}
                        onChange={(e) => {
                            const newKey = e.target.value;
                            const newVariables = { ...processVariables };
                            delete newVariables[key];
                            newVariables[newKey] = value;
                            setProcessVariables(newVariables);
                        }}
                        placeholder={t("Nom de la variable")}
                    />
                </div>
                <div className="col-md-6">
                    {renderInput()}
                </div>
                <div className="col-md-2">
                    <button
                        type="button"
                        className="btn btn-outline-danger btn-sm"
                        onClick={() => removeVariable(key)}
                    >
                        <i className="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div className="container-fluid">
            <div className="row">
                <div className="col-md-8">
                    <Card title={t("Démarrer un nouveau processus")}>
                        {loading ? (
                            <div className="text-center py-4">
                                <div className="spinner-border text-primary" role="status">
                                    <span className="sr-only">{t("Chargement...")}</span>
                                </div>
                            </div>
                        ) : (
                            <form onSubmit={(e) => { e.preventDefault(); handleStartProcess(); }}>
                                {/* Sélection du processus */}
                                <div className="form-group">
                                    <label>{t("Processus à démarrer")} *</label>
                                    <Select
                                        value={selectedProcess}
                                        onChange={handleProcessChange}
                                        options={availableProcesses}
                                        placeholder={t("Sélectionner un processus...")}
                                        isDisabled={loading}
                                        noOptionsMessage={() => t("Aucun processus disponible")}
                                    />
                                </div>

                                {/* Clé métier optionnelle */}
                                <div className="form-group">
                                    <label>{t("Clé métier (optionnel)")}</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={businessKey}
                                        onChange={(e) => setBusinessKey(e.target.value)}
                                        placeholder={t("Ex: CMD-2024-001, FACTURE-123, etc.")}
                                    />
                                    <small className="form-text text-muted">
                                        {t("Identifiant unique pour retrouver facilement cette instance")}
                                    </small>
                                </div>

                                {/* Variables du processus */}
                                <div className="form-group">
                                    <div className="d-flex justify-content-between align-items-center mb-3">
                                        <label>{t("Variables du processus")}</label>
                                        <button
                                            type="button"
                                            className="btn btn-outline-primary btn-sm"
                                            onClick={addVariable}
                                        >
                                            <i className="fas fa-plus mr-1"></i>
                                            {t("Ajouter une variable")}
                                        </button>
                                    </div>

                                    {Object.keys(processVariables).length === 0 ? (
                                        <div className="alert alert-info">
                                            <i className="fas fa-info-circle mr-2"></i>
                                            {t("Aucune variable définie. Cliquez sur 'Ajouter une variable' pour en créer.")}
                                        </div>
                                    ) : (
                                        <>
                                            <div className="row mb-2">
                                                <div className="col-md-4">
                                                    <strong>{t("Nom")}</strong>
                                                </div>
                                                <div className="col-md-6">
                                                    <strong>{t("Valeur")}</strong>
                                                </div>
                                                <div className="col-md-2">
                                                    <strong>{t("Action")}</strong>
                                                </div>
                                            </div>
                                            {Object.entries(processVariables).map(([key, value]) =>
                                                renderVariableInput(key, value)
                                            )}
                                        </>
                                    )}
                                </div>

                                {/* Boutons d'action */}
                                <div className="form-group">
                                    <button
                                        type="submit"
                                        className="btn btn-success"
                                        disabled={!selectedProcess || startingProcess}
                                    >
                                        {startingProcess ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm mr-2" role="status"></span>
                                                {t("Démarrage en cours...")}
                                            </>
                                        ) : (
                                            <>
                                                <i className="fas fa-play mr-1"></i>
                                                {t("Démarrer le processus")}
                                            </>
                                        )}
                                    </button>

                                    <button
                                        type="button"
                                        className="btn btn-outline-secondary ml-2"
                                        onClick={() => {
                                            setSelectedProcess(null);
                                            setProcessVariables({});
                                            setBusinessKey('');
                                        }}
                                        disabled={startingProcess}
                                    >
                                        {t("Réinitialiser")}
                                    </button>
                                </div>
                            </form>
                        )}
                    </Card>
                </div>

                <div className="col-md-4">
                    <Card title={t("Aide")}>
                        <div className="alert alert-info">
                            <h6><i className="fas fa-lightbulb mr-2"></i>{t("Conseils")}</h6>
                            <ul className="mb-0">
                                <li>{t("Sélectionnez le processus que vous souhaitez démarrer")}</li>
                                <li>{t("La clé métier permet d'identifier facilement votre instance")}</li>
                                <li>{t("Les variables sont transmises au processus pour personnaliser son exécution")}</li>
                                <li>{t("Une fois démarré, vous pourrez suivre l'avancement dans la section Tâches")}</li>
                            </ul>
                        </div>

                        {selectedProcess && (
                            <div className="alert alert-success">
                                <h6><i className="fas fa-info-circle mr-2"></i>{t("Processus sélectionné")}</h6>
                                <p className="mb-1"><strong>{t("Nom")}:</strong> {selectedProcess.data.name || selectedProcess.data.key}</p>
                                <p className="mb-1"><strong>{t("Clé")}:</strong> {selectedProcess.data.key}</p>
                                <p className="mb-1"><strong>{t("Version")}:</strong> {selectedProcess.data.version}</p>
                                {selectedProcess.data.description && (
                                    <p className="mb-0"><strong>{t("Description")}:</strong> {selectedProcess.data.description}</p>
                                )}
                            </div>
                        )}
                    </Card>

                    {/* Variables prédéfinies communes */}
                    <Card title={t("Variables communes")}>
                        <p className="text-muted small mb-3">
                            {t("Cliquez pour ajouter rapidement des variables communes")}
                        </p>
                        
                        <div className="d-grid gap-2">
                            <button
                                type="button"
                                className="btn btn-outline-info btn-sm"
                                onClick={() => handleVariableChange('priority', 'MEDIUM')}
                            >
                                {t("Priorité")}
                            </button>
                            <button
                                type="button"
                                className="btn btn-outline-info btn-sm"
                                onClick={() => handleVariableChange('department', '')}
                            >
                                {t("Département")}
                            </button>
                            <button
                                type="button"
                                className="btn btn-outline-info btn-sm"
                                onClick={() => handleVariableChange('requestor', '')}
                            >
                                {t("Demandeur")}
                            </button>
                            <button
                                type="button"
                                className="btn btn-outline-info btn-sm"
                                onClick={() => handleVariableChange('amount', 0)}
                            >
                                {t("Montant")}
                            </button>
                            <button
                                type="button"
                                className="btn btn-outline-info btn-sm"
                                onClick={() => handleVariableChange('urgent', false)}
                            >
                                {t("Urgent")}
                            </button>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}