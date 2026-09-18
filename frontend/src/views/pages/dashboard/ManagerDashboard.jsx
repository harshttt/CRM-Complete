import React, { useState } from "react";
import { Card, Row, Col, Progress, Tag, Typography, Select, Space, Tooltip, Badge, Statistic, Avatar, List, Button, Grid, Tabs, Table, Modal, Form, Input, DatePicker, Alert,Flex, Segmented, Radio, Timeline} from "antd";
import { CrownOutlined,  WarningOutlined, TrophyOutlined, ArrowUpOutlined, ArrowDownOutlined, FireOutlined, UserOutlined, TeamOutlined, DashboardOutlined, StarOutlined, RiseOutlined, InfoCircleOutlined,
  DownloadOutlined, PhoneOutlined, MailOutlined, CalendarOutlined, CheckCircleOutlined, ThunderboltOutlined, ShoppingCartOutlined, ClockCircleOutlined, PlusOutlined, BellOutlined, LineChartOutlined, TableOutlined,
  ExclamationCircleOutlined, UserAddOutlined, SyncOutlined, BarChartOutlined, PieChartOutlined, HeatMapOutlined, PercentageOutlined, EyeOutlined, EnvironmentOutlined, FieldTimeOutlined,DollarOutlined,
  DollarCircleOutlined, PlusCircleOutlined, MessageOutlined} from "@ant-design/icons";

// Missing icons (placeholder components)
const SnowOutlined = () => <span>❄️</span>;
const SleepOutlined = () => <span>💤</span>;

const { Title, Text } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;
const { useBreakpoint } = Grid;
const { TextArea } = Input;

/* ---------------- LEAD PERFORMANCE DATA ---------------- */

const leadPerformanceData = {
  // Lead distribution by score buckets
  leadDistribution: {
    buckets: [
      { label: "Sales Ready", count: 24, percentage: 28, color: "#52C41A", icon: <ThunderboltOutlined /> },
      { label: "High Intent", count: 32, percentage: 38, color: "#1890FF", icon: <RiseOutlined /> },
      { label: "Warm", count: 18, percentage: 21, color: "#FAAD14", icon: <FireOutlined /> },
      { label: "Cold", count: 8, percentage: 9, color: "#FF7A45", icon: <SnowOutlined /> },
      { label: "Dormant", count: 4, percentage: 4, color: "#8C8C8C", icon: <SleepOutlined /> }
    ],
    totalLeads: 86,
    avgScore: 72,
    scoreChange: "+12%",
    highScore: 96,
    lowScore: 15,
    trend: "improving"
  },

  // Lead metrics by source
  sourceMetrics: [
    { source: "Walk Ins", count: 18, avgScore: 88, conversionRate: "48%", revenue: "₹4.8 Cr", color: "#52C41A" },
    { source: "Referral", count: 24, avgScore: 82, conversionRate: "45%", revenue: "₹5.2 Cr", color: "#722ED1" },
    { source: "Phone Inquiry", count: 20, avgScore: 75, conversionRate: "38%", revenue: "₹3.6 Cr", color: "#1890FF" },
    { source: "Property Portal", count: 16, avgScore: 68, conversionRate: "32%", revenue: "₹2.8 Cr", color: "#2F54EB" },
    { source: "Website", count: 8, avgScore: 58, conversionRate: "28%", revenue: "₹1.2 Cr", color: "#EB2F96" }
  ],

  // Stage progression metrics
  stageMetrics: {
    current: {
      "New": 18,
      "Contacted": 24,
      "Interested": 22,
      "Qualified": 12,
      "Negotiation": 8,
      "Payment": 2
    },
    conversionRates: {
      "New → Contacted": "85%",
      "Contacted → Interested": "68%",
      "Interested → Qualified": "45%",
      "Qualified → Negotiation": "38%",
      "Negotiation → Payment": "25%",
      "Payment → Closed Won": "90%"
    },
    avgDaysInStage: {
      "New": 1.2,
      "Contacted": 3.5,
      "Interested": 7.2,
      "Qualified": 5.8,
      "Negotiation": 4.3,
      "Payment": 2.1
    }
  },

  // Lead scoring effectiveness
  scoringEffectiveness: {
    accuracy: 89,
    conversionPrediction: 82,
    hotLeadAccuracy: 91,
    warmLeadAccuracy: 76,
    falsePositives: 11,
    averageDaysToConvert: 26
  },

  // Top performing leads
  topPerformingLeads: [
    {
      id: 1,
      name: "Rajesh Mehta",
      source: "Walk In",
      score: 94,
      status: "Sales Ready",
      stage: "Negotiation",
      value: "₹4.2 Cr",
      owner: "Emma Wilson",
      daysInPipeline: 12,
      lastActivity: "2 hours ago",
      color: "#52C41A"
    },
    {
      id: 2,
      name: "Priya Sharma",
      source: "Referral",
      score: 88,
      status: "High Intent",
      stage: "Qualified",
      value: "₹3.8 Cr",
      owner: "Alex Johnson",
      daysInPipeline: 18,
      lastActivity: "Yesterday",
      color: "#1890FF"
    },
    {
      id: 3,
      name: "Vikram Patel",
      source: "Phone Inquiry",
      score: 82,
      status: "High Intent",
      stage: "Interested",
      value: "₹2.5 Cr",
      owner: "Mike Brown",
      daysInPipeline: 8,
      lastActivity: "Today",
      color: "#1890FF"
    },
    {
      id: 4,
      name: "Anjali Reddy",
      source: "Property Portal",
      score: 76,
      status: "Warm",
      stage: "Contacted",
      value: "₹1.8 Cr",
      owner: "Sarah Lee",
      daysInPipeline: 15,
      lastActivity: "3 days ago",
      color: "#FAAD14"
    }
  ],

  // Lead trends
  trends: {
    dailyLeadsAdded: 8,
    weeklyGrowth: "+15%",
    avgResponseTime: "4.2 min",
    hotLeadsThisWeek: 12,
    conversionsThisWeek: 6,
    revenueImpact: "₹8.4 Cr"
  }
};

