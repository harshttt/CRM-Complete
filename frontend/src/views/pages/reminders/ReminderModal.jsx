import { Button, Card, Col, DatePicker, Form, Input, message, Modal, Row, Select, Spin } from "antd";
import { useReminderCreate } from "../../../api-hooks/reminder";
import dayjs from "dayjs";

const REMINDER_ENTITY_TYPE = [
    {label:'LEAD', value:'lead'},
    {label:'TASK', value:'task'},
    {label:'MEETING', value:'meeting'},
    {label:'USER', value:'user'},
    {label:'PERMISSION', value:'permission'},
    {label:'OTHER', value:'other'},
];

export default function ReminderModal({open, onClose, id, data, entityType}){

   const handleModalClose = (form) => {
    form.resetFields();
    onClose();
   }

  return (
      <Modal open={open} onCancel={onClose} width={600} destroyOnHidden footer={null} title={id ? "Edit Reminders" : "Add Task & Reminder"}>
        <ReminderForm {...{handleModalClose, entityType, id}}/>
     </Modal>
    )
}

export const ReminderForm = ({handleModalClose, entityType, id}) => {
    const [form] = Form.useForm();
    const [messageApi, contextHolder] = message.useMessage();
    const isEdit = !!id;


     const {mutate:createReminder, isPending:isReminderCreating} = useReminderCreate({
        onSuccess:res => {
          messageApi.success(res?.message || 'Reminder created successfully');
          form.resetFields();
          handleModalClose(form);
         },
        onError:err => {
          messageApi.error(err?.message);
        },
       });

     const handleFinish = (values) => {
           const payload = {  ...values,entityId:id}
           createReminder(payload);
        };


     return (
        <Spin spinning={isReminderCreating}>
          <Form layout="vertical" form={form} onFinish={handleFinish}>
          {/* ROLE INFO CARD */}
          {contextHolder}
           <Card size="small" title={'Reminder'} styles={{body:{padding: 12}}}
             style={{ marginBottom: 12, borderRadius: 14, border: "1px solid #f0f0f0", background: "rgba(255, 255, 255, 0.96)"}}
            >
              <Row gutter={12}>
                 <Col xs={24}>
                    <Form.Item name="title" label="Reminder Title" rules={[{ required: true, message: "Please enter reminder title" }]}>
                        <Input placeholder="e.g. reminder title" />
                    </Form.Item>
                 </Col>

                 <Col xs={12}>
                    <Form.Item name={'entityType'} label={'Entity Type'} rules={[{required:true, message:"Please select the entity type"}]} initialValue={entityType}>
                      <Select disabled={entityType} options={REMINDER_ENTITY_TYPE} placeholder='Entity type' />
                    </Form.Item>
                 </Col>

                 <Col xs={12}>
                    <Form.Item name={'remindAt'} label='Remind At' rules={[{required:true, message:'Please select the remind at'}]}>
                      <DatePicker showTime style={{width:'100%'}} placeholder="Remind at"
                        disabledDate={current => current && current < dayjs().startOf('day')}
                        disabledTime={current => {
                          if(!current) return {};
                          const now = dayjs();
                          if(current.isSame(now, 'day')){
                            return {
                              disabledHours:() => Array.from({length:now.hour()}, (_, i) => i),
                              disabledMinutes:selectedHour => selectedHour === now.hour() ? Array.from({length:now.minute()}, (_, i) => i) : []
                            }
                          }
                          return {};
                        }}
                      />
                    </Form.Item>
                 </Col>

                 <Col xs={24}>
                    <Form.Item name="description" label="Description" rules={[{required:true, message:'Please enter the description'}]}>
                       <Input.TextArea rows={3} placeholder="Short description for this category" />
                    </Form.Item>
                 </Col>
             </Row>
           </Card>

           {/* ACTION BUTTONS */}
           <Row gutter={8} justify="end" style={{ marginTop: 10 }}>
              <Col xs={12} md={6}>
                <Button block onClick={()=>handleModalClose(form)} style={{ borderRadius: 999 }} disabled={isReminderCreating}>Cancel</Button>
              </Col>

             <Col xs={12} md={6}>
               <Button type="primary" htmlType="submit" block loading={isReminderCreating} disabled={isReminderCreating} style={{ borderRadius: 999 }}>
                 {isEdit ? "Save Changes" : "Create Reminder"}
               </Button>
             </Col>
           </Row>
          </Form>
        </Spin>
      )}