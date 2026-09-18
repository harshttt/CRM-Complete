import React, { useState, useEffect } from 'react';
import { Avatar, Button, Card, Col, Descriptions, Divider, Form, Input, message, Modal, Row, Space, Tag, Typography, Steps, Alert, Tooltip, Result, Checkbox, Flex} from "antd";
import { UserOutlined, MailOutlined, PhoneOutlined, LockOutlined, LogoutOutlined, TeamOutlined, WarningOutlined, DeleteOutlined, InfoCircleOutlined, ArrowLeftOutlined, ExclamationCircleOutlined,} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import commonObj from '../../../commonObj';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Step } = Steps;

const DeleteAccountPage = () => {
  const [messageApi, contextHolder] = message.useMessage();
  const [userData, setUser] = useState(null);
  const navigate = useNavigate();

  // Delete account states
  const [currentStep, setCurrentStep] = useState(0);
  const [confirmText, setConfirmText] = useState('');
  const [feedback, setFeedback] = useState('');
  const [agreements, setAgreements] = useState({
    dataLoss: false,
    subscriptions: false,
  });
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    const user = commonObj?.user;
    if (!user) {
      navigate('/');
      return;
    }
    setUser(user);
  }, [navigate]);

  const handleBack = () => {
    navigate('/profile');
  };

  const handleDeleteAccount = async () => {
    setDeleteLoading(true);
    try {
      // Simulate API call - replace with your actual delete account API
      console.log('Deleting account with feedback:', feedback);
      // await deleteAccountAPI({ userId: commonObj.id, feedback });
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      setShowSuccess(true);
      messageApi.success('Account deletion initiated successfully');
      
      // Optional: Clear local storage and redirect after showing success
      setTimeout(() => {
        window?.localStorage?.clear();
        navigate('/');
        window.location.reload();
      }, 3000);

    } catch (error) {
      messageApi.error('Failed to delete account. Please try again.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const canProceed = () => {
    if (currentStep === 0) {
      return confirmText === 'DELETE' && agreements.dataLoss && agreements.subscriptions;
    }
    return true;
  };

  const handleNext = () => {
    if (currentStep === 0 && canProceed()) {
      setCurrentStep(1);
    } else if (currentStep === 1) {
      handleDeleteAccount();
    }
  };

  const handlePrevious = () => {
    setCurrentStep(0);
  };

  // Step 1: Confirmation
  const renderConfirmationStep = () => (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Card bordered={false}
        style={{
          background: "linear-gradient(135deg, rgba(255, 77, 79, 0.08), rgba(255,255,255,0.96))",
          border: "1px solid rgba(255,77,79,0.2)",
          boxShadow: "0 18px 40px rgba(15,23,42,0.12)",
        }}
        bodyStyle={{ padding: 24 }}
      >
        <Space direction="vertical" size={16} style={{ width: '100%' }}>
          <Space size={12}>
            <Flex justify='center' align='center' style={{ width: 48, height: 48, borderRadius: '50%', background: 'linear-gradient(135deg, #ff4d4f, #ff7875)',}}>
              <WarningOutlined style={{ color: 'white', fontSize: 24 }} />
            </Flex>
            <div>
              <Title level={4} style={{ margin: 0, color: '#ff4d4f' }}>Warning: This action cannot be undone!</Title>
              <Text type="secondary">Deleting your account is permanent and irreversible.</Text>
            </div>
          </Space>

          <Divider style={{ margin: '8px 0' }} />

          <Row gutter={[16, 16]}>
            <Col span={24}>
              <Card
                bordered={false}
                style={{
                  borderRadius: 16,
                  background: "radial-gradient(circle at 0% 0%, #ddeaff 0, #f4f6ff 35%, #ffffff 100%)",
                }}
                bodyStyle={{ padding: 16 }}
              >
                <Title level={5} style={{ marginBottom: 12 }}>What happens when you delete your account:</Title>
                <ul style={{ paddingLeft: 20, marginBottom: 0, color: '#595959' }}>
                  <li style={{ marginBottom: 8 }}>Your profile and personal information will be permanently deleted</li>
                  <li style={{ marginBottom: 8 }}>All your posts, comments, and messages will be removed</li>
                  <li style={{ marginBottom: 8 }}>You'll lose access to all purchased content and subscriptions</li>
                  <li style={{ marginBottom: 8 }}>Your username will become available for others to use</li>
                  <li style={{ marginBottom: 8 }}>This action cannot be reversed</li>
                </ul>
              </Card>
            </Col>
          </Row>

          <Form layout="vertical">
            <Form.Item
              label={
                <Space>
                  <Text strong>Type "DELETE" to confirm</Text>
                  <Tooltip title="This confirms you understand the consequences">
                    <InfoCircleOutlined style={{ color: '#999' }} />
                  </Tooltip>
                </Space>
              }
              required
            >
              <Input
                placeholder="Type DELETE here"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                style={{
                  width: '100%',
                  borderRadius: 12,
                  height: 45,
                }}
                prefix={<LockOutlined style={{ color: '#bfbfbf' }} />}
              />
            </Form.Item>

            <Form.Item>
              <Space direction="vertical" style={{ width: '100%' }} size={12}>
                <Checkbox
                  checked={agreements.dataLoss}
                  onChange={(e) =>
                    setAgreements({ ...agreements, dataLoss: e.target.checked })
                  }
                >
                  <Text>I understand that all my data will be permanently lost</Text>
                </Checkbox>
                <Checkbox
                  checked={agreements.subscriptions}
                  onChange={(e) =>
                    setAgreements({ ...agreements, subscriptions: e.target.checked })
                  }
                >
                  <Text>I understand that my subscriptions will be cancelled and I won't receive refunds</Text>
                </Checkbox>
              </Space>
            </Form.Item>
          </Form>
        </Space>
      </Card>
    </Space>
  );

  // Step 2: Feedback
  const renderFeedbackStep = () => (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Card bordered={false}
        style={{
          background: "linear-gradient(135deg, rgba(79, 140, 255, 0.08), rgba(255,255,255,0.96))",
          border: "1px solid rgba(79,140,255,0.2)",
          boxShadow: "0 18px 40px rgba(15,23,42,0.12)",
        }}
        bodyStyle={{ padding: 24 }}
      >
        <Space direction="vertical" size={16} style={{ width: '100%' }}>
          <Space size={12}>
            <Flex justify='center' align='center' style={{ width: 48, height: 48, borderRadius: '50%', background: 'linear-gradient(135deg,#2f54eb,#13c2c2,#40a9ff)',}}>
              <InfoCircleOutlined style={{ color: 'white', fontSize: 24 }} />
            </Flex>
            <div>
              <Title level={4} style={{ margin: 0, color: '#2f54eb' }}>We're sorry to see you go</Title>
              <Text type="secondary">Your feedback helps us improve. Would you mind telling us why you're leaving?</Text>
            </div>
          </Space>

          <Form layout="vertical">
            <Form.Item label={<Text strong>Reason for leaving (optional)</Text>}>
              <TextArea rows={5} value={feedback} onChange={(e) => setFeedback(e.target.value)} placeholder="Please share your feedback..." maxLength={500} showCount style={{ borderRadius: 12 }} />
            </Form.Item>
          </Form>

          <Alert
            message={
              <Space>
                <ExclamationCircleOutlined />
                <Text strong>Final confirmation required</Text>
              </Space>
            }
            description="Please confirm once more that you want to proceed with account deletion. This action is irreversible."
            type="warning"
            showIcon
            style={{ borderRadius: 12 }}
          />
        </Space>
      </Card>
    </Space>
  );

  // Success State
  const renderSuccess = () => (
    <Card
      bordered={false}
      style={{
        background: "radial-gradient(circle at 0% 0%, #ddeaff 0, #f4f6ff 35%, #ffffff 100%)",
        boxShadow: "0 18px 40px rgba(15,23,42,0.12)",
        border: "1px solid rgba(255,255,255,0.8)",
        textAlign: 'center'
      }}
      bodyStyle={{ padding: 40 }}
    >
      <Result
        status="success"
        title="Account Deletion Initiated"
        subTitle={
          <Space direction="vertical" size={8}>
            <Text>Your account deletion request has been received.</Text>
            <Text type="secondary" style={{ fontSize: 14 }}>
              You will receive a confirmation email at <Text strong>{userData?.email}</Text>.
              Your account will be permanently deleted within 30 days.
            </Text>
          </Space>
        }
        extra={[
          <Tag color="blue" style={{ borderRadius: 999, padding: '8px 16px', marginTop: 16 }}>
            <InfoCircleOutlined /> If this was a mistake, you can cancel by logging in within 30 days
          </Tag>,
        ]}
      />
    </Card>
  );

  if (!userData) return null;

  return (
    <div style={{ padding: 24, background: "radial-gradient(circle at 0% 0%, #ddeaff 0, #f4f6ff 35%, #ffffff 100%)", minHeight: "100vh"}}>
      {contextHolder}
      {/* Main Content */}
      <Row gutter={[16, 16]} justify="center">
        <Col xs={24} lg={20} xl={16}>
          {/* Steps Indicator */}
          {/* {!showSuccess && (
            <Card
              bordered={false}
              style={{ borderRadius: 22, marginBottom: 24,
                background: "linear-gradient(135deg, rgba(79, 140, 255, 0.08), rgba(255,255,255,0.96))",
                boxShadow: "0 18px 40px rgba(15,23,42,0.12)", border: "1px solid rgba(255,255,255,0.8)",
              }}
              bodyStyle={{ padding: 24 }}
            >
              <Steps current={currentStep} size="small">
                <Step title="Confirmation" description="Review consequences" />
                <Step title="Feedback" description="Optional feedback" />
              </Steps>
            </Card>
          )} */}

          {/* Content based on state */}
          {showSuccess ? ( renderSuccess()) : (
            <Card bordered={false} bodyStyle={{ padding:0 }}>
              {currentStep === 0 && renderConfirmationStep()}
              {currentStep === 1 && renderFeedbackStep()}

              <Divider style={{ margin: '24px 0 16px' }} />

              <Row gutter={[16, 16]} justify="end" style={{padding:'5px'}}>
                <Col>
                  {currentStep === 1 && ( <Button onClick={handlePrevious} style={{ borderRadius: 999, marginRight: 8 }}> Previous </Button>)}
                  <Button type="primary" danger={currentStep === 0} onClick={handleNext} loading={deleteLoading} disabled={!canProceed()}
                    icon={currentStep === 1 ? <DeleteOutlined /> : null}
                    style={{
                      borderRadius: 999,
                      background: currentStep === 1 ? 'linear-gradient(135deg, #ff4d4f, #ff7875)' : undefined,
                      border: 'none'
                    }}
                  >
                    {currentStep === 0 && 'Continue'}
                    {currentStep === 1 && 'Permanently Delete Account'}
                  </Button>
                </Col>
              </Row>
            </Card>
          )}
        </Col>
      </Row>
    </div>
  );
};

export default DeleteAccountPage;