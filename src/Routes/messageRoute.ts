import { sendMessage, fetchMessages, deleteMessage, searchMessage } from "../Controller/messageController";
import { protect } from "../Middleware/protect";
import express from 'express';
import multer from "multer";
const upload = multer();


const router = express.Router();

router
    .post('/send', protect, upload.single("file"), sendMessage as unknown as express.RequestHandler)
    .get('/search/:chatId', protect, searchMessage)
    .get('/:chatId', protect, fetchMessages)
    .delete('/delete', protect, deleteMessage)


export default router;