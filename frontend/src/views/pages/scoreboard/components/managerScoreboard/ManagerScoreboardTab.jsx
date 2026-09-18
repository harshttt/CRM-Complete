import { useState } from 'react';
import { TrophyOutlined,PieChartOutlined,HeatMapOutlined,LineChartOutlined,ThunderboltOutlined,RiseOutlined,PercentageOutlined,DollarOutlined,ArrowUpOutlined, UserOutlined, PhoneOutlined, MailOutlined, ClockCircleOutlined, EyeOutlined, WarningOutlined, MessageOutlined, CheckCircleOutlined} from "@ant-design/icons";
import { Badge, Space, Tabs, Card, Row, Col, Statistic, Flex, Tag, Divider, Table,Typography, Avatar, Progress, Tooltip, Button } from "antd";
import MemberDetailModal from './MemberDetailModal';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

const ManagerScoreboardTab = ({data, loading, leadPerformanceData, managerData}) => {
  const [selectedMember, setSelectedMember] = useState(null);
  const [showMemberModal, setShowMemberModal] = useState(false);

  return (
    <div>
     <TeamPerformanceTabContent {...{data, loading, managerData, setSelectedMember, setShowMemberModal}} />
        {/* <Tabs activeKey={activeTab} onChange={setActiveTab} style={{ marginBottom: 24 }}>
        <TabPane tab={<Space><TrophyOutlined /> <span>Team Performance</span></Space>}key="teamPerformance">
            <TeamPerformanceTabContent {...{data,loading, managerData, setSelectedMember, setShowMemberModal}} />
          </TabPane>
          <TabPane tab={<Space> <BarChartOutlined /> <span>Lead Performance</span></Space>} key="leadPerformance">
            <LeadPerformanceTabContent leadPerformanceData={leadPerformanceData} />
          </TabPane>
        </Tabs> */}
     <MemberDetailModal {...{selectedMember, showMemberModal, setShowMemberModal}} />
    </div>
  );
};

