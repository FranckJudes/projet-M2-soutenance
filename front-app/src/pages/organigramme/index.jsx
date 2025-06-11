import React, { useState, useEffect } from "react";
import Main from "../../layout/Main";
import { Card, Tabs, Breadcrumb, Spin, Alert, message, theme } from "antd";
import { HomeOutlined, ApartmentOutlined, TagsOutlined, TeamOutlined } from "@ant-design/icons";
import EntiteOrganisationTab from "./tabs/EntiteOrganisationTab";
import TypeEntiteTab from "./tabs/TypeEntiteTab";
import EntiteUsersTab from "./tabs/EntiteUsersTab";
import EntiteOrganisationService from "../../services/EntiteOrganisationService";
import TypeEntiteService from "../../services/TypeEntiteService";

const { TabPane } = Tabs;

function Organigramme() {
  const [loading, setLoading] = useState(false);
  const [entites, setEntites] = useState([]);
  const [typeEntites, setTypeEntites] = useState([]);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("1");
  
  const { token } = theme.useToken();

  // Fetch data when component mounts
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch entites and type entites in parallel
      const [entitesResponse, typeEntitesResponse] = await Promise.all([
        EntiteOrganisationService.getAllEntites(),
        TypeEntiteService.getAllTypeEntites()
      ]);
      
      if (entitesResponse.data && entitesResponse.data.data) {
        setEntites(entitesResponse.data.data);
      }
      
      if (typeEntitesResponse.data && typeEntitesResponse.data.data) {
        setTypeEntites(typeEntitesResponse.data.data);
      }
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Une erreur est survenue lors du chargement des données.");
      message.error("Erreur lors du chargement des données");
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (key) => {
    setActiveTab(key);
  };

  return (
    <Main>
      <div style={{ padding: "0 24px", marginTop: 16 }}>
        <Breadcrumb
          items={[
            {
              title: (
                <>
                  <HomeOutlined /> Accueil
                </>
              ),
              href: "/",
            },
            {
              title: (
                <>
                  <ApartmentOutlined /> Organigramme
                </>
              ),
            },
          ]}
        />
        
        <Card 
          title="Gestion de l'Organigramme" 
          style={{ marginTop: 16, boxShadow: "0 1px 2px rgba(0,0,0,0.1)" }}
        >
          {error && (
            <Alert
              message="Erreur"
              description={error}
              type="error"
              showIcon
              style={{ marginBottom: 16 }}
            />
          )}
          
          <Spin spinning={loading}>
            <Tabs 
              activeKey={activeTab} 
              onChange={handleTabChange}
              type="card"
              style={{ marginTop: 16 }}
            >
              <TabPane 
                tab={
                  <span>
                    <ApartmentOutlined /> Entités d'Organisation
                  </span>
                } 
                key="1"
              >
                <EntiteOrganisationTab 
                  entites={entites} 
                  typeEntites={typeEntites}
                  onRefresh={fetchData}
                />
              </TabPane>
              <TabPane 
                tab={
                  <span>
                    <TagsOutlined /> Types d'Entités
                  </span>
                } 
                key="2"
              >
                <TypeEntiteTab 
                  typeEntites={typeEntites}
                  onRefresh={fetchData}
                />
              </TabPane>
              <TabPane 
                tab={
                  <span>
                    <TeamOutlined /> Gestion des Utilisateurs
                  </span>
                } 
                key="3"
              >
                <EntiteUsersTab 
                  entites={entites}
                  onRefresh={fetchData}
                />
              </TabPane>
            </Tabs>
          </Spin>
        </Card>
      </div>
    </Main>
  );
}

export default Organigramme;
