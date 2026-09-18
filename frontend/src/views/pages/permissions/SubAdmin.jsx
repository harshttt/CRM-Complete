import { useEffect, useMemo, useState } from "react";
import util from "../../../utils/util";
import { Alert, Badge, Button, Card, Col, Divider, Drawer, Flex, Form, Input, message, Modal, Popconfirm, Row, Select, Space, Spin, Switch, Table, Tag, Tooltip, Typography} from "antd";
import {DeleteOutlined,EditOutlined, EyeOutlined, SearchOutlined, UserSwitchOutlined, ReloadOutlined, PlusOutlined, CloseSquareFilled} from "@ant-design/icons";
import { parseAsString, useQueryStates } from "nuqs";
// import { getSortingStateParser } from "../../../utils/parsers";
import { useFetchRolePermission, useRoleListForDropdown } from "../../../api-hooks/roles";
import { usePermissionList } from "../../../api-hooks/permission";
import MyPagination from "../../components/Pagination";
import {useUserList, useCreateUser, useUpdateUser, useSoftDeleteUser, useHardDeleteUser, useRestoreUser, useFetchUserPermission,} from "../../../api-hooks/user";
import commonObj from "../../../commonObj";

const { Text, Title } = Typography;
const { Option } = Select;

const allowURLStateUpdate = true;

const metaData = {
  1: { title: "Super Admin", type: "Super Admin", formTitle: "Super Admin", childButtonTitle: "Admins", childType: 2,},
  2: { title: "Admin List", type: "Admin", formTitle: "Admin", childButtonTitle: "Managers", childType: 3,},
  3: { title: "Manager List", type: "manager", formTitle: "Manager", childButtonTitle: "Sales Executive", childType: 4,},
  4: { title: "Sales Executive List", type: "Sales Executive", formTitle: "Sales Executive",},
  executives: { title: "Executives", type: "executives", formTitle: "Executives", childButtonTitle: "Executives"},
};

