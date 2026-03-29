import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { notFoundHandler, errorHandler } from './utils/errorHandlers.js';
import routes from './routes/index.js';

dotenv.config();

const app = express();

app.use(helmet());
app.use(cors({
	origin: process.env.CLIENT_URL || 'http://localhost:5173',
	credentials: true
}));
app.use(express.json());
app.use(cookieParser());
app.use(morgan('dev'));

app.get('/api/health', (req, res) => {
	res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api', routes);

app.use(notFoundHandler);
app.use(errorHandler);

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/campus_club_mgmt';
const PORT = process.env.PORT || 5000;

async function start() {
	try {
		await mongoose.connect(MONGO_URI);
		console.log('Connected to MongoDB');
		app.listen(PORT, () => {
			console.log(`Server listening on port ${PORT}`);
		});
	} catch (err) {
		console.error('Failed to start server', err);
		process.exit(1);
	}
}

start();

