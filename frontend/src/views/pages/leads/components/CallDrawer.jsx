/*──────────── CALL DRAWER ────────────*/
// function CallDrawer({ lead, onClose }) {
//   const [form] = Form.useForm();
//   const open = !!lead;

//   const onFinish = (values) => {
//     console.log("Call log for lead:", lead?.id, values);
//     // TODO: API to log call
//     message.success("Call logged (mock)");
//     onClose();
//     form.resetFields();
//   };

//   return (
//     <Drawer
//       title={
//         <Space>
//           <PhoneOutlined />
//           <span>Log Call – {lead?.leadName}</span>
//         </Space>
//       }
//       placement="right"
//       width={420}
//       onClose={onClose}
//       open={open}
//     >
//       <Form layout="vertical" form={form} onFinish={onFinish}>
//         <Form.Item label="Phone">
//           {/* <Input value={lead?.phone || ""} disabled /> */}
//           <Select
//             placeholder="Select Phone No."
//             options={[lead?.phone, ...(lead?.alternatePhones || [])].map(
//               (v) => ({ label: v, value: v })
//             )}
//           />
//         </Form.Item>
//         <Form.Item
//           name="callType"
//           label="Call Type"
//           rules={[{ required: true, message: "Please select call type" }]}
//         >
//           <Select
//             placeholder="Select type"
//             options={["Incoming", "Outgoing", "Missed"].map((v) => ({
//               label: v,
//               value: v,
//             }))}
//           />
//         </Form.Item>
//         <Form.Item
//           name="callOutcome"
//           label="Outcome"
//           rules={[{ required: true, message: "Please enter outcome" }]}
//         >
//           <Input.TextArea
//             rows={3}
//             placeholder="e.g. Discussed budget, sent project brochure..."
//           />
//         </Form.Item>
//         <Form.Item name="nextFollowup" label="Next Follow-up">
//           <DatePicker showTime style={{ width: "100%" }} />
//         </Form.Item>
//         <Row gutter={8} justify="end">
//           <Col span={12}>
//             <Button block onClick={onClose}>
//               Cancel
//             </Button>
//           </Col>
//           <Col span={12}>
//             <Button type="primary" block onClick={() => form.submit()}>
//               Save Call Log
//             </Button>
//           </Col>
//         </Row>
//       </Form>
//     </Drawer>
//   );
// }

