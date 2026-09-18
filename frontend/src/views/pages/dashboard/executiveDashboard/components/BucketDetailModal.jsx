import { DownloadOutlined } from "@ant-design/icons";
import {Avatar, Button, Card, Col, Divider, Flex, Modal, Row, Space, Statistic, Typography } from "antd";

const {Text, Title} = Typography;

  const BucketDetailModal = ({selectedBucket, setSelectedBucket}) => {

   return (
    <Modal
      title={
        <Space>
          <Avatar size={32} style={{ background: selectedBucket?.color }}>{selectedBucket?.icon}</Avatar>
          <span>{selectedBucket?.label} Leads Analysis</span>
        </Space>
      }
      open={!!selectedBucket}
      onCancel={() => setSelectedBucket(null)}
      width={600}
      footer={[
        <Button key="close" onClick={() => setSelectedBucket(null)}>Close</Button>,
        <Button key="export" icon={<DownloadOutlined />}>Export Report</Button>
      ]}
    >
      <Space direction="vertical" size={20} style={{ width: '100%' }}>
        <Row gutter={16}>
          <Col span={12}>
            <Card size="small">
              <Statistic title="Total Leads" value={selectedBucket?.count} valueStyle={{ fontSize: 32, color: selectedBucket?.color }} />
            </Card>
          </Col>
          <Col span={12}>
            <Card size="small">
              <Statistic title="Percentage" value={selectedBucket?.percentage} suffix="%" valueStyle={{ fontSize: 32, color: selectedBucket?.color }} />
            </Card>
          </Col>
        </Row>
        
        <Divider />
        
        <div>
          <Title level={5} style={{ marginBottom: 16 }}>Lead Characteristics</Title>
          <Space direction="vertical" size={12} style={{ width: '100%' }}>
            <Flex justify="space-between">
              <Text>Average Score</Text>
              <Text strong>78 points</Text>
            </Flex>
            <Flex justify="space-between">
              <Text>Average Response Time</Text>
              <Text strong>12 minutes</Text>
            </Flex>
            <Flex justify="space-between">
              <Text>Average Days in Stage</Text>
              <Text strong>8 days</Text>
            </Flex>
            <Flex justify="space-between">
              <Text>Conversion Rate</Text>
              <Text strong style={{ color: '#52C41A' }}>38%</Text>
            </Flex>
          </Space>
        </div>
      </Space>
    </Modal>
  )};

  export default BucketDetailModal;