import { Layout } from "antd";
import { Outlet } from "react-router-dom";

export default function PublicLayout() {
  return (
    <Layout style={{width:'100vw', minHeight: "100vh", background: "#f5f7fa" }}>
      <Layout.Content>
        <Outlet />
      </Layout.Content>
    </Layout>
  );
}