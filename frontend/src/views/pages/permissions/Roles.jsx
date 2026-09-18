import { useState, useEffect } from "react";
import util from "../../../utils/util";
import {Alert, Button, Card, Col, Divider, Input, message, Modal, Popconfirm, Row, Space, Table, Tag, Tooltip, Typography, Switch, Form, Spin, Skeleton, Flex} from "antd";
import {CloseSquareFilled, EditOutlined, EnvironmentOutlined, ReloadOutlined, RollbackOutlined, SearchOutlined, StopOutlined} from "@ant-design/icons";

import MyPagination from "../../components/Pagination";
import { useCreateRole, useDeleteRole, useHardDeleteRole,  useFetchRolePermission, useRestoreRole, useRolesList, useUpdateRole} from "../../../api-hooks/roles";
import { usePermissionList } from "../../../api-hooks/permission";
import commonObj from "../../../commonObj";
import { parseAsString, useQueryStates } from "nuqs";

const { Text, Title } = Typography;
const allowURLStateUpdate = true;

const Roles = () => {
  const DEFAULT_NUQS_CONFIG = {throttleMs: !allowURLStateUpdate ? Infinity : 0};
  const [messageApi, contextHolder] = message.useMessage();
  const rolePermissions = util.getModulePermissions('role');

  const [acc] = useState({
    viewAccess: rolePermissions.includes('read'),
    addAccess: rolePermissions.includes('create'),
    editAccess: rolePermissions.includes('update'),
    deleteAccess: rolePermissions.includes('delete'),
    hardDeleteAccess: false,
    restoreAccess: false
  });

  const { data: resData, isFetching:loading, isError, error, refetch, refetchWithQuery} = useRolesList({ page: 1, limit: 20 });
  const { data: permissionGrp, isLoading:isPermissionsLoading, error: permissionsError, isError: isPermissionsError} = usePermissionList({ page: 1, limit: 20 });

  // soft delete (archive)
  const { mutate: deleteRole, isPending: isSoftDeleting } = useDeleteRole({
    onSuccess: (res) => {
      messageApi.success(res?.message || "Role archived successfully");
      refetchWithQuery?.();
    },
    onError: (err) => {
      messageApi.error(err?.message || "Failed to archive role");
    },
  });

  // restore
  const { mutate: restoreRole, isPending: isRestoring } = useRestoreRole({
    onSuccess: (res) => {
      messageApi.success(res?.message || "Role restored successfully");
      refetchWithQuery?.();
    },
    onError: (err) => {
      messageApi.error(err?.message || "Failed to restore role");
    },
  });

  // hard delete
  const { mutate: hardDeleteRole, isPending: isHardDeleting } = useHardDeleteRole({
      onSuccess: (res) => {
        messageApi.success(res?.message || "Role deleted permanently");
        refetchWithQuery?.();
      },
      onError: (err) => {
        messageApi.error(err?.message || "Failed to hard delete role");
      },
  });

  const data = resData?.data || [];
  const qData = resData?.qData || {page: 1, limit: 20, total: data.length, totalPages: 1};

  const [selectedId, setSelectedId] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  // const [search, setSearch] = useState("");
  const [search, setSearch] = useQueryStates({q:parseAsString.withDefault(null)}, {urlKeys:{q:'q'}, ...DEFAULT_NUQS_CONFIG});

  const handleModalClose = () => {
    setSelectedId(null);
    setIsEditModalOpen(false);
  };

  const handleAdd = () => {
    setSelectedId(null);
    setIsEditModalOpen(true);
  };

  const handleEdit = (id, selectedData) => {
    setSelectedId(id);
    setIsEditModalOpen(true);
  };

  const handleSoftDelete = (id) => {
    if (!id) return;
    deleteRole(id);
  };

  const handleRestore = (id) => {
    if (!id) return;
    restoreRole(id);
  };

  const handleHardDelete = (id) => {
    if (!id) return;
    hardDeleteRole(id);
  };

  // const filteredData = useMemo(() => {
  //   const term = search.toLowerCase().trim();

  //   return (data || []).filter((role) => {

  //       if (!showDeleted && role.isDeleted) return false;
  //       return true;
  //     })
  //     .filter((r) => {
  //       if (!term) return true;

  //       const name = String(r.name || "").toLowerCase();
  //       const description = String(r.description || "").toLowerCase();
  //       const permissions = (r.permissions || []).map((p) => String(p).toLowerCase()).join(" ");

  //       return (
  //         name.includes(term) ||
  //         description.includes(term) ||
  //         permissions.includes(term)
  //       );
  //     });
  // }, [data, search, showDeleted]);

  const columns = [
    {
      title: "S. No.",
      dataIndex: "id",
      align: "center",
      width: 80,
      fixed: "left",
      render: (_, __, index) => {
        const page = qData?.page || 1;
        const limit = qData?.limit || 20;
        return (page - 1) * limit + index + 1;
      },
    },
    {
      title: "Role Name",
      dataIndex: "name",
      width: 220,
      render: (v, row) => (
        <Space direction="vertical" size={0} align="start">
          <Text strong delete={row.isDeleted} type={row.isDeleted ? "secondary" : undefined}>{v || "—"}</Text>
          {row.isSystem && ( <Tag color="blue" style={{ borderRadius: 999, marginTop: 2 }}> System Role </Tag>)}
        </Space>
      ),
    },
    // {
    //   title: "Role Level",
    //   dataIndex: "roleLevel",
    //   width: 120,
    //   render: (v) => v ?? "—",
    // },
    {
      title: "Description",
      dataIndex: "description",
      width: 280,
      ellipsis: true,
      render: (v) => (
        <Tooltip title={v}>
          <Text type="secondary">{v || "—"}</Text>
        </Tooltip>
      ),
    },
    // {
    //   title: "Permissions (count)",
    //   dataIndex: "permissions",
    //   width: 160,
    //   align: "center",
    //   render: (permissions = []) => (
    //     <Text strong>
    //       {Array.isArray(permissions) ? permissions.length : 0}
    //     </Text>
    //   ),
    // },
    {
      title: "Status",
      dataIndex: "isDeleted",
      width: 120,
      align: "center",
      render: (isDeleted) =>
        isDeleted ? ( <Tag color="red" style={{ borderRadius: 999 }}>Deleted</Tag>) : 
        (<Tag color="green" style={{ borderRadius: 999 }}>Active</Tag>),
    },
    {
      title: "Actions",
      dataIndex: "id",
      align: "center",
      width: 220,
      fixed: "right",
      hidden: !acc.editAccess && !acc.deleteAccess,
      render: (id, row) => {
        const isDeleted = row.isDeleted;

        return (
          <Space size="small">
            {/* Edit only if not deleted and not system */}
            {acc.editAccess && !isDeleted && (
              <Tooltip title="View role">
                <Button size="small" type="text" style={{ borderRadius: 999 }} icon={<EditOutlined />} onClick={() => handleEdit(id, row)} />
              </Tooltip>
            )}

            {/* Soft delete (archive) */}
            {/* {acc.deleteAccess && !isDeleted && (
              <Popconfirm
                title="Archive this role?"
                description="The role will be marked as deleted but can be restored later."
                okText="Yes"
                cancelText="No"
                onConfirm={() => handleSoftDelete(id)}
              >
                <Tooltip title="Archive role">
                  <Button
                    size="small"
                    type="text"
                    danger
                    // loading={deleteId === id && isSoftDeleting}
                    style={{ borderRadius: 999 }}
                    icon={<DeleteOutlined />}
                  />
                </Tooltip>
              </Popconfirm>
            )} */}

            {/* Restore for deleted roles */}
            {(acc.restoreAccess && isDeleted ) && (
              <Popconfirm title="Restore this role?" okText="Yes" cancelText="No" onConfirm={() => handleRestore(id)}>
                <Tooltip title="Restore role">
                  <Button size="small"  type="text" style={{ borderRadius: 999 }} icon={<RollbackOutlined />} />
                </Tooltip>
              </Popconfirm>
            )}

            {/* Hard delete – only for deleted roles and not system */}
            {(isDeleted && acc.hardDeleteAccess) && (
              <Popconfirm
                title="Permanently delete this role?" description="This action cannot be undone. All references to this role may be affected."
                okText="Delete" okType="danger" cancelText="Cancel" onConfirm={() => handleHardDelete(id)}
              >
                <Tooltip title="Hard delete (permanent)">
                  <Button size="small" type="text" danger style={{ borderRadius: 999 }} icon={<StopOutlined />} />
                </Tooltip>
              </Popconfirm>
            )}
          </Space>
        );
      },
    },
  ].filter((c) => !c.hidden);

  const rowClassName = (_, index) => index % 2 === 0 ? "table-row-light" : "table-row-dark";

  if (!acc.viewAccess) {
    return (
      <Alert message="Access Denied" description="You do not have permission to view roles." type="warning" showIcon />
    );
  }

  return (
    <div>
      {contextHolder}

      {isError ? ( <Alert message="Error" description={error?.message || "Failed to load roles"} type="error" showIcon />) : 
       ( <Card
          size="small"
          bordered={false}
          className="card-style"
          styles={{header:{borderBottom:'none', padding:'10px'}, body:{padding:'10px'}}}
          title={
            <Space align="center">
              <div style={{width: 44, height: 44, borderRadius: "999px", padding: 2, background:"conic-gradient(from 210deg, #2f54eb, #9254de, #40a9ff, #2f54eb)",}}>
                <Flex justify="center" align="center" style={{width: "100%", height: "100%", borderRadius: "999px", background: "radial-gradient(circle at 30% 20%, #f0f5ff, #d6e4ff)",}}>
                  <EnvironmentOutlined style={{ fontSize: 20, color: "#1d39c4" }} />
                </Flex>
              </div>
              <Space direction="vertical" size={0}>
                <Title level={4} style={{ margin: 0 }}> Roles Management </Title>
                <Text type="secondary" style={{ fontSize: 12 }}> Manage role definitions, levels & permission bundles for your CRM.</Text>
              </Space>
            </Space>
          }
          extra={
            <Space align="center">
              <Text type="secondary" style={{ fontSize: 12 }}>
                Total roles:{" "} <Text strong style={{ color: "#2f54eb" }}> {data?.length || 0}</Text>
              </Text>

              {/* <Space size={4} align="center">
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Show deleted
                </Text>
                <Switch
                  size="small"
                  checked={showDeleted}
                  onChange={setShowDeleted}
                />
              </Space> */}

              <Tooltip title="Refresh data">
                <Button icon={<ReloadOutlined />} size="middle"style={{ borderRadius: 999, boxShadow: "0px 4px 10px rgba(15, 23, 42, 0.06)"}} onClick={refetch} loading={loading} />
              </Tooltip>

              {/* {acc.addAccess && (
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  size="middle"
                  style={{ borderRadius: 999, paddingInline: 18 }}
                  onClick={handleAdd}
                >
                  Add Role
                </Button>
              )} */}
            </Space>
          }
        >
          {/* Search bar */}
          <Card
            size="small"
            bordered={false}
            style={{
              marginBottom: 12,
              borderRadius: 999,
              background:"linear-gradient(90deg, rgba(240,245,255,0.9), rgba(255,255,255,0.95))",
              border: "1px solid #f0f2ff"
            }}
            styles={{body:{paddingBlock:8, paddingInline: 14}}}
          >
            <Row align="middle" gutter={12}>
              <Col xs={24} md={10}>
                <Input
                  placeholder="Search roles by name"
                  value={search.q || ''}
                  onChange={(e) => setSearch({q:e.target.value})}
                  allowClear
                  onClear={() => {setSearch({q:null}); refetchWithQuery({q:null})}}
                  style={{ borderRadius: 999, paddingInline: 16, paddingBlock: 8, boxShadow: "0 4px 10px rgba(15,23,42,0.06)", border: "1px solid #dde4ff"}}
                />
              </Col>
              <Col span={3}>
                <Button onClick={()=> refetchWithQuery(search)} style={{ borderRadius: "50px", width: "100%" }} type="primary" htmlType="submit" icon={<SearchOutlined />}>Search</Button>
              </Col>
            </Row>
          </Card>

          {/* Table */}
          <Table
            pagination={false}
            columns={columns}
            dataSource={data}
            loading={loading}
            rowClassName={rowClassName}
            rowKey="id"
            style={{borderRadius: 16, overflow: "hidden", background: "rgba(255, 255, 255, 0.98)"}}
            scroll={{
              y: util.getTableHeight ? util.getTableHeight() : "calc(100vh - 360px)",
              x: "max-content"
            }}
          />

          <Divider style={{ margin: "14px 0 8px" }} />
          <MyPagination {...{ qData }} total={qData?.total || data?.length || 0} onChange={() => {}} DEFAULT_NUQS_CONFIG={DEFAULT_NUQS_CONFIG} />
        </Card>
      )}

      {/* Add / Edit Role Modal */}
      <Modal
        open={isEditModalOpen}
        onCancel={handleModalClose}
        destroyOnHidden
        footer={null}
        centered
        width={1100}
        title={null}
        styles={{body:{padding:0, background:'linear-gradient(135deg, #f3f6ff 0%, #ffffff 35%, #fdf5ff 100%)'}}}
        closeIcon={<CloseSquareFilled />}
      >
        <Flex justify="space-between" align="center" gap={8} style={{ padding: 20, paddingBottom: 12, borderBottom: "1px solid #f0f0f0"}}>
          <Space align="center">
            <Flex justify="center" align="center" style={{width: 36, height: 36, borderRadius: "999px", background: "radial-gradient(circle at 30% 20%, #e6f4ff, #d6e4ff)"}}>
              <EnvironmentOutlined style={{ color: "#1d39c4" }} />
            </Flex>
            <Space direction="vertical" size={0}>
              <Title level={4} style={{ margin: 0 }}>{selectedId ? "View Role" : "Create Role"}</Title>
              <Text type="secondary" style={{ fontSize: 13 }}>
               { selectedId ? 'Role details and module-wise permissions.' : 'Define the role details and assign module-wise permissions.'}
              </Text>
            </Space>
          </Space>
        </Flex>

        <div style={{ padding: 18, paddingTop: 6 }}>
          <RoleForm id={selectedId} onSave={handleModalClose} permissionGrp={permissionGrp} isPermissionsLoading={isPermissionsLoading}
            isPermissionsError={isPermissionsError} permissionsError={permissionsError} messageApi={messageApi}
          />
        </div>
      </Modal>
    </div>
  );
};

