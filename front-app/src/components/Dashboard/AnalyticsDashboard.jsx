import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Statistic, Progress, Spin, Select, DatePicker, Button, Typography } from 'antd';
import { 
  CheckCircleOutlined, 
  ClockCircleOutlined, 
  TeamOutlined, 
  FileOutlined,
  DownloadOutlined
} from '@ant-design/icons';
import { Line, Bar, Pie } from '@ant-design/charts';
import moment from 'moment';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

const AnalyticsDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [dateRange, setDateRange] = useState([moment().subtract(30, 'days'), moment()]);
  const [processFilter, setProcessFilter] = useState('all');
  
  // Fetch dashboard data from backend
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Format date range for API
        const startDate = dateRange[0].format('YYYY-MM-DD');
        const endDate = dateRange[1].format('YYYY-MM-DD');
        
        // Make API call
        const response = await fetch(
          `http://localhost:8100/analytics/dashboard?startDate=${startDate}&endDate=${endDate}&processId=${processFilter}`
        );
        
        if (!response.ok) {
          throw new Error('Failed to fetch dashboard data');
        }
        
        const data = await response.json();
        setDashboardData(data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [dateRange, processFilter]);
  
  // Handle date range change
  const handleDateRangeChange = (dates) => {
    if (dates && dates.length === 2) {
      setDateRange(dates);
    }
  };
  
  // Handle process filter change
  const handleProcessChange = (value) => {
    setProcessFilter(value);
  };
  
  // Handle export to PDF
  const handleExportPDF = async () => {
    try {
      const response = await fetch(
        `http://localhost:8100/analytics/export/pdf?startDate=${dateRange[0].format('YYYY-MM-DD')}&endDate=${dateRange[1].format('YYYY-MM-DD')}&processId=${processFilter}`,
        {
          method: 'GET',
          headers: {
            'Accept': 'application/pdf',
          },
        }
      );
      
      if (!response.ok) {
        throw new Error('Failed to export PDF');
      }
      
      // Create blob from response
      const blob = await response.blob();
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `bpmn-analytics-${dateRange[0].format('YYYY-MM-DD')}-to-${dateRange[1].format('YYYY-MM-DD')}.pdf`;
      
      // Trigger download
      document.body.appendChild(a);
      a.click();
      
      // Cleanup
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error exporting PDF:', error);
    }
  };
  
  // Handle export to Excel
  const handleExportExcel = async () => {
    try {
      const response = await fetch(
        `http://localhost:8100/analytics/export/excel?startDate=${dateRange[0].format('YYYY-MM-DD')}&endDate=${dateRange[1].format('YYYY-MM-DD')}&processId=${processFilter}`,
        {
          method: 'GET',
          headers: {
            'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          },
        }
      );
      
      if (!response.ok) {
        throw new Error('Failed to export Excel');
      }
      
      // Create blob from response
      const blob = await response.blob();
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `bpmn-analytics-${dateRange[0].format('YYYY-MM-DD')}-to-${dateRange[1].format('YYYY-MM-DD')}.xlsx`;
      
      // Trigger download
      document.body.appendChild(a);
      a.click();
      
      // Cleanup
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error exporting Excel:', error);
    }
  };
  
  // Sample data for charts (replace with actual data from API)
  const getTaskCompletionData = () => {
    if (!dashboardData || !dashboardData.taskCompletionTrend) {
      return [];
    }
    
    return dashboardData.taskCompletionTrend;
  };
  
  const getTaskDistributionData = () => {
    if (!dashboardData || !dashboardData.taskDistribution) {
      return [];
    }
    
    return dashboardData.taskDistribution;
  };
  
  const getProcessDurationData = () => {
    if (!dashboardData || !dashboardData.processDuration) {
      return [];
    }
    
    return dashboardData.processDuration;
  };
  
  // Chart configurations
  const taskCompletionConfig = {
    data: getTaskCompletionData(),
    xField: 'date',
    yField: 'count',
    seriesField: 'status',
    legend: { position: 'top' },
    smooth: true,
    animation: {
      appear: {
        animation: 'path-in',
        duration: 1000,
      },
    },
  };
  
  const taskDistributionConfig = {
    data: getTaskDistributionData(),
    angleField: 'value',
    colorField: 'type',
    radius: 0.8,
    label: {
      type: 'outer',
      content: '{name}: {percentage}',
    },
    interactions: [{ type: 'element-active' }],
  };
  
  const processDurationConfig = {
    data: getProcessDurationData(),
    xField: 'process',
    yField: 'duration',
    label: {
      position: 'middle',
      style: {
        fill: '#FFFFFF',
        opacity: 0.6,
      },
    },
    meta: {
      duration: {
        alias: 'Durée moyenne (heures)',
      },
    },
  };
  
  // Render loading state
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '500px' }}>
        <Spin size="large" />
      </div>
    );
  }
  
  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <Title level={3}>Tableau de Bord Analytique</Title>
        
        <div style={{ display: 'flex', gap: '12px' }}>
          <RangePicker 
            value={dateRange}
            onChange={handleDateRangeChange}
            allowClear={false}
          />
          
          <Select
            placeholder="Filtrer par processus"
            style={{ width: 200 }}
            value={processFilter}
            onChange={handleProcessChange}
          >
            <Option value="all">Tous les processus</Option>
            {dashboardData && dashboardData.availableProcesses && dashboardData.availableProcesses.map(process => (
              <Option key={process.id} value={process.id}>{process.name}</Option>
            ))}
          </Select>
          
          <Button 
            type="primary" 
            icon={<DownloadOutlined />} 
            onClick={handleExportPDF}
          >
            Exporter PDF
          </Button>
          
          <Button 
            icon={<DownloadOutlined />} 
            onClick={handleExportExcel}
          >
            Exporter Excel
          </Button>
        </div>
      </div>
      
      {/* KPI Cards */}
      <Row gutter={16} style={{ marginBottom: '24px' }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Taux de complétion"
              value={dashboardData?.kpi?.completionRate || 0}
              precision={2}
              valueStyle={{ color: '#3f8600' }}
              prefix={<CheckCircleOutlined />}
              suffix="%"
            />
            <Progress 
              percent={dashboardData?.kpi?.completionRate || 0} 
              showInfo={false} 
              status="active" 
              strokeColor="#3f8600"
            />
          </Card>
        </Col>
        
        <Col span={6}>
          <Card>
            <Statistic
              title="Temps moyen par tâche"
              value={dashboardData?.kpi?.averageTaskDuration || 0}
              precision={1}
              valueStyle={{ color: '#1890ff' }}
              prefix={<ClockCircleOutlined />}
              suffix="h"
            />
            <Text type="secondary">
              {dashboardData?.kpi?.taskDurationChange > 0 
                ? `+${dashboardData?.kpi?.taskDurationChange}% vs période précédente`
                : `${dashboardData?.kpi?.taskDurationChange}% vs période précédente`}
            </Text>
          </Card>
        </Col>
        
        <Col span={6}>
          <Card>
            <Statistic
              title="Utilisateurs actifs"
              value={dashboardData?.kpi?.activeUsers || 0}
              valueStyle={{ color: '#722ed1' }}
              prefix={<TeamOutlined />}
            />
            <Text type="secondary">
              Sur {dashboardData?.kpi?.totalUsers || 0} utilisateurs
            </Text>
          </Card>
        </Col>
        
        <Col span={6}>
          <Card>
            <Statistic
              title="Processus en cours"
              value={dashboardData?.kpi?.activeProcesses || 0}
              valueStyle={{ color: '#fa8c16' }}
              prefix={<FileOutlined />}
            />
            <Text type="secondary">
              Sur {dashboardData?.kpi?.totalProcesses || 0} processus
            </Text>
          </Card>
        </Col>
      </Row>
      
      {/* Charts */}
      <Row gutter={16} style={{ marginBottom: '24px' }}>
        <Col span={24}>
          <Card title="Tendance de complétion des tâches">
            <Line {...taskCompletionConfig} height={300} />
          </Card>
        </Col>
      </Row>
      
      <Row gutter={16}>
        <Col span={12}>
          <Card title="Distribution des types de tâches">
            <Pie {...taskDistributionConfig} height={300} />
          </Card>
        </Col>
        
        <Col span={12}>
          <Card title="Durée moyenne par processus">
            <Bar {...processDurationConfig} height={300} />
          </Card>
        </Col>
      </Row>
      
      {/* Bottleneck Analysis */}
      <Row gutter={16} style={{ marginTop: '24px' }}>
        <Col span={24}>
          <Card title="Analyse des goulots d'étranglement">
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#f5f5f5' }}>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e8e8e8' }}>Tâche</th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e8e8e8' }}>Processus</th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e8e8e8' }}>Durée moyenne</th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e8e8e8' }}>Taux de blocage</th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e8e8e8' }}>Impact</th>
                </tr>
              </thead>
              <tbody>
                {dashboardData && dashboardData.bottlenecks ? (
                  dashboardData.bottlenecks.map((item, index) => (
                    <tr key={index} style={{ borderBottom: '1px solid #e8e8e8' }}>
                      <td style={{ padding: '12px' }}>{item.taskName}</td>
                      <td style={{ padding: '12px' }}>{item.processName}</td>
                      <td style={{ padding: '12px' }}>{item.averageDuration}h</td>
                      <td style={{ padding: '12px' }}>
                        <Progress 
                          percent={item.blockageRate} 
                          size="small" 
                          status={item.blockageRate > 50 ? "exception" : "active"} 
                        />
                      </td>
                      <td style={{ padding: '12px' }}>
                        <Tag color={item.impact === 'HIGH' ? 'red' : item.impact === 'MEDIUM' ? 'orange' : 'green'}>
                          {item.impact}
                        </Tag>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} style={{ padding: '12px', textAlign: 'center' }}>
                      Aucune donnée disponible
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AnalyticsDashboard;
