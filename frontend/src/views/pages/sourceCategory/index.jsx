import {
  parseAsString,
  useQueryState,
  useQueryStates,
} from "nuqs";
import { getSortingStateParser } from "../../../utils/parsers";
import { useState, useEffect } from "react";
import {
  Alert,
  Avatar,
  Button,
  Card,
  Col,
  Form,
  Input,
  Modal,
  Popconfirm,
  Row,
  Space,
  Switch,
  Table,
  Typography,
} from "antd";
import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import util from "../../../utils/util";
import MyPagination from "../../components/Pagination";
import { dummyUsers } from "../../../dummyData/users";

const allowURLStateUpdate = true; 

const SourceCategory = () => {
  const DEFAULT_NUQS_CONFIG = {
    throttleMs: !allowURLStateUpdate ? Infinity : 0,
  };

  // ---------- Query States ----------
  const sorting_cols = ["name", "email","role","branch","city","company",""];
  const [sort, setSort] = useQueryState(
    "sort",
    getSortingStateParser(sorting_cols)
      .withDefault([{ column: "id", desc: 1 }])
      .withOptions(DEFAULT_NUQS_CONFIG)
  );

  const [search, setSearch] = useQueryStates(
    { key: parseAsString.withDefault("") },
    { urlKeys: { key: "search_term" }, ...DEFAULT_NUQS_CONFIG }
  );

  // ---------- Local States ----------
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [data] = useState(null);

  const qData = { page: 1, limit: 20 }; // FIX ✔ placeholder

  // Fake placeholders (you can replace with real API states)
  const isError = false;
  const error = null;
  const refetch = () => {};
  const deleteData = () => {};

  const handleEdit = (id) => {
    setSelectedId(id);
    setIsEditModalOpen(true);
  };

  const handleModalClose = () => {
    setSelectedId(null);
    setIsEditModalOpen(false);
  };

  // ---------- Table Columns ----------
  const columns = [
    {
      title: "Source Category Id",
      dataIndex: "id",
      align: "center",
      width: 50,
      render: (_, __, i) => {
        const page = qData.page || 1;
        const limit = qData.limit || 20;
        return <b>{(page - 1) * limit + i + 1}</b>;
      },
    },
    // { title: "Image", dataIndex: "image", align: "center", render:(v)=><Avatar size={45} src={<img draggable={false} src={v} alt="avatar"/>}/> },
    { title: "Source Category Name", dataIndex: "sourceCategoryName", align: "center" },
    { title: "Source Category Code", dataIndex: "sourceCategoryCode", align: "center" },

    {
      title: "Status",
      dataIndex: "status",
      align: "center",
      render: (v, row) => <ToggleStatus data={row} qData={qData} />,
    },

    {
      title: "Action",
      dataIndex: "id",
      align: "center",
      width: 90,
      render: (v, row) => (
        <Space>
          <Popconfirm
            title="Are you sure to delete?"
            onConfirm={() => deleteData({ id: v })}
          >
            <Button size="small" icon={<DeleteOutlined />} danger />
          </Popconfirm>

          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(v)}
          />
        </Space>
      ),
    },
  ];

  return (
    <>
      {isError ? (
        <Alert
          message="Error"
          description={error?.message}
          type="error"
          showIcon
        />
      ) : (
        <Card
          size="small"
          bordered={false}
          title={<Typography.Text>Sources List</Typography.Text>}
          extra={
            <Button
              icon={<PlusOutlined />}
              type="primary"
              size="small"
              onClick={() => setIsEditModalOpen(true)}
            >
              Add New
            </Button>
          }
        >
          <Table
            bordered
            size="small"
            pagination={false}
            loading={false}
            title={() => (
              <Search search={search} setSearch={setSearch} refetch={refetch} />
            )}
            footer={() => (
              <MyPagination
                {...{ qData }}
                total={100}
                onChange={() => {}}
                DEFAULT_NUQS_CONFIG={DEFAULT_NUQS_CONFIG}
              />
            )}
            columns={columns?.map((v, i)=> {
              const sortConfig = sort?.find(s=> s.column === v.dataIndex);
              const isSortable = sorting_cols.includes(v.dataIndex);
              const haveMultipleSort = sorting_cols.length;
              return {
                ...v,
                key: v.dataIndex || `column-${i}`,
                fixed: i === 0 ? true : i+1 === columns.length ? 'right' : false,
                sorter: isSortable ? haveMultipleSort ? {multiple:i+1, compare: null} : true : false,
                defaultSortOrder: sortConfig ? sortConfig.desc === 1 ? 'descend' : 'ascend' : null 
              };
            })}
            dataSource={dummyUsers?.map((v) => ({ ...v, key: v.id }))}
            scroll={{ y: util.getTableHeight() }}
            onChange={(_, __, sorter) =>
              util.handleTableSortingData(
                sorter,
                setSort,
                sort,
                refetch,
                qData
              )
            }
          />
        </Card>
      )}

      <Modal
        open={isEditModalOpen}
        onCancel={handleModalClose}
        destroyOnClose
        footer={null}
        title={selectedId ? "Edit Sources" : "Add Sources"}
      >
        <DataForm _id={selectedId} onSave={handleModalClose} initialData={data} />
      </Modal>
    </>
  );
};

export default SourceCategory;

/*──────────── SEARCH BAR ────────────*/
function Search({ refetch, search, setSearch }) {
  return (
    <Form
      onFinish={() => {
        refetch();
      }}
    >
      <Row gutter={10}>
        <Col span={6}>
          <Input
            placeholder="Search by Name / Email / Phone"
            value={search.key}
            onChange={(e) => setSearch({ key: e.target.value })}
            allowClear
          />
        </Col>

        <Col>
          <Button type="primary" htmlType="submit">
            Search
          </Button>
        </Col>
      </Row>
    </Form>
  );
}

/*──────────── STATUS TOGGLE ────────────*/
function ToggleStatus({ data }) {
  const toggleStatus = () => {
    console.log("Toggle status", data.id);
  };

  return (
    <Switch
      checked={data?.status}
      checkedChildren="Active"
      unCheckedChildren="Inactive"
      onChange={toggleStatus}
    />
  );
}

/*──────────── DATA FORM ────────────*/
function DataForm({ _id, onSave, initialData }) {
  const [form] = Form.useForm();

  const onFinish = (values) => {
    console.log("Submitted:", values);
    onSave();
  };

  useEffect(() => {
    if (_id && initialData) {
      form.setFieldsValue(initialData);
    }
  }, [_id]);

  return (
    <Form layout="vertical" form={form} onFinish={onFinish}>
      <Form.Item
        name="fullname"
        label="Full Name"
        rules={[{ required: true, message: "Please enter full name" }]}
      >
        <Input />
      </Form.Item>

      <Form.Item
        name="phone"
        label="Phone"
        rules={[{ required: true, message: "Please enter phone number" }]}
      >
        <Input />
      </Form.Item>

      <Form.Item
        name="email"
        label="Email"
        rules={[{ required: true, message: "Please enter email" }]}
      >
        <Input />
      </Form.Item>

      <Button htmlType="submit" type="primary" block>
        Save
      </Button>
    </Form>
  );
}
