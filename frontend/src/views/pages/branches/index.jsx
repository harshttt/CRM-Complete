import { parseAsString, useQueryState, useQueryStates,} from "nuqs";
import { getSortingStateParser } from "../../../utils/parsers";
import { useState, useEffect, useMemo } from "react";
import { Alert, Badge, Button, Card, Col, Drawer, Form, Input, Modal, Popconfirm, Row, Space, Switch, Table, Typography, Tag, Tooltip,Divider, Select, Statistic} from "antd";
import { DeleteOutlined, EditOutlined, PlusOutlined, SearchOutlined, EnvironmentOutlined, ShopOutlined, FieldTimeOutlined, BarChartOutlined , FilterOutlined, ReloadOutlined, PhoneOutlined, MailOutlined, HomeOutlined, CloseCircleOutlined, DollarCircleOutlined} from "@ant-design/icons";
import util from "../../../utils/util";
import MyPagination from "../../components/Pagination";
import { dummyUsers } from "../../../dummyData/users";
import CountUp from "react-countup";

const { Text, Title } = Typography;

const allowURLStateUpdate = true;

const Branches = () => {
  const DEFAULT_NUQS_CONFIG = {
    throttleMs: !allowURLStateUpdate ? Infinity : 0,
  };

  // ---------- Sorting ----------
  const sorting_cols = [
    "id",
    "name",
    "branchCity",
    "branchState",
    "totalEmployees",
    "salesExecutives",
    "activeLeads",
    "totalClosures",
    "revenue",
    "monthlyTarget",
    "achievement",
    "status",
  ];

  const [sort, setSort] = useQueryState(
    "branch_sort",
    getSortingStateParser(sorting_cols)
      .withDefault([{ column: "id", desc: 1 }])
      .withOptions(DEFAULT_NUQS_CONFIG)
  );

  // ---------- Search ----------
  const [search, setSearch] = useQueryStates(
    { key: parseAsString.withDefault("") },
    { urlKeys: { key: "branch_search_term" }, ...DEFAULT_NUQS_CONFIG }
  );

  // ---------- Filters in URL ----------
  const [filters, setFilters] = useQueryStates(
    {
      city: parseAsString.withDefault(""),
      state: parseAsString.withDefault(""),
      achievementBand: parseAsString.withDefault(""), // High/Medium/Low
      status: parseAsString.withDefault(""), // active/inactive
    },
    {
      urlKeys: {
        city: "f_city",
        state: "f_state",
        achievementBand: "f_ach_band",
        status: "f_status",
      },
      ...DEFAULT_NUQS_CONFIG,
    }
  );

  // ---------- Local States ----------
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

  /* ---------- Branch Data (mapped from dummyUsers just for UI) ---------- */
  const branches = useMemo(
    () =>
      (dummyUsers || []).map((u, index) => {
        const city = u.branchCity || u.city || "Mumbai";
        const state = u.branchState || "Maharashtra";
        const achievement =
          u.achievement ?? (Math.floor(Math.random() * 30) + 70); // 70–100
        const revenue = u.revenue ?? (Math.floor(Math.random() * 20) + 10) * 100000;
        const totalEmployees = u.totalEmployees ?? (Math.floor(Math.random() * 30) + 10);

        return {
          id: u.id ?? index + 1,
          name: u.branchName || `Branch ${index + 1}`,
          branchHead: u.branchHead || u.name || `Head ${index + 1}`,
          branchContactNo: u.branchContactNo || u.phone || "+91 98765 43210",
          branchEmail: u.branchEmail || u.email || "branch@example.com",
          branchAddress:
            u.branchAddress ||
            "123, Main Street, Business District",
          branchCity: city,
          branchState: state,
          department: u.department || "Sales",
          team: u.team || "Team A",
          totalEmployees,
          workingHours: u.workingHours || "10:00 AM - 7:00 PM",
          timezone: u.timezone || "IST (GMT+5:30)",
          holidays: u.holidays || "2 Sundays + public holidays",
          salesExecutives: u.salesExecutives ?? (Math.floor(Math.random() * 10) + 5),
          activeLeads: u.activeLeads ?? (Math.floor(Math.random() * 70) + 20),
          totalClosures: u.totalClosures ?? (Math.floor(Math.random() * 40) + 5),
          revenue,
          monthlyTarget: u.monthlyTarget ?? revenue + (Math.floor(Math.random() * 5) - 2) * 10000,
          achievement,
          supportEmail: u.supportEmail || "support@branch.com",
          supportPhone: u.supportPhone || "+91 90000 00000",
          updated_at: u.updated_at || "2025-03-15 04:30 PM",
          created_at: u.created_at || "2024-12-01 09:00 AM",
          status: u.status ?? (Math.random() > 0.1),
        };
      }),
    []
  );

  const parseMultiFilter = (value) =>
    (value || "")
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);

  const matchMulti = (filterString, fieldValue) => {
    if (!filterString) return true;
    const selected = parseMultiFilter(filterString);
    if (!selected.length) return true;
    const field = (fieldValue || "").toLowerCase();
    return selected.includes(field);
  };

  const getAchievementBand = (achievement) => {
    const v = Number(achievement) || 0;
    if (v >= 95) return "Very High";
    if (v >= 85) return "High";
    if (v >= 75) return "Medium";
    return "Low";
  };

  const hasActiveFilters = Object.values(filters).some(Boolean);

  const activeFilterTags = [
    filters.city && { key: "city", label: `City: ${filters.city}` },
    filters.state && { key: "state", label: `State: ${filters.state}` },
    filters.achievementBand && {
      key: "achievementBand",
      label: `Achievement: ${filters.achievementBand}`,
    },
    filters.status && {
      key: "status",
      label: `Status: ${filters.status === "active" ? "Active" : "Inactive"}`,
    },
  ].filter(Boolean);

  const clearSingleFilter = (key) => {
    setFilters({ [key]: "" });
  };

  const clearAllFilters = () => {
    setFilters({
      city: "",
      state: "",
      achievementBand: "",
      status: "",
    });
  };

  /* ---------- Filtered Branches ---------- */
  const searchTerm = (search.key || "").toLowerCase().trim();

  const filteredBranches = branches.filter((b) => {
    if (searchTerm) {
      const haystack = `${b.name} ${b.branchHead} ${b.branchCity} ${b.branchState} ${b.branchEmail}`.toLowerCase();
      if (!haystack.includes(searchTerm)) return false;
    }

    if (!matchMulti(filters.city, b.branchCity)) return false;
    if (!matchMulti(filters.state, b.branchState)) return false;

    if (filters.achievementBand) {
      const band = getAchievementBand(b.achievement);
      const selectedBands = parseMultiFilter(filters.achievementBand);
      if (!selectedBands.includes(band.toLowerCase())) return false;
    }

    if (filters.status === "active" && !b.status) return false;
    if (filters.status === "inactive" && b.status) return false;

    return true;
  });

  const totalBranches = filteredBranches.length;
  const activeBranches = filteredBranches.filter((b) => b.status).length;
  const totalEmployees = filteredBranches.reduce(
    (sum, b) => sum + (Number(b.totalEmployees) || 0),
    0
  );
  const totalRevenue = filteredBranches.reduce(
    (sum, b) => sum + (Number(b.revenue) || 0),
    0
  );

  // ---------- Handlers ----------
  const handleEdit = (id) => {
    const branch = filteredBranches.find((b) => b.id === id);
    setSelectedId(id);
    setData(branch || null);
    setIsEditModalOpen(true);
  };

  const handleModalClose = () => {
    setSelectedId(null);
    setData(null);
    setIsEditModalOpen(false);
  };

  const handleDelete = (id) => {
    deleteData({ id });
  };

  // ---------- Table Columns ----------
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
      title: "Branch",
      dataIndex: "name",
      width: 260,
      fixed: "left",
      render: (_, row) => (
        <Space direction="vertical" size={0} style={{ textAlign: "left" }}>
          <Space>
            <ShopOutlined style={{ color: "#2f54eb" }} />
            <Text strong>{row.name}</Text>
          </Space>
          <Space size={4} wrap>
            <Tag
              color="processing"
              style={{ borderRadius: 999, fontSize: 11, paddingInline: 10 }}
            >
              {row.branchCity}, {row.branchState}
            </Tag>
            <Tag
              color="geekblue"
              style={{ borderRadius: 999, fontSize: 11, paddingInline: 10 }}
            >
              {row.department}
            </Tag>
          </Space>
        </Space>
      ),
    },
    {
      title: "Branch Head",
      dataIndex: "branchHead",
      align: "center",
      width: 210,
      render: (_, row) => (
        <Space direction="vertical" size={0}>
          <Text strong>{row.branchHead}</Text>
          <Space size={4}>
            <MailOutlined style={{ fontSize: 11, color: "#bfbfbf" }} />
            <Text type="secondary" style={{ fontSize: 11 }}>
              {row.branchEmail}
            </Text>
          </Space>
        </Space>
      ),
    },
    {
      title: "Contact",
      dataIndex: "branchContactNo",
      align: "center",
      width: 160,
      render: (_, row) => (
        <Space direction="vertical" size={0}>
          <Space size={4}>
            <PhoneOutlined style={{ fontSize: 12 }} />
            <Text>{row.branchContactNo}</Text>
          </Space>
          <Text type="secondary" style={{ fontSize: 11 }}>
            {row.supportPhone}
          </Text>
        </Space>
      ),
    },
    {
      title: "Location",
      dataIndex: "branchAddress",
      align: "center",
      width: 260,
      ellipsis: true,
      render: (v, row) => (
        <Tooltip title={v}>
          <Space direction="vertical" size={0}>
            <Space size={4}>
              <EnvironmentOutlined style={{ fontSize: 12 }} />
              <Text style={{ fontSize: 12 }}>{v}</Text>
            </Space>
            <Text type="secondary" style={{ fontSize: 11 }}>
              {row.branchCity}, {row.branchState}
            </Text>
          </Space>
        </Tooltip>
      ),
    },
    {
      title: "Employees",
      dataIndex: "totalEmployees",
      align: "center",
      width: 150,
      render: (_, row) => (
        <Space direction="vertical" size={0}>
          <Tag color="blue" style={{ borderRadius: 999 }}>
            {row.totalEmployees} total
          </Tag>
          <Text type="secondary" style={{ fontSize: 11 }}>
            {row.salesExecutives} sales execs
          </Text>
        </Space>
      ),
    },
    {
      title: "Working Hours",
      dataIndex: "workingHours",
      align: "center",
      width: 180,
      render: (v, row) => (
        <Space direction="vertical" size={0}>
          <Space size={4}>
            <FieldTimeOutlined style={{ fontSize: 12 }} />
            <Text style={{ fontSize: 12 }}>{v}</Text>
          </Space>
          <Text type="secondary" style={{ fontSize: 11 }}>
            {row.timezone}
          </Text>
        </Space>
      ),
    },
    {
      title: "Sales Funnel",
      dataIndex: "activeLeads",
      align: "center",
      width: 170,
      render: (_, row) => (
        <Space direction="vertical" size={0}>
          <Text style={{ fontSize: 12 }}>
            Active leads: <b>{row.activeLeads}</b>
          </Text>
          <Text type="secondary" style={{ fontSize: 11 }}>
            Closures: <b>{row.totalClosures}</b>
          </Text>
        </Space>
      ),
    },
    {
      title: "Revenue / Target",
      dataIndex: "revenue",
      align: "center",
      width: 200,
      render: (_, row) => (
        <Space direction="vertical" size={0}>
          <Text style={{ fontSize: 12 }}>
            Rev: <b>₹{(row.revenue / 100000).toFixed(1)}L</b>
          </Text>
          <Text type="secondary" style={{ fontSize: 11 }}>
            Target: ₹{(row.monthlyTarget / 100000).toFixed(1)}L
          </Text>
        </Space>
      ),
    },
    {
      title: "Achievement",
      dataIndex: "achievement",
      align: "center",
      width: 140,
      render: (v) => {
        const band = getAchievementBand(v);
        let color = "default";
        if (band === "Very High") color = "green";
        else if (band === "High") color = "blue";
        else if (band === "Medium") color = "gold";
        else color = "red";
        return (
          <Space direction="vertical" size={0}>
            <Tag color={color} style={{ borderRadius: 999 }}>
              {v}% {band !== "Medium" ? `· ${band}` : ""}
            </Tag>
          </Space>
        );
      },
    },
    {
      title: "Support",
      dataIndex: "supportEmail",
      align: "center",
      width: 220,
      render: (_, row) => (
        <Space direction="vertical" size={0}>
          <Space size={4}>
            <MailOutlined style={{ fontSize: 12 }} />
            <Text style={{ fontSize: 12 }}>{row.supportEmail}</Text>
          </Space>
          <Space size={4}>
            <PhoneOutlined style={{ fontSize: 12 }} />
            <Text type="secondary" style={{ fontSize: 11 }}>
              {row.supportPhone}
            </Text>
          </Space>
        </Space>
      ),
    },
    {
      title: "Created / Updated",
      dataIndex: "created_at",
      align: "center",
      width: 210,
      render: (_, row) => (
        <Space direction="vertical" size={0}>
          <Text style={{ fontSize: 11 }}>
            Created: {row.created_at}
          </Text>
          <Text type="secondary" style={{ fontSize: 11 }}>
            Updated: {row.updated_at}
          </Text>
        </Space>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      align: "center",
      width: 120,
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
          <Tooltip title="Edit branch">
            <Button
              size="small"
              type="text"
              style={{ borderRadius: 999 }}
              icon={<EditOutlined />}
              onClick={() => handleEdit(v)}
            />
          </Tooltip>
          <Popconfirm
            title="Are you sure to delete this branch?"
            okText="Yes"
            cancelText="No"
            onConfirm={() => handleDelete(v)}
          >
            <Tooltip title="Delete branch">
              <Button
                size="small"
                type="text"
                danger
                style={{ borderRadius: 999 }}
                icon={<DeleteOutlined />}
              />
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
      sorter: isSortable
        ? haveMultipleSort
          ? { multiple: i + 1 }
          : true
        : false,
      defaultSortOrder: sortConfig
        ? sortConfig.desc === 1
          ? "descend"
          : "ascend"
        : undefined,
      responsive: ["xs", "sm", "md", "lg", "xl"],
    };
  });

  const rowClassName = (_, index) =>
    index % 2 === 0 ? "branch-row-even" : "branch-row-odd";

  // ---------- Render ----------
  return (
    <div
      // style={{
      //   padding: 24,
      //   background:
      //     "radial-gradient(circle at 0% 0%, #ddeaff 0, #f4f6ff 35%, #ffffff 100%)",
      //   minHeight: "100vh",
      // }}
    >
      {isError ? ( <Alert message="Error" description={error?.message} type="error" showIcon/>) : 
      (
        <Card
          size="small"
          bordered={false}
          style={{ borderRadius: 24, maxWidth: "100%", margin: "0 auto", boxShadow: "0 18px 45px rgba(15,23,42,0.12)", border: "1px solid rgba(255,255,255,0.7)", background:"linear-gradient(145deg,rgba(255,255,255,0.97),rgba(245,248,255,0.99))", backdropFilter: "blur(16px)"}}
          styles={{header: {borderBottom: "none", padding: "18px 22px 6px"}, body: { padding: "8px 22px 18px",},}}
          title={
            <Space align="center">
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: "999px",
                  background:"conic-gradient(from 210deg, #2f54eb, #13c2c2, #40a9ff, #2f54eb)",
                  padding: 2,
                }}
              >
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    borderRadius: "999px",
                    background:"radial-gradient(circle at 30% 20%, #f0f5ff, #d6e4ff)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <HomeOutlined style={{ color: "#1d39c4" }} />
                </div>
              </div>
              <Space direction="vertical" size={0}>
                <Title level={4} style={{ margin: 0 }}>Branch Network</Title>
                <Text type="secondary" style={{ fontSize: 12 }}>Manage all property sales branches, operations and performance.</Text>
              </Space>
            </Space>
          }
          extra={
            <Space>
              <Tooltip title="Refresh branches">
                <Button icon={<ReloadOutlined />} size="middle" style={{ borderRadius: 999, boxShadow: "0 4px 10px rgba(15,23,42,0.06)",}} onClick={refetch} />
              </Tooltip>
              <Button icon={<PlusOutlined />} type="primary" size="middle" style={{borderRadius: 999, paddingInline: 18,}} onClick={() => setIsEditModalOpen(true)}> Add Branch</Button>
            </Space>
          }
        >
          {/* Stats strip */}
          <Row gutter={14} style={{ marginBottom: 12 }}>
            <Col xs={12} md={6}>
              <StatCard
                icon={<HomeOutlined />}
                title="Total Branches"
                value={totalBranches}
                accent="#2f54eb"
                sublabel="Across all regions"
              />
            </Col>
            <Col xs={12} md={6}>
              <StatCard
                icon={<ShopOutlined />}
                title="Active Branches"
                value={activeBranches}
                accent="#52c41a"
                sublabel="Operating now"
              />
            </Col>
            <Col xs={12} md={6}>
              <StatCard
                icon={<BarChartOutlined />}
                title="Employees"
                value={totalEmployees}
                accent="#13c2c2"
                sublabel="Total headcount"
              />
            </Col>
            <Col xs={12} md={6}>
              <StatCard
                icon={<DollarFormat />}
                title="Monthly Revenue"
                value={`₹${(totalRevenue / 100000).toFixed(1)}L`}
                accent="#fa8c16"
                sublabel="Across branches"
              />
            </Col>
          </Row>

          {/* Summary pill */}
          <div
            style={{
              marginBottom: 10,
              display: "flex",
              flexWrap: "wrap",
              gap: 8,
              alignItems: "center",
              fontSize: 12,
              color: "#8c8c8c",
            }}
          >
            <Tag
              color="processing"
              style={{ borderRadius: 999, paddingInline: 12, border: "none" }}
            >
              Showing <b>{filteredBranches.length}</b> branches
            </Tag>
            <Text type="secondary">
              {activeBranches} active · {totalEmployees} employees · Revenue{" "}
              ₹{(totalRevenue / 100000).toFixed(1)}L
            </Text>
          </div>

          {/* Search + Filters */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 10,
              marginBottom: 10,
              borderRadius: 999,
              padding: 8,
              paddingInline: 12,
              background:"linear-gradient(90deg,rgba(240,245,255,0.9),rgba(255,255,255,0.95))",
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
                {activeFilterTags.map((t) => (
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
            dataSource={filteredBranches}
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
            total={filteredBranches.length}
            onChange={() => {}}
            DEFAULT_NUQS_CONFIG={DEFAULT_NUQS_CONFIG}
          />
        </Card>
      )}

      {/* Add / Edit Branch Modal */}
      <Modal
        open={isEditModalOpen}
        onCancel={handleModalClose}
        destroyOnHidden
        footer={null}
        centered
        width={900}
        title={null}
        style={{
          body:{
          padding: 0,
          background:"linear-gradient(135deg,#f3f6ff 0%,#ffffff 35%,#fdf5ff 100%)",
          }
        }}
      >
        <div
          style={{
            padding: 18,
            paddingBottom: 10,
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
                width: 32,
                height: 32,
                borderRadius: "999px",
                background:
                  "radial-gradient(circle at 30% 20%, #e6f4ff, #d6e4ff)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <HomeOutlined style={{ color: "#1d39c4" }} />
            </div>
            <Space direction="vertical" size={0}>
              <Title level={5} style={{ margin: 0 }}>
                {selectedId ? "Edit Branch" : "Create New Branch"}
              </Title>
              <Text type="secondary" style={{ fontSize: 12 }}>
                Configure branch details, contacts, working hours and KPIs.
              </Text>
            </Space>
          </Space>
          <Button
            size="small"
            type="text"
            onClick={handleModalClose}
            icon={<CloseCircleOutlined />}
          />
        </div>

        <div style={{ padding: 18, paddingTop: 6 }}>
          <DataForm id={selectedId} onSave={handleModalClose} initialData={data} />
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

export default Branches;

/*──────────── SMALL STAT CARD ────────────*/
function StatCard({ icon, title, value, accent, sublabel }) {
  return (
    <Card
      size="small"
      bordered={false}
      style={{
        borderRadius: 16,
        background:
          "linear-gradient(135deg, rgba(255,255,255,0.98), rgba(243,247,255,0.98))",
        boxShadow: "0 6px 18px rgba(15,23,42,0.09)",
        border: "1px solid rgba(240,242,255,0.9)",
      }}
      styles={{
      body:{padding:'10px 12px'}
      }}
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
          {/* <Space direction="vertical" size={0}>
            <Text type="secondary" style={{ fontSize: 11 }}>
              {title}
            </Text>
            <Text strong style={{ fontSize: 18 }}>
              {value}
            </Text>
          </Space> */}
        </Space>
        <Statistic title={title} value={value} formatter={(val=><CountUp end={val}/>)} />
        {sublabel && (
          <Text type="secondary" style={{ fontSize: 11 }}>
            {sublabel}
          </Text>
        )}
      </Space>
    </Card>
  );
}

/*──────────── DUMMY CURRENCY ICON WRAPPER ────────────*/
function DollarFormat() {
  return <DollarCircleOutlined />;
}

/*──────────── SEARCH BAR ────────────*/
function Search({ refetch, search, setSearch }) {
  return (
    <Form
      onFinish={() => {
        refetch();
      }}
      style={{ width: "100%" }}
    >
      <Row gutter={8} wrap align="middle">
        <Col span={24}>
          <Input
            placeholder="Search by Branch name / head / city / email"
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
      </Row>
    </Form>
  );
}

/*──────────── FILTER DRAWER ────────────*/
function FilterDrawer({ open, onClose, filters, setFilters, onApply }) {
  const [form] = Form.useForm();

  useEffect(() => {
    const toArray = (str) =>
      (str || "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

    form.setFieldsValue({
      ...filters,
      city: toArray(filters.city),
      state: toArray(filters.state),
      achievementBand: toArray(filters.achievementBand),
    });
  }, [filters, form]);

  const handleFinish = (values) => {
    const toString = (val) =>
      Array.isArray(val) ? val.join(",") : (val || "");

    const next = {
      ...filters,
      ...values,
      city: toString(values.city),
      state: toString(values.state),
      achievementBand: toString(values.achievementBand),
    };

    setFilters(next);
    onApply && onApply();
    onClose();
  };

  const handleReset = () => {
    const cleared = {
      city: "",
      state: "",
      achievementBand: "",
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
            <Text strong>Branch Filters</Text>
            <Text type="secondary" style={{ fontSize: 11 }}>
              Filter by city, state, achievement and status.
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
        body:{
        paddingBottom: 16,
        background:"linear-gradient(145deg,#f8fbff 0%,#ffffff 40%,#f9f0ff 100%)",
        }
      }}
    >
      {/* Preset chips */}
      <div
        style={{
          borderRadius: 16,
          padding: 12,
          marginBottom: 10,
          background:"linear-gradient(135deg,rgba(24,144,255,0.08),rgba(111,66,193,0.06))",
          border: "1px solid rgba(24,144,255,0.18)",
        }}
      >
        <Text strong style={{ fontSize: 12 }}>
          Quick presets
        </Text>
        <Space wrap size={[6, 6]} style={{ marginTop: 8 }}>
          <Tag
            color="blue"
            style={{ borderRadius: 999, cursor: "pointer" }}
            onClick={() =>
              applyPreset({ achievementBand: "High,Very High", status: "active" })
            }
          >
            High performing
          </Tag>
          <Tag
            color="gold"
            style={{ borderRadius: 999, cursor: "pointer" }}
            onClick={() => applyPreset({ achievementBand: "Medium" })}
          >
            Medium performing
          </Tag>
          <Tag
            color="red"
            style={{ borderRadius: 999, cursor: "pointer" }}
            onClick={() => applyPreset({ achievementBand: "Low" })}
          >
            Low performing
          </Tag>
          <Tag
            color="green"
            style={{ borderRadius: 999, cursor: "pointer" }}
            onClick={() => applyPreset({ status: "active" })}
          >
            Active branches
          </Tag>
        </Space>
      </div>

      <Divider style={{ margin: "10px 0 14px" }} />

      <Form layout="vertical" form={form} onFinish={handleFinish}>
        <Row gutter={12}>
          <Col xs={24} md={12}>
            <Form.Item name="city" label="City">
              <Select mode="tags" allowClear placeholder="City name(s)" />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item name="state" label="State">
              <Select mode="tags" allowClear placeholder="State(s)" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={12}>
          <Col xs={24}>
            <Form.Item name="achievementBand" label="Achievement Band">
              <Select
                mode="tags"
                allowClear
                placeholder="Very High / High / Medium / Low"
                options={[
                  { label: "Very High (95%+)", value: "Very High" },
                  { label: "High (85–94%)", value: "High" },
                  { label: "Medium (75–84%)", value: "Medium" },
                  { label: "Low (<75%)", value: "Low" },
                ]}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={0}>
          <Col span={24}>
            <Form.Item name="status" label="Branch Status">
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

/*──────────── STATUS TOGGLE ────────────*/
function ToggleStatus({ data }) {
  const toggleStatus = () => {
    console.log("Toggle branch status", data.id);
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

/*──────────── DATA FORM (ADD / EDIT BRANCH) ────────────*/
function DataForm({ id, onSave, initialData }) {
  const [form] = Form.useForm();
  const isEdit = !!id;

  useEffect(() => {
    if (isEdit && initialData) {
      form.setFieldsValue({
        status: initialData.status ?? true,
        ...initialData,
      });
    } else {
      form.resetFields();
      form.setFieldsValue({
        status: true,
        workingHours: "10:00 AM - 7:00 PM",
        timezone: "IST (GMT+5:30)",
      });
    }
  }, [id, initialData, form, isEdit]);

  const onFinish = (values) => {
    const payload = {
      ...(initialData || {}),
      ...values,
      id: id || Date.now(),
    };
    onSave();
  };

  return (
    <Form layout="vertical" form={form} onFinish={onFinish}>
      {/* BASIC INFO */}
      <Card
        size="small"
        style={{
          marginBottom: 12,
          borderRadius: 14,
          border: "1px solid #f0f0f0",
          background: "rgba(255,255,255,0.96)",
        }}
        styles={{ body:{padding:12}}}
      >
        <Row gutter={12}>
          <Col xs={24} md={12}>
            <Form.Item
              name="name"
              label="Branch Name"
              rules={[{ required: true, message: "Please enter branch name" }]}
            >
              <Input placeholder="e.g. Mumbai Central Branch" />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item
              name="branchHead"
              label="Branch Head"
              rules={[{ required: true, message: "Please enter branch head" }]}
            >
              <Input placeholder="e.g. John Doe" />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item
              name="branchContactNo"
              label="Branch Contact No"
              rules={[{ required: true, message: "Please enter branch contact" }]}
            >
              <Input placeholder="e.g. +91 98765 43210" />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item
              name="branchEmail"
              label="Branch Email"
              rules={[{ type: "email", message: "Enter a valid email" }]}
            >
              <Input placeholder="e.g. mumbai.branch@company.com" />
            </Form.Item>
          </Col>

          <Col xs={24}>
            <Form.Item
              name="branchAddress"
              label="Branch Address"
              rules={[{ required: true, message: "Please enter address" }]}
            >
              <Input.TextArea
                rows={3}
                placeholder="e.g. 123, Business Street, Central Area, Mumbai"
              />
            </Form.Item>
          </Col>
        </Row>
      </Card>

      {/* LOCATION & TEAM */}
      <Card
        size="small"
        style={{
          marginBottom: 12,
          borderRadius: 14,
          border: "1px solid #f0f0f0",
          background: "rgba(255,255,255,0.96)",
        }}
        styles={{ body:{padding:12}}}
      >
        <Row gutter={12}>
          <Col xs={24} md={8}>
            <Form.Item
              name="branchCity"
              label="City"
              rules={[{ required: true, message: "Please enter city" }]}
            >
              <Input placeholder="e.g. Mumbai" />
            </Form.Item>
          </Col>

          <Col xs={24} md={8}>
            <Form.Item
              name="branchState"
              label="State"
              rules={[{ required: true, message: "Please enter state" }]}
            >
              <Input placeholder="e.g. Maharashtra" />
            </Form.Item>
          </Col>

          <Col xs={24} md={8}>
            <Form.Item name="timezone" label="Timezone">
              <Input placeholder="e.g. IST (GMT+5:30)" />
            </Form.Item>
          </Col>

          <Col xs={24} md={8}>
            <Form.Item name="department" label="Primary Department">
              <Input placeholder="e.g. Sales" />
            </Form.Item>
          </Col>

          <Col xs={24} md={8}>
            <Form.Item name="team" label="Default Team">
              <Input placeholder="e.g. Team Alpha" />
            </Form.Item>
          </Col>

          <Col xs={24} md={8}>
            <Form.Item name="workingHours" label="Working Hours">
              <Input placeholder="e.g. 10:00 AM - 7:00 PM" />
            </Form.Item>
          </Col>

          <Col xs={24}>
            <Form.Item name="holidays" label="Branch Holidays">
              <Input placeholder="e.g. Sundays + public holidays" />
            </Form.Item>
          </Col>
        </Row>
      </Card>

      {/* METRICS & SUPPORT */}
      <Card
        size="small"
        style={{
          marginBottom: 10,
          borderRadius: 14,
          border: "1px solid #f0f0f0",
          background: "rgba(255,255,255,0.96)",
        }}
        styles={{body:{padding:12}}}
      >
        <Row gutter={12}>
          <Col xs={24} md={6}>
            <Form.Item name="totalEmployees" label="Total Employees">
              <Input type="number" placeholder="e.g. 25" />
            </Form.Item>
          </Col>

          <Col xs={24} md={6}>
            <Form.Item name="salesExecutives" label="Sales Executives">
              <Input type="number" placeholder="e.g. 12" />
            </Form.Item>
          </Col>

          <Col xs={24} md={6}>
            <Form.Item name="activeLeads" label="Active Leads">
              <Input type="number" placeholder="e.g. 80" />
            </Form.Item>
          </Col>

          <Col xs={24} md={6}>
            <Form.Item name="totalClosures" label="Total Closures">
              <Input type="number" placeholder="e.g. 25" />
            </Form.Item>
          </Col>

          <Col xs={24} md={6}>
            <Form.Item name="revenue" label="Monthly Revenue (₹)">
              <Input type="number" placeholder="e.g. 4500000" />
            </Form.Item>
          </Col>

          <Col xs={24} md={6}>
            <Form.Item name="monthlyTarget" label="Monthly Target (₹)">
              <Input type="number" placeholder="e.g. 5000000" />
            </Form.Item>
          </Col>

          <Col xs={24} md={6}>
            <Form.Item name="achievement" label="Achievement %">
              <Input type="number" placeholder="e.g. 90" />
            </Form.Item>
          </Col>

          <Col xs={24} md={6}>
            <Form.Item
              name="status"
              label="Branch Status"
              valuePropName="checked"
            >
              <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
            </Form.Item>
          </Col>

          <Col xs={24} md={8}>
            <Form.Item name="supportEmail" label="Support Email">
              <Input placeholder="e.g. support@branch.com" />
            </Form.Item>
          </Col>

          <Col xs={24} md={8}>
            <Form.Item name="supportPhone" label="Support Phone">
              <Input placeholder="e.g. +91 90000 00000" />
            </Form.Item>
          </Col>

          <Col xs={24} md={4}>
            <Form.Item name="created_at" label="Created At">
              <Input placeholder="e.g. 2024-12-01 09:00 AM" />
            </Form.Item>
          </Col>

          <Col xs={24} md={4}>
            <Form.Item name="updated_at" label="Updated At">
              <Input placeholder="e.g. 2025-03-15 04:30 PM" />
            </Form.Item>
          </Col>
        </Row>
      </Card>

      {/* Actions */}
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
            style={{
              borderRadius: 999,
              boxShadow: "0 6px 18px rgba(24,144,255,0.35)",
            }}
          >
            {isEdit ? "Save Changes" : "Create Branch"}
          </Button>
        </Col>
      </Row>
    </Form>
  );
}
