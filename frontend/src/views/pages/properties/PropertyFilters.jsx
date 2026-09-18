import { CloseCircleOutlined, FilterOutlined } from "@ant-design/icons";
import { useState, useEffect, useRef } from "react";
import {
  AutoComplete,
  Button,
  Col,
  DatePicker,
  Drawer,
  Form,
  Row,
  Select,
  Space,
  Typography,
  InputNumber,
  Cascader,
  Tag
} from "antd";
import dayjs from "dayjs";

const { RangePicker } = DatePicker;
const { Text } = Typography;

// Sample data for options (you can replace with API calls)
const propertyTypeOptions = [
  { label: "Apartment", value: "apartment" },
  { label: "Villa", value: "villa" },
  { label: "Penthouse", value: "penthouse" },
  { label: "Row House", value: "row_house" },
  { label: "Studio", value: "studio" },
  { label: "Plot", value: "plot" },
  { label: "Commercial Office", value: "commercial_office" },
  { label: "Shop", value: "shop" },
  { label: "Warehouse", value: "warehouse" },
];

const configurationOptions = [
  { label: "1 BHK", value: "1_bhk" },
  { label: "2 BHK", value: "2_bhk" },
  { label: "3 BHK", value: "3_bhk" },
  { label: "4 BHK", value: "4_bhk" },
  { label: "5 BHK", value: "5_bhk" },
  { label: "Studio", value: "studio" },
];

const statusOptions = [
  { label: "Available", value: "available" },
  { label: "Booked", value: "booked" },
  { label: "Sold", value: "sold" },
  { label: "Reserved", value: "reserved" },
  { label: "Blocked", value: "blocked" },
];

const furnishingOptions = [
  { label: "Unfurnished", value: "unfurnished" },
  { label: "Semi-Furnished", value: "semi_furnished" },
  { label: "Fully Furnished", value: "fully_furnished" },
];

const facingOptions = [
  { label: "North", value: "north" },
  { label: "South", value: "south" },
  { label: "East", value: "east" },
  { label: "West", value: "west" },
  { label: "North-East", value: "north_east" },
  { label: "North-West", value: "north_west" },
  { label: "South-East", value: "south_east" },
  { label: "South-West", value: "south_west" },
];

const amenitiesOptions = [
  { label: "Swimming Pool", value: "swimming_pool" },
  { label: "Gym", value: "gym" },
  { label: "Club House", value: "club_house" },
  { label: "Park", value: "park" },
  { label: "Security", value: "security" },
  { label: "Children's Play Area", value: "play_area" },
  { label: "Power Backup", value: "power_backup" },
  { label: "Lift", value: "lift" },
  { label: "Car Parking", value: "car_parking" },
  { label: "Garden", value: "garden" },
  { label: "Shopping Center", value: "shopping_center" },
  { label: "Hospital", value: "hospital" },
  { label: "School", value: "school" },
];

const tagsOptions = [
  { label: "Premium", value: "premium" },
  { label: "Corner", value: "corner" },
  { label: "High Floor", value: "high_floor" },
  { label: "Luxury", value: "luxury" },
  { label: "Economical", value: "economical" },
  { label: "Ready to Move", value: "ready_to_move" },
  { label: "Under Construction", value: "under_construction" },
  { label: "Sea Facing", value: "sea_facing" },
  { label: "Garden View", value: "garden_view" },
  { label: "Duplex", value: "duplex" },
];

// Sample cities data (can be from API)
const cityOptions = [
  { label: "Mumbai", value: "mumbai" },
  { label: "Delhi", value: "delhi" },
  { label: "Bangalore", value: "bangalore" },
  { label: "Hyderabad", value: "hyderabad" },
  { label: "Chennai", value: "chennai" },
  { label: "Kolkata", value: "kolkata" },
  { label: "Pune", value: "pune" },
  { label: "Ahmedabad", value: "ahmedabad" },
  { label: "Jaipur", value: "jaipur" },
];

