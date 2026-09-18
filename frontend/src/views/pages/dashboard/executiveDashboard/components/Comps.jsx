import { Avatar, Badge, Card, Flex, Progress, Space, Tag, Tooltip, Typography } from "antd";
const { Text } = Typography;

export const MetricCard = ({ icon, label, value, color, trend, suffix, tooltip, size = "default" }) => {
  const isLarge = size === "large";
  
  return (
    <Tooltip title={tooltip}>
      <Card size="small" style={{borderRadius: 12, border: '1px solid #f0f0f0', background: '#fff', height: '100%', cursor: 'pointer'}}
        bodyStyle={{ padding: isLarge ? 20 : 16 }} hoverable
      >
        <Space direction="vertical" size={isLarge ? 12 : 8} style={{ width: '100%' }}>
          <Flex align="center" justify="space-between">
            <Avatar size={isLarge ? 44 : 36} style={{ background: `${color}15`, color }}>{icon}</Avatar>
            {trend && (
              <Badge
                count={<Text style={{ fontSize: 11, color: trend > 0 ? '#52C41A' : '#FF4D4F'}}>{trend > 0 ? '+' : ''}{trend}%</Text>}
                style={{backgroundColor: trend > 0 ? '#f6ffed' : '#fff1f0', border: `1px solid ${trend > 0 ? '#b7eb8f' : '#ffa39e'}`
                }}
              />
            )}
          </Flex>
          
          <Space direction="vertical" size={2}>
            <Text type="secondary" style={{ fontSize: isLarge ? 13 : 12 }}>{label}</Text>
            <Flex align="baseline" gap={2}>
              <Text strong style={{ fontSize: isLarge ? 28 : 20, color }}>{value}</Text>
              {suffix && <Text style={{ fontSize: isLarge ? 14 : 12, color }}>{suffix}</Text>}
            </Flex>
          </Space>
        </Space>
      </Card>
    </Tooltip>
  );
};

export const ScoreProgress = ({ label, score, max, progress, color, icon, breakdown }) => (
  <Card 
    size="small" 
    style={{ 
      borderRadius: 12,
      border: `1px solid ${color}20`,
      background: '#fff',
      height: '100%'
    }}
    bodyStyle={{ padding: 16 }}
  >
    <Space direction="vertical" size={12} style={{ width: '100%' }}>
      <Flex align="center" justify="space-between">
        <Space size={8}>
          <Avatar size={32} style={{ background: `${color}15`, color }}>{icon}</Avatar>
          <Space direction="vertical" size={2}>
            <Text strong style={{ fontSize: 12, color: '#666' }}>{label}</Text>
            <Text strong style={{ fontSize: 16, color }}>{score}/{max}</Text>
          </Space>
        </Space>
        <Tag color={progress >= 90 ? 'success' : progress >= 70 ? 'warning' : 'error'}>{progress}%</Tag>
      </Flex>
      
      <Progress percent={progress} strokeColor={color} trailColor={`${color}15`} showInfo={false} />
      
      {/* {breakdown && (
        <Flex justify="space-between" style={{ marginTop: 8 }}>
          {Object.entries(breakdown).map(([key, value], idx) => (
            <Tooltip key={key} title={key.replace(/([A-Z])/g, ' $1').toLowerCase()}>
              <Space direction="vertical" align="center" size={2}>
                <Text strong style={{ fontSize: 12 }}>{value}</Text>
                <Text type="secondary" style={{ fontSize: 9 }}> {key.slice(0, 3)}</Text>
              </Space>
            </Tooltip>
          ))}
        </Flex>
      )} */}
    </Space>
  </Card>
);

export const ScoreBucketCard = ({ bucket, onClick }) => (
  <Card
    hoverable
    onClick={onClick}
    style={{ 
      borderRadius: 12,
      border: `2px solid ${bucket.color}`,
      background: `${bucket.color}08`,
      height: '100%'
    }}
    bodyStyle={{ padding: 16 }}
  >
    <Space direction="vertical" align="center" size={12} style={{ width: '100%', textAlign: 'center' }}>
      <Avatar size={48} style={{ background: bucket.color }}>{bucket.icon}</Avatar>
      
      <Space direction="vertical" size={4}>
        <Text strong style={{ fontSize: 16, color: bucket.color }}>{bucket.label}</Text>
        <Text type="secondary" style={{ fontSize: 12 }}>
          ≥ {bucket.label === 'Sales Ready' ? '80' : 
              bucket.label === 'High Intent' ? '60' : 
              bucket.label === 'Warm' ? '40' : 
              bucket.label === 'Cold' ? '20' : '0'} pts
        </Text>
      </Space>
      
      <Space direction="vertical" size={2}>
        <Text strong style={{ fontSize: 24 }}>{bucket.count}</Text>
        <Text type="secondary" style={{ fontSize: 12 }}>{bucket.percentage}% of leads</Text>
      </Space>
      
      <Progress percent={bucket.percentage} strokeColor={bucket.color}trailColor={`${bucket.color}30`} showInfo={false} style={{ width: '80%' }} />
    </Space>
  </Card>
);

export const SourcePerformanceCard = ({ source, onClick }) => (
  <Card
    hoverable
    onClick={onClick}
    style={{ 
      borderRadius: 12,
      border: `1px solid ${source.color}30`,
      background: '#fff',
      height: '100%'
    }}
    bodyStyle={{ padding: 16 }}
  >
    <Space direction="vertical" size={12} style={{ width: '100%' }}>
      <Flex align="center" justify="space-between">
        <Space direction="vertical" size={2}>
          <Text strong style={{ fontSize: 14 }}>{source.source}</Text>
          <Text type="secondary" style={{ fontSize: 11 }}>{source.count} leads</Text>
        </Space>
        <Badge count={`${source.avgScore}`} style={{ backgroundColor: source.color, fontWeight: 'bold'}}/>
      </Flex>
      
      <Progress percent={parseInt(source.conversionRate)} strokeColor={source.color} trailColor={`${source.color}20`} showInfo={false}/>
      
      <Flex justify="space-between" align="center">
        <Text type="secondary" style={{ fontSize: 11 }}>Conversion Rate</Text>
        <Text strong style={{ fontSize: 14, color: source.color }}>{source.conversionRate}</Text>
      </Flex>
    </Space>
  </Card>
);

export const StageConversionCard = ({ stage, conversion }) => {
  const percentage = parseInt(conversion);
  const color = percentage >= 50 ? '#52C41A' : percentage >= 30 ? '#FAAD14' : '#FF4D4F';
  
  return (
    <Card
      size="small"
      style={{ 
        borderRadius: 8,
        border: `1px solid ${color}30`,
        background: '#fff',
        height: '100%'
      }}
      bodyStyle={{ padding: 12 }}
    >
      <Space direction="vertical" size={8} style={{ width: '100%' }}>
        <Flex align="center" justify="space-between">
          <Text strong style={{ fontSize: 12 }}>{stage}</Text>
          <Badge count={percentage} style={{backgroundColor: color, fontSize: 11}}/>
        </Flex>
        
        <Progress percent={percentage} strokeColor={color} trailColor={`${color}15`} showInfo={false} size="small"/>
        
        <Flex justify="space-between" align="center">
          <Text type="secondary" style={{ fontSize: 10 }}>Conversion</Text>
          <Text strong style={{ fontSize: 12, color }}>{conversion}</Text>
        </Flex>
      </Space>
    </Card>
  );
};
