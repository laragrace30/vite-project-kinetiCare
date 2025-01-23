import { useEffect, useState } from "react";
import { db } from "../firebase/firebase";
import { collection, getDocs, query, where, Timestamp } from "firebase/firestore";
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Title } from "chart.js";
import { Bar } from "react-chartjs-2";
import "../styles/details.css";
import SideMenu from "../components/sideMenu";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title);

function Reports() {
  const [loginData, setLoginData] = useState<number[]>([]);
  const [labels, setLabels] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLoginActivity = async () => {
      try {
        const today = new Date();
        const past7Days = Array.from({ length: 7 }, (_, i) => {
          const date = new Date();
          date.setDate(today.getDate() - i);
          return date;
        }).reverse();

        // Generate labels for the past 7 days
        const labels = past7Days.map(
          (date) => `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
        );
        setLabels(labels);

        const loginCounts = [];
        for (const date of past7Days) {
          const dayStart = Timestamp.fromDate(
            new Date(date.getFullYear(), date.getMonth(), date.getDate())
          );
          const dayEnd = Timestamp.fromDate(
            new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1)
          );

          const logsQuery = query(
            collection(db, "loginLogs"),
            where("timestamp", ">=", dayStart),
            where("timestamp", "<", dayEnd)
          );

          const logsSnapshot = await getDocs(logsQuery);
          loginCounts.push(logsSnapshot.size); // Count the number of logs for that day
        }
        setLoginData(loginCounts);
      } catch (error) {
        console.error("Error fetching login activity:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLoginActivity();
  }, []);

  const getMaxYValue = () => {
    const maxLoginCount = Math.max(...loginData, 1); // Ensure there's always a value, default to 1
    return Math.ceil(maxLoginCount / 10) * 10; // Round up to nearest multiple of 10
  };

  const getStepSize = () => {
    const maxLoginCount = Math.max(...loginData, 1);
    return maxLoginCount < 10 ? 1 : 10; // Smaller values for stepSize when the count is low
  };

  return (
    <div className="container">
      <SideMenu />
      <div className="details--content">
        <div className="header">
          <h2 className="personalDetails">Login Activity</h2>
        </div>
        <div className="details">
          {loading ? (
            <p>Loading...</p>
          ) : (
            <Bar
              data={{
                labels: labels,
                datasets: [
                  {
                    label: "Logins",
                    data: loginData,
                    backgroundColor: "rgba(75, 192, 192, 0.6)",
                    borderColor: "rgba(75, 192, 192, 1)",
                    borderWidth: 1,
                  },
                ],
              }}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    display: true,
                  },
                  title: {
                    display: true,
                    text: "Login Activity in the Past 7 Days",
                  },
                },
                scales: {
                  x: {
                    title: {
                      display: true,
                      text: "Date",
                    },
                  },
                  y: {
                    title: {
                      display: true,
                      text: "Number of Logins",
                    },
                    beginAtZero: true,
                    ticks: {
                      stepSize: getStepSize(), // Dynamically set the step size
                    },
                    // Dynamically set the max value for Y-axis
                    max: getMaxYValue(),
                  },
                },
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default Reports;
