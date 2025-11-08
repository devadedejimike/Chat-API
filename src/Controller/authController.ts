import { Request, Response } from "express";
import User from '../Model/userModel'
import jwt  from "jsonwebtoken";
import bcrypt from 'bcryptjs';

const JWT_SECRET = process.env.JWT_SECRET as string;

export const signUp = async (req: Request, res: Response) => {
    try {
        const {username, email, password} = req.body
        // Check if user already exist
        const existingUser = await User.findOne({email});
        if(existingUser){
            return res.status(400).json({message: 'User already exist'});
        }

        // If user doesn't exist
        const newUser = await User.create({username, email, password});
        const token = jwt.sign({id: newUser._id}, JWT_SECRET, {expiresIn: "7d"})
        res.status(201).json({
            status: 'success',
            token,
            data: {
                user: newUser
            },
            message: "A new user account has been created"
        })
    } catch (error) {
        res.status(400).json({
            status: 'fail',
            message: 'Error occured while creating a new user account', 
            error: error
        })
    }
}

export const logIn = async (req: Request, res: Response) => {
    try {
        const {username, password} = req.body;
        // Check for username
        const user = await User.findOne({username});
        if(!user){
            return res.status(400).json({
                message: "Incorrect Username"
            })
        }
        // Check for password
        const checkPassword = await bcrypt.compare(password, user.password);
        if(!checkPassword){
            return res.status(400).json({
                message: "Incorrect Username"
            })
        }
        const token = await jwt.sign({id: user._id}, JWT_SECRET, {expiresIn: '7d'})
        res.status(200).json({
            status: 'success',
            token,
            data: {
                user
            },
            message: 'User login successfully'
        })
    } catch (error) {
        res.status(400).json({
            status: 'fail',
            message: 'Error occured while logging in', 
            error: error
        })
    }
}