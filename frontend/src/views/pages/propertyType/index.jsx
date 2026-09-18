import { parseAsString, useQueryState, useQueryStates,} from "nuqs";
import { getSortingStateParser } from "../../../utils/parsers";
import { useState, useEffect, useMemo } from "react";
import util from "../../../utils/util";
import MyPagination from "../../components/Pagination";
import {Alert, Button, Card, Col, Divider, Input, message, Modal, Popconfirm, Row, Space, Table, Tag, Tooltip, Typography, Form, Spin, Flex, Avatar, Switch} from "antd";
import {CloseSquareFilled, DeleteOutlined, EditOutlined, EnvironmentOutlined, PlusOutlined, ReloadOutlined, RollbackOutlined,StopOutlined} from "@ant-design/icons";
import {useCategoryCreate, useCategoryDelete, useCategoryList, useCategoryRestore, useCategoryUpdate } from "../../../api-hooks/category";
import { useHardDeleteRole } from "../../../api-hooks/roles";

const { Text, Title } = Typography;
const allowURLStateUpdate = true;

/* ───────── DUMMY DATA ───────── */
const dummyPropertyTypes = [
  {
    id: "PT-001",
    name: "Apartment",
    code: "APT",
    image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2",
    status: true,
  },
  {
    id: "PT-002",
    name: "Villa",
    code: "VIL",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c",
    status: true,
  },
  {
    id: "PT-003",
    name: "Penthouse",
    code: "PEN",
    image: "https://images.unsplash.com/photo-1598928506311-c55ded91a20c",
    status: false,
  },
  {
    id: "PT-004",
    name: "Plot",
    code: "PLT",
    image: "https://images.unsplash.com/photo-1507089947368-19c1da9775ae",
    status: true,
  },
];

