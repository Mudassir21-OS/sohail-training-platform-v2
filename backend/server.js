require('dotenv').config();
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const http = require('http'); // Native Node module required for WebSockets
const { Server } = require('socket.io'); // Socket.io server

const app = express();
app.use(express.json());
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// --- WEBSOCKET SETUP SECTION ---
// 1. Wrap the Express app in an HTTP server
const server = http.createServer(app);

// 2. Initialize Socket.io with matching CORS settings
const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        allowedHeaders: ['Content-Type', 'Authorization']
    }
});

// 3. Make 'io' globally accessible inside your route files (via req.app.get('io'))
app.set('io', io);

// 4. Socket.io Authentication Middleware
// Verifies the real JWT sent from the frontend and joins the socket to that
// specific user's private room. No more hardcoded/mocked user id.
io.use((socket, next) => {
    const rawToken = socket.handshake.auth.token;
    if (!rawToken) {
        return next(new Error("Authentication error: No token provided"));
    }

    // Frontend sends "Bearer <token>" — strip the prefix if present.
    const token = rawToken.startsWith('Bearer ') ? rawToken.split(' ')[1] : rawToken;

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        socket.userId = decoded.id;
        socket.userRole = decoded.role;
        next();
    } catch (err) {
        return next(new Error("Authentication error: Invalid or expired token"));
    }
});

// 5. Connection Listener
io.on('connection', (socket) => {
    console.log(`User ${socket.userId} connected with socket ID: ${socket.id}`);

    // Join the private room for this authenticated user only
    socket.join(`user_${socket.userId}`);

    // Listen for the frontend telling us which user room to join
    socket.on("join", (userId) => {
        if (userId) {
            socket.join(userId.toString());
            console.log(`User ${userId} successfully joined their personal socket room`);
        }
    });

    socket.on('disconnect', () => {
        console.log(`User ${socket.userId} disconnected`);
    });
});
// -------------------------------

// Health Check
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'API is running' });
});

// --- ROUTE MOUNTING SECTION ---
const authRoutes = require('./routes/authRoutes');
const taskRoutes = require('./routes/taskRoutes');
const submissionRoutes = require('./routes/submissionRoutes');
const userRoutes = require('./routes/userRoutes');
const usersRoutes = require('./routes/users');
const teamTasksRouter = require('./routes/team-tasks');
const analyticsRoutes = require('./routes/analytics');
const notificationRoutes = require('./routes/notifications');

app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api', submissionRoutes);
app.use('/api/admin', userRoutes);
app.use('/api/team-tasks', teamTasksRouter);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/notifications', notificationRoutes);
// ------------------------------

// Global Error Handler
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
// IMPORTANT: Replaced app.listen with server.listen to start both Express and Socket.io
server.listen(PORT, () => {
    console.log(`Backend Core running on port ${PORT} with WebSockets enabled`);
});