import React, { useState, useEffect } from "react";
import Main from "../../layout/Main";
import { Container, Row, Col, Card, Button, Badge, Table, Pagination } from "react-bootstrap";
import UserService from "../../services/UserService";
import { toast, Toaster } from "react-hot-toast";
import Swal from "sweetalert2";
import "../../styles/users.css";

// Importation des composants
import UserModal from "./components/UserModal";

export default function User() {
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
                toast.error("Erreur lors du chargement des utilisateurs");
            }
        } catch (error) {
            console.error("Erreur lors du chargement des utilisateurs", error);
            toast.error("Erreur lors du chargement des utilisateurs");
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
                toast.success(
                    editMode
                        ? "Utilisateur mis à jour avec succès"
                        : "Utilisateur créé avec succès"
                );
                closeModal();
                loadUsers();
            } else {
                toast.error("Erreur lors de l'opération");
            }
        } catch (error) {
            console.error("Erreur lors de l'opération", error);
            toast.error("Erreur lors de l'opération");
        }
    };

    // Supprimer un utilisateur
    const deleteUser = async (id) => {
        Swal.fire({
            title: 'Êtes-vous sûr ?',
            text: "Cette action ne peut pas être annulée !",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Oui, supprimer',
            cancelButtonText: 'Annuler'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const response = await UserService.deleteUser(id);
                    if (response.data && response.data.success) {
                        Swal.fire(
                            'Supprimé !',
                            'L\'utilisateur a été supprimé avec succès.',
                            'success'
                        );
                        loadUsers();
                    } else {
                        Swal.fire(
                            'Erreur !',
                            'Erreur lors de la suppression de l\'utilisateur.',
                            'error'
                        );
                    }
                } catch (error) {
                    console.error("Erreur lors de la suppression de l'utilisateur", error);
                    Swal.fire(
                        'Erreur !',
                        'Erreur lors de la suppression de l\'utilisateur.',
                        'error'
                    );
                }
            }
        });
    };

    // Réinitialiser le mot de passe d'un utilisateur
    const resetPassword = async (id) => {
        Swal.fire({
            title: 'Réinitialiser le mot de passe',
            text: "Le mot de passe sera réinitialisé à la valeur par défaut. Continuer ?",
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Oui, réinitialiser',
            cancelButtonText: 'Annuler'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const response = await UserService.resetUserPassword(id);
                    if (response.data && response.data.success) {
                        Swal.fire(
                            'Réinitialisé !',
                            'Le mot de passe a été réinitialisé avec succès.',
                            'success'
                        );
                    } else {
                        Swal.fire(
                            'Erreur !',
                            'Erreur lors de la réinitialisation du mot de passe.',
                            'error'
                        );
                    }
                } catch (error) {
                    console.error("Erreur lors de la réinitialisation du mot de passe", error);
                    Swal.fire(
                        'Erreur !',
                        'Erreur lors de la réinitialisation du mot de passe.',
                        'error'
                    );
                }
            }
        });
    };

    return (
        <Main>
            <Container fluid className="py-4">
                <Card className="border-0 shadow mb-4">
                    <Card.Body>
                        <div className="d-flex justify-content-between align-items-center">
                            <div>
                                <h3 className="mb-0">Gestion des utilisateurs</h3>
                                <p className="text-muted mb-0">Gérez les comptes utilisateurs de l'application</p>
                            </div>
                            <Button
                                variant="primary"
                                className="rounded-pill px-4 py-2"
                                onClick={() => openUserModal()}
                            >
                                <i className="fas fa-plus me-2"></i> Ajouter un utilisateur
                            </Button>
                        </div>
                    </Card.Body>
                </Card>
                
                <Card className="border-0 shadow-lg overflow-hidden">
                    <Card.Header className="bg-white py-3 border-0">
                        <div className="d-flex justify-content-between align-items-center">
                            <h5 className="mb-0">Liste des utilisateurs</h5>
                            <div className="text-muted small">{users.length} utilisateur(s) au total</div>
                        </div>
                    </Card.Header>
                    
                    {isLoading ? (
                        <div className="text-center p-5">
                            <div className="spinner-border text-primary" role="status">
                                <span className="visually-hidden">Chargement...</span>
                            </div>
                            <p className="mt-3">Chargement des utilisateurs...</p>
                        </div>
                    ) : users.length === 0 ? (
                        <div className="text-center p-5">
                            <div className="empty-state">
                                <i className="fas fa-users fs-1 text-muted mb-3"></i>
                                <h5>Aucun utilisateur trouvé</h5>
                                <p className="text-muted">Commencez par ajouter un utilisateur à la liste</p>
                                <Button 
                                    variant="outline-primary" 
                                    size="sm"
                                    onClick={() => openUserModal()}
                                >
                                    <i className="fas fa-plus me-2"></i> Ajouter un utilisateur
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <Table hover className="align-middle mb-0 table-striped">
                                <thead>
                                    <tr>
                                        <th className="ps-4">Nom</th>
                                        <th>Email</th>
                                        <th>Rôle</th>
                                        <th>Statut</th>
                                        <th className="text-end pe-4">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map((user) => (
                                        <tr key={user.id}>
                                            <td className="ps-4">
                                                <div className="d-flex align-items-center">
                                                    <div className="avatar-circle me-3 bg-primary text-white">
                                                        {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                                                    </div>
                                                    <div className="p-2">
                                                        <div className="fw-medium">{user.firstName} {user.lastName}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="d-flex align-items-center">
                                                    <i className="fas fa-envelope text-muted me-2"></i>
                                                    {user.email}
                                                </div>
                                            </td>
                                            <td>
                                                <Badge 
                                                    pill 
                                                    bg={user.role === 'ADMIN' ? 'danger' : user.role === 'MANAGER' ? 'warning' : 'info'}
                                                    className="px-3 py-2"
                                                >
                                                    {user.role === 'ADMIN' && <i className="fas fa-shield-alt me-1"></i>}
                                                    {user.role === 'MANAGER' && <i className="fas fa-user-tie me-1"></i>}
                                                    {user.role === 'USER' && <i className="fas fa-user me-1"></i>}
                                                    {user.role}
                                                </Badge>
                                            </td>
                                            <td>
                                                <Badge 
                                                    pill 
                                                    bg={user.active ? 'success' : 'secondary'}
                                                    className="px-3 py-2"
                                                >
                                                    <i className={`fas fa-${user.active ? 'check' : 'times'} me-1`}></i>
                                                    {user.active ? 'Actif' : 'Inactif'}
                                                </Badge>
                                            </td>
                                            <td className="text-end pe-4">
                                                <div className="d-flex gap-2 justify-content-end">
                                                    <Button
                                                        variant="outline-secondary"
                                                        size="sm"
                                                        className="rounded-circle"
                                                        onClick={() => openUserModal(user)}
                                                        title="Modifier"
                                                    >
                                                        <i className="fas fa-edit"></i>
                                                    </Button>
                                                    <Button
                                                        variant="outline-danger"
                                                        size="sm"
                                                        className="rounded-circle"
                                                        onClick={() => deleteUser(user.id)}
                                                        title="Supprimer"
                                                    >
                                                        <i className="fas fa-trash"></i>
                                                    </Button>
                                                    <Button
                                                        variant="outline-warning"
                                                        size="sm"
                                                        className="rounded-circle"
                                                        onClick={() => resetPassword(user.id)}
                                                        title="Réinitialiser le mot de passe"
                                                    >
                                                        <i className="fas fa-key"></i>
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </div>
                    )}
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