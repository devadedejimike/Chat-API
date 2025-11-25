import express from 'express';
import { protect } from '../Middleware/protect'
import { accessChat, getChat } from '../Controller/chatController';
import { createGroup, addUser, removeUser } from '../Controller/groupChatController';

const router = express.Router();
router
    .post('/', protect, accessChat)
    .post('/group', protect, createGroup)
    .post('/add', protect, addUser)
    .post('/remove', protect, removeUser)
    .get('/', protect, getChat)

export default router;