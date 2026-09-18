// import {
//   parseAsString,
//   useQueryState,
//   useQueryStates,
// } from "nuqs";
// import { getSortingStateParser } from "../../../utils/parsers";
// import { useState, useEffect } from "react";
// import {
//   Alert,
//   Avatar,
//   Button,
//   Card,
//   Col,
//   Form,
//   Input,
//   Modal,
//   Popconfirm,
//   Row,
//   Space,
//   Switch,
//   Table,
//   Typography,
// } from "antd";
// import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
// import util from "../../../utils/util";
// import MyPagination from "../../components/Pagination";
// import { dummyUsers } from "../../../dummyData/users";

import { CloseSquareFilled, EnvironmentOutlined, PlusOutlined, ReloadOutlined, SearchOutlined } from "@ant-design/icons";
import { Alert, Badge, Button, Card, Col, Divider, Form, Input, Modal, Row, Space, Switch, Table, Tooltip, Typography } from "antd";
import { useEffect, useState } from "react";
import { getSortingStateParser } from "../../../utils/parsers";
import { parseAsString, useQueryState, useQueryStates } from "nuqs";
import { dummyUsers } from "../../../dummyData/users";
import util from "../../../utils/util";
import MyPagination from "../../components/Pagination";
import Title from "antd/es/typography/Title";

// const allowURLStateUpdate = true; 

// const Cities = () => {
//   const DEFAULT_NUQS_CONFIG = {
//     throttleMs: !allowURLStateUpdate ? Infinity : 0,
//   };

//   // ---------- Query States ----------
//   const sorting_cols = ["name", "email","role","branch","city","company",""];
//   const [sort, setSort] = useQueryState(
//     "sort",
//     getSortingStateParser(sorting_cols)
//       .withDefault([{ column: "id", desc: 1 }])
//       .withOptions(DEFAULT_NUQS_CONFIG)
//   );

//   const [search, setSearch] = useQueryStates(
//     { key: parseAsString.withDefault("") },
//     { urlKeys: { key: "search_term" }, ...DEFAULT_NUQS_CONFIG }
//   );

//   // ---------- Local States ----------
//   const [isEditModalOpen, setIsEditModalOpen] = useState(false);
//   const [selectedId, setSelectedId] = useState(null);
//   const [data] = useState(null);

//   const qData = { page: 1, limit: 20 }; // FIX ✔ placeholder

//   // Fake placeholders (you can replace with real API states)
//   const isError = false;
//   const error = null;
//   const refetch = () => {};
//   const deleteData = () => {};

//   const handleEdit = (id) => {
//     setSelectedId(id);
//     setIsEditModalOpen(true);
//   };

//   const handleModalClose = () => {
//     setSelectedId(null);
//     setIsEditModalOpen(false);
//   };

//   // ---------- Table Columns ----------
//   const columns = [
//     {
//       title: "SN",
//       dataIndex: "id",
//       align: "center",
//       width: 50,
//       render: (_, __, i) => {
//         const page = qData.page || 1;
//         const limit = qData.limit || 20;
//         return <b>{(page - 1) * limit + i + 1}</b>;
//       },
//     },
//     { title: "Image", dataIndex: "image", align: "center", render:(v)=><Avatar size={45} src={<img draggable={false} src={v} alt="avatar"/>}/> },
//     { title: "Name", dataIndex: "name", align: "center" },
//     { title: "Email", dataIndex: "email", align: "center" },
//     { title: "Phone", dataIndex: "phone", align: "center" },
//     { title: "Role", dataIndex: "role", align: "center" },
//     { title: "Department", dataIndex: "department", align: "center" },
//     { title: "Branch", dataIndex: "branch", align: "center" },
//     { title: "City", dataIndex: "city", align: "center" },
//     { title: "Company", dataIndex: "company", align: "center" },
//     { title: "Login Status", dataIndex: "isLogin", align: "center" },

//     {
//       title: "Status",
//       dataIndex: "status",
//       align: "center",
//       render: (v, row) => <ToggleStatus data={row} qData={qData} />,
//     },

