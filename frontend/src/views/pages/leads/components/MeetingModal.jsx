import { Modal, Form, Input, DatePicker, Button, Row, Col, Space, Divider, InputNumber, message, Spin, AutoComplete, Radio, Select, Popconfirm, Tag, Flex } from "antd";
import { CalendarOutlined, DeleteOutlined, PlusOutlined, } from "@ant-design/icons";
import dayjs from "dayjs";
import { useEffect, useRef, useState } from "react";
import commonObj from "../../../../commonObj";
import { useCancelMeeting, useSchduleMeeting, useUpdateMeeting, } from "../../../../api-hooks/meeting";
import { useUserDropdown, useUserSearch } from "../../../../api-hooks/user";

/* ========================================================= */
/* ======================= MODAL =========================== */
/* ========================================================= */

export default function MeetingModal({ open, onClose, initialData, leadId }) {
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();
  const debounceRef = useRef(null);
  const [hasMeeting, setHasMeeting] = useState(false);

  const meeting = initialData?.meeting;

  /* ---------------- Users ---------------- */
  // const {data: usrRes, isFetching: isUsrLoading, refetchWithQuery} = useUserSearch({ qData: { page: 1, limit: 20 } });
  const { data: usrRes, isFetching: isUsrLoading, refetchWithQuery } = useUserDropdown({ qData: { page: 1, limit: 20 } });
  const userOptions = usrRes?.data || [];

  const handleUserSearch = (value) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      if (value) refetchWithQuery({ q: value });
    }, 400);
  };

  /* ---------------- Mutations ---------------- */
  const onSuccessClose = (msg) => {
    messageApi.success(msg);
    form.resetFields();
    onClose(true);
  };

  const { mutate: schduleMeeting, isPending: isCreating } =
    useSchduleMeeting({
      onSuccess: (res) => onSuccessClose(res?.message),
      onError: (err) => messageApi.error(err?.message),
    });

  const { mutate: updateMeeting, isPending: isUpdating } =
    useUpdateMeeting({
      onSuccess: (res) => onSuccessClose(res?.message),
      onError: (err) => messageApi.error(err?.message),
    });

  const { mutate: cancelMeeting, isPending: isCancelling } =
    useCancelMeeting({
      onSuccess: (res) => onSuccessClose(res?.message),
      onError: (err) => messageApi.error(err?.message),
    });

  const isLoading = isCreating || isUpdating || isCancelling;

  /* ---------------- Submit ---------------- */
  const onFinish = (values) => {
    const payload = {
      title: values.title,
      assignedTo: values.assignedTo,
      scheduledAt: values.scheduledAt.format("DD/MM/YYYY hh:mm:ss A"),
      durationMinutes: values.durationMinutes,
      participants: values.participants,
      notes: values.notes,
      leadId,
    };

    hasMeeting ? updateMeeting({ id: meeting?.id, payload }) : schduleMeeting(payload);
  };

  useEffect(() => {
    setHasMeeting(Boolean(meeting?.id));

    if (meeting) {
      const isSelfAssigned =
        meeting?.assignedTo?.id === commonObj?.id;

      form.setFieldsValue({
        title: meeting?.title || "",
        assignedToType: isSelfAssigned ? commonObj?.id : "other",
        assignedTo: meeting?.assignedTo?.id,

        assignedToName: meeting?.fullName,

        scheduledAt: meeting?.scheduledAt
          ? dayjs(meeting?.scheduledAt, "DD/MM/YYYY hh:mm A")
          : null,

        durationMinutes: meeting?.durationMinutes ?? 30,

        participants: (meeting?.participants || []).map((p) => ({
          type: p?.type || "user",
          user: p?.user?.id || undefined,
          userName: p?.user?.name || "",
          email: p?.email || "",
          name: p?.name || "",
        })),

        notes: meeting?.notes || "",
      });
    }
  }, [initialData]);

  return (
    <Modal open={open} footer={null} destroyOnHidden width={820} className="meeting-modal"
      onCancel={() => {
        form.resetFields();
        onClose(false);
      }}
      title={
        <Space>
          <CalendarOutlined />
          <span>{hasMeeting ? "Meeting Details" : "Schedule Meeting"}</span>
        </Space>
      }
    >
      {contextHolder}

      <Spin spinning={isLoading}>
        {hasMeeting && (<ViewMeetingInfo meeting={meeting} />)}

        {(!hasMeeting ||
          meeting?.status === "scheduled") && (
            <MeetingForm meeting={meeting} cancelMeeting={cancelMeeting} form={form} onFinish={onFinish} handleUserSearch={handleUserSearch} userOptions={userOptions} isUsrLoading={isUsrLoading} status={meeting?.status} />
          )}

        {hasMeeting && meeting?.status !== "scheduled" && (
          <>
            <Divider />
            <Row justify="end">
              <Button type="primary" style={{ borderRadius: 999 }} onClick={() => setHasMeeting(false)}> Create New </Button>
            </Row>
          </>
        )}
      </Spin>
    </Modal>
  );
}

