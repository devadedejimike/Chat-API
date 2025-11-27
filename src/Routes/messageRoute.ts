import { sendMessage, fetchMessages, deleteMessage, searchMessage } from "../Controller/messageController";
import { protect } from "../Middleware/protect";
import express from 'express';


const router = express.Router();

router
    .post('/send', protect, sendMessage)
    .get('/:chatId', protect, fetchMessages)
    .get('/search/:chatId', protect, searchMessage)
    .delete('/delete', protect, deleteMessage)


export default router;