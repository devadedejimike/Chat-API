import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User from '../Model/userModel'

interface DecodedToken {
  id: string;
  iat: number;
  exp: number;
}

const JWT_SECRET = process.env.JWT_SECRET!;

export const protect = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let token;

    // Check for Authorization header
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1]; 
    }

    if (!token) {
      return res.status(401).json({ message: "Authorization failed. Token missing." });
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET) as DecodedToken;

    // Find user based on decoded token id
    const currentUser = await User.findById(decoded.id);

    if (!currentUser) {
      return res.status(401).json({ message: "User no longer exists." });
    }

    // Attach user to request object
    (req as any).user = currentUser;

    next();
  } catch (error) {
    res.status(401).json({
      status: "fail",
      message: "Invalid or expired token",
      error,
    });
  }
};
