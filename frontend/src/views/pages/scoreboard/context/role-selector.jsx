import { Segmented, Space, Tooltip, Badge } from 'antd';
import {UserOutlined, TeamOutlined, SettingOutlined, CrownOutlined} from '@ant-design/icons';
import { useScoreboard } from './scoreboard-context';

const RoleSelector = () => {
  const { userRole, setUserRole } = useScoreboard();

  const roleOptions = [
    {
      label: (
        <Tooltip title="View as Salesperson">
          <Space>
            <UserOutlined />
            <span>Salesperson</span>
          </Space>
        </Tooltip>
      ),
      value: 'salesperson'
    },
    {
      label: (
        <Tooltip title="View as Manager">
          <Space>
            <TeamOutlined />
            <span>Manager</span>
          </Space>
        </Tooltip>
      ),
      value: 'manager'
    },
    {
      label: (
        <Tooltip title="View as Admin">
          <Space>
            <SettingOutlined />
            <span>Admin</span>
          </Space>
        </Tooltip>
      ),
      value: 'admin'
    },
    {
      label: (
        <Tooltip title="View as Super Admin">
          <Space>
            <CrownOutlined />
            <span>Super Admin</span>
            <Badge count="Full" size="small" />
          </Space>
        </Tooltip>
      ),
      value: 'superadmin'
    }
  ];

  return (
    <div style={{ padding: '16px 24px 0', backgroundColor: '#f0f2f5' }}>
      <div style={{ maxWidth: 600, margin: '0 auto' }}>
        <Segmented
          options={roleOptions}
          value={userRole}
          onChange={setUserRole}
          size="large"
          block
        />
      </div>
    </div>
  );
};

export default RoleSelector;