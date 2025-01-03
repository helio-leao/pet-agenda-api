import { NextFunction, Request, Response } from "express";

export default function checkOwnership(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (req.user?._id !== req.params.id) {
    res.status(403).json({ error: "You can only access your own data" });
    return;
  }
  next();
}
