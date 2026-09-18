import { parseAsString, useQueryState, useQueryStates } from "nuqs";
import { getSortingStateParser } from "../../../utils/parsers";
import { useState, useEffect, useMemo } from "react";
import {Alert, Avatar, Badge, Button, Card, Col, Form, Input, Modal, Popconfirm, Row, Space,  Switch, Table, Tag, Tooltip, Typography, Divider, Flex, Select, InputNumber,  Radio, Upload, Image, Descriptions, Tabs, Segmented, DatePicker, Statistic, Progress} from "antd";
import { 
  DeleteOutlined, EditOutlined, PlusOutlined, HomeOutlined, ReloadOutlined, 
  CloseSquareFilled, EyeOutlined, UploadOutlined, CheckCircleOutlined,
  DollarOutlined, AreaChartOutlined, EnvironmentOutlined,
  CameraOutlined, PaperClipOutlined, StarOutlined, PhoneOutlined, MailOutlined,
  HeartOutlined, ShareAltOutlined, LockOutlined, CalendarOutlined,
  BankOutlined, CarOutlined, WifiOutlined, SwitcherOutlined, FilterOutlined
} from "@ant-design/icons";
import util from "../../../utils/util";
import MyPagination from "../../components/Pagination";
import PropertyFilters from "./PropertyFilters";
import { BuildingOutlined } from "../../components/svgIcons";

const { Text, Title } = Typography;
const { TextArea } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;
const { TabPane } = Tabs;
const allowURLStateUpdate = true;

// Updated dummy data with more realistic properties
const initialProperties = [
  {
    id: "PROP-001",
    images: [
      "https://images.unsplash.com/photo-1560185127-6ed189bf02f4",
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2",
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00"
    ],
    unitCode: "A-1204",
    projectName: "Skyline Heights",
    builderName: "Prestige Group",
    tower: "Tower A",
    unitNo: "1204",
    propertyType: "Apartment",
    configuration: "3 BHK",
    superArea: 1850,
    carpetArea: 1350,
    floor: 12,
    totalFloors: 24,
    facing: "East",
    basePrice: 12500000,
    allInclusivePrice: 13800000,
    pricePerSqFt: 7400,
    maintenanceCharges: 3500,
    bookingAmount: 500000,
    status: "available", // available, booked, sold, reserved, blocked
    bookingStatus: null,
    bookingRef: null,
    branch: "Noida",
    city: "Noida",
    address: "Sector 150, Noida Expressway",
    furnishing: "Semi-Furnished",
    possessionDate: "2024-12-31",
    amenities: ["Swimming Pool", "Gym", "Club House", "Park", "Security"],
    features: ["Corner Unit", "Park Facing", "Premium Floor"],
    tags: ["Premium", "Corner", "High Floor"],
    documents: ["title_deed.pdf", "floor_plan.pdf"],
    created_by: "Admin User",
    created_at: "2024-11-12",
    updated_at: "2025-01-05",
    views: 245,
    inquiries: 18,
    isFeatured: true,
    priority: 1,
    virtualTour: "https://tour.example.com/prop-001"
  },
  {
    id: "PROP-002",
    images: ["https://images.unsplash.com/photo-1570129477492-45c003edd2be"],
    unitCode: "B-905",
    projectName: "Emerald Residency",
    builderName: "DLF Limited",
    tower: "Tower B",
    unitNo: "905",
    propertyType: "Apartment",
    configuration: "2 BHK",
    superArea: 1320,
    carpetArea: 980,
    floor: 9,
    totalFloors: 20,
    facing: "North",
    basePrice: 8500000,
    allInclusivePrice: 9200000,
    pricePerSqFt: 6900,
    maintenanceCharges: 2800,
    bookingAmount: 300000,
    status: "booked",
    bookingStatus: "advance_paid",
    bookingRef: "BK-77321",
    branch: "Gurgaon",
    city: "Gurgaon",
    address: "Sector 56, Gurgaon",
    furnishing: "Unfurnished",
    possessionDate: "2024-10-31",
    amenities: ["Gym", "Park", "Security"],
    features: ["Garden View", "Balcony"],
    tags: ["Economical", "Ready to Move"],
    created_by: "Agent 1",
    created_at: "2024-10-01",
    updated_at: "2025-01-12",
    views: 189,
    inquiries: 12,
    isFeatured: false,
    priority: 2
  },
  {
    id: "PROP-003",
    images: ["https://images.unsplash.com/photo-1598928506311-c55ded91a20c"],
    unitCode: "C-1801",
    projectName: "Palm Meadows",
    builderName: "Sobha Limited",
    tower: "Tower C",
    unitNo: "1801",
    propertyType: "Penthouse",
    configuration: "4 BHK",
    superArea: 3200,
    carpetArea: 2450,
    floor: 18,
    totalFloors: 20,
    facing: "West",
    basePrice: 31000000,
    allInclusivePrice: 34500000,
    pricePerSqFt: 9700,
    maintenanceCharges: 7500,
    bookingAmount: 1500000,
    status: "sold",
    bookingStatus: "registration_complete",
    bookingRef: "BK-55382",
    branch: "Bangalore",
    city: "Bangalore",
    address: "Whitefield, Bangalore",
    furnishing: "Fully Furnished",
    possessionDate: "2024-08-31",
    amenities: ["Swimming Pool", "Gym", "Club House", "Theater", "Spa"],
    features: ["Duplex", "Private Terrace", "Jacuzzi"],
    tags: ["Luxury", "Penthouse", "Duplex"],
    created_by: "Admin User",
    created_at: "2024-08-20",
    updated_at: "2024-12-28",
    views: 320,
    inquiries: 25,
    isFeatured: true,
    priority: 1
  },
  // Add more properties as needed
];

