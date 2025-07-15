import React from 'react';
import { Row, Col, Card, Table, Image, Empty, Spin, Typography } from 'antd';

const { Title, Text } = Typography;

const BottleneckAnalysisTab = ({ data, loading }) => {
  if (loading) {
    return <Spin tip="Analyse en cours..." />;
  }
  
  if (!data) {
    return (
      <Empty
        description="Exécutez l'analyse pour voir les résultats de l'analyse des goulots d'étranglement"
        image={Empty.PRESENTED_IMAGE_SIMPLE}
      />
    );
  }
  
  const { sojourn_time_image, sorted_sojourn_image, bottlenecks } = data;
  
  // Colonnes pour le tableau des goulots d'étranglement
  const columns = [
    {
      title: 'Activité',
      dataIndex: 'activity',
      key: 'activity',
    },
    {
      title: 'Temps de séjour moyen (sec)',
      dataIndex: 'sojourn_time',
      key: 'sojourn_time',
      render: (time) => time.toFixed(2),
      sorter: (a, b) => a.sojourn_time - b.sojourn_time,
    },
    {
      title: 'Statut',
      key: 'status',
      render: (_, record) => {
        let color = 'green';
        let text = 'Normal';
        
        if (record.sojourn_time > 3600) {
          color = 'red';
          text = 'Critique';
        } else if (record.sojourn_time > 1800) {
          color = 'orange';
          text = 'Élevé';
        } else if (record.sojourn_time > 600) {
          color = 'gold';
          text = 'Modéré';
        }
        
        return (
          <span style={{ color }}>
            {text}
          </span>
        );
      },
    },
  ];
  
  return (
    <div className="analysis-content">
      <Row gutter={[16, 16]}>
        <Col xs={24}>
          <Card title="Goulots d'étranglement identifiés">
            <Table
              columns={columns}
              dataSource={bottlenecks}
              rowKey="activity"
              pagination={false}
            />
          </Card>
        </Col>
        
        <Col xs={24}>
          <Card title="Temps de séjour par activité">
            {sojourn_time_image ? (
              <Image
                src={`data:image/png;base64,${sojourn_time_image}`}
                alt="Temps de séjour par activité"
                style={{ width: '100%' }}
              />
            ) : (
              <Empty description="Aucune image disponible" />
            )}
          </Card>
        </Col>
        
        <Col xs={24}>
          <Card title="Temps de séjour par activité (trié)">
            {sorted_sojourn_image ? (
              <Image
                src={`data:image/png;base64,${sorted_sojourn_image}`}
                alt="Temps de séjour par activité (trié)"
                style={{ width: '100%' }}
              />
            ) : (
              <Empty description="Aucune image disponible" />
            )}
          </Card>
        </Col>
        
        <Col xs={24}>
          <Card>
            <Title level={4}>Recommandations pour réduire les goulots d'étranglement</Title>
            <ul>
              <li>
                <Text strong>Réallocation des ressources :</Text>
                <Text> Affectez plus de ressources aux activités identifiées comme goulots d'étranglement.</Text>
              </li>
              <li>
                <Text strong>Simplification des processus :</Text>
                <Text> Évaluez si certaines étapes peuvent être simplifiées ou automatisées.</Text>
              </li>
              <li>
                <Text strong>Formation :</Text>
                <Text> Assurez-vous que les utilisateurs sont correctement formés pour exécuter efficacement les tâches.</Text>
              </li>
              <li>
                <Text strong>Parallélisation :</Text>
                <Text> Déterminez si certaines activités peuvent être exécutées en parallèle plutôt qu'en séquence.</Text>
              </li>
            </ul>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default BottleneckAnalysisTab;
