import { Router } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User";
import RefreshToken from "../models/RefreshToken";
import { createUserSchema } from "../schemas/userSchema";
import TokenPayload from "../types/TokenPayload";

const { ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET } = process.env;

const router = Router();

router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username }).select("+password").exec();

    if (
      user == null ||
      (await bcrypt.compare(password, user.password)) === false
    ) {
      res.status(401).json({ error: "Wrong username or password" });
      return;
    }

    const payload = { _id: user._id };

    const accessToken = jwt.sign({ user: payload }, ACCESS_TOKEN_SECRET!, {
      expiresIn: "10m",
    });
    const refreshToken = jwt.sign({ user: payload }, REFRESH_TOKEN_SECRET!);

    const newRefreshToken = new RefreshToken({ refreshToken });
    await newRefreshToken.save();

    res.json({ user: payload, accessToken, refreshToken });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/signup", async (req, res) => {
  const validation = createUserSchema.safeParse(req.body);
  if (!validation.success) {
    res.status(400).json({
      error: "Validation Error",
      details: validation.error.errors.map((err) => ({
        path: err.path.join("."),
        message: err.message,
      })),
    });
    return;
  }

  const { name, username, password, email } = req.body;
  const newUser = new User({
    name,
    username,
    password: await bcrypt.hash(password, 10),
    email,
  });
  try {
    await newUser.save();
    res.status(201).json(newUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.delete("/logout", async (req, res) => {
  const { refreshToken } = req.body;

  try {
    const foundToken = await RefreshToken.findOne({ refreshToken });

    if (!foundToken) {
      res.status(404).json({ error: "Token not found" });
      return;
    }
    foundToken.deleteOne();
    res.status(204).json({ message: "Logged out successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/token", async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    res.status(400).json({ error: "Refresh token is required" });
    return;
  }

  try {
    const foundToken = await RefreshToken.findOne({ refreshToken });

    if (!foundToken) {
      res.status(404).json({ error: "Token not found" });
      return;
    }

    const { user } = jwt.verify(
      foundToken.refreshToken,
      REFRESH_TOKEN_SECRET!
    ) as TokenPayload;

    const accessToken = jwt.sign({ user }, ACCESS_TOKEN_SECRET!, {
      expiresIn: "10m",
    });

    res.json({ accessToken });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