// Sample projects data (can be from API)
const projectOptions = [
  { label: "Skyline Heights", value: "skyline_heights" },
  { label: "Emerald Residency", value: "emerald_residency" },
  { label: "Palm Meadows", value: "palm_meadows" },
  { label: "Green Valley", value: "green_valley" },
  { label: "Urban Nest", value: "urban_nest" },
  { label: "Royal Garden", value: "royal_garden" },
  { label: "Ocean View", value: "ocean_view" },
];

// Sample builders data (can be from API)
const builderOptions = [
  { label: "Prestige Group", value: "prestige" },
  { label: "DLF Limited", value: "dlf" },
  { label: "Sobha Limited", value: "sobha" },
  { label: "Godrej Properties", value: "godrej" },
  { label: "Lodha Group", value: "lodha" },
  { label: "Brigade Group", value: "brigade" },
];

/*──────────── PROPERTY FILTERS ────────────*/
export default function PropertyFilters({ 
  refetchPropertiesWithQuery, 
  open, 
  onClose, 
  filters, 
  setFilters 
}) {
  const debounceRef = useRef(null);
  const [form] = Form.useForm();
  const [localFilters, setLocalFilters] = useState(filters);
  const [priceRange, setPriceRange] = useState([filters.minPrice || 0, filters.maxPrice || 50000000]);

  // Add your API hooks here if needed
  // const { data: citiesRes, refetchWithQuery: refetchCities } = useCitiesDropdown({ qData: { page: 1, limit: 20 } });
  // const { data: projectsRes, refetchWithQuery: refetchProjects } = useProjectsDropdown({ qData: { page: 1, limit: 20 } });

  /*──────── APPLY FILTERS ────────*/
  const handleApply = () => {
    // Apply local filters to parent state
    const filtersToApply = { 
      ...localFilters,
      minPrice: priceRange[0],
      maxPrice: priceRange[1]
    };
    
    setFilters(filtersToApply);
    refetchPropertiesWithQuery(filtersToApply);
    onClose();
  };

  /*──────── RESET ────────*/
  const handleReset = () => {
    const emptyFilters = {
      propertyType: null,
      configuration: null,
      city: null,
      status: null,
      furnishing: null,
      facing: null,
      amenities: [],
      tags: [],
      projectName: null,
      builderName: null,
      minArea: null,
      maxArea: null,
      minPrice: 0,
      maxPrice: 50000000,
      possessionDateFrom: null,
      possessionDateTo: null,
      createdDateFrom: null,
      createdDateTo: null,
      isFeatured: null,
    };
    
    setLocalFilters(emptyFilters);
    setPriceRange([0, 50000000]);
    setFilters(emptyFilters);
    form.resetFields();
    refetchPropertiesWithQuery(emptyFilters);
  };

  /*──────── UPDATE LOCAL FILTERS ────────*/
  const updateLocalFilter = (key, value) => {
    setLocalFilters(prev => ({...prev, [key]: value}));
  };

  /*──────── HANDLE PRICE RANGE CHANGE ────────*/
  const handlePriceRangeChange = (value) => {
    setPriceRange(value);
  };

  /*──────── INITIALIZE FORM WITH CURRENT FILTERS ────────*/
  useEffect(() => {
    if (open) {
      setLocalFilters(filters);
      setPriceRange([filters.minPrice || 0, filters.maxPrice || 50000000]);
      
      form.setFieldsValue({
        propertyType: filters.propertyType,
        configuration: filters.configuration,
        city: filters.city,
        status: filters.status,
        furnishing: filters.furnishing,
        facing: filters.facing,
        amenities: filters.amenities || [],
        tags: filters.tags || [],
        projectName: filters.projectName,
        builderName: filters.builderName,
        minArea: filters.minArea,
        maxArea: filters.maxArea,
        priceRange: [filters.minPrice || 0, filters.maxPrice || 50000000],
        possessionDate: filters.possessionDateFrom && filters.possessionDateTo 
          ? [dayjs(filters.possessionDateFrom, 'YYYY-MM-DD'), dayjs(filters.possessionDateTo, 'YYYY-MM-DD')] 
          : undefined,
        createdDate: filters.createdDateFrom && filters.createdDateTo 
          ? [dayjs(filters.createdDateFrom, 'YYYY-MM-DD'), dayjs(filters.createdDateTo, 'YYYY-MM-DD')] 
          : undefined,
        isFeatured: filters.isFeatured,
      });
    }
  }, [open, filters, form]);

  /*──────── CLEANUP ────────*/
  useEffect(() => {
    return () => debounceRef.current && clearTimeout(debounceRef.current);
  }, []);

  /*──────── FORMAT CURRENCY ────────*/
  const formatCurrency = (value) => {
    if (!value) return "0";
    if (value >= 10000000) {
      return `${(value / 10000000).toFixed(2)} Cr`;
    } else if (value >= 100000) {
      return `${(value / 100000).toFixed(2)} L`;
    } else {
      return `${value.toLocaleString()}`;
    }
  };

  return (
    <Drawer 
      open={open} 
      onClose={onClose} 
      placement="right" 
      width={420} 
      closable={false}
      styles={{
        body: { 
          paddingTop: 8, 
          paddingBottom: 12, 
          paddingInline: 16, 
          background: "linear-gradient(135deg, rgba(245,247,255,0.98), rgba(255,255,255,0.98))" 
        }
      }}
      title={
        <Space align="center" style={{ width: "100%", justifyContent: "space-between" }}>
          <Space>
            <div style={{
              width: 32, 
              height: 32, 
              borderRadius: "50%", 
              background: "rgba(24, 144, 255, 0.12)", 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center"
            }}>
              <FilterOutlined style={{ color: "#1890ff" }} />
            </div>

            <Space direction="vertical" size={0}>
              <Text strong>Property Filters</Text>
              <Text type="secondary" style={{ fontSize: 11 }}> Filter properties using multiple criteria</Text>
            </Space>
          </Space>

          <Button type="text" onClick={onClose} icon={<CloseCircleOutlined style={{ fontSize: 18 }} />} />
        </Space>
      }
    >
      <Form form={form} layout="vertical">
        <Row gutter={[12, 8]}>
          {/* PROPERTY TYPE */}
          <Col xs={24} sm={12}>
            <Form.Item label="Property Type" name="propertyType">
              <Select 
                allowClear 
                placeholder="All types" 
                value={localFilters.propertyType}
                onChange={(v) => updateLocalFilter('propertyType', v)}
                options={propertyTypeOptions}
              />
            </Form.Item>
          </Col>

          {/* CONFIGURATION */}
          <Col xs={24} sm={12}>
            <Form.Item label="Configuration" name="configuration">
              <Select 
                allowClear 
                placeholder="All configurations" 
                value={localFilters.configuration}
                onChange={(v) => updateLocalFilter('configuration', v)}
                options={configurationOptions}
              />
            </Form.Item>
          </Col>

          {/* CITY */}
          <Col xs={24} sm={12}>
            <Form.Item label="City" name="city">
              <Select 
                allowClear 
                placeholder="Select city" 
                value={localFilters.city}
                onChange={(v) => updateLocalFilter('city', v)}
                options={cityOptions}
                showSearch
                optionFilterProp="label"
              />
            </Form.Item>
          </Col>

          {/* STATUS */}
          <Col xs={24} sm={12}>
            <Form.Item label="Status" name="status">
              <Select 
                allowClear 
                placeholder="Select status" 
                value={localFilters.status}
                onChange={(v) => updateLocalFilter('status', v)}
                options={statusOptions}
              />
            </Form.Item>
          </Col>

          {/* FURNISHING */}
          <Col xs={24} sm={12}>
            <Form.Item label="Furnishing" name="furnishing">
              <Select 
                allowClear 
                placeholder="Select furnishing" 
                value={localFilters.furnishing}
                onChange={(v) => updateLocalFilter('furnishing', v)}
                options={furnishingOptions}
              />
            </Form.Item>
          </Col>

          {/* FACING */}
          <Col xs={24} sm={12}>
            <Form.Item label="Facing" name="facing">
              <Select 
                allowClear 
                placeholder="Select facing" 
                value={localFilters.facing}
                onChange={(v) => updateLocalFilter('facing', v)}
                options={facingOptions}
              />
            </Form.Item>
          </Col>

          {/* PROJECT NAME */}
          <Col xs={24}>
            <Form.Item label="Project" name="projectName">
              <Select 
                allowClear 
                placeholder="Select project" 
                value={localFilters.projectName}
                onChange={(v) => updateLocalFilter('projectName', v)}
                options={projectOptions}
                showSearch
                optionFilterProp="label"
              />
            </Form.Item>
          </Col>

          {/* BUILDER */}
          <Col xs={24}>
            <Form.Item label="Builder" name="builderName">
              <Select 
                allowClear 
                placeholder="Select builder" 
                value={localFilters.builderName}
                onChange={(v) => updateLocalFilter('builderName', v)}
                options={builderOptions}
                showSearch
                optionFilterProp="label"
              />
            </Form.Item>
          </Col>

          {/* AMENITIES */}
          <Col xs={24}>
            <Form.Item label="Amenities" name="amenities">
              <Select 
                mode="multiple"
                allowClear 
                placeholder="Select amenities" 
                value={localFilters.amenities || []}
                onChange={(v) => updateLocalFilter('amenities', v)}
                options={amenitiesOptions}
                maxTagCount={2}
                maxTagTextLength={10}
              />
            </Form.Item>
          </Col>

          {/* TAGS */}
          <Col xs={24}>
            <Form.Item label="Tags" name="tags">
              <Select 
                mode="multiple"
                allowClear 
                placeholder="Select tags" 
                value={localFilters.tags || []}
                onChange={(v) => updateLocalFilter('tags', v)}
                options={tagsOptions}
              />
            </Form.Item>
          </Col>

          {/* AREA RANGE */}
          <Col xs={24}>
            <Form.Item label="Area Range (sq.ft)">
              <Row gutter={8}>
                <Col span={12}>
                  <Form.Item name="minArea" noStyle>
                    <InputNumber 
                      placeholder="Min area" 
                      style={{ width: '100%' }}
                      onChange={(v) => updateLocalFilter('minArea', v)}
                      min={0}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="maxArea" noStyle>
                    <InputNumber 
                      placeholder="Max area" 
                      style={{ width: '100%' }}
                      onChange={(v) => updateLocalFilter('maxArea', v)}
                      min={0}
                    />
                  </Form.Item>
                </Col>
              </Row>
            </Form.Item>
          </Col>

          {/* PRICE RANGE */}
          <Col xs={24}>
            <Form.Item label={`Price Range: ${formatCurrency(priceRange[0])} - ${formatCurrency(priceRange[1])}`}>
              <div style={{ padding: '8px 0' }}>
                <Form.Item name="priceRange" noStyle>
                  <Select
                    value={`${priceRange[0]}-${priceRange[1]}`}
                    onChange={(value) => {
                      const [min, max] = value.split('-').map(Number);
                      setPriceRange([min, max]);
                    }}
                    options={[
                      { label: 'All Prices', value: '0-50000000' },
                      { label: 'Under ₹50 L', value: '0-5000000' },
                      { label: '₹50 L - ₹1 Cr', value: '5000000-10000000' },
                      { label: '₹1 Cr - ₹2 Cr', value: '10000000-20000000' },
                      { label: '₹2 Cr - ₹5 Cr', value: '20000000-50000000' },
                      { label: 'Above ₹5 Cr', value: '50000000-100000000' },
                    ]}
                    style={{ marginBottom: 12 }}
                  />
                </Form.Item>
                
                <Row gutter={8}>
                  <Col span={12}>
                    <InputNumber
                      placeholder="Min price"
                      value={priceRange[0]}
                      onChange={(value) => handlePriceRangeChange([value || 0, priceRange[1]])}
                      style={{ width: '100%' }}
                      formatter={value => `₹${formatCurrency(value)}`}
                      min={0}
                    />
                  </Col>
                  <Col span={12}>
                    <InputNumber
                      placeholder="Max price"
                      value={priceRange[1]}
                      onChange={(value) => handlePriceRangeChange([priceRange[0], value || 50000000])}
                      style={{ width: '100%' }}
                      formatter={value => `₹${formatCurrency(value)}`}
                      min={0}
                    />
                  </Col>
                </Row>
              </div>
            </Form.Item>
          </Col>

          {/* POSSESSION DATE */}
          <Col xs={24}>
            <Form.Item label="Possession Date" name="possessionDate">
              <RangePicker 
                style={{ width: "100%" }}
                onChange={(dates) => {
                  updateLocalFilter('possessionDateFrom', dates?.[0] ? dates?.[0].format("YYYY-MM-DD") : null);
                  updateLocalFilter('possessionDateTo', dates?.[1] ? dates?.[1].format("YYYY-MM-DD") : null);
                }}
              />
            </Form.Item>
          </Col>

          {/* CREATED DATE */}
          <Col xs={24}>
            <Form.Item label="Created Date" name="createdDate">
              <RangePicker 
                style={{ width: "100%" }}
                onChange={(dates) => {
                  updateLocalFilter('createdDateFrom', dates?.[0] ? dates?.[0].format("YYYY-MM-DD") : null);
                  updateLocalFilter('createdDateTo', dates?.[1] ? dates?.[1].format("YYYY-MM-DD") : null);
                }}
              />
            </Form.Item>
          </Col>

          {/* FEATURED PROPERTY */}
          <Col xs={24}>
            <Form.Item label="Featured Property" name="isFeatured">
              <Select 
                allowClear 
                placeholder="All properties" 
                value={localFilters.isFeatured}
                onChange={(v) => updateLocalFilter('isFeatured', v)}
                options={[
                  { label: 'Featured Only', value: true },
                  { label: 'Non-Featured Only', value: false },
                ]}
              />
            </Form.Item>
          </Col>
        </Row>

        {/* ACTION BAR */}
        <Row justify="space-between" align="middle" style={{ marginTop: 16 }}>
          <Col>
            <Text type="secondary" style={{ fontSize: 11 }}>
              Tip: Combine multiple filters for precise results
            </Text>
          </Col>

          <Col>
            <Space>
              <Button size="small" type="link" onClick={handleReset}>
                Clear All
              </Button>
              <Button size="small" type="primary" onClick={handleApply}>
                Apply Filters
              </Button>
            </Space>
          </Col>
        </Row>

        {/* ACTIVE FILTERS TAGS */}
        {Object.keys(localFilters).filter(key => 
          localFilters[key] !== null && 
          localFilters[key] !== undefined && 
          localFilters[key] !== '' &&
          !Array.isArray(localFilters[key]) &&
          key !== 'minPrice' && 
          key !== 'maxPrice'
        ).length > 0 && (
          <div style={{ marginTop: 16 }}>
            <Text type="secondary" style={{ fontSize: 11, display: 'block', marginBottom: 8 }}>
              Active Filters:
            </Text>
            <Space wrap size={[4, 4]}>
              {Object.entries(localFilters).map(([key, value]) => {
                if (!value || value === '' || Array.isArray(value) || 
                    key === 'minPrice' || key === 'maxPrice') return null;
                
                let label = key;
                let displayValue = value;
                
                // Map keys to friendly names
                const keyLabels = {
                  propertyType: 'Type',
                  configuration: 'Config',
                  city: 'City',
                  status: 'Status',
                  furnishing: 'Furnishing',
                  facing: 'Facing',
                  projectName: 'Project',
                  builderName: 'Builder',
                  isFeatured: value === true ? 'Featured' : 'Non-Featured',
                };
                
                label = keyLabels[key] || key;
                
                // Format values
                if (key === 'isFeatured') {
                  displayValue = value === true ? 'Yes' : 'No';
                }
                
                return (
                  <Tag 
                    key={key} 
                    closable 
                    onClose={() => updateLocalFilter(key, null)}
                    style={{ fontSize: 10 }}
                  >
                    {label}: {displayValue}
                  </Tag>
                );
              })}
              
              {/* Price range tag */}
              {priceRange[0] > 0 || priceRange[1] < 50000000 ? (
                <Tag 
                  closable 
                  onClose={() => {
                    setPriceRange([0, 50000000]);
                    updateLocalFilter('minPrice', 0);
                    updateLocalFilter('maxPrice', 50000000);
                  }}
                  style={{ fontSize: 10 }}
                >
                  Price: {formatCurrency(priceRange[0])} - {formatCurrency(priceRange[1])}
                </Tag>
              ) : null}
            </Space>
          </div>
        )}
      </Form>
    </Drawer>
  );
}