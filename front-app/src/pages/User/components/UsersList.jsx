import React from 'react';
import { Row, Col, Card, Button, Badge, Table } from 'react-bootstrap';

const UsersList = ({ 
  isLoading, 
  users, 
  openUserModal, 
  deleteUser,
  resetPassword
}) => {
  return (
    <div className="users-container">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Liste des utilisateurs</h2>
        <Button
          variant="primary"
          onClick={() => openUserModal()}
        >
          <i className="fas fa-plus me-2"></i> Ajouter un utilisateur
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center p-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Chargement...</span>
          </div>
          <p className="mt-3">Chargement...</p>
        </div>
      ) : users.length === 0 ? (
        <div className="text-center p-5 bg-light rounded">
          <i className="fas fa-info-circle fs-2 text-muted mb-3"></i>
          <p className="mb-0">Aucun utilisateur trouvé</p>
        </div>
      ) : (
        <Card className="border-0 shadow-sm">
          <Card.Body className="p-0">
            <Table responsive hover className="mb-0">
              <thead className="bg-light">
                <tr>
                  <th>Nom</th>
                  <th>Email</th>
                  <th>Rôle</th>
                  <th>Statut</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <div className="d-flex align-items-center">
                        <div className="avatar-circle me-2 bg-primary text-white">
                          {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                        </div>
                        <div>
                          <div className="fw-medium">{user.firstName} {user.lastName}</div>
                        </div>
                      </div>
                    </td>
                    <td>{user.email}</td>
                    <td>
                      <Badge bg={user.role === 'ADMIN' ? 'danger' : user.role === 'MANAGER' ? 'warning' : 'info'}>
                        {user.role}
                      </Badge>
                    </td>
                    <td>
                      <Badge bg={user.active ? 'success' : 'secondary'}>
                        {user.active ? 'Actif' : 'Inactif'}
                      </Badge>
                    </td>
                    <td>
                      <div className="d-flex gap-2">
                        <Button
                          variant="outline-secondary"
                          size="sm"
                          onClick={() => openUserModal(user)}
                        >
                          <i className="fas fa-edit"></i>
                        </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => deleteUser(user.id)}
                        >
                          <i className="fas fa-trash"></i>
                        </Button>
                        <Button
                          variant="outline-warning"
                          size="sm"
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
          </Card.Body>
        </Card>
      )}
    </div>
  );
};