const SubAdmin = ({ roleLevel = "", parentUser }) => {
  const [type, setType] = useState(roleLevel || commonObj.role.roleLevel);
  const [messageApi, contextHolder] = message.useMessage();

  const DEFAULT_NUQS_CONFIG = {throttleMs: !allowURLStateUpdate ? Infinity : 0};
  const userPermissions = util.getModulePermissions('user') || [];

  const [acc] = useState({
    viewAccess: userPermissions.includes('read'),
    addAccess: userPermissions.includes('create'),
    editAccess: userPermissions.includes('update'),
    deleteAccess: userPermissions.includes('disable'),
    assign_role: userPermissions.includes('assign_role'),
    view_team: userPermissions.includes('view_team'),
    restore: userPermissions.includes('restore'),
  });

  // const sorting_cols = ["id", "fullName", "email", "phone"];
  // const [sort, setSort] = useQueryState("user_sort", getSortingStateParser(sorting_cols).withDefault([{ column: "id", desc: 1 }]).withOptions(DEFAULT_NUQS_CONFIG));
  const [search, setSearch] = useQueryStates({ q: parseAsString.withDefault("") },{ urlKeys: { q: "q" }, ...DEFAULT_NUQS_CONFIG });

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [superiorData, setSuperiorData] = useState(null);

  // filters
  const [showDeleted, setShowDeleted] = useState(true);
  const [filters, setFilters] = useState({ roleLevel: null, userId: null});

  // Users list
  const {data: userRes, isFetching: isUsersLoading, isError: isUsersError, error: userError, refetch: refetchUsers, refetchWithQuery: refetchUsersWithQuery} = useUserList({ page: 1, limit: 20, userId: parentUser });

  const users = userRes?.data || [];
  const qData = userRes?.qData || {page: 1, limit: 20, total: 0, totalPages: 1};

  // Roles dropdown
  const {data: rolesRes} = useRoleListForDropdown({ page: 1, limit: 20 });
  const allRoles = rolesRes?.data || rolesRes || [];
  const roles = allRoles.filter(item => item.roleLevel > type);

  // Permission groups (for user permissions assignment)
  const {data: permissionGrp} = usePermissionList({qData:{page:1, limit:20}});

  // Soft delete (archive)
  const { mutate: softDeleteUser, isPending: isSoftDeleting } = useSoftDeleteUser({
      onSuccess: (res) => {
        messageApi.success(res?.message || "User archived successfully");
        refetchUsers?.();
      },
      onError: (err) => {
        messageApi.error(err?.message || "Failed to archive user");
      },
    });

  // Hard delete (permanent)
  const { mutate: hardDeleteUser, isPending: isHardDeleting } = useHardDeleteUser({
      onSuccess: (res) => {
        messageApi.success(res?.message || "User permanently deleted");
        refetchUsers?.();
      },
      onError: (err) => {
        messageApi.error(err?.message || "Failed to delete user");
      },
    });

  // Restore
  const { mutate: restoreUser, isPending: isRestoring } = useRestoreUser({
    onSuccess: (res) => {
      messageApi.success(res?.message || "User restored successfully");
      refetchUsers?.();
    },
    onError: (err) => {
      messageApi.error(err?.message || "Failed to restore user");
    },
  });

  /* ------------ UNIQUE OPTIONS FOR FILTERS ------------- */

  const branchOptions = useMemo(() => {
    const set = new Set();
    users.forEach((u) => {
      if (u.branch) set.add(u.branch);
    });
    return Array.from(set);
  }, [users]);

  const regionOptions = useMemo(() => {
    const set = new Set();
    users.forEach((u) => {
      if (u.region) set.add(u.region);
    });
    return Array.from(set);
  }, [users]);

  /* ------------ HANDLERS ------------- */

  const handleEdit = (id) => {
    const rec = users.find((r) => r.id === id);
    setSelectedId(id);
    setSelectedRecord(rec || null);
    setIsEditModalOpen(true);
  };

  const handleView = (id) => {
    const rec = users.find((r) => r.id === id);
    setSelectedId(id);
    setSelectedRecord(rec || null);
    setIsEditModalOpen(true);
  };

  const handleAdd = () => {
    setSelectedId(null);
    setSelectedRecord(null);
    setIsEditModalOpen(true);
  };

  const handleModalClose = () => {
    setSelectedId(null);
    setSelectedRecord(null);
    setIsEditModalOpen(false);
  };

  const handleSoftDelete = (id) => {
    if (!id) return;
    softDeleteUser(id);
  };

  const handleHardDelete = (id) => {
    if (!id) return;
    hardDeleteUser(id);
  };

  const handleRestore = (id) => {
    if (!id) return;
    restoreUser(id);
  };

  /* ------------ FILTERED DATA ------------- */

  const filteredData = useMemo(() => {
    const term = (search.q || "").toLowerCase().trim();

    let visibleUsers = users;

    // role filter
    if (filters.roleId) {
      visibleUsers = visibleUsers.filter((u) => u.role?.id === filters.roleId);
    }

    return visibleUsers.filter((item) => {
      const haystack = `${item.fullName ?? ""} ${item.email ?? ""} ${ item.phone ?? ""}`.toLowerCase();
      return haystack.includes(term);
    });

  }, [users, search.q, showDeleted, filters]);

  /* ------------ TABLE COLUMNS ------------- */

  const columns = [
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
      title: "Full Name",
      dataIndex: "fullName",
      width: 150,
      fixed:'left',
      render: (_, row) => (
        <Space direction="vertical" size={0} style={{ alignItems: "flex-start" }}>
          <Text strong>{row.fullName || "—"}</Text>
          <Text type="secondary" style={{ fontSize: 11 }}> {row.role?.name || "User"} </Text>
        </Space>
      ),
    },
    {
      title: "Phone No",
      dataIndex: "phone",
      width: 160,
      render: (v) => v || "—",
    },
    {
      title: "Email",
      dataIndex: "email",
      width: 220,
      render: (v) => v || "—",
    },
    {
      title: "Branch",
      dataIndex: "branch",
      width: 160,
      render: (v) => v || "—",
    },
    {
      title: "Region",
      dataIndex: "region",
      width: 160,
      render: (v) => v || "—",
    },
    {
      title: "Created By",
      dataIndex: "parentUser",
      width: 200,
      render: (v) => v?.name ? (<span>{v.name}</span>) : (<span style={{ color: "red" }}>N/A</span>),
    },
    {
      title: "Status",
      dataIndex: "isDeleted",
      width: 140,
      render: (_, row) => {
        const isDeleted = !!row.isDeleted;
        return isDeleted ? (<Tag color="red" style={{ borderRadius: 999, paddingInline: 10 }}>Deleted</Tag>) : 
           (<Tag color="green" style={{ borderRadius: 999, paddingInline: 10 }}> Active</Tag>);
      },
    },
    ...(acc.view_team ? 
      [{
      title: `Manage ${metaData?.[type + 1]?.childButtonTitle}`,
      dataIndex: "id",
      width: 150,
      fixed: "right",
      render: (_, row) => (<Button type="primary" onClick={() => setSuperiorData(row)} style={{ borderRadius: 999 }}> {metaData?.[type + 1]?.childButtonTitle || "Manage Team"}</Button>),
      hidden: type == 3
    }] : []),
    {
      title: "Action",
      dataIndex: "id",
      width: 220,
      align: "center",
      fixed: "right",
      hidden: !acc.addAccess && !acc.editAccess && !acc.deleteAccess && !acc.viewAccess,
      render: (id, row) => {
        const isDeleted = !!row.isDeleted;
        return (
          <Space size="small">
            {/* View / Edit only for non-deleted */}
            {!isDeleted && acc.editAccess && (
              <Tooltip title="Edit">
                <Button type="text" size="small" icon={<EditOutlined />} style={{ borderRadius: 999 }} onClick={() => handleEdit(row.id)} />
              </Tooltip>
            )}

            {!isDeleted && !acc.editAccess && acc.viewAccess && (
              <Tooltip title="View">
                <Button type="text" size="small" icon={<EyeOutlined />} style={{ borderRadius: 999 }} onClick={() => handleView(row.id)}/>
              </Tooltip>
            )}

            {/* Soft delete (archive) for active users */}
            {!isDeleted && acc.deleteAccess && (
              <Popconfirm title="Delete this user?" description="The user will be deleted." okText="Delete" cancelText="Cancel" onConfirm={() => handleSoftDelete(id)}>
                <Tooltip title="Delete">
                  <Button type="text" size="small" danger style={{ borderRadius: 999 }} icon={<DeleteOutlined />} />
                </Tooltip>
              </Popconfirm>
            )}

            {/* Restore + Hard delete for deleted users */}
            {/* {isDeleted && (
              <>
                <Popconfirm title="Restore this user?" okText="Yes" cancelText="No" onConfirm={() => handleRestore(id)}>
                  <Tooltip title="Restore user">
                    <Button type="text" size="small" style={{ borderRadius: 999 }} loading={isRestoring} icon={<RollbackOutlined />}/>
                  </Tooltip>
                </Popconfirm>

                <Popconfirm title="Permanently delete this user?" description="This action cannot be undone." okText="Delete" okType="danger" cancelText="Cancel" onConfirm={() => handleHardDelete(id)}>
                  <Tooltip title="Hard delete (permanent)">
                    <Button type="text" size="small" danger loading={isHardDeleting} style={{ borderRadius: 999 }} icon={<StopOutlined />}/>
                  </Tooltip>
                </Popconfirm>
              </>
            )} */}
          </Space>
        );
      },
    },
  ].filter((item) => !item.hidden);

  const rowClassName = (_, index) => index % 2 === 0 ? "table-row-light" : "table-row-dark";

  // useEffect(() => {
  //   if(filters.roleLevel){
  //     setType(Number(filters.roleLevel)-1)
  //     refetchUsersWithQuery({roleLevel: Number(filters.roleLevel)});
  //   }

  // },[filters]);

  useEffect(() => {
    if (filters.roleLevel) {
      setType(Number(filters.roleLevel) - 1);
      refetchUsersWithQuery({ roleLevel: Number(filters.roleLevel) });
    } else {
      setType(roleLevel || commonObj.role.roleLevel);
      refetchUsersWithQuery({ roleLevel: undefined });
    }
}, [filters.roleLevel]);

  if (!acc.viewAccess) {
    return (<Alert message="Access Denied" description="You don't have permission to view Team Management." type="warning" showIcon />);
  }
  
  return (
    <div>
      {contextHolder}
      {isUsersError ? (<Alert message="Error" description={userError?.message} type="error" showIcon /> ) 
      : (
        <Card
          size="small"
          bordered={false}
          className="card-style"
          styles={{header:{borderBottom:'none', padding:'10px'}, body:{padding:'10px'}}}
          title={
            <Space align="center">
              <div style={{ width: 44, height: 44, borderRadius: "999px", background:"conic-gradient(from 210deg,#2f54eb,#9254de,#40a9ff,#2f54eb)", padding: 2}}>
                <Flex justify="center" align="center"  style={{width: "100%", height: "100%", borderRadius: "999px",background:"radial-gradient(circle at 30% 20%, #f0f5ff, #d6e4ff)"}}>
                  <UserSwitchOutlined style={{ color: "#1d39c4" }} />
                </Flex>
              </div>
              <Space direction="vertical" size={0}>
                <Title level={4} style={{ margin: 0 }}>{metaData?.[type]?.childButtonTitle} Management</Title>
                <Text type="secondary" style={{ fontSize: 12 }}>Manage admin users, roles & permissions for your CRM. </Text>
              </Space>
            </Space>
          }
          extra={
            <Space align="center">
              <Badge count={users?.length} style={{ backgroundColor: "#2f54eb",marginRight:'8px' }}>
                <Text type="secondary" style={{ fontSize: 12, marginRight:'16px' }}> Total Users</Text>
              </Badge>

              <Tooltip title="Refresh data">
                <Button icon={<ReloadOutlined />} size="middle"
                  style={{borderRadius: 999, boxShadow: "0 4px 10px rgba(15,23,42,0.06)",}}
                  onClick={refetchUsers} loading={isUsersLoading}
                />
              </Tooltip>
              {acc.addAccess && (
                <Button type="primary" icon={<PlusOutlined />} size="middle" style={{ borderRadius: 999, paddingInline: 18 }} onClick={handleAdd}> Add {metaData?.[type]?.childButtonTitle}</Button>
              )}
            </Space>
          }
        >
          {/* Search + Filters bar */}
          <Card size="small" bordered={false}
            style={{ marginBottom: 12, borderRadius: 999, border: '1px solid #f0f2ff', background:"linear-gradient(90deg,rgba(240,245,255,0.9),rgba(255,255,255,0.95))"}}
            styles={{body:{paddingBlock: 8, paddingInline: 14}}}
          >
            <Row align="middle" gutter={10}>
              <Col xs={24} md={14}>
                <Search refetch={refetchUsersWithQuery} search={search} setSearch={setSearch} />
              </Col>
              <Col xs={24} md={10}>
                <FiltersBar filters={filters} setFilters={setFilters} roles={roles} branchOptions={branchOptions} regionOptions={regionOptions} />
              </Col>
            </Row>
          </Card>

          {/* Table */}
           <Table
            bordered={false}
            size="middle"
            rowKey="id"
            pagination={false}
            loading={isUsersLoading || isSoftDeleting}
            columns={columns}
            dataSource={users}
            rowClassName={rowClassName}
            style={{ borderRadius: 16, overflow: "hidden", background: "rgba(255,255,255,0.98)"}}
            scroll={{
              y: util.getTableHeight ? util.getTableHeight() : "calc(100vh - 360px)",
              x: "max-content",
            }}
            // onChange={(_, __, sorter) => util.handleTableSortingData(sorter, setSort, sort, refetchUsersWithQuery, qData)}
          />

          <Divider style={{ margin: "14px 0 8px" }} />
          <MyPagination {...{ qData }} total={qData?.total} />
        </Card>
      )}

      {/* Add / Edit / View Modal */}
      <Modal open={isEditModalOpen} onCancel={handleModalClose} destroyOnHidden footer={null} centered width={920} title={null}
        styles={{body:{padding: 0, background:"linear-gradient(135deg, #f3f6ff 0%, #ffffff 35%, #fdf5ff 100%)"}}}
        closeIcon={<CloseSquareFilled />}
      >
        <Flex justify="space-between" align="center" gap={8} style={{ padding: 20, paddingBottom: 12, borderBottom: "1px solid #f0f0f0"}} >
          <Space align="center">
            <Flex justify="center" align="center"style={{width: 36, height: 36, borderRadius: "999px",background:"radial-gradient(circle at 30% 20%, #e6f4ff, #d6e4ff)", }}>
              <UserSwitchOutlined style={{ color: "#1d39c4" }} />
            </Flex>
            <Space direction="vertical" size={0}>
              <Title level={4} style={{ margin: 0 }}> {selectedId ? "Edit User" : "Create User"}</Title>
              <Text type="secondary" style={{ fontSize: 12 }}>Capture details, assign role & granular module permissions.</Text>
            </Space>
          </Space>
        </Flex>

        <div style={{ padding: 18, paddingTop: 6 }}>
          <DataForm id={selectedId} onSave={handleModalClose}  initialData={selectedRecord}  parentUser={parentUser} role={roles} roleLevel={type} permissionGrp={permissionGrp} />
        </div>
      </Modal>

      {/* Nested hierarchy drawer */}
      {superiorData && (
        <Drawer open={!!superiorData} onClose={() => { setSuperiorData(null); }} destroyOnHidden maskClosable width={1200} footer={null}
          title={
            <>
              List of {metaData?.[type + 1]?.childButtonTitle || "Team"} under{" "}
              <Typography.Text type="danger"> {superiorData?.fullName} </Typography.Text>
            </>
          }
        >
          <SubAdmin roleLevel={Number(type) + 1} parentUser={superiorData.id} />
        </Drawer>
      )}
    </div>
  );
};

