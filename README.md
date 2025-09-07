A simple full-stack MERN application to visualize and analyze your Swiggy order history.

This app takes a JSON file of your order data and transforms it into an interactive dashboard with charts and key statistics, giving you insights into your spending habits.

Note: This is a proof-of-concept and uses a sample JSON file, as real-time data access is not available.


How It Works
This is a full-stack application with a client-server architecture:

Frontend (React): A clean user interface built with React and Vite that allows for file upload. It uses Chart.js to render the interactive dashboard.

Backend (Node.js/Express): A simple Express server that provides a single API endpoint. It accepts the uploaded file, performs all the data calculations, and sends the analysis back to the client.

Tech Stack
Frontend: React, Vite, Chart.js

Backend: Node.js, Express.js

File Handling: Multer