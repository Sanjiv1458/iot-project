import express from 'express';
import session from 'express-session';
import http from 'http';
import MongoDBStore from 'connect-mongodb-session';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import compression from 'compression';
import dotenv from 'dotenv';
import { Server as SocketIO } from 'socket.io';
import passport from './src/config/passport.js';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRoutes from './src/routes/auth.js';
import userRoutes from './src/routes/user.js';
import adminRoutes from './src/routes/admin.js';
import paymentRoutes from './src/routes/payment.js';
import { getIndex } from './src/controllers/sensorController.js';
import db from './src/config/database.js';

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new SocketIO(server);

app.set('io', io);
app.set('view engine', 'ejs');

// Set up middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Set up MongoDB session store
const MongoDBStoreSession = MongoDBStore(session);
const store = new MongoDBStoreSession({
  uri: process.env.MONGODB_URI,
  collection: 'sessions',
  expires: 1000 * 60 * 60 * 24,
  connectionOptions: {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },
});

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: true,
    store: store,
  })
);

app.use(passport.initialize());
app.use(passport.session());

// Allow specific origins
const allowedOrigins = ['http://localhost:3000', 'https://iot-project-p14l.onrender.com'];
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  })
);

app.use(rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
}));

// Morgan Logging
const logFormat = process.env.NODE_ENV === 'production' ? 'combined' : 'dev';
app.use(morgan(logFormat));

// Compression
app.use(compression());

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('error', { message: 'Something went wrong!' });
});

// Set up static file serving
app.use(express.static(new URL('./public', import.meta.url).pathname));
app.use(express.static(new URL('./public/uploads', import.meta.url).pathname));

// Set up routes
app.use('/', authRoutes);
app.use('/admin', adminRoutes);
app.use('/user', userRoutes);
app.use('/payment', paymentRoutes);
app.use('/slot-status', getIndex(io));

// Database Connection
db.on('open', () => {
  console.log('Database connected');
});

// Port connection
const PORT = process.env.PORT || 3000;

// Start the server
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
