import React, { useState } from "react";
import {Card,Row,Col,Progress,Tag,Typography,Select,Space,Tooltip,Badge,Statistic,Avatar,List,Button,Grid,Divider,Tabs,Table,
  Modal, Form, Input,DatePicker, Alert, Flex, Radio, Timeline, Tree, Collapse} from "antd";
import {CrownOutlined, WarningOutlined, TrophyOutlined, ArrowUpOutlined,ArrowDownOutlined, FireOutlined, UserOutlined, TeamOutlined,
  DashboardOutlined, StarOutlined, RiseOutlined,InfoCircleOutlined, DownloadOutlined, PhoneOutlined, MailOutlined, CalendarOutlined,
  CheckCircleOutlined,ThunderboltOutlined,ShoppingCartOutlined,ClockCircleOutlined,PlusOutlined,BellOutlined,LineChartOutlined,
  TableOutlined, ExclamationCircleOutlined, UserAddOutlined, SyncOutlined, BarChartOutlined, PieChartOutlined, HeatMapOutlined,PercentageOutlined, EyeOutlined,
  EnvironmentOutlined, FieldTimeOutlined, DollarOutlined, DollarCircleOutlined, SettingOutlined, ControlOutlined, ApartmentOutlined,
  GlobalOutlined, BankOutlined, PartitionOutlined, AreaChartOutlined, AppstoreOutlined, DeploymentUnitOutlined, AuditOutlined,
  CompassOutlined,  CaretDownOutlined, CaretRightOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;
const { useBreakpoint } = Grid;
const { TextArea } = Input;
const { Panel } = Collapse;

// Missing icons (placeholder components)
const SnowOutlined = () => <span>❄️</span>;
const SleepOutlined = () => <span>💤</span>;

/* ---------------- ADMIN DASHBOARD DATA ---------------- */

const adminDashboardData = {
  // Overall organization metrics
  organizationMetrics: {
    totalManagers: 14,
    totalExecutives: 186,
    activeLeads: 2.4,
    totalRevenue: "₹148 Cr",
    avgPerformanceScore: 72,
    overallConversion: "28%",
    activeDeals: 342,
    weeklyGrowth: "+8%",
    monthlyGrowth: "+22%"
  },

  // Managers with their teams and executives
  managers: [
    {
      id: 101,
      name: "Emma Wilson",
      team: "Team A",
      executiveCount: 8,
      avgScore: 88,
      trend: "+18%",
      status: "exceeding",
      leads: 86,
      conversion: "38%",
      revenue: "₹8.4 Cr",
      
      // Executives under this manager
      executives: [
        { 
          id: 1001, 
          name: "John Doe", 
          score: 92, 
          rating: "Rockstar", 
          leads: 15, 
          conversion: "42%", 
          revenue: "₹2.1 Cr",
          dealsClosed: 8,
          avgDealSize: "₹26.25L",
          responseTime: "2.4 hrs",
          followUpRate: "95%",
          tenure: "2.4 years",
          contact: { email: "john@example.com", phone: "+91 9876543210" }
        },
        { 
          id: 1002, 
          name: "Jane Smith", 
          score: 85, 
          rating: "High Performer", 
          leads: 12, 
          conversion: "35%", 
          revenue: "₹1.8 Cr",
          dealsClosed: 6,
          avgDealSize: "₹30L",
          responseTime: "3.1 hrs",
          followUpRate: "92%",
          tenure: "1.8 years",
          contact: { email: "jane@example.com", phone: "+91 9876543211" }
        },
        { 
          id: 1003, 
          name: "Bob Johnson", 
          score: 78, 
          rating: "Consistent", 
          leads: 10, 
          conversion: "30%", 
          revenue: "₹1.5 Cr",
          dealsClosed: 5,
          avgDealSize: "₹30L",
          responseTime: "4.2 hrs",
          followUpRate: "88%",
          tenure: "3.2 years",
          contact: { email: "bob@example.com", phone: "+91 9876543212" }
        },
        { 
          id: 1004, 
          name: "Alice Brown", 
          score: 82, 
          rating: "High Performer", 
          leads: 11, 
          conversion: "33%", 
          revenue: "₹1.6 Cr",
          dealsClosed: 6,
          avgDealSize: "₹26.67L",
          responseTime: "2.8 hrs",
          followUpRate: "94%",
          tenure: "2.1 years",
          contact: { email: "alice@example.com", phone: "+91 9876543213" }
        },
        { 
          id: 1005, 
          name: "Charlie Davis", 
          score: 75, 
          rating: "Consistent", 
          leads: 9, 
          conversion: "28%", 
          revenue: "₹1.4 Cr",
          dealsClosed: 4,
          avgDealSize: "₹35L",
          responseTime: "5.1 hrs",
          followUpRate: "85%",
          tenure: "1.5 years",
          contact: { email: "charlie@example.com", phone: "+91 9876543214" }
        }
      ]
    },
    {
      id: 102,
      name: "Rahul Sharma",
      team: "Team B",
      executiveCount: 7,
      avgScore: 75,
      trend: "+8%",
      status: "meeting",
      leads: 72,
      conversion: "32%",
      revenue: "₹6.2 Cr",
      
      executives: [
        { 
          id: 1006, 
          name: "Eva Williams", 
          score: 80, 
          rating: "High Performer", 
          leads: 13, 
          conversion: "34%", 
          revenue: "₹1.9 Cr",
          dealsClosed: 7,
          avgDealSize: "₹27.14L",
          responseTime: "2.9 hrs",
          followUpRate: "93%",
          tenure: "2.8 years",
          contact: { email: "eva@example.com", phone: "+91 9876543215" }
        },
        { 
          id: 1007, 
          name: "Frank Miller", 
          score: 72, 
          rating: "Consistent", 
          leads: 10, 
          conversion: "30%", 
          revenue: "₹1.5 Cr",
          dealsClosed: 5,
          avgDealSize: "₹30L",
          responseTime: "4.5 hrs",
          followUpRate: "87%",
          tenure: "2.3 years",
          contact: { email: "frank@example.com", phone: "+91 9876543216" }
        },
        { 
          id: 1008, 
          name: "Grace Wilson", 
          score: 68, 
          rating: "Needs Improvement", 
          leads: 8, 
          conversion: "25%", 
          revenue: "₹1.2 Cr",
          dealsClosed: 3,
          avgDealSize: "₹40L",
          responseTime: "6.8 hrs",
          followUpRate: "82%",
          tenure: "1.2 years",
          contact: { email: "grace@example.com", phone: "+91 9876543217" }
        }
      ]
    },
    {
      id: 103,
      name: "Sneha Reddy",
      team: "Team C",
      executiveCount: 9,
      avgScore: 76,
      trend: "+8%",
      status: "meeting",
      leads: 92,
      conversion: "30%",
      revenue: "₹7.1 Cr",
      
      executives: [
        { 
          id: 1009, 
          name: "Henry Taylor", 
          score: 82, 
          rating: "High Performer", 
          leads: 14, 
          conversion: "36%", 
          revenue: "₹2.1 Cr",
          dealsClosed: 8,
          avgDealSize: "₹26.25L",
          responseTime: "2.3 hrs",
          followUpRate: "96%",
          tenure: "3.5 years",
          contact: { email: "henry@example.com", phone: "+91 9876543218" }
        },
        { 
          id: 1010, 
          name: "Ivy Anderson", 
          score: 74, 
          rating: "Consistent", 
          leads: 11, 
          conversion: "31%", 
          revenue: "₹1.7 Cr",
          dealsClosed: 6,
          avgDealSize: "₹28.33L",
          responseTime: "3.8 hrs",
          followUpRate: "89%",
          tenure: "2.6 years",
          contact: { email: "ivy@example.com", phone: "+91 9876543219" }
        }
      ]
    },
    {
      id: 104,
      name: "Vikram Patel",
      team: "Team D",
      executiveCount: 8,
      avgScore: 72,
      trend: "+5%",
      status: "meeting",
      leads: 78,
      conversion: "29%",
      revenue: "₹5.8 Cr",
      
      executives: [
        { 
          id: 1011, 
          name: "Jack Martin", 
          score: 78, 
          rating: "Consistent", 
          leads: 12, 
          conversion: "32%", 
          revenue: "₹1.9 Cr",
          dealsClosed: 6,
          avgDealSize: "₹31.67L",
          responseTime: "3.5 hrs",
          followUpRate: "90%",
          tenure: "2.9 years",
          contact: { email: "jack@example.com", phone: "+91 9876543220" }
        },
        { 
          id: 1012, 
          name: "Katherine Lee", 
          score: 70, 
          rating: "Consistent", 
          leads: 10, 
          conversion: "28%", 
          revenue: "₹1.5 Cr",
          dealsClosed: 5,
          avgDealSize: "₹30L",
          responseTime: "4.9 hrs",
          followUpRate: "86%",
          tenure: "2.0 years",
          contact: { email: "katherine@example.com", phone: "+91 9876543221" }
        }
      ]
    },
    {
      id: 105,
      name: "Alex Johnson",
      team: "Team A (South)",
      executiveCount: 6,
      avgScore: 82,
      trend: "+12%",
      status: "exceeding",
      leads: 72,
      conversion: "35%",
      revenue: "₹6.8 Cr",
      
      executives: [
        { 
          id: 1013, 
          name: "Alex Chen", 
          score: 84, 
          rating: "High Performer", 
          leads: 11, 
          conversion: "33%", 
          revenue: "₹1.7 Cr",
          dealsClosed: 6,
          avgDealSize: "₹28.33L",
          responseTime: "2.5 hrs",
          followUpRate: "94%",
          tenure: "3.1 years",
          contact: { email: "alex.chen@example.com", phone: "+91 9876543222" }
        }
      ]
    },
    {
      id: 106,
      name: "Priya Nair",
      team: "Team B (South)",
      executiveCount: 8,
      avgScore: 72,
      trend: "+5%",
      status: "meeting",
      leads: 68,
      conversion: "30%",
      revenue: "₹5.2 Cr",
      
      executives: []
    },
    {
      id: 107,
      name: "Rohan Mehta",
      team: "Team C (South)",
      executiveCount: 10,
      avgScore: 68,
      trend: "+3%",
      status: "meeting",
      leads: 62,
      conversion: "28%",
      revenue: "₹4.5 Cr",
      
      executives: []
    },
    {
      id: 108,
      name: "Anjali Sharma",
      team: "Team A (East)",
      executiveCount: 8,
      avgScore: 72,
      trend: "+8%",
      status: "meeting",
      leads: 65,
      conversion: "31%",
      revenue: "₹5.0 Cr",
      
      executives: []
    },
    {
      id: 109,
      name: "Sanjay Kumar",
      team: "Team B (East)",
      executiveCount: 8,
      avgScore: 64,
      trend: "+2%",
      status: "below",
      leads: 55,
      conversion: "24%",
      revenue: "₹4.2 Cr",
      
      executives: []
    },
    {
      id: 110,
      name: "Lisa Wang",
      team: "Team A (West)",
      executiveCount: 10,
      avgScore: 65,
      trend: "-2%",
      status: "below",
      leads: 70,
      conversion: "26%",
      revenue: "₹5.5 Cr",
      
      executives: []
    },
    {
      id: 111,
      name: "David Lee",
      team: "Team B (West)",
      executiveCount: 9,
      avgScore: 60,
      trend: "-5%",
      status: "below",
      leads: 58,
      conversion: "23%",
      revenue: "₹4.2 Cr",
      
      executives: []
    },
    {
      id: 112,
      name: "Mike Brown Jr",
      team: "Team C (West)",
      executiveCount: 9,
      avgScore: 61,
      trend: "-2%",
      status: "below",
      leads: 62,
      conversion: "24%",
      revenue: "₹4.5 Cr",
      
      executives: []
    },
    {
      id: 113,
      name: "Rahul Verma",
      team: "Team A (Central)",
      executiveCount: 7,
      avgScore: 79,
      trend: "+22%",
      status: "exceeding",
      leads: 68,
      conversion: "33%",
      revenue: "₹5.2 Cr",
      
      executives: []
    },
    {
      id: 114,
      name: "Neha Gupta",
      team: "Team B (Central)",
      executiveCount: 13,
      avgScore: 65,
      trend: "+8%",
      status: "meeting",
      leads: 55,
      conversion: "26%",
      revenue: "₹4.2 Cr",
      
      executives: []
    }
  ],

  // Lead performance metrics
  leadPerformance: {
    totalLeads: 1640,
    avgLeadScore: 68,
    scoreTrend: "+8%",
    distribution: {
      "Sales Ready": { count: 384, percentage: 23, color: "#52C41A" },
      "High Intent": { count: 492, percentage: 30, color: "#1890FF" },
      "Warm": { count: 410, percentage: 25, color: "#FAAD14" },
      "Cold": { count: 246, percentage: 15, color: "#FF7A45" },
      "Dormant": { count: 108, percentage: 7, color: "#8C8C8C" }
    },
    
    sourcePerformance: [
      { source: "Walk Ins", count: 280, avgScore: 85, conversion: "42%", revenue: "₹28 Cr", color: "#52C41A" },
      { source: "Referral", count: 328, avgScore: 82, conversion: "45%", revenue: "₹32 Cr", color: "#722ED1" },
      { source: "Phone Inquiry", count: 246, avgScore: 75, conversion: "38%", revenue: "₹24 Cr", color: "#1890FF" },
      { source: "Property Portal", count: 492, avgScore: 68, conversion: "32%", revenue: "₹38 Cr", color: "#2F54EB" },
      { source: "Website", count: 164, avgScore: 58, conversion: "28%", revenue: "₹13 Cr", color: "#EB2F96" }
    ],
    
    stageMetrics: {
      current: {
        "New": 328,
        "Contacted": 410,
        "Interested": 328,
        "Qualified": 246,
        "Negotiation": 164,
        "Payment": 82
      },
      conversionRates: {
        "New → Contacted": "85%",
        "Contacted → Interested": "68%",
        "Interested → Qualified": "45%",
        "Qualified → Negotiation": "38%",
        "Negotiation → Payment": "25%",
        "Payment → Closed Won": "90%"
      }
    },
    
    scoringEffectiveness: {
      accuracy: 89,
      conversionPrediction: 82,
      hotLeadAccuracy: 91,
      falsePositives: 11,
      averageDaysToConvert: 26
    }
  }
};

/* ---------------- COMPONENTS ---------------- */

const MetricCard = ({ icon, label, value, color, trend, suffix, tooltip, size = "default" }) => {
  const isLarge = size === "large";
  
  return (
    <Tooltip title={tooltip}>
      <Card 
        size="small" 
        style={{ 
          borderRadius: 12,
          border: '1px solid #f0f0f0',
          background: '#fff',
          height: '100%',
          cursor: 'pointer'
        }}
        bodyStyle={{ padding: isLarge ? 20 : 16 }}
        hoverable
      >
        <Space direction="vertical" size={isLarge ? 12 : 8} style={{ width: '100%' }}>
          <Flex align="center" justify="space-between">
            <Avatar size={isLarge ? 44 : 36} style={{ background: `${color}15`, color }}>{icon}</Avatar>
            {trend && (
              <Badge 
                count={
                  <Text style={{ fontSize: 11,color: trend > 0 ? '#52C41A' : '#FF4D4F'}}>
                    {trend > 0 ? '+' : ''}{trend}
                  </Text>
                }
                style={{ 
                  backgroundColor: trend > 0 ? '#f6ffed' : '#fff1f0',
                  border: `1px solid ${trend > 0 ? '#b7eb8f' : '#ffa39e'}`
                }}
              />
            )}
          </Flex>
          
          <Space direction="vertical" size={2}>
            <Text type="secondary" style={{ fontSize: isLarge ? 13 : 12 }}>{label}</Text>
            <Flex align="baseline" gap={2}>
              <Text strong style={{ fontSize: isLarge ? 28 : 20, color }}>{value}</Text>
              {suffix && <Text style={{ fontSize: isLarge ? 14 : 12, color }}>{suffix}</Text>}
            </Flex>
          </Space>
        </Space>
      </Card>
    </Tooltip>
  );
};

const ManagerCard = ({ manager, onClick }) => {
  const statusColors = {
    'exceeding': '#52C41A',
    'meeting': '#1890FF',
    'below': '#FAAD14'
  };
  
  return (
    <Card
      hoverable
      onClick={() => onClick(manager)}
      style={{ 
        borderRadius: 12,
        border: `2px solid ${statusColors[manager.status]}`,
        background: `${statusColors[manager.status]}08`,
        height: '100%'
      }}
      bodyStyle={{ padding: 16 }}
    >
      <Space direction="vertical" size={12} style={{ width: '100%' }}>
        <Flex align="center" justify="space-between">
          <Space direction="vertical" size={2}>
            <Flex align="center" gap={8}>
              <Avatar size={40} style={{ background: statusColors[manager.status] }}>{manager.name.charAt(0)}</Avatar>
              <div>
                <Text strong style={{ fontSize: 16 }}>{manager.name}</Text>
                <Text type="secondary" style={{ fontSize: 11 }}>{manager.team}</Text>
              </div>
            </Flex>
          </Space>
          <Badge
            count={manager.avgScore}
            style={{ 
              backgroundColor: statusColors[manager.status],
              fontWeight: 'bold',
              fontSize: 14
            }}
          />
        </Flex>
        
        <Progress
          percent={manager.avgScore}
          strokeColor={statusColors[manager.status]}
          trailColor={`${statusColors[manager.status]}20`}
          showInfo={false}
        />
        
        <Row gutter={[8, 8]}>
          <Col span={12}>
            <Space direction="vertical" size={2}>
              <Text type="secondary" style={{ fontSize: 10 }}>Executives</Text>
              <Text strong style={{ fontSize: 14 }}>{manager.executiveCount}</Text>
            </Space>
          </Col>
          <Col span={12}>
            <Space direction="vertical" size={2}>
              <Text type="secondary" style={{ fontSize: 10 }}>Leads</Text>
              <Text strong style={{ fontSize: 14 }}>{manager.leads}</Text>
            </Space>
          </Col>
          <Col span={12}>
            <Space direction="vertical" size={2}>
              <Text type="secondary" style={{ fontSize: 10 }}>Conversion</Text>
              <Text strong style={{ fontSize: 14, color: '#52C41A' }}>{manager.conversion}</Text>
            </Space>
          </Col>
          <Col span={12}>
            <Space direction="vertical" size={2}>
              <Text type="secondary" style={{ fontSize: 10 }}>Revenue</Text>
              <Text strong style={{ fontSize: 14 }}>{manager.revenue}</Text>
            </Space>
          </Col>
        </Row>
        
        <Divider style={{ margin: '8px 0' }} />
        
        <Flex justify="space-between" align="center">
          <Tag color={manager.status === 'exceeding' ? 'success' : manager.status === 'meeting' ? 'blue' : 'warning'}>
            {manager.status === 'exceeding' ? 'Exceeding' : manager.status === 'meeting' ? 'Meeting' : 'Below Target'}
          </Tag>
          <Text strong style={{ color: manager.trend.startsWith('+') ? '#52C41A' : '#FF4D4F',fontSize: 12}}>
            {manager.trend}
          </Text>
        </Flex>
      </Space>
    </Card>
  );
};

const ExecutiveCard = ({ executive, onClick }) => {
  const ratingColors = {
    "Rockstar": "#FFD700",
    "High Performer": "#52C41A",
    "Consistent": "#1890FF",
    "Needs Improvement": "#FAAD14",
    "Risk Zone": "#FF4D4F"
  };
  
  return (
    <Card
      size="small"
      hoverable
      onClick={() => onClick(executive)}
      style={{ 
        borderRadius: 8,
        border: `1px solid ${ratingColors[executive.rating]}30`,
        background: '#fff',
        marginBottom: 8
      }}
      bodyStyle={{ padding: 12 }}
    >
      <Flex align="center" justify="space-between">
        <Space size={8}>
          <Avatar size={32} style={{ 
            background: ratingColors[executive.rating],
            color: executive.rating === 'Rockstar' ? '#000' : '#fff'
          }}>
            {executive.name.charAt(0)}
          </Avatar>
          <Space direction="vertical" size={2}>
            <Text strong style={{ fontSize: 13 }}>{executive.name}</Text>
            <Tag color={ratingColors[executive.rating]} style={{ fontSize: 9, padding: '0 6px' }}>{executive.rating}</Tag>
          </Space>
        </Space>
        
        <Space direction="vertical" align="end" size={2}>
          <Text strong style={{ fontSize: 16, color: ratingColors[executive.rating] }}>{executive.score}</Text>
          <Text type="secondary" style={{ fontSize: 10 }}>/100</Text>
        </Space>
      </Flex>
      
      <Divider style={{ margin: '8px 0' }} />
      
      <Row gutter={[8, 8]}>
        <Col span={12}>
          <Space direction="vertical" size={2} align="center">
            <Text type="secondary" style={{ fontSize: 9 }}>Leads</Text>
            <Text strong style={{ fontSize: 11 }}>{executive.leads}</Text>
          </Space>
        </Col>
        <Col span={12}>
          <Space direction="vertical" size={2} align="center">
            <Text type="secondary" style={{ fontSize: 9 }}>Conversion</Text>
            <Text strong style={{ fontSize: 11, color: '#52C41A' }}>{executive.conversion}</Text>
          </Space>
        </Col>
      </Row>
    </Card>
  );
};

const ScoreBucketCard = ({ bucket }) => (
  <Card
    style={{ 
      borderRadius: 8,
      border: `2px solid ${bucket.color}`,
      background: `${bucket.color}08`,
      height: '100%',
      textAlign: 'center'
    }}
    bodyStyle={{ padding: 12 }}
  >
    <Space direction="vertical" align="center" size={8} style={{ width: '100%' }}>
      <Avatar size={36} style={{ background: bucket.color }}>
        {bucket.label === 'Sales Ready' ? <ThunderboltOutlined /> :
         bucket.label === 'High Intent' ? <RiseOutlined /> :
         bucket.label === 'Warm' ? <FireOutlined /> :
         bucket.label === 'Cold' ? <SnowOutlined /> : <SleepOutlined />}
      </Avatar>
      
      <Text strong style={{ fontSize: 14, color: bucket.color }}>{bucket.label}</Text>
      
      <Text strong style={{ fontSize: 20 }}>{bucket.count}</Text>
      
      <Text type="secondary" style={{ fontSize: 11 }}>{bucket.percentage}% of leads</Text>
      
      <Progress
        percent={bucket.percentage}
        strokeColor={bucket.color}
        trailColor={`${bucket.color}30`}
        showInfo={false}
        size="small"
      />
    </Space>
  </Card>
);

const SourcePerformanceCard = ({ source }) => (
  <Card
    size="small"
    style={{ 
      borderRadius: 8,
      border: `1px solid ${source.color}30`,
      background: '#fff',
      height: '100%'
    }}
    bodyStyle={{ padding: 12 }}
  >
    <Space direction="vertical" size={8} style={{ width: '100%' }}>
      <Flex align="center" justify="space-between">
        <Text strong style={{ fontSize: 12 }}>{source.source}</Text>
        <Badge count={source.avgScore} style={{  backgroundColor: source.color, fontSize: 11}} />
      </Flex>
      
      <Progress
        percent={parseInt(source.conversion)}
        strokeColor={source.color}
        trailColor={`${source.color}20`}
        showInfo={false}
        size="small"
      />
      
      <Flex justify="space-between" align="center">
        <Text type="secondary" style={{ fontSize: 10 }}>Conversion</Text>
        <Text strong style={{ fontSize: 12, color: source.color }}>{source.conversion}</Text>
      </Flex>
      
      <Divider style={{ margin: '4px 0' }} />
      
      <Flex justify="space-between">
        <Text type="secondary" style={{ fontSize: 9 }}>Leads</Text>
        <Text strong style={{ fontSize: 11 }}>{source.count}</Text>
      </Flex>
    </Space>
  </Card>
);

/* ---------------- COMBINED TEAM PERFORMANCE COMPONENT ---------------- */

const CombinedTeamPerformance = () => {
  const [viewMode, setViewMode] = useState('managers'); // 'managers' or 'executives'
  const [performanceFilter, setPerformanceFilter] = useState('all');
  const [expandedManagers, setExpandedManagers] = useState([]);
  const [selectedManager, setSelectedManager] = useState(null);
  const [selectedExecutive, setSelectedExecutive] = useState(null);
  
  // Extract top executives from all managers
  const allExecutives = adminDashboardData.managers.flatMap(manager => 
    (manager.executives || []).map(exec => ({
      ...exec,
      managerName: manager.name,
      managerTeam: manager.team
    }))
  );
  
  // Sort executives by score to get top performers
  const topExecutives = [...allExecutives]
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);
  
  // Filter managers based on performance
  const filteredManagers = adminDashboardData.managers.filter(manager => {
    if (performanceFilter === 'all') return true;
    if (performanceFilter === 'exceeding') return manager.status === 'exceeding';
    if (performanceFilter === 'meeting') return manager.status === 'meeting';
    if (performanceFilter === 'below') return manager.status === 'below';
    return true;
  });

  const handleManagerClick = (manager) => {
    setSelectedManager(manager);
  };

  const handleExecutiveClick = (executive) => {
    setSelectedExecutive(executive);
  };

  const toggleManagerExpand = (managerId) => {
    if (expandedManagers.includes(managerId)) {
      setExpandedManagers(expandedManagers.filter(id => id !== managerId));
    } else {
      setExpandedManagers([...expandedManagers, managerId]);
    }
  };

  const ManagerDetailModal = () => (
    <Modal
      title={
        <Space>
          <Avatar size={32} style={{ 
            background: selectedManager?.status === 'exceeding' ? '#52C41A' : selectedManager?.status === 'meeting' ? '#1890FF' : '#FAAD14'
          }}>
            {selectedManager?.name?.charAt(0)}
          </Avatar>
          <span>{selectedManager?.name} - Team Details</span>
        </Space>
      }
      open={!!selectedManager}
      onCancel={() => setSelectedManager(null)}
      width={800}
      footer={[
        <Button key="close" onClick={() => setSelectedManager(null)}>
          Close
        </Button>
      ]}
    >
      {selectedManager && (
        <Space direction="vertical" size={24} style={{ width: '100%' }}>
          <Row gutter={16}>
            <Col span={8}>
              <Card size="small">
                <Statistic
                  title="Team Score"
                  value={selectedManager.avgScore}
                  suffix="/100"
                  valueStyle={{ fontSize: 32, color: selectedManager.status === 'exceeding' ? '#52C41A' : '#1890FF' }}
                />
              </Card>
            </Col>
            <Col span={8}>
              <Card size="small">
                <Statistic
                  title="Executives"
                  value={selectedManager.executiveCount}
                  valueStyle={{ fontSize: 32 }}
                />
              </Card>
            </Col>
            <Col span={8}>
              <Card size="small">
                <Statistic
                  title="Conversion Rate"
                  value={parseInt(selectedManager.conversion)}
                  suffix="%"
                  valueStyle={{ fontSize: 32, color: '#52C41A' }}
                />
              </Card>
            </Col>
          </Row>
          
          <Divider />
          
          {selectedManager.executives && selectedManager.executives.length > 0 ? (
            <div>
              <Title level={5}>Executives in this Team</Title>
              <Row gutter={[16, 16]}>
                {selectedManager.executives.map(executive => (
                  <Col xs={24} sm={12} md={8} key={executive.id}>
                    <ExecutiveCard executive={executive} onClick={handleExecutiveClick} />
                  </Col>
                ))}
              </Row>
            </div>
          ) : ( <Alert message="No detailed executive data available for this team" type="info"showIcon />)}
        </Space>
      )}
    </Modal>
  );

  const ExecutiveDetailModal = () => (
    <Modal
      title={
        <Space>
          <Avatar size={32}>{selectedExecutive?.name?.charAt(0)}</Avatar>
          <span>{selectedExecutive?.name} - Performance Details</span>
        </Space>
      }
      open={!!selectedExecutive}
      onCancel={() => setSelectedExecutive(null)}
      width={800}
      footer={[
        <Button key="close" onClick={() => setSelectedExecutive(null)}>Close</Button>
      ]}
    >
      {selectedExecutive && (
        <Space direction="vertical" size={24} style={{ width: '100%' }}>
          <Row gutter={16}>
            <Col span={12}>
              <Card size="small">
                <Statistic
                  title="Performance Score"
                  value={selectedExecutive.score}
                  suffix="/100"
                  valueStyle={{ fontSize: 32, color: selectedExecutive.rating === 'Rockstar' ? '#FFD700' : '#52C41A' }}
                />
              </Card>
            </Col>
            <Col span={12}>
              <Card size="small">
                <Statistic title="Leads Assigned" value={selectedExecutive.leads} valueStyle={{ fontSize: 32 }}/>
              </Card>
            </Col>
          </Row>
          
          <Divider />
          
          <Row gutter={16}>
            <Col span={8}>
              <Card size="small">
                <Statistic title="Deals Closed" value={selectedExecutive.dealsClosed || 0} valueStyle={{ fontSize: 24 }}/>
              </Card>
            </Col>
            <Col span={8}>
              <Card size="small">
                <Statistic title="Avg Deal Size" value={selectedExecutive.avgDealSize || '₹0'} valueStyle={{ fontSize: 24, color: '#722ED1' }}/>
              </Card>
            </Col>
            <Col span={8}>
              <Card size="small">
                <Statistic title="Conversion Rate" value={parseInt(selectedExecutive.conversion)} suffix="%" valueStyle={{ fontSize: 24, color: '#52C41A' }}/>
              </Card>
            </Col>
          </Row>
          
          <Divider />
          
          <Row gutter={16}>
            <Col span={12}>
              <Card size="small" title="Performance Metrics">
                <Space direction="vertical" size={12} style={{ width: '100%' }}>
                  <div>
                    <Flex justify="space-between" style={{ marginBottom: 4 }}>
                      <Text>Response Time</Text>
                      <Text strong>{selectedExecutive.responseTime || 'N/A'}</Text>
                    </Flex>
                    <Progress 
                      percent={selectedExecutive.responseTime ? 100 - (parseFloat(selectedExecutive.responseTime) * 10) : 0} 
                      strokeColor="#52C41A"
                      trailColor="#f0f0f0"
                      showInfo={false}
                    />
                  </div>
                  <div>
                    <Flex justify="space-between" style={{ marginBottom: 4 }}>
                      <Text>Follow-up Rate</Text>
                      <Text strong>{selectedExecutive.followUpRate || 'N/A'}</Text>
                    </Flex>
                    <Progress 
                      percent={selectedExecutive.followUpRate ? parseInt(selectedExecutive.followUpRate) : 0} 
                      strokeColor="#1890FF"
                      trailColor="#f0f0f0"
                      showInfo={false}
                    />
                  </div>
                </Space>
              </Card>
            </Col>
            <Col span={12}>
              <Card size="small" title="Contact Information">
                {selectedExecutive.contact ? (
                  <Space direction="vertical" size={12} style={{ width: '100%' }}>
                    <Flex align="center" gap={8}>
                      <MailOutlined />
                      <Text>{selectedExecutive.contact.email}</Text>
                    </Flex>
                    <Flex align="center" gap={8}>
                      <PhoneOutlined />
                      <Text>{selectedExecutive.contact.phone}</Text>
                    </Flex>
                    {selectedExecutive.tenure && (
                      <Flex align="center" gap={8}>
                        <FieldTimeOutlined />
                        <Text>Tenure: {selectedExecutive.tenure}</Text>
                      </Flex>
                    )}
                  </Space>
                ) : (
                  <Text type="secondary">No contact information available</Text>
                )}
              </Card>
            </Col>
          </Row>
        </Space>
      )}
    </Modal>
  );

  return (
    <Space direction="vertical" size={24} style={{ width: '100%' }}>
      {/* View Mode Selector */}
      <Card 
        size="small"
        style={{ borderRadius: 12 }}
        bodyStyle={{ padding: '12px 16px' }}
      >
        <Flex justify="space-between" align="center">
          <Space>
            <Title level={5} style={{ margin: 0 }}>
              <TeamOutlined /> Team Performance Overview
            </Title>
            <Tag color="blue">{filteredManagers.length} Managers</Tag>
            <Tag color="green">{topExecutives.length} Top Executives</Tag>
          </Space>
          
          <Space>
            <Radio.Group 
              value={viewMode} 
              onChange={(e) => setViewMode(e.target.value)}
              buttonStyle="solid"
            >
              <Radio.Button value="managers">
                <TeamOutlined /> Managers View
              </Radio.Button>
              <Radio.Button value="executives">
                <UserOutlined /> Executives View
              </Radio.Button>
            </Radio.Group>
            
            <Select 
              value={performanceFilter}
              onChange={setPerformanceFilter}
              style={{ width: 180 }}
              suffixIcon={<ControlOutlined />}
            >
              <Option value="all">All Performance</Option>
              <Option value="exceeding">Exceeding Targets</Option>
              <Option value="meeting">Meeting Targets</Option>
              <Option value="below">Below Targets</Option>
            </Select>
          </Space>
        </Flex>
      </Card>

      {/* Managers Grid */}
      {viewMode === 'managers' && (
        <>
          <Card 
            title={
              <Space>
                <ApartmentOutlined />
                <span>Managers ({filteredManagers.length})</span>
              </Space>
            }
            style={{ borderRadius: 12 }}
          >
            <Row gutter={[16, 16]}>
              {filteredManagers.map((manager) => (
                <Col xs={24} sm={12} md={8} lg={6} key={manager.id}>
                  <ManagerCard manager={manager} onClick={handleManagerClick} />
                </Col>
              ))}
            </Row>
          </Card>
        </>
      )}

      {/* Top Executives Section */}
      {viewMode === 'executives' && (
        <>
          <Card 
            title={
              <Space>
                <TrophyOutlined />
                <span>Top Performing Executives ({topExecutives.length})</span>
              </Space>
            }
            style={{ borderRadius: 12 }}
          >
            <Row gutter={[16, 16]}>
              {topExecutives.map((executive) => (
                <Col xs={24} sm={12} md={8} lg={6} key={executive.id}>
                  <Card
                    hoverable
                    onClick={() => handleExecutiveClick(executive)}
                    style={{ 
                      borderRadius: 12,
                      border: `2px solid ${executive.rating === 'Rockstar' ? '#FFD700' : '#52C41A'}30`,
                      background: '#fff',
                      height: '100%'
                    }}
                    bodyStyle={{ padding: 16 }}
                  >
                    <Space direction="vertical" align="center" size={12} style={{ width: '100%', textAlign: 'center' }}>
                      <Avatar size={48} style={{ 
                        background: executive.rating === 'Rockstar' ? '#FFD700' : '#52C41A',
                        color: executive.rating === 'Rockstar' ? '#000' : '#fff'
                      }}>
                        {executive.name.charAt(0)}
                      </Avatar>
                      
                      <Space direction="vertical" size={4}>
                        <Text strong style={{ fontSize: 16 }}>{executive.name}</Text>
                        <Text type="secondary" style={{ fontSize: 11 }}> {executive.managerName} ({executive.managerTeam})</Text>
                      </Space>
                      
                      <Tag color={executive.rating === 'Rockstar' ? 'gold' : 'green'}>{executive.rating}</Tag>
                      
                      <Space direction="vertical" size={2}>
                        <Text strong style={{ fontSize: 24, color: executive.rating === 'Rockstar' ? '#FFD700' : '#52C41A' }}>{executive.score}</Text>
                        <Text type="secondary" style={{ fontSize: 12 }}>/100</Text>
                      </Space>
                      
                      <Row gutter={[8, 8]} style={{ width: '100%' }}>
                        <Col span={12}>
                          <Space direction="vertical" size={2}>
                            <Text type="secondary" style={{ fontSize: 10 }}>Leads</Text>
                            <Text strong style={{ fontSize: 14 }}>{executive.leads}</Text>
                          </Space>
                        </Col>
                        <Col span={12}>
                          <Space direction="vertical" size={2}>
                            <Text type="secondary" style={{ fontSize: 10 }}>Revenue</Text>
                            <Text strong style={{ fontSize: 14 }}>{executive.revenue}</Text>
                          </Space>
                        </Col>
                      </Row>
                    </Space>
                  </Card>
                </Col>
              ))}
            </Row>
          </Card>

          {/* Executive Performance Details Table */}
          <Card 
            title={
              <Space>
                <TableOutlined />
                <span>Executive Performance Details</span>
              </Space>
            }
            style={{ borderRadius: 12 }}
          >
            <Table
              dataSource={topExecutives}
              columns={[
                {
                  title: 'Executive',
                  dataIndex: 'name',
                  key: 'name',
                  render: (text, record) => (
                    <Space>
                      <Avatar size={32} style={{ 
                        background: record.rating === 'Rockstar' ? '#FFD700' : record.rating === 'High Performer' ? '#52C41A' : '#1890FF'
                      }}>
                        {text.charAt(0)}
                      </Avatar>
                      <Space direction="vertical" size={0}>
                        <Text strong>{text}</Text>
                        <Text type="secondary" style={{ fontSize: 11 }}>{record.managerName}</Text>
                      </Space>
                    </Space>
                  )
                },
                {
                  title: 'Rating',
                  dataIndex: 'rating',
                  key: 'rating',
                  render: (rating) => ( <Tag color={rating === 'Rockstar' ? 'gold' : rating === 'High Performer' ? 'green' : 'blue'}>{rating}</Tag> )
                },
                {
                  title: 'Score',
                  dataIndex: 'score',
                  key: 'score',
                  render: (score) => ( <Text strong style={{ fontSize: 16 }}>{score}</Text> )
                },
                {
                  title: 'Leads',
                  dataIndex: 'leads',
                  key: 'leads',
                },
                {
                  title: 'Conversion',
                  dataIndex: 'conversion',
                  key: 'conversion',
                  render: (conversion) => (<Text strong style={{ color: '#52C41A' }}>{conversion}</Text>)
                },
                {
                  title: 'Revenue',
                  dataIndex: 'revenue',
                  key: 'revenue',
                },
                {
                  title: 'Deals Closed',
                  dataIndex: 'dealsClosed',
                  key: 'dealsClosed',
                },
                {
                  title: 'Response Time',
                  dataIndex: 'responseTime',
                  key: 'responseTime',
                },
                {
                  title: 'Actions',
                  key: 'actions',
                  render: (_, record) => ( <Button size="small" icon={<EyeOutlined />} onClick={() => handleExecutiveClick(record)}> Details</Button>)
                }
              ]}
              pagination={{ pageSize: 10 }}
              rowKey="id"
            />
          </Card>
        </>
      )}

      {/* Modals */}
      <ManagerDetailModal />
      <ExecutiveDetailModal />
    </Space>
  );
};

