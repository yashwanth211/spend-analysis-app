import React, { useState } from 'react';
import { Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import './index.css';
ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend);

const prepareBarChartData = (data) => ({
  labels: data.map(item => item.name),
  datasets: [{
    label: '# of Orders',
    data: data.map(item => item.count),
    backgroundColor: 'rgba(255, 99, 132, 0.6)',
    borderColor: 'rgba(255, 99, 132, 1)',
    borderWidth: 1,
  }],
});

const prepareLineChartData = (data) => {
  const sortedMonths = Object.keys(data).sort((a, b) => new Date(a) - new Date(b));
  return {
    labels: sortedMonths,
    datasets: [{
      label: 'Total Spend (₹)',
      data: sortedMonths.map(month => data[month]),
      fill: false,
      borderColor: 'rgb(75, 192, 192)',
      tension: 0.1,
    }],
  };
};
function App() {
  const [analysis, setAnalysis] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [fileName, setFileName] = useState('');

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Reset state for new upload
    setIsLoading(true);
    setError('');
    setAnalysis(null);
    setFileName(file.name);

    const formData = new FormData();
    formData.append('swiggyData', file);

    try {
      const response = await fetch('http://localhost:3001/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'An unknown error occurred.');
      }

      const data = await response.json();
      setAnalysis(data);

    } catch (err) {
      setError(`Upload Failed: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container">
      <header className="header">
        <h1>Swiggy Spend Analysis 📊</h1>
        <p>Upload your Swiggy `orders.json` file to get insights into your spending habits.</p>
        <div className="upload-section">
          <label htmlFor="file-upload" className="custom-file-upload">
            {fileName || 'Select JSON File'}
          </label>
          <input id="file-upload" type="file" accept=".json" onChange={handleFileUpload} disabled={isLoading} />
        </div>
        {isLoading && <div className="loader"></div>}
        {error && <p className="error-message">{error}</p>}
      </header>

      {analysis && (
        <main className="dashboard">
          <section className="stats-grid">
            <div className="stat-card">
              <h2>Total Spend</h2>
              <p>₹{analysis.totalSpend}</p>
            </div>
            <div className="stat-card">
              <h2>Total Orders</h2>
              <p>{analysis.orderCount}</p>
            </div>
            <div className="stat-card">
              <h2>Avg. Order Value</h2>
              <p>₹{analysis.averageOrderValue}</p>
            </div>
          </section>

          <section className="chart-grid">
            <div className="chart-card">
              <h3>Top 5 Restaurants by Orders</h3>
              <Bar data={prepareBarChartData(analysis.top5RestaurantsByOrders)} options={{ responsive: true }} />
            </div>
            <div className="chart-card">
              <h3>Monthly Spending</h3>
              <Line data={prepareLineChartData(analysis.monthlySpending)} options={{ responsive: true }} />
            </div>
          </section>
        </main>
      )}
    </div>
  );
}

export default App;
