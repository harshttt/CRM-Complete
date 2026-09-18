import React, { useState, useEffect } from 'react';
import { Row, Col, Card,Statistic, Progress, Table, Tag,Avatar, Timeline, Badge, Button, Space,Typography, Divider, List, Tooltip, Alert, Tabs, Radio, DatePicker, Select, Empty} from 'antd';
import {TrophyOutlined, FireOutlined, RiseOutlined, ClockCircleOutlined, CheckCircleOutlined, WarningOutlined, StarOutlined, MessageOutlined, MailOutlined, PhoneOutlined, CalendarOutlined, TeamOutlined, LineChartOutlined, HistoryOutlined, SyncOutlined, DownloadOutlined, SettingOutlined, BarChartOutlined, UserOutlined} from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { RangePicker } = DatePicker;
const { Option } = Select;

// Performance color mapping
const performanceColors = {
  'Rockstar': '#FFD700',
  'High Performer': '#52C41A',
  'Consistent': '#1890FF',
  'Needs Improvement': '#FAAD14',
  'Risk Zone': '#FF4D4F'
};

// Mock data
const mockData = {
  salesperson: {
    id: 'SP001',
    name: 'Alex Johnson',
    avatar: 'AJ',
    role: 'Senior Sales Executive',
    team: 'Enterprise Sales',
    region: 'North America'
  },
  dailyScore: {
    total: 85,
    rating: 'High Performer',
    breakdown: {
      avs: { score: 35, max: 40, progress: 88 },
      tds: { score: 24, max: null, progress: 100 },
      sls: { score: 10, max: 15, progress: 67 },
      lpes: { score: 25, max: null, progress: 100 },
      crb: { score: 5, max: null, progress: 100 },
      cqs: { score: 6, max: null, progress: 100 }
    },
    metrics: {
      calls: 8,
      emails: 12,
      messages: 15,
      meetings: 2,
      siteVisits: 1,
      tasksCompleted: 4,
      urgentTasks: 1,
      firstResponseAvg: '4 min'
    }
  },
  weeklyTrend: [
    { day: 'Mon', date: '2024-01-08', score: 78, rating: 'Consistent' },
    { day: 'Tue', date: '2024-01-09', score: 82, rating: 'High Performer' },
    { day: 'Wed', date: '2024-01-10', score: 76, rating: 'Consistent' },
    { day: 'Thu', date: '2024-01-11', score: 85, rating: 'High Performer' },
    { day: 'Today', date: '2024-01-12', score: 85, rating: 'High Performer' },
    { day: 'Sat', date: '2024-01-13', score: null, rating: null },
    { day: 'Sun', date: '2024-01-14', score: null, rating: null }
  ],
  recentActivities: [
    {
      id: 1,
      time: '09:30 AM',
      action: 'Call Logged',
      score: '+2',
      type: 'call',
      icon: <PhoneOutlined />,
      color: '#1890FF'
    },
    {
      id: 2,
      time: '10:15 AM',
      action: 'Meeting Scheduled',
      score: '+10',
      type: 'meeting',
      icon: <CalendarOutlined />,
      color: '#52C41A'
    },
    {
      id: 3,
      time: '11:45 AM',
      action: 'Task Completed On Time',
      score: '+6',
      type: 'task',
      icon: <CheckCircleOutlined />,
      color: '#FAAD14'
    },
    {
      id: 4,
      time: '01:20 PM',
      action: 'Email with Attachment',
      score: '+5',
      type: 'email',
      icon: <MailOutlined />,
      color: '#722ED1'
    },
    {
      id: 5,
      time: '02:50 PM',
      action: 'Lead Progressed to Qualified',
      score: '+15',
      type: 'lead',
      icon: <RiseOutlined />,
      color: '#13C2C2'
    },
    {
      id: 6,
      time: '03:30 PM',
      action: 'Site Visit Completed',
      score: '+12',
      type: 'visit',
      icon: <TeamOutlined />,
      color: '#EB2F96'
    }
  ],
  alerts: [
    {
      id: 1,
      type: 'warning',
      message: 'AVS daily cap (40) reached at 2:30 PM',
      description: 'Consider focusing on quality interactions',
      time: '2 hours ago'
    },
    {
      id: 2,
      type: 'success',
      message: 'Urgent task completed ahead of deadline',
      description: '+10 points added to TDS',
      time: '1 hour ago'
    },
    {
      id: 3,
      type: 'info',
      message: 'Speed-to-Lead below 5 minutes average',
      description: 'Excellent response time!',
      time: '3 hours ago'
    }
  ],
  scoringRules: [
    { action: 'Call Logged', points: '+2', category: 'AVS' },
    { action: 'WhatsApp / Message', points: '+2', category: 'AVS' },
    { action: 'Email Sent', points: '+2', category: 'AVS' },
    { action: 'Follow-up Comment', points: '+3', category: 'AVS' },
    { action: 'Task Completed On Time', points: '+6', category: 'TDS' },
    { action: 'Urgent Task Completed', points: '+10', category: 'TDS' },
    { action: 'Task Missed', points: '-10', category: 'TDS' },
    { action: 'First Response < 5 min', points: '+15', category: 'SLS' },
    { action: 'Lead Progressed', points: '+5', category: 'LPES' },
    { action: 'Meeting Scheduled', points: '+10', category: 'LPES' },
    { action: 'Site Visit', points: '+12', category: 'LPES' },
    { action: 'Closed Won', points: '+30', category: 'LPES' },
    { action: 'Closed Lost', points: '-10', category: 'LPES' },
    { action: 'Client Reply < 2 hrs', points: '+5', category: 'CRB' },
    { action: 'Call > 3 mins', points: '+4', category: 'CQS' }
  ]
};

