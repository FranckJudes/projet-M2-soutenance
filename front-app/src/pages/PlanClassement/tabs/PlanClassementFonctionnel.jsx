import React, { useEffect, useState } from "react";
import { Card } from "../../../components/Card";
import { ModalComponent } from "../../../components/Modal.jsx";
import { Input, Textarea } from "../../../components/Input.jsx";
import { useTranslation } from "react-i18next";
import {
    getAllPlanClassement,
    deletePlanClassement,
    updatePlanClassement,
    createPlanClassement,
} from "../../../api/PlanClassementApi.jsx";
import {showAlert} from "../../../components/SweetAlert.jsx";
import { useToast } from "../../../components/Toast";

// Données fictives pour tester le composant
const fakeData = [
  {
    plan_classement_id: 1,
    codeplanclassement: "ADM",
    libelleplanclassement: "Administration",
    descriptionplanclassement: "Documents administratifs généraux",
    parent_id: null,
    isCollapsed: false,
    children: [
      {
        plan_classement_id: 2,
        codeplanclassement: "ADM-RH",
        libelleplanclassement: "Ressources Humaines",
        descriptionplanclassement: "Documents relatifs à la gestion du personnel",
        parent_id: 1,
        isCollapsed: true,
        children: [
          {
            plan_classement_id: 6,
            codeplanclassement: "ADM-RH-CONT",
            libelleplanclassement: "Contrats",
            descriptionplanclassement: "Contrats de travail",
            parent_id: 2,
            isCollapsed: true,
            children: []
          },
          {
            plan_classement_id: 7,
            codeplanclassement: "ADM-RH-PAIE",
            libelleplanclassement: "Paie",
            descriptionplanclassement: "Documents de paie",
            parent_id: 2,
            isCollapsed: true,
            children: []
          }
        ]
      },
      {
        plan_classement_id: 3,
        codeplanclassement: "ADM-FIN",
        libelleplanclassement: "Finance",
        descriptionplanclassement: "Documents financiers",
        parent_id: 1,
        isCollapsed: true,
        children: [
          {
            plan_classement_id: 8,
            codeplanclassement: "ADM-FIN-FACT",
            libelleplanclassement: "Factures",
            descriptionplanclassement: "Factures clients et fournisseurs",
            parent_id: 3,
            isCollapsed: true,
            children: []
          },
          {
            plan_classement_id: 9,
            codeplanclassement: "ADM-FIN-COMPT",
            libelleplanclassement: "Comptabilité",
            descriptionplanclassement: "Documents comptables",
            parent_id: 3,
            isCollapsed: true,
            children: []
          }
        ]
      }
    ]
  },
  {
    plan_classement_id: 4,
    codeplanclassement: "TECH",
    libelleplanclassement: "Technique",
    descriptionplanclassement: "Documents techniques",
    parent_id: null,
    isCollapsed: false,
    children: [
      {
        plan_classement_id: 10,
        codeplanclassement: "TECH-PROJ",
        libelleplanclassement: "Projets",
        descriptionplanclassement: "Documentation des projets techniques",
        parent_id: 4,
        isCollapsed: true,
        children: []
      },
      {
        plan_classement_id: 11,
        codeplanclassement: "TECH-MAINT",
        libelleplanclassement: "Maintenance",
        descriptionplanclassement: "Documents de maintenance",
        parent_id: 4,
        isCollapsed: true,
        children: []
      }
    ]
  },
  {
    plan_classement_id: 5,
    codeplanclassement: "COMM",
    libelleplanclassement: "Commercial",
    descriptionplanclassement: "Documents commerciaux",
    parent_id: null,
    isCollapsed: false,
    children: [
      {
        plan_classement_id: 12,
        codeplanclassement: "COMM-MKT",
        libelleplanclassement: "Marketing",
        descriptionplanclassement: "Documents marketing",
        parent_id: 5,
        isCollapsed: true,
        children: []
      },
      {
        plan_classement_id: 13,
        codeplanclassement: "COMM-VENTE",
        libelleplanclassement: "Ventes",
        descriptionplanclassement: "Documents de vente",
        parent_id: 5,
        isCollapsed: true,
        children: [
          {
            plan_classement_id: 14,
            codeplanclassement: "COMM-VENTE-PROP",
            libelleplanclassement: "Propositions commerciales",
            descriptionplanclassement: "Propositions et devis clients",
            parent_id: 13,
            isCollapsed: true,
            children: []
          },
          {
            plan_classement_id: 15,
            codeplanclassement: "COMM-VENTE-CONT",
            libelleplanclassement: "Contrats clients",
            descriptionplanclassement: "Contrats signés avec les clients",
            parent_id: 13,
            isCollapsed: true,
            children: []
          }
        ]
      }
    ]
  }
];

