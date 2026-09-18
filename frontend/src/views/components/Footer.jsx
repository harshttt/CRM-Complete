import React, { useState } from 'react';
import { Layout, Typography, Space, Divider, Modal, Button, Row, Col } from 'antd';
import { GithubOutlined, LinkedinOutlined, TwitterOutlined, MailOutlined, CopyrightOutlined, SafetyCertificateOutlined, FileTextOutlined, TeamOutlined, GlobalOutlined, PhoneOutlined} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Footer: AntFooter } = Layout;
const { Text, Title, Paragraph } = Typography;

const Footer = () => {
  const navigate = useNavigate();
  const [policyModalVisible, setPolicyModalVisible] = useState(false);
  const [termsModalVisible, setTermsModalVisible] = useState(false);
  const currentYear = new Date().getFullYear();

  // Privacy Policy Modal
  const PrivacyPolicyModal = () => (
    <Modal
      title={
        <Space>
          <SafetyCertificateOutlined style={{ color: '#2f54eb' }} />
          <span style={{ fontSize: 20, fontWeight: 500 }}>Privacy Policy</span>
        </Space>
      }
      open={policyModalVisible}
      onCancel={() => setPolicyModalVisible(false)}
      footer={[
        <Button 
          key="close" 
          type="primary" 
          onClick={() => setPolicyModalVisible(false)}
          style={{ 
            borderRadius: 999,
            background: "linear-gradient(135deg,#2f54eb,#13c2c2,#40a9ff)",
            border: 'none'
          }}
        >
          Close
        </Button>
      ]}
      width={700}
      style={{ top: 50 }}
      bodyStyle={{
        background: "radial-gradient(circle at 0% 0%, #ddeaff 0, #f4f6ff 35%, #ffffff 100%)",
        padding: 24,
        maxHeight: '60vh',
        overflowY: 'auto'
      }}
    >
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Card 
          bordered={false}
          style={{
            borderRadius: 16,
            background: "linear-gradient(135deg, rgba(79, 140, 255, 0.08), rgba(255,255,255,0.96))",
            border: "1px solid rgba(79,140,255,0.2)",
          }}
          bodyStyle={{ padding: 16 }}
        >
          <Paragraph>
            <Text strong>Last Updated: {currentYear}</Text>
          </Paragraph>
          <Paragraph>
            Your privacy is important to us. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our application.
          </Paragraph>
        </Card>

        <Title level={5}>1. Information We Collect</Title>
        <Paragraph>
          We collect personal information that you voluntarily provide to us when registering for the application, expressing interest in obtaining information about us or our products, or otherwise contacting us. The personal information we collect may include:
        </Paragraph>
        <ul style={{ paddingLeft: 20, color: '#595959' }}>
          <li>Name and contact information (email, phone number)</li>
          <li>Account credentials (username, password)</li>
          <li>Profile information (avatar, department, role)</li>
          <li>Usage data and preferences</li>
        </ul>

        <Title level={5}>2. How We Use Your Information</Title>
        <Paragraph>
          We use the information we collect to:
        </Paragraph>
        <ul style={{ paddingLeft: 20, color: '#595959' }}>
          <li>Create and manage your account</li>
          <li>Provide and maintain our services</li>
          <li>Improve user experience</li>
          <li>Communicate with you about updates and changes</li>
          <li>Ensure security and prevent fraud</li>
        </ul>

        <Title level={5}>3. Data Security</Title>
        <Paragraph>
          We implement appropriate technical and organizational security measures to protect your personal information. However, please note that no method of transmission over the Internet or method of electronic storage is 100% secure.
        </Paragraph>

        <Title level={5}>4. Third-Party Services</Title>
        <Paragraph>
          We may employ third-party companies and individuals due to the following reasons:
        </Paragraph>
        <ul style={{ paddingLeft: 20, color: '#595959' }}>
          <li>To facilitate our Service</li>
          <li>To provide the Service on our behalf</li>
          <li>To perform Service-related services</li>
          <li>To assist us in analyzing how our Service is used</li>
        </ul>

        <Title level={5}>5. Your Rights</Title>
        <Paragraph>
          You have the right to:
        </Paragraph>
        <ul style={{ paddingLeft: 20, color: '#595959' }}>
          <li>Access your personal information</li>
          <li>Correct inaccurate information</li>
          <li>Request deletion of your information</li>
          <li>Object to processing of your information</li>
          <li>Withdraw consent at any time</li>
        </ul>

        <Title level={5}>6. Contact Us</Title>
        <Paragraph>
          If you have questions about this Privacy Policy, please contact us at:
        </Paragraph>
        <Space direction="vertical">
          <Text><MailOutlined /> privacy@yourapp.com</Text>
          <Text>123 Business Street, Suite 100</Text>
          <Text>City, State 12345</Text>
        </Space>
      </Space>
    </Modal>
  );

  // Terms & Conditions Modal
  const TermsModal = () => (
    <Modal
      title={
        <Space>
          <FileTextOutlined style={{ color: '#2f54eb' }} />
          <span style={{ fontSize: 20, fontWeight: 500 }}>Terms & Conditions</span>
        </Space>
      }
      open={termsModalVisible}
      onCancel={() => setTermsModalVisible(false)}
      footer={[
        <Button 
          key="close" 
          type="primary" 
          onClick={() => setTermsModalVisible(false)}
          style={{ 
            borderRadius: 999,
            background: "linear-gradient(135deg,#2f54eb,#13c2c2,#40a9ff)",
            border: 'none'
          }}
        >
          Close
        </Button>
      ]}
      width={700}
      style={{ top: 50 }}
      bodyStyle={{
        background: "radial-gradient(circle at 0% 0%, #ddeaff 0, #f4f6ff 35%, #ffffff 100%)",
        padding: 24,
        maxHeight: '60vh',
        overflowY: 'auto'
      }}
    >
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Card 
          bordered={false}
          style={{
            borderRadius: 16,
            background: "linear-gradient(135deg, rgba(79, 140, 255, 0.08), rgba(255,255,255,0.96))",
            border: "1px solid rgba(79,140,255,0.2)",
          }}
          bodyStyle={{ padding: 16 }}
        >
          <Paragraph>
            <Text strong>Effective Date: {currentYear}</Text>
          </Paragraph>
          <Paragraph>
            Please read these Terms & Conditions carefully before using our application.
          </Paragraph>
        </Card>

        <Title level={5}>1. Acceptance of Terms</Title>
        <Paragraph>
          By accessing or using our application, you agree to be bound by these Terms. If you disagree with any part of the terms, you may not access the application.
        </Paragraph>

        <Title level={5}>2. User Accounts</Title>
        <Paragraph>
          When you create an account with us, you must provide accurate and complete information. You are responsible for safeguarding the password and for all activities under your account.
        </Paragraph>

        <Title level={5}>3. User Responsibilities</Title>
        <Paragraph>
          As a user, you agree to:
        </Paragraph>
        <ul style={{ paddingLeft: 20, color: '#595959' }}>
          <li>Provide accurate and current information</li>
          <li>Maintain the security of your account</li>
          <li>Not use the service for any illegal purposes</li>
          <li>Not violate any applicable laws or regulations</li>
          <li>Not infringe upon others' rights</li>
        </ul>

        <Title level={5}>4. Intellectual Property</Title>
        <Paragraph>
          The application and its original content, features, and functionality are owned by us and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.
        </Paragraph>

        <Title level={5}>5. Termination</Title>
        <Paragraph>
          We may terminate or suspend your account immediately, without prior notice, for conduct that we believe violates these Terms or is harmful to other users, us, or third parties.
        </Paragraph>

        <Title level={5}>6. Limitation of Liability</Title>
        <Paragraph>
          In no event shall we be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of profits, data, or use.
        </Paragraph>

        <Title level={5}>7. Changes to Terms</Title>
        <Paragraph>
          We reserve the right to modify or replace these Terms at any time. We will provide notice of any changes by posting the new Terms on this page.
        </Paragraph>

        <Title level={5}>8. Contact Information</Title>
        <Paragraph>
          For any questions about these Terms, please contact us:
        </Paragraph>
        <Space direction="vertical">
          <Text><MailOutlined /> legal@yourapp.com</Text>
          <Text><PhoneOutlined /> +1 (555) 123-4567</Text>
        </Space>
      </Space>
    </Modal>
  );

  return (
    <>
      <AntFooter
        style={{
          background: "linear-gradient(135deg, rgba(79, 140, 255, 0.08), rgba(255,255,255,0.96))",
          borderTop: "1px solid rgba(79,140,255,0.2)",
          width:'100%',height:'5vh'
        }}
      >
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          {/* Bottom Bar */}
          <Row justify="space-between" align="middle">
            <Col xs={24} md={12}>
              <Space align="center" style={{ width: '100%', justifyContent: 'flex-start' }}>
                <CopyrightOutlined style={{ color: '#bfbfbf' }} />
                <Text type="secondary" style={{ fontSize: 13 }}>
                  {currentYear} YourApp. All rights reserved.
                </Text>
              </Space>
            </Col>
            <Col xs={24} md={12}>
              <Space style={{ width: '100%', justifyContent: 'flex-end' }} split={<Divider type="vertical" />}>
                <Button 
                  type="link" 
                  size="small" 
                  style={{ padding: 0, color: '#bfbfbf', fontSize: 12 }}
                  onClick={() => setPolicyModalVisible(true)}
                >
                  Privacy
                </Button>
                <Button 
                  type="link" 
                  size="small" 
                  style={{ padding: 0, color: '#bfbfbf', fontSize: 12 }}
                  onClick={() => setTermsModalVisible(true)}
                >
                  Terms
                </Button>
                <Button 
                  type="link" 
                  size="small" 
                  style={{ padding: 0, color: '#bfbfbf', fontSize: 12 }}
                  onClick={() => navigate('/sitemap')}
                >
                  Sitemap
                </Button>
              </Space>
            </Col>
          </Row>
        </div>
      </AntFooter>

      {/* Modals */}
      <PrivacyPolicyModal />
      <TermsModal />
    </>
  );
};

// Card component for modals (if not already imported)
const Card = ({ children, bordered, style, bodyStyle }) => (
  <div style={{ ...style, ...bodyStyle }}>
    {children}
  </div>
);

export default Footer;