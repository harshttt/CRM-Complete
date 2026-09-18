import { useState, useMemo } from "react";
import { 
  Card, Row, Col, Progress, Tag, Typography, Select, Space, Tooltip, Badge, 
  Statistic, Avatar, Button, Grid, Divider, Tabs, Table, Modal, Flex, Alert, 
  Input, Form, message, Spin, Drawer, Popconfirm, Switch, Descriptions, Empty 
} from "antd";
import { 
  CrownOutlined, TrophyOutlined, ArrowUpOutlined, ArrowDownOutlined, 
  FireOutlined, UserOutlined, TeamOutlined, DashboardOutlined, StarOutlined, 
  RiseOutlined, SyncOutlined, BarChartOutlined, PieChartOutlined, 
  HeatMapOutlined, PercentageOutlined, EyeOutlined, EnvironmentOutlined, 
  FieldTimeOutlined, DollarOutlined, DollarCircleOutlined, SettingOutlined, 
  ControlOutlined, ApartmentOutlined, GlobalOutlined, BankOutlined, 
  PartitionOutlined, AreaChartOutlined, AppstoreOutlined, DeploymentUnitOutlined, 
  AuditOutlined, CompassOutlined, CaretDownOutlined, CaretRightOutlined, 
  ThunderboltOutlined, LineChartOutlined, TableOutlined, UserAddOutlined,
  CalendarOutlined, EditOutlined, DeleteOutlined, PlusOutlined, SearchOutlined,
  ReloadOutlined, CloseSquareFilled, UserSwitchOutlined, RollbackOutlined,
  StopOutlined, MailOutlined, PhoneOutlined, BankOutlined as BankIcon,
  EnvironmentOutlined as EnvironmentIcon, ClockCircleOutlined
} from "@ant-design/icons";
import { usePerformanceList } from "../../../../api-hooks/performance";

const { Title, Text } = Typography;
const { Option } = Select;

// Custom hook for permissions and access control
const usePermissions = () => {
  const [acc] = useState({
    viewAccess: true,
    addAccess: true,
    editAccess: true,
    deleteAccess: true,
    view_team: true,
    restore: true,
    assign_role: true
  });
  return acc;
};

/* ------------ SUPER ADMIN DASHBOARD COMPONENT ------------ */

