import React, { useState, useEffect } from "react";
import Main from "../../layout/Main";
import { Card, Table, Button, Badge, Spin, Space, Tag, Popconfirm, message, Tooltip, Breadcrumb, theme } from "antd";
import { EditOutlined, DeleteOutlined, KeyOutlined, PlusOutlined, CheckCircleOutlined, CloseCircleOutlined, ReloadOutlined, HomeOutlined, UserOutlined, StopOutlined, PlayCircleOutlined, CameraOutlined } from "@ant-design/icons";
import UserService from "../../services/UserService";
import "../../styles/users.css";

// Importation des composants
import UserModal from "./components/UserModal.jsx";

const User = () => {
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [currentUser, setCurrentUser] = useState({
        id: null,
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        role: "USER",
        active: true
    });

    // Charger les utilisateurs
    const loadUsers = async () => {
        setIsLoading(true);
        try {
            const response = await UserService.getAllUsers();
            console.log("1",response);
            if (response.data) {
                setUsers(response.data.data);
            } else {
                console.log("3",response.data.data);
                message.error("Erreur lors du chargement des utilisateurs");
            }
        } catch (error) {
            console.error("Erreur lors du chargement des utilisateurs", error);
            message.error("Erreur lors du chargement des utilisateurs");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadUsers();
    }, []);

    // Ouvrir le modal pour ajouter/éditer un utilisateur
    const openUserModal = (user = null) => {
        if (user) {
            setCurrentUser(user);
            setEditMode(true);
        } else {
            setCurrentUser({
                id: null,
                firstName: "",
                lastName: "",
                email: "",
                password: "",
                role: "USER",
                active: true
            });
            setEditMode(false);
        }
        setShowModal(true);
    };

    // Ouvrir le modal pour créer un utilisateur avec photo
    const openUserModalWithPhoto = () => {
        setCurrentUser({
            id: null,
            firstName: "",
            lastName: "",
            email: "",
            password: "",
            role: "USER",
            active: true,
            withPhoto: true
        });
        setEditMode(false);
        setShowModal(true);
    };

    // Fermer le modal
    const closeModal = () => {
        setShowModal(false);
        setCurrentUser({
            id: null,
            firstName: "",
            lastName: "",
            email: "",
            password: "",
            role: "USER",
            active: true
        });
    };

    // Gérer les changements dans le formulaire
    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setCurrentUser({
            ...currentUser,
            [name]: type === "checkbox" ? checked : value
        });
    };

    // Sauvegarder un utilisateur
    const saveUser = async () => {
        try {
            let response;
            if (editMode) {
                response = await UserService.updateUser(
                    currentUser.id,
                    currentUser
                );
            } else {
                response = await UserService.createUser(currentUser);
            }

            if (response.data && response.data.success) {
                message.success(
                    editMode
                        ? "Utilisateur mis à jour avec succès"
                        : "Utilisateur créé avec succès"
                );
                closeModal();
                loadUsers();
            } else {
                message.error("Erreur lors de l'opération");
            }
        } catch (error) {
            console.error("Erreur lors de l'opération", error);
            message.error("Erreur lors de l'opération");
        }
    };

    // Supprimer un utilisateur
    const deleteUser = async (id) => {
        try {
            const response = await UserService.deleteUser(id);
            if (response.data && response.data.success) {
                message.success("Utilisateur supprimé avec succès");
                loadUsers();
            } else {
                message.error("Erreur lors de la suppression de l'utilisateur");
            }
        } catch (error) {
            console.error("Erreur lors de la suppression de l'utilisateur", error);
            message.error("Erreur lors de la suppression de l'utilisateur");
        }
    };

    // Réinitialiser le mot de passe d'un utilisateur
    const resetPassword = async (id) => {
        try {
            const response = await UserService.resetUserPassword(id);
            console.log(response);
            if (response.data && response.data.success) {
                message.success("Mot de passe réinitialisé avec succès");
            } else {
                message.error("Erreur lors de la réinitialisation du mot de passe");
            }
        } catch (error) {
            console.error("Erreur lors de la réinitialisation du mot de passe", error);
            message.error("Erreur lors de la réinitialisation du mot de passe");
        }
    };

    // Désactiver un utilisateur
    const deactivateUser = async (id) => {
        try {
            const response = await UserService.deactivateUser(id);
            if (response.data && response.data.success) {
                message.success("Utilisateur désactivé avec succès");
                loadUsers();
            } else {
                message.error("Erreur lors de la désactivation de l'utilisateur");
            }
        } catch (error) {
            console.error("Erreur lors de la désactivation de l'utilisateur", error);
            message.error("Erreur lors de la désactivation de l'utilisateur");
        }
    };

    // Activer un utilisateur
    const activateUser = async (id) => {
        try {
            const response = await UserService.activateUser(id);
            if (response.data && response.data.success) {
                message.success("Utilisateur activé avec succès");
                loadUsers();
            } else {
                message.error("Erreur lors de l'activation de l'utilisateur");
            }
        } catch (error) {
            console.error("Erreur lors de l'activation de l'utilisateur", error);
            message.error("Erreur lors de l'activation de l'utilisateur");
        }
    };

    // Définition des colonnes pour le tableau antd
    const columns = [
        {
            title: 'N°',
            key: 'index',
            render: (_, record) => record.index + 1
        },
        {
            title: 'Nom',
            key: 'name',
            render: (_, record) => `${record.firstName} ${record.lastName}`
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
        },
        {
            title: 'Telephone',
            dataIndex: 'phone',
            key: 'phone',
        },
        {
            title: 'Statut',
            dataIndex: 'status',
            key: 'status',
            render: (status) => {
                const isActive = status === 'ACTIVE';
                return (
                    <Tag 
                        icon={isActive ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
                        color={isActive ? "success" : "default"}
                    >
                        {isActive ? 'Actif' : 'Inactif'}
                    </Tag>
                );
            }
        },
        {
            title: 'Date de création',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (date) => date ? new Date(date).toLocaleDateString() : '-'
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <Space size="middle">
                    <Tooltip title="Modifier">
                        <Button 
                            type="primary" 
                            shape="circle" 
                            icon={<EditOutlined />} 
                            onClick={() => openUserModal(record)}
                        />
                    </Tooltip>
                    <Tooltip title="Supprimer">
                        <Popconfirm
                            title="Supprimer cet utilisateur ?"
                            description="Cette action ne peut pas être annulée !"
                            onConfirm={() => deleteUser(record.id)}
                            okText="Oui, supprimer"
                            cancelText="Annuler"
                            okButtonProps={{ danger: true }}
                        >
                            <Button 
                                danger 
                                shape="circle" 
                                icon={<DeleteOutlined />} 
                            />
                        </Popconfirm>
                    </Tooltip>
                    <Tooltip title="Réinitialiser le mot de passe">
                        <Popconfirm
                            title="Réinitialiser le mot de passe ?"
                            description="Le mot de passe sera réinitialisé à la valeur par défaut"
                            onConfirm={() => resetPassword(record.id)}
                            okText="Oui, réinitialiser"
                            cancelText="Annuler"
                        >
                            <Button 
                                shape="circle" 
                                icon={<KeyOutlined />} 
                            />
                        </Popconfirm>
                    </Tooltip>
                    {record.status === 'ACTIVE' ? (
                        <Tooltip title="Désactiver le compte">
                            <Popconfirm
                                title="Désactiver ce compte ?"
                                description="L'utilisateur ne pourra plus se connecter"
                                onConfirm={() => deactivateUser(record.id)}
                                okText="Oui, désactiver"
                                cancelText="Annuler"
                                okButtonProps={{ danger: true }}
                            >
                                <Button 
                                    danger
                                    shape="circle" 
                                    icon={<StopOutlined />} 
                                />
                            </Popconfirm>
                        </Tooltip>
                    ) : (
                        <Tooltip title="Activer le compte">
                            <Popconfirm
                                title="Activer ce compte ?"
                                description="L'utilisateur pourra se connecter à nouveau"
                                onConfirm={() => activateUser(record.id)}
                                okText="Oui, activer"
                                cancelText="Annuler"
                            >
                                <Button 
                                    type="primary"
                                    shape="circle" 
                                    icon={<PlayCircleOutlined />} 
                                />
                            </Popconfirm>
                        </Tooltip>
                    )}
                </Space>
            )
        }
    ];

    // Obtenir le token de couleur primaire pour le breadcrumb
    const { token } = theme.useToken();
    
    // Style pour le breadcrumb
    const breadcrumbStyle = {
        margin: '0 0 16px',
        padding: '8px 16px',
        borderRadius: '4px',
        backgroundColor: token.colorPrimaryBg,
    };

    const breadcrumbItemStyle = {
        color: token.colorPrimaryActive,
    };

    return (
        <Main>
            <div className="p-4">
                <Breadcrumb style={breadcrumbStyle}>
                    <Breadcrumb.Item href="/" style={breadcrumbItemStyle}>
                        <HomeOutlined /> Accueil
                    </Breadcrumb.Item>
                    <Breadcrumb.Item style={breadcrumbItemStyle}>
                        <UserOutlined /> Utilisateurs
                    </Breadcrumb.Item>
                </Breadcrumb>
                <Card 
                    className="shadow-sm mb-4"
                >
                    <div className="d-flex justify-content-between align-items-center p-3">
                        <div>
                            <h4 className="mb-0">Gestion des utilisateurs</h4>
                            <p className="text-muted mb-0">Gérez les comptes utilisateurs de l'application</p>
                        </div>
                        <Space>
                            <Button 
                                type="primary" 
                                icon={<PlusOutlined />} 
                                onClick={() => openUserModal()}
                            >
                                Ajouter un utilisateur
                            </Button>
                        </Space>
                    </div>
                </Card>
                
                <Card 
                    className="shadow-sm"
                    title="Liste des utilisateurs"
                    extra={
                        <Button 
                            icon={<ReloadOutlined />} 
                            onClick={loadUsers}
                            loading={isLoading}
                        >
                            Actualiser
                        </Button>
                    }
                >
                    <Spin spinning={isLoading} tip="Chargement des utilisateurs...">
                        <Table 
                            columns={columns} 
                            dataSource={users} 
                            rowKey="id"
                            pagination={{ pageSize: 10 }}
                        />
                    </Spin>
                </Card>
                
                {/* Modal pour ajouter/éditer un utilisateur */}
                <UserModal 
                    showModal={showModal}
                    closeModal={closeModal}
                    editMode={editMode}
                    currentUser={currentUser}
                    handleInputChange={handleInputChange}
                    saveUser={saveUser}
                />
            </div>
        </Main>
    );
};

export default User;