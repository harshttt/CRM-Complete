import {Alert, Button, Card, Col, Divider, Flex, Form, Input, Modal, Row, Space, Switch, Table, Tooltip, Typography} from "antd";
import { useEffect, useMemo, useState } from "react";
import util from "../../../utils/util";
import { CloseSquareFilled, EnvironmentOutlined, ReloadOutlined, TeamOutlined} from "@ant-design/icons";
import MyPagination from "../../components/Pagination";
import { usePermissionList } from "../../../api-hooks/permission";
import { parseAsString, useQueryStates } from "nuqs";

const { Text, Title } = Typography;
const allowURLStateUpdate = true;

const Permissions = () => {
  const DEFAULT_NUQS_CONFIG = {throttleMs: !allowURLStateUpdate ? Infinity : 0};
  const permissionPermissions = util.getModulePermissions('permission') || [];

  const [acc] = useState({
    viewAccess: permissionPermissions.includes('read'),
    addAccess: permissionPermissions.includes('add'),
    editAccess: permissionPermissions.includes('update'),
    deleteAccess: permissionPermissions.includes('delete'),
  });

  const { data: apiData, isFetching:loading, isError, error, refetch, refetchWithQuery } = usePermissionList({qData:{page:1,limit:20}});
  const qData = apiData?.qData;

  const [selectedId, setSelectedId] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [search, setSearch] = useState("");
  // const [search, setSearch] = useQueryStates({q:parseAsString.withDefault(null)}, {urlKeys:{q:'q'}, ...DEFAULT_NUQS_CONFIG});

  const rawModules = useMemo(() => {
    if (!apiData) return [];

    // CASE 1: already in desired shape: [{ module, permissions }]
    if (Array.isArray(apiData)) {
      return apiData;
    }

    // CASE 2: wrapped like { data: { activity:[...], lead:[...], ... } }
    if (apiData?.data && !Array.isArray(apiData.data)) {
      return Object.entries(apiData.data).map(([module, permissions]) => ({
        module,
        permissions: permissions || [],
      }));
    }

    // CASE 3: { data: [...] }
    if (Array.isArray(apiData?.data)) {
      return apiData.data;
    }

    return [];
  }, [apiData]);

  // Flatten all permissions for search + total count
  const allPermissions = useMemo(
    () =>
      rawModules.flatMap((m) =>
        (m.permissions || []).map((p) => ({
          id: p.id,
          name: p.name,
          action: p.action,
          module: m.module,
          status: p.status ?? true,
        }))
      ),
    [rawModules]
  );

  // 🔍 search on name, action, module
  const filteredPermissions = useMemo(() => {
    const term = search.toLowerCase().trim();
    if (!term) return allPermissions;

    return allPermissions.filter((perm) => {
      const name = String(perm.name || "").toLowerCase();
      const action = String(perm.action || "").toLowerCase();
      const module = String(perm.module || "").toLowerCase();
      return ( name.includes(term) || action.includes(term) || module.includes(term) );
    });
  }, [allPermissions, search]);

  // Group filtered permissions by module for outer table
  const groupedModules = useMemo(() => {
    const map = {};

    filteredPermissions.forEach((perm) => {
      const key = perm.module || "general";
      if (!map[key]) {
        map[key] = { module: key, rights: [] };
      }
      map[key].rights.push(perm);
    });

    return Object.values(map).map((item) => ({
      key: item.module,
      moduleName: item.module,
      totalRights: item.rights.length,
      rights: item.rights,
    }));
  }, [filteredPermissions]);

  const handleModalClose = () => {
    setSelectedId(null);
    setIsEditModalOpen(false);
  };

  // const handleAddNew = () => {
  //   setSelectedId(null);
  //   setIsEditModalOpen(true);
  // };

  // const handleEdit = (id) => {
  //   setSelectedId(id);
  //   setIsEditModalOpen(true);
  // };

  /* Inner table columns – individual permissions */
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
      title: "Permission Name",
      dataIndex: "name",
      key: "name",
      align: "left",
      width: 260,
      render: (v) => <Text strong>{v || "—"}</Text>,
    },
    {
      title: "Action",
      dataIndex: "action",
      key: "action",
      align: "left",
      width: 160,
      render: (v) => ( <Text code style={{ fontSize: 12 }}> {v || "—"}</Text> ),
    },
    // {
    //   title: "Status",
    //   dataIndex: "status",
    //   key: "status",
    //   align: "center",
    //   width: 140,
    //   render: (_, row) => <ToggleStatus data={row} />,
    // },
    // {
    //   title: "Actions",
    //   dataIndex: "id",
    //   key: "actions",
    //   align: "center",
    //   width: 120,
    //   hidden: !acc.editAccess,
    //   render: (id) => (
    //     <Space size="small">
    //       {acc.editAccess && (
    //         <Tooltip title="Edit permission">
    //           <Button
    //             type="text"
    //             size="small"
    //             style={{ borderRadius: 999, paddingInline: 10 }}
    //             onClick={() => handleEdit(id)}
    //             icon={<EditOutlined />}
    //           />
    //         </Tooltip>
    //       )}
    //     </Space>
    //   ),
    // },
  ].filter((c) => !c.hidden);

  /* Outer table columns – module groups */
  const moduleColumns = [
    {
      title: "Module",
      dataIndex: "moduleName",
      key: "moduleName",
      align: "left",
      width: 260,
      render: (v) => (
        <Space direction="vertical" size={0}>
          <Text strong>{v}</Text>
          <Text type="secondary" style={{ fontSize: 11 }}>Permissions grouped under this module</Text>
        </Space>
      ),
    },
    {
      title: "Total Permissions",
      dataIndex: "totalRights",
      key: "totalRights",
      align: "center",
      width: 160,
      render: (v) => ( <Text strong style={{ color: "#2f54eb" }}>{v}</Text>),
    },
  ];

  return (
    <div>
      {isError ? (
        <Alert message="Error" description={error?.message} type="error" showIcon/>
      ) : !acc.viewAccess ? (<Alert message='Access Denied' description={`You don't have the permission to view this page`} type="error" showIcon/>) : (
        <Card size="small" bordered={false} className="card-style"
          // style={{borderRadius: 24, maxWidth: "100%", margin: "0 auto", boxShadow: "0px 18px 45px rgba(15, 23, 42, 0.12)", backdropFilter:'blur(16px)',
          //   border: "1px solid rgba(255, 255, 255, 0.7)", background: "linear-gradient(145deg, rgba(255, 255, 255, 0.97), rgba(245, 248, 255, 0.99))",
          // }}
          styles={{header:{borderBottom:'none', padding:'10px'}, body:{padding:'10px'}}}
          title={
            <Space align="center">
              <div style={{width: 44, height: 44, borderRadius: "999px", background:"conic-gradient(from 210deg, #2f54eb, #9254de, #40a9ff, #2f54eb)",padding: 2}}>
                <Flex align="center" justify="center" style={{ width: "100%",height: "100%", borderRadius: "999px",background: "radial-gradient(circle at 30% 20%, #f0f5ff, #d6e4ff)"}}>
                  <TeamOutlined style={{ color: "#1d39c4" }} />
                </Flex>
              </div>
              <Space direction="vertical" size={0}>
                <Title level={4} style={{ margin: 0 }}>Permission Management</Title>
                <Text type="secondary" style={{ fontSize: 12 }}> Manage permissions grouped by module.</Text>
              </Space>
            </Space>
          }
          extra={
            <Space>
              <Text type="secondary" style={{ fontSize: 12 }}>
                Modules:{" "}
                <Text strong style={{ color: "#2f54eb" }}> {groupedModules.length}</Text>{" "} · Permissions:{" "}
                <Text strong style={{ color: "#2f54eb" }}> {filteredPermissions.length}</Text>
              </Text>
              <Tooltip title="Reload">
                <Button icon={<ReloadOutlined />} size="middle" style={{borderRadius: 999, boxShadow: "0 4px 10px rgba(15, 23, 42, 0.06)"}} onClick={refetch} loading={loading}/>
              </Tooltip>
            </Space>
          }
        >
          {/* Top toolbar / Search + Add */}
          <Card size="small" bordered={false}
            style={{marginBottom: 12, borderRadius: 999, background: "linear-gradient(90deg, rgba(240,245,255,0.9), rgba(255,255,255,0.95))", border: "1px solid #f0f2ff",}}
            styles={{body:{paddingInline:12, paddingBlock:8}}}
          >
            <Row gutter={10} align="middle">
              <Col xs={24} md={10}>
                <SearchBar search={search} setSearch={setSearch} />
              </Col>
              {/* <Col xs={24} md={8} style={{ textAlign: "right" }}>
                {acc.addAccess && (
                  <Button
                    type="primary"
                    style={{ borderRadius: 999, paddingInline: 18 }}
                    onClick={handleAddNew}
                  >
                    Add Permission
                  </Button>
                )}
              </Col> */}
            </Row>
          </Card>

          {/* Group-wise Table (Modules as parent, permissions as children) */}
          <Table
            size="middle"
            rowKey={"key"}
            pagination={false}
            loading={loading}
            columns={moduleColumns}
            dataSource={groupedModules}
            expandable={{
              expandRowByClick: true,
              rowExpandable: (record) => (record.rights || []).length > 0,
              expandedRowRender: (record) => ( <Table size="small" bordered={false} rowKey="id" columns={rightsColumns} dataSource={record.rights} pagination={false}/>),
            }}
            scroll={{
              y: util.getTableHeight ? util.getTableHeight() : "calc(100vh - 360px)",
              x: "max-content",
            }}
          />

          <Divider style={{ margin: "14px 0 8px" }} />
          <MyPagination {...{ qData }} total={qData?.total} onChange={refetchWithQuery} DEFAULT_NUQS_CONFIG={DEFAULT_NUQS_CONFIG} />
        </Card>
      )}

      {/* Add / Edit Permission Modal */}
      <Modal open={isEditModalOpen} onCancel={handleModalClose} destroyOnHidden footer={null} centered width={720} title={null} 
        styles={{body:{ padding:0, background:"linear-gradient(135deg, #f3f6ff 0%, #ffffff 35%, #fdf5ff 100%)"}}}
        closeIcon={<CloseSquareFilled />}
      >
        <Flex justify="center" align="center" style={{ padding: 20, paddingBottom: 12, borderBottom: "1px solid #f0f0f0", gap: 8}}>
          <Space align="center">
            <Flex justify="center" align="center" style={{width: 36, height: 36, borderRadius: "999px", background:"radial-gradient(circle at 30% 20%, #e6f4ff, #d6e4ff)"}}>
              <EnvironmentOutlined style={{ color: "#1d39c4" }} />
            </Flex>
            <Space direction="vertical" size={0}>
              <Title level={4} style={{ margin: 0 }}>{selectedId ? "Edit Permission" : "Add Permission"}</Title>
              <Text type="secondary" style={{ fontSize: 13 }}>{selectedId ? "Modify the permission and save changes." : "Fill in the details to add a new permission."}</Text>
            </Space>
          </Space>
        </Flex>

        <div style={{ padding: 18, paddingTop: 6 }}>
          <DataForm _id={selectedId} onSave={handleModalClose} />
        </div>
      </Modal>
    </div>
  );
};

