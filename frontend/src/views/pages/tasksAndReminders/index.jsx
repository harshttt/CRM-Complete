import { parseAsString, useQueryStates} from "nuqs";
import { useState, useEffect, useRef } from "react";
import { Alert, Button, Card, Col, Form, Input, Modal, Row, Space, Tag, Tooltip, Typography, DatePicker, Select, Grid, message, AutoComplete, Flex, Spin, Divider, Switch, Radio} from "antd";
import { DeleteOutlined, EditOutlined, PlusOutlined, SearchOutlined, ClockCircleOutlined, BellOutlined, WarningOutlined,CheckCircleOutlined,PauseCircleOutlined, UserOutlined,CalendarOutlined, ReloadOutlined} from "@ant-design/icons";
import { useTaskComplete, useTaskDelete, useTaskList, useTaskSave, useTaskUpdate } from "../../../api-hooks/task";
import { useUserDropdown } from "../../../api-hooks/user";
import commonObj from "../../../commonObj";
import MyPagination from "../../components/Pagination";
import { useSearchParams } from "react-router-dom";
import dayjs from "dayjs";
import util from "../../../utils/util";
import ReminderModal from "../reminders/ReminderModal";

const { Text, Title } = Typography;
const { useBreakpoint } = Grid;

const allowURLStateUpdate = true;

