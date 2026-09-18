import { useState } from "react";
import {UserOutlined, PhoneOutlined, BellOutlined, CalendarOutlined, CheckSquareOutlined, MoreOutlined, PlusOutlined, DeleteOutlined, ArrowRightOutlined, RiseOutlined, VideoCameraOutlined, ClockCircleOutlined, CheckCircleOutlined, ExclamationCircleOutlined, TrophyOutlined, SyncOutlined, TeamOutlined, CloseCircleOutlined, FireOutlined, MenuOutlined, SmileOutlined, GlobalOutlined, MailOutlined, FacebookOutlined} from "@ant-design/icons";
import { Avatar, Badge, Button, Card, Checkbox, Col, DatePicker, Descriptions, Empty, Flex, Form, Input, List, Modal, Popconfirm, Progress, Row, Space, Statistic, Table, Tabs, Tag, Typography } from "antd";
import useTabContent from "../../../hooks/useTabContent";
import dayjs from "dayjs";

const { Text, Link, Title } = Typography;
const { TextArea } = Input;
const {RangePicker} = DatePicker;

/* ---------------- Donut Chart ---------------- */


/* ---------------- Main ---------------- */
export default function CRMDashboard() {

  return (
    <Space orientation="vertical" style={{background: "white", minHeight: "100vh",width:'99%', borderRadius:10,padding:'5px'}}>
      {/* Target */}
      {/* <TargetCard/> */}
      {/* Cards */}
        <Row align={'stretch'} gutter={10}>
          <TodaysLeads />
          <TodaysMeeting/>
          <TodaysTasks />
          <TodaysReminders />
        </Row>

        <Row gutter={10}>
          <LeadList/>
          <ScheduleList/>
          <TasksList/>
          <TodoList/>
        </Row>
        <StickyNotesSection/>
      {/* Charts */}
        <Row gutter={10}>
          <LeadStatus/>
          <LeadSource/>
          <TaskCompletion/>
          <MeetingActivity/>
        </Row>
    </Space>
  );
}


