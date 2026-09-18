// import {Button, Card, Col, Form, Input, Row, Typography, Divider, Space, message, Flex} from "antd";
// import {LockOutlined, MailOutlined, LoginOutlined, EyeInvisibleOutlined, EyeTwoTone} from "@ant-design/icons";
// import { useLogin } from "../../api-hooks/admin";
// import util from "../../utils/util";
// import { requestNotificationPermission } from "../../utils/notification";
// import { useNavigate } from "react-router-dom";

// const { Title, Text } = Typography;

// const Login = () => {
//   const [form] = Form.useForm();
//   const navigate = useNavigate();
//   const [messageApi, contextHolder ] = message.useMessage();
//   const {mutate:login, isPending:loading } = useLogin({
//     onSuccess:(data) => {
//        util.setUserData(data);
//        messageApi.success(data.message);
//        navigate('/', {replace:true});
//     },
//     onError:(data) => {
//       messageApi.error(data.message);
//     }
//   });

//   const handleLogin = (payload) => {
//     const initNotification = async () => {
//       const token = await requestNotificationPermission();
//       login({fcmToken:token, ...payload})
//     }
//   }


//   return (
//     <div style={{minHeight: "100vh", width: "100vw", display: "flex", alignItems: "stretch", justifyContent: "center", background:"radial-gradient(circle at 0% 0%, #dbe7ff 0, #f5f7ff 35%, #ffffff 100%)"}}>
//       {contextHolder}
//       <Row style={{ flex: 1 }} justify="center" align="middle" gutter={[0, 0]}>
//         {/* Left Brand Panel */}
//         <Col xs={0} md={10} style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", padding: "32px"}}>
//           <div
//             style={{ maxWidth: 420, width: "100%", padding: 28, borderRadius: 28, color: "#e5e7eb",
//               background:"linear-gradient(145deg,rgba(15,23,42,0.96),rgba(37,99,235,0.9))",
//               boxShadow: "0 30px 80px rgba(15,23,42,0.6)", border: "1px solid rgba(148,163,184,0.5)",
//             }}
//           >
//             <Space direction="vertical" size={18} style={{ width: "100%" }}>
//               {/* Logo area */}
//               <Space align="center">
//                 <div
//                   style={{width: 42, height: 42, borderRadius: "999px",
//                     background: "conic-gradient(from 210deg, #60a5fa, #a855f7, #22d3ee, #60a5fa)",
//                     padding: 2, boxShadow: "0 10px 30px rgba(59,130,246,0.7)",
//                   }}
//                 >
//                   <Flex justify="center" align="center"
//                     style={{width: "100%", height: "100%", borderRadius: "999px",
//                       background: "radial-gradient(circle at 30% 20%, #eff6ff, #1e3a8a)",
//                       color: "#e5edff", fontWeight: 700, fontSize: 18,
//                     }}
//                   >
//                     <img src="/nextHikesLogoShort.png" width={30} height={30}/>
//                   </Flex>
//                 </div>
//                 <div>
//                   <div style={{fontSize: 18, fontWeight: 600, color: "#e5edff",}}> NEXTHIKES CRM</div>
//                   <div style={{fontSize: 12, color: "#9ca3af"}}>Sales & Lead Management Suite</div>
//                 </div>
//               </Space>

//               <div>
//                 <Title level={3} style={{ color: "#e5edff", marginBottom: 8, marginTop: 16 }}> Welcome back 👋</Title>
//                 <Text style={{ color: "#e5e7eb", fontSize: 13 }}>Log in to manage leads, meetings, tasks and team performance from one central place. </Text>
//               </div>

//               <Divider style={{ borderColor: "rgba(148,163,184,0.4)" }} />

//               <Space direction="vertical" size={8} style={{ fontSize: 12 }}>
//                 <Text style={{ color: "#9ca3af" }}> • Track leads across branches & teams</Text>
//                 <Text style={{ color: "#9ca3af" }}> • Monitor daily activities: calls, meetings & site visits</Text>
//                 <Text style={{ color: "#9ca3af" }}> • Get real-time visibility on funnel & revenue</Text>
//               </Space>
//             </Space>
//           </div>
//         </Col>