export default SubAdmin;

/*──────────────────── SEARCH BAR ────────────────────*/
const Search = ({ refetch, search, setSearch }) => {
  return (
    <Form onFinish={() => {refetch(search)}} style={{ width: "100%" }}>
      <Row gutter={8} wrap align="middle">
        <Col span={14}>
          <Input value={search.q ?? ""} placeholder="Search by Name" prefix={<SearchOutlined style={{ color: "#bfbfbf" }} />}
            onChange={(e) => setSearch({ q: e.target.value })} allowClear onClear={() => {setSearch({q: null}); refetch({q:null})}}
            style={{borderRadius: 999, paddingInline: 16, paddingBlock: 8, boxShadow: "0 4px 10px rgba(15, 23, 42, 0.06)", border: "1px solid #dde4ff"}}
          />
        </Col>
        <Col span={5}>
          <Button style={{ borderRadius: "50px", width: "100%" }} type="primary" htmlType="submit" icon={<SearchOutlined />}>Search</Button>
        </Col>
      </Row>
    </Form>
  );
};

/*──────────────────── FILTERS BAR ────────────────────*/
const FiltersBar = ({filters, setFilters, roles = []}) => {
  const handleChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value || undefined }));
  };

  const handleReset = () => {
    setFilters({
      roleLevel: null,
    });
  };

  return (
    <Space wrap style={{ width: "100%", justifyContent: "flex-end"}}>
      {/* Role Filter */}
      <Select onClear={() => {setFilters(prev=> ({...prev, roleLevel:null}))}} style={{ minWidth: 160 }} placeholder="Filter by role"
        value={filters.roleLevel}   onChange={val => handleChange("roleLevel", val)} size="middle"
      >
        {roles?.map((r) => ( <Option key={r?.roleLevel} value={r?.roleLevel}> {r?.name}</Option>))}
      </Select>

      <Button size="middle" onClick={handleReset}> Clear Filters </Button>
    </Space>
  );
};

