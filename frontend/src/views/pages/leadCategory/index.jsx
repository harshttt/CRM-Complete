import { useState, useEffect } from "react";
import util from "../../../utils/util";
import {Alert, Button, Card, Col, Divider, Input, message, Modal, Popconfirm, Row, Space, Table, Tag, Tooltip, Typography, Form, Spin, Flex} from "antd";
import {CloseSquareFilled, DeleteOutlined, EditOutlined, EnvironmentOutlined, PlusOutlined, ReloadOutlined, RollbackOutlined,SearchOutlined,StopOutlined} from "@ant-design/icons";
import MyPagination from "../../components/Pagination";
import { useHardDeleteRole} from "../../../api-hooks/roles";
import { useCategoryCreate, useCategoryDelete, useCategoryList, useCategoryRestore, useCategoryUpdate } from "../../../api-hooks/category";
import { parseAsString, useQueryStates } from "nuqs";

const { Text, Title } = Typography;
const allowURLStateUpdate = true;

const LeadCategory = () => {
  const DEFAULT_NUQS_CONFIG = {throttleMs: !allowURLStateUpdate ? Infinity : 0};
  const [messageApi, contextHolder] = message.useMessage();
  const categoryPermissions = util.getModulePermissions('category');

  const [acc] = useState({
    viewAccess: true || categoryPermissions.includes('read'),
    addAccess: true || categoryPermissions.includes('create'),
    editAccess: true || categoryPermissions.includes('edit'),
    deleteAccess: true || categoryPermissions.includes('delete'),
    hardDeleteAccess: true,
    restoreAccess: true
  });

  const { data: resData, isFetching:loading, isError, error, refetch, refetchWithQuery} = useCategoryList({ page: 1, limit: 20 });

  // soft delete (archive)
  const { mutate: deleteCategory, isPending: isSoftDeleting } = useCategoryDelete({
    onSuccess: (res) => {
      messageApi.success(res?.message || "Category deleted successfully");
      refetch();
    },
    onError: (err) => {
      messageApi.error(err?.message || "Failed to delete category");
    },
  });

  // restore
  const { mutate: restoreCategory, isPending: isRestoring } = useCategoryRestore({
    onSuccess: (res) => {
      messageApi.success(res?.message || "Category restored successfully");
      refetchWithQuery?.();
    },
    onError: (err) => {
      messageApi.error(err?.message || "Failed to restore category");
    },
  });

  // hard delete
  const { mutate: hardDeleteCategory, isPending: isHardDeleting } = useHardDeleteRole({
      onSuccess: (res) => {
        messageApi.success(res?.message || "Category deleted permanently");
        refetch();
      },
      onError: (err) => {
        messageApi.error(err?.message || "Failed to hard delete category");
      },
    });

  const data = resData?.data || [];
  const qData = resData?.qData || { page: 1, limit: 20, total: data.length, totalPages: 1};

  const [selectedId, setSelectedId] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  // const [search, setSearch] = useState("");
  const [search, setSearch] = useQueryStates({q:parseAsString.withDefault(null)}, {urlKeys:{q:'q'}, ...DEFAULT_NUQS_CONFIG});
  const [deleteId, setDeleteId] = useState(null);

  const handleModalClose = (needRefetch=false) => {
    setSelectedId(null);
    setSelectedCategory(null);
    setIsEditModalOpen(false);
    if(needRefetch){
       refetch();
     }
  };

  const handleAdd = () => {
    setSelectedId(null);
    setSelectedCategory(null);
    setIsEditModalOpen(true);
  };

  const handleEdit = (id, selectedData) => {
    setSelectedId(id);
    setSelectedCategory(selectedData || null);
    setIsEditModalOpen(true);
  };

  const handleSoftDelete = (id) => {
    if (!id) return;
    deleteCategory(id);
    setDeleteId(id);
  };

  const handleRestore = (id) => {
    if (!id) return;
    restoreCategory(id);
    setDeleteId(id);

  };

  const handleHardDelete = (id) => {
    if (!id) return;
    hardDeleteCategory(id);
    setDeleteId(id);
  };

  // const filteredData = useMemo(() => {
  //   const term = search.toLowerCase().trim();

  //   return (data || [])
  //     .filter((category) => {
  //       if (!showDeleted && category.isDeleted) return false;
  //       return true;
  //     })
  //     .filter((r) => {
  //       if (!term) return true;

  //       const name = String(r.name || "").toLowerCase();
  //       const description = String(r.description || "").toLowerCase();

  //       return (name.includes(term) || description.includes(term));
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
      title: "Category Name",
      dataIndex: "name",
      width: 220,
      render: (v, row) => (
        <Space direction="vertical" size={0} align="start">
          <Text strong delete={row.isDeleted} type={row.isDeleted ? "secondary" : undefined}>{v || "—"}</Text>
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
        isDeleted ? ( <Tag color="red" style={{ borderRadius: 999 }}> Deleted </Tag>) : 
          ( <Tag color="green" style={{ borderRadius: 999 }}> Active </Tag>),
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
              <Tooltip title="View category">
                <Button size="small" type="text" style={{ borderRadius: 999 }} icon={<EditOutlined />} onClick={() => handleEdit(id, row)} />
              </Tooltip>
            )}

            {/* Soft delete (archive) */}
            {acc.deleteAccess && !isDeleted && (
              <Popconfirm title="Delete this category?" description="The category will be deleted." okText="Yes" cancelText="No" onConfirm={() => handleSoftDelete(id)}>
                <Tooltip title="Delete category">
                  <Button size="small" type="text" danger style={{ borderRadius: 999 }} icon={<DeleteOutlined />}/>
                </Tooltip>
              </Popconfirm>
            )}

            {/* Restore for deleted roles */}
            {(acc.restoreAccess && isDeleted ) && (
              <Popconfirm title="Restore this category?" okText="Yes" cancelText="No" onConfirm={() => handleRestore(id)}>
                <Tooltip title="Restore category">
                  <Button size="small" type="text" style={{ borderRadius: 999 }} icon={<RollbackOutlined />}/>
                </Tooltip>
              </Popconfirm>
            )}

            {/* Hard delete – only for deleted roles and not system */}
            {(isDeleted && acc.hardDeleteAccess) && (
              <Popconfirm
                title="Permanently delete this category?"
                description="This action cannot be undone. All references to this category may be affected."
                okText="Delete"
                okType="danger"
                cancelText="Cancel"
                onConfirm={() => handleHardDelete(id)}
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
    return ( <Alert message="Access Denied" description="You do not have permission to view categories." type="warning" showIcon/>);
  }

  return (
    <div>
      {contextHolder}
      {isError ? (<Alert message="Error" description={error?.message || "Failed to load categories"} type="error" showIcon />) : (
        <Card size="small" bordered={false} className="card-style"
          styles={{
            header:{borderBottom:'none', padding:'10px'},
            body:{padding:'10px'}
           }}
          title={
            <Space align="center">
              <div className="card-icon-container">
                <div className="card-icon-wrapper">
                  <EnvironmentOutlined style={{ fontSize: 20, color: "#1d39c4" }} />
                </div>
              </div>
              <Space direction="vertical" size={0}>
                <Title level={4} style={{ margin: 0 }}> Category Management</Title>
                <Text type="secondary" style={{ fontSize: 12 }}> Manage Categories definitions for your lead</Text>
              </Space>
            </Space>
          }
          extra={
            <Space align="center">
              <Text type="secondary" style={{ fontSize: 12 }}>
                Total Categories:{" "}
                <Text strong style={{ color: "#2f54eb" }}>{data?.length || 0}</Text>
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
                <Button icon={<ReloadOutlined />} size="middle" style={{ borderRadius: 999,  boxShadow: "0px 4px 10px rgba(15, 23, 42, 0.06)", }} onClick={refetch} loading={loading} />
              </Tooltip>

              {acc.addAccess && ( <Button type="primary" icon={<PlusOutlined />} size="middle" style={{ borderRadius: 999, paddingInline: 18 }} onClick={handleAdd}> Add Category </Button>)}
            </Space>
          }
        >
          {/* Search bar */}
          <Card
            size="small"
            bordered={false}
            style={{ marginBottom: 12, borderRadius: 999, border:'1px solid #f0f2ff',
              background:"linear-gradient(90deg, rgba(240,245,255,0.9), rgba(255,255,255,0.95))",
            }}
            styles={{ body:{paddingBlock:8, paddingInline:14} }}
          >
            <Row align="middle" gutter={12}>
              <Col xs={24} md={10}>
              <Input
                  placeholder="Search categories by name, description"
                  value={search.q || ""}
                  allowClear
                  onChange={(e) => setSearch({ q: e.target.value })}
                  onClear={(e) => {setSearch({q:null}); refetchWithQuery({q:null})}}
                  style={{
                    borderRadius: 999, paddingInline: 16, paddingBlock: 8,
                    boxShadow: "0 4px 10px rgba(15,23,42,0.06)", 
                    border: "1px solid #dde4ff",
                  }}
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
            style={{
              borderRadius: 16, overflow: "hidden",
              background: "rgba(255, 255, 255, 0.98)",
            }}
            scroll={{
              y: util.getTableHeight ? util.getTableHeight() : "calc(100vh - 360px)",
              x: "max-content",
            }}
          />

          <Divider style={{ margin: "14px 0 8px" }} />
          <MyPagination {...{ qData }} total={qData?.total || data?.length || 0} DEFAULT_NUQS_CONFIG={DEFAULT_NUQS_CONFIG} />
        </Card>
      )}

      {/* Add / Edit Role Modal */}
      <Modal
        open={isEditModalOpen}
        onCancel={()=>handleModalClose()}
        destroyOnHidden
        footer={null}
        centered
        width={700}
        title={null}
        styles={{
          body:{padding:0, background:'linear-gradient(135deg, #f3f6ff 0%, #ffffff 35%, #fdf5ff 100%)'}
        }}
        closeIcon={<CloseSquareFilled />}
      >
        <Flex justify="space-between" align="center" style={{padding: 20, paddingBottom: 12, borderBottom: "1px solid #f0f0f0", gap: 8}}>
          <Space align="center">
            <Flex justify="center" align="center" style={{width: 36, height: 36, borderRadius: "999px", background:"radial-gradient(circle at 30% 20%, #e6f4ff, #d6e4ff)"}}>
              <EnvironmentOutlined style={{ color: "#1d39c4" }} />
            </Flex>
            <Space direction="vertical" size={0}>
              <Title level={4} style={{ margin: 0 }}>  {selectedId ? "View Category" : "Create Category"} </Title>
              <Text type="secondary" style={{ fontSize: 13 }}>{ selectedId ? 'Edit category details.' : 'Define the category details.'}</Text>
            </Space>
          </Space>
        </Flex>

        <div style={{ padding: 18, paddingTop: 6 }}>
          <CategoryForm id={selectedId} selectedCategory={selectedCategory} onSave={handleModalClose}/>
        </div>
      </Modal>
    </div>
  );
};

