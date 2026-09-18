import { CheckCircleOutlined, ClockCircleOutlined, MessageOutlined, PhoneOutlined, RiseOutlined, StarOutlined, TrophyOutlined, UserOutlined } from "@ant-design/icons";
import { Col, Divider, Modal, Row, Space, Avatar, Flex, Tag, Typography, Button, Statistic} from "antd";
import { ScoreProgress } from "../../../dashboard/executiveDashboard/components/Comps";

const { Title, Text } = Typography;

  const ratingColors = {
    'Rockstar': '#FFD700',
    'High Performer': '#52C41A',
    'Consistent': '#1890FF',
    'Needs Improvement': '#FAAD14',
    'Risk Zone': '#FF4D4F'
  };

  const bucketMap = {
  risk_zone: { label: 'Risk Zone', color: '#FF4D4F' },
  needs_improvement: { label: 'Needs Improvement', color: '#1890FF' },
  consistent: { label: 'Consistent', color: '#52C41A' },
  high_performer: { label: 'High Performer', color: '#52C41A' },
};

const getInitials = (name = '') => name.split(' ')?.map(n => n[0]).join('').toUpperCase();


const MemberDetailModal = ({ selectedMember, showMemberModal, setShowMemberModal }) => {
  if (!selectedMember) return null;

  const status = bucketMap[selectedMember?.bucket];

  const scoreMeta = {
    avs: { label: 'Activity Volume Score', icon: <MessageOutlined />, color: '#1890FF' },
    tds: { label: 'Task Discipline Score', icon: <CheckCircleOutlined />, color: '#52C41A' },
    sls: { label: 'Speed to Lead Score', icon: <ClockCircleOutlined />, color: '#722ED1' },
    lpes: { label: 'Lead Progression Score', icon: <RiseOutlined />, color: '#13C2C2' },
    crb: { label: 'Client Response Bonus', icon: <PhoneOutlined />, color: '#FAAD14' },
    cqs: { label: 'Conversation Quality Score', icon: <StarOutlined />, color: '#EB2F96' }
  };

  return (
    <Modal
      title={<Space><UserOutlined /> <span>Member Performance Details</span></Space>}
      open={showMemberModal}
      onCancel={() => setShowMemberModal(false)}
      width={800}
      footer={<Button onClick={() => setShowMemberModal(false)}>Close</Button>}
      styles={{ body: { paddingTop: 24 } }}
    >
      {/* Header */}
      <div style={{
          background: 'linear-gradient(90deg, rgba(240,245,255,0.9), rgba(255,255,255,0.95))',
          borderRadius: 12, padding: 20, marginBottom: 24, border: '1px solid #f0f2ff'
        }}
      >
        <Row align="middle" gutter={[24, 16]}>
          <Col>
            <Avatar size={64} style={{backgroundColor: status?.color, fontSize: 24, fontWeight: 'bold'}}>{getInitials(selectedMember?.name)}</Avatar>
          </Col>

          <Col flex="auto">
            <Space direction="vertical" size={4}>
              <Flex align="center" gap={12}>
                <Title level={4} style={{ margin: 0 }}>{selectedMember?.name}</Title>
                <Tag color={status?.color} style={{ fontSize: 14, padding: '4px 12px', borderRadius: 999, fontWeight: 'bold' }}>{status?.label}</Tag>
              </Flex>
              <Text type="secondary">{selectedMember?.branch}</Text>
            </Space>
          </Col>

          <Col>
            <Statistic title="Daily Score" value={selectedMember?.totalScore} suffix="/100" valueStyle={{fontSize: 36, fontWeight: 'bold', color: status?.color}} />
          </Col>
        </Row>
      </div>

      <Divider />

      {/* Performance Breakdown */}
      <Title level={5}>Performance Score Breakdown</Title>

      <Row gutter={[16, 16]}>
        {Object.entries(selectedMember?.breakdown || {})?.map(([key, value]) => (
          <Col xs={24} sm={12} md={8} key={key}>
            <ScoreProgress label={scoreMeta[key]?.label} score={value} max={40} progress={(value / 40) * 100} color={scoreMeta[key]?.color} icon={scoreMeta[key]?.icon} />
          </Col>
        ))}
      </Row>

      <Divider style={{ margin: '24px 0' }} />
    </Modal>
  );
};


export default MemberDetailModal;