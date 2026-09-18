import { DeleteOutlined, NodeIndexOutlined, TeamOutlined } from "@ant-design/icons";
import { Badge, Button, Card, Popconfirm, Space, Typography } from "antd";

const {Text} = Typography;

/*──────────── BULK ACTION BAR ────────────*/
export default function BulkActionsBar({ selectedCount, onBulkAssign, onBulkStageChange, onBulkDelete, onClear, acc}) {
  return (
    <Card size="small" styles={{body:{padding:'6px 10px'}}}
      style={{marginBottom: 8, borderRadius: 12, border: "1px dashed #d9d9d9", background: "rgba(250, 251, 255, 0.9)"}}
    >
      <Space style={{ width: "100%", justifyContent: "space-between" }} align="center">
        <Space>
          <Badge count={selectedCount} size="small">
            <TeamOutlined style={{ fontSize: 16 }} />
          </Badge>
          <Text strong>{selectedCount} leads selected</Text>
        </Space>

        <Space>
          {acc.assignAccess && <Button icon={<NodeIndexOutlined />} size="small" onClick={onBulkAssign}>Bulk Assign</Button>}
          {/* <Button icon={<FlagOutlined />} size="small" onClick={onBulkStageChange}>Bulk Stage</Button> */}
          {/* { acc.deleteAccess &&   
              <Popconfirm title="Bulk delete selected leads?" okText="Yes" cancelText="No" onConfirm={onBulkDelete}>
                <Button icon={<DeleteOutlined />} size="small" danger>Bulk Delete</Button>
              </Popconfirm>
           } */}
          <Button size="small" type="link" onClick={onClear}>Clear selection</Button>
        </Space>

      </Space>
    </Card>
  );
}