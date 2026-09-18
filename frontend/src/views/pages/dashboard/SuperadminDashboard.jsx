import React, { useState } from "react";
import {Card,Row,Col,Progress,Tag,Typography,Select,Space,Tooltip,Badge,Statistic,Avatar,List,Button,Grid,Divider,Tabs,Table,
  Modal, Form, Input,DatePicker, Alert, Flex, Radio, Timeline, Tree, Collapse} from "antd";
import {CrownOutlined, TrophyOutlined, ArrowUpOutlined,ArrowDownOutlined, FireOutlined, UserOutlined, TeamOutlined,
  DashboardOutlined, StarOutlined, RiseOutlined, SyncOutlined, BarChartOutlined, PieChartOutlined, HeatMapOutlined,PercentageOutlined, EyeOutlined,
  EnvironmentOutlined, FieldTimeOutlined, DollarOutlined, DollarCircleOutlined, SettingOutlined, ControlOutlined, ApartmentOutlined,
  GlobalOutlined, BankOutlined, PartitionOutlined, AreaChartOutlined, AppstoreOutlined, DeploymentUnitOutlined, AuditOutlined,
  CompassOutlined, CaretDownOutlined, CaretRightOutlined, ThunderboltOutlined, LineChartOutlined, TableOutlined, UserAddOutlined,
  CalendarOutlined} from "@ant-design/icons";

const { Title, Text } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;
const { useBreakpoint } = Grid;

// Missing icons (placeholder components)
const SnowOutlined = () => <span>❄️</span>;
const SleepOutlined = () => <span>💤</span>;

/* ---------------- SUPER ADMIN DASHBOARD DATA ---------------- */