const propertyTypes = [
  "Apartment", "Villa", "Penthouse", "Row House", "Studio", "Plot", 
  "Commercial Office", "Shop", "Showroom", "Warehouse", "Industrial"
];

const configurations = ["1 BHK", "2 BHK", "3 BHK", "4 BHK", "5 BHK", "Studio"];
const facingOptions = ["North", "South", "East", "West", "North-East", "North-West", "South-East", "South-West"];
const furnishingOptions = ["Unfurnished", "Semi-Furnished", "Fully Furnished"];

const statusOptions = [
  { label: "Available", value: "available", color: "green" },
  { label: "Booked", value: "booked", color: "blue" },
  { label: "Sold", value: "sold", color: "red" },
  { label: "Reserved", value: "reserved", color: "orange" },
  { label: "Blocked", value: "blocked", color: "gray" }
];

const bookingStatusOptions = [
  "advance_paid", "agreement_done", "registration_pending", 
  "registration_complete", "possession_handover", "cancelled"
];

const Properties = () => {
  const DEFAULT_NUQS_CONFIG = {
    throttleMs: !allowURLStateUpdate ? Infinity : 0,
  };

  /* ---------------- QUERY STATES ---------------- */
  const sorting_cols = ["projectName", "unitNo", "city", "branch", "price", "created_at"];
  const [sort, setSort] = useQueryState("sort", getSortingStateParser(sorting_cols).withDefault([{ column: "created_at", desc: 1 }]).withOptions(DEFAULT_NUQS_CONFIG));

  const [search, setSearch] = useQueryStates(
    { key: parseAsString.withDefault("") },
    { urlKeys: { key: "search_term" }, ...DEFAULT_NUQS_CONFIG }
  );

  /* ---------------- LOCAL STATES ---------------- */
  const [properties, setProperties] = useState(initialProperties);
  const [filteredProperties, setFilteredProperties] = useState(initialProperties);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [viewMode, setViewMode] = useState("list");
  const [filters, setFilters] = useState({
    propertyType: null,
    configuration: null,
    city: null,
    status: null,
    minPrice: null,
    maxPrice: null,
    furnishing: null
  });
  const [showFilters, setShowFilters] = useState(false);
  const [viewDetails, setViewDetails] = useState(null);

  const qData = { page: 1, limit: 10, total: filteredProperties.length };

  /* ---------------- FILTER PROPERTIES ---------------- */
  useEffect(() => {
    let result = properties;
    
    // Search filter
    if (search.key) {
      const searchLower = search.key.toLowerCase();
      result = result.filter(prop =>
        prop.projectName.toLowerCase().includes(searchLower) ||
        prop.unitCode.toLowerCase().includes(searchLower) ||
        prop.city.toLowerCase().includes(searchLower) ||
        prop.branch.toLowerCase().includes(searchLower) ||
        prop.builderName?.toLowerCase().includes(searchLower)
      );
    }

    // Apply other filters
    if (filters.propertyType) {
      result = result.filter(prop => prop.propertyType === filters.propertyType);
    }
    if (filters.configuration) {
      result = result.filter(prop => prop.configuration === filters.configuration);
    }
    if (filters.city) {
      result = result.filter(prop => prop.city === filters.city);
    }
    if (filters.status) {
      result = result.filter(prop => prop.status === filters.status);
    }
    if (filters.minPrice) {
      result = result.filter(prop => prop.allInclusivePrice >= filters.minPrice);
    }
    if (filters.maxPrice) {
      result = result.filter(prop => prop.allInclusivePrice <= filters.maxPrice);
    }
    if (filters.furnishing) {
      result = result.filter(prop => prop.furnishing === filters.furnishing);
    }

    setFilteredProperties(result);
    qData.total = result.length;
  }, [properties, search, filters]);

  /* ---------------- CRUD OPERATIONS ---------------- */
  const handleAddProperty = (values) => {
    const newProperty = {
      id: `PROP-${String(properties.length + 1).padStart(3, '0')}`,
      ...values,
      created_at: new Date().toISOString().split('T')[0],
      updated_at: new Date().toISOString().split('T')[0],
      created_by: "Current User",
      views: 0,
      inquiries: 0,
      images: values.images || [],
      amenities: values.amenities || [],
      features: values.features || [],
      tags: values.tags || [],
      documents: values.documents || []
    };
    
    setProperties([newProperty, ...properties]);
    setIsModalOpen(false);
  };

  const handleEditProperty = (values) => {
    setProperties(prev => prev.map(prop =>  prop.id === selectedId  ? { ...prop, ...values, updated_at: new Date().toISOString().split('T')[0] } : prop));
    setIsModalOpen(false);
    setSelectedId(null);
  };

  const handleDeleteProperty = (id) => {
    setProperties(prev => prev.filter(prop => prop.id !== id));
  };

  const handleStatusToggle = (id, status) => {
    setProperties(prev => prev.map(prop => prop.id === id ? { ...prop, status } : prop));
  };

  const handleViewDetails = (property) => {
    setViewDetails(property);
  };

  /* ---------------- STATS ---------------- */
  const stats = useMemo(() => {
    const total = properties.length;
    const available = properties.filter(p => p.status === 'available').length;
    const booked = properties.filter(p => p.status === 'booked').length;
    const sold = properties.filter(p => p.status === 'sold').length;
    const totalValue = properties.reduce((sum, p) => sum + p.allInclusivePrice, 0);
    
    return { total, available, booked, sold, totalValue };
  }, [properties]);

  /* ---------------- TABLE COLUMNS ---------------- */
  const columns = [
    {
      title: "S. No.",
      align: "center",
      width: 70,
      fixed: "left",
      render: (_, __, index) => (qData.page - 1) * qData.limit + index + 1,
    },
    {
      title: "Image",
      dataIndex: "images",
      align: "center",
      width: 90,
      render: (images) => (
        <Avatar 
          size={60} 
          shape="square"
          src={<img draggable={false} src={images?.[0]} alt="property" style={{width: '100%', height: '100%', objectFit: 'cover'}} />}
        />
      )
    },
    {
      title: "Property Details",
      render: (_, record) => (
        <Space direction="vertical" size={2}>
          <Text strong style={{ fontSize: 14 }}>{record.projectName}</Text>
          <Space size={4}>
            <Tag color="blue" style={{ margin: 0 }}>{record.unitCode}</Tag>
            <Tag color="default" style={{ margin: 0 }}>{record.configuration}</Tag>
            {record.isFeatured && <Tag color="gold" icon={<StarOutlined />}>Featured</Tag>}
          </Space>
          <Text type="secondary" style={{ fontSize: 12 }}>
            <BuildingOutlined /> {record.tower} • <AreaChartOutlined /> {record.superArea} sq.ft.
          </Text>
        </Space>
      ),
      width: 250
    },
    {
      title: "Location",
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Text>{record.city}</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>{record.branch} Branch</Text>
        </Space>
      ),
      align: "center",
      width: 120
    },
    {
      title: "Pricing",
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Text strong style={{ color: "#1890ff" }}> ₹{record.allInclusivePrice}</Text>
          <Text type="secondary" style={{ fontSize: 12 }}> ₹{record.pricePerSqFt}/sq.ft</Text>
        </Space>
      ),
      align: "center",
      width: 140
    },
    {
      title: "Status",
      dataIndex: "status",
      align: "center",
      width: 120,
      render: (status) => {
        const statusInfo = statusOptions.find(s => s.value === status);
        return (
          <Badge color={statusInfo?.color}  text={statusInfo?.label} style={{ textTransform: 'capitalize' }} />
        );
      }
    },
    {
      title: "Actions",
      align: "center",
      width: 180,
      fixed: "right",
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="View Details">
            <Button size="small" type="text" icon={<EyeOutlined />} onClick={() => handleViewDetails(record)}/>
          </Tooltip>
          
          <Tooltip title="Edit Property">
            <Button  size="small"  type="text"  icon={<EditOutlined />} 
              onClick={() => {
                setSelectedId(record.id);
                setIsModalOpen(true);
              }}
            />
          </Tooltip>

          <Tooltip title="Change Status">
            <Select size="small" style={{ width: 100 }} value={record.status} onChange={(value) => handleStatusToggle(record.id, value)}
              options={statusOptions?.map(opt => ({ label: opt.label, value: opt.value }))}
            />
          </Tooltip>

          <Popconfirm title="Delete this property?" description="This action cannot be undone." onConfirm={() => handleDeleteProperty(record.id)}
            okText="Yes" cancelText="No"
          >
            <Tooltip title="Delete Property">
              <Button size="small" type="text" danger icon={<DeleteOutlined />} />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  /* ---------------- RENDER ---------------- */
  return (
    <div>
      {/* STATS CARDS */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={6}>
          <Card size="small">
            <Statistic title="Total Properties" value={stats.total} prefix={<HomeOutlined style={{ color: '#1890ff' }} />} valueStyle={{ color: '#1890ff' }} />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card size="small">
            <Statistic title="Available" value={stats.available} prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />} valueStyle={{ color: '#52c41a' }}/>
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card size="small">
            <Statistic title="Booked" value={stats.booked} prefix={<CalendarOutlined style={{ color: '#1890ff' }} />} valueStyle={{ color: '#1890ff' }} />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card size="small">
            <Statistic title="Total Value" value={stats.totalValue} prefix={<DollarOutlined style={{ color: '#722ed1' }} />} valueStyle={{ color: '#722ed1' }} formatter={value => `₹${value}`} />
          </Card>
        </Col>
      </Row>

      <Card
        size="small"
        bordered={false}
        className="card-style"
        styles={{
          header: { borderBottom: "none", padding: "18px 22px 6px" },
          body: { padding: "8px 22px 18px" },
        }}
        title={
          <Space align="center">
            <div style={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #1890ff 0%, #36cfc9 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}>
              <BuildingOutlined style={{ fontSize: 20, color: "#fff" }} />
            </div>
            <Space direction="vertical" size={0}>
              <Title level={4} style={{ margin: 0 }}>Property Management</Title>
              <Text type="secondary" style={{ fontSize: 12 }}>
                Manage inventory, pricing, and availability • {stats.available} properties available
              </Text>
            </Space>
          </Space>
        }
        extra={
          <Space align="center">

            <Tooltip title="Filters">
              <Button icon={<FilterOutlined />} onClick={() => setShowFilters(!showFilters)}type={showFilters ? "primary" : "default"} />
            </Tooltip>

            <Tooltip title="Refresh">
              <Button icon={<ReloadOutlined />} />
            </Tooltip>

            <Button type="primary" icon={<PlusOutlined />}
              onClick={() => {
                setSelectedId(null);
                setIsModalOpen(true);
              }}
            >
              Add Property
            </Button>
          </Space>
        }
      >
        {/* FILTERS */}
        {showFilters && (
          <Card size="small" style={{ marginBottom: 16, borderRadius: 12 }}>
            <PropertyFilters filters={filters} setFilters={setFilters} />
          </Card>
        )}

        {/* SEARCH BAR */}
        <Card
          size="small"
          bordered={false}
          style={{
            marginBottom: 16,
            borderRadius: 12,
            background:"linear-gradient(90deg, rgba(240,245,255,0.9), rgba(255,255,255,0.95))",
            border: "1px solid #f0f2ff",
          }}
        >
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} md={16}>
              <Input
                size="large"
                placeholder="Search by project name, unit code, builder, location..."
                value={search.key}
                onChange={(e) => setSearch({ key: e.target.value })}
                allowClear
                prefix={<HomeOutlined style={{ color: '#bfbfbf' }} />}
                style={{
                  borderRadius: 8,
                  boxShadow: "0 4px 10px rgba(15,23,42,0.06)",
                }}
              />
            </Col>
            <Col xs={24} md={8}>
              <Space>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Showing {filteredProperties.length} of {properties.length} properties
                </Text>
              </Space>
            </Col>
          </Row>
        </Card>

        {/* PROPERTY TABLE/GRID */}
        {viewMode === 'list' ? (
          <>
            <Table
              pagination={false}
              columns={columns}
              dataSource={filteredProperties?.map(v => ({ ...v, key: v.id }))}
              scroll={{ y: util.getTableHeight(), x: 'max-content' }}
              style={{
                borderRadius: 12,
                overflow: "hidden",
                background: "rgba(255,255,255,0.98)",
              }}
              rowClassName={(_, index) => index % 2 === 0 ? "table-row-light" : "table-row-dark"}
            />
            
            <Divider style={{ margin: "14px 0 8px" }} />
            <MyPagination {...{ qData }} total={qData.total} />
          </>
        ) : (
          // Grid View
          <Row gutter={[16, 16]}>
            {filteredProperties?.map(property => (
              <Col xs={24} sm={12} md={8} lg={6} key={property.id}>
                <PropertyCard 
                  property={property} 
                  onEdit={() => {
                    setSelectedId(property.id);
                    setIsModalOpen(true);
                  }}
                  onView={() => handleViewDetails(property)}
                  onDelete={() => handleDeleteProperty(property.id)}
                />
              </Col>
            ))}
          </Row>
        )}
      </Card>

      {/* ADD/EDIT MODAL */}
      <PropertyModal
        open={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedId(null);
        }}
        property={properties.find(p => p.id === selectedId)}
        onSave={selectedId ? handleEditProperty : handleAddProperty}
      />

      {/* VIEW DETAILS MODAL */}
      {viewDetails && (
        <PropertyDetailsModal
          property={viewDetails}
          onClose={() => setViewDetails(null)}
          onEdit={() => {
            setSelectedId(viewDetails.id);
            setIsModalOpen(true);
            setViewDetails(null);
          }}
        />
      )}
    </div>
  );
};

