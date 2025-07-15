import React from 'react';
import { Row, Col, Card, Table, Image, Empty, Spin, Typography, Tag } from 'antd';
import { ForceGraph2D } from 'react-force-graph';

const { Title, Text } = Typography;

const SocialNetworkAnalysisTab = ({ data, loading }) => {
  if (loading) {
    return <Spin tip="Analyse en cours..." />;
  }
  
  if (!data) {
    return (
      <Empty
        description="Exécutez l'analyse pour voir les résultats de l'analyse du réseau social"
        image={Empty.PRESENTED_IMAGE_SIMPLE}
      />
    );
  }
  
  const { roles, social_network, social_network_image } = data;
  
  // Colonnes pour le tableau des rôles
  const rolesColumns = [
    {
      title: 'Rôle',
      dataIndex: 'role',
      key: 'role',
    },
    {
      title: 'Nombre de ressources',
      dataIndex: 'count',
      key: 'count',
      sorter: (a, b) => a.count - b.count,
    },
    {
      title: 'Ressources',
      dataIndex: 'resources',
      key: 'resources',
      render: resources => (
        <>
          {resources.map(resource => (
            <Tag color="blue" key={resource}>
              {resource}
            </Tag>
          ))}
        </>
      ),
    },
  ];
  
  // Colonnes pour le tableau du réseau social
  const networkColumns = [
    {
      title: 'Source',
      dataIndex: 'source',
      key: 'source',
    },
    {
      title: 'Cible',
      dataIndex: 'target',
      key: 'target',
    },
    {
      title: 'Valeur',
      dataIndex: 'value',
      key: 'value',
      render: value => value.toFixed(3),
      sorter: (a, b) => a.value - b.value,
    },
  ];
  
  // Préparer les données pour le graphe de force
  const graphData = {
    nodes: [],
    links: []
  };
  
  if (social_network) {
    // Créer un ensemble de nœuds uniques
    const uniqueNodes = new Set();
    social_network.forEach(item => {
      uniqueNodes.add(item.source);
      uniqueNodes.add(item.target);
    });
    
    // Ajouter les nœuds au graphe
    graphData.nodes = Array.from(uniqueNodes).map(id => ({ id }));
    
    // Ajouter les liens au graphe
    graphData.links = social_network.map(item => ({
      source: item.source,
      target: item.target,
      value: item.value
    }));
  }
  
  return (
    <div className="analysis-content">
      <Row gutter={[16, 16]}>
        <Col xs={24}>
          <Card title="Rôles organisationnels">
            <Table
              columns={rolesColumns}
              dataSource={roles}
              rowKey="role"
              pagination={{ pageSize: 5 }}
            />
          </Card>
        </Col>
        
        <Col xs={24}>
          <Card title="Réseau social (handover of work)">
            {social_network_image ? (
              <Image
                src={`data:image/png;base64,${social_network_image}`}
                alt="Réseau social"
                style={{ width: '100%' }}
              />
            ) : (
              <Empty description="Aucune image disponible" />
            )}
          </Card>
        </Col>
        
        <Col xs={24}>
          <Card title="Visualisation interactive du réseau social">
            {social_network && social_network.length > 0 ? (
              <div style={{ height: '500px', border: '1px solid #ddd' }}>
                <ForceGraph2D
                  graphData={graphData}
                  nodeLabel={node => node.id}
                  linkLabel={link => `${link.source.id} → ${link.target.id}: ${link.value.toFixed(3)}`}
                  nodeAutoColorBy="id"
                  linkDirectionalArrowLength={6}
                  linkDirectionalArrowRelPos={1}
                  linkWidth={link => Math.sqrt(link.value) * 5}
                />
              </div>
            ) : (
              <Empty description="Aucune donnée de réseau social disponible" />
            )}
          </Card>
        </Col>
        
        <Col xs={24}>
          <Card title="Détails des interactions">
            <Table
              columns={networkColumns}
              dataSource={social_network}
              rowKey={(record) => `${record.source}-${record.target}`}
              pagination={{ pageSize: 10 }}
            />
          </Card>
        </Col>
        
        <Col xs={24}>
          <Card>
            <Title level={4}>Interprétation de l'analyse du réseau social</Title>
            <Text>
              L'analyse du réseau social dans le contexte des processus métier permet d'identifier :
            </Text>
            <ul>
              <li>
                <Text strong>Collaborations clés :</Text>
                <Text> Les personnes qui travaillent fréquemment ensemble.</Text>
              </li>
              <li>
                <Text strong>Acteurs centraux :</Text>
                <Text> Les personnes qui jouent un rôle central dans le processus.</Text>
              </li>
              <li>
                <Text strong>Silos potentiels :</Text>
                <Text> Les groupes isolés qui pourraient bénéficier d'une meilleure intégration.</Text>
              </li>
              <li>
                <Text strong>Transferts de travail :</Text>
                <Text> La fréquence à laquelle le travail passe d'une personne à une autre.</Text>
              </li>
            </ul>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default SocialNetworkAnalysisTab;
