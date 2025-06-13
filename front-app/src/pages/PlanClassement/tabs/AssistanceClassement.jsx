import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { FileManager } from "@cubone/react-file-manager";

 import "@cubone/react-file-manager/dist/style.css";

import {
    getAllFileSchemes,
    deleteFileScheme,
    updateFileScheme,
    createFileScheme,
} from "../../../api/FileSchemeApi.jsx";
import { showAlert } from "../../../components/SweetAlert.jsx";
import { useToast } from "../../../components/Toast";
import { 
    Card, 
    Button, 
    Modal, 
    Form, 
    Input, 
    Typography, 
    Space, 
    Spin, 
    Tooltip, 
    Divider,
    message
} from 'antd';
import { 
    FolderOutlined, 
    FileOutlined, 
    EditOutlined, 
    DeleteOutlined, 
    PlusOutlined, 
    InfoCircleOutlined,
    ReloadOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { TextArea } = Input;

const AssistanceClassement = () => {
    const { t } = useTranslation();
    const { showToast } = useToast();
    
    const [loading, setLoading] = useState(false);
    const [files, setFiles] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        isDirectory: true,
        path: "",
        description: ""
    });
    const [editingFile, setEditingFile] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    
    // Transformer les file schemes en structure de fichiers
    const transformToFileStructure = (fileSchemes) => {
        if (!fileSchemes || fileSchemes.length === 0) return [];
        
        return fileSchemes.map(scheme => {
            const path = scheme.parentId 
                ? `/${scheme.id || scheme.file_scheme_id}`
                : `/${scheme.id || scheme.file_scheme_id}`;
                
            const fileObj = {
                name: scheme.label, // Utiliser label au lieu de name
                isDirectory: scheme.iconSeries === "folder", // Déterminer si c'est un dossier basé sur iconSeries
                path: path,
                updatedAt: scheme.updatedAt || new Date().toISOString(),
                description: scheme.description,
                file_scheme_id: scheme.id || scheme.file_scheme_id,
                parentId: scheme.parentId,
                colorSeries: scheme.colorSeries,
                iconSeries: scheme.iconSeries,
                type: scheme.type,
                planId: scheme.planId,
                documentId: scheme.documentId,
                workflowId: scheme.workflowId
            };
            
            if (scheme.children && scheme.children.length > 0) {
                fileObj.children = transformToFileStructure(scheme.children);
            }
            
            return fileObj;
        });
    };
    
    // Fonction pour transformer les données plates en structure arborescente
    const transformToTreeData = (flatData) => {
        const idMapping = flatData.reduce((acc, el) => {
            acc[el.id || el.file_scheme_id] = el;
            return acc;
        }, {});
        
        const root = [];
        
        flatData.forEach(el => {
            // Adapter les noms de champs si nécessaire
            if (!el.label && el.name) {
                el.label = el.name;
            }
            
            // Traiter les éléments avec un parent
            if (el.parentId) {
                const parentId = el.parentId;
                const parent = idMapping[parentId];
                
                // Si le parent existe, ajouter l'élément comme enfant
                if (parent) {
                    if (!parent.children) parent.children = [];
                    parent.children.push(el);
                } else {
                    // Si le parent n'existe pas, ajouter à la racine
                    root.push(el);
                }
            } else {
                // Les éléments sans parent vont à la racine
                root.push(el);
            }
        });
        
        return root;
    };
    
    // Charger les données au chargement du composant
    useEffect(() => {
        fetchData();
    }, []);
    
    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await getAllFileSchemes();
            if (response && response.data) {
                // Transformer les données plates en structure arborescente
                const treeData = transformToTreeData(response.data);
                const fileStructure = transformToFileStructure(treeData);
                setFiles(fileStructure);
            }
        } catch (error) {
            console.error("Erreur lors du chargement des données", error);
            message.error("Impossible de charger les données");
        } finally {
            setLoading(false);
        }
    };
    
    // Gérer la sélection d'un fichier
    const handleFileSelect = (file) => {
        setSelectedFile(file);
        console.log("Fichier sélectionné:", file);
    };
    
    // Gérer l'ajout d'un nouveau dossier
    const handleAddFolder = (parentFile = null) => {
        setEditingFile(null);
        setFormData({
            name: "",
            isDirectory: true,
            path: "",
            description: "",
            parentId: parentFile ? parentFile.file_scheme_id : null
        });
        setShowModal(true);
    };
    
    // Gérer l'ajout d'un sous-dossier
    const handleAddSubFolder = (parentFile) => {
        if (!parentFile || !parentFile.file_scheme_id) {
            message.error("Impossible d'ajouter un sous-dossier : parent invalide");
            return;
        }
        handleAddFolder(parentFile);
    };
    
    // Gérer la modification d'un dossier
    const handleEditFolder = (file) => {
        setEditingFile(file);
        setFormData({
            name: file.name,
            isDirectory: file.isDirectory,
            path: file.path,
            description: file.description
        });
        setShowModal(true);
    };
    
    // Gérer la suppression d'un dossier
    const handleDeleteFolder = (file) => {
        if (!file || !file.file_scheme_id) {
            message.error("Impossible de supprimer ce dossier : ID manquant");
            return;
        }
        
        Modal.confirm({
            title: t("Confirmation de suppression"),
            content: t("Êtes-vous sûr de vouloir supprimer ce dossier ?"),
            okText: t("Oui"),
            cancelText: t("Non"),
            onOk: async () => {
                try {
                    setLoading(true);
                    const response = await deleteFileScheme(file.file_scheme_id);
                    if (response && response.success) {
                        message.success("Dossier supprimé avec succès");
                        
                        // Recharger les données
                        const apiResponse = await getAllFileSchemes();
                        if (apiResponse && apiResponse.data) {
                            const treeData = transformToTreeData(apiResponse.data);
                            const fileStructure = transformToFileStructure(treeData);
                            setFiles(fileStructure);
                        }
                        setSelectedFile(null);
                        showToast({
                            title: "Succès",
                            message: "Dossier supprimé avec succès.",
                            color: "green",
                            position: "topRight",
                        });
                    }
                } catch (error) {
                    console.error("Erreur lors de la suppression", error);
                    message.error("Erreur lors de la suppression du dossier");
                    showToast({
                        title: "Erreur",
                        message: "Impossible de supprimer le dossier.",
                        color: "red",
                        position: "topRight",
                    });
                } finally {
                    setLoading(false);
                }
            }
        });
    };
    
    // Gérer la soumission du formulaire
    const handleSubmit = (values) => {
        setLoading(true);
        
        // Préparer les données pour l'API
        const apiData = {
            name: values.name, // Le FileSchemeApi.jsx convertira name en label
            description: values.description,
            isDirectory: true,
            parentId: editingFile?.parentId || formData.parentId || null,
            colorSeries: values.colorSeries || "#3498db",
            iconSeries: "folder", // Toujours un dossier
            type: values.type || "1",
            planId: values.planId || null,
            documentId: values.documentId || null,
            workflowId: values.workflowId || null
        };
        
        console.log("Données envoyées au serveur:", apiData);
        
        // Déterminer si c'est une création ou une mise à jour
        const isUpdate = editingFile && editingFile.file_scheme_id;
        
        const apiCall = isUpdate
            ? updateFileScheme(editingFile.file_scheme_id, apiData)
            : createFileScheme(apiData);
        
        apiCall.then((response) => {
            if (response && response.success) {
                message.success(isUpdate ? "Dossier mis à jour avec succès" : "Nouveau dossier créé avec succès");
                showToast({
                    title: "Succès",
                    message: isUpdate ? "Dossier mis à jour avec succès" : "Nouveau dossier ajouté.",
                    color: "green",
                    position: "topRight",
                });
                
                // Recharger les données
                getAllFileSchemes().then(apiResponse => {
                    if (apiResponse && apiResponse.data) {
                        const treeData = transformToTreeData(apiResponse.data);
                        const fileStructure = transformToFileStructure(treeData);
                        setFiles(fileStructure);
                    }
                    
                    setShowModal(false);
                    setEditingFile(null);
                    setFormData({
                        name: "",
                        isDirectory: true,
                        path: "",
                        description: ""
                    });
                });
            } else {
                message.error("Erreur lors de l'opération");
                showToast({
                    title: "Erreur",
                    message: "Impossible de traiter votre demande.",
                    color: "red",
                    position: "topRight",
                });
            }
        }).catch(error => {
            console.error("Erreur lors de la soumission", error);
            message.error("Erreur lors de la soumission du formulaire");
            showToast({
                title: "Erreur",
                message: "Impossible de traiter votre demande.",
                color: "red",
                position: "topRight",
            });
        }).finally(() => {
            setLoading(false);
        });
    };
    
    // Rafraîchir les données
    const refreshData = async () => {
        setLoading(true);
        try {
            const response = await getAllFileSchemes();
            if (response && response.data) {
                const treeData = transformToTreeData(response.data);
                const fileStructure = transformToFileStructure(treeData);
                setFiles(fileStructure);
                message.success("Données rafraîchies avec succès");
            }
        } catch (error) {
            console.error("Erreur lors du rafraîchissement", error);
            message.error("Impossible de rafraîchir les données");
        } finally {
            setLoading(false);
        }
    };
    
    return (
        <Spin spinning={loading} tip="Chargement...">
            <div style={{ padding: '20px' }}>
                <Card>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <Title level={4}>Assistance au classement - FileScheme</Title>
                        <Space>
                            <Button 
                                type="primary" 
                                icon={<PlusOutlined />} 
                                onClick={handleAddFolder}
                            >
                                {t("Ajouter un dossier")}
                            </Button>
                            <Button 
                                icon={<ReloadOutlined />} 
                                onClick={refreshData}
                            >
                                {t("Rafraîchir")}
                            </Button>
                        </Space>
                    </div>
                    
                    <div style={{ border: '1px solid #f0f0f0', borderRadius: '8px', padding: '16px' }}>
                        <FileManager 
                            files={files} 
                            onFileSelect={handleFileSelect}
                            actions={{
                                onEditFile: handleEditFolder,
                                onDeleteFile: handleDeleteFolder,
                                onCreateFolder: handleAddSubFolder
                            }}
                        />
                    </div>
                </Card>
            </div>
            
            <Modal
                title={editingFile ? t("Modifier un dossier") : t("Ajouter un nouveau dossier")}
                open={showModal}
                onCancel={() => setShowModal(false)}
                footer={null}
                destroyOnClose={true}
            >
                <Form
                    layout="vertical"
                    onFinish={handleSubmit}
                    initialValues={{
                        name: formData.name,
                        description: formData.description
                    }}
                    name="fileSchemeForm"
                >
                    <Form.Item 
                        name="name" 
                        label={t("Nom")} 
                        rules={[{ required: true, message: 'Veuillez saisir un nom' }]}
                    >
                        <Input 
                            placeholder="Nom du dossier" 
                        />
                    </Form.Item>
                    
                    <Form.Item 
                        name="description" 
                        label={t("Description")} 
                        rules={[{ required: true, message: 'Veuillez saisir une description' }]}
                    >
                        <TextArea 
                            rows={4} 
                            placeholder="Description du dossier" 
                        />
                    </Form.Item>
                    
                    <Form.Item>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                            <Button onClick={() => setShowModal(false)}>Annuler</Button>
                            <Button type="primary" htmlType="submit">
                                {editingFile ? t("Mettre à jour") : t("Ajouter")}
                            </Button>
                        </div>
                    </Form.Item>
                </Form>
            </Modal>
        </Spin>
    );
};

export default AssistanceClassement;
