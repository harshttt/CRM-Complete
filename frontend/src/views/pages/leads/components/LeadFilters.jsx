import { ClearOutlined, CloseCircleOutlined, FilterOutlined } from "@ant-design/icons";
import { useCategoryDropdown } from "../../../../api-hooks/category";
import { useUserDropdown } from "../../../../api-hooks/user";
import {AutoComplete, Button, Col, DatePicker, Drawer, Flex, Form, Row, Select, Space, Switch, Typography} from "antd";
import commonObj from "../../../../commonObj";
import { useEffect, useRef, useState } from "react";
import dayjs from "dayjs";
import util from "../../../../utils/util";
import Search from "./Search";

const { RangePicker } = DatePicker;
const { Text } = Typography;


// export default function LeadSearchAndFilters({leads, filters, setFilters, search, setSearch, refetchWithQuery}){
//   const [showFilters, setShowFilters] = useState(false);

//  return (
//    <div style={{marginBottom: 10, borderRadius: 18, padding: 10, paddingInline: 12, background:"linear-gradient(90deg,rgba(240,245,255,0.9),rgba(255,255,255,0.95))", border: "1px solid #f0f2ff"}}>
//     <Flex>
//       <Search search={search} setSearch={setSearch} refetch={refetchWithQuery} />
//       <Space>
//       <Button onClick={() => setShowFilters(prev => !prev)} style={{ borderRadius: "50px" }} icon={<ClearOutlined />} variant="outlined">Clear Filters</Button>
//       <Button onClick={() => setShowFilters(prev => !prev)} style={{ borderRadius: "50px" }} icon={<FilterOutlined />} type="primary">Filters</Button>
//       </Space>
//     </Flex>
//      <LeadFilters refetchLeadsWithQuery={refetchWithQuery} open={showFilters} onClose={() => setShowFilters(false)} leads={leads} filters={filters} setFilters={setFilters}/>
//    </div>
//  )
// };

