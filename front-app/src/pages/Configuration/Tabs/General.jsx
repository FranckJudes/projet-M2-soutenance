import React, { useState, useCallback, useEffect } from 'react';
import { Card, CardWithMedia } from '../../../components/Card';
import { useTranslation } from 'react-i18next';
import { Input, Textarea } from '../../../components/Input';
import { ButtonWithIcon } from '../../../components/Button';
import { createProcessBpmn } from "../../../api/processBpmnApi";
import { useDropzone } from 'react-dropzone';
import TagsInput from 'react-tagsinput';
import 'react-tagsinput/react-tagsinput.css';
import toast from 'react-hot-toast';
import BpmnModelService from '../../../services/BpmnModelService';
import { Table, Button, Tag, Space, Select, Spin, Alert, Modal, Descriptions } from 'antd';
import { EyeOutlined, PlayCircleOutlined, InfoCircleOutlined, ReloadOutlined } from '@ant-design/icons';

function General({ sharedData, onSaveGeneral }) {
    const { t } = useTranslation();

    // États pour les champs de formulaire
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [tags, setTags] = useState([]);
    const [image, setImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // États pour les instances de processus
    const [processInstances, setProcessInstances] = useState([]);
    const [deployedProcesses, setDeployedProcesses] = useState([]);
    const [instancesLoading, setInstancesLoading] = useState(false);
    const [processesLoading, setProcessesLoading] = useState(false);
    const [selectedProcessKey, setSelectedProcessKey] = useState('all');
    const [instanceDetailModal, setInstanceDetailModal] = useState(false);
    const [selectedInstance, setSelectedInstance] = useState(null);

    // Initialiser les données si elles existent dans sharedData
    useEffect(() => {
        if (sharedData?.processData) {
            const { processName, processDescription, processTags, processImage } = sharedData.processData;
            if (processName) setName(processName);
            if (processDescription) setDescription(processDescription);
            if (processTags) setTags(Array.isArray(processTags) ? processTags : []);
            if (processImage) {
                setImage(processImage);
                if (typeof processImage === 'string') {
                    setImagePreview(processImage);
                } else if (processImage instanceof File) {
                    setImagePreview(URL.createObjectURL(processImage));
                }
            }
        }
        
        // Charger les données des processus et instances
        fetchDeployedProcesses();
        fetchProcessInstances();
    }, [sharedData]);

    // Récupérer les processus déployés
    const fetchDeployedProcesses = async () => {
        setProcessesLoading(true);
        try {
            const response = await BpmnModelService.getMyDeployedProcesses();
            console.log('Processus déployés:', response);
            const processesArray = response && response.data ? response.data : [];
            setDeployedProcesses(Array.isArray(processesArray) ? processesArray : []);
        } catch (error) {
            console.error('Erreur lors de la récupération des processus:', error);
            toast.error('Erreur lors de la récupération des processus');
        } finally {
            setProcessesLoading(false);
        }
    };

    // Récupérer les instances de processus
    const fetchProcessInstances = async () => {
        setInstancesLoading(true);
        try {
            const response = await BpmnModelService.getMyProcessInstances();
            console.log('Instances de processus:', response);
            const instancesArray = response && response.data ? response.data : [];
            setProcessInstances(Array.isArray(instancesArray) ? instancesArray : []);
        } catch (error) {
            console.error('Erreur lors de la récupération des instances:', error);
            toast.error('Erreur lors de la récupération des instances');
        } finally {
            setInstancesLoading(false);
        }
    };

    // Filtrer les instances par processus sélectionné
    const filteredInstances = selectedProcessKey === 'all' 
        ? processInstances 
        : processInstances.filter(instance => instance.processDefinitionKey === selectedProcessKey);

    // Colonnes pour le tableau des instances
    const instanceColumns = [
        {
            title: 'ID Instance',
            dataIndex: 'processInstanceId',
            key: 'processInstanceId',
            render: (text) => (
                <span style={{ fontFamily: 'monospace', fontSize: '12px' }}>
                    {text ? text.substring(0, 8) + '...' : 'N/A'}
                </span>
            ),
            width: '15%'
        },
        {
            title: 'Processus',
            dataIndex: 'processDefinitionKey',
            key: 'processDefinitionKey',
            render: (text) => (
                <Tag color="blue">{text}</Tag>
            ),
            width: '20%'
        },
        {
            title: 'Statut',
            dataIndex: 'state',
            key: 'state',
            render: (state) => {
                const stateColors = {
                    'ACTIVE': 'green',
                    'COMPLETED': 'blue',
                    'SUSPENDED': 'orange',
                    'TERMINATED': 'red'
                };
                return <Tag color={stateColors[state] || 'default'}>{state}</Tag>;
            },
            width: '15%'
        },
        {
            title: 'Démarré le',
            dataIndex: 'startTime',
            key: 'startTime',
            render: (date) => date ? new Date(date).toLocaleString('fr-FR') : 'N/A',
            width: '20%'
        },
        {
            title: 'Fini le',
            dataIndex: 'endTime',
            key: 'endTime',
            render: (date) => date ? new Date(date).toLocaleString('fr-FR') : '-',
            width: '20%'
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <Space>
                    <Button
                        size="small"
                        icon={<InfoCircleOutlined />}
                        onClick={() => {
                            setSelectedInstance(record);
                            setInstanceDetailModal(true);
                        }}
                    >
                        Détails
                    </Button>
                </Space>
            ),
            width: '10%'
        }
    ];

    // Configuration de la dropzone
    const onDrop = useCallback(acceptedFiles => {
        const file = acceptedFiles[0];
        if (file) {
            setImage(file);
            setImagePreview(URL.createObjectURL(file));
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/*': ['.jpeg', '.jpg', '.png']
        },
        maxFiles: 1
    });

    // Gestion des changements d'entrée
    const handleInputChange = (setter) => (e) => {
        setter(e.target.value);
    };

    // Gestion des changements de tags
    const handleTagsChange = (newTags) => {
        setTags(newTags);
    };

    // Soumission du formulaire
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!name.trim()) {
            toast.error(t("Le nom du processus est obligatoire"));
            return;
        }
    
        setIsSubmitting(true);
    
        try {
            // Préparer les données à transmettre
            const processData = {
                processName: name,
                processDescription: description,
                processTags: tags,
                processImage: image,
                processId: sharedData?.processData?.processId || null
            };
    
            // Appeler le callback avec toutes les données
            if (onSaveGeneral) {
                onSaveGeneral(processData);
            }
    
            toast.success(t("Informations du processus enregistrées avec succès"));
        } catch (error) {
            console.error("Erreur:", error);
            toast.error(t("Erreur lors de l'enregistrement"));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="row">
            <div className="col-5 col-md-5 col-lg-5 pt-3">
                <Card
                    title={t("Informations du processus")}
                    children={
                        <form onSubmit={handleSubmit}>
                            <Input
                                type="text"
                                name="name"
                                label={t("Nom du processus")}
                                value={name}
                                onChange={handleInputChange(setName)}
                                required
                            />
                            <Textarea
                                name="description"
                                label={t("Description")}
                                value={description}
                                onChange={handleInputChange(setDescription)}
                                rows={4}
                            />
                            <div className="form-group">
                                <label>{t("Mots clés")}</label>
                                <TagsInput 
                                    value={tags} 
                                    onChange={handleTagsChange} 
                                    inputProps={{ 
                                        placeholder: t('Ajouter un mot clé et appuyer sur Entrée'),
                                        className: 'react-tagsinput-input'
                                    }}
                                    className="react-tagsinput"
                                />
                                <small className="form-text text-muted">
                                    {t("Saisissez un mot clé et appuyez sur Entrée pour l'ajouter")}
                                </small>
                            </div>
                            <div
                                className="pt-4"
                                style={{ display: 'flex', alignItems: 'end', justifyContent: 'flex-end' }}
                            >
                                <ButtonWithIcon
                                    label={isSubmitting ? t("Enregistrement...") : t("Enregistrer")}
                                    iconClass="fas fa-save"
                                    className="btn btn-icon icon-left btn-success"
                                    style={{ width: '100%' }}
                                    type="submit"
                                    disabled={isSubmitting}
                                />
                            </div>
                        </form>
                    }
                />
            </div>

            <div className="col-7 col-md-7 col-lg-7 pt-3">
                <Card
                    title={t("Image du processus")}
                    children={
                        <div>
                            <div {...getRootProps()} className="dropzone" style={{
                                border: '2px dashed #cccccc',
                                borderRadius: '4px',
                                padding: '20px',
                                textAlign: 'center',
                                cursor: 'pointer',
                                marginBottom: '20px',
                                backgroundColor: isDragActive ? '#f8f9fa' : 'white'
                            }}>
                                <input {...getInputProps()} />
                                {isDragActive ? (
                                    <p>{t("Déposez l'image ici...")}</p>
                                ) : (
                                    <div>
                                        <p>{t("Glissez et déposez une image ici, ou cliquez pour sélectionner une image")}</p>
                                        <p className="text-muted">{t("Formats acceptés: JPG, PNG")}</p>
                                    </div>
                                )}
                            </div>
                            
                            {imagePreview && (
                                <div className="image-preview" style={{ marginTop: '20px' }}>
                                    <h6>{t("Aperçu de l'image")}</h6>
                                    <div style={{ 
                                        maxWidth: '100%', 
                                        maxHeight: '300px', 
                                        overflow: 'hidden',
                                        border: '1px solid #ddd',
                                        borderRadius: '4px',
                                        padding: '5px'
                                    }}>
                                        <img 
                                            src={imagePreview} 
                                            alt={t("Aperçu du processus")} 
                                            style={{ 
                                                maxWidth: '100%', 
                                                maxHeight: '290px', 
                                                objectFit: 'contain' 
                                            }} 
                                        />
                                    </div>
                                    <div style={{ marginTop: '10px' }}>
                                        <button 
                                            type="button" 
                                            className="btn btn-sm btn-danger" 
                                            onClick={() => {
                                                setImage(null);
                                                setImagePreview(null);
                                            }}
                                        >
                                            <i className="fas fa-trash"></i> {t("Supprimer l'image")}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    }
                />
            </div>

          
          
        </div>
    );
}

export default General;
