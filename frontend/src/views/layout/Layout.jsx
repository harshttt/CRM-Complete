import { Button, Col, Flex, Layout, Row, Space, Tag, Typography } from "antd";
import { useMemo, useState } from "react";
import { Link, Outlet, Route } from "react-router-dom";
import { MenuFold, MenuUnfold } from "../components/svgIcons";
import Menu from "./Menu";
import Top from "./Top";
import { PROJECT_ROUTES } from "./route";
import { flattenRoutes } from "../components/Search";
import Header from "./Header";
import commonObj from "../../commonObj";
import useNotificationSocket from "../../socket-management/socket-hooks/useNotificationSocket";
// import Notification from "../components/Notification";
import { useConstants } from "../../api-hooks/admin";

const { Text } = Typography;

const generateRoutes = (routes) => {

  return routes.map((route) => {
    const { path, component: Component, children } = route;

    const element = Component ? <Component /> : null;
    return (<Route key={path} path={path} element={element}>{children?.length > 0 && generateRoutes(children)}</Route>);
  });
};

export default function MyLayout() {
  useNotificationSocket();
  const [collapsed, setCollapsed] = useState(false);
  const allRoutes = useMemo(() => flattenRoutes(PROJECT_ROUTES).filter(x => !x.children?.length), []);

  const { data } = useConstants();
  if (data) commonObj.constants = data;

  const currentYear = new Date().getFullYear();

  //   useEffect(() => {
  //     const userData = JSON.parse(localStorage.getItem("user_info"));
  //     commonObj.name = userData.name;
  //     commonObj.phone = userData.phone;
  //     commonObj.email = userData.email;
  //     commonObj.role = userData.role;
  //     commonObj.permissions = userData?.permissions?.map((item) => item.name);

  //     console.log("commonObj-------in useEffect----->", commonObj);
  //   }, []);

  // useEffect(() => {
  //   onMessage(messaging, (payload) => {
  //     new Notification(payload.notification.title, {body:payload.notification.body})
  //   })

  // },[]);

  return (
    <Layout style={{ width: '100vw', height: '100vh' }}>
      {/* <Layout.Sider style={{ overflow: "auto", padding: 0 }} collapsible={false} collapsed={collapsed}>
        <Layout.Header style={{ padding:'0px'}}>
            <Header {...{ collapsed }} />
        </Layout.Header>
        <Menu />
      </Layout.Sider> */}
      <Layout.Sider
        style={{ overflow: "auto", padding: 0 }}
        collapsible={false}
        collapsed={collapsed}
        collapsedWidth={60}
      >
        <Layout.Header style={{ padding: 0 }}>
          <Header {...{ collapsed }} />
        </Layout.Header>
        <Menu />
      </Layout.Sider>
      <Layout>
        <Layout.Header
          style={{
            background: "#fff",
            borderBottom: "1px solid #f0f0f0",
            padding: "0 35px 0 0",
          }}
        >
          <Row>
            <Col span={24}>
              <Row justify="space-between" align="middle">
                <Col span={1} style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "50px" }}>
                  <Button
                    style={{ outline: "none", border: "2px solid black" }}
                    size="small"
                    type="text"
                    icon={collapsed ? <MenuUnfold /> : <MenuFold />}
                    onClick={() => setCollapsed(!collapsed)}
                  />
                </Col>
                <Col span={23}>
                  <Top />
                </Col>
              </Row>
            </Col>
          </Row>
        </Layout.Header>

        <Layout.Content style={{ margin: 8, overflow: "scroll", background: 'white', borderRadius: '6px' }}>
          <Outlet />
        </Layout.Content>

        <Layout.Footer
          style={{
            background: 'white',
            padding: '8px 24px',
            lineHeight: '1.2',
          }}
        >
          <Flex justify="space-between" align="center" wrap gap={8}>
            {/* Left: Brand + Copyright */}
            <Space size={10} wrap style={{ margin: 0 }}>
              <Text style={{ fontSize: 12 }}>
                © {currentYear}{" "}
                <Text strong>Optronix CRM</Text>. All rights reserved.
              </Text>
              <Tag
                style={{
                  background: "rgba(22,119,255,0.15)",
                  border: "1px solid rgba(22,119,255,0.3)",
                  borderRadius: 10,
                  fontSize: 10,
                  padding: '0px 6px',
                  margin: 0,
                }}
              >
                v2.4.1
              </Tag>
            </Space>

            {/* Right: Links */}
            <Space split={<Text style={{ fontSize: 10, color: '#aaa' }}>●</Text>} size={12}>
              <Link to="/privacy" style={{ fontSize: 12 }}>Privacy Policy</Link>
              <Link to="/terms" style={{ fontSize: 12 }}>Terms of Service</Link>
              <Link to="/support" style={{ fontSize: 12 }}>Support</Link>
            </Space>
          </Flex>
        </Layout.Footer>
        {/* <Layout.Content style={{ padding: 24, height: "80px", overflow: "scroll" }}>
          <Routes>
            {generateRoutes(allRoutes)}
             <Route path={"*"} element={<Error404 />} />
          </Routes>
        </Layout.Content> */}
      </Layout>
    </Layout>
  );
}
