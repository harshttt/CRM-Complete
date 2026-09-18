import {parseAsString, useQueryState, useQueryStates} from "nuqs";
import { getSortingStateParser } from "../../../utils/parsers";
import { useState, useEffect, useMemo } from "react";
import { Alert, Avatar, Badge, Button, Card, Col, Drawer, Form, Input, Modal, Popconfirm, Row, Space, Switch, Table, Tag, Typography, Select, Divider, Tooltip, Statistic, Flex,} from "antd";
import { DeleteOutlined, EditOutlined, FilterOutlined, PlusOutlined, SearchOutlined, ReloadOutlined, CloseCircleOutlined, ShareAltOutlined, CloseSquareFilled,} from "@ant-design/icons";
import util from "../../../utils/util";
import MyPagination from "../../components/Pagination";
import { dummyUsers } from "../../../dummyData/users";
import CountUp from "react-countup";

const { Text, Title } = Typography;

const allowURLStateUpdate = true;

/*──────────────────── SOURCES PAGE ────────────────────*/
const Sources = () => {
  const DEFAULT_NUQS_CONFIG = {
    throttleMs: !allowURLStateUpdate ? Infinity : 0,
  };

  /* ---------- Query States ---------- */
  const sorting_cols = [
    "id",
    "sourceName",
    "sourceKey",
    "category",
    "channel",
    "branch",
    "department",
    "priority",
  ];

  const [sort, setSort] = useQueryState("sources_sort", getSortingStateParser(sorting_cols).withDefault([{ column: "id", desc: 1 }]).withOptions(DEFAULT_NUQS_CONFIG));

  const [search, setSearch] = useQueryStates(
    { key: parseAsString.withDefault("") },
    { urlKeys: { key: "sources_search" }, ...DEFAULT_NUQS_CONFIG }
  );

  // Filters in URL
  const [filters, setFilters] = useQueryStates(
    {
      category: parseAsString.withDefault(""),
      channel: parseAsString.withDefault(""),
      branch: parseAsString.withDefault(""),
      department: parseAsString.withDefault(""),
      priority: parseAsString.withDefault(""),
      status: parseAsString.withDefault(""), // active / inactive
    },
    {
      urlKeys: {
        category: "f_src_category",
        channel: "f_src_channel",
        branch: "f_src_branch",
        department: "f_src_department",
        priority: "f_src_priority",
        status: "f_src_status",
      },
      ...DEFAULT_NUQS_CONFIG,
    }
  );

  /* ---------- Local States ---------- */
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [data, setData] = useState(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const qData = { page: 1, limit: 20 }; // placeholder

  // Fake placeholders (replace with real API states)
  const isError = false;
  const error = null;
  const refetch = () => {};
  const deleteData = () => {};

  /* ---------- Helpers ---------- */
  const priorityColor = (p) => {
    if (!p) return "default";
    const v = p.toString().toLowerCase();
    if (v.includes("high")) return "red";
    if (v.includes("medium")) return "orange";
    if (v.includes("low")) return "green";
    return "default";
  };

  const categoryColor = (c) => {
    if (!c) return "default";
    const v = c.toString().toLowerCase();
    if (v.includes("digital")) return "geekblue";
    if (v.includes("offline")) return "gold";
    if (v.includes("portal")) return "purple";
    if (v.includes("referral")) return "green";
    return "default";
  };

  const hasActiveFilters = useMemo(
    () => Object.values(filters).some(Boolean),
    [filters]
  );

  const activeFilterTags = useMemo(() => {
    const tags = [];
    if (filters.category)
      tags.push({ key: "category", label: `Category: ${filters.category}` });
    if (filters.channel)
      tags.push({ key: "channel", label: `Channel: ${filters.channel}` });
    if (filters.branch)
      tags.push({ key: "branch", label: `Branch: ${filters.branch}` });
    if (filters.department)
      tags.push({ key: "department", label: `Dept: ${filters.department}` });
    if (filters.priority)
      tags.push({ key: "priority", label: `Priority: ${filters.priority}` });
    if (filters.status)
      tags.push({key: "status", label: `Status: ${filters.status === "active" ? "Active" : "Inactive"}`});
    return tags;
  }, [filters]);

  const clearSingleFilter = (key) => {
    setFilters({ [key]: "" });
  };

  const clearAllFilters = () => {
    setFilters({
      category: "",
      channel: "",
      branch: "",
      department: "",
      priority: "",
      status: "",
    });
  };

  const parseMultiFilter = (value) => (value || "").split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);

  /* ---------- Fake Sources Data from dummyUsers ---------- */
  const sourcesRaw = (dummyUsers || [])?.map((u) => ({
    id: u.id,
    image: u.image,
    sourceName: u.sourceName || u.name || "Website Lead",
    sourceKey: u.sourceKey || "WEBSITE",
    category: u.category || "Digital",
    channel: u.channel || "Website",
    defaultCampaign: u.defaultCampaign || "Default Campaign",
    branch: u.branch || "Main Branch",
    department: u.department || "Sales",
    totalLeads: u.totalLeads || 120,
    qualifiedLeads: u.qualifiedLeads || 80,
    closedDeals: u.closedDeals || 22,
    conversion: u.conversion || "18.3%",
    priority: u.priority || "High",
    created_at: u.created_at || "2025-01-01",
    updated_at: u.updated_at || "2025-01-10",
    status: u.status ?? true,
  }));

  /* ---------- Filtered Data (search + filters) ---------- */
  const filteredData = sourcesRaw.filter((s) => {
    const searchTerm = (search.key || "").toLowerCase().trim();
    if (searchTerm) {
      const haystack = `${s.sourceName ?? ""} ${s.channel ?? ""} ${
        s.defaultCampaign ?? ""
      } ${s.branch ?? ""}`.toLowerCase();
      if (!haystack.includes(searchTerm)) return false;
    }

    const matchMulti = (filterString, fieldValue) => {
      if (!filterString) return true;
      const selected = parseMultiFilter(filterString);
      if (!selected.length) return true;
      const field = (fieldValue || "").toLowerCase();
      return selected.includes(field);
    };

    if (!matchMulti(filters.category, s.category)) return false;
    if (!matchMulti(filters.channel, s.channel)) return false;
    if (!matchMulti(filters.branch, s.branch)) return false;
    if (!matchMulti(filters.department, s.department)) return false;
    if (!matchMulti(filters.priority, s.priority)) return false;

    if (filters.status === "active" && !s.status) return false;
    if (filters.status === "inactive" && s.status) return false;

    return true;
  });

  const totalSources = filteredData.length;
  const totalActive = filteredData.filter((s) => s.status).length;
  const totalLeads = filteredData.reduce(
    (acc, s) => acc + (s.totalLeads || 0),
    0
  );
  const totalClosedDeals = filteredData.reduce(
    (acc, s) => acc + (s.closedDeals || 0),
    0
  );

  /* ---------- Table Columns ---------- */
  const baseColumns = [
    {
      title: "SN",
      dataIndex: "id",
      align: "center",
      width: 70,
      fixed: "left",
      render: (_, __, i) => {
        const page = qData.page || 1;
        const limit = qData.limit || 20;
        return <Text strong>{(page - 1) * limit + i + 1}</Text>;
      },
    },
    {
      title: "Source",
      dataIndex: "sourceName",
      align: "left",
      width: 260,
      fixed: "left",
      render: (_, row) => (
        <Space size={10}>
          <Avatar
            size={40}
            style={{
              background:"radial-gradient(circle at 30% 20%, #e6f4ff, #d6e4ff)",
              color: "#1d39c4",
              boxShadow: "0 0 0 2px rgba(45,140,240,0.18)",
            }}
            icon={!row.image && <ShareAltOutlined />}
            src={row.image ? ( <img draggable={false} src={row.image} alt="avatar" /> ) : undefined}
          />
          <div style={{ textAlign: "left" }}>
            <Tooltip title={row.sourceName}>
              <Text strong ellipsis style={{ maxWidth: 160, display: "block" }}> {row.sourceName}</Text>
            </Tooltip>
            <Space size={4} wrap>
              <Tag color="processing" style={{ borderRadius: 999, marginInlineEnd: 0, fontSize: 11, paddingInline: 10,}}>{row.sourceKey || "—"}</Tag>
              {row.category && ( <Tag color={categoryColor(row.category)} style={{ borderRadius: 999, fontSize: 11, paddingInline: 10 }}> {row.category}</Tag>)}
            </Space>
          </div>
        </Space>
      ),
    },
    {
      title: "Channel",
      dataIndex: "channel",
      align: "center",
      width: 140,
    },
    {
      title: "Default Campaign",
      dataIndex: "defaultCampaign",
      align: "center",
      width: 200,
      ellipsis: true,
    },
    {
      title: "Branch",
      dataIndex: "branch",
      align: "center",
      width: 150,
    },
    {
      title: "Department",
      dataIndex: "department",
      align: "center",
      width: 150,
    },
    {
      title: "Total Leads",
      dataIndex: "totalLeads",
      align: "center",
      width: 120,
    },
    {
      title: "Qualified Leads",
      dataIndex: "qualifiedLeads",
      align: "center",
      width: 130,
    },
    {
      title: "Closed Deals",
      dataIndex: "closedDeals",
      align: "center",
      width: 120,
    },
    {
      title: "Conversion",
      dataIndex: "conversion",
      align: "center",
      width: 110,
      render: (v) => <Text>{v || "—"}</Text>,
    },
    {
      title: "Priority",
      dataIndex: "priority",
      align: "center",
      width: 120,
      render: (v) => v ? (<Tag color={priorityColor(v)} style={{ borderRadius: 999 }}> {v}</Tag>) : ( "—"),
    },
    {
      title: "Created At",
      dataIndex: "created_at",
      align: "center",
      width: 140,
    },
    {
      title: "Updated At",
      dataIndex: "updated_at",
      align: "center",
      width: 140,
    },
    {
      title: "Status",
      dataIndex: "status",
      align: "center",
      width: 130,
      render: (_, row) => <ToggleStatus data={row} />,
    },
    {
      title: "Action",
      dataIndex: "id",
      align: "center",
      width: 130,
      fixed: "right",
      render: (v) => (
        <Space size="small">
          <Tooltip title="Edit source">
            <Button size="small" type="text" style={{ borderRadius: 999 }} icon={<EditOutlined />} onClick={() => handleEdit(v)} />
          </Tooltip>
          <Popconfirm
            title="Are you sure to delete this source?"
            okText="Yes"
            cancelText="No"
            onConfirm={() => deleteData({ id: v })}
          >
            <Tooltip title="Delete source">
              <Button size="small" type="text" danger style={{ borderRadius: 999 }} icon={<DeleteOutlined />} />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const columns = baseColumns.map((v, i) => {
    const sortConfig = sort?.find((s) => s.column === v.dataIndex);
    const isSortable = sorting_cols.includes(v.dataIndex);
    const haveMultipleSort = sorting_cols.length > 1;

    return {
      ...v,
      key: v.dataIndex || `column-${i}`,
      sorter: isSortable ? haveMultipleSort ? { multiple: i + 1 } : true : false,
      defaultSortOrder: sortConfig ? sortConfig.desc === 1 ? "descend" : "ascend" : undefined,
      responsive: ["xs", "sm", "md", "lg", "xl"],
    };
  });

  const rowClassName = (_, index) => index % 2 === 0 ? "source-row-even" : "source-row-odd";

  const handleEdit = (id) => {
    const src = sourcesRaw.find((s) => s.id === id);
    setSelectedId(id);
    setData(src || null);
    setIsEditModalOpen(true);
  };

  const handleModalClose = () => {
    setSelectedId(null);
    setData(null);
    setIsEditModalOpen(false);
  };

  const handleAdd = () => {
    setSelectedId(null);
    setData(null);
    setIsEditModalOpen(true);
  };

  /* ---------- Render ---------- */
  return (
    <div>
      {isError ? ( <Alert message="Error" description={error?.message} type="error" showIcon />) : (
        <Card
          size="small"
          bordered={false}
          style={{
            borderRadius: 24,
            maxWidth: "100%",
            margin: "0 auto",
            boxShadow: "0 18px 45px rgba(15,23,42,0.12)",
            border: "1px solid rgba(255,255,255,0.7)",
            background:"linear-gradient(145deg,rgba(255,255,255,0.97),rgba(245,248,255,0.99))",
            backdropFilter: "blur(16px)",
          }}
          styles={{header:{borderBottom:'none', padding:'18px 22px 6px'}, body:{padding:'8px 22px 18px'} }}
          title={
            <Space align="center">
              <div style={{width: 44, height: 44, borderRadius: "999px", background: "conic-gradient(from 210deg, #2f54eb, #9254de, #40a9ff, #2f54eb)", padding: 2 }}>
                <Flex justify="center" align="center" style={{width: "100%", height: "100%", borderRadius: "999px",background:"radial-gradient(circle at 30% 20%, #f0f5ff, #d6e4ff)",}}>
                  <ShareAltOutlined style={{ color: "#1d39c4" }} />
                </Flex>
              </div>
              <Space direction="vertical" size={0}>
                <Title level={4} style={{ margin: 0 }}>Lead Sources</Title>
                <Text type="secondary" style={{ fontSize: 12 }}> Manage where your leads are coming from and track performance.</Text>
              </Space>
            </Space>
          }
          extra={
            <Space>
              <Tooltip title="Refresh data">
                <Button icon={<ReloadOutlined />} size="middle" style={{borderRadius: 999, boxShadow: "0 4px 10px rgba(15,23,42,0.06)",}} onClick={refetch} />
              </Tooltip>
              <Button icon={<PlusOutlined />} type="primary" size="middle" style={{ borderRadius: 999, paddingInline: 18,}} onClick={handleAdd}>Add Source</Button>
            </Space>
          }
        >
          {/* Stats strip */}
          <Row gutter={14} style={{ marginBottom: 12 }}>
            <Col xs={12} md={6}>
              <StatCard icon={<ShareAltOutlined />} title="Total Sources" value={totalSources} accent="#2f54eb" sublabel="All active + inactive" />
            </Col>
            <Col xs={12} md={6}>
              <StatCard icon={<ShareAltOutlined />} title="Active Sources" value={totalActive} accent="#52c41a" sublabel="Status: Active" />
            </Col>
            <Col xs={12} md={6}>
              <StatCard icon={<ShareAltOutlined />} title="Total Leads" value={totalLeads} accent="#13c2c2" sublabel="From these sources" />
            </Col>
            <Col xs={12} md={6}>
              <StatCard icon={<ShareAltOutlined />} title="Closed Deals" value={totalClosedDeals} accent="#fa8c16" sublabel="Won from these sources"/>
            </Col>
          </Row>

          {/* Summary pill */}
          <Flex justify="center" align="center" gap={8} style={{ marginBottom: 10, flexWrap: "wrap", fontSize: 12, color: "#8c8c8c",}}>
            <Tag color="processing" style={{ borderRadius: 999, paddingInline: 12, border: "none" }}> Showing <b>{filteredData.length}</b> sources
            </Tag>
            <Text type="secondary"> {totalActive} active · {totalLeads} leads · {totalClosedDeals} closed </Text>
          </Flex>

          {/* Top toolbar: search + filters */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 10,
              marginBottom: 10,
              borderRadius: 999,
              padding: 8,
              paddingInline: 12,
              background:
                "linear-gradient(90deg,rgba(240,245,255,0.9),rgba(255,255,255,0.95))",
              border: "1px solid #f0f2ff",
            }}
          >
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 12,
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div style={{ flex: 1, minWidth: 260, maxWidth: 560 }}>
                <Search search={search} setSearch={setSearch} refetch={refetch} />
              </div>
              <Space>
                <Badge dot={hasActiveFilters}>
                  <Button
                    type="primary"
                    icon={<FilterOutlined />}
                    onClick={() => setIsFilterOpen(true)}
                    style={{
                      borderRadius: 999,
                      boxShadow: "0 4px 10px rgba(15,23,42,0.05)",
                    }}
                  >
                    Filters
                  </Button>
                </Badge>
              </Space>
            </div>

            {hasActiveFilters && (
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 8,
                  alignItems: "center",
                  padding: "4px 8px",
                  background: "#fafafa",
                  borderRadius: 999,
                }}
              >
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Active filters:
                </Text>
                {activeFilterTags?.map((t) => (
                  <Tag
                    key={t.key}
                    color="blue"
                    closable
                    onClose={(e) => {
                      e.preventDefault();
                      clearSingleFilter(t.key);
                    }}
                    style={{
                      borderRadius: 999,
                      paddingInline: 10,
                      background: "rgba(47,84,235,0.06)",
                    }}
                  >
                    {t.label}
                  </Tag>
                ))}
                <Button
                  type="link"
                  size="small"
                  icon={<CloseCircleOutlined />}
                  onClick={clearAllFilters}
                  style={{ paddingInline: 0 }}
                >
                  Clear all
                </Button>
              </div>
            )}
          </div>

          {/* Table */}
          <Table
            bordered={false}
            size="middle"
            rowKey="id"
            pagination={false}
            loading={false}
            columns={columns}
            dataSource={filteredData}
            rowClassName={rowClassName}
            style={{
              borderRadius: 16,
              overflow: "hidden",
              background: "rgba(255,255,255,0.98)",
            }}
            scroll={{
              y: util.getTableHeight
                ? util.getTableHeight()
                : "calc(100vh - 360px)",
              x: "max-content",
            }}
            onChange={(_, __, sorter) =>
              util.handleTableSortingData(
                sorter,
                setSort,
                sort,
                refetch,
                qData
              )
            }
          />

          <Divider style={{ margin: "14px 0 8px" }} />
          <MyPagination
            {...{ qData }}
            total={filteredData.length}
            onChange={() => {}}
            DEFAULT_NUQS_CONFIG={DEFAULT_NUQS_CONFIG}
          />
        </Card>
      )}

      {/* Add / Edit Source Modal */}
      <Modal
        open={isEditModalOpen}
        onCancel={handleModalClose}
        destroyOnHidden
        footer={null}
        centered
        width={900}
        title={null}
        styles={{body:{padding:0, background:'linear-gradient(135deg,#f3f6ff 0%,#ffffff 35%,#fdf5ff 100%)'}}}
        closeIcon={<CloseSquareFilled />}
      >
        <div
          style={{
            padding: 20,
            paddingBottom: 12,
            borderBottom: "1px solid #f0f0f0",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 8,
          }}
        >
          <Space align="center">
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: "999px",
                background:
                  "radial-gradient(circle at 30% 20%, #e6f4ff, #d6e4ff)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <ShareAltOutlined style={{ color: "#1d39c4" }} />
            </div>
            <Space direction="vertical" size={0}>
              <Title level={5} style={{ margin: 0 }}>
                {selectedId ? "Edit Source" : "Create New Source"}
              </Title>
              <Text type="secondary" style={{ fontSize: 12 }}>
                Define where leads come from & link them to your campaigns.
              </Text>
            </Space>
          </Space>
        </div>

        <div style={{ padding: 18, paddingTop: 6 }}>
          <DataForm _id={selectedId} onSave={handleModalClose} initialData={data} />
        </div>
      </Modal>

      {/* Filter Drawer */}
      <FilterDrawer
        open={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        filters={filters}
        setFilters={setFilters}
        onApply={refetch}
      />
    </div>
  );
};

export default Sources;

/*──────────────────── STAT CARD ────────────────────*/
function StatCard({ icon, title, value, accent, sublabel }) {
  return (
    <Card
      size="small"
      bordered={false}
      style={{
        borderRadius: 16,
        background:"linear-gradient(135deg, rgba(255,255,255,0.98), rgba(243,247,255,0.98))",
        boxShadow: "0 6px 18px rgba(15,23,42,0.09)",
        border: "1px solid rgba(240,242,255,0.9)",
      }}
      styles={{body:{padding:'10px 12px'}}}
    >
      <Space
        align="center"
        style={{
          width: "100%",
          justifyContent: "space-between",
        }}
      >
        <Space align="center">
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: "999px",
              background: `${accent}12`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: `0 0 0 1px ${accent}26`,
            }}
          >
            <span style={{ color: accent, fontSize: 16 }}>{icon}</span>
          </div>
          <Space direction="vertical" size={0}>
            <Statistic
              title={title}
              value={value}
              formatter={(val) => <CountUp end={Number(val) || 0} />}
            />
          </Space>
        </Space>
        {sublabel && (
          <Text type="secondary" style={{ fontSize: 11 }}>
            {sublabel}
          </Text>
        )}
      </Space>
    </Card>
  );
}

