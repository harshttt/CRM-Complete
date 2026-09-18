const ManagerLeadPerformance = () => {
    
    return (
      <>
            <TabPane
            tab={
              <Space>
                <BarChartOutlined />
                <span>Lead Performance</span>
                <Badge count={leadPerformanceData.leadDistribution.totalLeads} style={{ backgroundColor: '#1890FF' }} />
              </Space>
            }
            key="leadPerformance"
          >
            <Space direction="vertical" size={24} style={{ width: '100%' }}>
              {/* Lead Performance Overview */}
              <Card 
                style={{ 
                  borderRadius: 16,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  border: 'none',
                  boxShadow: '0 8px 32px rgba(102, 126, 234, 0.2)'
                }}
              >
                <Row gutter={[24, 24]} align="middle">
                  <Col xs={24} md={8}>
                    <div style={{ textAlign: 'center', padding: 16 }}>
                      <Space direction="vertical" size={16}>
                        <div>
                          <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: 14 }}>
                            Team Lead Portfolio Score
                          </Text>
                          <Statistic
                            value={leadPerformanceData.leadDistribution.avgScore}
                            suffix="/100"
                            valueStyle={{ 
                              fontSize: 56,
                              fontWeight: 'bold',
                              color: 'white',
                              lineHeight: 1
                            }}
                          />
                          <Flex align="center" justify="center" gap={8} style={{ marginTop: 8 }}>
                            <ArrowUpOutlined style={{ color: '#52C41A', fontSize: 12 }} />
                            <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12 }}>
                              {leadPerformanceData.leadDistribution.scoreChange} this month
                            </Text>
                          </Flex>
                        </div>
                        <Flex justify="center" gap={8}>
                          <Tag style={{ background: 'rgba(255,255,255,0.2)', color: 'white', borderRadius: 12 }}>
                            {leadPerformanceData.leadDistribution.totalLeads} Total Leads
                          </Tag>
                          <Tag style={{ background: 'rgba(255,255,255,0.2)', color: 'white', borderRadius: 12 }}>
                            {leadPerformanceData.leadDistribution.highScore} High Score
                          </Tag>
                        </Flex>
                      </Space>
                    </div>
                  </Col>
                  
                  <Col xs={24} md={16}>
                    <Row gutter={[16, 16]}>
                      <Col xs={12} sm={6}>
                        <MetricCard
                          icon={<ThunderboltOutlined />}
                          label="Sales Ready"
                          value={leadPerformanceData.leadDistribution.buckets[0].count}
                          color="#52C41A"
                          tooltip="Leads with highest conversion probability"
                          size="large"
                        />
                      </Col>
                      <Col xs={12} sm={6}>
                        <MetricCard
                          icon={<RiseOutlined />}
                          label="High Intent"
                          value={leadPerformanceData.leadDistribution.buckets[1].count}
                          color="#1890FF"
                          tooltip="Leads showing strong interest"
                          size="large"
                        />
                      </Col>
                      <Col xs={12} sm={6}>
                        <MetricCard
                          icon={<PercentageOutlined />}
                          label="Conversion Rate"
                          value={28}
                          color="#13c2c2"
                          suffix="%"
                          tooltip="Overall lead conversion rate"
                          size="large"
                        />
                      </Col>
                      <Col xs={12} sm={6}>
                        <MetricCard
                          icon={<DollarOutlined />}
                          label="Revenue Impact"
                          value={8.4}
                          color="#F759AB"
                          suffix="Cr"
                          tooltip="Potential revenue from active leads"
                          size="large"
                        />
                      </Col>
                    </Row>
                  </Col>
                </Row>
              </Card>

              {/* Lead Distribution by Score Buckets */}
              <Card 
                title={
                  <Space>
                    <PieChartOutlined />
                    <span>Lead Distribution by Score Buckets</span>
                  </Space>
                }
                style={{ borderRadius: 12 }}
              >
                <Row gutter={[16, 16]}>
                  {leadPerformanceData?.leadDistribution?.buckets?.map((bucket, idx) => (
                    <Col xs={24} sm={12} md={6} key={idx}>
                      <ScoreBucketCard 
                        bucket={bucket} 
                        onClick={() => setSelectedBucket(bucket)}
                      />
                    </Col>
                  ))}
                </Row>
              </Card>

              {/* Source Performance */}
              <Card 
                title={
                  <Space>
                    <HeatMapOutlined />
                    <span>Source Performance Metrics</span>
                  </Space>
                }
                style={{ borderRadius: 12 }}
              >
                <Row gutter={[16, 16]}>
                  {leadPerformanceData?.sourceMetrics?.map((source, idx) => (
                    <Col xs={24} sm={12} md={8} lg={4.8} key={idx}>
                      <SourcePerformanceCard 
                        source={source}
                        onClick={() => setSelectedSource(source)}
                      />
                    </Col>
                  ))}
                </Row>
                
                <Divider />

              </Card>

              {/* Top Performing Leads */}
              <Card 
                title={
                  <Space>
                    <TrophyOutlined />
                    <span>Top Performing Leads</span>
                  </Space>
                }
                style={{ borderRadius: 12 }}
              >
                <Space direction="vertical" style={{ width: '100%' }}>
                  {leadPerformanceData?.topPerformingLeads?.map((lead) => (
                    <LeadScoreCard key={lead.id} lead={lead} />
                  ))}
                </Space>
              </Card>

              {/* Stage Progression & Conversion */}
              <Card 
                title={
                  <Space>
                    <LineChartOutlined />
                    <span>Stage Progression & Conversion Funnel</span>
                  </Space>
                }
                style={{ borderRadius: 12 }}
              >
                <Row gutter={[16, 16]}>
                  {Object.entries(leadPerformanceData?.stageMetrics?.current)?.map(([stage, count], idx) => (
                    <Col xs={24} sm={12} md={8} lg={4} key={idx}>
                      <Card size="small">
                        <Space direction="vertical" align="center" style={{ width: '100%' }}>
                          <Text strong style={{ fontSize: 12 }}>{stage}</Text>
                          <Text strong style={{ fontSize: 24, color: '#1890FF' }}>{count}</Text>
                          <Text type="secondary" style={{ fontSize: 11 }}>Active Leads</Text>
                        </Space>
                      </Card>
                    </Col>
                  ))}
                </Row>
                
                <Divider />
                
                <Row gutter={[16, 16]}>
                  <Col span={24}>
                    <Title level={5} style={{ marginBottom: 16 }}>Stage Conversion Rates</Title>
                    <Row gutter={[8, 8]}>
                      {Object.entries(leadPerformanceData?.stageMetrics?.conversionRates)?.map(([stage, rate], idx) => (
                        <Col xs={24} sm={12} md={8} lg={4} key={idx}>
                          <StageConversionCard 
                            stage={stage} 
                            conversion={rate}
                            avgDays={leadPerformanceData.stageMetrics.avgDaysInStage[stage.split(' → ')[1]]}
                          />
                        </Col>
                      ))}
                    </Row>
                  </Col>
                </Row>
                
                <Divider />
                
              </Card>
            </Space>
          </TabPane>
      </>
    )
};