const SuperAdminDashboard = () => {
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [selectedManager, setSelectedManager] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [messageApi, contextHolder] = message.useMessage();

  const {data, refetch:handleRefresh, isFetching:loading} = usePerformanceList({qData:{}});
  
  const acc = usePermissions();
  const [form] = Form.useForm();

  const handleSaveAdmin = (values) => {
    messageApi.success(selectedAdmin ? 'Admin updated successfully' : 'Admin created successfully');
    setIsEditModalOpen(false);
  };

  // Table columns
  const adminColumns = [
    {
      title: "SN",
      dataIndex: "id",
      align: "center",
      width: 70,
      fixed: "left",
      render: (_, __, i) =>  <Text strong>{i + 1}</Text>,
    },
    {
      title: "Admin Details",
      dataIndex: "name",
      width: 200,
      fixed: 'left',
      render: (_, record) => (
        <Space direction="vertical" size={0} style={{ alignItems: "flex-start" }}>
          <Text strong>{record?.admin?.name}</Text>
          <Text type="secondary" style={{ fontSize: 11 }}>{record?.admin?.email || 'N/A'}</Text>
        </Space>
      ),
    },
    {
      title: "Contact",
      dataIndex: "contact",
      width: 180,
      render: (v, record) => (
        <Space direction="vertical" size={2}>
          <Space size={4}>
            <MailOutlined style={{ fontSize: 12, color: '#8C8C8C' }} />
            <Text style={{ fontSize: 12 }}>{record?.admin?.email || 'N/A'}</Text>
          </Space>
          <Space size={4}>
            <PhoneOutlined style={{ fontSize: 12, color: '#8C8C8C' }} />
            <Text style={{ fontSize: 12 }}>{record?.admin?.contact || 'N/A'}</Text>
          </Space>
        </Space>
      ),
    },
    {
      title: "Performance",
      dataIndex: "summary",
      width: 180,
      render: (_, record) => (
        <Space direction="vertical" size={2} style={{ width: '100%' }}>
          <Progress 
            percent={record?.summary?.averageScore} 
            size="small" 
            strokeColor={record?.summary?.averageScore >= 80 ? '#52C41A' : record?.summary?.averageScore >= 60 ? '#1890FF' : '#FAAD14'}
            showInfo={false}
          />
          <Flex justify="space-between">
            <Text style={{ fontSize: 11 }}>{record?.summary?.averageScore}/100</Text>
            <Text style={{ fontSize: 11, color:record?.summary?.bucket?.startsWith('+') ? '#52C41A' : '#FF4D4F'}}>{record?.summary?.bucket}</Text>
          </Flex>
        </Space>
      ),
    },
    {
      title: "Team Size",
      dataIndex: "summary",
      width: 150,
      render: (_, record) => (
        <Space direction="vertical" size={2} align="center">
          <Badge count={`${record?.summary?.totalManagers} Managers`} style={{ backgroundColor: '#1890FF', fontSize: 11 }} />
          <Badge count={`${record?.summary?.totalSalespersons} Executives`} style={{ backgroundColor: '#722ED1', fontSize: 11 }} />
        </Space>
      ),
    },
    // {
    //   title: "Metrics",
    //   dataIndex: "summary",
    //   width: 200,
    //   render: (summary) => (
    //     <Space direction="vertical" size={2}>
    //       <Flex justify="space-between">
    //         <Text type="secondary" style={{ fontSize: 11 }}>Leads:</Text>
    //         <Text strong style={{ fontSize: 11 }}>{summary?.leads}K</Text>
    //       </Flex>
    //       <Flex justify="space-between">
    //         <Text type="secondary" style={{ fontSize: 11 }}>Revenue:</Text>
    //         <Text strong style={{ fontSize: 11, color: '#52C41A' }}>{summary?.revenue}</Text>
    //       </Flex>
    //       <Flex justify="space-between">
    //         <Text type="secondary" style={{ fontSize: 11 }}>Deals:</Text>
    //         <Text strong style={{ fontSize: 11 }}>{summary?.dealsClosed}</Text>
    //       </Flex>
    //     </Space>
    //   ),
    // },
    {
      title: "Action",
      dataIndex: "id",
      width: 120,
      align: "center",
      fixed: "right",
      render: (_, admin) => (
        <Space size="small">
          {acc.viewAccess && (
            <Tooltip title="View Details">
              <Button type="text" size="small" icon={<EyeOutlined />} style={{ borderRadius: 999 }} onClick={() => setSelectedAdmin(admin)} />
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  const ManagerDetailModal = () => (
    <Modal
      open={!!selectedManager}
      onCancel={() => setSelectedManager(null)}
      destroyOnHidden
      footer={null}
      centered
      width={1200}
      title={null}
      styles={{body: { padding: 0, background: "linear-gradient(135deg, #f3f6ff 0%, #ffffff 35%, #fdf5ff 100%)"}}}
      closeIcon={<CloseSquareFilled />}
    >
      {selectedManager && (
        <>
          <Flex justify="space-between" align="center" gap={8} style={{ padding: 20, paddingBottom: 12, borderBottom: "1px solid #f0f0f0" }} >
            <Space align="center">
              <Flex justify="center" align="center" style={{
                width: 36, height: 36, borderRadius: "999px",
                background: "radial-gradient(circle at 30% 20%, #e6f4ff, #d6e4ff)"
              }}>
                <TeamOutlined style={{ color: "#1d39c4" }} />
              </Flex>
              <Space direction="vertical" size={0}>
                <Title level={4} style={{ margin: 0 }}>Manager Details</Title>
                <Text type="secondary" style={{ fontSize: 12 }}>{selectedManager?.manager?.name} - {selectedManager?.salespersons?.length }</Text>
              </Space>
            </Space>
          </Flex>

          <div style={{ padding: 18 }}>
            <Space direction="vertical" size={24} style={{ width: '100%' }}>
              {selectedManager?.salespersons && selectedManager?.salespersons?.length > 0 ? (
                <div>
                  <Title level={5} style={{ marginBottom: 16 }}>Executives under this Manager</Title>
                  <Table
                     rowKey="id"
                     size="small"
                     pagination={false}
                     dataSource={selectedManager?.salespersons}
                     columns = {[
                     {
                       title: 'Executive',
                       key: 'executive',
                       render: (_, record) => (
                        <Space>
                          <Avatar size={32}
                              style={{background: record.bucket === 'risk_zone' ? '#FAAD14' : record.bucket === 'safe_zone' ? '#52C41A' : '#1890FF',}}
                          >
                           {record?.name?.charAt(0)}
                          </Avatar>
                          <div>
                            <Text strong>{record?.name}</Text>
                            <br />
                            <Text type="secondary" style={{ fontSize: 11 }}>{record?.email}</Text>
                          </div>
                        </Space>
                       ),
                      },
                      {
                        title: 'Score',
                        dataIndex: 'totalScore',
                        key: 'totalScore',
                        align: 'center',
                        render: (score, record) => (
                          <Text strong style={{fontSize: 14, color:record.bucket === 'risk_zone' ? '#FAAD14' : record.bucket === 'safe_zone' ? '#52C41A' : '#1890FF'}}>
                            {score} 
                          </Text>
                        ),
                      },
                      {
                        title: 'Branch',
                        dataIndex: 'branch',
                        key: 'branch',
                        align: 'center',
                      },
                      {
                        title: 'Region',
                        dataIndex: 'region',
                        key: 'region',
                        align: 'center',
                      },
                      {
                        title: 'Bucket',
                        dataIndex: 'bucket',
                        key: 'bucket',
                        align: 'center',
                        render: (bucket) => (
                          <Tag color={bucket === 'risk_zone' ? 'warning': bucket === 'safe_zone'? 'success': 'processing' }>{bucket}</Tag>
                        ),
                      },
                      {
                        title: 'AVS',
                        key: 'avs',
                        align: 'center',
                        render: (_, record) => record?.breakdown?.avs ?? 0,
                      },
                      {
                        title: 'CQS',
                        key: 'cqs',
                        align: 'center',
                        render: (_, record) => record?.breakdown?.cqs ?? 0,
                      },
                      {
                        title: 'CRB',
                        key: 'crb',
                        align: 'center',
                        render: (_, record) => record?.breakdown?.crb ?? 0,
                      },
                      {
                        title: 'LPES',
                        key: 'lpes',
                        align: 'center',
                        render: (_, record) => record?.breakdown?.lpes ?? 0,
                      },
                      {
                        title: 'SLS',
                        key: 'sls',
                        align: 'center',
                        render: (_, record) => record?.breakdown?.sls ?? 0,
                      },
                      {
                        title: 'TDS',
                        key: 'tds',
                        align: 'center',
                        render: (_, record) => record?.breakdown?.tds ?? 0,
                      },
                      ]}
                    />
                </div>
              ) : ( <Alert message="No detailed executive data available for this team" type="info" showIcon />)}
              
              <Row gutter={8} justify="end">
                <Col>
                  <Button onClick={() => setSelectedManager(null)} style={{ borderRadius: 999 }}>Close</Button>
                </Col>
              </Row>
            </Space>
          </div>
        </>
      )}
    </Modal>
  );

  const AdminFormModal = () => (
    <Modal
      open={isEditModalOpen}
      onCancel={() => setIsEditModalOpen(false)}
      destroyOnHidden
      footer={null}
      centered
      width={1420}
      title={null}
      styles={{body: { padding: 0, background: "linear-gradient(135deg, #f3f6ff 0%, #ffffff 35%, #fdf5ff 100%)" }}}
      closeIcon={<CloseSquareFilled />}
    >
      <Flex justify="space-between" align="center" gap={8} style={{ padding: 20, paddingBottom: 12, borderBottom: "1px solid #f0f0f0" }} >
        <Space align="center">
          <Flex justify="center" align="center" style={{
            width: 36, height: 36, borderRadius: "999px",
            background: "radial-gradient(circle at 30% 20%, #e6f4ff, #d6e4ff)"
          }}>
            <UserSwitchOutlined style={{ color: "#1d39c4" }} />
          </Flex>
          <Space direction="vertical" size={0}>
            <Title level={4} style={{ margin: 0 }}>{selectedAdmin ? "Edit Admin" : "Add New Admin"}</Title>
            <Text type="secondary" style={{ fontSize: 12 }}>{selectedAdmin ? "Update admin details and permissions" : "Create new admin with role and permissions"}</Text>
          </Space>
        </Space>
      </Flex>

      <div style={{ padding: 18 }}>
        <Form form={form} layout="vertical" onFinish={handleSaveAdmin}>
          <Card 
            size="small"
            style={{
              marginBottom: 12,
              borderRadius: 14,
              border: "1px solid #f0f0f0",
              background: "rgba(255,255,255,0.96)",
            }}
            styles={{ body: { padding: 12 } }}
            title={
              <Space>
                <Flex justify="center" align="center" style={{ width: 24, height: 24, borderRadius: "999px", background: "#e6f4ff" }}>
                  <UserSwitchOutlined style={{ fontSize: 14, color: "#1677ff" }} />
                </Flex>
                <span>Basic Information</span>
              </Space>
            }
          >
            <Row gutter={12}>
              <Col xs={24} md={12}>
                <Form.Item label="Full Name" name="fullName" rules={[{ required: true, message: "Full name is required" }]}>
                  <Input placeholder="e.g. Robert Chen" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item label="Email" name="email" 
                  rules={[
                    { required: true, message: "Email is required" }, 
                    { type: "email", message: "Enter a valid email" }
                  ]}
                >
                  <Input placeholder="e.g. robert@skyline.com" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item label="Phone" name="phone" rules={[{ required: true, message: "Phone is required" }]}>
                  <Input placeholder="e.g. +91 9876543210" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item label="Organization" name="organization" rules={[{ required: true, message: "Organization is required" }]}>
                  <Input placeholder="e.g. Skyline Realty" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item label="Region" name="region" rules={[{ required: true, message: "Region is required" }]}>
                  <Input placeholder="e.g. India" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item label="Status" name="status" rules={[{ required: true, message: "Status is required" }]} initialValue="active">
                  <Select placeholder="Select status">
                    <Option value="active">Active</Option>
                    <Option value="inactive">Inactive</Option>
                  </Select>
                </Form.Item>
              </Col>
              {!selectedAdmin && (
                <>
                  <Col xs={24} md={12}>
                    <Form.Item label="Set Password" name="password" rules={[{ required: true, message: "Password is required" }]}>
                      <Input.Password placeholder="**********" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item  label="Confirm Password"  name="confirmPassword" 
                      rules={[
                        { required: true, message: "Please confirm password" },
                        ({ getFieldValue }) => ({
                          validator(_, value) {
                            if (!value || getFieldValue('password') === value) {
                              return Promise.resolve();
                            }
                            return Promise.reject(new Error('Passwords do not match'));
                          },
                        }),
                      ]}
                    >
                      <Input.Password placeholder="**********" />
                    </Form.Item>
                  </Col>
                </>
              )}
            </Row>
          </Card>

          <Row gutter={8} justify="end" style={{ marginTop: 8 }}>
            <Col xs={12} md={6}>
              <Button block onClick={() => setIsEditModalOpen(false)} style={{ borderRadius: 999 }}>Cancel</Button>
            </Col>
            <Col xs={12} md={6}>
              <Button type="primary" htmlType="submit" block style={{ borderRadius: 999 }}>{selectedAdmin ? "Save Changes" : "Create Admin"}</Button>
            </Col>
          </Row>
        </Form>
      </div>
    </Modal>
  );

  const AdminDetailModal = () => (
    <Modal
      open={!!selectedAdmin}
      onCancel={() => setSelectedAdmin(null)}
      destroyOnHidden
      footer={null}
      centered
      width={1300}
      title={null}
      styles={{ body: {padding: 0, background: "linear-gradient(135deg, #f3f6ff 0%, #ffffff 35%, #fdf5ff 100%)" }}}
      closeIcon={<CloseSquareFilled />}
    >
      {selectedAdmin && (
        <>
          <Flex justify="space-between" align="center" gap={8} style={{ padding: 20, paddingBottom: 12, borderBottom: "1px solid #f0f0f0" }} >
            <Space align="center">
              <Flex justify="center" align="center" style={{
                width: 36, height: 36, borderRadius: "999px",
                background: `radial-gradient(circle at 30% 20%, ${selectedAdmin?.color}20, ${selectedAdmin?.color}10)`,
                border: `2px solid ${selectedAdmin?.color}`
              }}>
                <CrownOutlined style={{ color: selectedAdmin?.color }} />
              </Flex>
              <Space direction="vertical" size={0}>
                <Title level={4} style={{ margin: 0, color: selectedAdmin?.color }}>{selectedAdmin?.admin?.name}</Title>
                <Text type="secondary" style={{ fontSize: 12 }}>{selectedAdmin?.admin?.email}</Text>
              </Space>
            </Space>
          </Flex>

          <div style={{ padding: 18 }}>
            <Space direction="vertical" size={24} style={{ width: '100%' }}>

              {/* Performance Metrics */}
              <Card 
                size="small"
                style={{ borderRadius: 14, border: "1px solid #f0f0f0", background: "rgba(255,255,255,0.96)"}}
                styles={{ body: { padding: 16 } }}
                title={<Space> <DashboardOutlined /><span>Performance Metrics</span></Space>}
              >
                <Row gutter={[16, 16]}>
                  <Col xs={12} sm={6}>
                    <Statistic title="Performance Score" value={selectedAdmin?.summary?.averageScore} suffix="/100" valueStyle={{ fontSize: 28, color: selectedAdmin?.color }} />
                  </Col>
                  <Col xs={12} sm={6}>
                    <Statistic title="Managers" value={selectedAdmin?.summary?.totalManagers} valueStyle={{ fontSize: 28 }} />
                  </Col>
                  <Col xs={12} sm={6}>
                    <Statistic title="Executives" value={selectedAdmin?.summary?.totalSalespersons} valueStyle={{ fontSize: 28 }}/>
                  </Col>
                </Row>
                
              </Card>

              {/* Managers Section */}
              {selectedAdmin?.managers && selectedAdmin?.managers?.length > 0 && (
                <Card 
                  size="small"
                  style={{
                    borderRadius: 14,
                    border: "1px solid #f0f0f0",
                    background: "rgba(255,255,255,0.96)",
                  }}
                  styles={{ body: { padding: 16 } }}
                  title={
                    <Space>
                      <TeamOutlined />
                      <span>Managers under {selectedAdmin?.admin?.name}</span>
                      <Badge count={selectedAdmin?.managers?.length} style={{ backgroundColor: selectedAdmin?.color }} />
                    </Space>
                  }
                >
                 <Table
                   rowKey="id"
                   size="small"
                   dataSource={selectedAdmin?.managers}
                   pagination={false}
                   onRow={(record) => ({onClick: () => setSelectedManager(record), style: { cursor: 'pointer' }})}
                   columns={[
                        {
                         title: 'Manager',
                         key: 'manager',
                         render: (_, manager) => (
                          <Space>
                            <Avatar size={32} style={{background: manager?.status === 'exceeding' ? '#52C41A' : manager?.status === 'meeting' ? '#1890FF' : '#FAAD14'}}>
                             {manager?.manager?.name?.charAt(0)}
                            </Avatar>
                            <div>
                              <Text strong>{manager?.manager?.name}</Text>
                              <br />
                              {/* <Text type="secondary" style={{ fontSize: 11 }}>{manager?.salespersons?.length}</Text> */}
                            </div>
                          </Space>
                          ),
                        },
                        {
                         title: 'Avg Score',
                         dataIndex: 'avgScore',
                         key: 'avgScore',
                         render:(_, manager) => (<Text>{manager?.summary?.averageScore}</Text>)
                        //  render: (_, manager) => ( <Badge count={manager?.summary?.averageScore} style={{backgroundColor : manager?.summary?.bucket === 'exceeding'? '#52C41A' : manager?.summary?.bucket === 'meeting' ? '#1890FF' : '#FAAD14', fontWeight: 'bold',}}/>),
                        },
                        {
                         title: 'Bucket',
                         dataIndex: 'bucket',
                         key: 'bucket',
                         align: 'center',
                         render: (_, manager) => ( <Text style={{ color: manager?.summary?.bucket === 'risk_zone' ? 'red' : '#52C41A', fontWeight: 500 }}>{manager?.summary?.bucket}</Text>),
                        },
                        {
                         title: 'Executives',
                         dataIndex: 'executiveCount',
                         key: 'executiveCount',
                         align: 'center',
                         render:(_, manager) => <Text>{manager?.summary?.totalSalespersons}</Text>
                        },
                       {
                        title: "Action",
                        dataIndex: "id",
                        width: 120,
                        align: "center",
                        fixed: "right",
                        render: (_, admin) => (
                          <Space size="small">
                             {acc.viewAccess && (
                                <Tooltip title="View Details">
                                     <Button type="text" size="small" icon={<EyeOutlined />} style={{ borderRadius: 999 }} onClick={() => setSelectedManager(admin)} />
                                </Tooltip>
                              )}
                          </Space>
                        ),
                       },
                      ]}
                    />
                </Card>
              )}

              <Row gutter={8} justify="end">
                <Col>
                  <Button onClick={() => setSelectedAdmin(null)} style={{ borderRadius: 999 }}>Close</Button>
                </Col>
              </Row>
            </Space>
          </div>
        </>
      )}
    </Modal>
  );

  return (
    <div>
      {contextHolder}
      
      {/* Header Card */}
      <Card
        size="small"
        bordered={false}
        className="card-style"
        styles={{header: { borderBottom: 'none', padding: '10px' }, body: { padding: '10px' }}}
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
              <Title level={4} style={{ margin: 0 }}>Super Admin Scoreboard</Title>
              <Text type="secondary" style={{ fontSize: 12 }}>Complete overview of all admins, managers, and executives in the system</Text>
            </Space>
          </Space>
        }
        extra={
          <Space align="center">
            <Tooltip title="Refresh data">
              <Button icon={<ReloadOutlined />} size="middle"
                style={{ borderRadius: 999, boxShadow: "0 4px 10px rgba(15,23,42,0.06)" }}
                onClick={handleRefresh} loading={loading}
              />
            </Tooltip>
          </Space>
        }
      >

        {/* System Overview */}
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
                    <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: 14 }}>Overall Performance</Text>
                    <Statistic value={data?.summary?.averageScore} suffix="/100" valueStyle={{ fontSize: 56, fontWeight: 'bold', color: 'white', lineHeight: 1 }} />
                  </div>
                  <Flex justify="center" gap={8} wrap>
                    <Tag style={{ background: 'rgba(255,255,255,0.2)', color: 'white', borderRadius: 12 }}>{data?.summary?.bucket}</Tag>
                  </Flex>
                </Space>
              </div>
            </Col>
            
            <Col xs={24} md={16}>
              <Row gutter={[16, 16]}>
                <Col xs={12} sm={6}>
                  <Card
                    size="small"
                    style={{
                      background: 'rgba(255,255,255,0.15)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      borderRadius: 12,
                      backdropFilter: 'blur(10px)'
                    }}
                    styles={{body:{padding:12}}}
                  >
                    <Space direction="vertical" size={4}>
                      <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12 }}>Total Admins</Text>
                      <Text style={{ color: 'white', fontSize: 24, fontWeight: 'bold' }}>{data?.summary?.totalAdmins || 'N/A'}</Text>
                    </Space>
                  </Card>
                </Col>
                <Col xs={12} sm={6}>
                  <Card
                    size="small"
                    style={{
                      background: 'rgba(255,255,255,0.15)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      borderRadius: 12,
                      backdropFilter: 'blur(10px)'
                    }}
                    bodyStyle={{ padding: 12 }}
                  >
                    <Space direction="vertical" size={4}>
                      <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12 }}>Total Managers</Text>
                      <Text style={{ color: 'white', fontSize: 24, fontWeight: 'bold' }}>{data?.summary?.totalManagers || 'N/A'}</Text>
                    </Space>
                  </Card>
                </Col>
                <Col xs={12} sm={6}>
                  <Card
                    size="small"
                    style={{
                      background: 'rgba(255,255,255,0.15)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      borderRadius: 12,
                      backdropFilter: 'blur(10px)'
                    }}
                    bodyStyle={{ padding: 12 }}
                  >
                    <Space direction="vertical" size={4}>
                      <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12 }}>Total Executives</Text>
                      <Text style={{ color: 'white', fontSize: 24, fontWeight: 'bold' }}>{data?.summary?.totalSalespersons || 'N/A'}</Text>
                    </Space>
                  </Card>
                </Col>
              </Row>
            </Col>
          </Row>
        </Card>

        {/* Main Tabs */}
            <Table
              bordered={false}
              size="middle"
              rowKey="id"
              pagination={{ pageSize: 10, showSizeChanger: true }}
              loading={loading}
              columns={adminColumns}
              dataSource={data?.data}
              style={{
                borderRadius: 16,
                overflow: "hidden",
                background: "rgba(255,255,255,0.98)",
                boxShadow: "0px 4px 12px rgba(15, 23, 42, 0.06)",
              }}
              scroll={{y: "calc(100vh - 150px)", x: "max-content"}}
              locale={{
                emptyText: (
                  <Empty image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description={
                      <Space direction="vertical">
                        <Text>No admins found</Text>
                        {searchTerm && (<Button type="link" onClick={() => setSearchTerm('')}>Clear search</Button>)}
                      </Space>
                    }
                  />
                )
              }}
            />
        {/* <Tabs activeKey={activeTab} onChange={setActiveTab} style={{ marginBottom: 16 }}>
          <TabPane tab={<Space> <ApartmentOutlined /><span>Performance View</span> </Space>} key="hierarchy">
            <Table
              bordered={false}
              size="middle"
              rowKey="id"
              pagination={{ pageSize: 10, showSizeChanger: true }}
              loading={loading}
              columns={adminColumns}
              dataSource={data}
              style={{
                borderRadius: 16,
                overflow: "hidden",
                background: "rgba(255,255,255,0.98)",
                boxShadow: "0px 4px 12px rgba(15, 23, 42, 0.06)",
              }}
              scroll={{y: "calc(100vh - 150px)", x: "max-content"}}
              locale={{
                emptyText: (
                  <Empty image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description={
                      <Space direction="vertical">
                        <Text>No admins found</Text>
                        {searchTerm && (<Button type="link" onClick={() => setSearchTerm('')}>Clear search</Button>)}
                      </Space>
                    }
                  />
                )
              }}
            />
          </TabPane>
        </Tabs> */}

      </Card>

      {/* Modals */}
      <AdminDetailModal />
      <AdminFormModal />
      <ManagerDetailModal />
    </div>
  );
};

export default SuperAdminDashboard;