/* ---------------- PROPERTY CARD COMPONENT ---------------- */
const PropertyCard = ({ property, onEdit, onView, onDelete }) => {
  const statusInfo = statusOptions.find(s => s.value === property.status);
  
  return (
    <Card
      hoverable
      cover={
        <div style={{ position: 'relative', height: 180, overflow: 'hidden' }}>
          <img alt="property" src={property.images?.[0]} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          <Badge count={statusInfo?.label}
            style={{backgroundColor: statusInfo?.color, position: 'absolute', top: 12, left: 12}}
          />
          {property.isFeatured && (
            <div style={{
              position: 'absolute',
              top: 12,
              right: 12,
              background: 'rgba(255,215,0,0.9)',
              padding: '2px 8px',
              borderRadius: 4,
              fontSize: 12
            }}>
              <StarOutlined /> Featured
            </div>
          )}
        </div>
      }
      actions={[
        <Tooltip title="View Details">
          <EyeOutlined onClick={onView} />
        </Tooltip>,
        <Tooltip title="Edit">
          <EditOutlined onClick={onEdit} />
        </Tooltip>,
        <Popconfirm title="Delete this property?" onConfirm={onDelete}>
          <Tooltip title="Delete">
            <DeleteOutlined />
          </Tooltip>
        </Popconfirm>,
      ]}
    >
      <Card.Meta
        title={
          <Space direction="vertical" size={2} style={{ width: '100%' }}>
            <Text strong ellipsis>{property.projectName}</Text>
            <Space>
              <Tag color="blue" style={{ margin: 0 }}>{property.unitCode}</Tag>
              <Tag color="default" style={{ margin: 0 }}>{property.configuration}</Tag>
            </Space>
          </Space>
        }
        description={
          <Space direction="vertical" size={4} style={{ width: '100%' }}>
            <Text type="secondary" ellipsis>
              <EnvironmentOutlined /> {property.city}
            </Text>
            <Text strong style={{ color: '#1890ff', fontSize: 16 }}>
              ₹{property.allInclusivePrice}
            </Text>
            <Space split={<Divider type="vertical" />}>
              <Text type="secondary" style={{ fontSize: 12 }}>
                <AreaChartOutlined /> {property.superArea} sq.ft
              </Text>
              <Text type="secondary" style={{ fontSize: 12 }}>
                ₹{property.pricePerSqFt}/sq.ft
              </Text>
            </Space>
          </Space>
        }
      />
    </Card>
  );
};

