import express from 'express';
import { signUp, logIn } from "../Controller/authController";

const router = express.Router();

router
    .post('/signup', signUp)
    .post('/login', logIn)

export default router;