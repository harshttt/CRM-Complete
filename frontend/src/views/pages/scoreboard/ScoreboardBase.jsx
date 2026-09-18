import {ReloadOutlined,TrophyOutlined} from "@ant-design/icons";
import {Button, Card, Divider, Progress, Space, Table, Tag, Tooltip, Typography} from "antd";

const { Title, Text } = Typography;

const ScoreboardBase = ({title, subtitle, data, showRevenue = true, showTopPerformer = true, extraStats}) => {
  const columns = [
    {
      title: "Rank",
      dataIndex: "id",
      width: 80,
      align: "center",
      render: (rank) => rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : rank,
    },
    {
      title: "Member",
      dataIndex: "name",
      render: (name) => <Text strong>{name}</Text>,
    },
    { title: "Calls", dataIndex: "calls" },
    { title: "Meetings", dataIndex: "meetings" },
    { title: "Closures", dataIndex: "closures" },
    showRevenue && {
      title: "Revenue",
      dataIndex: "revenue",
      render: (v) => <Text strong>{v}</Text>,
    },
    {
      title: "Score",
      dataIndex: "score",
      width: 160,
      render: (score) => (
        <Progress percent={score} size="small" status={score >= 80 ? "success" : "exception"} />
      ),
    },
  ].filter(Boolean);

  const topPerformer = data?.[0];

  return (
    <Card
      bordered={false}
      title={
        <Space>
          <TrophyOutlined style={{ color: "#faad14" }} />
          <div>
            <Title level={4} style={{ margin: 0 }}>{title}</Title>
            <Text type="secondary" style={{ fontSize: 12 }}>{subtitle}</Text>
          </div>
        </Space>
      }
      extra={
        <Tooltip title="Refresh">
          <Button icon={<ReloadOutlined />} shape="circle" />
        </Tooltip>
      }
    >
      {showTopPerformer && topPerformer && (
        <div style={{ padding: 14, borderRadius: 14, background: "#fff7e6", marginBottom: 16,}}>
          <Text type="secondary">Top Performer</Text>
          <Title level={4} style={{ margin: 0 }}>{topPerformer.name}</Title>
          <Tag color="gold">Score {topPerformer.score}%</Tag>
        </div>
      )}
      {extraStats}
      <Table
        pagination={false}
        rowKey="id"
        columns={columns}
        dataSource={data}
        bordered={false}
      />

      <Divider />
    </Card>
  );
};

export default ScoreboardBase;
