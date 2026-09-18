import { ArrowUpOutlined } from "@ant-design/icons";
import { Card, Flex, Space, Statistic, Tag } from "antd";

const StatCard = ({title, value, suffix, accent, badge, icon}) => {
   
    return (
    <Card
      bordered={false}
      style={{
        borderRadius: 16,
        boxShadow: "0 10px 30px rgba(15,23,42,0.12)",
        background:"linear-gradient(135deg,rgba(255,255,255,0.98),rgba(243,247,255,0.98))",
        border: "1px solid rgba(240,242,255,0.9)",
      }}
      styles={{
        body:{
          padding:14
        }
      }}
    >
      <Space align="start" style={{ width: "100%", gap: 12 }}>
        <Flex justify="center" align="center" style={{width: 40, height: 40, borderRadius: "999px", background: `${accent}12`, boxShadow: `0 0 0 1px ${accent}26`, fontSize: 20, color: accent}}>
          {icon}
        </Flex>
        <Space direction="vertical" size={4} style={{ width: "100%" }}>
          <Statistic
            title={<span style={{ fontSize: 12, color: "#8c8c8c" }}>{title}</span>}
            value={value}
            precision={suffix ? 1 : 0}
            valueStyle={{ color: "#141414", fontSize: 20, fontWeight: 600}}
            prefix={ <ArrowUpOutlined style={{ color: "#52c41a", marginRight: 4, fontSize: 12 }}/>}
            suffix={suffix}
          />
          {badge && (
            <Tag color="success" style={{borderRadius: 999, fontSize: 11, paddingInline: 10, background: "rgba(246,255,237,0.9)", border: "none", width: "fit-content"}}>
              {badge}
            </Tag>
          )}
        </Space>
      </Space>
    </Card>
    )
}

export default StatCard;