/* ========================================================= */
/* ======================= FORM ============================ */
/* ========================================================= */

function Section({ title, children }) {
  return (
    <div style={{ padding: 16, borderRadius: 14, background: "#fff", border: "1px solid #f0f0f0", marginBottom: 16 }}>
      {title && (
        <>
          <b>{title}</b>
          <Divider style={{ margin: "8px 0 12px" }} />
        </>
      )}
      {children}
    </div>
  );
}

function MeetingForm({ meeting, cancelMeeting, form, onFinish, handleUserSearch, userOptions, isUsrLoading, status = "" }) {
  return (
    <Form layout="vertical" form={form} onFinish={onFinish} initialValues={{ durationMinutes: 30, participants: [], }}
    >
      <Section title="Basic Information">
        <Row gutter={12}>
          <Col span={12}>
            <Form.Item label="Meeting Title" name="title" rules={[{ required: true }]}>
              <Input placeholder="Client Demo / Discussion" />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item label="Assigned To" name="assignedToType">
              <Radio.Group
                options={[
                  { label: "Self", value: commonObj?.id },
                  { label: "Other", value: "other" },
                ]}
                onChange={(e) => { form.setFieldsValue({ assignedTo: e.target.value === commonObj?.id ? commonObj?.id : null, }); }}
              />
            </Form.Item>

            <Form.Item name="assignedTo" hidden />

            <Form.Item noStyle shouldUpdate>
              {({ getFieldValue }) =>
                getFieldValue("assignedToType") === "other" && (
                  <Form.Item name="assignedToName" rules={[{ required: true, message: "Select user" }]}>
                    <AutoComplete
                      placeholder="Search user"
                      options={userOptions?.map((u) => ({
                        label: u.fullName,
                        value: u.fullName,
                        id: u.id,
                      }))}
                      onSearch={handleUserSearch}
                      onSelect={(v, o) =>
                        form.setFieldsValue({
                          assignedToName: v,
                          assignedTo: o.id,
                        })
                      }
                      notFoundContent={isUsrLoading ? <Flex justify="center" align="center"> <Spin size="small" /> </Flex> : null}
                    />
                  </Form.Item>
                )
              }
            </Form.Item>

          </Col>
        </Row>
      </Section>

      <Section title="Schedule">
        <Row gutter={12}>
          <Col span={12}>
            <Form.Item label="Scheduled At" name="scheduledAt" rules={[{ required: true }]}>
              <DatePicker showTime format="DD/MM/YYYY hh:mm A" style={{ width: "100%" }} />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item label="Duration (minutes)" name="durationMinutes" rules={[{ required: true }]}>
              <InputNumber min={15} step={15} style={{ width: "100%" }} />
            </Form.Item>
          </Col>
        </Row>
      </Section>

      <Section title="Participants">
        <Participants form={form} />
      </Section>

      <Section title="Notes">
        <Form.Item name="notes">
          <Input.TextArea rows={3} />
        </Form.Item>
      </Section>

      <Row justify="end" gutter={8}>
        {meeting?.status === "scheduled" && (
          <Col>
            <Popconfirm title="Cancel this meeting?" onConfirm={() => cancelMeeting(meeting?.id)}>
              <Button danger type="primary" style={{ borderRadius: 999 }}>Cancel Meeting</Button>
            </Popconfirm>
          </Col>
        )}
        <Col>
          <Button htmlType="submit" type="primary" style={{ borderRadius: 999 }}>
            {status === "scheduled" ? "Update Meeting" : "Create Meeting"}
          </Button>
        </Col>
      </Row>
    </Form>
  );
}

