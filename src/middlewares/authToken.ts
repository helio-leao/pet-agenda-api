import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import TokenPayload from "../types/TokenPayload";

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;

export default function authToken(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    res.status(401).json({ error: "No token provided" });
    return;
  }

  try {
    const { user } = jwt.verify(token, ACCESS_TOKEN_SECRET!) as TokenPayload;
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
  }
}
