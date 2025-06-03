import React, { useState, useEffect } from "react";
import Main from "../../layout/Main";
import { Card, Table, Button, Badge, Spin, Space, Tag, Popconfirm, message, Tooltip, Breadcrumb, theme } from "antd";
import { EditOutlined, DeleteOutlined, KeyOutlined, PlusOutlined, CheckCircleOutlined, CloseCircleOutlined, ReloadOutlined, HomeOutlined, UserOutlined } from "@ant-design/icons";
import UserService from "../../services/UserService";
import "../../styles/users.css";

// Importation des composants
import UserModal from "./components/UserModal";

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
            if (response.data && response.data.success) {
                setUsers(response.data.data);
            } else {
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

    // Définition des colonnes pour le tableau antd
    const columns = [
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
            title: 'Rôle',
            dataIndex: 'role',
            key: 'role',
            render: (role) => (
                <Tag color={role === "ADMIN" ? "red" : "blue"} key={role}>
                    {role}
                </Tag>
            )
        },
        {
            title: 'Statut',
            dataIndex: 'active',
            key: 'active',
            render: (active) => (
                <Tag 
                    icon={active ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
                    color={active ? "success" : "default"}
                >
                    {active ? 'Actif' : 'Inactif'}
                </Tag>
            )
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
                        <Button 
                            type="primary" 
                            icon={<PlusOutlined />} 
                            onClick={() => openUserModal()}
                        >
                            Ajouter un utilisateur
                        </Button>
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