const TeamPerformanceTabContent = ({data, loading, setSelectedMember, setShowMemberModal }) => {

  const bucketMap = {
    risk_zone: { label: 'At Risk', color: '#FF4D4F' },
    safe_zone: { label: 'Meeting', color: '#1890FF' },
    high_zone: { label: 'Exceeding', color: '#52C41A' }
   };

  const getInitials = (name = '') => name.split(' ').map(n => n[0]).join('').toUpperCase();

    // Team member columns
  const teamMemberColumns = [
   {
    title: 'Rank',
    key: 'ranking',
    width: 80,
    render: (_, __, index) => ( <Badge count={index + 1} style={{backgroundColor: index === 0 ? '#FFD700' : index === 1 ? '#C0C0C0' : index === 2 ? '#CD7F32' : '#f0f0f0', color: index <= 2 ? '#000' : '#666'}} />)
   },
   {
    title: 'Team Member',
    key: 'name',
    width: 220,
    render: (_, record) => (
      <Space direction="vertical" size={2}>
        <Space size={8}>
          <Avatar style={{ backgroundColor: '#1890FF' }}>{getInitials(record?.name)}</Avatar>
          <div>
            <Text strong>{record?.name}</Text>
            <div>
              <Text type="secondary" style={{ fontSize: 11 }}>{record?.branch}</Text>
            </div>
          </div>
        </Space>
        <Tag color={bucketMap[record?.bucket]?.color} style={{ borderRadius: 999, fontSize: 10 }}>{bucketMap[record?.bucket]?.label}</Tag>
      </Space>
    )
   },
   {
    title: 'Daily Score',
    dataIndex: 'totalScore',
    key: 'totalScore',
    width: 140,
    sorter: (a, b) => a?.totalScore - b?.totalScore,
    render: (score, record) => (
      <Space direction="vertical" size={2}>
        <Progress percent={score} size="small" showInfo={false} strokeColor={bucketMap[record?.bucket]?.color} style={{ width: 100 }} />
        <Text strong style={{ fontSize: 12 }}>{score}/100</Text>
      </Space>
    )
   },
   {
    title: 'Activity Metrics',
    key: 'metrics',
    width: 200,
    render: (_, record) => (
      <Space size={4} wrap>
        <Tooltip title="AVS">
          <Tag><MessageOutlined /> {record?.breakdown?.avs}</Tag>
        </Tooltip>
        <Tooltip title="CQS">
          <Tag><RiseOutlined /> {record?.breakdown?.cqs}</Tag>
        </Tooltip>
        <Tooltip title="CRB">
          <Tag><RiseOutlined /> {record?.breakdown?.crb}</Tag>
        </Tooltip>
        <Tooltip title="TDS">
          <Tag><CheckCircleOutlined /> {record?.breakdown?.tds}</Tag>
        </Tooltip>
        <Tooltip title="SLS">
          <Tag><ClockCircleOutlined /> {record?.breakdown?.sls}</Tag>
        </Tooltip>
        <Tooltip title="LPES">
          <Tag><RiseOutlined /> {record?.breakdown?.lpes}</Tag>
        </Tooltip>
      </Space>
    )
   },
   {
    title: 'Status',
    key: 'status',
    width: 120,
    render: (_, record) => ( <Tag color={bucketMap[record?.bucket]?.color} style={{ borderRadius: 999, fontSize: 10 }}>{bucketMap[record?.bucket]?.label}</Tag>)
   },
   {
    title: 'Action',
    key: 'action',
    width: 120,
    fixed: 'right',
    render: (_, record) => ( <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => {setSelectedMember(record); setShowMemberModal(true);}}> View </Button>)
   }
];

  return (
    <div style={{ marginBottom: 24 }}>
      {/* Team Members Performance Table */}
      <Card  title="Team Performance Dashboard" style={{ borderRadius: 12, border: '1px solid #f0f0f0', marginBottom: 24}}>
        <Table 
          loading={loading}
          columns={teamMemberColumns} 
          dataSource={data || []} 
          rowKey="id" 
          pagination={false} 
          size="middle"
          scroll={{ x: 'max-content' }} 
          style={{ borderRadius: 8 }}
        />
      </Card>
    </div>
  );
};

