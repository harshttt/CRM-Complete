// "use client";

// import { Button, Form, Input, message, Alert, Spin } from "antd";
// import { useEffect, useState } from "react";
// import { useSettingList, useSettingSave } from "../../../api-hooks/setting";
// import { cn } from "../../../utils/cn";

// // Editable Field component with validation support
// const EditableField = ({ label, value, onChange, fieldKey, form }) => {
 
//   const [editing, setEditing] = useState(false);
//   const [inputValue, setInputValue] = useState(value);

//   useEffect(() => {
//     setInputValue(value);
//     form.setFieldsValue({ [fieldKey]: value });
//   }, [value, form, fieldKey]);

//   const handleToggleEdit = async () => {
//     if (editing) {
//       try {
//         const validatedValue = await form.validateFields([fieldKey]);
//         if (validatedValue[fieldKey] !== value) {
//           onChange(fieldKey, validatedValue[fieldKey]);
//           message.success(`${label} saved!`);
//         }
//         setEditing(false);
//       } catch {
//         message.error("Please fix the validation errors.");
//       }
//     } else {
//       setEditing(true);
//     }
//   };

//   return (
//     <div className="w-full bg-gray-100 p-4 h-28 shadow-sm mb-4">
//       <div className="flex items-center justify-between mb-2">
//         <span className="font-semibold text-gray-800">{label}</span>
//         <Button
//           size="small"
//           onClick={handleToggleEdit}
//           className="bg-[#1d1a72] text-white font-medium w-[15%] border-none"
//         >
//           {editing ? "Save" : "Edit"}
//         </Button>
//       </div>
//       <Form.Item
//         name={fieldKey}
//         rules={getValidationRules(fieldKey, label)}
//         style={{ marginBottom: 0 }}
//         initialValue={inputValue}
//       >
//         <Input
//           disabled={!editing}
//           className={cn({
//             "bg-white text-black": editing,
//             "bg-gray-200 text-gray-500": !editing,
//           })}
//           onChange={(e) => {
//             setInputValue(e.target.value);
//             form.setFieldsValue({ [fieldKey]: e.target.value });
//           }}
//         />
//       </Form.Item>
//     </div>
//   );
// };

// // Validation rules helper function
// function getValidationRules(fieldKey, label) {
//   switch (fieldKey) {
//     case "EMAIL":
//       return [
//         { required: true, message: `Please input your ${label.toLowerCase()}` },
//         { type: "email", message: "Please enter a valid email address" },
//       ];
//     case "PHONE":
//       return [
//         { required: true, message: `Please input your ${label.toLowerCase()}` },
//         {
//           pattern: /^\+?\d{10,15}$/,
//           message: "Please enter a valid phone number (10–15 digits, optional +)",
//         },
//       ];
//     case "LOCATION":
//       return [
//         { required: true, message: `Please input your ${label.toLowerCase()}` },
//         { min: 10, message: `${label} must be at least 10 characters long` },
//       ];
//     default:
//       return [];
//   }
// }

// // Dashboard component
// const Dashboard = () => {
//   const [form] = Form.useForm();

//   const { mutate: saveSetting, isLoading: isSettingRunning } = useSettingSave({
//     qData: { page: 1, limit: 20 },
//     onSuccess: () => {},
//     onError: (err) => {
//       console.error("Failed to save setting:", err);
//     },
//   });

//   const { isLoading, data: {data}, isError, error } = useSettingList({ page: 1, limit: 20 });

//   const [socialLinks, setSocialLinks] = useState({
//     PHONE: "Enter Phone Number",
//     EMAIL: "Enter an Email",
//     LOCATION: "Enter Location",
//     FACEBOOK:'Enter the facebook Link',
//     INSTAGRAM:'Enter the Instagram Link',
//     YOUTUBE:'Enter the Youtube Link',
//     TWITTER:'Enter the Twitter Link'
//   });

//   useEffect(() => {
//     if (data?.length > 0) {
//       const updated = { PHONE: "", EMAIL: "", LOCATION: "", FACEBOOK:"", INSTAGRAM:"", YOUTUBE:"", TWITTER:""};
//       data.forEach((item) => {
//         if (item.type in updated) updated[item.type] = item.data;
//       });
//       setSocialLinks(updated);
//       form.setFieldsValue(updated);
//     }
//   }, [data, form]);

//   const handleChange = (key, value) => {
//     if (socialLinks[key] !== value) {
//       setSocialLinks((prev) => ({ ...prev, [key]: value }));
//       saveSetting({ type: key, data: value });
//     }
//   };

//   const fields = [
//     { label: "Phone Number", fieldKey: "PHONE" },
//     { label: "Email", fieldKey: "EMAIL" },
//     { label: "Location", fieldKey: "LOCATION" },
//     { label: "Facebook Link", fieldKey: "FACEBOOK" },
//     { label: "Instagram Link", fieldKey: "INSTAGRAM" },
//     { label: "Youtube Link", fieldKey: "YOUTUBE" },
//     { label: "Twitter Link", fieldKey: "TWITTER" },
//   ];

//   return (
//     <>
//       {isError && error ? (
//         <Alert message="Error" description={error.message} type="error" showIcon />
//       ) : (
//         <Spin spinning={isLoading || isSettingRunning}>
//           <Form form={form} layout="vertical" className="w-full grid grid-cols-3 gap-5">
//             {fields.map(({ label, fieldKey }) => (
//               <EditableField
//                 key={fieldKey}
//                 label={label}
//                 value={socialLinks[fieldKey]}
//                 fieldKey={fieldKey}
//                 onChange={handleChange}
//                 form={form}
//               />
//             ))}
//           </Form>
//         </Spin>
//       )}
//     </>
//   );
// };

// export default Dashboard;


const Settings = () => {
  return <>Settings</>
}

export default Settings;
