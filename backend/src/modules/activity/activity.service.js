import Activity from "./activity.model.js";

export const getLeadActivities = async (leadId) => {
  return Activity.find({ lead: leadId })
    .populate("user", "firstName lastName email")
    .sort({ createdAt: -1 });
};

export const createActivity = async (payload) => {
  return Activity.create(payload);
};