//         {/* Right Login Card */}
//         <Col xs={24} md={14}style={{display: "flex", justifyContent: "center", padding: "32px 18px"}}>
//           <Card
//             bordered={false}
//             style={{width: "100%", maxWidth: 440, borderRadius: 24, backdropFilter: "blur(16px)",
//               boxShadow: "0 24px 60px rgba(15,23,42,0.12)", border: "1px solid rgba(226,232,255,0.9)",
//               background:"linear-gradient(145deg,rgba(255,255,255,0.98),rgba(243,247,255,0.99))",
//             }}
//             styles={{
//               body:{
//                 padding:26
//               }
//             }}
//           >
//             <Space direction="vertical" size={6}style={{ width: "100%", marginBottom: 12 }}>
//               <Text type="secondary" style={{ fontSize: 12 }}> Nexthikes CRM</Text>
//               <Title level={4} style={{ margin: 0 }}>Sign in to your account</Title>
//               <Text type="secondary" style={{ fontSize: 12 }}> Use your work email and password provided by your administrator.</Text>
//             </Space>

//             {/* <div
//               style={{
//                 display: "flex",
//                 background: "#f5f7ff",
//                 borderRadius: 999,
//                 padding: 3,
//                 marginBottom: 18,
//               }}
//             >
//               <Button
//                 type={isPasswordLogin ? "primary" : "text"}
//                 size="small"
//                 onClick={() => setIsPasswordLogin(true)}
//                 style={{
//                   flex: 1,
//                   borderRadius: 999,
//                   fontSize: 12,
//                   height: 32,
//                 }}
//               >
//                 Password
//               </Button>
//               <Button
//                 type={!isPasswordLogin ? "primary" : "text"}
//                 size="small"
//                 onClick={() => setIsPasswordLogin(false)}
//                 style={{
//                   flex: 1,
//                   borderRadius: 999,
//                   fontSize: 12,
//                   height: 32,
//                 }}
//               >
//                 OTP (Email)
//               </Button>
//             </div> */}

//             <Form layout="vertical" form={form} onFinish={login} autoComplete="off">
//               <Form.Item name="emailOrPhone" label="Work Email" rules={[ { required: true, message: "Please enter your email" }]}>
//                 <Input size="large" type={'email'} prefix={<MailOutlined style={{ color: "#bfbfbf" }} />} placeholder="you@company.com" allowClear />
//               </Form.Item>

//                 <Form.Item name="password" label="Password" rules={[{ required: true, message: "Please enter password" }]}>
//                   <Input.Password size="large" prefix={<LockOutlined style={{ color: "#bfbfbf" }} />}
//                     iconRender={(visible) =>  visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />}
//                     placeholder="Enter your password"
//                   />
//                 </Form.Item>

//               <Row justify="space-between" align="middle">
//                 {/* <Col>
//                   <Form.Item
//                     name="remember"
//                     valuePropName="checked"
//                     noStyle
//                     initialValue={true}
//                   >
//                     <Checkbox>Remember me</Checkbox>
//                   </Form.Item>
//                 </Col> */}
//                 {/* <Col>
//                   <Button type="link" size="small" style={{ paddingRight: 0 }}> Forgot password?</Button>
//                 </Col> */}
//               </Row>

//               <Form.Item style={{ marginTop: 12 }}>
//                 <Button type="primary" htmlType="submit" size="large" icon={<LoginOutlined />}
//                   loading={loading} block style={{borderRadius: 999,boxShadow: "0 12px 30px rgba(37,99,235,0.45)",}}
//                 >
//                   Sign in
//                 </Button>
//               </Form.Item>
//             </Form>

//             <Divider style={{ margin: "14px 0 10px" }} />

//             <Flex justify="space-between" align="center" gap={8}>
//               <Text type="secondary" style={{ fontSize: 11 }}>Having trouble logging in?</Text>
//               <Text type="secondary" style={{ fontSize: 11 }}>Contact your admin or IT support.</Text>
//             </Flex>

//           </Card>
//         </Col>
//       </Row>
//     </div>
//   );
// };

// export default Login;