// Metric Card Component
const MetricCard = ({ title, score, maxScore, icon, color, subtitle, progress }) => (
  <Card size="small" hoverable>
    <Row gutter={[8, 8]} align="middle">
      <Col>
        <Avatar
          size={48}
          style={{ backgroundColor: `${color}20`, color }}
          icon={icon}
        />
      </Col>
      <Col flex="auto">
        <Text type="secondary" style={{ fontSize: 12 }}>{title}</Text>
        <div>
          <Text strong style={{ fontSize: 20 }}>{score}</Text>
          {maxScore && (
            <Text type="secondary" style={{ fontSize: 12, marginLeft: 4 }}>
              /{maxScore}
            </Text>
          )}
        </div>
        <Text type="secondary" style={{ fontSize: 12 }}>{subtitle}</Text>
      </Col>
    </Row>
    {progress !== undefined && (
      <Progress
        percent={progress}
        size="small"
        strokeColor={color}
        showInfo={false}
        style={{ marginTop: 8 }}
      />
    )}
  </Card>
);

// Activity Timeline Component
const ActivityTimeline = ({ activities }) => (
  <Timeline>
    {activities?.map(activity => (
      <Timeline.Item
        key={activity.id}
        dot={<Avatar size={32} style={{ backgroundColor: activity.color }} icon={activity.icon} />}
        color="blue"
      >
        <Row justify="space-between" align="middle">
          <Col>
            <Text strong>{activity.action}</Text>
            <div>
              <Text type="secondary" style={{ fontSize: 12 }}>{activity.time}</Text>
            </div>
          </Col>
          <Col>
            <Tag
              color={activity.score.startsWith('+') ? 'success' : 'error'}
              style={{ fontWeight: 'bold' }}
            >
              {activity.score}
            </Tag>
          </Col>
        </Row>
      </Timeline.Item>
    ))}
  </Timeline>
);

