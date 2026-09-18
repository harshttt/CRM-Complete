import { Drawer, Space, Typography, Tag, Steps, Button, Descriptions, Card, Modal, Form, Input, Select, DatePicker, message, Spin, Popconfirm, Timeline, Divider, Row, Col, Empty } from "antd";
import { CheckCircleOutlined, ClockCircleOutlined, EnvironmentOutlined, UserOutlined, CalendarOutlined, LoginOutlined, LogoutOutlined, PlayCircleOutlined, StopOutlined, ReloadOutlined, ExclamationCircleOutlined, FileTextOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { useState, useEffect } from "react";
import commonObj from "../../../commonObj";
import { useSalesMeetingDetail, useConfirmMeeting, useCheckInMeeting, useStartMeeting, useCheckOutMeeting, useCompleteMeeting, useCancelSalesMeeting, useReopenMeeting } from "../../../api-hooks/salesMeeting";
import { useAssignableEmployees } from "../../../api-hooks/salesMeeting";

const { Text, Title } = Typography;
const { Option } = Select;

const LIFECYCLE_STEPS = ["SCHEDULED", "CONFIRMED", "CHECKED_IN", "IN_PROGRESS", "COMPLETED"];
const OUTCOME_OPTIONS = [
  { value: "INTERESTED", label: "Interested", color: "green" },
  { value: "FOLLOW_UP_REQUIRED", label: "Follow-up Required", color: "orange" },
  { value: "PROPOSAL_REQUESTED", label: "Proposal Requested", color: "blue" },
  { value: "NOT_INTERESTED", label: "Not Interested", color: "red" },
  { value: "UNABLE_TO_MEET", label: "Unable to Meet", color: "default" },
];

const STATUS_CONFIG = {
  SCHEDULED: { color: "processing", label: "Scheduled", icon: <CalendarOutlined /> },
  CONFIRMED: { color: "cyan", label: "Confirmed", icon: <CheckCircleOutlined /> },
  CHECKED_IN: { color: "warning", label: "Checked In", icon: <LoginOutlined /> },
  IN_PROGRESS: { color: "geekblue", label: "In Progress", icon: <PlayCircleOutlined /> },
  COMPLETED: { color: "success", label: "Completed", icon: <CheckCircleOutlined /> },
  REOPENED: { color: "volcano", label: "Reopened", icon: <ReloadOutlined /> },
  CANCELLED: { color: "default", label: "Cancelled", icon: <StopOutlined /> },
};

export default function MeetingDetailDrawer({ open, onClose, meetingId }) {
  const [messageApi, contextHolder] = message.useMessage();
  const [completeModalOpen, setCompleteModalOpen] = useState(false);
  const [completeForm] = Form.useForm();
  const [now, setNow] = useState(() => dayjs());

  const roleLevel = commonObj?.role?.roleLevel ?? 99;
  const userId = commonObj?.id;
  const isAdmin = roleLevel <= 2;
  const isManager = roleLevel === 3;

  /* --------- Fetch Detail --------- */
  const { data: meeting, isFetching, refetch } = useSalesMeetingDetail(meetingId, { enabled: open && !!meetingId });

  useEffect(() => {
    if (!open) return undefined;

    setNow(dayjs());
    const intervalId = window.setInterval(() => setNow(dayjs()), 10000);
    return () => window.clearInterval(intervalId);
  }, [open]);

  /* --------- Assignable Employees (for follow-up owner) --------- */
  const { data: empRes } = useAssignableEmployees({ qData: { page: 1, limit: 50 } });
  const employeeOptions = empRes?.data || [];

  /* --------- Lifecycle Mutations --------- */
  const mutOpts = (successMsg) => ({
    onSuccess: (res) => { messageApi.success(res?.message || successMsg); refetch(); },
    onError: (err) => messageApi.error(err?.message || "Action failed"),
  });

  const { mutate: confirmMeeting, isPending: isConfirming } = useConfirmMeeting(mutOpts("Meeting confirmed"));
  const { mutate: checkInMeeting, isPending: isCheckingIn } = useCheckInMeeting(mutOpts("Checked in"));
  const { mutate: startMeeting, isPending: isStarting } = useStartMeeting(mutOpts("Meeting started"));
  const { mutate: checkOutMeeting, isPending: isCheckingOut } = useCheckOutMeeting(mutOpts("Checked out"));
  const { mutate: completeMeeting, isPending: isCompleting } = useCompleteMeeting({
    onSuccess: (res) => { messageApi.success(res?.message || "Meeting completed"); setCompleteModalOpen(false); completeForm.resetFields(); refetch(); },
    onError: (err) => messageApi.error(err?.message || "Failed to complete"),
  });
  const { mutate: cancelMeeting, isPending: isCancelling } = useCancelSalesMeeting(mutOpts("Meeting cancelled"));
  const { mutate: reopenMeeting, isPending: isReopening } = useReopenMeeting(mutOpts("Meeting reopened"));

  const actionLoading = isConfirming || isCheckingIn || isStarting || isCheckingOut || isCompleting || isCancelling || isReopening;

  /* --------- Derived State --------- */
  const status = meeting?.status;
  const assignedId = meeting?.assignedEmployeeId?.id || meeting?.assignedEmployeeId;
  const isAssigned = assignedId === userId;
  const canConfirm = status === "SCHEDULED";
  const checkInOpensAt = meeting?.scheduledStart
    ? dayjs(meeting.scheduledStart).subtract(15, "minute")
    : null;
  const isCheckInWindowOpen = checkInOpensAt ? !now.isBefore(checkInOpensAt) : false;
  const canCheckIn = (status === "CONFIRMED" || status === "REOPENED") && isAssigned;
  const canStart = status === "CHECKED_IN" && isAssigned;
  const canCheckOut = (status === "CHECKED_IN" || status === "IN_PROGRESS") && isAssigned;
  const canComplete = status === "IN_PROGRESS" && (isAssigned || isAdmin);
  const canReopen = status === "COMPLETED" && (isAdmin || isManager);
  const canCancel = (status === "SCHEDULED" || status === "CONFIRMED");

  /* --------- Geolocation Helper --------- */
  const getLocation = () => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve({ latitude: 0, longitude: 0 });
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
        () => resolve({ latitude: 0, longitude: 0 }),
        { enableHighAccuracy: true, timeout: 10000 }
      );
    });
  };

  /* --------- Action Handlers --------- */
  const handleConfirm = () => confirmMeeting({ id: meetingId });

  const handleCheckIn = async () => {
    const loc = await getLocation();
    checkInMeeting({ id: meetingId, ...loc });
  };

  const handleStart = () => startMeeting({ id: meetingId });

  const handleCheckOut = async () => {
    const loc = await getLocation();
    checkOutMeeting({ id: meetingId, ...loc });
  };

  const handleCompleteSubmit = (values) => {
    const payload = { id: meetingId, outcome: values.outcome };
    if (values.outcome === "FOLLOW_UP_REQUIRED") {
      payload.followUp = {
        title: values.followUpTitle,
        description: values.followUpDescription || "",
        ownerId: values.followUpOwnerId || undefined,
        dueDate: values.followUpDueDate.toISOString(),
      };
    }
    completeMeeting(payload);
  };

  const handleCancel = () => cancelMeeting({ id: meetingId });
  const handleReopen = () => reopenMeeting({ id: meetingId });

  /* --------- Lifecycle Step Index --------- */
  const getStepIndex = () => {
    if (status === "CANCELLED") return -1;
    if (status === "REOPENED") return 1; // Back to near CONFIRMED
    return LIFECYCLE_STEPS.indexOf(status);
  };

  if (!open) return null;

  return (
    <>
      {contextHolder}
      <Drawer
        open={open}
        onClose={() => onClose(false)}
        width={640}
        title={
          <Space align="center" size={12}>
            <div style={{ width: 36, height: 36, borderRadius: 12, background: "linear-gradient(135deg, #e6f4ff, #d6e4ff)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <CalendarOutlined style={{ color: "#1d39c4", fontSize: 16 }} />
            </div>
            <div>
              <Title level={5} style={{ margin: 0 }}>Meeting Details</Title>
              <Text type="secondary" style={{ fontSize: 12 }}>View meeting lifecycle and details</Text>
            </div>
          </Space>
        }
      >
        <Spin spinning={isFetching || actionLoading}>
          {meeting ? (
            <Space direction="vertical" size={20} style={{ width: "100%" }}>

              {/* Status Badge */}
              <div style={{ textAlign: "center", padding: 12, borderRadius: 14, background: "linear-gradient(135deg, #f8f9ff, #fff)", border: "1px solid #f0f2ff" }}>
                <Tag
                  icon={STATUS_CONFIG[status]?.icon}
                  color={STATUS_CONFIG[status]?.color}
                  style={{ fontSize: 14, padding: "4px 16px", borderRadius: 999 }}
                >
                  {STATUS_CONFIG[status]?.label || status}
                </Tag>
              </div>

              {/* Lifecycle Stepper */}
              {status !== "CANCELLED" && (
                <Card size="small" style={{ borderRadius: 14, border: "1px solid #f0f2ff" }} styles={{body:{padding: '16px 12px'}}}>
                  <Steps
                    size="small"
                    current={getStepIndex()}
                    status={status === "REOPENED" ? "process" : undefined}
                    items={LIFECYCLE_STEPS.map((s) => ({
                      title: <Text style={{ fontSize: 11 }}>{s.replace(/_/g, " ")}</Text>,
                      icon: STATUS_CONFIG[s]?.icon,
                    }))}
                  />
                </Card>
              )}

              {/* Meeting Info */}
              <Card size="small" title={<><CalendarOutlined style={{ color: "#1d39c4", marginRight: 6 }} /> Meeting Information</>} style={{ borderRadius: 14, border: "1px solid #f0f2ff" }} styles={{body:{padding: 12}}}>
                <Descriptions column={2} size="small" labelStyle={{ fontWeight: 600, color: "#595959" }}>
                  <Descriptions.Item label="Purpose" span={2}>{meeting.purpose || "—"}</Descriptions.Item>
                  <Descriptions.Item label="Customer">{meeting.customerId?.name || meeting.customerId?.companyName || "—"}</Descriptions.Item>
                  <Descriptions.Item label="Assigned To">
                    <Space size={4}>
                      <UserOutlined style={{ color: "#8c8c8c" }} />
                      {meeting.assignedEmployeeId?.fullName || "—"}
                    </Space>
                  </Descriptions.Item>
                  <Descriptions.Item label="Scheduled Start">{meeting.scheduledStart ? dayjs(meeting.scheduledStart).format("DD MMM YYYY, hh:mm A") : "—"}</Descriptions.Item>
                  <Descriptions.Item label="Scheduled End">{meeting.scheduledEnd ? dayjs(meeting.scheduledEnd).format("DD MMM YYYY, hh:mm A") : "—"}</Descriptions.Item>
                  <Descriptions.Item label="Location" span={2}>
                    <Space size={4}>
                      <EnvironmentOutlined style={{ color: "#8c8c8c" }} />
                      {meeting.location || "Not specified"}
                    </Space>
                  </Descriptions.Item>
                  {meeting.notes && <Descriptions.Item label="Notes" span={2}>{meeting.notes}</Descriptions.Item>}
                  {meeting.outcome && (
                    <Descriptions.Item label="Outcome" span={2}>
                      <Tag color={OUTCOME_OPTIONS.find(o => o.value === meeting.outcome)?.color || "default"} style={{ borderRadius: 999 }}>
                        {OUTCOME_OPTIONS.find(o => o.value === meeting.outcome)?.label || meeting.outcome}
                      </Tag>
                    </Descriptions.Item>
                  )}
                  {meeting.cancelReason && <Descriptions.Item label="Cancel Reason" span={2}>{meeting.cancelReason}</Descriptions.Item>}
                  <Descriptions.Item label="Created By">{meeting.createdBy?.fullName || "—"}</Descriptions.Item>
                </Descriptions>
              </Card>

              {/* Attendance Sessions */}
              {meeting.attendanceSessions?.length > 0 && (
                <Card size="small" title={<><ClockCircleOutlined style={{ color: "#52c41a", marginRight: 6 }} /> Attendance Sessions</>} style={{ borderRadius: 14, border: "1px solid #f0f2ff" }} styles={{body:{padding: 12}}}>
                  <Timeline
                    items={meeting.attendanceSessions.map((session, idx) => ({
                      color: session.checkOutAt ? "green" : "blue",
                      children: (
                        <div key={idx}>
                          <Text strong style={{ fontSize: 12 }}>Session {idx + 1}</Text>
                          <div style={{ marginTop: 4 }}>
                            <Space direction="vertical" size={2}>
                              <Text style={{ fontSize: 12 }}>
                                <LoginOutlined style={{ color: "#1890ff", marginRight: 4 }} />
                                Check-in: {session.checkInAt ? dayjs(session.checkInAt).format("DD MMM YYYY, hh:mm:ss A") : "—"}
                                {session.checkInLocation?.latitude ? ` (${session.checkInLocation.latitude.toFixed(4)}, ${session.checkInLocation.longitude.toFixed(4)})` : ""}
                              </Text>
                              <Text style={{ fontSize: 12 }}>
                                <LogoutOutlined style={{ color: session.checkOutAt ? "#52c41a" : "#faad14", marginRight: 4 }} />
                                Check-out: {session.checkOutAt ? dayjs(session.checkOutAt).format("DD MMM YYYY, hh:mm:ss A") : <Tag color="warning" style={{ fontSize: 10, borderRadius: 999 }}>In progress</Tag>}
                                {session.checkOutLocation?.latitude ? ` (${session.checkOutLocation.latitude.toFixed(4)}, ${session.checkOutLocation.longitude.toFixed(4)})` : ""}
                              </Text>
                            </Space>
                          </div>
                        </div>
                      ),
                    }))}
                  />
                </Card>
              )}

              {/* Follow-ups */}
              {meeting.followUps?.length > 0 && (
                <Card size="small" title={<><FileTextOutlined style={{ color: "#faad14", marginRight: 6 }} /> Follow-ups</>} style={{ borderRadius: 14, border: "1px solid #f0f2ff" }} styles={{body:{padding: 12}}}>
                  {meeting.followUps.map((f, idx) => (
                    <div key={f.id || idx} style={{ padding: 10, borderRadius: 10, background: "#fafbff", border: "1px solid #f5f5f5", marginBottom: 8 }}>
                      <Row justify="space-between" align="middle">
                        <Col>
                          <Text strong style={{ fontSize: 13 }}>{f.title}</Text>
                          {f.description && <div><Text type="secondary" style={{ fontSize: 11 }}>{f.description}</Text></div>}
                        </Col>
                        <Col>
                          <Tag color={f.status === "COMPLETED" ? "green" : f.status === "CANCELLED" ? "default" : "orange"} style={{ borderRadius: 999 }}>
                            {f.status}
                          </Tag>
                        </Col>
                      </Row>
                      <Row gutter={16} style={{ marginTop: 6 }}>
                        <Col><Text type="secondary" style={{ fontSize: 11 }}>Owner: {f.ownerId?.fullName || "—"}</Text></Col>
                        <Col><Text type="secondary" style={{ fontSize: 11 }}>Due: {f.dueDate ? dayjs(f.dueDate).format("DD MMM YYYY") : "—"}</Text></Col>
                      </Row>
                    </div>
                  ))}
                </Card>
              )}

              {/* Action Buttons */}
              <Card size="small" style={{ borderRadius: 14, border: "1px solid #f0f2ff", background: "linear-gradient(135deg, #f8f9ff, #fff)" }} styles={{body:{padding: 12}}}>
                <Space wrap size={8}>
                  {canConfirm && (
                    <Button type="primary" icon={<CheckCircleOutlined />} onClick={handleConfirm} style={{ borderRadius: 999 }}>
                      Confirm
                    </Button>
                  )}
                  {canCheckIn && (
                    <Button
                      type="primary"
                      icon={<LoginOutlined />}
                      onClick={handleCheckIn}
                      disabled={!isCheckInWindowOpen}
                      title={!isCheckInWindowOpen ? `Check-in opens at ${checkInOpensAt?.format("DD MMM YYYY, hh:mm A")}` : undefined}
                      style={{ borderRadius: 999, background: "#1890ff" }}
                    >
                      Check In
                    </Button>
                  )}
                  {canCheckIn && !isCheckInWindowOpen && checkInOpensAt && (
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      Check-in opens at {checkInOpensAt.format("DD MMM YYYY, hh:mm A")}.
                    </Text>
                  )}
                  {canStart && (
                    <Button type="primary" icon={<PlayCircleOutlined />} onClick={handleStart} style={{ borderRadius: 999, background: "#722ed1" }}>
                      Start Meeting
                    </Button>
                  )}
                  {canCheckOut && (
                    <Popconfirm title="Check out from this meeting?" onConfirm={handleCheckOut}>
                      <Button icon={<LogoutOutlined />} style={{ borderRadius: 999, borderColor: "#faad14", color: "#faad14" }}>
                        Check Out
                      </Button>
                    </Popconfirm>
                  )}
                  {canComplete && (
                    <Button type="primary" icon={<CheckCircleOutlined />} onClick={() => setCompleteModalOpen(true)} style={{ borderRadius: 999, background: "#52c41a" }}>
                      Complete
                    </Button>
                  )}
                  {canReopen && (
                    <Popconfirm title="Reopen this completed meeting?" onConfirm={handleReopen}>
                      <Button icon={<ReloadOutlined />} style={{ borderRadius: 999, borderColor: "#fa541c", color: "#fa541c" }}>
                        Reopen
                      </Button>
                    </Popconfirm>
                  )}
                  {canCancel && (
                    <Popconfirm title="Cancel this meeting?" onConfirm={handleCancel}>
                      <Button danger icon={<StopOutlined />} style={{ borderRadius: 999 }}>
                        Cancel
                      </Button>
                    </Popconfirm>
                  )}
                  {status === "CANCELLED" && (
                    <Text type="secondary" style={{ fontSize: 13 }}>This meeting has been cancelled.</Text>
                  )}
                </Space>
              </Card>

            </Space>
          ) : (
            !isFetching && <Empty description="Meeting not found" />
          )}
        </Spin>
      </Drawer>

      {/* Complete Modal with Outcome + Follow-up */}
      <Modal
        open={completeModalOpen}
        title={
          <Space>
            <ExclamationCircleOutlined style={{ color: "#52c41a" }} />
            <span>Complete Meeting</span>
          </Space>
        }
        onCancel={() => { setCompleteModalOpen(false); completeForm.resetFields(); }}
        footer={null}
        destroyOnHidden
        width={560}
      >
        <Form layout="vertical" form={completeForm} onFinish={handleCompleteSubmit} style={{ marginTop: 16 }}>
          <Form.Item name="outcome" label="Meeting Outcome" rules={[{ required: true, message: "Outcome is required" }]}>
            <Select placeholder="Select outcome">
              {OUTCOME_OPTIONS.map((o) => (
                <Option key={o.value} value={o.value}>{o.label}</Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item noStyle shouldUpdate={(prev, cur) => prev.outcome !== cur.outcome}>
            {({ getFieldValue }) =>
              getFieldValue("outcome") === "FOLLOW_UP_REQUIRED" && (
                <div style={{ padding: 16, borderRadius: 14, background: "#fffbe6", border: "1px solid #ffe58f", marginBottom: 16 }}>
                  <Text strong style={{ fontSize: 13, color: "#d48806", display: "block", marginBottom: 12 }}>
                    <ExclamationCircleOutlined style={{ marginRight: 6 }} /> Follow-up Required
                  </Text>
                  <Form.Item name="followUpTitle" label="Action / Task" rules={[{ required: true, message: "Follow-up action is required" }]}>
                    <Input placeholder="e.g. Send proposal document" maxLength={300} />
                  </Form.Item>
                  <Row gutter={12}>
                    <Col xs={24} md={12}>
                      <Form.Item name="followUpOwnerId" label="Owner">
                        <Select placeholder="Select owner (defaults to assigned employee)" allowClear>
                          {employeeOptions?.map((u) => (
                            <Option key={u.id} value={u.id}>{u.fullName}</Option>
                          ))}
                        </Select>
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item name="followUpDueDate" label="Due Date" rules={[{ required: true, message: "Due date is required" }]}>
                        <DatePicker style={{ width: "100%" }} format="DD MMM YYYY" disabledDate={(d) => d && d < dayjs().startOf("day")} />
                      </Form.Item>
                    </Col>
                  </Row>
                  <Form.Item name="followUpDescription" label="Description">
                    <Input.TextArea rows={2} placeholder="Additional details..." maxLength={2000} />
                  </Form.Item>
                </div>
              )
            }
          </Form.Item>

          <Row justify="end" gutter={8}>
            <Col>
              <Button style={{ borderRadius: 999 }} onClick={() => { setCompleteModalOpen(false); completeForm.resetFields(); }}>Cancel</Button>
            </Col>
            <Col>
              <Button type="primary" htmlType="submit" style={{ borderRadius: 999, background: "#52c41a" }} loading={isCompleting}>
                Complete Meeting
              </Button>
            </Col>
          </Row>
        </Form>
      </Modal>
    </>
  );
}
