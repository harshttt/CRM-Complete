import authRoutes from "./auth/auth.routes.js";
import userRoutes from "./user/user.route.js";
import roleRoutes from "./role/role.routes.js";
import leadRoutes from "./lead/lead.routes.js";
// import leadWebhookRoutes from "./lead/leadWebhook.routes.js";
import propertyRoutes from "./property/property.routes.js";
import categoryRoutes from "./category/category.routes.js";
import taskRoutes from "./task/task.routes.js";
import permissionRoutes from "./permission/permission.routes.js";
import commentRoutes from "./comment/comment.routes.js";
import meetingRoutes from "./meeting/meeting.routes.js";
import reminderRoutes from "./reminder/reminder.routes.js";
import  constantsRoutes  from "../constants/constants.routes.js";
import salespersonRoutes from "./salesperson/salesperson.routes.js";
import legalRoutes from "./legal/legal.routes.js";
// import webhookRoutes from "./facebook/facebook.routes.js";
import salesMeetingRoutes from "./salesMeeting/salesMeeting.routes.js";
import customerRoutes from "./customer/customer.routes.js";
import followUpRoutes from "./followUp/followUp.routes.js";
import { auth } from "../middlewares/auth.middleware.js";

export default function loadModuleRoutes(app) {
  app.use("/auth", authRoutes);
  app.use("/user", auth, userRoutes);
  app.use("/role", auth, roleRoutes);
  app.use("/property", auth, propertyRoutes);
  app.use("/meeting", auth, meetingRoutes);
  app.use("/reminders", auth,reminderRoutes );

  // app.use("/lead", leadWebhookRoutes);


  app.use("/lead", auth, leadRoutes);
  app.use("/comment", auth, commentRoutes);
  app.use("/constants", auth, constantsRoutes);
  app.use("/salesperson", auth, salespersonRoutes);
  // app.use("/webhook", webhookRoutes);

  // Sales Meeting & Visit Management System
  app.use("/sales-meeting", auth, salesMeetingRoutes);
  app.use("/customer", auth, customerRoutes);
  app.use("/follow-up", auth, followUpRoutes);

  app.use("/category", auth, categoryRoutes);
  app.use("/task", auth, taskRoutes); 
  app.use("/permission", auth, permissionRoutes);
  app.use("/legal",legalRoutes);
}