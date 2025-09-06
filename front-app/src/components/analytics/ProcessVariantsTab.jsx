import React from 'react';
import { Row, Col, Card, Table, Statistic, Image, Empty, Spin } from 'antd';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from 'recharts';

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
  // Préparer des données de graphiques: Top 10 variantes par nombre de cas
  const topVariants = Array.isArray(variants)
    ? [...variants].sort((a, b) => (b.count || 0) - (a.count || 0)).slice(0, 10)
    : [];
  const countChartData = topVariants.map(v => ({ name: v.variant, count: v.count || 0 }));
  const percentChartData = topVariants.map(v => ({ name: v.variant, percentage: v.percentage || 0 }));
  
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

        <Col xs={24} lg={12}>
          <Card title="Top variantes par nombre de cas">
            {countChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={countChartData} margin={{ left: 8, right: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" hide />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" name="Nombre de cas" fill="#1890ff" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <Empty description="Données non disponibles" />
            )}
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Top variantes par pourcentage">
            {percentChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={percentChartData} margin={{ left: 8, right: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" hide />
                  <YAxis tickFormatter={(v) => `${v.toFixed(0)}%`} />
                  <Tooltip formatter={(v) => `${Number(v).toFixed(2)}%`} />
                  <Legend />
                  <Bar dataKey="percentage" name="Pourcentage" fill="#52c41a" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <Empty description="Données non disponibles" />
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default ProcessVariantsTab;
