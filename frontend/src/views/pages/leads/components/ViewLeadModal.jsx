import { Modal, Spin, Card, Row, Col, Space, Typography, Divider, List, Avatar, Tag, Flex, Button } from "antd";
import { EyeOutlined, UserOutlined, EnvironmentOutlined, FlagOutlined, ClockCircleOutlined, SwapOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import commonObj from '../../../../commonObj';

const { Title, Text } = Typography;

export default function ViewLeadModal({ open, onClose, lead, loading = false }) {
  if (!lead && !loading) return null;

  // Helper to display value or fallback
  const displayValue = (value, fallback = "—") => (value !== null && value !== undefined && value !== "" ? value : fallback);

  // Format list fields (e.g., alternate phones)
  
  const formatList = (list) => (Array.isArray(list) && list.length ? list.join(", ") : null);

  const isSalesPerson = commonObj.role.roleLevel == 4;

  console.log('commonObj---------->', commonObj);
  console.log('isSalesPerson ------------>', isSalesPerson);

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      centered
      width={1000}
      title={null}
      styles={{ body: { padding: 0, background: "linear-gradient(135deg, #f3f6ff 0%, #ffffff 35%, #fdf5ff 100%)" } }}
    >
      <Flex justify="space-between" align="center" gap={8} style={{ padding: 20, paddingBottom: 12, borderBottom: "1px solid #f0f0f0" }}>
        <Space align="center">
          <Flex align="center" justify="center" style={{ width: 36, height: 36, borderRadius: "999px", background: "radial-gradient(circle at 30% 20%, #e6f4ff, #d6e4ff)" }}>
            <EyeOutlined style={{ color: "#1d39c4" }} />
          </Flex>
          <Space direction="vertical" size={0}>
            <Title level={5} style={{ margin: 0 }}>View Lead</Title>
            <Text type="secondary" style={{ fontSize: 12 }}>Complete lead information</Text>
          </Space>
        </Space>
      </Flex>

      <div style={{ padding: 18 }}>
        <Spin spinning={loading}>
          {/* LEAD DETAILS CARD */}
          <Card
            size="small"
            style={{ marginBottom: 12, borderRadius: 14, border: "1px solid #f0f0f0", background: "rgba(255,255,255,0.96)" }}
            styles={{ body: { padding: 12 } }}
            title={<Space><UserOutlined style={{ color: "#1677ff" }} /><span>Lead Details</span></Space>}
          >
            <Row gutter={[12, 8]}>
              <Col xs={12} md={8}>
                <Text type="secondary" style={{ fontSize: 12 }}>Full Name</Text>
                <div style={{ fontWeight: 500 }}>{displayValue(lead?.leadName || lead?.fullName)}</div>
              </Col>
              <Col xs={12} md={8} style={isSalesPerson ? {cursor:'not-allowed'} : {}}>
                <Text type="secondary" style={{ fontSize: 12 }}>Phone</Text>
                <div style={{fontWeight:500}} className={isSalesPerson ? 'no-copy' : ''}>{displayValue(lead?.phone)}</div>
              </Col>
              <Col xs={12} md={8} style={ isSalesPerson ? {cursor:'not-allowed'} : {}}>
                <Text type="secondary" style={{ fontSize: 12 }}>Email</Text>
                <div style={{ fontWeight: 500 }} className={isSalesPerson ? 'no-copy' : ''}>{displayValue(lead?.email)}</div>
              </Col>

              <Col xs={12} md={8} style={ isSalesPerson ? {cursor:'not-allowed'} : {}}>
                <Text type="secondary" style={{ fontSize: 12 }}>Alternate Phones</Text>
                <div style={{ fontWeight: 500 }} className={isSalesPerson ? 'no-copy' : ''}>{displayValue(formatList(lead?.alternatePhones))}</div>
              </Col>
              <Col xs={12} md={8}style={ isSalesPerson ? {cursor:'not-allowed'} : {}}>
                <Text type="secondary" style={{ fontSize: 12 }}>Alternate Emails</Text>
                <div style={{ fontWeight: 500 }} className={isSalesPerson ? 'no-copy' : ''}>{displayValue(formatList(lead?.alternateEmails))}</div>
              </Col>
              <Col xs={12} md={8}>
                <Text type="secondary" style={{ fontSize: 12 }}>Location</Text>
                <div style={{ fontWeight: 500 }}>{displayValue(lead?.primary_location)}</div>
              </Col>

              <Col xs={12} md={8}>
                <Text type="secondary" style={{ fontSize: 12 }}>Category</Text>
                <div style={{ fontWeight: 500 }}>{displayValue(lead?.category?.name || lead?.category)}</div>
              </Col>
              <Col xs={12} md={8}>
                <Text type="secondary" style={{ fontSize: 12 }}>Source</Text>
                <div style={{ fontWeight: 500 }}>{displayValue(lead?.source)}</div>
              </Col>
              <Col xs={12} md={8}>
                <Text type="secondary" style={{ fontSize: 12 }}>Stage</Text>
                <div style={{ fontWeight: 500 }}>{displayValue(lead?.stage)}</div>
              </Col>

              <Col xs={12} md={8}>
                <Text type="secondary" style={{ fontSize: 12 }}>Tags</Text>
                <div style={{ fontWeight: 500 }}>{displayValue(lead?.tags)}</div>
              </Col>
              <Col xs={12} md={8}>
                <Text type="secondary" style={{ fontSize: 12 }}>Lead Score</Text>
                <div style={{ fontWeight: 500 }}>{displayValue(lead?.score)}</div>
              </Col>
            </Row>
          </Card>

          {/* PROJECT DETAILS CARD */}
          <Card
            size="small"
            style={{ marginBottom: 12, borderRadius: 14, border: "1px solid #f0f0f0", background: "rgba(255,255,255,0.96)" }}
            styles={{ body: { padding: 12 } }}
            title={<Space><EnvironmentOutlined style={{ color: "#52c41a" }} /><span>Project Details</span></Space>}
          >
            <Row gutter={[12, 8]}>
              <Col xs={24} md={12}>
                <Text type="secondary" style={{ fontSize: 12 }}>Project Name</Text>
                <div style={{ fontWeight: 500 }}>{displayValue(lead?.projectName || lead?.campaign)}</div>
              </Col>
              <Col xs={24} md={12}>
                <Text type="secondary" style={{ fontSize: 12 }}>Budget Range (₹)</Text>
                <div style={{ fontWeight: 500 }}>
                  {lead?.budgetMin && lead?.budgetMax
                    ? `${lead.budgetMin} – ${lead.budgetMax}`
                    : displayValue(lead?.budgetRange)}
                </div>
              </Col>
              <Col xs={24}>
                <Text type="secondary" style={{ fontSize: 12 }}>Project Description</Text>
                <div style={{ fontWeight: 500, whiteSpace: "pre-wrap" }}>{displayValue(lead?.property_description)}</div>
              </Col>
            </Row>
          </Card>

          {/* ASSIGNMENT & STATUS CARD */}
          <Card
            size="small"
            style={{ marginBottom: 12, borderRadius: 14, border: "1px solid #f0f0f0", background: "rgba(255,255,255,0.96)" }}
            styles={{ body: { padding: 12 } }}
            title={<Space><FlagOutlined style={{ color: "#fa8c16" }} /><span>Assignment & Status</span></Space>}
          >
            <Row gutter={[12, 8]}>
              <Col xs={24} md={8}>
                <Text type="secondary" style={{ fontSize: 12 }}>Assigned To</Text>
                <div style={{ fontWeight: 500 }}>{displayValue(lead?.assignedTo?.fullName || lead?.assignedTo)}</div>
              </Col>
              <Col xs={24} md={8}>
                <Text type="secondary" style={{ fontSize: 12 }}>Assignee Role</Text>
                <div style={{ fontWeight: 500 }}>{displayValue(lead?.assignedTo?.role?.name || lead?.currentOwnerRole)}</div>
              </Col>
              <Col xs={24} md={8}>
                <Text type="secondary" style={{ fontSize: 12 }}>Owner Type</Text>
                <div style={{ fontWeight: 500 }}>{displayValue(lead?.ownerType)}</div>
              </Col>
            </Row>

            {/* Assignment History */}
            {lead?.assignmentHistory && lead.assignmentHistory.length > 0 && (
              <>
                <Divider style={{ margin: "16px 0 8px" }} />
                <Text strong style={{ fontSize: 14, marginBottom: 8, display: "block" }}>Assignment History</Text>
                <List
                  size="small"
                  dataSource={lead.assignmentHistory}
                  renderItem={(item) => (
                    <List.Item style={{ padding: "8px 0", borderBottom: "1px dashed #f0f0f0" }}>
                      <List.Item.Meta
                        avatar={<Avatar size="small" icon={<UserOutlined />} style={{ backgroundColor: "#597ef7" }} />}
                        title={
                          <Flex justify="space-between" align="center" wrap>
                            <Space size={4}>
                              <Tag color="purple">{item.roleFrom || "N/A"}</Tag>
                              <SwapOutlined style={{ fontSize: 12 }} />
                              <Tag color="green">{item.roleTo || "N/A"}</Tag>
                            </Space>
                            <Space>
                              <ClockCircleOutlined style={{ fontSize: 12 }} />
                              <Text type="secondary" style={{ fontSize: 12 }}>{dayjs(item.changedAt).format("DD MMM YYYY, hh:mm A")}</Text>
                            </Space>
                          </Flex>
                        }
                        description={
                          <div>
                            <Text type="secondary" style={{ fontSize: 12 }}>
                              From: {item.from?.fullName || item.from || "Unknown"} → To: {item.to?.fullName || item.to || "Unknown"}
                            </Text>
                            {item.changedBy && (
                              <div>
                                <Text type="secondary" style={{ fontSize: 12 }}>Changed by: {item.changedBy?.fullName || item.changedBy}</Text>
                              </div>
                            )}
                          </div>
                        }
                      />
                    </List.Item>
                  )}
                />
              </>
            )}
          </Card>

          {/* OPTIONAL: Additional sections like Communication, Follow-ups if needed */}
          {(lead?.message || lead?.timeline) && (
            <Card
              size="small"
              style={{ borderRadius: 14, border: "1px solid #f0f0f0", background: "rgba(255,255,255,0.96)" }}
              styles={{ body: { padding: 12 } }}
              title={<Space><ClockCircleOutlined style={{ color: "#722ed1" }} /><span>Notes & Timeline</span></Space>}
            >
              <Row gutter={[12, 8]}>
                {lead?.message && (
                  <Col xs={24}>
                    <Text type="secondary" style={{ fontSize: 12 }}>Lead Message / Notes</Text>
                    <div style={{ whiteSpace: "pre-wrap" }}>{lead.message}</div>
                  </Col>
                )}
                {lead?.timeline && (
                  <Col xs={24}>
                    <Text type="secondary" style={{ fontSize: 12 }}>Timeline Notes</Text>
                    <div style={{ whiteSpace: "pre-wrap" }}>{lead.timeline}</div>
                  </Col>
                )}
              </Row>
            </Card>
          )}
        </Spin>

        {/* Footer with close button */}
        <Row justify="end" style={{ marginTop: 16 }}>
          <Col>
            <Button onClick={onClose} style={{ borderRadius: 999 }}>
              Close
            </Button>
          </Col>
        </Row>
      </div>
    </Modal>
  );
}