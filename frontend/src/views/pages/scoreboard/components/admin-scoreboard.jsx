import { useState } from 'react';
import { Row, Col, Card, Statistic, Table, Tag, Avatar, Button, Space, Typography, Select, Input, DatePicker, Tabs, Progress, Alert, List, Modal, Form, InputNumber, Flex, Divider, Badge, Switch, Tooltip, Menu, Dropdown, Skeleton, Spin } from 'antd';
import { 
  SettingOutlined, TeamOutlined, DashboardOutlined, AuditOutlined, 
  LineChartOutlined, UserAddOutlined, EditOutlined, DeleteOutlined, 
  EyeOutlined, ExportOutlined, WarningOutlined, CheckCircleOutlined, 
  FilterOutlined, SearchOutlined, SyncOutlined, ReloadOutlined,
  CrownOutlined, LockOutlined, UnlockOutlined, UserSwitchOutlined,
  DatabaseOutlined, SafetyCertificateOutlined,
  DownloadOutlined, BarChartOutlined, PercentageOutlined,
  CalendarOutlined, EnvironmentOutlined, FieldTimeOutlined, UserOutlined,
  TrophyOutlined, ClockCircleOutlined, MessageOutlined, PhoneOutlined,
  MailOutlined, RiseOutlined, StarOutlined, FireOutlined,
  ThunderboltOutlined, InfoCircleOutlined, ArrowRightOutlined,
  PlusOutlined, PlayCircleOutlined, ExclamationCircleOutlined,
  DollarOutlined, HeatMapOutlined, TableOutlined, ControlOutlined,
  MoreOutlined, EllipsisOutlined, FileTextOutlined, SendOutlined,
  SolutionOutlined, UsergroupAddOutlined, ApartmentOutlined,
  SafetyOutlined, FlagOutlined, ZoomInOutlined, ZoomOutOutlined,
  PartitionOutlined, ClusterOutlined, DeploymentUnitOutlined,
  ContactsOutlined, IdcardOutlined, ManOutlined, WomanOutlined,
  BuildOutlined, ToolOutlined, ApiOutlined, KeyOutlined,
  BellOutlined
} from '@ant-design/icons';
import ManagerProfileCard from './managerScoreboard/ManagerProfileCard';
import { usePerformanceList } from '../../../../api-hooks/performance';

const { Title, Text } = Typography;