/* ========================================================= */
/* ===================== PARTICIPANTS ====================== */
/* ========================================================= */

function Participants({ form }) {
  const debounceRef = useRef(null);
  const { data, isFetching, refetchWithQuery } = useUserDropdown({ qData: { page: 1, limit: 20 } });

  const users = data?.data || [];

  const handleSearch = (value) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      if (value) refetchWithQuery({ q: value });
    }, 400);
  };

  return (
    <Form.List name="participants">
      {(fields, { add, remove }) => (
        <>
          {fields?.map(({ key, name }) => (
            <Row key={key} gutter={8} align="middle">
              <Col span={6}>
                <Form.Item name={[name, "type"]} rules={[{ required: true }]}>
                  <Select placeholder="Type" options={[{ label: "User", value: "user" }, { label: "External", value: "external" }]} />
                </Form.Item>
              </Col>

              <Col span={8}>
                <Form.Item shouldUpdate style={{ margin: '0px' }}>
                  {() =>
                    form.getFieldValue(["participants", name, "type",]) === "user" ? (
                      <>
                        <Form.Item
                          name={[name, "userName"]}
                          rules={[{ required: true, message: "Please select a user" }]}
                        >
                          <AutoComplete
                            placeholder="Search user"
                            options={users?.map((u) => ({
                              label: u.fullName,
                              value: u.fullName,
                              id: u.id,
                            }))}
                            onSearch={handleSearch}
                            onSelect={(v, o) => {
                              const list = form.getFieldValue("participants") || [];

                              list[name] = {
                                ...list[name],
                                userName: v,
                                user: o.id,
                              };

                              form.setFieldsValue({
                                participants: list,
                              });
                            }}
                            notFoundContent={
                              isFetching ? (
                                <Flex justify="center" align="center">
                                  <Spin size="small" />
                                </Flex>
                              ) : null
                            }
                          />
                        </Form.Item>
                        <Form.Item name={[name, "user"]} hidden />
                      </>
                    ) : (
                      <Form.Item name={[name, "email"]} rules={[{ required: true, type: "email" }]}>
                        <Input placeholder="Email" />
                      </Form.Item>
                    )
                  }
                </Form.Item>
              </Col>

              <Col span={8}>
                <Form.Item name={[name, "name"]} rules={[{ required: true }]}>
                  <Input placeholder="Participant Name" />
                </Form.Item>
              </Col>

              <Col span={2}>
                <Button danger type="text" shape="circle" icon={<DeleteOutlined />} onClick={() => remove(name)} />
              </Col>
            </Row>
          ))}

          <Button block type="dashed" icon={<PlusOutlined />} onClick={add}>Add Participant</Button>
        </>
      )}
    </Form.List>
  );
}

/* ========================================================= */
/* ====================== VIEW ============================== */
/* ========================================================= */

function ViewMeetingInfo({ meeting }) {
  const statusMap = {
    scheduled: { bg: "#e6f7ff", border: "#91d5ff", color: "blue" },
    cancelled: { bg: "#fff1f0", border: "#ffa39e", color: "red" },
    completed: { bg: "#f6ffed", border: "#b7eb8f", color: "green" },
  };

  const s = statusMap[meeting?.status] || statusMap.scheduled;

  return (
    <div style={{ padding: 16, borderRadius: 14, background: s.bg, border: `1px solid ${s.border}`, marginBottom: 16, }}>
      <Space direction="vertical" size={6}>
        <Space>
          <b>Status:</b>
          <Tag color={s.color} style={{ borderRadius: 999 }}>{meeting?.status}</Tag>
        </Space>

        <Space>
          <b>Scheduled At:</b>
          {meeting?.scheduledAt}
        </Space>

        {meeting?.meetLink && (
          <Space>
            <b>Meeting Link:</b>
            <a href={meeting?.meetLink} target="_blank">Join Meeting →</a>
          </Space>
        )}
      </Space>
    </div>
  );
}
