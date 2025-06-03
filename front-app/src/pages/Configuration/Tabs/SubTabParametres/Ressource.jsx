import React, { useState, useEffect, useRef, useMemo, forwardRef, useImperativeHandle } from 'react';
import { useTranslation } from 'react-i18next';
import { Checkbox, Input, Radio } from '../../../../components/Input';
import Select from 'react-select';
import JsTree from '../../../../components/JsTree.jsx';

const Ressource = forwardRef(({ selectedTask }, ref) => {
    const { t } = useTranslation();
    const [isCheckedAttachement, setIsCheckedAttachement] = useState(false);
    const [isDisplayDoc, setIsDisplayDoc] = useState(false);
    const [isDisplayFol, setIsDisplayFol] = useState(false);
    const [taskConfig, setTaskConfig] = useState(null);
    const initialRender = useRef(true);
    const selectedNodeRef = useRef(null);

    // Exposer les méthodes au composant parent via ref
    useImperativeHandle(ref, () => ({
        // Récupérer les données avec la structure demandée
        getResourceData: () => {
            if (!taskConfig) {
                // Retourner des valeurs par défaut si pas de configuration
                return {
                    attachmentsEnabled: false,
                    attachmentType: null,
                    securityLevel: null,
                    externalTools: null,
                    linkToOtherTask: null,
                    scriptBusinessRule: false,
                    addFormResource: false,
                    
                    // Actions communes
                    archiveAttachment: false,
                    shareArchivePdf: false,
                    describeFolderDoc: false,
                    deleteAttachmentDoc: false,
                    consultAttachmentDoc: false,
                    downloadZip: false,
                    
                    // Actions spécifiques aux documents
                    importAttachment: false,
                    editAttachment: false,
                    annotateDocument: false,
                    verifyAttachmentDoc: false,
                    searchInDocument: false,
                    removeDocument: false,
                    addNewAttachment: false,
                    convertAttachmentPdf: false,
                    downloadAttachmentPdf: false,
                    downloadOriginalFormat: false
                };
            }

            return {
                attachmentsEnabled: taskConfig.hasAttachement || false,
                attachmentType: taskConfig.selectedNode ? taskConfig.selectedNode.id : null,
                securityLevel: taskConfig.securityLevel || null,
                externalTools: taskConfig.externalTools || null,
                linkToOtherTask: taskConfig.linkToOtherTask || null,
                scriptBusinessRule: taskConfig.scriptRegleMetier || false,
                addFormResource: taskConfig.addFormResource || false,
                
                // Actions communes
                archiveAttachment: taskConfig.archiv_attach || false,
                shareArchivePdf: taskConfig.share_achiv_pdf || false,
                describeFolderDoc: taskConfig.decribe_fol_doc || false,
                deleteAttachmentDoc: taskConfig.delete_attach_doc || false,
                consultAttachmentDoc: taskConfig.consulter_attach_doc || false,
                downloadZip: taskConfig.download_zip || false,
                
                // Actions spécifiques aux documents
                importAttachment: taskConfig.import_attach || false,
                editAttachment: taskConfig.edit_attach || false,
                annotateDocument: taskConfig.annoter_doc || false,
                verifyAttachmentDoc: taskConfig.verif_attach_doc || false,
                searchInDocument: taskConfig.rechercher_un_doc || false,
                removeDocument: taskConfig.retirer_un_doc || false,
                addNewAttachment: taskConfig.add_new_attach || false,
                convertAttachmentPdf: taskConfig.conver_attach_pdf || false,
                downloadAttachmentPdf: taskConfig.download_attach_pdf || false,
                downloadOriginalFormat: taskConfig.download_original_format || false
            };
        },
        
        // Valider les données (VALIDATION OPTIONNELLE)
        validateData: () => {
            const data = {
                attachmentsEnabled: taskConfig?.hasAttachement || false,
                attachmentType: taskConfig?.selectedNode ? taskConfig.selectedNode.id : null,
                securityLevel: taskConfig?.securityLevel || null,
                externalTools: taskConfig?.externalTools || null,
                linkToOtherTask: taskConfig?.linkToOtherTask || null
            };
            
            const errors = [];
            
            // Validation optionnelle - tous les champs sont optionnels
            // Validation uniquement si URL externes spécifiées mais invalides
            if (taskConfig?.externalTools && taskConfig.externalTools.trim()) {
                try {
                    new URL(taskConfig.externalTools);
                } catch {
                    errors.push('External tools URL must be a valid URL');
                }
            }
            
            if (taskConfig?.linkToOtherTask && taskConfig.linkToOtherTask.trim()) {
                // Validation simple pour les liens vers d'autres tâches
                if (taskConfig.linkToOtherTask.length < 3) {
                    errors.push('Link to other task must be at least 3 characters');
                }
            }
            
            return {
                isValid: errors.length === 0,
                errors,
                data
            };
        },

        // Réinitialiser le composant
        reset: () => {
            setTaskConfig(null);
            setIsCheckedAttachement(false);
            setIsDisplayDoc(false);
            setIsDisplayFol(false);
            selectedNodeRef.current = null;
        }
    }));
    
    // Effet pour charger ou initialiser la configuration de la tâche sélectionnée
    useEffect(() => {
        // Réinitialiser les états locaux à chaque changement de tâche
        setIsCheckedAttachement(false);
        setIsDisplayDoc(false);
        setIsDisplayFol(false);
        selectedNodeRef.current = null;
        
        if (selectedTask) {
            console.log('Tâche sélectionnée dans Ressource:', selectedTask);
            
            // Charger la configuration existante depuis le localStorage
            const savedConfig = localStorage.getItem(`task_resource_config_${selectedTask.id}`);
            
            if (savedConfig) {
                try {
                    const config = JSON.parse(savedConfig);
                    setTaskConfig(config);
                    
                    // Restaurer tous les états locaux à partir du config sauvegardé
                    setIsCheckedAttachement(config.hasAttachement || false);
                    setIsDisplayDoc(config.isDisplayDoc || false);
                    setIsDisplayFol(config.isDisplayFol || false);
                    
                    // Stocker le nœud sélectionné dans la référence
                    if (config.selectedNode) {
                        selectedNodeRef.current = config.selectedNode;
                    }
                } catch (error) {
                    console.error('Erreur lors du parsing de la configuration:', error);
                    initializeNewConfig();
                }
            } else {
                // Initialiser une nouvelle configuration
                initializeNewConfig();
            }
        } else {
            // Réinitialiser l'état si aucune tâche n'est sélectionnée
            setTaskConfig(null);
        }
    }, [selectedTask]);
    
    // Fonction pour initialiser une nouvelle configuration
    const initializeNewConfig = () => {
        const initialConfig = {
            taskId: selectedTask.id,
            taskName: selectedTask.name,
            taskType: selectedTask.type,
            hasAttachement: false,
            isDisplayDoc: false,
            isDisplayFol: false,
            securityLevel: null,
            externalTools: '',
            linkToOtherTask: '',
            selectedNode: null,
            // Options communes pour les documents et dossiers
            archiv_attach: false,
            share_achiv_pdf: false,
            decribe_fol_doc: false,
            delete_attach_doc: false,
            consulter_attach_doc: false,
            download_zip: false,
            // Options spécifiques aux documents
            import_attach: false,
            edit_attach: false,
            annoter_doc: false,
            verif_attach_doc: false,
            rechercher_un_doc: false,
            retirer_un_doc: false,
            add_new_attach: false,
            conver_attach_pdf: false,
            download_attach_pdf: false,
            download_original_format: false,
            // Sections communes supplémentaires
            scriptRegleMetier: false,
            addFormResource: false
        };
        
        setTaskConfig(initialConfig);
        // Réinitialiser les états locaux
        setIsCheckedAttachement(false);
        setIsDisplayDoc(false);
        setIsDisplayFol(false);
        selectedNodeRef.current = null;
        
        // Sauvegarder immédiatement la configuration initiale
        saveTaskConfig(initialConfig);
    };
    
    // Marquer le premier rendu comme terminé
    useEffect(() => {
        initialRender.current = false;
    }, []);

    const handleCheckAttachement = () => {
        const newValue = !isCheckedAttachement;
        setIsCheckedAttachement(newValue);
        
        // Réinitialiser les états d'affichage lorsque l'attachement est désactivé
        if (!newValue) {
            setIsDisplayDoc(false);
            setIsDisplayFol(false);
            selectedNodeRef.current = null;
        }
        
        // Mettre à jour la configuration de la tâche
        if (taskConfig) {
            const updatedConfig = {
                ...taskConfig,
                hasAttachement: newValue,
                isDisplayDoc: newValue ? isDisplayDoc : false,
                isDisplayFol: newValue ? isDisplayFol : false,
                selectedNode: newValue ? selectedNodeRef.current : null
            };
            setTaskConfig(updatedConfig);
            saveTaskConfig(updatedConfig);
        }
    };

    const handleNodeSelect = (node) => {
        console.log('handleNodeSelect appelé avec:', node);
        
        // Vérifier si le nœud a un type défini
        // Type 1 = file, Type 0 = folder
        const isDoc = node.original && node.original.type === 1;
        const isFolder = node.original && node.original.type === 0;
        
        console.log('Type de nœud détecté:', {
            isDoc,
            isFolder,
            originalType: node.original ? node.original.type : 'undefined',
            nodeType: node.type
        });
        
        // Mettre à jour les états d'affichage
        setIsDisplayDoc(isDoc);
        setIsDisplayFol(isFolder);
        
        // Mettre à jour la référence du nœud sélectionné
        selectedNodeRef.current = node.original;
        
        console.log('États mis à jour:', {
            isDisplayDoc: isDoc,
            isDisplayFol: isFolder,
            selectedNode: node.original
        });
        
        // Mettre à jour la configuration de la tâche
        if (taskConfig) {
            const updatedConfig = {
                ...taskConfig,
                isDisplayDoc: isDoc,
                isDisplayFol: isFolder,
                selectedNode: node.original
            };
            setTaskConfig(updatedConfig);
            saveTaskConfig(updatedConfig);
            console.log('Configuration mise à jour:', updatedConfig);
        }
    };
    
    // Fonction pour sauvegarder la configuration de la tâche
    const saveTaskConfig = (config) => {
        if (selectedTask && config) {
            localStorage.setItem(`task_resource_config_${selectedTask.id}`, JSON.stringify(config));
            console.log('Configuration sauvegardée pour la tâche:', selectedTask.id, config);
        }
    };
    
    // Fonction pour gérer les changements dans les champs de texte
    const handleInputChange = (field, value) => {
        if (taskConfig) {
            const updatedConfig = {
                ...taskConfig,
                [field]: value
            };
            setTaskConfig(updatedConfig);
            saveTaskConfig(updatedConfig);
        }
    };
    
    // Fonction pour gérer les changements dans les cases à cocher
    const handleCheckboxChange = (field, checked) => {
        if (taskConfig) {
            const updatedConfig = {
                ...taskConfig,
                [field]: checked
            };
            setTaskConfig(updatedConfig);
            saveTaskConfig(updatedConfig);
        }
    };

    // Options pour le Select (exemple)
    const securityOptions = [
        { value: 'high', label: t('__high_security_') },
        { value: 'medium', label: t('__medium_security_') },
        { value: 'low', label: t('__low_security_') },
    ];

    // Arbre de données pour JsTree - avec types explicites
    const treeData = useMemo(() => [
        { 
            id: 0, 
            text: "Typologies", 
            parent: 0, 
            type: 0, // 0 = folder
            state: { opened: true } 
        },
        { 
            id: 1, 
            text: "Typologie 1", 
            parent: 0, 
            type: 0 // 0 = folder
        },
        { 
            id: 2, 
            text: "Typologie 2", 
            parent: 0, 
            type: 0 // 0 = folder
        },
        { 
            id: 3, 
            text: "Document 1.1", 
            parent: 1, 
            type: 1 // 1 = file
        },
        { 
            id: 4, 
            text: "Document 1.2", 
            parent: 1, 
            type: 1 // 1 = file
        },
        { 
            id: 5, 
            text: "Document 2.1", 
            parent: 2, 
            type: 1 // 1 = file
        },
        { 
            id: 6, 
            text: "Document 2.2", 
            parent: 2, 
            type: 1 // 1 = file
        }
    ], []);

    // Si aucune tâche n'est sélectionnée, afficher un message
    if (!selectedTask) {
        return (
            <div className="alert alert-info">
                Veuillez sélectionner une tâche pour configurer ses ressources.
            </div>
        );
    }

    // Si taskConfig n'est pas encore chargé, afficher un loader
    if (!taskConfig) {
        return (
            <div className="d-flex justify-content-center">
                <div className="spinner-border text-primary" role="status">
                    <span className="sr-only">Chargement...</span>
                </div>
            </div>
        );
    }

    // Debug: afficher les états actuels
    console.log('États actuels du composant Ressource:', {
        isCheckedAttachement,
        isDisplayDoc,
        isDisplayFol,
        selectedNodeRef: selectedNodeRef.current,
        taskConfig
    });

    return (
        <>
            {/* Section Pièces jointes */}
            <div className="d-flex py-2">
                <div className="col-4">
                    <div className="custom-control custom-checkbox">
                      <input 
                        type="checkbox" 
                        className="custom-control-input" 
                        id="piece_jointes"
                        checked={isCheckedAttachement}
                        onChange={handleCheckAttachement}
                        disabled={!selectedTask}
                      />
                      <label className="custom-control-label" htmlFor="piece_jointes">
                        {t('__piece_jt_')}
                      </label>
                    </div>
                </div>
                {isCheckedAttachement && (
                    <div className="col-8">
                        <JsTree
                            data={treeData}
                            plugins={["types"]}
                            onNodeSelect={handleNodeSelect}
                            initialSelectedNode={selectedNodeRef.current ? selectedNodeRef.current.id : null}
                            key={`ztree-${selectedTask ? selectedTask.id : 'no-task'}`}
                        />
                        <hr />
                    </div>
                )}
            </div>

            {/* Options pour les documents et dossiers */}
            {isCheckedAttachement && (isDisplayDoc || isDisplayFol) && (
                <div className="d-flex py-2">
                    <div className="col-4">
                        <strong>
                            {isDisplayDoc && "Options pour les documents"}
                            {isDisplayFol && "Options pour les dossiers"}
                        </strong>
                    </div>
                    <div className="col-8">
                        <div className="row">
                            {/* Options communes */}
                            <div className="col-5">
                                <Checkbox 
                                    name="archiv_attach" 
                                    id="__archiv_attac_" 
                                    label={t('__archiv_attac_')} 
                                    checked={taskConfig && taskConfig.archiv_attach || false}
                                    onChange={(e) => handleCheckboxChange('archiv_attach', e.target.checked)}
                                    disabled={!selectedTask}
                                />
                                <Checkbox 
                                    name="share_achiv_pdf" 
                                    id="__share_achiv_on_pdf" 
                                    label={t('__share_achiv_on_pdf')} 
                                    checked={taskConfig && taskConfig.share_achiv_pdf || false}
                                    onChange={(e) => handleCheckboxChange('share_achiv_pdf', e.target.checked)}
                                    disabled={!selectedTask}
                                />
                                <Checkbox 
                                    label={t('__decribe_fol_doc__')} 
                                    name="__decribe_fol_doc__" 
                                    id="__id_descrip_folder_" 
                                    checked={taskConfig && taskConfig.decribe_fol_doc || false}
                                    onChange={(e) => handleCheckboxChange('decribe_fol_doc', e.target.checked)}
                                    disabled={!selectedTask}
                                />
                                <Checkbox 
                                    name="delete_attach_doc" 
                                    id="__dele_attach_doc" 
                                    label={t('__dele_attach_doc')} 
                                    checked={taskConfig && taskConfig.delete_attach_doc || false}
                                    onChange={(e) => handleCheckboxChange('delete_attach_doc', e.target.checked)}
                                    disabled={!selectedTask}
                                />
                                <Checkbox 
                                    name="consulter_attach_doc" 
                                    id="__consulter_doc_att" 
                                    label={t('__consulter_doc_att')} 
                                    checked={taskConfig && taskConfig.consulter_attach_doc || false}
                                    onChange={(e) => handleCheckboxChange('consulter_attach_doc', e.target.checked)}
                                    disabled={!selectedTask}
                                />
                                <Checkbox 
                                    name="download_zip" 
                                    id="__download_zip_" 
                                    label={t('__download_zip_')} 
                                    checked={taskConfig && taskConfig.download_zip || false}
                                    onChange={(e) => handleCheckboxChange('download_zip', e.target.checked)}
                                    disabled={!selectedTask}
                                />

                                {/* Options spécifiques aux documents */}
                                {isDisplayDoc && (
                                    <>
                                        <Checkbox 
                                            name="import_attach" 
                                            id="__import_attach_" 
                                            label={t('__import_attach_')} 
                                            checked={taskConfig && taskConfig.import_attach || false}
                                            onChange={(e) => handleCheckboxChange('import_attach', e.target.checked)}
                                            disabled={!selectedTask}
                                        />
                                        <Checkbox 
                                            name="edit_attach" 
                                            id="__edit_attac_" 
                                            label={t('__edit_attac_')} 
                                            checked={taskConfig && taskConfig.edit_attach || false}
                                            onChange={(e) => handleCheckboxChange('edit_attach', e.target.checked)}
                                            disabled={!selectedTask}
                                        />
                                        <Checkbox 
                                            name="annoter_doc" 
                                            id="__annoter_doc_att" 
                                            label={t('__annoter_doc_att')} 
                                            checked={taskConfig && taskConfig.annoter_doc || false}
                                            onChange={(e) => handleCheckboxChange('annoter_doc', e.target.checked)}
                                            disabled={!selectedTask}
                                        />
                                    </>
                                )}
                            </div>

                            {/* Options spécifiques aux documents */}
                            {isDisplayDoc && (
                                <div className="col-7">
                                    <Checkbox 
                                        name="verif_attach_doc" 
                                        id="__verif_valid_attach_" 
                                        label={t('__verif_valid_attach_')} 
                                        checked={taskConfig && taskConfig.verif_attach_doc || false}
                                        onChange={(e) => handleCheckboxChange('verif_attach_doc', e.target.checked)}
                                        disabled={!selectedTask}
                                    />
                                    <Checkbox 
                                        name="rechercher_un_doc" 
                                        id="__research_in_Doc__" 
                                        label={t('__research_in_Doc__')} 
                                        checked={taskConfig && taskConfig.rechercher_un_doc || false}
                                        onChange={(e) => handleCheckboxChange('rechercher_un_doc', e.target.checked)}
                                        disabled={!selectedTask}
                                    />
                                    <Checkbox 
                                        name="retirer_un_doc" 
                                        id="__move_attach" 
                                        label={t('__move_attach')} 
                                        checked={taskConfig && taskConfig.retirer_un_doc || false}
                                        onChange={(e) => handleCheckboxChange('retirer_un_doc', e.target.checked)}
                                        disabled={!selectedTask}
                                    />
                                    <Checkbox 
                                        name="add_new_attach" 
                                        id="__add_new_attac_" 
                                        label={t('__add_new_attac_')} 
                                        checked={taskConfig && taskConfig.add_new_attach || false}
                                        onChange={(e) => handleCheckboxChange('add_new_attach', e.target.checked)}
                                        disabled={!selectedTask}
                                    />
                                    <Checkbox 
                                        name="conver_attach_pdf" 
                                        id="__conver_attac_pdf" 
                                        label={t('__conver_attac_pdf')} 
                                        checked={taskConfig && taskConfig.conver_attach_pdf || false}
                                        onChange={(e) => handleCheckboxChange('conver_attach_pdf', e.target.checked)}
                                        disabled={!selectedTask}
                                    />
                                    <Checkbox 
                                        name="download_attach_pdf" 
                                        id="__download_attac_pdf" 
                                        label={t('__download_attac_pdf')} 
                                        checked={taskConfig && taskConfig.download_attach_pdf || false}
                                        onChange={(e) => handleCheckboxChange('download_attach_pdf', e.target.checked)}
                                        disabled={!selectedTask}
                                    />
                                    <Checkbox 
                                        name="download_original_format" 
                                        id="__download_original_format__" 
                                        label={t('__download_original_format__')} 
                                        checked={taskConfig && taskConfig.download_original_format || false}
                                        onChange={(e) => handleCheckboxChange('download_original_format', e.target.checked)}
                                        disabled={!selectedTask}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Section Indicateurs de sécurité (maintenant visible pour les dossiers) */}
            {isDisplayFol && (
                <div className="d-flex py-2">
                    <div className="col-4">
                        <label>{t('__indic_security_')} :</label>
                    </div>
                    <div className="col-8">
                        <Select 
                            options={securityOptions} 
                            placeholder={t('__select_security_level_')} 
                            value={taskConfig && taskConfig.securityLevel ? securityOptions.find(opt => opt.value === taskConfig.securityLevel) : null}
                            onChange={(option) => handleInputChange('securityLevel', option ? option.value : null)}
                            isDisabled={!selectedTask}
                        />
                    </div>
                </div>
            )}

            {/* Sections communes */}
            {[
                { label: t('__extern_tools'), placeholder: t('external_api_'), field: 'externalTools' },
                { label: t('__add_form_ressource_'), field: 'addFormResource', radioLabel: t('__add_form_ressource_') },
                { label: t('__script_regle_metier'), radioLabel: t('__detail_script_aut__'), field: 'scriptRegleMetier' },
                { label: t('__link_other_task_'), placeholder: t('__link_other_task_'), field: 'linkToOtherTask' },
            ].map((section, index) => (
                <div className="d-flex py-2" key={index}>
                    <div className="col-4">
                        <label>{section.label} :</label>
                    </div>
                    <div className="col-8">
                        {section.placeholder ? (
                            <input 
                                type="url" 
                                className="form-control" 
                                placeholder={section.placeholder}
                                value={taskConfig && taskConfig[section.field] || ''}
                                onChange={(e) => handleInputChange(section.field, e.target.value)}
                                disabled={!selectedTask}
                            />
                        ) : (
                            <div className="custom-control custom-checkbox">
                              <input 
                                type="checkbox" 
                                className="custom-control-input" 
                                id={`id_${section.field}`}
                                checked={taskConfig && taskConfig[section.field] || false}
                                onChange={(e) => handleCheckboxChange(section.field, e.target.checked)}
                                disabled={!selectedTask}
                              />
                              <label className="custom-control-label" htmlFor={`id_${section.field}`}>
                                {section.radioLabel}
                              </label>
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </>
    );
});

export default Ressource;