/*──────────────────── SEARCH BAR ────────────────────*/
function Search({ refetch, search, setSearch }) {
  return (
    <Form
      onFinish={() => {
        refetch();
      }}
      style={{ width: "100%" }}
    >
      <Row gutter={8} wrap align="middle">
        <Col span={16}>
          <Input
            placeholder="Search by Source / Channel / Campaign / Branch"
            value={search.key ?? ""}
            prefix={<SearchOutlined style={{ color: "#bfbfbf" }} />}
            onChange={(e) => setSearch({ key: e.target.value })}
            allowClear
            style={{
              borderRadius: 999,
              paddingInline: 16,
              paddingBlock: 8,
              boxShadow: "0 4px 10px rgba(15,23,42,0.06)",
              border: "1px solid #dde4ff",
            }}
          />
        </Col>
        <Col span={8}>
          <Button
            style={{ borderRadius: "50px" }}
            type="primary"
            icon={<SearchOutlined />}
            htmlType="submit"
          >
            Search
          </Button>
        </Col>
      </Row>
    </Form>
  );
}

/*──────────────────── FILTER DRAWER ────────────────────*/
function FilterDrawer({ open, onClose, filters, setFilters, onApply }) {
  const [form] = Form.useForm();

  useEffect(() => {
    const toArray = (str) =>
      (str || "").split(",").map((s) => s.trim())?.filter(Boolean);

    form.setFieldsValue({
      ...filters,
      category: toArray(filters.category),
      channel: toArray(filters.channel),
      branch: toArray(filters.branch),
      department: toArray(filters.department),
      priority: toArray(filters.priority),
    });
  }, [filters, form]);

  const handleFinish = (values) => {
    const toString = (val) =>
      Array.isArray(val) ? val.join(",") : val || "";

    const next = {
      ...filters,
      ...values,
      category: toString(values.category),
      channel: toString(values.channel),
      branch: toString(values.branch),
      department: toString(values.department),
      priority: toString(values.priority),
    };

    setFilters(next);
    onApply && onApply();
    onClose();
  };

  const handleReset = () => {
    const cleared = {
      category: "",
      channel: "",
      branch: "",
      department: "",
      priority: "",
      status: "",
    };
    setFilters(cleared);
    form.resetFields();
    onApply && onApply();
  };

  const applyPreset = (preset) => {
    const next = { ...filters, ...preset };
    setFilters(next);
    form.setFieldsValue(next);
    onApply && onApply();
  };

  return (
    <Drawer
      title={
        <Space align="center">
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: "999px",
              background:
                "radial-gradient(circle at 30% 20%, #e6f7ff, #d6e4ff)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <FilterOutlined style={{ color: "#096dd9" }} />
          </div>
          <Space direction="vertical" size={0}>
            <Text strong>Filters</Text>
            <Text type="secondary" style={{ fontSize: 11 }}>
              Filter sources by category, channel, branch & more
            </Text>
          </Space>
        </Space>
      }
      placement="right"
      width={380}
      open={open}
      onClose={onClose}
      destroyOnHidden
      styles={{
        paddingBottom:16,
        background:'linear-gradient(145deg, #f8fbff 0%, #ffffff 40%, #f9f0ff 100%)'
      }}
    >
      {/* Preset chips */}
      <div style={{ marginBottom: 10 }}>
        <Text type="secondary" style={{ fontSize: 11 }}>
          Presets:
        </Text>
        <Space wrap size={[6, 6]} style={{ marginTop: 6 }}>
          <Tag
            color="blue"
            style={{ borderRadius: 999, cursor: "pointer" }}
            onClick={() => applyPreset({ status: "active" })}
          >
            Active sources
          </Tag>
          <Tag
            color="geekblue"
            style={{ borderRadius: 999, cursor: "pointer" }}
            onClick={() => applyPreset({ category: "Digital" })}
          >
            Digital only
          </Tag>
          <Tag
            color="purple"
            style={{ borderRadius: 999, cursor: "pointer" }}
            onClick={() => applyPreset({ category: "Portal" })}
          >
            Portals
          </Tag>
          <Tag
            color="default"
            style={{ borderRadius: 999, cursor: "pointer" }}
            onClick={handleReset}
          >
            Reset all
          </Tag>
        </Space>
      </div>

      <Divider style={{ margin: "10px 0 14px" }} />

      <Form layout="vertical" form={form} onFinish={handleFinish}>
        <Row gutter={12}>
          <Col xs={24} md={12}>
            <Form.Item name="category" label="Category">
              <Select
                mode="tags"
                allowClear
                placeholder="Digital, Offline, Portal, Referral"
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item name="channel" label="Channel">
              <Select
                mode="tags"
                allowClear
                placeholder="Facebook, Google, Website..."
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={12}>
          <Col xs={24} md={12}>
            <Form.Item name="branch" label="Branch">
              <Select
                mode="tags"
                allowClear
                placeholder="Branch name(s)"
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item name="department" label="Department">
              <Select
                mode="tags"
                allowClear
                placeholder="Sales, Marketing..."
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={12}>
          <Col xs={24} md={12}>
            <Form.Item name="priority" label="Priority">
              <Select
                mode="tags"
                allowClear
                placeholder="High / Medium / Low"
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item name="status" label="Status">
              <Select
                allowClear
                placeholder="Select status"
                options={[
                  { label: "Active", value: "active" },
                  { label: "Inactive", value: "inactive" },
                ]}
              />
            </Form.Item>
          </Col>
        </Row>

        <Divider style={{ margin: "8px 0 12px" }} />

        <Row gutter={8}>
          <Col span={12}>
            <Button
              onClick={handleReset}
              block
              icon={<ReloadOutlined />}
              style={{ borderRadius: 999 }}
            >
              Reset
            </Button>
          </Col>
          <Col span={12}>
            <Button
              type="primary"
              htmlType="submit"
              block
              icon={<FilterOutlined />}
              style={{ borderRadius: 999 }}
            >
              Apply
            </Button>
          </Col>
        </Row>
      </Form>
    </Drawer>
  );
}

