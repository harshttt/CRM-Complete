import React, { useState } from 'react';
import { Row, Col, Card, Statistic, Tag, Avatar, Button, Space, Typography, Progress, Alert, List, Tooltip, Badge, Input, Tabs, Modal, Form, Select, DatePicker, Flex, Divider } from 'antd';
import {
  UserOutlined, TrophyOutlined, PhoneOutlined, MailOutlined, CalendarOutlined, 
  CheckCircleOutlined, RiseOutlined, ClockCircleOutlined, DashboardOutlined,
  LineChartOutlined, PlusOutlined, MessageOutlined, SyncOutlined, BellOutlined,
  ArrowUpOutlined, FireOutlined, StarOutlined, SettingOutlined,
  HistoryOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;
const { TextArea } = Input;

const SalespersonScoreboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [timeRange, setTimeRange] = useState('today');
  const [showLogModal, setShowLogModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [loading, setLoading] = useState(false);

  // Mock data
  const salespersonData = {
    name: 'Alex Johnson',
    avatar: 'AJ',
    role: 'Senior Sales Executive',
    today: {
      totalScore: 85,
      rating: 'High Performer',
      rank: 2,
      outOf: 24,
      previousScore: 78,
      
      breakdown: {
        AVS: { score: 35, max: 40, progress: 88, label: 'Activity' },
        TDS: { score: 24, progress: 100, label: 'Task Discipline' },
        SLS: { score: 10, max: 15, progress: 67, label: 'Speed' },
        LPES: { score: 25, progress: 100, label: 'Lead Progress' },
        CRB: { score: 21, progress: 100, label: 'Client Responsiveness Progress' },
        CQS: { score: 19, progress: 100, label: 'Conversion Quality Score' },
      },
      
      metrics: {
        calls: { value: 8, trend: 12 },
        emails: { value: 12, trend: 8 },
        meetings: { value: 2, trend: 25 },
        tasks: { value: 4, trend: 15 },
        leads: { value: 3, trend: 20 },
        response: { value: '4 min', trend: -5 }
      }
    },
    
    recentActivities: [
      { id: 1, time: '09:30', action: 'Call Logged', score: '+2', type: 'call', client: 'TechCorp' },
      { id: 2, time: '10:15', action: 'Meeting Scheduled', score: '+10', type: 'meeting', client: 'Global Systems' },
      { id: 3, time: '11:45', action: 'Task Completed', score: '+6', type: 'task', client: 'Innovate Co.' },
      // { id: 4, time: '13:20', action: 'Email Sent', score: '+5', type: 'email', client: 'Mega Corp' },
      { id: 5, time: '14:50', action: 'Lead Progressed', score: '+15', type: 'lead', client: 'TechCorp' },
    ],
    
    pendingTasks: [
      { id: 1, title: 'Follow up with TechCorp', due: 'Today, 4:00 PM', priority: 'high', points: 6 },
      { id: 2, title: 'Send quote to Global Systems', due: 'Tomorrow, 10:00 AM', priority: 'medium', points: 6 },
      { id: 3, title: 'Update CRM records', due: 'Today, 6:00 PM', priority: 'low', points: 1 },
    ],
    
    alerts: [
      { id: 1, type: 'warning', message: 'AVS daily cap almost reached', time: '30 min ago' },
      { id: 2, type: 'success', message: 'Incentive pool eligible', time: '2 hours ago' },
      { id: 3, type: 'info', message: 'New lead assigned', time: '3 hours ago' },
    ]
  };

  // Colors
  const colors = {
    primary: '#1890FF',
    success: '#52C41A',
    warning: '#FAAD14',
    error: '#FF4D4F',
    purple: '#722ED1',
    cyan: '#13C2C2',
    gold: '#FAAD14'
  };

  const ratingColors = {
    'High Performer': colors.success,
    'Consistent': colors.primary,
    'Needs Improvement': colors.warning,
    'Risk Zone': colors.error
  };

  const activityColors = {
    'call': colors.primary,
    'email': colors.purple,
    'meeting': colors.success,
    'task': colors.gold,
    'lead': colors.cyan
  };

  const quickActions = [
    { label: 'Log Call', icon: <PhoneOutlined />, points: '+2', color: colors.primary },
    { label: 'Send Email', icon: <MailOutlined />, points: '+2', color: colors.purple },
    { label: 'Schedule Meeting', icon: <CalendarOutlined />, points: '+10', color: colors.success },
    { label: 'Complete Task', icon: <CheckCircleOutlined />, points: '+6', color: colors.gold },
  ];

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 800);
  };

  // Enhanced Metric Card
  const MetricCard = ({ icon, label, value, color, trend, suffix }) => (
    <Card 
      size="small" 
      style={{ 
        borderRadius: 12,
        background: 'white',
        border: 'none',
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        transition: 'all 0.3s',
        height: '100%'
      }}
      hoverable
      bodyStyle={{ padding: 16 }}
    >
      <Space direction="vertical" size={8} style={{ width: '100%' }}>
        <Flex align="center" justify="space-between">
          <Avatar
            size={40}
            style={{ 
              background: `linear-gradient(135deg, ${color}15, ${color}05)`,
              color: color,
              border: `1px solid ${color}20`
            }}
            icon={icon}
          />
          {trend && (
            <Badge 
              count={
                <span style={{ color: trend > 0 ? colors.success : colors.error, fontSize: 11 }}>
                  {trend > 0 ? '+' : ''}{trend}%
                </span>
              }
              style={{ 
                backgroundColor: trend > 0 ? `${colors.success}15` : `${colors.error}15`,
                border: `1px solid ${trend > 0 ? colors.success : colors.error}20`
              }}
            />
          )}
        </Flex>
        <Space direction="vertical" size={2}>
          <Text type="secondary" style={{ fontSize: 12 }}>{label}</Text>
          <Title level={3} style={{ margin: 0, color }}>
            {value}
            {suffix && <Text style={{ fontSize: 14, color, marginLeft: 2 }}>{suffix}</Text>}
          </Title>
        </Space>
      </Space>
    </Card>
  );

  // Score Breakdown Card
  const ScoreCard = ({ score, max, progress, label, color, icon }) => (
    <Card 
      size="small" 
      style={{ 
        borderRadius: 12,
        background: 'white',
        border: 'none',
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        height: '100%'
      }}
      bodyStyle={{ padding: 16 }}
    >
      <Space direction="vertical" size={12} style={{ width: '100%' }}>
        <Flex align="center" justify="space-between">
          <Space size={8}>
            <div style={{ color, fontSize: 18 }}>{icon}</div>
            <Text strong style={{ fontSize: 12, color }}>{label}</Text>
          </Space>
          <Text strong style={{ fontSize: 18, color }}>{score}{max && `/${max}`}</Text>
        </Flex>
        <Progress
          percent={progress}
          strokeColor={color}
          trailColor={`${color}15`}
          showInfo={false}
          size="small"
        />
        <Text type="secondary" style={{ fontSize: 11 }}>
          {progress >= 90 ? 'Excellent' : progress >= 70 ? 'Good' : 'Needs attention'}
        </Text>
      </Space>
    </Card>
  );

  return (
    <div style={{ 
      background: 'linear-gradient(135deg, #667eea0d 0%, #764ba20d 100%)',
      minHeight: '100vh',
      padding: 24
    }}>
      
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <Flex align="center" justify="space-between" wrap="wrap" gap={16}>
          <Space direction="vertical" size={4}>
            <Title level={2} style={{ margin: 0, color: '#1e293b' }}>Performance Dashboard</Title>
            <Text type="secondary" style={{ fontSize: 14 }}>Track your sales performance and scores</Text>
          </Space>
          <Space>
            <Select value={timeRange} onChange={setTimeRange} style={{ width: 140, borderRadius: 8 }} suffixIcon={<CalendarOutlined />}
              options={[{label:'Today', value:'today'},{label:'This Week', value:'week'},{label:'This Month', value:'month'}]}
            />
            <Button icon={<SyncOutlined spin={loading} />} style={{ borderRadius: 8 }} onClick={handleRefresh}>Refresh</Button>
          </Space>
        </Flex>
      </div>

      {/* Profile Card */}
      <Card 
        style={{ 
          marginBottom: 24,
          borderRadius: 16,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          border: 'none',
          boxShadow: '0 8px 32px rgba(102, 126, 234, 0.2)'
        }}
      >
        <Flex align="center" justify="space-between" wrap="wrap" gap={24}>
          <Space size={20}>
            <Avatar 
              size={64}
              style={{ 
                background: 'rgba(255,255,255,0.2)',
                backdropFilter: 'blur(10px)',
                border: '2px solid rgba(255,255,255,0.3)',
                color: 'white'
              }}
            >
              {salespersonData.avatar}
            </Avatar>
            <Space direction="vertical" size={4}>
              <Flex align="center" gap={12} wrap="wrap">
                <Title level={3} style={{ margin: 0, color: 'white' }}>{salespersonData.name}</Title>
                <Badge 
                  count={`Rank ${salespersonData.today.rank}`}
                  style={{ 
                    background: 'rgba(255,255,255,0.2)',
                    backdropFilter: 'blur(10px)',
                    fontWeight: 'bold'
                  }}
                />
              </Flex>
              <Text style={{ color: 'rgba(255,255,255,0.9)' }}>{salespersonData.role}</Text>
              <Space size={16}>
                <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12 }}>
                  <UserOutlined style={{ marginRight: 4 }} />
                  {salespersonData.today.outOf} team members
                </Text>
              </Space>
            </Space>
          </Space>
          <Tag
            style={{ 
              background: 'rgba(255,255,255,0.2)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.3)',
              color: 'white',
              fontSize: 14,
              padding: '8px 16px',
              borderRadius: 20,
              fontWeight: 'bold'
            }}
          >
            {salespersonData.today.rating}
          </Tag>
        </Flex>
      </Card>

      {/* Main Score Section */}
      <Card 
        style={{ 
          marginBottom: 24,
          borderRadius: 16,
          background: 'white',
          border: 'none',
          boxShadow: '0 4px 20px rgba(0,0,0,0.06)'
        }}
      >
        <Row gutter={[32, 32]} align="middle">
          <Col xs={24} md={8}>
            <div style={{ textAlign: 'center', padding: 16 }}>
              <Space direction="vertical" size={20}>
                <div>
                  <Text type="secondary" style={{ fontSize: 14 }}>Today's Score</Text>
                  <Statistic
                    value={salespersonData.today.totalScore}
                    suffix="/100"
                    valueStyle={{ 
                      fontSize: 64,
                      fontWeight: 'bold',
                      color: ratingColors[salespersonData.today.rating],
                      lineHeight: 1
                    }}
                  />
                  <Flex align="center" justify="center" gap={8} style={{ marginTop: 8 }}>
                    <ArrowUpOutlined style={{ color: colors.success, fontSize: 12 }} />
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      +{salespersonData.today.totalScore - salespersonData.today.previousScore} from yesterday
                    </Text>
                  </Flex>
                </div>
                <Progress
                  percent={salespersonData.today.totalScore}
                  strokeColor={{
                    '0%': ratingColors[salespersonData.today.rating],
                    '100%': ratingColors[salespersonData.today.rating],
                  }}
                  trailColor="#f0f0f0"
                  strokeWidth={10}
                  style={{ maxWidth: 280 }}
                />
              </Space>
            </div>
          </Col>
          <Col xs={24} md={16}>
            <Row gutter={[16, 16]}>
              <Col xs={12} md={8}>
                <MetricCard
                  icon={<PhoneOutlined />}
                  label="Calls Made"
                  value={salespersonData.today.metrics.calls.value}
                  color={colors.primary}
                  trend={salespersonData.today.metrics.calls.trend}
                />
              </Col>
              <Col xs={12} md={8}>
                <MetricCard
                  icon={<MailOutlined />}
                  label="Emails Sent"
                  value={salespersonData.today.metrics.emails.value}
                  color={colors.purple}
                  trend={salespersonData.today.metrics.emails.trend}
                />
              </Col>
              <Col xs={12} md={8}>
                <MetricCard
                  icon={<CalendarOutlined />}
                  label="Meetings"
                  value={salespersonData.today.metrics.meetings.value}
                  color={colors.success}
                  trend={salespersonData.today.metrics.meetings.trend}
                />
              </Col>
              <Col xs={12} md={8}>
                <MetricCard
                  icon={<CheckCircleOutlined />}
                  label="Tasks Completed"
                  value={salespersonData.today.metrics.tasks.value}
                  color={colors.gold}
                  trend={salespersonData.today.metrics.tasks.trend}
                />
              </Col>
              <Col xs={12} md={8}>
                <MetricCard
                  icon={<RiseOutlined />}
                  label="Leads Progressed"
                  value={salespersonData.today.metrics.leads.value}
                  color={colors.cyan}
                  trend={salespersonData.today.metrics.leads.trend}
                />
              </Col>
              <Col xs={12} md={8}>
                <MetricCard
                  icon={<ClockCircleOutlined />}
                  label="Avg Response Time"
                  value={salespersonData.today.metrics.response.value}
                  color={colors.purple}
                  trend={salespersonData.today.metrics.response.trend}
                  suffix=""
                />
              </Col>
            </Row>
          </Col>
        </Row>
      </Card>

      {/* Score Breakdown */}
      <Card 
        title={<Space> <TrophyOutlined /> <span>Score Breakdown</span></Space>}
        style={{ 
          marginBottom: 24,
          borderRadius: 16,
          background: 'white',
          border: 'none',
          boxShadow: '0 4px 20px rgba(0,0,0,0.06)'
        }}
      >
        <Row gutter={[16, 16]}>
          {Object.entries(salespersonData?.today?.breakdown).map(([key, data], index) => {
            const icons = [<MessageOutlined />, <CheckCircleOutlined />, <ClockCircleOutlined />, <RiseOutlined />];
            const colorsArr = [colors.primary, colors.success, colors.purple, colors.cyan];
            
            return (
              <Col xs={24} sm={12} md={6} key={key}>
                <ScoreCard score={data.score} max={data.max} progress={data.progress} label={data.label} color={colorsArr[index]} icon={icons[index]}/>
              </Col>
            );
          })}
        </Row>
      </Card>

      {/* Log Actions Modal */}
      <Modal title={<Space> <PlusOutlined /> <span>Log Action</span></Space>}
        open={showLogModal}
        onCancel={() => setShowLogModal(false)}
        footer={[
          <Button key="cancel" onClick={() => setShowLogModal(false)} style={{ borderRadius: 8 }}> Cancel </Button>,
          <Button key="submit" type="primary" onClick={() => setShowLogModal(false)} style={{ borderRadius: 8 }}>Log Action</Button>
        ]}
        styles={{body: { paddingTop: 24 }, header: { borderBottom: '1px solid #f0f0f0' }}}
      >
        <Form layout="vertical">
          <Form.Item label="Action Type">
            <Select placeholder="Select action type" style={{ borderRadius: 8 }} options={[{label:'Call (+2 points)', value:'call'},{label:'Email (+2 points)', value:'email'},{label:'Meeting (+10 points)', value:'meeting'},{label:'Task (+6 points)', value:'task'}]} />
          </Form.Item>
          <Form.Item label="Description">
            <TextArea rows={3} placeholder="Brief description..." style={{ borderRadius: 8 }} />
          </Form.Item>
        </Form>
      </Modal>

      {/* Add Task Modal */}
      <Modal
        title={
          <Space>
            <PlusOutlined />
            <span>Add Task</span>
          </Space>
        }
        open={showTaskModal}
        onCancel={() => setShowTaskModal(false)}
        footer={[
          <Button key="cancel" onClick={() => setShowTaskModal(false)} style={{ borderRadius: 8 }}>Cancel</Button>,
          <Button key="submit" type="primary" onClick={() => setShowTaskModal(false)}style={{ borderRadius: 8 }}>Add Task</Button>
        ]}
        styles={{ 
          body: { paddingTop: 24 },
          header: { borderBottom: '1px solid #f0f0f0' }
        }}
      >
        <Form layout="vertical">
          <Form.Item label="Task Title">
            <Input placeholder="Enter task title" style={{ borderRadius: 8 }} />
          </Form.Item>
          <Form.Item label="Due Date">
            <DatePicker style={{ width: '100%', borderRadius: 8 }} />
          </Form.Item>
          <Form.Item label="Priority">
            <Select placeholder="Select priority" style={{ borderRadius: 8 }} options={[{label:'High', value:'high'},{label:'Medium', value:'medium'},{label:'Low', value:'low'}]} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default SalespersonScoreboard;