import { ClusterOutlined, EnvironmentOutlined, MailOutlined, PhoneOutlined, UserOutlined } from "@ant-design/icons";
import { Avatar, Descriptions, Space, Typography,Modal, Breadcrumb } from "antd";

 const {Text, Title} = Typography;

/*──────────── Assigned User Modal ────────────*/
export default function AssignedUserModal({ assignedTo, onClose }) {
  const open = !!assignedTo;

  if (!assignedTo) return null;

  const {fullName, email, phone, active, branch, region, role, parentUser, ancestorIds = [], isOnline, createdAt, updatedAt, lastLoginAt} = assignedTo;

  const formatDateTime = (value) => {
    if (!value) return "—";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "—";
    return d.toLocaleString();
  };

  return (
    <Modal open={open} onCancel={onClose} footer={null} width={520}
      title={
        <Space align="center">
          <Avatar size="small" icon={<UserOutlined />} style={{ backgroundColor: "#2f54eb" }} />
          <Space direction="vertical" size={0}>
            <span>Assigned User</span>
            <Text type="secondary" style={{ fontSize: 11 }}> Owner of this lead </Text>
          </Space>
        </Space>
      }
    >
      {/* Header card */}
      <div style={{marginBottom: 12, padding: 12, borderRadius: 12, border: "1px solid #f0f0f0",background:"linear-gradient(135deg, rgba(245,247,255,0.98), #ffffff)",}}>
        <Space direction="vertical" size={4} style={{ width: "100%" }}>
          <Space align="center" style={{ width: "100%", justifyContent: "space-between" }}>
            <Space align="center">
              <Avatar size={40} icon={<UserOutlined />} style={{ backgroundColor: "#1d39c4" }}/>
              <Space direction="vertical" size={0}>
                <Title level={5} style={{ margin: 0 }}> {fullName || "Unnamed User"} </Title>
                {/* <Space size={4} wrap>
                  <Tag color={active ? "green" : "red"} style={{ borderRadius: 999 }}> {active ? "Active" : "Inactive"}</Tag>
                  <Tag color={isOnline ? "green" : "red"} style={{ borderRadius: 999 }}> {isOnline ? "Online" : "Offline"}</Tag>
                </Space> */}
              </Space>
            </Space>
          </Space>

          <Space direction="vertical" size={2} style={{ marginTop: 4 }}>
            {email && ( <Space size={6}> <MailOutlined style={{ color: "#8c8c8c" }} /> <Text type="secondary" style={{ fontSize: 12 }}>{email}</Text></Space>)}
            {phone && ( <Space size={6}> <PhoneOutlined style={{ color: "#8c8c8c" }} /> <Text style={{ fontSize: 12 }}>{phone}</Text></Space>)}
          </Space>
        </Space>
      </div>

      {/* Details */}
      <Descriptions column={1} size="small" bordered labelStyle={{ width: 140, fontWeight: 500 }} contentStyle={{ background: "#fff" }}>
        <Descriptions.Item label="Branch / Region">
          {branch || region ? ( <Space> <EnvironmentOutlined /> <span>{branch || "—"} {region ? ` · ${region}` : ""}</span> </Space> ) : (  "—" )}
        </Descriptions.Item>

        <Descriptions.Item label="Role">
          <Space size={6}> <ClusterOutlined style={{ color: "#8c8c8c" }} /> <Text copyable style={{ fontSize: 12 }}>{role?.name || "—"}</Text> </Space>
        </Descriptions.Item>

        <Descriptions.Item label="Parent User">
          {parentUser ? (<Text copyable style={{ fontSize: 12 }}>{parentUser?.fullName}</Text>) : ("—")}
        </Descriptions.Item>

        <Descriptions.Item label="Ancestors">
          {ancestorIds.length ? (<Breadcrumb separator='>' items={ancestorIds?.map(item => ({title:item?.fullName}))}/>) : ( "—" )}
        </Descriptions.Item>
      </Descriptions>
    </Modal>
  );
}
