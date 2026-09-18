import { useState } from 'react';
import { Card, Tag, Avatar, Space, Typography, Progress, Flex, Tooltip, Button, Select} from 'antd';
import { TrophyOutlined, RiseOutlined, WarningOutlined, FireOutlined, BellOutlined, ThunderboltOutlined, CrownOutlined, ReloadOutlined, CalendarOutlined} from '@ant-design/icons';
import ManagerProfileCard from './ManagerProfileCard';
import ManagerScoreboardTab from './ManagerScoreboardTab';
import { usePerformanceList } from '../../../../../api-hooks/performance';

const { Text, Title } = Typography;

const ManagerScoreboard = () => {
  const [selectedMember, setSelectedMember] = useState(null);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [showCoachingModal, setShowCoachingModal] = useState(false);
  const [showTeamReportModal, setShowTeamReportModal] = useState(false);
  const [timeRange, setTimeRange] = useState('week');

  const {data, isFetching:loading, refetch:handleRefresh, refetchWithQuery} = usePerformanceList({qData:{}});

  const managerPerformanceData = data ? data?.data[0]?.managers?.[0] : null;

  // console.log('managerPerformanceData------>', data);
  // console.log('managerPerformanceDAta-------->', managerPerformanceData);

  // Missing icons (placeholder components)
const SnowOutlined = () => <span>❄️</span>;
const SleepOutlined = () => <span>💤</span>;

  
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
  
  // Manager and team data
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
    ],
    
    // Team leads data
    teamLeads: {
      total: 45,
      salesReady: 18,
      highIntent: 15,
      warm: 8,
      cold: 4,
      averageScore: 68,
      hotLeads: 8,
      urgentLeads: 5
    }
  };

    // Score Progress Component
  const ScoreProgress = ({ label, score, max, progress, color, icon }) => (
    <Card size="small" style={{ borderRadius: 8, border: `1px solid ${color}20`, background: '#fff', height: '100%'}} bodyStyle={{ padding: 12 }}>
      <Space direction="vertical" size={8} style={{ width: '100%' }}>
        <Flex align="center" justify="space-between">
          <Space size={6}>
            <Avatar size={28} style={{ background: `${color}15`, color }}>{icon}</Avatar>
            <Space direction="vertical" size={0}>
              <Text strong style={{ fontSize: 11, color: '#666' }}>{label}</Text>
              <Text strong style={{ fontSize: 14, color }}>{score}/{max}</Text>
            </Space>
          </Space>
          <Tag color={progress >= 90 ? 'success' : progress >= 70 ? 'warning' : 'error'}> {progress}%</Tag>
        </Flex>
        
        <Progress percent={progress} strokeColor={color} trailColor={`${color}15`} showInfo={false} size="small" />
      </Space>
    </Card>
  );

  return (
    <div>
      <Card
        size="small"
        bordered={false}
        style={{borderRadius: 24, maxWidth: "100%", margin: "0 auto 24px", boxShadow: "0px 18px 45px rgba(15, 23, 42, 0.12)",
          border: "1px solid rgba(255, 255, 255, 0.9)", backdropFilter: 'blur(16px)',
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
              <Title level={4} style={{ margin: 0 }}>Team Management Scoreboard</Title>
              <Text type="secondary" style={{ fontSize: 12 }}>Track team performance, coaching needs, and lead distribution</Text>
            </Space>
          </Space>
        }
        extra={
          <Space align="center">
              <Select placeholder={'Select Date'} onChange={val => refetchWithQuery({range:val})} style={{ width: 140, borderRadius: 8 }} suffixIcon={<CalendarOutlined />}
                options={[{label:'Today', value:'today'}, {label:'Week', value:'week'}, {label:'Month', value:'month'}]}
              />
            <Tooltip title="Refresh data">
              <Button icon={<ReloadOutlined />} size="middle" style={{ borderRadius: 999, boxShadow: "0 4px 10px rgba(15,23,42,0.06)" }} onClick={handleRefresh} loading={loading} />
            </Tooltip>
          </Space>
        }
        >
       {/* <ManagerScoreboardHeader {...{loading}}/> */}
       <ManagerProfileCard data={managerPerformanceData?.summary}/>
       {/* <TeamStatsRow {...{managerData}}/> */}
       <ManagerScoreboardTab {...{data:managerPerformanceData?.salespersons,loading, leadPerformanceData, managerData, setSelectedMember, setShowMemberModal}}/>
      </Card>
    </div>
  );
};

export default ManagerScoreboard;