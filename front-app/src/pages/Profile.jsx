import React, { useState, useEffect } from "react";
import { Card, Row, Col, Avatar, Tabs, Form, Input, Button, Upload, Divider, message, Skeleton } from "antd";
import { UserOutlined, MailOutlined, PhoneOutlined, HomeOutlined, EditOutlined, SaveOutlined, UploadOutlined } from "@ant-design/icons";
import Main from "../layout/Main";
import { authService } from "../api/authService";

const { TabPane } = Tabs;

function Profile() {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    // Charger les données de l'utilisateur connecté
    const loadUserProfile = async () => {
      try {
        setLoading(true);
        // À remplacer par votre appel API réel pour récupérer les données utilisateur
        const currentUser = await authService.getCurrentUser();
        console.log(currentUser.data);
        if (currentUser) {
          setUserData(currentUser.data);
          form.setFieldsValue({
            firstName: currentUser.data.firstName,
            lastName: currentUser.data.lastName,
            email: currentUser.data.email,
            phone: currentUser.data.phone || '',
            username: currentUser.data.username || '',
            theme: currentUser.data.theme || 'light'
          });
        }
      } catch (error) {
        console.error("Erreur lors du chargement du profil:", error);
        message.error("Impossible de charger votre profil");
      } finally {
        setLoading(false);
      }
    };

    loadUserProfile();
  }, [form]);

  const handleEditToggle = () => {
    setEditing(!editing);
  };

  const handleSaveProfile = async (values) => {
    try {
      setLoading(true);
      
      // À remplacer par votre appel API réel pour mettre à jour le profil
      // Exemple: await userService.updateProfile(values);
      
      message.success("Profil mis à jour avec succès");
      setEditing(false);
      
      // Mettre à jour les données utilisateur après la sauvegarde
      setUserData({...userData, ...values});
    } catch (error) {
      console.error("Erreur lors de la mise à jour du profil:", error);
      message.error("Impossible de mettre à jour votre profil");
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = (info) => {
    if (info.file.status === 'done') {
      message.success(`${info.file.name} téléchargé avec succès`);
      // Mise à jour de l'avatar dans les données utilisateur
      setUserData({
        ...userData,
        profilePicture: info.file.response.url // Ajustez selon votre réponse API
      });
    } else if (info.file.status === 'error') {
      message.error(`${info.file.name} échec du téléchargement.`);
    }
  };

  return (
    <Main>
      <div className="section-body">
        <div className="row clearfix">
          <div className="col-lg-12">
            <Card 
              title="Mon Profil" 
              bordered={false} 
              className="card"
              extra={
                !editing ? (
                  <Button type="primary" icon={<EditOutlined />} onClick={handleEditToggle}>
                    Modifier
                  </Button>
                ) : (
                  <Button onClick={handleEditToggle}>
                    Annuler
                  </Button>
                )
              }
            >
              {loading ? (
                <Skeleton avatar paragraph={{ rows: 4 }} active />
              ) : (
                <Row gutter={24}>
                  {/* Section Avatar et Informations de base */}
                  <Col xs={24} sm={24} md={8} lg={7} className="text-center">
                    <div className="user-profile-section">
                      {editing ? (
                        <Upload
                          name="avatar"
                          listType="picture-circle"
                          className="avatar-uploader"
                          showUploadList={false}
                          onChange={handleAvatarChange}
                        >
                          {userData?.profilePicture ? (
                            <Avatar 
                              size={128} 
                              src={userData.profilePicture} 
                              alt={`${userData.firstName} ${userData.lastName}`}
                            />
                          ) : (
                            <div>
                              <UploadOutlined />
                              <div style={{ marginTop: 8 }}>Changer</div>
                            </div>
                          )}
                        </Upload>
                      ) : (
                        <Avatar 
                          size={128} 
                          src={userData?.profilePicture} 
                          icon={!userData?.profilePicture && <UserOutlined />}
                        />
                      )}
                      <h4 className="mt-3">{userData?.firstName} {userData?.lastName}</h4>
                      <p className="text-muted">{userData?.role || 'Utilisateur'}</p>

                      <Divider />
                      
                      <div className="user-info-section text-left">
                        <p>
                          <MailOutlined className="mr-2" /> 
                          <span className="text-muted">Email: </span>
                          {userData?.email}
                        </p>
                        {userData?.phone && (
                          <p>
                            <PhoneOutlined className="mr-2" /> 
                            <span className="text-muted">Téléphone: </span>
                            {userData.phone}
                          </p>
                        )}
                        {userData?.username && (
                          <p>
                            <UserOutlined className="mr-2" /> 
                            <span className="text-muted">Nom d'utilisateur: </span>
                            {userData.username}
                          </p>
                        )}
                      </div>
                    </div>
                  </Col>

                  {/* Section de formulaire / détails */}
                  <Col xs={24} sm={24} md={16} lg={17}>
                    <Tabs defaultActiveKey="1">
                      <TabPane tab="Informations personnelles" key="1">
                        {editing ? (
                          <Form
                            form={form}
                            layout="vertical"
                            onFinish={handleSaveProfile}
                          >
                            <Row gutter={16}>
                              <Col span={12}>
                                <Form.Item
                                  name="firstName"
                                  label="Prénom"
                                  rules={[{ required: true, message: 'Veuillez entrer votre prénom' }]}
                                >
                                  <Input placeholder="Prénom" />
                                </Form.Item>
                              </Col>
                              <Col span={12}>
                                <Form.Item
                                  name="lastName"
                                  label="Nom"
                                  rules={[{ required: true, message: 'Veuillez entrer votre nom' }]}
                                >
                                  <Input placeholder="Nom" />
                                </Form.Item>
                              </Col>
                            </Row>

                            <Form.Item
                              name="username"
                              label="Nom d'utilisateur"
                              rules={[{ required: true, message: 'Veuillez entrer votre nom d\'utilisateur' }]}
                            >
                              <Input placeholder="Nom d'utilisateur" />
                            </Form.Item>

                            <Form.Item
                              name="email"
                              label="Email"
                              rules={[
                                { required: true, message: 'Veuillez entrer votre email' },
                                { type: 'email', message: 'Format d\'email invalide' }
                              ]}
                            >
                              <Input placeholder="Email" />
                            </Form.Item>

                            <Form.Item
                              name="phone"
                              label="Téléphone"
                            >
                              <Input placeholder="Téléphone" />
                            </Form.Item>

                            <Form.Item
                              name="theme"
                              label="Thème préféré"
                            >
                              <Input placeholder="Thème (light/dark)" />
                            </Form.Item>

                            <Form.Item>
                              <Button 
                                type="primary" 
                                htmlType="submit" 
                                icon={<SaveOutlined />}
                                loading={loading}
                              >
                                Enregistrer
                              </Button>
                            </Form.Item>
                          </Form>
                        ) : (
                          <Row gutter={16} className="user-details">
                            <Col span={12}>
                              <div className="detail-item" style={{ width: '100%', paddingTop: '20px' }}>
                                <h5>Informations personnelles</h5>
                                <div style={{ width: '100%', paddingTop: '20px' }}>
                                  <p><strong>Prénom:</strong> {userData?.firstName}</p>
                                  <p><strong>Nom:</strong> {userData?.lastName}</p>
                                  <p><strong>Nom d'utilisateur:</strong> {userData?.username || 'Non défini'}</p>
                                  <p><strong>Email:</strong> {userData?.email}</p>
                                  <p><strong>Téléphone:</strong> {userData?.phone || 'Non défini'}</p>
                                </div>
                              </div>
                            </Col>
                            
                            <Col span={12}>
                              <div className="detail-item" style={{ width: '100%' }}>
                                <h5>Informations du compte</h5>
                                <p><strong>Statut:</strong> {userData?.status || 'ACTIVE'}</p>
                                <p><strong>Rôle:</strong> {userData?.role || 'Utilisateur'}</p>
                                <p><strong>Créé le:</strong> {userData?.createdAt ? new Date(userData.createdAt).toLocaleDateString() : 'Non disponible'}</p>
                                <p><strong>Dernière mise à jour:</strong> {userData?.updatedAt ? new Date(userData.updatedAt).toLocaleDateString() : 'Non disponible'}</p>
                              </div>
                            </Col>
                          </Row>
                        )}
                      </TabPane>
                      
                      <TabPane tab="Sécurité" key="2">
                        <Card title="Changer le mot de passe" bordered={false}>
                          <Form layout="vertical">
                            <Form.Item
                              name="currentPassword"
                              label="Mot de passe actuel"
                              rules={[{ required: true, message: 'Veuillez entrer votre mot de passe actuel' }]}
                            >
                              <Input.Password placeholder="Mot de passe actuel" />
                            </Form.Item>
                            
                            <Form.Item
                              name="newPassword"
                              label="Nouveau mot de passe"
                              rules={[{ required: true, message: 'Veuillez entrer votre nouveau mot de passe' }]}
                            >
                              <Input.Password placeholder="Nouveau mot de passe" />
                            </Form.Item>
                            
                            <Form.Item
                              name="confirmPassword"
                              label="Confirmer le mot de passe"
                              rules={[
                                { required: true, message: 'Veuillez confirmer votre mot de passe' },
                                ({ getFieldValue }) => ({
                                  validator(_, value) {
                                    if (!value || getFieldValue('newPassword') === value) {
                                      return Promise.resolve();
                                    }
                                    return Promise.reject(new Error('Les deux mots de passe ne correspondent pas'));
                                  },
                                }),
                              ]}
                            >
                              <Input.Password placeholder="Confirmer le mot de passe" />
                            </Form.Item>
                            
                            <Form.Item>
                              <Button type="primary">Mettre à jour le mot de passe</Button>
                            </Form.Item>
                          </Form>
                        </Card>
                      </TabPane>
                    </Tabs>
                  </Col>
                </Row>
              )}
            </Card>
          </div>
        </div>
      </div>
    </Main>
  );
}

export default Profile;
