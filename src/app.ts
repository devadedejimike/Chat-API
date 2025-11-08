import dotenv from 'dotenv';
import express from "express";
import connectDB from "./Config/db";
import authRoute from './Routes/authRoute'

dotenv.config();
connectDB(); 

const app = express();
app.use(express.json());
app.use('/api/chat', authRoute)

export default app;