import { Space, Button, Popover, Badge, Flex, } from "antd";
import { LogoutOutlined, BellFilled, SettingOutlined, AppstoreOutlined, BarChartOutlined, FunnelPlotOutlined, CheckSquareOutlined, CalendarOutlined, BellOutlined, } from "@ant-design/icons";

import commonObj from "../../commonObj";
import { Link, useNavigate } from "react-router-dom";
import useNotificationStore from "../../store/notificationStore";
import NotificationList from "../components/NotificationList";
import axiosInstance from "../../utils/axios";
import API_ENDPOINTS from "../../constants/api-endpoints";
import util from "../../utils/util";

export default function Top() {
  const unreadCount = useNotificationStore((state) => state.unreadCount);
  const markAllRead = useNotificationStore((state) => state.markAllRead);

  const navigate = useNavigate();

  const userName = commonObj?.name || "User";
  const userRole = commonObj?.role?.name || "Role";
  const userInitial = userName?.charAt(0)?.toUpperCase();

  /* 🔥 Quick Actions with Navigation */
  const quickActions = [
    // {
    //   label: "Lead",
    //   icon: <FunnelPlotOutlined />,
    //   path: "/leads-management/leads",
    //   color: "#ff6b35",
    // },
    // {
    //   label: "Task",
    //   icon: <CheckSquareOutlined />,
    //   path: "/tasks",
    //   color: "#4a90e2",
    // },
    // {
    //   label: "Reminder",
    //   icon: <BellOutlined />,
    //   path: "/reminders",
    //   color: "#e74c3c",
    // },
    // {
    //   label: "Meeting",
    //   icon: <CalendarOutlined />,
    //   path: "/leads-management/meeting",
    //   color: "#9b59b6",
    // },
  ];

  return (
    <Flex justify="flex-end" align="center" style={{ width: "100%" }}>      {/* LEFT: Quick Actions */}
      <Flex align="center" gap={4}>
        {quickActions.map((action, i) => (
          <Flex align="center" key={i}>
            <button
              title={action.label}
              onClick={() => navigate(action.path)}
              style={{
                display: "flex", alignItems: "center", gap: 5, background: "none",
                border: "none", cursor: "pointer", padding: "6px 10px", borderRadius: 6,
                color: "#555", fontSize: 12, fontWeight: 500, transition: "all 0.15s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#f5f5f5";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
              }}
            >
              <span style={{ color: action.color, fontSize: 14 }}>{action.icon}</span>
              {action.label}
            </button>

            {i < quickActions.length - 1 && (<div style={{ width: 1, height: 16, background: "#e8e8e8" }} />)}
          </Flex>
        ))}
      </Flex>

      {/* RIGHT SECTION */}
      <Space size={10} align="center">

        {/* 🔔 Notifications */}
        <Popover
          content={<NotificationList />}
          title={
            <Flex justify="space-between" align="center">
              <span style={{ fontWeight: 600 }}>Notifications</span>
              <span style={{ fontSize: 11, color: "#999" }}>
                Recent updates
              </span>
            </Flex>
          }
          trigger="click"
          placement="bottomRight"
          onOpenChange={(open) => open && markAllRead()}
        >
          <Badge count={unreadCount} size="small">
            <Button
              shape="circle"
              icon={
                <BellFilled style={{ color: "#faad14", fontSize: 16 }} />
              }
              style={{
                background: "radial-gradient(circle at 30% 20%, #fff7e6, #fff1b8)",
                border: "1px solid #ffe58f",
              }}
            />
          </Badge>
        </Popover>

        {/* 👤 User */}
        <Link to="/profile">
          <Flex justify="center" align="center" gap={8}
            style={{
              padding: "4px 10px",
              borderRadius: 10,
              background: "#fafafa",
              border: "1px solid #f0f0f0",
              cursor: "pointer",
            }}
          >
            <Flex justify="center" align="center"
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #7c3aed, #a855f7)",
                color: "#fff",
                fontWeight: 600,
                fontSize: 13,
              }}
            >
              {userInitial}
            </Flex>

            <div style={{ lineHeight: 1 }}>
              <div style={{ fontSize: 12, fontWeight: 600 }}>{userName}</div>
              <div style={{ fontSize: 10, color: "#999" }}>{userRole}</div>
            </div>

          </Flex>
        </Link>

        {/* 🚪 Logout */}
        <Button
          icon={<LogoutOutlined />}
          size="small"
          danger
          style={{
            borderRadius: 8,
            fontSize: 12,
            fontWeight: 500,
            background: "#fef2f2",
            border: "1px solid #fecaca",
          }}
          onClick={async () => {
            try {
              await axiosInstance.post(API_ENDPOINTS.USER_LOGOUT, {
                sessionId: localStorage.getItem("sessionId"),
                userId: commonObj?.id,
              });
            } finally {
              util.clearAuth();
              navigate("/login", { replace: true });
              window.location.reload();
            }
          }}
        >
          Logout
        </Button>

      </Space>

    </Flex>
  );
}

