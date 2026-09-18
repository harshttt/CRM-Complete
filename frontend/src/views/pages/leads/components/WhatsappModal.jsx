import { Input, Modal, Typography, Space } from "antd";
import { useState } from "react";
import { PhoneOutlined, MessageOutlined } from "@ant-design/icons";
import commonObj from "../../../../commonObj";

const { Text, Title } = Typography;

export default function WhatsappModal({open, onClose, selectedPhone, setSelectedPhone}) {
  const [message, setMessage] = useState("");

  const handleOk = () => {
    const encodedMsg = encodeURIComponent(message);
    window.open(`https://wa.me/${selectedPhone}?text=${encodedMsg}`, "_blank");
    setMessage("");
    onClose();
  };

  const isDisabled = !selectedPhone || !message;

  const isRestricted = commonObj?.role?.roleLevel === 4;

  const blockCopy = (e) => {
    if (isRestricted) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }
  };

  const handleKeyDown = (e) => {
    if (
      isRestricted &&
      (e.ctrlKey || e.metaKey) &&
      e.key.toLowerCase() === "c"
    ) {
      e.preventDefault();
    }
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      onOk={handleOk}
      okText="Send on WhatsApp"
      okButtonProps={{disabled: isDisabled, style: { backgroundColor: "#25D366", borderColor: "#25D366" },}}
      title={
        <Space>
          <MessageOutlined style={{ color: "#25D366" }} />
          <Title level={5} style={{ margin: 0 }}> Send WhatsApp Message</Title>
        </Space>
      }
      className="whatsapp-modal"
    >
      <Space direction="vertical" size="middle" style={{ width: "100%" }}>
        {/* Phone Number */}
        <div>
          <Text type="secondary">WhatsApp Number</Text>
          {/* <Input size="large" prefix={<PhoneOutlined />} placeholder="e.g. 919876543210" value={selectedPhone} onChange={(e) => setSelectedPhone(e.target.value)} /> */}
            <Input
              size="large"
              prefix={<PhoneOutlined />}
              placeholder="e.g. 919876543210"
              value={selectedPhone}
              onChange={(e) => setSelectedPhone(e.target.value)}
              onCopy={blockCopy}
              onCut={blockCopy}
              onContextMenu={blockCopy}
              onDragStart={blockCopy}
              onKeyDown={handleKeyDown}
            />
        </div>

        {/* Message */}
        <div>
          <Text type="secondary">Message</Text>
          <Input.TextArea rows={4} maxLength={500} showCount placeholder="Type your message here..." value={message} onChange={(e) => setMessage(e.target.value)} style={{ resize: "none" }} />
        </div>

        {/* Helper text */}
        <Text type="secondary" style={{ fontSize: 12 }}>Message will open in WhatsApp Web or App</Text>
      </Space>
    </Modal>
  );
}
