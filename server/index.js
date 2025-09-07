const express = require('express');
const multer = require('multer');
const cors = require('cors');

const app = express();
const port = 3001;

app.use(cors());

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const performAnalysis = (orders) => {
  
  if (!Array.isArray(orders) || orders.length === 0) {
    throw new Error("Invalid or empty data provided.");
  }

  
  const orderCount = orders.length;
  const totalSpend = orders.reduce((sum, order) => sum + (order.order_total || 0), 0);
  const averageOrderValue = totalSpend / orderCount;

  
  const restaurantCounts = orders.reduce((acc, order) => {
    const name = order.restaurant_name || 'Unknown Restaurant';
    acc[name] = (acc[name] || 0) + 1;
    return acc;
  }, {});

  const top5RestaurantsByOrders = Object.entries(restaurantCounts)
    .sort(([, countA], [, countB]) => countB - countA)
    .slice(0, 5)
    .map(([name, count]) => ({ name, count }));

  
  const monthlySpending = orders.reduce((acc, order) => {
    
    const monthYear = new Date(order.order_time).toLocaleString('default', { month: 'short', year: 'numeric' });
    acc[monthYear] = (acc[monthYear] || 0) + (order.order_total || 0);
    return acc;
  }, {});

  
  return {
    totalSpend: totalSpend.toFixed(2),
    orderCount,
    averageOrderValue: averageOrderValue.toFixed(2),
    top5RestaurantsByOrders,
    monthlySpending,
  };
};

app.post('/api/upload', upload.single('swiggyData'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded.' });
  }

  try {
    const fileContent = req.file.buffer.toString('utf8');
    const orders = JSON.parse(fileContent);

    const analysisResults = performAnalysis(orders);

    res.status(200).json(analysisResults);
  } catch (error) {
    console.error("Error processing file:", error);
    res.status(500).json({ error: 'Could not process the file. Please ensure it is a valid JSON.' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
  console.log("Waiting for file uploads from the frontend...");
});