const AdminScoreboard = () => {
  const [activeTab, setActiveTab] = useState('system-overview');
  const [showFilters, setShowFilters] = useState(false);
  const [showSystemConfigModal, setShowSystemConfigModal] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [selectedManager, setSelectedManager] = useState(null);

  const {data, isFetching:loading, isError, error, refetch:handleRefresh, refetchWithQuery} = usePerformanceList({qData:{}});

  const adminPerformanceData = data ? data?.data[0] : {}; 

  console.log("data---------->", adminPerformanceData);

  // Enhanced team data with detailed metrics
  const teamsData = [
    { 
      id: 'T001', 
      name: 'Enterprise Sales', 
      region: 'North America', 
      manager: 'Sarah Chen', 
      size: 8, 
      avgScore: 76, 
      activeMembers: 8, 
      leads: 320,
      monthlyGrowth: '+12%',
      performanceDistribution: {
        rockstars: 2,
        highPerformers: 3,
        consistent: 2,
        needsImprovement: 1,
        riskZone: 0
      },
      trends: {
        score: '+5%',
        revenue: '+12%',
        leads: '+8%'
      },
      executives: [
        { id: 'U002', name: 'Emma Wilson', score: 92, status: 'Active' },
        { id: 'U008', name: 'Michael Brown', score: 81, status: 'Active' },
        { id: 'U009', name: 'Rachel Green', score: 78, status: 'Active' },
        { id: 'U010', name: 'Tom Smith', score: 85, status: 'Active' }
      ]
    },
    { 
      id: 'T002', 
      name: 'SMB Sales', 
      region: 'North America', 
      manager: 'Alex Johnson', 
      size: 6, 
      avgScore: 68, 
      activeMembers: 6, 
      leads: 280,
      monthlyGrowth: '+8%',
      performanceDistribution: {
        rockstars: 0,
        highPerformers: 2,
        consistent: 3,
        needsImprovement: 1,
        riskZone: 0
      },
      trends: {
        score: '+3%',
        revenue: '+8%',
        leads: '+5%'
      },
      executives: [
        { id: 'U011', name: 'John Davis', score: 72, status: 'Active' },
        { id: 'U012', name: 'Sarah Miller', score: 65, status: 'Active' },
        { id: 'U013', name: 'Chris Wilson', score: 70, status: 'Active' }
      ]
    },
    { 
      id: 'T003', 
      name: 'EMEA Sales', 
      region: 'Europe', 
      manager: 'Lisa Wong', 
      size: 7, 
      avgScore: 72, 
      activeMembers: 7, 
      leads: 245,
      monthlyGrowth: '+10%',
      performanceDistribution: {
        rockstars: 1,
        highPerformers: 3,
        consistent: 2,
        needsImprovement: 1,
        riskZone: 0
      },
      trends: {
        score: '+4%',
        revenue: '+10%',
        leads: '+7%'
      },
      executives: [
        { id: 'U014', name: 'Maria Garcia', score: 85, status: 'Active' },
        { id: 'U015', name: 'David Wilson', score: 78, status: 'Active' },
        { id: 'U016', name: 'Anna Schmidt', score: 80, status: 'Active' }
      ]
    },
    { 
      id: 'T004', 
      name: 'APAC Sales', 
      region: 'Asia Pacific', 
      manager: 'David Lee', 
      size: 5, 
      avgScore: 65, 
      activeMembers: 5, 
      leads: 195,
      monthlyGrowth: '+6%',
      performanceDistribution: {
        rockstars: 0,
        highPerformers: 2,
        consistent: 2,
        needsImprovement: 1,
        riskZone: 0
      },
      trends: {
        score: '+2%',
        revenue: '+6%',
        leads: '+4%'
      },
      executives: [
        { id: 'U017', name: 'Kenji Tanaka', score: 68, status: 'Active' },
        { id: 'U018', name: 'Wei Chen', score: 72, status: 'Active' },
        { id: 'U019', name: 'Priya Sharma', score: 62, status: 'Active' }
      ]
    },
    { 
      id: 'T005', 
      name: 'Government Sales', 
      region: 'North America', 
      manager: 'James Wilson', 
      size: 4, 
      avgScore: 78, 
      activeMembers: 4, 
      leads: 150,
      monthlyGrowth: '+15%',
      performanceDistribution: {
        rockstars: 1,
        highPerformers: 2,
        consistent: 1,
        needsImprovement: 0,
        riskZone: 0
      },
      trends: {
        score: '+6%',
        revenue: '+15%',
        leads: '+9%'
      },
      executives: [
        { id: 'U020', name: 'Robert Johnson', score: 88, status: 'Active' },
        { id: 'U021', name: 'Jennifer Lee', score: 84, status: 'Active' },
        { id: 'U022', name: 'Michael Wang', score: 80, status: 'Active' }
      ]
    },
    { 
      id: 'T006', 
      name: 'System Admin', 
      region: 'Global', 
      manager: 'Robert Kim', 
      size: 3, 
      avgScore: 95, 
      activeMembers: 3, 
      leads: 90,
      monthlyGrowth: '+2%',
      performanceDistribution: {
        rockstars: 3,
        highPerformers: 0,
        consistent: 0,
        needsImprovement: 0,
        riskZone: 0
      },
      trends: {
        score: '+1%',
        revenue: '0%',
        leads: '+2%'
      },
      executives: [
        { id: 'U023', name: 'Admin One', score: 92, status: 'Active' },
        { id: 'U024', name: 'Admin Two', score: 90, status: 'Active' }
      ]
    }
  ];

  // Stat Pill Component
  const StatPill = ({ icon, label, value, accent, suffix, change, tooltip }) => (
    <Tooltip title={tooltip}>
      <Card 
        size="small" 
        style={{ 
          borderRadius: 12,
          background: '#fff',
          border: `1px solid ${accent}20`,
          boxShadow: '0 2px 8px rgba(15,23,42,0.06)',
          height: '100%'
        }}
        bodyStyle={{ padding: '16px' }}
      >
        <Space direction="vertical" size={4} style={{ width: '100%' }}>
          <Space size={8}>
            <div style={{ color: accent, fontSize: 20 }}>{icon}</div>
            <Text type="secondary" style={{ fontSize: 12 }}>{label}</Text>
          </Space>
          <Title level={3} style={{ margin: 0, color: accent }}>
            {value}
            {suffix && <Text style={{ fontSize: 14, color: accent }}>{suffix}</Text>}
          </Title>
          {change && (
            <Tag color={change.startsWith('+') ? 'success' : 'error'}  style={{ alignSelf: 'flex-start', fontSize: 11, borderRadius: 999 }}>
              {change}
            </Tag>
          )}
        </Space>
      </Card>
    </Tooltip>
  );

  // Score Progress Component
  const ScoreProgress = ({ label, score, max, progress, color, icon }) => (
    <Card 
      size="small" 
      style={{ 
        borderRadius: 8,
        border: `1px solid ${color}20`,
        background: '#fff',
        height: '100%'
      }}
      bodyStyle={{ padding: 12 }}
    >
      <Space direction="vertical" size={8} style={{ width: '100%' }}>
        <Flex align="center" justify="space-between">
          <Space size={6}>
            <Avatar size={28} style={{ background: `${color}15`, color }}>
              {icon}
            </Avatar>
            <Space direction="vertical" size={0}>
              <Text strong style={{ fontSize: 11, color: '#666' }}>{label}</Text>
              <Text strong style={{ fontSize: 14, color }}>{score}/{max}</Text>
            </Space>
          </Space>
          <Tag color={progress >= 90 ? 'success' : progress >= 70 ? 'warning' : 'error'}>
            {progress}%
          </Tag>
        </Flex>
        
        <Progress
          percent={progress}
          strokeColor={color}
          trailColor={`${color}15`}
          showInfo={false}
          size="small"
        />
      </Space>
    </Card>
  );

  // Manager Details Modal
  const ManagerDetailsModal = () => (
    <Modal
      title={<Space> <UserOutlined /> <span>Manager Details: {selectedManager?.manager?.name}</span> </Space> }
      open={!!selectedManager}
      onCancel={() => setSelectedManager(null)}
      width={1000}
      footer={[<Button key="close" onClick={() => setSelectedManager(null)}>Close</Button>]}
    >
      {selectedManager && (
        <Space direction="vertical" style={{ width: '100%' }} size={24}>
          {/* Manager Profile */}
          <Card style={{ borderRadius: 8, background: '#fafafa' }}>
            <Row gutter={[24, 24]}>
              <Col span={6}>
                <Avatar size={80} style={{background: `linear-gradient(135deg, ${selectedManager?.avatarColor}, ${selectedManager?.avatarColor}99)`, color: 'white', fontSize: 32, fontWeight: 'bold'}}>
                  {selectedManager?.manager?.name?.charAt(0)}
                </Avatar>
              </Col>
              <Col span={18}>
                <Space direction="vertical" size={8} style={{ width: '100%' }}>
                  <Flex align="center" justify="space-between">
                    <Title level={4} style={{ margin: 0 }}>{selectedManager?.manager?.name}</Title>
                    <Tag color="purple" style={{ fontSize: 12 }}> Manager </Tag>
                  </Flex>
                  <Text type="secondary">{selectedManager?.manager?.email}</Text>
                  <Row gutter={[16, 8]}>
                    <Col span={6}>
                      <Statistic title="Performance" value={selectedManager?.summary?.averageScore} suffix="/100" valueStyle={{ fontSize: 20, color: '#1890FF' }}/>
                    </Col>
                    <Col span={6}>
                      <Statistic title="Executives" value={selectedManager?.summary?.totalSalespersons || 0} valueStyle={{ fontSize: 20, color: '#52C41A' }} />
                    </Col>
                  </Row>
                </Space>
              </Col>
            </Row>
          </Card>

          {/* Performance Comparison */}
          <Card title="Team Performance Comparison">
            <Table
              columns={[
                { title: 'Executive', dataIndex: 'name', key: 'name' },
                { title: 'Email', dataIndex: 'email', key: 'email' },
                { title: 'Branch', dataIndex: 'branch', key: 'branch' },
                { title: 'Region', dataIndex: 'region', key: 'region' },
                { title: 'Bucket', dataIndex: 'bucket', key: 'bucket' },
                { title: 'Score', dataIndex: 'totalScore', key: 'score' },
                { title: 'Avs', dataIndex: 'breakdown', key: 'avs', render:(_, record)=> (<Text>{record?.breakdown?.avs}</Text>) },
                { title: 'Cqs', dataIndex: 'breakdown', key: 'cqs', render:(_, record)=> (<Text>{record?.breakdown?.cqs}</Text>) },
                { title: 'Crb', dataIndex: 'breakdown', key: 'crb', render:(_, record)=> (<Text>{record?.breakdown?.crb}</Text>) },
                { title: 'Lpes', dataIndex: 'breakdown', key: 'lpes', render:(_, record)=> (<Text>{record?.breakdown?.lpes}</Text>) },
                { title: 'Sls', dataIndex: 'breakdown', key: 'sls', render:(_, record)=> (<Text>{record?.breakdown?.sls}</Text>) },
                { title: 'Tds', dataIndex: 'breakdown', key: 'tds', render:(_, record)=> (<Text>{record?.breakdown?.tds}</Text>) },
              ]}
              dataSource={selectedManager?.salespersons}
              pagination={false}
              size="small"
            />
          </Card>
        </Space>
      )}
    </Modal>
  );

  return (
    <div>
      <Card 
       size="small"
        bordered={false}
        style={{
          borderRadius: 24,
          maxWidth: "100%",
          margin: "0 auto 24px",
          boxShadow: "0px 18px 45px rgba(15, 23, 42, 0.12)",
          border: "1px solid rgba(255, 255, 255, 0.9)",
          backdropFilter: 'blur(16px)',
          background: "linear-gradient(145deg, rgba(255,255,255,0.97), rgba(245,248,255,0.99))",
        }}
        styles={{header: { borderBottom: 'none', padding: '18px 22px 6px' }, body: { padding: '8px 22px 18px' }}}
        title={
          <Space align="center">
            <div style={{ width: 44, height: 44, borderRadius: "999px", background: "conic-gradient(from 210deg,#2f54eb,#9254de,#40a9ff,#2f54eb)", padding: 2 }}>
              <Flex justify="center" align="center" 
                style={{ width: "100%", height: "100%", borderRadius: "999px", background: "radial-gradient(circle at 30% 20%, #f0f5ff, #d6e4ff)" }}
              >
                <CrownOutlined style={{ color: "#1d39c4" }} />
              </Flex>
            </div>
            <Space direction="vertical" size={0}>
              <Title level={4} style={{ margin: 0 }}>Adminstration Scoreboard</Title>
              <Text type="secondary" style={{ fontSize: 12 }}>Performance Monitoring</Text>
            </Space>
          </Space>
        }
        extra={
          <Space align="center">
             <Select 
              value={'week'}
              onChange={val => refetchWithQuery(val)}
              style={{ width: 140, borderRadius: 8 }}
              suffixIcon={<CalendarOutlined />}
              options={[{label:'Today', value:'today'}, {label:'This Week', value:'week'}, {label:'This Month', value:'month'}]}
            />
            <Tooltip title="Refresh data">
              <Button icon={<ReloadOutlined />} size="middle"
                style={{ borderRadius: 999, boxShadow: "0 4px 10px rgba(15,23,42,0.06)" }}
                onClick={handleRefresh} loading={loading}
              />
            </Tooltip>
          </Space>
        }
      >
        <Spin spinning={loading}>
         <ManagerProfileCard {...{data:adminPerformanceData}} />

      {/* Manager & Executive Stats */}
      {/* <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <StatPill 
            icon={<UserOutlined />} 
            label="Total Managers" 
            value={managers.length}
            accent="#722ED1"
            tooltip="Number of managers in the system"
          />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <StatPill 
            icon={<TeamOutlined />} 
            label="Total Executives" 
            value={usersData.filter(u => u.role === 'Sales Executive').length}
            accent="#1890FF"
            tooltip="Number of sales executives"
          />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <StatPill 
            icon={<ApartmentOutlined />} 
            label="Avg. Team Size" 
            value={Math.round(usersData.filter(u => u.role === 'Sales Executive').length / managers.length)}
            accent="#13C2C2"
            tooltip="Average executives per manager"
          />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <StatPill 
            icon={<TrophyOutlined />} 
            label="Avg. Manager Score" 
            value={Math.round(managers.reduce((acc, m) => acc + m.performanceScore, 0) / managers.length)}
            suffix="/100"
            change="+6%"
            accent="#FFD700"
            tooltip="Average performance score of all managers"
          />
        </Col>
      </Row> */}

      {/* Main Tabs */}
      <Row gutter={[16, 16]}>
        {/* Team Performance Card */}
        <Col xs={24} lg={24}>
          <Card 
            title={
              <Space>
                <TeamOutlined />
                <span>Manager Performance</span>
                <Badge count={adminPerformanceData?.managers?.length} style={{backgroundColor: '#1890FF', boxShadow: '0 0 0 1px #d9d9d9'}} />
              </Space>
            }
            style={{borderRadius: 12, border: '1px solid #f0f0f0', height: '100%', boxShadow: '0 2px 8px rgba(0,0,0,0.04)'}}
          >
            <Space direction="vertical" style={{ width: '100%' }} size={16}>
              {/* Manager Performance List */}
              <div>
              <Space direction="vertical" style={{ width: '100%' }} size={8}>
              {(adminPerformanceData?.managers?.map((item, idx) => (
                  <div key={idx}
                    style={{padding: 12, borderRadius: 8, background: 'white', border: '1px solid #f0f0f0', transition: 'all 0.2s', cursor: 'pointer',}}
                    onClick={() => setSelectedManager(item)}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#fafafa';
                      e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'white';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <Flex align="center" justify="space-between">
                      <Space>
                        <Avatar size={36} style={{ background: `linear-gradient(135deg, ${item?.avatarColor}, ${item?.avatarColor}99)`, color: 'white', }}>{item?.manager?.name?.charAt(0)}</Avatar>
                        <Flex vertical gap={1}>
                          <Text strong style={{ fontSize: 13 }}>{item?.manager?.name}</Text>
                          <Text style={{ fontSize: 10 }}>{item?.manager?.email}</Text>
                          <Text type="secondary" style={{ fontSize: 11 }}>{item?.summary?.totalSalespersons || 0} executives</Text>
                        </Flex>
                      </Space>

                      <Space>
                        <Space direction="vertical" align="end" size={0}>
                          <Text strong style={{ fontSize: 16 }}>{item?.summary?.averageScore}</Text>
                          <Badge
                            count={<span style={{color: item?.trend?.startsWith('+') ? '#52C41A' : '#FF4D4F', fontSize: 9,}}>{item?.summary?.bucket}</span>}
                            style={{backgroundColor: item?.trend?.startsWith('+') ? '#f6ffed' : '#fff1f0'}}
                          />
                        </Space>
                        <Button type="link" size="small" icon={<ArrowRightOutlined />} />
                      </Space>
                    </Flex>
                  </div>
                )))}
              </Space>
              </div>
            </Space>
          </Card>
        </Col>
       </Row>
        </Spin>


       {/* Manager Details Modal */}
       {selectedManager && <ManagerDetailsModal />}
      </Card>
    </div>
  );
};

export default AdminScoreboard;