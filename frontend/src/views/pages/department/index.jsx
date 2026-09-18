import {parseAsString, useQueryState, useQueryStates,} from "nuqs";
import { getSortingStateParser } from "../../../utils/parsers";
import { useState, useEffect, useMemo } from "react";
import { Alert, Avatar, Badge, Button, Card, Col, Drawer, Form, Input, InputNumber, Modal, Popconfirm, Row, Space, Switch, Table, Tag, Typography, Select, Divider, Tooltip, Statistic, Flex,} from "antd";
import { DeleteOutlined, EditOutlined, FilterOutlined, PlusOutlined, SearchOutlined, ReloadOutlined, CloseCircleOutlined, ApartmentOutlined, EnvironmentOutlined, UserOutlined, ClusterOutlined, CloseSquareFilled} from "@ant-design/icons";
import util from "../../../utils/util";
import MyPagination from "../../components/Pagination";
import { dummyUsers } from "../../../dummyData/users";
import CountUp from "react-countup";

const { Text, Title } = Typography;

const allowURLStateUpdate = true;

/*──────────────────── DEPARTMENT PAGE ────────────────────*/
const Department = () => {
  const DEFAULT_NUQS_CONFIG = {
    throttleMs: !allowURLStateUpdate ? Infinity : 0,
  };

  /* ---------- Query States ---------- */
  const sorting_cols = [
    "id",
    "name",
    "departmentCode",
    "hod",
    "branch",
    "region",
    "departmentType",
  ];

  const [sort, setSort] = useQueryState("dept_sort", getSortingStateParser(sorting_cols).withDefault([{ column: "id", desc: 1 }]).withOptions(DEFAULT_NUQS_CONFIG));

  const [search, setSearch] = useQueryStates(
    { key: parseAsString.withDefault("") },
    { urlKeys: { key: "dept_search" }, ...DEFAULT_NUQS_CONFIG }
  );

  // Filters in URL
  const [filters, setFilters] = useQueryStates(
    {
      branch: parseAsString.withDefault(""),
      region: parseAsString.withDefault(""),
      departmentType: parseAsString.withDefault(""),
      hod: parseAsString.withDefault(""),
      status: parseAsString.withDefault(""), // active / inactive
    },
    {
      urlKeys: {
        branch: "f_dept_branch",
        region: "f_dept_region",
        departmentType: "f_dept_type",
        hod: "f_dept_hod",
        status: "f_dept_status",
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
  const deleteData = ({ id }) => {
    console.log("Delete department id:", id);
  };

  const handleEdit = (id) => {
    // Using dummyUsers as fake department data for now
    const record = dummyUsers.find((u) => u.id === id);
    // Map to department-ish shape (you can remove this once you use real API)
    const mapped =
      record && {
        ...record,
        name: record?.departmentName || record.name || `Dept ${record.id}`,
        departmentCode: record?.departmentCode || `DEPT-${record.id}`,
        hod: record.hod || record.name,
        hodEmail: record.hodEmail || record.email,
        hodContact: record.hodContact || record.phone,
        branch: record.branch || "Main Branch",
        region: record.region || "North",
        totalTeams: record.totalTeams || 3,
        totalEmployees: record.totalEmployees || 20,
        activeEmployees: record.activeEmployees || 18,
        departmentType: record.departmentType || "Sales",
        monthlyTarget: record.monthlyTarget || 1000000,
        quarterlyTarget: record.quarterlyTarget || 3000000,
        yearlyTarget: record.yearlyTarget || 12000000,
        achievement: record.achievement || 72,
        performanceRating: record.performanceRating || 4.2,
        status: record.status ?? true,
      };

    setSelectedId(id);
    setData(mapped || null);
    setIsEditModalOpen(true);
  };

  const handleAdd = () => {
    setSelectedId(null);
    setData(null);
    setIsEditModalOpen(true);
  };

  const handleModalClose = () => {
    setSelectedId(null);
    setData(null);
    setIsEditModalOpen(false);
  };

  /* ---------- Helpers ---------- */
  const deptTypeColor = (type) => {
    if (!type) return "default";
    const t = type.toLowerCase();
    if (t.includes("sales")) return "geekblue";
    if (t.includes("marketing")) return "purple";
    if (t.includes("operations")) return "cyan";
    if (t.includes("support")) return "green";
    return "default";
  };

  const hasActiveFilters = useMemo(
    () => Object.values(filters).some(Boolean),
    [filters]
  );

  const activeFilterTags = useMemo(() => {
    const tags = [];
    if (filters.branch) tags.push({ key: "branch", label: `Branch: ${filters.branch}` });
    if (filters.region) tags.push({ key: "region", label: `Region: ${filters.region}` });
    if (filters.departmentType) tags.push({ key: "departmentType", label: `Type: ${filters.departmentType}` });
    if (filters.hod) tags.push({ key: "hod", label: `HOD: ${filters.hod}` });
    if (filters.status) tags.push({ key: "status", label: `Status: ${filters.status === "active" ? "Active" : "Inactive"}`,});

    return tags;
  }, [filters]);

  const clearSingleFilter = (key) => {
    setFilters({ [key]: "" });
  };

  const clearAllFilters = () => {
    setFilters({
      branch: "",
      region: "",
      departmentType: "",
      hod: "",
      status: "",
    });
  };

  const parseMultiFilter = (value) => (value || "").split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);

  /* ---------- Fake Department Data from dummyUsers ---------- */
  const departmentsRaw = (dummyUsers || []).map((u) => ({
    id: u?.id,
    image: u?.image,
    name: u?.departmentName || u?.name || `Dept ${u.id}`,
    departmentCode: u?.departmentCode || `DEPT-${u.id}`,
    departmentType: u?.departmentType || "Sales",
    hod: u?.hod || u?.name,
    hodEmail: u?.hodEmail || u?.email,
    hodContact: u?.hodContact || u?.phone,
    branch: u?.branch || "Main Branch",
    region: u?.region || "North",
    totalTeams: u?.totalTeams || 3,
    totalEmployees: u?.totalEmployees || 20,
    activeEmployees: u?.activeEmployees || 18,
    monthlyTarget: u?.monthlyTarget || 1000000,
    quarterlyTarget: u?.quarterlyTarget || 3000000,
    yearlyTarget: u?.yearlyTarget || 12000000,
    achievement: u?.achievement || 72,
    performanceRating: u?.performanceRating || 4.2,
    createdAt: u?.createdAt || "2025-01-01",
    updatedAt: u?.updatedAt || "2025-01-10",
    status: u?.status ?? true,
  }));

  /* ---------- Filtered Data (search + filters) ---------- */
  const filteredData = departmentsRaw.filter((d) => {
    const searchTerm = (search.key || "").toLowerCase().trim();
    if (searchTerm) {
      const haystack = `${d.name ?? ""} ${d.hod ?? ""} ${d.branch ?? ""}`.toLowerCase();
      if (!haystack.includes(searchTerm)) return false;
    }

    const matchMulti = (filterString, fieldValue) => {
      if (!filterString) return true;
      const selected = parseMultiFilter(filterString);
      if (!selected.length) return true;
      const field = (fieldValue || "").toLowerCase();
      return selected.includes(field);
    };

    if (!matchMulti(filters.branch, d.branch)) return false;
    if (!matchMulti(filters.region, d.region)) return false;
    if (!matchMulti(filters.departmentType, d.departmentType)) return false;
    if (!matchMulti(filters.hod, d.hod)) return false;

    if (filters.status === "active" && !d.status) return false;
    if (filters.status === "inactive" && d.status) return false;

    return true;
  });

  const totalDepartments = filteredData.length;
  const totalActive = filteredData.filter((d) => d.status).length;
  const totalTeams = filteredData.reduce((acc, d) => acc + (d.totalTeams || 0), 0);
  const totalEmployees = filteredData.reduce(
    (acc, d) => acc + (d.totalEmployees || 0),
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
      title: "Department",
      dataIndex: "name",
      width: 260,
      fixed: "left",
      render: (_, row) => (
        <Space size={10}>
          <Avatar
            size={40}
            style={{
              background: "radial-gradient(circle at 30% 20%, #e6f4ff, #d6e4ff)",
              color: "#1d39c4",
              boxShadow: "0 0 0 2px rgba(45,140,240,0.18)",
            }}
            icon={!row.image && <ApartmentOutlined />}
            src={row.image ? (<img draggable={false} src={row.image} alt="avatar" />) : undefined}
          />
          <div style={{ textAlign: "left" }}>
            <Text strong ellipsis style={{ maxWidth: 160, display: "block" }}>{row.name} </Text>
            <Space size={4} wrap>
              <Tag color="processing" style={{ borderRadius: 999, marginInlineEnd: 0, fontSize: 11, paddingInline: 10,}}>{row.departmentCode || "—"}</Tag>
              {row.departmentType && ( <Tag color={deptTypeColor(row.departmentType)} style={{ borderRadius: 999, fontSize: 11, paddingInline: 10 }}> {row.departmentType}</Tag>)}
            </Space>
          </div>
        </Space>
      ),
    },
    {
      title: "HOD",
      dataIndex: "hod",
      align: "center",
      width: 180,
      render: (v, row) => (
        <Space direction="vertical" size={0}>
          <Text strong>{v || "—"}</Text>
          <Text type="secondary" style={{ fontSize: 11 }}>{row.hodEmail || "—"} </Text>
        </Space>
      ),
    },
    {
      title: "Branch",
      dataIndex: "branch",
      align: "center",
      width: 160,
      render: (v) => (
        <Space>
          <EnvironmentOutlined style={{ color: "#8c8c8c" }} />
          <Text>{v}</Text>
        </Space>
      ),
    },
    {
      title: "Region",
      dataIndex: "region",
      align: "center",
      width: 120,
    },
    {
      title: "Teams",
      dataIndex: "totalTeams",
      align: "center",
      width: 100,
      render: (v) => v ?? "—",
    },
    {
      title: "Employees",
      dataIndex: "totalEmployees",
      align: "center",
      width: 120,
      render: (_, row) => (
        <Space direction="vertical" size={0}>
          <Text>{row.totalEmployees ?? "—"}</Text>
          <Text type="secondary" style={{ fontSize: 11 }}>{row.activeEmployees ?? 0} active</Text>
        </Space>
      ),
    },
    {
      title: "Targets",
      dataIndex: "monthlyTarget",
      align: "center",
      width: 210,
      render: (_, row) => (
        <Space direction="vertical" size={0}>
          <Text style={{ fontSize: 12 }}> M: {row.monthlyTarget?.toLocaleString?.() ?? "—"}</Text>
          <Text type="secondary" style={{ fontSize: 11 }}> Y: {row.yearlyTarget?.toLocaleString?.() ?? "—"}</Text>
        </Space>
      ),
    },
    {
      title: "Performance",
      dataIndex: "achievement",
      align: "center",
      width: 160,
      render: (_, row) => (
        <Space direction="vertical" size={0}>
          <Text>{row.achievement ?? 0}% target</Text>
          <Text type="secondary" style={{ fontSize: 11 }}> Rating: {row.performanceRating ?? "—"}</Text>
        </Space>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      align: "center",
      width: 130,
      render: (_, row) => <ToggleStatus data={row} />,
    },
    {
      title: "Updated At",
      dataIndex: "updatedAt",
      align: "center",
      width: 160,
    },
    {
      title: "Action",
      dataIndex: "id",
      align: "center",
      width: 130,
      fixed: "right",
      render: (v) => (
        <Space size="small">
          <Tooltip title="Edit department">
            <Button size="small" type="text" style={{ borderRadius: 999 }} icon={<EditOutlined />} onClick={() => handleEdit(v)} />
          </Tooltip>
          <Popconfirm
            title="Are you sure to delete this department?"
            okText="Yes"
            cancelText="No"
            onConfirm={() => deleteData({ id: v })}
          >
            <Tooltip title="Delete department">
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
      defaultSortOrder: sortConfig ? sortConfig.desc === 1 ? "descend" : "ascend": undefined,
      responsive: ["xs", "sm", "md", "lg", "xl"],
    };
  });

  const rowClassName = (_, index) => index % 2 === 0 ? "dept-row-even" : "dept-row-odd";

  /* ---------- Render ---------- */
  return (
    <div>
      {isError ? ( <Alert message="Error" description={error?.message} type="error" showIcon/>) : (
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
          styles={{header:{borderBottom:'none', padding:'18px 22px 6px'}, body:{ padding:'8px 22px 18px'}}}
          title={
            <Space align="center">
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: "999px",
                  background: "conic-gradient(from 210deg, #2f54eb, #9254de, #40a9ff, #2f54eb)",
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
                  <ClusterOutlined style={{ color: "#1d39c4" }} />
                </div>
              </div>
              <Space direction="vertical" size={0}>
                <Title level={4} style={{ margin: 0 }}>Department Management</Title>
                <Text type="secondary" style={{ fontSize: 12 }}>Manage your organizational departments, heads & targets centrally.</Text>
              </Space>
            </Space>
          }
          extra={
            <Space>
              <Tooltip title="Refresh data">
                <Button
                  icon={<ReloadOutlined />}
                  size="middle"
                  style={{ borderRadius: 999, boxShadow: "0 4px 10px rgba(15,23,42,0.06)"}}
                  onClick={refetch}
                />
              </Tooltip>
              <Button icon={<PlusOutlined />} type="primary" size="middle" style={{ borderRadius: 999, paddingInline: 18,}} onClick={handleAdd}>
                Add Department
              </Button>
            </Space>
          }
        >
          {/* Stats strip */}
          <Row gutter={14} style={{ marginBottom: 12 }}>
            <Col xs={12} md={6}>
              <StatCard icon={<ApartmentOutlined />} title="Departments" value={totalDepartments} accent="#2f54eb" sublabel="All departments" />
            </Col>
            <Col xs={12} md={6}>
              <StatCard icon={<UserOutlined />} title="Active Departments" value={totalActive} accent="#52c41a" sublabel="Status: Active" />
            </Col>
            <Col xs={12} md={6}>
              <StatCard icon={<ClusterOutlined />} title="Total Teams" value={totalTeams} accent="#13c2c2" sublabel="Across all departments" />
            </Col>
            <Col xs={12} md={6}>
              <StatCard icon={<EnvironmentOutlined />} title="Total Employees" value={totalEmployees} accent="#fa8c16" sublabel="Under these departments" />
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
            <Tag color="processing" style={{ borderRadius: 999, paddingInline: 12, border: "none" }}> Showing <b>{filteredData.length}</b> departments</Tag>
            <Text type="secondary">{totalActive} active · {totalTeams} teams · {totalEmployees} employees</Text>
          </div>

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
                  <Button type="primary" icon={<FilterOutlined />} onClick={() => setIsFilterOpen(true)} style={{ borderRadius: 999, boxShadow: "0 4px 10px rgba(15,23,42,0.05)",}}>
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
                <Text type="secondary" style={{ fontSize: 12 }}>Active filters:</Text>
                {activeFilterTags.map((t) => (
                  <Tag key={t.key} color="blue" closable
                    onClose={(e) => {e.preventDefault(); clearSingleFilter(t.key);}}
                    style={{borderRadius: 999, paddingInline: 10, background: "rgba(47,84,235,0.06)",}}
                  >
                    {t.label}
                  </Tag>
                ))}
                <Button type="link" size="small" icon={<CloseCircleOutlined />} onClick={clearAllFilters} style={{ paddingInline: 0 }}>Clear all</Button>
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
            scroll={{y: util.getTableHeight ? util.getTableHeight() : "calc(100vh - 360px)", x: "max-content"}}
            onChange={(_, __, sorter) => util.handleTableSortingData(sorter, setSort, sort, refetch, qData)}
          />

          <Divider style={{ margin: "14px 0 8px" }} />
          <MyPagination {...{ qData }} total={filteredData.length} onChange={() => {}} DEFAULT_NUQS_CONFIG={DEFAULT_NUQS_CONFIG} />
        </Card>
      )}

      {/* Add / Edit Department Modal */}
      <Modal
        open={isEditModalOpen}
        onCancel={handleModalClose}
        destroyOnHidden
        footer={null}
        centered
        width={900}
        title={null}
        styles={{ body:{padding:0, background:"linear-gradient(135deg,#f3f6ff 0%,#ffffff 35%,#fdf5ff 100%)"}}}
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
                background:"radial-gradient(circle at 30% 20%, #e6f4ff, #d6e4ff)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <ApartmentOutlined style={{ color: "#1d39c4" }} />
            </div>
            <Space direction="vertical" size={0}>
              <Title level={5} style={{ margin: 0 }}>{selectedId ? "Edit Department" : "Create New Department"}</Title>
              <Text type="secondary" style={{ fontSize: 12 }}>Capture department info, HOD & targets in one go.</Text>
            </Space>
          </Space>
        </div>

        <div style={{ padding: 18, paddingTop: 6 }}>
          <DataForm _id={selectedId} onSave={handleModalClose} initialData={data} />
        </div>
      </Modal>

      {/* Filter Drawer */}
      <FilterDrawer open={isFilterOpen} onClose={() => setIsFilterOpen(false)} filters={filters} setFilters={setFilters} onApply={refetch} />
    </div>
  );
};

export default Department;

/*──────────────────── STAT CARD ────────────────────*/
function StatCard({ icon, title, value, accent, sublabel }) {
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
      styles={{
        body:{padding:'10px 12px'}
      }}
    >
      <Space align="center" style={{width: "100%", justifyContent: "space-between",}}>
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
            <Statistic title={title} value={value} formatter={(val) => <CountUp end={Number(val) || 0} />}/>
          </Space>
        </Space>
        {sublabel && (
          <Text type="secondary" style={{ fontSize: 11 }}>{sublabel}</Text>
        )}
      </Space>
    </Card>
  );
}

/*──────────────────── SEARCH BAR ────────────────────*/
function Search({ refetch, search, setSearch }) {
  return (
    <Form onFinish={() => { refetch();}} style={{ width: "100%" }}>
      <Row gutter={8} wrap align="middle">
        <Col span={16}>
          <Input
            placeholder="Search by Department / HOD / Branch"
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
          <Button style={{ borderRadius: "50px" }} type="primary" icon={<SearchOutlined />} htmlType="submit">Search</Button>
        </Col>
      </Row>
    </Form>
  );
}

/*──────────────────── FILTER DRAWER ────────────────────*/
function FilterDrawer({ open, onClose, filters, setFilters, onApply }) {
  const [form] = Form.useForm();

  useEffect(() => {
    const toArray = (str) => (str || "").split(",").map((s) => s.trim()).filter(Boolean);

    form.setFieldsValue({
      ...filters,
      branch: toArray(filters.branch),
      region: toArray(filters.region),
      departmentType: toArray(filters.departmentType),
      hod: toArray(filters.hod),
    });
  }, [filters, form]);

  const handleFinish = (values) => {
    const toString = (val) => Array.isArray(val) ? val.join(",") : val || "";

    const next = {
      ...filters,
      ...values,
      branch: toString(values.branch),
      region: toString(values.region),
      departmentType: toString(values.departmentType),
      hod: toString(values.hod),
    };

    setFilters(next);
    onApply && onApply();
    onClose();
  };

  const handleReset = () => {
    const cleared = {
      branch: "",
      region: "",
      departmentType: "",
      hod: "",
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
          <Flex justify="center" align="center" style={{ width: 32, height: 32, borderRadius: "999px", background: "radial-gradient(circle at 30% 20%, #e6f7ff, #d6e4ff)",}}>
            <FilterOutlined style={{ color: "#096dd9" }} />
          </Flex>
          <Space direction="vertical" size={0}>
            <Text strong>Filters</Text>
            <Text type="secondary" style={{ fontSize: 11 }}>Filter departments by branch, region, type & more</Text>
          </Space>
        </Space>
      }
      placement="right"
      width={360}
      open={open}
      onClose={onClose}
      destroyOnClose
      styles={{
        body:{
          paddingBottom:16,
          background:'linear-gradient(145deg,#f8fbff 0%,#ffffff 40%,#f9f0ff 100%)'
        }
      }}
    >
      <div style={{ marginBottom: 10 }}>
        <Text type="secondary" style={{ fontSize: 11 }}>Presets:</Text>
        <Space wrap size={[6, 6]} style={{ marginTop: 6 }}>
          <Tag color="blue" style={{ borderRadius: 999, cursor: "pointer" }} onClick={() => applyPreset({ status: "active" })}>● Active departments</Tag>
          <Tag color="green" style={{ borderRadius: 999, cursor: "pointer" }} onClick={() => applyPreset({ departmentType: "Sales" })} > Sales only</Tag>
          <Tag color="geekblue" style={{ borderRadius: 999, cursor: "pointer" }} onClick={() => applyPreset({ region: "North" })}> North region</Tag>
          <Tag color="default" style={{ borderRadius: 999, cursor: "pointer" }} onClick={handleReset}>Reset all</Tag>
        </Space>
      </div>

      <Divider style={{ margin: "10px 0 14px" }} />

      <Form layout="vertical" form={form} onFinish={handleFinish}>
        <Row gutter={12}>
          <Col xs={24} md={12}>
            <Form.Item name="branch" label="Branch">
              <Select mode="tags" allowClear placeholder="Branch name(s)" />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item name="region" label="Region">
              <Select mode="tags" allowClear placeholder="Region(s)" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={12}>
          <Col xs={24} md={12}>
            <Form.Item name="departmentType" label="Department Type">
              <Select mode="tags" allowClear placeholder="Sales, Marketing, etc." />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item name="hod" label="HOD">
              <Select mode="tags" allowClear placeholder="HOD name(s)" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={0}>
          <Col span={24}>
            <Form.Item name="status" label="Status">
              <Select allowClear placeholder="Select status"
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
            <Button onClick={handleReset} block icon={<ReloadOutlined />} style={{ borderRadius: 999 }}>Reset</Button>
          </Col>
          <Col span={12}>
            <Button type="primary" htmlType="submit" block icon={<FilterOutlined />} style={{ borderRadius: 999 }}>Apply</Button>
          </Col>
        </Row>
      </Form>
    </Drawer>
  );
}

/*──────────────────── STATUS TOGGLE ────────────────────*/
function ToggleStatus({ data }) {
  const toggleStatus = (checked) => {
    console.log("Toggle status", data.id, "→", checked);
  };

  return ( <Switch checked={!!data?.status} checkedChildren="Active" unCheckedChildren="Inactive" onChange={toggleStatus}/> );
}

/*──────────────────── DATA FORM (ADD / EDIT DEPARTMENT) ────────────────────*/
const DEPT_TYPE_OPTIONS = ["Sales", "Marketing", "Operations", "Support", "HR", "Finance", "CRM"];

function DataForm({ _id, onSave, initialData }) {
  const [form] = Form.useForm();
  const isEdit = !!_id;

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
      });
    }
  }, [_id, initialData, form, isEdit]);

  const handleFinish = (values) => {
    onSave();
  };

  return (
    <div>
      <Form layout="vertical" form={form} onFinish={handleFinish}>
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
          title={
            <Space>
              <Flex justify="center" align="center" style={{ width: 24, height: 24, borderRadius: "999px", background: "#e6f4ff",}}>
                <ApartmentOutlined style={{ fontSize: 14, color: "#1677ff" }} />
              </Flex>
              <span>Basic Information</span>
            </Space>
          }
        >
          <Row gutter={12}>
            <Col xs={24} md={12}>
              <Form.Item name="name" label="Department Name" rules={[{ required: true, message: "Please enter department name" }]}>
                <Input placeholder="e.g. Sales Department" />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item name="departmentCode" label="Department Code" rules={[{ required: true, message: "Please enter department code" }]}>
                <Input placeholder="e.g. SALES-NOIDA" />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item name="image" label="Department Image URL">
                <Input placeholder="https://..." />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item name="departmentType" label="Department Type">
                <Select showSearch placeholder="Select department type"
                  options={DEPT_TYPE_OPTIONS?.map((r) => ({ label: r, value: r }))}
                  optionFilterProp="label"
                  allowClear
                />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* HOD & LOCATION */}
        <Card size="small"
          style={{marginBottom: 12, borderRadius: 14, border: "1px solid #f0f0f0", background: "rgba(255,255,255,0.96)",}}
          styles={{body:{padding:12}}}
          title={
            <Space>
              <Flex justify="center" align="center" style={{ width: 24, height: 24, borderRadius: "999px", background: "#f6ffed"}}>
                <UserOutlined style={{ fontSize: 14, color: "#52c41a" }} />
              </Flex>
              <span>HOD & Location</span>
            </Space>
          }
        >
          <Row gutter={12}>
            <Col xs={24} md={12}>
              <Form.Item name="hod" label="Head of Department" rules={[{ required: true, message: "Please enter HOD name" }]}>
                <Input placeholder="e.g. Rahul Sharma" />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item name="hodEmail" label="HOD Email" rules={[{ type: "email", message: "Please enter a valid email" }]}>
                <Input placeholder="e.g. rahul@company.com" />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item name="hodContact" label="HOD Contact">
                <Input placeholder="e.g. +91 98765 43210" />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item name="branch" label="Branch">
                <Input placeholder="e.g. Noida Branch" />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item name="region" label="Region">
                <Input placeholder="e.g. North, West" />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* SIZE & TARGETS */}
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
                  background: "#fff7e6",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <ClusterOutlined style={{ fontSize: 14, color: "#fa8c16" }} />
              </div>
              <span>Size & Targets</span>
            </Space>
          }
        >
          <Row gutter={12}>
            <Col xs={24} md={8}>
              <Form.Item name="totalTeams" label="Total Teams">
                <InputNumber min={0} style={{ width: "100%" }} />
              </Form.Item>
            </Col>

            <Col xs={24} md={8}>
              <Form.Item name="totalEmployees" label="Total Employees">
                <InputNumber min={0} style={{ width: "100%" }} />
              </Form.Item>
            </Col>

            <Col xs={24} md={8}>
              <Form.Item name="activeEmployees" label="Active Employees">
                <InputNumber min={0} style={{ width: "100%" }} />
              </Form.Item>
            </Col>

            <Col xs={24} md={8}>
              <Form.Item name="monthlyTarget" label="Monthly Target">
                <InputNumber min={0} style={{ width: "100%" }} />
              </Form.Item>
            </Col>

            <Col xs={24} md={8}>
              <Form.Item name="quarterlyTarget" label="Quarterly Target">
                <InputNumber min={0} style={{ width: "100%" }} />
              </Form.Item>
            </Col>

            <Col xs={24} md={8}>
              <Form.Item name="yearlyTarget" label="Yearly Target">
                <InputNumber min={0} style={{ width: "100%" }} />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item name="achievement" label="Achievement %" tooltip="Overall target achievement percentage">
                <InputNumber min={0} max={100} style={{ width: "100%" }} />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item name="performanceRating" label="Performance Rating" tooltip="1 to 5 rating">
                <InputNumber min={1} max={5} step={0.1} style={{ width: "100%" }}/>
              </Form.Item>
            </Col>

            <Col xs={24}>
              <Form.Item name="notes" label="Notes">
                <Input.TextArea rows={3} placeholder="Any extra info about this department (optional)"/>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={12}>
            <Col xs={24} md={8}>
              <Form.Item name="status" label="Status" valuePropName="checked">
                <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* ACTIONS */}
        <Row gutter={8} justify="end" style={{ marginTop: 8 }}>
          <Col xs={12} md={6}>
            <Button block
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
            <Button type="primary" htmlType="submit" block style={{borderRadius: 999}}>{isEdit ? "Save Changes" : "Create Department"}</Button>
          </Col>
        </Row>
      </Form>
    </div>
  );
}
