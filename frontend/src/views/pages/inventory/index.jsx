import {parseAsString,useQueryState,useQueryStates,} from "nuqs";
import { getSortingStateParser } from "../../../utils/parsers";
import { useState, useEffect, useMemo } from "react";
import {Avatar, Button, Card, Col, DatePicker, Form, Input, InputNumber, Modal, Popconfirm, Row, Select, Space, Switch, Table, Tag, Typography, Upload, message, Descriptions, Divider, Tooltip} from "antd";
import {DeleteOutlined, EditOutlined, PlusOutlined, EyeOutlined, UploadOutlined, HomeOutlined, EnvironmentOutlined, DollarOutlined, AreaChartOutlined, CarOutlined, CalendarOutlined, CheckCircleOutlined, ClockCircleOutlined,} from "@ant-design/icons";
import util from "../../../utils/util";
import MyPagination from "../../components/Pagination";
import dayjs from "dayjs";
import { BathOutlined } from "../../components/svgIcons";

const { Text, Title } = Typography;
const { TextArea } = Input;
const { Option } = Select;
const allowURLStateUpdate = true;

/* ───────── DUMMY PROPERTY DATA ───────── */
const dummyProperties = [
  {
    id: "PROP-001",
    propertyId: "NH-2024-001",
    name: "Luxury Villa",
    type: "Villa",
    category: "Residential",
    status: "Available",
    price: 25000000,
    currency: "INR",
    size: 4500,
    unit: "sqft",
    bedrooms: 4,
    bathrooms: 3,
    parking: 2,
    yearBuilt: 2022,
    location: "Sector 150, Noida",
    city: "Noida",
    state: "Uttar Pradesh",
    pincode: "201301",
    developer: "NextHikes Realty",
    project: "NextHikes Luxuria",
    description: "Spacious villa with modern amenities, garden, and swimming pool",
    amenities: ["Swimming Pool", "Gym", "Club House", "24x7 Security", "Park"],
    images: [
      "https://images.unsplash.com/photo-1613490493576-7fde63acd811",
      "https://images.unsplash.com/photo-1518780664697-55e3ad937233",
    ],
    ownerName: "Rajesh Kumar",
    ownerContact: "9876543210",
    ownerEmail: "rajesh@example.com",
    listedDate: "2024-01-15",
    lastUpdated: "2024-01-20",
    isFeatured: true,
    isVerified: true,
    commission: 2.5,
    documents: ["title_deed.pdf", "approval_certificate.pdf"],
    notes: "Prime location with good connectivity",
  },
  {
    id: "PROP-002",
    propertyId: "NH-2024-002",
    name: "Commercial Office Space",
    type: "Office",
    category: "Commercial",
    status: "Sold",
    price: 50000000,
    currency: "INR",
    size: 12000,
    unit: "sqft",
    bedrooms: 0,
    bathrooms: 8,
    parking: 20,
    yearBuilt: 2020,
    location: "MG Road, Gurgaon",
    city: "Gurgaon",
    state: "Haryana",
    pincode: "122002",
    developer: "NextHikes Commercial",
    project: "NextHikes Business Hub",
    description: "Premium office space in central business district",
    amenities: ["Lift", "Parking", "Security", "Conference Room", "Cafeteria"],
    images: [
      "https://images.unsplash.com/photo-1497366754035-f200968a6e72",
      "https://images.unsplash.com/photo-1497366216548-37526070297c",
    ],
    ownerName: "Neha Verma",
    ownerContact: "9812345678",
    ownerEmail: "neha@example.com",
    listedDate: "2024-01-10",
    lastUpdated: "2024-01-25",
    isFeatured: false,
    isVerified: true,
    commission: 3.0,
    documents: ["completion_certificate.pdf"],
    notes: "Ready for immediate possession",
  },
  {
    id: "PROP-003",
    propertyId: "NH-2024-003",
    name: "3 BHK Apartment",
    type: "Apartment",
    category: "Residential",
    status: "Rented",
    price: 8500000,
    currency: "INR",
    size: 1650,
    unit: "sqft",
    bedrooms: 3,
    bathrooms: 2,
    parking: 1,
    yearBuilt: 2019,
    location: "Koregaon Park, Pune",
    city: "Pune",
    state: "Maharashtra",
    pincode: "411001",
    developer: "NextHikes Developers",
    project: "NextHikes Greenscape",
    description: "Well maintained apartment with city view",
    amenities: ["Gym", "Play Area", "Security", "Power Backup"],
    images: [
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00",
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750",
    ],
    ownerName: "Amit Singh",
    ownerContact: "9998877665",
    ownerEmail: "amit@example.com",
    listedDate: "2024-01-05",
    lastUpdated: "2024-01-18",
    isFeatured: true,
    isVerified: false,
    commission: 2.0,
    documents: ["sale_deed.pdf", "occupancy_certificate.pdf"],
    notes: "Tenant vacating next month",
  },
  {
    id: "PROP-004",
    propertyId: "NH-2024-004",
    name: "Retail Shop",
    type: "Shop",
    category: "Commercial",
    status: "Available",
    price: 15000000,
    currency: "INR",
    size: 1200,
    unit: "sqft",
    bedrooms: 0,
    bathrooms: 1,
    parking: 2,
    yearBuilt: 2021,
    location: "Connaught Place, Delhi",
    city: "Delhi",
    state: "Delhi",
    pincode: "110001",
    developer: "NextHikes Retail",
    project: "NextHikes Marketplace",
    description: "Corner shop in premium shopping complex",
    amenities: ["AC", "Parking", "Security", "Storage"],
    images: [
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2",
      "https://images.unsplash.com/photo-1504384308090-c894fdcc538d",
    ],
    ownerName: "Pooja Mehta",
    ownerContact: "9123456789",
    ownerEmail: "pooja@example.com",
    listedDate: "2024-01-22",
    lastUpdated: "2024-01-22",
    isFeatured: false,
    isVerified: true,
    commission: 2.5,
    documents: ["lease_agreement.pdf"],
    notes: "Suitable for fashion boutique or cafe",
  },
];

