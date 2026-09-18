import { Alert, Avatar, Button, Card, Col, Divider, Flex, Form, Input, List, message, Modal, Row, Select, Space, Spin, Steps, Tag, Typography} from "antd";
import { useEffect, useState } from "react";
import { useCategoryDropdown } from "../../../../api-hooks/category";
import { useLeadAssign, useLeadSave,useLeadUpdate} from "../../../../api-hooks/leads";
import { useRolesList } from "../../../../api-hooks/roles";
import { useUserList } from "../../../../api-hooks/user";
import { ClockCircleOutlined, EnvironmentOutlined, FlagOutlined, SwapOutlined, ThunderboltOutlined, UserOutlined} from "@ant-design/icons";
import commonObj from "../../../../commonObj";
import dayjs from "dayjs";
import util from "../../../../utils/util";

const { Title, Text } = Typography;

export default function AddEditModal({ open, onClose, selectedId, initialData, acc}) {
  const [form] = Form.useForm();
  const isEdit = !!selectedId;
  const [step, setStep] = useState(1);
  const [createdLeadId, setCreatedLeadId] = useState(null);
  const [messageApi, contextHolder] = message.useMessage();
  const [selectedRoleLevel, setSelectedRoleLevel] = useState(null);

  const {data: categoryDropdownList, isFetching: isCategoryLoading} = useCategoryDropdown({ page: 1, limit: 20 });
  
  const SOURCE_OPTIONS = util.enumToOptions(commonObj?.constants?.leadEnums?.SOURCE);
  const STAGE_OPTIONS = util.enumToOptions(commonObj?.constants?.leadEnums?.STAGE);
  const STATUS_OPTIONS = util.enumToOptions(commonObj?.constants?.leadEnums?.STATUS);
  const TAGS_OPTIONS = util.enumToOptions(commonObj?.constants?.leadEnums?.TAGS);

  const { mutate: saveLead, isPending: isLeadSaving } = useLeadSave({
    onSuccess: (res) => {
      messageApi.success(res?.message);
      setCreatedLeadId(res?.data?.id);
    },
    onError: (err) => {
      messageApi.error(err.message);
    },
  });

  const { mutate: updateLead, isPending: isLeadUpdating } = useLeadUpdate({
    onSuccess: (res) => {
      messageApi.success(res?.message);
      setCreatedLeadId(res?.data?.id);
    },
    onError: (err) => {
      messageApi.error(err?.message);
    },
  });

  const { mutate: assignLead, isPending: isAssigning } = useLeadAssign({
    onSuccess: (res) => {
      messageApi.success(res?.message);
      form.resetFields();
      setSelectedRoleLevel(null);
      setStep(1);
      onClose();
    },
    onError: (err) => {
      messageApi.error(err?.message);
    },
  });

  const {data: roleRes, isFetching: isRoleListLoading, isError: isRoleListError, error: roleListError} = useRolesList();
  const roleList = roleRes?.data;
  const {data: userRes, isFetching: isUserListLoading, isError: isUserListError, error: userListError, refetchWithQuery: refetchUsersWithQuery} = useUserList({ enabled: false });
  const userList = userRes?.data;

  // ----- Handlers -----
  const handleRoleChange = (roleLevel) => {
    setSelectedRoleLevel(roleLevel);
    form.setFieldsValue({ assignedTo: undefined });
    if (!roleLevel) return;
    refetchUsersWithQuery({ roleLevel });
  };

  const onFinish = (values) => {
    const leadId = createdLeadId ? createdLeadId : selectedId;
    const assignedUser = values.assigneeRole === 1 ? commonObj.id : values.assignedTo;
    const payload = { id: leadId, assignedTo: assignedUser };
    assignLead(payload);
  };

  // ----------------- PREFILL -----------------
  useEffect(() => {
    if (isEdit && initialData) {
      const raw = initialData.raw || {};
      form.setFieldsValue({
        fullName: raw?.fullName || initialData?.leadName,
        phone: raw?.phone || initialData?.phone,
        email: raw?.email || initialData?.email,
        projectName: raw?.projectName || initialData?.campaign,
        source: raw?.source || initialData?.source,
        category: initialData?.category?.id,
        alternatePhones: (raw?.alternatePhones || []).join(", "),
        alternateEmails: (raw?.alternateEmails || []).join(", "),
        budgetRange:`${raw?.budgetMin}-${raw?.budgetMax}`,
        // budgetMin: raw?.budgetMin,
        // budgetMax: raw?.budgetMax,
        branch: raw?.branch || initialData?.branch,
        // state: raw?.state,
        // city: raw?.city,
        // country: raw?.country,
        stage: raw?.stage || (initialData?.stage || "").toLowerCase(),
        // interest: raw?.interest,
        // type: raw?.type,
        // configuration: raw?.configuration,
        // possession_status: raw?.possession_status,

        // property_age: raw?.property_age,
        // property & location details
        // property_area: raw?.property_area,
        // property_area_city: raw?.property_area_city,
        // property_type: raw?.property_type,
        // preferred_area_city: raw?.preferred_area_city,
        // primary_location: raw?.primary_location,
        // listing_url: raw?.listing_url,
        primary_location: raw?.primary_location,
        property_description: raw?.property_description,

        // reason_for_selling: raw?.reason_for_selling,

        assignedTo: raw?.assignedTo?.id,
        currentOwnerRole: raw?.currentOwnerRole,
        ownerType: raw?.ownerType || "user",

        status: raw?.status !== undefined ? raw?.status : "active",
        isLocked: !!raw?.isLocked,
        archived: !!raw?.archived,

        score: raw?.score ?? 0,
        tags: (raw?.tags || []).join(", "),
        // communication / followups
        // preferred_contact_time: raw?.preferred_contact_time,
        // callback_time: raw?.callback_time,
        message: raw?.message || initialData?.notes,
        timeline: raw?.timeline,
        // site_visit_requested: !!raw?.site_visit_requested,
        // site_visit_date: raw?.site_visit_date,
        // site_visit_time: raw?.site_visit_time,
        // documents_shared: raw?.documents_shared,
        // whatsapp_opt_in: !!raw?.whatsapp_opt_in,
      });

      if (raw?.assignedTo && roleList?.length) {
        // const initialRoleLevel =  raw?.assignedTo?.role === "69341c2bba6f22bf137500f6" ? 1 : roleList?.find((item) => item.id === raw?.assignedTo?.role)?.roleLevel;
        const initialRoleLevel = raw?.assignedTo?.role?.roleLevel;
        setSelectedRoleLevel(initialRoleLevel);
        refetchUsersWithQuery({ roleLevel: initialRoleLevel });
      }
    } else {
      form.resetFields();
      setCreatedLeadId(null);
      form.setFieldsValue({
        ownerType: "user",
        status: "active",
        isLocked: false,
        archived: false,
        // site_visit_requested: false,
        // whatsapp_opt_in: false,
        score: 0,
      });
    }
  }, [selectedId, initialData, form, isEdit]);

  const parseList = (val) => (val || "").split(",").map((v) => v.trim()).filter(Boolean);

  // ----------------- NEXT FROM STEP 1 (Create on backend) -----------------
  const handleNext = async () => {
    try {
      await form.validateFields(["fullName", "phone", "email", "source", "projectName", "budgetMin", "budgetMax"]);
      const values = form.getFieldsValue();

      if (isEdit) {
        const { assignedTo, status, raw, ...payload } = {...initialData,  ...values};
        updateLead({...payload, tags:[payload?.tags]}, {
          onSuccess: (res) => {
            messageApi.success(res?.message);
            if(acc.assignAccess){
            setStep(2);
            }
          },
          onError: (err) => {
            messageApi.error(err?.message);
          },
        });
      } else {
        // create new lead on Step 1

        const payload = {
          fullName: values?.fullName,
          phone: values?.phone,
          email: values?.email,
          source: values?.source,
          projectName: values?.projectName,
          budgetMin: values?.budgetRange?.split('-')[0],
          budgetMax: values?.budgetRange?.split('-')[1],
          alternatePhones: parseList(values?.alternatePhones),
          alternateEmails: parseList(values?.alternateEmails),
          category: values?.category,
          // property_type: values.property_type,
          // configuration: values.configuration,
          // property_area: values.property_area,
          // property_area_city: values.property_area_city,
          // preferred_area_city: values.preferred_area_city,
          // primary_location: values.primary_location,
          property_description: values?.property_description,
          // reason_for_selling: values.reason_for_selling,
          // possession_status: values.possession_status,
          // property_age: values.property_age,
          // listing_url: values.listing_url,
          stage: values?.stage,
          status: "active",
        };

        saveLead(payload, {
          onSuccess: (res) => {
            const newId = res?.data?.id || res?.data?._id || res?.id || res?._id || null;
            if (newId) setCreatedLeadId(newId);
            if(acc?.assignAccess){
            setStep(2);
            }else{
              handleCancel()
            }
          },
          onError: (err) => {
            messageApi.error(err?.message);
          },
        });
      }
    } catch (err) {
      messageApi.error(err?.message);
    }
  };

  const handleBack = () => {
    setStep(1);
  };

  const handleCancel = () => {
    form.resetFields();
    setStep(1);
    setCreatedLeadId(null);
    onClose?.();
  };

  useEffect(() => {
  if (roleList?.length && selectedRoleLevel) {
    form.setFieldsValue({
      assigneeRole: selectedRoleLevel,
    });
  }
}, [roleList, selectedRoleLevel]);


  return (
    <Modal open={open} onCancel={handleCancel} destroyOnHidden footer={null} centered width={1200} title={null}
      styles={{body:{padding: 0, background:"linear-gradient(135deg, #f3f6ff 0%, #ffffff 35%, #fdf5ff 100%)"}}}
    >
      <Flex justify="space-between" align="center" gap={8} style={{ padding: 20, paddingBottom: 12, borderBottom: "1px solid #f0f0f0"}}>
        <Space align="center">
          <Flex align="center" justify="center" style={{ width: 36, height: 36, borderRadius: "999px", background:"radial-gradient(circle at 30% 20%, #e6f4ff, #d6e4ff)"}}>
            <ThunderboltOutlined style={{ color: "#1d39c4" }} />
          </Flex>
          <Space direction="vertical" size={0}>
            <Title level={5} style={{ margin: 0 }}>{step === 1 ? selectedId  ? "Edit Lead" : "Create New Lead" : "Assign Lead"}</Title>
            <Text type="secondary" style={{ fontSize: 12 }}>{step === 1 ? "Capture enquiry details, interest and assignment info." : "Assign and update lead stage"}</Text>
          </Space>
        </Space>
      </Flex>

      <div style={{ padding: 18, paddingTop: 6 }}>
        <Form layout="vertical" form={form} onFinish={onFinish}>
          {/* STEPPER HEADER */}
          {contextHolder}
          <Card size="small" bordered={false} style={{marginBottom: 12, borderRadius: 14, background: "linear-gradient(90deg,#f5f7ff,#ffffff)", border: "1px solid #f0f0f0",}} styles={{body:{padding:'8px 16px'}}}>
           <Steps size="small" current={step - 1} items={[{title: "Lead Creation", description: "Basic details & requirement"}, ...(acc?.assignAccess ? [{title: "Assignment & Follow-ups", description: "Ownership, status & visit details"}]: [])]}/>
          </Card>

          <Spin spinning={isLeadSaving || isLeadUpdating || isAssigning}>
            {step === 1 && (
              <>
                {/* LEAD DETAILS */}
                <Card size="small" style={{marginBottom: 12, borderRadius: 14, border: "1px solid #f0f0f0", background: "rgba(255,255,255,0.96)" }} styles={{body:{padding:12}}}
                  title={<Space> <UserOutlined style={{ color: "#1677ff" }} />  <span>Lead Details</span> </Space>}
                >
                  <Row gutter={12}>
                    <Col xs={12} md={8}>
                      <Form.Item name="fullName" label="Full Name" rules={[{ required: true, message: "Please enter full name" }]}>
                        <Input placeholder="e.g. Fardeen Qureshi" />
                      </Form.Item>
                    </Col>

                    <Col xs={12} md={8}>
                      <Form.Item name="phone" label="Phone"
                        rules={[
                          { required: true, message: "Please enter phone number" },
                          { pattern:/^(\+?\d{1,3})?[6-9]\d{9}$/, message:'Enter a valid mobile number (with optional country code)'}
                        ]}
                      >
                        <Input placeholder="e.g. 9876543210" maxLength={14} inputMode="numeric"/>
                      </Form.Item>
                    </Col>

                    <Col xs={12} md={8}>
                      <Form.Item name="email" label="Email" rules={[{ required: true, message: "Please enter email" }, { type: "email", message: "Enter valid email" }]}>
                        <Input type={"email"} placeholder="e.g. fardeen@example.com"/>
                      </Form.Item>
                    </Col>

                     <Col xs={12} md={12}>
                      <Form.Item name="alternatePhones" label="Alternate Phones (comma separated)"
                        rules={[
                          {
                            validator: (_, value) => {
                              if (!value) return Promise.resolve();
                              const phones = value.split(",").map((p) => p.trim()).filter(Boolean);
                              const phoneRegex = /^[6-9]\d{9}$/;
                              const invalid = phones.find((p) => !phoneRegex.test(p));

                              if (invalid) {
                                return Promise.reject( new Error( `Invalid phone number: ${invalid}. Enter 10-digit numbers separated by commas`));
                              }

                              return Promise.resolve();
                            },
                          },
                        ]}
                      >
                        <Input placeholder="e.g. 9876543210, 9123456789" />
                      </Form.Item>
                    </Col>

                    <Col xs={12} md={12}>
                      <Form.Item name="alternateEmails" label="Alternate Emails (comma separated)"
                        rules={[
                          {
                            validator: (_, value) => {
                              if (!value) return Promise.resolve();
                              const emails = value.split(",").map((e) => e.trim()).filter(Boolean);
                              const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                              const invalid = emails.find( (e) => !emailRegex.test(e));

                              if (invalid) {
                                return Promise.reject(
                                  new Error(`Invalid email address: ${invalid}`)
                                );
                              }
                              return Promise.resolve();
                            },
                          },
                        ]}
                      >
                        <Input placeholder="e.g. rahul2@example.com, rahul.office@example.com" />
                      </Form.Item>
                    </Col>

                    <Col xs={24} md={8}>
                      <Form.Item label='Location' name={'primary_location'} rules={[{required:true, message:'Please enter location'}]}>
                        <Input placeholder="Enter Location"/>
                      </Form.Item>
                    </Col>

                    <Col xs={12} md={8}>
                      <Form.Item name="source" label="Source" rules={[{ required: true, message: "Enter the Source" }]}>
                        <Select placeholder="Select source" options={SOURCE_OPTIONS?.map(item => ({label:item?.label, value:item.value}))} />
                      </Form.Item>
                    </Col>

                    {/* <Col xs={12} md={8}>
                      <Form.Item label="Status" name={"status"} rules={[{ required: true }]}>
                        <Select options={STATUS_OPTIONS?.map(item => ({label: item, value: item}))} />
                      </Form.Item>
                    </Col> */}

                  </Row>
                </Card>

                {/* PROJECT & PROPERTY & BUDGET */}
                <Card size="small" styles={{body:{padding:12}}} style={{ marginBottom: 10, borderRadius: 14, border: "1px solid #f0f0f0", background: "rgba(255,255,255,0.96)"}}
                  title={ <Space> <EnvironmentOutlined style={{ color: "#52c41a" }} /> <span>Project Details</span> </Space>}
                >
                  <Row gutter={12}>
                    <Col xs={24} md={12}>
                      <Form.Item name="projectName" label="Project Name" rules={[{ required: true, message: "Enter the Project Name" }]}>
                        <Input placeholder="e.g. Sunrise Tower" />
                      </Form.Item>
                    </Col>

                    <Col xs={24} md={12}>
                        <Form.Item label='Budget Range (₹)' name='budgetRange' rules={[{required:true, message:'Please select budget range'}]}>
                           <Select placeholder={'Select the Budget range'} 
                             options={[
                               { label: "10,000 – 50,000", value: "10000-50000" },
                               { label: "50,000 – 1,00,000", value: "50000-100000" },
                               { label: "1,00,000 – 5,00,000", value: "100000-500000" },
                               { label: "5,00,000 – 10,00,000", value: "500000-1000000" },
                               { label: "10,00,000 – 25,00,000", value: "1000000-2500000" },
                               { label: "25,00,000 – 50,00,000", value: "2500000-5000000" },
                            ]}/>
                        </Form.Item>

                      {/* <Form.Item shouldUpdate noStyle>
                        {({ getFieldValue }) => {
                          const [min=0, max=0] = getFieldValue('budgetRange') || [];
                          return (
                            <Flex justify="space-between" style={{marginTop:4}}>
                              <Text style={{fontSize:12}}> Min: ₹{min.toLocaleString('en-IN')}</Text>
                              <Text style={{fontSize:12}}> Max: ₹{max.toLocaleString('en-IN')}</Text>
                            </Flex>
                          )
                        }}
                      </Form.Item> */}

                      {/* <Text type="secondary" style={{fontSize:11}} >Step size: ₹50,000 (50 thousand)</Text> */}
                    </Col>

                    <Col xs={12} md={8}>
                      <Form.Item name={"category"} label="Category"rules={[{ required: true, message:'Please select Category' }]}>
                        <Select placeholder={"Select lead category"} loading={isCategoryLoading} options={categoryDropdownList?.map(itm => ({label: itm?.name, value: itm?.id}))} />
                      </Form.Item>
                    </Col>

                    
                    <Col xs={24} md={8}>
                      <Form.Item name="stage" label="Stage" initialValue={initialData?.stage} rules={[{required:true, message:'Please select stage'}]}>
                        <Select placeholder="Select stage" options={STAGE_OPTIONS?.map(item => ({label: item?.label, value: item?.value}))}/>
                      </Form.Item>
                    </Col>

                    <Col xs={12} md={8}>
                      <Form.Item label="Tags" name={"tags"} rules={[{ required: true, message:'Please select tag' }]}>
                        <Select placeholder="Select Tag" options={TAGS_OPTIONS?.map(item => ({label: item?.label, value: item?.value}))} />
                      </Form.Item>
                    </Col>

                    {/* <Col xs={24} md={12}>
                      <div style={{ paddingInline: 4 }}>
                        <div style={{display: "flex", gap: 8, marginTop: 8,alignItems: "center"}}>
                          <Form.Item name={"budgetMin"} label="Budget Min" dependencies={["budgetMax"]}
                            rules={[
                              {required: true},
                              ({ getFieldValue }) => ({
                                validator(_, value) {
                                  const max = getFieldValue("budgetMax");
                                  if (value == null || max == null)
                                    return Promise.resolve();
                                  if (value <= max) return Promise.resolve();
                                  return Promise.reject(
                                    new Error( "Minimum budget cannot be greater than maximum budget")
                                  );
                                },
                              }),
                            ]}
                            style={{ display: "block", width: "100%" }}
                          >
                            <InputNumber type="Number" style={{ flex: 1, width: "100%" }} placeholder="Min (₹)" min={0} formatter={(v) => (v ? `${v}` : "")} parser={(v) => v?.replace(/[^\d]/g, "")} />
                          </Form.Item>
                          <span>to</span>
                          <Form.Item
                            name={"budgetMax"}
                            label="Budget Max"
                            dependencies={["budgetMin"]}
                            rules={[
                              { required: true },
                              ({ getFieldValue }) => ({
                                validator(_, value) {
                                  const min = getFieldValue("budgetMin");
                                  if (value == null || min == null) return Promise.resolve();
                                  if (value >= min) return Promise.resolve();
                                  return Promise.reject(new Error("Maximum budget cannot be less than minimum budget"));
                                },
                              }),
                            ]}
                            style={{ display: "block", width: "100%" }}
                          >
                            <InputNumber type="Number" style={{ flex: 1, width: "100%" }} placeholder="Max (₹)" min={0} formatter={(v) => (v ? `${v}` : "")} parser={(v) => v?.replace(/[^\d]/g, "")} />
                          </Form.Item>
                        </div>
                        <div style={{ marginTop: 4 }}>
                          <Text type="secondary" style={{ fontSize: 11 }}>
                            Values are in rupees. Slider step = ₹5,00,000 (~5L).
                          </Text>
                        </div>
                      </div>
                    </Col> */}

                    {/* <Col xs={12} md={8}>
                <Form.Item name={"interest"} label={"Interest"}>
                  <Select
                    placeholder="Select Interest Type"
                    options={[
                      { label: "Buying Property", value: "buying_property" },
                      { label: "Selling Property", value: "selling_property" },
                      { label: "Sell Commerical", value: "sell_commerical" },
                      { label: "Buy Commercial", value: "buy_commercial" },
                      { label: "Rent Commercial", value: "rent_commercial" },
                      { label: "Rent Property", value: "rent_property" },
                      { label: "Rental Property", value: "rental_property" },
                      { label: "Explore", value: "explore" },
                    ]}
                  />
                </Form.Item>
              </Col> */}

                    {/* <Col xs={12} md={8}>
                <Form.Item name="property_type" label="Property Type">
                  <Select
                    placeholder="Select Property Type"
                    options={[
                      { label: "Commercial", value: "commercial" },
                      { label: "Apartment", value: "apartment" },
                      {
                        label: "Independent House",
                        value: "independent_house",
                      },
                      { label: "Land", value: "land" },
                      { label: "Duplex", value: "duplex" },
                      { label: "Villa", value: "villa" },
                      { label: "Plot", value: "plot" },
                    ]}
                  />
                </Form.Item>
              </Col> */}

                    {/* <Col xs={12} md={8}>
                <Form.Item name="Type" label="Type">
                  <Select
                    placeholder="Select Type"
                    options={[
                      { label: "Buyer", value: "buyer" },
                      { label: "Seller", value: "seller" },
                      { label: "Tenant", value: "tenant" },
                      { label: "Landlord", value: "landlord" },
                    ]}
                  />
                </Form.Item>
              </Col> */}

                    {/* <Col xs={12} md={8}>
                <Form.Item name="configuration" label="Configuration">
                  <Select placeholder='Select Configuration' options={[{label:'2BHK', value:'2bhk'},{label:'3BHK', value:'3bhk'},{label:'4BHK', value:'4bhk'}]}/>
                </Form.Item>
              </Col> */}

                    {/* <Col xs={12} md={8}>
                <Form.Item name="property_area" label="Property Area">
                  <Input placeholder="e.g. 1200 sq.ft" />
                </Form.Item>
              </Col> */}

                    {/* <Col xs={12} md={8}>
                <Form.Item name="property_area_city" label="Property City">
                  <Input placeholder="e.g. Mumbai, Pune" />
                </Form.Item>
              </Col> */}

                    {/* <Col xs={12} md={8}>
                <Form.Item
                  name="preferred_area_city"
                  label="Preferred Area / City"
                >
                  <Input placeholder="e.g. Andheri East, Noida Sector 62" />
                </Form.Item>
              </Col> */}

                    {/* <Col xs={12} md={8}>
                <Form.Item name="primary_location" label="Primary Location">
                  <Input placeholder="Primary interest location" />
                </Form.Item>
              </Col> */}

              <Col xs={24}>
                <Form.Item name="property_description" label="Project Description" rules={[{required:true, message:'Please enter description'}]}>
                  <Input.TextArea rows={3} placeholder="Short description of the project requirement"/>
                </Form.Item>
              </Col>

                    {/* <Col xs={24}>
                <Form.Item
                  name="reason_for_selling"
                  label="Reason for Selling (if seller lead)"
                >
                  <Input.TextArea rows={2} placeholder="Reason for selling" />
                </Form.Item>
              </Col> */}

                    {/* <Col xs={24} md={8}>
                <Form.Item name="possession_status" label="Possession Status">
                  <Select
                    placeholder="Select Possession Status"
                    options={[
                      { label: "Ready", value: "ready" },
                      {
                        label: "Under Construction",
                        value: "under-construction",
                      },
                    ]}
                  />
                </Form.Item>
              </Col> */}

                    {/* 
              <Col xs={24} md={8}>
                <Form.Item name="property_age" label="Property Age">
                  <Input type={'number'} placeholder="e.g. 5 years" />
                </Form.Item>
              </Col> */}

                    {/* <Col xs={24} md={8}>
                <Form.Item name="listing_url" label="Listing URL">
                  <Input placeholder="Portal listing URL, if any" />
                </Form.Item>
              </Col> */}
                  </Row>
                </Card>
              </>
            )}

            {step === 2 && (
              <>

                  {/* LEAD DETAILS */}
                  <Card size="small"
                    style={{
                      marginBottom: 12,
                      borderRadius: 14,
                      border: "1px solid #f0f0f0",
                      background: "rgba(255,255,255,0.96)"
                    }}
                    styles={{ body: { padding: 12 } }}
                    title={
                      <Space>
                        <UserOutlined style={{ color: "#1677ff" }} />
                        <span>Lead Details</span>
                      </Space>
                    }
                  >
                    <Row gutter={12}>
                      {/* Full Name */}
                      <Col xs={12} md={8}>
                        <div style={{ marginBottom: 8 }}>
                          <div style={{ fontSize: '12px', color: '#8c8c8c' }}>Full Name</div>
                          <div style={{ fontSize: '14px', fontWeight: 500 }}>
                            {initialData?.leadName || '—'}
                          </div>
                        </div>
                      </Col>

                      {/* Phone */}
                      <Col xs={12} md={8}>
                        <div style={{ marginBottom: 8 }}>
                          <div style={{ fontSize: '12px', color: '#8c8c8c' }}>Phone</div>
                          <div style={{ fontSize: '14px', fontWeight: 500 }}>
                            {initialData?.phone || '—'}
                          </div>
                        </div>
                      </Col>

                      {/* Email */}
                      <Col xs={12} md={8}>
                        <div style={{ marginBottom: 8 }}>
                          <div style={{ fontSize: '12px', color: '#8c8c8c' }}>Email</div>
                          <div style={{ fontSize: '14px', fontWeight: 500 }}>
                            {initialData?.email || '—'}
                          </div>
                        </div>
                      </Col>


                      {/* Alternate Emails */}
                      {/* <Col xs={12} md={12}>
                        <div style={{ marginBottom: 8 }}>
                          <div style={{ fontSize: '12px', color: '#8c8c8c' }}>Alternate Phones</div>
                          <div style={{ fontSize: '14px', fontWeight: 500 }}>
                            {initialData?.alternatePhones && Array.isArray(initialData.alternatePhones) && initialData.alternatePhones.length > 0
                              ? initialData.alternatePhones.join(', ')
                              : '—'}
                          </div>
                        </div>
                      </Col>

                      <Col xs={12} md={12}>
                        <div style={{ marginBottom: 8 }}>
                          <div style={{ fontSize: '12px', color: '#8c8c8c' }}>Alternate Emails</div>
                          <div style={{ fontSize: '14px', fontWeight: 500 }}>
                            {initialData?.alternateEmails && Array.isArray(initialData.alternateEmails) && initialData.alternateEmails.length > 0
                              ? initialData.alternateEmails.join(', ')
                              : '—'}
                          </div>
                        </div>
                      </Col> */}

                      {/* Location */}
                      <Col xs={24} md={8}>
                        <div style={{ marginBottom: 8 }}>
                          <div style={{ fontSize: '12px', color: '#8c8c8c' }}>Location</div>
                          <div style={{ fontSize: '14px', fontWeight: 500 }}>
                            {initialData?.primary_location || '—'}
                          </div>
                        </div>
                      </Col>

                      {/* Category */}
                      <Col xs={12} md={8}>
                        <div style={{ marginBottom: 8 }}>
                          <div style={{ fontSize: '12px', color: '#8c8c8c' }}>Category</div>
                          <div style={{ fontSize: '14px', fontWeight: 500 }}>
                            {initialData?.category?.name || '—'}
                          </div>
                        </div>
                      </Col>

                      {/* Source */}
                      <Col xs={12} md={8}>
                        <div style={{ marginBottom: 8 }}>
                          <div style={{ fontSize: '12px', color: '#8c8c8c' }}>Source</div>
                          <div style={{ fontSize: '14px', fontWeight: 500 }}>
                            {initialData?.source || '—'}
                          </div>
                        </div>
                      </Col>

                      {/* Stage */}
                      <Col xs={24} md={8}>
                        <div style={{ marginBottom: 8 }}>
                          <div style={{ fontSize: '12px', color: '#8c8c8c' }}>Stage</div>
                          <div style={{ fontSize: '14px', fontWeight: 500 }}>
                            {initialData?.stage || '—'}
                          </div>
                        </div>
                      </Col>

                      {/* Tags */}
                      <Col xs={12} md={8}>
                        <div style={{ marginBottom: 8 }}>
                          <div style={{ fontSize: '12px', color: '#8c8c8c' }}>Tags</div>
                          <div style={{ fontSize: '14px', fontWeight: 500 }}>
                            {initialData?.tags || '—'}
                          </div>
                        </div>
                      </Col>
                    </Row>
                  </Card>

                {/* ASSIGNMENT & STATUS */}
                <Card
                  size="small"
                  style={{ marginBottom: 12, borderRadius: 14, border: "1px solid #f0f0f0", background: "rgba(255,255,255,0.96)"}}
                  styles={{body:{padding:12}}}
                  title={ <Space> <FlagOutlined style={{ color: "#fa8c16" }} /> <span>Assignment & Status</span></Space>}
                >
                  {isRoleListError && ( <Alert type="error" showIcon style={{ marginBottom: 8 }} message="Failed to load roles" description={roleListError?.message} />)}
                  {isUserListError && ( <Alert type="error" showIcon style={{ marginBottom: 8 }} message="Failed to load users for selected role" description={userListError?.message}/>)}

                  {initialData?.raw?.assignmentHistory?.length > 0 && (
                    <>
                      <List style={{ maxHeight: "60vh", overflowY: "auto" }} dataSource={initialData?.raw?.assignmentHistory} itemLayout="vertical"
                        renderItem={(item) => (
                          <List.Item style={{paddingBlock: 10, borderBottom: "1px dashed #eee"}}>
                            <List.Item.Meta
                              avatar={<Avatar size="small" icon={<UserOutlined />} style={{ backgroundColor: "#597ef7" }} />}
                              title={
                                <Flex justify="space-between" align="start">
                                  <Space size={8} wrap>
                                    <Text strong>Assignment Change</Text>
                                    <Tag color="purple">{item?.roleFrom || "N/A"}</Tag>
                                    <SwapOutlined />
                                    <Tag color="green"> {item?.roleTo || "N/A"}</Tag>
                                  </Space>

                                  <Space>
                                    <ClockCircleOutlined style={{ fontSize: 12 }} />
                                    <Text type="secondary" style={{ fontSize: 12 }}>{dayjs(item?.changedAt).format("DD MMM YYYY, hh:mm A")}</Text>
                                  </Space>
                                </Flex>
                              }
                              description={
                                <div style={{ marginTop: 6 }}>
                                  <Space direction="vertical" size={2}>
                                    <Text>
                                      <b>From:</b>{" "}
                                      {item?.from?.fullName || item?.from || "Unknown"}
                                    </Text>

                                    <Text>
                                      <b>To:</b>{" "}
                                      {item?.to?.fullName || item?.to || "Unknown"}
                                    </Text>

                                    <Text>
                                      <b>Changed By:</b>{" "}
                                      {item?.changedBy?.fullName || item?.changedBy || "Unknown"}
                                    </Text>

                                    {/* {item.reason && (
                                      <Text>
                                        <b>Reason:</b> {item.reason}
                                      </Text>
                                    )} */}
                                  </Space>
                                </div>
                              }
                            />
                          </List.Item>
                        )}
                      />
                      <Divider style={{ margin: "14px 0 8px" }} />
                    </>
                  )}

                  <Row gutter={12}>
                    <Col xs={24} md={8}>
                      <Form.Item name="assigneeRole" label="Assignee Role">
                        <Select placeholder="Select the Assignee Role" disabled={isRoleListLoading} onChange={handleRoleChange}
                           options={[
                                  ...((commonObj.role.roleLevel !== 1 || isEdit) ? [{label:'Super Admin', value:1}] : []),
                                  ...roleList?.map((item) => ({label: item?.name, value: Number(item?.roleLevel)}))
                                ]}
                          // options={[{label:'Super Admin', value:1}, ...roleList?.map((item) => ({label: item?.name, value: Number(item?.roleLevel)}))]}
                        />
                      </Form.Item>
                    </Col>

                  {selectedRoleLevel !== 1 && <Col xs={24} md={8}>
                      <Form.Item name="assignedTo" label="Assigned To (User ID / Name)">
                        <Select
                          options={userList?.map(item => ({label: item?.fullName, value: item?.id}))}
                          placeholder={selectedRoleLevel ? "Select the User" : "Select role first"}
                          showSearch
                          disabled={!selectedRoleLevel || isUserListLoading}
                          loading={isUserListLoading}
                          optionFilterProp="label"
                        />
                      </Form.Item>
                    </Col>
                  }

                    {/* <Col xs={24} md={8}>
                <Form.Item name="branch" label="Branch">
                  <Input placeholder="e.g. Mumbai" />
                </Form.Item>
              </Col> */}

                    {/* <Col xs={24} md={8}>
                <Form.Item name="state" label="State">
                  <Input placeholder="e.g. Maharashtra" />
                </Form.Item>
              </Col>

              <Col xs={24} md={8}>
                <Form.Item name="city" label="City">
                  <Input placeholder="e.g. Mumbai" />
                </Form.Item>
              </Col>

              <Col xs={24} md={8}>
                <Form.Item name="country" label="Country">
                  <Input placeholder="e.g. India" />
                </Form.Item>
              </Col> */}

                    {/* <Col xs={24} md={8}>
                <Form.Item name="type" label="Lead Type">
                  <Input placeholder="e.g. Buyer, Seller" />
                </Form.Item>
              </Col>

              <Col xs={24} md={8}>
                <Form.Item name="interest" label="Interest Level">
                  <Input placeholder="e.g. High, Medium, Low" />
                </Form.Item>
              </Col> */}

                    {/* <Col xs={24} md={8}>
                <Form.Item name="score" label="Lead Score">
                  <Input type="number" placeholder="e.g. 80" />
                </Form.Item>
              </Col> */}

                    {/* <Col xs={24} md={8}>
                <Form.Item name="tags" label="Tags (comma separated)">
                  <Input placeholder="e.g. general, hot, investor" />
                </Form.Item>
              </Col> */}

                    {/* <Col xs={24} md={8}>
                <Form.Item name="status" label="Status">
                  <Select
                    options={[
                      { label: "Active", value: "active" },
                      { label: "Inactive", value: "inactive" },
                    ]}
                  />
                </Form.Item>
              </Col> */}

                    {/* <Col xs={24} md={8}>
                <Form.Item
                  name="isLocked"
                  label="Is Locked"
                  valuePropName="checked"
                >
                  <Switch
                    checkedChildren="Locked"
                    unCheckedChildren="Unlocked"
                  />
                </Form.Item>
              </Col> */}

                    {/* <Col xs={24} md={8}>
                <Form.Item
                  name="archived"
                  label="Archived"
                  valuePropName="checked"
                >
                  <Switch
                    checkedChildren="Archived"
                    unCheckedChildren="Active"
                  />
                </Form.Item>
              </Col> */}
                  </Row>
                </Card>

           {/* COMMUNICATION, FOLLOWUPS & SITE VISIT */}
           {/* <Card
            size="small"
            style={{
              marginBottom: 10,
              borderRadius: 14,
              border: "1px solid #f0f0f0",
              background: "rgba(255,255,255,0.96)",
            }}
            bodyStyle={{ padding: 12 }}
            title={
              <Space>
                <FieldTimeOutlined style={{ color: "#722ed1" }} />
                <span>Communication, Follow-ups & Site Visit</span>
              </Space>
            }
          >
            <Row gutter={12}>
              <Col xs={24} md={12}>
                <Form.Item name="message" label="Lead Message / Notes">
                  <Input.TextArea
                    rows={3}
                    placeholder="Enquiry message from portal / website"
                  />
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item name="timeline" label="Timeline Notes">
                  <Input.TextArea
                    rows={3}
                    placeholder="Any timeline / urgency details"
                  />
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item
                  name="preferred_contact_time"
                  label="Preferred Contact Time"
                >
                  <Input placeholder="e.g. Evenings, Weekends, 4–6 PM" />
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item name="callback_time" label="Callback Time">
                  <Input placeholder="Specific callback time if given" />
                </Form.Item>
              </Col>

              <Col xs={24} md={8}>
                <Form.Item
                  name="site_visit_requested"
                  label="Site Visit Requested"
                  valuePropName="checked"
                >
                  <Switch checkedChildren="Yes" unCheckedChildren="No" />
                </Form.Item>
              </Col>

              <Col xs={24} md={8}>
                <Form.Item name="site_visit_date" label="Site Visit Date">
                  <Input placeholder="e.g. 2025-12-10" />
                </Form.Item>
              </Col>

              <Col xs={24} md={8}>
                <Form.Item name="site_visit_time" label="Site Visit Time">
                  <Input placeholder="e.g. 4:00 PM" />
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item name="documents_shared" label="Documents Shared">
                  <Input.TextArea
                    rows={2}
                    placeholder="Brochures, floor plans, cost sheets etc."
                  />
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item
                  name="whatsapp_opt_in"
                  label="WhatsApp Opt-in"
                  valuePropName="checked"
                >
                  <Switch checkedChildren="Opted-in" unCheckedChildren="No" />
                </Form.Item>
              </Col>
            </Row>
          </Card> */}
              </>
            )}

            {/* ACTIONS */}
            <Row gutter={8} justify="end" style={{ marginTop: 8 }}>
              {step === 2 && (
                <Col xs={8} md={6}>
                  <Button block onClick={handleBack} style={{ borderRadius: 999 }}>
                    Back
                  </Button>
                </Col>
              )}

              <Col xs={8} md={6}>
                <Button block onClick={handleCancel}  style={{ borderRadius: 999 }}>Cancel</Button>
              </Col>

              {step === 1 && isEdit && acc?.editAccess && (
                <Col xs={8} md={6}>
                  <Button type="primary" block style={{ borderRadius: 999 }} onClick={handleNext} disabled={isLeadSaving}>Update</Button>
                </Col>
              )}

              {step === 1 && !isEdit && acc?.addAccess && (
                <Col xs={8} md={6}>
                  <Button type="primary" block style={{ borderRadius: 999 }} onClick={handleNext} disabled={isLeadSaving}>{acc.assignAccess ? "Next" : "Create"} </Button>
                </Col>
              )}

              {step === 1 && isEdit && acc?.assignAccess && (
                <Col xs={8} md={6}>
                  <Button onClick={() => setStep(2)} type="primary" block style={{ borderRadius: 999 }}>Go to Next</Button>
                </Col>
              )}

              {step === 2 && (
                <Col xs={8} md={6}>
                  <Button type="primary" htmlType="submit" block style={{ borderRadius: 999 }}>
                    {step === 1 ? isEdit ? "Save Changes" : "Create Lead" : "Assign Lead"}
                  </Button>
                </Col>
              )}
            </Row>

          </Spin>
        </Form>
      </div>
    </Modal>
  );
}
