import { useEffect, useState } from "react";
import { Card, Typography, Spin, Alert, Flex } from "antd";
import axiosInstance from "../../utils/axios";

const { Title, Paragraph } = Typography;

const LegalPage = ({ title, apiEndpoint }) => {
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState("");
  const [error, setError] = useState("");

  const fetchContent = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(apiEndpoint);

      const data =
        response?.data?.data?.content ||
        response?.data?.content ||
        response?.data ||
        "";

      setContent(data);
    } catch (err) {
      console.error(`${title} fetch error:`, err);
      setError(`Failed to load ${title}.`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContent();
  }, [apiEndpoint]);

  return (
    <Flex
      justify="center"
      style={{
        padding: "40px 16px",
        background: "#f5f7fa",
        minHeight: "100vh",
      }}
    >
      <Card
        style={{
          width: "100%",
          maxWidth: 900,
          borderRadius: 10,
          boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
        }}
      >
        <Title level={2} style={{ textAlign: "center" }}>
          {title}
        </Title>

        {loading && (
          <Flex justify="center" style={{ padding: "40px 0" }}>
            <Spin size="large" />
          </Flex>
        )}

        {error && <Alert type="error" message={error} showIcon />}

        {!loading && !error && (
          <Typography>
            {typeof content === "string" && content.includes("<") ? (
              <div dangerouslySetInnerHTML={{ __html: content }} />
            ) : (
              <Paragraph style={{ whiteSpace: "pre-line", fontSize: 15 }}>
                {content}
              </Paragraph>
            )}
          </Typography>
        )}
      </Card>
    </Flex>
  );
};

export default LegalPage;