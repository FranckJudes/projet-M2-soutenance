import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Alert, Spin, Badge, Tabs, message, Breadcrumb, theme } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, PlayCircleOutlined, ReloadOutlined, HomeOutlined, DeploymentUnitOutlined } from '@ant-design/icons';
import BpmnModelService from '../../services/BpmnModelService';
import Main from "../../layout/Main";
import { useTranslation } from 'react-i18next';

const BpmnDeploymentStatus = () => {
  const { t } = useTranslation();
  const [deployedProcesses, setDeployedProcesses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [startingProcess, setStartingProcess] = useState(null);
  const [startedInstances, setStartedInstances] = useState([]);
  const { token } = theme.useToken();
  
  // Style pour le breadcrumb
  const breadcrumbStyle = {
    margin: '0 0 16px',
    padding: '8px 16px',
    borderRadius: '4px',
    backgroundColor: token.colorPrimaryBg,
  };

  const breadcrumbItemStyle = {
    color: token.colorPrimaryActive,
  };

  const fetchDeployedProcesses = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await BpmnModelService.getDeployedProcesses();
      const processesArray = Array.isArray(response) ? response : [];
      setDeployedProcesses(processesArray);
    } catch (err) {
      setError('Erreur lors de la récupération des processus déployés: ' + (err.response?.data || err.message));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeployedProcesses();
  }, []);

  const checkDeploymentStatus = async (processKey) => {
    try {
      const response = await BpmnModelService.checkDeploymentStatus(processKey);
      return response.isDeployed;
    } catch (err) {
      message.error('Erreur lors de la vérification du déploiement: ' + (err.response?.data || err.message));
      return false;
    }
  };

  const startProcessInstance = async (processKey) => {
    setStartingProcess(processKey);
    try {
      const response = await BpmnModelService.startProcessInstance(processKey);
      message.success(`Instance de processus démarrée: ${response.instanceId}`);
      
      // Ajouter l'instance à la liste des instances démarrées
      setStartedInstances(prev => [
        {
          ...response,
          startTime: new Date().toLocaleString()
        },
        ...prev
      ]);
    } catch (err) {
      message.error('Erreur lors du démarrage du processus: ' + (err.response?.data || err.message));
    } finally {
      setStartingProcess(null);
    }
  };

  const columns = [
    {
      title: 'Clé',
      dataIndex: 'key',
      key: 'key',
    },
    {
      title: 'Nom',
      dataIndex: 'name',
      key: 'name',
      render: (text) => text || 'Non défini'
    },
    {
      title: 'Version',
      dataIndex: 'version',
      key: 'version',
    },
    {
      title: 'ID de déploiement',
      dataIndex: 'deploymentId',
      key: 'deploymentId',
    },
    {
      title: 'Statut',
      key: 'status',
      render: (_, record) => (
        <Badge 
          status={record.suspended ? 'error' : 'success'} 
          text={record.suspended ? 'Suspendu' : 'Actif'} 
        />
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Button 
          type="primary" 
          icon={<PlayCircleOutlined />} 
          onClick={() => startProcessInstance(record.key)}
          loading={startingProcess === record.key}
          disabled={record.suspended}
        >
          Démarrer
        </Button>
      )
    }
  ];

  const instanceColumns = [
    {
      title: 'ID d\'instance',
      dataIndex: 'instanceId',
      key: 'instanceId',
    },
    {
      title: 'Clé de processus',
      dataIndex: 'processKey',
      key: 'processKey',
    },
    {
      title: 'Clé métier',
      dataIndex: 'businessKey',
      key: 'businessKey',
      render: (text) => text || 'Non défini'
    },
    {
      title: 'Statut',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Badge 
          status={status === 'STARTED' ? 'processing' : 'default'} 
          text={status} 
        />
      )
    },
    {
      title: 'Heure de démarrage',
      dataIndex: 'startTime',
      key: 'startTime',
    }
  ];

  // Définir les items pour les onglets (nouvelle API Ant Design)
  const tabItems = [
    {
      key: "1",
      label: "Processus déployés",
      children: (
        <>
          {error && <Alert message={error} type="error" showIcon style={{ marginBottom: 16 }} />}
          
          <Spin spinning={loading}>
            {deployedProcesses.length > 0 ? (
              <Table 
                dataSource={deployedProcesses} 
                columns={columns} 
                rowKey="id"
                pagination={{ pageSize: 5 }}
              />
            ) : (
              <Alert 
                message="Aucun processus déployé" 
                description="Il n'y a actuellement aucun processus BPMN déployé dans le système." 
                type="info" 
                showIcon 
              />
            )}
          </Spin>
        </>
      )
    },
    {
      key: "2",
      label: "Instances démarrées",
      children: (
        <>
          {startedInstances.length > 0 ? (
            <Table 
              dataSource={startedInstances} 
              columns={instanceColumns} 
              rowKey="instanceId"
              pagination={{ pageSize: 5 }}
            />
          ) : (
            <Alert 
              message="Aucune instance démarrée" 
              description="Vous n'avez pas encore démarré d'instances de processus." 
              type="info" 
              showIcon 
            />
          )}
        </>
      )
    }
  ];

  return (
    <Main>
      <div className="p-4">
        <Breadcrumb style={breadcrumbStyle}>
          <Breadcrumb.Item href="/" style={breadcrumbItemStyle}>
            <HomeOutlined /> {t("welcome_dashboard")}
          </Breadcrumb.Item>
          <Breadcrumb.Item style={breadcrumbItemStyle}>
            <DeploymentUnitOutlined /> Statut des déploiements BPMN
          </Breadcrumb.Item>
        </Breadcrumb>
        
        <Card 
          title="Statut des déploiements BPMN" 
          extra={
            <Button 
              icon={<ReloadOutlined />} 
              onClick={fetchDeployedProcesses}
              loading={loading}
            >
              Actualiser
            </Button>
          }
          className="mt-3"
        >
          <Tabs defaultActiveKey="1" items={tabItems} />
        </Card>
      </div>
    </Main>
  );
};

export default BpmnDeploymentStatus;