function TargetCard() {
  // Example data – replace with real values
  const target = 50000;
  const achieved = 12500; // 25% of target
  const percentage = Math.round((achieved / target) * 100);
  const remaining = target - achieved;

  return (
    <Card
      size="small"
      style={{
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        border: 'none',
      }}
      bodyStyle={{ padding: '16px' }}
    >
      <Space direction="vertical" size={12} style={{ width: '100%' }}>
        {/* Header with trophy icon */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Space size={8}>
            <TrophyOutlined style={{ fontSize: '18px', color: '#faad14' }} />
            <Text strong style={{ fontSize: '14px', color: '#8c8c8c' }}>
              YOUR TARGET
            </Text>
          </Space>
          <Text strong style={{ fontSize: '16px', color: '#1f1f1f' }}>
            ₹{target.toLocaleString()}
          </Text>
        </div>

        {/* Achieved vs remaining */}
        <Row gutter={16}>
          <Col span={12}>
            <Statistic
              title="Achieved"
              value={achieved}
              prefix="₹"
              valueStyle={{ fontSize: '20px', fontWeight: 600, color: '#3a70ed' }}
            />
          </Col>
          <Col span={12}>
            <Statistic
              title="Remaining"
              value={remaining}
              prefix="₹"
              valueStyle={{ fontSize: '20px', fontWeight: 600, color: '#fa8c16' }}
            />
          </Col>
        </Row>

        {/* Progress bar with percentage */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <Text type="secondary" style={{ fontSize: '12px' }}>Progress</Text>
            <Text strong style={{ fontSize: '12px', color: '#3a70ed' }}>{percentage}%</Text>
          </div>
          <Progress
            percent={percentage}
            showInfo={false}
            strokeColor="#3a70ed"
            trailColor="#eee"
            strokeWidth={10}
            style={{ margin: 0 }}
          />
        </div>

        {/* Optional: remaining days or trend */}
        <div
          style={{
            backgroundColor: '#f5f5f5',
            borderRadius: '6px',
            padding: '8px 12px',
            fontSize: '12px',
            color: '#595959',
          }}
        >
          <RiseOutlined style={{ marginRight: 8, color: '#52c41a' }} />
          You need ₹{remaining.toLocaleString()} more to reach your goal
        </div>
      </Space>
    </Card>
  );
};

/* ---------------- Leads ---------------- */
function TodaysLeads() {
  const todaysCount = 24;
  const percentChange = +12.5;

  return (
    <Col xs={24} sm={12} md={8} lg={6}>
      <Card
        size="small"
        style={{
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          transition: 'all 0.3s ease',
          height: '100%',
        }}
        hoverable
        title="Today's Leads"
        extra={<Link href="/lead-management/leads" style={{ fontSize: '12px', color: '#1890ff' }}>View All <ArrowRightOutlined /></Link>}
      >
        <Space direction="vertical" size={8} style={{ width: '100%' }}>
          {/* Main statistic */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Statistic
              value={todaysCount}
              prefix={<UserOutlined style={{ fontSize: '24px', color: '#1890ff' }} />}
              valueStyle={{ fontSize: '32px', fontWeight: 600, color: '#1f1f1f' }}
            />
            {/* Trend indicator */}
            <div style={{ textAlign: 'right' }}>
              <Space size={4}>
                <RiseOutlined style={{ color: percentChange >= 0 ? '#52c41a' : '#ff4d4f' }} />
                <Text
                  style={{
                    color: percentChange >= 0 ? '#52c41a' : '#ff4d4f',
                    fontSize: '13px',
                    fontWeight: 500,
                  }}
                >
                  {Math.abs(percentChange)}%
                </Text>
              </Space>
              <div style={{ fontSize: '12px', color: '#8c8c8c' }}>vs yesterday</div>
            </div>
          </div>

          {/* Optional: mini progress or extra context */}
          <div
            style={{
              marginTop: 8,
              backgroundColor: '#f5f5f5',
              borderRadius: '6px',
              padding: '6px 10px',
              fontSize: '12px',
              color: '#595959',
            }}
          >
            📈 +8 new in last hour
          </div>
        </Space>
      </Card>
    </Col>
  );
};

function TodaysMeeting() {
  const meetingCount = 5;
  const nextMeetingTime = "10:30 AM";
  const percentChange = -8.3; // negative = fewer than yesterday

  return (
    <Col xs={24} sm={12} md={8} lg={6}>
      <Card
        size="small"
        style={{
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          transition: 'all 0.3s ease',
          height: '100%',
        }}
        hoverable
        title={"Today's Meetings"}
        extra={<Link href="/lead-management/leads" style={{ fontSize: '12px', color: '#1890ff' }}>
                View All
               </Link>
              }
      >
        <Space direction="vertical" size={8} style={{ width: '100%' }}>

          {/* Main statistic: meeting count */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Statistic
              value={meetingCount}
              prefix={<CalendarOutlined style={{ fontSize: '24px', color: '#fa8c16' }} />}
              valueStyle={{ fontSize: '32px', fontWeight: 600, color: '#1f1f1f' }}
            />
            {/* Next meeting info */}
            <div style={{ textAlign: 'right' }}>
              <Space size={4}>
                <ClockCircleOutlined style={{ color: '#8c8c8c' }} />
                <Text style={{ fontSize: '13px', fontWeight: 500 }}>{nextMeetingTime}</Text>
              </Space>
              <div style={{ fontSize: '12px', color: '#8c8c8c' }}>next meeting</div>
            </div>
          </div>

          {/* Optional trend vs yesterday */}
          <div
            style={{
              marginTop: 8,
              backgroundColor: '#f5f5f5',
              borderRadius: '6px',
              padding: '6px 10px',
              fontSize: '12px',
              color: percentChange >= 0 ? '#52c41a' : '#ff4d4f',
            }}
          >
            {percentChange >= 0 ? '▲' : '▼'} {Math.abs(percentChange)}% vs yesterday
          </div>
        </Space>
      </Card>
    </Col>
  );
};

/* ---------------- Tasks ---------------- */
function TodaysTasks() {
  // Example data – replace with real API data
  const totalTasks = 12;
  const percentChange = +5.2; // vs yesterday

  return (
    <Col xs={24} sm={12} md={8} lg={6}>
      <Card
        size="small"
        style={{
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          transition: 'all 0.3s ease',
          height: '100%',
        }}
        hoverable
        title={"Today's Tasks"}
        extra={
             <Link href="/lead-management/leads" style={{ fontSize: '12px', color: '#1890ff' }}>
              View All <ArrowRightOutlined />
            </Link>
        }
      >
        <Space direction="vertical" size={8} style={{ width: '100%' }}>
          {/* Main statistics: total & completed */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Statistic
              value={totalTasks}
              prefix={<ClockCircleOutlined style={{ fontSize: '24px', color: '#13c2c2' }} />}
              valueStyle={{ fontSize: '32px', fontWeight: 600, color: '#1f1f1f' }}
            />
          {/* Next task info */}
            <div style={{ textAlign: 'right' }}>
              <Space size={4}>
                <ClockCircleOutlined style={{ color: '#8c8c8c' }} />
                <Text style={{ fontSize: '13px', fontWeight: 500 }}>{'10:30 am'}</Text>
              </Space>
              <div style={{ fontSize: '12px', color: '#8c8c8c' }}>next task due</div>
            </div>
          </div>

          {/* Progress bar */}
          {/* <Progress percent={completionRate} size="small" strokeColor="#52c41a" showInfo={false} />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#8c8c8c' }}>
            <span>{completionRate}% complete</span>
            <span>{pendingTasks} pending</span>
          </div> */}

          {/* Trend vs yesterday */}
          <div
            style={{
              marginTop: 4,
              backgroundColor: '#f5f5f5',
              borderRadius: '6px',
              padding: '6px 10px',
              fontSize: '12px',
              color: percentChange >= 0 ? '#52c41a' : '#ff4d4f',
            }}
          >
            {percentChange >= 0 ? '▲' : '▼'} {Math.abs(percentChange)}% more tasks than yesterday
          </div>
        </Space>
      </Card>
    </Col>
  );
};

/* ---------------- Reminders ---------------- */
function TodaysReminders() {
  const totalReminders = 8;
  const percentChange = -12.0; // negative = fewer than yesterday

  return (
    <Col xs={24} sm={12} md={8} lg={6}>
      <Card
        size="small"
        style={{
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          transition: 'all 0.3s ease',
          height: '100%',
        }}
        hoverable
        title={"Today's Reminders"}
        extra={
            <Link href="/lead-management/leads" style={{ fontSize: '12px', color: '#1890ff' }}>
              View All
            </Link>
        }
      >
        <Space direction="vertical" size={8} style={{ width: '100%' }}>

          {/* Main statistic: total reminders */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Statistic
              value={totalReminders}
              prefix={<BellOutlined style={{ fontSize: '24px', color: '#faad14' }} />}
              valueStyle={{ fontSize: '32px', fontWeight: 600, color: '#1f1f1f' }}
            />
            {/* Next task info */}
            <div style={{ textAlign: 'right' }}>
              <Space size={4}>
                <ClockCircleOutlined style={{ color: '#8c8c8c' }} />
                <Text style={{ fontSize: '13px', fontWeight: 500 }}>{'10:30 am'}</Text>
              </Space>
              <div style={{ fontSize: '12px', color: '#8c8c8c' }}>next reminder due</div>
            </div>
          </div>

          {/* Trend vs yesterday */}
          <div
            style={{
              backgroundColor: '#f5f5f5',
              borderRadius: '6px',
              padding: '6px 10px',
              fontSize: '12px',
              color: percentChange >= 0 ? '#52c41a' : '#ff4d4f',
            }}
          >
            {percentChange >= 0 ? '▲' : '▼'} {Math.abs(percentChange)}% vs yesterday
          </div>
        </Space>
      </Card>
    </Col>
  );
};

function LeadList(){
  const leadsData = {
    '1': [ // New Leads
      { id: 1, name: 'John Doe', email: 'john@example.com', phone: '+1 234 567 890', status: 'new', date: '2025-03-10' },
      { id: 2, name: 'Jane Smith', email: 'jane@example.com', phone: '+1 234 567 891', status: 'new', date: '2025-03-09' },
    ],
    '2': [ // Processing Leads
      { id: 3, name: 'Bob Johnson', email: 'bob@example.com', phone: '+1 234 567 892', status: 'processing', date: '2025-03-08' },
      { id: 4, name: 'Alice Brown', email: 'alice@example.com', phone: '+1 234 567 893', status: 'processing', date: '2025-03-07' },
    ],
    '3': [ // Closed Leads
      { id: 5, name: 'Charlie Wilson', email: 'charlie@example.com', phone: '+1 234 567 894', status: 'closed', date: '2025-03-05' },
    ],
  };

  const {activeKey, setActiveKey, content} = useTabContent('1', leadsData);


  const columns = [
    {
      title: 'Lead',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <Space>
          <Avatar icon={<UserOutlined />} size="small" />
          <div>
            <Text strong>{text}</Text>
            <br />
            <Text type="secondary" style={{ fontSize: '12px' }}>{record.email}</Text>
          </div>
        </Space>
      ),
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      width: 120,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        let color = '';
        let icon = null;
        if (status === 'new') { color = 'blue'; icon = <SyncOutlined />; }
        else if (status === 'processing') { color = 'orange'; icon = <TeamOutlined />; }
        else if (status === 'closed') { color = 'green'; icon = <CheckCircleOutlined />; }
        return <Tag color={color} icon={icon}>{status.toUpperCase()}</Tag>;
      },
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Button type="link" size="small">View</Button>
      ),
    },
  ];

  const tabItems = [
    { key: '1', label: <span><UserOutlined /> New Leads</span> },
    { key: '2', label: <span><SyncOutlined /> Processing</span> },
    { key: '3', label: <span><CheckCircleOutlined /> Closed</span> },
  ];

  return (
    <>
      <Col span={12}>
        <Card title='Lead' size="small" extra={<><Tabs size="small" type="card" activeKey={activeKey} onChange={setActiveKey} items={tabItems}></Tabs></>} >
        <Table
          columns={columns}
          dataSource={content}
          rowKey="id"
          size="small"
          pagination={{ pageSize: 5, showSizeChanger: false, hideOnSinglePage: true }}
          locale={{ emptyText: 'No leads found' }}
        />
        </Card>
      </Col>
    </>
  )
};

function ScheduleList() {
  const scheduleData = {
    '1': [ // Reminders
      { id: 1, title: 'Follow up with John', datetime: '2025-03-10 10:00 AM', priority: 'high', status: 'pending' },
      { id: 2, title: 'Submit quarterly report', datetime: '2025-03-10 05:00 PM', priority: 'medium', status: 'pending' },
      { id: 3, title: 'Call client for feedback', datetime: '2025-03-11 02:00 PM', priority: 'low', status: 'completed' },
    ],
    '2': [ // Meetings
      { id: 4, title: 'Sales Strategy', datetime: '2025-03-10 11:00 AM', attendee: 'Sales Team', location: 'Conference Room A', status: 'upcoming' },
      { id: 5, title: 'Product Demo', datetime: '2025-03-10 03:00 PM', attendee: 'Jane Smith', location: 'Zoom', status: 'upcoming' },
      { id: 6, title: 'Weekly Sync', datetime: '2025-03-09 09:00 AM', attendee: 'Dev Team', location: 'Google Meet', status: 'completed' },
    ],
    '3': [ // Events
      { id: 7, title: 'Tech Conference', datetime: '2025-03-15 09:00 AM', location: 'Convention Center', type: 'external', status: 'upcoming' },
      { id: 8, title: 'Team Building', datetime: '2025-03-20 02:00 PM', location: 'Park', type: 'internal', status: 'upcoming' },
    ],
  };

  const { activeKey, setActiveKey, content } = useTabContent('1', scheduleData);

  // Columns for the table (works for all tabs)
  const columns = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      render: (text, record) => (
        <Space>
          <Avatar 
            icon={
              activeKey === '1' ? <BellOutlined /> : 
              activeKey === '2' ? <VideoCameraOutlined /> : 
              <CalendarOutlined />
            } 
            size="small" 
            style={{ backgroundColor: '#1890ff' }}
          />
          <Text strong>{text}</Text>
        </Space>
      ),
    },
    {
      title: 'Date & Time',
      dataIndex: 'datetime',
      key: 'datetime',
      render: (text) => (
        <Space>
          <ClockCircleOutlined style={{ color: '#8c8c8c' }} />
          <Text>{text}</Text>
        </Space>
      ),
    },
    {
      title: 'Details',
      key: 'details',
      render: (_, record) => {
        if (activeKey === '2') { // Meetings
          return <Text type="secondary">{record.attendee} • {record.location}</Text>;
        } else if (activeKey === '3') { // Events
          return <Text type="secondary">{record.location} • {record.type}</Text>;
        } else { // Reminders
          return (
            <Tag color={record.priority === 'high' ? 'red' : record.priority === 'medium' ? 'orange' : 'blue'}>
              {record.priority.toUpperCase()}
            </Tag>
          );
        }
      },
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        let color = '';
        let icon = null;
        if (status === 'pending' || status === 'upcoming') {
          color = 'processing';
          icon = <SyncOutlined />;
        } else if (status === 'completed') {
          color = 'success';
          icon = <CheckCircleOutlined />;
        } else if (status === 'cancelled') {
          color = 'error';
          icon = <CloseCircleOutlined />;
        }
        return <Tag color={color} icon={icon}>{status.toUpperCase()}</Tag>;
      },
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Button type="link" size="small">
          {activeKey === '1' ? 'Snooze' : activeKey === '2' ? 'Join' : 'Details'}
        </Button>
      ),
    },
  ];

  const tabItems = [
    { key: '1', label: <span><BellOutlined /> Reminders</span> },
    { key: '2', label: <span><VideoCameraOutlined /> Meetings</span> },
    { key: '3', label: <span><CalendarOutlined /> Events</span> },
  ];

  return (
    <Col span={12}>
      <Card
        title="Schedule"
        size="small"
        style={{
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          height: '100%',
        }}
        extra={
          <Tabs
            size="small"
            type="card"
            activeKey={activeKey}
            onChange={setActiveKey}
            items={tabItems}
          />
        }
      >
        <Table
          columns={columns}
          dataSource={content}
          rowKey="id"
          size="small"
          pagination={{ pageSize: 5, showSizeChanger: false, hideOnSinglePage: true }}
          locale={{ emptyText: 'No schedule items found' }}
        />
      </Card>
    </Col>
  );
};