export default Roles;

/*──────────────────── ROLE FORM ────────────────────*/

const RoleForm = ({ id, onSave, permissionGrp, isPermissionsLoading, isPermissionsError, permissionsError, messageApi}) => {
  const [form] = Form.useForm();
  const isEdit = !!id;
  const [selectedPermissionIds, setSelectedPermissionIds] = useState([]);

  // Fetch role details (with permissions) on edit
  const {data: roleDetailRes,  isLoading: isInitialDataLoading, isError: isInitialDataError, error: initialDataError} = useFetchRolePermission(id, { enabled: isEdit && !!id });

  const initialData = roleDetailRes?.data || roleDetailRes || null;

  const { mutate: createRole, isPending:isRoleCreating } = useCreateRole(
    { page: 1, limit: 20 },
    {
      onSuccess: (res) => {
        messageApi.success(res?.message || "Role saved successfully");
        onSave?.();
      },
      onError: (err) => {
        messageApi.error(err?.message || "Failed to save role");
      },
    }
  );

  const {mutate: updateRole, isPending:isRoleUpdating} = useUpdateRole(
    {page:1, limit: 20},
    {
      onSuccess:(res) => {
        messageApi.success(res?.message || 'Role Updated Successfully');
        onSave?.();

      },
      onError: (err) => {
        messageApi.error(err?.message || 'Failed to update role');
      }
    }
  );

  // Populate form & permissions on edit
  useEffect(() => {
    if (!isEdit) {
      form.resetFields();
      setSelectedPermissionIds([]);
      return;
    }

    if (isInitialDataLoading) return;

    if (initialData) {
      form.setFieldsValue({name: initialData.name, description: initialData.description});

      const preSelectedIds = Array.isArray(initialData.permissions)
        ? initialData.permissions.flatMap((module) => Array.isArray(module.permissions) ? module.permissions.map((p) => p.id) : [])
        : [];

      setSelectedPermissionIds(preSelectedIds);
    }
  }, [isEdit, id, initialData, isInitialDataLoading, form]);

  const toggleRight = (rightId) => {
    setSelectedPermissionIds((prev) => prev.includes(rightId) ? prev.filter((pid) => pid !== rightId) : [...prev, rightId]);
  };

  const handleFinish = (values) => {
    const payload = { ...values, permissions: selectedPermissionIds};

    if (isEdit) {
      payload.id = id || null;
      updateRole(payload);
    }else{
      createRole(payload);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setSelectedPermissionIds([]);
    onSave?.();
  };

  const isFormLoading = isInitialDataLoading && isEdit;
  const isSubmitting = isRoleCreating || isRoleUpdating;
  const isAnyLoading = isFormLoading || isPermissionsLoading || isSubmitting;

  return (
    <Spin spinning={isAnyLoading}>
    <Form layout="vertical" form={form} onFinish={handleFinish}>
      {/* ROLE INFO CARD */}
      <Card
        size="small"
        style={{
          marginBottom: 12,
          borderRadius: 14,
          border: "1px solid #f0f0f0",
          background: "rgba(255, 255, 255, 0.96)",
        }}
        styles={{body:{padding:12}}}
        title="Role Information"
        // loading={isFormLoading}
      >
        {isInitialDataError && ( <Alert type="error" showIcon style={{ marginBottom: 12 }} message="Failed to load role details" description={initialDataError?.message}/> )}

        <Row gutter={12}>
          <Col xs={24}>
            <Form.Item name="name" label="Role Name" rules={[{ required: true, message: "Please enter role name" }]} >
              <Input disabled placeholder="e.g. Team Lead" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={12}>
          <Col xs={24}>
            <Form.Item name="description" label="Description">
              <Input.TextArea rows={3} placeholder="Short description for this role"/>
            </Form.Item>
          </Col>
        </Row>
      </Card>

      {/* PERMISSION GROUPS */}
      {isPermissionsError && (<Alert type="error" showIcon style={{ marginBottom: 12 }} message="Failed to load permissions" description={permissionsError?.message}/>)}

      <Card size="small" title='Permissions' >
        <Row gutter={16}>
          {isPermissionsLoading ? (
            <Col span={24}>
              <Skeleton active paragraph={{rows:3}}/>
            </Col>
          ) : (permissionGrp || []).length === 0 ? (
            <Col span={24}>
              <Text type="secondary">No permissions available.</Text>
            </Col>
          ) : (
            (commonObj.permissionsGrp || [])?.map((group, groupIndex) => (
              <Col span={12} key={group.module || groupIndex}>
                {/* <p style={{ fontSize: 16, fontWeight: 600, marginBottom: 8, textTransform: "capitalize"}}>{group?.module || "Unnamed module"} </p> */}
                <Card
                  bordered
                  size="small"
                  title={group.module || 'Unnamed module'}
                  hoverable
                  style={{
                    marginBottom: 14,
                    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.08)",
                    borderRadius: 10,
                  }}
                  styles={{body:{padding:10}}}
                >
                  <Row gutter={[10, 10]}>
                    {(group.permissions || [])?.map((right) => (
                      <Col key={right?.id}>
                        <p style={{ margin: 0, fontSize: 13 }}>{util.formatPermissions(right?.name)}</p>
                        <Switch
                          checkedChildren="Yes"
                          unCheckedChildren="No"
                          checked={selectedPermissionIds.includes(right?.id)}
                          onChange={() => toggleRight(right?.id)}
                          style={{ marginTop: 6 }}
                          disabled={isSubmitting}
                        />
                      </Col>
                    ))}
                  </Row>
                </Card>
              </Col>
            ))
          )}
        </Row>
     </Card>


      {/* ACTION BUTTONS */}
      <Row gutter={8} justify="end" style={{ marginTop: 10 }}>
        <Col xs={12} md={6}>
          <Button block onClick={handleCancel} style={{ borderRadius: 999 }} disabled={isSubmitting}>{isEdit ? 'Back' : 'Cancel'}</Button>
        </Col>

        <Col xs={12} md={6}>
          <Button type="primary" htmlType="submit" block loading={isFormLoading} disabled={isFormLoading} style={{ borderRadius: 999 }}>{isEdit ? "Save Changes" : "Create Role"}</Button>
        </Col>
      </Row>

    </Form>
    </Spin>
  );
};
