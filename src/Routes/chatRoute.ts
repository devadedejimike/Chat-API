import express from 'express';
import { protect } from '../Middleware/protect'
import { accessChat } from '../Controller/chatController';

const router = express.Router();
router
    .post('/', protect, accessChat);

export default router;