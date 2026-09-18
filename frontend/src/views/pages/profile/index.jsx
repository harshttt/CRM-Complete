import { Avatar, Button, Card, Col, Descriptions, Divider, Form, Input, message, Modal, Row, Space, Tag, Typography } from "antd";
import { 
  UserOutlined, 
  MailOutlined, 
  PhoneOutlined, 
  LockOutlined, 
  LogoutOutlined, 
  TeamOutlined, 
  ApartmentOutlined, 
  CalendarOutlined,
  EditOutlined,
  WarningOutlined,
  DeleteOutlined,
  InfoCircleOutlined
} from "@ant-design/icons";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom"; // Add Link import
import commonObj from '../../../commonObj';
import { usePasswordUpdate } from "../../../api-hooks/admin";

const { Title, Text } = Typography;

const Profile = () => {
  const [messageApi, contextHolder] = message.useMessage();
  const [userData, setUser] = useState(null);
  const navigate = useNavigate();

  // Modal visibility
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);

  // Form instances
  const [editForm] = Form.useForm();
  const [passwordForm] = Form.useForm();

  // Loading states for submit buttons
  const [editLoading, setEditLoading] = useState(false);

  const { mutate: changePassword, isMutationg: isPasswordChanging } = usePasswordUpdate({
    onSuccess: (res) => {
      messageApi.success(res.message);
      passwordForm.resetFields();
      setPasswordModalVisible(false);
    },
    onError: (err) => {
      messageApi.error(err.message);
    }
  });

  useEffect(() => {
    const user = commonObj?.user;
    setUser(user);
    if (user) {
      editForm.setFieldsValue({
        name: user.name,
        email: user.email,
        phone: user.phone,
      });
    }
  }, [commonObj?.user, editForm]);

  // Handlers
  const handleEditProfile = async () => {
    try {
      const values = await editForm.validateFields();
      setEditLoading(true);
      // Simulate API call – replace with your actual update function
      setTimeout(() => {
        const updatedUser = { ...userData, ...values };
        setUser(updatedUser);
        // If commonObj.user is mutable, update it as well
        if (commonObj.user) {
          commonObj.user = updatedUser;
        }
        message.success('Profile updated successfully');
        setEditModalVisible(false);
        setEditLoading(false);
      }, 1000);
    } catch (error) {
      // validation failed
    }
  };

  const handleChangePassword = async () => {
    try {
      const values = await passwordForm.validateFields();
      if (values.newPassword !== values.confirmPassword) {
        message.error('New password and confirm password do not match');
        return;
      }
      changePassword({ id: commonObj.id, ...values });
    } catch (error) {
      console.log("Error occured in change password:", error);
    }
  };

  const handleLogout = () => {
    window?.localStorage?.clear();
    navigate('/');
    window.location.reload();
  };

  return (
    <div style={{
      padding: 12,
      background: "radial-gradient(circle at 0% 0%, #ddeaff 0, #f4f6ff 35%, #ffffff 100%)",
      minHeight: "77vh",
    }}>
      {contextHolder}
      <Space direction="vertical" size="large" style={{ width: "100%"}}>
        {/* Header Card */}
        <Card 
          bordered={false}
          style={{
            height:'77vh',
            borderRadius: 22, 
            padding: 18,
            background: "linear-gradient(135deg, rgba(79, 140, 255, 0.08), rgba(255,255,255,0.96))",
            boxShadow: "0 18px 40px rgba(15,23,42,0.12)",
            border: "1px solid rgba(255,255,255,0.8)",
          }}
          styles={{ body: { padding: 0 } }}
        >
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} md={16}>
              <Space align="center" style={{ padding: 18 }} size={18}>
                <div style={{ position: "relative" }}>
                  <Avatar size={80} icon={<UserOutlined />} style={{background: "linear-gradient(135deg, #2f54eb, #13c2c2, #40a9ff)"}}  />
                  <span style={{
                    position: "absolute", 
                    bottom: 4, 
                    right: 4, 
                    width: 10, 
                    height: 10,
                    borderRadius: "999px", 
                    background: "#52c41a",
                    boxShadow: "0 0 0 2px #ffffff"
                  }} />
                </div>

                <Space direction="vertical" size={4}>
                  <Space size={8} align="center" wrap>
                    <Title level={3} style={{ margin: 0, display: "flex", gap: 8 }}>
                      {userData?.name}
                    </Title>
                  </Space>
                  <Space size={8} wrap>
                    <Tag 
                      icon={<TeamOutlined />} 
                      color="blue" 
                      style={{ borderRadius: 999, fontSize: 11 }}
                    >
                      {userData?.role?.name}
                    </Tag>
                    {userData?.department && (
                      <Tag 
                        icon={<ApartmentOutlined />} 
                        color="cyan" 
                        style={{ borderRadius: 999, fontSize: 11 }}
                      >
                        {userData?.department}
                      </Tag>
                    )}
                  </Space>
                  <Space direction="vertical" size={2} style={{ fontSize: 13, color: "#595959" }}>
                    <Space>
                      <MailOutlined />
                      <span>{userData?.email}</span>
                    </Space>
                    <Space>
                      <PhoneOutlined />
                      <span>{userData?.phone || 'Not provided'}</span>
                    </Space>
                  </Space>
                </Space>
              </Space>
            </Col>

            <Col xs={24} md={8}>
              <div
                style={{
                  padding: 18, 
                  borderLeft: "1px dashed rgba(5,5,5,0.06)",
                  borderTop: "1px dashed rgba(5,5,5,0.06)", 
                  borderRadius: "0 0 22px 0",
                  background: "radial-gradient(circle at 10% 0%, #e6f0ff, #ffffff)",
                  display: "flex", 
                  flexDirection: "column", 
                  gap: 8, 
                  alignItems: "flex-end",
                  justifyContent: "space-between", 
                  height: "100%",
                }}
              >
                <Text type="secondary" style={{ fontSize: 12 }}>Quick Actions</Text>
                <Space>
                  <Button icon={<EditOutlined />}  style={{ borderRadius: 999 }}  size="small"  onClick={() => setEditModalVisible(true)}> Edit Profile </Button>
                  {commonObj?.role?.roleLevel === 1 && (
                    <Button  icon={<LockOutlined />}  size="small"  style={{ borderRadius: 999 }} onClick={() => setPasswordModalVisible(true)}>
                      Change Password
                    </Button>
                  )}
                </Space>
                <Button danger type="text" icon={<LogoutOutlined />} size="small" style={{ borderRadius: 999, marginTop: 8 }} onClick={handleLogout}>Logout</Button>
              </div>
            </Col>

          </Row>
        </Card>

      </Space>

      {/* Edit Profile Modal */}
      <Modal
        title={
          <Space>
            <EditOutlined style={{ color: '#2f54eb' }} />
            <span>Edit Profile</span>
          </Space>
        }
        open={editModalVisible}
        onOk={handleEditProfile}
        onCancel={() => {
          setEditModalVisible(false);
          editForm.resetFields();
        }}
        okText="Save Changes"
        cancelText="Cancel"
        confirmLoading={editLoading}
        style={{ top: 50 }}
        bodyStyle={{
          background: "radial-gradient(circle at 0% 0%, #ddeaff 0, #f4f6ff 35%, #ffffff 100%)",
          padding: '24px'
        }}
      >
        <Form form={editForm} layout="vertical" name="editProfile">
          <Form.Item
            name="name"
            label="Full Name"
            rules={[{ required: true, message: 'Please enter your name' }]}
          >
            <Input 
              prefix={<UserOutlined style={{ color: '#bfbfbf' }} />} 
              placeholder="Full Name" 
              style={{ borderRadius: 8 }} 
            />
          </Form.Item>
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Please enter your email' },
              { type: 'email', message: 'Please enter a valid email' }
            ]}
          >
            <Input 
              prefix={<MailOutlined style={{ color: '#bfbfbf' }} />} 
              placeholder="Email" 
              style={{ borderRadius: 8 }} 
            />
          </Form.Item>
          <Form.Item
            name="phone"
            label="Phone"
            rules={[{ required: true, message: 'Please enter your phone number' }]}
          >
            <Input 
              prefix={<PhoneOutlined style={{ color: '#bfbfbf' }} />} 
              placeholder="Phone" 
              style={{ borderRadius: 8 }} 
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* Change Password Modal */}
      <Modal
        title={
          <Space>
            <LockOutlined style={{ color: '#2f54eb' }} />
            <span>Change Password</span>
          </Space>
        }
        open={passwordModalVisible}
        onOk={handleChangePassword}
        onCancel={() => {
          setPasswordModalVisible(false);
          passwordForm.resetFields();
        }}
        okText="Update Password"
        cancelText="Cancel"
        confirmLoading={isPasswordChanging}
        style={{ top: 50 }}
        bodyStyle={{
          background: "radial-gradient(circle at 0% 0%, #ddeaff 0, #f4f6ff 35%, #ffffff 100%)",
          padding: '24px'
        }}
      >
        <Form form={passwordForm} layout="vertical" name="changePassword">
          <Form.Item
            name="oldPassword"
            label="Current Password"
            rules={[{ required: true, message: 'Please enter your current password' }]}
          >
            <Input.Password placeholder="Current Password" style={{ borderRadius: 8 }} />
          </Form.Item>
          <Form.Item
            name="newPassword"
            label="New Password"
            rules={[
              { required: true, message: 'Please enter new password' },
              { min: 6, message: 'Password must be at least 6 characters' }
            ]}
          >
            <Input.Password placeholder="New Password" style={{ borderRadius: 8 }} />
          </Form.Item>
          <Form.Item
            name="confirmPassword"
            label="Confirm New Password"
            dependencies={['newPassword']}
            rules={[
              { required: true, message: 'Please confirm your new password' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('newPassword') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('The two passwords do not match'));
                },
              }),
            ]}
          >
            <Input.Password placeholder="Confirm New Password" style={{ borderRadius: 8 }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Profile;