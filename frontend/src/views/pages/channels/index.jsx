import { parseAsString, useQueryState, useQueryStates } from 'nuqs';
import React, { useEffect, useState } from 'react';
import { getSortingStateParser } from '../../../utils/parsers';
import { Alert, Button, Card, Col, Form, Input, Modal, Popconfirm, Row, Space, Switch, Table, Typography } from 'antd';
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import MyPagination from '../../components/Pagination';
import { dummyUsers } from '../../../dummyData/users';
import util from '../../../utils/util';


const Channels = () => {
    const DEFAULT_NUQS_CONFIG = {
        throttleMs: !allowURLStateUpdate ? Infinity : 0
    };

    const sorting_cols = [''];

    const [sort,setSort] = useQueryState('sort',
        getSortingStateParser(sorting_cols)
        .withDefault([{column:'id', desc:1}])
        .withOptions(DEFAULT_NUQS_CONFIG)
    );

    const [search, setSearch] = useQueryStates(
        {key:parseAsString.withDefault("")},
        {urlKeys:{key:'search_term', ...DEFAULT_NUQS_CONFIG}}
    );

    const [isEditModalpen, setIsEditModalOpen] = useState(false);
    const [selectedId, setSelectedId] = useState(null);
    const [data, setData] = useState(null);

    const qData = {page:1, limit:20};

    const isError = false;
    const error = null;
    const refetch = () => {};
    const deletedData = () => {};

    const handleEdit = (id) => {
        setSelectedId(id);
        setIsEditModalOpen(true);
    };

    const handleModalClose = () => {
        setSelectedId(null);
        setIsEditModalOpen(false);
    };


    const columns = [
        {title:'Channel Id', dataIndex:'id', align:'center', width:50, render:(_,__, i)=> {
            const page = qData.page || 1;
            const limit = qData.limit || 20;
            return <b>{(page - 1) * limit + i + 1}</b>
        }},
        {title:'Channel Name', dataIndex:'name',align:'center'},   // e.g. Facebook, Google Ads, WhatsApp, Phone Call, Email, MagicBricks
        {title:'Channel Key', dataIndex:'channelKey',align:'center'}, // e.g. FACEBOOK, GOOGLE_ADS, WHATSAPP, PHONE, EMAIL, MAGICBRICKS
        {title:'Category', dataIndex:'category',align:'center'},   // Marketing, Communication, Portal, Offline
        {title:'Type', dataIndex:'type',align:'center'},   // Digital, Offline, Telephony, Messaging
        {title:'Direction', dataIndex:'direction',align:'center'}, //Inbound, Outbound, Both
        {title:'Owned By', dataIndex:'owner', align:'center'},
        {title:'Is Integrated', dataIndex: 'isIntegrated', align:'center'},
        {title:'Total Leads', dataIndex: 'totalLeads', align:'center'},
        {title:'Total Conversations', dataIndex:'totalConversation', align:'center'},
        {title:'Active', dataIndex:'status', align:'center'},

        {title:'Created At', dataIndex:'created_at', align:'center'},
        {title:'Updated At', dataIndex:'updated_at', align:'center'},

        {
            title:'Action',
            dataIndex:'id',
            align:'center',
            width:90,
            render:(v, row)=> (
                <Space>
                    <Popconfirm title="Are you sure to delete" onConfirm={()=>deletedData({id:v})}>
                        <Button size='small' icon={<DeleteOutlined/>} danger>Delete</Button>
                    </Popconfirm>
                    <Button size='small' icon={<EditOutlined/>} onClick={()=> handleEdit(v)}/>
                </Space>
            )
        }
    ];

    return (
       <>
       {isError ? (
        <Alert message="Error" description={error?.message} type='error' showIcon/>
       ) : (
        <Card size='small' bordered={false} title={<Typography.Text>Channel List</Typography.Text>} extra={<Button type='primary' size='small' onClick={()=>setIsEditModalOpen(true)} icon={<PlusOutlined/>}>Add New</Button>}>
          <Table
           bordered
           size='small'
           pagination={false}
           loading={false}
           title={()=><Search search={search} setSearch={setSearch} refetch={refetch} />}
           footer={()=> (<MyPagination {...{qData}} total={50} onChange={()=>{}} DEFAULT_NUQS_CONFIG={DEFAULT_NUQS_CONFIG} />)}
           columns={columns.map((v, i)=> {
            const sortConfig = sort?.find(s=> s.column === v.dataIndex);
            const isSortable = sorting_cols.includes(v.dataIndex);
            const haveMultipleSort = sorting_cols.length;
            return ({
                ...v,
                key: v.dataIndex || `column-${i}`,
                fixed: i === 0 ? true : i+1 === columns.length ? 'right' : false,
                sorter: isSortable ? haveMultipleSort ? {multiple:i+1, compare: null} : true : false ,
                defaultSortOrder: sortConfig ? sortConfig.desc === 1 ?'descend' : 'ascend' : null
           })
           })}
           dataSource={dummyUsers.map((v)=> ({...v, key:v.id}))}
           scroll={{y: util.getTableHeight()}}
           onChange={(_,__, sorter) => util.handleTableSortingData(
            sorter, setSort, sort, refetch, qData
           )}
          />
        </Card>
       )}

       <Modal open={isEditModalpen} onCancel={handleModalClose} destroyOnHidden footer={null} title={selectedId ? 'Edit Channel' : 'Add Channel'} >
           <DataForm _id={selectedId} onSave={handleModalClose} initialData={data}/>
       </Modal>
       </>
    )
 
}

export default Channels;

const Search = ({refetch, search, setSearch}) => {
    return (
     <Form onFinish={()=>{refetch()}}>
        <Row gutter={10}>
            <Col span={6}>
              <Input placeholder='Search by Name / Phone / Email' value={search.key} onChange={(e)=>setSearch({key:e.target.value})} allowClear/>
            </Col>

            <Col>
              <Button type='primary' htmlType='submit'>Search</Button>
            </Col>
        </Row>

     </Form>
    )
};

const DataForm = ({_id, onSave, initialData}) => {
    const [form] = Form.useForm();

    const onFinish = (values) => {
        onSave();
    }

    useEffect(()=>{
        if(_id && initialData){
            form.setFieldValue(initialData);
        }

    }, [_id]);

    return (
        <Form layout='vetical' form={form} onFinish={onFinish}>
            <Form.Item name={'fullname'} label='Full Name' rules={[{required:true, message:'Please enter full name'}]}>
                <Input/>
            </Form.Item>

            <Form.Item name={'Phone'} label="Phone" rules={[{required:true, message:'Please enter phone'}]}>
                <Input/>
            </Form.Item>

            <Button htmlType='submit' type='primary' block>Save</Button>
        </Form>
    )
}