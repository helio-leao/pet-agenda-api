import mongoose, { Types } from "mongoose";

export interface IRefreshToken {
  user: Types.ObjectId;
  refreshToken: string;
  createdAt: Date;
}

const refreshTokenSchema = new mongoose.Schema<IRefreshToken>({
  user: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: "User",
    required: true,
  },
  refreshToken: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model<IRefreshToken>(
  "RefreshToken",
  refreshTokenSchema
);
