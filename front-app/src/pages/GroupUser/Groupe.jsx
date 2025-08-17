import React, { useState, useEffect } from "react";
import Main from "../../layout/Main";
import { Card, Form, Button, Spin, Row, Col, Tabs, Space, Select, Input, message, Breadcrumb, theme, Alert } from "antd";
import { SaveOutlined, ReloadOutlined, EditOutlined, DeleteOutlined, HomeOutlined, TeamOutlined, UserOutlined, UsergroupAddOutlined } from "@ant-design/icons";
import PrivilegeTabs from "./Tabs/PrivilegeTabs";
import UserTabP from "./Tabs/UserTabP";
import ListGroup from "./Tabs/ListGroup";
import ListUserNotGroup from "./Tabs/ListUserNotGroup";
import GroupUserManagement from "./Tabs/GroupUserManagement";
import GroupeService from "../../services/GroupeService";
import "../../styles/users.css"

const { TextArea } = Input;
const { TabPane } = Tabs;

const Groupe = () => {
    const [groups, setGroups] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [currentGroup, setCurrentGroup] = useState({
        id: null,
        name: "",
        description: "",
        type: "TYPE_0"
    });
    const [editMode, setEditMode] = useState(false);
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [form] = Form.useForm();


    // Charger les groupes
    const loadGroups = async () => {
        setIsLoading(true);
        try {
            const response = await GroupeService.getAllGroups();
            if (response.data && response.data.data) {
                setGroups(response.data.data);
            } else {
                message.error("Erreur lors du chargement des groupes");
            }
        } catch (error) {
            console.error("Erreur lors du chargement des groupes", error);
            const errorMsg = error.response?.data?.message || "Erreur lors du chargement des groupes";
            message.error(errorMsg);
        } finally {
            setIsLoading(false);
        }
    };

    // Sauvegarder un groupe
    const saveGroup = async (values) => {
        try {
            // Adapter les données pour le backend
            const groupData = {
                libeleGroupeUtilisateur: values.name,
                descriptionGroupeUtilisateur: values.description,
                type: values.type || 'TYPE_0'
            };
            
            let response;
            if (editMode) {
                response = await GroupeService.updateGroup(currentGroup.id, groupData);
                message.success("Groupe mis à jour avec succès");
            } else {
                response = await GroupeService.createGroup(groupData);
                message.success("Groupe créé avec succès");
            }
            resetForm();
            loadGroups();
        } catch (error) {
            console.error("Erreur lors de la sauvegarde du groupe", error);
            const errorMsg = error.response?.data?.message || "Erreur lors de la sauvegarde du groupe";
            message.error(errorMsg);
        }
    };

    // Supprimer un groupe
    const deleteGroup = async (id) => {
        try {
            await GroupeService.deleteGroup(id);
            message.success("Groupe supprimé avec succès");
            // Réinitialiser le groupe sélectionné si c'est celui qui a été supprimé
            if (selectedGroup && selectedGroup.id === id) {
                setSelectedGroup(null);
                resetForm();
            }
            loadGroups();
        } catch (error) {
            console.error("Erreur lors de la suppression du groupe", error);
            const errorMsg = error.response?.data?.message || "Erreur lors de la suppression du groupe";
            message.error(errorMsg);
        }
    };

    // Éditer un groupe
    const editGroup = (group) => {
        const groupData = {
            id: group.id,
            name: group.libeleGroupeUtilisateur,
            description: group.descriptionGroupeUtilisateur,
            type: group.type
        };
        setCurrentGroup(groupData);
        setSelectedGroup(group);
        form.setFieldsValue(groupData);
        setEditMode(true);
    };

    // Réinitialiser le formulaire
    const resetForm = () => {
        form.resetFields();
        setCurrentGroup({
            id: null,
            name: "",
            description: "",
            type: "TYPE_0"
        });
        setEditMode(false);
        setSelectedGroup(null);
    };

    // Options pour le select de type
    const typeOptions = [
        { value: 'TYPE_0', label: 'Type 0' },
        { value: 'TYPE_1', label: 'Type 1' },
        { value: 'TYPE_2', label: 'Type 2' }
    ];

    useEffect(() => {
        loadGroups();
    }, []);

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
                        <TeamOutlined /> Groupes
                    </Breadcrumb.Item>
                </Breadcrumb>
                <Card 
                    className="shadow-sm mb-4"
                    title="Gestion des groupes"
                >
                    <Row gutter={16}>
                        <Col xs={24} md={8}>
                            <Card 
                                className="shadow-sm"
                                title="Ajouter un groupe"
                            >
                                <Form
                                    form={form}
                                    layout="vertical"
                                    onFinish={saveGroup}
                                    initialValues={{
                                        name: "",
                                        description: "",
                                        type: "TYPE_0"
                                    }}
                                >
                                    <Form.Item
                                        name="name"
                                        label="Libellé"
                                        rules={[{ required: true, message: 'Veuillez saisir un libellé' }]}
                                    >
                                        <Input />
                                    </Form.Item>
                                    
                                    <Form.Item
                                        name="description"
                                        label="Description"
                                    >
                                        <TextArea rows={3} />
                                    </Form.Item>
                                    
                                    <Form.Item>
                                        <Space style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                                            <Button 
                                                onClick={resetForm}
                                            >
                                                {editMode ? "Annuler" : "Réinitialiser"}
                                            </Button>
                                            <Button
                                                type="primary"
                                                htmlType="submit"
                                                icon={<SaveOutlined />}
                                            >
                                                {editMode ? "Mettre à jour" : "Ajouter"}
                                            </Button>
                                        </Space>
                                    </Form.Item>
                                </Form>
                            </Card>
                        </Col> 
                        <Col xs={24} md={16}>
                            <Card 
                                className="shadow-sm"
                                title="Objet Role"
                            >
                                <Tabs defaultActiveKey="UserTabP">
                                    <Tabs.TabPane key="UserTabP" tab="Utilisateurs">
                                        <UserTabP />
                                    </Tabs.TabPane>
                                    <Tabs.TabPane key="privileges" tab="Privileges">
                                        <PrivilegeTabs />
                                    </Tabs.TabPane>
                                </Tabs>
                            </Card>
                        </Col>
                    </Row>
                </Card>
                <Card 
                    className="shadow-sm"
                    title="Information générale"
                    extra={
                        <Button 
                            icon={<ReloadOutlined />} 
                            onClick={loadGroups}
                            loading={isLoading}
                        >
                            Actualiser
                        </Button>
                    }
                >
                    <Spin spinning={isLoading} tip="Chargement des données...">
                        <Tabs defaultActiveKey="LisGroup">
                            <Tabs.TabPane 
                                key="LisGroup" 
                                tab={
                                    <span>
                                        <TeamOutlined /> Liste des groupes
                                    </span>
                                }
                            >
                                <ListGroup groups={groups} onEdit={editGroup} onDelete={deleteGroup} />
                            </Tabs.TabPane>
                            <Tabs.TabPane 
                                key="ListUserNotGroup" 
                                tab={
                                    <span>
                                        <UserOutlined /> Utilisateurs sans groupe
                                    </span>
                                }
                            >
                                <ListUserNotGroup />
                            </Tabs.TabPane>
                            <Tabs.TabPane 
                                key="manageGroupUsers" 
                                tab={
                                    <span>
                                        <UsergroupAddOutlined /> Gérer les utilisateurs du groupe
                                    </span>
                                }
                            >
                                {selectedGroup ? (
                                    <div style={{ marginBottom: '16px' }}>
                                        <Alert
                                            message={`Groupe sélectionné: ${selectedGroup.libeleGroupeUtilisateur}`}
                                            type="info"
                                            showIcon
                                        />
                                    </div>
                                ) : (
                                    <div style={{ marginBottom: '16px' }}>
                                        <Alert
                                            message="Veuillez sélectionner un groupe en cliquant sur le bouton d'édition dans la liste des groupes"
                                            type="warning"
                                            showIcon
                                        />
                                    </div>
                                )}
                                <GroupUserManagement 
                                    selectedGroup={selectedGroup} 
                                    onRefresh={loadGroups} 
                                />
                            </Tabs.TabPane>
                        </Tabs>
                    </Spin>
                </Card>
            </div>
        </Main>
    );
};

export default Groupe;