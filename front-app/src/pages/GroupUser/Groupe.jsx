import React, { useState, useEffect } from "react";
import Main from "../../layout/Main";
import Breadcrumb from "../../components/Breadcrumb";
import { Card, Form, Button, Spinner, Container, Row, Col, Tabs, Tab } from "react-bootstrap";
import PrivilegeTabs from "./Tabs/PrivilegeTabs";
import UserTabP from "./Tabs/UserTabP";
import ListGroup from "./Tabs/ListGroup";
import ListUserNotGroup from "./Tabs/ListUserNotGroup";
import Select from 'react-select';
import GroupeService from "../../services/GroupeService";
import { toast, Toaster } from "react-hot-toast";
import Swal from "sweetalert2";
import "../../styles/users.css"

export default function Groupe() {
    const [groups, setGroups] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [currentGroup, setCurrentGroup] = useState({
        id: null,
        name: "",
        description: "",
        type: "TYPE_0"
    });
    const [editMode, setEditMode] = useState(false);


    // Charger les groupes
    const loadGroups = async () => {
        setIsLoading(true);
        try {
            const response = await GroupeService.getAllGroups();
            if (response.data) {
                setGroups(response.data);
            } else {
                toast.error("Erreur lors du chargement des groupes");
            }
        } catch (error) {
            console.error("Erreur lors du chargement des groupes", error);
            toast.error("Erreur lors du chargement des groupes");
        } finally {
            setIsLoading(false);
        }
    };

    // Sauvegarder un groupe
    const saveGroup = async (e) => {
        e.preventDefault();
        try {
            let response;
            if (editMode) {
                response = await GroupeService.updateGroup(currentGroup.id, currentGroup);
                toast.success("Groupe mis à jour avec succès");
            } else {
                response = await GroupeService.createGroup(currentGroup);
                toast.success("Groupe créé avec succès");
            }
            resetForm();
            loadGroups();
        } catch (error) {
            console.error("Erreur lors de la sauvegarde du groupe", error);
            toast.error("Erreur lors de la sauvegarde du groupe");
        }
    };

    // Supprimer un groupe
    const deleteGroup = async (id) => {
        try {
            await Swal.fire({
                title: "Êtes-vous sûr ?",
                text: "Cette action est irréversible !",
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#d33",
                cancelButtonColor: "#3085d6",
                confirmButtonText: "Oui, supprimer !",
                cancelButtonText: "Annuler"
            }).then(async (result) => {
                if (result.isConfirmed) {
                    await GroupeService.deleteGroup(id);
                    toast.success("Groupe supprimé avec succès");
                    loadGroups();
                }
            });
        } catch (error) {
            console.error("Erreur lors de la suppression du groupe", error);
            toast.error("Erreur lors de la suppression du groupe");
        }
    };

    // Éditer un groupe
    const editGroup = (group) => {
        setCurrentGroup({
            id: group.id,
            name: group.libeleGroupeUtilisateur,
            description: group.descriptionGroupeUtilisateur,
            type: group.type
        });
        setEditMode(true);
    };

    // Réinitialiser le formulaire
    const resetForm = () => {
        setCurrentGroup({
            id: null,
            name: "",
            description: "",
            type: "TYPE_0"
        });
        setEditMode(false);
    };

    // Gérer les changements dans le formulaire
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setCurrentGroup({ ...currentGroup, [name]: value });
    };

    // Gérer les changements de type
    const handleTypeChange = (selectedOption) => {
        setCurrentGroup({ ...currentGroup, type: selectedOption.value });
    };

    useEffect(() => {
        loadGroups();
    }, []);

    // Les onglets seront gérés directement avec les composants React Bootstrap

    return (
        <Main>
            <Toaster position="top-right" />
            <Breadcrumb
                items={[
                    { label: "Home", link: "#", icon: "fas fa-tachometer-alt", active: false },
                    { label: "Security", link: "#", icon: "far fa-file", active: false },
                    { label: "Groups", icon: "fas fa-list", active: true }
                ]}
            />
            <Card className="shadow-lg">
                <Card.Header>
                    <h4 className="mb-0">Gérer les groupes</h4>
                </Card.Header>
                <Card.Body>
                    <Row>
                        <Col md={4}>
                            <Card className="shadow">
                                <Card.Header>
                                    <h5 className="mb-0">{editMode ? "Modifier un Groupe" : "Ajouter un Groupe"}</h5>
                                </Card.Header>
                                <Card.Body>
                                    <Form onSubmit={saveGroup}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Libellé :</Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="name"
                                                placeholder="Nom du groupe"
                                                value={currentGroup.name}
                                                onChange={handleInputChange}
                                                required
                                            />
                                        </Form.Group>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Description :</Form.Label>
                                            <Form.Control
                                                as="textarea"
                                                name="description"
                                                placeholder="Description du groupe"
                                                value={currentGroup.description}
                                                onChange={handleInputChange}
                                                rows={3}
                                            />
                                        </Form.Group>
                                        
                                       
                                        
                                        <div className="d-flex justify-content-between mt-4">
                                            <Button
                                                variant="secondary"
                                                type="button"
                                                onClick={resetForm}
                                            >
                                                {editMode ? "Annuler" : "Réinitialiser"}
                                            </Button>
                                            <Button
                                                variant="primary"
                                                type="submit"
                                            >
                                                {editMode ? "Mettre à jour" : "Ajouter"}
                                            </Button>
                                        </div>
                                    </Form>
                                </Card.Body>
                            </Card>
                        </Col> 
                        <Col md={8}>
                            <Card className="shadow">
                                <Card.Header>
                                    <h5 className="mb-0">Objet Role</h5>
                                </Card.Header>
                                <Card.Body>
                                    <Tabs defaultActiveKey="UserTabP" className="mb-3">
                                        <Tab eventKey="UserTabP" title="Utilisateurs">
                                            <UserTabP />
                                        </Tab>
                                        <Tab eventKey="privileges" title="Privileges">
                                            <PrivilegeTabs />
                                        </Tab>
                                    </Tabs>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>
            
            {isLoading ? (
                <div className="mt-4">
                    <Card className="shadow">
                        <Card.Body>
                            <div className="d-flex justify-content-center align-items-center p-5">
                                <Spinner animation="border" variant="primary" />
                                <span className="ms-3">Chargement des données...</span>
                            </div>
                        </Card.Body>
                    </Card>
                </div>
            ) : (
                <div className="mt-4">
                    <Card className="shadow">
                        <Card.Header>
                            <h5 className="mb-0">Information générale</h5>
                        </Card.Header>
                        <Card.Body>
                            <Tabs defaultActiveKey="LisGroup" className="mb-3">
                                <Tab eventKey="LisGroup" title="Liste de groupe">
                                    <ListGroup groups={groups} onEdit={editGroup} onDelete={deleteGroup} />
                                </Tab>
                                <Tab eventKey="ListUserNotGroup" title="Utilisateur sans groupe">
                                    <ListUserNotGroup />
                                </Tab>
                            </Tabs>
                        </Card.Body>
                    </Card>
                </div>
            )}
        </Main>
    )
}