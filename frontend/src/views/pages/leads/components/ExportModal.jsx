import { ExportOutlined } from "@ant-design/icons";
import {AutoComplete,Button,Checkbox,Col,DatePicker,Flex,Form,message,Modal,Row,Select,Space,Spin,Typography} from "antd";
import { useUserDropdown, useUserList } from "../../../../api-hooks/user";
import { useRef, useState } from "react";
import commonObj from "../../../../commonObj";
import { useLeadBulkExport } from "../../../../api-hooks/leads";
import { useCategoryList } from "../../../../api-hooks/category";
import util from "../../../../utils/util";

const { RangePicker } = DatePicker;
const { Text } = Typography;

export default function ExportModal({ open, onCancel }) {
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();
  const [exportAll, setExportAll] = useState(false);
  const debounceRef = useRef(null);

  const { data: usrRes, isFetching:isUsrLoading, refetchWithQuery: refetchUsersWithQuery } = useUserDropdown({qData:{ page: 1, limit: 20 }});

  const { data: ctgryRes, isFetching: isCtgryLoading } = useCategoryList({ qData: { page: 1, limit: 20 } });

  const categoryOptions = ctgryRes?.data || [];
  const usrOptions = usrRes?.data || [];

  const stageOptions = [
    { label: "All", value: "ALL" },
    ...util.enumToOptions(commonObj?.constants?.leadEnums?.STAGE),
  ];

  const sourceOptions = [
    { label: "All", value: "ALL" },
    ...util.enumToOptions(commonObj?.constants?.leadEnums?.SOURCE),
  ];

  const statusOptions = [
    { label: "All", value: "ALL" },
    ...util.enumToOptions(commonObj?.constants?.leadEnums?.STATUS),
  ];

  const { mutate: exportMutate, isPending: isExportPending } =  useLeadBulkExport({
      onSuccess: (res) => {
        try {
          const byteArray = new Uint8Array(res?.data);
          const blob = new Blob([byteArray], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          });

          if (!blob.size) {
            messageApi.error("Received empty file from backend");
            return;
          }

          messageApi.success("Excel exported successfully");

          const url = window.URL.createObjectURL(blob);
          const link = document.createElement("a");

          link.href = url;
          link.download = "leads-export.xlsx";

          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);

          window.URL.revokeObjectURL(url);

          handleCancel();
        } catch (error) {
          messageApi.error("Download failed");
        }
      },
      onError: (err) => {
        messageApi.error(err?.message || "Error exporting Leads");
      },
    });

  const handleUserSearch = (value) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      if (value) {
        refetchUsersWithQuery({ q: value });
      }
    }, 400);
  };

  const handleExport = () => {
    form.validateFields().then((values) => {
      if (!exportAll) {
        const hasFilter = Object.values(values).some(
          (val) => val && (Array.isArray(val) ? val.length : true)
        );

        if (!hasFilter) {
          messageApi.warning(
            "Please select at least one filter or enable Export All"
          );
          return;
        }
      }

      let payload = exportAll
        ? { exportAll: true }
        : {
            stage: values.stage,
            source: values.source,
            status: values.status,
            category: values.category,
            assignedTo: values.assignedTo,
            createdDateFrom: values.dateRange
              ? values.dateRange[0].format("YYYY-MM-DD")
              : undefined,
            createdDateTo: values.dateRange
              ? values.dateRange[1].format("YYYY-MM-DD")
              : undefined,
            commentedDateFrom: values.commentedDateRange
              ? values.commentedDateRange[0].format("YYYY-MM-DD")
              : undefined,
            commentedDateTo: values.commentedDateRange
              ? values.commentedDateRange[1].format("YYYY-MM-DD")
              : undefined,
          };

      if (!exportAll) {
        Object.keys(payload).forEach((key) => {
          if (payload[key] === "ALL") {
            payload[key] = undefined;
          }
        });
      }

      exportMutate(payload);
    });
  };

  const handleCancel = () => {
    form.resetFields();
    setExportAll(false);
    onCancel();
  };

  return (
    <Modal
      open={open}
      onCancel={handleCancel}
      width={650}
      title={
        <Space>
          <ExportOutlined />
          <span>Export Leads</span>
        </Space>
      }
      footer={
        <Space style={{ justifyContent: "flex-end", width: "100%" }}>
          <Button onClick={handleCancel}>Cancel</Button>
          <Button
            type="primary"
            icon={<ExportOutlined />}
            onClick={handleExport}
            loading={isExportPending}
            disabled={isExportPending}
          >
            Export
          </Button>
        </Space>
      }
    >
      {contextHolder}

      <Form layout="vertical" form={form}>
        {/* 🔥 EXPORT ALL OPTION */}
        <Form.Item>
          <Checkbox
            checked={exportAll}
            onChange={(e) => setExportAll(e.target.checked)}
          >
            Export All (Ignore Filters)
          </Checkbox>
        </Form.Item>

        <Row gutter={12}>
          <Col span={12}>
            <Form.Item label="Stage" name="stage">
              <Select
                placeholder="Select Stage"
                allowClear
                disabled={exportAll}
                options={stageOptions}
              />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item label="Source" name="source">
              <Select
                placeholder="Select Source"
                allowClear
                disabled={exportAll}
                options={sourceOptions}
              />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item label="Status" name="status">
              <Select
                placeholder="Select Status"
                allowClear
                disabled={exportAll}
                options={statusOptions}
              />
            </Form.Item>
          </Col>


          <Col span={12}>
            {/* Hidden field to store ID */}
            <Form.Item name="assignedTo" hidden />

            {/* Visible field for Name */}
            <Form.Item name="assignedToName" label="Assigned To">
              <AutoComplete
                placeholder="All Users"
                allowClear
                disabled={exportAll}
                options={[
                  { label: "All", value: "ALL", id: "ALL" },
                  ...usrOptions.map((item) => ({
                    label: item?.fullName,
                    value: item?.fullName,
                    id: item?.id,          
                  })),
                ]}
                onSearch={handleUserSearch}
                onSelect={(value, option) => {
                  form.setFieldsValue({
                    assignedToName: value,
                    assignedTo: option.id,
                  });
                }}
                onClear={() => {
                  form.setFieldsValue({
                    assignedToName: undefined,
                    assignedTo: undefined,
                  });
                }}
                notFoundContent={ isUsrLoading ? ( <Flex justify="center" align="center"> <Spin size="small" /> </Flex>) : null }
              />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item label="Category" name="category">
              <Select
                placeholder="Select Category"
                allowClear
                disabled={exportAll}
                loading={isCtgryLoading}
                options={[
                  { label: "All", value: "ALL" },
                  ...categoryOptions.map((item) => ({
                    label: item?.name,
                    value: item?.id,
                  })),
                ]}
              />
            </Form.Item>
          </Col>

          <Col span={24}>
            <Form.Item label="Created Date Range" name="dateRange">
              <RangePicker
                style={{ width: "100%" }}
                disabled={exportAll}
              />
            </Form.Item>
          </Col>

          <Col span={24}>
            <Form.Item label="Commented Date Range" name="commentedDateRange">
              <RangePicker
                style={{ width: "100%" }}
                disabled={exportAll}
              />
            </Form.Item>
          </Col>
        </Row>

        <Text type="secondary">
          Choose filters or enable Export All to download the full dataset.
        </Text>
      </Form>
    </Modal>
  );
}
