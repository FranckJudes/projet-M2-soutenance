import React from 'react';
import { Row, Col, Card, Table, Statistic, Image, Empty, Spin } from 'antd';

const ProcessVariantsTab = ({ data, loading }) => {
  if (loading) {
    return <Spin tip="Analyse en cours..." />;
  }
  
  if (!data) {
    return (
      <Empty
        description="Exécutez l'analyse pour voir les résultats des variantes de processus"
        image={Empty.PRESENTED_IMAGE_SIMPLE}
      />
    );
  }
  
  const { variants, case_statistics } = data;
  
  // Colonnes pour le tableau des variantes
  const columns = [
    {
      title: 'Variante',
      dataIndex: 'variant',
      key: 'variant',
      ellipsis: true,
      width: '40%',
      render: (text) => <span title={text}>{text}</span>,
    },
    {
      title: 'Nombre de cas',
      dataIndex: 'count',
      key: 'count',
      sorter: (a, b) => a.count - b.count,
    },
    {
      title: 'Pourcentage',
      dataIndex: 'percentage',
      key: 'percentage',
      render: (text) => `${text.toFixed(2)}%`,
      sorter: (a, b) => a.percentage - b.percentage,
    },
    {
      title: 'Nombre d\'activités',
      dataIndex: 'activities',
      key: 'activities',
      render: (activities) => activities.length,
      sorter: (a, b) => a.activities.length - b.activities.length,
    },
  ];
  
  return (
    <div className="analysis-content">
      <Row gutter={[16, 16]}>
        <Col xs={24}>
          <Card title="Statistiques des cas">
            <Row gutter={16}>
              <Col xs={24} sm={12} md={6}>
                <Statistic
                  title="Nombre total de cas"
                  value={case_statistics?.total_cases || 0}
                />
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Statistic
                  title="Durée médiane (sec)"
                  value={case_statistics?.median_duration || 0}
                  precision={2}
                />
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Statistic
                  title="Durée minimale (sec)"
                  value={case_statistics?.min_duration || 0}
                  precision={2}
                />
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Statistic
                  title="Durée maximale (sec)"
                  value={case_statistics?.max_duration || 0}
                  precision={2}
                />
              </Col>
            </Row>
          </Card>
        </Col>
        
        <Col xs={24}>
          <Card title="Distribution des durées des cas">
            {case_statistics?.case_duration_image ? (
              <Image
                src={`data:image/png;base64,${case_statistics.case_duration_image}`}
                alt="Distribution des durées des cas"
                style={{ width: '100%' }}
              />
            ) : (
              <Empty description="Aucune image disponible" />
            )}
          </Card>
        </Col>
        
        <Col xs={24}>
          <Card title="Variantes de processus">
            <Table
              columns={columns}
              dataSource={variants}
              rowKey="variant"
              pagination={{ pageSize: 10 }}
              expandable={{
                expandedRowRender: record => (
                  <p style={{ margin: 0 }}>
                    <strong>Activités:</strong> {record.activities.join(' → ')}
                  </p>
                ),
              }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default ProcessVariantsTab;
