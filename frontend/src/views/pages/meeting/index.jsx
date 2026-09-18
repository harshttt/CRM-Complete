import { parseAsString, useQueryStates } from "nuqs";
import { useState } from "react";
import { Alert, Button, Card, Col, Divider, Form, Input, Row, Space, Table, Tag, Tooltip, Typography, Select, message } from "antd";
import { CalendarOutlined, PlusOutlined, SearchOutlined, CheckCircleOutlined, CloseCircleOutlined, FieldTimeOutlined, UserOutlined, ReloadOutlined, LoginOutlined, PlayCircleOutlined, StopOutlined, ExclamationCircleOutlined, EyeOutlined } from "@ant-design/icons";
import util from "../../../utils/util";
import MyPagination from "../../components/Pagination";
import { useSalesMeetingList, useSalesMeetingStats } from "../../../api-hooks/salesMeeting";
import SalesMeetingModal from "./SalesMeetingModal";
import MeetingDetailDrawer from "./MeetingDetailDrawer";
import dayjs from "dayjs";

const { Text, Title } = Typography;
const { Option } = Select;

const STATUS_CONFIG = {
  SCHEDULED: { color: "processing", label: "Scheduled" },
  CONFIRMED: { color: "cyan", label: "Confirmed" },
  CHECKED_IN: { color: "warning", label: "Checked In" },
  IN_PROGRESS: { color: "geekblue", label: "In Progress" },
  COMPLETED: { color: "success", label: "Completed" },
  REOPENED: { color: "volcano", label: "Reopened" },
  CANCELLED: { color: "default", label: "Cancelled" },
};

const OUTCOME_COLORS = {
  INTERESTED: "green",
  FOLLOW_UP_REQUIRED: "orange",
  PROPOSAL_REQUESTED: "blue",
  NOT_INTERESTED: "red",
  UNABLE_TO_MEET: "default",
};

