import React, { useState, useEffect } from "react";
import Main from "../../layout/Main";
import Breadcrumb from "../../components/Breadcrumb";
import { Card } from "../../components/Card";
import {Input, RadioButton, Textarea}  from "../../components/Input"
import { ButtonSimple } from "../../components/Button";
import { NormalTabs } from "../../components/Tabs";
import PrivilegeTabs  from "./Tabs/PrivilegeTabs";
import UserTabP  from "./Tabs/UserTabP";
import ListGroup  from "./Tabs/ListGroup";
import ListUserNotGroup  from "./Tabs/ListUserNotGroup";
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

    const typeOptions = [
        { value: "TYPE_0", label: "Type 0" },
        { value: "TYPE_1", label: "Type 1" },
        { value: "TYPE_2", label: "Type 2" }
    ];

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

    const tabItems = [
        { id: "UserTabP", title: "Utilisateurs", content: <UserTabP /> },
        { id: "privileges", title: "Privileges", content: <PrivilegeTabs /> }
    ]; 
    const tabItems2 = [
        { id: "LisGroup", title: "Liste de groupe", content: <ListGroup groups={groups} onEdit={editGroup} onDelete={deleteGroup} /> },
        { id: "ListUserNotGroup", title: "Utilisateur sans groupe", content: <ListUserNotGroup /> }
    ];

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
                <Card className="card shadow-lg"
                    title={"Gérer les groupes"}
                >
                    <div className="row">
                        <div className="col-4">
                            <Card
                                title={editMode ? "Modifier un Groupe" : "Ajouter un Groupe"}
                                className="shadow"
                            >
                                <form onSubmit={saveGroup}>
                                    <Input 
                                        type="text"
                                        label="Libellé :"
                                        name="name"
                                        placeholder="Nom du groupe"
                                        value={currentGroup.name}
                                        onChange={handleInputChange}
                                        required
                                    />
                                    <Textarea
                                        label="Description :"
                                        name="description"
                                        placeholder="Description du groupe"
                                        value={currentGroup.description}
                                        onChange={handleInputChange}
                                    />
                                    
                                    <div className="form-group mb-3">
                                        <label className="form-label">Type de groupe :</label>
                                        <Select
                                            options={typeOptions}
                                            value={typeOptions.find(option => option.value === currentGroup.type)}
                                            onChange={handleTypeChange}
                                            className="basic-single"
                                            classNamePrefix="select"
                                        />
                                    </div>
                                    
                                    <div className="d-flex justify-content-between mt-4">
                                        <ButtonSimple
                                            type="button"
                                            className="btn btn-secondary"
                                            onClick={resetForm}
                                        >
                                            {editMode ? "Annuler" : "Réinitialiser"}
                                        </ButtonSimple>
                                        <ButtonSimple
                                            type="submit"
                                            className="btn btn-primary"
                                        >
                                            {editMode ? "Mettre à jour" : "Ajouter"}
                                        </ButtonSimple>
                                    </div>
                                </form>
                            </Card>
                        </div> 
                        <div className="col-8">
                            <NormalTabs items={tabItems} title={"Objet Role"} />
                        </div>
                    </div>
                </Card>
                {isLoading ? (
                    <div className="row mt-4">
                        <div className="col-12">
                            <div className="d-flex justify-content-center align-items-center p-5">
                                <div className="spinner-border text-primary" role="status">
                                    <span className="visually-hidden">Chargement...</span>
                                </div>
                                <span className="ms-3">Chargement des données...</span>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="row mt-4">
                        <div className="col-12">
                            <NormalTabs items={tabItems2} title={"Information générale"} />
                        </div>
                    </div>
                )}
              
            </Main>
    )
}