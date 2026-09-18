import {DollarCircleOutlined,LineChartOutlined,PercentageOutlined,ReloadOutlined,TrophyOutlined,UserOutlined} from "@ant-design/icons";
import {Alert,Badge,Button,Card,Col,Divider,Flex,Progress,Row,Space,Table,Tag,Tooltip,Typography,} from "antd";
import util from "../../../../utils/util";
import MyPagination from "../../../components/Pagination";
import StatCard from "../../../components/StatCard";
import commonObj from "../../../../commonObj";
import AdminScoreboard from "./AdminScoreboardDep";
import ManagerScoreboard from "../ManagerScoreboardDep";
import SuperAdminScoreboard from "../SuperadminScoreboardDep";
import ExecutiveScoreboard from "./ExecutiveScoreboardDep";

const { Title, Text } = Typography;

const Scoreboard = () => {
  const isError = false;


  const columns = [
    {
      title: "Rank",
      dataIndex: "id",
      width: 80,
      align: "center",
      fixed: "left",
      render: (rank) => {
        if (rank === 1) return "🥇";
        if (rank === 2) return "🥈";
        if (rank === 3) return "🥉";
        return rank;
      },
    },
    {
      title: "Team Member",
      dataIndex: "name",
      width: 220,
      render: (name) => <Text strong>{name}</Text>,
    },
    { title: "Calls", dataIndex: "calls", width: 100 },
    { title: "Meetings", dataIndex: "meetings", width: 110 },
    { title: "Follow-ups", dataIndex: "followups", width: 120 },
    { title: "Closures", dataIndex: "closures", width: 100 },
    {
      title: "Revenue",
      dataIndex: "revenue",
      width: 120,
      render: (val) => <Text strong style={{ color: "#2f54eb" }}>{val}</Text>,
    },
    {
      title: "Score",
      dataIndex: "score",
      width: 160,
      render: (score) => (
        <Progress
          percent={score}
          size="small"
          status={score >= 80 ? "success" : "exception"}
        />
      ),
    },
  ];

  const dummyData = [
    { id: 1, name: "Priya Patel", calls: "18/15", meetings: "3/5", followups: "5/10", closures: "1/1", revenue: "14 Lakhs", score: 100 },
    { id: 2, name: "Vikram Singh", calls: "16/15", meetings: "4/5", followups: "6/10", closures: "2/2", revenue: "18 Lakhs", score: 85 },
    { id: 3, name: "Ravi Kumar", calls: "14/15", meetings: "2/5", followups: "4/10", closures: "1/2", revenue: "9 Lakhs", score: 70 },
    { id: 4, name: "Anita Desai", calls: "20/15", meetings: "5/5", followups: "8/10", closures: "3/3", revenue: "22 Lakhs", score: 92 },
    { id: 5, name: "Rahul Malhotra", calls: "13/15", meetings: "2/5", followups: "3/10", closures: "0/1", revenue: "6 Lakhs", score: 65 },
  ];

  return (
    <>
    {/* <ManagerScoreboard/> */}
    {/* <ExecutiveScoreboard /> */}
    
      {/* {isError ? (
        <Alert
          message="Error"
          type="error"
          showIcon
          description="Failed to load Scoreboard"
        />
      ) : (
        <Card
          bordered={false}
          className="card-style"
          headStyle={{ padding: "18px 22px 6px" }}
          bodyStyle={{ padding: "12px 22px 22px" }}
          title={
            <Space>
              <TrophyOutlined style={{ fontSize: 22, color: "#faad14" }} />
              <div>
                <Title level={4} style={{ margin: 0 }}>
                  Scoreboard
                </Title>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Complete team performance overview
                </Text>
              </div>
            </Space>
          }
          extra={
            <Space>
              <Text type="secondary">
                Total Members: <Text strong>{dummyData.length}</Text>
              </Text>
              <Tooltip title="Refresh">
                <Button
                  icon={<ReloadOutlined />}
                  shape="circle"
                />
              </Tooltip>
            </Space>
          }
        >
          <div
            style={{
              padding: 16,
              borderRadius: 16,
              background: "linear-gradient(135deg, #fff7e6, #ffffff)",
              border: "1px solid #ffe7ba",
              marginBottom: 16,
            }}
          >
            <Flex justify="space-between" align="center">
              <Flex align="center" gap={14}>
                <div
                  style={{
                    height: 64,
                    width: 64,
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, gold, orange)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 700,
                    color: "#fff",
                    fontSize: 22,
                  }}
                >
                  P
                </div>

                <div>
                  <Text type="secondary">Top Performer</Text>
                  <Title level={4} style={{ margin: 0 }}>
                    Priya Patel
                  </Title>
                  <Tag color="gold">Score 100%</Tag>
                </div>
              </Flex>

              <Space>
                <Tag color="blue">Calls 18/15</Tag>
                <Tag color="cyan">Meetings 3/5</Tag>
                <Tag color="green">Closures 1/1</Tag>
                <Tag color="purple">₹14L</Tag>
              </Space>
            </Flex>
          </div>

          <div
            style={{
              background: "#fafafa",
              padding: 16,
              borderRadius: 16,
              marginBottom: 16,
            }}
          >
            <Row gutter={[12, 12]}>
              <Col xs={24} sm={12} md={4}>
                <StatCard title="Team Size" value={5} accent="#2f54eb" icon={<UserOutlined />} />
              </Col>
              <Col xs={24} sm={12} md={4}>
                <StatCard title="Total Calls" value={81} accent="#52c41a" icon={<DollarCircleOutlined />} />
              </Col>
              <Col xs={24} sm={12} md={4}>
                <StatCard title="Meetings" value={17} accent="#13c2c2" icon={<PercentageOutlined />} />
              </Col>
              <Col xs={24} sm={12} md={4}>
                <StatCard title="Closures" value={7} accent="#faad14" icon={<TrophyOutlined />} />
              </Col>
              <Col xs={24} sm={12} md={4}>
                <StatCard title="Revenue" value="₹69L" accent="#722ed1" icon={<LineChartOutlined />} />
              </Col>
              <Col xs={24} sm={12} md={4}>
                <StatCard title="Avg Score" value="82%" accent="#52c41a" icon={<PercentageOutlined />} />
              </Col>
            </Row>
          </div>

          <Card
            title="Needs Attention"
            extra={<Tag color="red">Below Target</Tag>}
            style={{ marginBottom: 16 }}
          >
            <Space wrap>
              <Tag color="red">Rahul Malhotra – 65%</Tag>
              <Tag color="orange">Ravi Kumar – 70%</Tag>
            </Space>
          </Card>

          <Card title="Complete Team Rankings">
            <Table
              pagination={false}
              columns={columns}
              dataSource={dummyData}
              rowKey="id"
              rowClassName={rowClassName}
              scroll={{
                y: util.getTableHeight
                  ? util.getTableHeight()
                  : "calc(100vh - 420px)",
                x: "max-content",
              }}
              bordered={false}
            />

            <Divider />
            <MyPagination />
          </Card>
        </Card>
      )} */}
    </>
  );
};

export default Scoreboard;
