import { useEffect, useState } from "react";
import { Card, Row, Col, Tag, Typography, Select, Space, Statistic, Button, Grid, Tabs, Flex, Spin} from "antd";
import {CrownOutlined, TrophyOutlined, FireOutlined, UserOutlined, DashboardOutlined, RiseOutlined, PhoneOutlined, MailOutlined, CalendarOutlined, CheckCircleOutlined, ThunderboltOutlined, ClockCircleOutlined, ExclamationCircleOutlined, UserAddOutlined, SyncOutlined,MessageOutlined,} from "@ant-design/icons";
import QuickActionsComp from "./components/QuickActionsComp";
import HowScoringWorksComp from "./components/HowScoringWorksComp";
import { ScoreProgress } from "./components/Comps";
import { usePerformanceList } from "../../../../api-hooks/performance";
import commonObj from "../../../../commonObj";
import { Link } from "react-router-dom";

const { Text } = Typography;
const { useBreakpoint } = Grid;

/* ---------------- MAIN COMPONENT ---------------- */

const performanceScore = [
    {
      label:'Activity Volume Score (AVS)',
      icon:<MessageOutlined/>,
      color:'1890FF',
      score:35,
      max: 40, 
      progress: 88,
      breakdown: { calls: 8, emails: 12, messages: 5, comments: 3, followups: 4, reminders: 3 }
    },
    {
      label:'Task Discipline (TDS)',
      icon: <CheckCircleOutlined/>,
      color:'52C41A',
      score:35,
      max: 40, 
      progress: 88,
      breakdown: { time: 8, late: 12, missed: 5, urgent: 3}
    },
    {
      label:'Speed-to-Lead Score (SLS)',
      icon: <ClockCircleOutlined/>,
      color:'52C41A',
      score:35,
      max: 40, 
      progress: 88,
      breakdown: { '<5': 8, '5-15': 12, '>60': 5, 'nasd': 3 }
    },
    {
      label:'Lead Progression (LPES)',
      icon: <RiseOutlined/>,
      color:'13C2C2',
      score:35,
      max: 40, 
      progress: 88,
      breakdown: { progress: 8, meeting: 12, visit: 5, qualified: 3, won: 4, lost: 3, dump:5 }
    },
    {
      label:'Client Responsiveness Bonus (CRB)',
      icon: <RiseOutlined/>,
      color:'13C2C2',
      score:35,
      max: 40, 
      progress: 88,
      breakdown: {'<2hr': 8, lost: 12 }
    },
    {
      label:'Conversation Quality Score (CQS)',
      icon: <RiseOutlined/>,
      color:'13C2C2',
      score:35,
      max: 40, 
      progress: 88,
      breakdown: {calls: 8, meeting: 12, 'site visit': 5, email: 3, sms: 4 }
    },
  ];

