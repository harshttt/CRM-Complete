import { BellOutlined, CalendarOutlined, CommentOutlined, DeleteOutlined, EnvironmentOutlined, FastForwardOutlined, FileTextOutlined, FlagOutlined, FrownOutlined, HourglassOutlined, MailOutlined, MessageOutlined, PaperClipOutlined, PhoneFilled, PhoneOutlined, PlusCircleOutlined, RiseOutlined, StopOutlined, SyncOutlined, TeamOutlined, ThunderboltOutlined, TrophyOutlined, WarningOutlined } from "@ant-design/icons";
import {Card, Space, Row, Col, Flex, Tag, Divider, Badge, Typography} from "antd";

const {Text, Title} = Typography;

const colors = {
  primary: '#1890FF',
  success: '#52C41A',
  warning: '#FAAD14',
  error: '#FF4D4F',
  purple: '#722ED1',
  cyan: '#13C2C2',
  gold: '#FAAD14'
};

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

const HowScoringWorksComp = () => {
   return (
    <Card style={{ borderRadius: 16, background: 'white', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.06)'}}>
       <Card title="How Scoring Works" style={{ borderRadius: 12, border: 'none' }}>
         <Space direction="vertical" style={{ width: '100%' }} size={24}>
            <PerformanceLevels/>
            <Divider style={{margin:'0px'}}/>                  
            <div style={{ marginBottom: 24 }}>
              <Title level={4} style={{ marginBottom: 8, color: '#1a1a1a' }}>📈 Quick Points Guide</Title>
              <Text type="secondary" style={{ fontSize: 14 }}>Understand how your daily activities translate into performance scores</Text>
            </div>
            <ActivityVolumeCard/>
            <TaskDisciplineScoreCard/>
            <SpeedToLeadScoreCard/>
            <LeadProgressEffectivenessCard/>
            <Row gutter={[20, 20]}>
              <ClientResponsivenessCard/>
              <ConversationQualityCard/>
            </Row>
            <SummaryCard/>
          </Space>
       </Card>
     </Card>
   )};

export default HowScoringWorksComp;


const PerformanceLevels = () => {
    const performanceLevelObj = {
      'High Performer': { range: '70–100 points', color: colors?.success },
      'Consistent': { range: '50–69 points', color: colors?.primary },
      'Needs Improvement': { range: '30–49 points', color: colors?.warning },
      'Risk Zone': { range: '0–29 points', color: colors?.error }
    };

  return (
    <>
     <div>
      <Text strong style={{ display: 'block', marginBottom: 10 }}>Performance Levels</Text>
        <Row gutter={[8,8]} direction="vertical" style={{ width: '100%' }}>
         {Object.entries(performanceLevelObj).map(([rating, data]) => (
           <Col span={12}>
            <Flex justify="space-between" align="center" key={rating} style={{padding: 16, borderRadius: 8, background: '#fafafa', borderLeft: `4px solid ${data?.color}`}}>
              <Space>
               <Tag color={data?.color} style={{  minWidth: 140, textAlign: 'center', fontWeight: 'bold', borderRadius: 6}}>{rating}</Tag>
               <Text>{data?.range}</Text>
                        </Space>
                         {salespersonData?.today?.rating === rating && ( <Badge status="processing" text={ <Text strong style={{ color: data?.color, fontSize: 12 }}>Your Rating </Text> } />)}
                       </Flex>
                    </Col>
                  ))}
             </Row>
         </div>
      </>
)};

const ActivityVolumeCard = () => {
    const activityVolumnPoints = [
           { action: 'Log Call', points: '+2', icon: <PhoneOutlined />, highlight: false },
           { action: 'Send WhatsApp/Message', points: '+2', icon: <MessageOutlined />, highlight: false },
           { action: 'Send Email', points: '+2', icon: <MailOutlined />, highlight: false }, 
           { action: 'General Comment', points: '+1', icon: <CommentOutlined />, highlight: false },
           { action: 'Follow-up Comment', points: '+3', icon: <SyncOutlined />, highlight: true },
           { action: 'Internal Note Comment', points: '+1', icon: <FileTextOutlined />, highlight: false },
           { action: 'Set Reminder', points: '+2', icon: <BellOutlined />, highlight: false },
           { action: 'Create Task', points: '+2', icon: <PlusCircleOutlined />, highlight: false },
         ];

    return (
       <>
         <Card style={{marginBottom: 20, borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', borderTop: `4px solid ${colors.blue}`}}
             title={
               <Flex align="center" gap={12}>
                  <Flex justify="center" align="center" style={{ width: 36, height: 36, borderRadius: 8, background: `${colors.blue}15`, fontSize: 18}}>📊</Flex>
                  <Flex>
                     <Text strong style={{ fontSize: 16 }}>Activity Volume Score (AVS)</Text>
                     <Flex align="center" gap={8} style={{marginTop: 4 }}>
                        <Badge count="Daily Cap" style={{backgroundColor: `${colors.blue}20`,color: colors.blue, fontWeight: 500, fontSize: 11, borderRadius: 12 }} />
                        <Text type="secondary" style={{ fontSize: 12 }}>40 points max</Text>
                     </Flex>
                 </Flex>
              </Flex>
           }>
            <Row gutter={[16, 16]}>
               {activityVolumnPoints.map((item, index) => (
                    <Col xs={12} sm={8} md={6} lg={4} xl={3} key={`avs-${index}`}>
                       <div style={{
                              padding: '16px 12px',
                              borderRadius: 10,
                              background: item.highlight ? '#e6f7ff' : '#fafafa',
                              textAlign: 'center',
                              border: item.highlight ? `1px solid ${colors.blue}` : '1px solid #f0f0f0',
                              transition: 'all 0.2s',
                              height: '100%',
                              cursor: 'pointer',
                              ':hover': {transform: 'translateY(-2px)', boxShadow: '0 4px 12px rgba(0,0,0,0.08)'}
                         }}>
                           <Space direction="vertical" size={10} style={{ width: '100%' }}>
                              <div style={{ fontSize: 22, color: item.highlight ? colors.blue : '#595959',marginBottom: 4 }}>{item.icon}</div>
                              <Text strong style={{ fontSize: 13, display: 'block', lineHeight: 1.3, minHeight: 32}}> {item.action}</Text>
                              <Tag color="blue"  style={{ fontWeight: 'bold',  borderRadius: 12, fontSize: 12,padding: '2px 10px',margin: 0}}>{item.points}</Tag>
                           </Space>
                        </div>
                     </Col>
                  ))}
             </Row>
          </Card>
       </>
    )
};

const TaskDisciplineScoreCard = () => {
  const taskDisciplinePoints = [
      { action: 'Completed On Time', points: '+6', icon: <PhoneOutlined />, highlight: false },
      { action: 'Completed Late', points: '+2', icon: <MessageOutlined />, highlight: false },
      { action: 'Missed', points: '-10', icon: <MailOutlined />, highlight: false },
      { action: 'Urgent Task Completed', points: '+10', icon: <CommentOutlined />, highlight: false },
    ];

    return (
      <>
          {/* Activity Volume Score (AVS) */}
         <Card style={{ marginBottom: 20, borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', borderTop: `4px solid ${colors.blue}`}}
             title={
               <Flex align="center" gap={12}>
                  <Flex justify="center" align="center" style={{ width: 36, height: 36, borderRadius: 8, background: `${colors.blue}15`, fontSize: 18}}>📊</Flex>
                  <Flex>
                    <Text strong style={{ fontSize: 16 }}>Task Discipline Score (TDS)</Text>
                    <Flex justify="center" align="center" gap={8} style={{marginTop: 4 }}>
                      <Badge count="Daily Cap" style={{backgroundColor: `${colors.blue}20`,  color: colors.blue, fontWeight: 500, fontSize: 11, borderRadius: 12 }} />
                      <Text type="secondary" style={{ fontSize: 12 }}>40 points max</Text>
                    </Flex>
                 </Flex>
               </Flex>
              }
         >
            <Row gutter={[16, 16]}>
                {taskDisciplinePoints.map((item, index) => (
                     <Col xs={12} sm={8} md={6} lg={4} xl={6} key={`avs-${index}`}>
                        <div style={{
                               padding: '16px 12px',
                               borderRadius: 10,
                               background: item.highlight ? '#e6f7ff' : '#fafafa',
                               textAlign: 'center',
                               border: item.highlight ? `1px solid ${colors.blue}` : '1px solid #f0f0f0',
                               transition: 'all 0.2s',
                               height: '100%',
                               cursor: 'pointer',
                               ':hover': {transform: 'translateY(-2px)', boxShadow: '0 4px 12px rgba(0,0,0,0.08)'}
                           }}>
                             <Space direction="vertical" size={10} style={{ width: '100%' }}>
                               <div style={{ fontSize: 22, color: item.highlight ? colors.blue : '#595959',marginBottom: 4 }}>{item.icon}</div>
                               <Text strong style={{ fontSize: 13, display: 'block', lineHeight: 1.3, minHeight: 32}}> {item.action}</Text>
                               <Tag color="blue"  style={{ fontWeight: 'bold',  borderRadius: 12, fontSize: 12,padding: '2px 10px',margin: 0}}>{item.points}</Tag>
                             </Space>
                        </div>
                     </Col>
                   ))}
            </Row>
        </Card>
      </>
    )
};

const SpeedToLeadScoreCard = () => {
    const speedToLeadPoints = [
        { action: '< 5 minutes', points: '+15', icon: <ThunderboltOutlined />, highlight: true },
        { action: '5-15 minutes', points: '+10', icon: <FastForwardOutlined />, highlight: false },
        { action: '15-60 minutes', points: '+5', icon: <HourglassOutlined />, highlight: false },
        { action: '> 60 minutes', points: '-5', icon: <WarningOutlined />, highlight: false },
        { action: 'No action same day', points: '-15', icon: <StopOutlined />, highlight: false },
    ];

    return (
        <>
          <Card style={{ marginBottom: 20,borderRadius: 12,boxShadow: '0 2px 8px rgba(0,0,0,0.06)',borderTop: `4px solid ${colors.orange}`}}
             title={
                  <Flex align="center" gap={12}>
                    <Flex justify="center" align="center" style={{width: 36,height: 36,borderRadius: 8,background: `${colors.orange}15`,fontSize: 18}}>⚡</Flex>
                    <div>
                      <Text strong style={{ fontSize: 16 }}>Speed-to-Lead Score (SLS)</Text>
                      <Flex align="center" gap={8} style={{marginTop: 4}}>
                         <Badge count="Response Time Critical" style={{  backgroundColor: `${colors.orange}20`,  color: colors.orange,fontWeight: 500,fontSize: 11, borderRadius: 12}} />
                      </Flex>
                    </div>
                   </Flex>
                }
           >
            <Row gutter={[16, 16]}>
              {speedToLeadPoints.map((item, index) => (
                 <Col xs={12} sm={8} md={6} lg={4} key={`sls-${index}`}>
                    <div style={{
                           padding: '18px 12px',
                           borderRadius: 10,
                           background: item.highlight ? '#fff7e6' : '#fafafa',
                           textAlign: 'center',
                           border: item.highlight ? `1px solid ${colors.orange}` : '1px solid #f0f0f0',
                           transition: 'all 0.2s',
                           height: '100%',
                           cursor: 'pointer'
                      }}>
                         <Space direction="vertical" size={12} style={{ width: '100%' }}>
                           <div style={{fontSize: 22,color: item.points.startsWith('+') ? colors.orange : colors.red, }}>{item.icon}</div>
                           <div> <Text strong style={{ fontSize: 13, display: 'block', lineHeight: 1.3 }}> {item.action}</Text> </div>
                           <Tag color={item.points.startsWith('+') ? "orange" : "red"} style={{fontWeight: 'bold',borderRadius: 12,fontSize: 12,padding: '2px 10px'}}>{item.points}</Tag>
                         </Space>
                    </div>
                 </Col>
               ))}
            </Row>
           </Card>
        </>
    )
};

const LeadProgressEffectivenessCard = () => {
    const leadProgressPoints = [
         { action: 'Progress Lead', points: '+5', icon: <RiseOutlined />, highlight: false },
         { action: 'Schedule Meeting', points: '+10', icon: <CalendarOutlined />, highlight: false },
         { action: 'Site Visit', points: '+12', icon: <EnvironmentOutlined />, highlight: false },
         { action: 'Qualified Lead', points: '+15', icon: <FlagOutlined />, highlight: true },
         { action: 'Closed Won', points: '+30', icon: <TrophyOutlined />, highlight: true },
         { action: 'Closed Lost', points: '-10', icon: <FrownOutlined />, highlight: false },
         { action: 'Mark as Junk/Dump', points: '-20', icon: <DeleteOutlined />, highlight: false },
    ];

    return (
        <>
        <Card style={{ marginBottom: 20, borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', borderTop: `4px solid ${colors.purple}`}}
              title={
                 <Flex align="center" gap={12}>
                   <Flex justify="center" align="center" style={{ width: 36, height: 36, borderRadius: 8, background: `${colors.purple}15`,fontSize: 18}}>🎯</Flex>
                   <div>
                      <Text strong style={{ fontSize: 16 }}>Lead Progression (LPES)</Text>
                      <div style={{ display: 'flex',alignItems: 'center', gap: 8, marginTop: 4 }}>
                        <Badge count="Conversion Impact" style={{backgroundColor: `${colors.purple}20`, color: colors.purple, fontWeight: 500, fontSize: 11, borderRadius: 12}} />
                      </div>
                   </div>
                 </Flex>
                }
        >
            <Row gutter={[16, 16]}>
               {leadProgressPoints.map((item, index) => (
                   <Col xs={12} sm={8} md={6} lg={4} xl={3} key={`lpes-${index}`}>
                    <div style={{
                            padding: '16px 12px',
                            borderRadius: 10,
                            background: item.highlight ? '#f9f0ff' : '#fafafa',
                            textAlign: 'center',
                            border: item.highlight ? `1px solid ${colors.purple}` : '1px solid #f0f0f0',
                            transition: 'all 0.2s',
                            height: '100%',
                            cursor: 'pointer'
                         }}>
                       <Space direction="vertical" size={10} style={{ width: '100%' }}>
                          <div style={{ fontSize: 22, color: item.highlight ? colors.purple : (item.points.startsWith('+') ? '#595959' : colors.red)}}>{item.icon}</div>
                             <Text strong style={{ fontSize: 12, display: 'block', lineHeight: 1.3, minHeight: 32}}>{item.action} </Text>
                             <Tag  color={item.points.startsWith('+') ?  (item.highlight ? "purple" : "success") : "error"} style={{ fontWeight: 'bold', borderRadius: 12, fontSize: 12,padding: '2px 10px'}}>{item.points}</Tag>
                       </Space>
                    </div>
                   </Col>
                ))}
            </Row>
        </Card>
      </>
    )
};

const ClientResponsivenessCard = () => {
    return (
        <>
         <Col xs={24} md={12}>
           <Card style={{height: '100%', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', borderTop: `4px solid ${colors.cyan}`}}
               title={
                 <Flex align="center" gap={12}>
                   <Flex justify="center" align="center"  style={{width: 32, height: 32, borderRadius: 8, background: `${colors.cyan}15`, fontSize: 16}}>💬</Flex>
                   <Text strong style={{ fontSize: 15 }}>Client Responsiveness (CRB)</Text>
                 </Flex>
                }
             >
             <Row gutter={[16, 16]}>
               {[
                 { action: 'Client replies < 2hr', points: '+5', icon: <SyncOutlined />, highlight: true },
                 { action: 'Lost - No follow-up', points: '-15', icon: <StopOutlined />, highlight: false },
                ].map((item, index) => (
                  <Col span={12} key={`crb-${index}`}>
                     <div style={{
                         padding: '24px 16px',
                         borderRadius: 10,
                         background: item.highlight ? '#e6fffb' : '#fafafa',
                         textAlign: 'center',
                         border: `1px solid ${colors.cyan}40`,
                         height: '100%',
                         cursor: 'pointer'
                      }}>
                       <Space direction="vertical" size={16} style={{ width: '100%' }}>
                          <div style={{ fontSize: 28, color: item.highlight ? colors.cyan : colors.red }}>{item.icon}</div>
                          <Text strong style={{ fontSize: 14, display: 'block' }}>{item.action}</Text>
                          <Badge count={item.points} style={{backgroundColor: item.highlight ? colors.cyan : '#ff4d4f', fontSize: 13, fontWeight: 600, padding: '2px 12px', borderRadius: 12}} />
                       </Space>
                     </div>
                 </Col>
                ))}
             </Row>
           </Card>
         </Col>
        </>
    )
};

const ConversationQualityCard = () => {
    const conversationQualityPoints = [
         { action: 'Call > 3 mins', points: '+4', icon: <PhoneFilled />, highlight: false },
         { action: 'Meeting', points: '+10', icon: <TeamOutlined />, highlight: true },
         { action: 'Site Visit', points: '+12', icon: <EnvironmentOutlined />, highlight: true },
         { action: 'Email with Attachment', points: '+5', icon: <PaperClipOutlined />, highlight: false },
         { action: 'SMS', points: '+1', icon: <MessageOutlined />, highlight: false },
    ];

    return (
       <>
         <Col xs={24} md={12}>
           <Card style={{height: '100%', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', borderTop: `4px solid ${colors.gold}`}}
             title={
                <Flex align="center" gap={12}>
                  <Flex justify="center" align="center" style={{ width: 32, height: 32, borderRadius: 8, background: `${colors.gold}15`, fontSize: 16}}>🗣️</Flex>
                  <Text strong style={{ fontSize: 15 }}>Conversation Quality (CQS)</Text>
                </Flex>
               }
           >
             <Row gutter={[12, 12]}>
               {conversationQualityPoints.map((item, index) => (
                  <Col xs={12} sm={8} md={12} lg={8} key={`cqs-${index}`}>
                    <div style={{
                      padding: '16px 8px',
                      borderRadius: 10,
                      background: item.highlight ? '#fffbe6' : '#fafafa',
                      textAlign: 'center',
                      border: item.highlight ? `1px solid ${colors.gold}` : '1px solid #f0f0f0',
                      transition: 'all 0.2s',
                      height: '100%',
                      cursor: 'pointer'
                  }}>
                    <Space direction="vertical" size={8} style={{ width: '100%' }}>
                      <div style={{ fontSize: 20, color: item.highlight ? colors.gold : '#595959' }}>{item.icon}</div>
                      <Text strong style={{ fontSize: 11, display: 'block', lineHeight: 1.3 }}>{item.action}</Text>
                      <Tag color="gold" style={{fontWeight: 'bold', borderRadius: 10, fontSize: 11, padding: '2px 8px'}}>{item.points}</Tag>
                    </Space>
              </div>
            </Col>
          ))}
        </Row>
      </Card>
    </Col>
  </> )
};

const SummaryCard = () => {
    const summaryPoints = [
        {label:'AVS', color:'blue'},
        {label:'TDS', color:'green'},
        {label:'SLS', color:'orange'},
        {label:'LPES', color:'purple'},
        {label:'CRB', color:'cyan'},
        {label:'CQS', color:'gold'}
    ];

    return (
      <>
        <Card style={{ marginTop: 24, borderRadius: 12, background:'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.08)'}} bodyStyle={{ padding: 24 }}>
           <Row align="middle" gutter={[24, 16]}>
             <Col xs={24} md={24}>
               <Text strong style={{ fontSize: 16, display: 'block', marginBottom: 12 }}> 🏆 How Your Daily Score is Calculated</Text>
                <div style={{backgroundColor: 'white', padding: 16, borderRadius: 8, marginBottom: 16}}>
                 <Text strong style={{ fontSize: 14, color: colors.blue }}>Daily Salesperson Score (DSS) =</Text>
                  <Flex justify="center" align="center" gap={8} style={{flexWrap: 'wrap', marginTop: 8}}>
                    {summaryPoints.map(item => (
                        <>
                          <Tag color={item?.color} style={{ fontSize: 13, fontWeight: 600, padding: '4px 12px' }}>{item?.label}</Tag>
                          <Text strong style={{ fontSize: 16 }}>+</Text>
                        </>
                    ))}
                 </Flex>
                </div>
             </Col>
           </Row>
         </Card>
      </>
    )
};