/*──────────────────── DATA FORM (CREATE / EDIT USER) ────────────────────*/
// const DataForm = ({ id, onSave, initialData, role, roleLevel, parentUser }) => {
//   const [form] = Form.useForm();
//   const [messageApi, contextHolder] = message.useMessage();
//   const isEdit = !!id;

//   const {data: permissionGrp} = usePermissionList({qData:{page:1, limit:20}});

//   const [selectedPermissionIds, setSelectedPermissionIds] = useState([]);

//   const { mutate: createUser, isPending: isCreating } = useCreateUser({
//     onSuccess: (res) => {
//       messageApi.success(res?.message || "User created successfully");
//       onSave?.(res);
//     },
//     onError: (err) => {
//       messageApi.error(err?.message || "Failed to create user");
//     },
//   });

//   const { mutate: updateUser, isPending: isUpdating } = useUpdateUser({
//     onSuccess: (res) => {
//       messageApi.success(res?.message || "User updated successfully");
//       onSave?.(res);
//     },
//     onError: (err) => {
//       messageApi.error(err?.message || "Failed to update user");
//     },
//   });

//   useEffect(() => {
//     if (isEdit && initialData) {
//       form.setFieldsValue({
//         fullName: initialData?.fullName,
//         email: initialData?.email,
//         phone: initialData?.phone,
//         role: initialData?.role?.id,
//         branch: initialData?.branch,
//         region: initialData?.region,
//         active: initialData?.active,
//       });
//       setSelectedPermissionIds(initialData?.permissions || []);
//     } else {
//       form.resetFields();
//       form.setFieldsValue({ parentUser });
//       setSelectedPermissionIds([]);
//     }
//   }, [isEdit, id, initialData, parentUser, form]);

