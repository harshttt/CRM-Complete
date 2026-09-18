import { Button, Col, Form, message, Modal, Row, Space, Upload, Tag, Typography, Table, Divider } from "antd";
import { useState } from "react";
import { useLeadBulkImport } from "../../../../api-hooks/leads";
import { CopyOutlined, DownloadOutlined, ExclamationCircleOutlined, ImportOutlined } from "@ant-design/icons";

/*──────────── Import Lead Modal ────────────*/
export default function ImportLeadModal({ open, onCancel, onImported }) {
  const [fileList, setFileList] = useState([]);
  const [importResult, setImportResult] = useState(null); // store API response data.data
  const [messageApi, contextHolder] = message.useMessage();

  // Define the hook after state so we can setImportResult in callbacks
  const { mutate, isPending: uploading } = useLeadBulkImport({
    onSuccess: (res) => {
      messageApi.success(res?.message || "Bulk import completed");
      const respData = res?.data || null;
      setImportResult(respData);
      setFileList([]);
      onImported?.(respData);
    },
    onError: (err) => {
      const errMsg = err?.message || err?.response?.data?.message || "Failed to import leads";
      messageApi.error(errMsg);
    },
  });

  const beforeUpload = () => false;

  const handleChange = (info) => {
    // keep only the last (single) file
    setFileList(info.fileList.slice(-1));
  };

  const handleRemove = () => {
    setFileList([]);
  };

  const handleUpload = () => {
    if (!fileList || fileList.length === 0) {
      messageApi.error("Please Select a file");
      return;
    }

    const uploadFile = fileList[0].originFileObj || fileList[0].file || fileList[0];

    const formData = new FormData();
    formData.append("file", uploadFile);

    mutate(formData);
  };

  // Download sample file (you can make this hit an API as needed)
  const handleDownloadSample = () => {
    const url = "/sample_leads.csv";
    const link = document.createElement("a");
    link.href = url;
    link.download = "lead_import_sample.csv";
    link.click();
  };

  // Convert failedRowsPreview to CSV and download
  const downloadFailedRowsCsv = () => {
    if (!importResult?.failedRowsPreview?.length) {
      messageApi.info("No failed rows to download");
      return;
    }

    // Build CSV: columns -> error, and all keys from `row` flattened as JSON string
    const rows = importResult.failedRowsPreview;
    // We'll create columns: error, rowJson
    const csvRows = [["error", "row_json"]];

    rows.forEach((r) => {
      const error = (r.error || "").replace(/"/g, '""'); // escape quotes
      let rowJson = "";
      try {
        rowJson = JSON.stringify(r.row || {});
      } catch (e) {
        rowJson = String(r.row || "");
      }
      rowJson = rowJson.replace(/"/g, '""'); // escape quotes
      csvRows.push([`"${error}"`, `"${rowJson}"`]);
    });

    const csvContent = csvRows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `failed_rows_batch_${importResult.batchId || "unknown"}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Table for failed rows preview
  const failedCols = [
    {
      title: "#",
      dataIndex: "idx",
      key: "idx",
      width: 60,
      render: (_, __, index) => index + 1,
    },
    {
      title: "Error",
      dataIndex: "error",
      key: "error",
      render: (text) => <span>{text}</span>,
    },
    {
      title: "Row (preview)",
      dataIndex: "row",
      key: "row",
      render: (row) => {
        // Show a compact stringified preview of the row object
        try {
          const json = JSON.stringify(row);
          return (
            <Tooltip title={json}>
              <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", display: "inline-block", maxWidth: 360 }}>
                {json}
              </span>
            </Tooltip>
          );
        } catch {
          return String(row);
        }
      },
    },
  ];

  return (
    <>
      <Modal
        open={open}
        onCancel={() => {
          onCancel?.();
          setFileList([]);
          setImportResult(null);
        }}
        title={
          <Space>
            <ImportOutlined />
            <span>Import Leads</span>
          </Space>
        }
        width={800}
        footer={
          <Space style={{ justifyContent: "flex-end", width: "100%" }}>
            <Button
              onClick={() => {
                onCancel?.();
                setFileList([]);
                setImportResult(null);
              }}
            >
              Close
            </Button>

            <Button
              type="primary"
              onClick={handleUpload}
              loading={uploading}
              disabled={!fileList.length || uploading}
            >
              {uploading ? "Importing..." : "Import"}
            </Button>
          </Space>
        }
      >
        {contextHolder}

        {/* top actions */}
        <Row justify="space-between" align="middle" style={{ marginBottom: 8 }}>
          <Col>
            <Button type="link" onClick={handleDownloadSample} style={{ paddingLeft: 0 }}>
              <DownloadOutlined /> Download Sample File
            </Button>
          </Col>

          {/* If import result exists, show quick stats and download failures */}
          <Col>
            {importResult ? (
              <Space>
                <Tag color="blue">Batch: {importResult.batchId}</Tag>
                <Tag>Total: {importResult.totalRows ?? "-"}</Tag>
                <Tag color="green">Processed: {importResult.processedCount ?? 0}</Tag>
                <Tag color="red">Failed: {importResult.failedCount ?? 0}</Tag>
                <Button size="small" onClick={downloadFailedRowsCsv} disabled={!importResult.failedRowsPreview?.length}>
                  <DownloadOutlined /> Failed CSV
                </Button>
                <Button size="small" icon={<CopyOutlined />}
                  onClick={() => {
                    navigator.clipboard?.writeText(importResult.batchId || "");
                    messageApi.success("Batch id copied");
                  }}
                />
              </Space>
            ) : null}
          </Col>
        </Row>

        <p style={{ marginBottom: 8 }}>Upload CSV / Excel file to import the leads</p>

        <Upload.Dragger
          name="file"
          multiple={false}
          fileList={fileList}
          beforeUpload={beforeUpload}
          onChange={handleChange}
          onRemove={handleRemove}
          accept=".csv,.xlsx,.xls"
        >
          <p className="ant-upload-drag-icon">
            <ImportOutlined />
          </p>
          <p className="ant-upload-text">Click or drag file to this area to upload</p>
          <p className="ant-upload-hint">Accepted formats: CSV, XLSX, XLS.</p>
        </Upload.Dragger>

        {/* If there is an import result, show details */}
        {importResult ? (
          <>
            <Divider style={{ marginTop: 16 }} />
            <Typography.Title level={5}>Import Result</Typography.Title>
            <Space align="center" size={6}>
              <ExclamationCircleOutlined style={{ color: '#faad14' }} />
              <Typography.Text type="secondary">Preview of failed rows</Typography.Text>
              <Typography.Text type="secondary" style={{ fontSize: 12 }}>(showing up to first 100)</Typography.Text>
            </Space>
            
            <Table
              style={{ marginTop: 12 }}
              dataSource={(importResult.failedRowsPreview || []).slice(0, 100).map((r, i) => ({ ...r, key: i }))}
              columns={failedCols}
              pagination={false}
              size="small"
            />
          </>
        ) : null}
      </Modal>
    </>
  );
}