const superAdminData = {
  // Overall system metrics
  systemMetrics: {
    totalAdmins: 8,
    totalManagers: 145,
    totalExecutives: 2450,
    totalLeads: 19.7,
    totalRevenue: "₹1,780 Cr",
    avgPerformanceScore: 72,
    overallConversion: "28%",
    weeklyGrowth: "+8%",
    monthlyGrowth: "+22%"
  },

  // Admins with their hierarchy
  admins: [
    {
      id: 1,
      name: "Robert Chen",
      email: "robert@skyline.com",
      role: "Admin",
      status: "active",
      color: "#1890FF",
      lastLogin: "2 mins ago",
      contact: "+91 9876543210",
      
      // Organization/Team under this admin
      organization: "Skyline Realty",
      region: "India",
      
      // Manager & Executive data under this admin
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
              followUpRate: "95%"
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
              followUpRate: "92%"
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
              followUpRate: "88%"
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
              followUpRate: "94%"
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
              followUpRate: "85%"
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
              followUpRate: "93%"
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
              followUpRate: "87%"
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
              followUpRate: "82%"
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
              followUpRate: "96%"
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
              followUpRate: "89%"
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
              followUpRate: "90%"
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
              followUpRate: "86%"
            }
          ]
        }
      ],
      
      // Lead performance data under this admin
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
          { source: "Phone Inquiry", count: 246, avgScore: 75, conversion: "38%", revenue: "₹24 Cr", color: "#1890FF" }
        ]
      },
      
      // Admin summary
      summary: {
        managers: 14,
        executives: 186,
        leads: 2.4,
        revenue: "₹148 Cr",
        score: 72,
        growth: "+22%"
      }
    },
    {
      id: 2,
      name: "Michael Brown",
      email: "michael@horizon.com",
      role: "Admin",
      status: "active",
      color: "#52C41A",
      lastLogin: "5 mins ago",
      contact: "+1 2345678901",
      
      organization: "Horizon Properties",
      region: "USA",
      
      managers: [
        {
          id: 201,
          name: "Alex Johnson",
          team: "Team A",
          executiveCount: 6,
          avgScore: 82,
          trend: "+12%",
          status: "exceeding",
          leads: 72,
          conversion: "35%",
          revenue: "₹6.8 Cr",
          
          executives: [
            { 
              id: 2001, 
              name: "Alex Chen", 
              score: 84, 
              rating: "High Performer", 
              leads: 11, 
              conversion: "33%", 
              revenue: "₹1.7 Cr",
              dealsClosed: 6,
              avgDealSize: "₹28.33L",
              responseTime: "2.5 hrs",
              followUpRate: "94%"
            }
          ]
        },
        {
          id: 202,
          name: "Priya Nair",
          team: "Team B",
          executiveCount: 8,
          avgScore: 72,
          trend: "+5%",
          status: "meeting",
          leads: 68,
          conversion: "30%",
          revenue: "₹5.2 Cr",
          
          executives: []
        }
      ],
      
      leadPerformance: {
        totalLeads: 3120,
        avgLeadScore: 72,
        scoreTrend: "+12%",
        distribution: {
          "Sales Ready": { count: 748, percentage: 24, color: "#52C41A" },
          "High Intent": { count: 936, percentage: 30, color: "#1890FF" },
          "Warm": { count: 780, percentage: 25, color: "#FAAD14" },
          "Cold": { count: 468, percentage: 15, color: "#FF7A45" },
          "Dormant": { count: 188, percentage: 6, color: "#8C8C8C" }
        },
        
        sourcePerformance: [
          { source: "Walk Ins", count: 420, avgScore: 88, conversion: "45%", revenue: "₹45 Cr", color: "#52C41A" },
          { source: "Referral", count: 624, avgScore: 85, conversion: "48%", revenue: "₹60 Cr", color: "#722ED1" },
          { source: "Phone Inquiry", count: 468, avgScore: 78, conversion: "42%", revenue: "₹42 Cr", color: "#1890FF" }
        ]
      },
      
      summary: {
        managers: 18,
        executives: 245,
        leads: 3.1,
        revenue: "₹195 Cr",
        score: 78,
        growth: "+18%"
      }
    },
    {
      id: 3,
      name: "Sarah Johnson",
      email: "sarah@summit.com",
      role: "Admin",
      status: "active",
      color: "#FAAD14",
      lastLogin: "15 mins ago",
      contact: "+44 1234567890",
      
      organization: "Summit Real Estate",
      region: "UK",
      
      managers: [
        {
          id: 301,
          name: "Lisa Wang",
          team: "Team A",
          executiveCount: 10,
          avgScore: 65,
          trend: "-2%",
          status: "below",
          leads: 70,
          conversion: "26%",
          revenue: "₹5.5 Cr",
          
          executives: [
            { 
              id: 3001, 
              name: "David Lee", 
              score: 60, 
              rating: "Needs Improvement", 
              leads: 10, 
              conversion: "23%", 
              revenue: "₹1.2 Cr",
              dealsClosed: 3,
              avgDealSize: "₹40L",
              responseTime: "6.8 hrs",
              followUpRate: "82%"
            }
          ]
        }
      ],
      
      leadPerformance: {
        totalLeads: 1250,
        avgLeadScore: 62,
        scoreTrend: "+5%",
        distribution: {
          "Sales Ready": { count: 250, percentage: 20, color: "#52C41A" },
          "High Intent": { count: 375, percentage: 30, color: "#1890FF" },
          "Warm": { count: 312, percentage: 25, color: "#FAAD14" },
          "Cold": { count: 250, percentage: 20, color: "#FF7A45" },
          "Dormant": { count: 63, percentage: 5, color: "#8C8C8C" }
        },
        
        sourcePerformance: [
          { source: "Walk Ins", count: 150, avgScore: 75, conversion: "38%", revenue: "₹15 Cr", color: "#52C41A" },
          { source: "Referral", count: 250, avgScore: 72, conversion: "42%", revenue: "₹25 Cr", color: "#722ED1" },
          { source: "Phone Inquiry", count: 188, avgScore: 65, conversion: "35%", revenue: "₹18 Cr", color: "#1890FF" }
        ]
      },
      
      summary: {
        managers: 9,
        executives: 128,
        leads: 1.8,
        revenue: "₹112 Cr",
        score: 68,
        growth: "+8%"
      }
    },
    {
      id: 4,
      name: "David Wilson",
      email: "david@pinnacle.com",
      role: "Admin",
      status: "active",
      color: "#722ED1",
      lastLogin: "Just now",
      contact: "+971 123456789",
      
      organization: "Pinnacle Developers",
      region: "UAE",
      
      managers: [
        {
          id: 401,
          name: "Priya Sharma",
          team: "Team A",
          executiveCount: 8,
          avgScore: 82,
          trend: "+15%",
          status: "exceeding",
          leads: 92,
          conversion: "40%",
          revenue: "₹9.5 Cr",
          
          executives: [
            { 
              id: 4001, 
              name: "Rahul Verma", 
              score: 88, 
              rating: "Rockstar", 
              leads: 18, 
              conversion: "48%", 
              revenue: "₹3.2 Cr",
              dealsClosed: 10,
              avgDealSize: "₹32L",
              responseTime: "1.8 hrs",
              followUpRate: "98%"
            }
          ]
        }
      ],
      
      leadPerformance: {
        totalLeads: 4200,
        avgLeadScore: 85,
        scoreTrend: "+32%",
        distribution: {
          "Sales Ready": { count: 1260, percentage: 30, color: "#52C41A" },
          "High Intent": { count: 1260, percentage: 30, color: "#1890FF" },
          "Warm": { count: 840, percentage: 20, color: "#FAAD14" },
          "Cold": { count: 630, percentage: 15, color: "#FF7A45" },
          "Dormant": { count: 210, percentage: 5, color: "#8C8C8C" }
        },
        
        sourcePerformance: [
          { source: "Walk Ins", count: 630, avgScore: 92, conversion: "52%", revenue: "₹75 Cr", color: "#52C41A" },
          { source: "Referral", count: 840, avgScore: 88, conversion: "55%", revenue: "₹95 Cr", color: "#722ED1" },
          { source: "Phone Inquiry", count: 630, avgScore: 82, conversion: "45%", revenue: "₹68 Cr", color: "#1890FF" }
        ]
      },
      
      summary: {
        managers: 22,
        executives: 345,
        leads: 4.2,
        revenue: "₹265 Cr",
        score: 85,
        growth: "+32%"
      }
    }
  ]
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
                count={<Text style={{fontSize: 11, color: trend > 0 ? '#52C41A' : '#FF4D4F' }}>{trend > 0 ? '+' : ''}{trend}</Text>}
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

