import express from 'express';
import { protect } from '../Middleware/protect'
import { accessChat, getChat } from '../Controller/chatController';

const router = express.Router();
router
    .post('/', protect, accessChat)
    .get('/', protect, getChat)

export default router;