// import { Space, Row, Col, Button, Popover, Badge, Flex } from "antd";
// import { LogoutOutlined, UserOutlined, BellFilled } from "@ant-design/icons";
// import commonObj from "../../commonObj";
// import { Link, useNavigate } from "react-router-dom";
// import { useEffect } from "react";
// // import routes from "./route";
// import Notification from "../components/Notification";
// import SearchBar from "../components/Search";
// import useNotificationStore from "../../store/notificationStore";
// import NotificationList from "../components/NotificationList";
// import { getVisibleRoutes, transformRoutes } from "./route";

// export default function Top() {
//   const unreadCount = useNotificationStore(state => state.unreadCount);
//   const markAllRead = useNotificationStore(state => state.markAllRead);
//   const routes = transformRoutes(getVisibleRoutes());

//   const navigate = useNavigate();
//   const single = () => {
//     const singleMenuData = [];
//     for (let i = 0; i < routes?.length; i++) {
//       if (routes[i].children) {
//         for (let y = 0; y < routes[i]?.children?.length; y++) {
//           singleMenuData.push({
//             title: routes[i].children[y].title,
//             id: i,
//             path: `${routes[i].url}/${routes[i].children[y].url}`,
//           });
//         }
//       } else {
//         singleMenuData.push({
//           title: routes[i].title,
//           id: i,
//           path: routes[i].url,
//         });
//       }
//     }
//   };

//   useEffect(() => {
//     single();
//   }, []);

//   const userName = commonObj?.name || "Profile";

//   return (
//     <div style={{position: "relative", zIndex: 10}}>
//       <Row gutter={[12, 0]} justify="space-between" align="center">
//         {/* LEFT: Search */}
//         <Col xs={24} md={12}>
//           <div>
//             <Space size="large" align="center" style={{ width: "100%", paddingTop:'10px', display:'flex', justifyContent:'center' }}>
//               <SearchBar placeholder="Search here..." />
//             </Space>
//           </div>
//         </Col>

//         {/* RIGHT: Actions */}
//         <Col>
//           <Space size={8} align="center">
//             {/* Notifications */}
//             <Popover
//               content={<NotificationList />}
//               title={
//                 <Flex justify="space-between" align="center" gap={8}>
//                   <span style={{ fontWeight: 500 }}>Notifications</span>
//                   <span style={{ fontSize: 11, color: "#8c8c8c"}}>Recent updates</span>
//                 </Flex>
//               }
//               trigger="click"
//               placement="bottomRight"
//               onOpenChange={open => open && markAllRead()}
//             >
//               <Badge count={unreadCount} size="small" offset={[-2, 4]}>
//                 <Button type="text" size="large" shape="circle" icon={ <BellFilled style={{color: "#faad14", fontSize: 18,}}/> }
//                   style={{marginLeft: "auto", borderRadius: "999px", background:"radial-gradient(circle at 30% 20%, #fff7e6, #fff1b8)", boxShadow: "0 4px 10px rgba(250,173,20,0.25)",}}
//                 />
//               </Badge>
//             </Popover>

//             {/* User */}
//             <Link to="/profile">
//               <Button type="text" size="large" style={{ borderRadius: 999, paddingInline: 10, display: "flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.9)", border: "1px solid rgba(226,232,255,0.9)"}}>
//                 <Flex justify="center" align="center" style={{width: 26, height: 26, borderRadius: "999px", background:"radial-gradient(circle at 30% 20%, #e6f4ff, #d6e4ff)", marginRight: 2}}>
//                   <UserOutlined style={{ fontSize: 14, color: "#1d39c4" }} />
//                   {/* Or show initials:
//                   <span style={{ fontSize: 13, fontWeight: 600, color: "#1d39c4" }}>
//                     {userInitial}
//                   </span>
//                   */}
//                 </Flex>
//                 <span style={{ fontSize: 13, fontWeight: 500, color: "#111827", maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap"}}>
//                   {userName}
//                 </span>
//               </Button>
//             </Link>

//             {/* Logout */}
//             <Button icon={<LogoutOutlined />} danger size="middle"
//               style={{
//                 borderRadius: 999,
//                 paddingInline: 14,
//                 fontSize: 13,
//                 fontWeight: 500,
//                 background: "rgba(254,242,242,0.95)",
//                 border: "1px solid #fecaca",
//               }}
//               onClick={() => {
//                 window.localStorage.clear();
//                 // window.location.replace('/');
//                 navigate('/');
//                 window.location.reload();
//               }}
//             >
//               Logout
//             </Button>
//           </Space>
//         </Col>
//       </Row>
//     </div>
//   );
// }
