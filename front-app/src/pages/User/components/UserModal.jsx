import React from 'react';
import { Modal, Form, Input, Button, Row, Col, Checkbox, Select, Space } from 'antd';

const UserModal = ({ 
  showModal, 
  closeModal, 
  editMode, 
  currentUser, 
  handleInputChange, 
  saveUser 
}) => {
  // Custom handler for Ant Design form controls
  const handleAntInputChange = (e) => {
    const { name, value } = e.target;
    handleInputChange({ target: { name, value } });
  };

  // Custom handler for Checkbox
  const handleCheckboxChange = (name, checked) => {
    handleInputChange({ target: { name, checked, type: 'checkbox' } });
  };

  // Custom handler for Select
  const handleSelectChange = (value, name) => {
    handleInputChange({ target: { name, value } });
  };

  return (
    <Modal
      title={editMode ? "Modifier l'utilisateur" : "Ajouter un utilisateur"}
      open={showModal}
      onCancel={closeModal}
      footer={null}
      width={700}
    >
      <Form layout="vertical">
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item 
              label="Prénom"
              required
              tooltip="Le prénom de l'utilisateur"
            >
              <Input
                name="firstName"
                value={currentUser.firstName || ''}
                onChange={handleAntInputChange}
                placeholder="Prénom"
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item 
              label="Nom"
              required
              tooltip="Le nom de famille de l'utilisateur"
            >
              <Input
                name="lastName"
                value={currentUser.lastName || ''}
                onChange={handleAntInputChange}
                placeholder="Nom"
              />
            </Form.Item>
          </Col>
        </Row>
        
        <Form.Item 
          label="Email"
          required
          tooltip="L'adresse email de l'utilisateur"
        >
          <Input
            type="email"
            name="email"
            value={currentUser.email || ''}
            onChange={handleAntInputChange}
            placeholder="Email"
          />
        </Form.Item>

        <Form.Item 
          label="Rôle"
          required
          tooltip="Le rôle de l'utilisateur dans l'application"
        >
          <Select
            value={currentUser.role || 'USER'}
            onChange={(value) => handleSelectChange(value, 'role')}
            style={{ width: '100%' }}
          >
            <Select.Option value="USER">Utilisateur</Select.Option>
            <Select.Option value="ADMIN">Administrateur</Select.Option>
          </Select>
        </Form.Item>
        
        <Form.Item>
          <Checkbox
            checked={currentUser.active || false}
            onChange={(e) => handleCheckboxChange('active', e.target.checked)}
          >
            Actif
          </Checkbox>
        </Form.Item>

        <Form.Item>
          <Space style={{ float: 'right' }}>
            <Button onClick={closeModal}>
              Annuler
            </Button>
            <Button type="primary" onClick={saveUser}>
              {editMode ? "Mettre à jour" : "Ajouter"}
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default UserModal;