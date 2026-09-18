import { Form } from "antd";

/*──────────── CHAT DRAWER ────────────*/
function ChatDrawer({ lead, onClose }) {
  const [form] = Form.useForm();
  const open = !!lead;

  const onFinish = (values) => {
    message.success("Chat / message logged (mock)");
    onClose();
    form.resetFields();
  };

  return (
    <Drawer
      title={
        <Space>
          <MessageOutlined />
          <span>Log Chat / Message – {lead?.leadName}</span>
        </Space>
      }
      placement="right"
      width={420}
      onClose={onClose}
      open={open}
    >
      <Form layout="vertical" form={form} onFinish={onFinish}>
        <Form.Item label="Contact">
          <Input value={lead?.email || lead?.phone || ""} disabled />
        </Form.Item>
        <Form.Item
          name="channel"
          label="Channel"
          rules={[{ required: true, message: "Please select channel" }]}
        >
          <Select placeholder="Select channel">
            <Option value="whatsapp">WhatsApp</Option>
            <Option value="sms">SMS</Option>
            <Option value="email">Email</Option>
            <Option value="other">Other</Option>
          </Select>
        </Form.Item>
        <Form.Item
          name="messageSummary"
          label="Message Summary"
          rules={[{ required: true, message: "Please enter summary" }]}
        >
          <Input.TextArea
            rows={3}
            placeholder="e.g. Shared price list and location map..."
          />
        </Form.Item>
        <Form.Item name="nextFollowup" label="Next Follow-up">
          <DatePicker showTime style={{ width: "100%" }} />
        </Form.Item>
        {/* <Form.Item name="nextAction" label="Next Action">
          <Input.TextArea
            rows={2}
            placeholder="e.g. Schedule site visit, share payment plan..."
          />
        </Form.Item> */}
        <Row gutter={8} justify="end">
          <Col span={12}>
            <Button block onClick={onClose}>
              Cancel
            </Button>
          </Col>
          <Col span={12}>
            <Button type="primary" block onClick={() => form.submit()}>
              Save Chat Log
            </Button>
          </Col>
        </Row>
      </Form>
    </Drawer>
  );
}

export default ChatDrawer;