import { Menu } from "antd";
import { Link, useLocation } from "react-router-dom";
import { getVisibleRoutes, transformRoutes } from "./route";
import { useEffect, useState, useMemo } from "react";

const App = ({ userType = "admin" }) => {
  const routes = transformRoutes(getVisibleRoutes());
  const location = useLocation();
  const currentPath = location.pathname;
  const [openKeys, setOpenKeys] = useState(getOpenKeys(currentPath));

  // Get all open keys (parents)
  function getOpenKeys(path) {
    const segments = path.split("/").filter(Boolean);
    const keys = [];
    for (let i = 1; i < segments.length; i++) {
      keys.push("/" + segments.slice(0, i).join("/"));
    }
    return keys;
  }

  const selectedKeys = [currentPath];

  const renderMenuItems = (routesList) =>
    routesList.filter((route) => route.renderOnSidebar).map((route) => {
        const hasChildren = route.children?.length > 0;

        const label = hasChildren ? ( <span className="crm-menu-label">{route.title}</span>) : (
          <Link to={route.url} className="crm-menu-link">
            <span className="crm-menu-label">{route.title}</span>
          </Link>
        );

        return {
          key: route.url,
          label,
          icon: route.icon ? (
            <span className="crm-menu-icon">
              <route.icon />
            </span>
          ) : null,
          children: hasChildren ? renderMenuItems(route.children) : undefined,
        };
      });

  const items = useMemo(() => renderMenuItems(routes), [routes]);

  // Sync open keys when route changes
  useEffect(() => {
    setOpenKeys(getOpenKeys(currentPath));
  }, [currentPath]);

  return (
    <div className="crm-sidebar-wrapper" style={userType === "agency" ? {} : {height: "calc(100vh - 64px)"}}>
      <Menu mode="inline" theme="light" items={items} selectedKeys={selectedKeys} openKeys={openKeys} onOpenChange={(keys) => setOpenKeys(keys)} inlineIndent={20} className="crm-sidebar-menu"/>
    </div>
  );
};

export default App;
