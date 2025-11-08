import dotenv from 'dotenv';
import express from "express";
import connectDB from "./Config/db";
import authRoute from './Routes/authRoute';
import chatRoute from './Routes/chatRoute';

dotenv.config();
connectDB(); 

const app = express();
app.use(express.json());
app.use('/api/auth', authRoute);
app.use('/api/chat', chatRoute)

export default app;