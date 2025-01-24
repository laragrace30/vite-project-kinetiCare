import { useState, useEffect } from "react";
import { db } from "../firebase/firebase";
import { collection, getDocs, query, where, Timestamp } from "firebase/firestore";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Line, Bar } from "react-chartjs-2";
import "../styles/report.css";
import SideMenu from "../components/sideMenu";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

function Reports() {
  const [selectedCommissionMonth, setSelectedCommissionMonth] = useState<string>(new Date().toLocaleString("default", { month: "long", year: "numeric" }));
  const [selectedUsersMonth, setSelectedUsersMonth] = useState<string>(new Date().toLocaleString("default", { month: "long", year: "numeric" }));
  const [selectedLoginMonth, setSelectedLoginMonth] = useState<string>(new Date().toLocaleString("default", { month: "long", year: "numeric" }));
  
  const [monthlyCommission, setMonthlyCommission] = useState<Record<string, number>>({});
  const [monthlyUsers, setMonthlyUsers] = useState<Record<string, number>>({});
  const [loginData, setLoginData] = useState<number[]>([]);
  const [loginLabels, setLoginLabels] = useState<string[]>([]);
  
  const [totalCommission, setTotalCommission] = useState(0);
  const [totalNewUsers, setTotalNewUsers] = useState(0);
  const [totalLogins, setTotalLogins] = useState(0);
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Existing fetchCommissionData function from previous implementation
    async function fetchCommissionData() {
      try {
        const [monthName, year] = selectedCommissionMonth.split(' ');
        const monthIndex = new Date(Date.parse(monthName + " 1, 2000")).getMonth();
        
        const startDate = new Date(parseInt(year), monthIndex, 1);
        const endDate = new Date(parseInt(year), monthIndex + 1, 0);

        const startTimestamp = Timestamp.fromDate(startDate);
        const endTimestamp = Timestamp.fromDate(endDate);

        const paymentsQuery = query(
          collection(db, "payments"),
          where("timestamp", ">=", startTimestamp),
          where("timestamp", "<=", endTimestamp)
        );

        const paymentsSnapshot = await getDocs(paymentsQuery);
        
        const commissionData: Record<string, number> = {};
        for (let i = 1; i <= endDate.getDate(); i++) {
          commissionData[i.toString()] = 0;
        }

        let totalCommissionAmount = 0;
        paymentsSnapshot.forEach((doc) => {
          const data = doc.data();
          const timestamp = data.timestamp.toDate();
          const dayKey = timestamp.getDate().toString();

          if (data.convenienceFee) {
            commissionData[dayKey] += data.convenienceFee;
            totalCommissionAmount += data.convenienceFee;
          }
        });

        setMonthlyCommission(commissionData);
        setTotalCommission(totalCommissionAmount);
      } catch (error) {
        console.error("Error fetching commission data:", error);
      }
    }

    // Existing fetchUsersData function from previous implementation
    async function fetchUsersData() {
      try {
        const [monthName, year] = selectedUsersMonth.split(' ');
        const monthIndex = new Date(Date.parse(monthName + " 1, 2000")).getMonth();
        
        const startDate = new Date(parseInt(year), monthIndex, 1);
        const endDate = new Date(parseInt(year), monthIndex + 1, 0);

        const startTimestamp = Timestamp.fromDate(startDate);
        const endTimestamp = Timestamp.fromDate(endDate);

        const usersQuery = query(
          collection(db, "users"),
          where("createdAt", ">=", startTimestamp),
          where("createdAt", "<=", endTimestamp)
        );

        const usersSnapshot = await getDocs(usersQuery);
        
        const usersData: Record<string, number> = {};
        for (let i = 1; i <= endDate.getDate(); i++) {
          usersData[i.toString()] = 0;
        }

        let totalNewUsersCount = 0;
        usersSnapshot.forEach((doc) => {
          const data = doc.data();
          const timestamp = data.createdAt.toDate();
          const dayKey = timestamp.getDate().toString();

          usersData[dayKey] += 1;
          totalNewUsersCount += 1;
        });

        setMonthlyUsers(usersData);
        setTotalNewUsers(totalNewUsersCount);
      } catch (error) {
        console.error("Error fetching users data:", error);
      }
    }

    // New fetchLoginData function
    async function fetchLoginData() {
      try {
        const [monthName, year] = selectedLoginMonth.split(' ');
        const monthIndex = new Date(Date.parse(monthName + " 1, 2000")).getMonth();
        
        const startDate = new Date(parseInt(year), monthIndex, 1);
        const endDate = new Date(parseInt(year), monthIndex + 1, 0);

        const labels = Array.from({ length: endDate.getDate() }, (_, i) => `${i + 1}`);
        setLoginLabels(labels);

        const loginCounts = new Array(endDate.getDate()).fill(0);

        const startTimestamp = Timestamp.fromDate(startDate);
        const endTimestamp = Timestamp.fromDate(endDate);

        const loginQuery = query(
          collection(db, "loginLogs"),
          where("timestamp", ">=", startTimestamp),
          where("timestamp", "<=", endTimestamp)
        );

        const loginSnapshot = await getDocs(loginQuery);
        
        loginSnapshot.forEach((doc) => {
          const data = doc.data();
          const timestamp = data.timestamp.toDate();
          const dayIndex = timestamp.getDate() - 1;
          loginCounts[dayIndex]++;
        });

        setLoginData(loginCounts);
        setTotalLogins(loginCounts.reduce((a, b) => a + b, 0));
        setLoading(false);
      } catch (error) {
        console.error("Error fetching login data:", error);
        setLoading(false);
      }
    }

    fetchCommissionData();
    fetchUsersData();
    fetchLoginData();
  }, [selectedCommissionMonth, selectedUsersMonth, selectedLoginMonth]);

  // Month options generation
  const monthOptions = (() => {
    const months = [];
    const currentDate = new Date();
    for (let i = 5; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      months.push(date.toLocaleString("default", { month: "long", year: "numeric" }));
    }
    return months;
  })();

  // Chart data and options (similar to previous implementation)
  const commissionChartData = {
    labels: Object.keys(monthlyCommission).sort((a, b) => parseInt(a) - parseInt(b)),
    datasets: [
      {
        label: "Commission Earned (PHP)",
        data: Object.values(monthlyCommission),
        borderColor: "blue",
        backgroundColor: "rgba(0, 0, 255, 0.1)",
        fill: true,
        tension: 0.1,
      },
    ],
  };

  const usersChartData = {
    labels: Object.keys(monthlyUsers).sort((a, b) => parseInt(a) - parseInt(b)),
    datasets: [
      {
        label: "New Users",
        data: Object.values(monthlyUsers),
        borderColor: "green",
        backgroundColor: "rgba(0, 255, 0, 0.1)",
        fill: true,
        tension: 0.1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  const getMaxYValue = () => {
    const maxLoginCount = Math.max(...loginData, 1);
    return Math.ceil(maxLoginCount / 10) * 10;
  };

  const getStepSize = () => {
    const maxLoginCount = Math.max(...loginData, 1);
    return maxLoginCount < 10 ? 1 : 10;
  };

  return (
    <div className="container">
      <SideMenu />
      <div className="report--content">
        <div className="header--report">
          <h1>Overview</h1>
        </div>
        <div className="monthly">
          <div className="monthly--transactions">
            <div className="monthly--transactions--header">
              <h2>Monthly Transactions</h2>
              <div className="month-selector">
                <select 
                  value={selectedCommissionMonth} 
                  onChange={(e) => setSelectedCommissionMonth(e.target.value)}
                >
                  {monthOptions.map(month => (
                    <option key={month} value={month}>{month}</option>
                  ))}
                </select>
              </div>
            </div>
            {loading ? (
              <p>Loading data...</p>
            ) : (
              <>
                <div className="chart-container">
                  <Line data={commissionChartData} options={chartOptions} />
                </div>
                <h2>Total Commission Earned: ₱{totalCommission.toFixed(2)}</h2>
              </>
            )}
          </div>
          <div className="monthly--users">
            <div className="monthly--users--header">
              <h2>New Users</h2>
              <div className="month-selector">
                <select 
                  value={selectedUsersMonth} 
                  onChange={(e) => setSelectedUsersMonth(e.target.value)}
                >
                  {monthOptions.map(month => (
                    <option key={month} value={month}>{month}</option>
                  ))}
                </select>
              </div>
            </div>
            {loading ? (
              <p>Loading data...</p>
            ) : (
              <>
                <div className="chart-container-users">
                  <Line data={usersChartData} options={chartOptions} />
                </div>
                <h2>Total New Users: {totalNewUsers}</h2>
              </>
            )}
          </div>
        </div>
        <div className="login--report">
          <div className="login--report--header">
            <h2>Login Activity</h2>
            <div className="month-selector">
              <select 
                value={selectedLoginMonth} 
                onChange={(e) => setSelectedLoginMonth(e.target.value)}
              >
                {monthOptions.map(month => (
                  <option key={month} value={month}>{month}</option>
                ))}
              </select>
            </div>
          </div>
          {loading ? (
            <p>Loading data...</p>
          ) : (
            <>
              <div className="chart-container-logins">
                <Bar
                  data={{
                    labels: loginLabels,
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
                    maintainAspectRatio: false,
                    layout: {
                      padding: {
                        left: 50,
                        right: 50
                      }
                    },
                    plugins: {
                      legend: {
                        display: true,
                      },
                      title: {
                        display: true,
                        text: `Login Activity for ${selectedLoginMonth}`,
                      },
                    },
                    scales: {
                      x: {
                        title: {
                          display: true,
                          text: "Day of Month",
                        },
                      },
                      y: {
                        title: {
                          display: true,
                          text: "Number of Logins",
                        },
                        beginAtZero: true,
                        ticks: {
                          stepSize: getStepSize(),
                        },
                        max: getMaxYValue(),
                      },
                    },
                  }}
                />
              </div>
              <h2>Total Logins: {totalLogins}</h2>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Reports;