/* ---------------- PROPERTY MODAL COMPONENT ---------------- */
const PropertyModal = ({ open, onClose, property, onSave }) => {
  const [form] = Form.useForm();
  const [activeTab, setActiveTab] = useState("basic");

  useEffect(() => {
    if (property && open) {
      form.setFieldsValue({
        ...property,
        possessionDate: property.possessionDate ? dayjs(property.possessionDate) : null
      });
    } else {
      form.resetFields();
    }
  }, [property, open, form]);

  const handleFinish = (values) => {
    onSave(values);
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      width={800}
      footer={null}
      title={
        <Space>
          <HomeOutlined />
          <Text strong>{property ? 'Edit Property' : 'Add New Property'}</Text>
        </Space>
      }
    >
      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane tab="Basic Info" key="basic">
          <Form form={form} layout="vertical" onFinish={handleFinish}>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="projectName" label="Project Name" rules={[{ required: true }]}>
                  <Input />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="builderName" label="Builder Name">
                  <Input />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={8}>
                <Form.Item name="propertyType" label="Property Type">
                  <Select options={propertyTypes?.map(type => ({ label: type, value: type }))} />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="configuration" label="Configuration">
                  <Select options={configurations?.map(config => ({ label: config, value: config }))} />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="furnishing" label="Furnishing">
                  <Select options={furnishingOptions?.map(opt => ({ label: opt, value: opt }))} />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={6}>
                <Form.Item name="unitCode" label="Unit Code">
                  <Input />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item name="tower" label="Tower/Block">
                  <Input />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item name="unitNo" label="Unit Number">
                  <Input />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item name="floor" label="Floor">
                  <InputNumber style={{ width: '100%' }} />
                </Form.Item>
              </Col>
            </Row>

            <Button type="primary" onClick={() => setActiveTab("location")}>Next: Location & Pricing</Button>
          </Form>
        </TabPane>

        <TabPane tab="Location & Pricing" key="location">
          {/* Add location and pricing fields */}
          <Button onClick={() => setActiveTab("basic")}>Previous</Button>
          <Button type="primary" onClick={() => setActiveTab("amenities")}>Next: Amenities</Button>
        </TabPane>

        <TabPane tab="Amenities & Images" key="amenities">
          {/* Add amenities and image upload */}
          <Button onClick={() => setActiveTab("location")}>Previous</Button>
          <Button type="primary" htmlType="submit">Save Property</Button>
        </TabPane>
      </Tabs>
    </Modal>
  );
};

