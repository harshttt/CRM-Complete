import { Button, Card, Row, Col, Flex, Form, Input, Modal, Select, Space, Tag, Spin, Empty, Typography, List, Divider, Avatar } from "antd";
import useMessage from "antd/es/message/useMessage";
import { useEffect, useState } from "react";
import { useAddComment, useListComment, useUpdateComment } from "../../../../api-hooks/comments";
import { ClockCircleOutlined, EditOutlined, MessageOutlined, PlusOutlined, UserOutlined } from "@ant-design/icons";
import commonObj from "../../../../commonObj";
import MyPagination from "../../../components/Pagination";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";
import ReminderModal from "../../reminders/ReminderModal";
import util from "../../../../utils/util";

const {Text} = Typography;

/*──────────── Lead Comment Modal ────────────*/
export default function LeadCommentsModal({ lead, onClose }) {
  const [form] = Form.useForm();
  const open = !!lead;
  const [messageApi, contextHolder] = useMessage();
  const [currentStage, setCurrentStage] = useState(lead?.stages || lead?.stage);
  const [editCommentData, setEditCommentData] = useState(null);
  const [reminderModal, setReminderModal] = useState(false);

  const navigate = useNavigate();

  // ---- API hooks ----
  const { data, isFetching, isError, error, refetch } = useListComment({qData: { page: 1, limit: 20 }, leadId: lead?.id });

  const COMMENT_TYPE_OPTIONS = util.enumToOptions(commonObj?.constants?.commentEnums?.COMMENT_TYPE);
  const CONVERSATION_TYPE_OPTIONS = util.enumToOptions(commonObj?.constants?.commentEnums?.CONVERSATION_TYPE);
  const STAGE_OPTIONS = util.enumToOptions(commonObj?.constants?.leadEnums?.STAGE);

  const comments = data?.data || [];
  const qData = data?.qData;

  const { mutate, isPending } = useAddComment({
    onSuccess: (res) => {
      messageApi.success(res.message || "Comment added");
      refetch();
    },
    onError: (err) => {
      messageApi.error(err?.message || "Failed to add comment");
    },
  });

  const {mutate:editComment, isPending:isEditingComment} = useUpdateComment({
    onSuccess: res=> {
      messageApi.success(res.message || 'Comment added');
      setEditCommentData(null);
      refetch();
    },
    onError: err => {
      messageApi.error(err?.message || 'Failed to update comment');
    }
  });

  // ---- Helpers for UI ----
  const getCommentTypeColor = (type) => {
    const t = (type || "").toLowerCase();
    if (t === "internal") return "purple";
    if (t === "client") return "green";
    if (t === "system") return "default";
    return "default";
  };

  const getConversationColor = (conv) => {
    const t = (conv || "").toLowerCase();
    if (t === "call") return "volcano";
    if (t === "whatsapp") return "green";
    if (t === "meeting") return "geekblue";
    if (t === "visit") return "cyan";
    if (t === "mail") return "blue";
    if (t === "sms") return "orange";
    return "default";
  };

  const getStageColor = (stage) => {
    const s = (stage || "").toLowerCase();
    /* ===== NEW / EARLY ===== */
    if (["new", "fresh", "open"].includes(s)) return "blue";
    /* ===== CALL / ATTEMPT ===== */
    if (["call_attempt", "call_back", "not_answered"].includes(s))
      return "cyan";
    /* ===== CONTACTED / ENGAGED ===== */
    if (["contacted", "interested", "prospect", "future_prospect", "reregistered",].includes(s))
      return "geekblue";
    /* ===== MEETING / VISIT ===== */
    if (["meeting_scheduled", "site_visit",].includes(s))
      return "purple";
    /* ===== FOLLOW UP ===== */
    if (["follow_up", "follou_up"].includes(s)) return "orange";
    /* ===== QUALIFICATION ===== */
    if (s === "qualified") return "green";
    if (s === "unqualified") return "red";
    /* ===== NEGOTIATION / PAYMENT ===== */
    if (["negotiation", "payment"].includes(s)) return "magenta";
    /* ===== ACTIVE WORK ===== */
    if (["in_progress","onboarding","project_done",].includes(s))
      return "gold";
    /* ===== BAD / INVALID LEADS ===== */
    if (["invalid","junk_lead","dump",].includes(s))
      return "volcano";
    /* ===== LOST ===== */
    if (["lost_lead", "closed_lost"].includes(s)) return "error";
    /* ===== WON ===== */
    if (s === "closed_won") return "success";
    /* ===== ARCHIVED ===== */
    if (["archived", "archieved"].includes(s)) return "default";
    return "default";
  };

  // const handleSubmitComment = (values) => {
  //   if(editCommentData){
  //     editComment({
  //       ...values,
  //       id:editCommentData?.id
  //     })

  //   }else{
  //   mutate({
  //     ...values,
  //     leadId: lead?.id,
  //   });
  //   }
  //   form.resetFields();
  // };

const handleSubmitComment = (values) => {
  const payload = {
    ...values,
    leadId: lead?.id,
  };

  if (editCommentData) {
    editComment(
      { ...payload, id: editCommentData.id },
      {
        onSuccess: () => {
          setEditCommentData(null);
          afterSubmit(values);
        },
      }
    );
  } else {
    mutate(payload, {
      onSuccess: () => {
        afterSubmit(values);
      },
    });
  }
};

const afterSubmit = (values) => {
  if (values.stage) {
    setCurrentStage(values.stage);
  }
  form.resetFields();
  form.setFieldsValue({
    stage: values.stage,
  });
  refetch();
};

const handleEdit = (item) => {
  setEditCommentData(item);

  form.setFieldsValue({
    comment: item.comment,
    commentType: item.commentType,
    conversationType: item.conversationType,
    stage:item.stage
  });
  setShowStageField(false);
};

const handleCreateTask = () => {
 navigate(`/tasks?leadId=${lead?.id}`)
};

const handleCreateReminder = () => {
  setReminderModal(true);
}

const handleReminderModalClose = () => {
  setReminderModal(false)
}

useEffect(() => {
  if(lead?.stages){
    setCurrentStage(lead?.stages);
    form.setFieldsValue({stage:lead?.stages});
  }
},[lead, form]);

  // ---- Effects ----
  useEffect(() => {
    if (lead) {
      refetch();
      form.resetFields();
    }
  }, [lead, form, refetch]);

  return (
    <Modal open={open} onCancel={onClose} footer={null} width={1200} styles={{body:{paddingTop:8}}}
      title={
        <Flex justify="space-between" style={{paddingRight:'20px'}}>
        <Space>
          <MessageOutlined />
          <span>Comments – {lead?.leadName || lead?.fullName || "Lead"}</span>
        </Space>
        <Space>
        <Button type="primary" style={{ borderRadius: 999 }}  onClick={handleCreateReminder}>Create Reminder</Button>
        <Button type="primary" style={{ borderRadius: 999 }}  onClick={handleCreateTask}>Create Task</Button>
        {/* <Button style={{borderRadius:999}} onClick={handleViewLead}>View Lead</Button> */}
        </Space>
        </Flex>
      }
    >
      {contextHolder}
      <Flex gap={16} align="stretch" style={{ minHeight: 320 }}>
        {/* Add comment box */}
        <Card size="small" style={{ borderRadius: 12, border: "1px solid #f0f0f0", background:"linear-gradient(135deg, #f5f7ff 0%, #ffffff 40%, #fdf7ff 100%)", minWidth: 360, maxWidth: 420}}
          styles={{body:{ padding: 14 }}} title={ <Space> <PlusOutlined /> <span>Add Comment</span> </Space>}
        >
          <Form layout="vertical" form={form}  onFinish={handleSubmitComment}  disabled={isPending || isEditingComment} >
            <Row gutter={[12, 12]}>

              <Col span={24}>
                <Form.Item name={"stage"} label={"Lead Stage"} rules={[{ required: true, message: "Select lead stage" }]} initialValue={lead?.stages}>
                  <Select placeholder="Select Lead Stage" options={STAGE_OPTIONS?.map(item => ({label:item?.label, value:item?.value}))} />
                </Form.Item>
              </Col> 

              <Col span={12}>
                <Form.Item name="commentType" label="Comment Type" rules={[{ required: true, message: "Select comment type" }]}>
                  <Select placeholder="Select Comment Type" options={COMMENT_TYPE_OPTIONS?.map(item => ({label:item?.label, value:item?.value}))}/>
                </Form.Item>
              </Col>

              <Col span={12}>
                <Form.Item name={"conversationType"} label={"Conversation Type"} rules={[{ required: true, message: "Select conversation type" }]}>
                  <Select placeholder="Select Conversation Type" options={CONVERSATION_TYPE_OPTIONS?.map(item => ({label:item?.label, value:item?.value}))} />
                </Form.Item>
              </Col>

              <Col span={24}>
                <Form.Item name="comment" label="Comment" rules={[{ required: true, message: "Please enter a comment" }]}>
                  <Input.TextArea rows={4} placeholder="e.g. Client is interested in site visit this weekend..."/>
                </Form.Item>
              </Col>

              <Col span={24}>
                <Flex justify="flex-end">
                  <Button type="primary" htmlType="submit" style={{ borderRadius: 999 }} loading={isPending}>Add Comment</Button>
                </Flex>
              </Col>
            </Row>
          </Form>
        </Card>

        {/* Comments list */}
        <Card size="small" style={{borderRadius: 12, border: "1px solid #f0f0f0", background: "#ffffff", width: "100%"}} styles={{body:{padding:12}}}
          title={
            <Space>
              <MessageOutlined />
              <span>All Comments</span>
              <Tag color="blue">{comments.length}</Tag>
            </Space>
          }
          extra={ isError ? ( <Text type="danger" style={{ fontSize: 12 }}>{error?.message || "Failed to load comments"} </Text>) : null}
        >
          {isFetching ? ( <div style={{ padding: 20, textAlign: "center" }}><Spin /></div>) : comments.length === 0 ? (
            <Empty description="No comments added yet." image={Empty.PRESENTED_IMAGE_SIMPLE} />) : (
          <>
            <List style={{height: "50vh", overflowY: "auto"}} dataSource={comments} itemLayout="horizontal"
              renderItem={(item) => (
                <List.Item style={{paddingBlock: 10, borderBottom: "1px dashed #f0f0f0"}}>
                  <List.Item.Meta avatar={ <Avatar size="small" icon={<UserOutlined />} style={{ backgroundColor: "#2f54eb" }}/>}
                    title={
                      <Flex gap={8} align="start" justify="space-between" wrap>
                        <Space size={6}>
                          <Text strong> {item?.createdBy?.fullName || "User"}</Text>
                          <Tag color={getCommentTypeColor(item?.commentType)} style={{ borderRadius: 999 }}>{item?.commentType || "Internal"}</Tag>
                          {item?.conversationType && (<Tag color={getConversationColor(item?.conversationType)} style={{ borderRadius: 999 }}>{item?.conversationType}</Tag>)}
                          {item?.stage && (<Tag color={getStageColor(item?.stages)} style={{ borderRadius: 999 }}> {item?.stage}</Tag>)}
                        </Space>

                        <Flex vertical align="end">
                          {commonObj?.user?.id === item?.createdBy?.id &&  (<Space> <Button type="text" icon={<EditOutlined/>}  onClick={() => handleEdit(item)} /> </Space> )}
                          <Space size={6}>
                            <ClockCircleOutlined style={{ fontSize: 12 }} />
                            <Text type="secondary" style={{ fontSize: 12 }}>{dayjs(item.createdAt).format("DD MMM YYYY, hh:mm A")}</Text>
                          </Space>
                        </Flex>
                      </Flex>
                    }
                    description={ <Text style={{ fontSize: 13 }}>{item.comment}</Text>}
                  />
                </List.Item>
              )}
            />
            <Divider style={{margin:'14px 0 8px'}}/>
            <MyPagination {...{qData}} total={qData?.total}/>
          </>
          )}
        </Card>

      </Flex>
      <ReminderModal entityType={'lead'} open={reminderModal} onClose={handleReminderModalClose} id={lead?.id} />
    </Modal>
  );
}