//   // Toggle single permission
//   const togglePermission = (permissionId) => {
//     setSelectedPermissionIds((prev) =>
//       prev.includes(permissionId) ? prev.filter((pid) => pid !== permissionId) : [...prev, permissionId]
//     );
//   };

//   const handleFinish = (values) => {
//     const payload = { ...(initialData || {}), ...values, parentUser, permissions: selectedPermissionIds};

//     if (isEdit && !payload.password) {
//       delete payload.password;
//     }

//     if (isEdit) {
//       updateUser(payload);
//     } else {
//       createUser(payload);
//     }
//   };

//   const handleCancel = () => {
//     form.resetFields();
//     setSelectedPermissionIds([]);
//     onSave?.();
//   };

//   const isSaving = isCreating || isUpdating;

//   // Validation rules
//   const fullNameRules = [
//     { required: true, message: "Full name is required" },
//     { min: 2, message: "Full name must be at least 2 characters" },
//     { max: 100, message: "Full name cannot exceed 100 characters" },
//   ];

//   const emailRules = [
//     { required: true, message: "Email is required" },
//     { type: "email", message: "Please enter a valid email address" },
//   ];

//   const phoneRules = [
//     { required: true, message: "Phone number is required" },
//     { pattern: /^\d{10}$/, message: "Phone number must be exactly 10 digits"},
//   ];

//   const passwordRules = isEdit ? [] : [{ required: true, message: "Password is required" }];
//   const roleRules = [{ required: true, message: "Role is required" }];

//   const branchRules = [
//     { required: true, message: "Branch is required" },
//     { min: 2, message: "Branch must be at least 2 characters" },
//   ];

//   const regionRules = [
//     { required: true, message: "Region is required" },
//     { min: 2, message: "Region must be at least 2 characters" },
//   ];

