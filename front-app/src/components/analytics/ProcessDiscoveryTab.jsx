import React from 'react';
import { Row, Col, Card, Statistic, Image, Empty, Spin } from 'antd';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from 'recharts';

const ProcessDiscoveryTab = ({ data, loading }) => {
  if (loading) {
    return <Spin tip="Analyse en cours..." />;
  }
  
  if (!data) {
    return (
      <Empty
        description="Exécutez l'analyse pour voir les résultats de la découverte de processus"
        image={Empty.PRESENTED_IMAGE_SIMPLE}
      />
    );
  }
  
  const { petri_net_image, metrics } = data;
  const chartData = [
    {
      name: 'Fitness',
      value: metrics?.fitness?.average_trace_fitness ?? 0
    },
    { name: 'Precision', value: metrics?.precision ?? 0 },
    { name: 'Generalization', value: metrics?.generalization ?? 0 },
    { name: 'Simplicity', value: metrics?.simplicity ?? 0 },
  ];
  
  return (
    <div className="analysis-content">
      <Row gutter={[16, 16]}>
        <Col xs={24}>
          <Card title="Modèle de processus découvert">
            {petri_net_image ? (
              <Image
                src={`data:image/png;base64,${petri_net_image}`}
                alt="Modèle de processus"
                style={{ width: '100%' }}
              />
            ) : (
              <Empty description="Aucune image disponible" />
            )}
          </Card>
        </Col>
        
        <Col xs={24}>
          <Card title="Métriques de qualité du modèle">
            <Row gutter={16}>
              <Col xs={24} sm={12} md={6}>
                <Statistic
                  title="Fitness"
                  value={metrics?.fitness?.average_trace_fitness || 0}
                  precision={2}
                  suffix="/ 1.0"
                />
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Statistic
                  title="Précision"
                  value={metrics?.precision || 0}
                  precision={2}
                  suffix="/ 1.0"
                />
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Statistic
                  title="Généralisation"
                  value={metrics?.generalization || 0}
                  precision={2}
                  suffix="/ 1.0"
                />
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Statistic
                  title="Simplicité"
                  value={metrics?.simplicity || 0}
                  precision={2}
                  suffix="/ 1.0"
                />
              </Col>
            </Row>
            <div style={{ marginTop: 16 }}>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis domain={[0, 1]} tickFormatter={(v) => v.toFixed(1)} />
                  <Tooltip formatter={(v) => v.toFixed(3)} />
                  <Legend />
                  <Bar dataKey="value" name="Score" fill="#1890ff" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default ProcessDiscoveryTab;
