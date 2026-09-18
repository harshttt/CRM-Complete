import { Alert, Form, message, Modal, Select, Space } from "antd";
import { useState } from "react";
import { useRoleListForDropdown } from "../../../../api-hooks/roles";
import { useUserList } from "../../../../api-hooks/user";
import { useLeadBulkAssign } from "../../../../api-hooks/leads";
import { TeamOutlined } from "@ant-design/icons";

/*──────────── BULK ASSIGN MODAL ────────────*/
export default function BulkAssignModal({ open, onCancel, onSubmit, leadIds = [] }) {
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();
  const [selectedRoleLevel, setSelectedRoleLevel] = useState(null);
  // ----- Roles -----
  const {
    data: rolesRes,
    isPending: isRoleListLoading,
    isError: isRoleListError,
    error: roleListError,
  } = useRoleListForDropdown();

  const rolesList = rolesRes?.data || rolesRes || [];

  // ----- Users (based on role) -----
  const {
    data: usersRes,
    isPending: isUserListLoading,
    isError: isUserListError,
    error: userListError,
    refetchWithQuery: refetchUsersWithQuery,
  } = useUserList({
    enabled: false,
  });

  const userList = usersRes?.data || usersRes || [];

  const { mutate: assignLead, isPending: isLeadsAssigning } = useLeadBulkAssign(
    {
      onSuccess: (res) => {
        messageApi.success(res?.message || "Leads assigned successfully");
        form.resetFields();
        setSelectedRoleLevel(null);
        onSubmit?.();
      },
      onError: (err) => {
        messageApi.error(err?.message || "Failed to assign leads");
      },
    }
  );

  // ----- Handlers -----
  const handleRoleChange = (roleLevel) => {
    setSelectedRoleLevel(roleLevel);
    form.setFieldsValue({ assignedTo: undefined });

    if (!roleLevel) return;

    // Fetch users for this roleLevel
    refetchUsersWithQuery({ page: 1, limit: 50, roleLevel });
  };

  const handleFinish = (values) => {
    const payload = { leadIds, assignedTo: values?.assignedTo };
    assignLead(payload);
  };

  return (
    <Modal
      open={open}
      onCancel={() => {
        form.resetFields();
        setSelectedRoleLevel(null);
        onCancel?.();
      }}
      onOk={() => form.submit()}
      confirmLoading={isLeadsAssigning}
      title={
        <Space>
          <TeamOutlined />
          <span>Bulk Assign Leads</span>
        </Space>
      }
    >
      {contextHolder}

      {isRoleListError && (<Alert type="error" showIcon style={{ marginBottom: 8 }} message="Failed to load roles" description={roleListError?.message} />)}
      {isUserListError && (<Alert type="error" showIcon style={{ marginBottom: 8 }} message="Failed to load users for selected role" description={userListError?.message}/>)}

      <Form layout="vertical" form={form} onFinish={handleFinish}>
        {/* ROLE SELECT */}
        <Form.Item name="role" label="Assignee Role" rules={[{ required: true, message: "Please select role" }]}>
          <Select
            placeholder="Select role"
            showSearch
            loading={isRoleListLoading}
            onChange={handleRoleChange}
            optionFilterProp="label"
            options={(rolesList || [])?.map((item) => ({
              label: item.name,
              value: item.roleLevel,
            }))}
          />
        </Form.Item>

        {/* USER SELECT */}
        <Form.Item name="assignedTo" label="Assign To (User)" rules={[{ required: true, message: "Please select user" }]}>
          <Select
            placeholder={selectedRoleLevel ? "Select the User" : "Select role first"}
            showSearch
            disabled={!selectedRoleLevel || isUserListLoading}
            loading={isUserListLoading}
            optionFilterProp="label"
            options={(userList || [])?.map((u) => ({
              label: u.fullName || u.name || u.email,
              value: u.id || u._id,
            }))}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}