//   return (
//     <Form layout="vertical" form={form} onFinish={handleFinish}>
//       {contextHolder}
//       <Spin spinning={isSaving}>
//         <Card
//           size="small"
//           style={{
//             marginBottom: 12,
//             borderRadius: 14,
//             border: "1px solid #f0f0f0",
//             background: "rgba(255,255,255,0.96)",
//           }}
//           styles={{ body: { padding: 12 } }}
//           title={
//             <Space>
//               <Flex
//                 justify="center"
//                 align="center"
//                 style={{
//                   width: 24,
//                   height: 24,
//                   borderRadius: "999px",
//                   background: "#e6f4ff",
//                 }}
//               >
//                 <UserSwitchOutlined style={{ fontSize: 14, color: "#1677ff" }} />
//               </Flex>
//               <span>Basic Information</span>
//             </Space>
//           }
//         >
//           <Row gutter={12}>
//             <Col xs={24} md={12}>
//               <Form.Item
//                 label="Full Name"
//                 name="fullName"
//                 rules={fullNameRules}
//               >
//                 <Input placeholder="e.g. Fardeen Qureshi" />
//               </Form.Item>
//             </Col>

//             <Col xs={24} md={12}>
//               <Form.Item label="Email" name="email" rules={emailRules}>
//                 <Input placeholder="e.g. fardeen.qureshi@company.com" />
//               </Form.Item>
//             </Col>

//             <Col xs={24} md={12}>
//               <Form.Item label="Phone" name="phone" rules={phoneRules}>
//                 <Input placeholder="e.g. 9876512345" />
//               </Form.Item>
//             </Col>

//             {!isEdit ? (
//               <Col xs={24} md={12}>
//                 <Form.Item
//                   label="Set Password"
//                   name="password"
//                   rules={passwordRules}
//                 >
//                   <Input.Password placeholder="**********" />
//                 </Form.Item>
//               </Col>
//             ) : (
//               <Col xs={24} md={12}>
//                 <Form.Item
//                   label="Update Password"
//                   name="password"
//                   rules={passwordRules}
//                 >
//                   <Input.Password placeholder="Leave blank to keep existing" />
//                 </Form.Item>
//               </Col>
//             )}

//             <Col xs={24} md={8}>
//               <Form.Item
//                 label="Role"
//                 name="role"
//                 rules={roleRules}
//                 initialValue={
//                   role.find((item) => item.roleLevel == roleLevel + 1)?.id
//                 }
//               >
//                 <Select
//                   disabled
//                   placeholder="Choose role for this user"
//                   loading={false}
//                   options={(role || []).map((item) => ({
//                     label: item.name,
//                     value: item.id,
//                   }))}
//                 />
//               </Form.Item>
//             </Col>

//             <Col xs={24} md={8}>
//               <Form.Item label="Branch" name="branch" rules={branchRules}>
//                 <Input placeholder="Enter Branch" />
//               </Form.Item>
//             </Col>

//             <Col xs={24} md={8}>
//               <Form.Item label="Region" name="region" rules={regionRules}>
//                 <Input placeholder="Enter Region" />
//               </Form.Item>
//             </Col>
//           </Row>
//         </Card>
//       </Spin>

//       <Divider orientation="left" style={{ margin: "10px 0" }}>Module Permissions</Divider>

//       <Row gutter={12}>
//         {(permissionGrp || []).map((group, groupIndex) => (
//           <Col span={12} key={group.module || groupIndex}>
//             <Text strong style={{ fontSize: 14 }}>
//               {group.module || "Unnamed module"}
//             </Text>
//             <Card
//               bordered
//               size="small"
//               style={{
//                 marginTop: 6,
//                 marginBottom: 14,
//                 boxShadow: "0 2px 4px rgba(0,0,0,0.08)",
//                 borderRadius: 10,
//               }}
//               bodyStyle={{ padding: 10 }}
//             >
//               <Row gutter={[16, 10]} wrap>
//                 {(group.permissions || []).map((permission) => (
//                   <Col key={permission.id} style={{ textAlign: "start" }}>
//                     <p
//                       style={{
//                         margin: 0,
//                         fontFamily: "sans-serif",
//                         fontSize: 13,
//                       }}
//                     >
//                       {permission.name}
//                     </p>
//                     <Switch
//                       checkedChildren="Yes"
//                       unCheckedChildren="No"
//                       checked={selectedPermissionIds.includes(permission.id)}
//                       onChange={() => togglePermission(permission.id)}
//                       style={{ marginTop: 6 }}
//                     />
//                   </Col>
//                 ))}
//               </Row>
//             </Card>
//           </Col>
//         ))}
//       </Row>