/* ---------------- COMPONENTS FOR LEAD PERFORMANCE ---------------- */

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
            <Avatar size={isLarge ? 44 : 36} style={{ background: `${color}15`, color }}>
              {icon}
            </Avatar>
            {trend && (
              <Badge 
                count={
                  <Text style={{ 
                    fontSize: 11,
                    color: trend > 0 ? '#52C41A' : '#FF4D4F'
                  }}>
                    {trend > 0 ? '+' : ''}{trend}%
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

const ScoreBucketCard = ({ bucket, onClick }) => (
  <Card
    hoverable
    onClick={onClick}
    style={{ 
      borderRadius: 12,
      border: `2px solid ${bucket.color}`,
      background: `${bucket.color}08`,
      height: '90%'
    }}
    bodyStyle={{ padding: 16 }}
  >
    <Space direction="vertical" align="center" size={12} style={{ width: '100%', textAlign: 'center' }}>
      <Avatar size={48} style={{ background: bucket.color }}>
        {bucket.icon}
      </Avatar>
      
      <Space direction="vertical" size={4}>
        <Text strong style={{ fontSize: 16, color: bucket.color }}>{bucket.label}</Text>
        <Text type="secondary" style={{ fontSize: 12 }}>
          ≥ {bucket.label === 'Sales Ready' ? '80' : 
              bucket.label === 'High Intent' ? '60' : 
              bucket.label === 'Warm' ? '40' : 
              bucket.label === 'Cold' ? '20' : '0'} pts
        </Text>
      </Space>
      
      <Space direction="vertical" size={2}>
        <Text strong style={{ fontSize: 24 }}>{bucket.count}</Text>
        <Text type="secondary" style={{ fontSize: 12 }}>{bucket.percentage}% of leads</Text>
      </Space>
      
      <Progress
        percent={bucket.percentage}
        strokeColor={bucket.color}
        trailColor={`${bucket.color}30`}
        showInfo={false}
        style={{ width: '80%' }}
      />
    </Space>
  </Card>
);

const SourcePerformanceCard = ({ source, onClick }) => (
  <Card
    hoverable
    onClick={onClick}
    style={{ 
      borderRadius: 12,
      border: `1px solid ${source.color}30`,
      background: '#fff',
      height: '100%'
    }}
    bodyStyle={{ padding: 16 }}
  >
    <Space direction="vertical" size={12} style={{ width: '100%' }}>
      <Flex align="center" justify="space-between">
        <Space direction="vertical" size={2}>
          <Text strong style={{ fontSize: 14 }}>{source.source}</Text>
          <Text type="secondary" style={{ fontSize: 11 }}>{source.count} leads</Text>
        </Space>
        <Badge
          count={`${source.avgScore}`}
          style={{ 
            backgroundColor: source.color,
            fontWeight: 'bold'
          }}
        />
      </Flex>
      
      <Progress
        percent={parseInt(source.conversionRate)}
        strokeColor={source.color}
        trailColor={`${source.color}20`}
        showInfo={false}
      />
      
      <Flex justify="space-between" align="center">
        <Text type="secondary" style={{ fontSize: 11 }}>Conversion Rate</Text>
        <Text strong style={{ fontSize: 14, color: source.color }}>{source.conversionRate}</Text>
      </Flex>
      
      <Divider style={{ margin: '8px 0' }} />
      
      <Flex justify="space-between">
        <Text type="secondary" style={{ fontSize: 10 }}>Revenue Impact</Text>
        <Text strong style={{ fontSize: 12 }}>{source.revenue}</Text>
      </Flex>
    </Space>
  </Card>
);

const StageConversionCard = ({ stage, conversion, avgDays }) => {
  const percentage = parseInt(conversion);
  const color = percentage >= 50 ? '#52C41A' : percentage >= 30 ? '#FAAD14' : '#FF4D4F';
  
  return (
    <Card
      size="small"
      style={{ 
        borderRadius: 8,
        border: `1px solid ${color}30`,
        background: '#fff',
        height: '100%'
      }}
      bodyStyle={{ padding: 12 }}
    >
      <Space direction="vertical" size={8} style={{ width: '100%' }}>
        <Flex align="center" justify="space-between">
          <Text strong style={{ fontSize: 12 }}>{stage}</Text>
          <Badge
            count={percentage}
            style={{ 
              backgroundColor: color,
              fontSize: 11
            }}
          />
        </Flex>
        
        <Progress
          percent={percentage}
          strokeColor={color}
          trailColor={`${color}15`}
          showInfo={false}
          size="small"
        />
        
        <Flex justify="space-between" align="center">
          <Text type="secondary" style={{ fontSize: 10 }}>Conversion</Text>
          <Text strong style={{ fontSize: 12, color }}>{conversion}</Text>
        </Flex>
        
        {avgDays && (
          <Text type="secondary" style={{ fontSize: 10 }}>
            Avg: {avgDays} days
          </Text>
        )}
      </Space>
    </Card>
  );
};

const LeadScoreCard = ({ lead, onClick }) => {
  return (
    <Card
      style={{
        borderRadius: 12,
        borderLeft: `4px solid ${lead.color}`,
        marginBottom: 12,
        background: '#fff'
      }}
      bodyStyle={{ padding: 16 }}
    >
      <Row gutter={16} align="middle">
        <Col span={4}>
          <Space direction="vertical" align="center">
            <Avatar 
              size={48} 
              style={{ 
                background: lead.color,
                fontSize: 20,
                fontWeight: 'bold'
              }}
            >
              {lead.name.charAt(0)}
            </Avatar>
            <Tag color={lead.color} style={{ marginTop: 4 }}>
              {lead.status}
            </Tag>
          </Space>
        </Col>
        
        <Col span={14}>
          <Space direction="vertical" size={2}>
            <Flex align="center" gap={8}>
              <Text strong style={{ fontSize: 16 }}>{lead.name}</Text>
              <Tag color="blue">{lead.owner}</Tag>
            </Flex>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {lead.source} • Stage: {lead.stage}
            </Text>
            <Flex gap={8} style={{ marginTop: 8 }}>
              <Tag color="gold">{lead.source}</Tag>
              <Tag color="purple">{lead.stage}</Tag>
              <Tag color="green">{lead.value}</Tag>
            </Flex>
          </Space>
        </Col>
        
        <Col span={6}>
          <Space direction="vertical" align="end" size={2}>
            <Text type="secondary" style={{ fontSize: 12 }}>Lead Score</Text>
            <Statistic
              value={lead.score}
              valueStyle={{ 
                fontSize: 32,
                color: lead.color,
                fontWeight: 'bold'
              }}
            />
            <Text type="secondary" style={{ fontSize: 10 }}>
              {lead.daysInPipeline} days in pipeline
            </Text>
          </Space>
        </Col>
      </Row>
    </Card>
  );
};

/* ---------------- MAIN MANAGER DASHBOARD COMPONENT ---------------- */

 const ManagerDashboardMain = () => {
    const [activeTab, setActiveTab] = useState('leadPerformance');
    const [selectedMember, setSelectedMember] = useState(null);
    const [showMemberModal, setShowMemberModal] = useState(false);
    const [showCoachingModal, setShowCoachingModal] = useState(false);
    const [showTeamReportModal, setShowTeamReportModal] = useState(false);
    const [timeRange, setTimeRange] = useState('week');
    const [loading, setLoading] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const [expandedRows, setExpandedRows] = useState([]);
    const [selectedBucket, setSelectedBucket] = useState(null);
    const [selectedSource, setSelectedSource] = useState(null);

    const screens = useBreakpoint();

    // Dashboard stats
    const stats = {
      teamName: "North Zone A",
      members: 8,
      activeDeals: 34,
      meetingsToday: 9,
      teamMembers: 12,
      winRate: 32,
    };

    // Upcoming meetings
    const upcomingMeetings = [
      {title: "Site visit - Galaxy Heights", time: "11:00 AM", owner: "Rahul"},
      {title: "Zoom call - NRI client (UK)", time: "2:30 PM", owner: "Anita"},
      {title: "Negotiation - Prime Residency", time: "5:00 PM", owner: "Vivek"},
    ];

    // Quick actions
    const quickActions = [
      { label: "View Leads", icon: <UserAddOutlined />, link:'/lead-management/leads' },
      { label: "View Task", icon: <PlusCircleOutlined />, link:'/tasks' },
      { label: "View Report", icon: <LineChartOutlined />, link:'/reports' },
    ];

    // Manager and team data for scoreboard
    const managerData = {
      manager: {
        name: 'Sarah Chen',
        avatar: 'SC',
        role: 'Sales Manager',
        team: 'Enterprise Sales',
        teamSize: 8,
        region: 'North America',
        tenure: '2.5 years',
        email: 'sarah.chen@company.com',
        performance: 'High Performer',
        teamRank: 3,
        totalTeams: 12
      },
      
      // Team performance overview
      teamOverview: {
        teamAverageScore: 76,
        teamSize: 8,
        weeklyChange: '+5%',
        monthlyChange: '+12%',
        revenue: '$1.2M',
        conversionRate: '24%',
        avgResponseTime: '4.8 min',
        winRate: '28%',
        hotLeads: 18,
        tasksCompleted: 42,
        meetingsToday: 9,
        
        performanceDistribution: {
          rockstars: 2,
          highPerformers: 3,
          consistent: 2,
          needsImprovement: 1,
          riskZone: 0
        },
        
        scoreBreakdown: {
          avgAVS: 32,
          avgTDS: 20,
          avgSLS: 8,
          avgLPES: 22,
          avgCRB: 4,
          avgCQS: 5
        }
      },
      
      // Team members data with scoring metrics
      teamMembers: [
        {
          id: 'SP001',
          name: 'Emma Wilson',
          avatar: 'EW',
          role: 'Senior Sales Executive',
          dailyScore: 92,
          weeklyAvg: 88,
          rating: 'Rockstar',
          ranking: 1,
          revenue: '$450K',
          status: 'exceeding',
          alerts: 0,
          coachingNeeded: false,
          lastCoaching: '1 week ago',
          
          // Performance metrics
          metrics: {
            leads: 15,
            calls: 10, 
            emails: 15, 
            meetings: 3, 
            tasks: 5,
            responseTime: '2 min'
          },
          
          // Scoring breakdown
          scores: {
            avs: { score: 38, max: 40, progress: 95, breakdown: { calls: 8, emails: 12, messages: 6, comments: 4, followups: 5, reminders: 3 } },
            tds: { score: 28, max: 30, progress: 93, breakdown: { onTime: 5, late: 0, missed: 0, urgent: 1 } },
            sls: { score: 15, max: 15, progress: 100, breakdown: { under5min: 5, under15min: 3, under60min: 2, over60min: 0 } },
            lpes: { score: 35, max: 35, progress: 100, breakdown: { progressed: 3, meetings: 2, siteVisits: 1, qualified: 2, closed: 1 } },
            crb: { score: 8, max: 10, progress: 80 },
            cqs: { score: 8, max: 10, progress: 80 }
          },
          
          // Recent activities
          recentActivities: [
            { id: 1, action: 'Closed Deal: TechCorp', type: 'success', time: '2 hours ago', points: '+30' },
            { id: 2, action: 'Site Visit: Global Systems', type: 'meeting', time: 'Yesterday', points: '+12' },
            { id: 3, action: 'Qualified Lead: Innovate Co.', type: 'lead', time: '2 days ago', points: '+15' }
          ]
        },
        {
          id: 'SP002',
          name: 'Alex Johnson',
          avatar: 'AJ',
          role: 'Senior Sales Executive',
          dailyScore: 85,
          weeklyAvg: 82,
          rating: 'High Performer',
          ranking: 2,
          revenue: '$350K',
          status: 'meeting',
          alerts: 1,
          coachingNeeded: false,
          lastCoaching: '2 weeks ago',
          
          metrics: {
            leads: 12,
            calls: 8, 
            emails: 12, 
            meetings: 2, 
            tasks: 4,
            responseTime: '4 min'
          },
          
          scores: {
            avs: { score: 35, max: 40, progress: 88, breakdown: { calls: 8, emails: 12, messages: 5, comments: 3, followups: 4, reminders: 3 } },
            tds: { score: 24, max: 25, progress: 96, breakdown: { onTime: 4, late: 0, missed: 0, urgent: 0 } },
            sls: { score: 10, max: 15, progress: 67, breakdown: { under5min: 3, under15min: 2, under60min: 1, over60min: 0 } },
            lpes: { score: 25, max: 25, progress: 100, breakdown: { progressed: 2, meetings: 1, siteVisits: 1, qualified: 1, closed: 0 } },
            crb: { score: 5, max: 10, progress: 50 },
            cqs: { score: 6, max: 10, progress: 60 }
          }
        },
        {
          id: 'SP003',
          name: 'Mike Brown',
          avatar: 'MB',
          role: 'Sales Executive',
          dailyScore: 62,
          weeklyAvg: 58,
          rating: 'Consistent',
          ranking: 7,
          revenue: '$85K',
          status: 'below',
          alerts: 3,
          coachingNeeded: true,
          coachingType: 'AVS-LPES mismatch',
          lastCoaching: 'Yesterday',
          
          metrics: {
            leads: 8,
            calls: 6, 
            emails: 8, 
            meetings: 1, 
            tasks: 3,
            responseTime: '15 min'
          },
          
          scores: {
            avs: { score: 28, max: 40, progress: 70, breakdown: { calls: 6, emails: 8, messages: 4, comments: 2, followups: 3, reminders: 2 } },
            tds: { score: 12, max: 25, progress: 48, breakdown: { onTime: 2, late: 1, missed: 0, urgent: 0 } },
            sls: { score: 5, max: 15, progress: 33, breakdown: { under5min: 1, under15min: 2, under60min: 1, over60min: 0 } },
            lpes: { score: 15, max: 25, progress: 60, breakdown: { progressed: 1, meetings: 0, siteVisits: 0, qualified: 1, closed: 0 } },
            crb: { score: 2, max: 10, progress: 20 },
            cqs: { score: 0, max: 10, progress: 0 }
          }
        }
      ],
      
      // Team alerts and coaching flags
      teamAlerts: [
        {
          id: 1,
          type: 'warning',
          title: 'AVS-LPES Mismatch',
          description: 'Mike Brown has high activity volume but low lead progression',
          priority: 'high',
          member: 'Mike Brown',
          time: 'Today',
          status: 'pending',
          icon: <WarningOutlined />
        },
        {
          id: 2,
          type: 'warning',
          title: 'Performance Alert',
          description: 'Alex Johnson DSS < 40 for 3 consecutive days',
          priority: 'medium',
          member: 'Alex Johnson',
          time: 'Yesterday',
          status: 'addressed',
          icon: <BellOutlined />
        },
        {
          id: 3,
          type: 'success',
          title: 'Incentive Qualified',
          description: 'Emma Wilson qualifies for top 10% bonus',
          priority: 'low',
          member: 'Emma Wilson',
          time: 'Today',
          status: 'resolved',
          icon: <TrophyOutlined />
        }
      ],
      
      // Coaching sessions
      coachingSessions: [
        {
          id: 1,
          member: 'Mike Brown',
          date: 'Today, 11:00 AM',
          type: 'AVS-LPES Coaching',
          duration: '30 mins',
          coach: 'Sarah Chen',
          status: 'scheduled',
          notes: 'Focus on quality over quantity'
        },
        {
          id: 2,
          member: 'Robert Kim',
          date: 'Tomorrow, 2:00 PM',
          type: 'Response Time Coaching',
          duration: '45 mins',
          coach: 'Sarah Chen',
          status: 'scheduled',
          notes: 'Speed-to-lead improvement strategies'
        }
      ]
    };

    // Performance bucket colors
    const ratingColors = {
      'Rockstar': '#FFD700',
      'High Performer': '#52C41A',
      'Consistent': '#1890FF',
      'Needs Improvement': '#FAAD14',
      'Risk Zone': '#FF4D4F'
    };

    // Team member status colors
    const statusColors = {
      'exceeding': '#52C41A',
      'meeting': '#1890FF',
      'below': '#FAAD14',
      'at-risk': '#FF4D4F'
    };

    // Alert priority colors
    const priorityColors = {
      'high': '#FF4D4F',
      'medium': '#FAAD14',
      'low': '#1890FF'
    };

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
              <Tag 
                color={change.startsWith('+') ? 'success' : 'error'} 
                style={{ alignSelf: 'flex-start', fontSize: 11, borderRadius: 999 }}
              >
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
              <Avatar size={28} style={{ background: `${color}15`, color }}>{icon}</Avatar>
              <Space direction="vertical" size={0}>
                <Text strong style={{ fontSize: 11, color: '#666' }}>{label}</Text>
                <Text strong style={{ fontSize: 14, color }}>{score}/{max}</Text>
              </Space>
            </Space>
            <Tag color={progress >= 90 ? 'success' : progress >= 70 ? 'warning' : 'error'}>{progress}%</Tag>
          </Flex>
          
          <Progress percent={progress} strokeColor={color} trailColor={`${color}15`} showInfo={false} size="small" />

        </Space>
      </Card>
    );

    const handleRefresh = () => {
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
      }, 1000);
    };

    const handleExportTeamReport = () => {
      setShowTeamReportModal(true);
    };

    // Expanded row renderer for team members
    const expandedRowRender = (record) => (
      <div style={{ padding: '16px 24px', background: '#fafafa', borderRadius: 8 }}>
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Title level={5} style={{ marginBottom: 8 }}>Performance Breakdown</Title>
          </Col>
          
          {Object.entries(record.scores).map(([key, score], idx) => {
            const scoreLabels = {
              avs: { label: 'Activity Volume', icon: <MessageOutlined />, color: '#1890FF' },
              tds: { label: 'Task Discipline', icon: <CheckCircleOutlined />, color: '#52C41A' },
              sls: { label: 'Speed to Lead', icon: <ClockCircleOutlined />, color: '#722ED1' },
              lpes: { label: 'Lead Progression', icon: <RiseOutlined />, color: '#13C2C2' },
              crb: { label: 'Client Response', icon: <PhoneOutlined />, color: '#FAAD14' },
              cqs: { label: 'Quality Score', icon: <StarOutlined />, color: '#EB2F96' }
            };
            
            return (
              <Col xs={24} sm={12} md={8} key={key}>
                <ScoreProgress
                  label={scoreLabels[key]?.label || key.toUpperCase()}
                  score={score.score}
                  max={score.max}
                  progress={score.progress}
                  color={scoreLabels[key]?.color || '#1890FF'}
                  icon={scoreLabels[key]?.icon || <InfoCircleOutlined />}
                />
              </Col>
            );
          })}
        </Row>
      </div>
    );

    // Team member columns
    const teamMemberColumns = [
      {
        title: 'Rank',
        key: 'ranking',
        width: 80,
        fixed: 'left',
        render: (_, record) => (
          <Badge
            count={record.ranking}
            style={{
              backgroundColor: 
                record.ranking === 1 ? '#FFD700' : 
                record.ranking === 2 ? '#C0C0C0' : 
                record.ranking === 3 ? '#CD7F32' : '#f0f0f0',
              color: record.ranking <= 3 ? '#000' : '#666'
            }}
          />
        )
      },
      {
        title: 'Team Member',
        dataIndex: 'name',
        key: 'name',
        fixed: 'left',
        width: 200,
        render: (text, record) => (
          <Space direction="vertical" size={2} style={{ textAlign: 'left' }}>
            <Space size={6}>
              <Avatar 
                size={32}
                style={{ 
                  backgroundColor: ratingColors[record.rating],
                  color: record.rating === 'Rockstar' ? '#000' : '#fff'
                }}
              >
                {record.avatar}
              </Avatar>
              <div>
                <Text strong>{text}</Text>
                <div>
                  <Text type="secondary" style={{ fontSize: 11 }}>{record.role}</Text>
                </div>
              </div>
            </Space>
            <Space size={6} wrap>
              <Tag color={ratingColors[record.rating]} style={{ borderRadius: 999, fontSize: 10 }}>{record.rating}</Tag>
              {record.coachingNeeded && ( <Tag icon={<WarningOutlined />} color="orange" style={{ borderRadius: 999, fontSize: 10 }}>Needs Coaching</Tag>)}
            </Space>
          </Space>
        )
      },
      {
        title: 'Daily Score',
        dataIndex: 'dailyScore',
        key: 'score',
        width: 120,
        sorter: (a, b) => a.dailyScore - b.dailyScore,
        render: (score, record) => (
          <Space direction="vertical" size={2}>
            <Progress 
              percent={score} 
              size="small" 
              showInfo={false}
              strokeColor={ratingColors[record.rating]}
              style={{ width: 100 }}
            />
            <Text strong style={{ color: ratingColors[record.rating], fontSize: 12 }}>{score}/100</Text>
          </Space>
        )
      },
      {
        title: 'Activity Metrics',
        key: 'metrics',
        width: 180,
        render: (_, record) => (
          <Space size={4} wrap>
            <Tooltip title="Leads">
              <Tag style={{ fontSize: 10, padding: '2px 6px' }}>
                <UserOutlined /> {record.metrics.leads}
              </Tag>
            </Tooltip>
            <Tooltip title="Calls">
              <Tag style={{ fontSize: 10, padding: '2px 6px' }}>
                <PhoneOutlined /> {record.metrics.calls}
              </Tag>
            </Tooltip>
            <Tooltip title="Emails">
              <Tag style={{ fontSize: 10, padding: '2px 6px' }}>
                <MailOutlined /> {record.metrics.emails}
              </Tag>
            </Tooltip>
            <Tooltip title="Response Time">
              <Tag style={{ fontSize: 10, padding: '2px 6px' }}>
                <ClockCircleOutlined /> {record.metrics.responseTime}
              </Tag>
            </Tooltip>
          </Space>
        )
      },
      {
        title: 'Status',
        dataIndex: 'status',
        key: 'status',
        width: 100,
        render: (status) => {
          const statusMap = {
            'exceeding': { text: 'Exceeding', color: '#52C41A' },
            'meeting': { text: 'Meeting', color: '#1890FF' },
            'below': { text: 'Below', color: '#FAAD14' },
            'at-risk': { text: 'At Risk', color: '#FF4D4F' }
          };
          return (<Tag color={statusMap[status]?.color} style={{ borderRadius: 999, fontSize: 10 }}>  {statusMap[status]?.text} </Tag>);
        }
      },
      {
        title: 'Action',
        key: 'action',
        width: 120,
        fixed: 'right',
        render: (_, record) => (
          <Space>
            <Button type="link" size="small" icon={<EyeOutlined />}
              onClick={() => {
                setSelectedMember(record);
                setShowMemberModal(true);
              }}
            >
              View
            </Button>
            {record.coachingNeeded && (
              <Button type="primary" size="small"
                onClick={() => {
                  setSelectedMember(record);
                  setShowCoachingModal(true);
                }}
              >
                Coach
              </Button>
            )}
          </Space>
        )
      }
    ];

    // KpiCard Component (placeholder for overview tab)
    const KpiCard = ({ title, value, accent, badge, icon }) => (
      <Card size="small" style={{ borderRadius: 12 }}>
        <Space direction="vertical" size={4}>
          <Space>
            <Avatar size={36} style={{ background: `${accent}15`, color: accent }}>{icon}</Avatar>
            <Text type="secondary" style={{ fontSize: 12 }}>{title}</Text>
          </Space>
          <Title level={3} style={{ margin: 0, color: accent }}>{value}</Title>
          {badge && <Tag color="default" style={{ fontSize: 10 }}>{badge}</Tag>}
        </Space>
      </Card>
    );

    return (
      <div style={{ 
        background: '#f8f9fa',
        minHeight: '100vh',
        padding: screens.xs ? 16 : 24
      }}>
        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <Flex align="center" justify="space-between" wrap="wrap" gap={16}>
            <Space direction="vertical" size={4}>
              <Title level={3} style={{ margin: 0, color: '#1e293b' }}>
                <TeamOutlined style={{ marginRight: 8 }} />
                Manager Dashboard
              </Title>
              <Text type="secondary" style={{ fontSize: 14 }}>Monitor your team pipeline, meetings and conversions</Text>
            </Space>
            
          </Flex>
        </div>

        {/* Manager Profile Card */}
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
                  color: 'white',
                  fontSize: 24,
                  fontWeight: 'bold'
                }}
              >
                {managerData.manager.avatar}
              </Avatar>
              <Space direction="vertical" size={4}>
                <Title level={3} style={{ margin: 0, color: 'white' }}>{managerData.manager.name}</Title>
                <Text style={{ color: 'rgba(255,255,255,0.9)' }}>{managerData.manager.role} • {managerData.manager.team}</Text>
                <Space size={16}>
                  <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12 }}>
                    <TeamOutlined /> {managerData.manager.teamSize} members
                  </Text>
                  <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12 }}>
                    <EnvironmentOutlined /> {managerData.manager.region}
                  </Text>
                  <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12 }}>
                    <FieldTimeOutlined /> Rank {managerData.manager.teamRank} of {managerData.manager.totalTeams}
                  </Text>
                </Space>
              </Space>
            </Space>
            <Space direction="vertical" align="end">
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
                {managerData.manager.performance}
              </Tag>
              <Text style={{ color: 'white', fontSize: 12 }}>Team Average Score</Text>
              <Statistic
                value={managerData.teamOverview.teamAverageScore}
                suffix="/100"
                valueStyle={{fontSize: 32, fontWeight: 'bold', color: 'white', lineHeight: 1}}
              />
            </Space>
          </Flex>
        </Card>

            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12} md={6}>
                <KpiCard title="Total Leads" value={stats.activeDeals} accent="#2f54eb" badge="In current pipeline" icon={<ShoppingCartOutlined />} />
              </Col>
              <Col xs={24} sm={12} md={6}>
                <KpiCard title="Team Members" value={stats.teamMembers} accent="#13c2c2" badge="Overall" icon={<DollarCircleOutlined />} />
              </Col>
              <Col xs={24} sm={12} md={6}>
                <KpiCard title="Meetings Today" value={stats.meetingsToday} accent="#fa8c16" badge="Across your team" icon={<CalendarOutlined />}/>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <KpiCard title="Team Win Rate" value={stats.winRate} accent="#52c41a" badge="Last 30 days"icon={<PercentageOutlined />} />
              </Col>
            </Row>

            <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
              <Col xs={24} md={14}>
                <Card bordered={false} size="small"
                  title={<Space align="center"> <LineChartOutlined /> Team Pipeline by Stage</Space> }
                  style={{borderRadius: 16,boxShadow: "0 8px 24px rgba(15,23,42,0.08)",}}
                  bodyStyle={{padding:14}}
                >
                  <div
                    style={{textAlign: "center", padding: 40, color: "#aaa", borderRadius: 12, border: "1px dashed #e5e7eb",
                      background:"repeating-linear-gradient(45deg,#fafafa,#fafafa 10px,#ffffff 10px,#ffffff 20px)",
                    }}
                  >
                    {/* (Bar chart: New → Contacted → Meeting → Visited → Won) */}
                    <div style={{ fontSize: 14, color: '#666' }}>Pipeline visualization would appear here</div>
                  </div>
                </Card>
              </Col>
              <Col xs={24} md={10}>
                <Space direction="vertical" size="middle" style={{ width: "100%" }}>
                  <Card
                    bordered={false}
                    size="small"
                    title={<Space align="center"> <CalendarOutlined /> Today's Meetings </Space>}
                    style={{borderRadius: 16, boxShadow: "0 8px 24px rgba(15,23,42,0.08)",}}
                    bodyStyle={{padding:12}}
                  >
                    <List
                      size="small"
                      dataSource={upcomingMeetings}
                      renderItem={(m, idx) => (
                        <List.Item style={{borderRadius: 10, paddingInline: 8, background: idx === 0 ? "#f0f5ff" : "transparent",}}>
                          <Space>
                            <Avatar size={26} style={{background: "#e6f4ff", color: "#1d39c4", fontSize: 12}}>
                              <CalendarOutlined />
                            </Avatar>
                            <Space direction="vertical" size={0}>
                              <Text style={{ fontSize: 12 }}>{m.title}</Text>
                              <Text type="secondary" style={{ fontSize: 11 }}> {m.time} · {m.owner}</Text>
                            </Space>
                          </Space>
                        </List.Item>
                      )}
                    />
                  </Card>

                  <Card bordered={false} size="small"
                    title={<Space align="center"><ThunderboltOutlined /> Team Quick Actions</Space>}
                    style={{borderRadius: 16, boxShadow: "0 8px 24px rgba(15,23,42,0.08)"}}
                    bodyStyle={{padding:14}}
                  >
                    <Row gutter={[12, 12]}>
                      {quickActions.map((a, idx) => (
                        <Col xs={12} key={idx}>
                          <Button href={a?.link} block icon={a.icon} style={{ borderRadius: 14, padding: "10px 4px"}}>
                            <span style={{ fontSize: 12 }}>{a.label}</span>
                          </Button>
                        </Col>
                      ))}
                    </Row>
                  </Card>
                </Space>
              </Col>
            </Row>

        {/* Modals */}
        <Modal
          title={
            <Space>
              <UserOutlined />
              <span>Member Performance Details</span>
            </Space>
          }
          open={showMemberModal}
          onCancel={() => setShowMemberModal(false)}
          width={800}
          footer={[
            <Button key="close" onClick={() => setShowMemberModal(false)}>Close</Button>,
            <Button key="coaching" type="primary"
              onClick={() => {
                setShowMemberModal(false);
                setShowCoachingModal(true);
              }}
            >
              Schedule Coaching
            </Button>
          ]}
          styles={{ body: { paddingTop: 24 } }}
        >
          {selectedMember && (
            <>
              {/* Member Header */}
              <div style={{
                background: 'linear-gradient(90deg, rgba(240,245,255,0.9), rgba(255,255,255,0.95))',
                borderRadius: 12,
                padding: 20,
                marginBottom: 24,
                border: '1px solid #f0f2ff'
              }}>
                <Row align="middle" gutter={[24, 16]}>
                  <Col flex="none">
                    <Avatar 
                      size={64} 
                      style={{ 
                        backgroundColor: ratingColors[selectedMember.rating],
                        color: selectedMember.rating === 'Rockstar' ? '#000' : '#fff',
                        fontSize: 24,
                        fontWeight: 'bold'
                      }}
                    >
                      {selectedMember.avatar}
                    </Avatar>
                  </Col>
                  <Col flex="auto">
                    <Space direction="vertical" size={2}>
                      <Flex align="center" gap={12}>
                        <Title level={4} style={{ margin: 0 }}>{selectedMember.name}</Title>
                        <Tag 
                          color={ratingColors[selectedMember.rating]}
                          style={{ fontSize: 14, padding: '4px 12px', borderRadius: 999, fontWeight: 'bold'}}
                        >
                          {selectedMember.rating}
                        </Tag>
                      </Flex>
                      <Text type="secondary">{selectedMember.role}</Text>
                      <Space size={16}>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          <TrophyOutlined /> Rank: #{selectedMember.ranking}
                        </Text>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          <DollarOutlined /> Revenue: {selectedMember.revenue}
                        </Text>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          <ClockCircleOutlined /> Response: {selectedMember.metrics.responseTime}
                        </Text>
                      </Space>
                    </Space>
                  </Col>
                  <Col flex="none">
                    <Statistic
                      title="Daily Score"
                      value={selectedMember.dailyScore}
                      suffix="/100"
                      valueStyle={{ 
                        fontSize: 36,
                        fontWeight: 'bold',
                        color: ratingColors[selectedMember.rating]
                      }}
                    />
                  </Col>
                </Row>
              </div>

              <Divider style={{ margin: '12px 0' }} />

              {/* Performance Breakdown */}
              <Row gutter={[16, 16]}>
                <Col span={24}>
                  <Title level={5} style={{ marginBottom: 10 }}>Performance Score Breakdown</Title>
                </Col>
                
                {Object.entries(selectedMember.scores).map(([key, score]) => {
                  const scoreLabels = {
                    avs: { label: 'Activity Volume Score', icon: <MessageOutlined />, color: '#1890FF' },
                    tds: { label: 'Task Discipline Score', icon: <CheckCircleOutlined />, color: '#52C41A' },
                    sls: { label: 'Speed to Lead Score', icon: <ClockCircleOutlined />, color: '#722ED1' },
                    lpes: { label: 'Lead Progression Score', icon: <RiseOutlined />, color: '#13C2C2' },
                    crb: { label: 'Client Response Bonus', icon: <PhoneOutlined />, color: '#FAAD14' },
                    cqs: { label: 'Conversation Quality Score', icon: <StarOutlined />, color: '#EB2F96' }
                  };
                  
                  return (
                    <Col xs={24} sm={12} md={8} key={key}>
                      <ScoreProgress
                        label={scoreLabels[key]?.label || key.toUpperCase()}
                        score={score.score}
                        max={score.max}
                        progress={score.progress}
                        color={scoreLabels[key]?.color || '#1890FF'}
                        icon={scoreLabels[key]?.icon || <InfoCircleOutlined />}
                      />
                    </Col>
                  );
                })}
              </Row>
            </>
          )}
        </Modal>

        {/* Coaching Session Modal */}
        <Modal
          title="Schedule Meeting"
          open={showCoachingModal}
          onCancel={() => setShowCoachingModal(false)}
          width={600}
          footer={[
            <Button key="cancel" onClick={() => setShowCoachingModal(false)}>Cancel</Button>,
            <Button key="submit" type="primary" onClick={() => setShowCoachingModal(false)}>Schedule Meeting</Button>
          ]}
          styles={{ body: { paddingTop: 24 } }}
        >
          <Form layout="vertical">
            <Form.Item label="Team Member" required>
              <Select 
                placeholder="Select team member" 
                style={{ borderRadius: 8 }}
                defaultValue={selectedMember?.id}
              >
                {managerData.teamMembers.map(member => (<Option key={member.id} value={member.id}>{member.name} ({member.role})</Option> ))}
              </Select>
            </Form.Item>

            <Form.Item label="Coaching Type" required>
              <Select placeholder="Select coaching type" style={{ borderRadius: 8 }} 
              options={[
                {label:'Performance Review', value:'performance-review'},
                {label:'AVS-LPES Mismatch Coaching', value:'avs-lpes-coaching'},
                {label:'Response Time Improvement', value:'response-time'},
                {label:'Task Management', value:'task-management'},
                {label:'Closing Skills', value:'closing-skills'},
                {label:'Other', value:'other'},
                ]}
                />
            </Form.Item>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item label="Date" required>
                  <DatePicker style={{ width: '100%', borderRadius: 8 }} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Time" required>
                  <DatePicker.TimePicker style={{ width: '100%', borderRadius: 8 }} />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item label="Duration">
              <Select defaultValue="30" style={{ borderRadius: 8 }}
                options={[
                  {label:'15 minutes', value:'15'},
                  {label:'30 minutes', value:'30'},
                  {label:'45 minutes', value:'45'},
                  {label:'60 minutes', value:'60'},
                ]}
               />
            </Form.Item>

            <Form.Item label="Coaching Focus Areas">
              <Select
                mode="multiple"
                placeholder="Select focus areas"
                style={{ borderRadius: 8 }}
                options={[
                  {label:'Activity Volume', value:'activity-volumne'},
                  {label:'Lead Progression', value:'lead-progression'},
                  {label:'Response Time', value:'response-time'},
                  {label:'Task Completion', value:'task-completion'},
                  {label:'Client Communication', value:'client-communication'},
                  {label:'Closing Skills', value:'closing-skills'},
                ]}
              />
            </Form.Item>

            <Form.Item label="Notes">
              <TextArea rows={4} placeholder="Add notes about what to discuss..." style={{ borderRadius: 8 }} />
            </Form.Item>
          </Form>
        </Modal>

        {/* Team Report Modal */}
        <Modal
          title="Generate Team Report"
          open={showTeamReportModal}
          onCancel={() => setShowTeamReportModal(false)}
          width={500}
          footer={[
            <Button key="cancel" onClick={() => setShowTeamReportModal(false)}>Cancel</Button>,
            <Button key="generate" type="primary"
              onClick={() => {
                setShowTeamReportModal(false);
              }}
            >
              Generate Report
            </Button>
          ]}
          styles={{ body: { paddingTop: 24 } }}
        >
          <Space direction="vertical" style={{ width: '100%' }}>
            <Card title="Report Options" size="small" style={{ borderRadius: 12 }}>
              <Form layout="vertical">
                <Form.Item label="Report Type">
                  <Select defaultValue="performance" style={{ borderRadius: 8 }} 
                  options={[
                    {label:'Performance Report', value:'performance-report'},
                    {label:'Coaching Report', value:'coaching-report'},
                    {label:'Revenue Report', value:'revenue-report'},
                    ]}
                    />
                </Form.Item>

                <Form.Item label="Time Period">
                  <Select defaultValue="week" style={{ borderRadius: 8 }}
                   options={[
                    {label:'This Week', value:'week'},
                    {label:'This Month', value:'month'},
                    {label:'This Quarter', value:'quarter'},
                   ]}
                   />
                </Form.Item>

                <Form.Item label="Format">
                  <Select defaultValue="pdf" style={{ borderRadius: 8 }} 
                  options={[
                    {label:'PDF', value:'pdf'},
                    {label:'Excel', value:'excel'},
                    {label:'CSV', value:'csv'},
                    ]}/>
                </Form.Item>
              </Form>
            </Card>
          </Space>
        </Modal>
      </div>
    );
  };

  export default ManagerDashboardMain;
