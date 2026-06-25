app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// Health Check
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'API is running' });
});

// --- ROUTE MOUNTING SECTION ---
const authRoutes = require('./routes/authRoutes');
const taskRoutes = require('./routes/taskRoutes'); 
const submissionRoutes = require('./routes/submissionRoutes');

app.use('/api/auth', authRoutes);
const usersRoutes = require('./routes/users');
app.use('/api/users', usersRoutes);
app.use('/api/tasks', taskRoutes); 
app.use('/api', submissionRoutes);
// ------------------------------

// Global Error Handler (Strictly matching the API Contract PDF Page 1)
app.use((err, req, res, next) => {
    console.error(err.stack);
    
    const statusCode = err.statusCode || 500;
    const errorCode = err.code || 'SERVER_ERROR';
    
    res.status(statusCode).json({
        error: {
            message: err.message || 'Internal Server Error',
            code: errorCode
        }
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Backend Core running on port ${PORT}`);
});
