/*──────────── Lead Timeline Modal ────────────*/
export default function LeadTimelineModal({ lead, onClose }) {
  if (!lead) return null;
  const items = getDummyTimeline(lead);

  return (
    <Modal
      open={!!lead}
      onCancel={onClose}
      footer={null}
      title={
        <Space style={{ padding: 15 }}>
          <FieldTimeOutlined />
          <span>Lead Timeline – {lead.leadName}</span>
        </Space>
      }
      width={620}
    >
      <Timeline style={{ marginTop: 8, padding: 15 }}>
        {items?.map((item, idx) => (
          <Timeline.Item color={item.color} key={idx}>
            <Text strong>{item.label}</Text>
            <br />
            <Text type="secondary" style={{ fontSize: 12 }}>{item.content}</Text>
          </Timeline.Item>
        ))}
      </Timeline>
    </Modal>
  );
}


/*──────────── LEAD TIMELINE MODAL ────────────*/
function getDummyTimeline(lead) {
  if (!lead) return [];
  const raw = lead.raw || {};
  const baseDate = formatDate(raw.createdAt) || "2025-11-20";

  return [
    {
      label: `${baseDate} – Lead created`,
      content: `Lead created from ${raw.source || "Unknown source"}.`,
      color: "blue",
    },
    {
      label: `${formatDate(raw.createdAt)} – Stage: ${lead.stages}`,
      content: `Stage set to ${lead.stages}.`,
      color: "purple",
    },
    {
      label: `${formatDate(raw.createdAt)} – Call logged`,
      content: `Introductory call with ${lead.leadName || "lead"}.`,
      color: "green",
    },
    {
      label: `${formatDate(raw.updatedAt)} – Task`,
      content: `Follow-up planned for ${lead.nextFollowup || "N/A"}.`,
      color: "orange",
    },
    {
      label: `${formatDate(raw.updatedAt)} – Notes`,
      content: lead.notes || "No notes added yet.",
      color: "gray",
    },
  ];
}