export default LeadCategory;

/*──────────────────── ROLE FORM ────────────────────*/

const CategoryForm = ({id, selectedCategory:initialData, onSave}) => {
  const [form] = Form.useForm();
  const isEdit = !!id;
  const [messageApi, contextHolder] = message.useMessage();

  const { mutate: createCategory, isPending:isCategoryCreating } = useCategoryCreate({
      onSuccess: (res) => {
        messageApi.success(res?.message || "Category saved successfully");
        onSave(true);
      },
      onError: (err) => {
        messageApi.error(err?.message || "Failed to save category");
      }
    });

  const {mutate: updateCategory, isPending:isCategoryUpdating} = useCategoryUpdate({
      onSuccess:(res) => {
        messageApi.success(res?.message || 'Category Updated Successfully');
        onSave(true);
      },
      onError: (err) => {
        messageApi.error(err?.message || 'Failed to update category');
      }
    }
  );

  useEffect(() => {
    if (!isEdit) {
      form.resetFields();
      return;
    }

    if (initialData) {
      form.setFieldsValue({
        name: initialData.name,
        description: initialData.description,
      });

    }
  }, [isEdit, id, initialData, form]);


  const handleFinish = (values) => {
    const payload = {
      ...values,
    };

    if (isEdit) {
      payload.id = id || null;
      updateCategory(payload);
    }else{
      createCategory(payload);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onSave?.();
  };

  const isSubmitting = isCategoryCreating || isCategoryUpdating;

  return (
    <Spin spinning={isSubmitting}>
    <Form layout="vertical" form={form} onFinish={handleFinish}>
      {/* ROLE INFO CARD */}
      {contextHolder}
      <Card
        size="small"
        style={{ marginBottom: 12, borderRadius: 14, border: "1px solid #f0f0f0", background: "rgba(255, 255, 255, 0.96)"}}
        styles={{
          body:{padding:12}
        }}
        title="Category Information"
      >
        <Row gutter={12}>
          <Col xs={24}>
            <Form.Item name="name" label="Category Name" rules={[{ required: true, message: "Please enter category name" }]}>
              <Input placeholder="e.g. Astrology" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={12}>
          <Col xs={24}>
            <Form.Item name="description" label="Description" rules={[{required:true}]}>
              <Input.TextArea rows={3} placeholder="Short description for this category" />
            </Form.Item>
          </Col>
        </Row>
      </Card>

      {/* ACTION BUTTONS */}
      <Row gutter={8} justify="end" style={{ marginTop: 10 }}>
        <Col xs={12} md={6}>
          <Button block onClick={handleCancel} style={{ borderRadius: 999 }} disabled={isSubmitting}> {isEdit ? 'Back' : 'Cancel'} </Button>
        </Col>

        <Col xs={12} md={6}>
          <Button type="primary" htmlType="submit" block loading={isSubmitting} disabled={isSubmitting} style={{ borderRadius: 999 }}>
            {isEdit ? "Save Changes" : "Create Category"}
          </Button>
        </Col>
      </Row>

    </Form>
    </Spin>
  );
};