/* ───────────────── COMPONENT ───────────────── */
const PropertyInventory = () => {
  const DEFAULT_NUQS_CONFIG = {
    throttleMs: !allowURLStateUpdate ? Infinity : 0,
  };

  /* ───────── QUERY STATE ───────── */
  const sorting_cols = [
    "name",
    "propertyId",
    "type",
    "status",
    "price",
    "city",
    "listedDate",
  ];

  const [sort, setSort] = useQueryState(
    "sort",
    getSortingStateParser(sorting_cols)
      .withDefault([{ column: "listedDate", desc: 1 }])
      .withOptions(DEFAULT_NUQS_CONFIG)
  );

  const [search, setSearch] = useQueryStates(
    { 
      key: parseAsString.withDefault(""),
      type: parseAsString.withDefault(""),
      status: parseAsString.withDefault(""),
      city: parseAsString.withDefault(""),
    },
    { 
      urlKeys: { 
        key: "search_term",
        type: "property_type",
        status: "property_status",
        city: "city_filter",
      }, 
      ...DEFAULT_NUQS_CONFIG 
    }
  );

  /* ───────── LOCAL STATE ───────── */
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [selectedViewProperty, setSelectedViewProperty] = useState(null);
  const [categories] = useState(["Residential", "Commercial", "Industrial", "Agricultural"]);
  const [propertyTypes] = useState([
    "Apartment", "Villa", "Plot", "Office", "Shop", "Warehouse", "Factory", "Farmhouse"
  ]);
  const [statusOptions] = useState([
    "Available", "Sold", "Rented", "Under Agreement", "Under Maintenance", "Off Market"
  ]);

  const qData = {
    page: 1,
    limit: 10,
    total: dummyProperties.length,
  };

  /* ───────── FILTERED DATA ───────── */
  const filteredData = useMemo(() => {
    let filtered = [...dummyProperties];

    // Text search
    if (search.key) {
      const term = search.key.toLowerCase().trim();
      filtered = filtered.filter((property) =>
        [
          property.name,
          property.propertyId,
          property.location,
          property.city,
          property.description,
          property.ownerName,
        ]
          .join(" ")
          .toLowerCase()
          .includes(term)
      );
    }

    // Type filter
    if (search.type) {
      filtered = filtered.filter((property) => property.type === search.type);
    }

    // Status filter
    if (search.status) {
      filtered = filtered.filter((property) => property.status === search.status);
    }

    // City filter
    if (search.city) {
      filtered = filtered.filter((property) => property.city === search.city);
    }

    return filtered;
  }, [search]);

  /* ───────── HANDLERS ───────── */
  const handleEdit = (property) => {
    setSelectedProperty(property);
    setIsEditModalOpen(true);
  };

  const handleView = (property) => {
    setSelectedViewProperty(property);
    setIsViewModalOpen(true);
  };

  const handleDelete = (propertyId) => {
    message.success(`Property ${propertyId} deleted successfully`);
    // In real app: API call to delete
  };

  const handleStatusChange = (propertyId, newStatus) => {
    message.success(`Property status updated to ${newStatus}`);
    // In real app: API call to update status
  };

  const handleModalClose = () => {
    setSelectedProperty(null);
    setIsEditModalOpen(false);
  };

  const handleViewModalClose = () => {
    setSelectedViewProperty(null);
    setIsViewModalOpen(false);
  };

  const handleResetFilters = () => {
    setSearch({
      key: "",
      type: "",
      status: "",
      city: "",
    });
  };

  /* ───────── TABLE COLUMNS ───────── */
  const columns = [
    {
      title: "S. No.",
      width: 70,
      align: "center",
      fixed: "left",
      render: (_, __, index) => (qData.page - 1) * qData.limit + index + 1,
    },
    {
      title: "Property ID",
      dataIndex: "propertyId",
      width: 120,
      fixed: "left",
      render: (text, record) => (
        <Button 
          type="link" 
          onClick={() => handleView(record)}
          style={{ padding: 0 }}
        >
          <Text strong>{text}</Text>
        </Button>
      ),
    },
    {
      title: "Property",
      dataIndex: "name",
      width: 200,
      render: (text, record) => (
        <Space>
          <Avatar shape="square" src={record.images?.[0]} icon={<HomeOutlined />}size="large"/>
          <Space direction="vertical" size={0}>
            <Text strong>{text}</Text>
            <Text type="secondary" style={{ fontSize: 12 }}>{record.type} • {record.location}</Text>
          </Space>
        </Space>
      ),
    },
    {
      title: "Type",
      dataIndex: "type",
      width: 100,
      filters: propertyTypes.map(type => ({ text: type, value: type })),
      onFilter: (value, record) => record.type === value,
    },
    {
      title: "Category",
      dataIndex: "category",
      width: 100,
    },
    {
      title: "Price",
      dataIndex: "price",
      width: 120,
      render: (price, record) => (
        <Space>
          <DollarOutlined style={{ color: "#52c41a" }} />
          <Text strong>{new Intl.NumberFormat('en-IN', {style: 'currency',currency: record.currency,maximumFractionDigits: 0}).format(price)}</Text>
        </Space>
      ),
      sorter: true,
    },
    {
      title: "Size",
      dataIndex: "size",
      width: 100,
      render: (size, record) => `${size} ${record.unit}`,
    },
    {
      title: "Specs",
      width: 150,
      render: (_, record) => (
        <Space>
          <Tooltip title="Bedrooms">
            <Tag icon={<BathOutlined />} color="blue">{record.bedrooms}</Tag>
          </Tooltip>
          <Tooltip title="Bathrooms">
            <Tag icon={<BathOutlined />} color="cyan">{record.bathrooms}</Tag>
          </Tooltip>
          <Tooltip title="Parking">
            <Tag icon={<CarOutlined />} color="green">{record.parking}</Tag>
          </Tooltip>
        </Space>
      ),
    },
    {
      title: "Location",
      width: 150,
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Text>{record.city}</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {record.location}
          </Text>
        </Space>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      width: 120,
      render: (status) => {
        const statusConfig = {
          Available: { color: "green", icon: <CheckCircleOutlined /> },
          Sold: { color: "red", icon: <CheckCircleOutlined /> },
          Rented: { color: "blue", icon: <CheckCircleOutlined /> },
          "Under Agreement": { color: "orange", icon: <ClockCircleOutlined /> },
          "Under Maintenance": { color: "purple", icon: <ClockCircleOutlined /> },
          "Off Market": { color: "default", icon: <ClockCircleOutlined /> },
        };
        const config = statusConfig[status] || { color: "default", icon: null };
        return (
          <Tag color={config.color} icon={config.icon}>
            {status}
          </Tag>
        );
      },
      filters: statusOptions.map(status => ({ text: status, value: status })),
      onFilter: (value, record) => record.status === value,
    },
    {
      title: "Featured",
      dataIndex: "isFeatured",
      width: 90,
      align: "center",
      render: (isFeatured) => (
        <Tag color={isFeatured ? "gold" : "default"}>
          {isFeatured ? "Yes" : "No"}
        </Tag>
      ),
    },
    {
      title: "Verified",
      dataIndex: "isVerified",
      width: 90,
      align: "center",
      render: (isVerified) => (
        <Tag color={isVerified ? "green" : "default"}>
          {isVerified ? "Yes" : "No"}
        </Tag>
      ),
    },
    {
      title: "Actions",
      fixed: "right",
      width: 150,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="View Details">
            <Button
              size="small"
              type="text"
              icon={<EyeOutlined />}
              style={{ borderRadius: 999 }}
              onClick={() => handleView(record)}
            />
          </Tooltip>
          <Tooltip title="Edit">
            <Button
              size="small"
              type="text"
              icon={<EditOutlined />}
              style={{ borderRadius: 999 }}
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Tooltip title="Change Status">
            <Select
              size="small"
              style={{ width: 120 }}
              value={record.status}
              onChange={(value) => handleStatusChange(record.id, value)}
              dropdownMatchSelectWidth={false}
            >
              {statusOptions.map(status => (
                <Option key={status} value={status}>{status}</Option>
              ))}
            </Select>
          </Tooltip>
          <Tooltip title="Delete">
            <Popconfirm
              title="Delete this property?"
              description="This action cannot be undone."
              onConfirm={() => handleDelete(record.id)}
              okText="Yes"
              cancelText="No"
            >
              <Button
                size="small"
                type="text"
                danger
                icon={<DeleteOutlined />}
                style={{ borderRadius: 999 }}
              />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <>
      <Card
        size="small"
        bordered={false}
        title={
          <Space direction="vertical" size={0}>
            <Title level={4} style={{ margin: 0 }}>
              <HomeOutlined /> Property Inventory
            </Title>
            <Text type="secondary" style={{ fontSize: 12 }}>
              Manage and track all property listings
            </Text>
          </Space>
        }
        extra={
          <Space>
            <Button
              onClick={handleResetFilters}
              style={{ borderRadius: 999 }}
            >
              Reset Filters
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              style={{ borderRadius: 999 }}
              onClick={() => setIsEditModalOpen(true)}
            >
              Add Property
            </Button>
          </Space>
        }
      >
        {/* SEARCH AND FILTERS */}
        <Card size="small" style={{ marginBottom: 16 }}>
          <Row gutter={[12, 12]}>
            <Col xs={24} md={8}>
              <Input
                placeholder="Search by name, ID, location, owner..."
                value={search.key}
                onChange={(e) => setSearch({ key: e.target.value })}
                allowClear
                prefix={<HomeOutlined />}
              />
            </Col>
            <Col xs={12} md={4}>
              <Select
                placeholder="Type"
                style={{ width: "100%" }}
                value={search.type || undefined}
                onChange={(value) => setSearch({ type: value })}
                allowClear
              >
                {propertyTypes.map(type => (
                  <Option key={type} value={type}>{type}</Option>
                ))}
              </Select>
            </Col>
            <Col xs={12} md={4}>
              <Select
                placeholder="Status"
                style={{ width: "100%" }}
                value={search.status || undefined}
                onChange={(value) => setSearch({ status: value })}
                allowClear
              >
                {statusOptions.map(status => (
                  <Option key={status} value={status}>{status}</Option>
                ))}
              </Select>
            </Col>
            <Col xs={12} md={4}>
              <Select
                placeholder="City"
                style={{ width: "100%" }}
                value={search.city || undefined}
                onChange={(value) => setSearch({ city: value })}
                allowClear
              >
                {[...new Set(dummyProperties.map(p => p.city))].map(city => (
                  <Option key={city} value={city}>{city}</Option>
                ))}
              </Select>
            </Col>
            <Col xs={12} md={4}>
              <Button
                type="primary"
                block
                onClick={() => console.log("Advanced filter")}
                style={{ borderRadius: 999 }}
              >
                More Filters
              </Button>
            </Col>
          </Row>
        </Card>

        {/* STATS SUMMARY */}
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col xs={12} sm={6}>
            <Card size="small">
              <StatCard
                title="Total Properties"
                value={filteredData.length}
                color="#1890ff"
                icon={<HomeOutlined />}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card size="small">
              <StatCard
                title="Available"
                value={filteredData.filter(p => p.status === "Available").length}
                color="#52c41a"
                icon={<CheckCircleOutlined />}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card size="small">
              <StatCard
                title="Total Value"
                value={new Intl.NumberFormat('en-IN', {
                  style: 'currency',
                  currency: 'INR',
                  maximumFractionDigits: 0,
                }).format(filteredData.reduce((sum, p) => sum + p.price, 0))}
                color="#faad14"
                icon={<DollarOutlined />}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card size="small">
              <StatCard
                title="Featured"
                value={filteredData.filter(p => p.isFeatured).length}
                color="#722ed1"
                icon={<StarOutlined />}
              />
            </Card>
          </Col>
        </Row>

        {/* TABLE */}
        <Table
          pagination={false}
          size="middle"
          columns={columns}
          dataSource={filteredData.map((v) => ({ ...v, key: v.id }))}
          rowKey="id"
          scroll={{ x: 1500, y: util.getTableHeight() }}
          onChange={(_, __, sorter) =>
            util.handleTableSortingData(
              sorter,
              setSort,
              sort,
              () => {},
              qData
            )
          }
          summary={() => (
            <Table.Summary fixed>
              <Table.Summary.Row>
                <Table.Summary.Cell index={0} colSpan={4}>
                  <Text strong>Total Properties: {filteredData.length}</Text>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={4}>
                  <Text strong>
                    {new Intl.NumberFormat('en-IN', {
                      style: 'currency',
                      currency: 'INR',
                      maximumFractionDigits: 0,
                    }).format(filteredData.reduce((sum, p) => sum + p.price, 0))}
                  </Text>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={5} colSpan={7} />
              </Table.Summary.Row>
            </Table.Summary>
          )}
        />

        <MyPagination
          {...{ qData }}
          total={filteredData.length}
          DEFAULT_NUQS_CONFIG={DEFAULT_NUQS_CONFIG}
        />
      </Card>

      {/* EDIT/ADD MODAL */}
      <Modal
        open={isEditModalOpen}
        onCancel={handleModalClose}
        footer={null}
        destroyOnClose
        width={800}
        title={
          <Title level={4} style={{ margin: 0 }}>
            {selectedProperty ? "Edit Property" : "Add New Property"}
          </Title>
        }
      >
        <PropertyForm
          initialData={selectedProperty}
          onSave={handleModalClose}
          categories={categories}
          propertyTypes={propertyTypes}
          statusOptions={statusOptions}
        />
      </Modal>

      {/* VIEW MODAL */}
      <Modal
        open={isViewModalOpen}
        onCancel={handleViewModalClose}
        footer={null}
        destroyOnClose
        width={900}
        title={
          <Space>
            <HomeOutlined />
            <Title level={4} style={{ margin: 0 }}>
              Property Details
            </Title>
          </Space>
        }
      >
        {selectedViewProperty && <PropertyDetails property={selectedViewProperty} />}
      </Modal>
    </>
  );
};

export default PropertyInventory;

/* ───────── STAT CARD COMPONENT ───────── */
function StatCard({ title, value, color, icon }) {
  return (
    <Space direction="vertical" size={2} style={{ width: "100%" }}>
      <Text type="secondary" style={{ fontSize: 12 }}>{title}</Text>
      <Space>
        {icon && <span style={{ color, fontSize: 16 }}>{icon}</span>}
        <Title level={3} style={{ margin: 0, color }}> {value}</Title>
      </Space>
    </Space>
  );
}

/* ───────── PROPERTY DETAILS COMPONENT ───────── */
function PropertyDetails({ property }) {
  return (
    <div>
      <Row gutter={24}>
        <Col xs={24} md={12}>
          <Card cover={<img alt={property.name} src={property.images?.[0]} style={{ height: 200, objectFit: "cover" }}/>}>
            <Space direction="vertical" style={{ width: "100%" }}>
              <Title level={4}>{property.name}</Title>
              <Text type="secondary">{property.description}</Text>
            </Space>
          </Card>

          <Card title="Amenities" size="small" style={{ marginTop: 16 }}>
            <Space wrap>
              {property.amenities?.map((amenity, index) => (
                <Tag key={index} color="blue">{amenity}</Tag>
              ))}
            </Space>
          </Card>
        </Col>

        <Col xs={24} md={12}>
          <Descriptions column={1} bordered size="small" labelStyle={{ fontWeight: "bold", width: "40%" }}>
            <Descriptions.Item label="Property ID">
              <Tag color="purple">{property.propertyId}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Type">
              <Space>
                <Tag>{property.type}</Tag>
                <Tag color="cyan">{property.category}</Tag>
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label="Status">
              <Tag color={
                property.status === "Available" ? "green" :
                property.status === "Sold" ? "red" : "blue"
              }>
                {property.status}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Price">
              <Text strong style={{ fontSize: 16 }}>
                {new Intl.NumberFormat('en-IN', {
                  style: 'currency',
                  currency: property.currency,
                  maximumFractionDigits: 0,
                }).format(property.price)}
              </Text>
            </Descriptions.Item>
            <Descriptions.Item label="Size">
              <Space>
                <AreaChartOutlined />
                {property.size} {property.unit}
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label="Specifications">
              <Space>
                <Tag icon={<BathOutlined />}>{property.bedrooms} Beds</Tag>
                <Tag icon={<BathOutlined />}>{property.bathrooms} Baths</Tag>
                <Tag icon={<CarOutlined />}>{property.parking} Parking</Tag>
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label="Location">
              <Space direction="vertical" size={0}>
                <EnvironmentOutlined /> {property.location}
                <Text type="secondary">{property.city}, {property.state} - {property.pincode}</Text>
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label="Developer">{property.developer}</Descriptions.Item>
            <Descriptions.Item label="Project">{property.project}</Descriptions.Item>
            <Descriptions.Item label="Year Built">
              <CalendarOutlined /> {property.yearBuilt}
            </Descriptions.Item>
            <Descriptions.Item label="Listed Date">{dayjs(property.listedDate).format("DD MMM YYYY")}</Descriptions.Item>
          </Descriptions>

          <Divider />

          <Card title="Owner Information" size="small">
            <Space direction="vertical">
              <Text strong>{property.ownerName}</Text>
              <Text>{property.ownerEmail}</Text>
              <Text>{property.ownerContact}</Text>
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );
}

/* ───────── PROPERTY FORM ───────── */
function PropertyForm({ initialData, onSave, categories, propertyTypes, statusOptions }) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      form.setFieldsValue({
        ...initialData,
        listedDate: initialData.listedDate ? dayjs(initialData.listedDate) : null,
      });
    } else {
      form.resetFields();
      // Generate new property ID
      form.setFieldsValue({
        propertyId: `NH-${dayjs().format('YYYY')}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
        currency: "INR",
        unit: "sqft",
        status: "Available",
        category: "Residential",
        type: "Apartment",
      });
    }
  }, [initialData, form]);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      // In real app: API call to save property
      console.log("Property data:", {
        ...values,
        listedDate: values.listedDate?.format("YYYY-MM-DD"),
      });
      message.success(`Property ${initialData ? "updated" : "added"} successfully`);
      onSave();
    } catch (error) {
      message.error("Failed to save property");
    } finally {
      setLoading(false);
    }
  };

  const normFile = (e) => {
    if (Array.isArray(e)) {
      return e;
    }
    return e?.fileList;
  };

  return (
    <Form layout="vertical" form={form} onFinish={onFinish} 
      initialValues={{
        bedrooms: 1,
        bathrooms: 1,
        parking: 1,
        commission: 2.5,
        isFeatured: false,
        isVerified: true,
      }}
    >
      <Row gutter={16}>
        <Col xs={24} md={12}>
          <Form.Item name="propertyId" label="Property ID" rules={[{ required: true }]}>
            <Input disabled />
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item name="name" label="Property Name" rules={[{ required: true }]}>
            <Input placeholder="Enter property name" />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col xs={12} md={8}>
          <Form.Item name="type" label="Property Type" rules={[{ required: true }]}>
            <Select placeholder="Select type">
              {propertyTypes.map(type => (
                <Option key={type} value={type}>{type}</Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
        <Col xs={12} md={8}>
          <Form.Item name="category" label="Category" rules={[{ required: true }]}>
            <Select placeholder="Select category">
              {categories.map(category => (
                <Option key={category} value={category}>{category}</Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
        <Col xs={12} md={8}>
          <Form.Item name="status" label="Status" rules={[{ required: true }]}>
            <Select placeholder="Select status">
              {statusOptions.map(status => (
                <Option key={status} value={status}>{status}</Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col xs={24} md={12}>
          <Form.Item name="price" label="Price" rules={[{ required: true, type: "number", min: 0 }]}>
            <InputNumber style={{ width: "100%" }} formatter={(value) => `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")} parser={(value) => value.replace(/₹\s?|(,*)/g, "")}/>
          </Form.Item>
        </Col>
        <Col xs={12} md={6}>
          <Form.Item name="size" label="Size" rules={[{ required: true, type: "number", min: 0 }]}>
            <InputNumber style={{ width: "100%" }} />
          </Form.Item>
        </Col>
        <Col xs={12} md={6}>
          <Form.Item name="unit" label="Unit" rules={[{ required: true }]}>
            <Select options={[
              {label:'Sq Ft', value:'sqft'},
              {label:'Sq M', value:'sqm'},
              {label:'Acre', value:'acre'},
              {label:'Hecture', value:'hecture'},
              ]}>
            </Select>
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col xs={8} md={6}>
          <Form.Item name="bedrooms" label="Bedrooms" rules={[{ required: true, type: "number", min: 0 }]}>
            <InputNumber style={{ width: "100%" }} min={0} />
          </Form.Item>
        </Col>
        <Col xs={8} md={6}>
          <Form.Item name="bathrooms" label="Bathrooms" rules={[{ required: true, type: "number", min: 0 }]}>
            <InputNumber style={{ width: "100%" }} min={0} />
          </Form.Item>
        </Col>
        <Col xs={8} md={6}>
          <Form.Item name="parking" label="Parking" rules={[{ required: true, type: "number", min: 0 }]}>
            <InputNumber style={{ width: "100%" }} min={0} />
          </Form.Item>
        </Col>
        <Col xs={24} md={6}>
          <Form.Item name="yearBuilt" label="Year Built" rules={[{ required: true, type: "number", min: 1800, max: new Date().getFullYear() }]}>
            <InputNumber style={{ width: "100%" }} />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col xs={24} md={8}>
          <Form.Item name="city" label="City" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
        </Col>
        <Col xs={24} md={8}>
          <Form.Item name="state" label="State" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
        </Col>
        <Col xs={24} md={8}>
          <Form.Item name="pincode" label="Pincode" rules={[{ required: true, pattern: /^\d{6}$/, message: "Please enter valid 6-digit pincode" }]}>
            <Input />
          </Form.Item>
        </Col>
      </Row>

      <Form.Item name="location" label="Location Address" rules={[{ required: true }]}>
        <TextArea rows={2} />
      </Form.Item>

      <Form.Item name="description" label="Description" rules={[{ required: true }]}>
        <TextArea rows={3} />
      </Form.Item>

      <Form.Item name="amenities" label="Amenities">
        <Select mode="tags" placeholder="Add amenities" tokenSeparators={[',']} />
      </Form.Item>

      <Row gutter={16}>
        <Col xs={12} md={8}>
          <Form.Item name="developer" label="Developer" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
        </Col>
        <Col xs={12} md={8}>
          <Form.Item name="project" label="Project">
            <Input />
          </Form.Item>
        </Col>
        <Col xs={12} md={8}>
          <Form.Item name="commission" label="Commission %" rules={[{ required: true, type: "number", min: 0, max: 100 }]}>
            <InputNumber style={{ width: "100%" }} min={0} max={100} />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col xs={24} md={8}>
          <Form.Item name="ownerName" label="Owner Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
        </Col>
        <Col xs={24} md={8}>
          <Form.Item name="ownerEmail" label="Owner Email" rules={[{ required: true, type: "email" }]}>
            <Input />
          </Form.Item>
        </Col>
        <Col xs={24} md={8}>
          <Form.Item name="ownerContact" label="Owner Contact" rules={[{ required: true, pattern: /^\d{10}$/, message: "Please enter valid 10-digit number" }]}>
            <Input />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col xs={12} md={8}>
          <Form.Item name="listedDate" label="Listed Date" rules={[{ required: true }]}>
            <DatePicker style={{ width: "100%" }} format="DD-MM-YYYY" />
          </Form.Item>
        </Col>
        <Col xs={6} md={4}>
          <Form.Item name="isFeatured" label="Featured" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Col>
        <Col xs={6} md={4}>
          <Form.Item name="isVerified" label="Verified" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Col>
        <Col xs={12} md={8}>
          <Form.Item name="images" label="Property Images" valuePropName="fileList" getValueFromEvent={normFile}>
            <Upload listType="picture-card" maxCount={5} beforeUpload={() => false} accept="image/*">
              <div>
                <UploadOutlined />
                <div style={{ marginTop: 8 }}>Upload</div>
              </div>
            </Upload>
          </Form.Item>
        </Col>
      </Row>

      <Form.Item name="notes" label="Internal Notes">
        <TextArea rows={2} placeholder="Any internal notes or remarks..." />
      </Form.Item>

      <Divider />

      <Row gutter={16} justify="end">
        <Col xs={12} md={6}>
          <Button block onClick={onSave} style={{ borderRadius: 999 }}disabled={loading}>
            Cancel
          </Button>
        </Col>
        <Col xs={12} md={6}>
          <Button type="primary" htmlType="submit" block loading={loading} style={{ borderRadius: 999 }}>
            {initialData ? "Update Property" : "Add Property"}
          </Button>
        </Col>
      </Row>
    </Form>
  );
}

// Add missing icon import
const StarOutlined = () => (
  <svg viewBox="64 64 896 896" width="1em" height="1em" fill="currentColor">
    <path d="M908.1 353.1l-253.9-36.9L540.7 86.1c-3.1-6.3-8.2-11.4-14.5-14.5-15.8-7.8-35-1.3-42.9 14.5L369.8 316.2l-253.9 36.9c-7 1-13.4 4.3-18.3 9.3a32.05 32.05 0 00.6 45.3l183.7 179.1-43.4 252.9a31.95 31.95 0 0046.4 33.7L512 754l227.1 119.4c6.2 3.3 13.4 4.4 20.3 3.2 17.4-3 29.1-19.5 26.1-36.9l-43.4-252.9 183.7-179.1c5-4.9 8.3-11.3 9.3-18.3 2.7-17.5-9.5-33.7-27-36.3z" />
  </svg>
);