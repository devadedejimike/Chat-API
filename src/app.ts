import express from "express";
import dotenv from 'dotenv';
import connectDB from "./Config/db";
import authRoute from './Routes/authRoute'

dotenv.config();
connectDB(); 

const app = express();
app.use(express.json());
app.use('/api/chat', authRoute)
export default app;