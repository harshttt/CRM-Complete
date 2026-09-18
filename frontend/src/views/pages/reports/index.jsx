import { useMemo, useState } from "react";
import { Card, Row, Col, Typography, Space, Table, Tag, Button, message, Alert, Tooltip, Flex, Input, Select, DatePicker, Modal, Form, Statistic, Divider, Dropdown, Menu, Avatar, Badge, Tabs, List, Timeline} from "antd";
import { useNavigate } from "react-router-dom";
import { BarChartOutlined, FileTextOutlined, PlusOutlined, ReloadOutlined, DownloadOutlined, EyeOutlined, DeleteOutlined, FilterOutlined, ExportOutlined, ScheduleOutlined, CheckCircleOutlined, ClockCircleOutlined, WarningOutlined, LineChartOutlined, PieChartOutlined, AreaChartOutlined, TableOutlined, SettingOutlined, UserOutlined, TeamOutlined, DollarOutlined, ShoppingOutlined, StarOutlined, ImportOutlined, ThunderboltOutlined} from "@ant-design/icons";
import dayjs from "dayjs";
import util from "../../../utils/util";

const { Text, Title } = Typography;
const { Search } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;

const Reports = () => {
  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();
  const [form] = Form.useForm();
  const reportsPermissions = util.getModulePermissions('reports') || [];

  const refetch = () => {};

  const [acc] = useState({
    viewAccess: reportsPermissions.includes('view'),
    addAccess: reportsPermissions.includes('create'),
    editAccess: reportsPermissions.includes('update'),
    delete: reportsPermissions.includes('delete'),
    exportAccess: reportsPermissions.includes('export'),
  });

  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [dateRange, setDateRange] = useState([dayjs().subtract(7, 'days'), dayjs()]);

  // ---------- Report Types ----------
  const reportTypes = useMemo(
    () => [
      {
        key: "sales",
        title: "Sales Reports",
        description: "Daily, weekly, and monthly sales performance",
        icon: <DollarOutlined />,
        color: "#52c41a",
        route: "/reports/sales",
        count: 15,
      },
      {
        key: "performance",
        title: "Performance Analytics",
        description: "Agent and team performance metrics",
        icon: <BarChartOutlined />,
        color: "#1890ff",
        route: "/reports/performance",
        count: 8,
      },
      {
        key: "inventory",
        title: "Inventory Reports",
        description: "Property listings and status tracking",
        icon: <TableOutlined />,
        color: "#722ed1",
        route: "/reports/inventory",
        count: 12,
      },
      {
        key: "customer",
        title: "Customer Reports",
        description: "Customer behavior and engagement analytics",
        icon: <TeamOutlined />,
        color: "#fa8c16",
        route: "/reports/customer",
        count: 6,
      },
      {
        key: "financial",
        title: "Financial Reports",
        description: "Revenue, expenses, and profitability",
        icon: <AreaChartOutlined />,
        color: "#f5222d",
        route: "/reports/financial",
        count: 10,
      },
    ], []);

  // ---------- Recent Reports ----------
  const [recentReports, setRecentReports] = useState([
    {
      id: 1,
      name: "Q4 2024 Sales Summary Report",
      type: "Sales",
      generated: "2 hours ago",
      generatedBy: "John Doe",
      status: "Ready",
      format: "PDF",
      size: "2.4 MB",
      downloadCount: 45,
      isScheduled: true,
      schedule: "Monthly",
    },
    {
      id: 2,
      name: "Daily User Activity Report",
      type: "Performance",
      generated: "1 day ago",
      generatedBy: "Jane Smith",
      status: "Ready",
      format: "Excel",
      size: "1.8 MB",
      downloadCount: 23,
      isScheduled: true,
      schedule: "Daily",
    },
    {
      id: 3,
      name: "Property Inventory Status",
      type: "Inventory",
      generated: "3 days ago",
      generatedBy: "System",
      status: "Processing",
      format: "PDF",
      size: "3.2 MB",
      downloadCount: 18,
      isScheduled: true,
      schedule: "Weekly",
    },
    {
      id: 4,
      name: "Customer Engagement Analysis",
      type: "Customer",
      generated: "1 week ago",
      generatedBy: "Alex Johnson",
      status: "Ready",
      format: "Excel",
      size: "4.1 MB",
      downloadCount: 32,
      isScheduled: false,
      schedule: null,
    },
    {
      id: 5,
      name: "Monthly Financial Statement",
      type: "Financial",
      generated: "2 weeks ago",
      generatedBy: "System",
      status: "Ready",
      format: "PDF",
      size: "5.6 MB",
      downloadCount: 67,
      isScheduled: true,
      schedule: "Monthly",
    },
    {
      id: 6,
      name: "Marketing Campaign ROI",
      type: "Marketing",
      generated: "1 month ago",
      generatedBy: "Marketing Team",
      status: "Failed",
      format: "Excel",
      size: "N/A",
      downloadCount: 0,
      isScheduled: true,
      schedule: "Monthly",
    },
  ]);

  // ---------- Statistics ----------
  const stats = useMemo(() => ({
    totalReports: 48,
    readyReports: 36,
    processingReports: 8,
    failedReports: 4,
    totalDownloads: 523,
    scheduledReports: 15,
  }), []);

  // ---------- Filtered Reports ----------
  const filteredReports = useMemo(() => {
    return recentReports.filter(report => {
      const matchesSearch = searchTerm === '' || 
        report.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.type.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || report.status.toLowerCase() === statusFilter;
      const matchesType = typeFilter === 'all' || report.type.toLowerCase() === typeFilter;
      
      return matchesSearch && matchesStatus && matchesType;
    });
  }, [recentReports, searchTerm, statusFilter, typeFilter]);

  // ---------- Status Tag ----------
  const statusTag = (status) => {
    const v = (status || "").toLowerCase();
    const config = {
      ready: { color: "green", icon: <CheckCircleOutlined /> },
      processing: { color: "gold", icon: <ClockCircleOutlined /> },
      failed: { color: "red", icon: <WarningOutlined /> },
    };
    const cfg = config[v] || { color: "default", icon: null };
    
    return (<Tag icon={cfg.icon} color={cfg.color} style={{ borderRadius: 999, fontSize: 11, paddingInline: 10,display: 'flex',alignItems: 'center',gap: 4}}>{status}</Tag>);
  };

  // ---------- Format Tag ----------
  const formatTag = (format) => {
    const color = format === 'PDF' ? '#f5222d' : format === 'Excel' ? '#52c41a' : '#1890ff';
    return (<Tag color={color} style={{ borderRadius: 4, fontSize: 11 }}>{format}</Tag>);
  };

  // ---------- Handlers ----------
  const handleGenerateReport = () => {
    setIsModalVisible(true);
    setSelectedReport(null);
  };

  const handleEditReport = (report) => {
    setSelectedReport(report);
    setIsModalVisible(true);
    form.setFieldsValue({
      ...report,
      schedule: report.isScheduled ? report.schedule?.toLowerCase() : 'none',
    });
  };

  const handleDeleteReport = (reportId) => {
    Modal.confirm({
      title: 'Delete Report',
      content: 'Are you sure you want to delete this report? This action cannot be undone.',
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: () => {
        setRecentReports(prev => prev.filter(r => r.id !== reportId));
        messageApi.success('Report deleted successfully');
      },
    });
  };

  const handleDownloadReport = (report) => {
    if (report.status === 'Ready') {
      messageApi.success(`Downloading ${report.name}`);
      // In real app: API call to download
    } else {
      messageApi.warning('Report is not ready for download');
    }
  };

  const handleViewReport = (report) => {
    if (report.status === 'Ready') {
      navigate(`/reports/view/${report.id}`);
    } else {
      messageApi.warning('Report is not available for viewing');
    }
  };

  const handleScheduleReport = (values) => {
    setLoading(true);
    setTimeout(() => {
      const newReport = {
        id: selectedReport ? selectedReport.id : recentReports.length + 1,
        name: values.name,
        type: values.type,
        generated: 'Just now',
        generatedBy: 'Current User',
        status: 'Processing',
        format: values.format,
        size: 'N/A',
        downloadCount: 0,
        isScheduled: values.schedule !== 'none',
        schedule: values.schedule !== 'none' ? values.schedule.charAt(0).toUpperCase() + values.schedule.slice(1) : null,
      };
      
      if (selectedReport) {
        setRecentReports(prev => prev?.map(r => r.id === selectedReport.id ? newReport : r));
        messageApi.success('Report updated successfully');
      } else {
        setRecentReports(prev => [newReport, ...prev]);
        messageApi.success('Report scheduled successfully');
      }
      
      setLoading(false);
      setIsModalVisible(false);
      form.resetFields();
    }, 1000);
  };

  const handleRefreshReports = () => {
    setLoading(true);
    setTimeout(() => {
      // In real app: API call to refresh reports
      messageApi.success('Reports refreshed successfully');
      setLoading(false);
    }, 500);
  };

  const handleExportAll = () => {
    messageApi.info('Exporting all filtered reports...');
    // In real app: API call to export
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setTypeFilter('all');
    setDateRange([dayjs().subtract(7, 'days'), dayjs()]);
  };

  // ---------- Table Columns ----------
  const columns = [
    {
      title: "Report Name",
      dataIndex: "name",
      key: "name",
      width: 250,
      render: (v, record) => (
        <Space direction="vertical" size={2}>
          <Text strong style={{ whiteSpace: "nowrap" }}>{v}</Text>
          {record.isScheduled && (
            <Tag color="blue" style={{ fontSize: 10, padding: '0 6px' }}>
              <ScheduleOutlined /> {record.schedule}
            </Tag>
          )}
        </Space>
      ),
    },
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
      width: 100,
      render: (v) => (
        <Tag color="blue" style={{ borderRadius: 4 }}>
          {v}
        </Tag>
      ),
    },
    {
      title: "Generated",
      dataIndex: "generated",
      key: "generated",
      width: 120,
      render: (v, record) => (
        <Space direction="vertical" size={0}>
          <Text type="secondary" style={{ fontSize: 12 }}>{v}</Text>
          <Text type="secondary" style={{ fontSize: 10 }}>
            by {record.generatedBy}
          </Text>
        </Space>
      ),
    },
    {
      title: "Format",
      dataIndex: "format",
      key: "format",
      width: 80,
      render: (v) => formatTag(v),
    },
    {
      title: "Size",
      dataIndex: "size",
      key: "size",
      width: 80,
    },
    {
      title: "Downloads",
      dataIndex: "downloadCount",
      key: "downloadCount",
      width: 100,
      render: (v) => (
        <Text strong style={{ color: '#1890ff' }}>
          {v}
        </Text>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 100,
      render: (v) => statusTag(v),
    },
    {
      title: "Actions",
      key: "actions",
      width: 150,
      render: (_, record) => {
        const isProcessing = (record.status || "").toLowerCase() === "processing";
        const isFailed = (record.status || "").toLowerCase() === "failed";
        
        return (
          <Space size="small">
            <Tooltip title="View Report">
              <Button 
                type="text" 
                size="small" 
                icon={<EyeOutlined />} 
                onClick={() => handleViewReport(record)}
                disabled={isProcessing || isFailed}
                style={{ borderRadius: 999 }}
              />
            </Tooltip>
            
            <Tooltip title="Download">
              <Button 
                type="text" 
                size="small" 
                icon={<DownloadOutlined />} 
                onClick={() => handleDownloadReport(record)}
                disabled={isProcessing || isFailed}
                style={{ borderRadius: 999 }}
              />
            </Tooltip>
            
            {acc.editAccess && (
              <Tooltip title="Edit">
                <Button 
                  type="text" 
                  size="small" 
                  icon={<SettingOutlined />}
                  onClick={() => handleEditReport(record)}
                  style={{ borderRadius: 999 }}
                />
              </Tooltip>
            )}
            
            {acc.delete && (
              <Tooltip title="Delete">
                <Button 
                  type="text" 
                  danger 
                  size="small" 
                  icon={<DeleteOutlined />}
                  onClick={() => handleDeleteReport(record.id)}
                  style={{ borderRadius: 999 }}
                />
              </Tooltip>
            )}
          </Space>
        );
      },
    },
  ];

  // ---------- Scheduled Reports ----------
  const scheduledReports = useMemo(() => [
    {
      id: 'SCH-001',
      name: 'Daily Sales Report',
      schedule: 'Daily',
      time: '09:00 AM',
      nextRun: dayjs().add(1, 'day').format('DD MMM YYYY'),
      format: 'PDF & Excel',
      recipients: ['management@company.com', 'sales-team@company.com'],
    },
    {
      id: 'SCH-002',
      name: 'Weekly Inventory Report',
      schedule: 'Weekly',
      time: '10:00 AM',
      nextRun: dayjs().add(7, 'day').format('DD MMM YYYY'),
      format: 'Excel',
      recipients: ['inventory@company.com'],
    },
    {
      id: 'SCH-003',
      name: 'Monthly Financial Report',
      schedule: 'Monthly',
      time: '11:00 AM',
      nextRun: dayjs().add(30, 'day').format('DD MMM YYYY'),
      format: 'PDF',
      recipients: ['ceo@company.com', 'finance@company.com'],
    },
  ], []);

  return (
    <div style={{ padding: 0 }}>
      {contextHolder}
      {!acc.viewAccess ? ( <Alert type="error" showIcon title="Access Denied" description="You don't have permission to view reports" style={{ marginBottom: 24 }}/>) : 
      (<>
      <Card size="small" bordered={false} className="card-style" styles={{header:{borderBottom:'none', padding:'18px 22px 6px'}, body:{padding:'8px 22px 18px'}}}
       title={
        <Space align="center">
           <div className="card-icon-container">
             <div className="card-icon-wrapper">
               <ThunderboltOutlined className="card-icon" />
             </div>
          </div>
          <Space direction="vertical" size={0}>
            <Title level={4} style={{ margin: 0 }}>Reports Management{" "}</Title>
            <Text type="secondary" style={{ fontSize: 12 }}>Generate lead, stages, scores, owners and timelines in one place.</Text>
          </Space>
        </Space>
       } 
       extra={
        <Space>
          {acc.exportAccess && <Button icon={<ExportOutlined />} size="middle" style={{ borderRadius: 999 }} onClick={()=>{}}> Export </Button>}
        </Space>
       }
       >
          {/* Header Stats */}
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col xs={24} sm={6}>
              <Card size="small" bordered={false} style={{ background: '#f0f5ff' }}>
                <Statistic title="Total Reports" value={stats.totalReports} prefix={<FileTextOutlined style={{ color: '#1890ff' }} />} valueStyle={{ color: '#1890ff' }} />
              </Card>
            </Col>
            <Col xs={24} sm={6}>
              <Card size="small" bordered={false} style={{ background: '#f6ffed' }}>
                <Statistic title="Sales Report" value={stats.readyReports} suffix={`/ ${stats.totalReports}`} prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />} valueStyle={{ color: '#52c41a' }} />
              </Card>
            </Col>
            <Col xs={24} sm={6}>
              <Card size="small" bordered={false} style={{ background: '#fff7e6' }}>
                <Statistic title="Inventory Report" value={stats.processingReports} prefix={<ClockCircleOutlined style={{ color: '#fa8c16' }} />} valueStyle={{ color: '#fa8c16' }}/>
              </Card>
            </Col>
            <Col xs={24} sm={6}>
              <Card size="small" bordered={false} style={{ background: '#fff1f0' }}>
                <Statistic title="Customer Report" value={stats.totalDownloads} prefix={<DownloadOutlined style={{ color: '#f5222d' }} />} valueStyle={{ color: '#f5222d' }}/>
              </Card>
            </Col>
          </Row>

          {/* Main Content */}
          <Row gutter={[24, 24]}>
            {/* Left Column - Report Types */}
            <Col xs={24} lg={8}>
              <Card
                size="small"
                bordered={false}
                title={
                  <Flex justify="space-between" align="center">
                    <Space>
                      <BarChartOutlined />
                      <Text strong>Report Categories</Text>
                    </Space>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {reportTypes.length} categories
                    </Text>
                  </Flex>
                }
                style={{ borderRadius: 16, boxShadow: '0 1px 20px rgba(0,0,0,0.06)' }}
              >
                <Space direction="vertical" style={{ width: '100%' }} size="middle">
                  {reportTypes?.map((report) => (
                    <Card key={report.key} hoverable onClick={() => navigate(report.route)} style={{borderRadius: 12, border: '1px solid #f0f0f0',transition: 'all 0.3s ease',}} bodyStyle={{ padding: 16 }}>
                      <Flex justify="space-between" align="center">
                        <Space>
                          <Flex justify="center" align="center" style={{width: 40, height: 40, borderRadius: 8,background: `${report.color}15`, color: report.color, fontSize: 20}}>
                            {report.icon}
                          </Flex>
                          <Space direction="vertical" size={0}>
                            <Text strong>{report.title}</Text>
                            <Text type="secondary" style={{ fontSize: 12 }}>{report.description}</Text>
                          </Space>
                        </Space>
                        <Badge count={report.count} style={{backgroundColor: report.color, borderRadius: 999}} />
                      </Flex>
                    </Card>
                  ))}
                </Space>
              </Card>

              {/* Scheduled Reports */}
              {/* <Card
                size="small"
                bordered={false}
                title={
                  <Space>
                    <ScheduleOutlined />
                    <Text strong>Scheduled Reports</Text>
                  </Space>
                }
                style={{ 
                  borderRadius: 16, 
                  boxShadow: '0 1px 20px rgba(0,0,0,0.06)',
                  marginTop: 24,
                }}
              >
                <Timeline>
                  {scheduledReports.map((report) => (
                    <Timeline.Item key={report.id} color="blue" dot={<CalendarOutlined />}>
                      <Space direction="vertical" size={2}>
                        <Text strong>{report.name}</Text>
                        <Text type="secondary" style={{ fontSize: 12 }}>{report.schedule} at {report.time} </Text>
                        <Text type="secondary" style={{ fontSize: 11 }}>Next: {report.nextRun} • {report.format}</Text>
                        <Space size={4}>
                          {report.recipients.slice(0, 2).map((email, idx) => (<Tag key={idx} color="default" style={{ fontSize: 10 }}> {email.split('@')[0]}</Tag>))}
                          {report.recipients.length > 2 && ( <Tag style={{ fontSize: 10 }}>+{report.recipients.length - 2}</Tag>)}
                        </Space>
                      </Space>
                    </Timeline.Item>
                  ))}
                </Timeline>
              </Card> */}
            </Col>

            {/* Right Column - Recent Reports */}
            <Col xs={24} lg={16}>
              <Card
                size="small"
                bordered={false}
                title={
                  <Flex justify="space-between" align="center">
                    <Space>
                      <FileTextOutlined />
                      <Space direction="vertical" size={0}>
                        <Text strong>Recent Reports</Text>
                        <Text type="secondary" style={{ fontSize: 12 }}>{filteredReports.length} reports found</Text>
                      </Space>
                    </Space>
                    <Space>
                      <Tooltip title="Refresh">
                        <Button icon={<ReloadOutlined />} size="middle" loading={loading} onClick={handleRefreshReports} style={{ borderRadius: 999 }} />
                      </Tooltip>
                      {acc.addAccess && (<Button type="primary" icon={<PlusOutlined />} onClick={handleGenerateReport} style={{ borderRadius: 999 }}>Generate Report</Button>)}
                    </Space>
                  </Flex>
                }
                style={{ borderRadius: 16, boxShadow: '0 1px 20px rgba(0,0,0,0.06)' }}
              >
                {/* Filters */}
                <Card size="small" style={{marginBottom: 16, background: '#fafafa', borderRadius: 12}}>
                  <Row gutter={[8, 8]} align="middle">
                    <Col xs={24} md={6}>
                      <Search placeholder="Search reports..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} allowClear style={{ width: '100%' }}/>
                    </Col>
                    <Col xs={12} md={4}>
                      <Select placeholder="Status" style={{ width: '100%' }} value={statusFilter} onChange={setStatusFilter} allowClear suffixIcon={<FilterOutlined />}>
                        <Option value="all">All Status</Option>
                        <Option value="ready">Ready</Option>
                        <Option value="processing">Processing</Option>
                        <Option value="failed">Failed</Option>
                      </Select>
                    </Col>
                    <Col xs={12} md={4}>
                      <Select placeholder="Type" style={{ width: '100%' }} value={typeFilter} onChange={setTypeFilter} allowClear>
                        <Option value="all">All Types</Option>
                        {Array.from(new Set(recentReports.map(r => r.type))).map(type => (<Option key={type.toLowerCase()} value={type.toLowerCase()}>{type}</Option>))}
                      </Select>
                    </Col>
                    <Col xs={24} md={8}>
                      <RangePicker style={{ width: '100%' }} value={dateRange} onChange={setDateRange} format="DD MMM YYYY" />
                    </Col>
                    <Col xs={24} md={2}>
                      <Flex gap={8} justify="end">
                        <Button onClick={handleClearFilters} size="middle" style={{ borderRadius: 999 }}>Clear</Button>
                        {acc.exportAccess && ( <Button type="primary" icon={<ExportOutlined />}onClick={handleExportAll}style={{ borderRadius: 999 }}>Export</Button>)}
                      </Flex>
                    </Col>
                  </Row>
                </Card>

                {/* Reports Table */}
                <div style={{borderRadius: 12, overflow: 'hidden',border: '1px solid #f0f0f0'}}>
                  <Table
                    rowKey="id"
                    dataSource={filteredReports}
                    columns={columns}
                    pagination={{
                      pageSize: 5,
                      showSizeChanger: true,
                      showQuickJumper: true,
                      showTotal: (total) => `Total ${total} reports`,
                    }}
                    size="middle"
                    loading={loading}
                    scroll={{ x: 1000 }}
                  />
                </div>

                {/* Quick Stats */}
                {/* <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
                  <Col xs={24} md={8}>
                    <Card size="small">
                      <Space direction="vertical" style={{ width: '100%' }}>
                        <Text type="secondary">Ready Reports</Text>
                        <Progress 
                          percent={Math.round((stats.readyReports / stats.totalReports) * 100)}
                          strokeColor="#52c41a"
                        />
                      </Space>
                    </Card>
                  </Col>
                  <Col xs={24} md={8}>
                    <Card size="small">
                      <Space direction="vertical" style={{ width: '100%' }}>
                        <Text type="secondary">Average Download Time</Text>
                        <Text strong style={{ fontSize: 20, color: '#1890ff' }}>
                          2.4s
                        </Text>
                      </Space>
                    </Card>
                  </Col>
                  <Col xs={24} md={8}>
                    <Card size="small">
                      <Space direction="vertical" style={{ width: '100%' }}>
                        <Text type="secondary">Most Downloaded</Text>
                        <Text strong style={{ fontSize: 14 }}>
                          Monthly Financial Statement
                        </Text>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          67 downloads
                        </Text>
                      </Space>
                    </Card>
                  </Col>
                </Row> */}
              </Card>
            </Col>
          </Row>
      </Card>
        </>
      )}

      {/* Generate/Edit Report Modal */}
      <Modal
        title={
          <Space>
            {selectedReport ? <SettingOutlined /> : <PlusOutlined />}
            <Text strong>{selectedReport ? 'Edit Report' : 'Generate New Report'}</Text>
          </Space>
        }
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
          setSelectedReport(null);
        }}
        footer={null}
        width={600}
        destroyOnHidden
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleScheduleReport}
          initialValues={{type: 'sales', format: 'pdf', schedule: 'none'}}
        >
          <Form.Item name="name" label="Report Name" rules={[{ required: true, message: 'Please enter report name' }]}>
            <Input placeholder="Enter report name" />
          </Form.Item>

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item name="type" label="Report Type" rules={[{ required: true }]}>
                <Select placeholder="Select type" options={reportTypes?.map(type => ({label:type.key, value:type.title}))} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="schedule" label="Schedule">
            <Select placeholder="Select schedule"  options={[{label:'One Time', value:'none'},{label:'Daily', value:'daily'},{label:'Weekly', value:'weekly'},{label:'Monthly', value:'monthly'},{label:'Quartely', value:'quartely'}]} />
          </Form.Item>

          <Form.Item name="description" label="Description (Optional)">
            <Input.TextArea rows={3} placeholder="Add any notes or description..." />
          </Form.Item>

          <Divider />

          <Flex justify="end" gap={8}>
            <Button 
              onClick={() => {
                setIsModalVisible(false);
                form.resetFields();
              }}
              disabled={loading}
              style={{ borderRadius: 999 }}
            >
              Cancel
            </Button>
            <Button type="primary" htmlType="submit"loading={loading} style={{ borderRadius: 999 }}>
              {selectedReport ? 'Update Report' : 'Schedule Report'}
            </Button>
          </Flex>
        </Form>
      </Modal>
    </div>
  );
};

export default Reports;