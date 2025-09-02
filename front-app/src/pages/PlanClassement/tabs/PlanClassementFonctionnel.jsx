import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
    getAllPlanClassement,
    deletePlanClassement,
    updatePlanClassement,
    createPlanClassement,
} from "../../../services/PlanClassementService";
import { showAlert } from "../../../components/SweetAlert.jsx";
import { useToast } from "../../../components/Toast";
import { 
    Card, 
    Tree, 
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
    EyeOutlined,
    PlusCircleOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { TextArea } = Input;

// Transformation des données API en structure arborescente
const transformToTreeData = (data) => {
  if (!data || !Array.isArray(data)) return [];
  
  // Vérifier si les données sont déjà hiérarchiques (avec des enfants)
  const hasHierarchicalData = data.some(item => item.children && Array.isArray(item.children));
  
  if (hasHierarchicalData) {
    // Les données sont déjà hiérarchiques, normaliser seulement le format
    return normalizeHierarchicalData(data);
  } else {
    // Les données sont plates, construire l'arborescence
    return buildTreeFromFlatData(data);
  }
};

// Normaliser les données hiérarchiques pour le format attendu par le composant
const normalizeHierarchicalData = (data) => {
  return data.map(item => ({
    ...item,
    plan_classement_id: item.id,
    codePlanClassement: item.codePlanClassement || item.codeplanclassement,
    libellePlanClassement: item.libellePlanClassement || item.libelleplanclassement,
    descriptionPlanClassement: item.descriptionPlanClassement || item.descriptionplanclassement,
    parentId: item.parentId || item.parent_id,
    isCollapsed: false,
    children: item.children ? normalizeHierarchicalData(item.children) : []
  }));
};

// Construire l'arborescence à partir de données plates
const buildTreeFromFlatData = (data) => {
  const nodeMap = new Map();
  data.forEach(item => {
    const normalizedItem = {
      ...item,
      plan_classement_id: item.id || item.plan_classement_id,
      codePlanClassement: item.codePlanClassement || item.codeplanclassement,
      libellePlanClassement: item.libellePlanClassement || item.libelleplanclassement,
      descriptionPlanClassement: item.descriptionPlanClassement || item.descriptionplanclassement,
      parentId: item.parentId || item.parent_id,
      isCollapsed: false,
      children: []
    };
    nodeMap.set(normalizedItem.plan_classement_id, normalizedItem);
  });

  const treeData = [];
  data.forEach(item => {
    const itemId = item.id || item.plan_classement_id;
    const node = nodeMap.get(itemId);
    const parentId = item.parentId || item.parent_id;
    
    if (!parentId) {
      treeData.push(node);
    } else {
      const parent = nodeMap.get(parentId);
      if (parent) {
        parent.children.push(node);
      }
    }
  });

  return treeData;
};

function OrgChart() {
    const { t } = useTranslation();
    const [nodes, setNodes] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        codePlanClassement: "",
        libellePlanClassement: "",
        descriptionPlanClassement: "",
        parentId: null,
        numeroOrdre: 1, // Valeur par défaut pour le champ obligatoire
    });
    const [editingNode, setEditingNode] = useState(null);
    const [selectedNode, setSelectedNode] = useState(null);
    const { showToast } = useToast();

    const toggleCollapse = (id) => {
        setNodes((prevNodes) =>
            prevNodes.map((node) =>
                node.plan_classement_id === id
                    ? { ...node, isCollapsed: !node.isCollapsed }
                    : node
            )
        );
        const node = findNodeById(nodes, id);
        if (node) setSelectedNode(node);
    };

    const findNodeById = (nodes, id) => {
        for (const node of nodes) {
            if (node.plan_classement_id === id) return node;
            if (node.children) {
                const found = findNodeById(node.children, id);
                if (found) return found;
            }
        }
        return null;
    };

    const [loading, setLoading] = useState(false);
    
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Utiliser l'API réelle
                const response = await getAllPlanClassement();
                console.log("Données reçues du backend:", response);
                
                if (response) {
                    // Transformer les données plates en structure arborescente
                    const treeData = transformToTreeData(response);
                    console.log("Données transformées:", treeData);
                    setNodes(treeData);
                } else {
                    message.error("Aucune donnée reçue du backend");
                    setNodes([]);
                }
            } catch (error) {
                console.error("Erreur lors du chargement des données", error);
                if (error === 'no_connexion') {
                    showToast({
                        title: "Erreur",
                        message: "Problème de connexion : Vérifiez votre réseau.",
                        color: "red",
                        position: "topRight",
                    });
                } else {
                    message.error("Impossible de charger les plans de classement");
                }
                // Ne plus utiliser les fake data en cas d'erreur
                setNodes([]);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleSubmit = async (values) => {
        // Avec Ant Design Form, nous recevons directement les valeurs du formulaire
        // et non un événement, donc pas besoin de e.preventDefault()
        setLoading(true);
        try {
            console.log("Valeurs du formulaire:", values);
            
            // Préparer les données à envoyer
            const dataToSubmit = {
                ...values,
                // Ajouter le parentId qui n'est pas géré par le formulaire
                parentId: formData.parentId
            };
            
            console.log("Données à soumettre:", dataToSubmit);
            
            if (editingNode) {
                // Utiliser l'API réelle pour la mise à jour
                await updatePlanClassement(editingNode.plan_classement_id, dataToSubmit);
                message.success("Plan de classement mis à jour avec succès");
                showToast({
                    title: "Succès",
                    message: "Plan de classement mis à jour avec succès.",
                    color: "green",
                    position: "topRight",
                });
            } else {
                // Utiliser l'API réelle pour la création
                await createPlanClassement(dataToSubmit);
                message.success("Nouveau plan de classement créé avec succès");
                showToast({
                    title: "Succès",
                    message: "Nouveau plan de classement ajouté.",
                    color: "green",
                    position: "topRight",
                });
            }
            // Recharger les données depuis l'API
            const updatedData = await getAllPlanClassement();
            if (updatedData) {
                const treeData = transformToTreeData(updatedData);
                setNodes(treeData);
            }
            setShowModal(false);
            setEditingNode(null);
            setFormData({
                codePlanClassement: "",
                libellePlanClassement: "",
                descriptionPlanClassement: "",
                parentId: null,
                numeroOrdre: 1,
            });
        } catch (error) {
            console.error("Erreur lors de l'ajout/mise à jour", error);
            message.error("Erreur lors de l'opération. Vérifiez les champs du formulaire.");
            showToast({
                title: "Erreur",
                message: "Vérifiez les champs du formulaire.",
                color: "red",
                position: "topRight",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleDelete = async (id) => {
        showAlert({
            title: <p>Confirmez-vous cette action ?</p>,
            text: "Cette action est irréversible.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Oui",
            cancelButtonText: "Non",
        }).then(async (result) => {
            if (result.isConfirmed) {
                setLoading(true);
                try {
                    // Utiliser l'API réelle
                    const response = await deletePlanClassement(id);
                    if (response && response.success) {
                        message.success("Plan de classement supprimé avec succès");
                        // Recharger les données depuis l'API
                        const apiResponse = await getAllPlanClassement();
                        if (apiResponse) {
                            const treeData = transformToTreeData(apiResponse);
                            setNodes(treeData);
                        }
                        setSelectedNode(null);
                        showToast({
                            title: "Succès",
                            message: "Plan de classement supprimé avec succès.",
                            color: "green",
                            position: "topRight",
                        });
                    }
                } catch (error) {
                    console.error("Erreur lors de la suppression", error);
                    message.error("Erreur lors de la suppression du plan de classement");
                    showToast({
                        title: "Erreur",
                        message: "Impossible de supprimer le plan de classement.",
                        color: "red",
                        position: "topRight",
                    });
                } finally {
                    setLoading(false);
                }
            } else if (result.isDismissed) {
                showToast({
                    title: "Attention",
                    message: "Annulation de la suppression.",
                    color: "red",
                    position: "topRight",
                });
            }
        });
    };

    const handleEdit = (node) => {
        setFormData({
            codePlanClassement: node.codePlanClassement || "",
            libellePlanClassement: node.libellePlanClassement || "",
            descriptionPlanClassement: node.descriptionPlanClassement || "",
            parentId: node.parentId || null,
            numeroOrdre: node.numeroOrdre || 1,
        });
        setEditingNode(node);
        setShowModal(true);
    };

    const handleAddChild = (node) => {
        if (!node || !node.plan_classement_id) {
            message.error("Impossible d'ajouter un sous-plan : parent invalide");
            return;
        }
        
        // Préparer le formulaire pour l'ajout d'un enfant
        // Utiliser le code du parent comme préfixe pour le code du sous-plan
        const parentCode = node.codePlanClassement || node.codeplanclassement || "";
        
        setFormData({
            codePlanClassement: parentCode ? `${parentCode}-` : "",
            libellePlanClassement: "",
            descriptionPlanClassement: "",
            parentId: node.plan_classement_id,
            numeroOrdre: 1 // Valeur par défaut
        });
        
        console.log("Préparation d'un sous-plan pour le parent:", node);
        setEditingNode(null); // Nous créons un nouveau nœud, pas d'édition
        setShowModal(true);
    };

    // Convertir les données en format compatible avec Ant Design Tree
    const convertToTreeData = (nodes) => {
        return nodes.map(node => ({
            key: node.plan_classement_id,
            title: node.libellePlanClassement || node.libelleplanclassement, // Support des deux formats
            code: node.codePlanClassement || node.codeplanclassement, // Support des deux formats
            description: node.descriptionPlanClassement || node.descriptionplanclassement, // Support des deux formats
            parentId: node.parentId || node.parent_id, // Support des deux formats
            numeroOrdre: node.numeroOrdre || 1,
            plan_classement_id: node.plan_classement_id, // Conserver l'ID original
            icon: node.children && node.children.length > 0 ? <FolderOutlined /> : <FileOutlined />,
            children: node.children && node.children.length > 0 ? convertToTreeData(node.children) : []
        }));
    };
    
    // Trouver un nœud dans l'arbre par son ID
    const findNodeInTreeData = (treeData, key) => {
        for (let node of treeData) {
            if (node.key === key) {
                return node;
            }
            if (node.children && node.children.length > 0) {
                const found = findNodeInTreeData(node.children, key);
                if (found) return found;
            }
        }
        return null;
    };

    // Convertir les données pour le composant Tree d'Ant Design
    const treeData = convertToTreeData(nodes);
    
    // Gérer la sélection d'un nœud dans l'arbre
    const onSelect = (selectedKeys, info) => {
        if (selectedKeys.length > 0) {
            const selectedId = selectedKeys[0];
            const node = findNodeById(nodes, selectedId);
            if (node) setSelectedNode(node);
        } else {
            setSelectedNode(null);
        }
    };
    
    // Gérer la sélection d'un nœud dans l'arbre
    
    return (
        <>
            <Spin spinning={loading} tip="Chargement...">
                <div style={{ padding: '20px' }}>
                    <Card>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <Title level={4}>Gestion de Categorie</Title>
                            <Button 
                                type="primary" 
                                icon={<PlusOutlined />} 
                                onClick={() => {
                                    setFormData({
                                        codeplanclassement: "",
                                        libelleplanclassement: "",
                                        descriptionplanclassement: "",
                                        parent_id: null,
                                    });
                                    setEditingNode(null);
                                    setShowModal(true);
                                }}
                            >
                                {t("Ajouter une categorie")}
                            </Button>
                        </div>
                        
                        <div style={{ display: 'flex', gap: '20px' }}>
                            <div style={{ width: '60%', minHeight: '400px', border: '1px solid #f0f0f0', borderRadius: '8px', padding: '16px' }}>
                                {nodes.length > 0 ? (
                                    <Tree
                                        showIcon
                                        defaultExpandAll
                                        onSelect={onSelect}
                                        treeData={treeData}
                                    />
                                ) : (
                                    <div style={{ textAlign: 'center', padding: '40px 0' }}>
                                        <Text type="secondary">Aucune    categorie disponible</Text>
                                    </div>
                                )}
                            </div>
                            
                            <div style={{ width: '40%' }}>
                                {selectedNode ? (
                                    <Card
                                        title={<span><InfoCircleOutlined /> Détails de la categorie</span>}
                                        bordered={true}
                                        style={{ marginBottom: '20px' }}
                                    >
                                        <div style={{ marginBottom: '20px' }}>
                                            <p><Text strong>Code :</Text> {selectedNode.codeplanclassement}</p>
                                            <p><Text strong>Libellé :</Text> {selectedNode.libelleplanclassement}</p>
                                            <Divider style={{ margin: '10px 0' }} />
                                            <p><Text strong>Description :</Text></p>
                                            <p>{selectedNode.descriptionplanclassement}</p>
                                        </div>
                                        
                                        <Space>
                                            <Tooltip title="Ajouter un sous-plan">
                                                <Button 
                                                    type="primary" 
                                                    icon={<PlusCircleOutlined />} 
                                                    onClick={() => handleAddChild(selectedNode)}
                                                >
                                                    Ajouter un sous-plan
                                                </Button>
                                            </Tooltip>
                                            <Tooltip title="Modifier">
                                                <Button 
                                                    icon={<EditOutlined />} 
                                                    onClick={() => handleEdit(selectedNode)}
                                                >
                                                    Modifier
                                                </Button>
                                            </Tooltip>
                                            <Tooltip title="Supprimer">
                                                <Button 
                                                    danger 
                                                    icon={<DeleteOutlined />} 
                                                    onClick={() => handleDelete(selectedNode.plan_classement_id)}
                                                >
                                                    Supprimer
                                                </Button>
                                            </Tooltip>
                                        </Space>
                                    </Card>
                                ) : (
                                    <Card bordered={false} style={{ textAlign: 'center', padding: '40px 0' }}>
                                        <Text type="secondary">Sélectionnez un plan de classement pour afficher ses détails</Text>
                                    </Card>
                                )}
                            </div>
                        </div>
                    </Card>
                </div>
            </Spin>

            <Modal
                title={editingNode ? t("Modifier un plan de classement") : t("Ajouter un nouveau plan de classement")}
                open={showModal}
                onCancel={() => setShowModal(false)}
                footer={null}
                destroyOnClose={true}
            >
                <Form
                    layout="vertical"
                    onFinish={handleSubmit}
                    initialValues={{
                        codePlanClassement: formData.codePlanClassement,
                        libellePlanClassement: formData.libellePlanClassement,
                        descriptionPlanClassement: formData.descriptionPlanClassement,
                        numeroOrdre: formData.numeroOrdre || 1
                    }}
                    name="planClassementForm"
                    preserve={false}
                >
                    <Form.Item 
                        name="codePlanClassement" 
                        label={t("Code")} 
                        rules={[{ required: true, message: 'Veuillez saisir le code de la categorie' }]}
                    >
                        <Input 
                            placeholder="Code de la categorie" 
                        />
                    </Form.Item>
                    
                    <Form.Item 
                        name="libellePlanClassement" 
                        label={t("Libellé")} 
                        rules={[{ required: true, message: 'Veuillez saisir le libellé de la categorie' }]}
                    >
                        <Input 
                            placeholder="Libellé de la categorie" 
                        />
                    </Form.Item>
                    
                    <Form.Item 
                        name="descriptionPlanClassement" 
                        label={t("Description")} 
                        rules={[{ required: true, message: 'Veuillez saisir une description' }]}
                    >
                        <TextArea 
                            rows={4} 
                            placeholder="Description de la categorie" 
                        />
                    </Form.Item>
                    
                    <Form.Item 
                        name="numeroOrdre" 
                        label={t("Numéro d'ordre")} 
                        rules={[{ required: true, message: 'Veuillez saisir un numéro d\'ordre' }]}
                        hidden={true} // Caché car géré automatiquement
                        initialValue={1}
                    >
                        <Input 
                            type="number" 
                            min="1"
                            placeholder="Numéro d'ordre" 
                        />
                    </Form.Item>
                    
                    <Form.Item>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                            <Button onClick={() => setShowModal(false)}>Annuler</Button>
                            <Button type="primary" htmlType="submit">
                                {editingNode ? t("Mettre à jour") : t("Ajouter")}
                            </Button>
                        </div>
                    </Form.Item>
                </Form>
            </Modal>
        </>
    );
};

export default OrgChart;