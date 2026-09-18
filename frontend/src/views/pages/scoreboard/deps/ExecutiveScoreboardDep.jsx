import { Card, Progress, Typography } from "antd";

const { Title, Text } = Typography;

const ExecutiveScoreboard = ({ self }) => (
  <Card bordered={false}>
    <Text type="secondary">My Performance</Text>
    <Title level={3}>{self.name}</Title>

    <Progress percent={self.score} status="active" />

    <div style={{ marginTop: 12 }}>
      <Text>Calls: {self.calls}</Text><br />
      <Text>Meetings: {self.meetings}</Text><br />
      <Text>Closures: {self.closures}</Text><br />
      <Text strong>Revenue: {self.revenue}</Text>
    </div>
  </Card>
);

export default ExecutiveScoreboard;