const TaskAndReminders = () => {
  const STATUS_OPTIONS = [{label:'All', value:null}, ...util.enumToOptions(commonObj?.constants?.taskEnums?.STATUS || [])];
  const screens = useBreakpoint();
  const DEFAULT_NUQS_CONFIG = {throttleMs: !allowURLStateUpdate ? Infinity : 0};
  const [messageApi, contextHolder] = message.useMessage();
  const [searchParams, setSearchParams] = useSearchParams();
  const [reminderCheck, setReminderCheck] = useState(false);

  // ---------- Query State (search) ----------
  const [search, setSearch] = useQueryStates({ q: parseAsString.withDefault(null)},{ urlKeys: { key: "q" }, ...DEFAULT_NUQS_CONFIG });
  const [filters, setFilters] = useQueryStates({status:parseAsString.withDefault(null)},{urlKeys:{status:'status'}, ...DEFAULT_NUQS_CONFIG});

  // ---------- Local State ----------
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [reminderModal, setReminderModal] = useState(false);
  const [entityType, setEntityType] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [leadId, setLeadId] = useState(null);
  const [data, setData] = useState(null);
  const taskPermissions = util.getModulePermissions('task') || [];

  const [acc] = useState({
    viewAccess:taskPermissions.includes('read') ,
    addAccess:taskPermissions.includes('create'),
    editAccess: taskPermissions.includes('update'),
    deleteAccess: true ,
    completeAccess: taskPermissions.includes('complete'),
  });

  const {data:taskRes, isFetching:isLoading, isError, error, refetch, refetchWithQuery} = useTaskList({qData:{page:1, limit:20, ...filters}});
  const taskList = taskRes?.data;
  const qData = taskRes?.qData;

  const {mutate:completeTask, isPending:isCompletingTask} = useTaskComplete({
    onSuccess:(res) => {
      messageApi.success(res?.message);
    },
    onError:(err) => {
      messageApi.error(err?.message);
    }
  });

  const {mutate:deleteTask, isPending:isDeletingTask } = useTaskDelete({
    onSuccess:res => {
     messageApi.success(res?.message);
    },
    onError:err => {
      messageApi.error(err?.message);
    }
  });

  const statCardData = [
    {icon: <ClockCircleOutlined />, title: "Total Tasks", value: 34, change: "+12 this week"},
    {icon: <BellOutlined />, title: "Reminders", value: 12, change: "+5 this week"},
    {icon: <CheckCircleOutlined />, title: "Completed", value: 22, change: "+8 this week"},
    {icon: <PauseCircleOutlined />, title: "Pending", value: 10, change: "-2 this week"},
  ];

  // ---------- Helpers ----------
  const getPriorityColor = (priority) => {
    const v = (priority || "").toString().toLowerCase();
    if (v === "high") return "red";
    if (v === "medium") return "orange";
    if (v === "low") return "green";
    return "default";
  };

  const getStatusTagColor = (status) => {
    const v = (status || "").toString().toLowerCase();
    if (v === "completed") return "green";
    if (v === "pending") return "default";
    if (v === "in-progress") return "blue";
    if (v === "missed") return "red";
    if (v === "cancelled") return "default";
    return "default";
  };

  const getStatusLabel = (status) => {
    const v = (status || "").toString().toLowerCase();
    if (v === "in-progress") return "In Progress";
    return status || "—";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return "—";

    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();

    const timeString = date.toLocaleTimeString("en-US", {hour: "2-digit", minute: "2-digit", hour12: true});

    if (isToday) {
      return `Today at ${timeString}`;
    }

    const dateStr = date.toLocaleDateString("en-US", {month: "short", day: "numeric"});

    return `${dateStr} at ${timeString}`;
  };

  const isOverdue = (dateString, status) => {
    if (!dateString || status === "Completed") return false;
    const taskDate = new Date(dateString);
    if (Number.isNaN(taskDate.getTime())) return false;
    const now = new Date();
    return taskDate.getTime() < now.getTime();
  };

  // ---------- Handlers ----------
  const handleAdd = () => {
    setSelectedId(null);
    setData(null);
    setIsEditModalOpen(true);
  };

  const handleEdit = ({id, ...task}) => {
    setSelectedId(id);
    setData(task || null);
    setIsEditModalOpen(true);
  };

  const handleModalClose = () => {
    setSelectedId(null);
    setData(null);
    setIsEditModalOpen(false);

    if(searchParams.has('leadId')) {
      const params = new URLSearchParams(searchParams);
      params.delete('leadId');
      setSearchParams(params, {replace: true});
    }
  };

  const handleReminderModal = (entityTypeArg=null) => {
     setReminderModal(prev => !prev);
     setEntityType(entityTypeArg);
     setReminderCheck(prev=> !prev);
  }

  useEffect(() => {
    const qLeadId = searchParams.get("leadId");
    if (qLeadId) {
      setLeadId(qLeadId);
      handleAdd();
     }
  }, [searchParams]);

  return (
    <div>
      {contextHolder}
      {isError ? ( <Alert title="Error" description={error?.message} type="error" showIcon/>) : 
       !acc.viewAccess ? (<Alert type="error" showIcon title="Access Denied" description="You dont have permission to view tasks and reminders"/>) :
        ( <Card direction="vertical" size={"small"} bordered={false} className="card-style" styles={{header:{borderBottom:'none', padding:'10px'}, body:{padding:'10px'} }}
         title={
          <Space align="center">
            <div className="card-icon-container">
              <div className="card-icon-wrapper">
                <BellOutlined className="card-icon" />
              </div>
            </div>
            <Space direction="vertical" size={0}>
              <Title level={4} style={{margin:0}}>Task & Reminder Management</Title>
              <Text type="secondary" style={{fontSize:12}}>Manage tasks and reminders</Text>
            </Space>
          </Space>
         }
         extra={
          <Space align="center">
            <Text type="secondary" style={{fontSize:12}}> Total Tasks: <Text strong style={{color:'#2f54eb'}}>{qData?.total}</Text></Text>
            <Tooltip title="Refresh Tasks"><Button icon={<ReloadOutlined />} size="middle" loading={isLoading} onClick={refetch} style={{borderRadius:999, boxShadow:'0px 4px 10px rgba(15, 23, 42, 0.06'}}/></Tooltip>
            {acc.addAccess && <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd} size="middle" style={{borderRadius:999, paddingInline:18}}>Add Task</Button>}
            {<Button type="primary" icon={<PlusOutlined />} onClick={()=>handleReminderModal()} size="middle" style={{borderRadius:999, paddingInline:18}}>Create Reminder</Button>}
          </Space>
         }
        >
          {/* Stats grid (4 cards) */}
          <Row gutter={[12, 12]} style={{marginBottom:16}}> 
            {/* {statC ardData?.map(((item, idx) => (<Col key={idx} xs={12} md={6}><StatCard icon={item.icon} title={item.title} value={item.value} change={item.change}/></Col>)))} */}
            <Col xs={12} md={6}><StatCard icon={<ClockCircleOutlined/>} title={'Total Tasks'} value={qData?.total} /></Col>
            <Col xs={12} md={6}><StatCard icon={<BellOutlined/>} title={'Reminders'} value={qData?.reminderPending} /></Col>
            <Col xs={12} md={6}><StatCard icon={<CheckCircleOutlined/>} title={'Completed'} value={qData?.completed} /></Col>
            <Col xs={12} md={6}><StatCard icon={<PauseCircleOutlined/>} title={'Pending'} value={qData?.pending} /></Col>
          </Row>

          {/* Search bar */}
          <Card size="small" bordered={false} style={{borderRadius: 14, background:"linear-gradient(90deg,rgba(240,245,255,0.9),rgba(255,255,255,0.95))", border: "1px solid #f0f2ff",}} styles={{body:{padding:10}}}>
           <Row align={'center'}>

            <Col span={14} style={{marginTop:'10px'}}>
                <Flex gap={8} align="center" wrap>
                  {[...STATUS_OPTIONS]?.map(
                    (status) => {
                      const isActive = filters.status === status;
                      return (
                        <Button key={status.label} size="small" onClick={() =>{ setFilters({status:status.value})}} type={isActive ? "primary" : "default"} style={{borderRadius: 999, paddingInline: 12, textTransform: "capitalize"}}>
                          {status.value === "all" ? "All" : status?.label?.charAt(0)?.toUpperCase() + status?.label?.slice(1)}
                        </Button>
                      );
                    }
                  )}
            </Flex>
            </Col>

            <Col span={10}>
              <Search search={search} setSearch={setSearch} refetch={refetchWithQuery} />
            </Col>

            </Row>
          </Card>

          {/* Tasks List */}
          <Spin spinning={isCompletingTask || isDeletingTask || isLoading}>
          <Flex vertical gap={12} style={{ marginTop: 16 }}>
            {taskList?.length === 0 ? (
              <Card bordered style={{textAlign: "center", padding: 24, borderRadius: 12, marginTop: 12}}>
                <div style={{ marginBottom: 12 }}>
                  <WarningOutlined style={{ fontSize: 32, color: "#9ca3af" }}/>
                </div>
                <Title level={4} style={{ marginBottom: 4 }}>No tasks found</Title>
                <Text type="secondary"> No tasks match your current filter selection.</Text>
                <div style={{ marginTop: 16 }}>
                  <Button type="primary" onClick={handleAdd}> Add Your First Task </Button>
                </div>
              </Card>
            ) : (
              <div>
              <Space vertical style={{width:'100%'}}>
                {taskList?.map((task) => {
                     const overdue = isOverdue(task.dueDate, task.status);
                     const isCompleted = (task.status || "").toLowerCase() === "completed";

                     const goToLead = (leadId, e) => {
                        e.stopPropagation();
                     };

                 return (
                  <Card key={task?.id} size="small" bordered hoverable styles={{body:{padding:14}}} style={{borderRadius: 12, boxShadow: "0 4px 12px rgba(15,23,42,0.08)", borderColor: overdue ? "#ffccc7" : undefined}}>
                   <Row gutter={[12, 8]} align="top">
                        {/* LEFT SECTION */}
                       <Col flex="auto">
                          <Space align="flex-start" size={12}>
                               {/* ICON */}
                              <Flex align="center" justify="center" style={{width: 32, height: 32, borderRadius: 10, backgroundColor: isCompleted ? "rgba(82,196,26,0.12)" : "rgba(107,114,128,0.12)", color: isCompleted ? "#52c41a" : "#6b7280"}}>
                                {task?.lead ? <UserOutlined /> : <ClockCircleOutlined />}
                              </Flex>

                              {/* CONTENT */}
                             <div style={{ flex: 1, minWidth: 0 }}>
                               {/* TITLE + TYPE */}
                               <Flex wrap align="center" gap={8} style={{ marginBottom: 4 }}>
                                 <Text strong style={{ fontSize: 14, textDecoration: isCompleted ? "line-through" : "none", opacity: isCompleted ? 0.75 : 1}}>{task?.title}</Text>
                                 <Tag color={task?.type === "call" ? "blue" : "purple"} style={{ borderRadius: 999, fontSize: 11 }}> {task?.type?.toUpperCase() || "TASK"}</Tag>
                               </Flex>

                              {/* DESCRIPTION */}
                            {task?.description && (
                              <Text type="secondary" style={{fontSize: 12, display: "block", marginBottom: 8, textDecoration: isCompleted ? "line-through" : "none", opacity: isCompleted ? 0.75 : 1}}>
                               {task.description}
                              </Text>
                           )}

                             {/* LEAD INFO */}
                            {task?.lead && (
                               <div onClick={(e) => goToLead(task.lead.id, e)} style={{marginBottom: 8, padding: "6px 10px", borderRadius: 10, background: "rgba(59,130,246,0.06)", border: "1px solid rgba(59,130,246,0.18)", cursor: "pointer", width: "fit-content" }}>
                               <Space size={10} wrap>
                                 <Tag color="blue" style={{borderRadius: 999, fontSize: 11, margin: 0}}>Lead</Tag>
                                 <Text strong style={{ fontSize: 12 }}> {task.lead.fullName}</Text>
                                 <Text type="secondary" style={{ fontSize: 12 }}>{task.lead.phone}</Text>
                                 {task.lead.stage && ( <Tag color="geekblue" style={{ borderRadius: 999, fontSize: 11 }}> {task.lead.stage.replace("_", " ")}</Tag>)}
                               </Space>
                               </div>
                            )}

                             {/* META INFO */}
                            <Space size={16} style={{ fontSize: 12 }}>
                              <Space size={6}>
                                <CalendarOutlined style={{ color: "#9ca3af" }} />
                                <span style={{color: overdue && !isCompleted ? "#f5222d" : "#6b7280", fontWeight: overdue && !isCompleted ? 500 : 400}}>
                                   {formatDate(task?.dueDate)}
                                   {overdue && !isCompleted && "(Overdue)"}
                                </span>
                              </Space>

                              <Space size={6}>
                                <UserOutlined style={{ color: "#9ca3af" }} />
                                <span style={{ color: "#6b7280" }}> {task?.assignedTo?.fullName === commonObj.name ? 'Self' : task?.assignedTo?.fullName || "Unassigned"} </span>
                              </Space>
                            </Space>

                             </div>
                          </Space>
                       </Col>

                        {/* RIGHT SECTION */}
                        <Col flex="none">
                          <Flex vertical align="end" gap={6}>
                             {/* PRIORITY */}
                            <Tag color={getPriorityColor(task?.priority)} style={{ borderRadius: 999, fontSize: 11 }}> {task?.priority || "Low"} </Tag>
                             {/* STATUS */}
                            <Tag color={getStatusTagColor(task?.status)} style={{ borderRadius: 999, fontSize: 11 }}> {getStatusLabel(task?.status)}</Tag>

                             {/* ACTIONS */}
                             <Space size={4} style={{ marginTop: 4 }}>
                             {acc.editAccess && (
                                 <Tooltip title="Edit">
                                   <Button size="small" type="text" icon={<EditOutlined />} onClick={() => handleEdit(task)} />
                                 </Tooltip> )
                             }

                              {(!isCompleted && acc.completeAccess ) &&
                                task?.assignedTo?.id === commonObj?.id && (
                                <Tooltip title="Mark as complete">
                                  <Button size="small" type="text" icon={<CheckCircleOutlined />} style={{ color: "#52c41a" }} onClick={() => completeTask(task?.id)}/>
                                </Tooltip>
                              )}

                              {acc.deleteAccess && 
                                <Tooltip title="Delete">
                                 <Button size="small" type="text" danger icon={<DeleteOutlined />} onClick={() => deleteTask(task?.id)} />
                                </Tooltip>
                              } 
                            </Space>
                          </Flex>
                        </Col>
                    </Row>
                  </Card>
                );
            })}
              </Space>
             <Divider style={{margin:'14px 0 8px'}}/>
             <MyPagination {...{qData}} total={qData?.total}  onChange={refetchWithQuery} DEFAULT_NUQS_CONFIG={DEFAULT_NUQS_CONFIG}/>
            </div>
            )
            }
          </Flex>
          </Spin>

          {/* Floating Add button (mobile only) */}
          {!screens.md && ( <Button type="primary" shape="circle" icon={<PlusOutlined />} onClick={handleAdd} style={{ position: "fixed", right: 24, bottom: 24, width: 56, height: 56, boxShadow: "0 10px 25px rgba(37,99,235,0.45)", zIndex: 1000}}/>)}

          {/* Add / Edit Task Modal */}
          <Modal open={isEditModalOpen} onCancel={handleModalClose} destroyOnHidden footer={null} centered width={900} title={null} styles={{body:{padding:0, background:'linear-gradient(135deg, #f3f6ff 0%, #ffffff 35%, #fdf5ff 100%)'}}} >
            <Flex justify="space-between" align="center" style={{padding: 20, paddingBottom: 12, borderBottom: "1px solid #f0f0f0", gap: 8}}>
              <Space align="center">
                <Flex justify="center" align="center" style={{width: 36, height: 36, borderRadius: "999px", background: "radial-gradient(circle at 30% 20%, #e6f4ff, #d6e4ff)"}}>
                  <BellOutlined style={{ color: "#1d39c4" }} />
                </Flex>
                <Space direction="vertical" size={0}>
                  <Title level={5} style={{ margin: 0 }}>{selectedId ? "Edit Task" : "Create Task"}</Title>
                  <Text type="secondary" style={{ fontSize: 12 }}> Link tasks to leads, set due dates, and configure reminders.</Text>
                </Space>
              </Space>
            </Flex>

            <div style={{ padding: 18, paddingTop: 6 }}>
              {/* <ReminderModal open={reminderModal} onClose={handleReminderModal} id={data?.id} entityType={entityType}/> */}
              <DataForm reminderCheck={reminderCheck} setReminderCheck={setReminderCheck} id={selectedId} onSave={handleModalClose} reminderModal={reminderModal} handleReminderModal={handleReminderModal} initialData={data} leadId={leadId}/>
            </div>
          </Modal>
          {/* Reminder Modal */}
          <ReminderModal open={reminderModal} onClose={handleReminderModal} id={data?.id} entityType={entityType}/>

        </Card>
      )}
    </div>
  );
};