/*──────────────────── STATUS TOGGLE ────────────────────*/
function ToggleStatus({ data }) {
  const toggleStatus = (checked) => {
  };

  return (
    <Switch
      checked={!!data?.status}
      checkedChildren="Active"
      unCheckedChildren="Inactive"
      onChange={toggleStatus}
    />
  );
}

/*──────────────────── DATA FORM (ADD / EDIT SOURCE) ────────────────────*/
const CATEGORY_OPTIONS = ["Digital", "Offline", "Portal", "Referral"];
const PRIORITY_OPTIONS = ["High", "Medium", "Low"];

function DataForm({ _id, onSave, initialData }) {
  const [form] = Form.useForm();
  const isEdit = !!_id;

  useEffect(() => {
    if (isEdit && initialData) {
      form.setFieldsValue({
        status: initialData.status ?? true,
        priority: initialData.priority || "High",
        ...initialData,
      });
    } else {
      form.resetFields();
      form.setFieldsValue({
        status: true,
        priority: "High",
      });
    }
  }, [_id, initialData, form, isEdit]);

  const handleFinish = (values) => {
    onSave();
  };

  return (
    <div>
      <Form layout="vertical" form={form} onFinish={handleFinish}>
        <Card
          size="small"
          style={{
            marginBottom: 12,
            borderRadius: 14,
            border: "1px solid #f0f0f0",
            background: "rgba(255,255,255,0.96)",
          }}
          styles={{body:{padding:12}}}
          title={
            <Space>
              <div
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: "999px",
                  background: "#e6f4ff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <ShareAltOutlined style={{ fontSize: 14, color: "#1677ff" }} />
              </div>
              <span>Source Details</span>
            </Space>
          }
        >
          <Row gutter={12}>
            <Col xs={24}>
              <Form.Item name="image" label="Source Logo URL">
                <Input placeholder="https://..." />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                name="sourceName"
                label="Source Name"
                rules={[{ required: true, message: "Please enter source name" }]}
              >
                <Input placeholder="e.g. Facebook Ads, Website Form, 99acres" />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                name="sourceKey"
                label="Source Key"
                rules={[{ required: true, message: "Please enter unique key" }]}
              >
                <Input placeholder="e.g. FACEBOOK, WEBSITE, PORTAL_99ACRES" />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item name="category" label="Category">
                <Select
                  placeholder="Select category"
                  options={CATEGORY_OPTIONS?.map((c) => ({ label: c, value: c }))}
                  allowClear
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item name="channel" label="Channel">
                <Input placeholder="e.g. Facebook, Google, Website, WhatsApp" />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item name="defaultCampaign" label="Default Campaign">
                <Input placeholder="e.g. FB - Noida 2BHK Leads" />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        <Card
          size="small"
          style={{
            marginBottom: 10,
            borderRadius: 14,
            border: "1px solid #f0f0f0",
            background: "rgba(255,255,255,0.96)",
          }}
          styles={{body:{padding:12}}}
          title={
            <Space>
              <div
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: "999px",
                  background: "#f6ffed",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <ShareAltOutlined style={{ fontSize: 14, color: "#52c41a" }} />
              </div>
              <span>Routing & Meta</span>
            </Space>
          }
        >
          <Row gutter={12}>
            <Col xs={24} md={12}>
              <Form.Item name="branch" label="Default Branch">
                <Input placeholder="e.g. Noida Branch" />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item name="department" label="Default Department">
                <Input placeholder="e.g. Sales, Marketing" />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item name="priority" label="Priority">
                <Select
                  placeholder="Select priority"
                  options={PRIORITY_OPTIONS?.map((p) => ({ label: p, value: p }))}
                  allowClear
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                name="status"
                label="Status"
                valuePropName="checked"
              >
                <Switch checkedChildren="Active" unClheckedChildren="Inactive" />
              </Form.Item>
            </Col>

            <Col xs={24}>
              <Form.Item name="notes" label="Notes">
                <Input.TextArea
                  rows={3}
                  placeholder="Any extra info (UTM pattern, integration notes, etc.)"
                />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        <Row gutter={8} justify="end" style={{ marginTop: 8 }}>
          <Col xs={12} md={6}>
            <Button
              block
              onClick={() => {
                form.resetFields();
                onSave();
              }}
              style={{ borderRadius: 999 }}
            >
              Cancel
            </Button>
          </Col>
          <Col xs={12} md={6}>
            <Button
              type="primary"
              htmlType="submit"
              block
              style={{ borderRadius: 999 }}
            >
              {isEdit ? "Save Changes" : "Create Source"}
            </Button>
          </Col>
        </Row>
      </Form>
    </div>
  );
}