function TasksList() {
  // Demo data – replace with real API
  const tasksData = {
    '1': [ // Pending
      { id: 1, title: 'Complete project proposal', assignedTo: 'John Doe', dueDate: '2025-03-12', priority: 'high', status: 'pending' },
      { id: 2, title: 'Review pull requests', assignedTo: 'Jane Smith', dueDate: '2025-03-11', priority: 'medium', status: 'pending' },
      { id: 3, title: 'Update documentation', assignedTo: 'Bob Johnson', dueDate: '2025-03-13', priority: 'low', status: 'pending' },
    ],
    '2': [ // Completed
      { id: 4, title: 'Fix login bug', assignedTo: 'Alice Brown', dueDate: '2025-03-09', priority: 'high', status: 'completed', completedOn: '2025-03-09' },
      { id: 5, title: 'Send weekly report', assignedTo: 'John Doe', dueDate: '2025-03-08', priority: 'medium', status: 'completed', completedOn: '2025-03-08' },
    ],
    '3': [ // Missed
      { id: 6, title: 'Client meeting prep', assignedTo: 'Jane Smith', dueDate: '2025-03-07', priority: 'high', status: 'missed' },
      { id: 7, title: 'Submit timesheet', assignedTo: 'Bob Johnson', dueDate: '2025-03-05', priority: 'low', status: 'missed' },
    ],
  };

  const { activeKey, setActiveKey, content } = useTabContent('1', tasksData);

  // Columns for the table
  const columns = [
    {
      title: 'Task',
      dataIndex: 'title',
      key: 'title',
      render: (text, record) => (
        <Space>
          <Avatar 
            icon={<ClockCircleOutlined />} 
            size="small" 
            style={{ backgroundColor: '#13c2c2' }}
          />
          <div>
            <Text strong>{text}</Text>
            <br />
            <Text type="secondary" style={{ fontSize: '12px' }}>Assigned to: {record.assignedTo}</Text>
          </div>
        </Space>
      ),
    },
    {
      title: 'Due Date',
      dataIndex: 'dueDate',
      key: 'dueDate',
      render: (text) => (
        <Space>
          <CalendarOutlined style={{ color: '#8c8c8c' }} />
          <Text>{text}</Text>
        </Space>
      ),
    },
    {
      title: 'Priority',
      dataIndex: 'priority',
      key: 'priority',
      render: (priority) => {
        let color = '';
        if (priority === 'high') color = 'red';
        else if (priority === 'medium') color = 'orange';
        else color = 'blue';
        return <Tag color={color}>{priority.toUpperCase()}</Tag>;
      },
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        let color = '';
        let icon = null;
        if (status === 'pending') {
          color = 'processing';
          icon = <ClockCircleOutlined />;
        } else if (status === 'completed') {
          color = 'success';
          icon = <CheckCircleOutlined />;
        } else if (status === 'missed') {
          color = 'error';
          icon = <CloseCircleOutlined />;
        }
        return <Tag color={color} icon={icon}>{status.toUpperCase()}</Tag>;
      },
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Button type="link" size="small">
          {activeKey === '1' ? 'Start' : activeKey === '2' ? 'View' : 'Retry'}
        </Button>
      ),
    },
  ];

  const tabItems = [
    { key: '1', label: <span><ClockCircleOutlined /> Pending</span> },
    { key: '2', label: <span><CheckCircleOutlined /> Completed</span> },
    { key: '3', label: <span><CloseCircleOutlined /> Missed</span> },
  ];

  return (
    <Col span={12}>
      <Card
        title="Tasks"
        size="small"
        style={{
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          height: '100%',
        }}
        extra={
          <Tabs
            size="small"
            type="card"
            activeKey={activeKey}
            onChange={setActiveKey}
            items={tabItems}
          />
        }
      >
        <Table
          columns={columns}
          dataSource={content}
          rowKey="id"
          size="small"
          pagination={{ pageSize: 5, showSizeChanger: false, hideOnSinglePage: true }}
          locale={{ emptyText: 'No tasks found' }}
        />
      </Card>
    </Col>
  );
};

