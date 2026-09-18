import { useState } from "react";
import {
  Button, Card, Col, Form, Input, message, Modal, Popconfirm, Row,
  Space, Table, Tag, Tooltip, Typography,
} from "antd";
import {
  PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined,
  EnvironmentOutlined, PhoneOutlined, MailOutlined,
} from "@ant-design/icons";
import {
  useCustomerList, useCreateCustomer, useUpdateCustomer, useDeleteCustomer,
} from "../../../api-hooks/customer";
import MyPagination from "../../components/Pagination";

const { Title, Text } = Typography;

const Customers = () => {
  const [messageApi, contextHolder] = message.useMessage();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [form] = Form.useForm();

  const { data: customerRes, isFetching, refetch, refetchWithQuery } = useCustomerList({
    qData: { page: 1, limit: 20 },
  });
  const customerList = customerRes?.data || [];
  const qData = customerRes?.qData;

  const { mutate: createCustomer, isPending: isCreating } = useCreateCustomer({
    onSuccess: (res) => {
      messageApi.success(res?.message || "Customer created");
      setIsModalOpen(false);
      form.resetFields();
      refetch();
    },
    onError: (err) => messageApi.error(err?.message || "Failed to create customer"),
  });

  const { mutate: updateCustomer, isPending: isUpdating } = useUpdateCustomer({
    onSuccess: (res) => {
      messageApi.success(res?.message || "Customer updated");
      setIsModalOpen(false);
      form.resetFields();
      setEditingCustomer(null);
      refetch();
    },
    onError: (err) => messageApi.error(err?.message || "Failed to update customer"),
  });

  const { mutate: deleteCustomer } = useDeleteCustomer({
    onSuccess: (res) => {
      messageApi.success(res?.message || "Customer deleted");
      refetch();
    },
    onError: (err) => messageApi.error(err?.message || "Failed to delete customer"),
  });

  const handleOpenCreate = () => {
    setEditingCustomer(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleOpenEdit = (record) => {
    setEditingCustomer(record);
    form.setFieldsValue(record);
    setIsModalOpen(true);
  };

  const handleSubmit = () => {
    form.validateFields().then((values) => {
      if (editingCustomer) {
        updateCustomer({ id: editingCustomer.id, ...values });
      } else {
        createCustomer(values);
      }
    });
  };

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (v) => <Text strong>{v}</Text>,
    },
    {
      title: "Company",
      dataIndex: "companyName",
      key: "companyName",
      render: (v) => v || "—",
    },
    {
      title: "Contact Person",
      dataIndex: "contactPerson",
      key: "contactPerson",
      render: (v) => v || "—",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      render: (v) =>
        v ? (
          <Space size={4}>
            <MailOutlined style={{ color: "#1890ff" }} />
            {v}
          </Space>
        ) : (
          "—"
        ),
    },
    {
      title: "Phone",
      dataIndex: "phone",
      key: "phone",
      render: (v) =>
        v ? (
          <Space size={4}>
            <PhoneOutlined style={{ color: "#52c41a" }} />
            {v}
          </Space>
        ) : (
          "—"
        ),
    },
    {
      title: "Address",
      dataIndex: "address",
      key: "address",
      ellipsis: true,
      render: (v) =>
        v ? (
          <Tooltip title={v}>
            <Space size={4}>
              <EnvironmentOutlined />
              {v}
            </Space>
          </Tooltip>
        ) : (
          "—"
        ),
    },
    {
      title: "Actions",
      key: "actions",
      width: 120,
      render: (_, record) => (
        <Space>
          <Tooltip title="Edit">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleOpenEdit(record)}
            />
          </Tooltip>
          <Popconfirm
            title="Delete this customer?"
            onConfirm={() => deleteCustomer(record.id)}
            okText="Delete"
            cancelText="Cancel"
          >
            <Tooltip title="Delete">
              <Button type="text" danger icon={<DeleteOutlined />} />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      {contextHolder}
      <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
        <Col>
          <Title level={4} style={{ margin: 0 }}>Customers</Title>
        </Col>
        <Col>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleOpenCreate}>
            Add Customer
          </Button>
        </Col>
      </Row>

      <Card>
        <Table
          columns={columns}
          dataSource={customerList}
          loading={isFetching}
          pagination={false}
          scroll={{ x: 900 }}
          size="middle"
        />
        {qData && (
          <div style={{ marginTop: 16, display: "flex", justifyContent: "flex-end" }}>
            <MyPagination
              current={qData.page}
              total={qData.total}
              pageSize={qData.limit}
              onChange={(page, pageSize) => refetchWithQuery({ page, limit: pageSize })}
            />
          </div>
        )}
      </Card>

      {/* Create / Edit Modal */}
      <Modal
        title={editingCustomer ? "Edit Customer" : "Add Customer"}
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          setEditingCustomer(null);
          form.resetFields();
        }}
        onOk={handleSubmit}
        confirmLoading={isCreating || isUpdating}
        okText={editingCustomer ? "Update" : "Create"}
        width={600}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="name" label="Name" rules={[{ required: true, message: "Name is required" }]}>
                <Input placeholder="Customer name" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="companyName" label="Company Name">
                <Input placeholder="Company name" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="contactPerson" label="Contact Person">
                <Input placeholder="Contact person" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="email" label="Email" rules={[{ type: "email", message: "Invalid email" }]}>
                <Input placeholder="Email" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="phone" label="Phone">
                <Input placeholder="Phone number" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="address" label="Address">
                <Input placeholder="Address" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="latitude" label="Latitude">
                <Input type="number" placeholder="Latitude" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="longitude" label="Longitude">
                <Input type="number" placeholder="Longitude" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
};

export default Customers;
