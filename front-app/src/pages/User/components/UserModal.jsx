import React from 'react';
import { Modal, Form, Input, Button, Row, Col, Checkbox, Space, Upload, Select } from 'antd';
import { UploadOutlined } from '@ant-design/icons';

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

  // Custom handler for file upload
  const handleFileChange = ({ file }) => {
    if (file.status === 'done') {
      handleInputChange({ target: { name: 'profilePicture', value: file.originFileObj } });
    }
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
          label="Nom d'utilisateur"
          required
          tooltip="Le nom d'utilisateur unique"
        >
          <Input
            name="username"
            value={currentUser.username || ''}
            onChange={handleAntInputChange}
            placeholder="Nom d'utilisateur"
          />
        </Form.Item>

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
          label="Téléphone"
          tooltip="Le numéro de téléphone de l'utilisateur"
        >
          <Input
            name="phone"
            value={currentUser.phone || ''}
            onChange={handleAntInputChange}
            placeholder="Téléphone"
          />
        </Form.Item>

        <Form.Item 
          label="Statut"
          tooltip="Le statut de l'utilisateur"
        >
          <Select
            name="status"
            value={currentUser.status || 'ACTIVE'}
            onChange={(value) => handleInputChange({ target: { name: 'status', value } })}
          >
            <Select.Option value="ACTIVE">Actif</Select.Option>
            <Select.Option value="INACTIVE">Inactif</Select.Option>
          </Select>
        </Form.Item>

      

        <Form.Item 
          label="Photo de profil"
          tooltip="Télécharger la photo de profil de l'utilisateur"
        >
          <Upload
            name="profilePicture"
            listType="picture"
            onChange={handleFileChange}
            maxCount={1}
          >
            <Button icon={<UploadOutlined />}>Télécharger</Button>
          </Upload>
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