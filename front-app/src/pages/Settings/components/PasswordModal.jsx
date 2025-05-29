import React from 'react';
import { Modal, Form, Button } from 'react-bootstrap';

const PasswordModal = ({ 
  showModal, 
  closeModal, 
  editMode, 
  currentPassword, 
  handleInputChange, 
  savePassword 
}) => {
  return (
    <Modal show={showModal} onHide={closeModal} centered>
      <Modal.Header closeButton>
        <Modal.Title>{editMode ? "Modifier le mot de passe" : "Ajouter un mot de passe"}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Mot de passe</Form.Label>
            <Form.Control
              type="text"
              name="password"
              value={currentPassword.password}
              onChange={handleInputChange}
              placeholder="Entrez le mot de passe"
              required
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Description</Form.Label>
            <Form.Control
              type="text"
              name="description"
              value={currentPassword.description}
              onChange={handleInputChange}
              placeholder="Entrez une description"
              required
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Check
              type="checkbox"
              id="active-checkbox"
              name="active"
              label="Actif"
              checked={currentPassword.active}
              onChange={handleInputChange}
            />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={closeModal}>
          Annuler
        </Button>
        <Button variant="primary" onClick={savePassword}>
          {editMode ? "Mettre à jour" : "Ajouter"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};


export default PasswordModal;