import React from "react";
import {
  Button,
  Card,
  Col,
  Form,
  Input,
  Row,
  Typography,
  Divider,
  Space,
  message,
  Flex,
} from "antd";
import {
  LockOutlined,
  MailOutlined,
  LoginOutlined,
  EyeInvisibleOutlined,
  EyeTwoTone,
} from "@ant-design/icons";
import { useLogin } from "../../api-hooks/admin";
import util from "../../utils/util";
import { requestNotificationPermission } from "../../utils/notification";
import { useNavigate } from "react-router-dom";

const { Title, Text } = Typography;

const Login = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();

  const { mutate: login, isPending: loading } = useLogin({
    onSuccess: (data) => {
      util.setUserData(data);
      messageApi.success(data.message);
      navigate("/", { replace: true });
    },

    onError: (data) => {
      messageApi.error(data.message);
    },
  });

  /**
   * Login handler
   * UI changes do not affect this logic.
   */
  const handleLogin = async (payload) => {
    try {
      const token = await requestNotificationPermission();

      console.log("FCM TOKEN:", token);

      if (typeof token === "string" && token.trim()) {
        login({
          ...payload,
          fcmToken: token,
        });
      } else {
        // Don't send fcmToken if token is null/undefined/empty
        login(payload);
      }
    } catch (err) {
      console.error("FCM permission error:", err);

      // Login without FCM token
      login(payload);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100vw",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background:
          "radial-gradient(circle at 10% 20%, #e8f0fe 0%, #f4f7fb 40%, #ffffff 100%)",
        padding: "24px",
        boxSizing: "border-box",
      }}
    >
      {contextHolder}

      <div
        style={{
          width: "100%",
          maxWidth: 920,
        }}
      >
        <Row
          gutter={[32, 24]}
          align="stretch"
          justify="center"
        >
          {/* ================= LEFT BRAND PANEL ================= */}
          <Col
            xs={0}
            md={12}
            style={{
              display: "flex",
            }}
          >
            <div
              style={{
                width: "100%",
                padding: "32px 28px",
                borderRadius: 24,
                background:
                  "linear-gradient(160deg, #093979 0%, #0d5cb6 55%, #1877f2 100%)",
                boxShadow:
                  "0 18px 45px rgba(13, 92, 182, 0.3)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                boxSizing: "border-box",
              }}
            >
              <div>
                {/* Logo */}
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "7px 14px",
                    borderRadius: 12,
                    background: "#ffffff",
                    boxShadow:
                      "0 4px 12px rgba(0, 0, 0, 0.12)",
                    marginBottom: 8,
                  }}
                >
                  <img
                    src="/logo.webp"
                    alt="Optronix"
                    style={{
                      height: 32,
                      width: "auto",
                      maxWidth: 160,
                      objectFit: "contain",
                      display: "block",
                    }}
                  />
                </div>

                <div
                  style={{
                    color: "rgba(255, 255, 255, 0.75)",
                    fontSize: 12.5,
                    marginBottom: 20,
                  }}
                >
                  Sales Meeting & Visit
                  Management Suite                </div>

                <Title
                  level={4}
                  style={{
                    color: "#ffffff",
                    margin: "0 0 8px 0",
                    fontWeight: 600,
                  }}
                >
                  Welcome back 👋
                </Title>

                <Text
                  style={{
                    color: "rgba(255, 255, 255, 0.85)",
                    fontSize: 13,
                    lineHeight: 1.5,
                    display: "block",
                  }}
                >
                  Log in to schedule visits, manage meetings, track follow-ups, and drive sales performance from one central place.
                </Text>
              </div>

              <div>
                <Divider
                  style={{
                    borderColor: "rgba(255, 255, 255, 0.18)",
                    margin: "18px 0 14px",
                  }}
                />

                <Space
                  direction="vertical"
                  size={8}
                  style={{
                    width: "100%",
                  }}
                >
                  <Text
                    style={{
                      color: "rgba(255, 255, 255, 0.75)",
                      fontSize: 12,
                    }}
                  >
                    • Track leads across branches & teams
                  </Text>

                  <Text
                    style={{
                      color: "rgba(255, 255, 255, 0.75)",
                      fontSize: 12,
                    }}
                  >
                    • Monitor daily activities: calls, meetings & site
                    visits
                  </Text>

                  <Text
                    style={{
                      color: "rgba(255, 255, 255, 0.75)",
                      fontSize: 12,
                    }}
                  >
                    • Get real-time visibility on funnel & revenue
                  </Text>
                </Space>
              </div>
            </div>
          </Col>

          {/* ================= RIGHT LOGIN CARD ================= */}
          <Col
            xs={24}
            md={12}
            style={{
              display: "flex",
            }}
          >
            <Card
              bordered={false}
              style={{
                width: "100%",
                borderRadius: 24,
                boxShadow:
                  "0 18px 45px rgba(15, 23, 42, 0.08)",
                border:
                  "1px solid rgba(230, 235, 245, 0.9)",
                background: "#ffffff",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
              styles={{
                body: {
                  padding: "32px 28px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  height: "100%",
                  boxSizing: "border-box",
                },
              }}
            >
              <div>
                {/* Header */}
                <Space
                  direction="vertical"
                  size={3}
                  style={{
                    width: "100%",
                    marginBottom: 20,
                  }}
                >
                  <Text
                    type="secondary"
                    style={{
                      fontSize: 12,
                    }}
                  >
                    Optronix CRM
                  </Text>

                  <Title
                    level={4}
                    style={{
                      margin: 0,
                      fontWeight: 600,
                    }}
                  >
                    Sign in to your account
                  </Title>

                  <Text
                    type="secondary"
                    style={{
                      fontSize: 12,
                    }}
                  >
                    Use your work email and password provided by your
                    administrator.
                  </Text>
                </Space>

                {/* Login Form */}
                <Form
                  layout="vertical"
                  form={form}
                  onFinish={handleLogin}
                  autoComplete="off"
                >
                  {/* Email */}
                  <Form.Item
                    name="emailOrPhone"
                    label={
                      <span
                        style={{
                          fontSize: 13,
                          fontWeight: 500,
                        }}
                      >
                        Work Email
                      </span>
                    }
                    rules={[
                      {
                        required: true,
                        message: "Please enter your email",
                      },
                    ]}
                    style={{
                      marginBottom: 14,
                    }}
                  >
                    <Input
                      size="large"
                      type="email"
                      prefix={
                        <MailOutlined
                          style={{
                            color: "#bfbfbf",
                          }}
                        />
                      }
                      placeholder="you@company.com"
                      allowClear
                      style={{
                        borderRadius: 10,
                      }}
                    />
                  </Form.Item>

                  {/* Password */}
                  <Form.Item
                    name="password"
                    label={
                      <span
                        style={{
                          fontSize: 13,
                          fontWeight: 500,
                        }}
                      >
                        Password
                      </span>
                    }
                    rules={[
                      {
                        required: true,
                        message: "Please enter password",
                      },
                    ]}
                    style={{
                      marginBottom: 20,
                    }}
                  >
                    <Input.Password
                      size="large"
                      prefix={
                        <LockOutlined
                          style={{
                            color: "#bfbfbf",
                          }}
                        />
                      }
                      iconRender={(visible) =>
                        visible ? (
                          <EyeTwoTone />
                        ) : (
                          <EyeInvisibleOutlined />
                        )
                      }
                      placeholder="Enter your password"
                      style={{
                        borderRadius: 10,
                      }}
                    />
                  </Form.Item>

                  {/* Login Button */}
                  <Form.Item
                    style={{
                      marginBottom: 16,
                    }}
                  >
                    <Button
                      type="primary"
                      htmlType="submit"
                      size="large"
                      icon={<LoginOutlined />}
                      loading={loading}
                      block
                      style={{
                        borderRadius: 10,
                        height: 44,
                        fontWeight: 600,
                        background:
                          "linear-gradient(135deg, #1677ff 0%, #0958d9 100%)",
                        boxShadow:
                          "0 8px 20px rgba(22, 119, 255, 0.35)",
                      }}
                    >
                      Sign in
                    </Button>
                  </Form.Item>
                </Form>
              </div>

              {/* Footer */}
              <div>
                <Divider
                  style={{
                    margin: "14px 0 10px",
                  }}
                />

                <Flex
                  justify="space-between"
                  align="center"
                >
                  <Text
                    type="secondary"
                    style={{
                      fontSize: 11,
                    }}
                  >
                    Having trouble logging in?
                  </Text>

                  <Text
                    type="secondary"
                    style={{
                      fontSize: 11,
                    }}
                  >
                    Contact admin
                  </Text>
                </Flex>
              </div>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default Login;