export default Permissions;


/*──────────────────── SEARCH BAR ────────────────────*/
const SearchBar = ({search, setSearch}) => {
  return (
    <div>
    <Input placeholder="Search by permission name, action, or module" value={search} onChange={(e) => setSearch(e.target.value)} allowClear
      style={{borderRadius: 999, paddingInline: 16, paddingBlock: 8, boxShadow: "0 4px 10px rgba(15,23,42,0.06)", border: "1px solid #dde4ff",}}
    />
    </div>
  );
};

/*──────────────────── DATA FORM ────────────────────*/
const DataForm = ({ _id, onSave }) => {
  const [form] = Form.useForm();
  const isEdit = Boolean(_id);

  useEffect(() => {
    if (isEdit) {
    } else {
      form.resetFields();
      form.setFieldsValue({
        status: true,
      });
    }
  }, [_id, isEdit, form]);

  const handleFinish = (values) => {
    const payload = {
      ...values,
      id: _id || Date.now(),
    };
    console.log(isEdit ? "Update permission:" : "Create permission:", payload);
    onSave();
  };

  return (
    <Form layout="vertical" form={form} onFinish={handleFinish}>
      <Card
        size="small"
        style={{marginBottom: 12, borderRadius: 14, border: "1px solid #f0f0f0", background: "rgba(255, 255, 255, 0.96)",}}
        styles={{body:{padding:12}}}
        title={
          <Space>
            <Flex justify="center" align="center" style={{width: 24, height: 24,borderRadius: "999px",background: "#e6f4ff"}}>
              <EnvironmentOutlined style={{ fontSize: 14, color: "#1677ff" }} />
            </Flex>
            <span>Permission Information</span>
          </Space>
        }
      >
        <Row gutter={12}>
          <Col xs={24} md={12}>
            <Form.Item name="name" label="Permission Name" rules={[{ required: true, message: "Please enter permission name" }]}>
              <Input placeholder="e.g. lead:assign" />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item name="module" label="Module Key" rules={[{ required: true, message: "Please enter module name" }]}
              extra={<Text type="secondary" style={{ fontSize: 11 }}> Example: <b>lead, user, task</b></Text>}>
              <Input placeholder="e.g. lead" />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item name="action" label="Action Key" rules={[{ required: true, message: "Please enter action" }]}
              extra={ <Text type="secondary" style={{ fontSize: 11 }}> Example: <b>create, read, update, delete</b></Text>}
            >
              <Input placeholder="e.g. assign" />
            </Form.Item>
          </Col>

          <Col xs={24}>
            <Form.Item name="description" label="Description">
              <Input.TextArea rows={3} placeholder="Short description of what this permission controls (optional)" />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item name="status" label="Status" valuePropName="checked">
              <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
            </Form.Item>
          </Col>
        </Row>
      </Card>

      <Row gutter={8} justify="end">
        <Col xs={12} md={6}>
          <Button block onClick={() => { form.resetFields(); onSave();}} style={{ borderRadius: 999 }}>Cancel</Button>
        </Col>
        <Col xs={12} md={6}>
          <Button type="primary" htmlType="submit" block style={{ borderRadius: 999 }}>{isEdit ? "Save Changes" : "Add Permission"}</Button>
        </Col>
      </Row>
    </Form>
  );
};