function TodoList() {
  // Demo data – replace with real API
  const todosData = {
    '1': [ // High priority
      { id: 1, task: 'Complete project presentation', dueDate: '2025-03-10', completed: false, priority: 'high' },
      { id: 2, task: 'Fix critical production bug', dueDate: '2025-03-09', completed: false, priority: 'high' },
      { id: 3, task: 'Submit quarterly report', dueDate: '2025-03-11', completed: true, priority: 'high' },
    ],
    '2': [ // Medium priority
      { id: 4, task: 'Review team pull requests', dueDate: '2025-03-12', completed: false, priority: 'medium' },
      { id: 5, task: 'Update documentation', dueDate: '2025-03-13', completed: false, priority: 'medium' },
      { id: 6, task: 'Schedule client meeting', dueDate: '2025-03-10', completed: true, priority: 'medium' },
    ],
    '3': [ // Low priority
      { id: 7, task: 'Organize workspace', dueDate: '2025-03-15', completed: false, priority: 'low' },
      { id: 8, task: 'Read industry news', dueDate: '2025-03-14', completed: false, priority: 'low' },
      { id: 9, task: 'Update profile picture', dueDate: '2025-03-16', completed: true, priority: 'low' },
    ],
  };

  const { activeKey, setActiveKey, content } = useTabContent('1', todosData);

  // Columns for the table
  const columns = [
    {
      title: 'Status',
      key: 'completed',
      width: 60,
      render: (_, record) => (
        <Checkbox 
          checked={record.completed}
          onChange={(e) => {
            // Handle toggle – integrate with your state/API
            console.log(`Todo ${record.id} completed: ${e.target.checked}`);
          }}
        />
      ),
    },
    {
      title: 'Task',
      dataIndex: 'task',
      key: 'task',
      render: (text, record) => (
        <Space>
          <Avatar 
            icon={
              record.priority === 'high' ? <FireOutlined /> :
              record.priority === 'medium' ? <MenuOutlined /> :
              <SmileOutlined />
            } 
            size="small" 
            style={{ 
              backgroundColor: 
                record.priority === 'high' ? '#ff4d4f' :
                record.priority === 'medium' ? '#fa8c16' : '#52c41a'
            }}
          />
          <Text 
            delete={record.completed}
            strong={!record.completed}
            style={{ 
              color: record.completed ? '#8c8c8c' : '#1f1f1f',
              textDecoration: record.completed ? 'line-through' : 'none'
            }}
          >
            {text}
          </Text>
        </Space>
      ),
    },
    {
      title: 'Due Date',
      dataIndex: 'dueDate',
      key: 'dueDate',
      render: (text, record) => (
        <Space>
          <CalendarOutlined style={{ color: '#8c8c8c' }} />
          <Text type={record.completed ? 'secondary' : null}>{text}</Text>
        </Space>
      ),
    },
    {
      title: 'Priority',
      dataIndex: 'priority',
      key: 'priority',
      render: (priority) => {
        let color = '';
        if (priority === 'high') color = 'red';
        else if (priority === 'medium') color = 'orange';
        else color = 'green';
        return <Tag color={color}>{priority.toUpperCase()}</Tag>;
      },
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Button 
          type="link" 
          size="small" 
          danger={!record.completed && activeKey !== '2'}
          onClick={() => {
            // Handle delete or edit
            console.log(`Action on todo ${record.id}`);
          }}
        >
          {record.completed ? 'Delete' : 'Edit'}
        </Button>
      ),
    },
  ];

  const tabItems = [
    { key: '1', label: <span><FireOutlined /> High</span> },
    { key: '2', label: <span><MenuOutlined /> Medium</span> },
    { key: '3', label: <span><SmileOutlined /> Low</span> },
  ];

  return (
    <Col span={12}>
      <Card
        title="Todo List"
        size="small"
        style={{
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          height: '100%',
        }}
        extra={
          <Tabs
            size="small"
            type="card"
            activeKey={activeKey}
            onChange={setActiveKey}
            items={tabItems}
          />
        }
      >
        <Table
          columns={columns}
          dataSource={content}
          rowKey="id"
          size="small"
          pagination={{ pageSize: 5, showSizeChanger: false, hideOnSinglePage: true }}
          locale={{ emptyText: 'No todos found' }}
        />
      </Card>
    </Col>
  );
};

