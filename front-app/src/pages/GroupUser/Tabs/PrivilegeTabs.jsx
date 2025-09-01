import React, { useState } from "react";
import { Dropdown, Menu, Switch, Typography, Space, Row, Col } from "antd";
import { DownOutlined } from "@ant-design/icons";

const { Text } = Typography;

// Privilege names for each category
const privilegeNames = {
  dashboard: ["Voir tableau de bord", "Exporter données", "Personnaliser vue", "Accès temps réel"],
  todo: ["Créer tâche", "Modifier tâche", "Supprimer tâche", "Déléguer tâche"],
  config: ["Modifier paramètres", "Gérer workflows", "Configurer champs", "Définir règles"],
  settings: ["Gérer utilisateurs", "Modifier permissions", "Configurer système", "Mettre à jour"],
  documents: ["Uploader documents", "Télécharger docs", "Modifier métadonnées", "Supprimer docs"],
  domain: ["Ajouter valeurs", "Modifier valeurs", "Supprimer valeurs", "Importer données"],
  forms: ["Créer formulaire", "Modifier formulaire", "Supprimer formulaire", "Partager formulaire"],
  org: ["Voir organigramme", "Modifier structure", "Gérer départements", "Historique changements"],
  security: ["Gérer rôles", "Voir logs", "Configurer MFA", "Révoquer accès"],
  history: ["Voir historique", "Filtrer résultats", "Exporter logs", "Archiver données"],
  analysis: ["Lancer analyses", "Configurer rapports", "Partager insights", "Exporter résultats"]
};

const generateItems = (categoryKey) => {
  const itemsCount = Math.floor(Math.random() * 6) + 10; // 10-15 items
  const baseNames = privilegeNames[categoryKey] || [];
  
  return Array.from({ length: itemsCount }, (_, i) => ({
    id: `${categoryKey}-${i+1}`,
    name: baseNames[i] || `${categoryKey} Privilège ${i+1}`,
    enabled: Math.random() > 0.7
  }));
};

const fakePrivileges = [
  { id: "dashboard", category: "Tableau de bord", items: generateItems("dashboard") },
  { id: "todo", category: "A faire", items: generateItems("todo") },
  { id: "config", category: "Configuration", items: generateItems("config") },
  { id: "settings", category: "Paramètre", items: generateItems("settings") },
  { id: "documents", category: "Gestion documentaire", items: generateItems("documents") },
  { id: "domain", category: "Domaine valeur", items: generateItems("domain") },
  { id: "forms", category: "Liste Formulaire", items: generateItems("forms") },
  { id: "org", category: "Organigramme", items: generateItems("org") },
  { id: "security", category: "Sécurité", items: generateItems("security") },
  { id: "history", category: "Historique", items: generateItems("history") },
  { id: "analysis", category: "Analyse Avancée", items: generateItems("analysis") }
];

const PrivilegeTabs = () => {
  const [privileges, setPrivileges] = useState(fakePrivileges);
  const [openDropdown, setOpenDropdown] = useState(null);

  const togglePrivilege = (categoryIndex, itemIndex) => {
    setPrivileges(prev => {
      const updated = [...prev];
      updated[categoryIndex].items[itemIndex].enabled = 
        !updated[categoryIndex].items[itemIndex].enabled;
      return updated;
    });
  };

  const toggleAllPrivileges = (enable) => {
    setPrivileges(prev => prev.map(category => ({
      ...category,
      items: category.items.map(item => ({ ...item, enabled: enable }))
    })));
  };

  const toggleCategoryPrivileges = (categoryIndex, enable) => {
    setPrivileges(prev => {
      const updated = [...prev];
      updated[categoryIndex].items = updated[categoryIndex].items.map(item => ({
        ...item,
        enabled: enable
      }));
      return updated;
    });
  };

  const menu = (category, categoryIndex) => (
    <Menu onClick={e => e.domEvent.stopPropagation()} style={{ width: 700 }}>
      <Row gutter={16}>
        {category.items.map((item, itemIndex) => (
          <Col span={12} key={item.id}>
            <Menu.Item>
              <div onClick={e => e.stopPropagation()}>
                <Space>
                  <Switch 
                    checked={item.enabled} 
                    onChange={(checked) => togglePrivilege(categoryIndex, itemIndex)}
                  />
                  <Text>{item.name}</Text>
                </Space>
              </div>
            </Menu.Item>
          </Col>
        ))}
      </Row>
    </Menu>
  );

  const allSelected = privileges.every(category => 
    category.items.every(item => item.enabled)
  );

  return (
    <div style={{ padding: "20px" }}>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "16px" }}>
        <Space>
          <Text>Tout sélectionner</Text>
          <Switch 
            checked={allSelected}
            onChange={(checked) => toggleAllPrivileges(checked)}
          />
        </Space>
      </div>
      <Space direction="vertical" size="middle" style={{ width: "100%" }}>
        {privileges.map((category, index) => (
          <Dropdown 
            key={category.id} 
            overlay={() => menu(category, index)}
            trigger={['click']}
            visible={openDropdown === index}
            onVisibleChange={visible => setOpenDropdown(visible ? index : null)}
          >
            <div style={{ 
              padding: "15px", 
              border: "1px solid rgb(18, 164, 201)", 
              borderRadius: "4px",
              cursor: "pointer",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}>
              <Text strong>{category.category}</Text>
              <Space>
                <Switch
                  checked={category.items.every(item => item.enabled)}
                  onChange={(checked) => toggleCategoryPrivileges(index, checked)}
                  onClick={e => e.stopPropagation()}
                />
                <DownOutlined />
              </Space>
            </div>
          </Dropdown>
        ))}
      </Space>
    </div>
  );
};

export default PrivilegeTabs;