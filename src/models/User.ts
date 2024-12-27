import mongoose from "mongoose";

export interface IUser {
  name: string;
  username: string;
  password: string;
  email: string;
  picture: {
    buffer: Buffer;
    contentType: string;
  };
  verified: boolean;
}

const userSchema = new mongoose.Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    picture: {
      buffer: Buffer,
      contentType: String,
    },
    verified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IUser>("User", userSchema);
