import {
  DashboardOutlined,
  UserOutlined,
  TeamOutlined,
  TagsOutlined,
  FileTextOutlined,
  UnlockOutlined,
  ApartmentOutlined,
  ProfileOutlined,
  BellOutlined,
  BookOutlined,
  IdcardOutlined,
  ContactsOutlined,
} from "@ant-design/icons";

import Category from "../pages/leadCategory";
import Leads from "../pages/leads";
import Meeting from "../pages/meeting";
import Customers from "../pages/customers";

import CRMDashboard from "../pages/salesDashboard";

import util from "../../utils/util";

import SubAdmin from "../pages/permissions/SubAdmin";
import Roles from "../pages/permissions/Roles";
import Permissions from "../pages/permissions/Permissions";
import Profile from "../pages/profile";

import commonObj from "../../commonObj";

import TaskAndReminders from "../pages/tasksAndReminders";
import Scoreboard from "../pages/scoreboard";
import DeleteAccountPolicy from "../pages/delete-account-policy";
import Reminder from "../pages/reminders";


export const PROJECT_ROUTES = [
  {
    title: "Profile",
    path: "/profile",
    component: Profile,
    renderOnSidebar: false,
    icon: UserOutlined,
  },

  {
    title: "Dashboard",
    path: "",
    component: CRMDashboard,
    renderOnSidebar: true,
    icon: DashboardOutlined,
    hidden: () => !util.checkRightAccess("dashboard:view"),
  },

  {
    title: "Permissions",
    path: "/permissions",
    component: Permissions,
    renderOnSidebar: true,
    icon: UnlockOutlined,
    hidden: () => !util.checkRightAccess("permission:read"),
  },

  {
    title: "Roles",
    path: "/roles",
    component: Roles,
    renderOnSidebar: true,
    icon: ApartmentOutlined,
    hidden: () => !util.checkRightAccess("roles:read"),
  },

  {
    title: "Team Management",
    path: "/team-management",
    component: SubAdmin,
    renderOnSidebar: true,
    icon: TeamOutlined,
    hidden: () =>
      commonObj?.role?.roleLevel === 4 ||
      !util.checkRightAccess("user:read"),
  },

  // =========================
  // Customer Management
  // =========================
  {
    title: "Customer Management",
    path: "/customer-management",
    component: Customers,
    renderOnSidebar: true,
    icon: ContactsOutlined,
    hidden: () => !util.checkRightAccess("customer:read"),
  },

  {
    title: "Meeting List",
    path: "/leads-management/meeting",
    component: Meeting,
    renderOnSidebar: true,
    icon: IdcardOutlined,
    hidden: () => !util.checkRightAccess("salesMeeting:read"),
  },

  // {
  //   title: "Tasks",
  //   path: "/tasks",
  //   component: TaskAndReminders,
  //   renderOnSidebar: true,
  //   icon: BookOutlined,
  //   hidden: () => !util.checkRightAccess("task:read"),
  // },

  // {
  //   title: "Delete Account",
  //   path: "/delete-account",
  //   component: DeleteAccountPolicy,
  //   renderOnSidebar: false,
  // },
];


export const getVisibleRoutes = () => {
  return PROJECT_ROUTES.filter((route) => {
    if (typeof route.hidden === "function") {
      return !route.hidden();
    }

    return !route.hidden;
  });
};


export const transformRoutes = (routes) => {
  return routes.map((route) => ({
    title: route.title,
    icon: route.icon,
    url: route.path || "/",
    component: route.component,
    renderOnSidebar: route.renderOnSidebar,
  }));
};