//     {
//       title: "Action",
//       dataIndex: "id",
//       align: "center",
//       width: 90,
//       render: (v, row) => (
//         <Space>
//           <Popconfirm
//             title="Are you sure to delete?"
//             onConfirm={() => deleteData({ id: v })}
//           >
//             <Button size="small" icon={<DeleteOutlined />} danger />
//           </Popconfirm>

//           <Button
//             size="small"
//             icon={<EditOutlined />}
//             onClick={() => handleEdit(v)}
//           />
//         </Space>
//       ),
//     },
//   ];

//   return (
//     <>
//       {isError ? (
//         <Alert
//           message="Error"
//           description={error?.message}
//           type="error"
//           showIcon
//         />
//       ) : (
//         <Card
//           size="small"
//           bordered={false}
//           title={<Typography.Text>Cities List</Typography.Text>}
//           extra={
//             <Button
//               icon={<PlusOutlined />}
//               type="primary"
//               size="small"
//               onClick={() => setIsEditModalOpen(true)}
//             >
//               Add New
//             </Button>
//           }
//         >
//           <Table
//             bordered
//             size="small"
//             pagination={false}
//             loading={false}
//             title={() => (
//               <Search search={search} setSearch={setSearch} refetch={refetch} />
//             )}
//             footer={() => (
//               <MyPagination
//                 {...{ qData }}
//                 total={100}
//                 onChange={() => {}}
//                 DEFAULT_NUQS_CONFIG={DEFAULT_NUQS_CONFIG}
//               />
//             )}
//             columns={columns.map((v, i)=> {
//               const sortConfig = sort?.find(s=> s.column === v.dataIndex);
//               const isSortable = sorting_cols.includes(v.dataIndex);
//               const haveMultipleSort = sorting_cols.length;
//               return {
//                 ...v,
//                 key: v.dataIndex || `column-${i}`,
//                 fixed: i === 0 ? true : i+1 === columns.length ? 'right' : false,
//                 sorter: isSortable ? haveMultipleSort ? {multiple:i+1, compare: null} : true : false,
//                 defaultSortOrder: sortConfig ? sortConfig.desc === 1 ? 'descend' : 'ascend' : null 
//               };
//             })}
//             dataSource={dummyUsers?.map((v) => ({ ...v, key: v.id }))}
//             scroll={{ y: util.getTableHeight() }}
//             onChange={(_, __, sorter) =>
//               util.handleTableSortingData(
//                 sorter,
//                 setSort,
//                 sort,
//                 refetch,
//                 qData
//               )
//             }
//           />
//         </Card>
//       )}

//       <Modal
//         open={isEditModalOpen}
//         onCancel={handleModalClose}
//         destroyOnClose
//         footer={null}
//         title={selectedId ? "Edit Cities" : "Add Cities"}
//       >
//         <DataForm _id={selectedId} onSave={handleModalClose} initialData={data} />
//       </Modal>
//     </>
//   );
// };

// export default Cities;

// /*──────────── SEARCH BAR ────────────*/
// function Search({ refetch, search, setSearch }) {
//   return (
//     <Form
//       onFinish={() => {
//         refetch();
//       }}
//     >
//       <Row gutter={10}>
//         <Col span={6}>
//           <Input
//             placeholder="Search by Name / Email / Phone"
//             value={search.key}
//             onChange={(e) => setSearch({ key: e.target.value })}
//             allowClear
//           />
//         </Col>

//         <Col>
//           <Button type="primary" htmlType="submit">
//             Search
//           </Button>
//         </Col>
//       </Row>
//     </Form>
//   );
// }

// /*──────────── STATUS TOGGLE ────────────*/
// function ToggleStatus({ data }) {
//   const toggleStatus = () => {
//     console.log("Toggle status", data.id);
//   };

//   return (
//     <Switch
//       checked={data?.status}
//       checkedChildren="Active"
//       unCheckedChildren="Inactive"
//       onChange={toggleStatus}
//     />
//   );
// }

