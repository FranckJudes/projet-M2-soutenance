import React from 'react';
import { Row, Col, Card, Button, Badge } from 'react-bootstrap';

const DefaultPasswordsSection = ({ 
  isLoading, 
  defaultPasswords, 
  openPasswordModal, 
  activatePassword, 
  deletePassword 
}) => {
  return (
    <div className="default-passwords-container">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Gestion des mots de passe par défaut</h2>
        <Button
          variant="primary"
          onClick={() => openPasswordModal()}
        >
          <i className="fas fa-plus me-2"></i> Ajouter un mot de passe
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center p-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Chargement...</span>
          </div>
          <p className="mt-3">Chargement...</p>
        </div>
      ) : defaultPasswords.length === 0 ? (
        <div className="text-center p-5 bg-light rounded">
          <i className="fas fa-info-circle fs-2 text-muted mb-3"></i>
          <p className="mb-0">Aucun mot de passe par défaut trouvé</p>
        </div>
      ) : (
        <Row xs={1} md={2} lg={3} className="g-4">
          {defaultPasswords.map((password) => (
            <Col key={password.id}>
              <Card className={password.active ? 'border-success' : ''}>
                <Card.Body>
                  <Card.Title>{password.description}</Card.Title>
                  <Card.Text className="bg-light p-2 rounded font-monospace">
                    {password.password}
                  </Card.Text>
                  <div className="mb-3">
                    {password.active ? (
                      <Badge bg="success">Actif</Badge>
                    ) : (
                      <Badge bg="secondary">Inactif</Badge>
                    )}
                  </div>
                  <div className="d-flex gap-2 flex-wrap">
                    {!password.active && (
                      <Button
                        variant="success"
                        size="sm"
                        onClick={() => activatePassword(password.id)}
                      >
                        <i className="fas fa-check me-1"></i> Activer
                      </Button>
                    )}
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => openPasswordModal(password)}
                    >
                      <i className="fas fa-edit me-1"></i> Modifier
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => deletePassword(password.id)}
                    >
                      <i className="fas fa-trash me-1"></i> Supprimer
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
};

export default DefaultPasswordsSection;