/*──────────── LEAD FILTERS ────────────*/
 export default function LeadFilters({refetchLeadsWithQuery, open, onClose, filters, setFilters }) {
  const debounceRef = useRef(null);
  const [form] = Form.useForm();
  const [localFilters, setLocalFilters] = useState(filters);

  const {data: userRes, refetchWithQuery: refetchUsersWithQuery} = useUserDropdown({ qData: { page: 1, limit: 20 }  });
  const {data: commentedByRes, refetchWithQuery: refetchCommentedByUsersWithQuery} = useUserDropdown({ qData: { page: 1, limit: 20 }, key:'COMMENTED_BY'  });
  const {data: assignedToRes, refetchWithQuery: refetchAssignedToUsersWithQuery} = useUserDropdown({ qData: { page: 1, limit: 20 }, key:'ASSIGNED_TO' });
  const {data: firstAssigneeRes, refetchWithQuery: refetchFirstAssigneeUsersWithQuery} = useUserDropdown({ qData: { page: 1, limit: 20 }, key: 'FIRST_ASSIGNEE' });

  const userOptions = userRes?.data;

  const { data: ctgryRes } = useCategoryDropdown({qData: { page: 1, limit: 20 }});

    const [options, setOptions] = useState({
    stages:[],
    sources:[],
    tags:[],
    commentedByUsers:[],
    assignedToUsers:[],
    firstAssigneeUsers:[],
    categories:[]
  });
  
  useEffect(() => {
    if(commonObj?.constants){
      setOptions(prev => ({
        // ...prev,
        stages:util.enumToOptions(commonObj?.constants?.leadEnums?.STAGE),
        sources:util.enumToOptions(commonObj?.constants?.leadEnums?.SOURCE),
        tags:util.enumToOptions(commonObj?.constants?.leadEnums?.TAGS),
        commentedByUsers:commentedByRes?.data || [],
        assignedToUsers:assignedToRes?.data || [],
        firstAssigneeUsers:firstAssigneeRes?.data || [],
        categories: ctgryRes || []
      }));
    }

  },[commonObj?.constants, commentedByRes, assignedToRes, firstAssigneeRes, ctgryRes]);

  /*──────── USER SEARCH DEBOUNCE ────────*/
  const handleUserSearch = ({type,value}) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      if (value?.trim()) {
        switch(type){
          case 'COMMENTED_BY': 
          refetchCommentedByUsersWithQuery({q:value});
          break;
          case 'ASSIGNED_TO': 
          refetchAssignedToUsersWithQuery({q:value});
          break;
          case 'FIRST_ASSIGNEE': 
          refetchFirstAssigneeUsersWithQuery({q:value});
          break;
        }
      }
    }, 400);
  };

  /*──────── APPLY FILTERS ────────*/
  const handleApply = () => {
    // Apply local filters to parent state
    setFilters({ ...localFilters });
    refetchLeadsWithQuery(localFilters);
    onClose();
  };

  /*──────── RESET ────────*/
  const handleReset = () => {
    const emptyFilters = {
      stage: null,
      source: null,
      tags: [],
      category: null,
      assignedTo: null,
      owner:null,
      commentedBy: null,
      createDateFrom: null,
      createDateTo: null,
      commentedDateFrom: null,
      commentedDateTo: null,
    };
    
    setLocalFilters(emptyFilters);
    setFilters(emptyFilters);
    form.resetFields();
    refetchLeadsWithQuery(emptyFilters);
  };

  /*──────── UPDATE LOCAL FILTERS ────────*/
  const updateLocalFilter = (key, value) => {
    setLocalFilters(prev => ({...prev, [key]: value}));
  };

  /*──────── INITIALIZE FORM WITH CURRENT FILTERS ────────*/
  useEffect(() => {
    if (open) {
      setLocalFilters(filters);
      form.setFieldsValue({
        stage: filters.stage,
        source: filters.source,
        tags: filters.tags || [],
        category: filters.category,
        hasDuplicates:filters.hasDuplicates,
        commentedBy: userOptions?.find(u => u.id === filters.commentedBy)?.fullName || undefined,
        owner: userOptions?.find(u => u.id === filters.owner)?.fullName || undefined,
        assignedTo: userOptions?.find(u => u.id === filters.assignedTo)?.fullName || undefined,
        createDate: filters.createDateFrom && filters.createDateTo  ? [dayjs(filters.createDateFrom, 'YYYY-MM-DD' ), dayjs(filters.createDateTo, 'YYYY-MM-DD')] : undefined,
        commentDate: filters.commentedDateFrom && filters.commentedDateTo ? [dayjs(filters.commentedDateFrom, 'YYYY-MM-DD'), dayjs(filters.commentedDateTo, 'YYYY-MM-DD')] : undefined,
      });
    }
  }, [open, filters, form, userOptions]);

  /*──────── CLEANUP ────────*/
  useEffect(() => {
    return () => debounceRef.current && clearTimeout(debounceRef.current);
  }, []);

  return (
    <Drawer open={open} onClose={onClose} placement="right" width={420} closable={false}
      styles={{body:{paddingTop: 8, paddingBottom: 12, paddingInline: 16, background:"linear-gradient(135deg, rgba(245,247,255,0.98), rgba(255,255,255,0.98))"}}}
      title={
        <Space align="center" style={{ width: "100%", justifyContent: "space-between" }}>
          <Space>
            <Flex justify="center" align="center" style={{width: 32, height: 32, borderRadius: "50%", background: "rgba(24, 144, 255, 0.12)"}}>
              <FilterOutlined style={{ color: "#1890ff" }} />
            </Flex>

            <Space direction="vertical" size={0}>
              <Text strong>Lead Filters</Text>
              <Text type="secondary" style={{ fontSize: 11 }}> Filter leads using multiple criteria</Text>
            </Space>
          </Space>

          <Button type="text" onClick={onClose} icon={<CloseCircleOutlined style={{ fontSize: 18 }} />} />
        </Space>
      }
    >
      <Form form={form} layout="vertical">
        <Row gutter={[12, 8]}>
          {/* STAGE */}
          <Col xs={24} sm={12}>
            <Form.Item label="Stage" name="stage">
              <Select allowClear placeholder="All stages" value={localFilters.stage} onChange={(v) => updateLocalFilter('stage', v)} options={options?.stages?.map(i => ({label:i?.label, value:i?.value}))} />
            </Form.Item>
          </Col>

          {/* SOURCE */}
          <Col xs={24} sm={12}>
            <Form.Item label="Source" name="source">
              <Select allowClear placeholder="All sources" value={localFilters.source} onChange={(v) => updateLocalFilter('source', v)} options={options?.sources?.map(i => ({label:i?.label, value:i?.value}))} />
            </Form.Item>
          </Col>

          {/* TAGS */}
          <Col xs={24} sm={12}>
            <Form.Item label="Tags" name="tags">
              <Select mode="multiple" allowClear placeholder="All tags" value={localFilters.tags || [] } onChange={(v) => updateLocalFilter('tags', v)} options={options?.tags?.map(i => ({label:i?.label, value:i?.value}))}/>
            </Form.Item>
          </Col>

          {/* CATEGORY */}
          <Col xs={24} sm={12}>
            <Form.Item label="Category" name="category">
              <Select allowClear placeholder="All categories" value={localFilters.category} onChange={(v) => updateLocalFilter('category', v)} options={options?.categories?.map(c=> ({label:c?.name, value:c?.id}))} />
            </Form.Item>
          </Col>

       {commonObj?.role?.roleLevel !== 4 && 
          <>
          {/* COMMENTED BY */}
          <Col xs={24} sm={12}>
            <Form.Item label="Commented By" name="commentedBy">
              <AutoComplete placeholder="Search user"
                options={options?.commentedByUsers?.map(u=> ({ label:u.fullName, value:u.fullName, id:u.id}))}
                onSearch={(val)=>handleUserSearch({type:'COMMENTED_BY', value:val})}
                onSelect={(_, option) => updateLocalFilter('commentedBy', option.id)}
                onClear={() => updateLocalFilter('commentedBy', null)}
                allowClear
              />
            </Form.Item>
          </Col>

          {/* OWNER */}
          <Col xs={24} sm={12}>
            <Form.Item label="First Assignee" name="owner">
              <AutoComplete placeholder="Search owner"
                options={options?.firstAssigneeUsers?.map(u=> ({ label:u.fullName, value:u.fullName, id:u.id}))}
                onSearch={(val)=>handleUserSearch({type:'FIRST_ASSIGNEE', value:val})}
                onSelect={(_, option) => updateLocalFilter('owner', option.id)}
                onClear={() => updateLocalFilter('owner', null)}
                allowClear
              />
            </Form.Item>
          </Col>

          {/* ASSIGNED TO */}
          <Col xs={12}>
            <Form.Item label="Assigned To" name="assignedTo">
              <AutoComplete placeholder="Search assignee"
                options={options?.assignedToUsers?.map(u => ({ label: u.fullName, value: u.fullName, id: u.id}))}
                onSearch={(val)=>handleUserSearch({type:'ASSIGNED_TO', value:val})}
                onSelect={(_, option) => updateLocalFilter('assignedTo', option.id)}
                onClear={() => updateLocalFilter('assignedTo', null)}
                allowClear
              />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12}>
           <Form.Item label="Has Duplicates" name="hasDuplicates" valuePropName="checked">
            <Switch onChange={(checked) => { updateLocalFilter('hasDuplicates', checked);}}/>
           </Form.Item>
          </Col>
          </>
        }

          {/* CREATED DATE */}
          <Col xs={24}>
            <Form.Item label="Created Date" name="createDate">
              <RangePicker style={{ width: "100%" }}
                onChange={(dates) => {
                  updateLocalFilter('createDateFrom', dates?.[0] ? dates?.[0].format("YYYY-MM-DD") : null);
                  updateLocalFilter('createDateTo', dates?.[1] ? dates?.[1].format("YYYY-MM-DD") : null);
                }}
              />
            </Form.Item>
          </Col>

          {/* COMMENT DATE */}
          <Col xs={24}>
            <Form.Item label="Comment Date" name="commentDate">
              <RangePicker style={{ width: "100%" }}
                onChange={(dates) => {
                  updateLocalFilter('commentedDateFrom', dates?.[0] ? dates?.[0].format("YYYY-MM-DD") : null);
                  updateLocalFilter('commentedDateTo', dates?.[1] ? dates?.[1].format("YYYY-MM-DD") : null);
                }}
              />
            </Form.Item>
          </Col>
        </Row>

        {/* ACTION BAR */}
        <Row justify="space-between" align="middle">
          <Col>
            <Text type="secondary" style={{ fontSize: 11 }}>Tip: Combine multiple filters for better results</Text>
          </Col>

          <Col>
            <Space>
              <Button size="small" type="link" onClick={handleReset}>Clear All</Button>
              <Button size="small" type="primary" onClick={handleApply}> Apply Filters </Button>
            </Space>
          </Col>

        </Row>
      </Form>
    </Drawer>
  );
}