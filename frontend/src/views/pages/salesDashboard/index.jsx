import { useState } from "react";
import { Card, Col, Row, Statistic, Table, Tag, Typography, Space, Divider, message, Empty, Spin } from "antd";
import {
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  WarningOutlined,
  RightOutlined,
} from "@ant-design/icons";
import { useSalesMeetingList, useSalesMeetingStats } from "../../../api-hooks/salesMeeting";
import { useFollowUpList } from "../../../api-hooks/followUp";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";

const { Title, Text } = Typography;

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

const SalesDashboard = () => {
  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();

  const { data: stats, isLoading: statsLoading } = useSalesMeetingStats();

  const { data: meetingRes, isLoading: meetingsLoading } = useSalesMeetingList({
    qData: { page: 1, limit: 5 },
  });

  const { data: followUpRes, isLoading: followUpsLoading } = useFollowUpList({
    qData: { page: 1, limit: 5, status: "PENDING" },
  });

  const meetingList = meetingRes?.data || [];
  const followUpList = followUpRes?.data || [];

  const meetingColumns = [
    {
      title: "Customer",
      dataIndex: "customerId",
      key: "customer",
      render: (c) => c?.name || "—",
    },
    {
      title: "Purpose",
      dataIndex: "purpose",
      key: "purpose",
      ellipsis: true,
    },
    {
      title: "Scheduled",
      dataIndex: "scheduledStart",
      key: "scheduledStart",
      render: (v) => (v ? dayjs(v).format("DD MMM YYYY, hh:mm A") : "—"),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (s) => <Tag color={statusColor(s)}>{s}</Tag>,
    },
    {
      title: "",
      key: "action",
      width: 50,
      render: (_, row) => (
        <RightOutlined
          style={{ cursor: "pointer", color: "#1890ff" }}
          onClick={() => navigate(`/leads-management/meeting?meetingId=${row.id}`)}
        />
      ),
    },
  ];

  const followUpColumns = [
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
      ellipsis: true,
    },
    {
      title: "Customer",
      dataIndex: "customerId",
      key: "customer",
      render: (c) => c?.name || "—",
    },
    {
      title: "Due Date",
      dataIndex: "dueDate",
      key: "dueDate",
      render: (v) => {
        if (!v) return "—";
        const d = dayjs(v);
        const isOverdue = d.isBefore(dayjs(), "day");
        return (
          <Text type={isOverdue ? "danger" : undefined} strong={isOverdue}>
            {d.format("DD MMM YYYY")}
            {isOverdue && " (Overdue)"}
          </Text>
        );
      },
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (s) => {
        const color = s === "COMPLETED" ? "green" : s === "CANCELLED" ? "default" : "orange";
        return <Tag color={color}>{s}</Tag>;
      },
    },
  ];

  return (
    <div style={{ padding: "0" }}>
      {contextHolder}
      <Title level={4} style={{ marginBottom: 24 }}>
        Sales Dashboard
      </Title>

      {/* Stats Cards */}
      <Spin spinning={statsLoading}>
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={12} md={8} lg={4}>
            <Card hoverable>
              <Statistic
                title="Today's Meetings"
                value={stats?.todayMeetings ?? 0}
                prefix={<CalendarOutlined />}
                valueStyle={{ color: "#1890ff" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8} lg={5}>
            <Card hoverable>
              <Statistic
                title="Completed This Week"
                value={stats?.completedThisWeek ?? 0}
                prefix={<CheckCircleOutlined />}
                valueStyle={{ color: "#52c41a" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8} lg={5}>
            <Card hoverable>
              <Statistic
                title="Total Meetings"
                value={stats?.totalMeetings ?? 0}
                prefix={<CalendarOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8} lg={5}>
            <Card hoverable>
              <Statistic
                title="Pending Follow-Ups"
                value={stats?.pendingFollowUps ?? 0}
                prefix={<ClockCircleOutlined />}
                valueStyle={{ color: "#faad14" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8} lg={5}>
            <Card hoverable>
              <Statistic
                title="Overdue Follow-Ups"
                value={stats?.overdueFollowUps ?? 0}
                prefix={<WarningOutlined />}
                valueStyle={{ color: "#ff4d4f" }}
              />
            </Card>
          </Col>
        </Row>
      </Spin>

      {/* Recent Meetings */}
      <Card
        title="Recent Meetings"
        style={{ marginBottom: 24 }}
        extra={
          <a onClick={() => navigate("/leads-management/meeting")}>View All</a>
        }
      >
        <Table
          columns={meetingColumns}
          dataSource={meetingList}
          loading={meetingsLoading}
          pagination={false}
          size="small"
          locale={{ emptyText: <Empty description="No meetings found" /> }}
        />
      </Card>

      {/* Pending Follow-Ups */}
      <Card
        title="Pending & Overdue Follow-Ups"
        extra={
          <a onClick={() => navigate("/leads-management/meeting")}>View All</a>
        }
      >
        <Table
          columns={followUpColumns}
          dataSource={followUpList}
          loading={followUpsLoading}
          pagination={false}
          size="small"
          locale={{ emptyText: <Empty description="No pending follow-ups" /> }}
        />
      </Card>
    </div>
  );
};

export default SalesDashboard;
