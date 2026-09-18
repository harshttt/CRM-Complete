import { Empty, List, Typography, Badge } from "antd";
import useNotificationStore from "../../store/notificationStore";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

const NotificationList = () => {
  const notifications = useNotificationStore(
    (state) => state.notifications
  );

  if (!notifications.length) {
    return <Empty description="No notifications" />;
  }

  return (
    <div style={{height:'70vh', overflow:'scroll'}}>
    <List
      size="small"
      itemLayout="horizontal"
      dataSource={notifications}
      style={{ width: 340 }}
      renderItem={(item) => (
        <List.Item
          style={{
            padding: "5px 2px",
            cursor: "pointer",
            background: item.read ? "#fff" : "#fffbe6",
            borderRadius: 6,
            marginBottom: 6,
          }}
        >
          <List.Item.Meta
            title={
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {!item.read && <Badge color="#faad14" />}
                 <Typography.Text strong={!item.read}>{item.title}</Typography.Text>
              </div>
            }
            description={
              <>
                <Typography.Text type="secondary" style={{ fontSize: 13 }}> {item?.message} </Typography.Text>
                <div style={{ fontSize: 11, color: "#999", marginTop: 4 }}> {dayjs(item?.createdAt).fromNow()} </div>
              </>
            }
          />
        </List.Item>
      )}
    />
    </div>
  );
};

export default NotificationList;
