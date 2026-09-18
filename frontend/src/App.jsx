import React, { Suspense, useEffect, useState, useMemo } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import "./App.css";

import MainSiteLoader from "./views/components/loaders/site-loader";
import commonObj from "./commonObj";
import { useValidateToken } from "./api-hooks/admin";
import { initSockets } from "./socket-management/socket-init/initSockets";
import DeleteAccountPolicy from "./views/pages/delete-account-policy";
import { getVisibleRoutes } from "./views/layout/route";
import Error404 from "./views/pages/errors/Error404";
import { NuqsAdapter } from "nuqs/adapters/react";
import Terms from "./views/pages/terms";
import Privacy from "./views/pages/privacy";
import Support from "./views/pages/support";

const LayoutAdmin = React.lazy(() => import("./views/layout/Layout"));
const Login = React.lazy(() => import("./views/pages/Login"));

/* ---------------- Route Generator ---------------- */

// const generateRoutes = (routes) =>
//   routes.map((route) => {
//     const Component = route.component;

//     const relativePath = route.path === "/" || route.path === "" ? "" : route.path.replace(/^\/+/, "");

//     if (relativePath === "") {
//       return <Route key="index" index element={<Component />} />;
//     }

//     return (
//       <Route key={route.path} path={relativePath} element={<Component />}>
//         {route.children && generateRoutes(route.children)}
//       </Route>
//     );
//   });

const generateRoutes = (routes) =>
  routes.map((route) => {
    const Component = route.component;
    const relativePath = route.path === "/" || route.path === "" ? "" : route.path.replace(/^\/+/, "");
    const element = <Component />;

    if (relativePath === "") {
      return <Route key="index" index element={element} />;
    }

    return (
      <Route key={route.path} path={relativePath} element={element}>
        {route.children && generateRoutes(route.children)}
      </Route>
    );
  });

// const generateRoutes = (routes) =>
//   routes.map((route) => {
//     const relativePath = route.path === "/" || route.path === "" ? "" : route.path.replace(/^\/+/, "");

//     let element;

//     if (route.path === "") {
//       element = route.component();
//     } else {
//       const Component = route.component;
//       element = <Component />;
//     }

//     if (relativePath === "") {
//       return <Route key="index" index element={element} />;
//     }

//     return (
//       <Route key={route.path} path={relativePath} element={element}>
//         {route.children && generateRoutes(route.children)}
//       </Route>
//     );
//   });

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  const { data: validateData, isLoading, error } = useValidateToken();

  /* ---------------- Permissions Converter ---------------- */

  const convertPermissions = (permissions) => {
    const grouped = permissions.reduce((acc, perm) => {
      if (!acc[perm.module]) {
        acc[perm.module] = {
          module: perm.module,
          permissions: []
        };
      }

      acc[perm.module].permissions.push({
        id: perm.id,
        name: perm.name,
        action: perm.action
      });

      return acc;
    }, {});

    return Object.values(grouped);
  };

  /* ---------------- Auth Check ---------------- */

  useEffect(() => {
    if (!isLoading) {
      const userData = validateData?.user;

      if (userData && !error) {
        commonObj.id = userData.id;
        commonObj.name = userData.name;
        commonObj.phone = userData.phone;
        commonObj.email = userData.email;
        commonObj.role = userData.role;
        commonObj.permissionsGrp = convertPermissions(
          userData.permissions || []
        );
        commonObj.permissions = userData.permissions?.map((p) => p.name);
        commonObj.user = userData;

        setIsAuthenticated(true);
      } else {
        commonObj.id = "";
        commonObj.name = "";
        commonObj.role = null;
        commonObj.permissions = [];
        commonObj.permissionsGrp = [];

        setIsAuthenticated(false);
      }

      setAuthChecked(true);
    }
  }, [validateData, isLoading, error]);

  /* ---------------- Init Socket ---------------- */

  useEffect(() => {
    if (isAuthenticated) {
      initSockets({
        id: commonObj.id,
        token: localStorage.getItem("authorization")
      });
    }
  }, [isAuthenticated]);

  /* ---------------- Disable Right Click ---------------- */

  useEffect(() => {
    const handleContextMenu = (e) => e.preventDefault();
    document.addEventListener("contextmenu", handleContextMenu);
    return () =>
      document.removeEventListener("contextmenu", handleContextMenu);
  }, []);
  
  if (isLoading || !authChecked) {
    return <MainSiteLoader />;
  }

  const visibleRoutes = useMemo(() => {
    if (!isAuthenticated) return [];
    return getVisibleRoutes();
  }, [isAuthenticated, validateData]);

  return (
    <BrowserRouter basename="/">
      <Suspense fallback={<MainSiteLoader />}>
      <NuqsAdapter>
        <Routes>
          {/* Public */}
          <Route path="/delete-account" element={<DeleteAccountPolicy />} />
          {/* <Route path="/terms" element={<Terms />} /> */}
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/support" element={<Support />} />
          <Route path="/login" element={ isAuthenticated ? <Navigate to="/" replace /> : <Login />} />

          {/* Protected Layout */}
          <Route path="/" element={isAuthenticated ? (<LayoutAdmin />) : ( <Navigate to="/login" replace />)}>
            {generateRoutes(visibleRoutes)}
            <Route path="*" element={<Error404 />} />
          </Route>
        </Routes>
      </NuqsAdapter>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;