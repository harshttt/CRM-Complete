import { Card, Row, Col, Button, Space, Typography, } from "antd";
import { BellOutlined, CalendarOutlined, CheckCircleOutlined, UserAddOutlined } from "@ant-design/icons";

const {Text} = Typography;

const QuickActionsComp = () => {

 const quickActions = [
    { label: "View Leads", icon: <UserAddOutlined />, link: '/leads-management/leads', color: '#1890FF', points: 0 },
    { label: "View Meetings", icon: <CalendarOutlined />,link:'/leads-management/meeting', action: 'scheduleMeeting', color: '#FA8C16', points: 10 },
    { label: "View Task", icon: <CheckCircleOutlined />,link:'/tasks', action: 'completeTask', color: '#FAAD14', points: 6 },
    // { label: "View Reminders", icon: <CheckCircleOutlined />, action: 'completeTask', color: '#14fa83', points: 6 },
  ];

  return (
    <>
      <Card title={<Space><BellOutlined /> <span>Quick Actions</span></Space>} 
        style={{borderRadius: 12, marginBottom: 16, border: "1px solid #f0f0f0"}}>
        <Row gutter={[8, 8]}>
          {quickActions.map((action, idx) => (
            <Col span={6} key={idx}>
              <Button block style={{height: 45, display: "flex", justifyContent: "center", alignItems: "center", borderRadius: 8, borderColor: action.color, background: action.color}}
                onClick={() => handleQuickAction(action)} href={action.link}
              >
                <Space align="center" size={4}>
                  <div style={{ fontSize: 20, color: "white" }}>{action.icon}</div>
                  <Text style={{ fontSize: 11, color: "white" }}>{action.label}</Text>
                </Space>
              </Button>
            </Col>
          ))}
        </Row>
      </Card>
    </>
  );
};

export default QuickActionsComp;
