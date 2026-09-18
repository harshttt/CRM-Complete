import React, { useEffect, useState } from "react";
import { Card, Typography, Spin, Alert, Flex } from "antd";
import axiosInstance from "../../../utils/axios";

const { Title, Paragraph } = Typography;

const Privacy = () => {
  const [loading, setLoading] = useState(true);
  const [policy, setPolicy] = useState("");
  const [error, setError] = useState("");

  const fetchPolicy = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("legal/public/PRIVACY");

      const content =
        response?.data?.data?.content ||
        response?.data?.content ||
        response?.data ||
        "";

      setPolicy(content);
    } catch (err) {
      console.error("Delete policy fetch error:", err);
      setError("Failed to load Delete Account Policy.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPolicy();
  }, []);

  return (
    <div style={{width:'100vw'}}>
    <Flex justify="center" style={{ background: "#f5f7fa", minHeight: "100vh" }}>
      <Card style={{ width: "100%", borderRadius: 10, boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}>
        <Title level={2} style={{ textAlign: "center" }}> Privacy Policy </Title>

        {loading && (
          <Flex justify="center" align="center" style={{ padding: "40px 0" }}>
            <Spin size="large" />
          </Flex>
        )}

        {error && <Alert type="error" message={error} showIcon />}

        {!loading && !error && (
          <Typography>
            {typeof policy === "string" && policy.includes("<") ? (
              <div dangerouslySetInnerHTML={{ __html: policy }} />
            ) : (
              <Paragraph style={{ whiteSpace: "pre-line", fontSize: 15 }}> {policy} </Paragraph>
            )}
          </Typography>
        )}
      </Card>
    </Flex>
    </div>
  );
};

export default Privacy;