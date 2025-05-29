import React, { useState, useEffect } from "react";
import Main from "../../layout/Main";
import { Container, Row, Col } from "react-bootstrap";
import DefaultPasswordService from "../../services/DefaultPasswordService";
import { toast, Toaster } from "react-hot-toast";
import "../../styles/settings.css";

// Importation des composants
import SettingsSidebar from "./components/SettingsSidebar";
import DefaultPasswordsSection from "./components/DefaultPasswordsSection";
import GenericSettingsSection from "./components/GenericSettingsSection";
import PasswordModal from "./components/PasswordModal";

function Settings() {
    const [activeSection, setActiveSection] = useState("defaultPasswords");
    const [defaultPasswords, setDefaultPasswords] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [currentPassword, setCurrentPassword] = useState({
        id: null,
        password: "",
        description: "",
        active: false
    });

    // Charger les mots de passe par défaut
    const loadDefaultPasswords = async () => {
        setIsLoading(true);
        try {
            const response = await DefaultPasswordService.getAllDefaultPasswords();
            if (response.data && response.data.success) {
                setDefaultPasswords(response.data.data);
            } else {
                toast.error("Erreur lors du chargement des mots de passe");
            }
        } catch (error) {
            console.error("Erreur lors du chargement des mots de passe", error);
            toast.error("Erreur lors du chargement des mots de passe");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (activeSection === "defaultPasswords") {
            loadDefaultPasswords();
        }
    }, [activeSection]);

    // Ouvrir le modal pour ajouter/éditer un mot de passe
    const openPasswordModal = (password = null) => {
        if (password) {
            setCurrentPassword(password);
            setEditMode(true);
        } else {
            setCurrentPassword({
                id: null,
                password: "",
                description: "",
                active: false
            });
            setEditMode(false);
        }
        setShowModal(true);
    };

    // Fermer le modal
    const closeModal = () => {
        setShowModal(false);
        setCurrentPassword({
            id: null,
            password: "",
            description: "",
            active: false
        });
    };

    // Gérer les changements dans le formulaire
    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setCurrentPassword({
            ...currentPassword,
            [name]: type === "checkbox" ? checked : value
        });
    };

    // Sauvegarder un mot de passe
    const savePassword = async () => {
        try {
            let response;
            if (editMode) {
                response = await DefaultPasswordService.updateDefaultPassword(
                    currentPassword.id,
                    currentPassword
                );
            } else {
                response = await DefaultPasswordService.createDefaultPassword(currentPassword);
            }

            if (response.data && response.data.success) {
                toast.success(
                    editMode
                        ? "Mot de passe mis à jour avec succès"
                        : "Mot de passe créé avec succès"
                );
                closeModal();
                loadDefaultPasswords();
            } else {
                toast.error("Erreur lors de l'opération");
            }
        } catch (error) {
            console.error("Erreur lors de l'opération", error);
            toast.error("Erreur lors de l'opération");
        }
    };

    // Supprimer un mot de passe
    const deletePassword = async (id) => {
        if (window.confirm("Êtes-vous sûr de vouloir supprimer ce mot de passe par défaut ?")) {
            try {
                const response = await DefaultPasswordService.deleteDefaultPassword(id);
                if (response.data && response.data.success) {
                    toast.success("Mot de passe supprimé avec succès");
                    loadDefaultPasswords();
                } else {
                    toast.error("Erreur lors de la suppression");
                }
            } catch (error) {
                console.error("Erreur lors de la suppression", error);
                toast.error("Erreur lors de la suppression");
            }
        }
    };

    // Activer un mot de passe
    const activatePassword = async (id) => {
        try {
            const response = await DefaultPasswordService.activateDefaultPassword(id);
            if (response.data && response.data.success) {
                toast.success("Mot de passe activé avec succès");
                loadDefaultPasswords();
            } else {
                toast.error("Erreur lors de l'activation");
            }
        } catch (error) {
            console.error("Erreur lors de l'activation", error);
            toast.error("Erreur lors de l'activation");
        }
    };

    // Définition des sections de paramètres
    const settingsSections = [
        {
            id: "general",
            icon: "fas fa-cog",
            label: "Général",
            description: "Paramètres généraux de l'application"
        },
        {
            id: "appearance",
            icon: "fas fa-palette",
            label: "Apparence",
            description: "Personnaliser l'apparence de l'application"
        },
        {
            id: "notifications",
            icon: "fas fa-bell",
            label: "Notifications",
            description: "Gérer les paramètres de notifications"
        },
        {
            id: "defaultPasswords",
            icon: "fas fa-key",
            label: "Mots de passe par défaut",
            description: "Gérer les mots de passe par défaut pour les nouveaux utilisateurs"
        },
        {
            id: "security",
            icon: "fas fa-shield-alt",
            label: "Sécurité",
            description: "Paramètres de sécurité de l'application"
        },
        {
            id: "advanced",
            icon: "fas fa-sliders-h",
            label: "Avancé",
            description: "Paramètres avancés de l'application"
        }
    ];

    // Rendu du contenu en fonction de la section active
    const renderContent = () => {
        switch (activeSection) {
            case "defaultPasswords":
                return (
                    <DefaultPasswordsSection
                        isLoading={isLoading}
                        defaultPasswords={defaultPasswords}
                        openPasswordModal={openPasswordModal}
                        activatePassword={activatePassword}
                        deletePassword={deletePassword}
                    />
                );
            case "general":
                return <GenericSettingsSection title="Paramètres généraux" />;
            case "appearance":
                return <GenericSettingsSection title="Paramètres d'apparence" />;
            case "notifications":
                return <GenericSettingsSection title="Paramètres de notifications" />;
            case "security":
                return <GenericSettingsSection title="Paramètres de sécurité" />;
            case "advanced":
                return <GenericSettingsSection title="Paramètres avancés" />;
            default:
                return null;
        }
    };
    
    return (
        <Main>
            <Container fluid className="py-4">
                <h3 className="mb-4 pb-3 border-bottom">Paramètres</h3>
                
                <Row>
                    {/* Menu latéral */}
                    <Col md={4} lg={4} xl={2}>
                        <SettingsSidebar 
                            activeSection={activeSection} 
                            setActiveSection={setActiveSection} 
                            settingsSections={settingsSections} 
                        />
                    </Col>
                    
                    {/* Contenu principal */}
                    <Col md={8} lg={8} xl={10}>
                        <div className="bg-white p-4 rounded shadow-sm">
                            {renderContent()}
                        </div>
                    </Col>
                </Row>
                
                {/* Modal pour ajouter/éditer un mot de passe */}
                <PasswordModal 
                    showModal={showModal}
                    closeModal={closeModal}
                    editMode={editMode}
                    currentPassword={currentPassword}
                    handleInputChange={handleInputChange}
                    savePassword={savePassword}
                />
                
                {/* Toast container pour react-hot-toast */}
                <Toaster position="top-right" toastOptions={{
                    duration: 3000,
                    style: {
                        background: '#333',
                        color: '#fff',
                    },
                    success: {
                        style: {
                            background: '#28a745',
                        },
                    },
                    error: {
                        style: {
                            background: '#dc3545',
                        },
                    },
                }} />
            </Container>
        </Main>
    );
}

export default Settings;
