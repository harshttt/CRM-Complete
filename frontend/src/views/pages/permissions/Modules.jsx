import {Alert, Button, Card, Col, Divider, Flex, Form, Input, Modal, Row, Space, Switch, Table, Tooltip, Typography} from "antd";
import { useEffect, useMemo, useState } from "react";
import util from "../../../utils/util";
import {CloseSquareFilled, EditOutlined, EnvironmentOutlined, ReloadOutlined, SearchOutlined, TeamOutlined} from "@ant-design/icons";
import MyPagination from "../../components/Pagination";

const { Text, Title } = Typography;
const allowURLStateUpdate = true;

const Rights = () => {
  const DEFAULT_NUQS_CONFIG = {
    throttleMs: !allowURLStateUpdate ? Infinity : 0,
  };

  // Access rights (for now keep all true, later you can hook to your ACL)
  const [acc] = useState({
    viewAccess: true,
    addAccess: true,
    editAccess: true,
    deleteAccess: true,
  });

  const [selectedId, setSelectedId] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [qData] = useState({ page: 1, limit: 20 });
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [isError] = useState(false);
  const [error] = useState(null);

  // ====== 1. API DATA STATE ======
  const [permissionsData, setPermissionsData] = useState(null);

  // 🔁 Fetch permissions from your API
  useEffect(() => {
    async function fetchPermissions() {
      try {
        setLoading(true);

        const demoResponse = {
          activity: [
            { id: "69240d9ea64b93c1069886f0", name: "activity:read", action: "read" },
          ],
          dashboard: [
            { id: "692542379f14aaa9a5d4e5bc", name: "dashboard:view", action: "view" },
          ],
          lead: [
            { id: "69240d9ea64b93c1069886e2", name: "lead:assign", action: "assign" },
            { id: "692542309f14aaa9a5d4e598", name: "lead:bulk_upload", action: "bulk_upload" },
            { id: "69240d9ea64b93c1069886de", name: "lead:create", action: "create" },
            { id: "69240d9ea64b93c1069886e1", name: "lead:delete", action: "delete" },
            { id: "69240d9ea64b93c1069886df", name: "lead:read", action: "read" },
            { id: "6925422f9f14aaa9a5d4e58d", name: "lead:reassign", action: "reassign" },
            { id: "69240d9ea64b93c1069886e3",
              name: "lead:stage:update",
              action: "stage_update",
            },
            { id: "69240d9ea64b93c1069886e0", name: "lead:update", action: "update" },
            {
              id: "692542309f14aaa9a5d4e59d",
              name: "lead:view_history",
              action: "view_history",
            },
          ],
          meeting: [
            { id: "69240d9ea64b93c1069886e8", name: "meeting:create", action: "create" },
            { id: "69240d9ea64b93c1069886e9", name: "meeting:read", action: "read" },
            { id: "69240d9ea64b93c1069886ea", name: "meeting:update", action: "update" },
          ],
          note: [
            { id: "69240d9ea64b93c1069886eb", name: "note:add", action: "add" },
            { id: "69240d9ea64b93c1069886ec", name: "note:read", action: "read" },
          ],
          notification: [
            {
              id: "69240d9ea64b93c1069886ef",
              name: "notification:read",
              action: "read",
            },
          ],
          permission: [
            {
              id: "69257beb7575d63672671fa0",
              name: "permission:read",
              action: "read",
            },
            {
              id: "69257beb7575d63672671fa3",
              name: "permission:update",
              action: "update",
            },
          ],
          property: [
            {
              id: "69240d9ea64b93c1069886ed",
              name: "property:create",
              action: "create",
            },
            {
              id: "69240d9ea64b93c1069886ee",
              name: "property:read",
              action: "read",
            },
          ],
          reports: [
            {
              id: "692542389f14aaa9a5d4e5bf",
              name: "reports:view",
              action: "view",
            },
          ],
          role: [
            {
              id: "6925639185ceb0b173c6674b",
              name: "role:create",
              action: "create",
            },
            {
              id: "6925639385ceb0b173c66754",
              name: "role:delete",
              action: "delete",
            },
            { id: "6925639185ceb0b173c6674e", name: "role:read", action: "read" },
            {
              id: "6925639285ceb0b173c66751",
              name: "role:update",
              action: "update",
            },
          ],
          system_activity: [
            {
              id: "692542379f14aaa9a5d4e5b9",
              name: "system_activity:read",
              action: "read",
            },
          ],
          task: [
            {
              id: "69240d9ea64b93c1069886e7",
              name: "task:complete",
              action: "complete",
            },
            {
              id: "69240d9ea64b93c1069886e4",
              name: "task:create",
              action: "create",
            },
            { id: "69240d9ea64b93c1069886e5", name: "task:read", action: "read" },
            {
              id: "69240d9ea64b93c1069886e6",
              name: "task:update",
              action: "update",
            },
          ],
          user: [
            {
              id: "692542359f14aaa9a5d4e5b1",
              name: "user:assign_role",
              action: "assign_role",
            },
            {
              id: "69240d9ea64b93c1069886f1",
              name: "user:create",
              action: "create",
            },
            {
              id: "69240d9ea64b93c1069886f4",
              name: "user:disable",
              action: "disable",
            },
            { id: "69240d9ea64b93c1069886f2", name: "user:read", action: "read" },
            {
              id: "69240d9ea64b93c1069886f3",
              name: "user:update",
              action: "update",
            },
            {
              id: "692542369f14aaa9a5d4e5b4",
              name: "user:view_team",
              action: "view_team",
            },
          ],
        };

        setPermissionsData(demoResponse);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }

    fetchPermissions();
  }, []);

  const refetch = () => {
    // just reuse the same fetch logic if you want
    console.log("Refetch rights...");
  };

  const handleModalClose = () => {
    setSelectedId(null);
    setIsEditModalOpen(false);
  };

  const handleAddNew = () => {
    setSelectedId(null);
    setIsEditModalOpen(true);
  };

  const handleEdit = (id) => {
    setSelectedId(id);
    setIsEditModalOpen(true);
  };

  // ---- helpers ----
  const formatModuleName = (key) => {
    if (!key) return "General";
    return key
      .split("_")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
  };

  const getRightLabel = (name) => {
    if (!name) return "";
    const parts = String(name).split(":");
    const last = parts[parts.length - 1];
    return last
      .split("_")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
  };

  // ====== 2. FLATTEN API DATA -> rights array ======
  const baseData = useMemo(() => {
    if (!permissionsData) return [];
    const rows = [];
    Object.entries(permissionsData).forEach(([moduleKey, rights]) => {
      (rights || []).forEach((r) => {
        rows.push({
          id: r.id,
          moduleKey,
          moduleName: formatModuleName(moduleKey),
          name: r.name, // full key like "lead:assign"
          action: r.action, // assign / read / update / ...
          status: true, // if backend has status later, plug it here
        });
      });
    });
    return rows;
  }, [permissionsData]);

  // ====== 3. SEARCH on moduleName / name / action ======
  const filteredData = useMemo(() => {
    const term = search.toLowerCase().trim();
    if (!term) return baseData;
    return baseData.filter((item) => {
      const moduleName = String(item.moduleName || "").toLowerCase();
      const fullKey = String(item.name || "").toLowerCase();
      const action = String(item.action || "").toLowerCase();
      return (
        moduleName.includes(term) || fullKey.includes(term) || action.includes(term)
      );
    });
  }, [baseData, search]);

  // ====== 4. GROUP by module (for parent table) ======
  const groupedModules = useMemo(() => {
    const map = {};
    filteredData.forEach((r) => {
      const key = r.moduleKey || "general";
      if (!map[key]) {
        map[key] = {
          key,
          moduleKey: key,
          moduleName: r.moduleName || formatModuleName(key),
          rights: [],
        };
      }
      map[key].rights.push(r);
    });

    return Object.values(map).map((m) => ({
      ...m,
      totalRights: m.rights.length,
    }));
  }, [filteredData]);

  /* Inner table columns – individual rights */
  const rightsColumns = [
    {
      title: "S. No.",
      dataIndex: "id",
      key: "id",
      align: "center",
      width: 80,
      render: (_, __, index) => index + 1,
    },
    {
      title: "Right",
      dataIndex: "name",
      key: "name",
      align: "left",
      width: 260,
      render: (v, row) => (
        <Space direction="vertical" size={0}>
          <Text strong>{getRightLabel(v) || "—"}</Text>
          <Text type="secondary" style={{ fontSize: 11 }}>
            {row.name}
          </Text>
        </Space>
      ),
    },
    {
      title: "Action",
      dataIndex: "action",
      key: "action",
      align: "left",
      width: 180,
      render: (v) => (
        <Text code style={{ fontSize: 12 }}>
          {v || "—"}
        </Text>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      align: "center",
      width: 160,
      render: (_, row) => <ToggleStatus data={row} />,
    },
    {
      title: "Actions",
      dataIndex: "id",
      key: "actions",
      align: "center",
      width: 120,
      hidden: !acc.editAccess,
      render: (id) => (
        <Space size="small">
          {acc.editAccess && (
            <Tooltip title="Edit right">
              <Button
                type="text"
                size="small"
                style={{ borderRadius: 999, paddingInline: 10 }}
                onClick={() => handleEdit(id)}
                icon={<EditOutlined />}
              />
            </Tooltip>
          )}
        </Space>
      ),
    },
  ].filter((c) => !c.hidden);

  /* Outer table columns – module groups */
  const moduleColumns = [
    {
      title: "Module",
      dataIndex: "moduleName",
      key: "moduleName",
      align: "left",
      width: 260,
      render: (v, row) => (
        <Space direction="vertical" size={0}>
          <Text strong>{v}</Text>
          <Text type="secondary" style={{ fontSize: 11 }}>
            Key: <Text code>{row.moduleKey}</Text>
          </Text>
        </Space>
      ),
    },
    {
      title: "Total Rights",
      dataIndex: "totalRights",
      key: "totalRights",
      align: "center",
      width: 140,
      render: (v) => (
        <Text strong style={{ color: "#2f54eb" }}>
          {v}
        </Text>
      ),
    },
  ];

  const rowClassName = (_, index) =>
    index % 2 === 0 ? "table-row-light" : "table-row-dark";

  return (
    <div>
      {isError ? (
        <Alert
          message="Error"
          description={error?.message}
          type="error"
          showIcon
        />
      ) : (
        <Card
          size="small"
          bordered={false}
          style={{
            borderRadius: 24,
            maxWidth: "100%",
            margin: "0 auto",
            boxShadow: "0px 18px 45px rgba(15, 23, 42, 0.12)",
            border: "1px solid rgba(255, 255, 255, 0.7)",
            background:
              "linear-gradient(145deg, rgba(255, 255, 255, 0.97), rgba(245, 248, 255, 0.99))",
            backdropFilter: "blur(16px)",
          }}
          styles={{
            header:{
              borderBottom:'none',
              padding:'18px 22px 6px'
            },
            body:{padding:'8px 22px 18px'}
          }}
          title={
            <Space align="center">
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: "999px",
                  background:"conic-gradient(from 210deg, #2f54eb, #9254de, #40a9ff, #2f54eb)",
                  padding: 2,
                }}
              >
                <Flex justify="center" align="center"
                  style={{
                    width: "100%",
                    height: "100%",
                    borderRadius: "999px",
                    background:"radial-gradient(circle at 30% 20%, #f0f5ff, #d6e4ff)",
                  }}
                >
                  <TeamOutlined style={{ color: "#1d39c4" }} />
                </Flex>
              </div>
              <Space direction="vertical" size={0}>
                <Title level={4} style={{ margin: 0 }}>
                  Rights Management
                </Title>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Manage rights & permissions grouped by module from your API.
                </Text>
              </Space>
            </Space>
          }
          extra={
            <Space>
              <Text type="secondary" style={{ fontSize: 12 }}>
                Modules:{" "}
                <Text strong style={{ color: "#2f54eb" }}>
                  {groupedModules.length}
                </Text>{" "}
                · Rights:{" "}
                <Text strong style={{ color: "#2f54eb" }}>
                  {filteredData.length}
                </Text>
              </Text>
              <Tooltip title="Reload">
                <Button
                  icon={<ReloadOutlined />}
                  size="middle"
                  style={{
                    borderRadius: 999,
                    boxShadow: "0 4px 10px rgba(15, 23, 42, 0.06)",
                  }}
                  onClick={refetch}
                />
              </Tooltip>
            </Space>
          }
        >
          {/* Top toolbar / Search + Add */}
          <Card
            size="small"
            bordered={false}
            style={{
              marginBottom: 12,
              borderRadius: 999,
              background:
                "linear-gradient(90deg, rgba(240,245,255,0.9), rgba(255,255,255,0.95))",
              border: "1px solid #f0f2ff",
            }}
            styles={{
              body:{
                paddingInline:12,
                paddingBlock:8
              }
            }}
          >
            <Row gutter={10} align="middle">
              <Col xs={24} md={16}>
                <SearchBar search={search} setSearch={setSearch} />
              </Col>
              <Col xs={24} md={8} style={{ textAlign: "right" }}>
                {acc.addAccess && (
                  <Button
                    type="primary"
                    style={{ borderRadius: 999, paddingInline: 18 }}
                    onClick={handleAddNew}
                  >
                    Add Right
                  </Button>
                )}
              </Col>
            </Row>
          </Card>

          {/* Group-wise Table (Modules as parent, rights as children) */}
          <Table
            bordered={false}
            size="middle"
            rowKey={"moduleKey"}
            pagination={false}
            loading={loading}
            columns={moduleColumns}
            dataSource={groupedModules}
            rowClassName={rowClassName}
            style={{
              borderRadius: 16,
              overflow: "hidden",
              background: "rgba(255, 255, 255, 0.98)",
            }}
            expandable={{
              expandRowByClick: true,
              rowExpandable: (record) => (record.rights || []).length > 0,
              expandedRowRender: (record) => (
                <Table
                  size="small"
                  bordered={false}
                  rowKey="id"
                  columns={rightsColumns}
                  dataSource={record.rights}
                  pagination={false}
                />
              ),
            }}
            scroll={{
              y: util.getTableHeight
                ? util.getTableHeight()
                : "calc(100vh - 360px)",
              x: "max-content",
            }}
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

      {/* Add / Edit Rights Modal */}
      <Modal
        open={isEditModalOpen}
        onCancel={handleModalClose}
        destroyOnClose
        footer={null}
        centered
        width={720}
        title={null}
        styles={{
          padding:0,
          background:"linear-gradient(135deg, #f3f6ff 0%, #ffffff 35%, #fdf5ff 100%)",
        }}
        closeIcon={<CloseSquareFilled />}
      >
        <div
          style={{
            padding: 20,
            paddingBottom: 12,
            borderBottom: "1px solid #f0f0f0",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
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
              <EnvironmentOutlined style={{ color: "#1d39c4" }} />
            </div>
            <Space direction="vertical" size={0}>
              <Title level={4} style={{ margin: 0 }}>
                {selectedId ? "Edit Right" : "Add Right"}
              </Title>
              <Text type="secondary" style={{ fontSize: 13 }}>
                {selectedId
                  ? "Modify the right and save changes."
                  : "Fill in the details to add a new right."}
              </Text>
            </Space>
          </Space>
        </div>

        <div style={{ padding: 18, paddingTop: 6 }}>
          <DataForm _id={selectedId} onSave={handleModalClose} />
        </div>
      </Modal>
    </div>
  );
};

export default Rights;

/* __________________________TOGGLE STATUS ________________ */
const ToggleStatus = ({ data }) => {
  const toggleStatus = (checked) => {
    console.log("Toggle status for right:", data?.id, " => ", checked);
    // call API here if needed
  };

  return (
    <Switch
      checked={!!data?.status}
      checkedChildren={"Active"}
      unCheckedChildren={"Inactive"}
      onChange={toggleStatus}
    />
  );
};

/*──────────────────── SEARCH BAR ────────────────────*/
const SearchBar = ({ search, setSearch }) => {
  return (
    <Input
      placeholder="Search by module, right key or action"
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      allowClear
      prefix={<SearchOutlined style={{ color: "#bfbfbf" }} />}
      style={{
        borderRadius: 999,
        paddingInline: 16,
        paddingBlock: 8,
        boxShadow: "0 4px 10px rgba(15,23,42,0.06)",
        border: "1px solid #dde4ff",
      }}
    />
  );
};

/*──────────────────── DATA FORM ────────────────────*/
const DataForm = ({ _id, onSave }) => {
  const [form] = Form.useForm();
  const isEdit = Boolean(_id);

  useEffect(() => {
    if (isEdit) {
      // load single right details from API here if needed
    } else {
      form.resetFields();
    }
  }, [_id, isEdit, form]);

  const handleFinish = (values) => {
    const payload = {
      ...values,
      id: _id || Date.now(),
    };
    console.log(isEdit ? "Update right:" : "Create right:", payload);
    onSave();
  };

  return (
    <Form layout="vertical" form={form} onFinish={handleFinish}>
      <Card
        size="small"
        style={{
          marginBottom: 12,
          borderRadius: 14,
          border: "1px solid #f0f0f0",
          background: "rgba(255, 255, 255, 0.96)",
        }}
        styles={{
          body:{padding:12}
        }}
        title={
          <Space>
            <div
              style={{
                width: 24,
                height: 24,
                borderRadius: "999px",
                background: "#e6f4ff",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <EnvironmentOutlined style={{ fontSize: 14, color: "#1677ff" }} />
            </div>
            <span>Right Information</span>
          </Space>
        }
      >
        <Row gutter={12}>
          <Col xs={24} md={12}>
            <Form.Item
              name="moduleKey"
              label="Module Key"
              rules={[{ required: true, message: "Please enter module key" }]}
              extra={
                <Text type="secondary" style={{ fontSize: 11 }}>
                  e.g. <b>lead</b>, <b>user</b>, <b>task</b>
                </Text>
              }
            >
              <Input placeholder="lead / user / task / ..." />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item
              name="name"
              label="Right Key (name)"
              rules={[{ required: true, message: "Please enter right key" }]}
              extra={
                <Text type="secondary" style={{ fontSize: 11 }}>
                  e.g. <b>lead:assign</b>, <b>user:create</b>
                </Text>
              }
            >
              <Input placeholder="lead:assign" />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item
              name="action"
              label="Action"
              rules={[{ required: true, message: "Please enter action" }]}
              extra={
                <Text type="secondary" style={{ fontSize: 11 }}>
                  e.g. <b>read</b>, <b>create</b>, <b>update</b>
                </Text>
              }
            >
              <Input placeholder="read / create / update / ..." />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item
              name="status"
              label="Status"
              valuePropName="checked"
              initialValue={true}
            >
              <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
            </Form.Item>
          </Col>
        </Row>
      </Card>

      <Row gutter={8} justify="end">
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
            {isEdit ? "Save Changes" : "Add Right"}
          </Button>
        </Col>
      </Row>
    </Form>
  );
};