// /*──────────── DATA FORM ────────────*/
// function DataForm({ _id, onSave, initialData }) {
//   const [form] = Form.useForm();

//   const onFinish = (values) => {
//     console.log("Submitted:", values);
//     onSave();
//   };

//   useEffect(() => {
//     if (_id && initialData) {
//       form.setFieldsValue(initialData);
//     }
//   }, [_id]);

//   return (
//     <Form layout="vertical" form={form} onFinish={onFinish}>
//       <Form.Item
//         name="fullname"
//         label="Full Name"
//         rules={[{ required: true, message: "Please enter full name" }]}
//       >
//         <Input />
//       </Form.Item>

//       <Form.Item
//         name="phone"
//         label="Phone"
//         rules={[{ required: true, message: "Please enter phone number" }]}
//       >
//         <Input />
//       </Form.Item>

//       <Form.Item
//         name="email"
//         label="Email"
//         rules={[{ required: true, message: "Please enter email" }]}
//       >
//         <Input />
//       </Form.Item>

//       <Button htmlType="submit" type="primary" block>
//         Save
//       </Button>
//     </Form>
//   );
// }


const Cities = (allowURLStateUpdate) => {
  const DEFAULT_NUQS_CONFIG = {throttleMs:Boolean(!allowURLStateUpdate) ? Infinity : 0};

  const sorting_cols = ['name', 'state', 'status', 'created_at', 'updated_at'];

  const [sort, setSort] = useQueryState('sort', getSortingStateParser(sorting_cols).withDefault([{column:'id', desc:1}]).withOptions(DEFAULT_NUQS_CONFIG));
  const [search, setSearch] = useQueryStates({key:parseAsString.withDefault('')}, {urlKeys:{key:'search_term'}, ...DEFAULT_NUQS_CONFIG});

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [data, setData] = useState(null);

  const qData = {page:1, limit:20};

  const isError = false;
  const error = null;
  const refetch = () => {};
  const deleteData = () => {};

  const handleEdit = (id) => {

  };

  const handleModalClose = () => {
    setSelectedId(null);
    setIsEditModalOpen(false);
    setData(null);
  };

  const baseColumns = [
    {
      title:'Sn',
      dataIndex:'id',
      align:'center',
      width:50,
      render: (_, __, i) => {
        const page = qData.page || 1;
        const limit = qData.limit || 20;
        return <Text strong> {(page - 1)* limit + i + 1}</Text>
      },
    },
    {
      title:'Name',
      dataIndex:'name',
      align:'center'
    },
    {
      title:'Status',
      dataIndex:'status',
      align:'center',
      render:(v, row)=><ToggleStatus data={row} />
    },
  ];

  const columns = baseColumns.map((v, i) => {
    const sortConfig = sort?.find(s=> s.column === v.dataIndex);
    const isSortable = sorting_cols.includes(v.dataIndex);
    const haveMultipleSort = sorting_cols.length > 1;

    return {
      ...v,
      key: v.dataIndex || `column-${i}`,
      fixed: i === 0 ? true : i + 1 === baseColumns.length ? 'right' : false,
      sorter: isSortable ? haveMultipleSort ? {multiple: i + 1} : true : false,
      defaultSortOrder: sortConfig ? sortConfig.desc === 1 ? 'descend' : 'ascend' : undefined,
      responsive:['xs', 'sm', 'md', 'lg', 'xl', 'xxl']
    };
  });

  const rowClassName = (row, index) => {
    return (index % 2 === 0) ? 'even-row' : 'odd-row';
  };


  return (
    <div>
      {
        isError ? ( <Alert message="Error" description={error?.message} type="error" showIcon /> ) : (
          <Card 
           size="small"
           bordered={false}
           style={{borderRadius:24, maxWidth:'100%', margin:'0 auto', boxShadow:'0px 18px 45px rgba(15, 23, 42, 0.12)', border:'1px solid rgba(255, 255, 255, 0.7)', background:'linear-gradient(145deg, rgba(255, 255, 255, 0.9))', backdropFilter:'blur(16px)'}}
           styles={{
            header:{
              borderBottom:'none',
              padding:'18px 22px 6px'
            },
            body:{
              padding:'8px 22px 18px'
            }
           }}
           title={
           <Space align="center"> 
             <div style={{width:'44px', height:'44px', borderRadius:'999px', background:'conic-gradient(from 210deg, #2f54eb, #9254de, #40a9ff, #2f54eb)',padding:2}}>
              <div style={{width:'100%', height:'100%', borderRadius:'999px', background:'radial-gradient(circle at 30% 20%, #f0f5ff, #d6e4ff)', display:'flex', alignItems:'center', justifyContent:'center'}}>
                <EnvironmentOutlined style={{fontSize:20, color:'#2f54eb'}} />
              </div>
              </div>
              <Space direction="vertical" size={0}>
                <Typography.Title level={4} style={{display:'flex', justifyContent:'center', alignItems:'center', height:'100%'}}>City Management</Typography.Title> 
                <Typography.Text type="secondary" style={{fontSize:12}}>
                  Manage your cities here
                </Typography.Text>
              </Space>
            </Space>
            }
            extra={
              <Space>
                <Tooltip title="Refresh Data">
                  <Button icon={<ReloadOutlined/>} size="middle" style={{borderRadius:999, boxShadow:'0px 4px 10px rgba(15, 23, 42, 0.06)'}} onClick={refetch}/>
                </Tooltip>
                <Button type="primary" icon={<PlusOutlined/>} size="middle" style={{borderRadius:999, paddingItem:18}} onClick={()=> setIsEditModalOpen(true)}>Add City</Button>
              </Space>
            }
            >

        {/* Search box */}
              <div style={{display:'flex',flexDirection:'column', gap:10, marginBottom:10, borderRadius:999, padding:8, paddingInline:12, background: 'linear-gradient(90deg, rgba(240, 245, 255, 0.9), rgba(255, 255, 255, 0.95))',border:'1px solid #f0f2ff'}}>
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'center',flexWrap:'wrap', gap:12, }}>
                  <div style={{flex:1, minWidth:260, maxWidth:560}}>
                    <Search search={search} setSearch={setSearch} refetch={refetch}/>
                  </div>
                </div>
              </div>


        {/* Table */}
        <Table
         bordered
         size="middle"
         pagination={false}
         rowKey={'id'}
         loading={false}
         columns={columns}
         dataSource={dummyUsers}
         rowClassName={rowClassName}
         style={{
          borderRadius:16,
          overflow:'hidden',
          background:'rgba(255, 255, 255, 0.98)'
         }}
         scroll={{
          y:util.getTableHeight ? util.getTableHeight() : 'calc(100vh-360px)',
          x:'max-content'
         }}
         onChange={(_, __, sorter)=> util.handleTableSortingData(sorter, setSort, sort, refetch, qData )} 
         />

         <Divider style={{margin:'14px 0 8px'}}/>
         <MyPagination {...{qData}} total={dummyUsers.length} onChange={()=> {}} DEFAULT_NUQS_CONFIG={DEFAULT_NUQS_CONFIG} />
       </Card>
        )}

        <Modal
         open={isEditModalOpen}
         onCancel={handleModalClose}
         destroyOnHidden
         footer={null}
         centered
         width={1220}
         title={null}
         styles={{
          body:{
            padding:0,
            background:'linear-gradient(135deg, #f3f6ff 0%, #ffffff 35%, #fdf5ff 100% )'
          }
         }}
         closeIcon={<CloseSquareFilled />}
        >
          <div style={{padding:20, paddingBottom:12, borderBottom:'1px solid #f0f0f0', display:'flex', alignItems:'center', justifyContent:'space-between',gap:8}}>
            <Space align="center">
              <div style={{width:36, height:36, borderRadius:'999px', background:'radial-gradient(circle at 30%, 20%, #e6f4ff, #d6e4ff)',display:'flex', alignItems:'center', justifyContent:'center'}}>
                <EnvironmentOutlined style={{color:'#1d39c4'}} />
              </div>
              <Space direction="vertical" size={0}>
                <Title level={4} style={{margin:0}}>{selectedId ? 'Edit City' : 'Add New City'}</Title>
                <Typography.Text type="secondary" style={{fontSize:13}}>
                  {selectedId ? 'Modify the city details and save changes' : 'Fill in the details to add a new city'}
                </Typography.Text>
              </Space>
            </Space>
          </div>

          <div style={{padding:18, paddingTop:6}}>
            <DataForm _id={selectedId} onSave={handleModalClose} initialData={data}/>
          </div>
        </Modal>
    </div>)

}