const AdminCard = ({ admin, onClick }) => {
  return (
    <Card
      hoverable
      onClick={() => onClick(admin)}
      style={{ 
        borderRadius: 12,
        border: `2px solid ${admin.color}`,
        background: `${admin.color}08`,
        height: '100%'
      }}
      bodyStyle={{ padding: 16 }}
    >
      <Space direction="vertical" size={12} style={{ width: '100%' }}>
        <Flex align="center" justify="space-between">
          <Space direction="vertical" size={2}>
            <Flex align="center" gap={8}>
              <Avatar size={40} style={{ background: admin.color }}>{admin.name.charAt(0)}</Avatar>
              <div>
                <Text strong style={{ fontSize: 16 }}>{admin.name}</Text>
                <Text type="secondary" style={{ fontSize: 11 }}>{admin.organization} • {admin.region}</Text>
              </div>
            </Flex>
          </Space>
          <Badge count={admin.summary.score} style={{  backgroundColor: admin.color, fontWeight: 'bold', fontSize: 14}}/>
        </Flex>
        
        <Progress percent={admin.summary.score} strokeColor={admin.color} trailColor={`${admin.color}20`} showInfo={false} />
        
        <Row gutter={[8, 8]}>
          <Col span={12}>
            <Space direction="vertical" size={2}>
              <Text type="secondary" style={{ fontSize: 10 }}>Managers</Text>
              <Text strong style={{ fontSize: 14 }}>{admin.summary.managers}</Text>
            </Space>
          </Col>
          <Col span={12}>
            <Space direction="vertical" size={2}>
              <Text type="secondary" style={{ fontSize: 10 }}>Executives</Text>
              <Text strong style={{ fontSize: 14 }}>{admin.summary.executives}</Text>
            </Space>
          </Col>
          <Col span={12}>
            <Space direction="vertical" size={2}>
              <Text type="secondary" style={{ fontSize: 10 }}>Leads</Text>
              <Text strong style={{ fontSize: 14 }}>{admin.summary.leads}K</Text>
            </Space>
          </Col>
          <Col span={12}>
            <Space direction="vertical" size={2}>
              <Text type="secondary" style={{ fontSize: 10 }}>Revenue</Text>
              <Text strong style={{ fontSize: 14 }}>{admin.summary.revenue}</Text>
            </Space>
          </Col>
        </Row>
        
        <Divider style={{ margin: '8px 0' }} />
        
        <Flex justify="space-between" align="center">
          <Tag color={admin.status === 'active' ? 'success' : 'default'}> {admin.status.toUpperCase()} </Tag>
          <Text strong style={{color: admin.summary.growth.startsWith('+') ? '#52C41A' : '#FF4D4F', fontSize: 12}}> {admin.summary.growth}</Text>
        </Flex>
      </Space>
    </Card>
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
        border: `1px solid ${statusColors[manager.status]}30`,
        background: '#fff',
        marginBottom: 12
      }}
      bodyStyle={{ padding: 12 }}
    >
      <Flex align="center" justify="space-between">
        <Space size={12}>
          <Avatar size={36} style={{  background: statusColors[manager.status]}}>{manager.name.charAt(0)}</Avatar>
          <Space direction="vertical" size={2}>
            <Text strong style={{ fontSize: 14 }}>{manager.name}</Text>
            <Text type="secondary" style={{ fontSize: 11 }}>{manager.team} • {manager.executiveCount} executives</Text>
          </Space>
        </Space>
        
        <Space direction="vertical" align="end" size={2}>
          <Flex align="center" gap={4}>
            <Text strong style={{ fontSize: 16, color: statusColors[manager.status] }}>{manager.avgScore} </Text>
            <Text type="secondary" style={{ fontSize: 10 }}>/100</Text>
          </Flex>
          <Text style={{ color: manager.trend.startsWith('+') ? '#52C41A' : '#FF4D4F',fontSize: 10}}>{manager.trend}</Text>
        </Space>
      </Flex>
      
      <Divider style={{ margin: '8px 0' }} />
      
      <Row gutter={[8, 8]}>
        <Col span={8}>
          <Space direction="vertical" size={2} align="center">
            <Text type="secondary" style={{ fontSize: 10 }}>Leads</Text>
            <Text strong style={{ fontSize: 12 }}>{manager.leads}</Text>
          </Space>
        </Col>
        <Col span={8}>
          <Space direction="vertical" size={2} align="center">
            <Text type="secondary" style={{ fontSize: 10 }}>Conversion</Text>
            <Text strong style={{ fontSize: 12, color: '#52C41A' }}>{manager.conversion}</Text>
          </Space>
        </Col>
        <Col span={8}>
          <Space direction="vertical" size={2} align="center">
            <Text type="secondary" style={{ fontSize: 10 }}>Revenue</Text>
            <Text strong style={{ fontSize: 12 }}>{manager.revenue}</Text>
          </Space>
        </Col>
      </Row>
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
      
      <Progress percent={bucket.percentage} strokeColor={bucket.color} trailColor={`${bucket.color}30`} showInfo={false} size="small" />
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
        <Badge count={source.avgScore} style={{ backgroundColor: source.color, fontSize: 11}} />
      </Flex>
      
      <Progress percent={parseInt(source.conversion)} strokeColor={source.color} trailColor={`${source.color}20`} showInfo={false} size="small" />
      
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

