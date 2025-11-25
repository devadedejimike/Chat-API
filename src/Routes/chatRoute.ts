import express from 'express';
import { protect } from '../Middleware/protect'
import { accessChat, getChat } from '../Controller/chatController';
import { createGroup } from '../Controller/groupChatController';

const router = express.Router();
router
    .post('/', protect, accessChat)
    .post('/group', protect, createGroup)
    .get('/', protect, getChat)

export default router;