import express from "express";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { Content, User } from "./db";
import { ExtendedUserId } from "./middleware";
import { userMiddleware } from "./middleware";
import { DB_URI } from "./config";
import { JWT_SECRET } from "./config";

const app = express();

app.use(express.json());

app.post("/api/v1/signup", async (req, res) => {
  const { username, password } = req.body;

  await User.create({
    username,
    password,
  });

  res.json({
    message: "User signup successfully",
  });
});

app.post("/api/v1/signin", async (req, res) => {
  const { username, password } = req.body;

  const existingUser = await User.findOne({ username });

  if (!existingUser) {
    res.status(401).json({
      message: "user not exist",
    });
  }

  const token = jwt.sign(
    {
      id: existingUser?._id,
    },
    JWT_SECRET!
  );

  res.status(200).json({
    message: "User signin successfully",
    token,
  });
});

// @ts-ignore
app.post(
  "/api/v1/content",
  // @ts-ignore
  userMiddleware,
  async (req: ExtendedUserId, res) => {
    const { title, link, type } = req.body;
    await Content.create({
      title,
      link,
      type,
      userId: req.userId,
      tags: [],
    });

    res.status(201).json({
      message: "Content added",
    });
  }
);

// @ts-ignore
app.get("/api/v1/content", userMiddleware, async (req: ExtendedUserId, res) => {
  const userId = req.userId;
  const content = await Content.find({
    userId: userId,
  })
  // .populate("userId", "username")

  res.status(200).json({
    content,
  });
});

// @ts-ignore
app.delete("/api/v1/content", userMiddleware, async (req: ExtendedUserId, res) => {
  const contentId = req.body.contentId;

  await Content.deleteMany({
    contentId,
    userId: req.userId
  })

  res.status(200).json({
    message: "content deleted",
  })
});

app.post("/api/v1/brain/share", (req, res) => {});

app.get("/api/v1/brain/:shareLink", (req, res) => {});

app.listen(3000, async () => {
  await mongoose.connect(
    DB_URI!
  );
  console.log("🟢 Connected to db");
});
