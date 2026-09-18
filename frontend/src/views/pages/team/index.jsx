import { parseAsString, useQueryState, useQueryStates} from "nuqs";
import { getSortingStateParser } from "../../../utils/parsers";
import { useState, useEffect, useMemo } from "react";
import { Alert, Button, Card, Col, Form, Input, Modal, Popconfirm, Row, Space, Switch, Table, Tag, Typography, Tooltip, Divider, Statistic, Flex} from "antd";
import { DeleteOutlined, EditOutlined, PlusOutlined, SearchOutlined, TeamOutlined, UserOutlined, ThunderboltOutlined, AimOutlined, CloseCircleOutlined,  ReloadOutlined} from "@ant-design/icons";
import util from "../../../utils/util";
import MyPagination from "../../components/Pagination";
import { dummyUsers } from "../../../dummyData/users";
import CountUp from "react-countup";

const { Text, Title } = Typography;

const allowURLStateUpdate = true;

const Teams = () => {
  const DEFAULT_NUQS_CONFIG = {
    throttleMs: !allowURLStateUpdate ? Infinity : 0,
  };

  // ---------- Query States ----------
  const sorting_cols = [
    "id",
    "teamCode",
    "teamName",
    "teamLead",
    "branch",
    "department",
    "region",
    "totalMembers",
    "activeMembers",
    "monthlyTarget",
    "quarterlyTarget",
    "yearlyTarget",
    "totalLeads",
    "closedDeals",
    "achievement",
    "status",
  ];

  const [sort, setSort] = useQueryState(
    "team_sort",
    getSortingStateParser(sorting_cols)
      .withDefault([{ column: "id", desc: 1 }])
      .withOptions(DEFAULT_NUQS_CONFIG)
  );

  const [search, setSearch] = useQueryStates(
    { key: parseAsString.withDefault("") },
    { urlKeys: { key: "team_search_term" }, ...DEFAULT_NUQS_CONFIG }
  );

  // ---------- Local States ----------
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [data, setData] = useState(null);

  const qData = { page: 1, limit: 20 }; // placeholder

  // Fake placeholders (replace with real API)
  const isError = false;
  const error = null;
  const refetch = () => {};
  const deleteData = () => {};

  /* ---------- Fake Team Data from dummyUsers (for UI demo) ---------- */
  const teamData = useMemo(
    () =>
      (dummyUsers || [])?.map((u, index) => ({
        id: u.id ?? index + 1,
        teamCode: u.teamCode || `TEAM-${index + 1}`,
        teamName: u.teamName || u.team || `Team ${index + 1}`,
        teamLead: u.name || `Leader ${index + 1}`,
        leadEmail: u.email,
        leadContact: u.phone || "+91 98765 43210",
        branch: u.branch || "Main Branch",
        department: u.department || "Sales",
        region: u.city || "West",
        totalMembers: u.totalMembers ?? (Math.floor(Math.random() * 8) + 4),
        activeMembers: u.activeMembers ?? (Math.floor(Math.random() * 6) + 3),
        specialization:
          u.specialization || "Residential Sales & Follow-ups",
        monthlyTarget: u.monthlyTarget ?? 25 + index,
        quarterlyTarget: u.quarterlyTarget ?? 75 + index * 2,
        yearlyTarget: u.yearlyTarget ?? 300 + index * 5,
        totalLeads: u.totalLeads ?? (Math.floor(Math.random() * 80) + 20),
        closedDeals: u.closedDeals ?? (Math.floor(Math.random() * 30) + 5),
        achievement: u.achievement ?? (Math.floor(Math.random() * 30) + 70),
        performance: u.performance || (Math.random() > 0.6 ? "High" : Math.random() > 0.4 ? "Medium" : "Low"),
        created_at: u.created_at || "2025-01-01 10:00 AM",
        updated_at: u.updated_at || "2025-03-15 04:30 PM",
        status: u.status ?? true,
      })),
    []
  );

  /* ---------- Filtered Data ---------- */
  const searchTerm = (search.key || "").toLowerCase().trim();

  const filteredTeams = teamData.filter((t) => {
    if (!searchTerm) return true;
    const haystack = `${t.teamName} ${t.teamCode} ${t.teamLead} ${t.branch} ${t.department}`.toLowerCase();
    return haystack.includes(searchTerm);
  });

  const totalTeams = filteredTeams.length;
  const activeTeams = filteredTeams.filter((t) => t.status).length;
  const totalMembers = filteredTeams.reduce(
    (sum, t) => sum + (Number(t.totalMembers) || 0),
    0
  );
  const avgAchievement = filteredTeams.length > 0 ? Math.round(filteredTeams.reduce( (sum, t) => sum + (Number(t.achievement) || 0), 0) / filteredTeams.length): 0;

  // ---------- Handlers ----------
  const handleEdit = (id) => {
    const team = filteredTeams.find((t) => t.id === id);
    setSelectedId(id);
    setData(team || null);
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
      title: "Team",
      dataIndex: "teamName",
      width: 260,
      fixed: "left",
      render: (_, row) => (
        <Space direction="vertical" size={0} style={{ textAlign: "left" }}>
          <Space>
            <TeamOutlined style={{ color: "#2f54eb" }} />
            <Text strong>{row.teamName}</Text>
          </Space>
          <Space size={4} wrap>
            <Tag color="processing" style={{ borderRadius: 999, fontSize: 11, paddingInline: 10 }}>{row.teamCode}</Tag>
            <Tag color="geekblue" style={{ borderRadius: 999, fontSize: 11, paddingInline: 10 }}>{row.department}</Tag>
          </Space>
        </Space>
      ),
    },
    {
      title: "Team Lead",
      dataIndex: "teamLead",
      align: "center",
      width: 200,
      render: (_, row) => (
        <Space direction="vertical" size={0}>
          <Space>
            <UserOutlined style={{ color: "#722ed1" }} />
            <Text strong>{row.teamLead}</Text>
          </Space>
          <Text type="secondary" style={{ fontSize: 11 }}>{row.leadEmail}</Text>
        </Space>
      ),
    },
    {
      title: "Lead Contact",
      dataIndex: "leadContact",
      align: "center",
      width: 130,
    },
    {
      title: "Location",
      dataIndex: "branch",
      align: "center",
      width: 200,
      render: (_, row) => (
        <Space direction="vertical" size={0}>
          <Text>{row.branch}</Text>
          <Text type="secondary" style={{ fontSize: 11 }}>{row.region}</Text>
        </Space>
      ),
    },
    {
      title: "Members",
      dataIndex: "totalMembers",
      align: "center",
      width: 150,
      render: (_, row) => (
        <Space direction="vertical" size={0}>
          <Tag color="blue" style={{ borderRadius: 999 }}>{row.totalMembers} total</Tag>
          <Text type="secondary" style={{ fontSize: 11 }}>{row.activeMembers} active</Text>
        </Space>
      ),
    },
    {
      title: "Specialization",
      dataIndex: "specialization",
      align: "center",
      width: 200,
      ellipsis: true,
      render: (v) => (
        <Tooltip title={v}>
          <Text type="secondary" style={{ fontSize: 12 }}>{v}</Text>
        </Tooltip>
      ),
    },
    {
      title: "Targets (M/Q/Y)",
      dataIndex: "monthlyTarget",
      align: "center",
      width: 190,
      render: (_, row) => (
        <Space direction="vertical" size={0}>
          <Text style={{ fontSize: 12 }}>
            <b>M:</b> {row.monthlyTarget} · <b>Q:</b> {row.quarterlyTarget}
          </Text>
          <Text type="secondary" style={{ fontSize: 11 }}>
            <b>Y:</b> {row.yearlyTarget}
          </Text>
        </Space>
      ),
    },
    {
      title: "Pipeline",
      dataIndex: "totalLeads",
      align: "center",
      width: 170,
      render: (_, row) => (
        <Space direction="vertical" size={0}>
          <Text style={{ fontSize: 12 }}> Leads: <b>{row.totalLeads}</b> </Text>
          <Text type="secondary" style={{ fontSize: 11 }}> Deals closed: <b>{row.closedDeals}</b></Text>
        </Space>
      ),
    },
    {
      title: "Achievement",
      dataIndex: "achievement",
      align: "center",
      width: 130,
      render: (v) => {
        let color = "default";
        if (v >= 100) color = "green";
        else if (v >= 85) color = "blue";
        else if (v >= 70) color = "gold";
        else color = "red";
        return ( <Tag color={color} style={{ borderRadius: 999 }}>{v}% </Tag>);
      },
    },
    {
      title: "Performance",
      dataIndex: "performance",
      align: "center",
      width: 140,
      render: (v) => {
        const val = (v || "").toLowerCase();
        let color = "default";
        if (val === "high") color = "green";
        else if (val === "medium") color = "gold";
        else if (val === "low") color = "red";
        return (<Tag color={color} style={{ borderRadius: 999 }}> {v}</Tag>);
      },
    },
    {
      title: "Created / Updated",
      dataIndex: "created_at",
      align: "center",
      width: 210,
      render: (_, row) => (
        <Space direction="vertical" size={0}>
          <Text style={{ fontSize: 11 }}> Created: {row.created_at}</Text>
          <Text type="secondary" style={{ fontSize: 11 }}> Updated: {row.updated_at}</Text>
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
          <Tooltip title="Edit team">
            <Button size="small" type="text" style={{ borderRadius: 999 }} icon={<EditOutlined />} onClick={() => handleEdit(v)}/>
          </Tooltip>
          <Popconfirm title="Are you sure to delete this team?" okText="Yes" cancelText="No" onConfirm={() => handleDelete(v)}>
            <Tooltip title="Delete team">
              <Button size="small" type="text" dange style={{ borderRadius: 999 }} icon={<DeleteOutlined />}/>
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
      sorter: isSortable ? haveMultipleSort ? { multiple: i + 1 } : true: false,
      defaultSortOrder: sortConfig ? sortConfig.desc === 1 ? "descend" : "ascend": undefined,
      responsive: ["xs", "sm", "md", "lg", "xl"],
    };
  });

  const rowClassName = (_, index) => index % 2 === 0 ? "team-row-even" : "team-row-odd";

  // ---------- Render ----------
  return (
    <div
    >
      {isError ? (<Alert message="Error" description={error?.message} type="error" showIcon />) : (
        <Card
          size="small"
          bordered={false}
          style={{
            borderRadius: 24,
            maxWidth: "100%",
            margin: "0 auto",
            boxShadow: "0 18px 45px rgba(15,23,42,0.12)",
            border: "1px solid rgba(255,255,255,0.7)",
            background: "linear-gradient(145deg,rgba(255,255,255,0.97),rgba(245,248,255,0.99))",
            backdropFilter: "blur(16px)",
          }}
          styles={{
            header:{borderBottom:'none', padding:'18px 22px 6px'},
            body:{padding:'8px 22px 18px'}
          }}
          title={
            <Space align="center">
              <div style={{ width: 44, height: 44, borderRadius: "999px", background: "conic-gradient(from 210deg, #2f54eb, #13c2c2, #40a9ff, #2f54eb)", padding: 2}}>
                <Flex justify="center" align="center" style={{ width: "100%", height: "100%", borderRadius: "999px", background: "radial-gradient(circle at 30% 20%, #f0f5ff, #d6e4ff)",}}>
                  <TeamOutlined style={{ color: "#1d39c4" }} />
                </Flex>
              </div>
              <Space direction="vertical" size={0}>
                <Title level={4} style={{ margin: 0 }}>Teams Management</Title>
                <Text type="secondary" style={{ fontSize: 12 }}>Monitor sales teams, leads pipeline & target achievements.</Text>
              </Space>
            </Space>
          }
          extra={
            <Space>
              <Tooltip title="Refresh teams">
                <Button icon={<ReloadOutlined />} size="middle" style={{ borderRadius: 999, boxShadow: "0 4px 10px rgba(15,23,42,0.06)",}} onClick={refetch} />
              </Tooltip>
              <Button icon={<PlusOutlined />} type="primary" size="middle" style={{ borderRadius: 999, paddingInline: 18,}} onClick={() => setIsEditModalOpen(true)}> Add Team</Button>
            </Space>
          }
        >
          {/* Stats strip */}
          <Row gutter={14} style={{ marginBottom: 12 }}>
            <Col xs={12} md={6}>
              <StatCard icon={<TeamOutlined />} title="Total Teams" value={totalTeams} accent="#2f54eb" sublabel="Across all branches" />
            </Col>
            <Col xs={12} md={6}>
              <StatCard icon={<ThunderboltOutlined />} title="Active Teams" value={activeTeams} accent="#52c41a" sublabel="Currently performing" />
            </Col>
            <Col xs={12} md={6}>
              <StatCard icon={<UserOutlined />} title="Total Members" value={totalMembers} accent="#13c2c2" sublabel="Team headcount"/>
            </Col>
            <Col xs={12} md={6}>
              <StatCard icon={<AimOutlined />} title="Avg Achievement" value={`${avgAchievement}%`} accent="#fa8c16" sublabel="Target completion" />
            </Col>
          </Row>

          {/* Summary pill */}
          <Flex justify="center" align="center" gap={8} wrap style={{ marginBottom: 10, fontSize: 12, color: "#8c8c8c",}}>
            <Tag color="processing" style={{ borderRadius: 999, paddingInline: 12, border: "none" }}> Showing <b>{filteredTeams.length}</b> teams</Tag>
            <Text type="secondary">
              {activeTeams} active · {totalMembers} members · Avg achievement{" "}
              {avgAchievement}%
            </Text>
          </Flex>

          {/* Search bar */}
          <div
            style={{display: "flex",flexDirection: "column",gap: 10,marginBottom: 10,borderRadius: 999, padding: 8, paddingInline: 12,
              background:"linear-gradient(90deg,rgba(240,245,255,0.9),rgba(255,255,255,0.95))", border: "1px solid #f0f2ff",
            }}
          >
            <div style={{flex:1, minWidth: 260, maxWidth: 560}}>
              <Search search={search} setSearch={setSearch} refetch={refetch} />
            </div>
          </div>

          {/* Table */}
          <Table
            bordered={false}
            size="middle"
            rowKey="id"
            pagination={false}
            loading={false}
            columns={columns}
            dataSource={filteredTeams}
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
            total={qData.total}
            onChange={() => {}}
            DEFAULT_NUQS_CONFIG={DEFAULT_NUQS_CONFIG}
          />
        </Card>
      )}

      {/* Add / Edit Team Modal */}
      <Modal
        open={isEditModalOpen}
        onCancel={handleModalClose}
        destroyOnClose
        footer={null}
        centered
        width={900}
        title={null}
        styles={{
          body:{
            padding:0,
            background:'linear-gradient(135deg, #f3f6ff 0%, #ffffff 35%, #fdf5ff 100%)'
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
              <TeamOutlined style={{ color: "#1d39c4" }} />
            </div>
            <Space direction="vertical" size={0}>
              <Title level={5} style={{ margin: 0 }}>
                {selectedId ? "Edit Team" : "Create New Team"}
              </Title>
              <Text type="secondary" style={{ fontSize: 12 }}>
                Define team lead, structure, targets and performance settings.
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
          <DataForm _id={selectedId} onSave={handleModalClose} initialData={data} />
        </div>
      </Modal>
    </div>
  );
};

export default Teams;

/*──────────── STAT CARD ────────────*/
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
      styles={{padding:'10px 12px'}}
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
            <Statistic title={title} value={value} formatter={(value)=><CountUp end={value}/>}/>
            {/* <Text type="secondary" style={{ fontSize: 11 }}>
              {title}
            </Text>
            <Text strong style={{ fontSize: 18 }}>
              {value}
            </Text> */}
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
            placeholder="Search by Team name / code / lead / branch"
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

/*──────────── STATUS TOGGLE ────────────*/
function ToggleStatus({ data }) {
  const toggleStatus = () => {
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

/*──────────── DATA FORM (ADD / EDIT TEAM) ────────────*/
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
        totalMembers: 6,
        activeMembers: 5,
        achievement: 80,
      });
    }
  }, [_id, initialData, form, isEdit]);

  const onFinish = (values) => {
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
        styles={{padding:12}}
      >
        <Row gutter={12}>
          <Col xs={24} md={12}>
            <Form.Item
              name="teamName"
              label="Team Name"
              rules={[{ required: true, message: "Please enter team name" }]}
            >
              <Input placeholder="e.g. West Zone Closers" />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item
              name="teamCode"
              label="Team Code"
              rules={[{ required: true, message: "Please enter team code" }]}
            >
              <Input placeholder="e.g. TEAM_WEST_01" />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item
              name="teamLead"
              label="Team Lead"
              rules={[{ required: true, message: "Please enter team lead name" }]}
            >
              <Input placeholder="e.g. John Doe" />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item
              name="leadEmail"
              label="Lead Email"
              rules={[{ type: "email", message: "Enter a valid email" }]}
            >
              <Input placeholder="e.g. john.doe@company.com" />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item
              name="leadContact"
              label="Lead Contact"
            >
              <Input placeholder="e.g. +91 98765 43210" />
            </Form.Item>
          </Col>

          <Col xs={24}>
            <Form.Item name="specialization" label="Specialization">
              <Input.TextArea
                rows={3}
                placeholder="e.g. Residential leads in West Zone, luxury segment, site visits, etc."
              />
            </Form.Item>
          </Col>
        </Row>
      </Card>

      {/* STRUCTURE & LOCATION */}
      <Card
        size="small"
        style={{
          marginBottom: 12,
          borderRadius: 14,
          border: "1px solid #f0f0f0",
          background: "rgba(255,255,255,0.96)",
        }}
        styles={{body:{padding:12}}}
      >
        <Row gutter={12}>
          <Col xs={24} md={8}>
            <Form.Item name="branch" label="Branch">
              <Input placeholder="e.g. Mumbai HQ" />
            </Form.Item>
          </Col>

          <Col xs={24} md={8}>
            <Form.Item name="department" label="Department">
              <Input placeholder="e.g. Sales" />
            </Form.Item>
          </Col>

          <Col xs={24} md={8}>
            <Form.Item name="region" label="Region">
              <Input placeholder="e.g. West Zone" />
            </Form.Item>
          </Col>

          <Col xs={24} md={8}>
            <Form.Item name="totalMembers" label="Total Members">
              <Input type="number" placeholder="e.g. 8" />
            </Form.Item>
          </Col>

          <Col xs={24} md={8}>
            <Form.Item name="activeMembers" label="Active Members">
              <Input type="number" placeholder="e.g. 7" />
            </Form.Item>
          </Col>

          <Col xs={24} md={8}>
            <Form.Item
              name="status"
              label="Team Status"
              valuePropName="checked"
            >
              <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
            </Form.Item>
          </Col>
        </Row>
      </Card>

      {/* TARGETS & PERFORMANCE */}
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
          <Col xs={24} md={8}>
            <Form.Item name="monthlyTarget" label="Monthly Target">
              <Input type="number" placeholder="e.g. 30" />
            </Form.Item>
          </Col>

          <Col xs={24} md={8}>
            <Form.Item name="quarterlyTarget" label="Quarterly Target">
              <Input type="number" placeholder="e.g. 90" />
            </Form.Item>
          </Col>

          <Col xs={24} md={8}>
            <Form.Item name="yearlyTarget" label="Yearly Target">
              <Input type="number" placeholder="e.g. 360" />
            </Form.Item>
          </Col>

          <Col xs={24} md={8}>
            <Form.Item name="totalLeads" label="Total Leads">
              <Input type="number" placeholder="e.g. 120" />
            </Form.Item>
          </Col>

          <Col xs={24} md={8}>
            <Form.Item name="closedDeals" label="Closed Deals">
              <Input type="number" placeholder="e.g. 35" />
            </Form.Item>
          </Col>

          <Col xs={24} md={8}>
            <Form.Item name="achievement" label="Achievement %">
              <Input type="number" placeholder="e.g. 85" />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item name="created_at" label="Created At">
              <Input placeholder="e.g. 2025-01-01 10:00 AM" />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
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
            {isEdit ? "Save Changes" : "Create Team"}
          </Button>
        </Col>
      </Row>
    </Form>
  );
}
