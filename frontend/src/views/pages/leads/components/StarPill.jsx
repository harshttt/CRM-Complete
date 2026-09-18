import { Card, Flex, Space, Typography } from "antd";

const { Text } = Typography;
/*──────────── STATS PILL ────────────*/
export default function StatPill({ icon, label, value, accent }) {
  return (
    <Card
      size="small"
      bordered={false}
      style={{
        borderRadius: 16,
        background: "linear-gradient(135deg, rgba(255,255,255,0.98), rgba(243,247,255,0.98))",
        boxShadow: "0 1px 1px rgba(15,23,42,0.09)",
        border: "2px solid rgba(240,242,255,0.9)",
      }}
      styles={{body:{padding:'8px 10px'}}}
    >
      <Space
        align="center"
        style={{ width: "100%", justifyContent: "space-between" }}
      >
        <Space align="center">
          <Flex justify="center" align="center" style={{width: 28, height: 28, borderRadius: "999px", background: `${accent}12`, boxShadow: `0 0 0 1px ${accent}26`}}>
            <span style={{ color: accent, fontSize: 16 }}>{icon}</span>
          </Flex>
          <Space direction="vertical" size={0}>
            <Text type="secondary" style={{ fontSize: 11 }}>{label}</Text>
            <Text strong style={{ fontSize: 16 }}> {value} </Text>
          </Space>
        </Space>
      </Space>
    </Card>
  );
}