//       <Row gutter={8} justify="end" style={{ marginTop: 8 }}>
//         <Col xs={12} md={6}>
//           <Button
//             block
//             onClick={handleCancel}
//             style={{ borderRadius: 999 }}
//             disabled={isSaving}
//           >
//             Cancel
//           </Button>
//         </Col>
//         <Col xs={12} md={6}>
//           <Button
//             type="primary"
//             htmlType="submit"
//             block
//             style={{ borderRadius: 999 }}
//             loading={isSaving}
//           >
//             {isEdit ? "Save Changes" : "Create User"}
//           </Button>
//         </Col>
//       </Row>
//     </Form>
//   );
// };


const DataForm = ({id, onSave, initialData, role, roleLevel, parentUser}) => {
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();
  const isEdit = !!id;

  const [selectedPermissionIds, setSelectedPermissionIds] = useState([]);
  const [originalPermissionIds, setOriginalPermissionIds] = useState([]);

  // const permissionGrp = commonObj.permissionsGrp; 

  const {data:roleRes} = useFetchRolePermission(role[0]?.id);
  const {data:userPermissions, isFetching:isUserPermissionFetching} = useFetchUserPermission(id);
  const parentRoleLevel = initialData?.role?.roleLevel ?? roleLevel;
  const {data:userRes, isFetching:isUsersLoading} = useUserList({roleLevel: parentRoleLevel - 1}); 
  const userList = userRes?.data;
  console.log("initialData--------->", initialData);
  console.log('userList---------->', userList);

  const permissionGrp = roleRes?.data?.permissions;

  // Create user mutation
  const { mutate: createUser, isPending: isCreating } = useCreateUser({
      onSuccess: (res) => {
        messageApi.success(res?.message || "User created successfully");
        onSave?.(res);
      },
      onError: (err) => {
        messageApi.error(err?.message || "Failed to create user");
      }
    }
  );

  // Update user mutation
  const { mutate: updateUser, isPending: isUpdating } = useUpdateUser({
      onSuccess: (res) => {
        messageApi.success(res?.message || "User updated successfully");
        onSave?.(res);
      },
      onError: (err) => {
        messageApi.error(err?.message || "Failed to update user");
      },
    }
  );

  // Prefill form on edit
  useEffect(() => {
    if (isEdit && initialData) {
      form.setFieldsValue({
        fullName: initialData?.fullName,
        email: initialData?.email,
        phone: initialData?.phone,
        role: initialData?.role?.id,
        branch: initialData?.branch,
        region: initialData?.region,
        active: initialData?.active
      });

      // setSelectedPermissionIds(initialData?.permissions || []);
    } else {
      form.resetFields();
      form.setFieldsValue({
        parentUser,
      });
      setSelectedPermissionIds([]);
    }
  }, [isEdit, id, initialData, parentUser, form]);

  // Toggle single permission
  const togglePermission = (permissionId) => {
    setSelectedPermissionIds((prev) => prev.includes(permissionId) ? prev.filter((pid) => pid !== permissionId) : [...prev, permissionId]);
  };

  const handleFinish = (values) => {

  const addedPermissions = selectedPermissionIds
    .filter((id) => !originalPermissionIds.includes(id))
    .map((id) => ({
      permission: id,
      type: "ADD",
    }));

  const removedPermissions = originalPermissionIds
    .filter((id) => !selectedPermissionIds.includes(id))
    .map((id) => ({
      permission: id,
      type: "REMOVE",
    }));

  const overridePermissions = [...addedPermissions, ...removedPermissions];

  const payload = {
      ...(initialData || {}),
      ...values,
      parentUser,
      overridePermissions
    };

    if (isEdit && !payload.password) {
      delete payload.password;
    }

    if (isEdit) {
      updateUser(payload);
    } else {
      createUser({...payload});
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setSelectedPermissionIds([]);
    onSave?.();
  };

  const isSaving = isCreating || isUpdating;

  useEffect(() => {
  if (!userPermissions) return;

  const permissionIds = Object.values(userPermissions).flat().map((perm) => perm.id);

  setSelectedPermissionIds(permissionIds);
  setOriginalPermissionIds(permissionIds);
}, [userPermissions]);


  return (
    <Spin spinning={isSaving || (isEdit && isUserPermissionFetching)}>
    <Form layout="vertical" form={form} onFinish={handleFinish}>
      {/* BASIC INFO */}
      {contextHolder}
      <Card size="small" style={{marginBottom: 12, borderRadius: 14, border: "1px solid #f0f0f0", background: "rgba(255,255,255,0.96)",}}
        styles={{body:{padding:12}}}
        title={
          <Space>
            <Flex justify="center" align="center" style={{ width: 24, height: 24, borderRadius: "999px", background: "#e6f4ff"}}>
              <UserSwitchOutlined style={{ fontSize: 14, color: "#1677ff" }} />
            </Flex>
            <span>Basic Information</span>
          </Space>
        }
      >
        <Row gutter={12}>
          <Col xs={24} md={12}>
            <Form.Item label="Full Name" name="fullName" rules={[{ required: true, message: "Full name is required" }]}>
              <Input placeholder="e.g. Fardeen Qureshi" />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item label="Email" name="email" rules={[{ required: true, message: "Email is required" }, { type: "email", message: "Enter a valid email" },]}>
              <Input placeholder="e.g. fardeen.qureshi@company.com" />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item label="Phone" name="phone" rules={[{ required: true, message: "Phone is required" }]}>
              <Input placeholder="e.g. 9876512345" />
            </Form.Item>
          </Col>

          {/* Password / Update password */}
          {!isEdit ? (
            <Col xs={24} md={12}>
              <Form.Item label="Set Password" name="password" rules={[{ required: true, message: "Password is required" }]}>
                <Input.Password placeholder="**********" />
              </Form.Item>
            </Col>
          ) : (
            <Col xs={24} md={12}>
              <Form.Item label="Update Password" name="password">
                <Input.Password placeholder="Leave blank to keep existing" />
              </Form.Item>
            </Col>
          )}

          <Col xs={24} md={12}>
            <Form.Item label="Role" name="role"
              rules={[{  message: "Please select role" }]}
              initialValue={ role.find((item) => item.roleLevel == roleLevel + 1)?.id}
            >
              <Select disabled={true} placeholder="Choose role for this user" loading={false}
                options={(role || []).map((item) => ({
                  label: item.name,
                  value: item.id,
                }))}
              />
            </Form.Item>
          </Col>

          {/* <Col xs={24} md={12}>
            <Form.Item label="Parent User" name="parentUser"
              rules={[{ required: true, message: "Please select Parent User" }]}
              initialValue={ userList?.find(item => item.id === initialData?.parentUser?.id)?.id || parentUser}
            >
              <Select placeholder="Select user" loading={false}
                options={(userList || []).map((item) => ({
                  label: item.fullName,
                  value: item.id,
                }))}
              />
            </Form.Item>
          </Col> */}

          <Col xs={24} md={12}>
            <Form.Item label="Branch" name="branch"  rules={[{ required: true, message: "Please enter branch" }]}>
              <Input placeholder="Enter Branch" />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item label="Region" name="region" rules={[{ required: true, message: "Please enter region" }]}>
              <Input placeholder="Enter Region" />
            </Form.Item>
          </Col>

          {/* <Col xs={24} md={8}>
            <Form.Item label='Status' name={'active'} rules={[{required:true, message:'Please select status'}]}>
              <Switch checkedChildren='Active' unCheckedChildren='Inactive' />
            </Form.Item>
          </Col> */}

        </Row>
      </Card>
      { isEdit &&
        <>
          {/* MODULE PERMISSIONS */}
          {/* <Divider orientation="left" style={{ margin: "10px 0" }}>
            Module Permissions
          </Divider> */}

        <Card size="small" title='Permissions'>
          <Row gutter={12}>
            {(permissionGrp || []).map((group, groupIndex) => (
              <Col span={12} key={group.module || groupIndex}>
                {/* <Text strong style={{ fontSize: 14 }}>{group.module || "Unnamed module"}</Text> */}
                <Card
                  title={group.module || 'Unnamed module'}
                  bordered
                  size="small"
                  style={{
                    marginTop: 6,
                    marginBottom: 14,
                    boxShadow: "0 2px 4px rgba(0,0,0,0.08)",
                    borderRadius: 10,
                  }}
                  bodyStyle={{ padding: 10 }}
                >
                  <Row gutter={[16, 10]} wrap>
                    {(group.permissions || []).map((permission) => (
                      <Col key={permission.id} style={{ textAlign: "start" }}>
                        <p
                          style={{
                            margin: 0,
                            fontFamily: "sans-serif",
                            fontSize: 13,
                          }}
                        >
                          {util.formatPermissions(permission.name)}
                        </p>
                        <Switch
                          checkedChildren="Yes"
                          unCheckedChildren="No"
                          checked={selectedPermissionIds.includes(permission.id)}
                          onChange={() => togglePermission(permission.id)}
                          style={{ marginTop: 6 }}
                        />
                      </Col>
                    ))}
                  </Row>
                </Card>
              </Col>
            ))}
          </Row>
        </Card>

        </>
      }

      {/* ACTIONS */}
      <Row gutter={8} justify="end" style={{ marginTop: 8 }}>
        <Col xs={12} md={6}>
          <Button block onClick={handleCancel} style={{ borderRadius: 999 }} disabled={isSaving}>Cancel</Button>
        </Col>
        <Col xs={12} md={6}>
          <Button type="primary" htmlType="submit" block style={{ borderRadius: 999 }} loading={isSaving}> {isEdit ? "Save Changes" : "Create User"}</Button>
        </Col>
      </Row>

    </Form>
    </Spin>
  );
};