/* ---------------- SUPER ADMIN DASHBOARD COMPONENT ---------------- */

const SuperAdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('hierarchy');
  const [timeRange, setTimeRange] = useState('month');
  const [loading, setLoading] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [selectedManager, setSelectedManager] = useState(null);
  const [selectedExecutive, setSelectedExecutive] = useState(null);
  const [expandedAdmins, setExpandedAdmins] = useState([]);
  const [expandedManagers, setExpandedManagers] = useState([]);
  const [performanceFilter, setPerformanceFilter] = useState('all');
  
  const screens = useBreakpoint();

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  const handleAdminClick = (admin) => {
    setSelectedAdmin(admin);
  };

  const handleManagerClick = (manager) => {
    setSelectedManager(manager);
  };

  const handleExecutiveClick = (executive) => {
    setSelectedExecutive(executive);
  };

  const toggleAdminExpand = (adminId) => {
    if (expandedAdmins.includes(adminId)) {
      setExpandedAdmins(expandedAdmins.filter(id => id !== adminId));
    } else {
      setExpandedAdmins([...expandedAdmins, adminId]);
    }
  };

  const toggleManagerExpand = (managerId) => {
    if (expandedManagers.includes(managerId)) {
      setExpandedManagers(expandedManagers.filter(id => id !== managerId));
    } else {
      setExpandedManagers([...expandedManagers, managerId]);
    }
  };

  // Get all executives across all admins
  const allExecutives = superAdminData.admins.flatMap(admin => 
    admin.managers.flatMap(manager => 
      (manager.executives || []).map(exec => ({
        ...exec,
        adminName: admin.name,
        organization: admin.organization,
        managerName: manager.name,
        managerTeam: manager.team
      }))
    )
  ).filter(exec => exec);

  // Sort executives by score to get top performers
  const topExecutives = [...allExecutives]
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);

  const AdminDetailModal = () => (
    <Modal
      title={
        <Space>
          <Avatar size={32} style={{ background: selectedAdmin?.color }}>{selectedAdmin?.name?.charAt(0)}</Avatar>
          <span>{selectedAdmin?.name} - Admin Details</span>
        </Space>
      }
      open={!!selectedAdmin}
      onCancel={() => setSelectedAdmin(null)}
      width={900}
      footer={[<Button key="close" onClick={() => setSelectedAdmin(null)}>Close</Button>]}
    >
      {selectedAdmin && (
        <Space direction="vertical" size={24} style={{ width: '100%' }}>
          <Row gutter={16}>
            <Col span={6}>
              <Card size="small">
                <Statistic
                  title="Performance Score"
                  value={selectedAdmin.summary.score}
                  suffix="/100"
                  valueStyle={{ fontSize: 32, color: selectedAdmin.color }}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card size="small">
                <Statistic
                  title="Total Managers"
                  value={selectedAdmin.summary.managers}
                  valueStyle={{ fontSize: 32 }}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card size="small">
                <Statistic
                  title="Total Revenue"
                  value={selectedAdmin.summary.revenue}
                  valueStyle={{fontSize: 32, color: '#722ED1' }}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card size="small">
                <Statistic
                  title="Growth"
                  value={parseInt(selectedAdmin.summary.growth)}
                  suffix="%"
                  valueStyle={{fontSize: 32, color: selectedAdmin.summary.growth.startsWith('+') ? '#52C41A' : '#FF4D4F' }}
                />
              </Card>
            </Col>
          </Row>
          
          <Divider />
          
          {/* Admin Information */}
          <Card size="small" title="Admin Information">
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Space direction="vertical" size={12} style={{ width: '100%' }}>
                  <Flex justify="space-between">
                    <Text type="secondary">Organization:</Text>
                    <Text strong>{selectedAdmin.organization}</Text>
                  </Flex>
                  <Flex justify="space-between">
                    <Text type="secondary">Email:</Text>
                    <Text strong>{selectedAdmin.email}</Text>
                  </Flex>
                  <Flex justify="space-between">
                    <Text type="secondary">Contact:</Text>
                    <Text strong>{selectedAdmin.contact}</Text>
                  </Flex>
                </Space>
              </Col>
              <Col span={12}>
                <Space direction="vertical" size={12} style={{ width: '100%' }}>
                  <Flex justify="space-between">
                    <Text type="secondary">Region:</Text>
                    <Text strong>{selectedAdmin.region}</Text>
                  </Flex>
                  <Flex justify="space-between">
                    <Text type="secondary">Last Login:</Text>
                    <Text strong>{selectedAdmin.lastLogin}</Text>
                  </Flex>
                  <Flex justify="space-between">
                    <Text type="secondary">Status:</Text>
                    <Tag color={selectedAdmin.status === 'active' ? 'success' : 'default'}>{selectedAdmin.status.toUpperCase()}</Tag>
                  </Flex>
                </Space>
              </Col>
            </Row>
          </Card>
          
          <Divider />
          
          {/* Managers Section */}
          <div>
            <Title level={5}>Managers under this Admin</Title>
            <Row gutter={[16, 16]}>
              {selectedAdmin.managers?.map(manager => (
                <Col xs={24} sm={12} md={8} key={manager.id}>
                  <ManagerCard manager={manager} onClick={handleManagerClick} />
                </Col>
              ))}
            </Row>
          </div>
          
          <Divider />
          
          {/* Lead Performance Section */}
          <div>
            <Title level={5}>Lead Performance under this Admin</Title>
            <Card size="small" style={{ marginBottom: 16 }}>
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <Statistic title="Total Leads" value={selectedAdmin.leadPerformance.totalLeads} valueStyle={{ fontSize: 24 }} />
                </Col>
                <Col span={12}>
                  <Statistic title="Average Lead Score" value={selectedAdmin.leadPerformance.avgLeadScore} suffix="/100" valueStyle={{ fontSize: 24, color: '#1890FF' }} />
                </Col>
              </Row>
            </Card>
            
            <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
              {Object.entries(selectedAdmin.leadPerformance.distribution).map(([key, bucket]) => (
                <Col xs={24} sm={12} md={4.8} key={key}>
                  <ScoreBucketCard bucket={{ ...bucket, label: key }} />
                </Col>
              ))}
            </Row>
          </div>
        </Space>
      )}
    </Modal>
  );

  const ManagerDetailModal = () => (
    <Modal
      title={
        <Space>
          <Avatar size={32} style={{ background: selectedManager?.status === 'exceeding' ? '#52C41A' : selectedManager?.status === 'meeting' ? '#1890FF' : '#FAAD14'}}>
            {selectedManager?.name?.charAt(0)}
          </Avatar>
          <span>{selectedManager?.name} - Manager Details</span>
        </Space>
      }
      open={!!selectedManager}
      onCancel={() => setSelectedManager(null)}
      width={800}
      footer={[<Button key="close" onClick={() => setSelectedManager(null)}>Close</Button>]}
    >
      {selectedManager && (
        <Space direction="vertical" size={24} style={{ width: '100%' }}>
          <Row gutter={16}>
            <Col span={8}>
              <Card size="small">
                <Statistic title="Team Score" value={selectedManager.avgScore} suffix="/100" valueStyle={{ fontSize: 32, color: selectedManager.status === 'exceeding' ? '#52C41A' : '#1890FF' }}/>
              </Card>
            </Col>
            <Col span={8}>
              <Card size="small">
                <Statistic title="Executives" value={selectedManager.executiveCount} valueStyle={{ fontSize: 32 }}/>
              </Card>
            </Col>
            <Col span={8}>
              <Card size="small">
                <Statistic title="Conversion Rate" value={parseInt(selectedManager.conversion)} suffix="%" valueStyle={{ fontSize: 32, color: '#52C41A' }} />
              </Card>
            </Col>
          </Row>
          
          <Divider />
          
          {selectedManager.executives && selectedManager.executives.length > 0 ? (
            <div>
              <Title level={5}>Executives under this Manager</Title>
              <Row gutter={[16, 16]}>
                {selectedManager.executives.map(executive => (
                  <Col xs={24} sm={12} md={8} key={executive.id}>
                    <ExecutiveCard executive={executive} onClick={handleExecutiveClick} />
                  </Col>
                ))}
              </Row>
            </div>
          ) : ( <Alert message="No detailed executive data available for this team" type="info" showIcon />)
          }
        </Space>
      )}
    </Modal>
  );

  const ExecutiveDetailModal = () => (
    <Modal
      title={
        <Space>
          <Avatar size={32}>{selectedExecutive?.name?.charAt(0)}</Avatar>
          <span>{selectedExecutive?.name} - Executive Details</span>
        </Space>
      }
      open={!!selectedExecutive}
      onCancel={() => setSelectedExecutive(null)}
      width={600}
      footer={[<Button key="close" onClick={() => setSelectedExecutive(null)}> Close</Button>]}
    >
      {selectedExecutive && (
        <Space direction="vertical" size={16} style={{ width: '100%' }}>
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
            <Col span={12}>
              <Card size="small">
                <Statistic title="Conversion Rate" value={parseInt(selectedExecutive.conversion)} suffix="%" valueStyle={{ fontSize: 24, color: '#52C41A' }} />
              </Card>
            </Col>
            <Col span={12}>
              <Card size="small">
                <Statistic title="Revenue Generated" value={selectedExecutive.revenue} valueStyle={{ fontSize: 24, color: '#722ED1' }} />
              </Card>
            </Col>
          </Row>
          
          {selectedExecutive.responseTime && (
            <>
              <Divider />
              <Card size="small" title="Additional Metrics">
                <Row gutter={16}>
                  <Col span={12}>
                    <Space direction="vertical" align="center">
                      <Text type="secondary" style={{ fontSize: 11 }}>Response Time</Text>
                      <Text strong style={{ fontSize: 16 }}>{selectedExecutive.responseTime}</Text>
                    </Space>
                  </Col>
                  <Col span={12}>
                    <Space direction="vertical" align="center">
                      <Text type="secondary" style={{ fontSize: 11 }}>Follow-up Rate</Text>
                      <Text strong style={{ fontSize: 16 }}>{selectedExecutive.followUpRate}</Text>
                    </Space>
                  </Col>
                </Row>
              </Card>
            </>
          )}
        </Space>
      )}
    </Modal>
  );

  return (
    <div style={{ background: '#f8f9fa', minHeight: '100vh', padding: screens.xs ? 16 : 24 }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <Flex align="center" justify="space-between" wrap="wrap" gap={16}>
          <Space direction="vertical" size={4}>
            <Title level={3} style={{ margin: 0, color: '#1e293b' }}>
              <CrownOutlined style={{ marginRight: 8, color: '#FFD700' }} />
               Super Admin Dashboard
            </Title>
            <Text type="secondary" style={{ fontSize: 14 }}>Complete hierarchy: Admin → Manager → Executive</Text>
          </Space>
          
          <Space wrap>
            <Select 
              value={timeRange}
              onChange={setTimeRange}
              style={{ width: 160, borderRadius: 8 }}
              suffixIcon={<CalendarOutlined />}
              options={[
                {label:'Today', value:'today'},
                {label:'This Week', value:'week'},
                {label:'This Month', value:'month'},
                {label:'This Quarter', value:'quarter'},
              ]}
             />

            <Select 
              value={performanceFilter}
              onChange={setPerformanceFilter}
              style={{ width: 180, borderRadius: 8 }}
              suffixIcon={<ControlOutlined />}
              options={[
                {label:'All Admins', value:'all'},
                {label:'High Performers', value:'high'},
                {label:'Medium Performers', value:'medium'},
                {label:'Low Performers', value:'low'},
              ]}
             />
            <Button icon={<SyncOutlined spin={loading} />} style={{ borderRadius: 8 }} onClick={handleRefresh}>Refresh</Button>
          </Space>
        </Flex>
      </div>

      {/* System Overview Card */}
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
                  <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: 14 }}>Overall System Performance</Text>
                  <Statistic
                    value={superAdminData.systemMetrics.avgPerformanceScore}
                    suffix="/100"
                    valueStyle={{fontSize: 56, fontWeight: 'bold', color: 'white', lineHeight: 1}}
                  />
                  <Flex align="center" justify="center" gap={8} style={{ marginTop: 8 }}>
                    <ArrowUpOutlined style={{ color: '#52C41A', fontSize: 12 }} />
                    <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12 }}>{superAdminData.systemMetrics.monthlyGrowth} this month</Text>
                  </Flex>
                </div>
                <Flex justify="center" gap={8} wrap>
                  <Tag style={{ background: 'rgba(255,255,255,0.2)', color: 'white', borderRadius: 12 }}>
                    {superAdminData.systemMetrics.totalAdmins} Admins
                  </Tag>
                  <Tag style={{ background: 'rgba(255,255,255,0.2)', color: 'white', borderRadius: 12 }}>
                    {superAdminData.systemMetrics.totalManagers} Managers
                  </Tag>
                  <Tag style={{ background: 'rgba(255,255,255,0.2)', color: 'white', borderRadius: 12 }}>
                    {superAdminData.systemMetrics.totalRevenue} Revenue
                  </Tag>
                </Flex>
              </Space>
            </div>
          </Col>
          
          <Col xs={24} md={16}>
            <Row gutter={[16, 16]}>
              <Col xs={12} sm={6}>
                <MetricCard
                  icon={<UserOutlined />}
                  label="Total Admins"
                  value={superAdminData.systemMetrics.totalAdmins}
                  color="#1890FF"
                  tooltip="Total admins in the system"
                  size="large"
                />
              </Col>
              <Col xs={12} sm={6}>
                <MetricCard
                  icon={<TeamOutlined />}
                  label="Total Managers"
                  value={superAdminData.systemMetrics.totalManagers}
                  color="#52C41A"
                  tooltip="Total managers across all admins"
                  size="large"
                />
              </Col>
              <Col xs={12} sm={6}>
                <MetricCard
                  icon={<PercentageOutlined />}
                  label="Avg Conversion Rate"
                  value={28}
                  color="#13c2c2"
                  suffix="%"
                  tooltip="Average conversion rate across all admins"
                  size="large"
                />
              </Col>
              <Col xs={12} sm={6}>
                <MetricCard
                  icon={<DollarOutlined />}
                  label="Total Leads"
                  value={superAdminData.systemMetrics.totalLeads}
                  suffix="K"
                  color="#F759AB"
                  tooltip="Total leads across all admins"
                  size="large"
                />
              </Col>
            </Row>
          </Col>
        </Row>
      </Card>

      {/* Main Tabs */}
      <Tabs activeKey={activeTab} onChange={setActiveTab} style={{ marginBottom: 24 }}>
        {/* Hierarchy Tab */}
        <TabPane
          tab={
            <Space>
              <ApartmentOutlined />
              <span>Complete Hierarchy</span>
            </Space>
          }
          key="hierarchy"
        >
          <Space direction="vertical" size={24} style={{ width: '100%' }}>
            {/* Expanded Hierarchy View */}
            <Card 
              title={
                <Space>
                  <TeamOutlined />
                  <span>Complete Hierarchy View</span>
                </Space>
              }
              style={{ borderRadius: 12 }}
            >
              <Space direction="vertical" size={16} style={{ width: '100%' }}>
                {superAdminData.admins.map((admin) => (
                  <Card
                    key={admin.id}
                    style={{ 
                      border: `2px solid ${admin.color}`,
                      borderRadius: 12,
                      background: `${admin.color}08`
                    }}
                    bodyStyle={{ padding: 0 }}
                  >
                    <div 
                      style={{ 
                        padding: 16,
                        cursor: 'pointer',
                        background: admin.color,
                        color: 'white',
                        borderTopLeftRadius: 10,
                        borderTopRightRadius: 10
                      }}
                      onClick={() => toggleAdminExpand(admin.id)}
                    >
                      <Flex align="center" justify="space-between">
                        <Space>
                          <Avatar size={40} style={{ background: 'rgba(255,255,255,0.2)' }}> {admin.name.charAt(0)}</Avatar>
                          <Space direction="vertical" size={2}>
                            <Text strong style={{ color: 'white', fontSize: 16 }}>{admin.name}</Text>
                            <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12 }}>
                              {admin.organization} • {admin.summary.managers} managers • {admin.summary.executives} executives
                            </Text>
                          </Space>
                        </Space>
                        <Space>
                          <Badge count={admin.summary.score} style={{backgroundColor: 'white', color: admin.color, fontWeight: 'bold'}} />
                          {expandedAdmins.includes(admin.id) ? <CaretDownOutlined /> : <CaretRightOutlined />}
                        </Space>
                      </Flex>
                    </div>
                    
                    {expandedAdmins.includes(admin.id) && (
                      <div style={{ padding: 16 }}>
                        <Space direction="vertical" size={16} style={{ width: '100%' }}>
                          {/* Managers under this Admin */}
                          {admin.managers.map(manager => (
                            <Card
                              key={manager.id}
                              style={{ 
                                border: `1px solid ${manager.status === 'exceeding' ? '#52C41A' : manager.status === 'meeting' ? '#1890FF' : '#FAAD14'}30`,
                                borderRadius: 8
                              }}
                              bodyStyle={{ padding: 0 }}
                            >
                              <div 
                                style={{ 
                                  padding: 12,
                                  cursor: 'pointer',
                                  background: manager.status === 'exceeding' ? '#52C41A15' : manager.status === 'meeting' ? '#1890FF15' : '#FAAD1415',
                                  borderTopLeftRadius: 7,
                                  borderTopRightRadius: 7
                                }}
                                onClick={() => toggleManagerExpand(manager.id)}
                              >
                                <Flex align="center" justify="space-between">
                                  <Space>
                                    <Avatar size={32} style={{ 
                                      background: manager.status === 'exceeding' ? '#52C41A' : manager.status === 'meeting' ? '#1890FF' : '#FAAD14'
                                    }}>
                                      {manager.name.charAt(0)}
                                    </Avatar>
                                    <Space direction="vertical" size={2}>
                                      <Text strong>{manager.name}</Text>
                                      <Text type="secondary" style={{ fontSize: 11 }}>{manager.team} • {manager.executiveCount} executives • Score: {manager.avgScore}</Text>
                                    </Space>
                                  </Space>
                                  <Space>
                                    <Text style={{color: manager.trend.startsWith('+') ? '#52C41A' : '#FF4D4F', fontSize: 11 }}>{manager.trend}</Text>
                                    {expandedManagers.includes(manager.id) ? <CaretDownOutlined /> : <CaretRightOutlined />}
                                  </Space>
                                </Flex>
                              </div>
                              
                              {expandedManagers.includes(manager.id) && manager.executives && manager.executives.length > 0 && (
                                <div style={{ padding: 12 }}>
                                  <Text strong style={{ fontSize: 12, marginBottom: 8 }}>Executives under this Manager:</Text>
                                  <Row gutter={[8, 8]}>
                                    {manager.executives.map(executive => (
                                      <Col xs={24} sm={12} md={8} key={executive.id}>
                                        <ExecutiveCard executive={executive} onClick={handleExecutiveClick} />
                                      </Col>
                                    ))}
                                  </Row>
                                </div>
                              )}
                            </Card>
                          ))}
                        </Space>
                      </div>
                    )}
                  </Card>
                ))}
              </Space>
            </Card>
          </Space>
        </TabPane>

        {/* Lead Performance Tab */}
        <TabPane
          tab={
            <Space>
              <LineChartOutlined />
              <span>Lead Performance</span>
            </Space>
          }
          key="leadPerformance"
        >
          <Space direction="vertical" size={24} style={{ width: '100%' }}>
            {/* Overall Lead Performance */}
            <Card 
              title={
                <Space>
                  <AreaChartOutlined />
                  <span>Lead Performance by Admin</span>
                </Space>
              }
              style={{ borderRadius: 12 }}
            >
              <Row gutter={[16, 16]}>
                {superAdminData.admins.map((admin) => (
                  <Col xs={24} sm={12} md={8} key={admin.id}>
                    <Card
                      style={{ 
                        border: `2px solid ${admin.color}`,
                        borderRadius: 12,
                        background: `${admin.color}08`
                      }}
                      bodyStyle={{ padding: 16 }}
                    >
                      <Space direction="vertical" size={12} style={{ width: '100%' }}>
                        <Flex align="center" justify="space-between">
                          <Space>
                            <Avatar size={32} style={{ background: admin.color }}>{admin.name.charAt(0)}</Avatar>
                            <Text strong>{admin.name}</Text>
                          </Space>
                          <Text strong style={{ color: admin.color }}>{admin.leadPerformance.totalLeads} Leads</Text>
                        </Flex>
                        
                        <Divider style={{ margin: '8px 0' }} />
                        
                        <Space direction="vertical" size={8} style={{ width: '100%' }}>
                          <Flex justify="space-between">
                            <Text type="secondary" style={{ fontSize: 12 }}>Avg Lead Score</Text>
                            <Text strong style={{ fontSize: 16 }}>{admin.leadPerformance.avgLeadScore}</Text>
                          </Flex>
                          <Flex justify="space-between">
                            <Text type="secondary" style={{ fontSize: 12 }}>Score Trend</Text>
                            <Text strong style={{color: admin.leadPerformance.scoreTrend.startsWith('+') ? '#52C41A' : '#FF4D4F'}}>
                              {admin.leadPerformance.scoreTrend}
                            </Text>
                          </Flex>
                        </Space>
                        
                        <Divider style={{ margin: '8px 0' }} />
                        
                        <Text strong style={{ fontSize: 12, marginBottom: 8 }}>Lead Distribution</Text>
                        {Object.entries(admin.leadPerformance.distribution).slice(0, 3).map(([key, bucket]) => (
                          <Flex key={key} justify="space-between" style={{ marginBottom: 4 }}>
                            <Text type="secondary" style={{ fontSize: 11 }}>{key}</Text>
                            <Text strong style={{ fontSize: 11 }}>{bucket.count} ({bucket.percentage}%)</Text>
                          </Flex>
                        ))}
                      </Space>
                    </Card>
                  </Col>
                ))}
              </Row>
              
              <Divider />
              
              {/* Lead Source Performance */}
              <Title level={5} style={{ marginBottom: 16 }}>Lead Source Performance by Admin</Title>
              <Table
                dataSource={superAdminData.admins.flatMap(admin => 
                  admin.leadPerformance.sourcePerformance.map(source => ({
                    ...source,
                    admin: admin.name,
                    organization: admin.organization,
                    adminColor: admin.color
                  }))
                )}
                columns={[
                  {
                    title: 'Source',
                    dataIndex: 'source',
                    key: 'source',
                    render: (text) => <Text strong>{text}</Text>
                  },
                  {
                    title: 'Admin',
                    dataIndex: 'admin',
                    key: 'admin',
                    render: (text) => (<Tag color="blue">{text}</Tag>)
                  },
                  {
                    title: 'Organization',
                    dataIndex: 'organization',
                    key: 'organization',
                  },
                  {
                    title: 'Leads',
                    dataIndex: 'count',
                    key: 'count',
                  },
                  {
                    title: 'Avg Score',
                    dataIndex: 'avgScore',
                    key: 'avgScore',
                    render: (score) => (<Badge count={score} style={{  backgroundColor: score >= 80 ? '#52C41A' : score >= 70 ? '#FAAD14' : '#FF4D4F'}}/>)
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
                  }
                ]}
                pagination={{ pageSize: 10 }}
                rowKey={(record) => `${record.admin}-${record.source}`}
              />
            </Card>
          </Space>
        </TabPane>
      </Tabs>

      {/* Modals */}
      <AdminDetailModal />
      <ManagerDetailModal />
      <ExecutiveDetailModal />
    </div>
  );
};

export default SuperAdminDashboard;