const Meeting = () => {
  const [messageApi, contextHolder] = message.useMessage();

  // ---------- Search ----------
  const [search, setSearch] = useQueryStates(
    { key: parseAsString.withDefault("") },
    { urlKeys: { key: "meeting_search" } }
  );

  // ---------- Local States ----------
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedMeetingId, setSelectedMeetingId] = useState(null);
  const [statusFilter, setStatusFilter] = useState(undefined);

  // ---------- Data Fetching ----------
  const { data: meetingRes, isFetching, isError, error, refetch, refetchWithQuery } = useSalesMeetingList({ qData: { page: 1, limit: 20 } });
  const meetingList = meetingRes?.data || [];
  const qData = meetingRes?.qData;

  const { data: stats } = useSalesMeetingStats();

  // ---------- Handlers ----------
  const handleAdd = () => {
    setEditData(null);
    setIsCreateOpen(true);
  };

  const handleEdit = (row) => {
    setEditData(row);
    setIsCreateOpen(true);
  };

  const handleModalClose = (needRefetch = false) => {
    setEditData(null);
    setIsCreateOpen(false);
    if (needRefetch) refetch();
  };

  const handleViewDetail = (row) => {
    setSelectedMeetingId(row?.id);
    setDrawerOpen(true);
  };

  const handleDrawerClose = (needRefetch = false) => {
    setSelectedMeetingId(null);
    setDrawerOpen(false);
    if (needRefetch) refetch();
  };

  const handleStatusFilter = (val) => {
    setStatusFilter(val);
    refetchWithQuery({ status: val || undefined, page: 1 });
  };

  const handleSearch = () => {
    refetchWithQuery({ search: search.key || undefined, page: 1 });
  };

  // ---------- Columns ----------
  const columns = [
    {
      title: "SN",
      dataIndex: "id",
      align: "center",
      width: 55,
      fixed: "left",
      render: (_, __, i) => {
        const page = qData?.page || 1;
        const limit = qData?.limit || 20;
        return <Text strong>{(page - 1) * limit + i + 1}</Text>;
      },
    },
    {
      title: "Purpose",
      dataIndex: "purpose",
      align: "left",
      width: 200,
      fixed: "left",
      render: (_, row) => (
        <Tooltip title={row?.purpose}>
          <Text strong style={{ fontSize: 13, cursor: "pointer", color: "#1d39c4" }} onClick={() => handleViewDetail(row)}>
            {row?.purpose?.length > 40 ? row.purpose.slice(0, 40) + "..." : row?.purpose}
          </Text>
        </Tooltip>
      ),
    },
    {
      title: "Customer",
      dataIndex: "customerId",
      align: "center",
      width: 160,
      render: (v) => (
        <Text>{v?.name || v?.companyName || "—"}</Text>
      ),
    },
    {
      title: "Assigned To",
      dataIndex: "assignedEmployeeId",
      align: "center",
      width: 160,
      render: (v) => (
        <Space size={6}>
          <UserOutlined style={{ color: "#8c8c8c" }} />
          <span>{v?.fullName || "—"}</span>
        </Space>
      ),
    },
    {
      title: "Scheduled",
      dataIndex: "scheduledStart",
      align: "center",
      width: 180,
      render: (_, row) => {
        if (!row?.scheduledStart) return <Text type="secondary">—</Text>;
        const start = dayjs(row.scheduledStart);
        const end = row.scheduledEnd ? dayjs(row.scheduledEnd) : null;
        return (
          <Space direction="vertical" size={0}>
            <Text strong>{start.format("DD MMM YYYY")}</Text>
            <Text type="secondary" style={{ fontSize: 11 }}>
              {start.format("hh:mm A")} — {end ? end.format("hh:mm A") : "—"}
            </Text>
          </Space>
        );
      },
    },
    {
      title: "Status",
      dataIndex: "status",
      align: "center",
      width: 130,
      render: (s) => {
        const cfg = STATUS_CONFIG[s] || { color: "default", label: s };
        return <Tag color={cfg.color} style={{ borderRadius: 999, textTransform: "capitalize" }}>{cfg.label}</Tag>;
      },
    },
    {
      title: "Outcome",
      dataIndex: "outcome",
      align: "center",
      width: 150,
      render: (v) => v ? (
        <Tag color={OUTCOME_COLORS[v] || "default"} style={{ borderRadius: 999, fontSize: 11 }}>
          {v.replace(/_/g, " ")}
        </Tag>
      ) : (
        <Text type="secondary" style={{ fontSize: 11 }}>—</Text>
      ),
    },
    {
      title: "Sessions",
      dataIndex: "attendanceSessions",
      align: "center",
      width: 80,
      render: (v) => <Text>{v?.length || 0}</Text>,
    },
    {
      title: "Action",
      dataIndex: "id",
      align: "center",
      width: 100,
      fixed: "right",
      render: (_, row) => (
        <Space size="small">
          <Tooltip title="View details">
            <Button size="small" type="text" icon={<EyeOutlined />} onClick={() => handleViewDetail(row)} style={{ borderRadius: 999 }} />
          </Tooltip>
          {row.status === "SCHEDULED" && (
            <Tooltip title="Edit meeting">
              <Button size="small" type="text" icon={<CalendarOutlined />} onClick={() => handleEdit(row)} style={{ borderRadius: 999 }} />
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  return (
    <>
      {isError ? (
        <Alert message="Error" description={error?.message} type="error" showIcon />
      ) : (
        <Card
          size="small"
          bordered={false}
          className="card-style"
          styles={{ header: { borderBottom: "none", padding: "10px" }, body: { padding: "10px" } }}
          title={
            <Space align="center">
              <div className="card-icon-container">
                <div className="card-icon-wrapper">
                  <CalendarOutlined style={{ color: "#1d39c4" }} />
                </div>
              </div>
              <Space direction="vertical" size={0}>
                <Title level={4} style={{ margin: 0 }}>Sales Meetings</Title>
                <Text type="secondary" style={{ fontSize: 12 }}>Manage customer meetings, check-ins, and outcomes.</Text>
              </Space>
            </Space>
          }
          extra={
            <Space>
              <Button icon={<PlusOutlined />} type="primary" size="middle" style={{ borderRadius: 999, paddingInline: 18 }} onClick={handleAdd}>
                Schedule Meeting
              </Button>
              <Tooltip title="Refresh Data">
                <Button icon={<ReloadOutlined />} loading={isFetching} size="middle" onClick={refetch} style={{ borderRadius: "50%" }} />
              </Tooltip>
            </Space>
          }
        >
          {contextHolder}

          {/* Stats Row */}
          <Row gutter={14} style={{ marginBottom: 12 }}>
            <Col xs={12} md={4}>
              <StatPill icon={<CalendarOutlined />} label="Total" value={stats?.totalMeetings ?? 0} accent="#2f54eb" />
            </Col>
            <Col xs={12} md={4}>
              <StatPill icon={<FieldTimeOutlined />} label="Today" value={stats?.todayMeetings ?? 0} accent="#1890ff" />
            </Col>
            <Col xs={12} md={4}>
              <StatPill icon={<CheckCircleOutlined />} label="Completed (Week)" value={stats?.completedThisWeek ?? 0} accent="#52c41a" />
            </Col>
            <Col xs={12} md={4}>
              <StatPill icon={<ExclamationCircleOutlined />} label="Pending Follow-ups" value={stats?.pendingFollowUps ?? 0} accent="#faad14" />
            </Col>
            <Col xs={12} md={4}>
              <StatPill icon={<CloseCircleOutlined />} label="Overdue Follow-ups" value={stats?.overdueFollowUps ?? 0} accent="#f5222d" />
            </Col>
          </Row>

          {/* Search & Filter Bar */}
          <div style={{ marginBottom: 10, borderRadius: 999, padding: 8, paddingInline: 12, background: "linear-gradient(90deg,rgba(240,245,255,0.9),rgba(255,255,255,0.95))", border: "1px solid #f0f2ff" }}>
            <Form onFinish={handleSearch} style={{ width: "100%" }}>
              <Row gutter={8} wrap align="middle">
                <Col span={7}>
                  <Input
                    placeholder="Search by purpose, customer, employee..."
                    value={search.key ?? ""}
                    prefix={<SearchOutlined style={{ color: "#bfbfbf" }} />}
                    onChange={(e) => setSearch({ key: e.target.value })}
                    allowClear
                    style={{ borderRadius: 999, paddingInline: 16, paddingBlock: 8, boxShadow: "0 4px 10px rgba(15,23,42,0.06)", border: "1px solid #dde4ff" }}
                  />
                </Col>
                <Col span={4}>
                  <Select
                    placeholder="Filter by status"
                    allowClear
                    value={statusFilter}
                    onChange={handleStatusFilter}
                    style={{ width: "100%", borderRadius: 999 }}
                  >
                    {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                      <Option key={key} value={key}>{cfg.label}</Option>
                    ))}
                  </Select>
                </Col>
                <Col span={3}>
                  <Button style={{ borderRadius: 999, width: "100%" }} type="primary" htmlType="submit" icon={<SearchOutlined />}>
                    Search
                  </Button>
                </Col>
              </Row>
            </Form>
          </div>

          {/* Table */}
          <Table
            bordered={false}
            size="middle"
            pagination={false}
            loading={isFetching}
            columns={columns}
            dataSource={meetingList}
            style={{ borderRadius: 16, overflow: "hidden", background: "rgba(255,255,255,0.98)" }}
            scroll={{ y: util.getTableHeight ? util.getTableHeight() : "calc(100vh - 360px)", x: "max-content" }}
            onRow={(row) => ({
              onClick: () => handleViewDetail(row),
              style: { cursor: "pointer" },
            })}
          />
          <Divider style={{ margin: "14px 0 8px" }} />
          <MyPagination {...{ qData }} total={qData?.total} onChange={refetchWithQuery} />
        </Card>
      )}

      <SalesMeetingModal open={isCreateOpen} onClose={handleModalClose} editData={editData} />
      <MeetingDetailDrawer open={drawerOpen} onClose={handleDrawerClose} meetingId={selectedMeetingId} />
    </>
  );
};

export default Meeting;

/* ──────────── STATS PILL ──────────── */
function StatPill({ icon, label, value, accent }) {
  return (
    <Card
      size="small"
      bordered={false}
      style={{
        borderRadius: 16,
        background: "linear-gradient(135deg, rgba(255,255,255,0.98), rgba(243,247,255,0.98))",
        boxShadow: "0 6px 18px rgba(15,23,42,0.09)",
        border: "1px solid rgba(240,242,255,0.9)",
      }}
      styles={{ body: { padding: "8px 10px" } }}
    >
      <Space align="center" style={{ width: "100%", justifyContent: "space-between" }}>
        <Space align="center">
          <div style={{ width: 28, height: 28, borderRadius: 999, background: `${accent}12`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 0 0 1px ${accent}26` }}>
            <span style={{ color: accent, fontSize: 16 }}>{icon}</span>
          </div>
          <Space direction="vertical" size={0}>
            <Text type="secondary" style={{ fontSize: 11 }}>{label}</Text>
            <Text strong style={{ fontSize: 16 }}>{value}</Text>
          </Space>
        </Space>
      </Space>
    </Card>
  );
}