export default Cities;

const Search = ({refetch, search, setSearch}) => {
   return (
      <Form
       onFinish={()=>{refetch()}}
       style={{width:'100%'}}
      >
        <Row gutter={10}>
          <Col span={16}>
            <Input placeholder="Search by Name" value={search.key ?? ''} prefix={<SearchOutlined style={{color:'#bfbfbf'}}/>} onChange={(e)=> setSearch({key:e.target.value})} allowClear style={{borderRadius:999, paddingInline:16, paddingBlock:8, boxShadow:'0 4px 10px rgba(15, 23, 42, 0.06)', border:'1px solid #dde4ff'}}/>
          </Col>

          <Col span={8}>
            <Button style={{borderRadius:'50px'}} type="primary" variant="filled" icon={<SearchOutlined/>} >Search</Button>
          </Col>
        </Row>

      </Form>
   )
};

const ToggleStatus = ({data}) => {
  const toggleStatus = () => {
    console.log("Toggle Status", data.id);
  };

  return (
     <Switch checked={Boolean(data?.status)} checkedChildren='Active' unCheckedChildren='Inactive' onChange={toggleStatus}/>
  )
};

const DataForm = ({_id, onSave, initialData}) => {
  const [form] = Form.useForm();
  const isEdit  = Boolean(_id);

  const handleFinish = (values) => {
    const payload = {
      ...(initialData || {}),
      ...values,
      id:_id || ''
    };
    onSave();
  };


  useEffect(() => {
    if(isEdit && initialData){
      form.setFieldValue({
        status: initialData.status ?? true,
        ...initialData
      });
    }else {
      form.resetFields();
      form.setFieldsValue({
        status: true,
      })
    }

  },[_id, initialData, form, isEdit]);


  return (
    <>
    <Form layout="vertical" form={form} onFinish={handleFinish}>
      <Card
       size="small"
       style={{
        marginBottom:12,
        borderRadius:14,
        border:'1px solid #f0f0f0',
        background:'rgba(255, 255, 255, 0.8)'
       }}
       styles={{body: {padding:12} }}
       title={
        <Space>
          <div style={{width:24,height:24, borderRadius:'999px', background:'#e6f4ff', display:'flex',alignItems:'center', justifyContent:'center' }}>
            <EnvironmentOutlined style={{fontSize:14, color:'#1677ff'}} />
          </div>
          <span>City Information</span>
        </Space>
       }
      >
        <Row gutter={12}>
          <Col xs={24} sm={12}>
           <Form.Item name={'name'} label="Name" rules={[{required:true, message:'Please enter City Name'}]}>
            <Input placeholder="Enter Name"/>
           </Form.Item>
          </Col>

          <Col xs={24} sm={12}>
           <Form.Item name={'State'} label='State' rules={[{required:true, message:"Please enter the state name"}]}>
            <Input placeholder="Enter State Name"/>
           </Form.Item>
          </Col>
        </Row>

      </Card>

      <Row>
        <Col xs={12} md={6}>
          <Button type="danger" block onClick={()=>{form.resetFields();onSave();}} style={{borderRadius:999}}>Cancel</Button>
        </Col>
        <Col xs={12} md={6}>
          <Button type="primary" htmlType="submit" block style={{borderRadius:999}}>{isEdit ? "Save Changes" : "Create City"}</Button>
        </Col>
      </Row>
    </Form>
    </>
  )
};