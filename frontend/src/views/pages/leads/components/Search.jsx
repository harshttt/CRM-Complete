import { SearchOutlined } from "@ant-design/icons";
import { Button, Col, Form, Input, Row } from "antd";

/*──────────── SEARCH BAR ────────────*/
export default function Search({ refetch, search, setSearch }) {

  return (
    <Form onFinish={() => refetch(search)} style={{ width: "100%" }}>
      <Row gutter={8} wrap align="middle">
        <Col span={10}>
          <Input placeholder="Search by name / email / phone / project" value={search.q ?? ""} prefix={<SearchOutlined style={{ color: "#bfbfbf" }} />}
            onChange={(e) => setSearch({ q: e.target.value })} onClear={(e) => {setSearch({q:null}); refetch({q:null})}}
            allowClear style={{borderRadius: 999, paddingInline: 16, paddingBlock: 8, boxShadow: "0 4px 10px rgba(15,23,42,0.06)", border: "1px solid #dde4ff"}}
          />
        </Col>
        <Col span={3}>
          <Button style={{ borderRadius: "50px", width: "100%" }} type="primary" htmlType="submit" icon={<SearchOutlined />}>Search</Button>
        </Col>
      </Row>
    </Form>
  );
}