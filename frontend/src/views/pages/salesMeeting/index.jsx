import { useState } from "react";
import {
  Button, Card, Col, Row, Select, Space, Table, Tag,
  Tooltip, Typography, message, Empty,
} from "antd";
import {
  PlusOutlined, EyeOutlined, CalendarOutlined,
} from "@ant-design/icons";
import { useSalesMeetingList } from "../../../api-hooks/salesMeeting";
import MyPagination from "../../components/Pagination";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";

const { Title, Text } = Typography;
const { Option } = Select;

const STATUS_OPTIONS = [
  { label: "All", value: "" },
  { label: "Scheduled", value: "SCHEDULED" },
  { label: "Confirmed", value: "CONFIRMED" },
  { label: "Checked In", value: "CHECKED_IN" },
  { label: "In Progress", value: "IN_PROGRESS" },
  { label: "Completed", value: "COMPLETED" },
  { label: "Reopened", value: "REOPENED" },
];

const statusColor = (s) => {
  const map = {
    SCHEDULED: "blue",
    CONFIRMED: "cyan",
    CHECKED_IN: "orange",
    IN_PROGRESS: "geekblue",
    COMPLETED: "green",
    REOPENED: "purple",
    CANCELLED: "default",
  };
  return map[s] || "default";
};

const SalesMeetingList = () => {
  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();
  const [statusFilter, setStatusFilter] = useState("");

  const { data: meetingRes, isFetching, refetch, refetchWithQuery } = useSalesMeetingList({
    qData: { page: 1, limit: 20, status: statusFilter || undefined },
  });
  const meetingList = meetingRes?.data || [];
  const qData = meetingRes?.qData;

  const handleStatusChange = (value) => {
    setStatusFilter(value);
    refetchWithQuery({ page: 1, status: value || undefined });
  };

  const columns = [
    {
      title: "Customer",
      dataIndex: "customerId",
      key: "customer",
      render: (c) => (
        <div>
          <Text strong>{c?.name || "—"}</Text>
          {c?.companyName && (
            <div>
              <Text type="secondary" style={{ fontSize: 12 }}>{c.companyName}</Text>
            </div>
          )}
        </div>
      ),
    },
    {
      title: "Purpose",
      dataIndex: "purpose",
      key: "purpose",
      ellipsis: true,
    },
    {
      title: "Scheduled Start",
      dataIndex: "scheduledStart",
      key: "scheduledStart",
      render: (v) => v ? dayjs(v).format("DD MMM YYYY, hh:mm A") : "—",
    },
    {
      title: "Scheduled End",
      dataIndex: "scheduledEnd",
      key: "scheduledEnd",
      render: (v) => v ? dayjs(v).format("hh:mm A") : "—",
    },
    {
      title: "Assigned To",
      dataIndex: "assignedEmployeeId",
      key: "assignedTo",
      render: (e) => e?.fullName || "—",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (s) => <Tag color={statusColor(s)}>{s?.replace(/_/g, " ")}</Tag>,
    },
    {
      title: "Outcome",
      dataIndex: "outcome",
      key: "outcome",
      render: (v) => v || "—",
      ellipsis: true,
    },
    {
      title: "",
      key: "action",
      width: 60,
      render: (_, row) => (
        <Tooltip title="View Details">
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/sales-meetings/${row.id}`)}
          />
        </Tooltip>
      ),
    },
  ];

  return (
    <div>
      {contextHolder}
      <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
        <Col>
          <Title level={4} style={{ margin: 0 }}>Sales Meetings</Title>
        </Col>
        <Col>
          <Space>
            <Select
              value={statusFilter}
              onChange={handleStatusChange}
              style={{ width: 160 }}
              placeholder="Filter by status"
            >
              {STATUS_OPTIONS.map((opt) => (
                <Option key={opt.value} value={opt.value}>
                  {opt.label}
                </Option>
              ))}
            </Select>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => navigate("/sales-meetings/create")}
            >
              Create Meeting
            </Button>
          </Space>
        </Col>
      </Row>

      <Card>
        <Table
          columns={columns}
          dataSource={meetingList}
          loading={isFetching}
          pagination={false}
          scroll={{ x: 1000 }}
          size="middle"
          locale={{ emptyText: <Empty description="No meetings found" /> }}
        />
        {qData && (
          <div style={{ marginTop: 16, display: "flex", justifyContent: "flex-end" }}>
            <MyPagination
              current={qData.page}
              total={qData.total}
              pageSize={qData.limit}
              onChange={(page, pageSize) => refetchWithQuery({ page, limit: pageSize })}
            />
          </div>
        )}
      </Card>
    </div>
  );
};

export default SalesMeetingList;
