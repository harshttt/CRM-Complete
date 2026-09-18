import { Avatar, Card, Flex, Space, Statistic, Tag, Typography } from "antd";
import commonObj from "../../../../../commonObj";
import { TeamOutlined } from "@ant-design/icons";

const {Title, Text} = Typography;

const ManagerProfileCard = ({data}) => {

  return (
    <>
     <Card style={{ marginBottom: 24, borderRadius: 16,background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', border: 'none', boxShadow: '0 8px 32px rgba(102, 126, 234, 0.2)'}}>
        <Flex align="center" justify="space-between" wrap="wrap" gap={24}>
          <Space size={20}>
            <Avatar size={64} style={{background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)', border: '2px solid rgba(255,255,255,0.3)', color: 'white', fontSize: 24, fontWeight: 'bold'}}>
               {commonObj?.name?.split(" ")?.map(word => word[0])?.join("")?.toUpperCase()?.slice(0, 2) || ""}
            </Avatar>
            <Space direction="vertical" size={4}>
              <Title level={3} style={{ margin: 0, color: 'white' }}>{commonObj?.name}</Title>
              <Space size={16}>
                 <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12 }}>
                  <TeamOutlined /> {data?.summary?.totalManagers} executives
                 </Text>
                 <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12 }}>
                  <TeamOutlined /> {data?.summary?.totalSalespersons} executives
                 </Text>
              </Space>
            </Space>
          </Space>
          <Space direction="vertical" align="end">
            {/* <Tag
              style={{background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.3)', color: 'white', fontSize: 14,
                padding: '8px 16px', borderRadius: 20, fontWeight: 'bold'
              }}
            >
              {data?.bucket}
            </Tag> */}
            <Text style={{color: 'white', fontSize: 12 }}>Team Average Score</Text>
            <Statistic value={data?.summary?.averageScore} suffix="/100" valueStyle={{fontSize: 32, fontWeight: 'bold', color: 'white', lineHeight: 1}} />
          </Space>
        </Flex>
      </Card>
     </>
    )
};

export default ManagerProfileCard;