/* ---------------- MAIN ADMIN DASHBOARD COMPONENT ---------------- */

const AdminDashboardMain = () => {
  const [activeTab, setActiveTab] = useState('teamPerformance');
  const [timeRange, setTimeRange] = useState('month');
  const [loading, setLoading] = useState(false);
  
  const screens = useBreakpoint();

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  return (
    <div style={{ background: '#f8f9fa',minHeight: '100vh',padding: screens.xs ? 16 : 24}}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <Flex align="center" justify="space-between" wrap="wrap" gap={16}>
          <Space direction="vertical" size={4}>
            <Title level={3} style={{ margin: 0, color: '#1e293b' }}>
              <CrownOutlined style={{ marginRight: 8, color: '#FFD700' }} />
              Admin Dashboard
            </Title>
            <Text type="secondary" style={{ fontSize: 14 }}>Team Performance & Lead Analytics</Text>
          </Space>
          
          <Space wrap>
            <Select 
              value={timeRange}
              onChange={setTimeRange}
              style={{ width: 160, borderRadius: 8 }}
              suffixIcon={<CalendarOutlined />}
              options={[{label:'Today', value:'today'},{label:'This Week', value:'week'},{label:'This Month', value:'month'},{label:"This Quarter", value:'quarter'}]}
            />
            <Button icon={<SyncOutlined spin={loading} />}style={{ borderRadius: 8 }}onClick={handleRefresh}>Refresh</Button>
          </Space>
        </Flex>
      </div>

      {/* Organization Overview Card */}
      <Card 
        style={{ 
          marginBottom: 24,
          borderRadius: 16,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          border: 'none',
          boxShadow: '0 8px 32px rgba(102, 126, 234, 0.2)'
        }}
      >
        <Row gutter={[24, 24]} align="middle">
          <Col xs={24} md={8}>
            <div style={{ textAlign: 'center', padding: 16 }}>
              <Space direction="vertical" size={16}>
                <div>
                  <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: 14 }}>Organization Performance Score</Text>
                  <Statistic
                    value={adminDashboardData.organizationMetrics.avgPerformanceScore}
                    suffix="/100"
                    valueStyle={{fontSize: 56, fontWeight: 'bold', color: 'white', lineHeight: 1}}
                  />
                  <Flex align="center" justify="center" gap={8} style={{ marginTop: 8 }}>
                    <ArrowUpOutlined style={{ color: '#52C41A', fontSize: 12 }} />
                    <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12 }}>{adminDashboardData.organizationMetrics.weeklyGrowth} this week</Text>
                  </Flex>
                </div>
                <Flex justify="center" gap={8} wrap>
                  <Tag style={{ background: 'rgba(255,255,255,0.2)', color: 'white', borderRadius: 12 }}>
                    {adminDashboardData.organizationMetrics.totalManagers} Managers
                  </Tag>
                  <Tag style={{ background: 'rgba(255,255,255,0.2)', color: 'white', borderRadius: 12 }}>
                    {adminDashboardData.organizationMetrics.totalExecutives} Executives
                  </Tag>
                  <Tag style={{ background: 'rgba(255,255,255,0.2)', color: 'white', borderRadius: 12 }}>
                    {adminDashboardData.organizationMetrics.totalRevenue} Revenue
                  </Tag>
                </Flex>
              </Space>
            </div>
          </Col>
          
          <Col xs={24} md={16}>
            <Row gutter={[16, 16]}>
              <Col xs={12} sm={6}>
                <MetricCard
                  icon={<TeamOutlined />}
                  label="Total Managers"
                  value={adminDashboardData.organizationMetrics.totalManagers}
                  color="#1890FF"
                  tooltip="Active managers across organization"
                  size="large"
                />
              </Col>
              <Col xs={12} sm={6}>
                <MetricCard
                  icon={<UserOutlined />}
                  label="Total Executives"
                  value={adminDashboardData.organizationMetrics.totalExecutives}
                  color="#52C41A"
                  tooltip="Active sales executives across organization"
                  size="large"
                />
              </Col>
              <Col xs={12} sm={6}>
                <MetricCard
                  icon={<PercentageOutlined />}
                  label="Conversion Rate"
                  value={28}
                  color="#13c2c2"
                  suffix="%"
                  tooltip="Overall organization conversion rate"
                  size="large"
                />
              </Col>
              <Col xs={12} sm={6}>
                <MetricCard
                  icon={<DollarOutlined />}
                  label="Active Leads"
                  value={adminDashboardData.organizationMetrics.activeLeads}
                  suffix="K"
                  color="#F759AB"
                  tooltip="Leads currently in pipeline"
                  size="large"
                />
              </Col>
            </Row>
          </Col>
        </Row>
      </Card>

      {/* Main Tabs */}
      <Tabs activeKey={activeTab} onChange={setActiveTab} style={{ marginBottom: 24 }}>
        {/* Combined Team Performance Tab */}
        <TabPane
          tab={
            <Space>
              <TeamOutlined />
              <span>Team Performance</span>
              <Badge count={adminDashboardData.organizationMetrics.totalManagers} style={{ backgroundColor: '#1890FF' }} />
            </Space>
          }
          key="teamPerformance"
        >
          <CombinedTeamPerformance />
        </TabPane>

        {/* Lead Performance Tab */}
        <TabPane
          tab={
            <Space>
              <BarChartOutlined />
              <span>Lead Performance</span>
              <Badge count={adminDashboardData.leadPerformance.totalLeads} style={{ backgroundColor: '#1890FF' }} />
            </Space>
          }
          key="leadPerformance"
        >
          <Space direction="vertical" size={24} style={{ width: '100%' }}>
            {/* Lead Performance Overview */}
            <Card 
              style={{ 
                borderRadius: 16,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none'
              }}
            >
              <Row gutter={[24, 24]} align="middle">
                <Col xs={24} md={8}>
                  <div style={{ textAlign: 'center', padding: 16 }}>
                    <Space direction="vertical" size={16}>
                      <div>
                        <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: 14 }}>Average Lead Score</Text>
                        <Statistic
                          value={adminDashboardData.leadPerformance.avgLeadScore}
                          suffix="/100"
                          valueStyle={{ 
                            fontSize: 56,
                            fontWeight: 'bold',
                            color: 'white',
                            lineHeight: 1
                          }}
                        />
                        <Flex align="center" justify="center" gap={8} style={{ marginTop: 8 }}>
                          <ArrowUpOutlined style={{ color: '#52C41A', fontSize: 12 }} />
                          <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12 }}>
                            {adminDashboardData.leadPerformance.scoreTrend} this month
                          </Text>
                        </Flex>
                      </div>
                      <Flex justify="center" gap={8}>
                        <Tag style={{ background: 'rgba(255,255,255,0.2)', color: 'white', borderRadius: 12 }}>
                          {adminDashboardData.leadPerformance.totalLeads} Total Leads
                        </Tag>
                      </Flex>
                    </Space>
                  </div>
                </Col>
                
                <Col xs={24} md={16}>
                  <Row gutter={[16, 16]}>
                    <Col xs={12} sm={6}>
                      <MetricCard
                        icon={<ThunderboltOutlined />}
                        label="Sales Ready"
                        value={adminDashboardData.leadPerformance.distribution["Sales Ready"].count}
                        color="#52C41A"
                        tooltip="Leads ready for immediate conversion"
                        size="large"
                      />
                    </Col>
                    <Col xs={12} sm={6}>
                      <MetricCard
                        icon={<RiseOutlined />}
                        label="High Intent"
                        value={adminDashboardData.leadPerformance.distribution["High Intent"].count}
                        color="#1890FF"
                        tooltip="Leads showing strong purchase intent"
                        size="large"
                      />
                    </Col>
                    <Col xs={12} sm={6}>
                      <MetricCard
                        icon={<PercentageOutlined />}
                        label="Conversion Rate"
                        value={28}
                        color="#13c2c2"
                        suffix="%"
                        tooltip="Overall lead conversion rate"
                        size="large"
                      />
                    </Col>
                    <Col xs={12} sm={6}>
                      <MetricCard
                        icon={<LineChartOutlined />}
                        label="Scoring Accuracy"
                        value={adminDashboardData.leadPerformance.scoringEffectiveness.accuracy}
                        color="#F759AB"
                        suffix="%"
                        tooltip="Lead scoring prediction accuracy"
                        size="large"
                      />
                    </Col>
                  </Row>
                </Col>
              </Row>
            </Card>

            {/* Lead Distribution by Score Buckets */}
            <Card 
              title={
                <Space>
                  <PieChartOutlined />
                  <span>Lead Distribution by Score Buckets</span>
                </Space>
              }
              style={{ borderRadius: 12 }}
            >
              <Row gutter={[16, 16]}>
                {Object.entries(adminDashboardData.leadPerformance.distribution).map(([key, bucket]) => (
                  <Col xs={24} sm={12} md={4.8} key={key}>
                    <ScoreBucketCard bucket={{ ...bucket, label: key }} />
                  </Col>
                ))}
              </Row>
            </Card>

            {/* Source Performance */}
            <Card 
              title={
                <Space>
                  <HeatMapOutlined />
                  <span>Lead Source Performance</span>
                </Space>
              }
              style={{ borderRadius: 12 }}
            >
              <Row gutter={[16, 16]}>
                {adminDashboardData.leadPerformance.sourcePerformance.map((source, idx) => (
                  <Col xs={24} sm={12} md={8} lg={4.8} key={idx}>
                    <SourcePerformanceCard source={source} />
                  </Col>
                ))}
              </Row>
            </Card>
          </Space>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default AdminDashboardMain;