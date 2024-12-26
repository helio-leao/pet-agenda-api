import mongoose from "mongoose";

export interface IUser {
  name: string;
  username: string;
  email: string;
  picture: {
    data: Buffer;
    contentType: string;
  };
}

const userSchema = new mongoose.Schema<IUser>({
  name: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  picture: {
    data: Buffer,
    contentType: String,
  },
});

export default mongoose.model<IUser>("User", userSchema);
