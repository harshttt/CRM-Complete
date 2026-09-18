import { Card, Space } from "antd";

const LeadMetrics = () => {
  return (
    <div>
      <Space direction="vertical" size={24} style={{ width: "100%" }}>
        {/* Lead Distribution by Score Buckets */}
        <Card title={ <Space> <PieChartOutlined /> <span>Lead Distribution by Score Buckets</span></Space>} style={{ borderRadius: 12 }}>
          <Row gutter={[16, 16]}>
            {leadDistribution.buckets.map((bucket, idx) => (
              <Col xs={24} sm={12} md={6} key={idx}>
                <ScoreBucketCard  bucket={bucket} onClick={() => handleBucketClick(bucket)} />
              </Col>
            ))}
          </Row>
        </Card>

        {/* Source Performance */}
        <Card title={ <Space>  <HeatMapOutlined /> <span>Source Performance Metrics</span>  </Space>}style={{ borderRadius: 12 }}>
          <Row gutter={[16, 16]}>
            {sourceMetrics.map((source, idx) => (
              <Col xs={24} sm={12} md={8} lg={4.8} key={idx}>
                <SourcePerformanceCard source={source} onClick={() => handleSourceClick(source)} />
              </Col>
            ))}
          </Row>

          <Divider />
        </Card>

        {/* Stage Progression & Conversion */}
        <Card title={ <Space> <LineChartOutlined /> <span>Stage Progression & Conversion Funnel</span></Space>} style={{ borderRadius: 12 }}>
          <Row gutter={[16, 16]}>
            {Object.entries(stageMetrics.current).map(([stage, count], idx) => (
              <Col xs={24} sm={12} md={8} lg={4} key={idx}>
                <Card size="small">
                  <Space direction="vertical" align="center" style={{ width: "100%" }}>
                    <Text strong style={{ fontSize: 12 }}>{stage}</Text>
                    <Text strong style={{ fontSize: 24, color: "#1890FF" }}> {count}</Text>
                    <Text type="secondary" style={{ fontSize: 11 }}>  Active Leads</Text>
                  </Space>
                </Card>
              </Col>
            ))}
          </Row>

          <Divider />

          <Row gutter={[16, 16]}>
            <Col span={24}>
              <Title level={5} style={{ marginBottom: 16 }}> Stage Conversion Rates </Title>
              <Row gutter={[8, 8]}>
                {Object.entries(stageMetrics.conversionRates).map(
                  ([stage, rate], idx) => (
                    <Col xs={24} sm={12} md={8} lg={4} key={idx}>
                      <StageConversionCard stage={stage} conversion={rate} />
                    </Col>
                  ))}
              </Row>
            </Col>
          </Row>
        </Card>
      </Space>
    </div>
  );
};

export default LeadMetrics;
