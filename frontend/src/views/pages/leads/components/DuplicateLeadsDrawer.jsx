import React from "react";
import {Button, Card, Col, Drawer, Input, message, Row, Space, Table, Tooltip, Typography, Tag, Descriptions, Empty, Divider, Popconfirm} from "antd";
import { useState, useMemo } from "react";
import { EnvironmentFilled, EnvironmentOutlined, ReloadOutlined, SwapOutlined, UserOutlined, FlagOutlined,} from "@ant-design/icons";
import util from "../../../../utils/util";
import { useLeadDuplicate, useLeadUpdate } from "../../../../api-hooks/leads";
import { EditIcon } from "../../../components/svgIcons";
import MyPagination from "../../../components/Pagination";
import { parseAsString, useQueryStates } from "nuqs";
import Search from "./Search";

const { Text, Title } = Typography;

const DEFAULT_NUQS_CONFIG = { throttleMs: Infinity };

const DuplicateLeadsDrawer = ({ open, onClose, leadId, acc}) => {
  const [messageApi, contextHolder] = message.useMessage();

  const { data: dupLeadsRes, isError, error, isFetching: isLeadLoading, refetch, refetchWithQuery } = useLeadDuplicate({
      leadId,
      enabled: open && !!leadId,
  });

  const { mutate: updateLead, isPending: isLeadUpdating } = useLeadUpdate({
    onSuccess: (res) => {
      messageApi.success(res?.message);
    },
    onError: (err) => {
      messageApi.error(err?.message);
    },
  });

  const loading = isLeadLoading || isLeadUpdating;

  const dupLeadData = dupLeadsRes?.data ;
  const qData = dupLeadsRes?.qData ?? { page: 1, limit: 20, total: dupLeadData?.total ?? 0 };

  // const [search, setSearch] = useQueryStates({ key: parseAsString.withDefault("") },{ urlKeys: { key: "q" }, ...DEFAULT_NUQS_CONFIG });
  const [search, setSearch] = useState({key:''});

  const rootLead = (() => {
    const r = dupLeadData?.rootLead;
    if (!r) return null;
    return Array.isArray(r) ? r[0] ?? null : r;
  })();

  const duplicates = dupLeadData?.duplicates ?? [];

  const stageColor = (stage) => {
    if (!stage) return "default";
    const s = String(stage).toLowerCase();
    if (s === "fresh") return "green";
    if (s === "contacted") return "blue";
    if (s === "qualified") return "purple";
    if (s === "lost") return "red";
    return "default";
  };

  const priorityColor = (p) => {
    if (!p) return "default";
    const s = String(p).toLowerCase();
    if (s === "high") return "red";
    if (s === "medium") return "orange";
    if (s === "low") return "green";
    return "default";
  };

  const duplicateCount = duplicates?.length ?? 0;

  const columns = [
    {
      title: "SN",
      dataIndex: "id",
      align: "center",
      width: 60,
      fixed: "left",
      render: (_, __, i) => {
        const page = Number(qData?.page || 1);
        const limit = Number(qData?.limit || 20);
        return <Text strong>{(page - 1) * limit + i + 1}</Text>;
      },
    },
    {
      title: "Lead",
      dataIndex: "leadName",
      align: "left",
      width: 200,
      fixed: "left",
      render: (_, row) => (
        <Space direction="vertical" size={2} style={{ textAlign: "left" }}>
          <Space size={6}>
            <UserOutlined style={{ color: "#8c8c8c" }} />
            <Tooltip title={row.fullName}>
              <Text strong>{row.fullName || "N/A"}</Text>
            </Tooltip>
          </Space>
          <Space size={6} wrap>
            {row.stage && ( <Tag color={stageColor(row.stage)} style={{ borderRadius: 999, fontSize: 11 }}>{row.stage}</Tag>)}
            {row.priority && ( <Tag icon={<FlagOutlined />} color={priorityColor(row.priority)} style={{ borderRadius: 999, fontSize: 11 }}>{row.priority}</Tag>)}
          </Space>
        </Space>
      ),
    },
    {
      title: "Contact",
      dataIndex: "email",
      align: "center",
      width: 240,
      render: (_, row) => (
        <div className="contact-mask" data-allowed={true}>
          {/* Masked fallback */}
          <div>
            <Text className="masked">xxxxxxxxxx</Text>
          </div>
          <div>
            <Text className="masked">xxxxxxx</Text>
          </div>

          <div className="actual">
            <Text>{row.email || "—"}</Text>
              <Text>{row.phone || "—"}</Text>
          </div>
        </div>
      ),
    },
    {
      title: "Category",
      dataIndex: "category",
      align: "center",
      width: 220,
      render: (_, row) => <div>{row?.category?.name || "—"}</div>,
    },
    {
      title: "Source / Project",
      dataIndex: "source",
      align: "center",
      width: 220,
      render: (_, row) => (
        <Space direction="vertical" size={0}>
          <Text>{row?.source || "—"}</Text>
          <Text type="secondary" style={{ fontSize: 11 }}>{row?.projectName || "—"}</Text>
        </Space>
      ),
    },
    {
      title: "Budget",
      dataIndex: "property_type",
      align: "center",
      width: 220,
      render: (_, row) => (
        <Space direction="vertical" size={0}>
          <Text type="secondary" style={{ fontSize: 11 }}>
            {"₹" + (row.budgetMin ?? "—") + " — " + "₹" + (row.budgetMax ?? "—")}
          </Text>
        </Space>
      ),
    },
    {
      title: "Location",
      dataIndex: "locationPrefernce",
      align: "center",
      width: 190,
      render: (v, row) => (
        <Space size={4}>
          <EnvironmentOutlined style={{ color: "#8c8c8c" }} />
          <Text>{v || row.branch || "—"}</Text>
        </Space>
      ),
    },
    { 
      title:'Reason of Duplicate',
      dataIndex:'duplicateReason',
      align:'center',
      width:190,
    },
    {
      title: "Created On",
      dataIndex: "createdAt",
      align: "center",
      width: 190,
      render: (_, row) => (
        <Space direction="vertical" size={0}>
          <Text type="secondary" style={{ fontSize: 11 }}>
            {(row?.createdAt && String(row.createdAt).split("T")[0]) || "—"}
          </Text>
        </Space>
      ),
    },
    ...(acc?.duplicateUpdateAccess
    ? [
        {
          title: "Action",
          dataIndex: "id",
          align: "center",
          width: 200,
          fixed: "right",
          render: (v, row) => (
            <Space size="small">
              <Popconfirm title="Are you sure to transfer this lead to main leads?" okText="Yes" cancelText="No"
                onConfirm={() =>
                  updateLead({ id: row?.id, status: "active" })
                }
              >
                <Tooltip title="Transfer lead">
                  <Button size="small" type="text" icon={<SwapOutlined />} style={{ borderRadius: 999 }}/>
                </Tooltip>
              </Popconfirm>
            </Space>
          ),
        },
      ]
    : []),
  ];

  const rowClassName = (_, index) => (index % 2 === 0 ? "table-row-light" : "table-row-dark");

  return (
    <>
      {contextHolder}
      <Drawer placement="right" width={1200} onClose={onClose} open={open} destroyOnHidden styles={{body:{ padding: 16, background: "#f5f7fb" }}}>
        <Card size="small" bordered={false} className="card-style"
          style={{ borderRadius: 8 }}
          title={
            <Space align="center">
              <div className="card-icon-container">
                <div className="card-icon-wrapper">
                  <EnvironmentFilled style={{ fontSize: 20, color: "#1d39c4" }} />
                </div>
              </div>
              <Space direction="vertical" size={0}>
                <Title level={4} style={{ margin: 0 }}> Duplicate Leads</Title>
                <Text type="secondary" style={{ fontSize: 12 }}>Review and manage duplicate lead entries</Text>
              </Space>
            </Space>
          }
          extra={
            <Space align="center">
              <Text type="secondary" style={{ fontSize: 12 }}>
                Total Duplicates:{" "}
                <Text strong style={{ color: "#2f54eb" }}> {duplicateCount || 0} </Text>
              </Text>

              <Tooltip title="Refresh data">
                <Button icon={<ReloadOutlined />} size="middle" loading={loading} onClick={refetch} style={{ borderRadius: 999, boxShadow: "0px 4px 10px rgba(15, 23, 42, 0.06)" }} />
              </Tooltip>
            </Space>
          }
        >
          {/* ROOT LEAD SUMMARY */}
          {rootLead && (
            <Card size="small" style={{ marginBottom: 12, borderRadius: 14, border: "1px solid #d6e4ff", background: "rgba(240,245,255,0.9)"}}>
              <Descriptions size="small" column={3}>
                <Descriptions.Item label="Name">{rootLead.fullName}</Descriptions.Item>
                <Descriptions.Item label="Phone">{rootLead.phone}</Descriptions.Item>
                <Descriptions.Item label="Email">{rootLead.email}</Descriptions.Item>
              </Descriptions>
            </Card>
          )}

          {/* SEARCH BAR */}
          {/* <Card size="small" bordered={false} style={{ marginBottom: 12, borderRadius: 999,background: "linear-gradient(90deg, rgba(240,245,255,0.9), rgba(255,255,255,0.95))", border: "1px solid #f0f2ff"}}>
           <Search search={search} setSearch={setSearch} refetch={refetchWithQuery}/>
          </Card> */}

          {/* TABLE */}
          <Table pagination={false} columns={columns} dataSource={duplicates} loading={loading} rowKey="id" rowClassName={rowClassName}
            style={{ borderRadius: 16, overflow: "hidden", background: "rgba(255,255,255,0.98)"}}
            scroll={{ y: "calc(100vh - 420px)", x: "max-content" }}
            locale={{ emptyText: <Empty description="No duplicates found" /> }}
          />

          <Divider style={{ margin: "14px 0 8px" }} />
          <MyPagination {...{ qData }} total={Number(qData?.total ?? 0)} onChange={refetchWithQuery} DEFAULT_NUQS_CONFIG={DEFAULT_NUQS_CONFIG} />
        </Card>
      </Drawer>
    </>
  );
};

export default DuplicateLeadsDrawer;