const ExecutiveDashboardMain = () => {
  const { data = [], isFetching: loading, isError, error, refetch: handleRefresh, refetchWithQuery } = usePerformanceList({});
  const executiveMetrics = data?.data?.[0]?.managers?.[0]?.salespersons?.[0] ?? null;
  const [scores, setScores] = useState(performanceScore);
  
  const screens = useBreakpoint();

  useEffect(() => {
   if (!executiveMetrics?.breakdown) return;
   const breakdown = executiveMetrics?.breakdown;

   const updatedScores = [
    {
      key: 'avs',
      label: 'Activity Volume Score (AVS)',
      icon: <MessageOutlined />,
      color: '1890FF',
      score: breakdown?.avs,
      max: 40,
      progress: (breakdown?.avs / 40) * 100,
      breakdown: breakdown?.avs
    },
    {
      key: 'tds',
      label: 'Task Discipline (TDS)',
      icon: <CheckCircleOutlined />,
      color: '52C41A',
      score: breakdown?.tds,
      max: 40,
      progress: (breakdown?.tds / 40) * 100,
      breakdown: breakdown?.tds
    },
    {
      key: 'sls',
      label: 'Speed-to-Lead Score (SLS)',
      icon: <ClockCircleOutlined />,
      color: '52C41A',
      score: breakdown?.sls,
      max: 40,
      progress: (breakdown?.sls / 40) * 100,
      breakdown: breakdown?.sls
    },
    {
      key: 'lpes',
      label: 'Lead Progression (LPES)',
      icon: <RiseOutlined />,
      color: '13C2C2',
      score: breakdown?.lpes,
      max: 40,
      progress: (breakdown?.lpes / 40) * 100,
      breakdown: breakdown?.lpes
    },
    {
      key: 'crb',
      label: 'Client Responsiveness Bonus (CRB)',
      icon: <RiseOutlined />,
      color: '13C2C2',
      score: breakdown?.crb,
      max: 40,
      progress: (breakdown?.crb / 40) * 100,
      breakdown: breakdown?.crb
    },
    {
      key: 'cqs',
      label: 'Conversation Quality Score (CQS)',
      icon: <RiseOutlined />,
      color: '13C2C2',
      score: breakdown?.cqs,
      max: 40,
      progress: (breakdown?.cqs / 40) * 100,
      breakdown: breakdown?.cqs
    }
  ];

  setScores(updatedScores);
}, [executiveMetrics]);

  return (
    <div style={{ borderRadius:25, background: '#f8f9fa', minHeight: '100vh', padding: screens.xs ? 16 : 24}}>
      {/* Overall Lead Score Card */}
      <Row gutter={[24, 24]} align="middle">
        <Col xs={24}>
          <div style={{background: "linear-gradient(135deg, #1890ff 0%, #096dd9 100%)", borderRadius: 12, padding: 20, boxShadow: "0 4px 12px rgba(24, 144, 255, 0.15)",}}>
            <Space direction="vertical" size={16} style={{ width: "100%" }}>
              {/* Header */}
              <Flex justify="space-between" align="start" gap={16} wrap>
                {/* Left Section */}
                <div>
                  <Text style={{color: "rgba(255, 255, 255, 0.9)", fontSize: 36, fontWeight: 600, display: "block",}}>{commonObj?.name || "Executive Name"}</Text>
                  <Flex align="center" gap={8} style={{marginTop: 4}}>
                    <Text style={{ color: "rgba(255, 255, 255, 0.7)", fontSize: 12 }}> Sales Team</Text>
                    <Tag style={{ margin: 0, fontWeight: 600, fontSize: 11, borderRadius: 10, padding: "0 8px", background: "rgba(255, 255, 255, 0.2)", border: "1px solid rgba(255, 255, 255, 0.3)", color: "white"}}>
                      {executiveMetrics?.bucket}
                    </Tag>
                  </Flex>
                </div>

                {/* Right Section */}
                <div style={{ textAlign: "right" }}>
                  {/* Quick Actions + Filters */}
                  <Space wrap align="center">
                    {/* Quick Actions */}
                    <Link to={'/leads-management/leads'}>
                     <Button style={{ borderRadius: 20, background: "rgba(255,255,255,0.2)", border: "1px solid rgba(255,255,255,0.3)", color: "#fff", fontWeight: 500,}} onClick={() => router.push("/leads")}>
                       View Leads
                     </Button>
                    </Link>

                    <Link to={'/tasks'}>
                     <Button style={{ borderRadius: 20, background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.3)", color: "#fff", fontWeight: 500,}} onClick={() => router.push("/tasks")}>
                        View Tasks
                     </Button>
                    </Link>

                    {/* Filters */}
                    <Select placeholder="Select Date" onChange={(val) => refetchWithQuery({ range: val })} style={{ width: 140 }} suffixIcon={<CalendarOutlined />}
                      options={[
                        { label: "Today", value: "daily" },
                        { label: "This Week", value: "weekly" },
                        { label: "This Month", value: "monthly" },
                        { label: "This Year", value: "yearly" },
                      ]}
                    />
                    <Button icon={<SyncOutlined spin={loading} />} shape="circle" onClick={handleRefresh}/>
                  </Space>

                  {/* Performance Score */}
                  <div style={{ marginTop: 12 }}>
                    <Text style={{color: "rgba(255, 255, 255, 0.8)", fontSize: 13, fontWeight: 500, display: "block", marginBottom: 4}}>Performance Score</Text>
                    <Flex align="center" justify="end" gap={4}>
                      <Statistic value={executiveMetrics?.totalScore}
                        suffix={ <span style={{ fontSize: 24, fontWeight: 600, color: "rgba(255, 255, 255, 0.9)"}}>/100</span>}
                        valueStyle={{fontSize: 56, fontWeight: "bold", color: "#fff", lineHeight: 1}}
                      />
                    </Flex>
                  </div>
                </div>
              </Flex>
            </Space>
          </div>
        </Col>
        </Row>

        <Spin spinning={loading}>
          <Tabs style={{marginBottom:24}}
            items={[
              {
                key:'performance-breakdown',
                label:( <Space size={6}><DashboardOutlined/> <span>Performance Breakdown</span></Space>),
                  children:(
                    <Row gutter={[16, 16]}>
                      <Col xs={24} lg={24}>
                        <Card title={<Space> <TrophyOutlined /> <span>Performance Breakdown</span></Space>} style={{borderRadius: 12, marginBottom: 16, border: '1px solid #f0f0f0'}}>
                          <Row gutter={[10, 10]} size={16} style={{ width: '100%' }}>
                            {scores?.map(item => (
                              <Col span={8}>
                                  <ScoreProgress label={item?.label} score={item?.score} max={item?.max} progress={item?.progress} color={item?.color} icon={item?.icon} breakdown={item?.breakdown} />
                              </Col>
                              ))}
                            </Row>
                          </Card>
                      </Col>
                    </Row>
                  )
              },
              {
                key:'how-scoring-works',
                label:( <Space size={6}><DashboardOutlined/> How Scoring Works</Space>),
                children:(
                  <Row gutter={[16, 16]}>
                    <HowScoringWorksComp/>
                  </Row>
                )}
              ]}
            />
        </Spin>
        <QuickActionsComp/>

      {/* Main Tabs */}
      {/* <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        style={{ marginBottom: 24 }}
        items={[
          {
            key: 'performance',
            label: (
              <Space size={6}>
                <DashboardOutlined />
                <span>Performance Overview</span>
              </Space>
            ),
            children: (
              <div>
                <Tabs
                  style={{marginBottom:24}}
                  items={[
                    {
                      key:'performance-breakdown',
                      label:( <Space size={6}><DashboardOutlined/> <span>Performance Breakdown</span></Space>),
                      children:(
                        <Row gutter={[16, 16]}>
                          <Col xs={24} lg={24}>
                            <Card title={<Space> <TrophyOutlined /> <span>Performance Breakdown</span></Space>} style={{borderRadius: 12, marginBottom: 16, border: '1px solid #f0f0f0'}}>
                              <Row gutter={[10, 10]} size={16} style={{ width: '100%' }}>
                                {performanceData?.scores?.map(item => (
                                  <Col span={12}>
                                     <ScoreProgress label={item.label} score={item.score} max={item.max} progress={item.progress} color={item.color} icon={item.icon} breakdown={item.breakdown} />
                                  </Col>
                                ))}
                              </Row>
                            </Card>
                            <QuickActionsComp/>
                          </Col>
                       </Row>
                      )
                    },
                    {
                      key:'how-scoring-works',
                      label:( <Space size={6}><DashboardOutlined/> How Scoring Works</Space>),
                      children:(
                          <Row gutter={[16, 16]}>
                            <HowScoringWorksComp/>
                            <QuickActionsComp/>
                         </Row>
                      )
                    }
                  ]}
                />
              </div>
            )
          },
          {
            key: 'leadMetrics',
            label: ( <Space size={6}> <BarChartOutlined />  <span>Lead Metrics Dashboard</span></Space>),
            children: (<LeadMetrics/> )
          }
        ]}
      /> */}

    </div>
  );
};

export default ExecutiveDashboardMain;