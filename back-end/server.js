const express = require('express');
const app = express();
const cors = require('cors');
const connectDB = require('./dbConnection');

// Configure CORS to accept requests from your frontend
app.use(cors({
    origin: 'http://localhost:5173', // Your Vite dev server URL
    methods: ['GET', 'POST', 'PUT', 'DELETE']
}));

app.use(express.json());

// Connect to database
connectDB().catch(err => {
    console.error('Failed to connect to database:', err);
    process.exit(1);
});

// API routes
app.use("/api", require("./route"));

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log(`CORS enabled for: http://localhost:5173`);
});