// Mock des fonctions API pour le développement local
const mockGetAllPlanClassement = () => {
  return Promise.resolve(fakeData);
};

const mockDeletePlanClassement = (id) => {
  console.log(`Suppression simulée de l'élément avec l'ID: ${id}`);
  return Promise.resolve({ success: true });
};

const mockUpdatePlanClassement = (id, data) => {
  console.log(`Mise à jour simulée de l'élément avec l'ID: ${id}`, data);
  return Promise.resolve({ success: true });
};

const mockCreatePlanClassement = (data) => {
  console.log(`Création simulée d'un nouvel élément:`, data);
  // Simuler la création d'un nouvel ID
  const newId = Math.max(...fakeData.map(node => node.plan_classement_id)) + 1;
  return Promise.resolve({ ...data, plan_classement_id: newId });
};

function OrgChart() {
    const { t } = useTranslation();
    const [nodes, setNodes] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        codeplanclassement: "",
        libelleplanclassement: "",
        descriptionplanclassement: "",
        parent_id: null,
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

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Utiliser des données fictives au lieu de l'API réelle
                // const data = await getAllPlanClassement();
                const data = await mockGetAllPlanClassement();
                setNodes(data);
            } catch (error) {
                if (error ==='no_connexion'){
                    showToast({
                        title: "Erreur",
                        message: "Problème de connexion : Vérifiez votre réseau.",
                        color: "red",
                        position: "topRight",
                    });
                }
                console.error("Erreur lors du chargement des données", error);
            }
        };
        fetchData();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingNode) {
                // Utiliser la fonction mock au lieu de l'API réelle
                // await updatePlanClassement(editingNode.plan_classement_id, formData);
                await mockUpdatePlanClassement(editingNode.plan_classement_id, formData);
                showToast({
                    title: "Succès",
                    message: "Plan de classement mis à jour avec succès.",
                    color: "green",
                    position: "topRight",
                });
            } else {
                // Utiliser la fonction mock au lieu de l'API réelle
                // await createPlanClassement(formData);
                await mockCreatePlanClassement(formData);
            }
            // Recharger les données fictives
            const updatedNodes = await mockGetAllPlanClassement();
            setNodes(updatedNodes);
            setShowModal(false);
            setEditingNode(null);
            setFormData({
                codeplanclassement: "",
                libelleplanclassement: "",
                descriptionplanclassement: "",
                parent_id: null,
            });
            showToast({
                title: "Succès",
                message: editingNode ? "Plan de classement mis à jour." : "Nouveau plan de classement ajouté.",
                color: "green",
                position: "topRight",
            });
        } catch (error) {
            console.error("Erreur lors de l'ajout/mise à jour", error);
            setShowModal(false);
            showToast({
                title: "Erreur",
                message: "Verifier le champ de formulaire.",
                color: "red",
                position: "topRight",
            });
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
                    // Utiliser la fonction mock au lieu de l'API réelle
                    // await deletePlanClassement(id);
                    await mockDeletePlanClassement(id);
                    // Recharger les données fictives
                    const updatedNodes = await mockGetAllPlanClassement();
                    setNodes(updatedNodes);
                    setSelectedNode(null);
                showToast({
                    title: "Succès",
                    message: "Plan de classement supprimé avec succès.",
                    color: "green",
                    position: "topRight",
                });
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
            codeplanclassement: node.codeplanclassement || "",
            libelleplanclassement: node.libelleplanclassement || "",
            descriptionplanclassement: node.descriptionplanclassement || "",
            parent_id: node.parent_id || null,
        });
        setEditingNode(node);
        setShowModal(true);
    };

    const handleAddChild = (node) => {
        setFormData({
            codeplanclassement: "",
            libelleplanclassement: "",
            descriptionplanclassement: "",
            parent_id: node.plan_classement_id,
        });
        setEditingNode(null);
        setShowModal(true);
    };

    const renderTree = (node, depth = 0) => {
        const backgroundColor = depth === 0 ? "#BCCCDC" : "#F8FAFC";

        return (
            <div key={node.plan_classement_id} style={{ marginLeft: "20px" }}>
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        border: "1px solid black",
                        color: "black",
                        padding: "5px",
                        fontFamily: "Nunito, Segoe UI, Arial",
                        borderRadius: "4px",
                        backgroundColor,
                        marginBottom: "5px",
                        height: "48px",
                        cursor: "pointer",
                    }}
                    onClick={() => toggleCollapse(node.plan_classement_id)}
                >
                    <span style={{ fontSize: "14px" }}>
                        {node.isCollapsed ? "+" : "-"} {node.libelleplanclassement}
                    </span>
                </div>
                <div
                    style={{
                        display: node.isCollapsed ? "none" : "block",
                        transition: "all 0.3s ease-in-out",
                    }}
                >
                    {node.children && node.children.length > 0 && (
                        <div style={{ marginLeft: "20px" }}>
                            {node.children.map((child) => renderTree(child, depth + 1))}
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <>
            <div className="row">
                <div className="col-8">
                    <div className="card-header">
                        <h4>Gestion des Plans de Classement</h4>
                        <div className="card-header-action">
                            <button className="btn btn-success" onClick={() => setShowModal(true)}>
                                {t("Ajouter")}
                            </button>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-12">
                            {nodes.map((node) => renderTree(node))}
                        </div>
                    </div>
                </div>

                <div className="col-4">
                    {selectedNode && (
                        <Card
                            title="Détails"
                            children={
                                <div>
                                    <p><b>Code :</b> {selectedNode.codeplanclassement}</p>
                                    <p><b>Libellé :</b> {selectedNode.libelleplanclassement}</p>
                                    <p><b>Description :</b> {selectedNode.descriptionplanclassement}</p>
                                </div>
                            }
                            footer={
                                <div>
                                    <button className="btn btn-success ml-2" onClick={() => handleAddChild(selectedNode)}>
                                        <i className="fas fa-plus"></i>
                                    </button>
                                    <button className="btn btn-primary ml-2" onClick={() => handleEdit(selectedNode)}>
                                        <i className="fas fa-edit"></i>
                                    </button>
                                    <button className="btn btn-danger ml-2" onClick={() => handleDelete(selectedNode.plan_classement_id)}>
                                        <i className="fas fa-trash"></i>
                                    </button>
                                </div>
                            }
                        />
                    )}
                </div>
            </div>

            <ModalComponent
                showModal={showModal}
                toggleModal={() => setShowModal(!showModal)}
                titleModal={editingNode ? t("Modifier une entrée") : t("Ajouter une nouvelle entrée")}
            >
                <form onSubmit={handleSubmit}>
                    <Input name="codeplanclassement" label={t("Code")} required onChange={handleInputChange} value={formData.codeplanclassement} />
                    <Input name="libelleplanclassement" label={t("Libellé")} required onChange={handleInputChange} value={formData.libelleplanclassement} />
                    <Textarea name="descriptionplanclassement" label={t("Description")} required onChange={handleInputChange} value={formData.descriptionplanclassement} />
                    <input type="hidden" name="parent_id" value={formData.parent_id || ""} />
                    <button type="submit" className="btn btn-success">
                        {editingNode ? t("Mettre à jour") : t("Ajouter")}
                    </button>
                </form>
            </ModalComponent>
        </>
    );
};

export default OrgChart;