import { Modal, Form, Input, DatePicker, TimePicker, Button, Row, Col, Space, Spin, Select, message, Flex, Divider, Typography } from "antd";
import { CalendarOutlined, UserOutlined, EnvironmentOutlined, ClockCircleOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { useEffect, useRef, useState } from "react";
import commonObj from "../../../commonObj";
import { useCreateSalesMeeting, useUpdateSalesMeeting, useAssignableEmployees } from "../../../api-hooks/salesMeeting";
import { useCustomerDropdown } from "../../../api-hooks/customer";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);
dayjs.extend(timezone);

const { Text, Title } = Typography;
const { Option } = Select;
const { TextArea } = Input;

export default function SalesMeetingModal({ open, onClose, editData }) {
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();
  const debounceRef = useRef(null);
  const isEdit = !!editData?.id;

  const roleLevel = commonObj?.role?.roleLevel ?? 99;
  const isEmployeeRole = roleLevel >= 4;

  /* --------- Assignable Employees --------- */
  const {
    data: empRes,
    isFetching: isEmpLoading,
    refetchWithQuery: refetchEmp,
  } = useAssignableEmployees({
    qData: {
      page: 1,
      limit: 50,
    },
  });

  const employeeOptions = empRes?.data || [];

  const handleEmployeeSearch = (value) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      refetchEmp({ q: value || "" });
    }, 400);
  };

  /* --------- Customers --------- */
  const {
    data: customerRes,
    isFetching: isCustLoading,
  } = useCustomerDropdown();

  const customers = customerRes?.data || customerRes || [];

  /* --------- Mutations --------- */
  const onSuccessClose = (msg) => {
    messageApi.success(msg);
    form.resetFields();
    onClose(true);
  };

  const { mutate: createMeeting, isPending: isCreating } = useCreateSalesMeeting({
    onSuccess: (res) => onSuccessClose(res?.message || "Meeting created"),
    onError: (err) => messageApi.error(err?.message || "Failed to create meeting"),
  });

  const { mutate: updateMeeting, isPending: isUpdating } = useUpdateSalesMeeting({
    onSuccess: (res) => onSuccessClose(res?.message || "Meeting updated"),
    onError: (err) => messageApi.error(err?.message || "Failed to update meeting"),
  });

  const isLoading = isCreating || isUpdating;

  /* --------- Submit --------- */
  const onFinish = (values) => {
    const date = values.date;
    const startTime = values.startTime;
    const endTime = values.endTime;

    const scheduledStart = date
      .hour(startTime.hour())
      .minute(startTime.minute())
      .second(0)
      .toISOString();

    const scheduledEnd = date
      .hour(endTime.hour())
      .minute(endTime.minute())
      .second(0)
      .toISOString();

    console.log("SELECTED DATE:", date.format("YYYY-MM-DD"));
    console.log("SELECTED START:", startTime.format("HH:mm"));
    console.log("SCHEDULED START SENT TO API:", scheduledStart);
    console.log("SCHEDULED END SENT TO API:", scheduledEnd);

    const payload = {
      customerId: values.customerId,
      purpose: values.purpose,
      scheduledStart,
      scheduledEnd,
      location: values.location || "",
      assignedEmployeeId: values.assignedEmployeeId,
      notes: values.notes || "",
    };

    console.log("FINAL PAYLOAD:", payload);

    if (isEdit) {
      updateMeeting({ id: editData.id, ...payload });
    } else {
      createMeeting(payload);
    }
  };

  /* --------- Populate form on edit --------- */
  useEffect(() => {
    if (open && isEdit && editData) {
      const start = editData.scheduledStart ? dayjs(editData.scheduledStart) : null;
      const end = editData.scheduledEnd ? dayjs(editData.scheduledEnd) : null;

      form.setFieldsValue({
        customerId: editData.customerId?.id || editData.customerId,
        purpose: editData.purpose || "",
        assignedEmployeeId: editData.assignedEmployeeId?.id || editData.assignedEmployeeId,
        date: start,
        startTime: start,
        endTime: end,
        location: editData.location || "",
        notes: editData.notes || "",
      });
    } else if (open && !isEdit) {
      form.resetFields();
      // Auto-select self for employees
      if (isEmployeeRole && commonObj?.id) {
        form.setFieldsValue({ assignedEmployeeId: commonObj.id });
      }
    }
  }, [open, editData, isEdit]);

  return (
    <Modal
      open={open}
      footer={null}
      destroyOnHidden
      width={720}
      onCancel={() => { form.resetFields(); onClose(false); }}
      title={
        <Space align="center" size={12}>
          <div style={{ width: 36, height: 36, borderRadius: 12, background: "linear-gradient(135deg, #e6f4ff, #d6e4ff)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <CalendarOutlined style={{ color: "#1d39c4", fontSize: 16 }} />
          </div>
          <Space direction="vertical" size={0}>
            <Title level={5} style={{ margin: 0 }}>{isEdit ? "Edit Meeting" : "Schedule Meeting"}</Title>
            <Text type="secondary" style={{ fontSize: 12 }}>Fill in the details to {isEdit ? "update" : "schedule"} a sales meeting.</Text>
          </Space>
        </Space>
      }
    >
      {contextHolder}
      <Spin spinning={isLoading}>
        <Form layout="vertical" form={form} onFinish={onFinish} style={{ marginTop: 16 }}>

          {/* Customer & Purpose */}
          <div style={{ padding: 16, borderRadius: 14, background: "#fafbff", border: "1px solid #f0f2ff", marginBottom: 16 }}>
            <Text strong style={{ fontSize: 13, color: "#1d39c4", marginBottom: 12, display: "block" }}>
              <CalendarOutlined style={{ marginRight: 6 }} /> Meeting Details
            </Text>
            <Row gutter={12}>
              <Col xs={24} md={12}>
                <Form.Item
                  name="customerId"
                  label="Customer / Account"
                  rules={[{ required: true, message: "Select a customer" }]}
                >
                  <Select
                    placeholder="Select customer"
                    showSearch
                    loading={isCustLoading}
                    filterOption={(input, option) =>
                      (option?.children ?? "")
                        .toLowerCase()
                        .includes(input.toLowerCase())
                    }
                  >
                    {console.log("customers:", customers)}

                    {customers?.map((c) => {
                      console.log("customer:", c);

                      return (
                        <Option key={c.id} value={c.id}>
                          {c.name || c.companyName}
                        </Option>
                      );
                    })}
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item name="assignedEmployeeId" label="Assign To" rules={[{ required: true, message: "Select an employee" }]}>
                  <Select
                    placeholder={isEmployeeRole ? "Assigned to you" : "Search employee"}
                    showSearch
                    loading={isEmpLoading}
                    disabled={isEmployeeRole}
                    onSearch={handleEmployeeSearch}
                    filterOption={false}
                    notFoundContent={isEmpLoading ? <Flex justify="center" align="center"><Spin size="small" /></Flex> : <Text type="secondary">No employees found</Text>}
                  >
                    {employeeOptions?.map((u) => (
                      <Option key={u.id} value={u.id}>
                        <Space size={4}>
                          <UserOutlined style={{ color: "#8c8c8c" }} />
                          <span>{u.fullName}</span>
                          {u.role?.name && <Text type="secondary" style={{ fontSize: 11 }}>({u.role.name})</Text>}
                        </Space>
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={12}>
              <Col span={24}>
                <Form.Item name="purpose" label="Purpose" rules={[{ required: true, message: "Enter meeting purpose" }]}>
                  <Input placeholder="e.g. Product demo for ABC Company" maxLength={500} />
                </Form.Item>
              </Col>
            </Row>
          </div>

          {/* Schedule */}
          <div style={{ padding: 16, borderRadius: 14, background: "#fafbff", border: "1px solid #f0f2ff", marginBottom: 16 }}>
            <Text strong style={{ fontSize: 13, color: "#52c41a", marginBottom: 12, display: "block" }}>
              <ClockCircleOutlined style={{ marginRight: 6 }} /> Schedule
            </Text>
            <Row gutter={12}>
              <Col xs={24} md={8}>
                <Form.Item name="date" label="Date" rules={[{ required: true, message: "Select date" }]}>
                  <DatePicker style={{ width: "100%" }} format="DD MMM YYYY" />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item name="startTime" label="Start Time" rules={[{ required: true, message: "Select start time" }]}>
                  <TimePicker style={{ width: "100%" }} format="hh:mm A" use12Hours minuteStep={5} />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item name="endTime" label="End Time" rules={[{ required: true, message: "Select end time" }]}>
                  <TimePicker style={{ width: "100%" }} format="hh:mm A" use12Hours minuteStep={5} />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={12}>
              <Col span={24}>
                <Form.Item name="location" label={<><EnvironmentOutlined style={{ marginRight: 4 }} /> Location / Address</>}>
                  <Input placeholder="Office address, meeting room, etc." maxLength={500} />
                </Form.Item>
              </Col>
            </Row>
          </div>

          {/* Notes */}
          <div style={{ padding: 16, borderRadius: 14, background: "#fafbff", border: "1px solid #f0f2ff", marginBottom: 16 }}>
            <Text strong style={{ fontSize: 13, color: "#faad14", marginBottom: 12, display: "block" }}>
              📝 Notes
            </Text>
            <Form.Item name="notes">
              <TextArea rows={3} placeholder="Additional notes, agenda items, preparation needed..." maxLength={2000} />
            </Form.Item>
          </div>

          {/* Actions */}
          <Row justify="end" gutter={8}>
            <Col>
              <Button style={{ borderRadius: 999 }} onClick={() => { form.resetFields(); onClose(false); }}>Cancel</Button>
            </Col>
            <Col>
              <Button type="primary" htmlType="submit" style={{ borderRadius: 999, paddingInline: 24 }} loading={isLoading}>
                {isEdit ? "Update Meeting" : "Schedule Meeting"}
              </Button>
            </Col>
          </Row>

        </Form>
      </Spin>
    </Modal>
  );
}