const PropertyType = () => {
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

  const { data: resData, isFetching:loading, isError, error, refetch,refetchWithQuery} = useCategoryList({ page: 1, limit: 20 });

  // soft delete (archive)
  const { mutate: deleteCategory, isPending: isSoftDeleting } = useCategoryDelete({
    onSuccess: (res) => {
      messageApi.success(res?.message || "Category deleted successfully");
      refetchWithQuery?.();
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
        refetchWithQuery?.();
      },
      onError: (err) => {
        messageApi.error(err?.message || "Failed to hard delete category");
      },
    });

  const data = resData?.data || [];
  const qData = resData?.qData || {
    page: 1,
    limit: 20,
    total: data.length,
    totalPages: 1,
  };

  const [selectedId, setSelectedId] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [showDeleted, setShowDeleted] = useState(true);
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


  const filteredData = useMemo(() => {
    const term = search.toLowerCase().trim();

    return (dummyPropertyTypes || []).filter((propertyType) => {
        if (!showDeleted && propertyType.isDeleted) return false;
        return true;
      }).filter((r) => {
        if (!term) return true;

        const name = String(r.name || "").toLowerCase();
        const description = String(r.description || "").toLowerCase();

        return (name.includes(term) || description.includes(term));
      });
  }, [dummyPropertyTypes, search, showDeleted]);


  /* ───────── TABLE COLUMNS ───────── */
  const columns = [
    {
      title: "S. No.",
      align: "center",
      width: 80,
      render: (_, __, index) => {
        const page = qData.page || 1;
        const limit = qData.limit || 20;
        return (page - 1) * limit + index + 1;
      },
    },
    {
      title: "Image",
      dataIndex: "image",
      align: "center",
      width: 90,
      render: (v) => <Avatar size={44} src={v} />,
    },
    {
      title: "Property Type",
      dataIndex: "name",
      render: (v) => <Text strong>{v}</Text>,
    },
    {
      title: "Code",
      dataIndex: "code",
      align: "center",
      width: 120,
      render: (v) => <Text>{v}</Text>,
    },
    {
      title: "Status",
      dataIndex: "status",
      align: "center",
      width: 140,
      render: (v, row) => <ToggleStatus data={row} />,
    },
    {
      title: "Actions",
      dataIndex: "id",
      align: "center",
      width: 140,
      render: (_, row) => (
        <Space size="small">
          <Button size="small" type="text" icon={<EditOutlined />} style={{ borderRadius: 999 }} onClick={() => handleEdit(row)} />
          <Popconfirm title="Delete this property type?">
            <Button size="small" type="text" danger icon={<DeleteOutlined />} style={{ borderRadius: 999 }}/>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const rowClassName = (_, index) => index % 2 === 0 ? "table-row-light" : "table-row-dark";

  if (!acc.viewAccess) {
    return ( <Alert message="Access Denied" description="You do not have permission to view property type." type="warning" showIcon/>);
  }

  return (
    <div>
      {contextHolder}
      {isError ? (<Alert message="Error" description={error?.message || "Failed to load property types"} type="error" showIcon />) : (
        <Card size="small" bordered={false} className="card-style"
          styles={{header:{borderBottom:'none', padding:'18px 22px 6px'}, body:{padding:'8px 22px 18px'}}}
          title={
            <Space align="center">
              <div className="card-icon-container">
                <div className="card-icon-wrapper">
                  <EnvironmentOutlined style={{ fontSize: 20, color: "#1d39c4" }} />
                </div>
              </div>
              <Space direction="vertical" size={0}>
                <Title level={4} style={{ margin: 0 }}> Property Type Management</Title>
                <Text type="secondary" style={{ fontSize: 12 }}>Manage Property type definitions for your properties</Text>
              </Space>
            </Space>
          }
          extra={
            <Space align="center">
              <Text type="secondary" style={{ fontSize: 12 }}>
                Total Property Types:{" "}
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

              {acc.addAccess && (<Button type="primary" icon={<PlusOutlined />} size="middle" style={{ borderRadius: 999, paddingInline: 18 }} onClick={handleAdd}> Add Property Type </Button>)}
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
              border: "1px solid #f0f2ff",
            }}
            styles={{body:{ paddingBlock:8, paddingInline:14}}}
          >
            <Row align="middle" gutter={12}>
              <Col xs={24} md={18}>
                <Input
                  placeholder="Search categories by name, description"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
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
          </Card>

          {/* Table */}
          <Table
            pagination={false}
            columns={columns}
            dataSource={filteredData}
            loading={loading}
            rowClassName={rowClassName}
            rowKey="id"
            style={{borderRadius: 16, overflow: "hidden", background: "rgba(255, 255, 255, 0.98)",}}
            scroll={{y: util.getTableHeight ? util.getTableHeight() : "calc(100vh - 360px)", x: "max-content"}}
          />

          <Divider style={{ margin: "14px 0 8px" }} />
          <MyPagination {...{ qData }} total={qData?.total || filteredData?.length || 0} DEFAULT_NUQS_CONFIG={DEFAULT_NUQS_CONFIG} />
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
        styles={{ body:{padding:0, background:'linear-gradient(135deg, #f3f6ff 0%, #ffffff 35%, #fdf5ff 100%)'}}}
        closeIcon={<CloseSquareFilled />}
      >
        <Flex justify="space-between" align="center" style={{padding: 20, paddingBottom: 12, borderBottom: "1px solid #f0f0f0", gap: 8}}>
          <Space align="center">
            <Flex justify="center" align="center" style={{width: 36, height: 36, borderRadius: "999px", background:"radial-gradient(circle at 30% 20%, #e6f4ff, #d6e4ff)"}}>
              <EnvironmentOutlined style={{ color: "#1d39c4" }} />
            </Flex>
            <Space direction="vertical" size={0}>
              <Title level={4} style={{ margin: 0 }}>  {selectedId ? "View Property Type" : "Create Property Type"} </Title>
              <Text type="secondary" style={{ fontSize: 13 }}>{ selectedId ? 'Edit property type details.' : 'Define the property type details.'}</Text>
            </Space>
          </Space>
        </Flex>

        <div style={{ padding: 18, paddingTop: 6 }}>
          <PropertyTypeForm id={selectedId} selectedCategory={selectedCategory} onSave={handleModalClose}/>
        </div>
      </Modal>
    </div>
  );
};

export default PropertyType;

/*──────────────────── ROLE FORM ────────────────────*/

const PropertyTypeForm = ({id, selectedCategory:initialData, onSave}) => {
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
        title="Property Type Information"
      >
        <Row gutter={12}>
          <Col xs={24}>
            <Form.Item name="name" label="Property Type Name" rules={[{ required: true, message: "Please enter property type name" }]}>
              <Input placeholder="e.g. Apartment" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={12}>
          <Col xs={24}>
            <Form.Item name="description" label="Description" rules={[{required:true}]}>
              <Input.TextArea rows={3} placeholder="Short description for this property type" />
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
            {isEdit ? "Save Changes" : "Create Property Type"}
          </Button>
        </Col>
      </Row>

    </Form>
    </Spin>
  );
};


/* ───────── STATUS TOGGLE ───────── */
function ToggleStatus({ data }) {
  return ( <Switch checked={data?.status} checkedChildren="Active" unCheckedChildren="Inactive" onChange={() => console.log("Toggle status:", data.id)}/>);
}