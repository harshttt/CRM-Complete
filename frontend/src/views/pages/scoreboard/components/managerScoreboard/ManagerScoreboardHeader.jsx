import { Flex, Space, Typography, Select, Button } from "antd";
import { CalendarOutlined, SyncOutlined, TeamOutlined } from "@ant-design/icons";
import { useState } from "react";

const { Title, Text } = Typography;

const ManagerScoreboardHeader = ({loading}) => {
    const [timeRange, setTimeRange] = useState(null);
    
    const handleRefresh = () => {};

   return (
    <>
      <div style={{ marginBottom: 24 }}>
        <Flex align="center" justify="space-between" wrap="wrap" gap={16}>
          <Space direction="vertical" size={4}>
            <Title level={3} style={{ margin: 0, color: '#1e293b' }}> <TeamOutlined style={{ marginRight: 8 }} /> Team Management Scoreboard</Title>
            <Text type="secondary" style={{ fontSize: 14 }}> Track team performance, coaching needs, and lead distribution </Text>
          </Space>
          
          <Space>
            <Select value={timeRange}onChange={setTimeRange} style={{ width: 140, borderRadius: 8 }} suffixIcon={<CalendarOutlined />}
               options={[{label:'Today', value:'today'}, {label:'Week', value:'week'}, {label:'Month', value:'month'}]}
             />
            <Button icon={<SyncOutlined spin={loading} />} style={{ borderRadius: 50 }} onClick={handleRefresh} />
          </Space>
        </Flex>
      </div>
    </>
   )
};

export default ManagerScoreboardHeader;