const LeadPerformanceTabContent = ({ leadPerformanceData }) => {
  const [selectedBucket, setSelectedBucket] = useState(null);
  const [selectedSource, setSelectedSource] = useState(null);

  return (
    <Space direction="vertical" size={24} style={{ width: '100%' }}>
      <Card 
        style={{ 
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
                  <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: 14 }}> Team Lead Portfolio Score</Text>
                  <Statistic value={leadPerformanceData?.leadDistribution?.avgScore || 0} 
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
                    <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12 }}>{leadPerformanceData?.leadDistribution?.scoreChange || 0} this month</Text>
                  </Flex>
                </div>
                <Flex justify="center" gap={8}>
                  <Tag style={{ 
                    background: 'rgba(255,255,255,0.2)', 
                    color: 'white', 
                    borderRadius: 12 
                  }}>
                    {leadPerformanceData?.leadDistribution?.totalLeads || 0} Total Leads
                  </Tag>
                  <Tag style={{ 
                    background: 'rgba(255,255,255,0.2)', 
                    color: 'white', 
                    borderRadius: 12 
                  }}>
                    {leadPerformanceData?.leadDistribution?.highScore || 0} High Score
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
                  value={leadPerformanceData?.leadDistribution?.buckets?.[0]?.count || 0}
                  color="#52C41A"
                  tooltip="Leads with highest conversion probability"
                  size="large"
                />
              </Col>
              <Col xs={12} sm={6}>
                <MetricCard
                  icon={<RiseOutlined />}
                  label="High Intent"
                  value={leadPerformanceData?.leadDistribution?.buckets?.[1]?.count || 0}
                  color="#1890FF"
                  tooltip="Leads showing strong interest"
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
                  icon={<DollarOutlined />}
                  label="Revenue Impact"
                  value={8.4}
                  color="#F759AB"
                  suffix="Cr"
                  tooltip="Potential revenue from active leads"
                  size="large"
                />
              </Col>
            </Row>
          </Col>
        </Row>
      </Card>

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
          {leadPerformanceData?.leadDistribution?.buckets?.map((bucket, idx) => (
            <Col xs={24} sm={12} md={6} key={idx}>
              <ScoreBucketCard bucket={bucket} onClick={() => setSelectedBucket(bucket)} />
            </Col>
          ))}
        </Row>
      </Card>

      <Card 
        title={
          <Space>
            <HeatMapOutlined />
            <span>Source Performance Metrics</span>
          </Space>
        }
        style={{ borderRadius: 12 }}
      >
        <Row gutter={[16, 16]}>
          {leadPerformanceData?.sourceMetrics?.map((source, idx) => (
            <Col xs={24} sm={12} md={8} lg={4.8} key={idx}>
              <SourcePerformanceCard  source={source} onClick={() => setSelectedSource(source)}/>
            </Col>
          ))}
        </Row>
        <Divider />
      </Card>

      <Card 
        title={
          <Space> 
            <TrophyOutlined /> 
            <span>Top Performing Leads</span> 
          </Space>
        } 
        style={{ borderRadius: 12 }}
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          {leadPerformanceData?.topPerformingLeads?.map(lead => ( <LeadScoreCard key={lead?.id} lead={lead} />  ))}
        </Space>
      </Card>

      <Card
        title={
          <Space>
            <LineChartOutlined />
            <span>Stage Progression & Conversion Funnel</span>
          </Space>
        }
        style={{ borderRadius: 12 }}
      >
        <Row gutter={[16, 16]}>
          {Object.entries(leadPerformanceData?.stageMetrics?.current || {}).map(([stage, count], idx) => (
            <Col xs={24} sm={12} md={8} lg={4} key={idx}>
              <Card size="small">
                <Space direction="vertical" align="center" style={{ width: '100%' }}>
                  <Text strong style={{ fontSize: 12 }}>{stage}</Text>
                  <Text strong style={{ fontSize: 24, color: '#1890FF' }}>{count}</Text>
                  <Text type="secondary" style={{ fontSize: 11 }}>Active Leads</Text>
                </Space>
              </Card>
            </Col>
          ))}
        </Row>
        <Divider />
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Title level={5} style={{ marginBottom: 16 }}>Stage Conversion Rates</Title>
            <Row gutter={[8, 8]}>
              {Object.entries(leadPerformanceData?.stageMetrics?.conversionRates || {}).map(([stage, rate], idx) => (
                <Col xs={24} sm={12} md={8} lg={4} key={idx}>
                  <StageConversionCard stage={stage} conversion={rate} 
                    avgDays={leadPerformanceData?.stageMetrics?.avgDaysInStage?.[stage?.split(' → ')[1]]}
                  />
                </Col>
              ))}
            </Row>
          </Col>
        </Row>
        <Divider />
      </Card>
    </Space>
  );
};

//cards
const MetricCard = ({ icon, label, value, color, tooltip, suffix = '', size = 'medium' }) => (
  <Card 
    size="small" 
    style={{ 
      textAlign: 'center', 
      borderRadius: 12,
      border: `1px solid ${color}20`
    }}
  >
    <Space direction="vertical" align="center" style={{ width: '100%' }}>
      <div style={{ color, fontSize: size === 'large' ? 24 : 20 }}>
        {icon}
      </div>
      <Text type="secondary" style={{ fontSize: 12 }}>{label}</Text>
      <Title level={3} style={{ margin: 0, color }}>
        {value}{suffix}
      </Title>
    </Space>
  </Card>
);

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

export default ManagerScoreboardTab;