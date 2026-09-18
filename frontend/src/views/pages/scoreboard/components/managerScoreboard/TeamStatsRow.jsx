import { CalendarOutlined, ClockCircleOutlined, PercentageOutlined, TrophyOutlined } from "@ant-design/icons";
import { Card, Col, Row, Space, Tag, Tooltip, Typography } from "antd";

const {Title, Text} = Typography;

  // Stat Pill Component
  const StatPill = ({ icon, label, value, accent, suffix, change, tooltip }) => (
    <Tooltip title={tooltip}>
      <Card size="small" 
        style={{borderRadius: 12, background: '#fff', border: `1px solid ${accent}20`,  boxShadow: '0 2px 8px rgba(15,23,42,0.06)', height: '100%'}}
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

const TeamStatsRow = ({managerData}) => {


   return (
    <>
     <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6} lg={6}>
          <StatPill
            icon={<TrophyOutlined />} 
            label="Team Avg Score" 
            value={managerData?.teamOverview?.teamAverageScore}
            suffix="/100"
            change={managerData?.teamOverview?.weeklyChange}
            accent="#1890FF"
            tooltip="Average daily performance score of the team"
          />
        </Col>
        <Col xs={24} sm={12} md={6} lg={6}>
          <StatPill 
            icon={<PercentageOutlined />} 
            label="Win Rate" 
            value={managerData?.teamOverview?.winRate}
            suffix="%"
            change="+3%"
            accent="#722ED1"
            tooltip="Team conversion rate"
          />
        </Col>
        <Col xs={24} sm={12} md={6} lg={6}>
          <StatPill 
            icon={<CalendarOutlined />} 
            label="Meetings Today" 
            value={managerData?.teamOverview?.meetingsToday}
            accent="#13C2C2"
            tooltip="Total team meetings scheduled for today"
          />
        </Col>
        <Col xs={24} sm={12} md={6} lg={6}>
          <StatPill 
            icon={<ClockCircleOutlined />} 
            label="Avg Response" 
            value={managerData?.teamOverview?.avgResponseTime}
            change="-0.5 min"
            accent="#EB2F96"
            tooltip="Average team response time to leads"
          />
        </Col>
      </Row>
    </>
   )
};

export default TeamStatsRow;