import express from "express";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { Content, Link, User } from "./db";
import { ExtendedUserId } from "./middleware";
import { userMiddleware } from "./middleware";
import { DB_URI } from "./config";
import { JWT_SECRET } from "./config";
import { random } from "./utils/random";

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
  });
  // .populate("userId", "username")

  res.status(200).json({
    content,
  });
});

app.delete(
  "/api/v1/content",
  // @ts-ignore
  userMiddleware,
  async (req: ExtendedUserId, res) => {
    const contentId = req.body.contentId;

    await Content.deleteMany({
      contentId,
      userId: req.userId,
    });

    res.status(200).json({
      message: "content deleted",
    });
  }
);

app.post(
  "/api/v1/brain/share",
  // @ts-ignore
  userMiddleware,
  async (req: ExtendedUserId, res) => {
    const { share } = req.body;

    if (share) {
      const hash = random(10);
      await Link.create({
        userId: req.userId,
        hash: hash,
      });

      res.status(200).json({
      link: "/share/" + hash,
    });
    } else {
      await Link.deleteOne({
        userId: req.userId,
      });

      res.status(200).json({
      message: "Updated shareable link",
    });
    }
  }
);

app.get("/api/v1/brain/:shareLink", async (req, res) => {
  const hash = req.params.shareLink;

  const link = await Link.findOne({
    hash
  })

  if (!link) {
    res.status(411).json({
      message: "Incorrect input",
    })

    return;
  }
  
  const content = await Content.find({
    userId: link.userId
  })

  const user = await User.findOne({
    _id: link.userId,
  })

  res.status(200).json({
    username: user?.username,
    content
  })

});

app.listen(3000, async () => {
  await mongoose.connect(DB_URI!);
  console.log("🟢 Connected to db");
});
