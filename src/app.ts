import dotenv from 'dotenv';
dotenv.config();
import express from "express";
import connectDB from "./Config/db";
import authRoute from './Routes/authRoute';
import chatRoute from './Routes/chatRoute';
import messageRoute from './Routes/messageRoute'


connectDB(); 

const app = express();
app.use(express.json());
app.use('/api/auth', authRoute);
app.use('/api/chat', chatRoute);
app.use('/api/message', messageRoute);

export default app;
