/*──────────── BULK STAGE MODAL ────────────*/
// function BulkStageModal({ open, onCancel, onSubmit }) {
//   const [form] = Form.useForm();

//   const handleFinish = (values) => {
//     onSubmit(values);
//     form.resetFields();
//   };

//   return (
//     <Modal
//       open={open}
//       onCancel={onCancel}
//       onOk={() => form.submit()}
//       title={
//         <Space>
//           <FlagOutlined />
//           <span>Bulk Stage Update</span>
//         </Space>
//       }
//     >
//       <Form layout="vertical" form={form} onFinish={handleFinish}>
//         <Form.Item
//           name="stage"
//           label="New Stage"
//           rules={[{ required: true, message: "Please select stage" }]}
//         >
//           <Select placeholder="Select stage">
//             <Option value="new">New</Option>
//             <Option value="contacted">Contacted</Option>
//             <Option value="meeting">Meeting</Option>
//             <Option value="site_visit">Site Visit</Option>
//             <Option value="negotiation">Negotiation</Option>
//             <Option value="closure">Closure</Option>
//           </Select>
//         </Form.Item>
//         <Form.Item name="leadStatus" label="Lead Status (optional)">
//           <Select allowClear placeholder="Select status">
//             {LEAD_STATUS_OPTIONS.map((s) => (
//               <Option key={s} value={s}>
//                 {s}
//               </Option>
//             ))}
//           </Select>
//         </Form.Item>
//       </Form>
//     </Modal>
//   );
// }
