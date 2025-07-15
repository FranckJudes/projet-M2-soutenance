import React from 'react';
import { Row, Col, Card, Statistic, Progress, Image, Empty, Spin, Alert, Typography } from 'antd';
import { ClockCircleOutlined, WarningOutlined, CheckCircleOutlined } from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

const PerformancePredictionTab = ({ data, loading }) => {
  if (loading) {
    return <Spin tip="Analyse en cours..." />;
  }
  
  if (!data) {
    return (
      <Empty
        description="Exécutez l'analyse pour voir les résultats de la prédiction de performance"
        image={Empty.PRESENTED_IMAGE_SIMPLE}
      />
    );
  }
  
  const {
    case_id,
    current_duration,
    predicted_remaining_duration,
    predicted_total_duration,
    average_duration,
    delay_risk,
    comparison_image,
    similar_cases_count
  } = data;
  
  // Calculer le pourcentage de progression
  const progressPercentage = Math.min(
    100,
    Math.round((current_duration / predicted_total_duration) * 100)
  );
  
  // Déterminer la couleur de la progression en fonction du risque de retard
  const progressColor = delay_risk ? '#ff4d4f' : '#52c41a';
  
  // Calculer l'écart par rapport à la moyenne
  const deviationFromAverage = ((predicted_total_duration - average_duration) / average_duration) * 100;
  
  return (
    <div className="analysis-content">
      <Row gutter={[16, 16]}>
        <Col xs={24}>
          <Alert
            message={`Prédiction pour le cas: ${case_id}`}
            description={`Cette analyse est basée sur ${similar_cases_count} cas similaires.`}
            type="info"
            showIcon
          />
        </Col>
        
        <Col xs={24} md={12}>
          <Card title="Progression du cas">
            <Statistic
              title="Progression actuelle"
              value={progressPercentage}
              suffix="%"
              prefix={<ClockCircleOutlined />}
            />
            <Progress
              percent={progressPercentage}
              status={delay_risk ? "exception" : "success"}
              strokeColor={progressColor}
            />
            <div style={{ marginTop: 16 }}>
              <Row gutter={16}>
                <Col span={12}>
                  <Statistic
                    title="Durée actuelle"
                    value={current_duration}
                    suffix="sec"
                    precision={1}
                  />
                </Col>
                <Col span={12}>
                  <Statistic
                    title="Durée restante estimée"
                    value={predicted_remaining_duration}
                    suffix="sec"
                    precision={1}
                    valueStyle={{ color: delay_risk ? '#ff4d4f' : '#52c41a' }}
                  />
                </Col>
              </Row>
            </div>
          </Card>
        </Col>
        
        <Col xs={24} md={12}>
          <Card title="Comparaison avec la moyenne">
            <Row gutter={16}>
              <Col span={12}>
                <Statistic
                  title="Durée totale prédite"
                  value={predicted_total_duration}
                  suffix="sec"
                  precision={1}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="Durée moyenne"
                  value={average_duration}
                  suffix="sec"
                  precision={1}
                />
              </Col>
            </Row>
            <div style={{ marginTop: 16 }}>
              <Statistic
                title="Écart par rapport à la moyenne"
                value={deviationFromAverage}
                precision={1}
                suffix="%"
                valueStyle={{ 
                  color: deviationFromAverage > 10 ? '#ff4d4f' : 
                          deviationFromAverage < -10 ? '#52c41a' : '#1890ff' 
                }}
                prefix={deviationFromAverage > 0 ? <WarningOutlined /> : <CheckCircleOutlined />}
              />
            </div>
          </Card>
        </Col>
        
        <Col xs={24}>
          <Card title="Comparaison graphique des durées">
            {comparison_image ? (
              <Image
                src={`data:image/png;base64,${comparison_image}`}
                alt="Comparaison des durées"
                style={{ width: '100%' }}
              />
            ) : (
              <Empty description="Aucune image disponible" />
            )}
          </Card>
        </Col>
        
        <Col xs={24}>
          <Card>
            <Title level={4}>Évaluation du risque</Title>
            <Alert
              message={delay_risk ? "Risque de retard détecté" : "Aucun risque de retard détecté"}
              description={
                delay_risk
                  ? "Ce cas présente un risque significatif de dépasser la durée moyenne d'exécution."
                  : "Ce cas progresse normalement et devrait se terminer dans les délais habituels."
              }
              type={delay_risk ? "warning" : "success"}
              showIcon
              style={{ marginBottom: 16 }}
            />
            
            {delay_risk && (
              <div>
                <Title level={5}>Recommandations</Title>
                <Paragraph>
                  <ul>
                    <li>Vérifiez si des ressources supplémentaires peuvent être allouées à ce cas.</li>
                    <li>Identifiez les activités qui pourraient être accélérées.</li>
                    <li>Informez les parties prenantes du risque de retard potentiel.</li>
                    <li>Envisagez de simplifier les étapes restantes si possible.</li>
                  </ul>
                </Paragraph>
              </div>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default PerformancePredictionTab;
