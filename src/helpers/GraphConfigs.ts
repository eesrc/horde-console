import { ChartOptions } from "chart.js";
import { format, parse } from "date-fns";

export const LINE_GRAPH_CONFIG: ChartOptions = {
  maintainAspectRatio: false,
  showLines: true,
  spanGaps: true,
  animation: {
    duration: 0,
  },
  elements: {
    line: {
      tension: 0,
    },
  },
  scales: {
    yAxes: [
      {
        display: true,
        ticks: {
          beginAtZero: true,
        },
      },
    ],
    xAxes: [
      {
        display: true,
        type: "time",
        time: {
          displayFormats: {
            minute: "HH:mm",
            hour: "HH",
          },
        },
      },
    ],
  },
  tooltips: {
    enabled: true,
    callbacks: {
      title: function(tooltipItem, data) {
        return format(
          parse(data.labels[tooltipItem[0].index].toString(), "T", new Date()),
          "MMM d, yyyy, kk:mm:ss",
        );
      },
    },
  },
};
