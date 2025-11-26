import express from 'express';
import { protect } from '../Middleware/protect'
import { accessChat, getChat } from '../Controller/chatController';
import { createGroup, addUser, removeUser, renameGroup } from '../Controller/groupChatController';

const router = express.Router();
router
    .post('/', protect, accessChat)
    .post('/group', protect, createGroup)
    .post('/group/add', protect, addUser)
    .post('/group/remove', protect, removeUser)
    .put('/group/rename', protect, renameGroup)
    .get('/', protect, getChat)

export default router;