export default TaskAndReminders;

/*──────────── STATS CARD (Angular-like) ────────────*/
function StatCard({ icon, title, value, change }) {
  return (
    <Card size="small" bordered={false} style={{borderRadius: 12, background: "white", boxShadow: "0 6px 16px rgba(15,23,42,0.1)", border: "1px solid #e5e7eb"}} styles={{body:{padding:10}}}>
      <Space align="center">
        <div style={{width: 36, height: 36, borderRadius: 12, background: "rgba(37,99,235,0.08)", display: "flex",alignItems: "center", justifyContent: "center"}}>
          <span style={{ fontSize: 18, color: "#2563eb" }}>{icon}</span>
        </div>
        <div>
          <Text type="secondary" style={{ fontSize: 11, display: "block", marginBottom: 2 }}> {title} </Text>
          <div>
            <Text strong style={{ fontSize: 18 }}>{value} </Text>
            {change && (<Text type="secondary" style={{ marginLeft: 6, fontSize: 11 }}> {change}</Text>)}
          </div>
        </div>
      </Space>
    </Card>
  );
}

/*──────────── SEARCH BAR ────────────*/
function Search({ refetch, search, setSearch }) {
  return (
    <Form onFinish={() => {refetch(search)}} style={{ width: "100%" }}>
      <Row gutter={8} wrap align="middle">
        <Col span={20}> 
          <Input placeholder="Search by task name" value={search.q ?? ""} prefix={<SearchOutlined style={{ color: "#bfbfbf" }} />} onChange={(e) => setSearch({ q: e.target.value })} allowClear
            style={{borderRadius: 999, paddingInline: 16, paddingBlock: 8, boxShadow: "0 4px 10px rgba(15,23,42,0.06)", border: "1px solid #dde4ff"}} onClear={() => { setSearch({q:null}); refetchWithQuery({q:null})}}
          />
        </Col>
        <Col span={4}>
          <Button style={{ borderRadius: "50px", width: "100%" }} type="primary" htmlType="submit" icon={<SearchOutlined />}/>
        </Col>
      </Row>
    </Form>
  );
}

