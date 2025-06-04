import mongoose, { Types } from "mongoose";

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
});

export const User = mongoose.model("user", userSchema);

const contentTypes = ["image", "video", "article", "audio", "youtube", "twitter"];

const contentSchema = new mongoose.Schema({
  link: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: contentTypes,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  tags: [
    {
      type: Types.ObjectId,
      ref: "Tag",
    },
  ],
  userId: {
    type: Types.ObjectId,
    ref: "User",
    required: true,
  },
});

export const Content = mongoose.model("content", contentSchema);

const tagSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    unique: true,
  },
});

export const Tag = mongoose.model("tag", tagSchema);

const linkSchema = new mongoose.Schema({
  hash: {
    type: String,
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },
});

export const Link = mongoose.model("link", linkSchema);