// Weekly Trend Chart
const WeeklyTrendChart = ({ data }) => (
  <div style={{ padding: '20px 0' }}>
    <Row gutter={[8, 16]}>
      {data?.map((day, index) => (
        <Col key={index} flex="1" style={{ textAlign: 'center' }}>
          <div style={{ marginBottom: 8 }}>
            <Text strong>{day.day}</Text>
            {day.date && (
              <div>
                <Text type="secondary" style={{ fontSize: 10 }}>
                  {dayjs(day.date).format('MMM D')}
                </Text>
              </div>
            )}
          </div>
          {day.score !== null ? (
            <>
              <Progress
                type="circle"
                percent={(day.score / 100) * 100}
                size={60}
                strokeColor={performanceColors[day.rating] || '#1890FF'}
                format={() => (
                  <div style={{ fontSize: 12, fontWeight: 'bold' }}>
                    {day.score}
                  </div>
                )}
              />
              {day.rating && (
                <div style={{ marginTop: 4 }}>
                  <Tag color={day.rating === 'High Performer' ? 'success' : 'default'} style={{ fontSize: 10 }}>
                    {day.rating}
                  </Tag>
                </div>
              )}
            </>
          ) : (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={null}
              style={{ padding: '20px 0' }}
            />
          )}
        </Col>
      ))}
    </Row>
  </div>
);