function StickyNotesSection(){
  const [notes, setNotes] = useState([
    { id: 1, title: 'Meeting', content: 'Discuss Q4 roadmap', date: '2025-03-10' },
    { id: 2, title: 'Idea', content: 'Implement dark mode', date: '2025-03-12' },
  ]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

  // Color palette for sticky notes (cycling)
  const colors = ['#FFF9C4', '#FFE0B5', '#D1F2EB', '#F9E0E0', '#E0F7FA', '#F3E5F5'];

  const handleAddNote = () => {
    form.validateFields().then(values => {
      const newNote = {
        id: Date.now(),
        title: values.title,
        content: values.content,
        date: values.date ? values.date.format('YYYY-MM-DD') : new Date().toISOString().split('T')[0],
      };
      setNotes([newNote, ...notes]);
      form.resetFields();
      setIsModalOpen(false);
    });
  };

  const handleDeleteNote = (id) => {
    setNotes(notes.filter(note => note.id !== id));
  };

  return (
    <>
      <Card
        size="small"
        title="Sticky Notes"
        extra={
          <Button type="primary" size="small" icon={<PlusOutlined />} onClick={() => setIsModalOpen(true)}>
            Add
          </Button>
        }
      >
        {notes.length === 0 ? (
          <Empty description="No sticky notes yet. Click 'Add' to create one." />
        ) : (
          <Row gutter={[16, 16]}>
            {notes.map((note, index) => (
              <Col xs={24} sm={12} md={8} lg={6} key={note.id}>
                <div
                  style={{
                    backgroundColor: colors[index % colors.length],
                    padding: '12px',
                    borderRadius: '8px',
                    boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                    minHeight: '180px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    transition: 'transform 0.2s',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.02)')}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                >
                  <div>
                    <h4 style={{ margin: '0 0 8px 0', fontWeight: 'bold' }}>{note.title}</h4>
                    <p style={{ margin: '0 0 8px 0', fontSize: '12px', color: '#666' }}>
                      {note.date}
                    </p>
                    <p style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                      {note.content}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right', marginTop: '12px' }}>
                    <Popconfirm
                      title="Delete note?"
                      onConfirm={() => handleDeleteNote(note.id)}
                      okText="Yes"
                      cancelText="No"
                    >
                      <Button type="text" size="small" icon={<DeleteOutlined />} danger />
                    </Popconfirm>
                  </div>
                </div>
              </Col>
            ))}
          </Row>
        )}
      </Card>

      {/* Modal for adding a new note */}
      <Modal
        title="Add Sticky Note"
        open={isModalOpen}
        onOk={handleAddNote}
        onCancel={() => {
          setIsModalOpen(false);
          form.resetFields();
        }}
        okText="Add"
        cancelText="Cancel"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="title"
            label="Title"
            rules={[{ required: true, message: 'Please enter a title' }]}
          >
            <Input placeholder="e.g., Meeting reminder" />
          </Form.Item>
          <Form.Item
            name="content"
            label="Content"
            rules={[{ required: true, message: 'Please enter content' }]}
          >
            <TextArea rows={4} placeholder="Write your note here..." />
          </Form.Item>
          <Form.Item name="date" label="Date (optional)">
            <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};


// charts
// DonutChart component – pure SVG, responsive, with centered label
const DonutChart = ({ segments, total, label, size = 120, strokeWidth = 20 }) => {
  const radius = (size - strokeWidth) / 2;
  const center = size / 2;
  let cumulativeAngle = 0;

  // Generate SVG arcs for each segment
  const arcs = segments.map((segment, index) => {
    const angle = (segment.value / total) * 360;
    const startAngle = cumulativeAngle;
    const endAngle = cumulativeAngle + angle;
    cumulativeAngle += angle;

    // Convert angles to radians
    const startRad = (startAngle - 90) * (Math.PI / 180);
    const endRad = (endAngle - 90) * (Math.PI / 180);

    // Calculate SVG arc path
    const x1 = center + radius * Math.cos(startRad);
    const y1 = center + radius * Math.sin(startRad);
    const x2 = center + radius * Math.cos(endRad);
    const y2 = center + radius * Math.sin(endRad);

    const largeArcFlag = angle > 180 ? 1 : 0;

    return {
      path: `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
      color: segment.color,
      key: index,
    };
  });

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Background circle (optional, for empty segments) */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="#f0f0f0"
          strokeWidth={strokeWidth}
        />
        {/* Segments */}
        {arcs.map((arc) => (
          <path
            key={arc.key}
            d={arc.path}
            fill="none"
            stroke={arc.color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
        ))}
      </svg>
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: '24px', fontWeight: 600 }}>{total}</div>
        <div style={{ fontSize: '12px', color: '#8c8c8c' }}>{label}</div>
      </div>
    </div>
  );
};

function LeadStatus() {
  // Example data – replace with real API
  const leadStats = {
    new: 2,
    processing: 6,
    closed: 4,
    total: 12,
  };

  const segments = [
    { value: leadStats.new, color: "#3498db", label: "New" },
    { value: leadStats.processing, color: "#fa8c16", label: "Processing" },
    { value: leadStats.closed, color: "#2ecc71", label: "Closed" },
  ];

  return (
    <Col span={12}>
      <Card
        size="small"
        title="Lead Status"
        style={{
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          height: '100%',
        }}
      >
        <Row gutter={[16, 16]} align="middle">
          {/* Donut Chart */}
          <Col span={12} style={{ textAlign: 'center' }}>
            <DonutChart
              segments={segments}
              total={leadStats.total}
              label="Total Leads"
              size={140}
              strokeWidth={18}
            />
          </Col>

          {/* Legend & Stats */}
          <Col span={12}>
            <div>
              {segments.map((seg) => (
                <div
                  key={seg.label}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 12,
                  }}
                >
                  <div>
                    <span
                      style={{
                        display: 'inline-block',
                        width: 12,
                        height: 12,
                        borderRadius: '2px',
                        backgroundColor: seg.color,
                        marginRight: 8,
                      }}
                    />
                    <Text>{seg.label}</Text>
                  </div>
                  <Text strong>{seg.value}</Text>
                </div>
              ))}
              <div
                style={{
                  marginTop: 12,
                  paddingTop: 8,
                  borderTop: '1px solid #f0f0f0',
                }}
              >
                <Statistic
                  title="Conversion Rate"
                  value={((leadStats.closed / leadStats.total) * 100).toFixed(1)}
                  suffix="%"
                  valueStyle={{ fontSize: '18px', color: '#52c41a' }}
                />
              </div>
            </div>
          </Col>
        </Row>
      </Card>
    </Col>
  );
};

function LeadSource() {
  // Demo data – replace with real API
  const sourceStats = {
    website: 45,
    referral: 30,
    socialMedia: 15,
    email: 10,
    total: 100,
  };

  const segments = [
    { value: sourceStats.website, color: "#3498db", label: "Website", icon: <GlobalOutlined /> },
    { value: sourceStats.referral, color: "#2ecc71", label: "Referral", icon: <UserOutlined /> },
    { value: sourceStats.socialMedia, color: "#9b59b6", label: "Social Media", icon: <FacebookOutlined /> },
    { value: sourceStats.email, color: "#e67e22", label: "Email", icon: <MailOutlined /> },
  ];

  return (
    <Col span={12}>
      <Card
        size="small"
        title="Lead Source"
        style={{
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          height: '100%',
        }}
      >
        <Row gutter={[16, 16]} align="middle">
          {/* Donut Chart */}
          <Col span={12} style={{ textAlign: 'center' }}>
            <DonutChart
              segments={segments}
              total={sourceStats.total}
              label="Total Leads"
              size={140}
              strokeWidth={18}
            />
          </Col>

          {/* Legend with source names, counts, and icons */}
          <Col span={12}>
            {segments.map((seg) => (
              <div
                key={seg.label}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 12,
                }}
              >
                <div>
                  <span
                    style={{
                      display: 'inline-block',
                      width: 12,
                      height: 12,
                      borderRadius: '2px',
                      backgroundColor: seg.color,
                      marginRight: 8,
                    }}
                  />
                  <Text>
                    {seg.icon} {seg.label}
                  </Text>
                </div>
                <Text strong>{seg.value}</Text>
              </div>
            ))}
          </Col>
        </Row>
      </Card>
    </Col>
  );
};

// Circular progress ring (gauge)
const ProgressRing = ({ percent, size = 120, strokeWidth = 12, color = '#52c41a' }) => {
  const radius = (size - strokeWidth) / 2;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={center} cy={center} r={radius} fill="none" stroke="#f0f0f0" strokeWidth={strokeWidth} />
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform={`rotate(-90 ${center} ${center})`}
        />
      </svg>
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
        <div style={{ fontSize: '28px', fontWeight: 600, color }}>{percent}%</div>
        <div style={{ fontSize: '12px', color: '#8c8c8c' }}>Completed</div>
      </div>
    </div>
  );
};

function TaskCompletion() {
  // Date range state (default: last 7 days)
  const [dateRange, setDateRange] = useState([dayjs().subtract(7, 'day'), dayjs()]);

  // Mock task data with dates – replace with your API call
  const allTasks = [
    { id: 1, status: 'completed', date: '2025-03-10' },
    { id: 2, status: 'completed', date: '2025-03-10' },
    { id: 3, status: 'pending', date: '2025-03-10' },
    { id: 4, status: 'missed', date: '2025-03-09' },
    { id: 5, status: 'completed', date: '2025-03-09' },
    { id: 6, status: 'pending', date: '2025-03-08' },
    { id: 7, status: 'completed', date: '2025-03-08' },
    { id: 8, status: 'missed', date: '2025-03-07' },
    { id: 9, status: 'completed', date: '2025-03-07' },
    { id: 10, status: 'pending', date: '2025-03-06' },
    { id: 11, status: 'completed', date: '2025-03-06' },
    { id: 12, status: 'completed', date: '2025-03-05' },
  ];

  // Filter tasks by selected date range
  const filteredTasks = allTasks.filter(task => {
    const taskDate = dayjs(task.date);
    const start = dateRange[0];
    const end = dateRange[1];
    return (taskDate.isAfter(start.subtract(1, 'day')) && taskDate.isBefore(end.add(1, 'day')));
  });

  const completedTasks = filteredTasks.filter(t => t.status === 'completed').length;
  const pendingTasks = filteredTasks.filter(t => t.status === 'pending').length;
  const missedTasks = filteredTasks.filter(t => t.status === 'missed').length;
  const totalTasks = filteredTasks.length;
  const completionRate = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

  // Handle date range change
  const handleDateRangeChange = (dates) => {
    if (dates) {
      setDateRange(dates);
    } else {
      // Reset to last 7 days if cleared
      setDateRange([dayjs().subtract(7, 'day'), dayjs()]);
    }
  };

  return (
    <Col span={12}>
      <Card
        size="small"
        title="Task Completion"
        style={{
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          height: '100%',
        }}
        extra={
          <Space>
            <CalendarOutlined style={{ color: '#1890ff' }} />
            <RangePicker
              size="small"
              value={dateRange}
              onChange={handleDateRangeChange}
              format="YYYY-MM-DD"
              allowClear={false}
            />
          </Space>
        }
      >
        <Row gutter={[16, 16]} align="middle">
          <Col span={12} style={{ textAlign: 'center' }}>
            <ProgressRing percent={completionRate} size={140} strokeWidth={14} color="#52c41a" />
          </Col>
          <Col span={12}>
            <div style={{ marginBottom: 12 }}>
              <Statistic
                title="Completed"
                value={completedTasks}
                prefix={<CheckCircleOutlined />}
                valueStyle={{ color: '#52c41a', fontSize: '20px' }}
              />
            </div>
            <div style={{ marginBottom: 12 }}>
              <Statistic
                title="Pending"
                value={pendingTasks}
                prefix={<ClockCircleOutlined />}
                valueStyle={{ color: '#fa8c16', fontSize: '20px' }}
              />
            </div>
            <div>
              <Statistic
                title="Missed"
                value={missedTasks}
                prefix={<CloseCircleOutlined />}
                valueStyle={{ color: '#ff4d4f', fontSize: '20px' }}
              />
            </div>
            <div style={{ marginTop: 12, fontSize: '12px', color: '#8c8c8c' }}>
              {dateRange[0].format('MMM D, YYYY')} – {dateRange[1].format('MMM D, YYYY')}
            </div>
          </Col>
        </Row>
      </Card>
    </Col>
  );
};

// Status bar component (unchanged)
const StatusBar = ({ data, total }) => {
  if (total === 0) return null;
  const getWidth = (value) => (value / total) * 100;
  return (
    <div style={{ display: 'flex', height: 8, borderRadius: 4, overflow: 'hidden', marginTop: 8 }}>
      {data.map((item) => (
        <div key={item.status} style={{ width: `${getWidth(item.value)}%`, backgroundColor: item.color }} />
      ))}
    </div>
  );
};

function MeetingActivity() {
  const [dateRange, setDateRange] = useState([dayjs().subtract(7, 'day'), dayjs()]);

  const allMeetings = [
    { id: 1, status: 'completed', date: '2025-03-10', title: 'Sales Review' },
    { id: 2, status: 'completed', date: '2025-03-10', title: 'Product Demo' },
    { id: 3, status: 'upcoming', date: '2025-03-11', title: 'Team Sync' },
    { id: 4, status: 'missed', date: '2025-03-09', title: 'Client Call' },
    { id: 5, status: 'completed', date: '2025-03-09', title: 'Weekly Standup' },
    { id: 6, status: 'upcoming', date: '2025-03-12', title: 'Strategy Meeting' },
    { id: 7, status: 'missed', date: '2025-03-08', title: 'Vendor Discussion' },
    { id: 8, status: 'completed', date: '2025-03-08', title: 'Retrospective' },
    { id: 9, status: 'upcoming', date: '2025-03-13', title: 'Planning' },
  ];

  // Filter meetings using timestamp comparison (no isBetween)
  const filteredMeetings = allMeetings.filter(meeting => {
    const startTs = dateRange[0].startOf('day').valueOf();
    const endTs = dateRange[1].endOf('day').valueOf();
    const meetingTs = dayjs(meeting.date).valueOf();
    return meetingTs >= startTs && meetingTs <= endTs;
  });

  const upcomingCount = filteredMeetings.filter(m => m.status === 'upcoming').length;
  const completedCount = filteredMeetings.filter(m => m.status === 'completed').length;
  const missedCount = filteredMeetings.filter(m => m.status === 'missed').length;
  const total = filteredMeetings.length;

  const statusData = [
    { status: 'upcoming', value: upcomingCount, color: '#1890ff' },
    { status: 'completed', value: completedCount, color: '#52c41a' },
    { status: 'missed', value: missedCount, color: '#ff4d4f' },
  ];

  const handleDateRangeChange = (dates) => {
    if (dates) setDateRange(dates);
    else setDateRange([dayjs().subtract(7, 'day'), dayjs()]);
  };

  const getStatusIcon = (status) => {
    if (status === 'upcoming') return <ClockCircleOutlined style={{ color: '#1890ff' }} />;
    if (status === 'completed') return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
    if (status === 'missed') return <CloseCircleOutlined style={{ color: '#ff4d4f' }} />;
    return null;
  };

  return (
    <Col span={12}>
      <Card
        size="small"
        title="Meeting Activity"
        style={{ borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', height: '100%' }}
        extra={
          <Space>
            <CalendarOutlined style={{ color: '#1890ff' }} />
            <RangePicker size="small" value={dateRange} onChange={handleDateRangeChange} format="YYYY-MM-DD" allowClear={false} />
          </Space>
        }
      >
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Row gutter={[16, 16]}>
              {statusData.map((item) => (
                <Col span={8} key={item.status}>
                  <Statistic
                    title={<Space>{getStatusIcon(item.status)}<Text style={{ fontSize: '12px' }}>{item.status.toUpperCase()}</Text></Space>}
                    value={item.value}
                    valueStyle={{ fontSize: '24px', fontWeight: 600, color: item.color }}
                  />
                </Col>
              ))}
            </Row>
            <StatusBar data={statusData} total={total} />
            <div style={{ marginTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text type="secondary" style={{ fontSize: '12px' }}>
                {dateRange[0].format('MMM D, YYYY')} – {dateRange[1].format('MMM D, YYYY')}
              </Text>
              <Tag icon={<VideoCameraOutlined />} color="blue">Total: {total} meetings</Tag>
            </div>
            {upcomingCount > 0 && (
              <div style={{ marginTop: 12, backgroundColor: '#f5f5f5', borderRadius: 6, padding: 8 }}>
                <Text strong style={{ fontSize: '12px' }}>Upcoming meetings:</Text>
                {filteredMeetings.filter(m => m.status === 'upcoming').slice(0, 2).map(m => (
                  <div key={m.id} style={{ fontSize: '12px', marginTop: 4 }}>• {m.title} ({dayjs(m.date).format('MMM D')})</div>
                ))}
              </div>
            )}
          </Col>
        </Row>
      </Card>
    </Col>
  );
}