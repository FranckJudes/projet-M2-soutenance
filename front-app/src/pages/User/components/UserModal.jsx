import React from 'react';
import { Modal, Form, Button, Row, Col } from 'react-bootstrap';

const UserModal = ({ 
  showModal, 
  closeModal, 
  editMode, 
  currentUser, 
  handleInputChange, 
  saveUser 
}) => {
  return (
    <Modal show={showModal} onHide={closeModal} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>{editMode ? "Modifier l'utilisateur" : "Ajouter un utilisateur"}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Prénom</Form.Label>
                <Form.Control
                  type="text"
                  name="firstName"
                  value={currentUser.firstName || ''}
                  onChange={handleInputChange}
                  placeholder="Prénom"
                  required
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Nom</Form.Label>
                <Form.Control
                  type="text"
                  name="lastName"
                  value={currentUser.lastName || ''}
                  onChange={handleInputChange}
                  placeholder="Nom"
                  required
                />
              </Form.Group>
            </Col>
          </Row>
          
          <Form.Group className="mb-3">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              name="email"
              value={currentUser.email || ''}
              onChange={handleInputChange}
              placeholder="Email"
              required
            />
          </Form.Group>
          
          <Form.Group className="mb-3">
            <Form.Check
              type="checkbox"
              id="active-checkbox"
              name="active"
              label="Actif"
              checked={currentUser.active || false}
              onChange={handleInputChange}
            />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={closeModal}>
          Annuler
        </Button>
        <Button variant="primary" onClick={saveUser}>
          {editMode ? "Mettre à jour" : "Ajouter"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default UserModal;