/* ---------------- PROPERTY DETAILS MODAL ---------------- */
const PropertyDetailsModal = ({ property, onClose, onEdit }) => {
  return (
    <Modal
      open={true}
      onCancel={onClose}
      width={900}
      footer={null}
      title={
        <Space>
          <HomeOutlined />
          <Text strong>Property Details: {property.unitCode}</Text>
        </Space>
      }
    >
      <Tabs defaultActiveKey="overview">
        <TabPane tab="Overview" key="overview">
          <Row gutter={[24, 24]}>
            <Col span={16}>
              <Image.PreviewGroup>
                <Image width="100%" src={property.images?.[0]} style={{ borderRadius: 8 }}/>
                <Row gutter={[8, 8]} style={{ marginTop: 8 }}>
                  {property.images?.slice(1).map((img, idx) => (
                    <Col span={6} key={idx}>
                      <Image src={img} style={{ borderRadius: 4 }} />
                    </Col>
                  ))}
                </Row>
              </Image.PreviewGroup>
            </Col>
            <Col span={8}>
              <Descriptions column={1} bordered size="small">
                <Descriptions.Item label="Project">{property.projectName}</Descriptions.Item>
                <Descriptions.Item label="Builder">{property.builderName}</Descriptions.Item>
                <Descriptions.Item label="Configuration">{property.configuration}</Descriptions.Item>
                <Descriptions.Item label="Area">{property.superArea} sq.ft</Descriptions.Item>
                <Descriptions.Item label="Price">₹{property.allInclusivePrice}</Descriptions.Item>
                <Descriptions.Item label="Status">
                  <Tag color={statusOptions.find(s => s.value === property.status)?.color}>{statusOptions.find(s => s.value === property.status)?.label}</Tag>
                </Descriptions.Item>
              </Descriptions>
            </Col>
          </Row>
        </TabPane>
        
        <TabPane tab="Financials" key="financials">
          {/* Financial details */}
        </TabPane>
        
        <TabPane tab="Documents" key="documents">
          {/* Documents list */}
        </TabPane>
      </Tabs>
      
      <Divider />
      <Space>
        <Button onClick={onClose}>Close</Button>
        <Button type="primary" onClick={onEdit}>Edit Property</Button>
      </Space>
    </Modal>
  );
};

export default Properties;