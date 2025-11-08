import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User from '../Model/userModel'

interface DecodedToken {
  id: string;
  iat: number;
  exp: number;
}

const JWT_SECRET = process.env.JWT_SECRET || "mysecretkeyforauthapi";

export const protect = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let token;

    // 1) Check for Authorization header
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1]; 
    }

    if (!token) {
      return res.status(401).json({ message: "Authorization failed. Token missing." });
    }

    // 2) Verify token
    const decoded = jwt.verify(token, JWT_SECRET) as DecodedToken;

    // 3) Find user based on decoded token id
    const currentUser = await User.findById(decoded.id);

    if (!currentUser) {
      return res.status(401).json({ message: "User no longer exists." });
    }

    // 4) Attach user to request object
    (req as any).user = currentUser;

    next(); // 
  } catch (error) {
    res.status(401).json({
      status: "fail",
      message: "Invalid or expired token",
      error,
    });
  }
};
