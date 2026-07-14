import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line, Bar, Pie } from "react-chartjs-2";

// Register ChartJS modules
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function ChartWidget({ type = "line", data, options, height = 220 }) {
  const chartData = data || {
    labels: ["18:00", "18:15", "18:30", "18:45", "19:00 (Kickoff)"],
    datasets: [
      {
        label: "Gate A Density",
        data: [25, 45, 65, 82, 90],
        borderColor: "#3b82f6",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const defaultOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: "bottom",
        labels: {
          color: "rgba(232, 236, 244, 0.7)",
          font: { family: "var(--font-mono)", size: 10 },
        },
      },
      tooltip: {
        backgroundColor: "var(--bg-tertiary)",
        titleColor: "var(--text-primary)",
        bodyColor: "var(--text-secondary)",
        borderColor: "var(--border-default)",
        borderWidth: 1,
      },
    },
    scales: {
      x: {
        grid: { color: "rgba(139, 149, 176, 0.05)" },
        ticks: { color: "rgba(232, 236, 244, 0.6)", font: { family: "var(--font-mono)", size: 9 } },
      },
      y: {
        grid: { color: "rgba(139, 149, 176, 0.05)" },
        ticks: { color: "rgba(232, 236, 244, 0.6)", font: { family: "var(--font-mono)", size: 9 } },
      },
    },
  };

  const mergedOptions = { ...defaultOptions, ...options };

  return (
    <div style={{ height, position: "relative", width: "100%" }}>
      {type === "line" && <Line data={chartData} options={mergedOptions} />}
      {type === "bar" && <Bar data={chartData} options={mergedOptions} />}
      {type === "pie" && <Pie data={chartData} options={mergedOptions} />}
    </div>
  );
}