/*──────────── DATA FORM (same as before, slightly tweaked) ────────────*/
function DataForm({ id, onSave, initialData, leadId, handleReminderModal, reminderCheck, setReminderCheck }) {
  const [form] = Form.useForm();
  const isEdit = !!id;

  const TASK_TYPE_OPTIONS = util.enumToOptions(commonObj?.constants?.taskEnums?.TYPE || []);
  const STATUS_OPTIONS =  util.enumToOptions(commonObj?.constants?.taskEnums?.STATUS || []);
  const PRIORITY_OPTIONS =  util.enumToOptions(commonObj?.constants?.taskEnums?.PRIORITY || []);


  const [messageApi, contextHolder] = message.useMessage();
  const debounceRef = useRef(null);

  const { data: usrRs, isPending: isUsrLoading, refetchWithQuery: refetchUsersWithQuery } = useUserDropdown({ qData: { page: 1, limit: 20 } });

  const usrOptions = usrRs?.data || [];

  const { mutate: saveTask, isPending: isTaskCreateLoading } = useTaskSave({
    onSuccess: (res) => {
      messageApi.success(res?.message);
      onSave();
    },
    onError: () => {
      messageApi.error("Failed to save task. Please try again.");
    },
  });

  const { mutate: updateTask, isPending: updateTaskLoading } = useTaskUpdate({
    onSuccess: (res) => {
      messageApi.success(res?.message);
      onSave();
    },
    onError: (err) => {
      messageApi.error(err?.message);
    },
  });

  const handleUserSearch = (value) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      if (value?.trim()) {
        refetchUsersWithQuery({ q: value });
      }
    }, 400);
  };

  const onFinish = (val) => {
    if (isEdit) {
      updateTask({ ...val, id });
    } else {
      saveTask(leadId ? { ...val, lead: leadId } : val);
    }
  };

  useEffect(() => {
    if (isEdit && initialData) {
      const isSelfAssigned = initialData?.assignedTo?.id === commonObj?.id;
      form.setFieldsValue({
        title: initialData?.title,
        type: initialData?.type,
        description: initialData?.description,
        assignedToType: isSelfAssigned ? commonObj?.id : 'other',
        assignedToName: initialData?.assignedTo?.fullName,
        assignedTo: initialData?.assignedTo?.id,
        dueDate: initialData?.dueDate ? dayjs(initialData.dueDate) : null,
        priority: initialData?.priority,
        status: initialData?.status,
      });
    } else {
      form.resetFields();
    }
  }, [initialData, form, isEdit]);

  const leadData = initialData?.lead || (leadId ? { id: leadId } : null);

  const goToLead = (id) => {
    // window.open(`/leads/${id}`, "_blank");
  };

  return (
    <Spin spinning={isTaskCreateLoading || updateTaskLoading}>
      {contextHolder}
      <Form layout="vertical" form={form} onFinish={onFinish} disabled={isTaskCreateLoading || updateTaskLoading}>
        {/* 🔹 LEAD DETAILS */}
        {leadData && (
          <Card size="small" styles={{padding:12}} style={{ marginBottom: 12, borderRadius: 14, border: "1px solid #d6e4ff", background: "rgba(240,245,255,0.9)", cursor: "pointer"}}
            onClick={() => leadData?.id && goToLead(leadData.id)}
            title={ <Space> <UserOutlined style={{ color: "#1d39c4" }} /> <span>Linked Lead</span> </Space> }
          >
            <Space size={16} wrap>
              <Text strong>{initialData?.lead?.fullName || "View Lead"}</Text>
              {initialData?.lead?.phone && ( <Text type="secondary">{initialData.lead.phone}</Text> )}
              {initialData?.lead?.stage && ( <Tag color="geekblue" style={{ borderRadius: 999 }}>{initialData.lead.stage.replace("_", " ")} </Tag> )}
              <Tag color="blue" style={{ borderRadius: 999 }}>Open Lead</Tag>
            </Space>
          </Card>
        )}

        {/* TASK DETAILS */}
        <Card size="small" styles={{body:{padding:12}}}
          style={{ marginBottom: 12, borderRadius: 14, border: "1px solid #f0f0f0", background: "rgba(255,255,255,0.96)"}}
          title={
            <Space>
              <ClockCircleOutlined style={{ color: "#1677ff" }} />
              <span>Task Details</span>
            </Space>
          }
        >
          <Row gutter={12}>
            <Col xs={24} md={14}>
              <Form.Item name="title" label="Task Title" rules={[{ required: true, message: "Please enter task title" }]}>
                <Input placeholder="e.g. Call lead to confirm site visit" />
              </Form.Item>
            </Col>

            <Col xs={24} md={10}>
              <Form.Item name="type" label="Task Type" rules={[{ required: true, message: "Please select task type" }]}>
                <Select placeholder="Select type" options={TASK_TYPE_OPTIONS} />
              </Form.Item>
            </Col>

            <Col xs={24}>
              <Form.Item name="description" label="Description">
                <Input.TextArea rows={3} placeholder="Add task details" />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* ASSIGNMENT & SCHEDULE */}
        <Card size="small" styles={{padding:12}} style={{marginBottom: 12, borderRadius: 14, border: "1px solid #f0f0f0", background: "rgba(255,255,255,0.96)"}}
          title={
            <Space>
              <CalendarOutlined style={{ color: "#52c41a" }} />
              <span>Assignment & Schedule</span>
            </Space>
          }
        >
          <Row gutter={12}>
            {commonObj?.role?.roleLevel !== 4 && 
              // <Col xs={24} md={8}>
              //   <Form.Item name="assignedToName" label="Assigned To">
              //     <AutoComplete
              //       placeholder="Search assignee"
              //       options={usrOptions.map((u) => ({
              //        value: u.fullName,
              //        label: u.fullName,
              //        id: u.id,
              //        }))}
              //       onSearch={handleUserSearch}
              //       onSelect={(val, opt) => form.setFieldsValue({assignedToName:val, assignedTo: opt.id })}
              //       allowClear
              //       notFoundContent={isUsrLoading ? <Flex><Spin size="small" /></Flex> : null}
              //     />
              //    </Form.Item>
              //    <Form.Item name={'assignedTo'} hidden />
              // </Col>
                <Col span={12}>
                    <Form.Item label="Assigned To" name="assignedToType">
                   <Radio.Group
                     options={[{label: "Self", value: commonObj?.id }, {label: "Other", value: "other" },]}
                     onChange={(e) => {
                      if (e.target.value === commonObj?.id) {
                         form.setFieldsValue({ assignedTo: commonObj?.id });
                      } else {
                         form.setFieldsValue({ assignedTo: null });
                      }
                    }}
                   />
                    </Form.Item>
                     <Form.Item name={'assignedTo'} hidden>
                       <input type="hidden"/>
                     </Form.Item>
                   <Form.Item noStyle shouldUpdate>
                     {({ getFieldValue }) =>
                       getFieldValue("assignedToType") === "other" && (
                        <>
                       <Form.Item name="assignedToName" rules={[{ required: true, message: "Please select a user" }]}>
                        <AutoComplete placeholder="Search user"
                          options={usrOptions?.map(u => ({
                             label: u.fullName,
                             value: u.fullName,
                             id: u.id,
                             }))}
                          onSearch={handleUserSearch}
                          onSelect={(value, opt) => {
                            form.setFieldsValue({assignedToName: value, assignedTo: opt.id });
                           }}
                          notFoundContent={isUsrLoading ? <Spin size="small" /> : null}
                        />
                      </Form.Item>

                     {/* Hidden ID field */}
                    <Form.Item name="assignedTo" hidden />
                   </>
                  )}
                   </Form.Item>
                </Col>
            }

            <Col xs={24} md={8}>
              <Form.Item name="dueDate" label="Due Date" rules={[{required:true, message:'Please select the due date & time'}]}>
                <DatePicker showTime style={{ width: "100%" }} 
                  disabledDate={current => current && current < dayjs().startOf('day')}
                  disabledTime={current => {
                    if(!current) return {};
                    const now = dayjs();
                    if(current.isSame(now, 'day')){
                      return {
                        disabledHours:() => Array.from({length: now.hour()}, (_ , i) => i),
                        disabledMinutes:selectedHour => selectedHour === now.hour() ? Array.from({length:now.minute()}, (_, i) => i) : [] 
                      }
                    }
                    return {};
                  }}
                 />
              </Form.Item>
            </Col>

            <Col xs={24} md={8}>
              <Form.Item name="priority" label="Priority">
                <Select placeholder="Select priority" options={PRIORITY_OPTIONS} />
              </Form.Item>
            </Col>

            {isEdit && (
              <Col xs={24} md={8}>
                <Form.Item name="status" label="Status">
                  <Select placeholder="Select status"  options={STATUS_OPTIONS} />
                </Form.Item>
              </Col>
            )}
          </Row>
        </Card>

        {/*REMINDER  */}
        {isEdit && <Card size="small" styles={{body:{padding:12}}} title={ <Space><BellOutlined style={{ color: "#1677ff" }} /><span>Reminder</span></Space>}
          style={{marginBottom: 12,borderRadius: 14,border: "1px dashed #bae0ff",background: "rgba(230,247,255,0.9)"}}>
            <Row gutter={12}>
              <Col xs={24} md={3}>
                   <Switch checked={reminderCheck} checkedChildren="ON" unCheckedChildren="OFF" 
                    onChange={(checked) => {
                      handleReminderModal(checked ? 'task' : null);
                      setReminderCheck(checked)
                      }} />
              </Col>

            {/* <Col xs={24} md={9}>
              <Form.Item noStyle shouldUpdate={(prev, cur) => prev.enableReminder !== cur.enableReminder}>
               {({ getFieldValue }) =>
                getFieldValue("enableReminder") && (
                  <Form.Item name="remindAt" label="Reminder Time" rules={[{ required: true, message: "Select reminder date & time" },]}>
                    <DatePicker showTime style={{ width: "100%" }}
                       disabledDate={(current) =>  current && current < dayjs().startOf("day")}
                       disabledTime={(current) => {
                         if (!current) return {};
                         const now = dayjs();
                         if (current.isSame(now, "day")) {
                         return {
                           disabledHours: () => Array.from({ length: now.hour() }, (_, i) => i),
                           disabledMinutes: (h) => h === now.hour() ? Array.from({ length: now.minute() },(_, i) => i): [],
                         };
                       }
                        return {};
                       }}
                    />
                  </Form.Item>
               )}
              </Form.Item>
            </Col> */}

            {/* <Col xs={24} md={21}>
               <Form.Item noStyle shouldUpdate={(prev, cur) =>  prev.enableReminder !== cur.enableReminder}>
                  {({ getFieldValue }) => getFieldValue("enableReminder") && (<ReminderForm/>)}
               </Form.Item>
            </Col> */}
  
            </Row>
           </Card>
         }

        {/* ACTIONS */}
        <Row gutter={8} justify="end">
          <Col xs={12} md={6}>
            <Button block onClick={() => {setReminderCheck(false); form.resetFields(); onSave(); }} style={{ borderRadius: 999 }}> Cancel </Button>
          </Col>
          <Col xs={12} md={6}>
            <Button type="primary" htmlType="submit" block style={{ borderRadius: 999 }}> {isEdit ? "Save Changes" : "Create Task"} </Button>
          </Col>
        </Row>

      </Form>
    </Spin>
  );
}
