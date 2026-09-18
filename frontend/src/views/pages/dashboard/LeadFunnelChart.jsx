import { Pie } from "@ant-design/plots";

export default function LeadFunnelChart() {
  const data = [
    { stage: "New", value: 120 },
    { stage: "Contacted", value: 95 },
    { stage: "Meeting", value: 60 },
    { stage: "Visited", value: 40 },
    { stage: "Won", value: 25 },
  ];

  const config = {
    data,
    angleField: "value",
    colorField: "stage",
    radius: 0.8,
    innerRadius: 0.1,

    legend: {
      position: "right",
    },

    tooltip: {
      formatter: (d) => ({
        name: d.stage,
        value: d.value,
      }),
    },

    label: {
      content: (datum) => `${datum.value}`,
      style: {
        fontSize: 12,
        textAlign: "center",
      },
    },

    interactions: [{ type: "element-active" }],
  };

  return <Pie {...config} />;
}