// Main Scoreboard Component
const SalespersonScoreboard = () => {
  const [timeRange, setTimeRange] = useState('today');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(mockData);
  const [activeTab, setActiveTab] = useState('1');

  const handleRefresh = () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  const handleExport = () => {
    console.log('Exporting data...');
  };

  const getPerformanceBadge = (rating) => {
    const colorMap = {
      'Rockstar': 'gold',
      'High Performer': 'green',
      'Consistent': 'blue',
      'Needs Improvement': 'orange',
      'Risk Zone': 'red'
    };
    
    return (
      <Badge.Ribbon
        text={rating}
        color={colorMap[rating]}
        style={{ fontSize: 12 }}
      >
        <div style={{ height: 24 }}></div>
      </Badge.Ribbon>
    );
  };

  const performanceBucketsColumns = [
    {
      title: 'Performance Rating',
      dataIndex: 'rating',
      key: 'rating',
      render: (rating) => (
        <Tag color={performanceColors[rating]}>
          {rating}
        </Tag>
      )
    },
    {
      title: 'Score Range',
      dataIndex: 'range',
      key: 'range'
    },
    {
      title: 'Incentives',
      dataIndex: 'incentives',
      key: 'incentives',
      render: (incentive) => (
        <Text type={incentive ? undefined : 'secondary'}>
          {incentive || 'Standard'}
        </Text>
      )
    }
  ];

  const scoringRulesColumns = [
    {
      title: 'Action',
      dataIndex: 'action',
      key: 'action'
    },
    {
      title: 'Points',
      dataIndex: 'points',
      key: 'points',
      render: (points) => (
        <Tag color={points.startsWith('+') ? 'success' : 'error'}>
          {points}
        </Tag>
      )
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      render: (category) => (
        <Tag>{category}</Tag>
      )
    }
  ];

  const performanceBucketsData = [
    { rating: 'Rockstar', range: '≥ 90', incentives: 'Top 10% Bonus' },
    { rating: 'High Performer', range: '70–89', incentives: 'Performance Bonus' },
    { rating: 'Consistent', range: '50–69', incentives: 'Standard Commission' },
    { rating: 'Needs Improvement', range: '30–49', incentives: 'Coaching Required' },
    { rating: 'Risk Zone', range: '< 30', incentives: 'Review Required' }
  ];

  return (
    <div style={{ padding: 24, background: '#f0f2f5' }}>
      {/* Header */}
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Space direction="vertical" size="small">
            <Title level={3} style={{ margin: 0 }}>
              <BarChartOutlined /> Performance Scoreboard
            </Title>
            <Text type="secondary">Real-time tracking of sales performance metrics</Text>
          </Space>
        </Col>
        <Col>
          <Space>
            <Radio.Group value={timeRange} onChange={(e) => setTimeRange(e.target.value)}>
              <Radio.Button value="today">Today</Radio.Button>
              <Radio.Button value="week">This Week</Radio.Button>
              <Radio.Button value="month">This Month</Radio.Button>
            </Radio.Group>
            <Button icon={<SyncOutlined spin={loading} />} onClick={handleRefresh}>
              Refresh
            </Button>
            <Button icon={<DownloadOutlined />} onClick={handleExport}>
              Export
            </Button>
            <Button icon={<SettingOutlined />} type="text" />
          </Space>
        </Col>
      </Row>

      {/* User Profile Card */}
      <Card style={{ marginBottom: 24 }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Space size="large">
              <Avatar size={64} style={{ backgroundColor: '#1890FF' }}>
                {data.salesperson.avatar}
              </Avatar>
              <Space direction="vertical" size="small">
                <Space>
                  <Title level={4} style={{ margin: 0 }}>{data.salesperson.name}</Title>
                  <Tag color="blue">ID: {data.salesperson.id}</Tag>
                </Space>
                <Space>
                  <Text><UserOutlined /> {data.salesperson.role}</Text>
                  <Text><TeamOutlined /> {data.salesperson.team}</Text>
                  <Text><RiseOutlined /> {data.salesperson.region}</Text>
                </Space>
              </Space>
            </Space>
          </Col>
          <Col>
            <Space direction="vertical" align="end">
              <Text type="secondary">Last updated: {dayjs().format('h:mm A')}</Text>
              <Button type="link" size="small">
                View Full Profile
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Main Score Card with Alerts */}
      <Row gutter={[24, 24]}>
        <Col span={16}>
          <Card 
            title={
              <Space>
                <TrophyOutlined />
                <span>Daily Performance Score</span>
                {getPerformanceBadge(data.dailyScore.rating)}
              </Space>
            }
            extra={
              <Tag icon={<FireOutlined />} color="gold">
                Today: {dayjs().format('MMM D, YYYY')}
              </Tag>
            }
          >
            <Row align="middle" gutter={[48, 24]}>
              <Col span={8}>
                <div style={{ textAlign: 'center' }}>
                  <Statistic
                    title="Total Score"
                    value={data.dailyScore.total}
                    suffix="/100"
                    valueStyle={{
                      fontSize: 48,
                      color: performanceColors[data.dailyScore.rating]
                    }}
                  />
                  <Progress
                    percent={data.dailyScore.total}
                    status="active"
                    strokeColor={performanceColors[data.dailyScore.rating]}
                    style={{ width: '80%', margin: '0 auto' }}
                  />
                  <Text type="secondary" style={{ marginTop: 8, display: 'block' }}>
                    {data.dailyScore.rating} Performance
                  </Text>
                </div>
              </Col>
              <Col span={16}>
                <Row gutter={[16, 16]}>
                  <Col span={12}>
                    <MetricCard
                      title="Activity Volume"
                      score={data.dailyScore.breakdown.avs.score}
                      maxScore={data.dailyScore.breakdown.avs.max}
                      icon={<MessageOutlined />}
                      color="#1890FF"
                      subtitle="Calls: 8 | Emails: 12"
                      progress={data.dailyScore.breakdown.avs.progress}
                    />
                  </Col>
                  <Col span={12}>
                    <MetricCard
                      title="Task Discipline"
                      score={data.dailyScore.breakdown.tds.score}
                      icon={<CheckCircleOutlined />}
                      color="#52C41A"
                      subtitle="4 completed, 0 missed"
                      progress={data.dailyScore.breakdown.tds.progress}
                    />
                  </Col>
                  <Col span={12}>
                    <MetricCard
                      title="Speed-to-Lead"
                      score={data.dailyScore.breakdown.sls.score}
                      maxScore={data.dailyScore.breakdown.sls.max}
                      icon={<ClockCircleOutlined />}
                      color="#722ED1"
                      subtitle="Avg: 4 minutes"
                      progress={data.dailyScore.breakdown.sls.progress}
                    />
                  </Col>
                  <Col span={12}>
                    <MetricCard
                      title="Lead Progression"
                      score={data.dailyScore.breakdown.lpes.score}
                      icon={<RiseOutlined />}
                      color="#13C2C2"
                      subtitle="3 progressed, 1 qualified"
                      progress={data.dailyScore.breakdown.lpes.progress}
                    />
                  </Col>
                </Row>
              </Col>
            </Row>
          </Card>
        </Col>
        
        <Col span={8}>
          <Card
            title={
              <Space>
                <WarningOutlined />
                <span>System Alerts</span>
              </Space>
            }
            extra={
              <Badge count={data.alerts.length} />
            }
          >
            <List
              dataSource={data.alerts}
              renderItem={alert => (
                <List.Item>
                  <Alert
                    message={alert.message}
                    description={alert.description}
                    type={alert.type}
                    showIcon
                    style={{ width: '100%' }}
                  />
                  <Text type="secondary" style={{ fontSize: 11, marginTop: 4 }}>
                    {alert.time}
                  </Text>
                </List.Item>
              )}
            />
            <Divider />
            <Space direction="vertical" size="small">
              <Text strong>System Automation Rules:</Text>
              <Text type="secondary" style={{ fontSize: 12 }}>
                • DSS 40 for 7 days → Manager Alert
              </Text>
              <Text type="secondary" style={{ fontSize: 12 }}>
                • High AVS but low LPES → Coaching Flag
              </Text>
              <Text type="secondary" style={{ fontSize: 12 }}>
                • Top 10% DSS → Incentive Pool
              </Text>
            </Space>
          </Card>
        </Col>
      </Row>

      {/* Tabs Section */}
      <Card style={{ marginTop: 24 }}>
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab={
            <span>
              <HistoryOutlined />
              Recent Activities
            </span>
          } key="1">
            <Row gutter={[24, 24]}>
              <Col span={12}>
                <ActivityTimeline activities={data.recentActivities} />
              </Col>
              <Col span={12}>
                <Card title="Performance Metrics" size="small">
                  <Row gutter={[16, 16]}>
                    <Col span={12}>
                      <Statistic
                        title="Calls Made"
                        value={data.dailyScore.metrics.calls}
                        prefix={<PhoneOutlined />}
                      />
                    </Col>
                    <Col span={12}>
                      <Statistic
                        title="Emails Sent"
                        value={data.dailyScore.metrics.emails}
                        prefix={<MailOutlined />}
                      />
                    </Col>
                    <Col span={12}>
                      <Statistic
                        title="Meetings Scheduled"
                        value={data.dailyScore.metrics.meetings}
                        prefix={<CalendarOutlined />}
                      />
                    </Col>
                    <Col span={12}>
                      <Statistic
                        title="Site Visits"
                        value={data.dailyScore.metrics.siteVisits}
                        prefix={<TeamOutlined />}
                      />
                    </Col>
                  </Row>
                </Card>
              </Col>
            </Row>
          </TabPane>
          
          <TabPane tab={
            <span>
              <LineChartOutlined />
              Weekly Trends
            </span>
          } key="2">
            <WeeklyTrendChart data={data.weeklyTrend} />
          </TabPane>
          
          <TabPane tab={
            <span>
              <StarOutlined />
              Scoring Rules
            </span>
          } key="3">
            <Row gutter={[24, 24]}>
              <Col span={12}>
                <Card title="Performance Buckets" size="small">
                  <Table
                    dataSource={performanceBucketsData}
                    columns={performanceBucketsColumns}
                    pagination={false}
                    size="small"
                  />
                </Card>
              </Col>
              <Col span={12}>
                <Card title="Scoring Rules" size="small">
                  <Table
                    dataSource={data.scoringRules}
                    columns={scoringRulesColumns}
                    pagination={false}
                    size="small"
                    scroll={{ y: 300 }}
                  />
                </Card>
              </Col>
            </Row>
          </TabPane>
        </Tabs>
      </Card>

      {/* Footer Stats */}
      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col span={8}>
          <Card size="small">
            <Statistic
              title="Target Achievement"
              value={85}
              suffix="%"
              valueStyle={{ color: '#52C41A' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card size="small">
            <Statistic
              title="Rank in Team"
              value={2}
              suffix="/24"
              prefix={<TrophyOutlined />}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card size="small">
            <Statistic
              title="Incentive Points"
              value={450}
              prefix={<StarOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Quick Actions */}
      <Card style={{ marginTop: 24 }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Text strong>Quick Actions:</Text>
          </Col>
          <Col>
            <Space>
              <Button type="primary">Log Call</Button>
              <Button>Schedule Meeting</Button>
              <Button>Update Lead</Button>
              <Button>Create Task</Button>
            </Space>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default SalespersonScoreboard;