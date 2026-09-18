import { ClockCircleOutlined, HistoryOutlined, SwapRightOutlined, UserOutlined } from "@ant-design/icons";
import { Avatar, Card, Divider, Empty, Flex, List, Modal, Space, Tag, Typography } from "antd";
import dayjs from "dayjs";
import { useLeadAssignmentHistory } from "../../../../api-hooks/leads";
import { useState } from "react";

const {Text} = Typography;

export default function AssignHistoryModal({open, lead, onClose }) {
  const [qData, setQData] = useState({page: 1, limit: 20});

  const {data, isFetching:isAssignmentHistoryLoading, isError, error, refetch, refetchWithQuery} = useLeadAssignmentHistory({leadId:lead?.id,qData});
  const history = data?.history || [];

  return (
    <Modal open={open} onCancel={onClose} footer={null} width={900} title={<Space> <HistoryOutlined/> <span>Assignment History – {lead?.fullName || lead?.leadName}</span> </Space>}>
      <Card size="small" style={{borderRadius: 12, border: "1px solid #f0f0f0", background: "#ffffff"}} styles={{body:{padding:12}}}>
        { history?.length === 0 ? (<Empty description="No assignment history available." image={Empty.PRESENTED_IMAGE_SIMPLE} />) : (
          <>
            <List style={{ maxHeight: "60vh", overflowY: "auto" }} dataSource={history} itemLayout="vertical"
              renderItem={(item) => (
                <List.Item style={{paddingBlock: 10, borderBottom: "1px dashed #eee"}}>
                  <List.Item.Meta
                    avatar={<Avatar size="small" icon={<UserOutlined />} style={{ backgroundColor: "#597ef7" }}/>}
                    title={
                      <Flex justify="space-between" align="start">
                        <Space size={8} wrap>
                          <Text strong>Assignment Change</Text>
                          <Tag color="purple">{item?.roleFrom || "N/A"}</Tag>
                          <SwapRightOutlined />
                          <Tag color="green">{item?.roleTo || "N/A"}</Tag>
                        </Space>

                        <Space>
                          <ClockCircleOutlined style={{ fontSize: 12 }} />
                          <Text type="secondary" style={{ fontSize: 12 }}>{dayjs(item?.changedAt).format("DD MMM YYYY, hh:mm A")}</Text>
                        </Space>
                      </Flex>
                    }
                    description={
                      <div style={{ marginTop: 6 }}>
                        <Space direction="vertical" size={2}>
                          <Text> <b>From:</b>{" "} {item?.from?.fullName || "Unknown"} </Text>
                          <Text> <b>To:  </b>{" "} {item?.to?.fullName || "Unknown"}</Text>
                          <Text> <b>Changed By:</b>{" "} {item?.changedBy?.fullName || "Unknown"} </Text>
                          {item.reason && (<Text> <b>Reason:</b> {item?.reason}</Text>)}
                        </Space>
                      </div>
                    }
                  />
                </List.Item>
              )}
            />

            <Divider style={{ margin: "14px 0 8px" }} />
            {/* <MyPagination {...{ qData }} total={qData?.total} /> */}
          </>
        )}
      </Card>
    </Modal>
  );
}